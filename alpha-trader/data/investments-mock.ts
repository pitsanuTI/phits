export const investmentTabs = [
  'Overview',
  'Asset Allocation',
  'DCA Planner',
  'DCA Journal',
  'Dividend Income',
  'Gold & Hedge',
  'Portfolio Review',
] as const;

export type InvestmentTab = (typeof investmentTabs)[number];
export type InvestmentMonthKey = '2026-01' | '2026-02' | '2026-03' | '2026-04' | '2026-05' | '2026-06' | 'all-months';

export const investmentMonths: { key: InvestmentMonthKey; label: string; short: string }[] = [
  { key: '2026-01', label: 'January 2026', short: 'Jan' },
  { key: '2026-02', label: 'February 2026', short: 'Feb' },
  { key: '2026-03', label: 'March 2026', short: 'Mar' },
  { key: '2026-04', label: 'April 2026', short: 'Apr' },
  { key: '2026-05', label: 'May 2026', short: 'May' },
  { key: '2026-06', label: 'June 2026', short: 'Jun' },
];

export const portfolioGrowth = [
  { month: 'Jan', portfolio: 1268000, invested: 1225000, gain: 43000, dividend: 2120, dca: 20500 },
  { month: 'Feb', portfolio: 1394000, invested: 1325000, gain: 69000, dividend: 3520, dca: 22500 },
  { month: 'Mar', portfolio: 1519000, invested: 1450000, gain: 69000, dividend: 4760, dca: 25000 },
  { month: 'Apr', portfolio: 1689000, invested: 1575000, gain: 114000, dividend: 5980, dca: 23750 },
  { month: 'May', portfolio: 1852430.75, invested: 1650000, gain: 202430.75, dividend: 18750, dca: 20750 },
  { month: 'Jun', portfolio: 1967540.32, invested: 1725000, gain: 242540.32, dividend: 22180, dca: 21500 },
];

export const portfolioSummary = {
  baseCurrency: 'THB',
  month: 'May 2026',
  riskProfile: 'Moderate',
  portfolioValue: 1852430.75,
  totalInvested: 1650000,
  unrealizedGain: 202430.75,
  dividendYtd: 18750,
  dcaCompletion: 83,
  dcaMonthsDone: 10,
  dcaMonthsTotal: 12,
  riskLevel: 'Moderate',
  riskNote: 'เหมาะสมกับเป้าหมาย',
  dcaThisMonth: {
    budget: 25000,
    paid: 20750,
    remaining: 4250,
  },
};

export const topHoldings = [
  { asset: 'Apple Inc. (AAPL)', type: 'Equity (Global)', value: 236450, weight: 13.95, unrealized: 24510, unrealizedPct: 12.35, dividend: 4250 },
  { asset: 'Vanguard S&P 500 ETF (VOO)', type: 'Equity (Global)', value: 236780, weight: 12.78, unrealized: 22180, unrealizedPct: 10.34, dividend: 3680 },
  { asset: 'SCB SET Index Fund (SCBSET)', type: 'Equity (Thai)', value: 188300, weight: 10.82, unrealized: 18000, unrealizedPct: 9.65, dividend: 2100 },
  { asset: 'PTT Public Co., Ltd. (PTT)', type: 'Equity (Thai)', value: 142750, weight: 7.71, unrealized: 9750, unrealizedPct: 7.32, dividend: 1090 },
  { asset: 'SPDR Gold Shares (GLD)', type: 'Gold', value: 105890, weight: 5.97, unrealized: 9650, unrealizedPct: 9.97, dividend: 0 },
];

export const overviewAllocation = [
  { name: 'Equity (Global)', value: 36.1, color: '#10b981' },
  { name: 'Equity (Thai)', value: 20.5, color: '#3b82f6' },
  { name: 'REITs', value: 12.4, color: '#a855f7' },
  { name: 'Bonds', value: 9.7, color: '#f59e0b' },
  { name: 'Gold', value: 5.6, color: '#f97316' },
  { name: 'Cash', value: 15.7, color: '#94a3b8' },
];

export const allocationRows = [
  { assetClass: 'Equity', target: 60, current: 62.5, drift: 2.5, status: 'Overweight', color: '#3b82f6' },
  { assetClass: 'Fixed Income', target: 20, current: 17.5, drift: -2.5, status: 'Underweight', color: '#6366f1' },
  { assetClass: 'Cash', target: 5, current: 4.5, drift: -0.5, status: 'Underweight', color: '#94a3b8' },
  { assetClass: 'Gold', target: 7, current: 6.5, drift: -0.5, status: 'Underweight', color: '#f59e0b' },
  { assetClass: 'REITs', target: 5, current: 5.0, drift: 0, status: 'Neutral', color: '#a855f7' },
  { assetClass: 'Alternatives', target: 3, current: 4.0, drift: 1, status: 'Overweight', color: '#111827' },
];

export const countryExposure = [
  { name: 'United States', value: 52.1 },
  { name: 'Japan', value: 10.3 },
  { name: 'China', value: 8.7 },
  { name: 'Germany', value: 4.6 },
  { name: 'Thailand', value: 3.6 },
  { name: 'Others', value: 20.6 },
];

export const currencyExposure = [
  { name: 'USD', value: 68.4 },
  { name: 'THB', value: 18.7 },
  { name: 'EUR', value: 6.2 },
  { name: 'JPY', value: 4.1 },
  { name: 'Others', value: 2.5 },
];

export const rebalanceActions = [
  { action: 'ลดน้ำหนักใน Equity', amount: -120000 },
  { action: 'เพิ่มน้ำหนักใน Fixed Income', amount: 100000 },
  { action: 'เพิ่มน้ำหนักใน Cash', amount: 20000 },
  { action: 'คงน้ำหนักใน Gold', amount: 0 },
  { action: 'คงน้ำหนักใน REITs', amount: 0 },
  { action: 'เพิ่มน้ำหนักใน Alternatives', amount: 10000 },
];

export const dcaPlan = [
  { asset: 'SET50 ETF', ticker: 'EFVN3001', amount: 3500, weight: 35, color: '#10b981' },
  { asset: 'US Equity ETF', ticker: 'VOO', amount: 2500, weight: 25, color: '#2563eb' },
  { asset: 'Global Bond ETF', ticker: 'AGG', amount: 1500, weight: 15, color: '#f59e0b' },
  { asset: 'REITs ETF', ticker: 'I-REIT', amount: 1000, weight: 10, color: '#a855f7' },
  { asset: 'Gold ETF', ticker: 'GLD', amount: 1000, weight: 10, color: '#f97316' },
  { asset: 'Cash / Money Market', ticker: 'SCBMM', amount: 1000, weight: 10, color: '#94a3b8' },
];

export const dcaConsistency = [
  { month: 'Dec 2025', completion: 100 },
  { month: 'Jan 2026', completion: 85 },
  { month: 'Feb 2026', completion: 100 },
  { month: 'Mar 2026', completion: 67 },
  { month: 'Apr 2026', completion: 100 },
  { month: 'May 2026', completion: 83 },
  { month: 'Jun 2026', completion: 88 },
];

export type DCATransaction = {
  date: string; // 'YYYY-MM-DD'
  asset: string;
  ticker: string;
  type: 'Growth' | 'Dividend' | 'Bond' | 'Fund' | 'Cash';
  sector: string;
  amount: number;
  price: number;
  units: number;
  totalValue: number;
  status: 'completed' | 'pending' | 'missed';
  reason: string; // DCA reason
  expectedReturn?: string;
  notes?: string;
  icon?: string; // base64 or URL
};

export const dcaTransactions: DCATransaction[] = [
  // June 2026 transactions
  { date: '2026-06-05', asset: 'SET50 ETF', ticker: 'EFVN3001', type: 'Growth', sector: 'Equity (Thai)', amount: 3500, price: 2280, units: 1.54, totalValue: 3511.2, status: 'completed', reason: 'การลงทุนแบบ DCA ตามแผนรายเดือน', expectedReturn: 'Moderate Growth (6-8% annually)', notes: 'ตามจำนวนที่วางแผน', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%232563eb" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dy=".3em"%3E5%3C/text%3E%3C/svg%3E' },
  { date: '2026-06-05', asset: 'US Equity ETF', ticker: 'VOO', type: 'Growth', sector: 'Equity (Global)', amount: 2500, price: 485.3, units: 5.15, totalValue: 2499.0, status: 'completed', reason: 'การลงทุนแบบ DCA ตามแผนรายเดือน', expectedReturn: 'High Growth (8-10% annually)', notes: 'ตามจำนวนที่วางแผน', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%231e40af" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="28" font-weight="bold" fill="white" text-anchor="middle" dy=".3em"%3EVOO%3C/text%3E%3C/svg%3E' },
  { date: '2026-06-10', asset: 'Global Bond ETF', ticker: 'AGG', type: 'Bond', sector: 'Fixed Income', amount: 1500, price: 98.5, units: 15.23, totalValue: 1501.0, status: 'completed', reason: 'การลงทุนแบบ DCA ตามแผนรายเดือน', expectedReturn: 'Stable (2-3% annually)', notes: 'ตามจำนวนที่วางแผน', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f97316" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="28" font-weight="bold" fill="white" text-anchor="middle" dy=".3em"%3EAGG%3C/text%3E%3C/svg%3E' },
  { date: '2026-06-10', asset: 'REITs ETF', ticker: 'I-REIT', type: 'Dividend', sector: 'Real Estate', amount: 1000, price: 72.1, units: 13.87, totalValue: 999.0, status: 'completed', reason: 'การลงทุนแบบ DCA ตามแผนรายเดือน', expectedReturn: 'Dividend + Growth (5-7% annually)', notes: 'ตามจำนวนที่วางแผน', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23a855f7" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="20" font-weight="bold" fill="white" text-anchor="middle" dy=".3em"%3EI-REIT%3C/text%3E%3C/svg%3E' },
  { date: '2026-06-12', asset: 'Gold ETF', ticker: 'GLD', type: 'Fund', sector: 'Commodity (Gold)', amount: 1000, price: 198.2, units: 5.05, totalValue: 1001.0, status: 'completed', reason: 'การป้องกันความเสี่ยงจากเงินเฟ้อ', expectedReturn: 'Hedge (0-2% annually)', notes: 'เพื่อความมั่นคง', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23d97706" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="28" font-weight="bold" fill="white" text-anchor="middle" dy=".3em"%3E%3C/text%3E%3C/svg%3E' },
  { date: '2026-06-15', asset: 'Cash / Money Market', ticker: 'SCBMM', type: 'Cash', sector: 'Money Market', amount: 1000, price: 100, units: 10, totalValue: 1000.0, status: 'completed', reason: 'สร้างเงินสดสำรองสำหรับโอกาส', expectedReturn: 'Safe (0.5-1% annually)', notes: 'เงินสดสำรอง', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%2364748b" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dy=".3em"%3E%24%3C/text%3E%3C/svg%3E' },
];

export const dividendMonthly = [
  { month: 'Jan', income: 324 },
  { month: 'Feb', income: 412 },
  { month: 'Mar', income: 586 },
  { month: 'Apr', income: 402 },
  { month: 'May', income: 578.32 },
  { month: 'Jun', income: 342 },
  { month: 'Jul', income: 438 },
  { month: 'Aug', income: 512 },
  { month: 'Sep', income: 650 },
  { month: 'Oct', income: 1026 },
  { month: 'Nov', income: 526 },
  { month: 'Dec', income: 1138 },
];

export const dividendCalendar = [
  { asset: 'JPMorgan Chase', ticker: 'JPM', schedule: 'Quarterly', date: '27 May 2026', amount: 126.45 },
  { asset: 'Coca-Cola', ticker: 'KO', schedule: 'Quarterly', date: '2 Jun 2026', amount: 74.2 },
  { asset: 'Microsoft', ticker: 'MSFT', schedule: 'Quarterly', date: '10 Jun 2026', amount: 63.56 },
  { asset: 'Realty Income', ticker: 'O', schedule: 'Monthly', date: '15 Jun 2026', amount: 83.17 },
  { asset: 'Procter & Gamble', ticker: 'PG', schedule: 'Quarterly', date: '16 Jun 2026', amount: 62.34 },
];

export const dividendByAsset = [
  { name: 'US Stocks', value: 64.1, color: '#16a34a' },
  { name: 'Global Stocks', value: 16.1, color: '#2563eb' },
  { name: 'REITs', value: 8.2, color: '#f97316' },
  { name: 'ETFs', value: 7.1, color: '#a855f7' },
  { name: 'Cash & Others', value: 3.5, color: '#94a3b8' },
];

export const dividendHoldings = [
  { asset: 'Microsoft', ticker: 'MSFT', sector: 'Technology', weight: 9.8, yield: 0.78, ytd: 456.2, yoy: 12.8 },
  { asset: 'Coca-Cola', ticker: 'KO', sector: 'Consumer Staples', weight: 7.6, yield: 3.11, ytd: 294.65, yoy: 6.4 },
  { asset: 'JPMorgan Chase', ticker: 'JPM', sector: 'Financials', weight: 7.2, yield: 2.48, ytd: 278.12, yoy: 15.3 },
  { asset: 'Realty Income', ticker: 'O', sector: 'Real Estate', weight: 5.9, yield: 5.64, ytd: 261.78, yoy: 4.2 },
  { asset: 'Procter & Gamble', ticker: 'PG', sector: 'Consumer Staples', weight: 5.3, yield: 2.39, ytd: 208.67, yoy: 7.1 },
];

export const dividendGrowth = [
  { year: '2021', income: 2407 },
  { year: '2022', income: 2912 },
  { year: '2023', income: 3821 },
  { year: '2024', income: 5065 },
  { year: '2026', income: 4387 },
];

export const goldTrend = [
  { month: 'Dec', weight: 5.5, target: 10, portfolioDrawdown: -1, goldDrawdown: -0.5 },
  { month: 'Jan', weight: 5.8, target: 10, portfolioDrawdown: -5, goldDrawdown: -2 },
  { month: 'Feb', weight: 6.8, target: 10, portfolioDrawdown: -8, goldDrawdown: -1.8 },
  { month: 'Mar', weight: 7.5, target: 10, portfolioDrawdown: -12, goldDrawdown: -2.6 },
  { month: 'Apr', weight: 8.4, target: 10, portfolioDrawdown: -33, goldDrawdown: -4.1 },
  { month: 'May', weight: 9.24, target: 10, portfolioDrawdown: -8, goldDrawdown: -2.7 },
];

export const hedgeMix = [
  { name: 'Gold', value: 54, color: '#f59e0b' },
  { name: 'Cash', value: 18, color: '#16a34a' },
  { name: 'Government Bond', value: 12.7, color: '#2563eb' },
  { name: 'REIT', value: 8.1, color: '#a855f7' },
  { name: 'Others', value: 6.3, color: '#94a3b8' },
];

export const goldPurchases = [
  { date: '20 May 2026', type: 'Buy', product: 'Gold Bar 96.5%', amount: 15000, price: 51850, impact: 0.24, notes: 'DCA Plan' },
  { date: '05 May 2026', type: 'Buy', product: 'Gold Bar 96.5%', amount: 15000, price: 50698, impact: 0.24, notes: 'DCA Plan' },
  { date: '30 Apr 2026', type: 'Buy', product: 'Gold Bar 96.5%', amount: 15000, price: 50120, impact: 0.24, notes: 'DCA Plan' },
  { date: '15 Apr 2026', type: 'Buy', product: 'Gold Bar 96.5%', amount: 15000, price: 49563, impact: 0.23, notes: 'DCA Plan' },
  { date: '20 Mar 2026', type: 'Buy', product: 'Gold Bar 96.5%', amount: 15000, price: 48500, impact: 0.24, notes: 'DCA Plan' },
];

export const targetHedgeAllocation = [
  { name: 'Gold', target: 10, current: 9.2 },
  { name: 'Cash', target: 25, current: 18 },
  { name: 'Gov. Bond', target: 15, current: 12.7 },
  { name: 'REIT', target: 10, current: 8.1 },
  { name: 'Others', target: 5, current: 6.3 },
];

export const reviewChecklist = [
  'ตรวจสอบผลตอบแทนและเปรียบเทียบกับเป้าหมาย',
  'ตรวจสอบการปรับพอร์ตและสัดส่วนการลงทุน',
  'ทบทวนแผนการลงทุน DCA และเงินปันผล',
  'ประเมินความเสี่ยงและความสอดคล้อง',
  'บันทึกข้อสังเกตและแผนการดำเนินการ',
];

export const reviewPerformance = [
  { month: 'Dec', portfolio: 1.8, goal: 0.8 },
  { month: 'Jan', portfolio: 3.5, goal: 1.4 },
  { month: 'Feb', portfolio: 6.2, goal: 3.3 },
  { month: 'Mar', portfolio: 9.1, goal: 6.2 },
  { month: 'Apr', portfolio: 12.6, goal: 9.7 },
  { month: 'May', portfolio: 16.7, goal: 14.9 },
];

export const reviewConcerns = [
  { title: 'Equity (Global)', detail: 'เกินเป้าหมาย 3.2% ควรปรับลดบางส่วน', severity: 'high' },
  { title: 'Valuation', detail: 'หุ้นสหรัฐเริ่มตึงตัว ติดตามรายได้บริษัท', severity: 'medium' },
  { title: 'Bond Duration', detail: 'ต่ำกว่าเป้าหมาย ควรทบทวน duration', severity: 'medium' },
];

export const nextMonthActionPlan = [
  'ทบทวนสัดส่วนใน Equity (Global) ลง 2-3%',
  'เพิ่มสัดส่วนใน Bond และ REITs ตามแผน',
  'ทำ DCA ต่อเนื่อง 10,000 THB',
  'ติดตามนโยบายเงินเฟ้อและการประชุม Fed',
];
