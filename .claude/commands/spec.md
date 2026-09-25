---
description: Investigate an idea and write (or review) a feature spec section in SPEC.md, then stop for the owner's approval.
argument-hint: <idea in a sentence, or an existing SPEC.md section number to review>
---

Input: $ARGUMENTS

This is the INVESTIGATE → SPEC → ARCHITECTURE REVIEW part of the workflow in
`AGENTS.md`. Don't write or change any application code in this command.

1. **Read** `AGENTS.md`, `SPEC.md`, `ARCHITECTURE.md` and the `PLAN.md`
   decision log.
2. **Investigate.** If the idea touches more than a file or two, or you
   don't yet know which code is involved, call the `architect` agent in
   investigate mode with the idea. Otherwise read the relevant code
   yourself. Never describe code you haven't read.
3. **Ask the owner** about anything product-related you can't infer
   (what they want, not how to build it). Keep it to the questions that
   change the spec.
4. **Write the spec** as a new numbered section in `SPEC.md` (or revise the
   given one), starting with `Status: DRAFT`. Use exactly these headings;
   write "none" rather than dropping one:
   - Objectives
   - Non-goals
   - User workflow (owner and/or site visitor, step by step)
   - Functional requirements (numbered, testable)
   - Data / content model (frontmatter, collections, files, URLs)
   - Architecture (which existing parts change; reuse over new systems)
   - Security implications
   - Error handling
   - Acceptance criteria (objectively checkable with `astro check`, the
     build, `dist/` or a described manual check)
   - Unresolved decisions (each with options and your recommendation)

   WHAT and WHY only. The HOW belongs in the plan.
5. **Architecture review.** Call `architect` in spec-review mode on the new
   section (skip for a trivial spec and say so). Fix the issues it
   raises, or list them as unresolved decisions.
6. **Report and STOP.** Give a short summary, the unresolved decisions, and
   anything that needs owner approval because it affects infrastructure,
   security, data ownership, cost or maintainability. Ask the owner to
   approve. Only when they explicitly approve, change the status line to
   `Status: APPROVED (YYYY-MM-DD)` and record material decisions in the
   `PLAN.md` decision log. Then suggest `/plan-phases`.
