# Architecture & Concepts

This document explains how the codebase is put together and why, based on the
code as it exists today. Read `SPEC.md` for *what* the site needs to do, and
`PLAN.md` for what's left. This document is about *how* it currently does it.

## 1. Stack

- **Astro 7**, static output (`astro build` → static HTML, no adapter/SSR).
- **`@astrojs/sitemap`** integration generates `sitemap-index.xml` at build
  time from `site` in `astro.config.mjs`.
- No UI framework (React/Vue/Svelte) is installed — every component is a
  plain `.astro` component. Don't reach for a framework component without a
  concrete need (e.g. real client-side interactivity beyond a `<script>`
  tag). The site's interactivity is three small plain-JS `<script>` blocks:
  the journal aquarium filter (`Journal.astro`), the header (`Header.astro`,
  see §3) and the back-to-top link (`BackToTop.astro`). Everything works
  without JavaScript; the scripts only enhance it.
- TypeScript is used for config/schema (`content.config.ts`, `i18n/*.ts`) via
  `@astrojs/check` for type-checking `.astro` files too.

## 2. Two-tier page structure: `pages/` vs `components/pages/`

Every real page lives in **two files**:

1. A thin route file under `src/pages/` (or `src/pages/en/`) that does
   almost nothing except import the actual page component and render it,
   e.g. `src/pages/about.astro`.
2. The actual page markup/logic under `src/components/pages/`, e.g.
   `src/components/pages/About.astro`.

This split exists **because of i18n routing**: Astro's file-based routing
needs a physical file per locale/path (`src/pages/about.astro` for `/about`
and `src/pages/en/about.astro` for `/en/about`), but the two route files
would otherwise contain 100% duplicated markup. Instead, both route files
import and render the *same* component from `components/pages/`, and that
shared component reads the current language itself via
`getLangFromUrl(Astro.url)`. Content differences between languages come
entirely from the `ui.ts` dictionary (see §4), not from having two copies of
the component.

The journal is the one place this pattern is combined with dynamic routing:
`src/pages/journal/[aquarium]/[entry].astro` and
`src/pages/en/journal/[aquarium]/[entry].astro` each call `getStaticPaths()`
with `getJournalEntries(lang)` from `src/lib/journal.ts` and pass the matched
entry into the shared `components/pages/JournalEntry.astro`. The 8 URLs from
before the aquarium/entry layout redirect to the new ones via `redirects` in
`astro.config.mjs`.

**When adding a new page**, follow this same split: create the shared
component in `components/pages/`, then one thin route file per locale that
renders it.

## 3. Routing & i18n

Configured in `astro.config.mjs`:

```js
i18n: {
  defaultLocale: 'nl',
  locales: ['nl', 'en'],
  routing: { prefixDefaultLocale: false },
}
```

- Dutch is the default and unprefixed (`/about`); English is prefixed
  (`/en/about`).
- `src/i18n/utils.ts` provides:
  - `getLangFromUrl(url)` — reads the first path segment; if it's a known
    locale (`en`) returns it, otherwise falls back to `defaultLang` (`nl`).
    This means Dutch pages are detected *by absence* of a locale prefix, not
    by an explicit `/nl/` segment.
  - `useTranslations(lang)` — returns a `t(key)` function that looks up
    `ui[lang][key]`, falling back to the Dutch value if a key is missing in
    the requested language.
- `getRelativeLocaleUrl(lang, path)` (from `astro:i18n`) is used everywhere
  links are built, so links always come out with/without the `/en` prefix
  correctly.
- The header's language switcher (`Header.astro`) strips a leading `/en` off
  the current pathname and re-adds the *other* locale via
  `getRelativeLocaleUrl`, so switching language keeps you on the equivalent
  page rather than bouncing to the homepage.

### Header and in-page navigation (`SPEC.md` §3.8)

- `Header.astro` starts with a tiny inline script that adds `has-js` to
  `<html>` before the header is drawn. Every JavaScript-dependent header
  style is scoped to `.has-js`, so without JavaScript the header is exactly
  the old one: `position: absolute` at the top, all links visible.
- With JavaScript, the header is `position: fixed` and its script toggles
  two classes while scrolling (passive listener, throttled with
  `requestAnimationFrame`): `is-hidden` when scrolling down past the header,
  removed again on a small scroll up; `is-solid` (page background, dark text,
  thin border) once the header no longer sits over a photo — on the home page
  when the `.hero` has scrolled out from under it, elsewhere past the
  header's height. It never hides while it has keyboard focus
  (`:focus-visible`) or the menu is open.
- At ≤ 800px a "Menu" button (`aria-expanded`, `aria-controls`) toggles the
  links into a full-width panel below the header: a disclosure, not a modal.
  Esc (focus back to the button), a tap outside (`pointerdown`, for iOS), a
  link, or growing past 800px close it.
- `--header-height` (80px, 88px at ≤ 800px) sets the header row's height and
  `html { scroll-padding-top }`, so anchors land below the header.
- `BackToTop.astro`, rendered once from `Layout.astro` (`<body id="top">`),
  is a link to `#top` shown after 1.5 screens; it follows `scroll-behavior`.
- Our Work links to its case studies with `#fallen-forest`, `#orinoco` and
  `#borneo-understory` (the `WORK_FOLDERS` names).
- `prefers-reduced-motion: reduce` turns off the header and back-to-top
  transitions and sets `scroll-behavior: auto`.

## 4. Translation dictionary (`src/i18n/ui.ts`)

All page copy — headings, body text, button labels, image alt text, form
labels — lives in one big object keyed by `nl` and `en`, both containing the
exact same set of dotted keys (e.g. `home.hero.title`, `work.project1.spec.fish`,
`journal.status.opstart`). Components never hard-code copy; they call
`t("some.key")`.

Conventions to preserve:
- Keys are namespaced by page (`home.*`, `work.*`, `about.*`, `contact.*`,
  `journal.*`) then by section/field.
- Enum-like values with a fixed set of internal keys (journal `status`) are
  *not* stored as translatable strings themselves — only their **labels**
  are (`journal.status.opstart` etc.), so the underlying data (frontmatter,
  filtering logic) stays language-independent.
- `<br />` is used inside translated strings to control line breaks in large
  headings — this is deliberate, not a stray artifact.

## 5. Content collections (`src/content.config.ts`)

The journal is one folder per aquarium, with one folder per entry inside it
(`SPEC.md` §3.3.2):

```
src/content/journal/<aquarium>/aquarium.yml
src/content/journal/<aquarium>/<entry>/nl.md, en.md, cover.jpg, <photo>.jpg …
```

Two collections read it:
- `aquariums` — every `aquarium.yml` (`name`, `liters?`), keyed by the
  aquarium folder name. The name is the filter key on the journal index, so
  it is written once here instead of in every entry.
- `journal` — every `nl.md`/`en.md`, with id `<aquarium>/<entry>/<lang>`.
  Frontmatter: `title`, `date`, `status`, `summary?`, `photoAlt?` (file name
  → alt text), `coverAlt?`. The language, the aquarium and the photos are not
  in the frontmatter: they come from the file name, the parent folder and
  the image files in the folder.

`status` is a closed enum (`opstart | groeit | rijpt | stabiel`), rendered
through the `journal.status.*` translation keys, never shown raw.

Three modules own the folder convention; nothing else should parse an entry
id or look for journal photos itself:
- `src/lib/journal.ts` — parses entry ids, `getJournalEntries(lang)` (entries
  with their aquarium's name and liters, newest first), and
  `getEntryPhotos(aquarium, entry)`, which finds the photos with
  `import.meta.glob` over `*.jpg` directly in the entry folder.
- `src/lib/photo-files.ts` — the shared rules for which files a page shows:
  only non-hidden `.jpg` files, natural sort order, a file named `cover` (any
  case) as the cover, and the first 3 others as the gallery; for Our Work
  (`splitWorkPhotos`), the first photo as the hero and all others as the
  gallery. It has no Astro imports, so the photo preparation integration and
  `/describe-photos` use it too.
- `src/integrations/prepare-photos.ts` — see §6.

The gallery shows the **first photo large** and the other one or two smaller
next to it (`.journal-gallery` in `src/styles/journal.css`).

The journal index (`components/pages/Journal.astro`, `SPEC.md` §3.6) shows
each entry's aquarium name as a label above the title, and that same first
gallery photo (or the cover, if the entry has no gallery) as a 4:3 preview
of about 240px, cropped at build time. It calls `getEntryPhotos` per entry,
so the preview is always the photo shown large on the entry page. Entries
without photos show text only.

The "Our Work" case studies (`SPEC.md` §3.7) keep their text in `ui.ts` and
hand-written sections in `components/pages/OurWork.astro`, but their photos
come from one folder per aquarium: `src/content/work/<aquarium>/`.
- `src/lib/work.ts` owns that convention: `WORK_FOLDERS` (which folder
  belongs to which case study, used by Our Work and the home page),
  `getWorkPhotos(folder)` (`import.meta.glob` over `*.jpg` directly in the
  folder; the first photo in natural order is the hero, the rest the
  gallery; `extra/` is never shown) and `getWorkAltTexts(folder)`.
- The `workAlt` collection reads each folder's optional `alt.yml`: a Dutch
  and an English alt text per file name. A photo without one falls back to
  the per-project texts in `ui.ts`. If no folder has an `alt.yml` at all,
  the build logs a harmless "No files found matching */alt.yml" warning.
- The home page's "Our work" grid shows the three folders' heroes, plus one
  fixed photo from `public/images/our-work/` (`A001-01.jpeg`).

## 6. Images: two different systems in play

1. **Prepared photos** (journal cover and gallery, Our Work heroes and
   galleries): local files in an entry folder or a work folder, found with
   `import.meta.glob` and rendered with `<Image>` from `astro:assets`. They
   pass through two steps:
   - **Preparation** (`src/integrations/prepare-photos.ts`, registered in
     `astro.config.mjs`). It works from one list of photo roots
     (`PHOTO_ROOTS`): the journal (`<aquarium>/<entry>/`, with the "more
     than 3 photos" warning) and Our Work (`<aquarium>/`, no limit). When
     `astro dev` or `astro build` starts, and while the dev server watches
     those folders, every photo dropped directly into a photo folder (JPEG,
     PNG, WebP or HEIC, any extension case) is turned into `<name>.jpg` (or
     `<name>-2.jpg` if that name is taken): HEIC converted with macOS
     `sips`, rotated, long edge at most 2400px, JPEG quality 85, **all
     metadata (GPS) removed**. The prepared file replaces the dropped one; the original
     stays in Google Drive. Temp files are written next to the photo (HEIC
     intermediates in the system temp folder), cleaned up after an
     interruption, and ignored by git. The watcher handles one file at a
     time, after it has finished copying. The integration runs in the Astro
     config process, so a change to `prepare-photos.ts` only takes effect
     after restarting the dev server (`astro dev stop`, then
     `astro dev --background`).
   - **Optimization** by Astro at build time: `JournalEntry.astro`,
     `Journal.astro`, `OurWork.astro` and `Index.astro` set `widths`, `sizes`
     and `format="webp"` per image, so visitors download WebP files sized to
     the layout. A journal cover and the first Our Work hero load eagerly
     with `fetchpriority="high"`; everything else loads lazily.
2. **Public/static images** (the home page hero and inspiration images, the
   about photos, and the one fixed photo `A001-01.jpeg` in the home page's
   "Our work" grid): plain files under `public/images/...`, referenced by
   absolute URL string (`/images/hero/A002-3.jpeg`) in plain `<img>` tags.
   No optimization, no `astro:assets` involvement. Simpler to add (just drop a file in
   `public/`), but no automatic responsive/format handling.

When adding new image-bearing content, decide deliberately which system
applies rather than mixing them within the same feature.

## 7. Styling

- `src/styles/global.css` holds sitewide layout/typography/component styles,
  including the shared `.case-study-gallery` grid used by Our Work.
- `src/styles/journal.css` holds journal-specific styles (ledger list,
  filters, post layout, `.journal-gallery`) and is imported directly by the
  two journal page components rather than globally — journal-only CSS
  doesn't leak into other pages' bundles.
- No CSS framework/utility system (e.g. Tailwind) is in use; styles are
  hand-written CSS with CSS custom properties (`var(--text)`, `var(--muted)`,
  `var(--surface)`, `var(--border)`, `var(--accent)`, `var(--header-height)`)
  defined in `:root` in `global.css`.
- The header, menu panel, back-to-top link and Our Work jump links
  (`.work-jump`) are styled in `global.css`; header rules that need
  JavaScript are scoped to `.has-js` (see §3).

## 8. Working with Claude Code on this repo

- `AGENTS.md` (symlinked from `CLAUDE.md`) holds the standing instructions
  loaded into every session: dev server, the commands that exist, the
  engineering workflow (spec → plan → one phase at a time → verify →
  review → commit, with the owner approving) and which agents to use.
- Workflow commands in `.claude/commands/`: `/spec`, `/plan-phases`,
  `/implement-phase`, `/review-phase`. Read-only workflow agents in
  `.claude/agents/`: `architect`, `planner`, `reviewer`, `verifier`.
- `.claude/settings.json` blocks force pushes, hard resets, branch
  deletion and reading `.env` files, and asks before commit, push and
  rebase.
- Content commands: `/translate-journal <aquarium>/<entry>` writes the
  other language's `nl.md`/`en.md` from the one that exists, keeping `date`,
  `status` and the `photoAlt` keys unchanged. `/describe-photos
  <aquarium>/<entry>` writes the alt text for a journal entry's photos in
  both languages; `/describe-photos work/<aquarium>` does the same for an Our
  Work folder, in its `alt.yml`. The optional `content-writer` agent drafts
  new copy in the site's styles.
- A local git pre-commit hook blocks unprepared journal and Our Work photos
  and runs `npx astro check` (see `AGENTS.md`, "Safeguards").
