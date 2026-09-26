## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

### Commands that exist

| Purpose | Command |
| --- | --- |
| Dev server | `astro dev --background` (`npm run dev` for humans) |
| Type check / Astro validation | `npx astro check` |
| Production build | `npm run build` (`astro build`, also runs the photo-preparation integration) |
| Preview the build | `npm run preview` |

There is **no test suite and no linter**. Prettier is installed but has no
config or script, so it is not a check. Don't invent or report commands
that don't exist; if a phase needs one, propose adding it in the plan.

## Project docs

Read these before non-trivial work: `SPEC.md` (what the site does, and
feature specs), `ARCHITECTURE.md` (how the code is structured), `PLAN.md`
(execution plans, backlog, decision log).

## Engineering workflow

The site owner decides product and architecture; Claude does the
engineering. Substantial work follows this sequence, with a human gate at
each approval step:

IDEA → INVESTIGATE → SPEC → ARCHITECTURE REVIEW → **approval** → PLAN →
**approval** → IMPLEMENT ONE PHASE → VERIFY → REVIEW → COMMIT (on
approval) → next phase

| Step | Command |
| --- | --- |
| Investigate, write and review a spec | `/spec` |
| Turn an approved spec into phases | `/plan-phases` |
| Implement exactly one phase | `/implement-phase` |
| Review, then commit on approval | `/review-phase` |

Small changes (a typo, a single-file fix, a content tweak) don't need the
full sequence. Still investigate first and verify after.

### Specs and plans

- A feature spec is a section in `SPEC.md` (WHAT and WHY); its execution
  plan is a section in `PLAN.md` (HOW). Each starts with a status line:
  `Status: DRAFT` or `Status: APPROVED (YYYY-MM-DD)`. Only the owner
  approves. Claude writes APPROVED only when the owner says so explicitly.
- Never implement from a DRAFT plan.
- Decisions that materially affect infrastructure, security, data
  ownership, cost or maintainability need the owner's approval. Record them
  in `PLAN.md`'s decision log with a one-line "why".

### Permanent rules

- **Investigate before changing.** Never speculate about code you haven't
  read. Find the existing pattern and extend it; don't build a parallel
  system next to it.
- **One phase at a time.** Implement only the requested phase, with no
  unrelated refactoring, then stop. Never continue to the next phase on
  your own.
- **Scope control.** Never silently expand scope. If the approved spec or
  plan turns out to be wrong, stop and explain; don't redesign during
  implementation.
- **Simplicity.** Choose the simplest thing that meets the requirements. No
  unnecessary dependencies or services, no speculative abstractions, no
  infrastructure for hypothetical future problems.
- **Verification is evidence.** Writing code doesn't finish a phase. Run
  the real commands above and check the phase's acceptance criteria. Never
  claim a check passed unless you ran it and it succeeded; say so when a
  check was skipped.
- **Review.** After meaningful implementation, the diff is reviewed
  independently. Findings are CRITICAL, IMPORTANT or MINOR. Don't fix MINOR
  findings unless asked.
- **Git.** One coherent phase per commit, and commit only when the owner
  says so. Commit messages are in Dutch, matching the existing history.
  Never force push, rewrite shared history, delete branches, or commit
  secrets or `.env` files without explicit instruction.

## Agents

The main session orchestrates: it talks to the owner, owns scope, writes
the spec, plan and code, and decides when a subagent is worth it. Use a
subagent only when a separate context helps (a broad investigation, an
independent review, an objective verification run). Don't use one for
trivial edits, single-file changes or simple sequential work.

Workflow agents (`.claude/agents/`), all read-only:

- `architect`: investigates the codebase and reviews a draft spec against
  it.
- `planner`: drafts a phased plan from an approved spec (optional for small
  specs).
- `reviewer`: skeptical, independent review of a diff.
- `verifier`: runs the type check and build, checks the site and the
  acceptance criteria, reports PASS/FAIL.

One optional domain helper: `content-writer`, which drafts new copy in the
site's three writing styles. Content commands: `/translate-journal
<aquarium>/<entry>` writes the other language's `nl.md`/`en.md`, and
`/describe-photos <aquarium>/<entry>` (or `work/<aquarium>` for Our Work)
writes the photos' alt text in both languages. Code, CSS and routing work
is done by the main session itself.

### Safeguards

- `.claude/settings.json` blocks force pushes, `git reset --hard`,
  `git clean -f`, branch deletion and reading `.env` files, and asks before
  commit, push and rebase.
- A git pre-commit hook (`.git/hooks/pre-commit`, local to this machine,
  not in the repository) blocks the commit if a staged journal or Our Work
  photo isn't prepared yet or still has EXIF/XMP/IPTC metadata (possible
  GPS), or if `npx astro check` reports errors. Never bypass it with
  `--no-verify` unless the owner says so.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
