// The one place that knows the journal folder convention:
//
//   src/content/journal/<aquarium>/<entry>/{nl,en}.md
//   src/content/journal/<aquarium>/<entry>/cover.*      (optional)
//   src/content/journal/<aquarium>/<entry>/<photo>.*    (up to 3)
//
// Nothing outside this file should parse a journal entry `id` or reach for
// `import.meta.glob` over the journal folder directly -- go through the
// helpers below instead, so the convention only has to change in one place.
import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { splitEntryPhotos } from "./photo-files";

export type JournalLang = "nl" | "en";

export interface ParsedJournalId {
	aquarium: string;
	entry: string;
	lang: JournalLang;
}

/**
 * Parses a `journal` collection entry id (e.g.
 * "fallen-forest/2023-05-hardscape/nl") into its aquarium folder, entry
 * folder and language, as derived from the folder layout.
 */
export function parseJournalId(id: string): ParsedJournalId {
	const parts = id.split("/");
	if (parts.length !== 3) {
		throw new Error(
			`Unexpected journal entry id "${id}" -- expected "<aquarium>/<entry>/<lang>".`,
		);
	}
	const [aquarium, entry, lang] = parts;
	if (lang !== "nl" && lang !== "en") {
		throw new Error(
			`Unexpected language segment "${lang}" in journal entry id "${id}".`,
		);
	}
	return { aquarium, entry, lang };
}

/**
 * Whether the same entry also exists in the other language (e.g. for
 * "fallen-forest/2023-05-hardscape/nl": is there an `en.md` next to it?).
 * Used for the hreflang links, which must only point to pages that exist.
 */
export async function hasTranslation(id: string): Promise<boolean> {
	const { aquarium, entry, lang } = parseJournalId(id);
	const other: JournalLang = lang === "nl" ? "en" : "nl";
	return (await getEntry("journal", `${aquarium}/${entry}/${other}`)) !== undefined;
}

export interface JournalListEntry {
	/** The raw collection entry id, e.g. "fallen-forest/2023-05-hardscape/nl". */
	id: string;
	/** Aquarium folder name, e.g. "fallen-forest". */
	aquarium: string;
	/** Entry folder name, e.g. "2023-05-hardscape". */
	entrySlug: string;
	/** Display name from that aquarium's aquarium.yml. */
	aquariumName: string;
	/** Volume from that aquarium's aquarium.yml, if given. */
	aquariumLiters?: number;
	data: CollectionEntry<"journal">["data"];
}

/**
 * All journal entries for one language, newest first, with the owning
 * aquarium's name/liters (from aquarium.yml) attached.
 */
export async function getJournalEntries(
	lang: JournalLang,
): Promise<JournalListEntry[]> {
	const entries = await getCollection(
		"journal",
		(entry) => parseJournalId(entry.id).lang === lang,
	);
	const aquariums = await getCollection("aquariums");
	const aquariumById = new Map(aquariums.map((a) => [a.id, a.data]));

	const list = entries.map((entry) => {
		const { aquarium, entry: entrySlug } = parseJournalId(entry.id);
		const aquariumData = aquariumById.get(aquarium);
		if (!aquariumData) {
			throw new Error(
				`No aquarium.yml found for aquarium "${aquarium}" (journal entry "${entry.id}").`,
			);
		}
		return {
			id: entry.id,
			aquarium,
			entrySlug,
			aquariumName: aquariumData.name,
			aquariumLiters: aquariumData.liters,
			data: entry.data,
		} satisfies JournalListEntry;
	});

	return list.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export interface EntryPhoto {
	/** File name within the entry folder, e.g. "drijfhout-boven.jpg". */
	fileName: string;
	image: ImageMetadata;
}

export interface EntryPhotos {
	cover?: EntryPhoto;
	/** Up to 3 gallery photos, in natural filename order. */
	gallery: EntryPhoto[];
}

// Only prepared photos (`*.jpg`, see src/lib/photo-files.ts) are matched, so a
// dropped photo that hasn't been prepared yet never reaches the page. A single
// `*` per segment means files in subfolders such as `extra/` never match.
const photoModules = import.meta.glob<{ default: ImageMetadata }>(
	"../content/journal/*/*/*.jpg",
	{ eager: true },
);

/**
 * Finds the photos for one journal entry: the cover (a file named "cover")
 * and up to 3 gallery photos in natural filename order. The integration
 * warns at build time about any photos beyond those.
 */
export function getEntryPhotos(aquarium: string, entry: string): EntryPhotos {
	const prefix = `../content/journal/${aquarium}/${entry}/`;
	const imageByName = new Map(
		Object.entries(photoModules)
			.filter(([path]) => path.startsWith(prefix))
			.map(([path, mod]) => [path.slice(prefix.length), mod.default]),
	);

	const { cover, gallery } = splitEntryPhotos([...imageByName.keys()]);
	const toPhoto = (fileName: string): EntryPhoto => ({
		fileName,
		image: imageByName.get(fileName)!,
	});

	return {
		cover: cover ? toPhoto(cover) : undefined,
		gallery: gallery.map(toPhoto),
	};
}
