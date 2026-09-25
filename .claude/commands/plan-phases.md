---
description: Turn an APPROVED spec section into an incremental, phased execution plan in PLAN.md, then stop for the owner's approval.
argument-hint: <SPEC.md section number or feature name>
---

Spec: $ARGUMENTS

This is the PLAN part of the workflow in `AGENTS.md`. Don't write any
application code in this command.

1. Read `AGENTS.md`, the named `SPEC.md` section, `ARCHITECTURE.md` and
   `PLAN.md`.
2. **Gate:** if the spec section isn't `Status: APPROVED`, stop and say so.
3. **Draft the plan.** If the spec touches several areas (e.g. schema +
   routes + CSS + docs), call the `planner` agent with the section number.
   For a small spec, write the plan yourself after reading the relevant
   code. Either way, the plan must follow the format and rules in
   `.claude/agents/planner.md`: small coherent phases, the files for each
   phase, validation per phase using only real commands, acceptance
   criteria, a commit boundary per phase, risks, and blocking questions.
4. **Check the draft yourself** against the current code. Remove phases the
   spec doesn't ask for, and split any phase that couldn't be one clean
   commit.
5. Add it to `PLAN.md` as a new `## Execution plan: <feature>` section with
   `Status: DRAFT`.
6. **Report and STOP.** List the phases (one line each) and any blocking
   questions. Ask the owner to approve. Only when they explicitly approve,
   change the status to `Status: APPROVED (YYYY-MM-DD)` and suggest
   `/implement-phase 1`.
