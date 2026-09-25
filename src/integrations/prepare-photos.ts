// Prepares journal photos in place, per SPEC.md §3.3.4 and §3.3.5.
//
// The owner drops a copy of a photo (JPEG, PNG, WebP or iPhone HEIC/HEIF, any
// size, any file name, any extension case) directly inside an entry folder
// (`src/content/journal/<aquarium>/<entry>/<file>`). This integration turns
// it into a "web master": converted to JPEG, rotated per EXIF orientation,
// downscaled so the long edge is at most 2400px (never upscaled), re-encoded
// as JPEG quality 85 (mozjpeg), and stripped of all metadata
// (EXIF/GPS/XMP/IPTC). The result replaces the dropped file and is always
// named `<stem>.jpg` (lowercase extension), which is the only form the pages
// show (see src/lib/photo-files.ts).
//
// Runs once, fully, at the start of `astro dev` and `astro build`. While
// `astro dev` runs, it also watches the journal folder; watched files are
// handled one at a time, after they have finished copying.
import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";
import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import { PREPARED_EXTENSION, splitEntryPhotos } from "../lib/photo-files";

const execFileAsync = promisify(execFile);

/** Long edge cap for a prepared "web master", per SPEC.md §3.3.5. */
const MAX_LONG_EDGE = 2400;
const JPEG_QUALITY = 85;

/** Extensions accepted as a dropped-in photo, compared in lowercase. */
const ACCEPTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);
const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);

/** Hidden temp files this integration writes next to a photo while preparing it. */
const TEMP_FILE_PATTERN = /^\..*\.tmp-[0-9a-f]{8}$/;
/** Hidden backup of a source photo during a case-only rename: `.<name>.orig-<hex>`. */
const BACKUP_MARKER = ".orig-";
const BACKUP_PATTERN = /^\.(.+)\.orig-[0-9a-f]{8}$/;

const SIPS_BIN = "/usr/bin/sips";

/** How long a watched file's size must stay unchanged before it counts as fully copied. */
const STABLE_POLL_MS = 400;
const STABLE_TIMEOUT_MS = 60_000;
/** Debounce for the burst of add/change events a single copy produces. */
const WATCH_DEBOUNCE_MS = 300;

type Log = AstroIntegrationLogger;
type RelLabel = (absPath: string) => string;

function lowerExt(fileName: string): string {
	return path.extname(fileName).toLowerCase();
}

function stemOf(fileName: string): string {
	return fileName.slice(0, fileName.length - path.extname(fileName).length);
}

function isCandidatePhoto(fileName: string): boolean {
	return !fileName.startsWith(".") && ACCEPTED_EXTENSIONS.has(lowerExt(fileName));
}

async function statOrNull(p: string) {
	try {
		return await fs.stat(p);
	} catch {
		return null;
	}
}

async function safeUnlink(p: string): Promise<void> {
	try {
		await fs.unlink(p);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
	}
}

function randomSuffix(): string {
	return randomBytes(4).toString("hex");
}

async function listEntries(dir: string) {
	try {
		return await fs.readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
}

async function listDirs(dir: string): Promise<string[]> {
	return (await listEntries(dir)).filter((e) => e.isDirectory()).map((e) => e.name);
}

async function listFiles(dir: string): Promise<string[]> {
	return (await listEntries(dir)).filter((e) => e.isFile()).map((e) => e.name);
}

/** True for a JPEG with the long edge ≤ 2400px and no EXIF/IPTC/XMP metadata. */
async function isAlreadyPrepared(filePath: string): Promise<boolean> {
	try {
		const meta = await sharp(filePath).metadata();
		if (meta.format !== "jpeg") return false;
		if (Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_LONG_EDGE) return false;
		return !meta.exif && !meta.iptc && !meta.xmp;
	} catch {
		return false;
	}
}

/**
 * Picks `<stem>.jpg` for a photo that needs a new name, or `<stem>-2.jpg`,
 * `-3`, … if another photo already has that name. On macOS's
 * case-insensitive disk, `IMG.jpg` and the source `IMG.JPG` are the same
 * file; that is detected by inode, not by comparing names.
 */
async function pickTargetPath(
	entryDir: string,
	srcStat: { dev: number; ino: number },
	stem: string,
): Promise<string> {
	for (let counter = 1; ; counter++) {
		const name = counter === 1 ? `${stem}${PREPARED_EXTENSION}` : `${stem}-${counter}${PREPARED_EXTENSION}`;
		const candidate = path.join(entryDir, name);
		const existing = await statOrNull(candidate);
		if (!existing) return candidate;
		if (existing.dev === srcStat.dev && existing.ino === srcStat.ino) return candidate;
	}
}

/**
 * Prepares one dropped-in photo. Returns true if it wrote a file, false if
 * the photo was already prepared, vanished, or failed (failures are logged
 * and leave the source untouched).
 */
async function prepareFile(entryDir: string, fileName: string, log: Log, rel: RelLabel): Promise<boolean> {
	const srcPath = path.join(entryDir, fileName);
	const ext = path.extname(fileName);
	const isInPlace = ext === PREPARED_EXTENSION; // exact, case-sensitive

	if (isInPlace && (await isAlreadyPrepared(srcPath))) return false;

	const srcStat = await statOrNull(srcPath);
	if (!srcStat) return false; // removed or renamed in the meantime

	// sips output keeps all metadata (GPS included), so it goes to the system
	// temp folder, never into the entry folder where git could pick it up.
	let sharpInput = srcPath;
	let heicTemp: string | null = null;
	if (HEIC_EXTENSIONS.has(lowerExt(fileName))) {
		heicTemp = path.join(os.tmpdir(), `prepare-photos-${randomSuffix()}.jpg`);
		try {
			await execFileAsync(SIPS_BIN, ["-s", "format", "jpeg", srcPath, "--out", heicTemp]);
		} catch (err) {
			log.error(`Could not convert ${rel(srcPath)} from HEIC with sips: ${(err as Error).message}`);
			await safeUnlink(heicTemp);
			return false;
		}
		sharpInput = heicTemp;
	}

	let tempOut: string | null = null;
	try {
		const before = await sharp(sharpInput).metadata();
		const targetPath = isInPlace ? srcPath : await pickTargetPath(entryDir, srcStat, stemOf(fileName));
		const targetStat = await statOrNull(targetPath);
		const targetIsSource =
			targetStat !== null && targetStat.dev === srcStat.dev && targetStat.ino === srcStat.ino;

		tempOut = path.join(entryDir, `.${path.basename(targetPath)}.tmp-${randomSuffix()}`);
		const info = await sharp(sharpInput)
			.rotate()
			.resize({ width: MAX_LONG_EDGE, height: MAX_LONG_EDGE, fit: "inside", withoutEnlargement: true })
			.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
			.toFile(tempOut);

		if (targetIsSource && !isInPlace) {
			// Case-only rename (IMG.JPG -> IMG.jpg). The source must leave its name
			// before the new entry can get the lowercase one, so it is parked as a
			// hidden backup first; restoreBackups() puts it back after a crash.
			const backup = path.join(entryDir, `.${fileName}${BACKUP_MARKER}${randomSuffix()}`);
			await fs.rename(srcPath, backup);
			try {
				await fs.rename(tempOut, targetPath);
			} catch (err) {
				await fs.rename(backup, srcPath);
				throw err;
			}
			tempOut = null;
			await fs.unlink(backup);
		} else {
			await fs.rename(tempOut, targetPath);
			if (!targetIsSource) await fs.unlink(srcPath);
		}
		tempOut = null;

		const after = await fs.stat(targetPath);
		log.info(
			`prepared ${rel(srcPath)} -> ${rel(targetPath)}: ` +
				`${srcStat.size}B (${before.width ?? "?"}x${before.height ?? "?"}) -> ` +
				`${after.size}B (${info.width}x${info.height})`,
		);
		return true;
	} catch (err) {
		log.error(`Failed to prepare ${rel(srcPath)}: ${(err as Error).message}`);
		return false;
	} finally {
		if (tempOut) await safeUnlink(tempOut);
		if (heicTemp) await safeUnlink(heicTemp);
	}
}

/** Warns when an entry has more gallery photos than the page shows, naming the ones left out. */
async function warnAboutExtraPhotos(entryDir: string, log: Log, rel: RelLabel): Promise<void> {
	const { gallery, extras } = splitEntryPhotos(await listFiles(entryDir));
	if (extras.length > 0) {
		log.warn(
			`${rel(entryDir)} has ${gallery.length + extras.length} gallery photos; only the first ` +
				`${gallery.length} are shown. Not shown: ${extras.join(", ")}`,
		);
	}
}

/**
 * Cleans up after an interrupted earlier run: puts a backed-up source photo
 * back under its own name if nothing replaced it (it is then prepared again),
 * and removes temp files. Backups go first, so a photo is never lost.
 */
async function recoverInterruptedRun(entryDir: string): Promise<void> {
	for (const name of await listFiles(entryDir)) {
		const match = BACKUP_PATTERN.exec(name);
		if (!match) continue;
		const backupPath = path.join(entryDir, name);
		const originalName = match[1];
		const preparedPath = path.join(entryDir, `${stemOf(originalName)}${PREPARED_EXTENSION}`);
		const replaced = (await statOrNull(preparedPath)) !== null;
		if (replaced) {
			await safeUnlink(backupPath);
		} else {
			await fs.rename(backupPath, path.join(entryDir, originalName));
		}
	}
	for (const name of await listFiles(entryDir)) {
		if (TEMP_FILE_PATTERN.test(name) || /^\..*\.heic-conv-[0-9a-f]{8}\.jpg$/.test(name)) {
			await safeUnlink(path.join(entryDir, name));
		}
	}
}

async function prepareAll(journalRoot: string, log: Log, rel: RelLabel): Promise<void> {
	for (const aquarium of await listDirs(journalRoot)) {
		const aquariumDir = path.join(journalRoot, aquarium);
		for (const entry of await listDirs(aquariumDir)) {
			const entryDir = path.join(aquariumDir, entry);
			await recoverInterruptedRun(entryDir);
			const photos = (await listFiles(entryDir)).filter(isCandidatePhoto).sort();
			for (const fileName of photos) {
				await prepareFile(entryDir, fileName, log, rel);
			}
			await warnAboutExtraPhotos(entryDir, log, rel);
		}
	}
}

/** True if `filePath` is exactly `<journalRoot>/<aquarium>/<entry>/<file>`. */
function isDirectEntryFile(journalRoot: string, filePath: string): boolean {
	const relPath = path.relative(journalRoot, filePath);
	if (relPath.startsWith("..") || path.isAbsolute(relPath)) return false;
	return relPath.split(path.sep).length === 3;
}

/** Resolves once the file's size stops changing (copy finished), or false if it disappears or never settles. */
async function waitUntilStable(filePath: string): Promise<boolean> {
	const deadline = Date.now() + STABLE_TIMEOUT_MS;
	let lastSize = -1;
	while (Date.now() < deadline) {
		const stat = await statOrNull(filePath);
		if (!stat) return false;
		if (stat.size > 0 && stat.size === lastSize) return true;
		lastSize = stat.size;
		await new Promise((resolve) => setTimeout(resolve, STABLE_POLL_MS));
	}
	return false;
}

export default function preparePhotos(): AstroIntegration {
	let journalRoot = "";
	const rel: RelLabel = (absPath) => path.relative(journalRoot, absPath);

	return {
		name: "prepare-journal-photos",
		hooks: {
			"astro:config:setup": async ({ config, command, logger }) => {
				journalRoot = fileURLToPath(new URL("src/content/journal/", config.root));
				if (command !== "dev" && command !== "build") return;
				await prepareAll(journalRoot, logger, rel);
			},
			"astro:server:setup": ({ server, logger }) => {
				if (!journalRoot) return;
				server.watcher.add(path.join(journalRoot, "*", "*", "*"));

				// One queue for all watched files: jobs never overlap, so two photos
				// can't pick the same target name, and one copy's burst of events
				// becomes a single job after the copy has finished.
				let queue: Promise<void> = Promise.resolve();
				const timers = new Map<string, NodeJS.Timeout>();

				const run = async (filePath: string) => {
					if (!(await waitUntilStable(filePath))) return;
					const entryDir = path.dirname(filePath);
					const changed = await prepareFile(entryDir, path.basename(filePath), logger, rel);
					if (!changed) return;
					await warnAboutExtraPhotos(entryDir, logger, rel);
					// A new file matching the eager import.meta.glob in src/lib/journal.ts
					// needs the module graph re-evaluated and the browser reloaded.
					server.moduleGraph.invalidateAll();
					server.ws.send({ type: "full-reload", path: "*" });
				};

				const onFileEvent = (filePath: string) => {
					if (!isDirectEntryFile(journalRoot, filePath)) return;
					if (!isCandidatePhoto(path.basename(filePath))) return;
					clearTimeout(timers.get(filePath));
					timers.set(
						filePath,
						setTimeout(() => {
							timers.delete(filePath);
							queue = queue
								.then(() => run(filePath))
								.catch((err) => logger.error(`Failed to prepare ${rel(filePath)}: ${(err as Error).message}`));
						}, WATCH_DEBOUNCE_MS),
					);
				};

				server.watcher.on("add", onFileEvent);
				server.watcher.on("change", onFileEvent);
			},
		},
	};
}
