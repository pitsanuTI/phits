# 01 — UI Lock Skill

## Purpose

Use this skill whenever building or editing any page in the app.

## Locked Areas

Never modify:

- Sidebar width
- Sidebar labels
- Sidebar icon style
- Sidebar spacing
- Sidebar active pill
- App shell layout
- Global background
- Global typography
- Global card radius
- Global shadow style
- Existing theme tokens

## Editable Area

Only edit the page or tab requested by the user.

Example:

```text
Build Trading > Backtest main content only.
Do not modify the sidebar.
Do not modify other Trading tabs.
```

## QA

- Sidebar still matches existing design
- Active sidebar item is correct
- Main content changed only where requested
- No unrelated route changes
