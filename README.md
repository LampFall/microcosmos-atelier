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
├── astro.config.mjs        # i18n config, sitemap integration
├── public/
│   ├── favicon.ico / .svg
│   ├── google...html       # Search Console verification -- don't delete
│   └── images/             # unoptimized static images (our-work, hero, about)
└── src/
    ├── assets/              # local images that go through Astro's image()
    │   └── journal_pics/    # real journal photos live here, per entry slug
    ├── components/
    │   ├── Header.astro / Footer.astro
    │   └── pages/           # the actual page implementations (see ARCHITECTURE.md #2)
    ├── content/
    │   └── journal/nl/ + journal/en/   # one .md file per entry per language
    ├── content.config.ts    # journal collection schema
    ├── i18n/
    │   ├── ui.ts             # all translated strings, nl + en
    │   └── utils.ts          # getLangFromUrl / useTranslations
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

- **Journal entries** live in `src/content/journal/{nl,en}/<slug>.md`. Every
  entry needs a matching file in both languages with the same filename and
  the same `tank` value. See `SPEC.md` section 3.3 for the frontmatter schema
  (status enum, optional `cover`, optional `photos` gallery of 1-3 images).
  Use the `/translate-journal <path>` slash command after writing one
  language's version to generate the other.
- **Journal photos** go in `src/assets/journal_pics/<entry-slug>/`, referenced
  from frontmatter with a relative path -- see `ARCHITECTURE.md` section 5.
- **Page copy** (headings, labels, alt text) lives in `src/i18n/ui.ts`. Add
  new strings under the same key in both the `nl` and `en` blocks -- never
  hard-code copy inside a component.
- **Our Work case studies** are hand-edited directly in
  `src/components/pages/OurWork.astro`, with images dropped into
  `public/images/our-work/`.

## Learn more

- [Astro documentation](https://docs.astro.build)
- [Astro i18n guide](https://docs.astro.build/en/guides/internationalization/)
- [Astro content collections guide](https://docs.astro.build/en/guides/content-collections/)
