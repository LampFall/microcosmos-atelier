// The one place that knows the Our Work folder convention (SPEC.md §3.7):
//
//   src/content/work/<aquarium>/<photo>.jpg   first in natural order = hero,
//                                             all others = gallery
//   src/content/work/<aquarium>/extra/…       spares, never shown
//   src/content/work/<aquarium>/alt.yml       optional alt text per photo
//
// Photos are prepared by src/integrations/prepare-photos.ts; which files are
// shown follows the shared rules in src/lib/photo-files.ts.
//
// The pages don't show a work folder directly: getProjectPhotos() puts the
// newest journal photos of the same aquarium first (SPEC.md §3.18).
import { getEntry } from "astro:content";
import { splitWorkPhotos } from "./photo-files";
import { getEntryPhotos, getJournalEntries, type JournalLang } from "./journal";

/** The work folder of each case study, used by Our Work and the home page. */
export const WORK_FOLDERS = {
	project1: "fallen-forest",
	project2: "orinoco",
	project3: "borneo-understory",
} as const;

export interface WorkPhoto {
	/** File name within the work folder, e.g. "01-A002-05.jpg". */
	fileName: string;
	image: ImageMetadata;
}

export interface WorkPhotos {
	hero?: WorkPhoto;
	gallery: WorkPhoto[];
}

// A single `*` per segment: files in subfolders such as `extra/` never match.
const photoModules = import.meta.glob<{ default: ImageMetadata }>(
	"../content/work/*/*.jpg",
	{ eager: true },
);

/** The hero and gallery photos of one work folder, in page order. */
export function getWorkPhotos(folder: string): WorkPhotos {
	const prefix = `../content/work/${folder}/`;
	const imageByName = new Map(
		Object.entries(photoModules)
			.filter(([path]) => path.startsWith(prefix))
			.map(([path, mod]) => [path.slice(prefix.length), mod.default]),
	);

	const { hero, gallery } = splitWorkPhotos([...imageByName.keys()]);
	const toPhoto = (fileName: string): WorkPhoto => ({
		fileName,
		image: imageByName.get(fileName)!,
	});

	return {
		hero: hero ? toPhoto(hero) : undefined,
		gallery: gallery.map(toPhoto),
	};
}

/** Dutch and English alt text per photo file name, from the folder's `alt.yml`. */
export type WorkAltTexts = Record<string, { nl: string; en: string }>;

/** The folder's alt texts, or none if it has no `alt.yml`. */
export async function getWorkAltTexts(folder: string): Promise<WorkAltTexts> {
	const entry = await getEntry("workAlt", folder);
	return entry?.data ?? {};
}

/** A photo shown for a project, with its alt text in the page's language. */
export interface ProjectPhoto {
	image: ImageMetadata;
	/** From the journal entry or the work folder's `alt.yml`, if it has one. */
	alt?: string;
}

export interface ProjectPhotos {
	hero?: ProjectPhoto;
	gallery: ProjectPhoto[];
}

/**
 * The photos of one project (SPEC.md §3.18): the newest journal entry of the
 * aquarium with the same folder name that has photos supplies the hero (its
 * first gallery photo, else its cover, like the journal list) and the first
 * gallery photos; the work folder's photos follow. Without journal photos,
 * the work folder alone, as before.
 */
export async function getProjectPhotos(
	folder: string,
	lang: JournalLang,
): Promise<ProjectPhotos> {
	const work = getWorkPhotos(folder);
	const workAlt = await getWorkAltTexts(folder);
	const workPhotos = [work.hero, ...work.gallery]
		.filter((photo) => photo !== undefined)
		.map((photo) => ({ image: photo.image, alt: workAlt[photo.fileName]?.[lang] }));

	// Newest first, so the first entry with photos is the one to show.
	for (const entry of await getJournalEntries(lang)) {
		if (entry.aquarium !== folder) continue;
		const { cover, gallery } = getEntryPhotos(entry.aquarium, entry.entrySlug);
		const entryPhotos = [
			...gallery.map((photo) => ({ image: photo.image, alt: entry.data.photoAlt?.[photo.fileName] })),
			...(cover ? [{ image: cover.image, alt: entry.data.coverAlt }] : []),
		];
		if (entryPhotos.length === 0) continue;
		const [hero, ...rest] = entryPhotos;
		return { hero, gallery: [...rest, ...workPhotos] };
	}

	const [hero, ...gallery] = workPhotos;
	return { hero, gallery };
}
