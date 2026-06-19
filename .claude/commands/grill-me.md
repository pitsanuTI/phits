# Grill Me — Exhaustive Planning Interview

Use this when you want Claude to stress-test your plan or design through systematic questioning before committing to an approach.

## What This Does

Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree.

## Behavior

- Asks **one question at a time**
- Offers a recommended answer for each question
- Explores the codebase when questions can be answered through code review
- Maps dependencies between decisions — resolves each before moving to interconnected choices

## When to Use

- Before starting a new feature or module
- When a design feels uncertain or underspecified
- When you want to surface assumptions before they become bugs

## Usage

Start with `/grill-me` followed by a brief description of your plan, and Claude will interview you until the design is solid.
