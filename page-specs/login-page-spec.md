# Login Page Spec — Alpha Trader

## Purpose

Create a premium Login page for the Alpha Trader personal dashboard.

The current version should use **mock frontend authentication** only.

## Route

Recommended:

```text
/login
```

After successful login:

```text
/dashboard
```

## Layout

Use two-column desktop layout.

### Left Visual Panel

Include:

- Alpha Trader logo
- Tagline: `Your Personal Trading Operating System`
- Short description in Thai:
  `จัดการชีวิต การเทรด ความเสี่ยง และเป้าหมายในที่เดียว`
- Dashboard preview card
- Small KPI preview:
  - Trading Readiness: 82/100
  - Monthly P/L: +$8,742
  - Discipline Score: 86
- Soft pastel gradient background
- Subtle sparkles

### Right Login Card

Include:

- Heading: `Welcome back`
- Subtitle: `Sign in to continue your trading dashboard`
- Email input
- Password input
- Show password toggle
- Remember me checkbox
- Forgot password link as `Coming Soon`
- Sign In button
- Demo Login button
- Error message area
- Footer text: `Alpha Trader Dashboard · Local mock auth`

## Mock Credentials

```text
Email: traderalpha@example.com
Password: alpha1234
```

## Actions

### Sign In

- Validate fields
- Check mock credentials
- Save auth session to localStorage
- Redirect to `/dashboard`
- Show success toast

### Demo Login

- Immediately save mock auth session
- Redirect to `/dashboard`
- Show success toast

### Logout

- Clear localStorage auth session
- Redirect to `/login`

## Validation

| Field | Rule |
|---|---|
| Email | Required, valid email |
| Password | Required, min 6 chars |

## Auth Guard

If not authenticated:

```text
/dashboard and app pages redirect to /login
```

If authenticated and on login:

```text
/login redirects to /dashboard
```

## Non-goals

Do not implement:

- Real backend auth
- Real OAuth
- Real Google login
- Real 2FA
- Real email password reset
- Real token refresh
- Real user database

These are future features.

## QA

- Login page has no sidebar
- Form validation works
- Demo login works
- Wrong credentials show error
- Session stored in localStorage
- Protected routes redirect correctly
- Logout clears session
- Theme matches pastel premium dashboard
