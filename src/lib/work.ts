// The one place that knows the Our Work folder convention (SPEC.md §3.7):
//
//   src/content/work/<aquarium>/<photo>.jpg   first in natural order = hero,
//                                             all others = gallery
//   src/content/work/<aquarium>/extra/…       spares, never shown
//   src/content/work/<aquarium>/alt.yml       optional alt text per photo
//
// Photos are prepared by src/integrations/prepare-photos.ts; which files are
// shown follows the shared rules in src/lib/photo-files.ts.
import { getEntry } from "astro:content";
import { splitWorkPhotos } from "./photo-files";

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
