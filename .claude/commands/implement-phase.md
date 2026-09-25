---
description: Implement exactly one phase of an APPROVED execution plan in PLAN.md, verify it, report, and stop.
argument-hint: <phase number> [plan name, if PLAN.md has more than one open plan]
---

Phase: $ARGUMENTS

1. Read `AGENTS.md`.
2. Read the spec section the plan implements in `SPEC.md`.
3. Read `PLAN.md`: the plan, its status, and the phase.
4. **Gate:** the plan must be `Status: APPROVED`, earlier phases must be
   checked off, and the working tree should be clean (`git status
   --short`). If not, stop and say what's wrong. If there are uncommitted
   changes, ask whether to review and commit them first.
5. Inspect the current code the phase touches. Don't rely on the plan's
   description of the code; read it.
6. **Confirm** in one or two lines which phase you're implementing and the
   files you expect to create, modify or delete.
7. **Implement only this phase.** No unrelated refactoring, no fixes
   outside the phase, no extra features. If you notice something else
   that should be done, note it for the report.
8. **Stop if the plan is wrong.** If the spec or plan turns out not to fit
   the code (a missing prerequisite, an approach that can't work, a
   significant cost the plan didn't foresee), stop, leave the partial work
   as it is, and explain. Don't redesign.
9. **Validate.** Call the `verifier` agent, naming the plan and phase. For
   a trivially small phase you may instead run `npx astro check` and
   `npm run build` yourself and check the acceptance criteria. Only report
   what actually ran.
10. **Report:** what changed (files), verification results (PASS/FAIL/
    SKIPPED, taken from the verifier's output), acceptance criteria met or
    not, manual checks the owner should do, deviations from the plan,
    and the follow-ups you noticed. Tick the phase's steps in `PLAN.md` only
    for work that is actually done.
11. **STOP.** Don't start the next phase and don't commit. Suggest
    `/review-phase`.
