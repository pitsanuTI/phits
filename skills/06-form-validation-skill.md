# 06 — Form + Validation Skill

## Purpose

Use this skill when building forms, modals, login, journal, settings, or trade entry.

## Global Form Rules

- Every input must have label.
- Required fields must validate.
- Save button must show loading state.
- Errors must be visible.
- Success must show toast.
- Prevent double submit.
- Confirm destructive actions.
- Use localStorage or local state if backend is unavailable.

## Trading Form Requirements

Trade journal should support:

- Symbol
- Account
- Strategy
- Session
- Direction
- Entry
- Stop Loss
- Take Profit
- Exit
- R-Multiple
- MFE
- MAE
- Emotion
- Screenshot placeholder
- Lesson learned

## Login Form Requirements

Login should support:

- Email
- Password
- Remember me
- Demo login
- Validation
- localStorage session
- Redirect after login
- Logout action

## QA

- Empty required fields show errors
- Invalid email shows error
- Save/login buttons disable while loading
- Success state works
- Data persists if required
