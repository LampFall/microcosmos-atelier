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
  tag); the one bit of interactivity so far (the journal tank filter) is
  plain vanilla JS in a `<script>` block.
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
`src/pages/journal/[...slug].astro` and `src/pages/en/journal/[...slug].astro`
each call `getStaticPaths()` filtered to their own language and pass the
matched `CollectionEntry<"journal">` into the shared
`components/pages/JournalEntry.astro`.

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

Only one Astro content collection exists: `journal`. It's loaded with the
`glob` loader over `src/content/journal/**/*.md`, so both `nl/` and `en/`
subfolders feed the same collection; entries are distinguished by their
`lang` frontmatter field (which must match the folder they're actually in)
and matched across languages by having the *same filename*.

Schema highlights (see the file for the authoritative version):
- `tank` — free-text string, must be identical across an entry's NL/EN pair
  and across all entries for the same physical aquarium, since it's used as
  the grouping/filter key on the journal index.
- `status` — a closed enum (`opstart | groeit | rijpt | stabiel`), rendered
  through `journal.status.*` translation keys, never shown raw.
- `cover` / `coverAlt` — optional single hero image using Astro's `image()`
  schema helper, which requires the path to resolve to a real local file
  (relative to the Markdown file) so Astro can optimize it at build time.
- `photos` — optional array of 1–3 `{ src, alt }` objects, same `image()`
  constraint as `cover`. Rendered as a gallery below the post body, with the
  **first photo shown large** and the remaining one or two shown smaller
  next to it (`.journal-gallery` CSS in `src/styles/journal.css`, using
  CSS Grid with `img:first-child` spanning both rows).

Photo files for the journal are expected under
`src/assets/journal_pics/<entry-slug>/`, referenced from frontmatter with a
relative path such as `../../../assets/journal_pics/<entry-slug>/01.jpg` —
the same relative path works from both `content/journal/nl/` and
`content/journal/en/` because they sit at the same folder depth.

The "Our Work" case studies are **not** a content collection — they're
hand-written directly in `components/pages/OurWork.astro` with plain `<img>`
tags pointing at `public/images/our-work/`. This is an inconsistency worth
noting: unlike journal photos, these images are not build-time optimized by
Astro (see `PLAN.md` for whether to unify this).

## 6. Images: two different systems in play

1. **Content-collection images** (journal `cover`/`photos`): declared with
   the `image()` Zod helper, imported as local module paths, rendered with
   `<Image>` from `astro:assets`. Astro optimizes these (resizing, format,
   `width`/`height`, lazy-loading) at build time. These files must live
   under `src/` (currently `src/assets/journal_pics/`).
2. **Public/static images** (Our Work galleries, hero images, about photos):
   plain files under `public/images/...`, referenced by absolute URL string
   (`/images/our-work/A002-01.jpeg`) in plain `<img>` tags. No optimization,
   no `astro:assets` involvement. Simpler to add (just drop a file in
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
  `var(--surface)`, `var(--border)`, `var(--accent)`) defined presumably in
  `global.css` for theming.

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
- `.claude/commands/translate-journal.md` is a custom slash command:
  `/translate-journal <path>` reads one language's journal entry and writes
  the matching counterpart in the other language, preserving all
  non-translatable fields (`tank`, `liters`, `date`, `status`, image paths).
  See `PLAN.md` for further tooling suggestions.
