// Rules for which prepared photo files a page shows, shared by the journal
// (src/lib/journal.ts), Our Work (src/lib/work.ts) and the photo preparation
// integration (src/integrations/prepare-photos.ts) so they never disagree.
// No Astro imports: the integration loads this from astro.config.mjs.

/** Every prepared photo ends in exactly this (lowercase) extension. */
export const PREPARED_EXTENSION = ".jpg";

/** Hidden files (temp files, macOS "._" files) are never photos. */
export function isShownPhotoFile(fileName: string): boolean {
	return !fileName.startsWith(".") && fileName.endsWith(PREPARED_EXTENSION);
}

function stem(fileName: string): string {
	return fileName.replace(/\.[^.]+$/, "");
}

/** Natural order, so "2.jpg" sorts before "10.jpg". */
export function naturalCompare(a: string, b: string): number {
	const toChunks = (value: string) => value.match(/\d+|\D+/g) ?? [];
	const aChunks = toChunks(a);
	const bChunks = toChunks(b);
	const length = Math.max(aChunks.length, bChunks.length);

	for (let i = 0; i < length; i++) {
		const aChunk = aChunks[i] ?? "";
		const bChunk = bChunks[i] ?? "";
		const bothNumeric = /^\d+$/.test(aChunk) && /^\d+$/.test(bChunk);
		if (bothNumeric) {
			const diff = Number(aChunk) - Number(bChunk);
			if (diff !== 0) return diff;
		} else if (aChunk !== bChunk) {
			return aChunk < bChunk ? -1 : 1;
		}
	}
	return 0;
}

export const GALLERY_CAP = 3;

/**
 * Splits an entry folder's shown photo files into the cover (a file named
 * "cover", any case), the gallery (the first 3 others in natural order) and
 * the extras that are not shown.
 */
export function splitEntryPhotos(fileNames: string[]): {
	cover?: string;
	gallery: string[];
	extras: string[];
} {
	const sorted = fileNames.filter(isShownPhotoFile).sort(naturalCompare);
	const cover = sorted.find((name) => stem(name).toLowerCase() === "cover");
	const others = sorted.filter((name) => name !== cover);
	return {
		cover,
		gallery: others.slice(0, GALLERY_CAP),
		extras: others.slice(GALLERY_CAP),
	};
}

/**
 * Splits an Our Work folder's shown photo files into the hero (the first in
 * natural order) and the gallery (all the others, no limit).
 */
export function splitWorkPhotos(fileNames: string[]): {
	hero?: string;
	gallery: string[];
} {
	const [hero, ...gallery] = fileNames.filter(isShownPhotoFile).sort(naturalCompare);
	return { hero, gallery };
}
