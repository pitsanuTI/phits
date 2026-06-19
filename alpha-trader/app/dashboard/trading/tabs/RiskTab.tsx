'use client';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calculator, Shield, TrendingUp, Layers } from 'lucide-react';
import { useTradingData } from '@/lib/trading/store';
import { calculateMaxDrawdown } from '@/lib/trading/selectors';
import {
  START_CAPITAL, deriveEquity, deriveMonthly, assetInfo,
  type Trade,
} from '@/data/trading-data-mock';

const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;

// Per-asset exposure & risk, derived from the live trade log.
type AssetRisk = {
  asset: string; trades: number; pnl: number; winRate: number;
  exposure: number;       // % share of total risk taken (|R|)
  avgRisk: number;        // avg |R| per trade
  color: string;
};

function buildAssetRisk(trades: Trade[]): AssetRisk[] {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const arr = map.get(t.asset) ?? []; arr.push(t); map.set(t.asset, arr);
  }
  const totalAbsR = trades.reduce((s, t) => s + Math.abs(t.r), 0) || 1;
  const rows: AssetRisk[] = [];
  for (const [asset, rowTrades] of map) {
    const absR = rowTrades.reduce((s, t) => s + Math.abs(t.r), 0);
    const wins = rowTrades.filter((t) => t.result === 'Win').length;
    rows.push({
      asset,
      trades: rowTrades.length,
      pnl: rowTrades.reduce((s, t) => s + t.pnl, 0),
      winRate: rowTrades.length ? (wins / rowTrades.length) * 100 : 0,
      exposure: +((absR / totalAbsR) * 100).toFixed(1),
      avgRisk: +(absR / rowTrades.length).toFixed(2),
      color: assetInfo(asset).color,
    });
  }
  return rows.sort((a, b) => b.exposure - a.exposure);
}

export default function RiskTab() {
  const { trades } = useTradingData();

  // ── Derived equity / drawdown ──────────────────────────────────────────────
  const equityCurve = useMemo(() => deriveEquity(trades), [trades]);
  const currentEquity = equityCurve.length ? equityCurve[equityCurve.length - 1].equity : START_CAPITAL;
  const peakEquity = useMemo(() => Math.max(...equityCurve.map((p) => p.equity), START_CAPITAL), [equityCurve]);
  const currentDdPct = peakEquity > 0 ? ((currentEquity - peakEquity) / peakEquity) * 100 : 0;
  const maxDdPct = useMemo(() => calculateMaxDrawdown(trades), [trades]);

  const assetRisk = useMemo(() => buildAssetRisk(trades), [trades]);
  const monthly = useMemo(() => deriveMonthly(trades), [trades]);

  // Worst single-day & current-month loss (for loss-limit buffers)
  const { worstDayLoss, monthLoss } = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const t of trades) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.pnl);
    let worst = 0;
    for (const v of byDay.values()) if (v < worst) worst = v;
    const lastMonth = monthly[monthly.length - 1];
    return { worstDayLoss: Math.abs(Math.min(0, worst)), monthLoss: Math.abs(Math.min(0, lastMonth?.pnl ?? 0)) };
  }, [trades, monthly]);

  // Prop-style limits derived from starting capital
  const dailyLimit = START_CAPITAL * 0.05;   // 5% daily
  const weeklyLimit = START_CAPITAL * 0.10;  // 10% overall

  // ── Position sizing calculator (interactive; defaults from real equity) ─────
  const [riskPct, setRiskPct] = useState('1');
  const [accountSize, setAccountSize] = useState(String(Math.round(currentEquity)));
  const [sl, setSl] = useState('50');
  const riskAmt = (parseFloat(accountSize) || 0) * (parseFloat(riskPct) || 0) / 100;
  const posSize = sl !== '0' && parseFloat(sl) ? (riskAmt / parseFloat(sl)).toFixed(2) : '–';

  // ── Compounding projection from real avg monthly return ─────────────────────
  const avgMonthlyPnl = monthly.length ? monthly.reduce((s, m) => s + m.pnl, 0) / monthly.length : 0;
  const monthlyRate = START_CAPITAL > 0 ? avgMonthlyPnl / START_CAPITAL : 0;
  const projection = [1, 3, 6, 12].map((m) => {
    const proj = currentEquity * Math.pow(1 + monthlyRate, m);
    const growth = currentEquity > 0 ? ((proj - currentEquity) / currentEquity) * 100 : 0;
    return { period: m === 1 ? '1 Month' : m === 12 ? '1 Year' : `${m} Months`, proj, growth };
  });

  const ddBuffers = [
    { label: 'Current Drawdown', val: currentDdPct, max: maxDdPct || -1, isPct: true, color: '#f43f5e' },
    { label: 'Daily Loss Used', val: worstDayLoss, max: dailyLimit, isPct: false, color: '#f97316' },
    { label: 'Monthly Loss Used', val: monthLoss, max: weeklyLimit, isPct: false, color: '#fbbf24' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Position Sizing Calculator */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600"><Calculator size={16} /></span>
            <div>
              <div className="font-extrabold text-[15px] text-[#151a3d]">Position Sizing</div>
              <div className="text-[11px] font-medium text-slate-400">ค่าเริ่มต้นจาก Equity จริง {usd(currentEquity)}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Size ($)</label>
              <input value={accountSize} onChange={(e) => setAccountSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Risk per Trade (%)</label>
              <input value={riskPct} onChange={(e) => setRiskPct(e.target.value)} type="number" min="0.1" max="5" step="0.1"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
              <input type="range" min="0.1" max="5" step="0.1" value={riskPct}
                onChange={(e) => setRiskPct(e.target.value)} className="w-full mt-2 accent-purple-600" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Stop Loss (pips / points)</label>
              <input value={sl} onChange={(e) => setSl(e.target.value)} type="number"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
          </div>
          <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Risk Amount</span>
              <span className="font-bold text-purple-700">${riskAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Position Size</span>
              <span className="font-bold text-purple-700">{posSize} lots</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Max Risk %</span>
              <span className="font-bold text-emerald-500">{riskPct}%</span>
            </div>
          </div>
        </div>

        {/* Exposure Chart — real, per-asset */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Layers size={16} /></span>
            <div>
              <div className="font-extrabold text-[15px] text-[#151a3d]">Asset Exposure &amp; Risk</div>
              <div className="text-[11px] font-medium text-slate-400">สัดส่วนความเสี่ยง (|R|) ต่อสินทรัพย์จริง</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={assetRisk} layout="vertical" barCategoryGap="25%">
              <XAxis type="number" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="asset" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Exposure']} />
              <Bar dataKey="exposure" radius={[0, 5, 5, 0]}>
                {assetRisk.map((a, i) => <Cell key={i} fill={a.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {assetRisk.map((a) => (
              <div key={a.asset} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                  <span className="text-gray-700 font-medium">{a.asset}</span>
                </span>
                <span className="text-gray-400">
                  {a.trades} ดีล · WR {a.winRate.toFixed(0)}% ·
                  <span className={a.pnl >= 0 ? 'text-emerald-500 ml-1' : 'text-red-400 ml-1'}>{usd(a.pnl)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Drawdown Buffer + Compounding */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-500"><Shield size={16} /></span>
              <div className="font-extrabold text-[15px] text-[#151a3d]">Drawdown Buffer</div>
            </div>
            <div className="space-y-3">
              {ddBuffers.map((b) => {
                const ratio = b.max ? Math.min(100, Math.abs(b.val / b.max) * 100) : 0;
                return (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{b.label}</span>
                      <span className="font-semibold text-gray-700">
                        {b.isPct ? `${b.val.toFixed(2)}% / ${b.max.toFixed(2)}%` : `${usd(b.val)} / ${usd(b.max)}`}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${ratio}%`, background: b.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><TrendingUp size={16} /></span>
              <div>
                <div className="font-extrabold text-[15px] text-[#151a3d]">Compounding Projection</div>
                <div className="text-[11px] font-medium text-slate-400">จากผลตอบแทนเฉลี่ย {(monthlyRate * 100).toFixed(1)}%/เดือน</div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {projection.map((c) => (
                <div key={c.period} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">{c.period}</span>
                  <span className="font-semibold text-gray-700">{usd(c.proj)}</span>
                  <span className={`font-semibold ${c.growth >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    {c.growth >= 0 ? '+' : ''}{c.growth.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
