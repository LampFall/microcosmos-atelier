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

## Backlog

### Content
- [ ] Add real photos from Google Drive to the journal entries by copying
      them into each entry folder (`SPEC.md` §3.3.4), then run
      `/describe-photos`. Do this once the execution plan above has landed.
- [ ] Decide whether "Our Work" galleries should move from
      `public/images/our-work/` (unoptimized `<img>`) onto the same
      content-collection `image()` pattern as journal photos, for consistent
      build-time optimization. Currently inconsistent (see
      `ARCHITECTURE.md` §6) — no decision made yet.

### Tooling / workflow
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
- **Pre-commit hook running `astro check` — chosen (2026-09-25).** Lives in
  `.git/hooks/pre-commit`, so it is local to this Mac and not in the
  repository. Why: simplest automatic guard for a one-person repo; no extra
  dependency (such as husky) and no change to the git config.

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
