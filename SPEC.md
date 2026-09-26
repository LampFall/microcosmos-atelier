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

- The "Our Work" galleries (`public/images/our-work/`) use plain,
  unoptimized `<img>` tags today and are **not** covered by this spec change
  — they're a separate content system (see `ARCHITECTURE.md` §6). They have
  the same underlying performance gap (full-size images, no lazy attribute
  on most of them) and would benefit from the same treatment, but migrating
  them is a separate, larger decision (moving from `public/` files to
  content-collection-managed images) that should be scoped and approved on
  its own rather than folded silently into the journal work.

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

- Each case study is currently hand-authored directly in
  `src/components/pages/OurWork.astro` (not a content collection) with a
  gallery of 2–3 plain `<img>` tags served from `public/images/our-work/`.
- Each case study lists structured specs (start date, dimensions, volume,
  filtration, lighting, substrate, CO₂, fish, other inhabitants, plants),
  translated per-language via `work.projectN.spec.*` keys in `ui.ts`.

### 3.5 Contact

- A contact form exists (see `Contact.astro`) whose submission handling is
  out of scope for this document; treat any change to how submissions are
  processed as a separate decision to confirm with the site owner.

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

## 4. Non-functional requirements

- **Static output.** The site builds to static HTML (`astro build`) and is
  intended to be hosted as static files; do not introduce server-only
  runtime dependencies without discussing the hosting implications first.
- **Image optimization & performance.** Journal photos and covers must stay
  local files in their entry folder (see 3.3.2) so Astro can
  optimize it at build time. Do not link directly to third-party file hosts
  (e.g. Google Drive) for these — see the reliability/ToS concerns noted in
  `PLAN.md`. Every such image must ship a responsive `srcset` sized to its
  actual display size and a modern format (WebP by default), must reserve
  its layout space via explicit `width`/`height` to avoid layout shift, and
  must be lazy-loaded unless it is the first above-the-fold image on the
  page (a `cover`), in which case it loads eagerly. See 3.3.5 for the full
  journal-specific spec.
- **SEO.** `@astrojs/sitemap` generates a sitemap from `astro.config.mjs`'s
  `site` URL. A Google Search Console verification file lives at
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
