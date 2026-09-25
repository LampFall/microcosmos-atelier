# Plan

This is a living backlog + decision log for Microcosmos Atelier, written so a
future session (human or Claude) can pick up where things left off without
re-reading the whole chat history. Update it as work happens — check items
off, add new ones, and record decisions with a one-line "why" so they don't
get re-litigated.

## Status snapshot (2026-09-25)

- Core site (home, our work, about, contact, journal) is built and live in
  both NL and EN.
- Journal content collection supports a `photos` gallery of 1–3 images per
  entry (first one large, next two small) — schema, rendering and CSS are
  done (`src/content.config.ts`, `components/pages/JournalEntry.astro`,
  `styles/journal.css`).
- All 8 journal entry files (4 entries × NL/EN) currently have **placeholder**
  photos (`src/assets/background.svg` / `astro.svg`) wired in just to verify
  the layout — these need to be swapped for real photos before publishing.
- `src/assets/journal_pics/` exists and is empty, intended to hold real
  journal photos organized per entry (see `ARCHITECTURE.md` §5 for the
  expected folder/reference convention).
- A `/translate-journal` slash command exists
  (`.claude/commands/translate-journal.md`) to keep NL/EN journal entries in
  sync — write one language, run the command, get the other.
- Documentation (`SPEC.md`, `PLAN.md`, `ARCHITECTURE.md`, this refreshed
  `README.md`) was just created to support working more structurally with
  Claude Code across sessions.

## Execution plan: journal restructuring & image performance

Status: APPROVED (2026-09-25). Phases 1–5 implemented, reviewed and fixed:
the review's 1 critical and 4 important findings in photo preparation are
fixed, and the re-review's one follow-up (safe case-only rename) too. All
tested with real files, including the dev-server live update. Stale docs
(review finding 6) are Phase 7. Next: commit, then Phase 6.

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

- [ ] `.claude/commands/describe-photos.md`, argument `<aquarium>/<entry>`:
  - [ ] Looks at each photo in the entry folder and writes `photoAlt`
        (keyed by file name) into `nl.md` in Dutch and `en.md` in English,
        in the factual tone of the journal.
  - [ ] Keeps alt text that is already there, unless asked to rewrite it.
        Removes keys for photos that no longer exist.
  - [ ] Also writes `coverAlt` when there is a `cover.*`.
  - [ ] Reports what it wrote, so the owner can check it.

### Phase 7 — Update docs and agent instructions

These all still describe the old `nl/`/`en/` + `journal_pics/` layout:

- [ ] `ARCHITECTURE.md` §5 and §6.
- [ ] `README.md` ("Working with content"): the drop-in workflow,
      `/describe-photos`, and how to add a new entry or aquarium.
- [ ] `.claude/commands/translate-journal.md`: the counterpart is the other
      `nl.md`/`en.md` in the same folder; `tank`/`lang`/`liters` no longer
      exist; `photoAlt` keys are copied and only the values translated.
- [ ] `.claude/agents/content-writer.md`: a new entry is a new
      `YYYY-MM-title` folder in the aquarium's folder; a new aquarium needs
      an `aquarium.yml`; no `tank` field anymore.
- [x] ~~`i18n-agent.md`~~: agent removed on 2026-09-25; its checks now
      live in `.claude/agents/verifier.md` (layout and NL/EN parity).
- [x] ~~`astro-agent.md`~~: agent removed on 2026-09-25.
- [ ] `AGENTS.md`: mention `/describe-photos` next to `/translate-journal`.
- [ ] This file: rewrite the "Agents (built)" section, which still lists the
      removed agents and says "drop photos into
      `assets/journal_pics/<slug>/`".

### Phase 8 — Verification

- [ ] `npx astro check` and `npx astro build` pass.
- [ ] All entries render at their new URLs in both languages; the 8 old
      URLs redirect; the aquarium filter and the language switcher work.
- [ ] Drop test with the dev server running, on one entry:
  - [ ] Drop an iPhone HEIC and a large JPEG with GPS location. Both appear
        on the page without a restart and are now `.jpg`, at most 2400px;
        `mdls` or `exiftool` shows no location.
  - [ ] Drop a 4th photo → a warning appears and 3 are shown. A photo in
        `extra/` is ignored.
  - [ ] Replace a photo → the page shows the new one.
- [ ] In the built HTML: a `srcset` on the photos, `loading="eager"
      fetchpriority="high"` on the cover, `loading="lazy"` on the gallery,
      and the files in `dist/_astro/` are much smaller than the web
      masters.
- [ ] Optional, the owner decides: install Google Drive for Desktop so
      photos can be copied straight from Finder. Not installed on this Mac
      as of 2026-09-25.

### Phase 9 — Cleanup

- [ ] `git status` shows no leftover empty folders or stray files.
- [ ] Update the Backlog section below.

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
- **Pre-commit hook running `astro check` — chosen (2026-09-25).** Lives in
  `.git/hooks/pre-commit`, so it is local to this Mac and not in the
  repository. Why: simplest automatic guard for a one-person repo; no extra
  dependency (such as husky) and no change to the git config.

## Suggested files/folders for working more efficiently with Claude Code

These are structural additions worth making as the project (and the number
of Claude Code sessions working on it) grows. None of these exist yet except
where noted — treat this as a menu, not a mandate.

- **`.claude/commands/`** *(exists — has `translate-journal.md`)*. Good
  candidates to add next:
  - `new-journal-entry.md` — scaffolds a new NL+EN journal entry pair for a
    given tank/date/title, with correct frontmatter and a placeholder body,
    so entries stay structurally consistent without hand-copying an old one.
  - `new-case-study.md` — same idea for a new "Our Work" project section in
    `OurWork.astro` + its `ui.ts` keys, since that content is currently
    hand-assembled across two files.
  - `check-i18n-parity.md` — greps `ui.ts` for keys present in one language
    block but missing in the other, and checks every `journal/nl/*.md` has a
    matching `journal/en/*.md` filename (and vice versa). Cheap to write,
    catches an easy-to-miss class of bug.
- **`.claude/agents/`** *(exists — see "Agents (built)" below for all five)*.
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
`/implement-phase` and `/review-phase`. The domain helpers below are
optional. The main session calls one when its specialised knowledge or a
separate context helps, and otherwise does the work itself.

(The former `orchestrator` agent was removed on 2026-09-25: routing every
change through subagents clashed with keeping trivial work in the main
session.)

1. **`content-writer`** — drafts new journal entries or case-study copy in
   the site's established voice, distinguishing the three registers actually
   in use (reflective first-person for Home/About, descriptive third-person
   for Our Work case studies, diary-style first-person for journal entries).
   Scoped to writing Markdown/frontmatter and `ui.ts` string additions in one
   language at a time — not translation, not layout or schema changes.
2. **`translator-agent`** — the agent form of `/translate-journal`, extended
   to also bring `src/i18n/ui.ts` copy to parity across languages. Preserves
   non-translatable frontmatter (`tank`, `date`, `status`, image paths) and
   matches register per key namespace.
3. **`astro-agent`** — owns routing (`src/pages/**`), the `pages/` vs
   `components/pages/` split, the journal content-collection schema
   (`content.config.ts`), and data-fetching logic (`getStaticPaths`,
   `getCollection`). Does not touch CSS or write copy.
4. **`frontend-agent`** — owns visual layout and styling: `src/styles/*.css`
   and the markup structure inside `components/pages/*.astro` (not their
   data-fetching). Handles galleries, responsive breakpoints, spacing. Does
   not touch schema/routing or write copy.
5. **`i18n-agent`** — read-only QA agent. Audits `ui.ts` key parity, journal
   NL/EN file parity, `tank`/`status` consistency across an entry's language
   pair, missing alt text, and broken image paths. Reports a punch list; never
   edits files itself.

Note `astro-agent` and `frontend-agent` both touch files under
`components/pages/`; the split is by *kind of change* (data/structure vs.
markup/visual), not by file, so route a task to whichever matches what's
actually changing.

A simple pattern for adding a new journal entry end-to-end: write the Dutch entry yourself (or have **`content-writer`**
draft it) → run **`translator-agent`** (or `/translate-journal`) → drop
photos into `assets/journal_pics/<slug>/` and wire up `photos:` frontmatter
yourself or via **`frontend-agent`** → run **`i18n-agent`** before
considering it done. Each step is small and independently verifiable, which
matters more here than parallelizing them — this site's content volume
doesn't yet justify
running agents concurrently.
