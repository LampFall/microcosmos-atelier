---
description: Independently review the uncommitted implementation of a plan phase, fix CRITICAL/IMPORTANT findings on approval, and commit only when the owner says so.
argument-hint: [phase number / plan name, defaults to the phase just implemented]
---

Phase: $ARGUMENTS

1. Identify the phase (from the argument, or the one `/implement-phase`
   just finished) and show `git status --short` and `git diff --stat HEAD`.
2. **Independent review:** call the `reviewer` agent with the plan name,
   the phase and the spec section. Pass along the latest verifier results
   if they exist in this session. Otherwise call `verifier` as well
   (the two can run in parallel).
3. **Report** the findings grouped as CRITICAL / IMPORTANT / MINOR, plus
   the verification table. Add your own assessment if you disagree with a
   finding, and say why.
4. **Fixes:** propose fixes for CRITICAL and IMPORTANT findings and apply
   them only after the owner agrees. Don't fix MINOR findings unless asked.
   After any fix, re-run verification (and the reviewer for non-trivial
   fixes).
5. **Commit gate:** when there are no open CRITICAL findings and
   verification passes, propose one commit for this phase: the file list
   (including the ticked-off `PLAN.md`) and a Dutch commit message in the
   style of the existing history. Make sure no secrets or `.env` files are
   staged. Commit **only** when the owner explicitly says so. Stage the
   phase's files by name, not with `git add -A`. Never push unless asked.
6. Report the commit hash and **STOP**. The owner starts the next phase.
