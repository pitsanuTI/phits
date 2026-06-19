# 05 — Action / Interaction Skill

## Purpose

Prevent wrong actions and make every button context-correct.

## Real Frontend Actions

Allowed:

- Save settings to localStorage
- Create mock record
- Edit mock record
- Delete mock record with confirmation
- Open modal
- Open drawer
- Apply filters
- Export JSON / CSV
- Import local file
- Show toast
- Toggle settings
- Switch tabs

## Mock Only Actions

Allowed if clearly mock:

- Test notification
- Backup now
- Restore from local file
- Import platform report preview
- Demo login

## Future / Disabled Actions

Do not implement as real unless backend is provided:

- OAuth
- Real email
- Real push notification
- Real broker connection
- Real MT5 API sync
- Real Google Calendar sync
- Real Line/Telegram notification
- Real 2FA
- Real password reset

## QA

- No unrelated actions on page
- Every button has a clear result
- Dangerous actions require confirmation
- Toast appears after save/export/import
