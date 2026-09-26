# Microcosmos Atelier

The marketing and portfolio website for Microcosmos Atelier — living aquatic
ecosystems designed and built by Kasper Masschaele. A bilingual (NL/EN) Astro
site: home, project case studies, an about/contact section, and an ongoing
per-tank journal.

Read these before making non-trivial changes:

- **[SPEC.md](./SPEC.md)** — what the site needs to do (pages, i18n rules,
  content model, non-functional requirements).
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — how the codebase is put
  together and why (routing/i18n split, content collections, image
  handling, styling).
- **[PLAN.md](./PLAN.md)** — current status, backlog, decisions log, and
  suggestions for working with Claude Code on this repo.
- **[AGENTS.md](./AGENTS.md)** (symlinked as `CLAUDE.md`) — standing
  instructions for AI coding agents working in this repo (dev server usage,
  doc links).

## Stack

- [Astro 7](https://astro.build), static output — no server runtime, no UI
  framework installed.
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
  for sitemap generation.
- Plain hand-written CSS (no Tailwind/framework), split between
  `src/styles/global.css` (sitewide) and `src/styles/journal.css`
  (journal-only).
- Content collections (`src/content.config.ts`) for the journal; everything
  else (home, our-work, about, contact) is hand-authored Astro components.

## Project structure

```text
/
├── AGENTS.md / CLAUDE.md   # AI agent instructions (symlinked)
├── SPEC.md                 # what the site should do
├── PLAN.md                 # backlog, status, decisions
├── ARCHITECTURE.md         # how the code is structured
├── astro.config.mjs        # i18n, sitemap, photo preparation, redirects
├── public/
│   ├── favicon.ico / .svg
│   ├── google...html       # Search Console verification -- don't delete
│   └── images/             # unoptimized static images: home hero, inspiration,
│                           # about, and our-work/A001-01.jpeg (4th home "Our work" tile)
└── src/
    ├── assets/              # site-wide SVGs
    ├── components/
    │   ├── Header.astro / Footer.astro
    │   └── pages/           # the actual page implementations (see ARCHITECTURE.md #2)
    ├── content/
    │   ├── journal/<aquarium>/          # aquarium.yml + one folder per entry
    │   │   └── <entry>/                 # nl.md, en.md and the entry's photos
    │   └── work/<aquarium>/             # Our Work photos (+ alt.yml, extra/)
    ├── content.config.ts    # journal, aquariums and workAlt collection schemas
    ├── i18n/
    │   ├── ui.ts             # all translated strings, nl + en
    │   └── utils.ts          # getLangFromUrl / useTranslations
    ├── integrations/
    │   └── prepare-photos.ts # turns dropped photos into 2400px JPEGs without GPS
    ├── lib/                  # journal.ts, work.ts, photo-files.ts: the folder rules
    ├── layouts/
    │   └── Layout.astro
    ├── pages/                # thin route files, NL (default) + /en
    └── styles/
```

See `ARCHITECTURE.md` for **why** it's split this way, especially the
`pages/` vs `components/pages/` pattern and the two different image systems
in use.

## Commands

All commands run from the project root:

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `astro dev --background` | Start the dev server in the background (preferred in this repo -- see `AGENTS.md`) |
| `astro dev stop` / `status` / `logs` | Manage the background dev server |
| `npm run build` | Build the static site to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npx astro check` | Type-check `.astro` files and the content collection schema |

## Working with content

The journal is one folder per aquarium, with one folder per entry inside it
(full rules in `SPEC.md` section 3.3):

```text
src/content/journal/
  fallen-forest/
    aquarium.yml          # name: "Fallen Forest", liters: 1000
    2023-05-hardscape/
      nl.md
      en.md
      cover.jpg           # optional banner
      any-name.jpg        # up to 3 gallery photos
```

- **New entry:** create a folder `YYYY-MM-short-title` in the aquarium's
  folder and write `nl.md` (frontmatter: `title`, `date`, `status`,
  `summary`). Run `/translate-journal <aquarium>/<entry>` to generate
  `en.md`. The folder names become the URL, so settle on them before
  publishing.
- **New aquarium:** create a folder with an `aquarium.yml` (`name`,
  optionally `liters`), then add entries to it.
- **Photos:** copy up to 3 photos from Google Drive into the entry folder
  (hold Option while dragging from Drive for Desktop, so it copies instead of
  moves). Any name; JPEG, PNG, WebP and iPhone HEIC all work. The dev server
  or build turns each into a `.jpg` of at most 2400px with GPS and other
  metadata removed, replacing the dropped file; the original stays in Drive.
  The first photo in natural order (`2.jpg` before `10.jpg`, capitals before
  lowercase) is shown large, and is also the preview photo next to the entry
  in the journal list. A file named `cover` is the banner. Files in a
  subfolder (e.g. `extra/`) are ignored.
- **Alt text:** run `/describe-photos <aquarium>/<entry>` to write the photo
  descriptions in both languages (`photoAlt` and `coverAlt` in the
  frontmatter).
- **Page copy** (headings, labels, alt text) lives in `src/i18n/ui.ts`. Add
  new strings under the same key in both the `nl` and `en` blocks -- never
  hard-code copy inside a component.
- **Our Work photos** live in one folder per aquarium:
  `src/content/work/fallen-forest/`, `orinoco/`, `borneo-understory/`. Copy
  photos in exactly like journal photos (they're prepared the same way). The
  first photo in natural order is the large hero, the rest is the gallery,
  with no limit; spares go in `extra/`. The home page's "Our work" grid
  follows each folder's hero. Alt texts are in each folder's `alt.yml`; run
  `/describe-photos work/<aquarium>` to write them. The case-study text
  itself is hand-edited in `src/components/pages/OurWork.astro` and
  `src/i18n/ui.ts`.

## Learn more

- [Astro documentation](https://docs.astro.build)
- [Astro i18n guide](https://docs.astro.build/en/guides/internationalization/)
- [Astro content collections guide](https://docs.astro.build/en/guides/content-collections/)
