import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Eén observatie = één Markdown-bestand.
// De NL-versies staan in src/content/journal/nl/, de EN-versies in .../en/.
// "tank" groepeert observaties per bak (gebruik dezelfde naam in beide talen,
// bv. "Fallen Forest", zodat het filteren werkt).
// "status" is een vaste sleutel; de zichtbare tekst wordt vertaald via ui.ts
// (journal.status.opstart, .groeit, .rijpt, .stabiel).
const journal = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/journal" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			lang: z.enum(["nl", "en"]),
			tank: z.string(),
			liters: z.number().optional(),
			date: z.coerce.date(),
			status: z.enum(["opstart", "groeit", "rijpt", "stabiel"]),
			summary: z.string().optional(),
			cover: image().optional(),
			coverAlt: z.string().optional(),
		}),
});

export const collections = { journal };
