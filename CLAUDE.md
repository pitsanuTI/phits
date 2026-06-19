# CLAUDE.md — Alpha Trader Project Rules

## Project Concept

This project is a single-user **Personal Operating System Dashboard** with a serious **Full-time Trader Command Center**.

The app helps the user manage:

- Dashboard overview
- Today tasks and check-ins
- Work
- Health & Habits
- Learning
- Trading
- Money
- Mood & Journal
- Review
- Calendar
- Settings
- Login / Auth entry page

The main purpose is:

```text
Raw data → Dashboard → Charts → Insights → Actions → Review → Self-improvement
```

## Primary Product Goal

Build a beautiful, premium, pastel, chart-heavy, real-usable web app.

This must not be a static mockup only.  
It must include real local interactions, mock data, forms, validation, modals, drawers, filters, localStorage behavior, and QA checks.

## Recommended Stack

Use:

- Next.js / React
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React Icons
- localStorage / local state for mock data
- Component-based architecture

## Global Locked Rules

Do not modify these unless explicitly requested:

- Sidebar layout
- Sidebar width
- Sidebar spacing
- Sidebar icons
- Sidebar active pill style
- Global pastel premium theme
- Global typography scale
- Global card radius
- Global shadow system
- Existing routes and page shell

## Sidebar Structure

Use this final sidebar:

```text
Dashboard
Today
Work
Health & Habits
Learning
Trading
Money
Mood & Journal
Review
Calendar
Settings
```

## Trading Top Tabs

Trading module must use:

```text
Overview | Funding | Journal | Analytics | Strategy | Backtest | Risk | Review
```

## Settings Tabs

Settings should use:

```text
General
Appearance Lock
Notifications
Trading Defaults
Data & Backup
Import Sources
Privacy & Protection
```

## Login Page Rule

The Login page is separate from the app shell.

Login page should not show the main sidebar.

Use mock authentication first:

- Demo credentials
- localStorage session
- Protected route guard
- Logout action
- No real OAuth
- No real 2FA
- No password reset backend
- No user database unless backend is explicitly provided

## Theme Rule

Use premium pastel dashboard colors:

- Purple / Lavender = primary and active
- Mint / Teal = success / profit / safe
- Sky Blue = neutral info
- Soft Orange = warning
- Soft Coral = danger / loss / destructive
- White / light lavender = background

Avoid harsh reds, dark dashboard backgrounds, heavy black shadows, random neon colors, or off-theme gradients.

## Action Rule

Every action must be context-correct.

Allowed for frontend mock:

- Save to localStorage
- Edit local state
- Open modal
- Open drawer
- Export JSON/CSV
- Import local file
- Show toast
- Apply filter
- Create mock item
- Delete with confirmation

Do not create fake backend actions unless marked as Coming Soon:

- Real OAuth
- Real broker connection
- Real bank/payment connection
- Real push notification
- Real email sending
- Real 2FA
- Real password reset

## QA Before Final Response

Before finishing any page, check:

- Sidebar unchanged
- Theme consistent
- Layout matches reference
- Cards aligned
- Charts responsive
- Actions work
- Forms validate
- No unrelated actions
- No console errors
- Mobile layout does not overflow
