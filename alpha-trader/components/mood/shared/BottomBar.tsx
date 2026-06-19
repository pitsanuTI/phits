'use client';
import { motion } from 'framer-motion';
import { Trash2, Sparkles } from 'lucide-react';

interface Props {
  saveLabel: string;
  onClear: () => void;
  onSave: () => void;
}

export default function BottomBar({ saveLabel, onClear, onSave }: Props) {
  return (
    <div className="flex items-center justify-end gap-3 pt-1">
      <motion.button
        onClick={onClear}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
        className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:text-red-500 transition"
      >
        <Trash2 size={13} /> Clear All
      </motion.button>
      <motion.button
        onClick={onSave}
        whileHover={{ scale: 1.03, boxShadow: '0 4px 18px rgba(124,92,191,0.3)' }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-1.5 px-5 py-2 text-[12px] font-semibold text-white rounded-xl"
        style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)' }}
      >
        <Sparkles size={13} /> {saveLabel}
      </motion.button>
    </div>
  );
}
