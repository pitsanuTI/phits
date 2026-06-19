'use client';

import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import HabitHealthLab from '@/components/health/HabitHealthLab';

export default function HealthPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TopBar title="Health & Habits" subtitle="ดูภาพรวมสุขภาพและนิสัยประจำวันให้ต่อเนื่องแบบเข้าใจง่าย" />
      <HabitHealthLab />
    </motion.div>
  );
}
