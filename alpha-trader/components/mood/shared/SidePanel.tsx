'use client';
import { motion } from 'framer-motion';
import { cardEntrance, rowStagger, rowEntrance } from '@/lib/animations';
import type { FillInItem, MotionNote } from '@/types/mood-journal';

/* ── "What to Fill In" panel ── */
export function FillInPanel({
  items, title = 'What to Fill In', headerGradient = ['#7c5cbf', '#a78bfa'],
}: { items: FillInItem[]; title?: string; headerGradient?: [string, string] }) {
  return (
    <motion.div variants={cardEntrance}
      className="bg-white dark:bg-[#181a2c] rounded-2xl border border-purple-50 dark:border-white/8 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2"
        style={{ background: `linear-gradient(135deg,${headerGradient[0]},${headerGradient[1]})` }}>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <motion.ul variants={rowStagger} initial="hidden" animate="visible" className="p-4 space-y-3">
        {items.map(it => (
          <motion.li key={it.label} variants={rowEntrance} whileHover={{ x: 3 }}
            className="flex items-start gap-2.5 cursor-pointer group">
            <span className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">{it.label}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{it.desc}</div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

/* ── Motion / Interaction notes panel ── */
export function MotionNotesPanel({
  notes, title = 'Motion Notes', headerGradient = ['#f97316', '#fbbf24'],
}: { notes: MotionNote[]; title?: string; headerGradient?: [string, string] }) {
  return (
    <motion.div variants={cardEntrance}
      className="bg-white dark:bg-[#181a2c] rounded-2xl border border-orange-50 dark:border-white/8 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2"
        style={{ background: `linear-gradient(135deg,${headerGradient[0]},${headerGradient[1]})` }}>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <motion.ul variants={rowStagger} initial="hidden" animate="visible" className="p-4 space-y-3">
        {notes.map(n => (
          <motion.li key={n.title} variants={rowEntrance} whileHover={{ x: 3 }}
            className="flex items-start gap-2.5">
            <span className="mt-1 h-2 w-2 rounded-full bg-orange-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-gray-700">{n.title}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{n.desc}</div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
