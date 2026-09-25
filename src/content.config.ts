import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Journal content lives one folder per aquarium, one folder per entry:
//
//   src/content/journal/
//     fallen-forest/                 <- aquarium folder (kebab-case)
//       aquarium.yml                 <- { name, liters? }, written once
//       2023-05-hardscape/           <- entry folder (YYYY-MM-short-title)
//         nl.md
//         en.md
//         cover.jpg                  <- optional banner photo
//         some-photo.jpg             <- up to 3 gallery photos, any name
//
// The two collections below mirror that layout:
//
// - `aquariums` reads every `aquarium.yml` and is keyed by the aquarium
//   folder name (e.g. "fallen-forest"), so `getEntry("aquariums",
//   "fallen-forest")` works. The name/liters are written once here instead
//   of being repeated (and possibly drifting) across every entry.
// - `journal` reads every `nl.md`/`en.md`. Its id is
//   "<aquarium>/<entry>/<lang>" (e.g. "fallen-forest/2023-05-hardscape/nl").
//   The language comes from the file name, the aquarium from the parent
//   folder, and photos are discovered directly from files sitting in the
//   entry folder -- see `src/lib/journal.ts`, the one place that knows this
//   folder convention. None of that (aquarium name, language, photo list)
//   lives in frontmatter, so adding/renaming a photo never touches text.
//
// "status" is a closed enum key; the visible label is translated through
// ui.ts (journal.status.opstart, .groeit, .rijpt, .stabiel) -- never render
// the raw key directly.
const aquariums = defineCollection({
	loader: glob({
		pattern: "*/aquarium.yml",
		base: "./src/content/journal",
		// Default id/slug generation would produce "fallen-forest/aquarium"
		// (the full path minus extension); we want just the aquarium folder
		// name so `getEntry("aquariums", aquarium)` is a direct lookup.
		generateId: ({ entry }) => entry.split("/")[0],
	}),
	schema: z.object({
		name: z.string(),
		liters: z.number().optional(),
	}),
});

const journal = defineCollection({
	loader: glob({
		pattern: "*/*/{nl,en}.md",
		base: "./src/content/journal",
	}),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		status: z.enum(["opstart", "groeit", "rijpt", "stabiel"]),
		summary: z.string().optional(),
		// Alt text per photo file name (in this file's language), e.g.
		// { "drijfhout-boven.jpg": "Het drijfhout van bovenaf gezien" }.
		photoAlt: z.record(z.string(), z.string()).optional(),
		coverAlt: z.string().optional(),
	}),
});

export const collections = { journal, aquariums };
