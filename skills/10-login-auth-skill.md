# 10 — Login / Auth Skill

## Purpose

Build a premium Login page for the Alpha Trader dashboard.

The Login page should give the app a real product feeling while using safe frontend-only mock authentication first.

## Key Rule

Login page is separate from the main app shell.

Do not show the main sidebar on the Login page.

## Login Page Goal

The Login page should:

- Match the pastel premium dashboard theme
- Show Alpha Trader branding
- Allow demo login
- Validate email and password
- Save mock session to localStorage
- Redirect to Dashboard after login
- Protect dashboard routes with a simple frontend guard
- Provide logout action

## Do Not Implement Yet

Unless backend requirements are explicitly provided, do not implement:

- Real user database
- Real OAuth
- Real Google login
- Real 2FA
- Real email sending
- Real password reset
- Real session token validation
- Real secure auth

These can appear as disabled / Coming Soon if needed.

## Recommended Login UI

Layout:

```text
Login Page
├── Left Visual Panel
│   ├── Alpha Trader logo
│   ├── Premium gradient illustration / dashboard preview
│   ├── Key benefits
│   └── Trading readiness / performance preview card
│
└── Right Login Card
    ├── Welcome Back
    ├── Email input
    ├── Password input
    ├── Remember me
    ├── Forgot password disabled/coming soon
    ├── Sign In button
    ├── Demo Login button
    └── Status / validation messages
```

## Mock Credentials

Use:

```text
Email: traderalpha@example.com
Password: alpha1234
```

Also include a **Demo Login** button that logs in without typing.

## Auth State

Use localStorage:

```text
alphaTraderAuth = {
  isAuthenticated: true,
  user: {
    name: "Trader Alpha",
    email: "traderalpha@example.com",
    plan: "Premium"
  },
  loginAt: ISODateString
}
```

## Required Actions

- Submit login
- Demo login
- Toggle remember me
- Show / hide password
- Logout
- Redirect after login
- Protected route check

## Validation

- Email required
- Email format valid
- Password required
- Password min 6 chars
- Wrong credentials show error
- Loading state while signing in
- Success toast after login

## Design Rules

- Use pastel premium theme
- Purple primary button
- Mint success state
- Soft coral error state
- Rounded glass login card
- Soft gradient visual panel
- Small sparkle accents allowed
- No dark login page

## QA

- Login page does not show sidebar
- Login form validates
- Demo login works
- Session saved to localStorage
- Dashboard protected
- Logout clears session
- Wrong password shows error
- No real backend action is faked
