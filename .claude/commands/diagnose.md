# Diagnose — Structured Debugging Framework

Use this skill when you hit a difficult bug, unexpected behavior, or performance regression.

## Phase 1 — Build a Feedback Loop (Critical)

Before anything else, establish a fast, deterministic pass/fail signal:
- Write a failing test that reproduces the bug
- Or create a minimal repro script
- Make the loop as fast and deterministic as possible

## Phase 2 — Reproduce

Confirm the feedback loop surfaces the actual reported bug (not a tangential issue). Verify it reproduces consistently.

## Phase 3 — Hypothesize

Generate 3–5 falsifiable hypotheses before touching code. Each must state:
> "If X is the cause, then changing Y will make the bug disappear."

## Phase 4 — Instrument

Use targeted debugging (prefer debugger/REPL over logging). Tag any debug statements uniquely for cleanup later.

## Phase 5 — Fix + Regression Test

Write the regression test **before** the fix. Place it at the correct seam where the bug actually occurs in production.

## Phase 6 — Cleanup + Post-Mortem

- Remove all instrumentation
- Verify the original repro is gone
- Note any architectural changes that would prevent similar bugs
