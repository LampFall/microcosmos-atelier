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

## Execution plan: contact form via Netlify Forms

Status: APPROVED (2026-09-26). Phases 1–5 implemented; all acceptance
criteria met (Reply check confirmed 2026-09-27).
Implements: SPEC.md §3.10

Order: the thank-you page goes live first, so the form can point to it the
moment it switches to Netlify. Every push to `main` goes live, so each
phase leaves the live site working. The switch itself (Phase 3) is one
commit; the owner sets up the email notification right after that deploy
(Phase 4), because Netlify only lists the form once a deploy contains it.
Enquiries sent in between aren't lost: they are stored under Forms in the
Netlify dashboard.

### Phase 1: Pin the Node version
Goal: Netlify builds with the same Node version as the owner's Mac.
Files: create `.nvmrc`
Steps:
- [x] `.nvmrc` with `24` (the local version is v24.19.0; `package.json`
      requires ≥ 22.12).
Validation: `npx astro check`, `npm run build`; after the push, the owner
(or Claude, with the log pasted) checks the Netlify deploy log for the Node
version.
Acceptance criteria:
- [x] SPEC §3.10 AC 8: `.nvmrc` exists and the deploy log shows Node 24. *(Netlify log 2026-09-26: "Attempting Node.js version '24' from .nvmrc … Now using node v24.21.0".)*
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `build: Node-versie vastgezet voor Netlify`
Risks: if Netlify doesn't offer Node 24 the deploy fails and the old
version stays live; the fix is `22`.

### Phase 2: Confirmation page, not indexed and not in the sitemap
Goal: `/contact/thanks` and `/en/contact/thanks` exist, with `noindex`,
left out of the sitemap; nothing links to them yet.
Files: create `src/components/pages/ContactThanks.astro`,
`src/pages/contact/thanks.astro`, `src/pages/en/contact/thanks.astro`;
modify `src/layouts/Layout.astro`, `src/i18n/ui.ts`, `astro.config.mjs`,
possibly `src/styles/global.css`
Steps:
- [x] `Layout.astro`: an optional `noindex` prop (default off) that adds
      `<meta name="robots" content="noindex" />`.
- [x] `ui.ts`: `contact.thanks.*` keys in both languages (meta title and
      description, eyebrow, heading, text saying a reply follows by email,
      link back to the home page). Wording drafted in the style of the
      existing contact copy; the owner checks it at review.
- [x] `ContactThanks.astro` in the style of the contact page header
      (reuse the `.contact-page` classes; only add CSS if needed), with
      `Header`, `Footer` and `noindex`. Two thin route files.
- [x] `astro.config.mjs`: `sitemap({ filter })` that leaves out URLs
      containing `/contact/thanks`.
Validation: `npx astro check`, `npm run build`; check `dist/`; view both
pages on the dev server (phone and desktop), and the NL/EN switch on them.
Acceptance criteria:
- [x] SPEC §3.10 AC 4: both pages exist in `dist/`, have the robots meta;
      `grep -l contact/thanks dist/sitemap*.xml` finds nothing; no other
      page has a robots meta. *(Apart from Astro's own redirect pages for the
      old journal URLs, which already had one.)*
- [x] The NL/EN switch on each thanks page leads to the other language's
      thanks page.
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `contact: bedankpagina na verzenden, niet in zoekmachines`
Risks: the sitemap filter could drop other pages if written too broadly;
compare the sitemap URL list before and after.

### Phase 3: The form switches to Netlify Forms
Goal: the form posts to Netlify, without an email address, with a
honeypot, language and subject fields, and a privacy sentence.
Files: modify `src/components/pages/Contact.astro`, `src/i18n/ui.ts`,
`src/styles/global.css` (a small `.contact-form-privacy` rule, since no
existing text style fitted; `.contact-page-email` removed with the link)
Steps:
- [x] `<form name="contact" method="POST" data-netlify="true"
      netlify-honeypot="bot-field" action={getRelativeLocaleUrl(lang,
      "/contact/thanks")}>`.
- [x] Hidden fields: `form-name` = `contact`, `language` = `nl` / `en`,
      `subject` = `t("contact.form.subject")`.
- [x] Honeypot: a wrapper with the `hidden` attribute containing a labelled
      `bot-field` input (no CSS needed).
- [x] Remove `_subject`, `_captcha`, `_next`, the `nextUrl` constant and
      its comment. The `mailto:` link and its CSS are removed too (D2, changed
      by the owner 2026-09-27).
- [x] `ui.ts`: `contact.form.privacy` with the D4 wording in both
      languages; show it as a small line near the send button, using
      existing text styles where possible.
Validation: `npx astro check`, `npm run build`; check `dist/` for AC 2–3
and 7; look at the form on the dev server (phone and desktop, Tab order,
JavaScript off). The dev server can't deliver the form; the live test is
Phase 4.
Acceptance criteria:
- [x] SPEC §3.10 AC 2, AC 3 and AC 7.
- [x] AC 6 (look unchanged, honeypot not visible or reachable with Tab,
      works without JavaScript). *(2026-09-27, owner on the live site: the
      look is fine on phone and desktop, Tab order fine, honeypot never
      reached. "Works without JavaScript" is by construction, a plain form
      post with no script; a send with JavaScript switched off wasn't
      tested.)*
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `contact: formulier via Netlify Forms, zonder e-mailadres, met honeypot`
Risks: from this push on, the live form depends on Netlify detecting it.
If detection fails, visitors get a Netlify error page; the fallback is to
revert this one commit (after the owner's OK). The FormSubmit route is gone
from then on.

### Phase 4: Netlify setup and live delivery test (owner + Claude)
Goal: enquiries from the live site arrive by email, in both languages.
Files: none (Netlify dashboard); `PLAN.md` ticks only.
Steps:
- [x] After Phase 3 is pushed and the deploy is green: the owner checks
      that Netlify → Forms lists the form `contact` with its fields.
- [x] The owner adds an email notification for `contact` to
      Kasper.Masschaele@gmail.com (Forms → Form notifications).
- [x] The owner sends one test from `/contact` and one from `/en/contact`
      (with a different email address as sender if possible).
Validation: the owner reports what arrived; Claude compares it with AC 5.
Acceptance criteria:
- [x] SPEC §3.10 AC 5: each test lands on the right thanks page, arrives
      with the translated subject and the right language, and a reply goes
      to the test sender. If the subject or Reply-To isn't as expected, stop
      and report; a fix is a follow-up change, not a redesign here.
      *(2026-09-27, owner: the form is listed, the notification is set up,
      and both tests landed on the right thanks page and arrived by email.
      Reply goes to the sender: confirmed by the owner, 2026-09-27.)*
Commit boundary: none (no files), unless ticks in `PLAN.md` are committed
with Phase 5.
Risks: a test marked as spam doesn't send an email: check Forms → spam
submissions before concluding it failed.

### Phase 5: Docs
Goal: the docs describe the new form handling.
Files: modify `SPEC.md` (§3.5), `ARCHITECTURE.md` (§1 hosting and the
contact page), `README.md` if it mentions the form, `PLAN.md` (queue item 1
done; backlog: an address on the site's own domain)
Steps:
- [x] `SPEC.md` §3.5 points to §3.10.
- [x] `ARCHITECTURE.md`: Netlify Forms, where submissions, spam and the
      notification setting live in the dashboard, the yearly clean-up, the
      thanks pages, the `noindex` prop, `.nvmrc`.
- [x] `PLAN.md`: queue item 1 done; a backlog line for a domain address.
Validation: `npx astro check`; reread the changed sections.
Acceptance criteria:
- [x] SPEC §3.10 AC 9.
Commit boundary: `docs: contactformulier via Netlify Forms beschreven`
Risks: none identified.

### Out of scope / follow-ups
- An email address on the site's own domain (backlog).
- hreflang and canonical for the thanks pages: §3.9 item 3 (SEO) must
  leave them out.
- `z` from `astro:content` is deprecated (seen in `astro check`): for
  §3.9 item 4.

### Blocking questions
None.

## Execution plan: home and about photos from one prepared folder

Status: APPROVED (2026-09-27). Phases 1–3 implemented.
Implements: SPEC.md §3.11

Order: first the machinery (preparation and hook know the new folder, still
empty), then the move and the page changes in one go, so no page ever
points to a photo that isn't there, then the docs. Every push goes live;
each phase leaves the site working.

### Phase 1: Preparation and the hook also cover `src/content/site/`
Goal: a photo dropped into `src/content/site/` is prepared like an Our Work
photo, and the hook checks that folder; no page uses it yet.
Files: modify `src/integrations/prepare-photos.ts`, `.gitignore`; local
`.git/hooks/pre-commit` (not in the repository)
Steps:
- [x] `PHOTO_ROOTS`: add `src/content/site/` with photos directly in the
      folder (depth 0) and no "more than 3" warning; update the comment.
      Check that depth 0 works for start-up, the watcher and the log labels.
- [x] `.gitignore`: the three temp-file patterns for `src/content/site/`.
- [x] Hook: include `src/content/site/`; make the refusal message fit all
      three folders.
- [x] Restart the dev server (`astro dev stop`, `astro dev --background`).
Validation: `npx astro check`, `npm run build`; while the dev server runs,
drop a HEIC or PNG test photo into `src/content/site/` and check it becomes
`.jpg` without EXIF (then delete it); stage a JPEG with EXIF there and check
the hook refuses it with its name (then unstage and delete it). Check that
an empty or new folder under `src/content/` gives no Astro warning.
Acceptance criteria:
- [x] SPEC §3.11 AC 8 and AC 9.
- [x] Journal and Our Work preparation unchanged (dev server log at start-up
      shows no new work for existing photos).
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `foto's: voorbereiding en hook ook voor src/content/site/`
Risks: a depth-0 root is new in practice; the watcher must not pick up
files in subfolders or in the other roots twice.
Added on the owner's request (2026-09-27): `PHOTOS.md`, a manual on where
to put photos and what happens to them, linked from `README.md`. The hook
message now also explains that `extra/` photos are never prepared.

### Phase 2: Move the eight photos and render them with `<Image>`
Goal: the home and about pages use the eight photos from
`src/content/site/` as optimised WebP, with the same look; `public/images/`
is gone.
Files: move (`git mv`, renamed to `.jpg`) the eight photos from
`public/images/` to `src/content/site/`; delete `public/images/MCA-logo.jpeg`
and `public/images/hero/WhatsApp Image 2026-08-18 at 13.36.11.jpeg`; modify
`src/components/pages/Index.astro`, `src/components/pages/About.astro`,
`src/styles/global.css`
Steps:
- [x] Before changing anything: record the current box sizes of the
      inspiration cards and the home about photo at 1280px and 390px, and
      the current image bytes of the home page.
- [x] Move and rename: `hero.jpg`, `inspiration-jungle.jpg`,
      `inspiration-amazon.jpg`, `inspiration-blackwater.jpg`,
      `inspiration-custom.jpg`, `work-extra.jpg`, `about-home.jpg`,
      `about-page.jpg`. Delete the two unused files; `public/images/` is
      then empty and removed.
- [x] `Index.astro` and `About.astro`: static imports of the photos (a
      missing file then fails the build with its path, FR 9) and `<Image>`
      with `format="webp"`, `widths` up to each source width, and `sizes`
      per slot based on the CSS (drawn width after `object-fit: cover`;
      hero ≈ `max(100vw, 75vh)` if browsers accept it in `sizes`,
      otherwise `100vw`; cards ≈ 1.375 × the column width). The hero keeps
      `class="hero-image"`.
- [x] Hero and about page photo: `loading="eager"`, `fetchpriority="high"`;
      the rest lazy (the `<Image>` default).
- [x] `global.css`: `height: auto` on `.microcosmos-card img` and
      `.about-image img`.
Validation: `npx astro check`, `npm run build`; check `dist/` (AC 2–5);
compare box sizes and bytes with the numbers recorded before; remove one
photo temporarily and check the build fails naming it (AC 10); dev server,
home and about in NL and EN, phone and desktop.
Acceptance criteria:
- [x] SPEC §3.11 AC 1–6 and AC 10, with the before/after numbers in the
      report. *(Measured 2026-09-27 on the built site, headless Chrome, in
      KB of 1000 bytes. Photos before scrolling, home: desktop 4,615 → 326,
      phone 390×844 at 3× 4,615 → 385; whole home page on a phone after
      scrolling 5,051 → 1,375. About page: desktop 653 → 168, phone 653 →
      433. Largest WebP referenced by the home page: 384,982 bytes (the
      1440px hero). All photo boxes unchanged to the pixel.)*
- [x] AC 7 (owner: looks the same). *(2026-09-27, owner on the dev server:
      the photos look the same at first glance, at quality 65.)*
Deviation (owner's choice, 2026-09-27): at Astro's default WebP quality
the phone budget wasn't met (hero 528 KB on a 3× phone), so the eight
site photos use `quality={65}`; journal and Our Work keep the default.
After review: the hero stops at 1440px and the about photo at 1000px
(`widths` and `width`, so the fallback `src` isn't the full-size file), and
the cards use 820 instead of 800.
Commit boundary: `foto's: home en about via geoptimaliseerde afbeeldingen uit src/content/site/`
Risks: the look (crops, card hover, hero cover) is the main risk; compare
carefully. The static import requires every file to exist before the pages
build; preparation runs first at start-up.

### Phase 3: Docs
Goal: the docs describe the site photo folder and how to replace a photo.
Files: modify `SPEC.md` (§4), `ARCHITECTURE.md` (§5, §6), `README.md`,
`PHOTOS.md`, `PLAN.md` (queue item 2)
Steps:
- [x] `SPEC.md` §4: the eager exceptions include the home hero and the
      about photo; the image rule covers `src/content/site/`.
- [x] `ARCHITECTURE.md` §5 (the fourth home tile) and §6 (one image
      system: three photo roots; `public/` only has favicons and the Search
      Console file).
- [x] `README.md`: folder tree, the eight file names and what each is for,
      and how to replace one (delete the old file, drop the new one with
      the same name, same orientation).
- [x] `PHOTOS.md` (the owner's photo manual, added during Phase 1 on the
      owner's request): remove the "Status" note about `public/images/`
      and check the file names match. Also a line on the dev server's error
      page while a photo is being replaced (review note, Phase 2).
- [x] After review: `SPEC.md` §3.11 status "implemented", §3.9 item 2
      "Done"; the pre-commit hook sentence in `ARCHITECTURE.md` and
      `AGENTS.md` now includes site photos (`AGENTS.md` with the owner's OK).
- [x] `PLAN.md`: queue item 2 done.
Validation: `npx astro check`; reread the changed sections.
Acceptance criteria:
- [x] SPEC §3.11 AC 11.
Commit boundary: `docs: sitefoto's in src/content/site/ beschreven`
Risks: none identified.

### Out of scope / follow-ups
- Hard-coded "Kasper Masschaele" alt text: §3.9 item 4.
- A default Open Graph share image: §3.9 item 3.

### Blocking questions
None.

## Execution plan: SEO basics for a bilingual site

Status: APPROVED (2026-09-27). Phases 1–4 implemented; all steps done.
Implements: SPEC.md §3.12

Order: addresses first (canonical and language links, which everything else
reuses), then the share tags and images, then the sitemap and `robots.txt`,
then docs and the owner's preview check. No phase changes anything visible;
each one can go live on its own.

### Phase 1: Canonical and language links
Goal: every indexable page has one canonical and, when its other-language
version exists, `hreflang` links for `nl`, `en` and `x-default`; the old
journal redirects point to addresses with a trailing `/`.
Files: modify `src/i18n/utils.ts`, `src/components/Header.astro`,
`src/layouts/Layout.astro`, `src/lib/journal.ts`,
`src/components/pages/JournalEntry.astro`, `astro.config.mjs`
Steps:
- [x] `utils.ts`: a helper for the page path without the `/en` prefix,
      taken from `Header.astro` line 15; the header uses it (same output).
- [x] `journal.ts`: a helper that says whether an entry exists in the
      other language (reusing the collection it already reads).
- [x] `Layout.astro`: optional prop "other language exists" (default
      true). Unless `noindex`: canonical via `getAbsoluteLocaleUrl(lang,
      path)`; if the other language exists, `hreflang` `nl`, `en` and
      `x-default` (= NL).
- [x] `JournalEntry.astro`: passes the helper's answer.
- [x] `astro.config.mjs`: trailing `/` on the eight redirect targets.
Validation: `npx astro check`, `npm run build`; a one-off script in the
scratchpad over `dist/` (every sitemap page: one canonical equal to its
sitemap URL; hreflang targets exist in `dist/`); the header language links
unchanged on a few pages; a temporary EN-only test entry (not committed)
gets no hreflang; dev server spot check.
Acceptance criteria:
- [x] SPEC §3.12 AC 2, 5 (the canonical/hreflang part), 7 and 9.
- [x] The language switch in the header gives the same links as before.
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `seo: canonical en taallinks (hreflang) op elke pagina`
Risks: the path helper must give the same result as the header did (e.g.
`/en` → `/`); canonicals must match the sitemap exactly (trailing slash).

### Phase 2: Share tags and share images
Goal: every indexable page has Open Graph and Twitter tags with a 1200×630
JPEG share image of its own photo or the default.
Files: modify `src/layouts/Layout.astro`, `src/components/pages/Index.astro`,
`src/components/pages/About.astro`, `src/components/pages/OurWork.astro`,
`src/components/pages/JournalEntry.astro`
Steps:
- [x] `Layout.astro`: optional props share image (photo + alt) and page
      type. Makes a 1200×630 JPEG with `getImage` (`format: "jpeg"`,
      `fit: "cover"`, centred); default = `site/hero.jpg` with
      `home.hero.imageAlt`. Writes `og:title`, `og:description`, `og:url`
      (= canonical), `og:site_name`, `og:type`, `og:locale`
      (`nl_BE`/`en_GB`) + `og:locale:alternate`, `og:image` (absolute),
      `og:image:width`/`height` (the real file size), `og:image:alt`,
      `twitter:card`. Not on `noindex` pages. No `og:locale:alternate`
      when the page has no translation (review note, Phase 1).
- [x] Pages pass their photo and alt: home (hero), about (about photo),
      Our Work (first existing hero, its `alt.yml` text), journal entry
      (cover, else first photo, with the alt text the page uses; type
      `article`).
Validation: `npx astro check`, `npm run build`; extend the scratchpad
script (all tags present, `og:image` files exist in `dist/`, are JPEG
1200×630, `og:url` = canonical); check which image each page uses; dev
server spot check (nothing visible changes).
Acceptance criteria:
- [x] SPEC §3.12 AC 3, 4, 5 (the share-tag part) and 10.
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Deviation (owner's OK and SPEC §3.12 updated, 2026-09-27): a page photo
smaller than 1200×630 isn't used for the preview
(the home hero is used instead), rather than making a smaller file; this
keeps the width/height tags true without reading the output file. All
current photos are large enough.
Added: an optional crop `position` per share image; the about page uses
"bottom", because the centred crop cut the owner's face off at the bottom
edge (checked by looking at the generated files).
Commit boundary: `seo: deelkaartjes (Open Graph) met een foto per pagina`
Risks: `og:image:width`/`height` must match the real file (a small source
isn't enlarged); NL and EN share one image file per photo, check the build
doesn't make duplicates.

### Phase 3: Sitemap language pairs and `robots.txt`
Goal: the sitemap links the NL and EN version of each page, and
`/robots.txt` points to it.
Files: modify `astro.config.mjs`; create `public/robots.txt`
Steps:
- [x] `sitemap({ filter, i18n: { defaultLocale: 'nl', locales: { nl: 'nl',
      en: 'en' } } })`.
- [x] `public/robots.txt`: `User-agent: *`, `Allow: /`,
      `Sitemap: https://microcosmos-atelier.com/sitemap-index.xml`.
Validation: `npx astro check`, `npm run build`; check `dist/sitemap-0.xml`
and `dist/robots.txt`; the temporary EN-only test entry is not paired.
Acceptance criteria:
- [x] SPEC §3.12 AC 6 and 8 (and the sitemap part of AC 9).
- [x] `npx astro check` 0 errors, `npm run build` succeeds.
Commit boundary: `seo: taalparen in de sitemap en robots.txt`
Risks: none identified.

### Phase 4: Docs and live preview check
Goal: the docs describe the head tags; the owner confirms real previews.
Files: modify `SPEC.md` (§4 SEO), `ARCHITECTURE.md`, `PHOTOS.md`,
`PLAN.md` (queue item 3)
Steps:
- [x] `SPEC.md` §4: what every page carries (canonical, hreflang, share
      tags), `robots.txt`, the sitemap pairs.
- [x] `ARCHITECTURE.md`: where the head tags come from (Layout props, the
      path helper, the journal translation helper, share images via
      `getImage`), and that a new page should pass its photo.
- [x] `PHOTOS.md`: a page's photo is also its link-preview photo (cropped
      wide).
- [x] After the push: the owner shares the home page and a journal entry in
      WhatsApp (or checks them in LinkedIn's Post Inspector) and, once, submits
      the sitemap in Google Search Console if it isn't there.
      *(2026-09-27: WhatsApp preview with photo confirmed by the owner, after
      WhatsApp's cache (`?v=2`), for the home page and a journal entry. Live
      check by Claude: tags and share image served, `robots.txt` as
      `text/plain`. Sitemap submitted in Search Console by the owner,
      2026-09-27.)*
- [x] `PLAN.md`: queue item 3 done.
Validation: `npx astro check`; reread the changed sections; the owner's
report.
Acceptance criteria:
- [x] SPEC §3.12 AC 11 and 12. *(AC 11: the owner shared the home page and
      a journal entry in WhatsApp; both show photo, title and description,
      2026-09-27. AC 12: docs updated. The Search Console submission is a
      separate owner step, above.)*
Commit boundary: `docs: SEO-basis beschreven`
Risks: platforms cache previews; a stale preview isn't a site error.

### Out of scope / follow-ups
- The header's language switch links to a missing page for a journal
  entry in one language only (SPEC §3.12 non-goal).
- Structured data (JSON-LD).

### Blocking questions
None.

## Execution plan: review and audit of the older code

Status: APPROVED (2026-09-27). Phases 1–2 implemented.
Implements: SPEC.md §3.13

No code changes in this plan: both phases only add to `PLAN.md`.

### Phase 1: Lighthouse on the live site
Goal: scores and the main lost-point audits for the live site, recorded in
`PLAN.md`.
Files: modify `PLAN.md` (new section "Audit findings (2026-09-27)", scores
part)
Steps:
- [x] Note the live commit (`git log origin/main -1`) and check the Netlify
      deploy of it is live (a page's HTML matches the build).
- [x] Run `npx lighthouse` (temporary, with the installed Chrome) on the
      live site: home, Our Work, about, contact, journal list and one
      journal entry in NL, and the EN home page; mobile and desktop;
      performance three times per page and profile, median recorded.
      Reports (JSON/HTML) stay in the scratchpad.
- [x] Record the scores table and, per page type, the audits that lose
      points (with the element or file where Lighthouse points to one).
Validation: every page/profile has four scores; `git diff` touches only
`PLAN.md`; nothing added to `package.json`.
Acceptance criteria:
- [x] SPEC §3.13 AC 1.
- [x] `git status` shows no change outside `PLAN.md`.
Commit boundary: `audit: Lighthouse-scores van de live site`
Risks: the download or Chrome run fails: fallback is PageSpeed Insights by
the owner (SPEC §3.13 error handling). Scores vary between runs: medians.

### Phase 2: Code review and the findings list
Goal: every file in SPEC §3.13 "Current state" reviewed as a whole, and one
prioritised findings list with the Lighthouse findings and known items.
Files: modify `PLAN.md` (findings part of the same section; queue item 4)
Steps:
- [x] `reviewer` agent, whole-file mode, on the files in SPEC §3.13
      "Current state", with FR 1's focus list and the Lighthouse findings
      from Phase 1 as context.
- [x] Check the reviewer's findings against the code (drop false
      positives, merge duplicates) and add the four known items.
- [x] Write the findings list: severity, file:line or page, what's wrong,
      suggested fix, size; per file "reviewed: findings / no findings".
- [x] Queue item 4 links to the list and is marked done.
Validation: every listed file appears in the list; `git diff` touches only
`PLAN.md`.
Acceptance criteria:
- [x] SPEC §3.13 AC 2–5.
Commit boundary: `audit: bevindingen van de code-review`
Risks: a long list of MINOR items; keep them short and grouped by file.

### Out of scope / follow-ups
- Fixing findings: the owner picks them after Phase 2; each becomes its own
  change in the queue.

### Blocking questions
None.

## Execution plan: visitor statistics and a privacy page

Status: APPROVED (2026-09-28). Phases 1–3 implemented; all checks done
(2026-09-29).
Implements: SPEC.md §3.14

Order: the privacy page first (visible, the owner checks the text), then
the counter, which the privacy page describes, then docs and the live
check. Every push goes live; the counter only starts counting after Phase
2 is pushed.

### Phase 1: Privacy page and links
Goal: `/privacy` and `/en/privacy` exist and are linked from the footer
and the contact form's privacy sentence.
Files: create `src/components/pages/Privacy.astro`,
`src/pages/privacy.astro`, `src/pages/en/privacy.astro`; modify
`src/components/Footer.astro`, `src/components/pages/Contact.astro`,
`src/i18n/ui.ts`, `src/styles/global.css` (if needed)
Steps:
- [x] Page component in the style of the contact/thanks pages, `<main
      id="main">`, texts in `ui.ts` (NL and EN): contact form (what, where:
      Netlify, how long: about a year), statistics (anonymous, no cookies,
      Cloudflare), no cookies on the site, questions via the contact form.
- [x] Footer: a "Privacy" link next to the copyright line.
- [x] Contact form: the privacy sentence links to the page.
Validation: `npx astro check`, `npm run build`; seo/og check scripts (the
new pages carry canonical, hreflang, share tags and are in the sitemap);
Lighthouse accessibility on the new page; screenshots of home/contact
(only the footer and the privacy sentence change).
Acceptance criteria:
- [x] SPEC §3.14 FR 4–6, AC 5 and AC 7.
- [x] The owner approves the privacy text. *(2026-09-28)*
Commit boundary: `privacy: privacypagina en link in de footer`
Risks: the text must stay true to what the site does (Netlify storage,
Cloudflare); the owner checks it.

### Phase 2: The counter and the opt-out switch
Goal: Cloudflare Web Analytics counts visits on the live domain only, not
on the owner's opted-out browsers.
Files: create `src/components/Analytics.astro`; modify
`src/layouts/Layout.astro`, `src/i18n/ui.ts`, `src/styles/global.css`
Steps:
- [x] `Analytics.astro`, rendered by `Layout.astro` only in the production
      build (`import.meta.env.PROD`): a small inline script that handles
      `?nietmeten` / `?welmeten` (local storage, short confirmation in the
      page language, then removes the parameter from the address), and
      adds Cloudflare's beacon (a classic script with `data-cf-beacon`, like
      Cloudflare's own snippet; token from the owner's snippet) only when `location.hostname` is `microcosmos-atelier.com`
      and the browser hasn't opted out.
- [x] If local storage isn't available, the confirmation says the choice
      can't be remembered.
Validation: `npx astro check`, `npm run build`; headless Chrome on `astro
dev` and `astro preview`: no request to `static.cloudflareinsights.com`;
the built HTML contains the snippet; a simulated `microcosmos-atelier.com`
hostname check in the script (unit-level, e.g. by reading the script) and
the opt-out flow tested on the preview with the hostname check relaxed
for the test only (not committed); Lighthouse performance and
accessibility unchanged.
Acceptance criteria:
- [x] SPEC §3.14 FR 1–3, AC 1–2.
Tested 2026-09-28 in headless Chrome, all Cloudflare requests blocked (no
test visits reach the statistics): `astro dev` no snippet, no request;
`astro preview` (localhost) snippet but no request, `?nietmeten` stored;
the real host name mapped to the built site (static server on `dist/`):
visit → beacon requested; `?nietmeten` → Dutch confirmation, address
cleaned, no request, also on /about/ and /journal/; `/en/?welmeten` →
English confirmation, beacon again. After review: with only the counting
call blocked, the beacon ran and sent its payload with `"siteToken":
"56e1996d…"` on each page (so an inserted script works); `?nietmeten` also
skips the current page view in a private window; the confirmation is filled
into an existing live region for screen readers. Phase 3 live check (2026-09-28): on a
throttled phone the beacon competed with the hero photo (Lighthouse mobile
90–92 with it vs 93–95 without); it is now added after the page's `load`
event (owner's OK). Lighthouse there: accessibility 100;
best practices only fails on HTTPS (the local test server), performance
94/100 (uncompressed test server); to re-measure live in Phase 3.
Commit boundary: `statistieken: Cloudflare Web Analytics met niet-meten-schakelaar`
Risks: the owner's first visits after the deploy are counted until they
open `?nietmeten`; that's expected.

### Phase 3: Docs and live check
Goal: the docs explain the counter; the owner confirms it works live.
Files: modify `ARCHITECTURE.md`, `SPEC.md` (§4), `README.md` (owner
note: `?nietmeten`, where to read the numbers), `PLAN.md`
Steps:
- [x] Docs as above.
- [x] After the push: Claude checks the live site requests the beacon and
      `microcosmos-atelier.netlify.app` doesn't; the owner opens
      `?nietmeten` on own browsers and checks a visit from another device
      shows up in Cloudflare.
      *(2026-09-28, Claude: `www.` → 301 to the main address; live pages
      carry the snippet; with only the counting call blocked, the live site
      sends the beacon with the token and `*.netlify.app` sends nothing;
      Lighthouse desktop 100 in all categories, mobile a11y/BP/SEO 100.
      Owner: `?nietmeten` done on own devices, "all looks good"; a visit
      from another device shows up in Cloudflare, confirmed 2026-09-29.)*
Validation: `npx astro check`; live checks; the owner's report.
Acceptance criteria:
- [x] SPEC §3.14 AC 3, 4, 6 and FR 8. *(AC 6 confirmed by the owner,
      2026-09-29.)*
Commit boundary: `docs: bezoekersstatistieken en privacy beschreven`
Risks: Cloudflare can take a few minutes to show the first visits.

### Out of scope / follow-ups
- Search Console and the Business Profile statistics stay where they are.

### Blocking questions
None.

## Execution plan: FAQ page

Status: APPROVED (2026-09-28). Phases 1–2 implemented.
Implements: SPEC.md §3.15

### Phase 1: FAQ page, copy and links
Goal: `/faq` and `/en/faq` with the 11 questions, linked from the contact
page, the home page and the footer.
Files: create `src/components/pages/Faq.astro`, `src/pages/faq.astro`,
`src/pages/en/faq.astro`; modify `src/i18n/ui.ts`,
`src/components/pages/Contact.astro`, `src/components/pages/Index.astro`,
`src/components/Footer.astro`, `src/styles/global.css`
Steps:
- [x] Copy for the 11 questions and answers plus page intro and closing
      invitation, NL and EN, first person, in `ui.ts` (`faq.*`); shown to
      the owner for approval before the commit.
- [x] `Faq.astro`: page header like the privacy page; the questions from
      one list as `<details>`/`<summary>`; closing invitation with a link
      to the contact form.
- [x] Links: contact page (near the introduction), home page (near the
      process section), footer (next to "Privacy").
- [x] CSS for the question list in the site's style (thin borders, a
      plus/minus marker, focus visible).
Validation: `npx astro check`, `npm run build`; seo/og check scripts
(sitemap, canonical, hreflang, share tags); all answers present in the
built HTML; keyboard and no-JS check of opening/closing (headless Chrome);
Lighthouse accessibility on both FAQ pages; screenshots of home, contact
and footer (only the new links change).
Acceptance criteria:
- [x] SPEC §3.15 AC 1–5.
- [x] AC 6: the owner approves the NL and EN copy. *(2026-09-28, including
      "in regie" / "on a time-and-materials basis")*
Commit boundary: `faq: pagina met veelgestelde vragen en links ernaartoe`
Risks: a link on the home page must fit the process section's look; checked
by eye.

### Phase 2: Docs
Goal: the docs mention the FAQ.
Files: modify `ARCHITECTURE.md`, `README.md` (where the FAQ copy lives),
`SPEC.md` (§3.15 status), `PLAN.md` (queue)
Steps:
- [x] Docs as above.
Validation: `npx astro check`; reread.
Acceptance criteria:
- [x] The docs say where the FAQ copy is and how to add a question.
Owner's change (2026-09-29): "FAQ" added to the main menu after Journal
(`Header.astro`, `nav.faq`); the menu still fits on one row above 800px
(measured 801–1440px, NL and EN) and sits in the drop-down panel below.
Commit boundary: `docs: FAQ beschreven`
Risks: none identified.

### Blocking questions
None.

## Execution plan: journal block on the home page, and a 404 page

Status: APPROVED (2026-09-29). Phases 1–3 implemented.
Implements: SPEC.md §3.16

### Phase 1: "Latest from the journal" on the home page
Goal: the home page shows the newest 3 journal entries of its language
after "Our work", with a link to the journal.
Files: modify `src/components/pages/Index.astro`, `src/i18n/ui.ts`,
`src/styles/global.css`
Steps:
- [x] `Index.astro`: take the first 3 of `getJournalEntries(lang)` with
      their preview photo (`getEntryPhotos`: first gallery photo, else the
      cover); a section after "Our work" with eyebrow, heading, 3 cards
      (photo, aquarium, date, title; each a link to the entry) and a
      "Naar het journaal →" link; left out when there are no entries.
- [x] Photos as WebP with `widths`/`sizes` for the card width, lazy.
- [x] `ui.ts`: `home.journal.*` in NL and EN.
- [x] `global.css`: a 3-column card grid (1 column at ≤ 800px) in the
      style of the existing grids.
Validation: `npx astro check`, `npm run build`; the built home pages (NL,
EN) list the right 3 entries newest first with working links; Lighthouse
accessibility 100 and phone performance compared with before; screenshots
(only the new section changes the home page); dev-server check by eye at
desktop and phone width.
Acceptance criteria:
- [x] SPEC §3.16 FR 1–3, AC 1, 2 and the home part of AC 5.
- [x] The owner approves the copy and the look. *(2026-09-29; the owner
      also asked to call the journal "dagboek" in Dutch everywhere — menu,
      journal page, back link, home block — while English keeps "Journal";
      the address stays `/journal`.)*
Commit boundary: `home: blok laatst in het journaal`
Risks: the home page gets longer; the photos must load lazily so the first
screen stays as fast as it is.

### Phase 2: 404 page
Goal: unknown addresses show a page in the site's style.
Files: create `src/components/pages/NotFound.astro`, `src/pages/404.astro`;
modify `src/i18n/ui.ts`, `src/styles/global.css` (if needed)
Steps:
- [x] Page in the style of the privacy/thanks pages, `noindex`: Dutch text,
      the four links (home, Onze projecten, journaal, contact), and one
      English line with a link to `/en/`.
- [x] `ui.ts`: `notFound.*`.
Validation: `npx astro check`, `npm run build`; `dist/404.html` exists,
`noindex`, not in the sitemap; Lighthouse accessibility 100; after the
push, an unknown live address returns 404 with this page.
Acceptance criteria:
- [x] SPEC §3.16 FR 4–6, AC 3–4 and the 404 part of AC 5. *(Live 2026-09-29:
      an unknown address returns 404 with this page, `noindex`.)*
- [x] The owner approves the copy. *(2026-09-29)*
Done 2026-09-29: `dist/404.html`, `noindex`, not in the sitemap, no
canonical or share tags; `astro preview` serves it with status 404 for an
unknown address; Lighthouse accessibility 100 (run on `/404.html`, since
Lighthouse won't score a 404 response). The header got an optional
`switchPath` prop; the 404 page passes "/", so NL and EN go to the home
pages (other pages unchanged). Live check done after the push (see the
acceptance criteria).
Commit boundary: `404: eigen pagina voor onbekende adressen`
Risks: the header's language switch on the 404 page points to `/en/404/`,
which doesn't exist; check it and, if needed, point it to `/en/`.

### Phase 3: Docs
Goal: the docs mention the block and the 404 page.
Files: modify `ARCHITECTURE.md`, `SPEC.md` (§3.1 pages table, §3.16
status), `README.md` (the "Dagboek" name), `PLAN.md` (queue)
Steps:
- [x] Docs as above.
Validation: `npx astro check`; reread.
Acceptance criteria:
- [x] The docs describe both parts.
Commit boundary: `docs: dagboekblok en 404-pagina beschreven`
Risks: none identified.

### Blocking questions
None.

## Execution plan: clearer, more personal site copy

Status: APPROVED (2026-09-30)
Implements: SPEC.md §3.17

Every phase: Claude shows old and new NL text side by side → the owner
approves or edits → Claude writes the EN → `astro check`, build, a quick
look on the dev server → commit on the owner's OK. Only `ui.ts` (and
markup where an element disappears).

### Phase 0: Facts and voice (owner input, no code)
Goal: the answers the rewrite needs (questions in the owner's message of
2026-09-30), recorded in SPEC §3.17 as decisions.

### Phase 1: About page
Goal: a personal, concrete story: when and how it started, what the owner
knows and does, why the atelier exists; no slogan, "fascinatie" once.
Files: `src/i18n/ui.ts` (`about.*`), `src/components/pages/About.astro`
if a highlight goes.
Done 2026-09-30 (owner approved NL and EN): new origin story (goldfish won
at the fair), approach incl. CO₂ nuance, own aquariums at home, started
this summer, follow-up without learning curve, LinkedIn link; highlight1
removed, highlight2 replaced; "fascin" 0× on /about; accessibility 100.
Commit boundary: `teksten: over mij persoonlijker en concreter`

### Phase 2: Home page
Goal: hero, "Wat is een Microcosmos", "Het idee", the about block and the
closing call each say one thing, concretely; slogans out; no repeats of
/about.
Files: `src/i18n/ui.ts` (`home.*`), `src/components/pages/Index.astro` if
an element goes.
Done 2026-09-30 (owner approved the NL text; EN written to match): hero
text, "Wat is een Microcosmos", "Het idee" (7 paragraphs + slogan → lead +
3), work block ("Mijn werk", own aquariums at home), about block
(goldfish bowl, started this summer), closing call; both slogans and their
now-unused CSS removed. Home: 0× slogans, "niet … maar", "in plaats van",
"fascin", "zorgvuldig", "creëren"; accessibility 100 (NL, EN).
Commit boundary: `teksten: home duidelijker, zonder slogans`

### Phase 3: Our Work
Goal: page intro and the three intros concrete; "niet X maar Y" out of the
stories; the Fallen Forest contradiction and "multifunctionele leefruimte"
fixed; the species details kept.
Files: `src/i18n/ui.ts` (`work.*`, `nav.ourWork`).
Commit boundary: `teksten: projecten concreter`

### Phase 4: Contact, journal intro, calls to action
Goal: each closing call to action worded for its page, no sentence
repeated across pages; journal and contact intros tightened.
Files: `src/i18n/ui.ts` (`contact.*`, `journal.hero.*`, `*.cta.*`,
`work.closing.*`).
Commit boundary: `teksten: contact, dagboek en oproepen zonder herhaling`

### Phase 5: Check and docs
Goal: SPEC §3.17 AC 2 search over the NL copy; EN matches NL; queue item
done.
Files: `SPEC.md`, `PLAN.md`.
Commit boundary: `docs: teksten herschreven`

### Blocking questions
Phase 0 (see the owner's answers).

## Improvement queue

From `SPEC.md` §3.9 (high-level, approved 2026-09-26). One item at a time: each gets its
own detailed spec (`/spec`) and plan (`/plan-phases`) when it is its turn.
Update the status here as items move along.

| # | Item | Status | Next step |
| --- | --- | --- | --- |
| 0 | How the site goes live (hosting, deploy) | done (2026-09-26): Netlify, push to `main` deploys, see `ARCHITECTURE.md` §1 | — |
| 1 | Contact form: reliable and private | done (2026-09-27), live on Netlify Forms, all checks passed | — |
| 2 | Home and about page images: fast | done (2026-09-27): photos in `src/content/site/`, home 4.6 MB → 0.4 MB on a phone before scrolling | — |
| 3 | SEO basics for a bilingual site | done (2026-09-27): canonical, hreflang, link previews, sitemap pairs, robots.txt; sitemap submitted in Search Console | — |
| 4 | Review and audit of the untouched code | done (2026-09-27): see "Audit findings (2026-09-27)"; all fix bundles A–E done, required-field marker added | — |
| 5 | Owner browser checks still open | done (2026-09-29): iPhone checks by the owner OK | — |
| 6 | Visitor statistics (Cloudflare) and a privacy page | done (2026-09-28): live; visit from another device confirmed in Cloudflare (2026-09-29) | — |
| 7 | FAQ page | done (2026-09-29): live at `/faq`, 11 questions; in the main menu (owner's change) and linked from home, contact and footer | — |
| 8 | "Latest from the journal" on home, and a 404 page | done (2026-09-29): live; the journal is called "Dagboek" in Dutch | — |
| 9 | Clearer, more personal site copy | plan approved (2026-09-30); phases 0–2 (about, home) done | Phase 3: Our Work |

## Audit findings (2026-09-27)

From `SPEC.md` §3.13. Nothing here is fixed yet: the owner picks which
findings to fix, and each becomes its own item in the queue.

### Lighthouse scores (live site)

Measured 2026-09-27 on `https://microcosmos-atelier.com`, live commit
`20bdc9c`, Lighthouse 13.5.0 (temporary `npx`, local Chrome, headless).
Mobile = Lighthouse's default phone profile (throttled 4G, slow CPU),
desktop = `--preset=desktop`. Performance is the median of three runs (the
three runs in brackets); the other categories come from the median run.

| Page | Profile | Performance | Accessibility | Best practices | SEO | LCP |
| --- | --- | --- | --- | --- | --- | --- |
| Home (NL) | mobile | 98 (97/98/98) | 95 | 100 | 100 | 2.4 s |
| Home (NL) | desktop | 100 | 92 | 100 | 100 | 0.4 s |
| Our Work | mobile | 100 (100/100/99) | 95 | 100 | 100 | 1.0 s |
| Our Work | desktop | 100 | 95 | 100 | 100 | 0.3 s |
| About | mobile | 98 (100/98/97) | 95 | 100 | 100 | 2.3 s |
| About | desktop | 100 | 92 | 100 | 100 | 0.4 s |
| Contact | mobile | 100 | 95 | 100 | 100 | 0.8 s |
| Contact | desktop | 100 | 93 | 100 | 100 | 0.4 s |
| Journal list | mobile | 99 (100/98/99) | 94 | 100 | 100 | 1.0 s |
| Journal list | desktop | 100 | 92 | 100 | 100 | 0.4 s |
| Journal entry (`fallen-forest/2026-09-sand`) | mobile | 100 | 95 | 100 | 100 | 1.1 s |
| Journal entry | desktop | 100 | 92 | 100 | 100 | 0.2 s |
| Home (EN) | mobile | 97 (95/97/98) | 95 | 100 | 100 | 2.4 s |
| Home (EN) | desktop | 100 | 92 | 100 | 100 | 0.3 s |

Layout shift (CLS) is 0 and blocking time 0–10 ms on every page.

### Findings from Lighthouse

- **IMPORTANT — Text contrast just below the guideline, site-wide.**
  **Fixed 2026-09-27:** `--muted` is now `#606960` (5.05:1 / 4.61:1);
  Lighthouse accessibility 100 on all 14 page/profile combinations of the
  new build. The
  muted text colour `--muted` (`#687168`, `global.css`) on the page
  background `#f4f1e9` has a contrast of 4.48:1; WCAG AA asks for 4.5:1 for
  normal text. On the card background `#ebe7dc` (inspiration cards, Our Work
  "ecosystem principle" box) it's 4.09:1. It's used for eyebrows, intro and
  body text, dates, the journal filters, the privacy line and the footer:
  this is the only reason accessibility isn't 100 on most pages. Fix: a
  slightly darker `--muted` (one token; to be chosen so both backgrounds
  reach ≥ 4.5:1, and checked by eye). Size: small.
- **MINOR — Heading order on the journal list.** **Fixed 2026-09-27:**
  `<h2>`, measured identical in size, spacing and margins to the old `<h3>`. Entry titles are `<h3>`
  directly under the page's `<h1>` (`Journal.astro`, `.journal-title`),
  skipping `<h2>`. Fix: `<h2>` with the same look (CSS). Size: small.
- Note (no action): the journal list's mobile Speed Index is 3.7 s in one
  run (score 86 for that metric); overall performance is still 98–100.

### Findings from the code review

`reviewer` agent, whole files at `ec76a4d`; every IMPORTANT finding and the
dead-CSS claims were re-checked by the main session against the code and,
where it's about rendering, with computed styles in headless Chrome on the
built site. No CRITICAL findings.

**Files reviewed:** `Index.astro` (findings), `About.astro` (findings),
`Contact.astro` (findings), `Footer.astro` (no findings), `global.css`
(findings), `ui.ts` (findings; NL and EN have the same 245 keys, all used),
`content.config.ts` (findings).

#### IMPORTANT

1. **[Fixed 2026-09-27, bundle B]** **Hero label hard to read** — `global.css` `.eyebrow` (≈102): the home
   hero's eyebrow ("Levende aquatische ecosystemen") is small grey
   `--muted` text on the dark bottom of the photo (measured: 11.5px,
   `#606960`). Lighthouse can't test text on images. Fix: a light colour for
   `.hero .eyebrow`. Small.
2. **[Fixed, B]** **Two labels render large** — `.about-page-story p` (≈1864) and
   `.contact-page-info p` (≈1928) beat `.eyebrow`, so the eyebrows at
   `About.astro:58` and `Contact.astro:27` are 16.8px / 16px instead of
   11.5px like every other eyebrow (measured). Fix: `p:not(.eyebrow)`, as
   elsewhere in the file. Small.
3. **[Fixed, B: `--field-border` `#858a82`, 3.1:1]** **Form fields barely visible** — `.contact-form input/textarea/select`
   border `--border` `#d5d1c6` on `#f4f1e9` ≈ 1.4:1; WCAG 1.4.11 asks 3:1 for
   the edge of a field, and the fields have no background. Fix: a darker
   field border, focus state kept clear. Small.
4. **[Fixed, B]** **Send button has the browser's grey background** — `.button` sets no
   `background`, so `<button type="submit">` (`Contact.astro`) shows
   `#efefef` (measured) while link buttons are transparent. Fix:
   `background: transparent` (and `font-family: inherit`) on `.button`;
   check hover. Small.
5. **[Fixed, B: one block, the look as it was (45px); the phone rule
   that never applied is removed]** **`.ecosystem-layers` defined twice** — `global.css` 548–585 and
   2137–2178; the second copy comes after the 550px media query, so the
   phone rule (38px column, ≈1764) never applies (measured 45px). Fix: one
   block before the media queries; decide 38px or 45px by eye. Small.
6. **[Fixed, C: 311 lines removed]** **About 300 lines of dead CSS** — no element uses: `.philosophy-grid`
   (+`.number`), `.ecosystem-section`, `.ecosystem-intro`,
   `.inspiration-note`, `.project`, `.project-reverse`, `.project-image`,
   `.project-content`, `.microcosmos-note`, `.work-project*`,
   `.species-list`, `.page-cta`, `.about h3` (checked with grep over all
   markup, scripts and content). Fix: delete, then compare pages by eye.
   Small–medium.
7. **[Fixed, A]** **Typo in a home heading** — `ui.ts` `home.formulas.title` (NL):
   "Microcomos" → "Microcosmos". Small.
8. **[Fixed, A]** **Misspelt species (NL)** — `ui.ts` `work.project2.spec.fish` (NL):
   "Nanostomus … veijeta"; EN and the NL story have "Nannostomus …
   viejita". Small.
9. **[Fixed, A: owner chose "since I was five" (NL "Sinds mijn vijfde")
   and "MA-Gen 1.0" in both]** **NL and EN say different things** — `about.hero.lead`: NL "Al meer
   dan 35 jaar", EN "since I was five years old"; `work.project2.spec
   .substrate`: NL "MA-Gen 1.0", EN "mainly sand, MA-Gen 1.0". The owner
   picks the true version. Small.
10. **[Fixed, D: the switch goes to the other language's journal list]**
    **Language switch leads to a missing page** (known) — `Header.astro`
    always links to the other language; for a journal entry in one language
    only that's a 404. Fix: pass `hasTranslation` to the header and link to
    the other language's journal list instead (or hide the link). Small.

#### MINOR (grouped)

- **Code:** `z` from `astro:content` deprecated (`content.config.ts:1`,
  removed in Astro 8; use `astro/zod`) · `coverAlt`, `photoAlt` values and
  aquarium `name` accept empty strings (use `.trim().min(1)` like
  `workAlt`) · `as any` on template keys in `Index.astro` (≈124, 219,
  240) hides missing keys · four copy-pasted inspiration cards
  (`Index.astro` ≈141–203) · `SITE_PHOTO_QUALITY` defined twice · unused
  anchors `home.intro.anchor` and `#contact` · hard-coded alt "Kasper
  Masschaele" in three places (`Index.astro`, `About.astro` ×2; known).
- **CSS:** redundant rules (`.formulas` max-width, `.inspiration
  .section-intro`, h3 margins, `.case-study-hero img` max-widths,
  `object-fit` with `height: auto`) · `!important` workarounds (≈878,
  2125–2129) · `.about a` duplicates `.text-link` without hover · media
  queries split in several places (800px ×3, 550px ×2), which caused
  finding 5 · repeated section header and mis-indent (≈471, 2073–2077) ·
  raw colours/sizes instead of tokens (≈1165, 1791) · the Our Work hero
  hover zoom has no transition and hover zooms ignore reduced motion.
- **Copy (`ui.ts`):** *[fixed, A: the "·" in "LED · 2 lichtperiodes" and
  NL "(groen, rood en bruin)"; owner's choices 2026-09-27: EN "Your own little
  world", EN `work.spec.started` "Started", CO₂ "Geen"/"None"; the
  Fallen Forest intro stays as it is]*
  `work.project1.intro` NL "multifunctionele leefruimte … biotoop" vs EN
  "family space … ecosystem"; status "Groei" (NL) is a noun among
  "Opstart / Rijpt / Stabiel"; EN "Established" used for two things; EN
  "Your Own" reads cut off; two different Orinoco alt texts; CO₂ spec "-"
  is read as "dash"; unused `languages` export and a stale top comment;
  `nav.*` keys out of place.
- **Accessibility, optional:** "→" in link texts is read aloud; English
  titles on Dutch pages have no `lang="en"`; required form fields have no
  visible marker; no skip link (Layout); the privacy line isn't linked to
  the form.
- **Docs:** two overlong lines in `SPEC.md` §4 (≈1758, 1769; known).

#### Done in bundles C, D and E (2026-09-27)

- **C. CSS clean-up:** dead CSS removed (`global.css` 2,167 → 1,830 lines);
  base rules first, then one 800px and one 550px block; `!important`
  replaced by specificity; redundant rules removed; `.about a` →
  `.text-link` (now with its hover); raw values → tokens (the Fallen Forest hero's letterbox
  background moved from `#f4f2ed` to the page colour `#f4f1e9`, a
  deliberate, practically invisible change); hover zooms get a
  transition and are off with reduced motion. Checked with full-page
  screenshots of 9 pages at desktop and phone width before/after: 14 of 18
  pixel-identical, the other 4 only differ by photo-loading timing or text
  anti-aliasing (checked by eye).
- **D. Code tidy:** `z` from `astro/zod`; empty alt texts and aquarium names
  rejected by the schema (tested); typed template keys instead of `as any`;
  the four inspiration cards from one list; `SITE_PHOTO_QUALITY` in
  `src/lib/site-photos.ts`; alt "Kasper Masschaele" in `ui.ts`
  (`about.image.alt`); unused `languages` export and stale comment removed;
  `nav.*` keys together; the language-switch fix (finding 10, tested with a
  one-language entry); overlong lines in `SPEC.md` §4 rewrapped.
  `astro check`: 0 errors, 0 warnings, 0 hints (was 18 hints).
- **E. Accessibility extras:** skip link ("Naar de inhoud" / "Skip to
  content", visible on Tab; tested); arrows in links `aria-hidden`; English
  titles on Dutch pages `lang="en"`; the privacy line linked to the send
  button (`aria-describedby`). Lighthouse accessibility 100; screenshots
  unchanged.
- **Deliberately left:** the unused anchors (`home.intro.anchor`,
  `#contact`) stay for links from outside; the two Orinoco alt texts; the
  status word "Groei" (owner's earlier choice); the Fallen Forest intro
  (owner's choice).
- **Required-field marker** (owner's choice, 2026-09-27): a grey `*` after
  the labels of name, e-mail and message, and a "* verplicht" / "* required"
  line above the privacy line; visual only (`aria-hidden`), the fields keep
  `required`.

#### Suggested fix bundles (for the owner to choose)

- **A. Copy** — findings 7, 8, 9 and the copy minors (needs the owner's
  answers for 9 and a few wordings). Small.
- **B. Visible CSS fixes** — findings 1–5. Small; each checked by eye.
- **C. CSS clean-up** — finding 6 plus the CSS minors (dead CSS, merged
  media queries, redundant rules). Medium; no visible change intended.
- **D. Code tidy** — finding 10 and the code minors (`z`, empty strings,
  `as any`, alt text into `ui.ts`, shared quality constant). Small.
- **E. Accessibility extras** — the optional minors. Small.

## Backlog

### Content
- [ ] Home inspiration images (generated): replace with own photos, or
      remove the section (owner, 2026-09-30; SPEC §3.17 D3).
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
- [ ] Contact: an email address on the site's own domain (e.g.
      `hallo@microcosmos-atelier.com`), if the owner ever wants to show an
      address again (`SPEC.md` §3.10, D2). Needs a mail provider for the
      domain.
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
- **Home and about photos: one prepared site photo folder — chosen
  (2026-09-27).** The eight photos from `public/images/` move to
  `src/content/site/` with fixed names, a third photo root for preparation,
  rendered with `<Image>`. Not chosen: fixed files in `src/assets/` (the
  owner would have to strip GPS data by hand) and one folder per photo slot
  (more folders and code for photos that rarely change). Why: extends the
  existing system with one entry, and replacing a photo works like Our Work.
  The two unused files (`MCA-logo.jpeg`, a spare hero photo) are deleted.
  See `SPEC.md` §3.11.
- **Site photos at WebP quality 65 — chosen (2026-09-27).** At Astro's
  default quality the home page missed the 400 KB phone budget (the detailed
  hero was 528 KB on a 3× phone). The eight site photos use `quality={65}`,
  the hero stops at 1440px and the about photo at 1000px; journal and Our
  Work keep the default. The owner saw no difference. See `SPEC.md` §3.11.
- **SEO: share images cropped to 1200×630, `nl_BE`/`en_GB` — chosen
  (2026-09-27).** Link previews use a JPEG made at build time from each
  page's own photo, cropped to the standard 1200×630 so every platform shows
  the same card; the home hero is the default. `og:locale` matches the date
  format the site already uses. The sitemap has no `x-default` (the plugin
  can't write it); the HTML has it. See `SPEC.md` §3.12.
- **Visitor statistics: Cloudflare Web Analytics — chosen (2026-09-28).**
  Free, no cookies and no personal data, so no cookie banner; no DNS move.
  Cloudflare becomes a processor of anonymous page-view data (owner
  approved). Own visits are excluded by loading the script only in the
  production build on the real domain and not in browsers that opened
  `?nietmeten`. Not chosen: Google Analytics (cookies, consent banner),
  Plausible / Netlify Analytics (paid). See `SPEC.md` §3.14.
- **"Dagboek" as the Dutch name of the journal — chosen (2026-09-29).** All
  visible Dutch text says "Dagboek"; English keeps "Journal". The address
  stays `/journal` (changing it would break shared and indexed links), and
  folders, keys and code keep `journal`. See `SPEC.md` §3.16 D4.

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
