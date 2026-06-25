'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import {
  propFirmAccounts, fundingCostData, fundingIncomeData, capitalDistribution,
} from '@/lib/mockData';
import KpiCard from '@/components/KpiCard';
import { CheckCircle, AlertTriangle, Wallet, Gift, RefreshCw, TrendingUp, Plus, Trash2, X, ChevronLeft, ChevronRight, BarChart3, Calendar, DollarSign, Target, Camera, Clock, CreditCard, Landmark, Lightbulb, ClipboardList, Sparkles, Zap, ChevronDown, Check } from 'lucide-react';
import { Wise, Tether, Stripe, Binance, Tradingview, Bitcoin, Ethereum, Coinbase } from '@thesvg/react';
import { PropFirmLogo } from '@/components/trading/PropFirmLogos';
import { useEscClose } from '@/lib/useEscClose';
import { motion, AnimatePresence } from 'framer-motion';

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-purple-200 bg-white text-[12px] text-gray-800 dark:border-white/10 dark:bg-[#14162a] dark:text-white hover:border-purple-400 transition-colors"
      >
        <span>{value}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1.5 z-[100] bg-white dark:bg-[#191a2c] border border-purple-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[12px] transition-colors ${
                  value === opt
                    ? 'bg-purple-50 text-purple-700 font-bold dark:bg-purple-900/20 dark:text-purple-300'
                    : 'text-gray-700 hover:bg-purple-50/60 dark:text-gray-300 dark:hover:bg-white/5'
                }`}
              >
                <span>{opt}</span>
                {value === opt && <Check size={13} className="text-purple-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const kpis = [
  { title: 'Active Challenges', value: '4', change: 'กำลังทำอยู่', positive: true, icon: <CheckCircle size={20} color="#fff"/>, iconBg:'#d1fae5', color:'#10b981' },
  { title: 'Funded Accounts', value: '3', change: 'จาก 8 บัญชี', positive: true, icon: <Wallet size={20} color="#fff"/>, iconBg:'#ede9ff', color:'#7c5cbf' },
  { title: 'Total Challenge Cost', value: '$7,980.00', change: 'รวมค่าใช้จ่ายทั้งหมด', positive: false, icon: <RefreshCw size={20} color="#fff"/>, iconBg:'#fff7ed', color:'#f97316' },
  { title: 'Total Payout Received', value: '$24,672.50', change: 'รวมเงินที่ข้าได้รับ', positive: true, icon: <Gift size={20} color="#fff"/>, iconBg:'#d1fae5', color:'#10b981' },
  { title: 'Average Pass Rate', value: '66.7%', change: 'ผ่านมา 12 บัญชี', positive: true, icon: <TrendingUp size={20} color="#fff"/>, iconBg:'#e0f2fe', color:'#38bdf8' },
  { title: 'Rule Risk Alerts', value: '2', change: 'กำลังเฝ้าระวังอยู่', positive: false, icon: <AlertTriangle size={20} color="#fff"/>, iconBg:'#fff1f2', color:'#f43f5e' },
];

const statusColors: Record<string, string> = {
  Active: '#10b981', Funded: '#7c5cbf', Failed: '#f43f5e',
};

const payoutMethods = [
  { name: 'Wise', days: '1–2 วัน', Icon: null, SvgIcon: Wise },
  { name: 'Deel', days: '2–3 วัน', Icon: CreditCard, SvgIcon: null },
  { name: 'Rise', days: '2–4 วัน', Icon: TrendingUp, SvgIcon: null },
  { name: 'Bank Transfer', days: '3–5 วัน', Icon: Landmark, SvgIcon: null },
  { name: 'Crypto (USDT)', days: 'ทันที', Icon: null, SvgIcon: Tether },
];

const tradingPlatforms = [
  { name: 'Binance', Icon: Binance, color: '#F0B90B' },
  { name: 'TradingView', Icon: Tradingview, color: '#1C6BF7' },
  { name: 'Coinbase', Icon: Coinbase, color: '#0052FF' },
  { name: 'Bitcoin', Icon: Bitcoin, color: '#F7931A' },
  { name: 'Ethereum', Icon: Ethereum, color: '#627EEA' },
  { name: 'Tether', Icon: Tether, color: '#26A17B' },
];

type FundingAccount = typeof propFirmAccounts[0] & { iconImage?: string; duration?: string };
type NewFunding = Omit<FundingAccount, 'id'>;

const blankFunding = (): NewFunding => ({
  firm: '', logo: '', type: 'CFO', size: 100000, phase: 'Evaluation', status: 'Active', progress: 0,
  profitTarget: 5000, currentProfit: 0, dailyLoss: 1000, maxDD: 5000, dailyLossPct: 20, maxDDPct: 50, color: '#7c5cbf',
  duration: '30 days',
});

const mockAccountTrades = (accId: number) => {
  const seeds: Record<number, { trades: { date: string; asset: string; side: string; result: string; pnl: number; r: number; setup: string }[] }> = {
    1: { trades: [
      { date: '2026-05-30', asset: 'XAUUSD', side: 'Long', result: 'Win', pnl: 1520, r: 2.1, setup: 'Breakout' },
      { date: '2026-05-29', asset: 'XAUUSD', side: 'Short', result: 'Win', pnl: 980, r: 1.4, setup: 'Trend Follow' },
      { date: '2026-05-28', asset: 'NAS100', side: 'Long', result: 'Loss', pnl: -420, r: -0.6, setup: 'Reversal' },
      { date: '2026-05-27', asset: 'XAUUSD', side: 'Long', result: 'Win', pnl: 2100, r: 3.0, setup: 'Breakout' },
      { date: '2026-05-26', asset: 'EURUSD', side: 'Short', result: 'Win', pnl: 650, r: 0.9, setup: 'Retest' },
    ]},
    2: { trades: [
      { date: '2026-05-30', asset: 'NAS100', side: 'Long', result: 'Win', pnl: 840, r: 1.7, setup: 'Trend Follow' },
      { date: '2026-05-29', asset: 'EURUSD', side: 'Long', result: 'Loss', pnl: -310, r: -0.8, setup: 'Breakout' },
      { date: '2026-05-28', asset: 'XAUUSD', side: 'Short', result: 'Win', pnl: 1200, r: 2.4, setup: 'Reversal' },
      { date: '2026-05-27', asset: 'NAS100', side: 'Long', result: 'Win', pnl: 560, r: 1.1, setup: 'Breakout' },
    ]},
    3: { trades: [
      { date: '2026-05-30', asset: 'XAUUSD', side: 'Long', result: 'Win', pnl: 1100, r: 1.5, setup: 'Trend Follow' },
      { date: '2026-05-29', asset: 'XAUUSD', side: 'Long', result: 'Win', pnl: 890, r: 1.2, setup: 'Breakout' },
      { date: '2026-05-28', asset: 'NAS100', side: 'Short', result: 'Loss', pnl: -680, r: -1.0, setup: 'Reversal' },
      { date: '2026-05-27', asset: 'EURUSD', side: 'Long', result: 'Win', pnl: 450, r: 0.6, setup: 'Retest' },
      { date: '2026-05-26', asset: 'XAUUSD', side: 'Short', result: 'Win', pnl: 1340, r: 1.9, setup: 'Trend Follow' },
      { date: '2026-05-25', asset: 'NAS100', side: 'Long', result: 'Loss', pnl: -520, r: -0.7, setup: 'Breakout' },
    ]},
    4: { trades: [
      { date: '2026-05-20', asset: 'XAUUSD', side: 'Long', result: 'Loss', pnl: -800, r: -1.6, setup: 'Breakout' },
      { date: '2026-05-19', asset: 'NAS100', side: 'Short', result: 'Loss', pnl: -450, r: -0.9, setup: 'Reversal' },
      { date: '2026-05-18', asset: 'EURUSD', side: 'Long', result: 'Win', pnl: 320, r: 0.6, setup: 'Trend Follow' },
    ]},
  };
  return seeds[accId]?.trades ?? [];
};

const mockEquityCurve = (accId: number) => {
  const curves: Record<number, { date: string; equity: number }[]> = {
    1: [
      { date: 'Jan', equity: 200000 }, { date: 'Feb', equity: 203200 }, { date: 'Mar', equity: 206800 },
      { date: 'Apr', equity: 208400 }, { date: 'May', equity: 211520 },
    ],
    2: [
      { date: 'Jan', equity: 100000 }, { date: 'Feb', equity: 100800 }, { date: 'Mar', equity: 101500 },
      { date: 'Apr', equity: 102200 }, { date: 'May', equity: 103040 },
    ],
    3: [
      { date: 'Jan', equity: 150000 }, { date: 'Feb', equity: 151200 }, { date: 'Mar', equity: 152800 },
      { date: 'Apr', equity: 153600 }, { date: 'May', equity: 154420 },
    ],
    4: [
      { date: 'Jan', equity: 50000 }, { date: 'Feb', equity: 49800 }, { date: 'Mar', equity: 49200 },
      { date: 'Apr', equity: 49600 }, { date: 'May', equity: 49500 },
    ],
  };
  return curves[accId] ?? [];
};

export default function FundingTab() {
  const [accounts, setAccounts] = useState<FundingAccount[]>(propFirmAccounts as FundingAccount[]);
  const [showModal, setShowModal] = useState(false);
  const [editingFunding, setEditingFunding] = useState<NewFunding | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAddFunding = () => {
    setEditingFunding(blankFunding());
    setShowModal(true);
  };

  const handleSaveFunding = (data: NewFunding) => {
    const newAccount: FundingAccount = {
      ...data,
      id: Math.max(0, ...accounts.map(a => a.id)) + 1,
    };
    setAccounts([...accounts, newAccount]);
    setEditingFunding(null);
  };

  const handleDeleteFunding = (id: number) => {
    setAccounts(accounts.filter(a => a.id !== id));
    setDeletingId(null);
    if (selectedAccountId === id) setSelectedAccountId(null);
  };

  const hasMore = accounts.length > 4;
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(k => <KpiCard key={k.title} {...k}/>)}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">ภาพรวมบัญชีทุนสอบและ Funding</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditingFunding(blankFunding())}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-[12px] font-extrabold text-white shadow-sm hover:shadow-md transition-all hover:opacity-90"
          >
            <Plus size={14} /> Add Account
          </button>
          <button onClick={() => setShowModal(true)} className="text-xs text-purple-600 hover:underline font-semibold">ดูทั้งหมด →</button>
        </div>
      </div>

      {/* Prop firm cards — 4-card grid, or horizontal scroll if >4 */}
      <div className="relative">
        {hasMore && (
          <>
            <button onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-purple-100 shadow-lg hover:bg-purple-50 transition">
              <ChevronLeft size={16} className="text-purple-600" />
            </button>
            <button onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-purple-100 shadow-lg hover:bg-purple-50 transition">
              <ChevronRight size={16} className="text-purple-600" />
            </button>
          </>
        )}
        <div ref={scrollRef} className={hasMore ? "flex gap-4 pb-2 overflow-x-auto scroll-smooth trading-scrollbar" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"}>
          {accounts.map(acc=>(
            <div key={acc.id}
              onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? null : acc.id)}
              className={`bg-white rounded-2xl overflow-hidden border shadow-sm cursor-pointer transition-all hover:shadow-md ${hasMore ? 'flex-shrink-0 w-[300px]' : ''} ${selectedAccountId === acc.id ? 'border-purple-400 ring-2 ring-purple-200' : 'border-purple-50'}`}>
              <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PropFirmLogo firm={acc.firm} color={acc.color} logo={acc.logo} size={36} />
                  <div>
                    <div className="font-bold text-xs text-gray-800">{acc.firm}</div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">{acc.type}</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{background:statusColors[acc.status]+'20',color:statusColors[acc.status]}}>
                  ● {acc.status}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Account Size</span>
                <span>Phase</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-3">
                <span>${acc.size.toLocaleString()}</span>
                <span>{acc.phase}</span>
              </div>

              {/* Progress */}
              <div className="text-[10px] text-gray-400 mb-1">ความคืบหน้าของเป้าหมาย {acc.progress}%</div>
              <div className="bg-gray-100 rounded-full h-2 mb-3">
                <div className="h-2 rounded-full transition-all"
                  style={{width:`${acc.progress}%`, background: acc.status==='Failed'?'#f43f5e':acc.status==='Funded'?'#7c5cbf':'#10b981'}}/>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                <div>
                  <div className="text-gray-400">เป้าหมายกำไร</div>
                  <div className="font-semibold text-gray-700">${acc.profitTarget.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">กำไรปัจจุบัน</div>
                  <div className={`font-semibold ${acc.currentProfit>=0?'text-emerald-500':'text-red-400'}`}>
                    {acc.currentProfit>=0?'+':''}${acc.currentProfit.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Daily Loss คงเหลือ</div>
                  <div className="font-semibold text-emerald-500">${acc.dailyLoss.toLocaleString()} ({acc.dailyLossPct}%)</div>
                </div>
                <div>
                  <div className="text-gray-400">Max Drawdown คงเหลือ</div>
                  <div className="font-semibold text-emerald-500">${acc.maxDD.toLocaleString()} ({acc.maxDDPct}%)</div>
                </div>
              </div>

              {/* Delete button - always visible */}
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingId(acc.id); }}
                className="w-full py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
              >
                <Trash2 size={12} className="inline mr-1" /> ลบบัญชีนี้
              </button>
              </div>{/* close p-5 */}
            </div>
          ))}
        </div>
      </div>

      {/* Account Detail Popup */}
      {selectedAccount && (
        <AccountDetailPopup account={selectedAccount} onClose={() => setSelectedAccountId(null)} />
      )}

      {/* Modal - View All Funding Accounts */}
      {showModal && (
        <FundingModal
          accounts={accounts}
          onClose={() => setShowModal(false)}
          onAdd={handleAddFunding}
          onDelete={(id) => setDeletingId(id)}
        />
      )}

      {/* Confirm delete */}
      {deletingId !== null && (
        <ConfirmDeleteModal
          firmName={accounts.find(a => a.id === deletingId)?.firm || 'account'}
          onConfirm={() => handleDeleteFunding(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {/* Add/Edit Funding Form */}
      {editingFunding && (
        <AddFundingModal
          initial={editingFunding}
          onClose={() => setEditingFunding(null)}
          onSave={handleSaveFunding}
        />
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Cost Donut */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-semibold text-sm text-gray-800 mb-1">สรุปต้นทุนการสอบ</div>
          <div className="text-center my-1">
            <div className="text-2xl font-bold text-gray-800">$7,980</div>
            <div className="text-xs text-gray-400">รวมต้นทุน USD</div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={fundingCostData} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={55}>
                {fundingCostData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1">
            {fundingCostData.map(d=>(
              <div key={d.name} className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{background:d.color}}/>{d.name}</span>
                <span className="font-semibold">${d.value.toLocaleString()} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Income chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-semibold text-sm text-gray-800 mb-1">รายได้และการตตอน/ ผลตอบแทน (ทั้งหมด)</div>
          <div className="flex gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t-2 border-dashed border-gray-400 inline-block"/>ยอดสะสมต้นทุน</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-500 inline-block"/>รับแล้ว</span>
          </div>
          <div className="flex justify-between text-xs font-semibold mb-3">
            <span className="text-gray-800">ยอดสะสมต้นทุน <span className="text-red-400">$28,530</span></span>
            <span>รับแล้ว <span className="text-emerald-500">$24,672.50</span></span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={fundingIncomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f3ff"/>
              <XAxis dataKey="date" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false} width={35}/>
              <Tooltip formatter={(v:number)=>[`$${v.toLocaleString()}`]}/>
              <Line type="monotone" dataKey="cost" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5 3" dot={false}/>
              <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} dot={{fill:'#10b981',r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Capital dist donut */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-semibold text-sm text-gray-800 mb-2">การกระจายเงินทุน</div>
          <div className="text-center text-lg font-bold text-gray-800 mb-1">$394,000</div>
          <div className="text-xs text-gray-400 text-center mb-2">รวม</div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={capitalDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={50}>
                {capitalDistribution.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {capitalDistribution.map(d=>(
              <div key={d.name} className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{background:d.color}}/>{d.name}</span>
                <span className="font-semibold">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk accounts */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} color="#f97316"/>
            <span className="font-semibold text-sm text-gray-800">บัญชีเสี่ยงและเตือน</span>
          </div>
          <div className="space-y-3">
            {[
              { firm:'High Stakes', sub:'TOPSTEP $100K', label:'Daily Loss คงเหลือ', val:'$980', pct:49, color:'#f43f5e' },
              { firm:'Verification', sub:'FTMO $200K', label:'Max DD คงเหลือ', val:'$4,560', pct:76, color:'#f97316' },
            ].map(r=>(
              <div key={r.firm} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-500">{r.firm}</span>
                  <span className="text-gray-500">{r.sub}</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-1">{r.label}</div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 rounded-full h-1.5 flex-1">
                    <div className="h-1.5 rounded-full" style={{width:`${r.pct}%`, background:r.color}}/>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{r.val} ({r.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout methods */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-semibold text-sm text-gray-800 mb-3">ช่องทางการรับเงิน / ผลตอบแทนที่รองรับ</div>
          <div className="grid grid-cols-3 gap-3">
            {payoutMethods.map(p=>(
              <div key={p.name} className="flex flex-col items-center bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="mb-1 w-8 h-8 flex items-center justify-center">
                  {p.SvgIcon
                    ? <p.SvgIcon style={{ width: 28, height: 28 }} />
                    : p.Icon
                      ? <p.Icon size={26} className="text-purple-600" />
                      : null
                  }
                </div>
                <div className="text-xs font-semibold text-gray-700">{p.name}</div>
                <div className="text-[10px] text-gray-400">{p.days}</div>
              </div>
            ))}
          </div>
          {/* Trading platforms */}
          <div className="mt-4 pt-4 border-t border-purple-50">
            <div className="text-[11px] font-semibold text-gray-500 mb-2">แพลตฟอร์มและ Crypto ที่รองรับ</div>
            <div className="flex flex-wrap gap-2">
              {tradingPlatforms.map(p => (
                <div key={p.name} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  <p.Icon style={{ width: 16, height: 16 }} />
                  <span className="text-[10px] font-semibold text-gray-600">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next step */}
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-yellow-500" />
            <span className="font-semibold text-sm text-gray-800">แนะนำการดำเนินการต่อไป</span>
          </div>
          <div className="font-bold text-sm text-purple-700 mb-3">โฟกัสบัญชี FTMO $200K (Verification)</div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2"><Target size={14} className="text-purple-500" /> จุดเน้น: ลด Drawdown 2.2%</div>
            <div className="flex items-center gap-2"><ClipboardList size={14} className="text-purple-500" /> สิ่งที่ต้องทำ: เส้นทางตรง SAK USD</div>
            <div className="flex items-center gap-2"><Lightbulb size={14} className="text-purple-500" /> Daily Loss: วางแผนก่อน Daily Loss</div>
            <div className="flex items-center gap-2"><Zap size={14} className="text-purple-500" /> Manage Risk: ด้วย Risk:Reward สม่ำเสมอ</div>
          </div>
          <button className="mt-4 w-full py-2.5 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition">
            + ดำเนินการดอกกับบัญชี FTMO
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal - View All Funding Accounts
function FundingModal({
  accounts, onClose, onAdd, onDelete,
}: {
  accounts: FundingAccount[];
  onClose: () => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
}) {
  useEscClose(onClose);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-white">All Funding Accounts</h2>
            <p className="text-[11px] text-gray-400">Manage all funding accounts and challenges</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-[12px] font-extrabold text-white"
            >
              <Plus size={14} /> Add Funding
            </button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X size={16} /></button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between p-4 border border-purple-50 rounded-2xl hover:bg-purple-50/30 dark:border-white/10 dark:hover:bg-white/5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <PropFirmLogo firm={acc.firm} color={acc.color} logo={acc.logo} size={36} />
                  <div>
                    <div className="font-bold text-sm text-gray-800 dark:text-white">{acc.firm} ({acc.type})</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{acc.phase} · ${acc.size.toLocaleString()} · {acc.progress}% progress</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mr-4">
                <div className="text-right">
                  <div className="text-[12px] font-bold text-gray-800 dark:text-white">{acc.currentProfit >= 0 ? '+' : ''}${acc.currentProfit.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">vs ${acc.profitTarget.toLocaleString()} target</div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full" style={{background:statusColors[acc.status]+'20',color:statusColors[acc.status]}}>
                  ● {acc.status}
                </span>
              </div>
              <button
                onClick={() => onDelete(acc.id)}
                className="px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition dark:border-rose-500/30 dark:hover:bg-rose-500/10"
              >
                <Trash2 size={12} className="inline mr-1" /> ลบบัญชีนี้
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add/Edit Funding Modal
function AddFundingModal({
  initial, onClose, onSave,
}: {
  initial: NewFunding;
  onClose: () => void;
  onSave: (data: NewFunding) => void;
}) {
  const [f, setF] = useState(initial);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!f.firm.trim()) return alert('Funding name is required');
    if (f.size < 0) return alert('Account size must be positive');
    onSave(f);
    onClose();
  };

  const handleIconUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setF(prev => ({ ...prev, iconImage: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  useEscClose(onClose);

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-white">Add Funding Account</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">เพิ่มบัญชีทุนสอบหรือ Funded Account ใหม่</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X size={16} /></button>
        </div>

        <div className="space-y-4 p-6 max-h-[72vh] overflow-y-auto">
          {/* Icon Upload */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Account Icon</label>
            <div className="flex items-center gap-3 mt-1">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 flex items-center justify-center cursor-pointer transition overflow-hidden"
              >
                {f.iconImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.iconImage} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={18} className="text-purple-300" />
                )}
              </div>
              <div className="text-[11px] text-gray-400">
                <div>อัพโหลดรูป Icon ของบริษัท</div>
                <div>เช่น โลโก้ FTMO, The 5%ers ฯลฯ</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleIconUpload(file); e.target.value = ''; }} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Funding Name *</label>
            <input
              type="text"
              value={f.firm}
              onChange={(e) => setF({ ...f, firm: e.target.value })}
              placeholder="e.g., FTMO Challenge"
              className="w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1 block">Type</label>
              <CustomSelect
                value={f.type}
                onChange={(v) => setF({ ...f, type: v })}
                options={['CFO', 'Futures']}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Account Size *</label>
              <input
                type="number"
                value={f.size}
                onChange={(e) => setF({ ...f, size: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1 block">Phase</label>
              <CustomSelect
                value={f.phase}
                onChange={(v) => setF({ ...f, phase: v })}
                options={['Evaluation', 'High Stakes', 'Verification', 'Funded']}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
              <CustomSelect
                value={f.status}
                onChange={(v) => setF({ ...f, status: v as any })}
                options={['Active', 'Funded', 'Failed', 'Paused']}
              />
            </div>
          </div>

          {/* Challenge Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                <Clock size={10} /> Challenge Duration
              </label>
              <CustomSelect
                value={f.duration || '30 days'}
                onChange={(v) => setF({ ...f, duration: v })}
                options={['14 days', '30 days', '45 days', '60 days', '90 days', 'Unlimited']}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Progress %</label>
              <input type="number" value={f.progress} onChange={(e) => setF({ ...f, progress: parseInt(e.target.value) })}
                min="0" max="100" className="w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Profit Target *</label>
              <input type="number" value={f.profitTarget} onChange={(e) => setF({ ...f, profitTarget: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Daily Loss Limit *</label>
              <input type="number" value={f.dailyLoss} onChange={(e) => setF({ ...f, dailyLoss: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Max Drawdown *</label>
              <input type="number" value={f.maxDD} onChange={(e) => setF({ ...f, maxDD: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Logo Text</label>
              <input type="text" value={f.logo} onChange={(e) => setF({ ...f, logo: e.target.value })}
                placeholder="e.g., FT" maxLength={3}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-white" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-purple-100 px-6 py-4 dark:border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl dark:text-gray-300 dark:hover:bg-white/10">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-[12px] font-bold text-white bg-gradient-to-r from-purple-600 to-violet-500 rounded-xl">Save</button>
        </div>
      </div>
    </div>
  );
}

// Confirm Delete Modal
function ConfirmDeleteModal({
  firmName, onConfirm, onCancel,
}: {
  firmName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEscClose(onCancel);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#191a2c]">
        <h2 className="text-base font-extrabold text-gray-800 dark:text-white">Delete {firmName}?</h2>
        <p className="mt-2 text-[12px] text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl dark:text-gray-300 dark:hover:bg-white/10">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-[12px] font-bold text-white bg-gradient-to-r from-rose-500 to-red-500 rounded-xl">Delete</button>
        </div>
      </div>
    </div>
  );
}

// Account Detail Popup — modal shown when clicking a card
function AccountDetailPopup({ account, onClose }: { account: FundingAccount; onClose: () => void }) {
  useEscClose(onClose);
  const trades = mockAccountTrades(account.id);
  const equityCurve = mockEquityCurve(account.id);
  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
  const avgPnl = trades.length > 0 ? totalPnl / trades.length : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[90vw] xl:max-w-7xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-purple-100 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PropFirmLogo firm={account.firm} color={account.color} logo={account.logo} size={56} />
              <div>
                <h3 className="font-extrabold text-gray-800 text-xl">{account.firm}</h3>
                <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-0.5">
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg font-semibold">{account.type}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">{account.phase}</span>
                  <span>·</span>
                  <span className="font-semibold text-gray-700">${account.size.toLocaleString()}</span>
                  {account.duration && <><span>·</span><span className="flex items-center gap-1"><Clock size={10}/>{account.duration}</span></>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold px-4 py-2 rounded-xl"
                style={{ background: statusColors[account.status] + '15', color: statusColors[account.status], border: `1px solid ${statusColors[account.status]}30` }}>
                ● {account.status}
              </span>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 border border-gray-200 transition"><X size={18} /></button>
            </div>
          </div>

          {/* Progress bar in header */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
              <span>ความคืบหน้าของเป้าหมาย</span>
              <span className="font-bold text-gray-700">{account.progress}% · กำไร {account.currentProfit >= 0 ? '+' : ''}${account.currentProfit.toLocaleString()} / ${account.profitTarget.toLocaleString()}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full transition-all relative"
                style={{ width: `${account.progress}%`, background: account.status === 'Failed' ? '#f43f5e' : account.status === 'Funded' ? '#7c5cbf' : '#10b981' }}>
                {account.progress > 8 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{account.progress}%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* KPI Summary — 2 rows */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            {[
              { label: 'Total Trades', value: String(trades.length), icon: BarChart3, color: '#7c3aed' },
              { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: Target, color: winRate >= 50 ? '#10b981' : '#f43f5e' },
              { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString()}`, icon: DollarSign, color: totalPnl >= 0 ? '#10b981' : '#f43f5e' },
              { label: 'W/L Ratio', value: `${wins}W / ${losses}L`, icon: TrendingUp, color: '#0ea5e9' },
              { label: 'เป้าหมายกำไร', value: `$${account.profitTarget.toLocaleString()}`, icon: Target, color: '#7c5cbf' },
              { label: 'Avg P&L / Trade', value: `${avgPnl >= 0 ? '+' : ''}$${Math.abs(Math.round(avgPnl)).toLocaleString()}`, icon: BarChart3, color: avgPnl >= 0 ? '#10b981' : '#f43f5e' },
              { label: 'Daily Loss Left', value: `$${account.dailyLoss.toLocaleString()}`, icon: AlertTriangle, color: account.dailyLossPct < 30 ? '#f43f5e' : '#f97316' },
              { label: 'Max DD Left', value: `$${account.maxDD.toLocaleString()}`, icon: AlertTriangle, color: account.maxDDPct < 30 ? '#f43f5e' : '#f97316' },
            ].map(k => (
              <div key={k.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <k.icon size={12} style={{ color: k.color }} />
                  <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{k.label}</span>
                </div>
                <div className="text-sm font-extrabold text-gray-800">{k.value}</div>
              </div>
            ))}
          </div>

          {/* Main Content — Chart LEFT, Trade History RIGHT */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            {/* LEFT: Equity Curve + Account Stats */}
            <div className="xl:col-span-2 space-y-4">
              {/* Equity Curve */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                      <BarChart3 size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800">Equity Curve</span>
                      <div className="text-[10px] text-gray-400">กราฟแสดงเงินทุนสะสม</div>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={equityCurve} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={`eqGrad-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #ede9ff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, 'Equity']} />
                    <Area type="monotone" dataKey="equity" stroke="#7c3aed" strokeWidth={2.5} fill={`url(#eqGrad-${account.id})`} dot={{ fill: '#7c3aed', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Account Quick Stats */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <DollarSign size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Account Statistics</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'เป้าหมายกำไร', value: `$${account.profitTarget.toLocaleString()}`, color: 'text-purple-700', bg: 'bg-purple-50' },
                    { label: 'กำไรปัจจุบัน', value: `${account.currentProfit >= 0 ? '+' : ''}$${account.currentProfit.toLocaleString()}`, color: account.currentProfit >= 0 ? 'text-emerald-600' : 'text-rose-500', bg: account.currentProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50' },
                    { label: 'Best Trade', value: `+$${bestTrade.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Worst Trade', value: `-$${Math.abs(worstTrade).toLocaleString()}`, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Daily Loss คงเหลือ', value: `$${account.dailyLoss.toLocaleString()} (${account.dailyLossPct}%)`, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Max DD คงเหลือ', value: `$${account.maxDD.toLocaleString()} (${account.maxDDPct}%)`, color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map(s => (
                    <div key={s.label} className={`flex items-center justify-between p-2.5 rounded-xl ${s.bg}`}>
                      <span className="text-[11px] text-gray-500 font-medium">{s.label}</span>
                      <span className={`text-[12px] font-extrabold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Trade History */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-purple-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Calendar size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800">Trade History</span>
                      <div className="text-[10px] text-gray-400">{trades.length} เทรดล่าสุด</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold">{wins}W</span>
                    <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded-lg font-bold">{losses}L</span>
                  </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-1">Date</div>
                  <div className="col-span-2">Asset</div>
                  <div className="col-span-1">Side</div>
                  <div className="col-span-2">Setup</div>
                  <div className="col-span-1">Result</div>
                  <div className="col-span-2 text-right">P&L</div>
                  <div className="col-span-1 text-right">R</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {/* Trade rows */}
                <div className="flex-1 overflow-y-auto max-h-[480px]">
                  {trades.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-400">ไม่มีข้อมูลเทรด</div>
                  )}
                  {trades.map((t, i) => (
                    <div key={i} className={`grid grid-cols-12 gap-2 px-5 py-3 border-b border-gray-50 items-center hover:bg-purple-50/30 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <div className="col-span-1 text-[11px] text-gray-500 font-medium">{t.date.slice(5)}</div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold"
                            style={{ background: t.asset === 'XAUUSD' ? '#fef3c7' : t.asset === 'NAS100' ? '#d1fae5' : '#e0f2fe' }}>
                            {t.asset.slice(0, 2)}
                          </div>
                          <span className="text-[12px] font-bold text-gray-800">{t.asset}</span>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${t.side === 'Long' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                          {t.side === 'Long' ? '▲' : '▼'} {t.side}
                        </span>
                      </div>
                      <div className="col-span-2 text-[11px] text-gray-600 font-medium">{t.setup}</div>
                      <div className="col-span-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${t.result === 'Win' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                          {t.result}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={`text-[13px] font-extrabold ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {t.pnl >= 0 ? '+' : ''}${Math.abs(t.pnl).toLocaleString()}
                        </span>
                      </div>
                      <div className="col-span-1 text-right">
                        <span className={`text-[12px] font-bold ${t.r >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                          {t.r >= 0 ? '+' : ''}{t.r.toFixed(1)}R
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${t.result === 'Win' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${t.result === 'Win' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {t.result === 'Win' ? 'Profit' : 'Loss'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary footer */}
                <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-violet-50 border-t border-purple-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-medium">Total Performance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-gray-500">Win Rate: <span className="font-bold text-gray-800">{winRate.toFixed(1)}%</span></span>
                      <span className={`text-[13px] font-extrabold ${totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        Net: {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
