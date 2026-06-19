'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyColorTheme as applyTheme } from '@/lib/colorTheme';
import TopBar from '@/components/TopBar';
import {
  Tradingview, Binance, Bybit, Okx, Coinbase, Kraken, Kucoin,
  Discord, Telegram, Github, Notion, Wise, Paypal, Stripe,
  Bitcoin, Ethereum, Tether, Metamask, Robinhood,
} from '@thesvg/react';
import { Check, Database, Download, Moon, Settings, Sun, Upload } from 'lucide-react';

const TABS = ['General','Appearance Lock','Notifications','Trading Defaults','Data & Backup','Import Sources','Privacy & Protection'];

type ConnectStatus = 'connected' | 'disconnected' | 'coming-soon';

const IMPORT_SOURCES: {
  category: string;
  items: { name: string; Icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>; status: ConnectStatus; desc: string }[];
}[] = [
  {
    category: 'Trading Platforms',
    items: [
      { name: 'TradingView',  Icon: Tradingview, status: 'connected',    desc: 'Charts · Alerts · Screener' },
      { name: 'Binance',      Icon: Binance,     status: 'disconnected', desc: 'Spot · Futures · Portfolio' },
      { name: 'Bybit',        Icon: Bybit,       status: 'disconnected', desc: 'Perpetual · Spot · Copy' },
      { name: 'OKX',          Icon: Okx,         status: 'disconnected', desc: 'Derivatives · Earn · Web3' },
      { name: 'Coinbase',     Icon: Coinbase,    status: 'disconnected', desc: 'Spot · Staking · Wallet' },
      { name: 'Kraken',       Icon: Kraken,      status: 'disconnected', desc: 'Spot · Futures · NFT' },
      { name: 'KuCoin',       Icon: Kucoin,      status: 'disconnected', desc: 'Spot · Margin · Bot' },
      { name: 'Robinhood',    Icon: Robinhood,   status: 'coming-soon',  desc: 'Stocks · Options · Crypto' },
    ],
  },
  {
    category: 'Wallets & Crypto',
    items: [
      { name: 'MetaMask',  Icon: Metamask, status: 'disconnected', desc: 'EVM Wallet · DeFi · NFT' },
      { name: 'Bitcoin',   Icon: Bitcoin,  status: 'coming-soon',  desc: 'On-chain Balance Sync' },
      { name: 'Ethereum',  Icon: Ethereum, status: 'coming-soon',  desc: 'On-chain Balance Sync' },
      { name: 'Tether',    Icon: Tether,   status: 'coming-soon',  desc: 'USDT Balance Sync' },
    ],
  },
  {
    category: 'Payments & Payout',
    items: [
      { name: 'Wise',    Icon: Wise,   status: 'connected',    desc: 'Multi-currency · Transfers' },
      { name: 'PayPal',  Icon: Paypal, status: 'disconnected', desc: 'Payments · Withdrawals' },
      { name: 'Stripe',  Icon: Stripe, status: 'coming-soon',  desc: 'Card Payments · Billing' },
    ],
  },
  {
    category: 'Community & Tools',
    items: [
      { name: 'Discord',  Icon: Discord,  status: 'connected',    desc: 'Trading Signals · Groups' },
      { name: 'Telegram', Icon: Telegram, status: 'connected',    desc: 'Alerts · Bots · Channels' },
      { name: 'GitHub',   Icon: Github,   status: 'disconnected', desc: 'Strategy Code · Backtest' },
      { name: 'Notion',   Icon: Notion,   status: 'disconnected', desc: 'Trade Journal · Notes Sync' },
    ],
  },
];

const statusStyle: Record<ConnectStatus, { label: string; bg: string; text: string; btnLabel: string; btnClass: string }> = {
  connected:    { label: 'Connected',    bg: 'bg-emerald-100', text: 'text-emerald-700', btnLabel: 'Disconnect', btnClass: 'border border-rose-200 text-rose-600 hover:bg-rose-50' },
  disconnected: { label: 'Disconnected', bg: 'bg-gray-100',    text: 'text-gray-500',    btnLabel: 'Connect',    btnClass: 'bg-purple-600 text-white hover:bg-purple-700' },
  'coming-soon':{ label: 'Coming Soon',  bg: 'bg-amber-100',   text: 'text-amber-700',   btnLabel: 'Notify Me',  btnClass: 'border border-amber-200 text-amber-600 hover:bg-amber-50' },
};

/* ─── Color Themes ─────────────────────────────────────────────────────────── */
type ColorTheme = 'purple' | 'mono' | 'blue' | 'green' | 'orange';

const COLOR_THEMES: {
  id: ColorTheme;
  name: string;
  nameTh: string;
  gradient: string;
  gradientSoft: string;
  previewBg: string;
  previewBorder: string;
  dot1: string;
  dot2: string;
}[] = [
  {
    id: 'purple',
    name: 'Purple',
    nameTh: 'ม่วง (Default)',
    gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    gradientSoft: 'linear-gradient(135deg,#a78bfa,#c4b5fd)',
    previewBg: 'linear-gradient(160deg,#f5f3ff 0%,#ede9ff 100%)',
    previewBorder: '#c4b5fd',
    dot1: '#7c3aed',
    dot2: '#a78bfa',
  },
  {
    id: 'mono',
    name: 'Mono',
    nameTh: 'ดำขาว',
    gradient: 'linear-gradient(135deg,#1f2937,#6b7280)',
    gradientSoft: 'linear-gradient(135deg,#6b7280,#9ca3af)',
    previewBg: 'linear-gradient(160deg,#f7f8fa 0%,#e2e8f0 100%)',
    previewBorder: '#9ca3af',
    dot1: '#1f2937',
    dot2: '#9ca3af',
  },
  {
    id: 'blue',
    name: 'Blue',
    nameTh: 'ฟ้า',
    gradient: 'linear-gradient(135deg,#1d4ed8,#38bdf8)',
    gradientSoft: 'linear-gradient(135deg,#60a5fa,#93c5fd)',
    previewBg: 'linear-gradient(160deg,#f0f6ff 0%,#dbeafe 100%)',
    previewBorder: '#93c5fd',
    dot1: '#1d4ed8',
    dot2: '#38bdf8',
  },
  {
    id: 'green',
    name: 'Green',
    nameTh: 'เขียว',
    gradient: 'linear-gradient(135deg,#047857,#34d399)',
    gradientSoft: 'linear-gradient(135deg,#34d399,#6ee7b7)',
    previewBg: 'linear-gradient(160deg,#f0fdf6 0%,#d1fae5 100%)',
    previewBorder: '#6ee7b7',
    dot1: '#047857',
    dot2: '#34d399',
  },
  {
    id: 'orange',
    name: 'Orange',
    nameTh: 'ส้ม',
    gradient: 'linear-gradient(135deg,#c2410c,#fb923c)',
    gradientSoft: 'linear-gradient(135deg,#fb923c,#fbbf24)',
    previewBg: 'linear-gradient(160deg,#fff8f0 0%,#ffedd5 100%)',
    previewBorder: '#fdba74',
    dot1: '#c2410c',
    dot2: '#fb923c',
  },
];


/* ─── Appearance Tab ────────────────────────────────────────────────────────── */
function AppearanceTab() {
  const [colorTheme, setColorTheme] = useState<ColorTheme>('purple');
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('colorTheme') as ColorTheme | null) as ColorTheme || 'purple';
    setColorTheme(saved);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function handleTheme(id: ColorTheme) {
    setColorTheme(id);
    applyTheme(id);
  }

  function toggleDark() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) root.classList.add('dark'); else root.classList.remove('dark');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }

  if (!mounted) return <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Dark / Light toggle */}
      <div>
        <div className="font-semibold text-gray-800 mb-1">โหมดแสดงผล</div>
        <div className="text-xs text-gray-400 mb-4">เปลี่ยนระหว่างโหมดสว่างและโหมดมืด</div>
        <div className="flex gap-3">
          {[
            { label: 'Light', icon: <Sun size={16} className="text-amber-500" />, value: false },
            { label: 'Dark',  icon: <Moon size={16} className="text-amber-300" />, value: true  },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => opt.value !== dark && toggleDark()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                dark === opt.value
                  ? 'border-purple-300 bg-purple-50 text-purple-700 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.icon}
              {opt.label}
              {dark === opt.value && <Check size={13} className="ml-1 text-purple-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Color Theme picker */}
      <div>
        <div className="font-semibold text-gray-800 mb-1">ธีมสี (Gradient Color Theme)</div>
        <div className="text-xs text-gray-400 mb-4">เลือกธีมสี — ปรับเปลี่ยนทั้งแดชบอร์ดทันที</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {COLOR_THEMES.map(theme => {
            const active = colorTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleTheme(theme.id)}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.03] focus:outline-none ${
                  active ? 'shadow-lg scale-[1.03]' : 'border-transparent shadow-sm hover:shadow-md'
                }`}
                style={{ borderColor: active ? theme.dot1 : 'transparent' }}
              >
                {/* Gradient preview background */}
                <div
                  className="h-20 w-full"
                  style={{ background: theme.previewBg }}
                >
                  {/* Mini sidebar preview */}
                  <div className="absolute inset-0 flex">
                    <div
                      className="w-8 h-full rounded-l-2xl flex flex-col items-center pt-2 gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.55)' }}
                    >
                      {[0,1,2,3].map(i => (
                        <div
                          key={i}
                          className="rounded-md"
                          style={{
                            width: i === 0 ? 18 : 14,
                            height: 5,
                            background: i === 0 ? theme.gradient : 'rgba(0,0,0,0.12)',
                            opacity: i === 0 ? 1 : 0.6,
                          }}
                        />
                      ))}
                    </div>
                    {/* Content preview */}
                    <div className="flex-1 p-1.5 flex flex-col gap-1">
                      <div className="flex gap-1">
                        {[theme.dot1, theme.dot2, '#e5e7eb'].map((c, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-md"
                            style={{ height: 6, background: c, opacity: i === 2 ? 0.5 : 1 }}
                          />
                        ))}
                      </div>
                      <div
                        className="rounded-md w-full"
                        style={{ height: 28, background: 'rgba(255,255,255,0.7)', border: `1px solid ${theme.previewBorder}` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div
                  className="px-2 py-1.5 text-center"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <div className="text-[11px] font-semibold text-gray-700">{theme.nameTh}</div>
                </div>

                {/* Active check */}
                {active && (
                  <div
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
                    style={{ background: theme.gradient }}
                  >
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Gradient preview strip */}
        <div className="mt-5 p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
          <div className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">ตัวอย่าง Gradient ที่เลือก</div>
          {(() => {
            const t = COLOR_THEMES.find(x => x.id === colorTheme)!;
            return (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-10 rounded-xl shadow-inner" style={{ background: t.gradient }} />
                <div className="flex-1 h-10 rounded-xl shadow-inner" style={{ background: t.gradientSoft }} />
                <div className="flex-1 h-10 rounded-xl shadow-inner" style={{ background: t.previewBg }} />
              </div>
            );
          })()}
          <div className="mt-2 flex gap-2 justify-center">
            {(() => {
              const t = COLOR_THEMES.find(x => x.id === colorTheme)!;
              return (
                <>
                  <span className="text-[11px] text-gray-500">Primary</span>
                  <span className="text-[11px] font-mono text-gray-600">{t.dot1}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[11px] text-gray-500">Accent</span>
                  <span className="text-[11px] font-mono text-gray-600">{t.dot2}</span>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [tab, setTab] = useState('General');
  const [form, setForm] = useState({ name:'Trader Alpha', email:'traderalpha@example.com', timezone:'Asia/Bangkok', currency:'USD', lang:'th' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TopBar title="Settings" subtitle="ปรับตั้งค่าแดชบอร์ดของคุณ"/>
      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 bg-white rounded-2xl p-2 border border-purple-50 shadow-sm h-fit">
          {TABS.map(t=>(
            <motion.button
              key={t}
              onClick={()=>setTab(t)}
              whileHover={{ x: tab === t ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm mb-0.5 transition ${tab===t?'bg-purple-100 text-purple-700 font-medium':'text-gray-500 hover:bg-purple-50'}`}>
              {t}
            </motion.button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl p-6 border border-purple-50 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
          {tab === 'General' && (
            <div className="space-y-4 max-w-lg">
              <div className="font-semibold text-gray-800 mb-4">General Settings</div>
              {[
                { label:'Display Name', key:'name', type:'text' },
                { label:'Email', key:'email', type:'email' },
              ].map(f=>(
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{f.label}</label>
                  <input type={f.type} value={(form as Record<string,string>)[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400"/>
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Timezone</label>
                <select value={form.timezone} onChange={e=>setForm(p=>({...p,timezone:e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option>Asia/Bangkok</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Currency</label>
                <select value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option>USD</option><option>EUR</option><option>THB</option>
                </select>
              </div>
              <button className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl"
                style={{background:'var(--primary-gradient,linear-gradient(135deg,#7c5cbf,#a78bfa))'}}>
                Save Settings
              </button>
            </div>
          )}
          {tab === 'Appearance Lock' && <AppearanceTab />}
          {tab === 'Data & Backup' && (
            <div className="space-y-4 max-w-lg">
              <div className="font-semibold text-gray-800 mb-4">Data & Backup</div>
              <div className="space-y-3">
                <button className="w-full py-3 rounded-xl border border-emerald-200 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition">
                  <span className="inline-flex items-center justify-center gap-2"><Download size={15} /> Export All Data (JSON)</span>
                </button>
                <button className="w-full py-3 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition">
                  <span className="inline-flex items-center justify-center gap-2"><Database size={15} /> Export Trades (CSV)</span>
                </button>
                <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                  <span className="inline-flex items-center justify-center gap-2"><Upload size={15} /> Import Data (JSON)</span>
                </button>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="text-sm font-semibold text-red-500 mb-1">Danger Zone</div>
                  <div className="text-xs text-gray-500 mb-3">ล้างข้อมูลทั้งหมดออกจาก localStorage</div>
                  <button onClick={()=>{ if(confirm('ยืนยันการล้างข้อมูล?')) localStorage.clear(); }}
                    className="px-4 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition">
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}
          {tab === 'Import Sources' && (
            <div className="space-y-6">
              <div>
                <div className="font-semibold text-gray-800 text-sm mb-1">Import Sources & Connections</div>
                <div className="text-xs text-gray-400">เชื่อมต่อแพลตฟอร์มและบริการต่างๆ เพื่อ sync ข้อมูลอัตโนมัติ</div>
              </div>
              {IMPORT_SOURCES.map(group => (
                <div key={group.category}>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{group.category}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items.map(src => {
                      const s = statusStyle[src.status];
                      return (
                        <div key={src.name} className="flex items-center gap-3 p-4 rounded-2xl border border-purple-50 bg-gray-50/50 hover:bg-purple-50/30 transition">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0">
                            <src.Icon style={{ width: 24, height: 24 }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-800">{src.name}</div>
                            <div className="text-[11px] text-gray-400">{src.desc}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                            <button className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition ${s.btnClass}`}>
                              {s.btnLabel}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!['General','Appearance Lock','Data & Backup','Import Sources'].includes(tab) && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Settings size={40} className="mb-3 text-purple-300" />
              <div className="font-medium text-gray-600 mb-1">{tab}</div>
              <div className="text-sm">Coming soon — กำลังพัฒนาอยู่</div>
            </div>
          )}
          </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
