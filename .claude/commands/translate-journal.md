---
description: Translate a journal entry between NL and EN, keeping frontmatter and structure in sync.
argument-hint: <path-to-journal-entry.md>
---

You are translating a journal entry for the Microcosmos Atelier Astro site between Dutch (`src/content/journal/nl/`) and English (`src/content/journal/en/`). Each entry exists as two files with the same filename, one per language, sharing the same `journal` content collection schema (see `src/content.config.ts`).

Argument: $ARGUMENTS — path to the source markdown file that was just written or edited. If no path is given, figure out which journal file was most recently edited (check the currently open file, or `git status` / `git diff` for uncommitted changes under `src/content/journal/`) and ask the user to confirm if it's ambiguous.

Steps:

1. Read the source file and its frontmatter.
2. Determine the source language from the `lang` field (or the `nl/`/`en/` parent folder) and derive the target file path: same filename, with `nl` and `en` swapped in the path.
3. If the target file already exists, read it first. Only overwrite content that actually differs — if the existing translation looks like a deliberate hand-edit rather than a stale machine translation, tell the user what would change before writing over it.
4. Translate naturally and idiomatically into the target language:
   - `title`
   - `summary` (if present)
   - `coverAlt` (if present)
   - each `photos[].alt` (if present)
   - the full markdown body
5. Do NOT translate or change these fields — copy them verbatim from the source:
   - `tank` (must be byte-identical across both language files, or the tank filter on the journal overview page breaks)
   - `liters`
   - `date`
   - `status` (this is an enum key like `opstart`/`groeit`/`rijpt`/`stabiel`; the human-readable label is translated separately via `src/i18n/ui.ts`, not here)
   - `cover` path and `photos[].src` paths
6. Set `lang` in the target file to the target language code (`nl` or `en`).
7. Match the existing YAML frontmatter style: same key order, same quoting, same indentation for the `photos` list, so the two files stay easy to diff side by side.
8. Write the translated file.
9. Run `npx astro check` to confirm the schema still validates, then tell the user which file was created or updated and flag anything you were unsure how to translate (idioms, aquarium/plant species names, etc.) so they can double-check it.
