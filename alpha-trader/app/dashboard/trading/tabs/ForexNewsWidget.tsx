'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Clock, Zap, AlertTriangle, Star, RefreshCw, Calendar,
  ChevronLeft, ChevronRight, Search, ChevronsLeft, ChevronsRight,
  Wifi, WifiOff, BarChart2, X, TrendingUp, TrendingDown, SlidersHorizontal,
} from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════
type Impact = 'High' | 'Medium' | 'Low' | 'Holiday' | 'Non-Economic';
type ForexEvent = {
  title: string; country: string; date: string; time: string;
  impact: Impact; forecast: string; previous: string; actual: string;
};
type DataSource = 'live' | 'mock' | 'loading';
type HistoricalPoint = {
  month: string; actual: number | null; forecast: number | null; isFuture: boolean;
};

// ═══════════════════════════════════════════════════════════════════════════
// Date helpers
// ═══════════════════════════════════════════════════════════════════════════
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const TODAY = new Date();
function fmtDisplay(d: Date) { return `${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`; }
function fmtISO(d: Date)     { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function sameDay(a: Date, b: Date) { return fmtISO(a) === fmtISO(b); }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function startOfWeek(d: Date)  { const r = new Date(d); r.setDate(r.getDate()-r.getDay()); return r; }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date)   { return new Date(d.getFullYear(), d.getMonth()+1, 0); }

// ═══════════════════════════════════════════════════════════════════════════
// Time conversion: ET (Forex Factory) → ICT (Thailand, UTC+7)
// EDT (summer, UTC-4) → ICT: +11h  |  EST (winter, UTC-5) → ICT: +12h
// ═══════════════════════════════════════════════════════════════════════════
function isUSEDT(d: Date): boolean {
  const y = d.getFullYear();
  const marchDst = new Date(y, 2, 1 + (7 - new Date(y,2,1).getDay()) % 7 + 7);
  const novDst   = new Date(y, 10, 1 + (7 - new Date(y,10,1).getDay()) % 7);
  return d >= marchDst && d < novDst;
}
function etToICT(timeStr: string, forDate?: Date): string {
  if (!timeStr || timeStr === 'All Day') return timeStr;
  let h = 0, min = 0;
  const m12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  const m24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (m12) {
    h = parseInt(m12[1]); min = parseInt(m12[2]);
    if (/pm/i.test(m12[3]) && h !== 12) h += 12;
    if (/am/i.test(m12[3]) && h === 12) h = 0;
  } else if (m24) {
    h = parseInt(m24[1]); min = parseInt(m24[2]);
  } else { return timeStr; }
  const offsetH = !forDate || isUSEDT(forDate) ? 11 : 12;
  const total = ((h * 60 + min + offsetH * 60) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function liveTimeToICT(item: any): string {
  // If date field carries full datetime + timezone offset, use that for precision
  if (item.date && /T\d{2}:\d{2}/.test(item.date)) {
    const dt = new Date(item.date);
    if (!isNaN(dt.getTime())) {
      const ict = new Date(dt.getTime() + 7 * 3600 * 1000);
      return `${String(ict.getUTCHours()).padStart(2,'0')}:${String(ict.getUTCMinutes()).padStart(2,'0')}`;
    }
  }
  return etToICT(item.time || 'All Day', item.date ? new Date(item.date) : undefined);
}

// ═══════════════════════════════════════════════════════════════════════════
// Flag component
// ═══════════════════════════════════════════════════════════════════════════
const CURRENCY_ISO: Record<string,string> = {
  USD:'US', EUR:'EU', GBP:'GB', JPY:'JP', AUD:'AU', CAD:'CA', CHF:'CH', NZD:'NZ',
  CNY:'CN', INR:'IN', KRW:'KR', MXN:'MX', BRL:'BR', ZAR:'ZA', SEK:'SE', NOK:'NO',
  SGD:'SG', HKD:'HK', DKK:'DK', PLN:'PL',
};
const CURRENCY_NAMES: Record<string,string> = {
  USD:'US Dollar', EUR:'Euro Zone', GBP:'British Pound', JPY:'Japanese Yen',
  AUD:'Australian', CAD:'Canadian', CHF:'Swiss Franc', NZD:'New Zealand',
};
function FlagImg({ country, size=28 }: { country: string; size?: number }) {
  const iso = CURRENCY_ISO[country];
  if (!iso) return (
    <span className="flex items-center justify-center rounded border border-slate-200 bg-slate-100 text-[9px] font-bold text-slate-500"
      style={{ width: size, height: Math.round(size*0.67) }}>{country.slice(0,2)}</span>
  );
  return <ReactCountryFlag countryCode={iso} svg
    style={{ width: size, height: Math.round(size*0.67), borderRadius: 3, display:'block' }}
    title={country} aria-label={country}/>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Impact config
// ═══════════════════════════════════════════════════════════════════════════
const IMPACT_CFG: Record<Impact, { pillBg:string; pillText:string; border:string; rowBg:string; icon:React.ReactNode; label:string }> = {
  High:          { pillBg:'bg-rose-100 dark:bg-rose-900/30',   pillText:'text-rose-600 dark:text-rose-400',   border:'border-rose-200 dark:border-rose-800/40',   rowBg:'bg-rose-50/30 dark:bg-rose-900/10',  icon:<Zap size={10} strokeWidth={2.5}/>,          label:'High'    },
  Medium:        { pillBg:'bg-orange-100 dark:bg-orange-900/30', pillText:'text-orange-600 dark:text-orange-400', border:'border-orange-200 dark:border-orange-800/40', rowBg:'',               icon:<AlertTriangle size={10} strokeWidth={2.5}/>, label:'Medium'  },
  Low:           { pillBg:'bg-yellow-100 dark:bg-yellow-900/20', pillText:'text-yellow-700 dark:text-yellow-400', border:'border-yellow-200 dark:border-yellow-800/40', rowBg:'',               icon:<Star size={10} strokeWidth={2.5}/>,          label:'Low'     },
  Holiday:        { pillBg:'bg-slate-100 dark:bg-slate-700/40', pillText:'text-slate-500 dark:text-slate-400',  border:'border-slate-200 dark:border-slate-600/40',  rowBg:'', icon:<Calendar size={10}/>, label:'Holiday'  },
  'Non-Economic': { pillBg:'bg-slate-100 dark:bg-slate-700/40', pillText:'text-slate-400',  border:'border-slate-200 dark:border-slate-600/40',  rowBg:'', icon:<Globe size={10}/>,    label:'Non-Eco'  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Historical data generator (1 year mock)
// ═══════════════════════════════════════════════════════════════════════════
function parseNumeric(s: string): number | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.-]/g,''));
  return isNaN(n) ? null : n;
}
function getSuffix(s: string) { const m = s.match(/[^0-9.-]+$/); return m ? m[0] : ''; }
function getPrefix(s: string) { const m = s.match(/^[^0-9.-]+/); return m ? m[0] : ''; }

function generateHistoricalData(ev: ForexEvent): { points: HistoricalPoint[]; suffix: string; prefix: string } {
  const rawStr = ev.previous || ev.forecast || '0';
  const base   = parseNumeric(rawStr) ?? 0;
  const suffix = getSuffix(rawStr);
  const prefix = getPrefix(rawStr);
  const scale  = Math.abs(base) < 1 ? 0.08 : Math.abs(base) < 10 ? 0.12 : Math.abs(base)*0.08+0.1;
  let seed = ev.title.split('').reduce((a,c) => a + c.charCodeAt(0), 42) * 997 + ev.country.charCodeAt(0) * 31;
  const rng = () => { seed = (seed*16807) % 2147483647; return (seed-1) / 2147483646; };
  const points: HistoricalPoint[] = [];
  for (let i = 12; i >= 0; i--) {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth()-i, 1);
    const label = `${MONTH_NAMES[d.getMonth()].slice(0,3)} '${String(d.getFullYear()).slice(2)}`;
    const variance = (rng()-0.5) * 2 * scale;
    const trend    = (12-i) * scale * 0.04 * (rng() > 0.5 ? 1 : -1);
    const actual   = i === 0 ? null : Math.round((base+variance+trend)*1000)/1000;
    const fc = actual !== null
      ? Math.round((actual + (rng()-0.5)*scale*0.6)*1000)/1000
      : Math.round((base  + (rng()-0.5)*scale*0.6)*1000)/1000;
    points.push({ month: label, actual, forecast: fc, isFuture: i === 0 });
  }
  return { points, suffix, prefix };
}

// ═══════════════════════════════════════════════════════════════════════════
// Dark mode hook (watches .dark class on <html>)
// ═══════════════════════════════════════════════════════════════════════════
function useDarkMode() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')));
    obs.observe(el, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ═══════════════════════════════════════════════════════════════════════════
// Custom Tooltip
// ═══════════════════════════════════════════════════════════════════════════
function ChartTooltip({ active, payload, label, suffix, prefix }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[];
  label?: string; suffix: string; prefix: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#1e2035] px-3 py-2 shadow-xl text-[11px]">
      <div className="mb-1 font-extrabold text-slate-600 dark:text-slate-200">{label}</div>
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }}/>
          <span className="text-slate-400 dark:text-slate-500">{p.name}:</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-100">{prefix}{p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Event Chart Panel — opens BELOW the row
// ═══════════════════════════════════════════════════════════════════════════
function EventChartPanel({ ev, onHide }: { ev: ForexEvent; onHide: () => void }) {
  const { points, suffix, prefix } = useMemo(() => generateHistoricalData(ev), [ev]);

  const past    = points.filter(p => !p.isFuture);
  const actuals = past.map(p => p.actual ?? 0);
  const avg     = actuals.reduce((a,b) => a+b, 0) / (actuals.length || 1);
  const latest  = actuals[actuals.length-1] ?? 0;
  const prev2   = actuals[actuals.length-2] ?? 0;
  const trend   = latest - prev2;
  const trendPct = prev2 !== 0 ? ((trend / Math.abs(prev2)) * 100).toFixed(1) : '0.0';
  const isUp    = trend >= 0;

  const allVals = points.flatMap(p => [p.actual, p.forecast]).filter((v): v is number => v !== null);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const pad  = (maxV - minV) * 0.3 || 0.5;

  const fmtForecast = ev.forecast ? `${prefix}${ev.forecast}` : '—';
  const fmtPrev     = ev.previous ? `${prefix}${ev.previous}` : '—';
  const dark        = useDarkMode();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="mx-3 mb-3 rounded-2xl border border-purple-100 dark:border-white/10 bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800/40 dark:to-purple-900/20 p-4 shadow-sm">

        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2035] shadow-sm">
              <FlagImg country={ev.country} size={32}/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100">{ev.title}</span>
                <span className="rounded-full bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300">{ev.country}</span>
              </div>
              <div className="mt-0.5 text-[10px] font-semibold text-slate-400">
                Historical data · Last 12 months · Actual vs Forecast
              </div>
            </div>
          </div>

          {/* Stats + Hide */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Forecast</div>
              <div className="text-[13px] font-extrabold text-orange-500">{fmtForecast}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Previous</div>
              <div className="text-[13px] font-extrabold text-slate-600 dark:text-slate-300">{fmtPrev}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">12M Avg</div>
              <div className="text-[13px] font-extrabold text-purple-600 dark:text-purple-400">
                {prefix}{Math.round(avg*100)/100}{suffix}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">M/M</div>
              <div className={`flex items-center gap-0.5 justify-center text-[13px] font-extrabold ${isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isUp ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
                {isUp ? '+' : ''}{trendPct}%
              </div>
            </div>
            <button onClick={onHide}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-100 transition">
              <X size={12}/> Hide
            </button>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top:4, right:12, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.85}/>
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.45}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'} vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:10, fontWeight:600, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[minV-pad, maxV+pad]} tick={{ fontSize:10, fontWeight:600, fill:'#94a3b8' }}
                axisLine={false} tickLine={false} width={44}
                tickFormatter={v => `${prefix}${v}${suffix}`}/>
              <Tooltip content={<ChartTooltip suffix={suffix} prefix={prefix}/>} cursor={{ fill: dark ? 'rgba(124,58,237,0.15)' : '#f3f0ff', opacity:0.5 }}/>
              <ReferenceLine y={avg} stroke="#a78bfa" strokeDasharray="6 3" strokeWidth={1.5}/>
              <Bar dataKey="actual" name="Actual" barSize={18} radius={[4,4,0,0]}>
                {points.map((p,i) => <Cell key={i} fill={p.isFuture ? (dark ? '#2d3a4a' : '#e2e8f0') : 'url(#barGrad)'}/>)}
              </Bar>
              <Line dataKey="forecast" name="Forecast" type="monotone"
                stroke="#f97316" strokeWidth={2} strokeDasharray="5 3"
                dot={{ r:3, fill:'#f97316', strokeWidth:0 }}
                activeDot={{ r:5, fill:'#f97316', stroke:'#fff', strokeWidth:2 }}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-4 justify-center text-[10px] font-semibold text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-violet-600"/>Actual</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-dashed border-orange-400"/>Forecast</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t border-dashed border-purple-400"/>12M Average</span>
          <span className="ml-2 text-[9px] text-slate-300 dark:text-slate-600">* Mock historical data (demo)</span>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Mini Calendar
// ═══════════════════════════════════════════════════════════════════════════
function MiniCalendar({ month,selStart,selEnd,hovered,onDay,onHover,onPrevYear,onPrevMonth,onNextMonth,onNextYear,showLeftNav,showRightNav }:{
  month:Date; selStart:Date; selEnd:Date; hovered:Date|null;
  onDay:(d:Date)=>void; onHover:(d:Date|null)=>void;
  onPrevYear:()=>void; onPrevMonth:()=>void; onNextMonth:()=>void; onNextYear:()=>void;
  showLeftNav:boolean; showRightNav:boolean;
}) {
  const y=month.getFullYear(), m=month.getMonth();
  const firstDow=new Date(y,m,1).getDay(), daysInMon=new Date(y,m+1,0).getDate(), prevDays=new Date(y,m,0).getDate();
  const effEnd=hovered&&hovered>selStart?hovered:selEnd;
  const cells:{date:Date;current:boolean}[]=[];
  for (let i=firstDow-1;i>=0;i--) cells.push({date:new Date(y,m-1,prevDays-i),current:false});
  for (let d=1;d<=daysInMon;d++) cells.push({date:new Date(y,m,d),current:true});
  while (cells.length%7!==0) cells.push({date:new Date(y,m+1,cells.length-firstDow-daysInMon+1),current:false});
  return (
    <div className="w-[188px] select-none">
      <div className="mb-1 flex items-center justify-between">
        {showLeftNav?(<div className="flex">
          <button onClick={onPrevYear} className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><ChevronsLeft size={12}/></button>
          <button onClick={onPrevMonth} className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><ChevronLeft size={12}/></button>
        </div>):<div className="w-12"/>}
        <span className="text-[12px] font-extrabold text-slate-700">{MONTH_NAMES[m]} {y}</span>
        {showRightNav?(<div className="flex">
          <button onClick={onNextMonth} className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><ChevronRight size={12}/></button>
          <button onClick={onNextYear} className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><ChevronsRight size={12}/></button>
        </div>):<div className="w-12"/>}
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS_SHORT.map(w=><div key={w} className="pb-0.5 text-center text-[10px] font-bold text-slate-400">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell,i)=>{
          const d=cell.date;
          const isStart=sameDay(d,selStart), isEnd=hovered&&hovered>selStart?sameDay(d,hovered):sameDay(d,selEnd);
          const inRange=d>selStart&&d<effEnd, isToday=sameDay(d,TODAY);
          let cls='flex h-6 w-full items-center justify-center text-[11px] transition-all cursor-pointer ';
          if(isStart||isEnd){ cls+='z-10 font-extrabold text-white '; cls+=isStart&&isEnd?'rounded-full bg-green-600 ':isStart?'rounded-l-full bg-green-600 ':'rounded-r-full bg-green-600 '; }
          else if(inRange) cls+='bg-green-100 text-green-800 font-semibold ';
          else { cls+='font-medium hover:rounded-full hover:bg-slate-100 '; cls+=!cell.current?'text-slate-300 ':isToday?'font-extrabold text-blue-600 underline ':'text-slate-600 '; }
          return <button key={i} onClick={()=>onDay(d)} onMouseEnter={()=>onHover(d)} onMouseLeave={()=>onHover(null)} className={cls}>{d.getDate()}</button>;
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Date Range Popup (position: fixed)
// ═══════════════════════════════════════════════════════════════════════════
const QUICK=[
  {label:'This Week',  fn:()=>({s:addDays(startOfWeek(TODAY),1),e:addDays(startOfWeek(TODAY),7)})},
  {label:'Next Week',  fn:()=>({s:addDays(startOfWeek(TODAY),8),e:addDays(startOfWeek(TODAY),14)})},
  {label:'This Month', fn:()=>({s:startOfMonth(TODAY),e:endOfMonth(TODAY)})},
  {label:'Next Month', fn:()=>{const nm=new Date(TODAY.getFullYear(),TODAY.getMonth()+1,1);return{s:nm,e:endOfMonth(nm)};}},
];
function DateRangePopup({ selStart,selEnd,anchorRect,onApply,onCancel }:{
  selStart:Date; selEnd:Date; anchorRect:DOMRect|null;
  onApply:(s:Date,e:Date)=>void; onCancel:()=>void;
}) {
  const [picking,setPicking]=useState<'start'|'end'>('start');
  const [localS,setLocalS]=useState(selStart);
  const [localE,setLocalE]=useState(selEnd);
  const [hovered,setHovered]=useState<Date|null>(null);
  const [leftMo,setLeftMo]=useState(new Date(selStart.getFullYear(),selStart.getMonth(),1));
  const rightMo=new Date(leftMo.getFullYear(),leftMo.getMonth()+1,1);
  const style=useMemo(()=>{
    if(!anchorRect)return{top:200,left:100};
    const popupW=460,popupH=360,winW=window.innerWidth,winH=window.innerHeight;
    let top=anchorRect.bottom+8; if(top+popupH>winH-10)top=anchorRect.top-popupH-8;
    let left=anchorRect.left; if(left+popupW>winW-10)left=winW-popupW-10; if(left<10)left=10;
    return{top,left};
  },[anchorRect]);
  const handleDay=(d:Date)=>{
    if(picking==='start'||d<localS){setLocalS(d);setLocalE(d);setPicking('end');}
    else{setLocalE(d);setPicking('start');}
  };
  const nav=(delta:number,unit:'month'|'year')=>setLeftMo(prev=>{const r=new Date(prev);if(unit==='month')r.setMonth(r.getMonth()+delta);else r.setFullYear(r.getFullYear()+delta);return r;});
  const handleQuick=(fn:()=>{s:Date;e:Date})=>{const{s,e}=fn();setLocalS(s);setLocalE(e);setLeftMo(new Date(s.getFullYear(),s.getMonth(),1));setPicking('start');};
  return (
    <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.97}}
      transition={{duration:0.14,ease:'easeOut'}}
      className="fixed z-[9999] rounded-xl border border-slate-200 bg-white shadow-2xl"
      style={{...style,width:460}} onClick={e=>e.stopPropagation()}>
      <div className="flex items-center gap-2 rounded-t-xl bg-[#2e6e4e] px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-200">Date Range</span>
        <span className="text-[13px] font-extrabold text-white">{fmtDisplay(localS)} – {fmtDisplay(localE)}</span>
        <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-green-100">{picking==='start'?'Select start':'Select end'}</span>
      </div>
      <div className="flex gap-3 px-4 pt-3">
        <MiniCalendar month={leftMo} selStart={localS} selEnd={localE} hovered={hovered} onDay={handleDay} onHover={setHovered}
          onPrevYear={()=>nav(-1,'year')} onPrevMonth={()=>nav(-1,'month')} onNextMonth={()=>nav(+1,'month')} onNextYear={()=>nav(+1,'year')} showLeftNav={true} showRightNav={false}/>
        <div className="w-px self-stretch bg-slate-100"/>
        <MiniCalendar month={rightMo} selStart={localS} selEnd={localE} hovered={hovered} onDay={handleDay} onHover={setHovered}
          onPrevYear={()=>nav(-1,'year')} onPrevMonth={()=>nav(-1,'month')} onNextMonth={()=>nav(+1,'month')} onNextYear={()=>nav(+1,'year')} showLeftNav={false} showRightNav={true}/>
      </div>
      <div className="flex gap-4 border-t border-slate-100 px-4 py-2">
        {QUICK.map(q=><button key={q.label} onClick={()=>handleQuick(q.fn)} className="text-[11px] font-semibold text-sky-600 underline hover:text-sky-800 transition">{q.label}</button>)}
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-2.5">
        <button onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
        <button onClick={()=>onApply(localS,localE)} className="rounded-lg bg-green-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-green-700 transition shadow-sm">Apply Settings</button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Fetch + Mock
// ═══════════════════════════════════════════════════════════════════════════
async function fetchForexFactoryLive(start:Date,end:Date):Promise<{events:ForexEvent[];source:'live'|'mock'}> {
  try {
    const res=await fetch('/api/forex-news',{signal:AbortSignal.timeout(8000)});
    if(!res.ok)throw new Error('bad status');
    const raw=await res.json(); if(!Array.isArray(raw))throw new Error('not array');
    const events:ForexEvent[]=[];
    for(const item of raw){
      const ed=item.date?new Date(item.date):null; if(!ed||isNaN(ed.getTime()))continue;
      const dateStr=fmtISO(ed),evDate=new Date(dateStr+'T00:00:00');
      if(evDate<start||evDate>end)continue;
      const impact:Impact=item.impact==='High'?'High':item.impact==='Medium'?'Medium':item.impact==='Low'?'Low':item.impact==='Holiday'?'Holiday':'Non-Economic';
      events.push({title:item.title||item.event||'Unknown',country:item.country||'USD',date:dateStr,time:liveTimeToICT(item),impact,forecast:item.forecast??'',previous:item.previous??'',actual:item.actual??''});
    }
    if(events.length===0)throw new Error('no events');
    return{events:events.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)),source:'live'};
  }catch{return{events:generateMockNews(start,end),source:'mock'};}
}

const TEMPLATES:{title:string;country:string;impact:Impact;forecast:string;previous:string}[]=[
  {title:'Non-Farm Payrolls',       country:'USD',impact:'High',  forecast:'185K', previous:'175K' },
  {title:'CPI m/m',                 country:'USD',impact:'High',  forecast:'0.3%', previous:'0.4%' },
  {title:'Core CPI m/m',            country:'USD',impact:'High',  forecast:'0.2%', previous:'0.3%' },
  {title:'FOMC Statement',          country:'USD',impact:'High',  forecast:'',     previous:''     },
  {title:'Federal Funds Rate',      country:'USD',impact:'High',  forecast:'5.50%',previous:'5.50%'},
  {title:'Unemployment Rate',       country:'USD',impact:'High',  forecast:'3.9%', previous:'3.8%' },
  {title:'GDP q/q',                 country:'USD',impact:'High',  forecast:'2.8%', previous:'3.3%' },
  {title:'Retail Sales m/m',        country:'USD',impact:'High',  forecast:'0.4%', previous:'0.7%' },
  {title:'ISM Manufacturing PMI',   country:'USD',impact:'High',  forecast:'49.8', previous:'49.2' },
  {title:'Initial Jobless Claims',  country:'USD',impact:'Medium',forecast:'215K', previous:'211K' },
  {title:'PPI m/m',                 country:'USD',impact:'Medium',forecast:'0.2%', previous:'0.5%' },
  {title:'Crude Oil Inventories',   country:'USD',impact:'Medium',forecast:'-1.6M',previous:'-2.5M'},
  {title:'CB Consumer Confidence',  country:'USD',impact:'Medium',forecast:'104.0',previous:'102.0'},
  {title:'Durable Goods Orders m/m',country:'USD',impact:'Medium',forecast:'0.5%', previous:'0.7%' },
  {title:'ECB Main Refinancing Rate',country:'EUR',impact:'High', forecast:'4.25%',previous:'4.50%'},
  {title:'CPI y/y',                 country:'EUR',impact:'High',  forecast:'2.4%', previous:'2.6%' },
  {title:'German Manufacturing PMI',country:'EUR',impact:'Medium',forecast:'43.4', previous:'42.5' },
  {title:'ECB Press Conference',    country:'EUR',impact:'High',  forecast:'',     previous:''     },
  {title:'ZEW Economic Sentiment',  country:'EUR',impact:'Medium',forecast:'50.0', previous:'47.1' },
  {title:'BOE Official Bank Rate',  country:'GBP',impact:'High',  forecast:'5.25%',previous:'5.25%'},
  {title:'CPI y/y',                 country:'GBP',impact:'High',  forecast:'2.1%', previous:'2.3%' },
  {title:'GDP m/m',                 country:'GBP',impact:'High',  forecast:'0.2%', previous:'0.4%' },
  {title:'Claimant Count Change',   country:'GBP',impact:'High',  forecast:'14.1K',previous:'10.7K'},
  {title:'BOJ Policy Rate',         country:'JPY',impact:'High',  forecast:'0.10%',previous:'0.10%'},
  {title:'Tankan Manufacturing',    country:'JPY',impact:'Medium',forecast:'12',   previous:'11'   },
  {title:'Trade Balance',           country:'JPY',impact:'Medium',forecast:'-0.46T',previous:'-0.70T'},
  {title:'Employment Change',       country:'AUD',impact:'High',  forecast:'25.0K',previous:'38.5K'},
  {title:'RBA Rate Statement',      country:'AUD',impact:'High',  forecast:'',     previous:''     },
  {title:'Employment Change',       country:'CAD',impact:'High',  forecast:'22.5K',previous:'41.4K'},
  {title:'BOC Rate Statement',      country:'CAD',impact:'High',  forecast:'',     previous:''     },
  {title:'GDP q/q',                 country:'NZD',impact:'High',  forecast:'0.3%', previous:'-0.1%'},
  {title:'SNB Policy Rate',         country:'CHF',impact:'High',  forecast:'1.50%',previous:'1.75%'},
  {title:'Building Permits',        country:'USD',impact:'Medium',forecast:'1.43M',previous:'1.46M'},
  {title:'Existing Home Sales',     country:'USD',impact:'Low',   forecast:'4.20M',previous:'4.14M'},
  {title:'PMI Manufacturing Flash', country:'USD',impact:'Medium',forecast:'50.1', previous:'49.4' },
  {title:'PMI Services Flash',      country:'EUR',impact:'Medium',forecast:'51.7', previous:'51.3' },
];
const EVENT_TIMES=['02:00','04:30','05:30','07:55','08:00','08:30','09:00','09:45','10:00','13:00','13:30','14:00','15:00','19:00'];
function generateMockNews(start:Date,end:Date):ForexEvent[]{
  let seed=start.getTime();
  const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const events:ForexEvent[]=[]; const d=new Date(start);
  while(d<=end){
    if(d.getDay()!==0&&d.getDay()!==6){
      const count=4+Math.floor(rng()*5),used=new Set<number>();
      for(let i=0;i<count;i++){
        let idx:number,a=0; do{idx=Math.floor(rng()*TEMPLATES.length);a++;}while(used.has(idx)&&a<20);
        used.add(idx);const t=TEMPLATES[idx];
        events.push({title:t.title,country:t.country,date:fmtISO(d),time:etToICT(EVENT_TIMES[Math.floor(rng()*EVENT_TIMES.length)],d),impact:t.impact,forecast:t.forecast,previous:t.previous,actual:rng()>0.5?'':t.forecast});
      }
    }
    d.setDate(d.getDate()+1);
  }
  return events.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
}

// ═══════════════════════════════════════════════════════════════════════════
// Column layout:
//   Time | Flag | Impact | Event | Actual | Forecast | Previous | [Graph icon]
// ═══════════════════════════════════════════════════════════════════════════
const COL = '76px 54px 96px 1fr 86px 86px 86px 48px';

// ═══════════════════════════════════════════════════════════════════════════
// Filter Popup — Forex Factory style, premium theme
// ═══════════════════════════════════════════════════════════════════════════
const IMPACT_COLOR: Record<string, string> = {
  High:'#f43f5e', Medium:'#f97316', Low:'#f59e0b', Holiday:'#94a3b8', 'Non-Economic':'#cbd5e1',
};
const IMPACT_ORDER: Impact[] = ['High','Medium','Low','Holiday','Non-Economic'];
const ALL_FILTER_CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','NZD'];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
      checked ? 'border-purple-500 bg-purple-500 shadow-sm' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-white/5'
    }`}>
      {checked && (
        <svg viewBox="0 0 10 8" width={10} height={8}>
          <path d="M1 4l3 3L9 1" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

function FilterPopup({
  impactFilter, hiddenCurrencies, anchorRect, onApply, onCancel,
}: {
  impactFilter: Set<Impact>; hiddenCurrencies: Set<string>;
  anchorRect: DOMRect | null;
  onApply: (impact: Set<Impact>, hidden: Set<string>) => void;
  onCancel: () => void;
}) {
  const [localImpact,setLocalImpact] = useState<Set<Impact>>(new Set(impactFilter));
  const [localHidden,setLocalHidden] = useState<Set<string>>(new Set(hiddenCurrencies));

  const toggleImp = (imp: Impact) => setLocalImpact(prev => { const n=new Set(prev); n.has(imp)?n.delete(imp):n.add(imp); return n; });
  const toggleCur = (cur: string) => setLocalHidden(prev => { const n=new Set(prev); n.has(cur)?n.delete(cur):n.add(cur); return n; });

  const style = useMemo(()=>{
    if (!anchorRect) return { top:200, left:100 };
    const pw=500, ph=460, ww=window.innerWidth, wh=window.innerHeight;
    let top=anchorRect.bottom+8; if (top+ph>wh-10) top=anchorRect.top-ph-8;
    let left=anchorRect.left; if (left+pw>ww-10) left=ww-pw-10; if (left<10) left=10;
    return { top, left };
  },[anchorRect]);

  return (
    <motion.div
      data-filter="true"
      initial={{ opacity:0, scale:0.97, y:-6 }} animate={{ opacity:1, scale:1, y:0 }}
      exit={{ opacity:0, scale:0.97, y:-6 }} transition={{ duration:0.15, ease:'easeOut' }}
      className="fixed z-[9999] overflow-hidden rounded-2xl border border-purple-100/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1e2035]"
      style={{ ...style, width:500 }}
      onClick={e=>e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-3">
        <SlidersHorizontal size={16} className="text-white/90"/>
        <h3 className="text-[14px] font-extrabold text-white tracking-tight">Filter Events</h3>
        <span className="ml-auto text-[11px] font-semibold text-white/60">เลือกแล้วกด Apply Filter</span>
      </div>

      {/* Body — 2 columns */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-white/8">

        {/* Left: Impact */}
        <div className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[12px] font-extrabold text-slate-700 dark:text-slate-200">Expected Impact</span>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <button onClick={()=>setLocalImpact(new Set(IMPACT_ORDER))} className="text-purple-500 hover:text-purple-700 underline">all</button>
              <span className="text-slate-300">,</span>
              <button onClick={()=>setLocalImpact(new Set())} className="text-purple-500 hover:text-purple-700 underline">none</button>
            </div>
          </div>
          <div className="space-y-0.5">
            {IMPACT_ORDER.map(imp=>{
              const checked=localImpact.has(imp);
              return (
                <label key={imp} onClick={()=>toggleImp(imp)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all ${checked?'bg-purple-50 dark:bg-purple-900/25':'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <Checkbox checked={checked}/>
                  <span className="h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ background:IMPACT_COLOR[imp] }}/>
                  <span className={`text-[12px] font-semibold ${checked?'text-slate-800 dark:text-slate-100':'text-slate-400 dark:text-slate-500'}`}>{imp}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Right: Currencies */}
        <div className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[12px] font-extrabold text-slate-700 dark:text-slate-200">Currencies</span>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <button onClick={()=>setLocalHidden(new Set())} className="text-purple-500 hover:text-purple-700 underline">all</button>
              <span className="text-slate-300">,</span>
              <button onClick={()=>setLocalHidden(new Set(ALL_FILTER_CURRENCIES))} className="text-purple-500 hover:text-purple-700 underline">none</button>
            </div>
          </div>
          <div className="space-y-0.5">
            {ALL_FILTER_CURRENCIES.map(cur=>{
              const checked=!localHidden.has(cur);
              return (
                <label key={cur} onClick={()=>toggleCur(cur)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all ${checked?'bg-purple-50 dark:bg-purple-900/25':'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <Checkbox checked={checked}/>
                  <FlagImg country={cur} size={22}/>
                  <span className={`text-[12px] font-semibold ${checked?'text-slate-800 dark:text-slate-100':'text-slate-400 dark:text-slate-500'}`}>{cur}</span>
                  <span className={`ml-auto text-[10px] font-medium ${checked?'text-slate-400 dark:text-slate-500':'text-slate-300 dark:text-slate-600'}`}>{CURRENCY_NAMES[cur]}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/8 bg-slate-50/70 dark:bg-white/3 px-4 py-3">
        <button
          onClick={()=>{ setLocalImpact(new Set(['High','Medium','Low'] as Impact[])); setLocalHidden(new Set()); }}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 underline transition">
          Remove Filter
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onCancel}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition">
            Cancel
          </button>
          <button onClick={()=>onApply(localImpact,localHidden)}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-1.5 text-[12px] font-extrabold text-white shadow-md shadow-purple-200 dark:shadow-purple-900/50 hover:from-purple-700 hover:to-violet-600 transition">
            Apply Filter
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Widget
// ═══════════════════════════════════════════════════════════════════════════
export default function ForexNewsWidget() {
  const defStart=addDays(startOfWeek(TODAY),1);
  const defEnd=addDays(defStart,4);
  const [startDate,setStartDate]=useState(defStart);
  const [endDate,setEndDate]=useState(defEnd);
  const [showPicker,setShowPicker]=useState(false);
  const [anchorRect,setAnchorRect]=useState<DOMRect|null>(null);
  const [impactFilter,setImpactFilter]=useState<Set<Impact>>(new Set(['High','Medium','Low']));
  const [searchQuery,setSearchQuery]=useState('');
  const [events,setEvents]=useState<ForexEvent[]>([]);
  const [loading,setLoading]=useState(true);
  const [dataSource,setDataSource]=useState<DataSource>('loading');
  const [expandedKey,setExpandedKey]=useState<string|null>(null);
  const [hiddenCurrencies,setHiddenCurrencies]=useState<Set<string>>(new Set<string>());
  const [showFilter,setShowFilter]=useState(false);
  const [filterAnchorRect,setFilterAnchorRect]=useState<DOMRect|null>(null);
  const btnRef=useRef<HTMLButtonElement>(null);
  const filterBtnRef=useRef<HTMLButtonElement>(null);

  useEffect(()=>{
    const fn=(e:MouseEvent)=>{
      const t=e.target as HTMLElement;
      if(showPicker&&!t.closest('[data-picker="true"]')&&!btnRef.current?.contains(t))setShowPicker(false);
      if(showFilter&&!t.closest('[data-filter="true"]')&&!filterBtnRef.current?.contains(t))setShowFilter(false);
    };
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[showPicker,showFilter]);

  const loadData=useCallback(async()=>{
    setLoading(true);setDataSource('loading');
    const{events:evts,source}=await fetchForexFactoryLive(startDate,endDate);
    setEvents(evts);setDataSource(source);setLoading(false);
  },[startDate,endDate]);
  useEffect(()=>{loadData();},[loadData]);

  const handleApply=useCallback((s:Date,e:Date)=>{setStartDate(s);setEndDate(e);setShowPicker(false);setExpandedKey(null);},[]);
  const handleFilterApply=useCallback((impact:Set<Impact>,hidden:Set<string>)=>{setImpactFilter(impact);setHiddenCurrencies(hidden);setShowFilter(false);},[]);
  const activeFilterCount=(3-(['High','Medium','Low'] as Impact[]).filter(i=>impactFilter.has(i)).length)+hiddenCurrencies.size;

  const filtered=useMemo(()=>{
    let list=events.filter(e=>impactFilter.has(e.impact)&&!hiddenCurrencies.has(e.country));
    if(searchQuery.trim()){const q=searchQuery.toLowerCase();list=list.filter(e=>e.title.toLowerCase().includes(q)||e.country.toLowerCase().includes(q)||(CURRENCY_NAMES[e.country]||'').toLowerCase().includes(q));}
    return list;
  },[events,impactFilter,hiddenCurrencies,searchQuery]);

  const groups=useMemo(()=>{
    const map=new Map<string,ForexEvent[]>();
    for(const e of filtered){const a=map.get(e.date)??[];a.push(e);map.set(e.date,a);}
    return map;
  },[filtered]);

  const highCount=filtered.filter(e=>e.impact==='High').length;
  const medCount=filtered.filter(e=>e.impact==='Medium').length;
  const lowCount=filtered.filter(e=>e.impact==='Low').length;
  const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  return (
    <div className="mt-6 space-y-3">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-purple-50 dark:border-white/10 bg-white dark:bg-[#181a2c] p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-md">
            <Globe size={20} color="#fff"/>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-extrabold text-slate-800">Forex Factory News</h2>
              {dataSource==='live'
                ?<span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700"><Wifi size={10}/> LIVE</span>
                :dataSource==='mock'
                ?<span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-500"><WifiOff size={10}/> DEMO</span>
                :null}
            </div>
            <p className="text-[11px] font-medium text-slate-400">Economic Calendar · คลิก <BarChart2 size={10} className="inline text-purple-400"/> เพื่อดูกราฟย้อนหลัง 1 ปี</p>
          </div>
          <div className="ml-auto">
            <button onClick={loadData} disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-100 bg-white text-purple-500 shadow-sm hover:bg-purple-50 disabled:opacity-40 transition">
              <RefreshCw size={13} className={loading?'animate-spin':''}/>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button ref={btnRef}
            onClick={()=>{if(showPicker){setShowPicker(false);return;}setAnchorRect(btnRef.current?.getBoundingClientRect()??null);setShowPicker(true);}}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-bold shadow-sm transition ${showPicker?'border-green-400 bg-green-50 text-green-700':'border-purple-100 bg-white text-purple-700 hover:bg-purple-50'}`}>
            <Calendar size={13}/>{fmtDisplay(startDate)} — {fmtDisplay(endDate)}
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-white/10"/>
          <button ref={filterBtnRef}
            onClick={()=>{if(showFilter){setShowFilter(false);return;}setFilterAnchorRect(filterBtnRef.current?.getBoundingClientRect()??null);setShowFilter(true);}}
            className={`relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-bold shadow-sm transition ${showFilter?'border-purple-400 bg-purple-600 text-white':'border-purple-100 bg-white text-purple-700 hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-purple-300'}`}>
            <SlidersHorizontal size={13}/>
            Filter
            {activeFilterCount>0&&(
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold ${showFilter?'bg-white text-purple-700':'bg-purple-600 text-white'}`}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative ml-auto">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300"/>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="ค้นหา event, USD, Euro…"
              className="h-8 w-48 rounded-lg border border-purple-100 bg-white pl-8 pr-7 text-[11px] font-semibold text-slate-700 outline-none focus:border-purple-300 placeholder:text-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-600"/>
            {searchQuery&&<button onClick={()=>setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition"><X size={11}/></button>}
          </div>
        </div>
      </div>

      {/* Picker + Filter popup */}
      <AnimatePresence>
        {showPicker&&(
          <div data-picker="true">
            <DateRangePopup selStart={startDate} selEnd={endDate} anchorRect={anchorRect} onApply={handleApply} onCancel={()=>setShowPicker(false)}/>
          </div>
        )}
        {showFilter&&(
          <FilterPopup
            impactFilter={impactFilter}
            hiddenCurrencies={hiddenCurrencies}
            anchorRect={filterAnchorRect}
            onApply={handleFilterApply}
            onCancel={()=>setShowFilter(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'High Impact',  count:highCount, icon:<Zap size={22} strokeWidth={2.5}/>,           grad:'from-rose-500 to-red-600',     shadow:'shadow-rose-200/70 dark:shadow-rose-900/50',   numCls:'text-rose-600 dark:text-rose-400',   desc:'หลีกเลี่ยงการเทรด ⚠️' },
          { label:'Medium Impact',count:medCount,  icon:<AlertTriangle size={22} strokeWidth={2.5}/>, grad:'from-orange-400 to-amber-500',  shadow:'shadow-orange-200/70 dark:shadow-orange-900/50',numCls:'text-orange-600 dark:text-orange-400',desc:'ระวังความผันผวน' },
          { label:'Low Impact',   count:lowCount,  icon:<Star size={22} strokeWidth={2.5}/>,          grad:'from-yellow-400 to-amber-400',  shadow:'shadow-yellow-200/50 dark:shadow-yellow-900/30', numCls:'text-yellow-600 dark:text-yellow-500',desc:'ผลกระทบต่ำ' },
        ].map(s=>(
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#181a2c] p-4 shadow-lg ${s.shadow}`}>
            <div className={`pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${s.grad} opacity-10 dark:opacity-20`}/>
            <div className="relative flex items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-md`}>{s.icon}</div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">{s.label}</div>
                <div className={`text-[32px] font-black leading-none tracking-tight ${s.numCls}`}>{s.count}</div>
                {s.count>0&&<div className="mt-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">{s.desc}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      {loading?(
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-purple-50 dark:border-white/10 bg-white dark:bg-[#181a2c] py-16 shadow-sm">
          <RefreshCw size={18} className="animate-spin text-purple-400"/>
          <span className="text-[13px] font-bold text-slate-400">Fetching Forex Factory data…</span>
        </div>
      ):filtered.length===0?(
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-purple-50 dark:border-white/10 bg-white dark:bg-[#181a2c] py-16 shadow-sm">
          <Globe size={32} className="text-slate-200"/>
          <span className="text-[13px] font-bold text-slate-400">No events found</span>
        </div>
      ):(
        <div className="overflow-hidden rounded-2xl border border-purple-50 dark:border-white/10 bg-white dark:bg-[#181a2c] shadow-sm">

          {/* Column headers — Graph icon column on the RIGHT */}
          <div className="grid border-b border-slate-100 dark:border-white/8 bg-slate-50/80 dark:bg-white/5" style={{gridTemplateColumns:COL}}>
            {['Time','Flag','Impact','Event','Actual','Forecast','Previous',''].map((h,idx)=>(
              <div key={idx} className={`px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ${idx===7?'flex items-center justify-center':''}`}>
                {idx===7 ? <BarChart2 size={12} className="text-slate-300"/> : h}
              </div>
            ))}
          </div>

          {Array.from(groups.entries()).map(([dateKey,dayEvents])=>{
            const d=new Date(dateKey+'T00:00:00');
            return (
              <div key={dateKey}>
                {/* Date group header */}
                <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-t border-purple-100/50 dark:border-white/8 bg-purple-50/90 dark:bg-purple-900/30 px-4 py-2 backdrop-blur-sm">
                  <Calendar size={12} className="text-purple-500"/>
                  <span className="text-[12px] font-extrabold text-purple-700 dark:text-purple-300">{DAY_NAMES[d.getDay()]}, {fmtDisplay(d)}</span>
                  <span className="ml-1 rounded-full bg-purple-200/60 dark:bg-purple-700/40 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300">{dayEvents.length} events</span>
                </div>

                <div className="divide-y divide-slate-50/80 dark:divide-white/5">
                  {dayEvents.map((ev,i)=>{
                    const cfg=IMPACT_CFG[ev.impact];
                    const isHigh=ev.impact==='High';
                    const hasActual=!!ev.actual;
                    const actualBetter=hasActual&&ev.forecast
                      ?parseFloat(ev.actual.replace(/[^0-9.-]/g,''))>parseFloat(ev.forecast.replace(/[^0-9.-]/g,''))
                      :null;
                    const rowKey=`${dateKey}__${i}`;
                    const isExpanded=expandedKey===rowKey;
                    const hasData=!!(ev.previous||ev.forecast);

                    return (
                      <div key={i}>
                        {/* Main row */}
                        <div
                          className={`group grid items-center transition-colors ${
                            isHigh
                              ? `border-l-[3px] border-rose-400 ${isExpanded?'bg-rose-50 dark:bg-rose-900/20':'bg-rose-50/60 dark:bg-rose-900/10'} hover:bg-rose-50/90 dark:hover:bg-rose-900/20`
                              : `${cfg.rowBg} ${isExpanded?'bg-purple-50/60 dark:bg-purple-500/5':''} hover:bg-purple-50/40 dark:hover:bg-white/5`
                          }`}
                          style={{gridTemplateColumns:COL}}
                        >
                          {/* Time */}
                          <div className="px-3 py-3">
                            <div className={`flex items-center gap-1 text-[11px] ${isHigh?'font-extrabold text-rose-500':'font-semibold text-slate-500'}`}>
                              <Clock size={10} className={isHigh?'text-rose-400':'text-slate-300'}/>{ev.time}
                            </div>
                          </div>
                          {/* Flag */}
                          <div className="px-2 py-3"><div className="flex items-center justify-center"><FlagImg country={ev.country} size={28}/></div></div>
                          {/* Impact */}
                          <div className="px-2 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-md border font-extrabold ${isHigh?'px-2 py-1 text-[10px] shadow-sm':'px-1.5 py-0.5 text-[9px]'} ${cfg.pillBg} ${cfg.pillText} ${cfg.border}`}>
                              {cfg.icon}{cfg.label}
                            </span>
                          </div>
                          {/* Event name */}
                          <div className="px-3 py-3 flex items-center gap-2">
                            {isHigh&&<span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-pulse"/>}
                            <span className={`text-[12px] leading-snug ${isHigh?'font-extrabold text-slate-800 dark:text-slate-100':'font-semibold text-slate-600 dark:text-slate-300'}`}>
                              {ev.title}
                            </span>
                          </div>
                          {/* Actual */}
                          <div className="px-3 py-3 text-right">
                            {hasActual
                              ?<span className={`text-[12px] font-extrabold ${actualBetter===true?'text-emerald-600':actualBetter===false?'text-rose-500':'text-slate-700'}`}>{ev.actual}</span>
                              :<span className="text-[12px] text-slate-300">—</span>}
                          </div>
                          {/* Forecast */}
                          <div className="px-3 py-3 text-right">
                            <span className="text-[12px] font-semibold text-slate-500">{ev.forecast||'—'}</span>
                          </div>
                          {/* Previous */}
                          <div className="px-3 py-3 text-right">
                            <span className="text-[12px] font-semibold text-slate-400">{ev.previous||'—'}</span>
                          </div>

                          {/* Graph icon — RIGHT side, after Previous */}
                          <div className="flex items-center justify-center px-2 py-3">
                            {hasData?(
                              <button
                                onClick={()=>setExpandedKey(prev=>prev===rowKey?null:rowKey)}
                                title={isExpanded?'Hide chart':'View historical chart'}
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                                  isExpanded
                                    ? 'bg-purple-600 text-white shadow-md scale-105'
                                    : 'bg-slate-100 text-slate-400 hover:bg-purple-100 hover:text-purple-600 hover:scale-105'
                                }`}>
                                <BarChart2 size={13}/>
                              </button>
                            ):<span className="h-7 w-7"/>}
                          </div>
                        </div>

                        {/* Chart panel — opens BELOW the row */}
                        <AnimatePresence>
                          {isExpanded&&(
                            <EventChartPanel key={rowKey} ev={ev} onHide={()=>setExpandedKey(null)}/>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 pb-2 text-[10px] font-semibold text-slate-400">
        <Globe size={11}/>
        Forex Factory Economic Calendar · {dataSource==='live'?'🟢 Live — nfs.faireconomy.media':'🟡 Demo data (API unavailable)'} · เวลาไทย (ICT, UTC+7)
      </div>
    </div>
  );
}
