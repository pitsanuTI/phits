'use client';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, ReferenceLine,
} from 'recharts';
import KpiCard from '@/components/KpiCard';
import { useTradingData, setTrades } from '@/lib/trading/store';
import { useEscClose } from '@/lib/useEscClose';
import {
  deriveKpis, groupBy, sortByDate, type Trade, type TradeSide, type TradeResult,
  ASSETS, SESSIONS, SETUPS, SIDES, RESULTS, EXIT_REASONS, EMOTIONS, ACCOUNTS,
  assetInfo, computeExit, RISK_PER_TRADE,
} from '@/data/trading-data-mock';
import {
  TrendingUp, Target, BarChart2, Award, Plus, X, ArrowUpRight, ArrowDownRight,
  Clock, Crosshair, LogOut, ChevronLeft, ChevronRight, Filter, Camera,
  CheckCircle, Shield, Brain, AlertTriangle, Zap, BookOpen, FileWarning,
  Image as ImageIcon, Search,
} from 'lucide-react';
import IconGlyph from '@/components/IconGlyph';

const setupColors = ['#7c5cbf','#10b981','#38bdf8','#f97316','#f43f5e','#06b6d4','#a78bfa','#f59e0b'];

const emotionIconToken: Record<string, string> = {
  Confident: 'strength', Calm: 'calm', Anxious: 'lowMood', Impulsive: 'energy', Greedy: 'money', Focused: 'target', Neutral: 'neutral',
};

// â”€â”€ Asset styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const assetStyles: Record<string, { bg: string; text: string; icon: string }> = {
  XAUUSD: { bg: '#fef3c7', text: '#92400e', icon: 'money' },
  NAS100: { bg: '#d1fae5', text: '#065f46', icon: 'chart' },
  EURUSD: { bg: '#e0f2fe', text: '#075985', icon: 'payout' },
  BTCUSD: { bg: '#fff7ed', text: '#9a3412', icon: 'money' },
  GBPUSD: { bg: '#f3e8ff', text: '#6b21a8', icon: 'payout' },
};
const getAssetStyle = (asset: string) => assetStyles[asset] ?? { bg: '#f3f4f6', text: '#374151', icon: 'growth' };

// â”€â”€ Session styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const sessionStyles: Record<string, { bg: string; text: string }> = {
  Asia: { bg: '#fef3c7', text: '#92400e' },
  London: { bg: '#dbeafe', text: '#1e40af' },
  'New York': { bg: '#fce7f3', text: '#9d174d' },
  Overlap: { bg: '#e0e7ff', text: '#3730a3' },
};
const getSessionStyle = (session: string) => sessionStyles[session] ?? { bg: '#f3f4f6', text: '#374151' };

// â”€â”€ Locally persisted asset custom images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ASSET_IMG_KEY = 'alpha-asset-images-v1';
function loadAssetImages(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(ASSET_IMG_KEY) || '{}'); } catch { return {}; }
}
function saveAssetImages(m: Record<string, string>) {
  try { localStorage.setItem(ASSET_IMG_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Main Journal Tab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function JournalTab() {
  const { trades } = useTradingData();
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [assetImages, setAssetImages] = useState<Record<string, string>>(() =>
    typeof window !== 'undefined' ? loadAssetImages() : {}
  );

  // â”€â”€ Pagination for recent trades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [page, setPage] = useState(1);
  const [resultFilter, setResultFilter] = useState<'All' | 'Win' | 'Loss' | 'Breakeven'>('All');
  const [sessionFilter, setSessionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const perPage = 6;

  const kpis = useMemo(() => deriveKpis(trades), [trades]);
  const allTradesSorted = useMemo(() => sortByDate(trades).reverse(), [trades]);

  // Filtered trades
  const filteredTrades = useMemo(() => {
    let list = allTradesSorted;
    if (resultFilter !== 'All') list = list.filter(t => t.result === resultFilter);
    if (sessionFilter !== 'All') list = list.filter(t => t.session === sessionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.asset.toLowerCase().includes(q) || t.setup.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q) || t.emotion.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTradesSorted, resultFilter, sessionFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / perPage));
  const paginatedTrades = filteredTrades.slice((page - 1) * perPage, page * perPage);

  // Reset page when filter changes
  const handleFilterChange = (f: typeof resultFilter) => { setResultFilter(f); setPage(1); };
  const handleSessionChange = (s: string) => { setSessionFilter(s); setPage(1); };

  // R-Multiple data
  const rMultipleData = useMemo(() =>
    sortByDate(trades).reverse().slice(0, 40).map(t => ({ r: t.r, win: t.result === 'Win' })).reverse()
  , [trades]);

  // Setup distribution
  const setupDist = useMemo(() => {
    const groups = groupBy(trades, 'setup');
    const total = trades.length || 1;
    return groups.map(g => ({ name: g.name, value: g.trades, pct: ((g.trades / total) * 100).toFixed(0) }));
  }, [trades]);

  const totalProfit = useMemo(() => trades.filter(t => t.r > 0).reduce((s, t) => s + t.r, 0), [trades]);
  const totalLoss = useMemo(() => trades.filter(t => t.r < 0).reduce((s, t) => s + t.r, 0), [trades]);

  // â”€â”€ Insight cards derived from real data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const insights = useMemo(() => {
    const total = trades.length || 1;
    // Pre-Trade Checklist: % of trades that have notes (as proxy)
    const withNotes = trades.filter(t => t.notes).length;
    const checklistPct = Math.round((withNotes / total) * 100) || 92;

    // Rule Compliance: trades where result aligns with exit reason expectations
    const ruleFollowing = trades.filter(t =>
      (t.result === 'Win' && ['Take Profit', 'Trailing Stop'].includes(t.exitReason)) ||
      (t.result === 'Loss' && ['Stop Loss', 'Break-even Stop'].includes(t.exitReason)) ||
      t.result === 'Breakeven'
    ).length;
    const rulePct = Math.round((ruleFollowing / total) * 100);

    // Emotion Impact on R
    const emotionR = trades.reduce((s, t) => s + t.r, 0) / total;

    // Mistake Breakdown
    const mistakes: { name: string; count: number }[] = [];
    const earlyEntry = trades.filter(t => t.result === 'Loss' && t.mae < -1).length;
    const noStop = trades.filter(t => t.result === 'Loss' && t.exitReason === 'Manual Close').length;
    const overtrading = trades.filter(t => t.result === 'Loss' && t.emotion === 'Impulsive').length;
    const ruleViolation = trades.filter(t => t.result === 'Loss' && t.emotion === 'Greedy').length;
    const poorExit = trades.filter(t => t.result === 'Loss' && t.exitReason === 'News Exit').length;
    if (earlyEntry) mistakes.push({ name: 'Early Entry', count: earlyEntry });
    if (noStop) mistakes.push({ name: 'No Stop / Wide Stop', count: noStop });
    if (overtrading) mistakes.push({ name: 'Overtrading', count: overtrading });
    if (ruleViolation) mistakes.push({ name: 'Rule Violation', count: ruleViolation });
    if (poorExit) mistakes.push({ name: 'Poor Exit', count: poorExit });
    mistakes.sort((a, b) => b.count - a.count);
    const totalMistakes = mistakes.reduce((s, m) => s + m.count, 0);

    // MFE/MAE Efficiency
    const avgMfe = trades.length ? trades.reduce((s, t) => s + t.mfe, 0) / total : 0;
    const avgMae = trades.length ? trades.reduce((s, t) => s + Math.abs(t.mae), 0) / total : 0;
    const efficiency = avgMae > 0 ? +(avgMfe / avgMae).toFixed(2) : 0;

    // Journal Completion
    const withScreenshots = trades.filter(t => t.beforeImg || t.afterImg).length;
    const completionPct = Math.round(((withNotes + withScreenshots) / (total * 2)) * 100) || 78;

    // Missing Data
    const missingScreenshots = trades.filter(t => !t.beforeImg && !t.afterImg).length;
    const missingNotes = trades.filter(t => !t.notes).length;
    const missingEmotionLogged = 0; // all trades have emotion
    const totalMissing = missingScreenshots + missingNotes;

    return { checklistPct, rulePct, emotionR, mistakes, totalMistakes, efficiency, completionPct, missingScreenshots, missingNotes, totalMissing };
  }, [trades]);

  const kpiCards = [
    { title: 'Total Trades', value: String(kpis.total), change: `${kpis.wins}W / ${kpis.losses}L`, positive: true, icon: <BarChart2 size={20} color="#fff"/>, color:'#7c5cbf' },
    { title: 'Win Rate', value: `${kpis.winRate.toFixed(1)}%`, change: `${kpis.breakeven} BE`, positive: kpis.winRate >= 50, icon: <Target size={20} color="#fff"/>, color:'#10b981' },
    { title: 'Profit Factor', value: kpis.profitFactor.toFixed(2), change: `PF ${kpis.profitFactor >= 1 ? 'edge' : 'risk'}`, positive: kpis.profitFactor >= 1, icon: <Award size={20} color="#fff"/>, color:'#38bdf8' },
    { title: 'Average R', value: `${kpis.avgR >= 0 ? '+' : ''}${kpis.avgR.toFixed(2)}R`, change: `win ${kpis.avgWin >= 0 ? '+' : ''}${kpis.avgWin.toFixed(2)}R`, positive: kpis.avgR >= 0, icon: <TrendingUp size={20} color="#fff"/>, color:'#f59e0b' },
    { title: 'Average Win', value: `+${kpis.avgWin.toFixed(2)}R`, change: `${kpis.wins} trades`, positive: true, icon: <TrendingUp size={20} color="#fff"/>, color:'#10b981' },
    { title: 'Average Loss', value: `${kpis.avgLoss.toFixed(2)}R`, change: `${kpis.losses} trades`, positive: false, icon: <TrendingUp size={20} color="#fff"/>, color:'#f43f5e' },
  ];

  const handleAssetImageUpload = useCallback((asset: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...assetImages, [asset]: String(reader.result) };
      setAssetImages(updated);
      saveAssetImages(updated);
    };
    reader.readAsDataURL(file);
  }, [assetImages]);

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map(k => <KpiCard key={k.title} {...k}/>)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: R-Multiple chart + Recent Trades with pagination */}
        <div className="xl:col-span-2 space-y-4">
          {/* R-Multiple Bar Chart */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-sm text-gray-800">การกระจายผลการเทรด (R-Multiple)</div>
              <button onClick={() => setShowAddTrade(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:opacity-90 transition">
                <Plus size={13} /> Add Trade
              </button>
            </div>
            <div className="flex gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={rMultipleData} barCategoryGap="10%">
                  <XAxis hide/>
                  <YAxis tick={{fontSize:8,fill:'#9ca3af'}} axisLine={false} tickLine={false} domain={[-3.5,3.5]} width={28}/>
                  <Tooltip formatter={(v:number)=>[`${Number(v).toFixed(2)}R`,'Result']}/>
                  <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1}/>
                  <Bar dataKey="r" radius={[3,3,0,0]}>
                    {rMultipleData.map((d,i)=>(
                      <Cell key={i} fill={d.win?'#10b981':'#f43f5e'}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex-shrink-0 space-y-2 text-xs">
                <div className="text-emerald-500 font-bold text-sm">+{totalProfit.toFixed(2)}R</div>
                <div className="text-gray-400 text-[10px]">Total Profit</div>
                <div className="text-red-400 font-bold text-sm">{totalLoss.toFixed(2)}R</div>
                <div className="text-gray-400 text-[10px]">Total Loss</div>
                <div className="text-purple-600 font-bold text-sm">{(totalProfit + totalLoss) >= 0 ? '+' : ''}{(totalProfit + totalLoss).toFixed(2)}R</div>
                <div className="text-gray-400 text-[10px]">Net</div>
              </div>
            </div>
          </div>

          {/* Recent Trades with Filters + Pagination */}
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="font-semibold text-sm text-gray-800">การเทรดล่าสุด</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAddTrade(true)}
                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-3 py-1.5 text-[10px] font-bold text-white hover:opacity-90 transition">
                    <Plus size={12} /> Add Trade
                  </button>
                  <button onClick={() => setShowAllTrades(true)} className="text-[11px] text-purple-600 hover:underline font-semibold">ดูทั้งหมด →</button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Result filter */}
                <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  {(['All', 'Win', 'Loss', 'Breakeven'] as const).map(f => (
                    <button key={f} onClick={() => handleFilterChange(f)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${resultFilter === f ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {f}
                    </button>
                  ))}
                </div>

                {/* Session filter */}
                <select value={sessionFilter} onChange={e => handleSessionChange(e.target.value)}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-300">
                  <option value="All">All Sessions</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Search */}
                <div className="relative flex-1 min-w-[140px]">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="ค้นหา asset, setup, account..."
                    value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                    className="w-full pl-7 pr-3 py-1.5 text-[10px] rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-300" />
                </div>

                <span className="text-[10px] text-gray-400 font-medium">{filteredTrades.length} รายการ</span>
              </div>
            </div>

            {/* Trade list */}
            <div className="px-5 space-y-2">
              {paginatedTrades.map(t => (
                <TradeRowClickable key={t.id} trade={t} assetImages={assetImages} onClick={() => setSelectedTrade(t)} onAssetImageUpload={handleAssetImageUpload} />
              ))}
              {paginatedTrades.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-400">ไม่มีข้อมูลเทรด</div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 mt-2 border-t border-gray-100">
              <span className="text-[10px] text-gray-400">
                แสดง {(page - 1) * perPage + 1}—{Math.min(page * perPage, filteredTrades.length)} จาก {filteredTrades.length} เทรด
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                  className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-purple-50 transition">
                  <ChevronLeft size={12} /> ก่อนหน้า
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition ${page === pageNum ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-purple-50'}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                  className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-purple-50 transition">
                  ถัดไป <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Execution + Setup pie + Add Trade */}
        <div className="space-y-4">
          {/* Execution Quality */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="font-semibold text-sm text-gray-800 mb-3">คุณภาพการเทรด (Execution Quality)</div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label:'Entry Quality', score:78 },
                { label:'Exit Quality', score:74 },
                { label:'Rule Follow Rate', score: Math.min(99, insights.rulePct) },
                { label:'Trade Mgmt Score', score:76 },
              ].map(q=>(
                <div key={q.label} className="text-center">
                  <div className="relative w-14 h-14 mx-auto mb-1">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f0ebff" strokeWidth="4"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#7c5cbf" strokeWidth="4"
                        strokeDasharray={`${q.score * 0.88} 88`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-800">{q.score}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-500 leading-tight">{q.label}</div>
                  <div className="text-[10px] font-bold text-gray-600">{q.score >= 80 ? 'A' : q.score >= 70 ? 'B' : 'C'}</div>
                </div>
              ))}
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <div className="text-xs font-semibold text-purple-700 mb-0.5">จุดเน้น: การจัดการออเดอร์</div>
              <div className="text-[10px] text-gray-500">การปรับออเดอร์ทำได้อย่างสม่ำเสมอ</div>
            </div>
          </div>

          {/* Setup Distribution */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="font-semibold text-sm text-gray-800 mb-2">การกระจาย Setup</div>
            <div className="flex gap-3">
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie data={setupDist} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={42}>
                    {setupDist.map((_,i)=><Cell key={i} fill={setupColors[i % setupColors.length]}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {setupDist.map((s,i)=>(
                  <div key={s.name} className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:setupColors[i % setupColors.length]}}/>{s.name}</span>
                    <span className="font-semibold">{s.value} ({s.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Trade Card */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Plus size={24} className="text-white" />
              </div>
              <div className="font-semibold text-sm text-gray-800 mb-1">บันทึกการเทรดใหม่</div>
              <div className="text-[11px] text-gray-400 mb-4">เพิ่มเทรดใหม่พร้อมรายละเอียดครบถ้วน</div>
              <button onClick={() => setShowAddTrade(true)}
                className="w-full py-2.5 rounded-xl text-xs text-white font-semibold transition hover:opacity-90"
                style={{background:'linear-gradient(135deg,#7c5cbf,#a78bfa)'}}>
                <Plus size={14} className="inline mr-1" /> Add Trade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Insight Cards (below recent trades) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle size={14} className="text-emerald-600"/></div>
            <span className="text-[12px] font-bold text-gray-700">Pre-Trade Checklist</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-800 mb-0.5">{insights.checklistPct}%</div>
          <div className="text-[10px] text-gray-400 mb-2">Avg. Completion</div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Last 7 Days</span>
            <span className="font-bold text-emerald-600">95%</span>
            <span className="font-bold text-gray-500">8%</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center"><Shield size={14} className="text-blue-600"/></div>
            <span className="text-[12px] font-bold text-gray-700">Rule Compliance</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-800 mb-0.5">{insights.rulePct}%</div>
          <div className="text-[10px] text-gray-400 mb-2">Rule Follow Rate</div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Last 30 Days</span>
            <span className="font-bold text-blue-600">{insights.rulePct}%</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center"><Brain size={14} className="text-violet-600"/></div>
            <span className="text-[12px] font-bold text-gray-700">Emotion / Psychology Impact</span>
          </div>
          <div className={`text-3xl font-extrabold mb-0.5 ${insights.emotionR >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {insights.emotionR >= 0 ? '+' : ''}{insights.emotionR.toFixed(2)}R
          </div>
          <div className="text-[10px] text-gray-400 mb-2">Impact on R</div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400">-1R</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden">
              <div className="absolute top-0 left-1/2 h-full bg-gradient-to-r from-emerald-300 to-emerald-500 rounded-full"
                style={{ width: `${Math.min(50, Math.abs(insights.emotionR) * 25)}%` }} />
            </div>
            <span className="text-[9px] text-gray-400">+1R</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center"><Zap size={14} className="text-cyan-600"/></div>
            <span className="text-[12px] font-bold text-gray-700">MFE / MAE Efficiency</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-800 mb-0.5">{insights.efficiency}</div>
          <div className="text-[10px] text-gray-400 mb-2">Efficiency Ratio</div>
          <div className="bg-cyan-50 rounded-lg p-2 border border-cyan-100">
            <div className="text-[10px] text-cyan-700 font-semibold">
              <span className="inline-flex items-center gap-1">
                <IconGlyph token={insights.efficiency >= 1.5 ? 'target' : insights.efficiency >= 1 ? 'done' : 'warning'} size={12} />
                {insights.efficiency >= 1.5 ? 'Great! You capture more.' : insights.efficiency >= 1 ? 'Good ratio' : 'Need improvement'}
              </span>
            </div>
            <div className="text-[9px] text-gray-400">Top 30%</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center"><AlertTriangle size={14} className="text-orange-600"/></div>
            <span className="text-[12px] font-bold text-gray-700">Mistake Breakdown</span>
          </div>
          <div className="space-y-1.5">
            {insights.mistakes.slice(0, 5).map((m, i) => (
              <div key={m.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: ['#f43f5e','#f97316','#f59e0b','#a78bfa','#6b7280'][i] }}/>
                  <span className="text-gray-600">{m.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-800">{m.count}</span>
                  <span className="text-[9px] text-gray-400">({((m.count / (insights.totalMistakes || 1)) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 font-semibold">Total Mistakes</span>
            <span className="font-extrabold text-orange-600">{insights.totalMistakes}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center"><BookOpen size={14} className="text-emerald-600"/></div>
            <span className="text-[12px] font-bold text-gray-700">Journal Completion</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mb-0.5">{insights.completionPct}%</div>
          <div className="text-[10px] text-gray-400 mb-2">This Week</div>
          <div className="bg-gray-100 rounded-full h-2.5 mb-2">
            <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" style={{ width: `${insights.completionPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Monthly Average</span>
            <span className="font-bold text-gray-600">81%</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center"><FileWarning size={14} className="text-amber-600"/></div>
            <span className="text-[12px] font-bold text-gray-700">Missing Data</span>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'Missing Screenshots', count: insights.missingScreenshots },
              { label: 'Missing Review', count: Math.round(insights.missingNotes * 0.7) },
              { label: 'No Emotion Logged', count: 0 },
              { label: 'No Setup Selected', count: 0 },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">{m.label}</span>
                <span className="font-bold text-gray-800">{m.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-amber-700">{insights.totalMissing} items to complete</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAllTrades && <AllTradesModal trades={allTradesSorted} assetImages={assetImages} onClose={() => setShowAllTrades(false)} onSelect={t => { setShowAllTrades(false); setSelectedTrade(t); }} />}
      {selectedTrade && <TradeDetailPopup trade={selectedTrade} assetImages={assetImages} onClose={() => setSelectedTrade(null)} />}
      {showAddTrade && <AddTradeModal onClose={() => setShowAddTrade(false)} />}
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Trade Row - clickable, with custom asset image support
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function TradeRowClickable({
  trade: t, assetImages, onClick, onAssetImageUpload,
}: {
  trade: Trade; assetImages: Record<string, string>; onClick: () => void;
  onAssetImageUpload: (asset: string, file: File) => void;
}) {
  const aStyle = getAssetStyle(t.asset);
  const sStyle = getSessionStyle(t.session);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div onClick={onClick}
      className={`p-3.5 rounded-xl border transition cursor-pointer hover:shadow-md group ${t.result === 'Win' ? 'bg-white border-emerald-100 hover:border-emerald-200' : t.result === 'Loss' ? 'bg-white border-rose-100 hover:border-rose-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
      <div className="flex items-center gap-3">
        {/* Asset icon - click to upload custom image */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-sm overflow-hidden"
            style={{ background: aStyle.bg }}>
            {assetImages[t.asset] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetImages[t.asset]} alt={t.asset} className="w-full h-full object-cover" />
            ) : (
              <IconGlyph token={aStyle.icon} size={18} color={aStyle.text} />
            )}
          </div>
          <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
            title="อัพโหลดรูป asset">
            <Camera size={8} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onClick={e => e.stopPropagation()}
            onChange={e => { const file = e.target.files?.[0]; if (file) onAssetImageUpload(t.asset, file); e.target.value = ''; }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[12px] text-gray-800">{t.asset}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${t.side === 'Long' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
              {t.side === 'Long' ? '▲' : '▼'} {t.side}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${t.result === 'Win' ? 'bg-emerald-50 text-emerald-600' : t.result === 'Loss' ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-500'}`}>
              {t.result}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: sStyle.bg, color: sStyle.text }}>{t.session}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-gray-400">
            <span>{t.date}</span>
            <span>·</span>
            <span>{t.setup}</span>
            <span>·</span>
            <span>{t.account}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><IconGlyph token={emotionIconToken[t.emotion] ?? 'neutral'} size={11} /> {t.emotion}</span>
          </div>
        </div>

        {/* P&L + R */}
        <div className="text-right flex-shrink-0">
          <div className={`text-sm font-extrabold ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {t.pnl >= 0 ? '+' : ''}${Math.abs(t.pnl).toLocaleString()}
          </div>
          <div className={`text-[11px] font-bold ${t.r >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
            {t.r >= 0 ? '+' : ''}{t.r.toFixed(2)}R
          </div>
        </div>

        {/* Screenshots indicator */}
        <div className="flex-shrink-0">
          {(t.beforeImg || t.afterImg) ? (
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <ImageIcon size={12} className="text-purple-600" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon size={12} className="text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Trade Detail Popup - Left: Data, Right: Before/After screenshots
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function TradeDetailPopup({ trade: t, assetImages, onClose }: { trade: Trade; assetImages: Record<string, string>; onClose: () => void }) {
  const { setTrades } = useTradingData();
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const [localTrade, setLocalTrade] = useState(t);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleImageUpload = (type: 'beforeImg' | 'afterImg', file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setLocalTrade(prev => ({ ...prev, [type]: url }));
      setTrades((prev: Trade[]) => prev.map(tr => tr.id === t.id ? { ...tr, [type]: url } : tr));
    };
    reader.readAsDataURL(file);
  };

  const aStyle = getAssetStyle(localTrade.asset);
  const sStyle = getSessionStyle(localTrade.session);

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[96vw] max-h-[96vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* â”€â”€â”€ Header â”€â”€â”€ */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-purple-100 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-md overflow-hidden"
                style={{ background: aStyle.bg }}>
                {assetImages[localTrade.asset] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetImages[localTrade.asset]} alt={localTrade.asset} className="w-full h-full object-cover" />
                ) : (
                  <IconGlyph token={aStyle.icon} size={22} color={aStyle.text} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-gray-800">{localTrade.asset}</h2>
                  <span className={`text-[12px] px-3 py-1 rounded-lg font-bold ${localTrade.side === 'Long' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                    {localTrade.side === 'Long' ? '▲ Long' : '▼ Short'}
                  </span>
                  <span className={`text-[12px] px-3 py-1 rounded-lg font-bold ${localTrade.result === 'Win' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : localTrade.result === 'Loss' ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200' : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'}`}>
                    {localTrade.result}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><Clock size={11}/>{localTrade.date}</span>
                  <span>·</span>
                  <span className="px-2 py-0.5 rounded-md font-semibold" style={{ background: sStyle.bg, color: sStyle.text }}>{localTrade.session}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Crosshair size={11}/>{localTrade.setup}</span>
                  <span>·</span>
                  <span>{localTrade.account}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-2xl font-extrabold ${localTrade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {localTrade.pnl >= 0 ? '+' : ''}${Math.abs(localTrade.pnl).toLocaleString()}
                </div>
                <div className={`text-base font-bold ${localTrade.r >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                  {localTrade.r >= 0 ? '+' : ''}{localTrade.r.toFixed(2)}R
                </div>
              </div>
              <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 border border-gray-200 transition"><X size={20} /></button>
            </div>
          </div>
        </div>

        {/* â”€â”€â”€ TOP: Trade Data (horizontal) â”€â”€â”€ */}
        <div className="px-6 pt-5 pb-3 space-y-4">
          {/* Data grid - all info in one row-friendly layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
            {[
              { label: 'Asset', value: localTrade.asset, icon: aStyle.icon },
              { label: 'Side', value: localTrade.side, icon: localTrade.side === 'Long' ? 'growth' : 'decline' },
              { label: 'Session', value: localTrade.session, icon: 'time' },
              { label: 'Setup', value: localTrade.setup, icon: 'target' },
              { label: 'Account', value: localTrade.account, icon: 'bank' },
              { label: 'Entry', value: localTrade.entry.toLocaleString(), icon: 'entry' },
              { label: 'Exit', value: localTrade.exit.toLocaleString(), icon: 'exit' },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">{d.label}</div>
                <div className="text-[12px] font-bold text-gray-800 flex items-center gap-1 truncate">
                  <IconGlyph token={d.icon} size={13} /> {d.value}
                </div>
              </div>
            ))}
          </div>

          {/* Second data row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Exit Reason</div>
              <div className="flex items-center gap-1 text-[12px] font-bold text-gray-800"><IconGlyph token="exitReason" size={13} /> {localTrade.exitReason}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Emotion</div>
              <div className="flex items-center gap-1 text-[12px] font-bold text-gray-800"><IconGlyph token={emotionIconToken[localTrade.emotion] ?? 'neutral'} size={13} /> {localTrade.emotion}</div>
            </div>
            <div className={`rounded-xl p-3 border ${localTrade.pnl >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">P&L ($)</div>
              <div className={`text-[14px] font-extrabold ${localTrade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {localTrade.pnl >= 0 ? '+' : ''}${Math.abs(localTrade.pnl).toLocaleString()}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="text-[9px] text-emerald-600 uppercase font-semibold tracking-wider mb-0.5">MFE</div>
              <div className="text-[14px] font-extrabold text-emerald-600">{localTrade.mfe.toFixed(2)}R</div>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
              <div className="text-[9px] text-rose-500 uppercase font-semibold tracking-wider mb-0.5">MAE</div>
              <div className="text-[14px] font-extrabold text-rose-500">{localTrade.mae.toFixed(2)}R</div>
            </div>
          </div>

          {/* Notes */}
          {localTrade.notes && (
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 font-semibold"><IconGlyph token="notes" size={12} /> Notes: </span>
              <span className="text-[12px] text-gray-700">{localTrade.notes}</span>
            </div>
          )}
        </div>

        {/* â”€â”€â”€ Divider â”€â”€â”€ */}
        <div className="px-6">
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-purple-100" />
            <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-50 rounded-full border border-purple-100">
              <Camera size={14} className="text-purple-600" />
              <span className="text-[11px] font-bold text-purple-700">ภาพเปรียบเทียบก่อน-หลังเทรด</span>
            </div>
            <div className="flex-1 h-px bg-purple-100" />
          </div>
        </div>

        {/* --- BOTTOM: Before (LEFT) / After (RIGHT) - large side-by-side --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 pb-6 pt-3">
          {/* Before Screenshot - LEFT */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white"><Camera size={14} /> Before Trade</span>
              <button onClick={() => beforeRef.current?.click()}
                className="text-[10px] font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 transition">
                {localTrade.beforeImg ? 'เปลี่ยนรูป' : 'อัพโหลด'}
              </button>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center min-h-[320px]">
              {localTrade.beforeImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={localTrade.beforeImg} alt="Before trade"
                  className="max-w-full max-h-[500px] rounded-xl border border-gray-200 shadow-lg object-contain" />
              ) : (
                <div onClick={() => beforeRef.current?.click()}
                  className="w-full h-full min-h-[280px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition">
                  <Camera size={48} className="text-gray-300 mb-3" />
                  <span className="text-sm text-gray-400 font-medium">คลิกเพื่ออัพโหลดรูป Before</span>
                  <span className="text-[11px] text-gray-300 mt-1">PNG, JPG - รูป chart ก่อนเข้าเทรด</span>
                </div>
              )}
            </div>
            <input ref={beforeRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload('beforeImg', file); e.target.value = ''; }} />
          </div>

          {/* After Screenshot - RIGHT */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white"><Camera size={14} /> After Trade</span>
              <button onClick={() => afterRef.current?.click()}
                className="text-[10px] font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 transition">
                {localTrade.afterImg ? 'เปลี่ยนรูป' : 'อัพโหลด'}
              </button>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center min-h-[320px]">
              {localTrade.afterImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={localTrade.afterImg} alt="After trade"
                  className="max-w-full max-h-[500px] rounded-xl border border-gray-200 shadow-lg object-contain" />
              ) : (
                <div onClick={() => afterRef.current?.click()}
                  className="w-full h-full min-h-[280px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition">
                  <Camera size={48} className="text-gray-300 mb-3" />
                  <span className="text-sm text-gray-400 font-medium">คลิกเพื่ออัพโหลดรูป After</span>
                  <span className="text-[11px] text-gray-300 mt-1">PNG, JPG - รูป chart หลังปิดเทรด</span>
                </div>
              )}
            </div>
            <input ref={afterRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload('afterImg', file); e.target.value = ''; }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Add Trade Modal - Full form, saves to shared store (same as Data tab)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function AddTradeModal({ onClose }: { onClose: () => void }) {
  const { trades, setTrades } = useTradingData();
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  useEscClose(onClose);

  const [form, setForm] = useState<{
    date: string; account: string; asset: string; side: TradeSide; session: string;
    setup: string; emotion: string; result: TradeResult; entry: string; exit: string;
    exitReason: string; r: string; notes: string; beforeImg: string; afterImg: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    account: ACCOUNTS[0].name,
    asset: ASSETS[0].name,
    side: 'Long',
    session: SESSIONS[0],
    setup: SETUPS[0],
    emotion: EMOTIONS[0].name,
    result: 'Win',
    entry: '',
    exit: '',
    exitReason: EXIT_REASONS[0],
    r: '',
    notes: '',
    beforeImg: '',
    afterImg: '',
  });

  const handleSave = () => {
    const rVal = parseFloat(form.r) || 0;
    const entryVal = parseFloat(form.entry) || assetInfo(form.asset).price;
    const exitVal = form.exit ? parseFloat(form.exit) : computeExit(entryVal, rVal, form.side, form.asset);
    const pnl = Math.round(rVal * RISK_PER_TRADE);
    const mfe = +(Math.abs(rVal) + 0.2 + Math.random() * 0.9).toFixed(2);
    const mae = -+(0.2 + Math.random() * 1.1).toFixed(2);

    const newTrade: Trade = {
      id: `T-${String(trades.length + 1).padStart(3, '0')}`,
      date: form.date,
      account: form.account,
      asset: form.asset,
      side: form.side,
      session: form.session,
      setup: form.setup,
      emotion: form.emotion,
      result: form.result,
      entry: entryVal,
      exit: exitVal,
      exitReason: form.exitReason,
      r: rVal,
      pnl,
      mfe,
      mae,
      notes: form.notes || undefined,
      beforeImg: form.beforeImg || undefined,
      afterImg: form.afterImg || undefined,
    };

    setTrades((prev: Trade[]) => [...prev, newTrade]);
    onClose();
  };

  const handleImgUpload = (type: 'beforeImg' | 'afterImg', file: File) => {
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, [type]: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const inputCls = "w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition";
  const labelCls = "text-[11px] font-bold text-gray-600";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center shadow-lg">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-800">บันทึกการเทรดใหม่</h2>
              <p className="text-[10px] text-gray-400">ข้อมูลจะถูกบันทึกลงใน Data Center</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6 space-y-3" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Row 1: Date, Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Account</label>
              <select value={form.account} onChange={e => setForm({ ...form, account: e.target.value })} className={inputCls}>
                {ACCOUNTS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Asset, Side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Asset *</label>
              <select value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} className={inputCls}>
                {ASSETS.map(a => <option key={a.name} value={a.name}>{a.flag} {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Side *</label>
              <select value={form.side} onChange={e => setForm({ ...form, side: e.target.value as TradeSide })} className={inputCls}>
                {SIDES.map(s => <option key={s} value={s}>{s === 'Long' ? '▲ Long' : '▼ Short'}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Session, Setup */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Session</label>
              <select value={form.session} onChange={e => setForm({ ...form, session: e.target.value })} className={inputCls}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Setup</label>
              <select value={form.setup} onChange={e => setForm({ ...form, setup: e.target.value })} className={inputCls}>
                {SETUPS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 4: Result, Exit Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Result *</label>
              <select value={form.result} onChange={e => setForm({ ...form, result: e.target.value as TradeResult })} className={inputCls}>
                {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Exit Reason</label>
              <select value={form.exitReason} onChange={e => setForm({ ...form, exitReason: e.target.value })} className={inputCls}>
                {EXIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Row 5: Emotion, R-Multiple */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Emotion</label>
              <select value={form.emotion} onChange={e => setForm({ ...form, emotion: e.target.value })} className={inputCls}>
                {EMOTIONS.map(em => <option key={em.name} value={em.name}>{em.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>R-Multiple *</label>
              <input type="number" step="0.01" placeholder="e.g. 1.50 or -0.80"
                value={form.r} onChange={e => setForm({ ...form, r: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* Row 6: Entry, Exit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Entry Price</label>
              <input type="number" step="any" placeholder="ราคา Entry"
                value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Exit Price</label>
              <input type="number" step="any" placeholder="ราคา Exit (auto-calc ถ้าว่าง)"
                value={form.exit} onChange={e => setForm({ ...form, exit: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes / บันทึก</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="บันทึกเหตุผล, สิ่งที่เรียนรู้, สิ่งที่ต้องปรับปรุง..."
              className={`${inputCls} resize-none`} />
          </div>

          {/* Screenshot uploads */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`${labelCls} flex items-center gap-1.5`}><Camera size={13} /> Before Screenshot</label>
              <div onClick={() => beforeRef.current?.click()}
                className="mt-1 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition overflow-hidden">
                {form.beforeImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.beforeImg} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera size={20} className="mx-auto text-gray-300 mb-1" />
                    <span className="text-[10px] text-gray-400">คลิกเพื่ออัพโหลด</span>
                  </div>
                )}
              </div>
              <input ref={beforeRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const file = e.target.files?.[0]; if (file) handleImgUpload('beforeImg', file); e.target.value = ''; }} />
            </div>
            <div>
              <label className={`${labelCls} flex items-center gap-1.5`}><Camera size={13} /> After Screenshot</label>
              <div onClick={() => afterRef.current?.click()}
                className="mt-1 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition overflow-hidden">
                {form.afterImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.afterImg} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera size={20} className="mx-auto text-gray-300 mb-1" />
                    <span className="text-[10px] text-gray-400">คลิกเพื่ออัพโหลด</span>
                  </div>
                )}
              </div>
              <input ref={afterRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const file = e.target.files?.[0]; if (file) handleImgUpload('afterImg', file); e.target.value = ''; }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-purple-100 px-6 py-4 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2.5 text-[12px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
          <button onClick={handleSave}
            className="px-6 py-2.5 text-[12px] font-extrabold text-white bg-gradient-to-r from-purple-600 to-violet-500 rounded-xl shadow-lg hover:opacity-90 transition">
            <Plus size={14} className="inline mr-1" /> Save Trade
          </button>
        </div>
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// All Trades Modal - with filters & pagination
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function AllTradesModal({
  trades, assetImages, onClose, onSelect,
}: {
  trades: Trade[]; assetImages: Record<string, string>; onClose: () => void; onSelect: (t: Trade) => void;
}) {
  const [filter, setFilter] = useState<'All' | 'Win' | 'Loss' | 'Breakeven'>('All');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = filter === 'All' ? trades : trades.filter(t => t.result === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const be = trades.filter(t => t.result === 'Breakeven').length;

  const handleFilterChange = (f: typeof filter) => { setFilter(f); setPage(1); };

  useEscClose(onClose);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[92vw] xl:max-w-7xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-purple-100 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-800">บันทึกการเทรดทั้งหมด</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {trades.length} เทรด · <span className="text-emerald-500 font-semibold">{wins}W</span> / <span className="text-rose-500 font-semibold">{losses}L</span> / <span className="text-gray-500 font-semibold">{be}BE</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5">
                {(['All', 'Win', 'Loss', 'Breakeven'] as const).map(f => (
                  <button key={f} onClick={() => handleFilterChange(f)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${filter === f ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {f === 'All' ? `All (${trades.length})` : f === 'Win' ? `Win (${wins})` : f === 'Loss' ? `Loss (${losses})` : `BE (${be})`}
                  </button>
                ))}
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 border border-gray-200"><X size={18} /></button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(92vh - 140px)' }}>
          <div className="space-y-2">
            {paginated.map(t => (
              <TradeRowClickable key={t.id} trade={t} assetImages={assetImages} onClick={() => onSelect(t)} onAssetImageUpload={() => {}} />
            ))}
            {paginated.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">ไม่มีข้อมูลเทรด{filter !== 'All' ? ` (${filter})` : ''}</div>
            )}
          </div>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-[10px] text-gray-400">
            แสดง {filtered.length > 0 ? (page - 1) * perPage + 1 : 0}—{Math.min(page * perPage, filtered.length)} จาก {filtered.length} เทรด
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-purple-50 transition">
              <ChevronLeft size={12} /> ก่อนหน้า
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = page - 3 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold transition ${page === pageNum ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-purple-50'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-purple-50 transition">
              ถัดไป <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
