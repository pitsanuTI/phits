'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react';
import { useTradingData } from '@/lib/trading/store';
import { calculateProfitFactor } from '@/lib/trading/selectors';
import type { Trade } from '@/data/trading-data-mock';

// ── Setup → descriptive tags (display only; setups themselves come from data) ──
const SETUP_TAGS: Record<string, string[]> = {
  Breakout:       ['Momentum', 'H1', 'Volume'],
  'Trend Follow': ['Trend', 'D1', 'SMA'],
  Reversal:       ['Counter-trend', 'M15', 'Divergence'],
  Retest:         ['Confirmation', 'H4', 'Support/Resist'],
  Range:          ['Mean-revert', 'M30', 'Range'],
};

const BAR_COLORS = ['#7c5cbf', '#a78bfa', '#c4b5fd', '#38bdf8', '#ddd6fe'];

type PlaybookRow = {
  name: string;
  trades: number;
  winRate: number;
  totalR: number;
  pnl: number;
  profitFactor: number;
  status: 'Active' | 'Testing' | 'Review';
  tags: string[];
};

const statusColors: Record<string, string> = { Active: '#10b981', Testing: '#f97316', Review: '#f43f5e' };

// Derive a live playbook from the real trade log, grouped by setup.
function buildPlaybook(trades: Trade[]): PlaybookRow[] {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const arr = map.get(t.setup) ?? [];
    arr.push(t);
    map.set(t.setup, arr);
  }
  const rows: PlaybookRow[] = [];
  for (const [name, rowTrades] of map) {
    const wins = rowTrades.filter((t) => t.result === 'Win').length;
    const winRate = rowTrades.length ? (wins / rowTrades.length) * 100 : 0;
    const totalR = rowTrades.reduce((s, t) => s + t.r, 0);
    const pnl = rowTrades.reduce((s, t) => s + t.pnl, 0);
    const profitFactor = calculateProfitFactor(rowTrades);
    const status: PlaybookRow['status'] =
      pnl > 0 && winRate >= 58 ? 'Active' : pnl > 0 ? 'Testing' : 'Review';
    rows.push({
      name, trades: rowTrades.length, winRate, totalR, pnl, profitFactor, status,
      tags: SETUP_TAGS[name] ?? ['Setup'],
    });
  }
  return rows.sort((a, b) => b.pnl - a.pnl);
}

const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;

export default function StrategyTab() {
  const { trades } = useTradingData();

  const playbook = useMemo(() => buildPlaybook(trades), [trades]);
  const chartData = useMemo(
    () => playbook.map((p) => ({ name: p.name, pnl: p.pnl })),
    [playbook],
  );
  const best = playbook[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Playbook */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600"><Layers size={16} /></span>
              <div>
                <div className="font-extrabold text-[15px] text-[#151a3d]">Strategy Playbook</div>
                <div className="text-[11px] font-medium text-slate-400">คำนวณสดจากบันทึกการเทรดจริง · จัดกลุ่มตาม Setup</div>
              </div>
            </div>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-600">{playbook.length} setups</span>
          </div>

          <div className="space-y-3">
            {playbook.map((s) => {
              const rPos = s.totalR >= 0;
              return (
                <div key={s.name} className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm text-gray-800">{s.name}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: statusColors[s.status] + '20', color: statusColors[s.status] }}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                    <span>Trades: <span className="font-semibold text-gray-700">{s.trades}</span></span>
                    <span>Win Rate: <span className="font-semibold text-gray-700">{s.winRate.toFixed(1)}%</span></span>
                    <span>Total R: <span className={`font-semibold ${rPos ? 'text-emerald-500' : 'text-red-400'}`}>{rPos ? '+' : ''}{s.totalR.toFixed(2)}R</span></span>
                    <span>PF: <span className="font-semibold text-gray-700">{s.profitFactor >= 99 ? '∞' : s.profitFactor.toFixed(2)}</span></span>
                    <span>P&amp;L: <span className={`font-semibold ${s.pnl >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>{usd(s.pnl)}</span></span>
                  </div>
                  {/* Win-rate bar */}
                  <div className="mb-2 h-1.5 w-full rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, s.winRate)}%`, background: statusColors[s.status] }} />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {s.tags.map((t) => (
                      <span key={t} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Performance Comparison chart — real P&L per setup */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Performance Comparison</div>
            <div className="mb-3 text-[11px] font-medium text-slate-400">กำไร/ขาดทุนรวมต่อ Setup</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical" barCategoryGap="30%">
                <XAxis type="number" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v: number) => [usd(v), 'P&L']} />
                <Bar dataKey="pnl" radius={[0, 6, 6, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? BAR_COLORS[i % BAR_COLORS.length] : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top edge summary — derived */}
          {best && (
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <div className="mb-2 flex items-center gap-1.5 font-semibold text-sm text-purple-700">
                <Target size={14} /> Best Edge — {best.name}
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  {best.winRate >= 50 ? <TrendingUp size={13} className="text-emerald-500" /> : <TrendingDown size={13} className="text-red-400" />}
                  Win Rate {best.winRate.toFixed(1)}% จาก {best.trades} ดีล
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  ทำกำไรรวม {usd(best.pnl)} · {best.totalR >= 0 ? '+' : ''}{best.totalR.toFixed(2)}R
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  Profit Factor {best.profitFactor >= 99 ? '∞' : best.profitFactor.toFixed(2)} — โฟกัส Setup นี้ต่อ
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
