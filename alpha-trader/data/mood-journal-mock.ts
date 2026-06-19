import type {
  MoodMeta, MoodLevel, DayEntry, JournalEntry, TrendPoint,
  Correlation, ThemeWord, ImprovementTheme, PromptCategory,
  GuidedPrompt, MoneyEntry, FillInItem, MotionNote,
} from '@/types/mood-journal';

// ── Mood scale ────────────────────────────────────────────────────────────────
export const MOODS: Record<MoodLevel, MoodMeta> = {
  5: { level: 5, label: 'Great', labelTh: 'ดีมาก',  emoji: '😄', color: '#10b981', bg: '#d1fae5' },
  4: { level: 4, label: 'Good',  labelTh: 'ดี',     emoji: '🙂', color: '#7c5cbf', bg: '#ede9ff' },
  3: { level: 3, label: 'Okay',  labelTh: 'ปกติ',   emoji: '😐', color: '#f59e0b', bg: '#fef3c7' },
  2: { level: 2, label: 'Low',   labelTh: 'แย่',     emoji: '😟', color: '#f97316', bg: '#fff7ed' },
  1: { level: 1, label: 'Tough', labelTh: 'หนัก',   emoji: '😣', color: '#f43f5e', bg: '#fff1f2' },
};

export const MOOD_LEGEND = [5, 4, 3, 2, 1].map(l => MOODS[l as MoodLevel]);

// ── Calendar — May 2025 (deterministic) ─────────────────────────────────────
const moodSeq: (MoodLevel | null)[] = [
  // leading days from prev month (27-30 Apr) handled separately
  4, 3, 5,                       // 1,2,3
  null, 5, 2, null, 4, 3, 5,     // 4-10
  null, 4, 3, 2, 3, 4, null,     // 11-17
  2, 3, 4, 3, 4, 3, null,        // 18-24
  1, 5, 4, 3, 1, 4, 5,           // 25-31
];

const JOURNAL_TITLES = [
  'Focused Day', 'Market Review', 'Deep Learning', 'Family Time', 'Strategy Day',
  'Quiet Day', 'Recovery Day', 'Win Streak', 'Reflection', 'New Insight',
  'Gratitude Day', 'Discipline Check', 'Risk Review', 'Calm Trading', 'Big Move',
  'Slow Start', 'Strong Finish', 'Team Sync', 'Solo Focus', 'Plan Ahead',
  'Backtesting', 'Mindset Reset', 'Cash Flow Day', 'System Audit', 'Reading Day',
  'Meditation', 'Loss Lesson', 'Break Day', 'Energy Boost', 'Milestone', 'Year Plan',
];

export const calendarDays: DayEntry[] = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const mood = moodSeq[i] ?? null;
  const seed = (day * 37) % 11;
  return {
    date: `2025-05-${String(day).padStart(2, '0')}`,
    day,
    mood,
    energy: mood ? Math.min(10, 4 + seed % 6) : 0,
    score: mood ? +(5 + (seed % 5) + (mood - 3) * 0.6).toFixed(1) : 0,
    tags: mood ? (['Gratitude', 'Investing', 'Focus', 'Learning', 'Family'].slice(0, 1 + (seed % 3))) : [],
    hasJournal: mood !== null && seed % 4 !== 0,
    hasAttachment: mood !== null && seed % 3 === 0,
    moneyFeeling: mood && mood >= 4 ? 'Confident' : mood === 3 ? 'Calm' : mood ? 'Anxious' : undefined,
    title: mood ? JOURNAL_TITLES[i % JOURNAL_TITLES.length] : undefined,
  };
});

// Leading blanks (Apr 27-30, since May 1 2025 = Thursday)
export const calendarLeading = [27, 28, 29, 30];

// ── Generate calendar data for any month ────────────────────────────────────
export function generateMonthData(year: number, month: number): { days: DayEntry[]; leadingDays: number[] } {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => prevMonthDays - firstDayOfWeek + 1 + i);

  const days: DayEntry[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateSeed = (year * 13 + month * 7 + day * 37) % 11;
    const moodVal = dateSeed % 3 === 0 ? null : (((dateSeed + day) % 5) + 1) as MoodLevel;
    const mood = moodVal && moodVal >= 1 && moodVal <= 5 ? moodVal : null;
    return {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day,
      mood,
      energy: mood ? Math.min(10, 4 + dateSeed % 6) : 0,
      score: mood ? +(5 + (dateSeed % 5) + (mood - 3) * 0.6).toFixed(1) : 0,
      tags: mood ? (['Gratitude', 'Investing', 'Focus', 'Learning', 'Family'].slice(0, 1 + (dateSeed % 3))) : [],
      hasJournal: mood !== null && dateSeed % 4 !== 0,
      hasAttachment: mood !== null && dateSeed % 3 === 0,
      moneyFeeling: mood && mood >= 4 ? 'Confident' : mood === 3 ? 'Calm' : mood ? 'Anxious' : undefined,
      title: mood ? JOURNAL_TITLES[(day + month) % JOURNAL_TITLES.length] : undefined,
    };
  });

  return { days, leadingDays };
}

export const MOOD_FEELINGS = [
  'Happy', 'Grateful', 'Calm', 'Focused', 'Confident',
  'Anxious', 'Stressed', 'Tired', 'Sad', 'Frustrated',
  'Excited', 'Hopeful', 'Overwhelmed', 'Peaceful', 'Motivated',
];

// ── Journal Timeline entries ────────────────────────────────────────────────
export const journalEntries: JournalEntry[] = [
  {
    id: 'j1', date: 'Tue, May 20, 2025', time: '9:15 PM', mood: 4, energy: 7,
    tags: ['Gratitude', 'Investing', 'Discipline'], moneyFeeling: 'Grateful for steady growth and staying consistent.',
    highlights: 'Stayed focused on my trades today and avoided overtrading. Felt proud of my patience.',
    moneyBelief: 'I am becoming a disciplined and profitable investor.',
    nextIntention: 'Review results and plan tomorrow\'s trades with clarity.',
    hasImage: true, hasDoc: true,
  },
  {
    id: 'j2', date: 'Mon, May 19, 2025', time: '8:40 PM', mood: 4, energy: 6,
    tags: ['Calm', 'Focus'], moneyFeeling: 'Peaceful day with clear decisions.',
    highlights: 'Good execution on my London session setups. Kept risk small.',
    moneyBelief: 'Consistency compounds over time.',
    nextIntention: 'Keep journaling every session.',
    hasImage: false, hasDoc: true,
  },
  {
    id: 'j3', date: 'Sun, May 18, 2025', time: '7:30 PM', mood: 3, energy: 5,
    tags: ['Anxious', 'Overwhelm'], moneyFeeling: 'Felt anxious about market volatility.',
    highlights: 'Market was choppy, I stepped back and observed instead of forcing trades.',
    moneyBelief: 'It is okay to sit on hands when unclear.',
    nextIntention: 'Wait for A+ setups only.',
    hasImage: false, hasDoc: true,
  },
  {
    id: 'j4', date: 'Sat, May 17, 2025', time: '9:05 PM', mood: 4, energy: 7,
    tags: ['Learning', 'Research'], moneyFeeling: 'Learned a lot from today\'s analysis.',
    highlights: 'Backtested a new strategy and documented the rules carefully.',
    moneyBelief: 'Education is my best investment.',
    nextIntention: 'Apply the new rules on demo first.',
    hasImage: true, hasDoc: false,
  },
  {
    id: 'j5', date: 'Fri, May 16, 2025', time: '8:50 PM', mood: 5, energy: 8,
    tags: ['Gratitude', 'Family'], moneyFeeling: 'Amazing day with family and strong trades.',
    highlights: 'Balanced trading with quality family time. Best of both worlds.',
    moneyBelief: 'Wealth and relationships can grow together.',
    nextIntention: 'Protect weekends for recovery.',
    hasImage: true, hasDoc: false,
  },
];

// ── Week Overview (mood line, May 14-20) ────────────────────────────────────
export const weekOverview: TrendPoint[] = [
  { date: 'Wed 14', value: 2 },
  { date: 'Thu 15', value: 3 },
  { date: 'Fri 16', value: 5 },
  { date: 'Sat 17', value: 4 },
  { date: 'Sun 18', value: 3 },
  { date: 'Mon 19', value: 4 },
  { date: 'Tue 20', value: 5 },
];

// ── 30-day trends ──────────────────────────────────────────────────────────
function gen30(base: number, amp: number, seed: number): TrendPoint[] {
  return Array.from({ length: 15 }, (_, i) => {
    const d = i * 2 + 5;
    const v = base + Math.sin((i + seed) * 0.7) * amp + ((i * seed) % 3) * 0.4;
    return { date: `May ${d > 31 ? d - 31 : d}`, value: +Math.max(1, v).toFixed(1) };
  });
}
export const moodTrend30   = gen30(3.4, 1.0, 1);
export const energyTrend30 = gen30(6.3, 1.8, 3);

// ── Correlations ─────────────────────────────────────────────────────────────
function scatter(n: number, slope: number, noise: number, seed: number) {
  return Array.from({ length: n }, (_, i) => {
    const x = +(((i * 53 + seed * 7) % 100) / 10).toFixed(1);
    const y = +Math.max(0, Math.min(10, x * slope + 3 + (((i * seed) % 7) - 3) * noise)).toFixed(1);
    return { x, y };
  });
}
export const correlations: Correlation[] = [
  { labelA: 'Sleep', labelB: 'Mood',       iconA: '🌙', iconB: '😊', r: 0.72,  strength: 'Strong',   color: '#7c5cbf', points: scatter(28, 0.7, 0.5, 2) },
  { labelA: 'Stress', labelB: 'Energy',    iconA: '🎯', iconB: '⚡', r: -0.65, strength: 'Strong',   color: '#38bdf8', points: scatter(28, -0.6, 0.6, 5) },
  { labelA: 'Money Emotion', labelB: 'Confidence', iconA: '❤️', iconB: '💎', r: 0.58, strength: 'Moderate', color: '#f43f5e', points: scatter(28, 0.55, 0.7, 8) },
];

// ── Themes ───────────────────────────────────────────────────────────────────
export const themeWords: ThemeWord[] = [
  { word: 'learning', weight: 5 }, { word: 'gratitude', weight: 5 },
  { word: 'growth', weight: 3 }, { word: 'stress', weight: 4 }, { word: 'focus', weight: 3 }, { word: 'health', weight: 3 },
  { word: 'relationships', weight: 2 }, { word: 'mindset', weight: 2 }, { word: 'goals', weight: 2 }, { word: 'money', weight: 2 },
  { word: 'habits', weight: 1 }, { word: 'self-care', weight: 1 }, { word: 'confidence', weight: 1 }, { word: 'discipline', weight: 1 }, { word: 'balance', weight: 1 },
];

export const improvementThemes: ImprovementTheme[] = [
  { label: 'Stress Management', pct: 42 },
  { label: 'More Consistency',  pct: 31 },
  { label: 'Better Sleep',      pct: 27 },
  { label: 'Financial Discipline', pct: 22 },
  { label: 'Self-Confidence',   pct: 18 },
];

// ── Prompt categories ────────────────────────────────────────────────────────
export const promptCategories: PromptCategory[] = [
  { id: 'self',     label: 'Self-awareness', icon: '🧠', gradient: ['#7c5cbf', '#a78bfa'] },
  { id: 'emotion',  label: 'Emotion',        icon: '💚', gradient: ['#10b981', '#34d399'] },
  { id: 'learning', label: 'Learning',       icon: '📖', gradient: ['#38bdf8', '#7dd3fc'] },
  { id: 'gratitude',label: 'Gratitude',      icon: '🤲', gradient: ['#f59e0b', '#fbbf24'] },
  { id: 'improve',  label: 'Improvement',    icon: '📈', gradient: ['#f43f5e', '#fb7185'] },
  { id: 'money',    label: 'Money Mindset',  icon: '💎', gradient: ['#ec4899', '#f9a8d4'] },
];

export const guidedPrompts: GuidedPrompt[] = [
  { id: 'p1', question: 'What happened today?',           category: 'Self-awareness', categoryColor: '#7c5cbf' },
  { id: 'p2', question: 'What did I learn?',              category: 'Learning',       categoryColor: '#38bdf8' },
  { id: 'p3', question: 'What am I grateful for?',        category: 'Gratitude',      categoryColor: '#f59e0b' },
  { id: 'p4', question: 'What can I improve tomorrow?',   category: 'Improvement',    categoryColor: '#f43f5e' },
  { id: 'p5', question: 'What is my intention for tomorrow?', category: 'Self-awareness', categoryColor: '#7c5cbf' },
];

export const reflectionConsistency: TrendPoint[] = [
  { date: 'Mon', value: 8 }, { date: 'Tue', value: 6 }, { date: 'Wed', value: 9 },
  { date: 'Thu', value: 11 }, { date: 'Fri', value: 7 }, { date: 'Sat', value: 5 }, { date: 'Sun', value: 4 },
];

// ── Money Mindset ────────────────────────────────────────────────────────────
export const moneyEmotionTrend: TrendPoint[] = [
  { date: 'May 14', value: 6.0 }, { date: 'May 15', value: 5.5 }, { date: 'May 16', value: 7.5 },
  { date: 'May 17', value: 6.5 }, { date: 'May 18', value: 5.0 }, { date: 'May 19', value: 7.0 }, { date: 'May 20', value: 8.3 },
];

export const manifestationConsistency = [
  { week: 'Apr 28 – May 4', pct: 60 },
  { week: 'May 5 – May 11',  pct: 75 },
  { week: 'May 12 – May 18', pct: 85 },
  { week: 'May 19 – May 25', pct: 65 },
];

export const moneyEntries: MoneyEntry[] = [
  { date: 'May 20, 2025', emotion: 'Happy, Confident', emoji: '😄', note: 'Reframed belief about abundance. Took action on investments.', score: 8.3, dotColor: '#7c5cbf' },
  { date: 'May 19, 2025', emotion: 'Calm, Focused',    emoji: '🙂', note: 'Stayed within budget and saved 10% of income.', score: 7.6, dotColor: '#10b981' },
  { date: 'May 18, 2025', emotion: 'Anxious, Overwhelmed', emoji: '😟', note: 'Expense surprise triggered stress. Practiced gratitude.', score: 5.1, dotColor: '#f43f5e' },
];

// ── Side panels ──────────────────────────────────────────────────────────────
export const whatToFillIn: FillInItem[] = [
  { label: 'Money Feeling',          desc: 'How do you feel about money today?' },
  { label: 'Money Belief',           desc: 'What money belief came up?' },
  { label: 'Limiting Belief',        desc: 'What limiting belief is holding you back?' },
  { label: 'Reframed Belief',        desc: 'Turn it into an empowering belief' },
  { label: 'Manifestation Statement',desc: 'Your money manifestation statement' },
  { label: 'Gratitude',              desc: 'What are you grateful for?' },
  { label: 'Action Taken',           desc: 'What aligned financial action did you take?' },
  { label: 'Next Intention',         desc: 'What is your next money intention?' },
];

export const motionNotesTimeline: MotionNote[] = [
  { icon: '👁', title: 'Hover to Preview',  desc: 'Hover any row to reveal quick details.' },
  { icon: '⤢',  title: 'Expand for More',   desc: 'Click a row to expand and view full entry.' },
  { icon: '📅', title: 'Calendar Sync',     desc: 'Entries are color-coded by mood.' },
  { icon: '⚲',  title: 'Filter & Focus',    desc: 'Use filters to narrow down what matters.' },
  { icon: '✨', title: 'Smooth Transitions',desc: 'Enjoy subtle animations for a calm feel.' },
];

export const interactionNotesToday: MotionNote[] = [
  { icon: '↔', title: 'Tab underline slide', desc: 'Smooth active tab transition' },
  { icon: '○', title: 'Calendar hover glow', desc: 'Subtle glow on date hover' },
  { icon: '✦', title: 'Chart draw-in',       desc: 'Animated line rendering' },
  { icon: '✧', title: 'Autosave shimmer',    desc: 'Soft shimmer on autosave' },
  { icon: '▢', title: 'Card hover lift',     desc: 'Gentle lift on card hover' },
];

// ── Today / week trends ──────────────────────────────────────────────────────
export const weeklyMoodTrend: TrendPoint[] = [
  { date: 'Mon', value: 3 }, { date: 'Tue', value: 4 }, { date: 'Wed', value: 3 },
  { date: 'Thu', value: 4 }, { date: 'Fri', value: 4 }, { date: 'Sat', value: 5 }, { date: 'Sun', value: 4 },
];
export const weeklyEnergyTrend: TrendPoint[] = [
  { date: 'Mon', value: 5 }, { date: 'Tue', value: 6 }, { date: 'Wed', value: 5 },
  { date: 'Thu', value: 7 }, { date: 'Fri', value: 6 }, { date: 'Sat', value: 8 }, { date: 'Sun', value: 7 },
];
export const previousEntries = [
  { date: 'May 19, 2025', mood: 4 as MoodLevel, score: 7.2, note: 'Productive day. Finished project.' },
  { date: 'May 18, 2025', mood: 2 as MoodLevel, score: 4.3, note: 'Felt tired and overwhelmed.' },
  { date: 'May 17, 2025', mood: 3 as MoodLevel, score: 6.0, note: 'Good focus. Need more rest.' },
  { date: 'May 16, 2025', mood: 5 as MoodLevel, score: 8.1, note: 'Great flow and team sync.' },
];

// ── Calendar filters ─────────────────────────────────────────────────────────
export const calendarFilters = ['Mood', 'Energy', 'Tags', 'Journal', 'Money', 'Habit', 'Attachments', 'Score'];

// ── Emotion Triggers (2026) ───────────────────────────────────────────────────
export type TriggerType = 'anger' | 'impulse' | 'fear' | 'doubt';

export interface EmotionTrigger {
  id: string;
  date: string;
  type: TriggerType;
  label: string;
  trigger: string;
  consequence: string;
  lesson: string;
  color: string;
  resolved: boolean;
}

export const emotionTriggers: EmotionTrigger[] = [
  { id: 't1', date: 'Jun 5, 2026', type: 'anger',   label: 'หัวร้อน',       trigger: 'Trade loss ไม่ยอมตัด stop loss',      consequence: 'ขาดทุนเพิ่มอีก 2%',           lesson: 'ตั้ง stop loss ก่อนกดเปิด trade เสมอ',         color: '#f43f5e', resolved: false },
  { id: 't2', date: 'Jun 4, 2026', type: 'impulse', label: 'ตัดสินใจเร็ว', trigger: 'เห็น breakout แล้ว FOMO เข้าทันที',  consequence: 'เข้าโดยไม่รอ confirmation',    lesson: 'รอ candle close + ยืนยัน 2 timeframe',          color: '#f59e0b', resolved: true  },
  { id: 't3', date: 'Jun 2, 2026', type: 'anger',   label: 'หัวร้อน',       trigger: 'News กระทบ position ทันที',           consequence: 'Close เร็วเกิน พลาดกำไร',      lesson: 'ไม่เทรดช่วง high impact news 30 นาที',          color: '#f43f5e', resolved: true  },
  { id: 't4', date: 'May 29, 2026', type: 'impulse',label: 'ตัดสินใจเร็ว', trigger: 'Revenge trade หลังขาดทุน 3 ไม้ติด', consequence: 'ขาดทุนเพิ่มอีก 1.5%',          lesson: 'หยุดพักบังคับ 30 นาทีหลังขาดทุนทุกครั้ง',     color: '#f59e0b', resolved: true  },
  { id: 't5', date: 'May 26, 2026', type: 'fear',   label: 'กลัว/FOMO',    trigger: 'เห็น position คนอื่นกำไรมาก',       consequence: 'เปลี่ยน strategy กลางคัน',    lesson: 'ยึด plan ตัวเอง ไม่สนใจผลของคนอื่น',           color: '#8b5cf6', resolved: true  },
];

export const triggerStats = [
  { label: 'หัวร้อน',       count: 8, color: '#f43f5e', pct: 40 },
  { label: 'ตัดสินใจเร็ว', count: 7, color: '#f59e0b', pct: 35 },
  { label: 'กลัว/FOMO',    count: 3, color: '#8b5cf6', pct: 15 },
  { label: 'ลังเล',         count: 2, color: '#38bdf8', pct: 10 },
];

// ── Lesson frequency (weekly count, 2026) ────────────────────────────────────
export const lessonFrequency: TrendPoint[] = [
  { date: 'May W1', value: 3 },
  { date: 'May W2', value: 5 },
  { date: 'May W3', value: 4 },
  { date: 'May W4', value: 6 },
  { date: 'Jun W1', value: 4 },
];

// ── 2026 journal entries ──────────────────────────────────────────────────────
export const journalEntries2026: JournalEntry[] = [
  {
    id: 'j26_1', date: 'Fri, Jun 5, 2026', time: '9:30 PM', mood: 3, energy: 6,
    tags: ['Loss Lesson', 'Discipline', 'Impulse'],
    moneyFeeling: 'Frustrated แต่เข้าใจว่าต้องเรียนรู้ต่อไป',
    highlights: 'วันนี้ขาดทุนเพราะหัวร้อน ไม่ตัด stop loss ตามแผน',
    moneyBelief: 'ทุก loss คือ lesson ที่มีค่าถ้าเรียนรู้จากมัน',
    nextIntention: 'ตั้ง stop loss ก่อนกดปุ่มเปิด trade ทุกครั้ง',
    hasImage: false, hasDoc: true,
  },
  {
    id: 'j26_2', date: 'Thu, Jun 4, 2026', time: '8:45 PM', mood: 4, energy: 7,
    tags: ['FOMO', 'Learning', 'Patience'],
    moneyFeeling: 'Calm หลังจากสติกลับมาและแก้สถานการณ์ได้',
    highlights: 'FOMO เข้า trade แต่ออกได้เร็วก่อนขาดทุนหนัก',
    moneyBelief: 'Patience และ Discipline คือ edge ที่แท้จริง',
    nextIntention: 'รอ confirmation เสมอก่อนเข้า position ใหม่',
    hasImage: true, hasDoc: false,
  },
  {
    id: 'j26_3', date: 'Wed, Jun 3, 2026', time: '9:00 PM', mood: 5, energy: 8,
    tags: ['Gratitude', 'Discipline', 'Win'],
    moneyFeeling: 'Confident, Grateful, และรู้สึก aligned',
    highlights: 'ปฏิบัติตาม plan ทุกไม้ ได้กำไรตามที่วางไว้',
    moneyBelief: 'ระบบที่ดีสร้างความมั่งคั่งอย่างยั่งยืน',
    nextIntention: 'รักษา consistency นี้และ review plan ทุกวันอาทิตย์',
    hasImage: false, hasDoc: false,
  },
  {
    id: 'j26_4', date: 'Tue, Jun 2, 2026', time: '8:15 PM', mood: 3, energy: 5,
    tags: ['News', 'Anger', 'Learning'],
    moneyFeeling: 'Anxious จาก news event ที่ไม่ได้เตรียมรับมือ',
    highlights: 'News กระทบ position ทำให้ตัดสินใจเร็วเกินไป ต้องแก้ไข',
    moneyBelief: 'การเตรียมตัวก่อน event คือสิ่งที่ขาดไม่ได้',
    nextIntention: 'ดู high impact news calendar ทุกเช้าก่อน session เริ่ม',
    hasImage: false, hasDoc: true,
  },
  {
    id: 'j26_5', date: 'Mon, Jun 1, 2026', time: '9:45 PM', mood: 4, energy: 7,
    tags: ['Mindset', 'Review', 'Focus'],
    moneyFeeling: 'Motivated จาก monthly review ที่ได้ทำ',
    highlights: 'ทำ monthly review ครบถ้วน พบ pattern ที่ต้องปรับ',
    moneyBelief: 'Self-awareness คือจุดเริ่มต้นของการพัฒนา',
    nextIntention: 'ทำ daily review สั้นๆ ทุกคืนก่อนนอน',
    hasImage: false, hasDoc: false,
  },
];
