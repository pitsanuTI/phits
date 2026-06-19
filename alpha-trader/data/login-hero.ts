// ──────────────────────────────────────────────────────────────────────────
// Login hero mock data — "My Pod" personal operating system.
// All numbers shown on the Login page derive from this module (or are computed
// here) rather than being hardcoded inside the JSX.
// ──────────────────────────────────────────────────────────────────────────

export type HeroStatIcon = 'focus' | 'track' | 'build' | 'live';

export interface HeroStat {
  id: string;
  label: string;
  sub: string;
  icon: HeroStatIcon;
}

export interface LifeWeeks {
  currentWeek: number;
  totalWeeks: number;
  weeksRemaining: number;
  /** Percentage of life "used", rounded to a whole number. */
  lifeProgress: number;
}

/**
 * Compute the life-weeks summary from a current week (and optional total).
 * If a birth date were available we'd derive `currentWeek` from it; since this
 * is a single-user mock app, we use a fallback current week instead.
 */
export function computeLifeWeeks(currentWeek: number, totalWeeks = 4000): LifeWeeks {
  const safeCurrent = Math.max(0, Math.min(currentWeek, totalWeeks));
  const weeksRemaining = totalWeeks - safeCurrent;
  const lifeProgress = Math.round((safeCurrent / totalWeeks) * 100);
  return { currentWeek: safeCurrent, totalWeeks, weeksRemaining, lifeProgress };
}

// Fallback values (no birth date on file) — Week 1,482 of 4,000.
export const lifeWeeks: LifeWeeks = computeLifeWeeks(1482, 4000);

// Gentle upward "life timeline" sparkline (relative heights, 0–100).
export const lifeSparkline: number[] = [
  10, 16, 13, 22, 19, 26, 23, 31, 28, 37, 34, 44, 41, 50, 47, 58, 64, 72,
];

export const heroStats: HeroStat[] = [
  { id: 'focus', label: 'Focus', sub: 'Deep work',    icon: 'focus' },
  { id: 'track', label: 'Track', sub: 'Every step',   icon: 'track' },
  { id: 'build', label: 'Build', sub: 'Real freedom', icon: 'build' },
  { id: 'live',  label: 'Live',  sub: 'On purpose',   icon: 'live'  },
];

export const loginHero = {
  appName: 'My Pod',
  tagline: 'Your Personal Operating System',

  // Hero headline rendered line-by-line; the last line gets the mint accent.
  heroTitle: ['Your Life.', 'Your Freedom.', 'You Build It.'],
  heroAccentLine: 'You Build It.',

  heroSubtitle:
    'This is your life. Own your time, build your freedom, and make every week count.',
  motivationalLine: 'Discipline today. Freedom tomorrow.',

  lifeWeeksTitle: 'Life is about 4,000 weeks.',
  lifeWeeks,
  lifeSparkline,
  heroStats,

  weeklyQuote: {
    line1: 'You don’t need more time. You need a system.',
    line2: 'Make your weeks work for your dreams.',
  },

  // Mini motivational card inside the login form card.
  weekStart: {
    title: 'Your week starts now. Make it count.',
    sub: 'Today is a new opportunity to build freedom.',
  },

  loginCard: {
    title: 'Welcome back.',
    subtitle: 'Sign in to continue building your best life.',
  },

  footer: {
    brand: 'My Pod · Your Personal Operating System',
    links: ['Privacy Policy', 'Terms of Service'],
  },
} as const;

export type LoginHeroData = typeof loginHero;
