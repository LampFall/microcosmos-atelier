---
description: Translate a journal entry between NL and EN, keeping frontmatter and structure in sync.
argument-hint: <aquarium>/<entry> or the path to its nl.md / en.md
---

Entry: $ARGUMENTS

Translates one journal entry between Dutch and English. Each entry is a
folder, `src/content/journal/<aquarium>/<entry>/`, with `nl.md` and `en.md`
side by side (`SPEC.md` §3.3.2–3.3.3, schema in `src/content.config.ts`).
You only write the other language's file; never touch photos,
`aquarium.yml` or other entries.

1. **Find the entry.** The argument is `<aquarium>/<entry>` (e.g.
   `fallen-forest/2023-05-hardscape`) or the path to its `nl.md` or `en.md`.
   Without an argument, find the journal file that was edited most recently
   (the file open in the editor, or `git status` under
   `src/content/journal/`), and ask the owner to confirm if that's
   ambiguous.
2. **Pick the source.** A path argument names the source file. With
   `<aquarium>/<entry>`, the source is the file that exists; if both exist,
   it's the one changed most recently (check `git diff` and `git status`),
   and ask if that's unclear. The target is the other file in the same
   folder: `nl.md` ↔ `en.md`.
3. **If the target already exists, read it first.** Only change what
   actually differs from the source. If the existing translation looks like
   a deliberate hand-edit rather than a stale translation, tell the owner
   what would change before overwriting it.
4. **Translate** naturally and idiomatically, in the diary-like tone of the
   journal (see `.claude/agents/content-writer.md` for the writing styles):
   - `title`
   - `summary` (if present)
   - the full Markdown body
5. **Alt text** (`photoAlt` and `coverAlt`): the keys of `photoAlt` are photo
   file names and are the same in both files; copy them exactly. For the
   texts: keep a text the target already has, since `/describe-photos`
   writes each language itself. Only translate the texts the target is
   missing. Don't add or remove keys beyond that. So a changed alt text is
   **not** carried over: tell the owner to edit both files or run
   `/describe-photos <aquarium>/<entry> rewrite`.
6. **Copy unchanged:** `date` and `status`. `status` is an enum key
   (`opstart`/`groeit`/`rijpt`/`stabiel`), not display text; its label is
   translated in `src/i18n/ui.ts`.
7. **Don't add fields that no longer exist:** `lang`, `tank`, `liters`,
   `cover` and `photos` are gone. The language comes from the file name, the
   aquarium name and liters from `aquarium.yml`, and the photos from the files
   in the folder.
8. **Keep the frontmatter style of the source:** same key order, double
   quotes, same indentation for `photoAlt`, so the two files are easy to
   compare. Inside a double-quoted value, write `"` as `\"` and a backslash
   as `\\`, or avoid them.
9. **Write** the target file, run `npx astro check`, and report which file
   you wrote and anything you weren't sure how to translate (idioms, plant
   or fish names), so the owner can check it. Don't commit.
