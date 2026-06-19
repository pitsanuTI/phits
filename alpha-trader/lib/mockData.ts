// Equity Curve
export const equityCurveData = [
  { date: '5 Jan', equity: 85000, buyhold: 80000 },
  { date: '19 Jan', equity: 90000, buyhold: 83000 },
  { date: '2 Feb', equity: 88000, buyhold: 85000 },
  { date: '16 Feb', equity: 95000, buyhold: 87000 },
  { date: '2 Mar', equity: 100000, buyhold: 88000 },
  { date: '16 Mar', equity: 105000, buyhold: 90000 },
  { date: '30 Mar', equity: 110000, buyhold: 92000 },
  { date: '13 Apr', equity: 108000, buyhold: 91000 },
  { date: '27 Apr', equity: 115000, buyhold: 94000 },
  { date: '11 May', equity: 120000, buyhold: 95000 },
  { date: '24 May', equity: 125000, buyhold: 97000 },
  { date: '30 May', equity: 127450, buyhold: 98000 },
];

// Drawdown
export const drawdownData = [
  { date: '5 Jan', dd: -2.1 },
  { date: '19 Jan', dd: -4.8 },
  { date: '2 Feb', dd: -3.2 },
  { date: '16 Feb', dd: -1.5 },
  { date: '2 Mar', dd: -5.4 },
  { date: '16 Mar', dd: -8.1 },
  { date: '30 Mar', dd: -12.35 },
  { date: '13 Apr', dd: -6.2 },
  { date: '27 Apr', dd: -3.8 },
  { date: '11 May', dd: -2.0 },
  { date: '24 May', dd: -4.62 },
  { date: '30 May', dd: -4.62 },
];

// Win/Loss Distribution
export const winLossDistribution = [
  { range: '<-3R', wins: 2, losses: 18 },
  { range: '-3R to -2R', wins: 5, losses: 28 },
  { range: '-2R to -1R', wins: 8, losses: 62 },
  { range: '-1R to 0', wins: 12, losses: 89 },
  { range: '0 to 1R', wins: 95, losses: 0 },
  { range: '1R to 2R', wins: 145, losses: 0 },
  { range: '2R to 3R', wins: 60, losses: 0 },
  { range: '>3R', wins: 10, losses: 0 },
];

// Asset Performance
export const assetPerformance = [
  { asset: 'XAUUSD', pnl: 4562.31, pct: 8.27, color: '#f59e0b' },
  { asset: 'NAS100', pnl: 3202.12, pct: 6.32, color: '#10b981' },
  { asset: 'EURUSD', pnl: 1326.45, pct: 3.21, color: '#38bdf8' },
  { asset: 'BTCUSD', pnl: -1842.22, pct: -6.21, color: '#f97316' },
  { asset: 'GBPUSD', pnl: -650.35, pct: -2.45, color: '#8b5cf6' },
];

// Session Performance heatmap
export const sessionHeatmap = [
  { session: 'Asia', morning: 0.45, midday: 0.62, afternoon: 0.38, evening: 0.51, night: 0.29 },
  { session: 'London', morning: 0.91, midday: 1.24, afternoon: 1.11, evening: 0.67, night: 0.16 },
  { session: 'New York', morning: 1.18, midday: 1.56, afternoon: 1.36, evening: 1.18, night: 0.45 },
];

// MFE vs MAE scatter
export const mfeMaeScatter = Array.from({ length: 80 }, () => ({
  mae: +(Math.random() * 8).toFixed(2),
  mfe: +(Math.random() * 10).toFixed(2),
  win: Math.random() > 0.38,
}));

// Strategy Performance
export const strategyPerformance = [
  { name: 'Trend Following', pnl: 7842.21 },
  { name: 'Breakout', pnl: 4021.14 },
  { name: 'Range Trading', pnl: 2612.35 },
  { name: 'Scalping', pnl: 1782.12 },
];

// Winrate Frequency
export const winrateFrequency = [
  { label: 'Over 20 trades / month', count: 64, pct: 28.85 },
  { label: '10-20 trades / month', count: 61, pct: 27.03 },
  { label: 'Under 10 trades / month', count: 47, pct: 16.92 },
  { label: 'High-quality streak', count: 41, pct: 14.04 },
  { label: 'Holiday / thin market', count: 22, pct: 11.19 },
];

// Psychology Influence
export const psychologyInfluence = [
  { emotion: 'Confident', icon: '🙂', trades: 144, winRate: 67.4, pnl: 7521.11, pct: 28.1 },
  { emotion: 'Calm', icon: '🧘', trades: 132, winRate: 60.2, pnl: 3112.23, pct: 24.6 },
  { emotion: 'Anxious', icon: '😟', trades: 98, winRate: 42.2, pnl: -1842.32, pct: 19.1 },
  { emotion: 'Impulsive', icon: '⚡', trades: 76, winRate: 34.2, pnl: -2314.21, pct: 14.8 },
  { emotion: 'Greedy', icon: '🔥', trades: 62, winRate: 31.0, pnl: -1512.56, pct: 12.3 },
];

// Recent Trades
export const recentTrades = [
  { id: 1, asset: 'XAUUSD', side: 'LONG', entry: 2352.43, exit: 2384.12, result: 'Win', r: 1.91, mfe: 2.31, mae: -0.68, setup: 'Breakout', session: 'London', emotion: 'Calm & Patient', date: '30 May' },
  { id: 2, asset: 'NAS100', side: 'SHORT', entry: 18945.2, exit: 18911.05, result: 'Loss', r: -0.92, mfe: 1.23, mae: -1.23, setup: 'Reversal', session: 'New York', emotion: 'Revenge Risk', date: '30 May' },
  { id: 3, asset: 'EURUSD', side: 'LONG', entry: 1.0852, exit: 1.0866, result: 'Win', r: 1.42, mfe: 1.31, mae: -0.36, setup: 'Trend Follow', session: 'London', emotion: 'Confident', date: '29 May' },
  { id: 4, asset: 'BTCUSD', side: 'SHORT', entry: 25342.0, exit: 25362.0, result: 'Loss', r: -0.52, mfe: 0.41, mae: -1.41, setup: 'Reversal', session: 'Asia', emotion: 'FOMO', date: '28 May' },
];

// Backtest Sessions
export const backtestSessions = [
  { id: '#BT-2026-128', strategy: 'ICT Silver Bullet', asset: 'EUR/USD', tf: 'M15', date: '30 May 2026', r: 18.42, result: 'Win' },
  { id: '#BT-2026-127', strategy: 'London Kill Zone', asset: 'GBP/USD', tf: 'H1', date: '24 May 2026', r: 11.37, result: 'Win' },
  { id: '#BT-2026-126', strategy: 'Breakout + Retest', asset: 'XAU/USD', tf: 'H4', date: '18 Apr 2026', r: 7.63, result: 'Win' },
  { id: '#BT-2026-125', strategy: 'Scalping M5', asset: 'EUR/USD', tf: 'M5', date: '15 Mar 2026', r: -4.21, result: 'Loss' },
  { id: '#BT-2026-124', strategy: 'Mean Reversion', asset: 'GBP/JPY', tf: 'M30', date: '12 Feb 2026', r: -4.88, result: 'Loss' },
];

export const backtestStrategyCompare = [
  { name: 'ICT Silver Bullet', r: 14.22 },
  { name: 'London Kill Zone', r: 13.26 },
  { name: 'Breakout + Retest', r: 6.13 },
  { name: 'Trend Following', r: 3.20 },
  { name: 'Mean Reversion', r: -12.48 },
  { name: 'Scalping M5', r: -26.71 },
];

export const backtestEquityCurve = [
  { date: '1 Jan', equity: 0, balance: 0, buyhold: 0 },
  { date: '15 Jan', equity: 8000, balance: 6000, buyhold: 4000 },
  { date: '31 Jan', equity: 15000, balance: 12000, buyhold: 8000 },
  { date: '14 Feb', equity: 25000, balance: 20000, buyhold: 14000 },
  { date: '28 Feb', equity: 35000, balance: 30000, buyhold: 18000 },
  { date: '15 Mar', equity: 50000, balance: 42000, buyhold: 20000 },
  { date: '31 Mar', equity: 65000, balance: 58000, buyhold: 22000 },
  { date: '15 Apr', equity: 80000, balance: 72000, buyhold: 25000 },
  { date: '30 Apr', equity: 95000, balance: 86000, buyhold: 28000 },
  { date: '15 May', equity: 110000, balance: 100000, buyhold: 30000 },
  { date: '30 May', equity: 127450, balance: 115000, buyhold: 32000 },
];

export const mfeMaeBacktest = Array.from({ length: 60 }, () => ({
  trialNum: Math.floor(Math.random() * 50) - 25,
  r: +(Math.random() * 4 - 1.5).toFixed(2),
  win: Math.random() > 0.37,
}));

export const timeHeatmap = [
  { session: 'Asia (00-08)', tue: 0.45, wed: 0.72, thu: 0.61, fri: 0.41, sat: -0.25 },
  { session: 'London (08-16)', tue: 0.91, wed: 1.24, thu: 1.11, fri: 0.67, sat: 0.16 },
  { session: 'NY (16-00)', tue: 1.18, wed: 1.56, thu: 1.36, fri: 1.18, sat: 0.45 },
  { session: 'Overlap (12-16)', tue: 0.78, wed: 1.02, thu: 0.86, fri: 0.69, sat: 0.21 },
];

// Prop Firm Accounts
export const propFirmAccounts = [
  {
    id: 1, firm: 'FTMO', logo: 'FT', type: 'CFO', size: 200000,
    phase: 'Verification', status: 'Active', progress: 72,
    profitTarget: 16000, currentProfit: 11520,
    dailyLoss: 1820, maxDD: 4560,
    dailyLossPct: 10, maxDDPct: 76,
    color: '#1a1a2e',
  },
  {
    id: 2, firm: 'The 5%ers', logo: '5', type: 'CFO', size: 100000,
    phase: 'High Stakes', status: 'Active', progress: 38,
    profitTarget: 8000, currentProfit: 3040,
    dailyLoss: 960, maxDD: 2510,
    dailyLossPct: 19, maxDDPct: 71,
    color: '#ff6b00',
  },
  {
    id: 3, firm: 'TOPSTEP', logo: 'TS', type: 'Futures', size: 150000,
    phase: 'Funded', status: 'Funded', progress: 100,
    profitTarget: 4420.50, currentProfit: 4420.50,
    dailyLoss: 2400, maxDD: 5200,
    dailyLossPct: 80, maxDDPct: 87,
    color: '#00a651',
  },
  {
    id: 4, firm: 'Apex Trader Funding', logo: 'A', type: 'Futures', size: 50000,
    phase: 'Evaluation', status: 'Failed', progress: 100,
    profitTarget: 0, currentProfit: -500,
    dailyLoss: -5, maxDD: 0,
    dailyLossPct: 0, maxDDPct: 0,
    color: '#2d5986',
  },
];

export const fundingCostData = [
  { name: 'Challenge Fee', value: 5390, pct: 67.2, color: '#7c5cbf' },
  { name: 'Reset Fee', value: 1190, pct: 14.9, color: '#38bdf8' },
  { name: 'Re Fee Fee', value: 660, pct: 8.3, color: '#f97316' },
  { name: 'Extra / Add-ons', value: 520, pct: 6.5, color: '#f43f5e' },
  { name: 'Add-ons / Extra', value: 230, pct: 2.9, color: '#a78bfa' },
];

export const fundingIncomeData = [
  { date: '5 Jan', cost: 2000, received: 0 },
  { date: '10 Feb', cost: 3500, received: 5000 },
  { date: '15 Mar', cost: 4800, received: 8000 },
  { date: '20 Apr', cost: 6000, received: 15000 },
  { date: '30 May', cost: 7980, received: 24672 },
];

export const capitalDistribution = [
  { name: 'Funded Capital', value: 234000, pct: 59.4, color: '#10b981' },
  { name: 'Challenge Capital', value: 98000, pct: 24.9, color: '#7c5cbf' },
  { name: 'Personal Risk Capital', value: 48000, pct: 12.4, color: '#38bdf8' },
  { name: 'Reserve', value: 6000, pct: 1.2, color: '#f97316' },
];

// Weekly Review
export const weeklyPerfData = [
  { day: '24 May', equity: -3200, drawdown: -1.2 },
  { day: '25 May', equity: -1800, drawdown: -0.8 },
  { day: '26 May', equity: 500, drawdown: 0 },
  { day: '27 May', equity: 2200, drawdown: 0 },
  { day: '28 May', equity: 3800, drawdown: 0 },
  { day: '29 May', equity: 4562, drawdown: 0 },
  { day: '30 May', equity: 4562, drawdown: 0 },
];

export const equityTrendMonthly = [
  { date: '5 Jan', equity: 82000 },
  { date: '1 Feb', equity: 95000 },
  { date: '1 Mar', equity: 108000 },
  { date: '1 Apr', equity: 112000 },
  { date: '1 May', equity: 119000 },
  { date: '30 May', equity: 127450 },
];

export const psychologyTrend = [
  { date: '24 May', score: 65, mood: 60 },
  { date: '25 May', score: 68, mood: 55 },
  { date: '26 May', score: 72, mood: 65 },
  { date: '27 May', score: 70, mood: 68 },
  { date: '28 May', score: 75, mood: 72 },
  { date: '29 May', score: 78, mood: 75 },
  { date: '30 May', score: 78, mood: 73 },
];

export const bestAssets = [
  { asset: 'XAUUSD', pnl: 4562.31, pct: 34.6 },
  { asset: 'NAS100', pnl: 3191.32, pct: 24.2 },
  { asset: 'EURUSD', pnl: 1802.45, pct: 18.6 },
  { asset: 'BTCUSD', pnl: 1208.33, pct: 9.3 },
  { asset: 'GBPUSD', pnl: 567.02, pct: 4.3 },
];

export const negativeHabits = [
  { habit: 'Enter Before News', count: 24, color: '#f43f5e' },
  { habit: 'Hold Loss Too Long', count: 16, color: '#f97316' },
  { habit: 'No Stop Loss', count: 15, color: '#f97316' },
  { habit: 'Over Trading', count: 12, color: '#fbbf24' },
  { habit: 'Revenge Trade', count: 8, color: '#fbbf24' },
];

export const sessionReviewMatrix = [
  { day: 'Mon', asia: 56, london: 64, ny: 68 },
  { day: 'Tue', asia: 58, london: 61, ny: 72 },
  { day: 'Wed', asia: 52, london: 64, ny: 71 },
  { day: 'Thu', asia: 60, london: 59, ny: 71 },
  { day: 'Fri', asia: 54, london: 62, ny: 66 },
];

// Journal Setup Distribution
export const setupDistribution = [
  { name: 'Breakout', value: 40, pct: 32, color: '#7c5cbf' },
  { name: 'Trend Follow', value: 33, pct: 26, color: '#10b981' },
  { name: 'Retest', value: 23, pct: 18, color: '#38bdf8' },
  { name: 'Reversal', value: 15, pct: 12, color: '#f97316' },
  { name: 'Range', value: 9, pct: 7, color: '#f43f5e' },
];

export const rMultipleData = Array.from({ length: 30 }, (_, i) => {
  const win = Math.random() > 0.37;
  return {
    i,
    r: win ? +(Math.random() * 3 + 0.3).toFixed(2) : -(Math.random() * 2.5 + 0.2).toFixed(2),
    win,
  };
});



