const SESSION_KEY = 'alpha_trader_session';

export type AuthProvider = 'password' | 'google' | 'outlook' | 'demo';

export interface UserSession {
  email: string;
  name: string;
  avatar: string;
  role: string;
  provider?: AuthProvider;
}

// Single-user credential — change password here to something only you know.
const MOCK_CREDENTIALS = { username: 'Phitsanu.p', password: 'Tikpsn546$$' };

const ADMIN_USER: UserSession = {
  email: 'pitsanu19921@gmail.com',
  name: 'Pitsanu',
  avatar: '',
  role: 'Admin',
  provider: 'password',
};

const DEMO_USER: UserSession = {
  email: 'traderalpha@example.com',
  name: 'Trader Alpha',
  avatar: '',
  role: 'Premium',
  provider: 'demo',
};

function persist(user: UserSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

/**
 * Sign in with the local mock credential (username `admin`, password `admin`).
 * Accepts either the literal username or an e-mail typed into the same field.
 */
export function login(identifier: string, password: string): { ok: boolean; error?: string } {
  const id = identifier.trim();
  if (!id) return { ok: false, error: 'กรุณากรอก Email หรือ Username' };
  if (!password) return { ok: false, error: 'กรุณากรอก Password' };
  if (id.toLowerCase() === MOCK_CREDENTIALS.username.toLowerCase() && password === MOCK_CREDENTIALS.password) {
    persist(ADMIN_USER);
    return { ok: true };
  }
  return { ok: false, error: 'Email หรือ Password ไม่ถูกต้อง' };
}

/**
 * Simulated social sign-in. This is a **local mock** — it does NOT perform real
 * OAuth or contact Google/Microsoft. It just creates a local session so the user
 * can explore the dashboard as if they had signed in with that provider.
 */
export function socialLogin(provider: 'google' | 'outlook'): UserSession {
  const user: UserSession =
    provider === 'google'
      ? { email: 'builder@gmail.com', name: 'Builder', avatar: '', role: 'Google Account', provider: 'google' }
      : { email: 'builder@outlook.com', name: 'Builder', avatar: '', role: 'Outlook Account', provider: 'outlook' };
  persist(user);
  return user;
}

export function demoLogin(): void {
  persist(DEMO_USER);
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as UserSession; } catch { return null; }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
