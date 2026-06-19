// ─────────────────────────────────────────────────────────────────────────────
// Trading insights engine — pure functions over the shared trade log.
//
// Everything here is DERIVED from the same Trade[] the Data Center edits, so the
// Calendar and the AI Performance Lab never drift from reality. Two layers:
//   1. Quant metrics  — streaks, payoff, Sharpe, drawdown, risk-of-ruin, …
//   2. AI coach        — turns those metrics into ranked strengths / weaknesses /
//                        warnings / an action plan (deterministic rule engine,
//                        no network, no Math.random → SSR-stable).
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Trade,
  type GroupRow,
  deriveKpis,
  deriveEquity,
  groupBy,
  sortByDate,
  START_CAPITAL,
} from '@/data/trading-data-mock';

const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));

// ── Per-day aggregation (powers the Calendar) ─────────────────────────────────
export interface DailyAgg {
  date: string; // 'YYYY-MM-DD'
  count: number;
  pnl: number;
  wins: number;
  losses: number;
  be: number;
  rSum: number;
  winRate: number;
}

export function deriveDaily(trades: Trade[]): Map<string, DailyAgg> {
  const map = new Map<string, DailyAgg>();
  for (const t of trades) {
    let d = map.get(t.date);
    if (!d) {
      d = { date: t.date, count: 0, pnl: 0, wins: 0, losses: 0, be: 0, rSum: 0, winRate: 0 };
      map.set(t.date, d);
    }
    d.count++;
    d.pnl += t.pnl;
    d.rSum += t.r;
    if (t.result === 'Win') d.wins++;
    else if (t.result === 'Loss') d.losses++;
    else d.be++;
  }
  for (const d of map.values()) d.winRate = d.count ? (d.wins / d.count) * 100 : 0;
  return map;
}

// ── Day-of-week performance ───────────────────────────────────────────────────
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export interface DowRow {
  day: string;
  trades: number;
  pnl: number;
  wins: number;
  winRate: number;
}

export function deriveByDayOfWeek(trades: Trade[]): DowRow[] {
  const rows: DowRow[] = WEEKDAYS.map((day) => ({ day, trades: 0, pnl: 0, wins: 0, winRate: 0 }));
  for (const t of trades) {
    const [y, m, d] = t.date.split('-').map(Number);
    const wd = new Date(Date.UTC(y, (m || 1) - 1, d || 1)).getUTCDay();
    const row = rows[wd];
    row.trades++;
    row.pnl += t.pnl;
    if (t.result === 'Win') row.wins++;
  }
  for (const r of rows) r.winRate = r.trades ? (r.wins / r.trades) * 100 : 0;
  return rows;
}

// ── R-multiple distribution ───────────────────────────────────────────────────
export interface RBucket {
  label: string;
  wins: number;
  losses: number;
  total: number;
}

export function deriveRDistribution(trades: Trade[]): RBucket[] {
  const defs = [
    { label: '≤ -2R', min: -Infinity, max: -2 },
    { label: '-2…-1R', min: -2, max: -1 },
    { label: '-1…0R', min: -1, max: 0 },
    { label: '0…1R', min: 0, max: 1 },
    { label: '1…2R', min: 1, max: 2 },
    { label: '2…3R', min: 2, max: 3 },
    { label: '> 3R', min: 3, max: Infinity },
  ];
  return defs.map((b) => {
    const rows = trades.filter((t) => t.r > b.min && t.r <= b.max);
    const wins = rows.filter((t) => t.pnl > 0).length;
    return { label: b.label, wins, losses: rows.length - wins, total: rows.length };
  });
}

// ── Advanced quant metrics ────────────────────────────────────────────────────
export interface Advanced {
  maxWinStreak: number;
  maxLossStreak: number;
  currentStreak: number; // + wins, − losses
  bestTrade?: Trade;
  worstTrade?: Trade;
  bestDay?: DailyAgg;
  worstDay?: DailyAgg;
  tradingDays: number;
  profitDays: number;
  lossDays: number;
  avgWinUsd: number;
  avgLossUsd: number;
  payoff: number; // avg win $ / |avg loss $|
  stdR: number;
  sharpe: number; // daily returns, annualised
  maxDdUsd: number;
  maxDdPct: number;
  recoveryFactor: number;
  riskOfRuin: number; // %
  consistency: number; // 0–100
  expectancyUsd: number;
  netPnl: number;
}

export function deriveAdvanced(trades: Trade[]): Advanced {
  const kpis = deriveKpis(trades);
  const sorted = sortByDate(trades);

  // streaks (BE is neutral → leaves the run intact)
  let cur = 0;
  let maxW = 0;
  let maxL = 0;
  for (const t of sorted) {
    if (t.result === 'Win') {
      cur = cur > 0 ? cur + 1 : 1;
      maxW = Math.max(maxW, cur);
    } else if (t.result === 'Loss') {
      cur = cur < 0 ? cur - 1 : -1;
      maxL = Math.max(maxL, -cur);
    }
  }

  const bestTrade = trades.reduce<Trade | undefined>((b, t) => (!b || t.pnl > b.pnl ? t : b), undefined);
  const worstTrade = trades.reduce<Trade | undefined>((b, t) => (!b || t.pnl < b.pnl ? t : b), undefined);

  const daily = [...deriveDaily(trades).values()];
  const tradingDays = daily.length;
  const profitDays = daily.filter((d) => d.pnl > 0).length;
  const lossDays = daily.filter((d) => d.pnl < 0).length;
  const bestDay = daily.reduce<DailyAgg | undefined>((b, d) => (!b || d.pnl > b.pnl ? d : b), undefined);
  const worstDay = daily.reduce<DailyAgg | undefined>((b, d) => (!b || d.pnl < b.pnl ? d : b), undefined);

  const winRows = trades.filter((t) => t.pnl > 0);
  const lossRows = trades.filter((t) => t.pnl < 0);
  const avgWinUsd = winRows.length ? winRows.reduce((s, t) => s + t.pnl, 0) / winRows.length : 0;
  const avgLossUsd = lossRows.length ? lossRows.reduce((s, t) => s + t.pnl, 0) / lossRows.length : 0;
  const payoff = avgLossUsd !== 0 ? avgWinUsd / Math.abs(avgLossUsd) : avgWinUsd > 0 ? 99 : 0;

  // std of R-multiples
  const n = trades.length;
  const meanR = n ? trades.reduce((s, t) => s + t.r, 0) / n : 0;
  const stdR = n ? Math.sqrt(trades.reduce((s, t) => s + (t.r - meanR) ** 2, 0) / n) : 0;

  // Sharpe from daily returns (fraction of starting capital), annualised √252
  const dayReturns = daily.map((d) => d.pnl / START_CAPITAL);
  const meanDay = dayReturns.length ? dayReturns.reduce((s, v) => s + v, 0) / dayReturns.length : 0;
  const stdDay = dayReturns.length
    ? Math.sqrt(dayReturns.reduce((s, v) => s + (v - meanDay) ** 2, 0) / dayReturns.length)
    : 0;
  const sharpe = stdDay > 0 ? (meanDay / stdDay) * Math.sqrt(252) : 0;

  // max drawdown ($ and %) from the equity curve
  const eq = deriveEquity(trades);
  let peak = -Infinity;
  let maxDdUsd = 0;
  let maxDdPct = 0;
  for (const p of eq) {
    peak = Math.max(peak, p.equity);
    const ddUsd = p.equity - peak;
    if (ddUsd < maxDdUsd) maxDdUsd = ddUsd;
    if (peak > 0) {
      const ddPct = (ddUsd / peak) * 100;
      if (ddPct < maxDdPct) maxDdPct = ddPct;
    }
  }
  const recoveryFactor = maxDdUsd !== 0 ? kpis.netPnl / Math.abs(maxDdUsd) : kpis.netPnl > 0 ? 99 : 0;

  // risk of ruin (20-unit gambler's ruin approximation on R-edge)
  const decisive = kpis.wins + kpis.losses;
  const p = decisive ? kpis.wins / decisive : 0;
  const bR = kpis.avgLoss !== 0 ? kpis.avgWin / Math.abs(kpis.avgLoss) : 0;
  const z = bR > 0 ? (p * bR - (1 - p)) / bR : -1;
  const riskOfRuin = z <= 0 ? 100 : clamp(0, 100, Math.pow((1 - z) / (1 + z), 20) * 100);

  // consistency score (0–100)
  const profitDayRate = tradingDays ? profitDays / tradingDays : 0;
  const pfNorm = clamp(0, 1, kpis.profitFactor / 3);
  const wrNorm = clamp(0, 1, kpis.winRate / 100);
  const consistency = clamp(
    0,
    100,
    (profitDayRate * 0.35 + pfNorm * 0.3 + wrNorm * 0.2 + (kpis.expectancy > 0 ? 0.15 : 0)) * 100 -
      Math.max(0, maxL - 3) * 4,
  );

  return {
    maxWinStreak: maxW,
    maxLossStreak: maxL,
    currentStreak: cur,
    bestTrade,
    worstTrade,
    bestDay,
    worstDay,
    tradingDays,
    profitDays,
    lossDays,
    avgWinUsd,
    avgLossUsd,
    payoff,
    stdR,
    sharpe,
    maxDdUsd,
    maxDdPct,
    recoveryFactor,
    riskOfRuin,
    consistency,
    expectancyUsd: kpis.expectancy,
    netPnl: kpis.netPnl,
  };
}

// ── AI coach ──────────────────────────────────────────────────────────────────
export type Tone = 'good' | 'warn' | 'danger' | 'info';
export interface Insight {
  title: string;
  detail: string;
  tone: Tone;
}
export interface Coaching {
  grade: string;
  score: number;
  headline: string;
  strengths: Insight[];
  weaknesses: Insight[];
  warnings: Insight[];
  actions: string[];
}

const usd0 = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
const pct1 = (n: number) => `${n.toFixed(1)}%`;
const EMOTION_RISK = ['Impulsive', 'Greedy', 'Anxious'];

export function generateCoaching(trades: Trade[]): Coaching {
  const kpis = deriveKpis(trades);
  const adv = deriveAdvanced(trades);
  const byAsset = groupBy(trades, 'asset');
  const bySetup = groupBy(trades, 'setup');
  const bySession = groupBy(trades, 'session');
  const byEmotion = groupBy(trades, 'emotion');
  const byAccount = groupBy(trades, 'account');

  const top = (rows: GroupRow[]) => rows[0];
  const bottom = (rows: GroupRow[]) => rows[rows.length - 1];
  const sized = (rows: GroupRow[]) => rows.filter((r) => r.trades >= 3);

  // ── overall score → grade ──
  // Bounded, fund-grade scoring: each factor is capped so no single metric maxes
  // the grade. Reserves A+ for genuinely exceptional, profitable + low-risk play.
  let score = 46;
  score += clamp(-12, 13, (kpis.winRate - 50) * 0.5);
  score += clamp(-16, 19, (kpis.profitFactor - 1) * 13);
  score += Math.max(-16, adv.maxDdPct * 0.9); // maxDdPct is negative → drawdown penalty
  score += kpis.expectancy > 0 ? 6 : -12;
  score += clamp(0, 8, adv.recoveryFactor * 1.4);
  score += clamp(-6, 6, (adv.payoff - 1) * 6);
  score -= Math.max(0, adv.maxLossStreak - 3) * 3.5;
  score -= clamp(0, 8, adv.riskOfRuin * 0.4);
  score = Math.round(clamp(0, 100, score));
  const grade = score >= 85 ? 'A+' : score >= 75 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D';

  const headline =
    kpis.netPnl >= 0
      ? `พอร์ตทำกำไรสุทธิ ${usd0(kpis.netPnl)} จาก ${kpis.total} เทรด · Win ${pct1(kpis.winRate)} · PF ${kpis.profitFactor.toFixed(2)} — เกรดวินัยรวม ${grade}`
      : `พอร์ตขาดทุนสุทธิ ${usd0(kpis.netPnl)} จาก ${kpis.total} เทรด · Win ${pct1(kpis.winRate)} · PF ${kpis.profitFactor.toFixed(2)} — ต้องรัดวินัยด่วน (เกรด ${grade})`;

  // ── strengths ──
  const strengths: Insight[] = [];
  if (kpis.winRate >= 55)
    strengths.push({ title: 'Win Rate แข็งแรง', detail: `ชนะ ${pct1(kpis.winRate)} (${kpis.wins}W/${kpis.losses}L) — สูงกว่าค่ามาตรฐาน`, tone: 'good' });
  if (kpis.profitFactor >= 1.4)
    strengths.push({ title: 'Edge ชัดเจน', detail: `Profit Factor ${kpis.profitFactor.toFixed(2)} — กำไรรวมมากกว่าขาดทุน ${kpis.profitFactor.toFixed(1)} เท่า`, tone: 'good' });
  if (adv.payoff >= 1.3)
    strengths.push({ title: 'คุม Risk:Reward ดี', detail: `กำไรเฉลี่ย ${usd0(adv.avgWinUsd)} เทียบขาดทุนเฉลี่ย ${usd0(adv.avgLossUsd)} (payoff ${adv.payoff.toFixed(2)})`, tone: 'good' });
  const bestAsset = sized(byAsset).filter((r) => r.pnl > 0)[0];
  if (bestAsset)
    strengths.push({ title: `สินทรัพย์ทำเงิน: ${bestAsset.name}`, detail: `กำไร ${usd0(bestAsset.pnl)} · WR ${pct1(bestAsset.winRate)} จาก ${bestAsset.trades} เทรด`, tone: 'good' });
  const bestSetup = sized(bySetup).filter((r) => r.pnl > 0)[0];
  if (bestSetup)
    strengths.push({ title: `Setup เด่น: ${bestSetup.name}`, detail: `กำไร ${usd0(bestSetup.pnl)} · WR ${pct1(bestSetup.winRate)}`, tone: 'good' });
  if (adv.maxWinStreak >= 4)
    strengths.push({ title: 'รักษาโมเมนตัมได้', detail: `เคยชนะติดต่อกันสูงสุด ${adv.maxWinStreak} ไม้`, tone: 'good' });

  // ── weaknesses ──
  const weaknesses: Insight[] = [];
  const worstAsset = sized(byAsset).filter((r) => r.pnl < 0).pop();
  if (worstAsset)
    weaknesses.push({ title: `จุดรั่ว: ${worstAsset.name}`, detail: `ขาดทุนรวม ${usd0(worstAsset.pnl)} · WR เพียง ${pct1(worstAsset.winRate)} จาก ${worstAsset.trades} เทรด`, tone: 'danger' });
  const worstSetup = sized(bySetup).filter((r) => r.pnl < 0).pop();
  if (worstSetup)
    weaknesses.push({ title: `Setup ขาดทุน: ${worstSetup.name}`, detail: `ผลรวม ${usd0(worstSetup.pnl)} · WR ${pct1(worstSetup.winRate)}`, tone: 'warn' });
  const worstEmotion = byEmotion.filter((r) => EMOTION_RISK.includes(r.name) && r.pnl < 0).sort((a, b) => a.pnl - b.pnl)[0];
  if (worstEmotion)
    weaknesses.push({ title: `อารมณ์ฉุดผล: ${worstEmotion.name}`, detail: `เทรดตอน ${worstEmotion.name} → ${usd0(worstEmotion.pnl)} · WR ${pct1(worstEmotion.winRate)}`, tone: 'danger' });
  const worstSession = sized(bySession).filter((r) => r.pnl < 0).pop();
  if (worstSession)
    weaknesses.push({ title: `ช่วงเวลาเสียเปรียบ: ${worstSession.name}`, detail: `ผลรวม ${usd0(worstSession.pnl)} · WR ${pct1(worstSession.winRate)}`, tone: 'warn' });
  if (adv.payoff < 1 && adv.avgLossUsd !== 0)
    weaknesses.push({ title: 'RR ต่ำกว่า 1', detail: `กำไรเฉลี่ย ${usd0(adv.avgWinUsd)} เล็กกว่าขาดทุนเฉลี่ย ${usd0(adv.avgLossUsd)} — ต้องปล่อยกำไรให้วิ่ง`, tone: 'warn' });
  if (kpis.winRate < 45)
    weaknesses.push({ title: 'Win Rate ต่ำ', detail: `ชนะเพียง ${pct1(kpis.winRate)} — ทบทวนเกณฑ์เข้าออเดอร์`, tone: 'warn' });

  // ── warnings (risk) ──
  const warnings: Insight[] = [];
  if (adv.maxDdPct <= -8)
    warnings.push({ title: 'Drawdown สูง', detail: `เคย Drawdown ${pct1(adv.maxDdPct)} (${usd0(adv.maxDdUsd)}) — ใกล้เพดานบาง prop firm`, tone: 'danger' });
  if (adv.maxLossStreak >= 4)
    warnings.push({ title: 'เสี่ยง Revenge Trading', detail: `เคยแพ้ติดต่อกัน ${adv.maxLossStreak} ไม้ — ตั้งกฎหยุดพักก่อนถึงจุดนั้น`, tone: 'danger' });
  if (adv.riskOfRuin >= 5)
    warnings.push({ title: 'Risk of Ruin สูง', detail: `ประเมิน ~${pct1(adv.riskOfRuin)} ที่จะเสียพอร์ตหากเสี่ยงเท่าเดิม — ลดขนาดความเสี่ยง`, tone: 'danger' });
  // overtrading: a day with many trades that still lost money
  const overDay = [...deriveDaily(trades).values()].filter((d) => d.count >= 5 && d.pnl < 0).sort((a, b) => a.pnl - b.pnl)[0];
  if (overDay)
    warnings.push({ title: 'สัญญาณ Overtrading', detail: `วันที่ ${overDay.date} เปิด ${overDay.count} ไม้ แต่ขาดทุน ${usd0(overDay.pnl)}`, tone: 'warn' });
  if (adv.currentStreak <= -3)
    warnings.push({ title: 'กำลังแพ้ติดกัน', detail: `ขณะนี้แพ้ ${Math.abs(adv.currentStreak)} ไม้ติด — พิจารณาลดไซซ์หรือหยุดพัก`, tone: 'warn' });
  const worstAccount = byAccount.filter((r) => r.pnl < 0).sort((a, b) => a.pnl - b.pnl)[0];
  if (worstAccount)
    warnings.push({ title: `บัญชีติดลบ: ${worstAccount.name}`, detail: `${usd0(worstAccount.pnl)} · WR ${pct1(worstAccount.winRate)} — โฟกัสกู้บัญชีนี้`, tone: 'warn' });

  // ── action plan ──
  const actions: string[] = [];
  const focusSetup = top(bySetup);
  const focusSession = top(bySession);
  if (focusSetup && focusSession && focusSetup.pnl > 0)
    actions.push(`โฟกัส setup “${focusSetup.name}” ในช่วง ${focusSession.name} ที่ให้ edge ดีที่สุด`);
  if (worstAsset) actions.push(`ลด/งดเทรด ${worstAsset.name} จนกว่าจะมีแผนชัด — เป็นตัวฉุดกำไรหลัก`);
  if (worstEmotion) actions.push(`ตั้งกฎ: หยุดเมื่อรู้สึก “${worstEmotion.name}” เพราะ WR ตกเหลือ ${pct1(worstEmotion.winRate)}`);
  if (adv.maxLossStreak >= 4) actions.push(`หยุดเทรดเมื่อแพ้ติดกัน ${Math.max(2, adv.maxLossStreak - 1)} ไม้ เพื่อเลี่ยง revenge`);
  if (adv.payoff < 1.2) actions.push('ขยับเป้า take-profit / ใช้ trailing stop ให้ payoff เกิน 1.2');
  actions.push(`รักษาความเสี่ยงคงที่ต่อไม้ และคุม Max Drawdown ให้ดีกว่า ${pct1(adv.maxDdPct)}`);

  return {
    grade,
    score,
    headline,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    warnings: warnings.slice(0, 4),
    actions: actions.slice(0, 5),
  };
}
