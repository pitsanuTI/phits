export type MonthKey = '2026-01' | '2026-02' | '2026-03' | '2026-04' | '2026-05';

export type MonthOption = {
  key: MonthKey;
  label: string;
  thaiLabel: string;
};

export const monthOptions: MonthOption[] = [
  { key: '2026-01', label: 'Jan 2026', thaiLabel: 'ม.ค. 2569' },
  { key: '2026-02', label: 'Feb 2026', thaiLabel: 'ก.พ. 2569' },
  { key: '2026-03', label: 'Mar 2026', thaiLabel: 'มี.ค. 2569' },
  { key: '2026-04', label: 'Apr 2026', thaiLabel: 'เม.ย. 2569' },
  { key: '2026-05', label: 'May 2026', thaiLabel: 'พ.ค. 2569' },
];

const monthShortByKey: Record<MonthKey, string> = {
  '2026-01': 'Jan',
  '2026-02': 'Feb',
  '2026-03': 'Mar',
  '2026-04': 'Apr',
  '2026-05': 'May',
};

export type MonthlyLifeSnapshot = {
  month: MonthKey;
  workFocusHours: number;
  tasksDone: number;
  meetingHours: number;
  habitScore: number;
  avgSleepHours: number;
  workoutDays: number;
  bodyWeight: number;
  learningHours: number;
  notesCreated: number;
  reviewSessions: number;
  learningRetention: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  netCashFlow: number;
  moodScore: number;
  journalDays: number;
  tradingNetPnl: number;
};

export const monthlyLifeStats: MonthlyLifeSnapshot[] = [
  {
    month: '2026-01',
    workFocusHours: 96,
    tasksDone: 74,
    meetingHours: 26,
    habitScore: 72,
    avgSleepHours: 6.8,
    workoutDays: 14,
    bodyWeight: 74.2,
    learningHours: 22,
    notesCreated: 14,
    reviewSessions: 10,
    learningRetention: 78,
    income: 5200,
    expenses: 3610,
    savings: 1590,
    savingsRate: 30.6,
    netCashFlow: 1590,
    moodScore: 7.0,
    journalDays: 19,
    tradingNetPnl: 2140,
  },
  {
    month: '2026-02',
    workFocusHours: 108,
    tasksDone: 83,
    meetingHours: 24,
    habitScore: 75,
    avgSleepHours: 7.0,
    workoutDays: 16,
    bodyWeight: 73.6,
    learningHours: 28,
    notesCreated: 18,
    reviewSessions: 12,
    learningRetention: 81,
    income: 5480,
    expenses: 3740,
    savings: 1740,
    savingsRate: 31.8,
    netCashFlow: 1740,
    moodScore: 7.2,
    journalDays: 21,
    tradingNetPnl: 2860,
  },
  {
    month: '2026-03',
    workFocusHours: 114,
    tasksDone: 89,
    meetingHours: 22,
    habitScore: 78,
    avgSleepHours: 7.1,
    workoutDays: 18,
    bodyWeight: 73.1,
    learningHours: 32,
    notesCreated: 21,
    reviewSessions: 15,
    learningRetention: 84,
    income: 5720,
    expenses: 3820,
    savings: 1900,
    savingsRate: 33.2,
    netCashFlow: 1900,
    moodScore: 7.4,
    journalDays: 23,
    tradingNetPnl: 3640,
  },
  {
    month: '2026-04',
    workFocusHours: 121,
    tasksDone: 96,
    meetingHours: 23,
    habitScore: 81,
    avgSleepHours: 7.3,
    workoutDays: 19,
    bodyWeight: 72.7,
    learningHours: 36,
    notesCreated: 24,
    reviewSessions: 17,
    learningRetention: 86,
    income: 6010,
    expenses: 3920,
    savings: 2090,
    savingsRate: 34.8,
    netCashFlow: 2090,
    moodScore: 7.6,
    journalDays: 24,
    tradingNetPnl: 5210,
  },
  {
    month: '2026-05',
    workFocusHours: 126,
    tasksDone: 104,
    meetingHours: 21,
    habitScore: 84,
    avgSleepHours: 7.5,
    workoutDays: 21,
    bodyWeight: 72.4,
    learningHours: 41,
    notesCreated: 29,
    reviewSessions: 19,
    learningRetention: 88,
    income: 6420,
    expenses: 4010,
    savings: 2410,
    savingsRate: 37.5,
    netCashFlow: 2410,
    moodScore: 7.9,
    journalDays: 26,
    tradingNetPnl: 8742.31,
  },
];

export const workProjects = [
  {
    id: 'wk-1',
    name: 'Alpha Trader Dashboard v2',
    owner: 'Product',
    status: 'In Progress',
    progress: 72,
    nextMilestone: 'Release review board',
  },
  {
    id: 'wk-2',
    name: 'Automation Rule Engine',
    owner: 'Workflow',
    status: 'On Track',
    progress: 58,
    nextMilestone: 'Complete action mapping',
  },
  {
    id: 'wk-3',
    name: 'Personal KPI Consolidation',
    owner: 'Data',
    status: 'Review',
    progress: 86,
    nextMilestone: 'QA cross-page values',
  },
];

export const workTaskBacklog = [
  { id: 'ts-01', title: 'Sync Jan-May trading KPI to monthly review', area: 'Review', priority: 'High', estimate: '45m' },
  { id: 'ts-02', title: 'Finalize Funding cost allocation labels', area: 'Trading', priority: 'Medium', estimate: '30m' },
  { id: 'ts-03', title: 'Update Learning notes from last session', area: 'Learning', priority: 'Medium', estimate: '25m' },
  { id: 'ts-04', title: 'Refresh money reminders and due dates', area: 'Money', priority: 'High', estimate: '20m' },
  { id: 'ts-05', title: 'Prepare weekly action plan checklist', area: 'Today', priority: 'Low', estimate: '15m' },
];

export const habitChecklistItems = [
  'Morning Exercise',
  'Meditation',
  'Drink Water 2.5L',
  'No Sugar After 7PM',
  'Sleep 7+ Hours',
  'Read 20 Pages',
  'Gratitude Journal',
];

export const healthTrendByMonth = monthlyLifeStats.map((month) => ({
  month: monthShortByKey[month.month],
  sleep: month.avgSleepHours,
  habitScore: month.habitScore,
  weight: month.bodyWeight,
  workoutDays: month.workoutDays,
}));

export const learningTopics = [
  { id: 'lp-1', topic: 'Data Structures', category: 'Engineering', difficulty: 'Hard', status: 'Learning', progress: 75, nextReview: '2026-06-02' },
  { id: 'lp-2', topic: 'Organic Chemistry', category: 'Science', difficulty: 'Medium', status: 'Reviewing', progress: 60, nextReview: '2026-06-04' },
  { id: 'lp-3', topic: 'Spanish Basics', category: 'Language', difficulty: 'Easy', status: 'Learning', progress: 45, nextReview: '2026-06-01' },
  { id: 'lp-4', topic: 'Calculus I', category: 'Math', difficulty: 'Hard', status: 'To Learn', progress: 35, nextReview: '2026-06-07' },
  { id: 'lp-5', topic: 'Trading Psychology', category: 'Trading', difficulty: 'Medium', status: 'Completed', progress: 100, nextReview: '2026-06-08' },
];

export const learningNotes = [
  { id: 'nt-1', title: 'Queue vs Stack decision', topic: 'Data Structures', updated: '2h ago', type: 'Concept', highlight: 'เลือกโครงสร้างให้ตรง pattern ของโจทย์' },
  { id: 'nt-2', title: 'SN1 vs SN2 summary', topic: 'Organic Chemistry', updated: '1d ago', type: 'Summary', highlight: 'ดู solvent และ substrate ก่อนเลือกกลไก' },
  { id: 'nt-3', title: 'Risk language in Spanish', topic: 'Spanish Basics', updated: '2d ago', type: 'Phrasebook', highlight: 'ฝึกคำศัพท์การเงิน + ประโยคสั้นใช้งานจริง' },
];

export const learningResources = [
  { id: 'rs-1', title: 'React Docs', type: 'Website', topic: 'Engineering', status: 'In Progress', progress: 62, addedOn: '2026-01-08' },
  { id: 'rs-2', title: 'Design Patterns Book', type: 'Book', topic: 'Engineering', status: 'Completed', progress: 100, addedOn: '2026-02-12' },
  { id: 'rs-3', title: 'Khan Calculus Course', type: 'Course', topic: 'Math', status: 'In Progress', progress: 44, addedOn: '2026-03-01' },
  { id: 'rs-4', title: 'Organic Reactions Cheat Sheet', type: 'PDF', topic: 'Science', status: 'Planned', progress: 10, addedOn: '2026-04-10' },
  { id: 'rs-5', title: 'Market Mindset Podcast', type: 'Podcast', topic: 'Trading', status: 'In Progress', progress: 70, addedOn: '2026-05-03' },
];

export const monthlyCashFlowSeries = monthlyLifeStats.map((month) => ({
  month: monthShortByKey[month.month],
  income: month.income,
  expenses: month.expenses,
  savings: month.savings,
  cashFlow: month.netCashFlow,
}));

export const expenseBreakdown = [
  { category: 'Housing', amount: 1248, pct: 31 },
  { category: 'Food & Dining', amount: 670, pct: 17 },
  { category: 'Transport', amount: 468, pct: 12 },
  { category: 'Utilities', amount: 312, pct: 8 },
  { category: 'Education', amount: 522, pct: 13 },
  { category: 'Other', amount: 790, pct: 19 },
];

export const moneyTransactions = [
  { id: 'mx-1', date: '2026-05-28', title: 'Freelance Payment', type: 'Income', amount: 950, category: 'Work', status: 'Cleared' },
  { id: 'mx-2', date: '2026-05-26', title: 'Trading Profit Transfer', type: 'Income', amount: 1120, category: 'Trading', status: 'Cleared' },
  { id: 'mx-3', date: '2026-05-24', title: 'Course Subscription', type: 'Expense', amount: -45, category: 'Learning', status: 'Posted' },
  { id: 'mx-4', date: '2026-05-20', title: 'Health Checkup', type: 'Expense', amount: -96, category: 'Health', status: 'Posted' },
  { id: 'mx-5', date: '2026-05-18', title: 'Emergency Fund Top-up', type: 'Transfer', amount: -320, category: 'Savings', status: 'Scheduled' },
];

export const calendarEventsByMonth: Record<MonthKey, Array<{ id: string; date: number; title: string; area: string; status: 'planned' | 'done' | 'review' | 'missed' }>> = {
  '2026-01': [
    { id: 'ev-101', date: 7, title: 'Setup weekly review template', area: 'Review', status: 'done' },
    { id: 'ev-102', date: 15, title: 'Funding rule recheck', area: 'Trading', status: 'review' },
    { id: 'ev-103', date: 22, title: 'Learning sprint kickoff', area: 'Learning', status: 'done' },
  ],
  '2026-02': [
    { id: 'ev-201', date: 3, title: 'Health baseline check', area: 'Health', status: 'done' },
    { id: 'ev-202', date: 11, title: 'Backtest report v1', area: 'Trading', status: 'review' },
    { id: 'ev-203', date: 19, title: 'Cash flow planning', area: 'Money', status: 'planned' },
  ],
  '2026-03': [
    { id: 'ev-301', date: 6, title: 'Project milestone review', area: 'Work', status: 'done' },
    { id: 'ev-302', date: 14, title: 'Body composition update', area: 'Health', status: 'review' },
    { id: 'ev-303', date: 27, title: 'Journal retrospective', area: 'Mood', status: 'done' },
  ],
  '2026-04': [
    { id: 'ev-401', date: 5, title: 'Risk guardrail audit', area: 'Trading', status: 'done' },
    { id: 'ev-402', date: 16, title: 'Learning note cleanup', area: 'Learning', status: 'planned' },
    { id: 'ev-403', date: 26, title: 'Savings goal checkpoint', area: 'Money', status: 'review' },
  ],
  '2026-05': [
    { id: 'ev-501', date: 4, title: 'Weekly planning reset', area: 'Today', status: 'done' },
    { id: 'ev-502', date: 12, title: 'Funding payout review', area: 'Trading', status: 'review' },
    { id: 'ev-503', date: 19, title: 'Habit score checkpoint', area: 'Health', status: 'done' },
    { id: 'ev-504', date: 22, title: 'Deep work sprint', area: 'Work', status: 'done' },
    { id: 'ev-505', date: 25, title: 'Monthly finance close', area: 'Money', status: 'planned' },
    { id: 'ev-506', date: 29, title: 'Prompt journal recap', area: 'Mood', status: 'missed' },
  ],
};

export function getMonthStats(key: MonthKey) {
  return monthlyLifeStats.find((month) => month.month === key) ?? monthlyLifeStats[monthlyLifeStats.length - 1];
}
