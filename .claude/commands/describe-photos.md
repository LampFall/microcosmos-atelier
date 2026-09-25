---
description: Write alt text for a journal entry's photos, in Dutch in nl.md and English in en.md.
argument-hint: <aquarium>/<entry> [rewrite]
---

Entry: $ARGUMENTS

Writes the alt text (the description screen readers and search engines use)
for the photos in one journal entry folder, per `SPEC.md` §3.3.3–3.3.4. You
only edit the frontmatter of `nl.md` and `en.md`; never edit photos, body text
or any other field yourself.

1. **Find the folder.** The argument is `<aquarium>/<entry>`, e.g.
   `fallen-forest/2023-05-hardscape`, meaning
   `src/content/journal/<aquarium>/<entry>/`. If no argument is given, or the
   folder doesn't exist, list the entry folders that contain photos and ask
   which one. The word `rewrite` after the entry means: replace existing alt
   text too.
2. **Make sure the photos are prepared.** Photo files that aren't `.jpg` yet
   (`.JPG`, `.jpeg`, `.png`, `.webp`, `.heic`, `.heif`, any case) must be
   prepared first:
   - If `npx astro dev status` shows a running dev server, don't build: the
     server prepares new photos itself. Wait a few seconds and list the
     folder again. If there are still photos that aren't `.jpg`, check
     `npx astro dev logs` for the error, report it and stop.
   - Otherwise run `npm run build` once. It prepares and renames the photos
     (in every entry folder, not just this one; mention any other folders it
     changed in the report).
3. **Get the photos the page shows from the page's own code.** Don't sort
   or pick them yourself. Run, with the folder filled in:

   ```
   node --input-type=module -e "import fs from 'node:fs'; import { splitEntryPhotos } from './src/lib/photo-files.ts'; const d = 'src/content/journal/<aquarium>/<entry>'; console.log(JSON.stringify(splitEntryPhotos(fs.readdirSync(d, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name)), null, 2));"
   ```

   The output gives `cover` (if any), `gallery` (up to 3, in page order) and
   `extras` (not shown). Describe the cover and the gallery; don't describe
   the extras.
4. **Read both files:** `nl.md` and `en.md`, including the body text. It tells
   you what the photos are likely to show and which species or materials
   the owner names.
5. **Look at each photo to describe** (open it with the Read tool) and write
   one alt text per language:
   - What's visible and relevant to the entry: the layout, wood and stone,
     plants, fish, water, stage of growth. One sentence, usually under 120
     characters.
   - Factual, like the journal itself. No "Foto van…" / "Image of…", no file
     name, no adjectives like "prachtig" or "stunning".
   - Only name a species or product if the entry text names it or it's
     unmistakable in the photo. Otherwise use a general term (e.g.
     "stengelplanten", "kleine scholenvis").
   - Write the Dutch and the English text each as natural language in its
     own right. They describe the same photo, but don't translate word for
     word.
6. **Update the frontmatter of both files:**
   - **Carry over renamed keys first.** Preparation renames photos that
     didn't end in exactly `.jpg` (e.g. `IMG_1234.HEIC` → `IMG_1234.jpg`, or
     `a.png` → `a-2.jpg` on a name clash); it keeps the rest of the name as
     it was. So only a key whose name does **not** end in exactly `.jpg`,
     and has no file of that exact name, can belong to a renamed photo.
     Look for current `.jpg` files with the same name before the extension,
     with or without a `-2`/`-3`/… suffix. If exactly one such file exists
     and it has no text yet, move the key's text to it. If there are several
     candidates, leave the key as it is and ask the owner in the report which
     photo it belongs to. A key that ends in `.jpg` and whose file is gone is
     simply removed (below); never move it to another photo.
   - **Keep** existing texts, unless `rewrite` was given. Keep the texts of
     extras too: the owner may change the order later.
   - **Remove** only keys whose file no longer exists at all.
   - `photoAlt` order: the gallery photos in page order, then any kept
     extras. Leave out `photoAlt` entirely when it would be empty.
   - `coverAlt`: set it when there is a cover (keep an existing one unless
     `rewrite`); remove it when there is no cover file.
   - Place `photoAlt` and `coverAlt` right after `summary`, or after
     `status` if there is no `summary`. Keep every other line as it is.
   - Put both keys and values in double quotes, e.g.
     `"drijfhout-boven.jpg": "Drijfhout van bovenaf gezien"`. Inside a value,
     write a double quote as `\"` and a backslash as `\\`, or avoid them.
7. **Check:** run `npx astro check` (the frontmatter must still validate).
8. **Report:** a small table per language with file name → alt text, marking
   each text as new, kept, kept (renamed from …) or removed. Also list the
   extras (not described), and anything you weren't sure about (e.g. a plant
   you couldn't identify), so the owner can check it. Don't commit.
