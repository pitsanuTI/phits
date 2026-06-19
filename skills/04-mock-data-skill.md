# 04 — Mock Data Skill

## Purpose

Use realistic mock data that matches the reference images.

## Rules

- Keep mock data in separate files.
- Do not scatter mock data inside components.
- Use consistent symbols: XAUUSD, NAS100, EURUSD, BTCUSD, GBPUSD.
- Use consistent strategies: Breakout, Breakout Retest, Trend Following, ICT Silver Bullet, London Kill Zone, Liquidity Sweep.
- Use realistic values.
- Use green/teal for profit and red/coral for loss.
- Use Thai + English mixed labels if the mockup uses both.

## Suggested Data Files

```text
data/
  trading.mock.ts
  health.mock.ts
  mood.mock.ts
  money.mock.ts
  learning.mock.ts
  work.mock.ts
  settings.mock.ts
  auth.mock.ts
```

## QA

- Mock values display correctly
- Filters use mock arrays
- Actions update local state
- Data persists in localStorage when required
