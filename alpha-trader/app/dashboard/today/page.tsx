'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import { CheckCircle2, Circle, Plus, Trash2, ArrowUpRight } from 'lucide-react';
import IconGlyph from '@/components/IconGlyph';

const catLinks: Record<string, { href: string; label: string }> = {
  Trading:  { href: '/dashboard/trading',                 label: 'เปิด Trading Journal' },
  Health:   { href: '/dashboard/health',                  label: 'เปิด Health & Habits' },
  Learning: { href: '/dashboard/learning',                label: 'เปิด Learning' },
  Review:   { href: '/dashboard/trading?tab=review',      label: 'เปิด Weekly Review' },
};

const TASKS_KEY = 'alpha_today_tasks';
const CHECKIN_KEY = 'alpha_today_checkin';

const initial = [
  { id:1, text:'ตรวจสอบ Macro & News ก่อน Session', done:true, cat:'Trading' },
  { id:2, text:'ทบทวน Backtest ของ ICT Silver Bullet', done:true, cat:'Trading' },
  { id:3, text:'บันทึก Journal ของเมื่อวาน', done:false, cat:'Trading' },
  { id:4, text:'ออกกำลังกาย 30 นาที', done:false, cat:'Health' },
  { id:5, text:'อ่านหนังสือ 20 หน้า', done:false, cat:'Learning' },
  { id:6, text:'ตรวจสอบ P&L รายวัน', done:false, cat:'Review' },
];

const catColors: Record<string,string> = { Trading:'#7c5cbf', Health:'#10b981', Learning:'#38bdf8', Review:'#f97316' };

function loadTasks() {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return initial;
}

function loadCheckin() {
  if (typeof window === 'undefined') return { mood: '', energy: '', note: '' };
  try {
    const raw = localStorage.getItem(CHECKIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { mood: '', energy: '', note: '' };
}

export default function TodayPage() {
  const [tasks, setTasks] = useState(initial);
  const [newTask, setNewTask] = useState('');
  const [cat, setCat] = useState('Trading');
  const [checkin, setCheckin] = useState({ mood: '', energy: '', note: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    setTasks(loadTasks());
    setCheckin(loadCheckin());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  function saveCheckin(updated: typeof checkin) {
    setCheckin(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(updated));
    }
  }

  function toggle(id: number) {
    setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x));
  }
  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(t=>[...t,{id:Date.now(),text:newTask,done:false,cat}]);
    setNewTask('');
  }
  function remove(id: number) {
    setTasks(t=>t.filter(x=>x.id!==id));
  }
  const done = tasks.filter(t=>t.done).length;
  const total = tasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TopBar title="Today" subtitle="วางแผนและติดตามงานประจำวัน"/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Progress */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-gray-800">Daily Progress</div>
              <span className="text-purple-700 font-bold text-sm">{done}/{total}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-3">
              <div className="bg-purple-500 h-3 rounded-full transition-all" style={{width:`${total?done/total*100:0}%`}}/>
            </div>
            <div className="text-xs text-gray-400 mt-1">{total>0?Math.round(done/total*100):0}% เสร็จแล้ว</div>
          </div>
          {/* Tasks */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">Tasks วันนี้</div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
              {tasks.map((t, idx)=>{
                const link = catLinks[t.cat];
                return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut', delay: idx * 0.02 }}
                  whileHover={{ y: -1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition group ${t.done?'bg-gray-50 border-gray-100 opacity-60':'bg-white border-gray-100 hover:border-purple-200'}`}
                >
                  <button onClick={()=>toggle(t.id)}>
                    {t.done?<CheckCircle2 size={18} className="text-purple-500"/>:<Circle size={18} className="text-gray-300 hover:text-purple-400 transition"/>}
                  </button>
                  <span className={`flex-1 text-sm ${t.done?'line-through text-gray-400':'text-gray-700'}`}>{t.text}</span>
                  {link ? (
                    <Link href={link.href} title={link.label}>
                      <motion.span
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer ring-1 ring-transparent hover:ring-current/30"
                        style={{background:catColors[t.cat]+'20',color:catColors[t.cat]}}
                      >
                        {t.cat}
                        <ArrowUpRight size={10} strokeWidth={2.5} />
                      </motion.span>
                    </Link>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{background:catColors[t.cat]+'20',color:catColors[t.cat]}}>
                      {t.cat}
                    </span>
                  )}
                  <button onClick={()=>remove(t.id)} className="opacity-0 group-hover:opacity-100 transition text-red-300 hover:text-red-500">
                    <Trash2 size={14}/>
                  </button>
                </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
            {/* Add task */}
            <form onSubmit={add} className="mt-3 flex gap-2">
              <input value={newTask} onChange={e=>setNewTask(e.target.value)}
                placeholder="เพิ่มงานใหม่..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400"/>
              <select value={cat} onChange={e=>setCat(e.target.value)}
                className="px-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none">
                {Object.keys(catColors).map(c=><option key={c}>{c}</option>)}
              </select>
              <button type="submit" className="w-9 h-9 flex items-center justify-center rounded-xl text-white"
                style={{background:'linear-gradient(135deg,#7c5cbf,#a78bfa)'}}>
                <Plus size={16}/>
              </button>
            </form>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="font-semibold text-gray-800 mb-3">Daily Check-in</div>
            <div className="space-y-3">
              {[
                { key:'mood' as const, label:'Mood วันนี้', options:[['mood','Good'],['neutral','Neutral'],['lowMood','Low'],['momentum','Driven'],['tired','Tired']] },
                { key:'energy' as const, label:'Energy Level', options:[['energy','High'],['chart','Medium'],['sleep','Low']] },
              ].map(s=>(
                <div key={s.label}>
                  <div className="text-xs text-gray-500 mb-1.5">{s.label}</div>
                  <div className="flex gap-2 flex-wrap">
                    {s.options.map(([token, label])=>(
                      <button key={label}
                        onClick={()=>saveCheckin({...checkin,[s.key]:checkin[s.key]===label?'':label})}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${checkin[s.key]===label?'border-purple-400 bg-purple-100 text-purple-700':'border-purple-100 text-gray-600 hover:border-purple-300 hover:bg-purple-50'}`}>
                        <IconGlyph token={token} size={13} /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea value={checkin.note}
                onChange={e=>saveCheckin({...checkin,note:e.target.value})}
                placeholder="โน้ตประจำวัน..."
                rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-400 resize-none"/>
              <button onClick={()=>showToast('บันทึก Check-in แล้ว ✓')}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{background:'linear-gradient(135deg,#7c5cbf,#a78bfa)'}}>
                บันทึก Check-in
              </button>
            </div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
            <div className="font-semibold text-purple-700 text-sm mb-2">Trading Session Today</div>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between"><span>London Session</span><span className="text-green-500">08:00 – 16:00</span></div>
              <div className="flex justify-between"><span>New York Session</span><span className="text-blue-500">16:00 – 00:00</span></div>
              <div className="flex justify-between"><span>News High Impact</span><span className="text-red-400">14:30 UTC</span></div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium z-50 flex items-center gap-2"
          >
            <CheckCircle2 size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
