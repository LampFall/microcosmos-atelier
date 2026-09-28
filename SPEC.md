# Microcosmos Atelier — Specification

## 1. What this is

Microcosmos Atelier is the marketing and portfolio website for Kasper Masschaele's
practice of designing and building living aquatic ecosystems ("Microcosmos"
installations). The site presents the studio's philosophy, showcases finished
projects as case studies, publishes an ongoing "journal" of observations for
each tank, and lets prospective clients start a conversation.

It is a **content-heavy, mostly static marketing site**, not a web app: there is
no login, no database, and no server-side business logic. Content is authored
as Markdown/frontmatter and Astro components, and the whole site is built to
static HTML for deployment.

## 2. Audience

- Prospective clients researching whether to commission a custom aquatic
  ecosystem (private individuals, possibly interior designers/architects on
  their behalf).
- Existing clients or followers who want to see how a specific tank has
  evolved over time (the journal).
- Bilingual audience: Dutch (primary/default) and English.

## 3. Functional requirements

### 3.1 Pages

| Page | NL path | EN path | Purpose |
| --- | --- | --- | --- |
| Home | `/` | `/en` | Pitch, philosophy, process, links to work/about/contact |
| Our Work | `/our-work` | `/en/our-work` | Case studies for finished/major installations, with specs and photo galleries |
| About | `/about` | `/en/about` | Studio/founder story |
| Contact | `/contact` | `/en/contact` | Enquiry form |
| Journal | `/journal` | `/en/journal` | Chronological log of observations, filterable by tank |
| Journal entry | `/journal/<aquarium>/<entry>` | `/en/journal/<aquarium>/<entry>` | One dated observation for one aquarium |

### 3.2 Internationalization

- Dutch is the default locale and is **not** prefixed (`/about`, not `/nl/about`).
- English is prefixed with `/en`.
- Every page-level string lives in `src/i18n/ui.ts` under a `nl` and `en` key
  with the same key name; there is no missing-key fallback expected in
  practice, but `useTranslations` falls back to Dutch if a key is missing.
- Every journal entry exists as **two Markdown files** (one per language),
  `nl.md` and `en.md`, co-located inside that entry's own folder — see 3.3.2
  for the full content layout.
- A language switcher in the header must always link to the equivalent page
  in the other language, not just the homepage.

### 3.3 Journal

Status: APPROVED (2026-09-25)

Written before the spec template in `AGENTS.md` existed. Sections 3.3.7 to
3.3.9 were added afterwards to cover the headings it requires; the content
of 3.3.1 to 3.3.6 is unchanged.

#### 3.3.1 Aquariums and entries

- The journal follows each **aquarium** over time. An aquarium (e.g.
  "Fallen Forest") has one or more **entries**: dated observations such as
  the first hardscape, the emersed growth, or the forest closing in.
- Each aquarium's display name and optional volume in liters are written
  **once**, in its `aquarium.yml` (3.3.2). Entries don't repeat them, so
  the name can't be misspelled in one entry and break the filter. The name
  drives the aquarium filter on the journal index and links an "Our Work"
  case study to its journal history.
- Each entry has a `status` from a fixed set: `opstart` (setup), `groeit`
  (growing), `rijpt` (maturing), `stabiel` (established). The enum key is
  never translated; only its display label is, via `journal.status.*` in
  `ui.ts`.
- Entries are sorted newest-first on the journal index page.
- The journal index filters entries by aquarium when there is more than one.

#### 3.3.2 Folder layout — one folder per aquarium, one folder per entry

**Current state (to be replaced):** an entry's two language files and its
photos are split across three unrelated places: `src/content/journal/nl/`,
`src/content/journal/en/`, and `src/assets/journal_pics/`. Nothing groups
the entries of one aquarium together.

**Target state:** one folder per aquarium. Inside it, one folder per entry
holds everything for that entry: both texts and its photos.

```
src/content/journal/
  fallen-forest/                ← one folder per aquarium
    aquarium.yml                ← name + liters, written once
    2023-05-hardscape/          ← one folder per entry
      nl.md
      en.md
      cover.jpg                 ← optional banner photo
      drijfhout-boven.jpg       ← up to 3 photos, any file name
      substraat.jpg
      detail-wortels.jpg
    2023-09-emers/
      nl.md
      en.md
      ...
    2025-06-gesloten/
      ...
  borneo-understory/
    aquarium.yml
    2026-08-opstart/
      nl.md
      en.md
```

`aquarium.yml` contains only:

```yaml
name: "Fallen Forest"
liters: 1000
```

Rules:
- **Aquarium folder**: short kebab-case name, e.g. `fallen-forest`.
  **Entry folder**: `YYYY-MM-short-title`, e.g. `2023-05-hardscape`. Starting
  with year and month keeps the entries in date order in Finder.
- The two folder names form the URL: `/journal/fallen-forest/2023-05-hardscape`
  and `/en/journal/fallen-forest/2023-05-hardscape`. Renaming a folder changes
  its URL, so settle on a name before publishing. The four existing entries
  get redirects from their old URLs (see `PLAN.md`).
- Photos and the cover are shared by both languages: you add them once.
- **The text files never mention photos, the aquarium, or the language.**
  The aquarium comes from the parent folder, the language from the file name
  (`nl.md`/`en.md`), and the photos from the image files in the folder. So
  adding, replacing, or renaming a photo never requires editing text.

#### 3.3.3 Frontmatter (per language file)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | |
| `date` | date | yes | day of the observation; used for sorting |
| `status` | `"opstart" \| "groeit" \| "rijpt" \| "stabiel"` | yes | enum key, never translated directly |
| `summary` | string | no | one sentence, shown on the journal index |
| `photoAlt` | map: file name → text | no | alt text per photo, in this file's language (3.3.4) |
| `coverAlt` | string | no | alt text for `cover.*` |

Compared to today, `lang` (now from the file name), `tank` and `liters`
(now from `aquarium.yml`), and `cover` and `photos` (now from the files in
the folder) are gone. Fewer fields means fewer ways for the two language
files to drift apart.

Example `nl.md`:

```markdown
---
title: "De eerste hardscape ligt"
date: 2023-05-12
status: "opstart"
summary: "Twee meter drijfhout en de eerste lagen substraat."
photoAlt:
  drijfhout-boven.jpg: "Het drijfhout van bovenaf gezien"
  substraat.jpg: "De lagen substraat tegen de voorruit"
---

De grootste bak tot nu toe...
```

#### 3.3.4 Adding photos — drop them in the folder

The original, full-resolution photos live in **Google Drive**, which stays
the permanent archive. The website never links to Drive directly (see the
decision log in `PLAN.md`).

**The workflow:**

1. Pick up to 3 photos in Google Drive.
2. Put a **copy** of them in the entry's folder, e.g.
   `src/content/journal/fallen-forest/2023-05-hardscape/`. Any file name
   works. JPEG, PNG and iPhone HEIC are all accepted, at any size.
3. That's it. With the dev server running, the photos appear on the page
   right away. Otherwise they appear the next time the dev server starts or
   the site is built.

**Getting the copy from Drive:**

- **With Google Drive for Desktop** (recommended, free, installed once):
  Drive appears as a folder in Finder. **Hold ⌥ Option while dragging** (or
  use ⌘C / ⌘V) so Finder copies the photo. A plain drag between folders
  can *move* the file out of Drive.
- **Without installing anything:** download the photos from
  drive.google.com. They land in `~/Downloads` (zipped if more than one).
  Unzip them and drag them into the entry folder.

**Which photo goes where:**

- Photos are shown in **alphabetical order of file name**, and the first one
  is shown large. To choose the large one, give it a name that sorts first,
  e.g. put `1-` in front of it.
- A file named `cover` (`cover.jpg`, `cover.heic`, …) is the banner above the
  text, not a gallery photo.
- 1, 2 or 3 gallery photos are all fine, and so is none. With more than 3,
  the first 3 are used and the build shows a warning that lists the extra
  ones, so nothing is dropped without notice.
- Files in a subfolder (e.g. `extra/`) are ignored. That's the place to keep
  spare photos next to the entry.
- **Replacing a photo** = delete the old file and drop in the new one. No
  text needs to change. Alt text is stored per file name, so a new photo
  with a different name gets the fallback alt text until it is described
  (see below).

**What happens automatically to each photo** (the first time the dev server
or build sees it):

- HEIC is converted to JPEG (macOS `sips`, because the image library in
  use can't read HEIC).
- It is rotated according to the camera's orientation, scaled down so the
  long edge is at most 2400px (never scaled up), and saved as JPEG
  quality 85.
- **All metadata is removed, including GPS location.** Phone photos often
  record where they were taken, i.e. the home where the aquarium stands.
- The prepared version **replaces the dropped file** in the folder (same
  name, `.jpg` extension). That's why step 2 says *copy*: the untouched
  original must stay in Drive. Photos that are already prepared are
  skipped, so this only costs time for new photos.

Preparing in place is deliberate: the entry folder always shows exactly
what gets published, and git only ever stores the light version.

**Alt text** (the description screen readers and search engines use):

- Without alt text, a photo gets `"<title> — foto 1"` as a fallback. The
  page still works, but that's a poor description.
- Run `/describe-photos fallen-forest/2023-05-hardscape` in Claude Code.
  Claude looks at each photo and writes `photoAlt` into `nl.md` (Dutch)
  and `en.md` (English). You check the text and edit it if needed. Writing
  `photoAlt` by hand works the same way.
- The `i18n-agent` check flags photos that have no alt text in one or
  both languages.

**A new entry:** create a folder `YYYY-MM-short-title` in the aquarium's
folder, write `nl.md` (yourself or with the `content-writer` agent), run
`/translate-journal` for `en.md`, and drop in the photos.
**A new aquarium:** create a folder with an `aquarium.yml` (name + liters),
then add entries to it as above.

#### 3.3.5 Image pipeline — smaller on the wire, full resolution kept

Goal: pages load fast, and full resolution is never lost.

There are three levels of each photo, each with one job:

| Level | Where | Size | Job |
| --- | --- | --- | --- |
| Original | Google Drive | full camera resolution | Permanent archive. Never modified by any tooling. |
| Web master | the entry folder (in git), prepared automatically when dropped in | long edge 2400px, JPEG q85, no metadata | Source for the build. Sharp enough for large and high-DPI screens, small enough (usually 0.5–1.5 MB) to keep the git repository light. |
| Served variants | generated into `dist/` at build time | several widths, WebP | What visitors actually download. Never committed. |

- Keeping the full originals out of git is deliberate. Phone and camera
  originals are often 5–15 MB each, and every photo ever committed stays in
  the git history for good. Drive already keeps the originals safe, so the
  repository only needs the web master.
- If a web master ever needs to be regenerated (for example, to raise the
  2400px limit), copy the original from Drive into the folder again.
- **How it works (for implementers):** a small Astro integration prepares
  new photos when `astro dev` or `astro build` starts, and watches the
  journal folder while the dev server runs. Pages find their photos with
  `import.meta.glob` over the entry folder, so no paths are written in
  frontmatter, and Astro still optimizes each photo as a normal local image.
- **Every journal image is rendered through Astro's built-in image
  pipeline** (`astro:assets`, already in use for journal images today —
  this is not new infrastructure, just applying it more deliberately):
  - At build time, Astro/Sharp generates one or more **resized, re-encoded
    copies** of each web master, sized to what the layout actually
    displays (e.g. the "big" gallery photo needs at most ~900px wide even
    on a large desktop screen; the "small" ones need at most ~350px) rather
    than shipping a multi-megabyte, multi-thousand-pixel camera original to
    every visitor.
  - Output format defaults to **WebP** (good compression, universal modern
    browser support) instead of serving the original JPEG/PNG as-is. AVIF
    can be considered later for further savings if needed, but WebP is the
    safer default to start with.
  - **Responsive images**: each image gets a `srcset` covering a small set
    of widths (e.g. mobile/tablet/desktop), so a visitor on a phone
    downloads a phone-sized file, not the desktop one scaled down by CSS.
    Astro 7 supports this natively via the `layout` option
    (`constrained`/`fixed`/`full-width`) on `<Image>`/`<Picture>`, which
    also auto-generates the `sizes` attribute and reserves the correct
    aspect ratio to avoid layout shift.
  - Explicit `width`/`height` (already emitted today) continues to be set
    on every image so the browser reserves the right space before the
    image loads — this is what prevents the page visibly "jumping" while
    photos load in.
- **Lazy loading below the fold, eager loading above it.** Astro's
  `<Image>` already defaults to `loading="lazy" decoding="async"`, which is
  correct for the journal photo gallery (it sits below the article body,
  off-screen on load). The one exception: a post's `cover` image is the
  first large visual thing a visitor sees on that page (above the fold), so
  it should load **eagerly** (`loading="eager"`, and ideally
  `fetchpriority="high"`) rather than lazily — lazy-loading the very image
  a visitor is looking at first only makes the page *feel* slower. This is
  a real gap in the current implementation (the cover image has no explicit
  loading strategy today) and should be fixed as part of this work.
- **Build cost is an accepted trade-off.** Generating multiple sized/format
  variants per photo makes `astro build` slower than it is today. This is a
  one-time (well, per-build) cost paid at publish time, not something a
  site visitor ever waits on, so it's the right trade to make.

#### 3.3.6 Related but out of scope for this change

- The "Our Work" photos were out of scope here. They have since moved to the
  same prepared-photo system in their own spec, §3.7 (implemented
  2026-09-26).

#### 3.3.7 Security implications

- **Location privacy.** Phone photos can contain the GPS location of the
  owner's home. Photo preparation removes all metadata from every photo
  before it can reach git or the public site. A photo that failed
  preparation still contains its metadata, so it must not be committed
  (see 3.3.8).
- **Originals stay private.** Full-resolution originals stay in Google
  Drive. The site never links to Drive, so no Drive sharing link is ever
  made public.
- **Scope of automatic file changes.** Photo preparation only rewrites image
  files directly inside `src/content/journal/<aquarium>/<entry>/`. It never
  touches subfolders or any other path, and never deletes a file it hasn't
  just replaced.
- No new services, credentials or runtime code: everything happens at build
  time on the owner's machine.

#### 3.3.8 Error handling

- **A photo can't be prepared** (a truly corrupt file, an unreadable HEIC):
  the dev server or build logs an error naming the file and carries on; the
  file is left exactly as it was, metadata included. Small decoder warnings
  that phone and WhatsApp JPEGs often have are tolerated and don't count as
  a failure. An unconverted HEIC doesn't appear on the page, but a file that
  already ends in `.jpg` can still appear (Astro's own image step is more
  lenient than the preparation), so the build does **not** fail on it. The
  owner removes or replaces such a file. The pre-commit hook blocks
  committing any journal photo that still has metadata.
- **More than 3 gallery photos:** the first 3 in alphabetical order are
  shown, and the build logs a warning listing the others.
- **No photos, or no cover:** the entry shows only its text. This is valid.
- **Missing alt text:** the page uses the fallback "<title> — foto n" /
  "<title> — photo n"; the verifier reports it as a warning.
- **A missing `nl.md` or `en.md`:** that language simply has no page for the
  entry; the verifier reports it.
- **A missing or invalid `aquarium.yml`, or a frontmatter error:**
  `astro check` and the build fail with the file name. The pre-commit hook
  blocks the commit.
- **Photo preparation is interrupted:** it writes to a temporary file first
  and only then replaces the original, so a half-written photo never
  replaces a good one.

#### 3.3.9 Acceptance criteria

1. Every existing entry renders at `/journal/<aquarium>/<entry>` and
   `/en/journal/<aquarium>/<entry>`; the 8 old URLs redirect there.
2. The journal index filters by aquarium name from `aquarium.yml`; the
   language switcher on an entry page leads to the same entry in the other
   language.
3. A HEIC photo and a JPEG with GPS data dropped into an entry folder end up
   as `.jpg`, with the long edge at most 2400px and no location metadata.
   A second run changes nothing.
4. With 4 gallery photos, 3 are shown and the build warns. A photo in a
   subfolder is ignored.
5. In the built HTML, gallery photos have a `srcset`, WebP sources and
   `loading="lazy"`; the cover has `loading="eager"` and
   `fetchpriority="high"`; every `<img>` has non-empty `alt` text.
6. `npx astro check` reports 0 errors and `npm run build` succeeds.
7. Manual check: while the dev server runs, a newly dropped photo appears on
   the page without restarting the server.

### 3.4 Our Work case studies

- Each case study's text is hand-authored in
  `src/components/pages/OurWork.astro` and `ui.ts`. Its photos come from
  `src/content/work/<aquarium>/` (hero + gallery, alt text per photo in
  `alt.yml`); see §3.7.
- Each case study lists structured specs (start date, dimensions, volume,
  filtration, lighting, substrate, CO₂, fish, other inhabitants, plants),
  translated per-language via `work.projectN.spec.*` keys in `ui.ts`.

### 3.5 Contact

- One enquiry form (`Contact.astro`) on `/contact` and `/en/contact`,
  handled by Netlify Forms, with a thank-you page per language. The page
  shows no email address. Full spec: §3.10. Any change to how submissions
  are processed is a decision for the site owner.

### 3.6 Journal index: clearer aquarium and a photo preview

Status: APPROVED (2026-09-26)

#### Objectives

1. On the journal index (`/journal`, `/en/journal`), a visitor sees at a
   glance which aquarium each entry is about.
2. Each entry in the list shows a preview photo, so a visitor gets a sneak
   preview of the entry before opening it. The preview is the photo that is
   shown large on the entry's own page, chosen automatically.

#### Non-goals

- No change to the entry page itself (cover, gallery, text).
- No new frontmatter field to choose the preview photo; the file order
  decides.
- No grouping of the list per aquarium: it stays one timeline, newest first.
  The existing aquarium filter buttons remain the way to see one aquarium.
- No change to Our Work, the home page, or the photo preparation.

#### Current state

- `src/components/pages/Journal.astro` renders each entry as a two-column
  row (`.journal-entry` in `src/styles/journal.css`): the date on the left
  (190px), and on the right a meta line, the title (link) and the summary.
- The aquarium name and liters sit in that meta line in `.journal-tank`:
  0.72rem, uppercase, in the muted colour, the same style as the date and
  the status. That is why the aquarium doesn't stand out.
- The list shows no photos. On mobile (≤ 800px) the row becomes one column.

#### User workflow

- **Visitor:** opens the journal and sees per entry: a photo on the left;
  on the right, the aquarium name clearly, then the date and status, the
  title and the summary. Clicking the photo or the title opens the entry.
- **Owner:** nothing new to do. The preview is the first gallery photo, the
  same one that is shown large on the entry page. To pick another one, the
  owner renames the files (e.g. puts `1-` in front), as today.

#### Functional requirements

1. **Aquarium label.** Each list entry shows the aquarium name (from
   `aquarium.yml`) as a separate, clearly visible label above the title: in
   the normal text colour instead of the muted colour, and noticeably larger
   than the date and status. The liters stay next to it, in the smaller
   muted style.
2. **Date and status** move into one small meta line below the aquarium
   label (the left date column disappears, see requirement 4).
3. **Preview photo.** Each entry with at least one gallery photo shows that
   entry's first gallery photo, determined by `splitEntryPhotos` in
   `src/lib/photo-files.ts`: natural file-name order (`2.jpg` before
   `10.jpg`, capitals before lowercase), ignoring `cover.*`. That is exactly
   the photo shown large on the entry page. An entry with no gallery photos
   but a `cover.*` uses the cover as its preview.
4. **Layout.** On desktop, the photo takes the left column (where the date is
   now); the text column is on the right. All previews have the same size
   and a fixed 4:3 frame, about 240px wide; a photo with another shape is cropped to fill it,
   centred (`object-fit: cover`). On mobile (≤ 800px) the photo is shown
   full width above the text.
5. **Entries without photos** (no gallery photo and no cover): no preview
   and no empty frame; the text column takes the full width of the row.
6. **Link.** The photo links to the entry, like the title. For keyboard and
   screen reader users the entry is still one link (the title); the photo
   link is not a separate tab stop.
7. **Alt text.** Because the photo repeats the linked title, it gets an
   empty `alt` (decorative, see §4 Accessibility).
8. **Performance.** The previews use Astro's `<Image>` like the entry page:
   WebP, a `srcset` sized to the preview column (about 240px wide, so up to
   about 480px for high-DPI screens), explicit width and height, and
   `loading="lazy"`.
9. **Filter.** The aquarium filter keeps working unchanged (`data-tank` on
   each list entry).
10. **Both languages** get the same layout; the new text (if any) goes into
    both blocks of `src/i18n/ui.ts`.

#### Data / content model

No change. The preview photo comes from the files already in the entry
folder, via the existing `getEntryPhotos(aquarium, entry)` in
`src/lib/journal.ts`. The aquarium name and liters come from `aquarium.yml`
as today.

#### Architecture

- `src/components/pages/Journal.astro`: call `getEntryPhotos` per entry and
  render the preview with `<Image>`; restructure the row markup (label,
  meta line, title, summary).
- `src/styles/journal.css`: new styles for the row, the preview and the
  aquarium label, including the mobile breakpoint. The entry page styles
  don't change.
- Reuses the existing photo rules (`splitEntryPhotos`) and the
  `pages/` vs `components/pages/` split; no new modules or dependencies.

#### Security implications

None new. The previews are the already-prepared web masters (no metadata,
see §3.3.7), served as the same optimized WebP files as on the entry page.

#### Error handling

- **No gallery photos:** the cover is the preview if there is one;
  otherwise the row shows only text (requirement 5).
- **A photo that fails to optimize:** the build fails at the image step, as
  it already would for the entry page (§3.3.8).
- **An entry with more than 3 photos:** the preview is still the first
  gallery photo; the existing build warning is unchanged.

#### Acceptance criteria

1. On `/journal` and `/en/journal`, each entry shows the aquarium name above
   the title, in the normal text colour and larger than the date/status line.
2. For an entry with photos (e.g. `fallen-forest/2026-09-sand`), the list
   shows exactly one preview, and it is the same file as the large photo on
   the entry page.
3. The preview has a 4:3 frame, WebP sources with a `srcset`, explicit
   width/height, `loading="lazy"` and an empty `alt`; it links to the entry
   and is not a separate tab stop.
4. An entry without photos shows no empty photo frame.
5. On a screen ≤ 800px wide the preview appears full width above the text
   (manual check in the browser).
6. The aquarium filter still shows and hides the right entries (manual
   check).
7. `npx astro check` reports 0 errors and `npm run build` succeeds.

#### Decisions (approved 2026-09-26)

1. Entries without photos: the text uses the full row width, no placeholder.
2. An entry with only a `cover.*`: the cover is the preview.
3. Preview size: a column of about 240px wide, 4:3.
4. Order: natural order (`splitEntryPhotos`), not strictly alphabetical, so
   the preview is always the photo shown large on the entry page.

### 3.7 Our Work: photos from one folder per aquarium

Status: APPROVED (2026-09-26), implemented 2026-09-26. "Current state" below
describes the situation before this change.

#### Objectives

1. The owner adds, replaces or removes an Our Work photo by putting it in
   (or taking it out of) that aquarium's folder. No code or text file names
   a photo.
2. The same automatic preparation as the journal (2400px JPEG, all metadata
   removed) and the same fast delivery (WebP `srcset`, lazy loading).

#### Non-goals

- The case-study text stays as it is: in `src/i18n/ui.ts` and hand-written
  sections in `OurWork.astro`. Adding a whole new project still needs code
  and text (a possible follow-up, not this spec).
- No visible captions under the photos (alt text only).
- The home page's hero, inspiration and about photos are not included.

#### Current state

- `src/components/pages/OurWork.astro` has three hand-written case studies:
  Fallen Forest (files `A002-*`), Orinoco (`A003-*`) and Borneo Understory
  (`A004-*`). Each has one hero photo (`.case-study-hero`; Fallen Forest
  uses the `case-study-hero-contain` variant) and a gallery of 2–3 photos
  (`.case-study-gallery`, a 1.2fr / 0.8fr grid).
- The photos are named one by one as plain `<img src="/images/our-work/…">`
  from `public/images/our-work/`: 16 files. 10 are used on this page:

  | Case study | Hero | Gallery, in page order |
  | --- | --- | --- |
  | Fallen Forest | `A002-05` | `A002-02`, `A002-01` |
  | Orinoco | `A003-06` | `A003-01`, `A003-03`, `A003-04` |
  | Borneo Understory | `A004-01` | `A004-02`, `A004-03` |

  `A001-01` is used only on the home page; `A002-03`, `A002-04`, `A002-06`,
  `A003-02` and `A003-05` are unused spares. No optimization, no lazy
  loading. With 3 gallery photos, Orinoco's third photo already wraps into
  the wide column with an empty cell next to it.
- The home page (`Index.astro`, "Our work" section) shows 4 of these files
  directly: `A002-01` (a Fallen Forest gallery photo, **not** its hero),
  `A003-06` (Orinoco's hero), `A004-01` (Borneo's hero) and `A001-01`.
- Alt text: one text per project for the hero (`work.projectN.image.alt`)
  and one shared text for all its gallery photos
  (`work.projectN.gallery.alt`), in both languages.
- None of the current files contain EXIF/GPS metadata.

#### User workflow

1. The owner copies a photo from Google Drive into the aquarium's folder,
   e.g. `src/content/work/fallen-forest/`.
2. The dev server or build prepares it, exactly like journal photos.
3. The page shows the photos in natural file-name order: the **first is the
   hero**, the others form the gallery. To change the hero, the owner
   renames a file so it sorts first (e.g. puts `1-` in front).
4. Spare photos go into an `extra/` subfolder, which is ignored.
5. The owner runs `/describe-photos work/<aquarium>`. Claude looks at the
   photos and writes an alt text per photo in Dutch and English into that
   folder's `alt.yml`.

#### Functional requirements

1. **One folder per aquarium:** `src/content/work/<aquarium>/`, named like
   the journal's aquarium folders so each aquarium has one name across the
   site: `fallen-forest`, `orinoco`, `borneo-understory`.
2. **Photo rules** (shared with the journal via `src/lib/photo-files.ts`):
   only non-hidden `.jpg` files directly in the folder, natural order.
   The first photo is the hero; all following photos are the gallery
   (see decision 2 for a limit).
3. **Preparation:** `prepare-photos.ts` also processes photos directly in
   `src/content/work/<aquarium>/` (HEIC and any extension case → `.jpg`,
   ≤ 2400px, no metadata). Subfolders are ignored.
4. **Pre-commit hook:** also checks staged photos under `src/content/work/`.
5. **Rendering:** hero and gallery use Astro's `<Image>` with WebP and a
   `srcset` sized to their slots, set per `<Image>` with `widths`/`sizes`
   (no site-wide `image.layout`, per the decision log). The hero of the
   first case study loads eagerly with `fetchpriority="high"`, like the
   journal cover; all other photos load lazily. §4 is updated to allow this.
6. **Layout:** the hero keeps its current look (including Fallen Forest's
   "contain" variant). The gallery grid works for any number of photos:
   rows of two, the first photo of each row wider, like today.
7. **Alt text per photo:** each work folder may hold an `alt.yml` with a
   Dutch and an English text per file name. A photo without its own text
   falls back to today's per-project texts in `ui.ts`
   (`work.projectN.image.alt` for the hero, `work.projectN.gallery.alt` for
   the gallery), so a new photo never has an empty alt.
8. **An aquarium folder without photos:** that case study shows no hero and
   no gallery. The page component (which knows the case-study → folder
   mapping) logs a build warning naming the folder.
9. **Home page:** see decision 4.

#### Data / content model

- New folders `src/content/work/<aquarium>/` holding the photos and an
  optional `alt.yml`:

  ```yaml
  "01-A002-05.jpg":
    nl: "Het hele Fallen Forest-aquarium van voren"
    en: "The whole Fallen Forest aquarium from the front"
  ```

  `alt.yml` is read as a small content collection (`workAlt`, glob
  `*/alt.yml`, base `src/content/work`, keyed by folder name) with a schema,
  so `astro check` catches a malformed file. Keys are file names; a key
  whose photo no longer exists is ignored by the page and cleaned up by
  `/describe-photos`.
- The mapping from each case study to its folder is one constant in
  `OurWork.astro` (project 1 → `fallen-forest`, etc.).
- Migration: the 10 used files move into the folders, renamed with a
  number prefix so the current order stays (e.g. `01-A002-05.jpg` as the
  hero, then `02-A002-02.jpg`, `03-A002-01.jpg`). The 5 spares go into
  their folder's `extra/`. `public/images/our-work/` keeps only what the
  home page still needs (decision 4).

#### Architecture

- `src/lib/photo-files.ts`: reuse `isShownPhotoFile` and `naturalCompare`;
  add a small helper that splits a list into hero + gallery (no 3-photo
  cap, no `cover` rule).
- New `src/lib/work.ts` (or a function in an existing lib file): finds a
  folder's photos with `import.meta.glob` over
  `src/content/work/*/*.jpg`, like `getEntryPhotos`.
- `src/integrations/prepare-photos.ts`: today it assumes the journal
  everywhere (one hard-coded root, a fixed folder depth, a `*/*/*` watch
  pattern, the 3-photo warning). Generalize it to one list of photo roots,
  each with its folder depth and whether the 3-photo warning applies
  (journal: yes, work: no), driving the full pass, the watcher and the path
  check. No second copy of the pipeline. The journal behaviour doesn't
  change.
- `OurWork.astro`: replace the 10 hard-coded `<img>` tags with the helper
  and `<Image>`; `global.css` only if the gallery grid needs a tweak for
  more photos.
- `src/content.config.ts`: the `workAlt` collection described above.
- `.claude/commands/describe-photos.md`: also accepts `work/<aquarium>`.
  In that mode it describes every shown photo in the folder (hero and
  gallery, no 3-photo limit) and writes `alt.yml`, with the same rules for
  keeping, carrying over and removing texts as for journal entries.
- `.git/hooks/pre-commit` (local): add `src/content/work/` to the check.
- `.gitignore`: add the temp/backup file patterns for `src/content/work/`.
- `src/content/work/` holds only the small `workAlt` collection (the
  `alt.yml` files); the journal loaders use `base: ./src/content/journal`,
  so there is no clash.
- Docs: `ARCHITECTURE.md` §6 (Our Work moves from the `public/` system to
  the prepared-photo system), `SPEC.md` §3.3.6 and §4, and a decision-log
  entry in `PLAN.md` closing the open backlog item about Our Work images.

#### Security implications

These are photos of clients' homes, so removing the metadata (GPS) matters
even more than for the journal. The same preparation and the same
pre-commit check apply.

#### Error handling

Same as the journal (§3.3.8): a photo that can't be prepared is logged and
left as it was; the hook blocks committing it. An empty folder gives a
warning (requirement 8).

#### Acceptance criteria

1. After the migration, each case study shows the same photos in the same
   order as in the table under "Current state" (checked in `dist/` by the
   start of the generated file names, e.g. `01-A002-05.`).
2. No `/images/our-work/` path is left in `OurWork.astro`.
3. A photo dropped into `src/content/work/<aquarium>/` appears in that
   gallery without a code change; a photo in `extra/` doesn't.
4. Renaming a photo so it sorts first makes it the hero.
5. Hero and gallery images have a WebP `srcset`; only the first hero is
   eager (with `fetchpriority="high"`), the rest lazy; all have non-empty
   alt text, taken from `alt.yml` where present and from `ui.ts` otherwise,
   in the page's language.
6. `/describe-photos work/<aquarium>` writes an `alt.yml` with a Dutch and
   an English text for every shown photo in that folder, and `astro check`
   still passes.
7. A HEIC or a JPEG with GPS dropped into a work folder ends up as a `.jpg`
   without metadata; the hook blocks committing an unprepared work photo.
8. `npx astro check` 0 errors, `npm run build` succeeds, both languages.

#### Decisions (approved 2026-09-26)

1. Location: `src/content/work/<aquarium>/`, separate from the journal.
2. Gallery: no limit; every photo after the hero is shown.
3. Alt text: per photo in an optional `alt.yml` per folder, written by
   `/describe-photos work/<aquarium>`, falling back to the per-project texts
   in `ui.ts`.
4. Home page: its three project photos follow each folder's hero; `A001-01`
   stays a fixed file. For Fallen Forest the home page then shows the hero
   `A002-05` instead of `A002-01`.
5. Folder names: `fallen-forest`, `orinoco`, `borneo-understory`.

### 3.8 Easier navigation on long pages

Status: APPROVED (2026-09-26), implemented 2026-09-26. "Current state" below
describes the situation before this change.

#### Objectives

1. Navigation is always one small gesture away, on every page, without
   permanently covering content.
2. A visitor on a long page can get back to the top in one tap.
3. On Our Work, a visitor can jump straight to any of the three case
   studies.
4. The navigation works well on phones.

#### Non-goals

- No section menu or scroll-position dots on the home page (it's read top to
  bottom as one story).
- No reading progress bar.
- No new pages, links or wording in the menu itself: the same four pages
  and NL/EN as today.
- No new colours, fonts or dependencies; no UI framework.

#### Current state

- `src/components/Header.astro` renders the logo, four page links and the
  NL · EN switcher. Its CSS (`.site-header` / `.page-header` in
  `global.css`) is `position: absolute` at the top, so it scrolls away with
  the page. The home page uses the white `site` variant over the hero photo
  (`.hero` is at least 100vh tall); all other pages use the dark `page`
  variant on the page background. Pages leave room for it with their own top
  padding (e.g. `.page-intro`: 220px, 170px on phones).
- Below 800px the header gets a smaller font and gap; below 550px the links
  wrap into a narrow column. There is no menu button.
- The home page has 9 sections; Our Work has three long case studies with
  no ids to link to. Existing anchors: the home intro (id from `ui.ts`) and
  `#contact`.
- `html { scroll-behavior: smooth; }` is set globally, without a
  reduced-motion exception. The only JavaScript on the site is the journal
  filter. Every page uses `Layout.astro` and `Header.astro`.

#### User workflow (visitor)

1. Scrolling down, the header slides out of view. Scrolling up a little, it
   slides back. Once it no longer sits over a photo, it has the page's
   background colour, so it stays readable. At the very top of each page it
   looks exactly as today.
2. After scrolling about one and a half screens, a small "back to top"
   button appears at the bottom right. Tapping it scrolls smoothly to the
   top.
3. On Our Work, under the intro, a short line with the three case-study
   names jumps to each one; the heading lands just below the header.
4. On a phone or tablet (≤ 800px), the header shows the logo and a "Menu"
   button. It opens a panel below the header with the four pages and NL/EN;
   Esc, the button, a tap outside, or following a link closes it.

#### Functional requirements

1. **One header height.** A custom property `--header-height` (desktop and
   ≤ 800px values) is used by the header itself and by
   `html { scroll-padding-top }`, so anchors land below the header.
2. **Header comes back on scroll up (all pages).** The header is
   `position: fixed` (like today it is out of the page flow, so no layout
   changes). It hides after scrolling down more than `--header-height` and
   reappears on any upward scroll of more than a few pixels (to avoid
   flicker). Within the first `--header-height` of the page it is always
   visible, transparent, as today.
3. **Solid background once off the photo.** A visible header gets the
   `--background` colour, dark text and a thin `--border` line as soon as it
   no longer overlaps a photo: on the home page when the hero has scrolled
   out from under it, on all other pages once scrolled past
   `--header-height`. Over the home hero it stays transparent with white
   text.
4. **Keyboard focus.** The header doesn't hide while something in it has
   keyboard focus or the mobile menu is open.
5. **Back to top (all pages).** A link to `#top` (the top of the page) with
   the accessible name "Naar boven" / "Back to top", rendered once from
   `Layout.astro`. A few lines of script show it after scrolling more than
   1.5 × the viewport height; otherwise it's hidden and not focusable.
   Because it's a normal link, it follows `scroll-behavior`, including the
   reduced-motion rule.
6. **Our Work jump links.** Under the Our Work intro, a small `<nav>`
   (labelled "Projecten op deze pagina" / "Projects on this page") with three
   links to the case studies (text: see decision 3). Each case study
   `<article>` gets a stable id in both languages: `fallen-forest`,
   `orinoco`, `borneo-understory` (the folder names in `WORK_FOLDERS`).
7. **Mobile menu (≤ 800px, see decision 4).** A disclosure pattern, not a
   modal: a "Menu" button (`aria-expanded`, `aria-controls`) toggles a panel
   below the header with the four page links and NL/EN. Esc closes it and
   returns focus to the button; so do a tap outside, the button, or a link.
   No focus trap and no scroll lock. Above 800px nothing changes compared to
   today, apart from requirements 1–4.
8. **Without JavaScript.** The page links only move into the panel when
   the script has run (it adds a class to `<html>`). Without JavaScript the
   header shows the links as today (it stays at the top of the page, like
   now), the back-to-top link stays hidden, and the jump links work.
9. **Reduced motion.** With `prefers-reduced-motion: reduce`, the header and
   panel appear and disappear without sliding, and `scroll-behavior` is
   `auto`, so back-to-top and the jump links are instant.
10. **Both languages.** New texts are keys in both blocks of
    `src/i18n/ui.ts`: `nav.menu` ("Menu"), `nav.backToTop` ("Naar boven" /
    "Back to top"), `work.jump.label` ("Projecten op deze pagina" /
    "Projects on this page").

#### Data / content model

No content changes. The three new `ui.ts` keys above, an `id="top"` target
at the top of `Layout.astro`, and three ids on the Our Work articles.

#### Architecture

- `src/components/Header.astro`: the menu button and panel markup, and one
  small `<script>` (Astro bundles it once per page) for the scroll
  behaviour (a passive scroll listener throttled with
  `requestAnimationFrame`, toggling classes on the header; the hero check on
  the home page) and the menu (toggle, Esc, tap outside, close on link).
- `src/components/BackToTop.astro`: the `#top` link and its few lines of
  script, rendered once in `src/layouts/Layout.astro` (which also gets the
  `id="top"` target).
- `src/styles/global.css`: `--header-height`, the fixed header and its
  states (hidden / visible / solid), the mobile panel, the back-to-top
  link, `scroll-padding-top`, and a `prefers-reduced-motion` block.
- `src/components/pages/OurWork.astro`: the article ids and the jump-link
  `<nav>`, styled like the existing small uppercase labels.
- `src/i18n/ui.ts`: the three new keys.
- Plain JavaScript and CSS; no dependencies. The journal filter script is
  unaffected.

#### Security implications

None: no new data, services or external requests.

#### Error handling

- No JavaScript: see requirement 8.
- Very short pages: the back-to-top link never appears.
- Resizing across 800px with the menu open: the panel closes, so the desktop
  header is never left in a mobile state.

#### Acceptance criteria

1. In the built HTML of every page, the header contains the four page links,
   NL/EN and (hidden above 800px) the Menu button with `aria-expanded` and
   `aria-controls`; `global.css` defines `--header-height` and uses it for
   `scroll-padding-top`.
2. In the browser (manual, desktop): at scroll position 0 the header is
   transparent (white text on the home page); after scrolling down more than
   `--header-height` it is hidden; after a small scroll up it is visible
   with the `--background` colour and dark text. On the home page it stays
   transparent while the hero is still under it.
3. The back-to-top link has the accessible name in the page's language, is
   hidden at the top and visible after 1.5 screens, and brings the page to
   scroll position 0 (manual).
4. `/our-work` and `/en/our-work` contain a `<nav>` with the translated
   label and links to `#fallen-forest`, `#orinoco` and
   `#borneo-understory`; those ids exist; after following one, the target
   article's top is at least `--header-height` below the top of the window
   (manual).
5. At ≤ 800px (manual, including keyboard only): the header shows the logo
   and "Menu"; the panel opens and closes with the button, Esc (focus back
   on the button), a tap outside and a link; `aria-expanded` follows.
6. With reduced motion on, nothing slides and scrolling is instant (manual).
7. With JavaScript disabled, all page links are visible and clickable at
   every width (manual).
8. All new texts exist in both languages in `ui.ts`; `npx astro check`
   reports 0 errors and `npm run build` succeeds.

#### Decisions (approved 2026-09-26)

1. Mobile menu: a panel that drops down below the header, full width; a
   simple disclosure, no focus trap or scroll lock.
2. Back to top: a small round button with an arrow (↑), `--text` on
   `--background` with a `--border` edge.
3. Jump links: the existing eyebrows (`work.projectN.eyebrow`, e.g.
   "01 — Fallen Forest"); no new wording.
4. The Menu button applies from 800px down (the existing breakpoint),
   tablets included.

### 3.9 Website improvements (high-level roadmap)

Status: APPROVED (2026-09-26)

A high-level spec for five improvements found after the navigation work.
Each item gets its own detailed spec (§3.10 onwards, via `/spec`) and plan
when it is its turn; this section only fixes the scope and the order. The
queue and each item's status are kept in `PLAN.md` ("Improvement queue").

#### 0. Prerequisite: how the site goes live (question for the owner)

There is no hosting or deploy configuration in the repository.
`astro.config.mjs` names `site: https://microcosmos-atelier.com`. Before
items 1 and 3 we need to know where the site is hosted and how a change
goes live (e.g. a host that builds on every push to GitHub, or a manual
upload of `dist/`). This decides how the contact form can be tested for
real, and which URL is canonical.

#### 1. Contact form: reliable and private

Done (2026-09-27), see §3.10. The "Why" below describes the situation
before it.

- **Why:** for a business site this is the most important page. Today the
  form posts to `formsubmit.co` with the owner's Gmail address in the page
  source (easy for spam bots to harvest), FormSubmit's CAPTCHA is turned off
  (`_captcha=false`) and there is no honeypot field. Whether enquiries
  actually arrive has never been checked in this project.
- **Scope:** an enquiry sent from the live site arrives, in both languages;
  the email address no longer appears in the form; basic spam protection;
  a clear confirmation page after sending, in the visitor's language.
  Detailed spec: §3.10, which moves the form from FormSubmit to Netlify
  Forms (owner decision, 2026-09-26).
- **Not in scope:** a custom mail backend.

#### 2. Home and about page images: fast

Done (2026-09-27), see §3.11. The "Why" below describes the situation
before it.

- **Why:** the hero photo, the four inspiration photos and the about photos
  are still unoptimised files in `public/images/` (about 5 MB; the four
  inspiration photos about 0.9 MB each), plus `A001-01.jpeg` in the home
  "Our work" grid. The hero is the first thing a visitor sees.
- **Scope:** these photos use the same prepared-photo system as the journal
  and Our Work (web masters without metadata, WebP `srcset` sized to their
  slot, lazy loading below the fold, the hero loading first with high
  priority), with the same look.
- **Detailed spec:** §3.11 (one site photo folder, `src/content/site/`,
  prepared like Our Work; owner decision 2026-09-27).

#### 3. SEO basics for a bilingual site

- **Why:** `Layout.astro` only sets a title and a description.
- **Scope:** `hreflang` links between each NL and EN page (plus
  `x-default`); a canonical URL per page; Open Graph and Twitter card tags
  (title, description, a share image per page, falling back to a default)
  so links shared on WhatsApp or LinkedIn show a photo; the sitemap listing
  both language versions of each page; a `robots.txt` pointing at the
  sitemap. The Google Search Console verification file stays.
- **Depends on:** item 0 (the canonical domain).
- **Detailed spec:** §3.12. Done (2026-09-27); the "Why" above describes
  the situation before it.

#### 4. Review and audit of the untouched code

- **Why:** everything built since the journal work was reviewed phase by
  phase, but the older parts never were: the home, about and contact pages,
  and the older part of `global.css` (about 2000 lines).
- **Scope:** an independent `reviewer` pass over those files, plus a
  Lighthouse check (performance, accessibility, best practices, SEO) of the
  main pages on phone and desktop. The output is a findings list; fixes
  become their own small specs, not part of this item.
- **Order:** after items 1–3, so the audit sees the improved site.
- **Detailed spec:** §3.13 (approved 2026-09-27).

#### 5. Owner checks still open (not a spec)

Browser checks that were accepted at commit and are still worth doing once,
ideally on an iPhone: the menu closes on a tap outside; the back-to-top
button doesn't cover the contact form's submit button; a real iPhone HEIC
photo is prepared correctly; replacing a journal photo updates the page
(`PLAN.md`, journal plan Phase 8). Tracked in the queue as an owner task.

#### Order

0 → 1 → 2 → 3 → 4, with 5 whenever convenient. Items 1–3 are independent in
code, so the order can change on the owner's request, except that 3 needs
0.

### 3.10 Contact form: reliable and private

Status: APPROVED (2026-09-26), implemented 2026-09-27. "Current state" below
describes the situation before this change.

Item 1 of the improvement queue (§3.9). Replaces §3.5's "submission
handling is out of scope".

#### Current state

- One form on the site: `Contact.astro`, used by `/contact` and
  `/en/contact`. It posts to `https://formsubmit.co/Kasper.Masschaele@gmail.com`,
  a free third-party relay, so the owner's Gmail address is in the page
  source three times: the form action, and the `href` and text of a visible
  `mailto:` link above the form.
- `_captcha=false` turns FormSubmit's spam check off; there is no honeypot.
- After sending, `_next` sends the visitor back to the same, empty contact
  page, without any confirmation that the message was sent.
- Fields: name, email, project type (optional select), message; the
  `_subject` is translated.
- The site is hosted on Netlify (`ARCHITECTURE.md` §1), where form
  detection is already switched on. Netlify's Node version isn't pinned.
- Enquiries do arrive today: the owner has received a few through FormSubmit.

#### Objectives

1. Every enquiry sent from the live site reaches the owner's inbox, in
   both languages, and the owner can answer it with a normal reply.
2. The visitor gets a clear confirmation, in their language, that the
   message was sent.
3. The form no longer exposes the owner's email address to bots, and
   catches the most common automated spam without bothering real visitors.
4. Visitors know what their details are used for.

#### Non-goals

- A mail server, serverless function or database of our own.
- A CAPTCHA or other puzzle for visitors.
- A dedicated address on the site's own domain (e.g.
  `hallo@microcosmos-atelier.com`). Worth considering later; noted for the
  backlog.
- New form fields, a new form design, or copy changes beyond the new
  confirmation and privacy texts.
- Deleting data FormSubmit may hold from earlier submissions.

#### User workflow

Visitor:

1. Opens `/contact` (or `/en/contact`), fills in the form and presses
   "Verstuur aanvraag" / "Send enquiry".
2. Lands on a confirmation page in the same language, which thanks them,
   says a reply usually follows by email, and links back to the site.

Owner:

1. Receives an email per enquiry in the chosen inbox, with the visitor's
   name, email, project type, message and the language they used.
2. Replies from the mail client; the reply goes to the visitor.
3. Can also see all submissions (and any caught as spam) in the Netlify
   dashboard under Forms.

#### Functional requirements

1. The contact form is handled by Netlify Forms (see Unresolved decisions,
   D1) instead of FormSubmit. Nothing on the site posts to `formsubmit.co`
   any more.
2. The form's HTML contains no email address. The address that receives
   the notifications is set in the Netlify dashboard, not in the code.
3. The form has a honeypot field: hidden from people (visually and for
   screen readers, and skipped by the keyboard), and a submission that
   fills it in is dropped as spam. Netlify's own spam filtering stays on.
4. A submission records which language the visitor used (NL or EN), so
   the owner can reply in that language.
5. The notification email's subject is the existing translated
   `contact.form.subject` text (both languages contain "Microcosmos
   Atelier").
6. Replying to the notification email goes to the visitor's address (the
   email field keeps `name="email"`).
7. After a successful submission the visitor lands on a confirmation page:
   `/contact/thanks` for Dutch, `/en/contact/thanks` for English (D3).
   Its copy is in `ui.ts` in both languages and it uses the normal layout
   (header, footer, back-to-top).
8. The confirmation pages are not indexed by search engines (`noindex`)
   and are not in the sitemap.
9. The existing fields, labels, `required` rules and look stay as they are.
   The form keeps working without JavaScript (a plain form post).
10. The contact page has one short sentence near the send button about how
   the details are used (D4), in both languages.
11. The visible `mailto:` link above the form is removed (D2): the page
    shows no email address at all.
12. The Node version Netlify builds with is fixed in the repository, so a
    change of Netlify's default can't break a build. (Proposed to the owner
    during §3.9 item 0; small, and the same deploy is tested here anyway.)
13. `SPEC.md` §3.5 and `ARCHITECTURE.md` describe the new form handling
    and where the owner finds submissions and notification settings.

#### Data / content model

- New `ui.ts` keys in `nl` and `en` for the confirmation page (meta title,
  heading, text, link back) and the privacy sentence. `contact.form.subject`
  is kept and becomes the notification's subject.
- Two new thin route files for the confirmation page, following the
  `pages/` → `components/pages/` pattern.
- Submissions (name, email, project type, message, language) are stored
  by Netlify under the site's Forms tab until the owner deletes them.
- No content collections change.

#### Architecture

- Changes: `Contact.astro` (form attributes and hidden fields, honeypot,
  privacy sentence, D2), `ui.ts`, a new confirmation page component with its
  two routes (`src/pages/contact/thanks.astro` and
  `src/pages/en/contact/thanks.astro`), `Layout.astro` (an optional
  `noindex` prop that outputs `<meta name="robots" content="noindex">`; it
  can't do this today), the sitemap config in `astro.config.mjs` (a
  `filter` that leaves out the confirmation pages), a Node version file,
  and the docs.
- Form markup (the one form, rendered on both language pages):
  - one form name for both languages, `contact` (D6), with the same fields
    on both pages, `data-netlify="true"` and a hidden `form-name` field;
  - Netlify's honeypot: `netlify-honeypot="bot-field"` plus a `bot-field`
    input inside a wrapper hidden with `display: none` or the `hidden`
    attribute (hidden from sight, screen readers and Tab in one go);
  - a hidden `language` field (`nl` / `en`) and a hidden `subject` field
    with the translated `contact.form.subject`;
  - `action` = the confirmation page in the current language, via
    `getRelativeLocaleUrl` (`/contact/thanks/`, `/en/contact/thanks/`);
  - the FormSubmit fields `_subject`, `_captcha`, `_next`, the `nextUrl`
    constant and its comment are removed.
- To verify during implementation: that two pages sharing one form name
  register as one form in Netlify; that Netlify uses the `subject` field as
  the email subject and `email` as Reply-To; that Netlify reads the Node
  version file. The delivery test (acceptance 5) confirms all of them.
- §3.9 item 3 (SEO) will rework the same `<head>`; it must keep the
  confirmation pages out of hreflang/canonical handling.
- Netlify Forms works on static HTML: Netlify finds the form in the built
  `dist/` pages at deploy time. That fits §4 "static output"; no adapter or
  server code is added.
- Owner steps in the Netlify dashboard (not code): add an email
  notification for the form to the chosen inbox; after the first deploy,
  check that the form shows up under Forms.

#### Security implications

- **Data ownership and privacy:** visitors' personal details (name, email,
  message) move from FormSubmit to Netlify, which already hosts the site.
  They are stored in the Netlify account until deleted. This is a change
  of processor and needs the owner's approval. The privacy sentence (FR 9)
  tells visitors what the data is for.
- **Address exposure:** neither the form nor the page reveals the address
  any more (D2).
- **Spam:** honeypot plus Netlify's filter. Enquiries flagged as spam
  don't send an email, so a real enquiry could end up only in the
  dashboard's spam list (see Error handling).
- **Cost:** Netlify limits form submissions per plan. The owner checks the
  limit of their plan in the dashboard (Usage / Billing); for a small
  studio's enquiries this is expected to be far below it.
- No secrets are added to the repository.

#### Error handling

- Missing required fields or an invalid email: the browser's own
  validation stops the submission, as now.
- A submission Netlify can't process (e.g. the form wasn't detected in a
  deploy): Netlify shows its own error page. The delivery test (acceptance)
  catches this after each change to the form.
- A real enquiry flagged as spam: visible in Netlify under Forms → spam
  submissions, where the owner can mark it as not spam. `ARCHITECTURE.md`
  tells the owner to check it now and then.
- Local development: `astro dev` has no Netlify, so submitting locally
  doesn't deliver anything. Only the live site (or a Netlify deploy
  preview) can be tested for delivery.

#### Acceptance criteria

1. `npx astro check` has 0 errors and `npm run build` succeeds.
2. In `dist/contact/index.html` and `dist/en/contact/index.html`, the
   `<form>` has `name="contact"`, `data-netlify="true"`,
   `netlify-honeypot="bot-field"` with a hidden `bot-field` input, a
   `form-name` field, `language` = `nl` / `en`, the translated `subject`,
   and `action="/contact/thanks/"` / `action="/en/contact/thanks/"`; there
   is no email address anywhere on either contact page.
3. `grep -ri formsubmit dist/ src/` finds nothing.
4. `dist/contact/thanks/index.html` and `dist/en/contact/thanks/index.html`
   exist and have `<meta name="robots" content="noindex">`;
   `grep -l contact/thanks dist/sitemap*.xml` finds nothing. No other page
   has a robots meta.
5. Manual (owner, after deploy): one test enquiry from `/contact` and one
   from `/en/contact` each land on the confirmation page in the right
   language, and arrive as an email in the chosen inbox with the
   translated subject and the right language; a reply to that email is
   addressed to the test sender.
6. Manual: the form's look is unchanged on phone and desktop (the page
   itself is shorter, because the `mailto:` link is gone, D2); the
   honeypot field isn't visible and isn't reached with Tab; with
   JavaScript switched off the form still submits.
7. The privacy sentence key exists in both `nl` and `en` in `ui.ts`, and
   its text appears in both built contact pages.
8. The Node version file exists and the Netlify deploy log shows that
   version.
9. `SPEC.md` §3.5 points to this section, and `ARCHITECTURE.md` says where
   the owner finds submissions, spam and notification settings.

#### Decisions (owner, 2026-09-26)

- **D1. Form service:** Netlify Forms. This changes §3.9 item 1, which
  said "FormSubmit alias" with another form service as a non-goal; §3.9 is
  updated on approval.
- **D2. Visible email address:** the `mailto:` link above the form is
  removed; visitors contact the owner through the form. (First decided as
  "keep"; changed by the owner on 2026-09-27 during Phase 3.) An address on
  the site's own domain is a backlog idea.
- **D3. Confirmation page:** `/contact/thanks` and `/en/contact/thanks`.
- **D4. Privacy sentence:** "Je gegevens gebruik ik alleen om je aanvraag
  te beantwoorden." / "I only use your details to reply to your enquiry."
- **D5. Receiving inbox:** Kasper.Masschaele@gmail.com, set in the Netlify
  dashboard.
- **D6. Form name:** one form, `contact`, with a `language` field.
- **D7. Retention:** the owner deletes submissions older than about a year
  in the Netlify dashboard (a habit, not code).
- **Data processor:** the owner agrees that submissions are stored by
  Netlify instead of passing through FormSubmit.

- **D8. Netlify plan limit:** the owner is on Netlify's free tier and the
  dashboard shows no form limit. Accepted: a small studio's enquiries are
  expected to stay far below any limit; Netlify's usage page is the place
  to look if submissions ever stop arriving.

### 3.11 Home and about page photos: fast

Status: APPROVED (2026-09-27), implemented 2026-09-27. "Current state" below
describes the situation before this change.

Item 2 of the improvement queue (§3.9).

#### Current state

- Eight photos are plain files in `public/images/`, shown with plain `<img>`
  tags: no `srcset`, no WebP, no `width`/`height` attributes and no lazy
  loading (the browser fetches all of them at once).
  - Home (`Index.astro`): the hero `hero/A002-3.jpeg` (1500×2000, 630 KB),
    four inspiration cards `microcosmos/*.jpg` (1408×768, 0.86–0.96 MB
    each), the fourth "Our work" tile `our-work/A001-01.jpeg` (1500×2000,
    250 KB) and the about photo `about/about.jpeg` (640×640, 71 KB).
  - About (`About.astro`): `about/about-02.jpeg` (1200×1600, 650 KB), at the
    top of the page.
  - The home page alone loads about 4.6 MB of photos.
- Two files in `public/images/` aren't used anywhere: `MCA-logo.jpeg` and
  `hero/WhatsApp Image 2026-08-18 at 13.36.11.jpeg`.
- None of the ten files has EXIF, XMP or IPTC metadata (checked
  2026-09-27).
- The three other "Our work" tiles on the home page already use `<Image>`
  from `astro:assets` (§3.7), as do the journal and Our Work pages. Photo
  preparation (`prepare-photos.ts`) covers `src/content/journal/` and
  `src/content/work/`; the local pre-commit hook checks the same two
  folders.

#### Objectives

1. The home page and the about page load much less image data, so they
   appear faster, especially on phones.
2. The hero is the first photo the browser fetches; photos further down
   only load when the visitor scrolls towards them.
3. The page doesn't jump while photos load.
4. The site looks exactly the same.
5. Replacing one of these photos later is as easy as for Our Work (any
   format, straight from Google Drive) and can't leak GPS data.

#### Non-goals

- Choosing other photos, new crops or a new layout (e.g. a landscape hero
  for wide screens).
- A folder per photo slot, or more than one photo per slot.
- Alt text changes (the hard-coded "Kasper Masschaele" alt is for the
  review in §3.9 item 4).
- Favicons and any Open Graph share image (§3.9 item 3).

#### User workflow

Visitor: opens the home or about page and sees the same page as before,
sooner; photos lower on the page appear as they scroll.

Owner, replacing one of these photos (D1 c):

1. Deletes the old photo from the site photo folder (e.g. `hero.jpg`).
2. Copies the new photo from Google Drive into that folder and names it
   like the old one without the extension (e.g. `hero.HEIC`, `hero.png` or
   `hero.jpg`). It should have the same orientation and roughly the same
   proportions as the old one, because the crop stays the same.
3. The dev server (or the next build) turns it into `hero.jpg`: at most
   2400px, all metadata (GPS) removed, exactly like Our Work photos.
4. Checks the page on the dev server and commits.

#### Functional requirements

1. The eight photos move out of `public/images/` into one site photo folder
   `src/content/site/` (D1, D3), with fixed names, and are rendered with
   `<Image>` from `astro:assets`, like the journal and Our Work photos.
2. The site photo folder is a photo root for preparation, like the journal
   and Our Work folders: a photo dropped into it (JPEG, PNG, WebP, HEIC,
   any extension case) becomes `<name>.jpg` with all metadata removed.
   Files in its subfolders are ignored.
3. The pre-commit hook also checks the site photo folder (must be `.jpg`,
   no EXIF/XMP/IPTC), and its message fits all three folders.
4. Each photo is served as WebP in several widths (`srcset`) with a `sizes`
   that reflects the width it is actually drawn at, after `object-fit:
   cover` cropping (the portrait hero on a portrait phone is drawn wider
   than the screen; the 1.83:1 inspiration photos are drawn wider than
   their 4:3 box), so a phone doesn't download a desktop-sized file and a
   large screen doesn't get a blurry one.
5. Each rendered `<img>` has `width` and `height`, so its space is reserved
   before it loads.
6. The home hero and the about page photo (the first photo on each page)
   load eagerly with high priority; all other photos load lazily.
7. Crops, aspect ratios (inspiration cards 4:3, the home about photo 4:5),
   hover effects and positions stay as they are on phone, tablet and
   desktop, in both languages.
8. No page refers to `/images/...` any more; the eight moved files are
   removed from `public/images/`, and so are the two unused files (D2).
9. A missing photo in the site photo folder fails the build with a message
   naming the missing file, instead of a broken image on the live site.
10. Docs: `SPEC.md` §4 (the eager-loading exceptions include the home hero
    and the about photo; the "every such image" rule covers the site photo
    folder), `ARCHITECTURE.md` §5 (the fixed fourth tile) and §6 (image
    systems), and `README.md` (folder tree and how to replace a site
    photo, with the file names).

#### Data / content model

- One site photo folder (D3) with eight fixed names, e.g. `hero.jpg`,
  `inspiration-jungle.jpg`, `inspiration-amazon.jpg`,
  `inspiration-blackwater.jpg`, `inspiration-custom.jpg`,
  `work-extra.jpg`, `about-home.jpg`, `about-page.jpg`. The final names
  are fixed in the plan and listed in the README. The current `.jpeg` files
  are renamed to `.jpg` when moved, so preparation leaves them as they are.
- No content collection, frontmatter, URL or `ui.ts` change.
- `.gitignore` ignores the folder's preparation temp files, as for the
  other two photo roots.

#### Architecture

- `prepare-photos.ts`: one more entry in `PHOTO_ROOTS` for the site photo
  folder (photos directly in the folder, no "more than 3" warning). The
  existing code already supports a root whose photos sit directly in it.
  The dev server must be restarted after this change.
- `Index.astro` (hero, four cards, the fourth work tile, the about photo)
  and `About.astro` (the page photo) render the photos with `<Image>`,
  reusing the existing pattern (`widths`, `sizes`, `format="webp"`, and
  `loading="eager"` + `fetchpriority="high"` as in `OurWork.astro`).
- `global.css`: `.microcosmos-card img` and `.about-image img` set a
  width and an `aspect-ratio` but no `height`; once `<Image>` adds `width`
  and `height` attributes, the browser would use the attribute height and
  ignore the aspect ratio. They get `height: auto` so the 4:3 and 4:5 boxes
  stay. (`.hero-image`, `.work-grid img` and `.about-page-image img`
  already work with the attributes.)
- The local pre-commit hook (not in the repository) gets the third folder.
- Astro doesn't upscale: widths above the source are dropped (the hero
  tops out at its 1500px source, as today). The build writes only the WebP
  versions to `dist/_astro/`; the WebP files carry no metadata.
- `ARCHITECTURE.md` §6's "two image systems" becomes one: all photos are
  prepared and optimised; `public/` keeps only the favicons and the Search
  Console file (`public/images/` is gone).
- To verify in the plan: that a folder under `src/content/` without a
  content collection causes no Astro warning (the work folder already
  works this way).

#### Security implications

- Photos in git must not carry GPS data. Today's files have none;
  preparation removes it from replacements automatically, and the hook
  refuses anything that slips through.
- No new services, secrets or data.

#### Error handling

- A missing or misnamed photo: the build fails with a message naming the
  expected file (FR 9).
- A new photo dropped without deleting the old one gets the name
  `hero-2.jpg` (preparation never overwrites); the page keeps showing the
  old photo. The README says to delete the old file first.
- A photo sharp can't read: preparation logs an error and leaves the file;
  the hook refuses to commit it (as for Our Work).
- A replacement with other proportions: the build passes and the crop
  changes. The README asks for the same orientation and proportions.

#### Acceptance criteria

1. `npx astro check` 0 errors; `npm run build` succeeds.
2. `grep -rl '/images/' dist --include='*.html'` finds nothing, and none of
   the eight photos is left in `public/images/`.
3. In `dist/index.html`, `dist/about/index.html` and the `/en` versions,
   every photo `<img>` has `srcset`, `sizes`, `width` and `height`, and
   points to WebP files in `/_astro/`.
4. Only the home hero and the about page photo have `loading="eager"` and
   `fetchpriority="high"`; every other photo on those pages has
   `loading="lazy"`.
5. Every WebP referenced by `dist/index.html` is at most 400 KB. At a
   390×844 viewport with device pixel ratio 3 (browser dev tools), the home
   page downloads at most 400 KB of photos before scrolling (D4). The
   phase report lists the numbers.
6. At 1280px and 390px wide, the inspiration cards stay 4:3 and the home
   about photo 4:5 (compare their size before and after).
7. Manual (owner): the home and about pages look the same as before on
   phone and desktop, in NL and EN.
8. Preparation: a HEIC or PNG test photo dropped into the site photo folder
   becomes a `.jpg` without EXIF while the dev server runs (test file then
   deleted, not committed).
9. Hook: a staged JPEG with EXIF in the site photo folder is refused with a
   message naming the file (then unstaged and deleted).
10. Removing one photo from the folder makes `npm run build` fail with a
    message naming it (then restored).
11. The docs in FR 10 are updated.

#### Decisions (owner, 2026-09-27)

- **D1. How these photos are kept:** (c) one site photo folder with fixed
  names, prepared automatically like Our Work.
- **D2. The two unused files:** both are deleted (`MCA-logo.jpeg` and
  `hero/WhatsApp Image 2026-08-18 at 13.36.11.jpeg`); they stay in git
  history, and the photo in Google Drive.
- **D3. Folder:** `src/content/site/`.
- **D4. Photo budget:** at most 400 KB of photos before scrolling on a
  phone.

### 3.12 SEO basics for a bilingual site

Status: APPROVED (2026-09-27), implemented 2026-09-27. "Current state" below
describes the situation before this change.

Item 3 of the improvement queue (§3.9).

#### Current state

- `Layout.astro`'s `<head>` has `<html lang>`, a title, a meta description,
  the favicons and, on the two contact thank-you pages only, a robots
  `noindex` (§3.10). There is no canonical URL, no link between the NL and
  EN version of a page (`hreflang`), and no Open Graph or Twitter tags, so
  a link shared on WhatsApp or LinkedIn shows no photo and whatever text the
  platform guesses.
- Every page sets its own title and description (`ui.ts`; a journal entry
  uses its title and `summary`).
- Pages come in pairs: `/x` (NL) and `/en/x` (EN), for home, Our Work,
  about, contact, the journal list and each journal entry. A journal entry
  may exist in only one language (§3.3: a missing `nl.md` or `en.md` means
  no page); today all six entries have both.
- The sitemap (`@astrojs/sitemap`) lists all 22 real pages, both languages,
  without linking the language versions; it leaves out the thank-you pages
  and Astro's redirect pages for the old journal URLs. URLs end in `/`.
- There is no `robots.txt`. The Search Console verification file is in
  `public/`.
- The live address is `https://microcosmos-atelier.com` (`site` in
  `astro.config.mjs`; Netlify primary domain). `www.` already redirects
  there (301); `microcosmos-atelier.netlify.app` serves the same site
  without a redirect. Netlify redirects `/about` to `/about/`.
- Astro's redirect pages for the old journal URLs are `noindex` and carry a
  canonical to the new URL, without the trailing slash.
- The header's language switch works out the page path inline
  (`Header.astro`); there's no shared helper.

#### Objectives

1. Search engines know which pages are the NL and EN versions of each
   other and show the right language to the right searcher.
2. Each page has one official address, so the Netlify address, a missing
   slash or a tracking parameter don't split a page into duplicates.
3. A link shared on WhatsApp, LinkedIn, Facebook and similar shows the page
   title, a short description and a photo.
4. Search engines find the sitemap on their own, with both languages
   linked in it.

#### Non-goals

- Structured data (JSON-LD, e.g. a LocalBusiness block).
- New titles or descriptions, keyword work or copywriting.
- A 404 page, analytics, or Search Console settings.
- Redirecting the Netlify address to the main domain (a hosting setting;
  the canonical covers it). `www` already redirects.
- Real 301 redirects for the old journal URLs (they stay Astro's
  `noindex` redirect pages).
- Fixing the language switch for a journal entry that exists in only one
  language (it links to a page that doesn't exist); noted as a follow-up.

#### User workflow

Visitor: shares a page link in WhatsApp or LinkedIn and sees a card with
the page's photo, title and description.

Owner:

1. Nothing changes when adding pages or journal entries: the tags follow
   automatically from each page's title, description and photos.
2. Once, after the deploy: in Google Search Console, submit
   `https://microcosmos-atelier.com/sitemap-index.xml` (if not already
   there). Optional: check a link in LinkedIn's Post Inspector.

#### Functional requirements

1. **Canonical:** every indexable page has
   `<link rel="canonical">` with its full address on
   `https://microcosmos-atelier.com`, with a trailing slash (matching the
   sitemap), without query string.
2. **Language links:** every indexable page whose other-language version
   exists links to both versions with `<link rel="alternate" hreflang="nl">`
   and `hreflang="en"`, plus `hreflang="x-default"` pointing to the Dutch
   version. A page without an other-language version (a journal entry in
   one language only) gets no language links at all, like in the sitemap.
   Canonical, language links and `og:url` are built from the same page
   path, so they match the sitemap in both dev and build.
3. **Share tags (Open Graph):** every indexable page has `og:title`,
   `og:description`, `og:url` (the canonical), `og:site_name`
   ("Microcosmos Atelier"), `og:type` (`article` for journal entries,
   `website` otherwise), `og:locale` for the page's language (D2) and the
   other language as `og:locale:alternate`, and `og:image` with its width,
   height and alt text. `og:image:alt` is the alt text the page already
   uses for that photo (journal: `coverAlt`, else the photo's `photoAlt`,
   else its fallback; Our Work: its `alt.yml` text; home and the default:
   `home.hero.imageAlt`; about: its existing alt). `og:image:width` and
   `height` are the real size of the generated file.
4. **Twitter/X card:** `twitter:card` = `summary_large_image`; it reuses
   the Open Graph title, description and image.
5. **Share image per page** (absolute URL, a JPEG generated at build time
   from the prepared photos, format and crop per D1):
   - home: the hero (`site/hero.jpg`);
   - about: `site/about-page.jpg`;
   - Our Work: the first case study hero that exists, else the default;
   - a journal entry: its cover, or else its first photo, or else the
     default;
   - every other page (journal list, contact): the default (D3).
6. **Thank-you pages** keep `noindex` and get no canonical, language links
   or share tags.
7. **Sitemap:** each URL whose other-language version exists lists both
   versions (`@astrojs/sitemap`'s `i18n` option with `nl` and `en`, the
   same values as the HTML); the thank-you pages stay out. The sitemap has
   no `x-default` (the plugin doesn't write it; accepted, the HTML has it).
8. **`robots.txt`** at `/robots.txt`: allows all crawlers and names the
   sitemap (`https://microcosmos-atelier.com/sitemap-index.xml`).
9. **Redirect targets** for the old journal URLs end in `/`, so their
   canonical matches the real page address (D4).
10. Nothing visible on the pages changes.
11. Docs: `SPEC.md` §4 (SEO), `ARCHITECTURE.md` (where the head tags come
    from and how a page passes its share image), and a note in `PHOTOS.md`
    that a page's photo is also its share image.

#### Data / content model

- No new content fields: the share image comes from photos that already
  exist; title and description from what pages already pass.
- `Layout.astro` takes an optional share image and page type from each
  page component; pages that pass nothing get the default.
- New file `public/robots.txt`.
- New `ui.ts` keys only if the default image needs its own alt text (it
  can reuse `home.hero.imageAlt`).

#### Architecture

- `src/i18n/utils.ts`: one helper for "this page's path without the
  language prefix", moved out of `Header.astro`; the header and the layout
  both use it. Absolute addresses via `getAbsoluteLocaleUrl` from
  `astro:i18n` (adds `site` and the trailing slash).
- `Layout.astro`: writes the canonical, language links and share tags. It
  takes optional props: share image (with alt), page type, and whether the
  other language exists (default: yes).
- `src/lib/journal.ts`: a helper that says whether an entry exists in the
  other language (journal.ts is the only place that knows the folder
  layout); `JournalEntry.astro` passes the answer to the layout.
- Share images: made with Astro's image tools at build time
  (`getImage` from `astro:assets`), from the same source photos, as JPEG
  (D1); written to `dist/_astro/` like the other images. No new
  dependency.
- `astro.config.mjs`: the sitemap's `i18n` option (the filter for the
  thank-you pages stays, and runs before the pairing), and a trailing `/`
  on the redirect targets.
- Page components (`Index`, `About`, `OurWork`, `JournalEntry`) pass their
  share image; the others pass nothing.
- Redirect pages generated by Astro already carry their own canonical and
  `noindex`; unchanged.

#### Security implications

- None: public metadata only; no secrets, services or personal data. The
  share images are the photos already on the pages (prepared, no GPS).

#### Error handling

- A journal entry without photos: uses the default share image.
- A page photo smaller than 1200×630 isn't used for the link preview (it
  would not be enlarged); the default share image is used instead, so the
  size tags are always true. Today every source is large enough (prepared
  photos are up to 2400px). (Changed by the owner on 2026-09-27, during
  Phase 2.)
- A page without a description would give an empty `og:description`; all
  pages have one today. The build doesn't fail on this.
- If a platform shows an old preview after a change, that's its cache
  (e.g. LinkedIn's Post Inspector refreshes it); not a site error.

#### Acceptance criteria

1. `npx astro check` 0 errors; `npm run build` succeeds.
2. For every page in the sitemap: exactly one canonical, equal to its
   sitemap URL. For every page whose other-language version exists:
   `hreflang` links for `nl`, `en` and `x-default` that all point to pages
   that exist in `dist/`, its own language among them. (Checked with a
   one-off script over `dist/`, reported in the phase; not committed, as
   there is no test suite.)
3. Every page in the sitemap has `og:title`, `og:description`, `og:url`
   (= canonical), `og:site_name`, `og:type`, `og:locale`, `og:image`
   (absolute `https://microcosmos-atelier.com/_astro/…` URL of a JPEG that
   exists in `dist/`, with `og:image:width`/`height`/`alt`) and
   `twitter:card`.
4. Home, about, Our Work and one journal entry use their own photo as
   `og:image`; the journal list and contact use the default.
5. The thank-you pages have `noindex` and none of the tags above.
6. `dist/sitemap-0.xml` has `xhtml:link` alternates for `nl` and `en` on
   each URL (all six journal entries exist in both languages today) and
   still no `contact/thanks`.
7. The redirect pages' canonical ends in `/`.
8. `dist/robots.txt` exists with `Allow: /` and the sitemap line.
9. A temporary one-language journal entry (test, not committed) gets no
   language links and isn't paired in the sitemap.
10. The built pages look the same (no visible change; spot check on the dev
   server).
11. Manual, after deploy: sharing the home page and a journal entry link in
   WhatsApp (or LinkedIn Post Inspector) shows the photo, title and
   description.
12. The docs in FR 11 are updated.

#### Decisions (owner, 2026-09-27)

- **D1. Share image format:** JPEG cropped to 1200×630 (centered); the
  owner checks the home and one journal preview after deploy.
- **D2. `og:locale`:** `nl_BE` for Dutch, `en_GB` for English.
- **D3. Default share image:** the home hero (`site/hero.jpg`).
- **D4. Redirect targets:** the eight old journal redirects get a trailing
  `/`.

### 3.13 Review and audit of the older code

Status: APPROVED (2026-09-27)

Item 4 of the improvement queue (§3.9).

#### Current state

- Since the journal work (§3.3), every change was reviewed phase by phase
  by the `reviewer` agent. Code from before that, or only partly touched
  since, never had a full independent review:
  - `src/components/pages/Index.astro` (323 lines; only the photos, the
    work grid and the head props were reviewed),
  - `src/components/pages/About.astro` (91 lines; only the photo),
  - `src/components/pages/Contact.astro` (105 lines; only the form
    handling),
  - `src/components/Footer.astro` (11 lines),
  - `src/styles/global.css` (2,200 lines; only the header, menu,
    back-to-top, contact-form additions and a few photo rules),
  - `src/i18n/ui.ts` (704 lines of copy; checked per key when added),
  - `src/content.config.ts` (81 lines).
- Known items already noted along the way: `z` from `astro:content` is
  deprecated (`astro check` hints); the about photos' alt text
  "Kasper Masschaele" is hard-coded instead of in `ui.ts`; the header's
  language switch links to a missing page for a journal entry in one
  language only; one overlong line in `SPEC.md` §4.
- There is no Lighthouse or accessibility measurement of the site yet.
  There is no test suite or linter (AGENTS.md).

#### Objectives

1. Know what's wrong or fragile in the code that was never reviewed:
   bugs, accessibility problems, dead or duplicated CSS, copy that differs
   between languages, and anything that breaks the site's own rules
   (AGENTS.md, SPEC §4).
2. Know how the live site scores on performance, accessibility, best
   practices and SEO, on phone and desktop, and what the main causes of
   lost points are.
3. One prioritised list of findings, so the owner can pick what to fix,
   one small change at a time.

#### Non-goals

- Fixing anything as part of this item. Each fix (or small group of fixes)
  becomes its own change afterwards: a small change for something trivial,
  a spec and plan for anything larger (AGENTS.md).
- A redesign, new features, or copywriting.
- Re-reviewing code that was already reviewed phase by phase (journal,
  Our Work, navigation, contact form handling, photos, SEO), except where
  Lighthouse points at it.
- Adding a test suite, a linter or a permanent audit tool to the project.
- Automated HTML validation against an outside service.

#### User workflow

Owner:

1. Approves this spec and the plan.
2. Reads the findings list (in `PLAN.md`) with the Lighthouse scores.
3. Picks which findings to fix and in what order; each becomes its own
   change, through the usual workflow.

Visitor: nothing changes.

#### Functional requirements

1. **Code review:** the `reviewer` agent reviews the files listed under
   "Current state" as a whole (not a diff), against SPEC, ARCHITECTURE,
   AGENTS.md and good practice for a static bilingual site. Focus: bugs,
   accessibility (headings, landmarks, alt text, links and buttons,
   focus, contrast in CSS), dead or duplicated CSS, CSS rules that no
   longer match any element, hard-coded copy, NL/EN copy that differs in
   meaning or is missing, fragile code.
2. **Lighthouse:** performance, accessibility, best practices and SEO on
   the live site for six page types (home, Our Work, about, contact,
   journal list, one journal entry), in Dutch, on a phone profile and a
   desktop profile; plus the English home page as a spot check. Record
   the scores and the main audits that lose points.
3. **Findings list:** a new section in `PLAN.md`, "Audit findings
   (2026-09-xx)", with every finding from FR 1 and FR 2 plus the known
   items above, each with: severity (CRITICAL / IMPORTANT / MINOR), file
   and line or page, what's wrong, the suggested fix and a rough size
   (small / medium). Duplicates merged.
4. The Lighthouse scores table is part of that section, with the date and
   the commit that was live.
5. The queue (item 4) links to the findings list, and each finding the
   owner chooses to fix is added to the queue as its own item.

#### Data / content model

- New section in `PLAN.md` (findings and scores). No code, content or URL
  changes.

#### Architecture

- No code changes.
- Lighthouse runs once, as a temporary tool (`npx lighthouse`, D1) with
  the Chrome already installed; it is not added to `package.json`. Its
  raw reports stay in the scratchpad, not in the repository.

#### Security implications

- Lighthouse only reads the public live site. The temporary tool is
  downloaded from npm for the run and not installed into the project.

#### Error handling

- If Lighthouse can't run (download blocked, Chrome problem), the owner
  runs the same pages in PageSpeed Insights (pagespeed.web.dev) and shares
  the scores; the rest of the audit continues.
- Lighthouse scores vary a few points between runs: performance is run
  three times per page and profile and the median is recorded.

#### Acceptance criteria

1. `PLAN.md` has an "Audit findings" section with a scores table (six
   page types in NL on phone and desktop, plus the EN home page, four
   categories each), the date and the live commit.
2. Every file under "Current state" was reviewed; the section says so per
   file, with its findings or "no findings".
3. Every finding has severity, location, description, suggested fix and
   size; the four known items are included.
4. No code, content or configuration changed (`git diff` touches only
   `PLAN.md` and, for the status, `SPEC.md`).
5. The queue links to the findings list.

#### Decisions (owner, 2026-09-27)

- **D1. Lighthouse:** Claude runs it once with `npx lighthouse` on the live
  site; PageSpeed Insights by the owner is the fallback.
- **D2. Findings:** a section in `PLAN.md`, next to the queue.
- **D3. Language scope:** NL for all six page types, plus the EN home page.

### 3.14 Visitor statistics and a privacy page

Status: APPROVED (2026-09-28), implemented 2026-09-28. "Current state" below
describes the situation before this change.

#### Current state

- The site has no visitor statistics. The only data on visits are Google
  Search Console (search queries, clicks) and, once verified, the Google
  Business Profile.
- There are no cookies and no third-party scripts on the pages.
- The contact form stores enquiries in Netlify (§3.10); the only privacy
  text is one sentence under the form. There is no privacy page. The
  footer only shows "© <year> Microcosmos Atelier".

#### Objectives

1. The owner sees how many people visit, which pages they read, where they
   come from (search, social, other sites), their country and device.
2. The owner's own visits don't count: not during development on the Mac,
   not on Netlify preview addresses, and not from the owner's own phone and
   computer on the live site.
3. No cookies, no personal data, no cookie banner; visitors can read what
   is collected on a short privacy page.

#### Non-goals

- Identifying individual visitors, tracking across sites, or cookies.
- Paid analytics (Plausible, Netlify Analytics) or Google Analytics.
- A cookie banner (not needed without cookies).
- Moving the domain's DNS to Cloudflare.

#### User workflow

Owner, once:

1. Creates a free Cloudflare account, adds `microcosmos-atelier.com` under
   Web Analytics with the JavaScript snippet (no DNS change) and gives
   Claude the snippet (its token is public by design).
2. After the deploy, opens `https://microcosmos-atelier.com/?nietmeten` on
   each own browser (phone, computer); a short message confirms that this
   device is no longer counted. `?welmeten` turns counting back on.

Owner, later: reads the numbers in the Cloudflare dashboard (Web
Analytics), and search queries in Search Console.

Visitor: sees no difference; the footer has a "Privacy" link to a short
page in their language.

#### Functional requirements

1. **Counter:** Cloudflare Web Analytics' script is loaded on every page,
   deferred, only when all of these hold: it's the production build, the
   page is served from `microcosmos-atelier.com`, and this browser hasn't
   opted out (FR 2).
2. **Own devices:** opening any page with `?nietmeten` stores an opt-out
   in this browser (local storage) and shows a short confirmation;
   `?welmeten` removes it and confirms. With the opt-out, the counter
   script is never requested. Works without cookies.
3. **No counting elsewhere:** `astro dev`, `npm run preview`, the
   `*.netlify.app` addresses and deploy previews never load the script.
4. **Privacy page:** `/privacy` and `/en/privacy`, in the site's layout,
   with: what the contact form collects, where it's stored (Netlify) and
   for how long (about a year); what the statistics collect (anonymous,
   aggregated, no cookies, Cloudflare); no cookies on the site; how to ask
   a question (via the contact form). Copy in `ui.ts` (or a component) in
   both languages; the owner checks the wording.
5. **Footer:** a "Privacy" link to that page, in both languages. The
   privacy sentence under the contact form links to it too.
6. The privacy page is indexable and in the sitemap, with the usual
   canonical, language links and share tags (§3.12).
7. Nothing else visible changes; performance stays as it is (the script is
   small and deferred).
8. Docs: `ARCHITECTURE.md` (where the counter lives and its conditions),
   `SPEC.md` §4, and a short owner note (in `PHOTOS.md`'s style, or
   `README.md`) on `?nietmeten` and where to read the numbers.

#### Data / content model

- One Cloudflare Web Analytics token in the code (public; received from the
  owner 2026-09-28: `56e1996d4ddb46c48bbac1574c166164`).
- Browser local storage key for the opt-out (per browser, on the owner's
  devices only).
- New `ui.ts` keys for the privacy page, the footer link and the opt-out
  messages; new routes `/privacy` and `/en/privacy`.

#### Architecture

- A small `Analytics.astro` component rendered by `Layout.astro`: in the
  production build it outputs a tiny inline script that checks the
  hostname and the opt-out, handles `?nietmeten` / `?welmeten`, and only
  then adds Cloudflare's beacon script. No dependency.
- `Privacy.astro` page component with two thin route files (the
  `pages/` → `components/pages/` pattern); link in `Footer.astro` and in
  the contact form's privacy sentence.

#### Security implications

- **Data:** Cloudflare receives anonymous page-view data (page, referrer,
  country, device, performance) without cookies or identifiers. This is a
  new processor for visitor data; the owner approves it (decision below).
- The token is public by design; no secrets in the repository.
- The inline script contains no user input; the opt-out only reads its own
  query parameters.

#### Error handling

- If Cloudflare's script is blocked (ad blockers) or unreachable, the page
  works normally; those visits simply aren't counted.
- If local storage is unavailable (private browsing), `?nietmeten` can't
  be remembered; the confirmation says so.

#### Acceptance criteria

1. `npx astro check` 0 errors; `npm run build` succeeds.
2. The built pages contain the analytics snippet with the token; on
   `astro dev` and `npm run preview` no request goes to
   `static.cloudflareinsights.com` (checked in a headless browser).
3. On the live site: a normal visit requests the beacon; after
   `?nietmeten` it doesn't (also after reloading and on other pages);
   after `?welmeten` it does again. The confirmation appears in the page's
   language.
4. `microcosmos-atelier.netlify.app` doesn't request the beacon.
5. `/privacy` and `/en/privacy` exist, linked from the footer on every page
   and from the contact form; in the sitemap; Lighthouse accessibility
   100.
6. Manual (owner): a visit from someone else's device shows up in the
   Cloudflare dashboard within minutes; the owner's own devices, after
   `?nietmeten`, don't.
7. Screenshots unchanged apart from the footer link.

#### Decisions (owner, 2026-09-28)

- **D1. Tool:** Cloudflare Web Analytics (free, no cookies).
- **D2. Own devices:** a `?nietmeten` / `?welmeten` switch per browser.
- **D3. Privacy text:** a short privacy page linked from the footer (and
  the contact form), instead of only a sentence under the form.

### 3.15 Frequently asked questions (FAQ)

Status: APPROVED (2026-09-28)

#### Current state

- The home page describes the process in four steps (`home.process*`); the
  contact page invites a first conversation. Practical questions (cost,
  duration, region, maintenance, holidays, energy) aren't answered
  anywhere.
- No prices are published; the owner doesn't want to state amounts,
  because they depend strongly on materials and complexity.

#### Objectives

1. Answer the questions potential clients ask before they get in touch,
   so they know what to expect and contact the owner with more
   confidence.
2. Give Google a page that matches what people search for ("wat kost een
   aquarium op maat", "aquarium onderhoud", region names).

#### Non-goals

- Prices or price ranges.
- FAQ structured data (`FAQPage`): Google only shows FAQ rich results for a
  few authoritative sites since 2023, so it adds nothing here.
- Changing the home page's process section or the contact form.

#### User workflow

Visitor: opens the FAQ from the contact page, the home page or the footer,
reads the questions and opens the ones that interest them; each answer can
lead to the contact form.

Owner: edits the questions and answers later in `ui.ts` (both languages).

#### Functional requirements

1. A page `/faq` and `/en/faq` ("Veelgestelde vragen" / "Frequently asked
   questions") in the site's layout, with the questions under "Content"
   below, in both languages.
2. Each question can be opened and closed; all answers are in the HTML
   and readable without JavaScript and by search engines (native
   `<details>`/`<summary>`, D3).
3. Links to the FAQ: from the contact page (near the introduction), from
   the home page (near the process section) and in the footer (next to
   "Privacy"). Not in the main menu (D2).
4. At the end of the page, a short invitation to get in touch with a link
   to the contact form.
5. The page is indexable, in the sitemap, with canonical, language links
   and share tags (§3.12); accessibility 100.
6. Copy in `ui.ts` in both languages, in the site's voice (first person,
   as in the contact copy); the owner approves the final wording.

#### Content (draft answers, from the owner's notes of 2026-09-28)

1. **Wat kost een Microcosmos?** No fixed price; it depends on the size of
   the aquarium, the cabinet and technology (filter, light, heating, CO₂
   if needed), wood and stone, plants and animals, and whether the client
   or the owner does the maintenance. A tailored proposal after a first
   conversation.
2. **Hoe verloopt een project?** First conversation, visit to the space,
   design with a high-level proposal, detailed proposal, build and
   installation, handover; maintenance afterwards if wanted. (Consistent
   with the home page's process section.)
3. **Hoe lang duurt het?** About 6 to 10 weeks when nothing in the interior
   needs to change, mostly set by the delivery of the aquarium; then the
   fish are added gradually over 2 to 3 months.
4. **In welke regio werk je?** The provinces of Antwerp, East Flanders and
   Flemish Brabant; further away on request.
5. **Is het eerste gesprek vrijblijvend?** Yes, free and without
   obligation.
6. **Hoeveel onderhoud vraagt het, en kun jij dat doen?** All maintenance
   can be done by the owner with a monthly service contract (the client
   only feeds the fish), or help on call, charged on time and materials
   ("in regie").
7. **Wat als ik op vakantie ga?** For more than a week: an automatic
   feeder, and maintenance postponed or continued depending on the
   situation and the ecosystem; a young aquarium needs more care than one
   that has run for years.
8. **Kun je mijn bestaande aquarium opnieuw inrichten?** Yes, case by
   case.
9. **Kan het met kinderen of huisdieren?** Yes, as long as nothing is put
   into the aquarium and other animals can't get into it.
10. **Hoeveel stroom verbruikt het?** Mostly depends on the room
    temperature, the water temperature the inhabitants need and the volume
    to heat; lighting and pump use little nowadays.
11. **Kan het ook zonder vissen, of als paludarium?** Yes, open to
    discussion.

#### Data / content model

- New `ui.ts` keys (`faq.*`) for the page texts and the 11 questions and
  answers, in NL and EN; new routes `/faq` and `/en/faq`.

#### Architecture

- `Faq.astro` page component with two thin route files (the `pages/` →
  `components/pages/` pattern), reusing the page header style of the
  privacy and contact pages; the questions come from one list, like the
  home page's numbered sections.
- Links added in `Contact.astro`, `Index.astro` and `Footer.astro`.
- A few CSS rules for the question list in `global.css`, in the site's
  existing style.

#### Security implications

none (static copy only).

#### Error handling

none beyond the build: a missing `ui.ts` key fails `astro check`.

#### Acceptance criteria

1. `npx astro check` 0 errors; `npm run build` succeeds.
2. `/faq` and `/en/faq` exist with all 11 questions; every answer is in
   the built HTML; the pages are in the sitemap and pass the SEO and
   share-tag checks of §3.12.
3. The questions open and close with mouse, keyboard (Enter/Space) and
   touch, also without JavaScript.
4. The FAQ is linked from the contact page, the home page and the footer,
   in both languages.
5. Lighthouse accessibility 100 on both FAQ pages.
6. The owner approves the NL and EN copy.

#### Decisions (owner, 2026-09-28)

- **D1. Place:** its own page, `/faq` and `/en/faq`.
- **D2. Main menu:** not in the menu; linked from the contact page, the
  home page and the footer.
- **D3. Form:** questions that open on click (`<details>`).
- **Voice:** first person ("ik"), like the rest of the site.

## 4. Non-functional requirements

- **Static output.** The site builds to static HTML (`astro build`) and is
  intended to be hosted as static files; do not introduce server-only
  runtime dependencies without discussing the hosting implications first.
- **Image optimization & performance.** Journal photos and covers must stay
  local files in their entry folder (see 3.3.2), Our Work photos in their
  work folder (§3.7) and the home and about photos in `src/content/site/`
  (§3.11), so Astro can optimize them at build time. Do not link directly to
  third-party file hosts (e.g. Google Drive) for these — see the
  reliability/ToS concerns noted in `PLAN.md`. Every such image must ship a
  responsive `srcset` sized to its actual display size and a modern format
  (WebP by default), must reserve its layout space via explicit
  `width`/`height` to avoid layout shift, and must be lazy-loaded unless it
  is the first above-the-fold image on the page (a journal `cover`, the
  first Our Work hero, the home hero or the about page photo), in which case
  it loads eagerly with `fetchpriority="high"`. See 3.3.5 for the full
  journal-specific spec.
- **Privacy and statistics** (§3.14). No cookies. Anonymous visitor
  statistics with Cloudflare Web Analytics, only on the live domain and not
  on the owner's opted-out browsers (`?nietmeten`); a privacy page at
  `/privacy` and `/en/privacy`. Any new data collection must be added to
  that page.
- **SEO** (§3.12). Every indexable page carries a canonical URL on
  `https://microcosmos-atelier.com` (trailing slash), `hreflang` links to
  its NL and EN version plus `x-default` (only when both exist), and Open
  Graph tags plus `twitter:card`, with a 1200×630 JPEG share image of its
  own photo (the home hero by default). `noindex` pages (the contact
  thank-you pages) get none of these. `@astrojs/sitemap` generates the
  sitemap from `site`, with the NL/EN pairs linked; `public/robots.txt`
  points to it. A Google Search Console verification file lives at
  `public/google4f41fe6a9b546641.html` — do not delete it.
- **No hard-coded copy in components where a translation exists.** Any new
  page-level string must be added to both the `nl` and `en` blocks of
  `src/i18n/ui.ts` under the same key.
- **Accessibility.** Every image (`cover`, `photos[].alt`, hero/gallery
  images) should carry meaningful `alt` text; empty `alt=""` is only
  acceptable for decorative images.

## 5. Out of scope (for now)

- A CMS or admin UI for editing content — content is authored directly as
  Markdown/Astro files by the site owner (with AI assistance).
- Automatic translation pipelines beyond the `/translate-journal` slash
  command (see `PLAN.md`).
- User accounts, comments, or any dynamic/server-rendered functionality.
