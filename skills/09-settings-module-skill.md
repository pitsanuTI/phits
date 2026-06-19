# 09 — Settings Module Skill

## Purpose

Build Settings as system control, not another analytics dashboard.

## Settings Tabs

```text
General
Appearance Lock
Notifications
Trading Defaults
Data & Backup
Import Sources
Privacy & Protection
```

## Key Rule

Settings should not duplicate Dashboard, Trading Analytics, Review, or Journal data.

## Real Actions

- Save settings to localStorage
- Toggle settings
- Export JSON/CSV
- Import local file
- Reset with confirmation
- Preview theme
- Save trading defaults

## Future / Disabled

- Real OAuth
- Real 2FA
- Real password reset
- Real cloud sync
- Real external API sync

## QA

- Settings actions are realistic
- No fake integrations as working
- Danger Zone uses confirmation
- Appearance Lock prevents theme drift
