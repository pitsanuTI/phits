/* Habit Health Lab — all data mirrors the reference design. */

export type HabitStatus = 'No Data' | 'Missed' | 'Partial' | 'Completed' | 'Perfect';

export interface Habit {
  id: string;
  name: string;
  icon: string;          // emoji
  category: string;
  unit: string;          // pages / minutes / ml / hours / day
  value: number;         // today's logged value
  goal: number;          // today's target
  reminder: string;      // HH:MM AM/PM
  consistency: number;   // month avg %
}

export const initialHabits: Habit[] = [
  { id: 'h1', name: 'Morning Exercise', icon: '🏃', category: 'Fitness', unit: 'minutes', value: 0,    goal: 30,   reminder: '08:00', consistency: 91 },
  { id: 'h2', name: 'Meditation',       icon: '🧘', category: 'Mind',    unit: 'minutes', value: 5,    goal: 10,   reminder: '09:00', consistency: 82 },
  { id: 'h3', name: 'Read Book',        icon: '📖', category: 'Growth',  unit: 'pages',   value: 20,   goal: 20,   reminder: '15:00', consistency: 76 },
  { id: 'h4', name: 'Drink Water',      icon: '💧', category: 'Health',  unit: 'ml',      value: 1800, goal: 2500, reminder: '12:30', consistency: 96 },
  { id: 'h5', name: 'No Sugar',         icon: '🚫', category: 'Diet',    unit: 'day',     value: 1,    goal: 1,    reminder: '17:30', consistency: 58 },
  { id: 'h6', name: 'Sleep 7+ Hours',   icon: '🌙', category: 'Recovery',unit: 'hours',   value: 7.5,  goal: 7,    reminder: '22:30', consistency: 88 },
  { id: 'h7', name: 'Gratitude Journal',icon: '📓', category: 'Mind',    unit: 'minutes', value: 0,    goal: 5,    reminder: '21:00', consistency: 68 },
  { id: 'h8', name: 'Stretching',       icon: '🤸', category: 'Fitness', unit: 'minutes', value: 0,    goal: 15,   reminder: '07:30', consistency: 71 },
];

export function habitStatus(h: { value: number; goal: number }): HabitStatus {
  if (h.value <= 0) return 'Missed';
  if (h.value >= h.goal * 1.05) return 'Perfect';
  if (h.value >= h.goal) return 'Completed';
  return 'Partial';
}

export const STATUS_COLORS: Record<HabitStatus, string> = {
  'No Data':  '#eef2f6',
  'Missed':   '#dbe2ea',
  'Partial':  '#bbf7d0',
  'Completed':'#4ade80',
  'Perfect':  '#16a34a',
};

export const STATUS_TEXT: Record<HabitStatus, string> = {
  'No Data':  'text-slate-400',
  'Missed':   'text-rose-500 bg-rose-50',
  'Partial':  'text-amber-600 bg-amber-50',
  'Completed':'text-emerald-600 bg-emerald-50',
  'Perfect':  'text-emerald-700 bg-emerald-100',
};

/* Deterministic heatmap level 0-4 for habit row × day (1-31)
   currentDay = last day with data (pass today's day for current month, or 31 for past months) */
export function heatLevel(habitIndex: number, day: number, currentDay: number = 7): number {
  if (day > currentDay) return 0;
  const seed = (habitIndex * 7 + day * 13) % 17;
  if (seed < 2) return 1;
  if (seed < 6) return 2;
  if (seed < 12) return 3;
  return 4;
}

export const LEVEL_COLORS = ['#eef2f6', '#dbe2ea', '#bbf7d0', '#4ade80', '#16a34a'];
export const LEVEL_LABELS = ['No Data', 'Missed', 'Partial', 'Completed', 'Perfect'];

/* ── Heatmap summary ── */
export const heatmapSummary = {
  totalActive: 8,
  perfectDays: 112,
  missedLogs: 18,
  bestStreak: 12,
  monthCompletion: 84,
};

/* ── Day-of-week completion ── */
export const dayOfWeek = [
  { day: 'Mon', value: 76 }, { day: 'Tue', value: 82 }, { day: 'Wed', value: 79 },
  { day: 'Thu', value: 87 }, { day: 'Fri', value: 86 }, { day: 'Sat', value: 90 }, { day: 'Sun', value: 84 },
];

/* ── Recent notes ── */
export interface Note { id: string; text: string; time: string; mood: 'good' | 'bad' | 'water' | 'neutral'; }
export const initialNotes: Note[] = [
  { id: 'n1', text: 'Great morning workout! Felt energized all day.', time: 'Today, 8:15 AM', mood: 'good' },
  { id: 'n2', text: 'Skipped meditation due to a busy schedule.', time: 'Yesterday, 9:30 PM', mood: 'neutral' },
  { id: 'n3', text: 'Read a few great pages before bed.', time: 'Jun 5, 10:45 PM', mood: 'good' },
  { id: 'n4', text: 'Hit my water goal! Feeling refreshed.', time: 'Jun 5, 7:20 PM', mood: 'water' },
  { id: 'n5', text: "Couldn't resist sugar at the party.", time: 'Jun 4, 9:10 PM', mood: 'bad' },
];

/* ── Weekly trend ── */
export const weeklyCompletion = [
  { day: 'Mon', rate: 64, total: 12 }, { day: 'Tue', rate: 72, total: 15 }, { day: 'Wed', rate: 66, total: 14 },
  { day: 'Thu', rate: 78, total: 18 }, { day: 'Fri', rate: 74, total: 17 }, { day: 'Sat', rate: 88, total: 21 }, { day: 'Sun', rate: 96, total: 24 },
];

/* ── Streak ── */
export const streak = { current: 12, best: 18, towardReview: 30, progress: 60 };
export const streakCalendar = Array.from({ length: 21 }, (_, i) => (i % 7 === 6 ? (i > 14 ? 0 : 2) : ((i * 5) % 4) + 1));

/* ── Health metrics (Health Metrics + Overview) ── */
export const initialMetrics = {
  weight: 72.4, bodyFat: 18.5, bodyWater: 56.8, sleepScore: 82, steps: 8432, healthScore: 81,
  bmi: 23.8, muscle: 34.2, visceralFat: 6, bmr: 1712, hydration: 2.1, hydrationGoal: 2.5,
  sleepHours: 7.5, mood: 'Good', energy: 'High', restingHr: 56, stress: 28, bp: '118/76',
};
export type Metrics = typeof initialMetrics;

export const weightTrend30 = [
  74.3, 74.1, 73.8, 73.6, 73.9, 73.4, 73.0, 72.9, 72.6, 72.8,
  72.4, 72.2, 72.5, 72.1, 71.8, 72.0, 72.3, 72.1, 72.4, 72.2,
  72.0, 72.3, 72.1, 72.4, 72.2, 72.5, 72.3, 72.1, 72.4, 72.4,
].map((v, i) => ({ d: i, label: i % 7 === 0 ? `May ${5 + i}` : '', value: v }));

export const wellness30 = [
  72, 70, 74, 76, 71, 73, 75, 78, 74, 76, 72, 70, 73, 75, 77,
  74, 72, 76, 79, 75, 73, 77, 80, 76, 74, 78, 81, 79, 80, 81,
].map((v, i) => ({ d: i, label: i % 7 === 0 ? `May ${5 + i}` : '', value: v }));

export const hydrationWeek = [2.3, 2.4, 2.2, 2.5, 2.1, 1.9, 2.0].map((v, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v }));
export const sleepWeek = [7.2, 7.5, 6.8, 7.6, 7.1, 8.0, 7.0].map((v, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v }));
export const activityWeek = [
  { day: 'Mon', steps: 9200, mins: 78 }, { day: 'Tue', steps: 8800, mins: 82 }, { day: 'Wed', steps: 7400, mins: 65 },
  { day: 'Thu', steps: 9600, mins: 90 }, { day: 'Fri', steps: 9100, mins: 84 }, { day: 'Sat', steps: 7900, mins: 70 }, { day: 'Sun', steps: 7432, mins: 71 },
];

export const vitals = [
  { icon: '❤️', label: 'Resting Heart Rate', value: '56 bpm', tag: 'Good', tone: 'good' },
  { icon: '🌀', label: 'Stress', value: '28', tag: 'Low', tone: 'good' },
  { icon: '⚡', label: 'Energy', value: '7.8 / 10', tag: 'High', tone: 'good' },
  { icon: '🩸', label: 'Blood Pressure', value: '118 / 76 mmHg', tag: 'Normal', tone: 'info' },
];

/* sparkline generator for metric mini-cards */
export const spark = (seed: number) => Array.from({ length: 16 }, (_, i) => ({ v: 50 + Math.sin((i + seed) * 0.8) * 12 + ((i * seed) % 5) }));

/* ── Body composition ── */
export const bodyKpis = [
  { label: 'Weight',      value: '72.4', unit: 'kg', note: '↓ 1.2 kg vs last week', tone: 'good',    icon: '⚖️' },
  { label: 'BMI',         value: '23.6', unit: '',   note: 'Normal',                tone: 'info',    icon: '🧭' },
  { label: 'Body Fat',    value: '18.5', unit: '%',  note: '↓ 1.8% vs last week',   tone: 'warn',    icon: '％' },
  { label: 'Muscle Mass', value: '56.8', unit: 'kg', note: '↑ 1.3 kg vs last week', tone: 'premium', icon: '💪' },
  { label: 'Body Water',  value: '55.2', unit: '%',  note: '↑ 0.8% vs last week',   tone: 'info',    icon: '💧' },
  { label: 'Visceral Fat',value: '6',    unit: '',   note: 'Healthy Range',         tone: 'good',    icon: '🫁' },
];

export const compositionTrend = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({
  month: m,
  weight: [76, 75.6, 75.2, 74.6, 74, 73.6, 73.2, 72.9, 72.7, 72.5, 72.4, 72.4][i],
  bodyFat: [24, 23.4, 22.8, 22, 21.2, 20.6, 20, 19.6, 19.2, 18.9, 18.6, 18.5][i],
  muscle: [50, 50.6, 51.2, 52, 52.8, 53.6, 54.4, 55.1, 55.7, 56.2, 56.6, 56.8][i],
}));

export const compositionBreakdown = [
  { name: 'Muscle Mass', value: 56.8, pct: 78.5, color: '#22c55e' },
  { name: 'Fat Mass',    value: 13.4, pct: 18.5, color: '#f59e0b' },
  { name: 'Bone Mass',   value: 2.8,  pct: 3.9,  color: '#3b82f6' },
  { name: 'Other',       value: 0,    pct: 0,    color: '#a78bfa' },
];

export const measurements = [
  { icon: '📏', name: 'Waist', current: 82.0, last: 83.5 },
  { icon: '🫀', name: 'Chest', current: 100.0, last: 99.0 },
  { icon: '🦴', name: 'Hip',   current: 97.0, last: 96.5 },
  { icon: '💪', name: 'Arm',   current: 31.5, last: 31.0 },
  { icon: '🦵', name: 'Thigh', current: 54.0, last: 53.0 },
  { icon: '🧣', name: 'Neck',  current: 37.0, last: 37.0 },
];

export const bodyFooter = [
  { icon: '🔥', label: 'BMR', value: '1,712', unit: 'kcal', note: 'Calories your body burns at rest', color: '#f97316' },
  { icon: '🦴', label: 'Bone Mass', value: '2.8', unit: 'kg', note: '3.9% of total weight', color: '#3b82f6' },
  { icon: '🏃', label: 'Metabolic Age', value: '24', unit: 'yrs', note: 'Younger than your actual age', color: '#a78bfa' },
  { icon: '📅', label: 'Last Check-in', value: 'Jun 7, 2026', unit: '', note: '7:45 AM', color: '#16a34a' },
];

/* ── Insights / Overview key insights ── */
export const keyInsights = [
  { icon: '🏆', label: 'Best Habit', value: 'Drink Water', note: '98% completion', tone: 'good' },
  { icon: '⚠️', label: 'Needs Attention', value: 'Meditation', note: '54% completion', tone: 'warn' },
  { icon: '⏰', label: 'Best Time', value: 'Morning', note: '82% completion', tone: 'info' },
  { icon: '🛏️', label: 'Sleep Impact', value: 'Excellent', note: '7.5h average', tone: 'premium' },
];

export const reminders = [
  { icon: '🏃', name: 'Morning Exercise', time: '08:00' },
  { icon: '🧘', name: 'Meditation', time: '09:00' },
  { icon: '📖', name: 'Read Book', time: '15:00' },
  { icon: '💧', name: 'Drink Water', time: '12:30' },
  { icon: '🚫', name: 'No Sugar', time: '17:30' },
  { icon: '🌙', name: 'Sleep 7+ Hours', time: '22:30' },
];

/* ── Insights tab ── */
export const insightTopCards = {
  scoreTrend: { delta: '+12', from: 78, to: 90, spark: [78, 79, 80, 82, 81, 84, 85, 87, 86, 88, 90] },
};

export const insightCorrelations = [
  { icon: '💧', habit: 'Drink Water',     metric: 'Body Water',      metricNote: '+2.1%',     r: 0.78,  dir: 'Positive', strength: 'Strong',   level: 'High',   levelTone: 'good' },
  { icon: '🌙', habit: 'Sleep 7+ Hours',  metric: 'Completion Rate', metricNote: '+27%',      r: 0.65,  dir: 'Positive', strength: 'Moderate', level: 'Medium', levelTone: 'warn' },
  { icon: '🏃', habit: 'Morning Exercise',metric: 'Mood Score',      metricNote: '+1.2 pts',  r: 0.56,  dir: 'Positive', strength: 'Moderate', level: 'Medium', levelTone: 'warn' },
  { icon: '🧘', habit: 'Meditation',      metric: 'Stress Level',    metricNote: '-0.31 pts', r: -0.41, dir: 'Negative', strength: 'Strong',   level: 'Good',   levelTone: 'good' },
];

export const insightTimeline = [
  { icon: '🏆', day: 'Mon 19', title: 'New record!',        note: 'Highest log completion rate this week: 61%', tag: 'Achievement', tone: 'good' },
  { icon: '💧', day: 'Tue 20', title: 'Hydration win',      note: 'Hit 2L goal 5 days in a row',                tag: 'Streak',      tone: 'info' },
  { icon: '🌙', day: 'Wed 21', title: 'Sleep improving',    note: 'Average sleep: 7.2h vs last week',           tag: 'Improvement', tone: 'premium' },
  { icon: '☀️', day: 'Thu 22', title: 'Active morning boost',note: 'Earlier days work: +18% higher mood',       tag: 'Insight',     tone: 'warn' },
  { icon: '🍩', day: 'Fri 23', title: 'Sugar dip detected', note: 'Higher cravings on 3 nights this week',      tag: 'Alert',       tone: 'danger' },
];

export const insightRecommendations = [
  { n: 1, icon: '💧', color: '#16a34a', title: 'Keep hydrating consistently', note: "You're close to 5-day perfect streak", tag: 'High Impact',   tone: 'good' },
  { n: 2, icon: '📅', color: '#3b82f6', title: 'Protect your sleep window',    note: 'Aim for bed before 10:00 PM tonight',  tag: 'High Impact',   tone: 'info' },
  { n: 3, icon: '🧘', color: '#8b5cf6', title: 'Meditate daily',               note: '10 min daily to build a 14-day streak.', tag: 'Medium Impact', tone: 'premium' },
  { n: 4, icon: '⏰', color: '#f59e0b', title: 'Reduce late-night sugar',      note: 'Add sugar-free 7 PM to improve sleep.', tag: 'Medium Impact', tone: 'warn' },
];

export const bestTimeBars = [3, 4, 5, 7, 9, 12, 10, 8, 6, 5, 4, 6, 5, 3].map((v, i) => ({ i, v, peak: i === 5 }));
export const bestDayBars = [{ d: 'M', v: 6 }, { d: 'T', v: 7 }, { d: 'W', v: 6 }, { d: 'T', v: 8 }, { d: 'F', v: 7 }, { d: 'S', v: 9 }, { d: 'S', v: 12, peak: true }];

export const improvedMetrics = [
  { icon: '💧', label: 'Body Water',   pct: 70, value: '+2.1%' },
  { icon: '🌙', label: 'Sleep Quality',pct: 88, value: '+15%' },
  { icon: '😊', label: 'Mood Score',   pct: 62, value: '+1.4 pts' },
  { icon: '🌀', label: 'Stress Level', pct: 40, value: '-1.0 pts' },
];

export const focusAreas = [
  { icon: '🚫', title: 'Low No Sugar Completion', note: 'Only 45% completion this month.', tag: 'Needs Attention', tone: 'danger' },
  { icon: '🌙', title: 'Inconsistent Sleep',      note: '3 nights with < 6 hours this week.', tag: 'Monitor',     tone: 'warn' },
  { icon: '💧', title: 'Hydration Consistency',   note: 'Missed goal 2 days this week.',    tag: 'Opportunity',   tone: 'info' },
];
