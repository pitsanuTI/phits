# Grill With Docs — Deep Planning Interview

Use this before starting a significant new feature. Forces shared understanding of domain language and architecture before writing code.

## What This Does

Conduct a relentless one-question-at-a-time interview about the plan, stress-testing it against existing domain language and architectural decisions.

## Behavior

**Domain Interrogation**
- Challenge vague terminology against the existing codebase
- Surface contradictions between stated intent and what actually exists
- Sharpen imprecise language into canonical terms

**Evidence-Based**
- Explore the codebase directly when questions can be answered that way
- Don't speculate — look first

**Scenario Testing**
- Invent concrete edge cases to probe boundaries
- Force precision on domain relationships

**One question at a time** — wait for an answer before proceeding.

## ADR Criteria

Only propose an Architecture Decision Record when ALL three hold:
1. The decision is costly to reverse
2. Future readers would naturally question the choice
3. Real trade-offs between alternatives genuinely existed

## Usage

Start a session with `/grill-with-docs` before planning any major feature or refactor.
