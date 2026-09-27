# Photos: how to add or replace them

A short manual for adding photos to the website. The originals always stay
in **Google Drive**; the website gets a lighter copy.

## The short version

1. Start the dev server (or ask Claude to): `npx astro dev --background`.
2. **Copy** the photo from Google Drive into the right folder (table below).
   With Drive for Desktop, **hold ⌥ Option while dragging**, so the photo is
   copied and not moved out of Drive.
3. Wait a few seconds. The photo has become a `.jpg`, and the page on
   [localhost:4321](http://localhost:4321) shows it.
4. Commit and push (ask Claude). A minute later it's on the live site.

## Which folder?

All photo folders are inside the project, under `src/content/`.

| What | Folder | Rules |
| --- | --- | --- |
| Journal entry | `src/content/journal/<aquarium>/<entry>/` e.g. `journal/fallen-forest/2023-05-hardscape/` | Up to **3** photos, plus an optional `cover`. The first one (by name) is shown large and is the preview in the journal list. A photo named `cover` is the banner above the text. |
| Our Work case study | `src/content/work/<aquarium>/` (`fallen-forest`, `orinoco`, `borneo-understory`) | The first photo (by name) is the large hero; all others form the gallery, no limit. It's also the photo on the home page's "Our work" grid. |
| Home and about pages | `src/content/site/` | **Fixed names**, one per spot (see below). |
| Spare photos | an `extra/` subfolder inside any of these | Never shown, never prepared. Only commit them if they're already a `.jpg` without hidden information (see Safety net). |

"First by name" means natural order: `2.jpg` comes before `10.jpg`, and
capitals before lowercase. To choose which photo comes first, put `00-`
in front of its name. (The Our Work photos are already named `01-…`,
`02-…`; `00-` comes before all of them, `1-` does not.)

### The home and about photos (`src/content/site/`)

> **Status (2026-09-27):** this whole section applies once the eight photos
> have moved here from `public/images/` (PLAN.md, "home and about photos",
> Phase 2). Until then they're in `public/images/`, and replacing one or a
> missing file works differently.

| File | Where it's shown |
| --- | --- |
| `hero.jpg` | The big photo at the top of the home page |
| `inspiration-jungle.jpg` | Home, "inspiration" card 1 (jungle style) |
| `inspiration-amazon.jpg` | Home, card 2 (Amazon) |
| `inspiration-blackwater.jpg` | Home, card 3 (blackwater) |
| `inspiration-custom.jpg` | Home, card 4 (custom) |
| `work-extra.jpg` | Home, the fourth photo in the "Our work" grid |
| `about-home.jpg` | Home, the photo next to "about" |
| `about-page.jpg` | The photo at the top of the about page |

**Replacing one:**

1. **Delete** the old file first (e.g. `hero.jpg`). If you don't, the new
   photo becomes `hero-2.jpg` and the page keeps showing the old one.
2. Drop in the new photo with the **same name** (the extension doesn't
   matter: `hero.HEIC`, `hero.png` and `hero.jpeg` all become `hero.jpg`).
3. Use the **same orientation and roughly the same proportions** as the
   old photo (e.g. portrait for the hero), because the crop stays the same.

If a file is missing, the build stops with a message naming it, so a
missing photo never reaches the live site.

## What happens to a photo you drop in

This happens automatically, in the same folder, the first time the dev
server or a build sees the photo:

1. iPhone **HEIC** is converted to JPEG.
2. The photo is turned upright, scaled down so the long side is at most
   2400px (never scaled up), and saved as a JPEG.
3. **All hidden information is removed, including the GPS location**
   (phone photos record where they were taken, often your home).
4. The result **replaces the dropped file** in the same folder, with the
   same name and `.jpg` at the end. Nothing moves to another folder. That's
   why you copy from Drive: the untouched original must stay there.

Accepted: JPEG, PNG, WebP and HEIC, any size, any capitals in the extension.

When the site is built (on your Mac with `npm run build`, or by Netlify
after a push), Astro makes small **WebP** versions in several sizes from
each `.jpg`, so a phone gets a small file and a big screen a sharp one.
Those only exist in the built site (`dist/`), not in the project folders.

**In short:** Google Drive (original) → copy into the folder → prepared in
place to a light `.jpg` without GPS → commit and push → Netlify builds the
WebP versions → live site.

## Photo descriptions (alt text)

The short description screen readers and search engines use. Ask Claude:

- Journal: `/describe-photos <aquarium>/<entry>` (e.g.
  `/describe-photos fallen-forest/2023-05-hardscape`). The texts go into
  the entry's `nl.md` and `en.md`.
- Our Work: `/describe-photos work/<aquarium>`. The texts go into that
  folder's `alt.yml`.
- Home and about photos have fixed descriptions (in `src/i18n/ui.ts` and
  the page files); ask Claude if a new photo needs a different one.

Check the texts and change them if needed.

## Safety net

Before every commit, a check on this Mac refuses any photo in these folders
that isn't prepared yet or still has hidden information (possible GPS). If
that happens: start the dev server (it prepares the photo), then commit
again. That doesn't work for photos in an `extra/` folder, because those
are never prepared: leave them out of the commit (ask Claude), or export
them yourself as a `.jpg` without location data.

## If something doesn't work

- **The photo stays `.HEIC` / `.png`:** the dev server isn't running. Start
  it, or run `npm run build`.
- **The page still shows the old photo:** check for a `-2.jpg` file; delete
  the old one and rename the new one.
- **A journal entry shows only 3 of your photos:** by design; the build
  warns about the extras. Move the spares to `extra/`.
- **Anything else:** ask Claude, and point it to this file.
