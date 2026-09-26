# Plan

This is a living backlog + decision log for Microcosmos Atelier, written so a
future session (human or Claude) can pick up where things left off without
re-reading the whole chat history. Update it as work happens — check items
off, add new ones, and record decisions with a one-line "why" so they don't
get re-litigated.

## Status snapshot (2026-09-25)

- Core site (home, our work, about, contact, journal) is built in NL and EN.
- The journal uses one folder per aquarium and one folder per entry, with
  automatic photo preparation and responsive WebP images (execution plan
  below: phases 1–7 implemented, phases 8–9 open). No real photos have been
  added yet.
- Content commands: `/translate-journal` and `/describe-photos`. Workflow:
  `/spec`, `/plan-phases`, `/implement-phase`, `/review-phase`
  (see `AGENTS.md`).
- Nothing is pushed to GitHub yet; `main` is ahead of `origin/main`.

## Execution plan: journal restructuring & image performance

Status: APPROVED (2026-09-25). Phases 1–5 implemented, reviewed and fixed:
the review's 1 critical and 4 important findings in photo preparation are
fixed, and the re-review's one follow-up (safe case-only rename) too. All
tested with real files, including the dev-server live update. Stale docs
(review finding 6) are Phase 7. Phase 6 implemented and reviewed. Phase 7 implemented and reviewed. Phase 8 done except the photo-replace test and a real iPhone HEIC.

It implements
`SPEC.md` §3.3. Read that section for the *why* behind each step; this plan
only covers the *how* and *in what order*.

Suggested execution: `/implement-phase <n>`, one phase at a time, then
`/review-phase`. Check off each item as it lands so a later session can see
what's done.

### Phase 1 — Move existing content into aquarium/entry folders

| Old files (`nl/` and `en/`) | New folder |
| --- | --- |
| `2023-05-fallen-forest-hardscape.md` | `fallen-forest/2023-05-hardscape/` |
| `2023-09-fallen-forest-emers.md` | `fallen-forest/2023-09-emers/` |
| `2025-06-fallen-forest-gesloten.md` | `fallen-forest/2025-06-gesloten/` |
| `2026-08-borneo-opstart.md` | `borneo-understory/2026-08-opstart/` |

- [x] For each row, `git mv` the NL file to `<new folder>/nl.md` and the EN
      file to `<new folder>/en.md` (`git mv` keeps the file history).
- [x] Create `fallen-forest/aquarium.yml` (`name: "Fallen Forest"`,
      `liters: 1000`) and `borneo-understory/aquarium.yml`
      (`name: "Borneo Understory"`, `liters: 60`).
- [x] In all 8 files, remove `lang`, `tank`, `liters` and the placeholder
      `photos:` block. Keep `title`, `date`, `status`, `summary`.
- [x] Delete the empty `src/content/journal/nl/`, `src/content/journal/en/`
      and `src/assets/journal_pics/` folders.

### Phase 2 — Content collections and helpers

- [x] `src/content.config.ts`:
  - [x] New `aquariums` collection: glob `*/aquarium.yml`, schema
        `{ name: string, liters?: number }`. Its id is the folder name.
  - [x] `journal` collection: glob `*/*/{nl,en}.md`, schema `title`, `date`,
        `status`, `summary?`, `photoAlt?` (record of file name → string),
        `coverAlt?`. Remove `lang`, `tank`, `liters`, `cover`, `photos`.
  - [x] Rewrite the leading comment to describe the new layout.
- [x] New `src/lib/journal.ts`, the only place that knows the folder
      convention:
  - [x] Parse an entry id (`fallen-forest/2023-05-hardscape/nl`) into
        `{ aquarium, entry, lang }`.
  - [x] `getJournalEntries(lang)`: the entries for one language, with their
        aquarium's `name`/`liters` attached, newest first.
  - [x] `getEntryPhotos(entry)`: find images directly in the entry folder
        with `import.meta.glob` (eager, `.jpg/.jpeg/.png/.webp`, not in
        subfolders). Sort by file name (natural order, so `2` comes before
        `10`), split off `cover.*`, keep the first 3 as the gallery.

### Phase 3 — Routes, pages and redirects

- [x] Replace `src/pages/journal/[...slug].astro` with
      `src/pages/journal/[aquarium]/[entry].astro`, and the same under
      `src/pages/en/`. Both use `getJournalEntries(lang)` in
      `getStaticPaths`.
- [x] `Journal.astro`: link to `/journal/<aquarium>/<entry>`; the filter
      uses the name from `aquarium.yml`.
- [x] `JournalEntry.astro`: aquarium name and liters from `aquarium.yml`,
      photos and cover from `getEntryPhotos`. Alt text is
      `photoAlt[file name]`, falling back to a new `ui.ts` key
      (`journal.photoAltFallback`, e.g. "{title} — foto {n}" /
      "{title} — photo {n}") in both languages.
- [x] Check that the header's language switcher still leads to the same
      entry in the other language with the deeper URLs.
- [x] Add the 8 old URLs (4 NL + 4 EN, e.g.
      `/journal/2023-05-fallen-forest-hardscape` →
      `/journal/fallen-forest/2023-05-hardscape`) to `redirects` in
      `astro.config.mjs`, so existing links and Google results keep
      working.

### Phase 4 — Automatic photo preparation

- [x] New Astro integration `src/integrations/prepare-photos.ts`, registered
      in `astro.config.mjs`:
  - [x] Runs at the start of every `astro dev` and `astro build` (via
        `astro:config:setup`, which fires for both commands before content
        collections are read), and while the dev server runs it watches the
        journal folder for new files (via `astro:server:setup`'s
        `server.watcher`, plus `server.moduleGraph.invalidateAll()` +
        `server.ws.send({ type: 'full-reload' })` so a newly dropped photo
        shows up without a manual restart — not live-tested against a
        running dev server yet, see PLAN note below).
  - [x] Only looks at image files directly inside an entry folder
        (`src/content/journal/*/*/`), never in subfolders like `extra/` and
        never anywhere else.
  - [x] HEIC/HEIF → JPEG with macOS `sips`.
  - [x] With `sharp`: rotate according to orientation, scale down so the
        long edge is at most 2400px (never up), save as JPEG quality 85
        (mozjpeg), remove all metadata. Write to a temp file first and then
        replace the original in one step, so a crash can't leave a
        half-written photo.
  - [x] Skip photos that are already prepared (JPEG, ≤ 2400px, no
        EXIF/XMP/IPTC metadata), so a restart is fast.
  - [x] If the new `.jpg` name already exists (e.g. `a.heic` next to
        `a.jpg`), use `a-2.jpg` instead of overwriting.
  - [x] Log every prepared photo with its size before and after, and warn
        when an entry has more than 3 gallery photos, listing the extras.
- [x] Add `sharp` to `devDependencies` explicitly (pinned to `^0.35.4`,
      matching the version already resolved via Astro's own dependency).

  Verified with a throwaway `_qa-tmp` aquarium/entry (deleted afterwards,
  not committed): oversized JPEG → resized to 2400px long edge; PNG and a
  synthetic HEIC → converted to `.jpg`; a name collision (`graphic.heic` next
  to an existing `graphic.jpg`) → `graphic-2.jpg`; a 4th/5th gallery photo →
  warning listing the extras; `extra/` subfolder → ignored; re-running is a
  no-op (idempotent). Not yet verified: the live dev-server watch/reload path
  (no dev server was started for this work, per instructions — one may
  already be running externally on port 4322). A human should drop a real
  HEIC/large JPEG into an entry folder with `astro dev` running and confirm
  it appears without a restart before checking off the Phase 8 drop test.

### Phase 5 — Image performance

In `JournalEntry.astro`:

- [x] Cover: `loading="eager"` and `fetchpriority="high"`, since it's the
      first thing visible on the page. Keep a responsive `layout` so it
      still gets a `srcset`.
- [x] Gallery: generate sizes that match what's shown, about 900px for the
      large photo and about 350px for the small ones (see `.journal-gallery`
      in `journal.css`), via `widths`/`sizes` or `layout="constrained"`.
- [x] `format="webp"` on the cover and the gallery.
- [x] Gallery keeps the default `loading="lazy" decoding="async"`.
- [x] Decide while implementing whether to set a site-wide default
      (`image: { layout: 'constrained', responsiveStyles: true }` in
      `astro.config.mjs`). Decided: no site-wide default (see decision log).

### Phase 6 — `/describe-photos` slash command

- [x] `.claude/commands/describe-photos.md`, argument `<aquarium>/<entry>`:
  - [x] Looks at each photo in the entry folder and writes `photoAlt`
        (keyed by file name) into `nl.md` in Dutch and `en.md` in English,
        in the factual tone of the journal.
  - [x] Keeps alt text that is already there, unless asked to rewrite it.
        Removes keys for photos that no longer exist.
  - [x] Also writes `coverAlt` when there is a `cover.*`.
  - [x] Reports what it wrote, so the owner can check it.

### Phase 7 — Update docs and agent instructions

These all still describe the old `nl/`/`en/` + `journal_pics/` layout:

- [x] `ARCHITECTURE.md` §5 and §6.
- [x] `README.md` ("Working with content"): the drop-in workflow,
      `/describe-photos`, and how to add a new entry or aquarium.
- [x] `.claude/commands/translate-journal.md`: the counterpart is the other
      `nl.md`/`en.md` in the same folder; `tank`/`lang`/`liters` no longer
      exist; `photoAlt` keys are copied and only the values translated.
- [x] `.claude/agents/content-writer.md`: a new entry is a new
      `YYYY-MM-title` folder in the aquarium's folder; a new aquarium needs
      an `aquarium.yml`; no `tank` field anymore.
- [x] ~~`i18n-agent.md`~~: agent removed on 2026-09-25; its checks now
      live in `.claude/agents/verifier.md` (layout and NL/EN parity).
- [x] ~~`astro-agent.md`~~: agent removed on 2026-09-25.
- [x] `AGENTS.md`: mention `/describe-photos` next to `/translate-journal`.
- [x] This file: rewrite the "Agents (built)" section, which still lists the
      removed agents and says "drop photos into
      `assets/journal_pics/<slug>/`".
- [x] Also updated (not listed originally, same stale layout):
      `ARCHITECTURE.md` §2 and §8, and this file's "Status snapshot".

### Phase 8 — Verification

- [x] `npx astro check` and `npx astro build` pass.
- [x] All entries render at their new URLs in both languages; the 8 old
      URLs redirect; the aquarium filter and the language switcher work.
- [ ] Drop test with the dev server running, on one entry:
  - [x] Drop an iPhone HEIC and a large JPEG with GPS location. Both appear
        on the page without a restart and are now `.jpg`, at most 2400px;
        `mdls` or `exiftool` shows no location. *(Real photos: three 4000×3000
        phone JPEGs in `fallen-forest/2026-09-sand` were prepared live to
        2400×1800 without metadata. HEIC: tested live with a synthetic file
        on 2026-09-25; no real iPhone HEIC tested yet.)*
  - [x] Drop a 4th photo → a warning appears and 3 are shown. A photo in
        `extra/` is ignored. *(Tested with synthetic files at build time.)*
  - [ ] Replace a photo → the page shows the new one. *(Not tested yet.)*
- [x] In the built HTML: a `srcset` on the photos, `loading="eager"
      fetchpriority="high"` on the cover, `loading="lazy"` on the gallery,
      and the files in `dist/_astro/` are much smaller than the web
      masters. *(Real entry: 0.46–0.70 MB web masters → 4–86 kB WebP. Cover
      attributes checked with a synthetic cover; the real entry has none.)*
- [ ] Optional, the owner decides: install Google Drive for Desktop so
      photos can be copied straight from Finder. Not installed on this Mac
      as of 2026-09-25.

### Phase 9 — Cleanup

- [ ] `git status` shows no leftover empty folders or stray files.
- [ ] Update the Backlog section below.

## Execution plan: journal index preview

Status: APPROVED (2026-09-26)
Implements: SPEC.md §3.6

### Phase 1: Aquarium label and preview photo in the journal list
Goal: each list entry shows the aquarium name clearly and a 4:3 preview of
its first photo; entries without photos show text only.
Files: modify `src/components/pages/Journal.astro`,
`src/styles/journal.css`.
Steps:
- [x] `Journal.astro`: per entry, call `getEntryPhotos(entry.aquarium,
      entry.entrySlug)` (existing, `src/lib/journal.ts`) and take
      `gallery[0] ?? cover` as the preview.
- [x] Restructure the row: preview (if any) in its own column, then the text
      column with the aquarium label (name + liters), a meta line with date
      and status, the title link and the summary. Keep `data-tank` on the
      `<li>` so the filter script keeps working unchanged.
- [x] Render the preview with `<Image>`: `format="webp"`,
      `widths={[240, 480, 800]}`,
      `sizes="(max-width: 800px) 100vw, 240px"`, `alt=""`, default lazy
      loading. Wrap it in a link to the entry with `tabindex="-1"` and
      `aria-hidden="true"`, so the title stays the only tab stop.
- [x] `journal.css`:
  - [x] row grid with a ~240px preview column; rows without a preview use
        a single full-width column;
  - [x] preview `aspect-ratio: 4 / 3; object-fit: cover;` with the
        existing `--surface` background;
  - [x] the aquarium label in the text colour, larger than the date/status
        line; liters in the muted small style;
  - [x] ≤ 800px: preview full width above the text;
  - [x] remove the now-unused left date column style.
Validation: `npx astro check`; `npm run build`; inspect `dist/journal/index.html`
and `dist/en/journal/index.html`; view `/journal` in the dev server on
desktop width and ≤ 800px.
Acceptance criteria:
- [x] SPEC.md §3.6 criteria 1–4 and 7 met (checked in `dist/`).
- [x] The preview of `fallen-forest/2026-09-sand` is the same file as the
      large photo on its entry page (compare the source file names in the
      generated `srcset`).
- [x] Manual: mobile layout (criterion 5) and the aquarium filter
      (criterion 6). *(Approved by the owner, 2026-09-26.)*
Commit boundary: `journaallijst: duidelijk aquariumlabel en voorbeeldfoto per entry`
Risks: the filter script depends on `.journal-entry` and `data-tank`; keep
both. Older entries have no photos yet, so the list looks mixed until they
do (accepted in the spec).

### Phase 2: Docs
Goal: the docs describe the new list layout.
Files: modify `ARCHITECTURE.md` (§5, the journal paragraph), `README.md`
("Photos" bullet: the first photo is also the preview in the list).
Steps:
- [x] Update both files in a sentence or two each.
Validation: read-through against the code; `npx astro check`.
Acceptance criteria:
- [x] No doc says the list has only text or a date column.
Commit boundary: `docs: voorbeeldfoto in de journaallijst beschreven`
Risks: none identified.

### Out of scope / follow-ups
- Grouping the list per aquarium (a non-goal in the spec).
- Photos for the older entries (content, not code).

### Blocking questions
None.

## Execution plan: Our Work photos from one folder per aquarium

Status: APPROVED (2026-09-26). Phases 1–5 implemented.
Implements: SPEC.md §3.7

Notes from reading the code, which the phases below depend on:
- The pre-commit hook checks every staged photo under the root, subfolders
  included, and rejects any file that doesn't end in `.jpg`. So the 5 spares
  moved into `extra/` must be renamed from `.jpeg` to `.jpg`, or the migration
  commit is blocked. Preparation never touches `extra/`, so the spares are
  neither renamed nor downscaled automatically.
- The home page uses `A002-01`, `A003-06` and `A004-01` from
  `public/images/our-work/` (`Index.astro:176-178`). To keep it working
  between phases, Phase 2 **copies** these three into the work folders and
  leaves them in `public/`; Phase 4 removes them.
- The gallery grid already handles any number of photos as "rows of two,
  first photo wider" (`global.css` `.case-study-gallery`, `1.2fr 0.8fr`;
  `1fr` on mobile). An odd last photo leaves an empty cell, as Orinoco does
  today. No CSS change is planned.
- `<Image>` without `layout` adds no inline styles, so the existing
  `.case-study-hero img`, `.case-study-hero-contain img` and
  `.case-study-gallery img` rules keep applying.

### Phase 1: Photo preparation and the hook also cover `src/content/work/`
Goal: photos dropped directly into `src/content/work/<aquarium>/` are prepared
like journal photos, journal behaviour unchanged, and the hook blocks
unprepared work photos.
Files: modify `src/integrations/prepare-photos.ts`, `.gitignore` / modify
(local, not committed) `.git/hooks/pre-commit`
Steps:
- [x] `prepare-photos.ts`: replace the single journal root with one list of
      roots, e.g. `[{ dir: "src/content/journal/", depth: 2, warnExtras: true },
      { dir: "src/content/work/", depth: 1, warnExtras: false }]` (`depth` =
      folder levels between the root and a photo folder).
- [x] `prepareAll`: walk `depth` levels per root; per photo folder run
      `recoverInterruptedRun`, `prepareFile` per candidate, and
      `warnAboutExtraPhotos` only when `warnExtras` is set.
- [x] The path check returns the matching root (or null), requiring
      `depth + 1` segments; the watcher uses it to decide on the warning.
- [x] `server.watcher.add`: one pattern per root.
- [x] Log labels relative to `src/content/` (`journal/…`, `work/…`); rename
      the integration to `prepare-photos`; update the header comment. The
      rest of the pipeline (sharp settings, temp files, backup/restore,
      queue) stays exactly as it is.
- [x] `.gitignore`: the three temp/backup patterns for `src/content/work/**`.
- [x] `.git/hooks/pre-commit`: also check `src/content/work/`; wording
      "photos" instead of "journal photos". Outside the repo, so not part of
      the commit (mention in the report).
Validation:
- `npm run build` before and after the change, `diff -r` the two `dist/`
  copies: no differences (journal output unchanged); no `prepared` lines for
  existing journal photos.
- Throwaway `src/content/work/_qa-tmp/` (deleted afterwards): a PNG, a
  `.JPG`, 5+ photos and one in `extra/`. Build: PNG and `.JPG` become `.jpg`,
  no "more than 3" warning, `extra/` untouched. A throwaway journal entry with
  4 photos still warns.
- Restart the dev server; drop a photo into the work test folder and the
  journal test folder; `astro dev logs` shows both prepared.
- Hook: stage an unprepared `.png` under `src/content/work/_qa-tmp/`, run
  `sh .git/hooks/pre-commit`: it blocks and names the file. Unstage and
  delete the test folders.
- `npx astro check`.
Acceptance criteria:
- [x] `diff -r` of `dist/` before/after shows no differences.
- [x] A HEIC or PNG in `src/content/work/<x>/` ends up as `<name>.jpg`,
      ≤ 2400px, no EXIF/XMP/IPTC; a second build prints no `prepared` line.
- [x] `extra/` untouched; a work folder with > 3 photos gives no warning; a
      journal entry with 4 photos still warns.
- [x] The hook blocks a staged unprepared photo under `src/content/work/`.
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `foto's: voorbereiding ook voor Our Work-mappen in src/content/work`
Risks: regression in journal preparation (mitigated by the `dist/` diff and
the throwaway journal test); the watcher must not start matching journal
subfolders like `extra/` (guarded by the `depth + 1` check; test it).

### Phase 2: Move the photos into folders and switch the Our Work page to `<Image>`
Goal: Our Work shows the same 10 photos in the same order, now from
`src/content/work/<aquarium>/`, as WebP with a `srcset`, still with today's
`ui.ts` alt texts.
Files: create `src/lib/work.ts`, `src/content/work/{fallen-forest,orinoco,borneo-understory}/…`
/ modify `src/lib/photo-files.ts`, `src/components/pages/OurWork.astro` /
move 15 files out of `public/images/our-work/` (12 via `git mv`, 3 copies)
Steps:
- [x] Migration (every file gets a lowercase `.jpg`; "(copy)" = copy, because
      the home page still uses it until Phase 4; the rest `git mv`):

      | Folder | Shown (hero first) | `extra/` |
      | --- | --- | --- |
      | `fallen-forest/` | `01-A002-05.jpg`, `02-A002-02.jpg`, `03-A002-01.jpg` (copy) | `A002-03.jpg`, `A002-04.jpg`, `A002-06.jpg` |
      | `orinoco/` | `01-A003-06.jpg` (copy), `02-A003-01.jpg`, `03-A003-03.jpg`, `04-A003-04.jpg` | `A003-02.jpg`, `A003-05.jpg` |
      | `borneo-understory/` | `01-A004-01.jpg` (copy), `02-A004-02.jpg`, `03-A004-03.jpg` | none |

      `public/images/our-work/` then holds `A001-01.jpeg` plus the three
      home copies.
      *(Done 2026-09-26. Afterwards the owner removed two spares that were
      byte-identical to shown photos: `A002-03` (= `02-A002-02`) and
      `A003-05` (= `04-A003-04`). Three spares remain in `extra/`.)*
- [x] Run `npm run build` once so preparation re-encodes anything that needs
      it; commit the prepared versions.
- [x] `photo-files.ts`: add `splitWorkPhotos(fileNames)` → `{ hero?, gallery }`,
      reusing `isShownPhotoFile` and `naturalCompare`, no cap, no `cover` rule.
- [x] New `src/lib/work.ts`, modelled on `getEntryPhotos`: eager
      `import.meta.glob("../content/work/*/*.jpg")` and
      `getWorkPhotos(folder)` → `{ hero?, gallery }`. The only place that
      knows the work folder convention.
- [x] `work.ts` also exports the case-study → folder mapping (project1 →
      `fallen-forest`, project2 → `orinoco`, project3 → `borneo-understory`).
- [x] `OurWork.astro`: uses that mapping; per project `getWorkPhotos`; a build warning naming an
      empty folder. Replace the 10 `<img>` tags with `<Image format="webp">`:
      hero keeps its wrapper and Fallen Forest's contain variant, gallery
      `widths`/`sizes` per column (confirm in the dev server); only the first
      rendered hero gets `loading="eager" fetchpriority="high"`; leave out an
      empty wrapper. Alt text stays `work.projectN.image.alt` /
      `work.projectN.gallery.alt`.
Validation:
- `npx astro check`, `npm run build`; list the `/_astro/…` image names in
  document order in `dist/our-work/index.html` and `/en/`.
- Dev server: `05-test.jpg` in `orinoco/` appears as 5th gallery photo; a
  photo in `orinoco/extra/` doesn't; renaming `03-A002-01.jpg` to
  `00-A002-01.jpg` makes it the hero; revert all three.
- Temporarily empty one folder: build warning with the folder name, case
  study without hero and gallery; restore.
- Visual check on desktop and ≤ 800px: contain hero, hover zoom, gallery as
  before.
Acceptance criteria:
- [x] In `dist/our-work/index.html` (and `/en/`) the images per case study
      start, in order, with `01-A002-05.`, `02-A002-02.`, `03-A002-01.` |
      `01-A003-06.`, `02-A003-01.`, `03-A003-03.`, `04-A003-04.` |
      `01-A004-01.`, `02-A004-02.`, `03-A004-03.` (SPEC §3.7 AC 1).
- [x] `grep "/images/our-work/" src/components/pages/OurWork.astro` finds
      nothing (AC 2).
- [x] Every Our Work `<img>` has a `.webp` `srcset`, width/height and
      non-empty alt; exactly one is eager with `fetchpriority="high"` (the
      Fallen Forest hero), the rest lazy.
- [x] The drop, `extra/` and rename tests behave as described (AC 3, 4).
- [x] `git ls-files src/content/work` lists 10 shown files and 5 spares, all
      `.jpg`; the hook passes.
- [x] The home page still shows all 4 work photos (unchanged).
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `our work: foto's uit een map per aquarium, geoptimaliseerd via <Image>`
Risks: git may record delete+add instead of a rename if preparation rewrites
a file (acceptable); spares in `extra/` are committed as they are (no
metadata, hook confirms); a `.jpeg` that isn't really a JPEG would be named by
the hook.

### Phase 3: Alt text per photo (`alt.yml`) and `/describe-photos work/<aquarium>`
Goal: each Our Work photo gets its own alt text from the folder's `alt.yml`
in the page's language, falling back to `ui.ts`, and `/describe-photos` can
write that file.
Files: modify `src/content.config.ts`, `src/lib/work.ts`,
`src/components/pages/OurWork.astro`, `.claude/commands/describe-photos.md` /
create `src/content/work/{fallen-forest,orinoco,borneo-understory}/alt.yml`
Steps:
- [x] `content.config.ts`: `workAlt` collection (glob `*/alt.yml`, base
      `./src/content/work`, id = folder name like `aquariums`); schema
      `record(string, { nl: string, en: string })`.
- [x] `work.ts`: `getWorkAltTexts(folder)` → the record, or `{}`.
- [x] `OurWork.astro`: alt = `altTexts[fileName]?.[lang]`, else the `ui.ts`
      fallback.
- [x] `describe-photos.md`: a `work/<aquarium>` mode — folder
      `src/content/work/<aquarium>/`, photos via `splitWorkPhotos` (hero and
      all gallery photos), context from the project's `work.projectN.*` texts,
      the descriptive third-person style of Our Work, writes `alt.yml` with the
      same keep / carry-over / remove rules. Journal mode unchanged.
- [x] Run it for the three folders; the owner reviews the texts before the
      commit. *(Texts written and approved by the owner, 2026-09-26.)*
Validation:
- `npx astro check`, `npm run build`; grep the Our Work `alt="…"` values in
  `dist/our-work/index.html` (NL) and `dist/en/our-work/index.html` (EN).
- Temporarily remove one key: the `ui.ts` fallback appears; restore.
- Temporarily break an entry (missing `en`): `astro check`/build fails naming
  the file; revert.
Acceptance criteria:
- [x] Each folder's `alt.yml` has non-empty `nl` and `en` for every shown
      photo and no keys for missing files (AC 6).
- [x] In `dist/`, each Our Work alt equals the `alt.yml` text in that page's
      language; a photo without a key shows the `ui.ts` fallback (AC 5).
- [x] A malformed `alt.yml` makes `astro check` or the build fail.
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `our work: alt-tekst per foto via alt.yml en /describe-photos work/<aquarium>`
Risks: low; re-read the journal steps of `/describe-photos` after editing so
journal mode doesn't change.

### Phase 4: Home page follows each folder's hero
Goal: the three project photos in the home page's "Our work" grid are each
folder's current hero (optimized); `A001-01` stays a fixed file.
Files: modify `src/components/pages/Index.astro` / delete
`public/images/our-work/A002-01.jpeg`, `A003-06.jpeg`, `A004-01.jpeg`
Steps:
- [x] Replace the three `<img>` tags with `<Image format="webp">` of each
      folder's hero (default lazy loading; `widths`/`sizes` for the 2-column
      `.work-grid`, confirm in the dev server); skip one if a folder has no
      hero, using the mapping from `work.ts`. Alt text stays
      `home.work.image1-3.alt`.
- [x] Keep the `A001-01.jpeg` line exactly as it is.
- [x] `git rm` the three home copies.
Validation: `npx astro check`, `npm run build`, inspect `dist/index.html` and
`/en/`; dev server on desktop and ≤ 800px; rename a photo so it sorts first
in `orinoco/`, the home page follows, revert.
Acceptance criteria:
- [x] In `dist/index.html` (and `/en/`) the work grid's first three images
      start with `01-A002-05.`, `01-A003-06.`, `01-A004-01.` (WebP `srcset`,
      lazy); the fourth is `/images/our-work/A001-01.jpeg`.
- [x] `public/images/our-work/` holds only `A001-01.jpeg`.
- [x] `grep -r "/images/our-work/" src` matches only the `A001-01` line.
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `home: projectfoto's volgen de hero van elke Our Work-map`
Risks: Fallen Forest on the home page changes from `A002-01` to `A002-05`
(intended, decision 4); check the contain-style hero looks right in the grid.

### Phase 5: Docs
Goal: the docs describe Our Work photos as prepared photos from one folder
per aquarium.
Files: modify `ARCHITECTURE.md`, `SPEC.md`, `README.md`, `AGENTS.md`, `PLAN.md`
Steps:
- [x] `ARCHITECTURE.md` §5 (Our Work paragraph, `work.ts`,
      `splitWorkPhotos`, `workAlt`), §6 (Our Work moves to the prepared
      system; preparation has two roots), §8 (`/describe-photos work/…`).
- [x] `SPEC.md`: §3.3.6 and §3.4 point to §3.7; §4 drops "once §3.7 is
      implemented"; §3.7's sentence about "no content collection" reworded
      (blocking question 3).
- [x] `README.md`: project tree and the "Our Work case studies" bullet.
- [x] `AGENTS.md`: the hook checks journal and Our Work photos; the content
      commands line mentions `work/<aquarium>`.
- [x] `PLAN.md`: close the backlog item about Our Work images (pointing to
      the decision-log entry); set this plan's status line.
Validation: read the docs against the code; `npx astro check`;
`grep -rn "public/images/our-work" *.md` only finds current-state text in
SPEC §3.7.
Acceptance criteria:
- [x] No doc says Our Work images are unoptimized `<img>` tags from `public/`,
      except §3.7's "Current state".
- [x] The backlog item is ticked, with a reference to the decision.
Commit boundary: `docs: Our Work-foto's uit een map per aquarium beschreven`
Risks: none identified.

### Out of scope / follow-ups
- A whole new case study without code or text (spec non-goal).
- Filling the empty grid cell next to an odd last gallery photo.
- A `verifier` check for Our Work photos without an `alt.yml` text.
- Moving `A001-01` and the hero, inspiration and about photos into the
  prepared system (spec non-goal).
- Downscaling the spares in `extra/`.

### Decisions on the blocking questions (2026-09-26)
1. Home page alt text: keep `home.work.image1-3.alt` (generic project names).
2. The case-study → folder mapping is one exported constant in
   `src/lib/work.ts`, used by `OurWork.astro` and `Index.astro`.
3. Phase 5 rewords §3.7's sentence about "no content collection".
4. Phase 3 runs `/describe-photos` for the three folders; the owner reviews
   the `alt.yml` texts before the commit.

## Execution plan: easier navigation on long pages

Status: APPROVED (2026-09-26). Phases 1–5 implemented.
Implements: SPEC.md §3.8

Order: the mobile menu comes first, so that when the header becomes fixed
(Phase 2) the phone header is already compact. Every phase keeps the site
working with and without JavaScript.

### Phase 1: Menu button and drop-down panel at ≤ 800px
Goal: on phones and tablets the header shows the logo and a "Menu" button
that opens a panel with the four pages and NL/EN; without JavaScript the
links stay as today.
Files: modify `src/components/Header.astro`, `src/styles/global.css`,
`src/i18n/ui.ts`
Steps:
- [x] `ui.ts`: `nav.menu` ("Menu") in both languages.
- [x] `Header.astro`: a Menu button (`aria-expanded="false"`,
      `aria-controls` → the links container) and a `<script>` that adds a
      class to `<html>` (JS available) and handles toggle, Esc (focus back
      to the button), tap outside, close on link, and close when the window
      grows past 800px.
- [x] `global.css`: the button is hidden by default and above 800px. At
      ≤ 800px and only with the JS class: the button shows, and the links
      become a full-width panel below the header, hidden until open. Without
      the JS class the current 800px / 550px rules still apply. The panel
      uses `--background`, `--text` and `--border`.
Validation: `npx astro check`, `npm run build`; in the built HTML the button
has `aria-expanded` and `aria-controls` on every page; dev server at ≤ 800px
and above; keyboard only; JavaScript disabled.
Acceptance criteria:
- [x] SPEC §3.8 AC 1 (the header part: links, NL/EN and the Menu button with
      `aria-expanded` / `aria-controls` on every page) and AC 5. *(Markup checked in the build; browser behaviour accepted by the owner at commit, 2026-09-26.)*
- [x] AC 7 (JavaScript disabled: links visible and clickable at every width). *(Accepted by the owner at commit, 2026-09-26.)*
- [x] `nav.menu` exists in both languages; `npx astro check` 0 errors,
      `npm run build` succeeds.
Commit boundary: `navigatie: menuknop met uitklappaneel op telefoon en tablet`
Risks: the home header is white over the hero photo; the open panel must stay
readable there (it has its own background).

### Phase 2: Header that hides on scroll down and returns on scroll up
Goal: on every page the fixed header hides while scrolling down and returns
on scroll up, solid once off the photo; anchors land below it.
Files: modify `src/components/Header.astro`, `src/styles/global.css`
Steps:
- [x] `global.css`: `--header-height` (desktop and ≤ 800px values);
      `.site-header` / `.page-header` become `position: fixed`; states
      hidden (transform off-screen), visible, solid (`--background`, dark
      text, `--border` line); a short transform transition;
      `html { scroll-padding-top: var(--header-height) }`; a
      `prefers-reduced-motion` block with no transitions and
      `scroll-behavior: auto`.
- [x] `Header.astro` script: a passive scroll listener throttled with
      `requestAnimationFrame`; always visible and transparent within the first
      `--header-height`; hide after scrolling down past it, show on an upward
      scroll of a few pixels; solid once off the photo (home: when the hero
      has scrolled out from under the header; other pages: past
      `--header-height`); never hide while the header has keyboard focus or
      the panel is open.
Validation: `npx astro check`, `npm run build`; dev server on the home page
and one other page, desktop and ≤ 800px; the home `#contact` link lands below
the header; reduced motion on (macOS setting); JavaScript disabled.
Acceptance criteria:
- [x] SPEC §3.8 AC 1 (the CSS part: `--header-height` defined and used for
      `scroll-padding-top`), AC 2 and AC 6 (header part). *(Static checks passed; browser behaviour accepted by the owner at commit, 2026-09-26.)*
- [x] AC 7 still holds (without JavaScript the header stays at the top of
      the page and all links work). *(Static checks passed; browser behaviour accepted by the owner at commit, 2026-09-26.)*
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `navigatie: header verdwijnt bij naar beneden scrollen en komt terug bij omhoog scrollen`
Risks: the page layouts rely on the header being out of the flow; fixed keeps
it that way (checked in the spec review). Watch the home hero: white text
must switch only when the hero is out from under the header.

### Phase 3: Back-to-top button
Goal: every page gets a small round ↑ button that appears after 1.5 screens
and brings the visitor back to the top.
Files: create `src/components/BackToTop.astro` / modify
`src/layouts/Layout.astro`, `src/styles/global.css`, `src/i18n/ui.ts`
Steps:
- [x] `ui.ts`: `nav.backToTop` ("Naar boven" / "Back to top").
- [x] `Layout.astro`: an `id="top"` target at the top of `<body>`, and
      `<BackToTop />` once.
- [x] `BackToTop.astro`: an `<a href="#top">` with the translated accessible
      name and a ↑; a few lines of script that show it after
      1.5 × the viewport height (hidden and not focusable otherwise).
- [x] `global.css`: fixed bottom right, round, `--text` on `--background`
      with a `--border` edge; hidden by default (so it stays hidden without
      JavaScript).
Validation: `npx astro check`, `npm run build`; the built HTML of every page
has exactly one `href="#top"` link with the right language; dev server on a
long page and a short one; reduced motion.
Acceptance criteria:
- [x] SPEC §3.8 AC 3, and AC 6 for back to top. *(Markup checked in the build; browser behaviour accepted by the owner at commit, 2026-09-26.)*
- [x] `nav.backToTop` exists in both languages; `npx astro check` 0 errors,
      `npm run build` succeeds.
Commit boundary: `navigatie: knop terug naar boven op elke pagina`
Risks: the button must not cover the footer text or the journal filter on
small screens; check on a phone width.

### Phase 4: Jump links on Our Work
Goal: under the Our Work intro, three links jump to the case studies.
Files: modify `src/components/pages/OurWork.astro`, `src/styles/global.css`,
`src/i18n/ui.ts`
Steps:
- [x] `ui.ts`: `work.jump.label` ("Projecten op deze pagina" / "Projects on
      this page").
- [x] `OurWork.astro`: ids `fallen-forest`, `orinoco`, `borneo-understory` on
      the three `<article>`s (taken from `WORK_FOLDERS`), and a
      `<nav aria-label={t("work.jump.label")}>` under the intro with links
      using `work.projectN.eyebrow`.
- [x] `global.css`: styled like the existing small uppercase labels.
Validation: `npx astro check`, `npm run build`; the built `/our-work` and
`/en/our-work` contain the nav, the three links and the three ids; dev server:
each link lands with the heading just below the header.
Acceptance criteria:
- [x] SPEC §3.8 AC 4. *(Nav, links and ids checked in the build; landing below the header accepted by the owner at commit, 2026-09-26.)*
- [x] `work.jump.label` exists in both languages; `npx astro check` 0 errors,
      `npm run build` succeeds.
Commit boundary: `our work: snelkoppelingen naar de drie projecten`
Risks: none identified.

### Phase 5: Docs
Goal: the docs describe the new navigation.
Files: modify `ARCHITECTURE.md` (§3 header and the scripts, §7 styling),
`README.md` if needed, `PLAN.md`
Steps:
- [x] `ARCHITECTURE.md`: the header is fixed with a small script (scroll
      states, mobile menu, the JS class on `<html>`), `--header-height` and
      `scroll-padding-top`, `BackToTop.astro` in `Layout.astro`, the Our Work
      ids, and that the site now has three small scripts (journal filter,
      header, back to top).
- [x] `PLAN.md`: this plan's status line.
Validation: read the docs against the code; `npx astro check`.
Acceptance criteria:
- [x] No doc says the header scrolls away or that the journal filter is the
      only script.
Commit boundary: `docs: nieuwe navigatie beschreven`
Risks: none identified.

### Out of scope / follow-ups
- A section menu on the home page, and a reading progress bar (not chosen).

### Blocking questions
None.

## Improvement queue

From `SPEC.md` §3.9 (high-level, approved 2026-09-26). One item at a time: each gets its
own detailed spec (`/spec`) and plan (`/plan-phases`) when it is its turn.
Update the status here as items move along.

| # | Item | Status | Next step |
| --- | --- | --- | --- |
| 0 | How the site goes live (hosting, deploy) | done (2026-09-26): Netlify, push to `main` deploys, see `ARCHITECTURE.md` §1 | — |
| 1 | Contact form: reliable and private | spec approved (§3.10, 2026-09-26) | `/plan-phases` |
| 2 | Home and about page images: fast | waiting | `/spec` |
| 3 | SEO basics for a bilingual site | waiting (needs 0) | `/spec` |
| 4 | Review and audit of the untouched code | waiting (after 1–3) | `reviewer` + Lighthouse |
| 5 | Owner browser checks still open | waiting — owner task | Owner, whenever convenient |

## Backlog

### Content
- [ ] Add real photos from Google Drive to the journal entries by copying
      them into each entry folder (`SPEC.md` §3.3.4), then run
      `/describe-photos`. Do this once the execution plan above has landed.
- [x] ~~Decide whether "Our Work" galleries should move from
      `public/images/our-work/` onto the prepared-photo system.~~ Decided and
      done: see the decision log ("Our Work photos from one folder per
      aquarium") and `SPEC.md` §3.7.

### Tooling / workflow
- [ ] Photo preparation: prevent the dev server and a build from preparing
      the same new photo at the same time (seen on 2026-09-26 while testing:
      a still-running dev server and a build both handled one file; the
      result was correct, but it's a race). The risk predates the Our Work
      change and exists between any two processes (dev + build, or two dev
      servers). Option: one shared lock file per content root. Until then, don't
      run `npm run build` while the dev server is preparing new photos.
- [ ] Try out `/translate-journal` on a real (non-placeholder) entry to
      validate the translation quality and frontmatter fidelity.
- [x] ~~Consider adding a `photo-alt-text` helper.~~ Covered by
      `/describe-photos` (execution plan, Phase 6).

### Decisions log
- **Google Drive image hotlinking — rejected.** Considered linking journal/
  work photos directly to Google Drive to avoid importing files into the
  repo. Rejected: Drive links aren't meant for hotlinking (rate limits,
  interstitial/virus-scan pages, breakage if sharing settings change) and it
  would bypass Astro's build-time image optimization entirely.
- **Google Drive as the photo archive, with a web master in git — chosen
  (2026-09-25).** Full-resolution originals stay in Drive. A copy dropped
  into an entry folder is automatically reduced to a 2400px web master with
  all metadata removed. Why:
  the repo stays light (originals are 5–15 MB each and would stay in the
  git history forever), GPS location never reaches the public site, and
  Drive stays the single place for originals. A Drive API integration
  (OAuth credentials, token refresh) was judged too heavy for a one-person
  site. Drive for Desktop or a manual download covers the need.
- **One folder per aquarium, one folder per entry, photos found
  automatically — chosen (2026-09-25).** Replaces the earlier plan of one
  flat folder per entry with a `photos:` list in the frontmatter and an
  `/add-photos` import command. Why: the owner wants to drop 3 photos into
  a folder and be done, with no naming rules and no text to edit when a
  photo changes. Grouping by aquarium also means the aquarium name is
  written once (`aquarium.yml`) instead of in every entry. Cost: entry URLs
  change (`/journal/<aquarium>/<entry>`), so the 4 existing entries get
  redirects.
- **No site-wide image layout default — chosen (2026-09-25).** Journal
  images set `widths`, `sizes` and `format` per `<Image>` instead of
  `image.layout` in `astro.config.mjs`. Why: a site-wide default would also
  change the Our Work and hero images, which are out of scope
  (`SPEC.md` §3.3.6).
- **Lean agent set — chosen (2026-09-25).** The main session orchestrates.
  Kept: `architect`, `planner`, `reviewer`, `verifier` (workflow) and
  `content-writer` (writing styles). Removed: `orchestrator`, `astro-agent`,
  `frontend-agent`, `i18n-agent`, `translator-agent`. Why: they overlapped
  with the main session, the verifier and `/translate-journal`, and routing
  everything through subagents made small changes slower and harder to
  follow.
- **Journal index preview — chosen (2026-09-26).** `SPEC.md` §3.6: the
  list shows the aquarium name as a clear label and the entry's first
  gallery photo (natural order, else the cover) as a 4:3 preview of about
  240px; entries without photos show text only. Why: visitors see which
  aquarium an entry is about and get a sneak preview, with nothing extra
  for the owner to maintain.
- **Our Work photos from one folder per aquarium — chosen (2026-09-26).**
  `SPEC.md` §3.7: `src/content/work/<aquarium>/`, first photo = hero, no
  gallery limit, per-photo alt text in `alt.yml` (via `/describe-photos`),
  home page follows each hero. Why: adding or replacing a photo needs no
  code, and Our Work gets the same preparation, privacy and speed as the
  journal. Closes the backlog item about Our Work images.
- **Easier navigation on long pages — chosen (2026-09-26).** `SPEC.md` §3.8:
  a fixed header that hides on scroll down and returns on scroll up (solid
  once off the photo), a back-to-top button, jump links to the three case
  studies on Our Work, and a Menu button with a drop-down panel at ≤ 800px.
  Not chosen: a home page section menu and a reading progress bar. Why: the
  long pages had no navigation once scrolled, and the phone header was
  cramped; the choices stay calm and need no dependencies.
- **Pre-commit hook running `astro check` — chosen (2026-09-25).** Lives in
  `.git/hooks/pre-commit`, so it is local to this Mac and not in the
  repository. Why: simplest automatic guard for a one-person repo; no extra
  dependency (such as husky) and no change to the git config.
- **Contact form: Netlify Forms instead of FormSubmit — chosen
  (2026-09-26).** The site is already on Netlify, so the receiving address
  moves out of the page into the dashboard, spam filtering is built in, and
  no extra third party handles visitors' details. Replaces the FormSubmit
  alias from §3.9. The owner accepts that submissions are stored in the
  Netlify account (deleted after about a year) and that the free tier's
  form limit isn't shown. See `SPEC.md` §3.10.

## Suggested files/folders for working more efficiently with Claude Code

These are structural additions worth making as the project (and the number
of Claude Code sessions working on it) grows. None of these exist yet except
where noted — treat this as a menu, not a mandate.

- **`.claude/commands/`** *(exists: `/spec`, `/plan-phases`,
  `/implement-phase`, `/review-phase`, `/translate-journal`,
  `/describe-photos`)*. Candidates to add next:
  - `new-journal-entry.md` — creates `src/content/journal/<aquarium>/YYYY-MM-title/`
    with an `nl.md` that has the right frontmatter (`title`, `date`,
    `status`, `summary`) and a placeholder body, so entries stay consistent
    without copying an old one.
  - `new-case-study.md` — same idea for a new "Our Work" project section in
    `OurWork.astro` + its `ui.ts` keys, since that content is currently
    hand-assembled across two files.
  - NL/EN parity checks (every entry folder has both `nl.md` and `en.md`,
    `ui.ts` keys match) are already part of the `verifier` agent, so no
    separate command is needed.
- **`.claude/agents/`** *(exists: `architect`, `planner`, `reviewer`,
  `verifier`, `content-writer`; see "Agents (built)" below)*.
- **`docs/decisions/` (or keep using this `PLAN.md` decision log)** — if the
  decision log here grows unwieldy, split into one short Markdown file per
  decision (`docs/decisions/0001-no-google-drive-hotlinking.md`). Not needed
  yet at the current scale — the log above is fine until it isn't.
- **`CHANGELOG.md`** — if the site starts shipping in discrete batches
  (e.g. "September content update"), a changelog gives future sessions a
  fast way to see what shipped when, separate from git log noise.

## Agents (built)

The main Claude session orchestrates; see `AGENTS.md` ("Engineering
workflow" and "Agents"). The workflow agents are `architect`, `planner`,
`reviewer` and `verifier`, driven by `/spec`, `/plan-phases`,
`/implement-phase` and `/review-phase`. One optional domain helper,
`content-writer`, drafts copy in the site's three writing styles: reflective
first person for Home/About, descriptive third person for Our Work, diary
style for the journal. The main session calls it when a separate context
helps and otherwise writes copy itself.

(Removed on 2026-09-25: `orchestrator`, `astro-agent`, `frontend-agent`,
`i18n-agent`, `translator-agent`. See the decision log.)

Adding a journal entry end to end (for a new aquarium, first create its
folder with an `aquarium.yml`):
1. Create `src/content/journal/<aquarium>/YYYY-MM-title/` and write `nl.md`
   (yourself, or have `content-writer` draft it).
2. `/translate-journal <aquarium>/<entry>` writes `en.md`.
3. Copy up to 3 photos from Google Drive into the entry folder; the dev
   server or build prepares them.
4. `/describe-photos <aquarium>/<entry>` writes the alt text in both
   languages.
5. Check the page in the dev server, then commit.
