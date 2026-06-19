'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Samsung } from '@thesvg/react';
import TopBar from '@/components/TopBar';
const ThailandManpowerMap = dynamic(() => import('@/components/manpower/ThailandManpowerMap'), { ssr: false });
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle2, Clock, Users, Package, MapPin,
  Smartphone, Wrench, FileText, TrendingUp, AlertTriangle,
  Search, Plus, Filter, Star, ChevronRight,
  Tag, Award, Activity, Eye, Edit3, Download,
  ArrowUp, ArrowDown, Circle, BarChart3, Zap, Layers,
  Flame, Minus, BookOpen, Briefcase, Bell, X, Check, Trash2,
  Globe, Mountain, Building2, Umbrella, Leaf, Anchor, TreePine, UserCog,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts';
import { useEscClose } from '@/lib/useEscClose';

// ── Tabs ──────────────────────────────────────────────────────────────
const TABS = [
  'Overall', 'Tasks', 'Estimator', 'Part Price DOT',
  'Part Price Retail', 'Product', 'Manpower', 'Samsung Members',
  'PLM Status', 'Projects & Timeline',
] as const;
type WorkTab = (typeof TABS)[number];

// ── Animation helpers ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

// ── Mock data ─────────────────────────────────────────────────────────
const OVERALL_KPI = [
  { label: 'Daily Progress',   value: '76%', sub: 'Today', tone: 'from-violet-400 to-purple-500', ring: '#a78bfa' },
  { label: 'Weekly Progress',  value: '68%', sub: 'This week', tone: 'from-sky-400 to-blue-500', ring: '#38bdf8' },
  { label: 'Monthly Progress', value: '72%', sub: 'May 2025', tone: 'from-emerald-400 to-teal-500', ring: '#10b981' },
];

const CALENDAR_EVENTS = [
  { day: 5, title: 'New Repair', tone: 'from-violet-400 to-purple-500' },
  { day: 8, title: 'Stock Check', tone: 'from-sky-400 to-blue-500' },
  { day: 12, title: 'Team Sync', tone: 'from-emerald-400 to-teal-500' },
  { day: 15, title: 'Service Day', tone: 'from-orange-400 to-pink-500' },
  { day: 18, title: 'Inspection', tone: 'from-rose-400 to-fuchsia-500' },
  { day: 22, title: 'Training', tone: 'from-amber-400 to-orange-500' },
  { day: 25, title: 'Audit', tone: 'from-purple-400 to-indigo-500' },
];

const TASK_TREND = [
  { d: '1', v: 22 }, { d: '5', v: 35 }, { d: '10', v: 48 },
  { d: '15', v: 56 }, { d: '20', v: 64 }, { d: '25', v: 75 }, { d: '30', v: 88 },
];

const COMPLETION_BY_CAT = [
  { name: 'Repair',   value: 35, color: '#a78bfa' },
  { name: 'Stock',    value: 25, color: '#10b981' },
  { name: 'Service',  value: 22, color: '#38bdf8' },
  { name: 'Reports',  value: 18, color: '#f59e0b' },
];

const UPCOMING_DEADLINES = [
  { name: 'PLM Quarterly Plan', isoDate: '2026-06-16', tag: 'PLM'    },
  { name: 'Part Price Refresh',  isoDate: '2026-06-20', tag: 'Stock'  },
  { name: 'Samsung Report',      isoDate: '2026-06-25', tag: 'Report' },
  { name: 'Team Performance',    isoDate: '2026-06-30', tag: 'HR'     },
];

const CRUCIAL_TASKS_DATA = [
  { title: 'Practice SO Product Roadmap',  priority: 'High', deadline: '2026-06-15', status: 'In Progress', owner: 'PM Team',  tag: 'PLM',    color: 'rose',    desc: 'Review and present the full SO product roadmap for Q2. Coordinate with HQ and local PM teams.' },
  { title: 'Review SOP New Update',        priority: 'High', deadline: '2026-06-18', status: 'On Track',    owner: 'Lead',     tag: 'Ops',    color: 'orange',  desc: 'Review updated Standard Operating Procedures for the service team. Identify gaps and update workflows.' },
  { title: 'Samsung Members Cluster Plan', priority: 'Med',  deadline: '2026-06-25', status: 'Planned',     owner: 'Ops',      tag: 'Members',color: 'emerald', desc: 'Plan regional cluster activities for Samsung Members program. Define targets and engagement metrics.' },
  { title: 'Q2 KPI Final Report',          priority: 'High', deadline: '2026-06-30', status: 'Planned',     owner: 'PM',       tag: 'Report', color: 'sky',     desc: 'Compile Q2 performance indicators and submit final report to HQ. Include regional breakdown.' },
];

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function daysLeftFromDeadline(deadline: string): number | null {
  if (!deadline) return null;
  try { return daysUntil(deadline); } catch { return null; }
}

function taskInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  try { return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso; }
}

const TASK_GROUPS = ['PLM', 'Quality', 'Training', 'Ops', 'HR', 'Report', 'Samsung Members', 'Ad hoc', 'Other'];

const TASKS_LIST = [
  { name: 'Practice SO Product Roadmap', description: 'จัดทำ roadmap สินค้า SO และเตรียมเอกสารนำเสนอต่อทีม PLM', status: 'In Progress', priority: 'High', startDate: '2026-06-01', deadline: '2026-06-28', people: 3, members: 'Alice T, Bob K, Charlie R', group: 'PLM',            progress: 50 },
  { name: 'Review SOP New Update',       description: 'ทบทวนและอัปเดต SOP ฉบับใหม่ให้ครอบคลุมทุก process', status: 'On Track',    priority: 'High', startDate: '2026-06-05', deadline: '2026-06-30', people: 2, members: 'David M, Eve S',            group: 'Quality',         progress: 100 },
  { name: 'Manpower Plan',               description: 'วางแผนกำลังคนประจำไตรมาส Q3 ตามเป้าหมาย headcount', status: 'In Progress', priority: 'Med',  startDate: '2026-06-10', deadline: '2026-07-02', people: 4, members: 'Frank L, Grace P, Henry W, Ivy N', group: 'HR',         progress: 40 },
  { name: 'Samsung Members Cluster',     description: 'จัดกลุ่มลูกค้า Samsung Members และวิเคราะห์ cluster', status: 'Planned',     priority: 'Med',  startDate: '2026-06-15', deadline: '2026-07-05', people: 3, members: 'Jack O, Karen B, Leo T',    group: 'Samsung Members', progress: 10 },
  { name: 'Projects & Timeline',         description: 'รวบรวม project ทั้งหมดและจัดทำ Gantt chart ภาพรวม', status: 'On Track',    priority: 'High', startDate: '2026-06-08', deadline: '2026-07-08', people: 5, members: 'Mike C, Nancy D, Oscar E, Pat F, Quinn G', group: 'PLM', progress: 100 },
];

const KANBAN = {
  'In Progress': ['Practice SO Product', 'Review SOP Update', 'Manpower Plan'],
  'Planned':      ['Samsung Members', 'Audit Cycle'],
  'On Track':     ['Quarterly Review', 'Stock Refresh'],
  'Done':         ['Daily Report'],
};

// ── Work Calendar Events ──────────────────────────────────────────────
type WEventPriority = 'High' | 'Medium' | 'Low';
type WEventCategory = 'meeting' | 'task' | 'review' | 'training' | 'report' | 'focus' | 'travel' | 'reminder' | 'personal' | 'event';

// ── Event gradient color palette – 16 pill-bar gradient colors (2×8 grid) ─────
const EVENT_COLORS = [
  { id: 'violet',  label: 'Violet',   g: 'linear-gradient(90deg,#8b5cf6,#5b21b6)', tw: '#8b5cf6' },
  { id: 'fuchsia', label: 'Fuchsia',  g: 'linear-gradient(90deg,#e879f9,#86198f)', tw: '#e879f9' },
  { id: 'pink',    label: 'Pink',     g: 'linear-gradient(90deg,#ec4899,#9d174d)', tw: '#ec4899' },
  { id: 'rose',    label: 'Rose',     g: 'linear-gradient(90deg,#f43f5e,#9f1239)', tw: '#f43f5e' },
  { id: 'orange',  label: 'Orange',   g: 'linear-gradient(90deg,#fb923c,#c2410c)', tw: '#fb923c' },
  { id: 'amber',   label: 'Amber',    g: 'linear-gradient(90deg,#fbbf24,#d97706)', tw: '#fbbf24' },
  { id: 'green',   label: 'Green',    g: 'linear-gradient(90deg,#4ade80,#16a34a)', tw: '#4ade80' },
  { id: 'emerald', label: 'Emerald',  g: 'linear-gradient(90deg,#34d399,#065f46)', tw: '#34d399' },
  { id: 'teal',    label: 'Teal',     g: 'linear-gradient(90deg,#2dd4bf,#0f766e)', tw: '#2dd4bf' },
  { id: 'sky',     label: 'Sky',      g: 'linear-gradient(90deg,#38bdf8,#0284c7)', tw: '#38bdf8' },
  { id: 'blue',    label: 'Blue',     g: 'linear-gradient(90deg,#60a5fa,#1d4ed8)', tw: '#60a5fa' },
  { id: 'indigo',  label: 'Indigo',   g: 'linear-gradient(90deg,#818cf8,#3730a3)', tw: '#818cf8' },
  { id: 'purple',  label: 'Purple',   g: 'linear-gradient(90deg,#a855f7,#7e22ce)', tw: '#a855f7' },
  { id: 'red',     label: 'Red',      g: 'linear-gradient(90deg,#f87171,#b91c1c)', tw: '#f87171' },
  { id: 'lime',    label: 'Lime',     g: 'linear-gradient(90deg,#a3e635,#65a30d)', tw: '#a3e635' },
  { id: 'slate',   label: 'Slate',    g: 'linear-gradient(90deg,#94a3b8,#475569)', tw: '#94a3b8' },
] as const;
type EventColorId = typeof EVENT_COLORS[number]['id'];
const getEventColor = (colorId?: string) =>
  EVENT_COLORS.find(c => c.id === colorId)?.g ?? EVENT_COLORS[0].g;

interface WorkEvent {
  id: string;
  date: string;
  endDate?: string;
  colorId?: EventColorId;
  subject: string;
  priority: WEventPriority;
  category: WEventCategory | string; // allows custom categories
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
  note?: string;
  notifyMobile?: boolean;
}

const WORK_EVENTS_MOCK: WorkEvent[] = [
  // June 2026 – multi-day
  { id: 'w1',  date: '2026-06-02', endDate: '2026-06-02', subject: 'Daily Stand-up',            priority: 'High',   category: 'meeting',   startTime: '09:00', endTime: '09:30' },
  { id: 'w2',  date: '2026-06-02', endDate: '2026-06-03', subject: 'Review SOP New Update',     priority: 'High',   category: 'task',      startTime: '10:00', endTime: '11:30', note: 'ต้องส่งก่อน 12:00' },
  { id: 'w3',  date: '2026-06-02', endDate: '2026-06-02', subject: 'Lunch & Learn – PLM',       priority: 'Low',    category: 'training',  startTime: '12:00', endTime: '13:00' },
  { id: 'w4',  date: '2026-06-03', endDate: '2026-06-03', subject: 'Samsung Report Deadline',   priority: 'High',   category: 'report',    allDay: true, note: 'ส่ง PDF ให้ HQ' },
  { id: 'w5',  date: '2026-06-03', endDate: '2026-06-03', subject: 'Team Weekly Sync',          priority: 'Medium', category: 'meeting',   startTime: '14:00', endTime: '15:00' },
  { id: 'w6',  date: '2026-06-04', endDate: '2026-06-06', subject: 'Stock Audit – Central',     priority: 'High',   category: 'task',      startTime: '08:00', endTime: '12:00' },
  { id: 'w7',  date: '2026-06-04', endDate: '2026-06-04', subject: 'Manpower Plan Review',      priority: 'Medium', category: 'meeting',   startTime: '14:00', endTime: '15:30' },
  { id: 'w8',  date: '2026-06-05', endDate: '2026-06-05', subject: 'PLM Phase Kickoff',         priority: 'High',   category: 'meeting',   startTime: '10:00', endTime: '11:30' },
  { id: 'w9',  date: '2026-06-05', endDate: '2026-06-05', subject: 'Part Price DOT – Q2',       priority: 'Medium', category: 'task',      startTime: '14:00', endTime: '15:00' },
  { id: 'w10', date: '2026-06-06', endDate: '2026-06-06', subject: 'Service Center Inspection', priority: 'High',   category: 'task',      startTime: '09:00', endTime: '12:00' },
  { id: 'w11', date: '2026-06-06', endDate: '2026-06-07', subject: 'Technician Training',       priority: 'Medium', category: 'training',  startTime: '13:00', endTime: '17:00' },
  { id: 'w12', date: '2026-06-09', endDate: '2026-06-09', subject: 'Monthly KPI Report Due',    priority: 'High',   category: 'report',    allDay: true },
  { id: 'w13', date: '2026-06-09', endDate: '2026-06-10', subject: 'Team Performance Review',   priority: 'High',   category: 'meeting',   startTime: '10:00', endTime: '12:00' },
  { id: 'w14', date: '2026-06-09', endDate: '2026-06-09', subject: 'Update Parts DB',           priority: 'Low',    category: 'reminder',  startTime: '09:00' },
  { id: 'w15', date: '2026-06-10', endDate: '2026-06-11', subject: 'Q2 Strategy Planning',      priority: 'High',   category: 'meeting',   startTime: '09:00', endTime: '11:00' },
  { id: 'w16', date: '2026-06-10', endDate: '2026-06-10', subject: 'WFH Day',                   priority: 'Low',    category: 'personal',  allDay: true },
  { id: 'w17', date: '2026-06-11', endDate: '2026-06-11', subject: 'Samsung Members Call',      priority: 'Medium', category: 'meeting',   startTime: '11:00', endTime: '12:00' },
  { id: 'w18', date: '2026-06-11', endDate: '2026-06-13', subject: 'SOP Refresh Q2',            priority: 'High',   category: 'task',      startTime: '14:00', endTime: '15:30', note: 'เตรียม deck' },
  { id: 'w19', date: '2026-06-12', endDate: '2026-06-12', subject: 'Repair Workflow Training',  priority: 'Medium', category: 'training',  startTime: '09:00', endTime: '12:00' },
  { id: 'w20', date: '2026-06-13', endDate: '2026-06-13', subject: 'End-of-Week Report',        priority: 'Medium', category: 'task',      startTime: '16:00', endTime: '17:00' },
  // May 2026
  { id: 'w21', date: '2026-05-28', endDate: '2026-05-28', subject: 'PLM Quarterly Deadline',    priority: 'High',   category: 'report',    allDay: true },
  { id: 'w22', date: '2026-05-28', endDate: '2026-05-29', subject: 'Exec Review Meeting',       priority: 'High',   category: 'meeting',   startTime: '14:00', endTime: '16:00' },
  { id: 'w23', date: '2026-05-29', endDate: '2026-05-31', subject: 'Galaxy A56 Pre-launch',     priority: 'Medium', category: 'task',      startTime: '10:00', endTime: '12:00' },
  { id: 'w24', date: '2026-05-30', endDate: '2026-05-30', subject: 'Part Price Refresh',        priority: 'High',   category: 'report',    allDay: true },
  { id: 'w25', date: '2026-05-30', endDate: '2026-05-30', subject: 'Farewell Lunch',            priority: 'Low',    category: 'personal',  startTime: '12:00', endTime: '13:00' },
];

function loadWorkEvents(): WorkEvent[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('work-cal-events') || '[]'); } catch { return []; }
}

// ── Thai Public Holidays 2026 ─────────────────────────────────────────
const THAI_HOLIDAYS: Record<string, string> = {
  // ── 2025 ──────────────────────────────────────────
  '2025-01-01': 'วันขึ้นปีใหม่',
  '2025-02-12': 'วันมาฆบูชา',
  '2025-04-06': 'วันจักรีฯ',
  '2025-04-07': 'ชดเชยวันจักรีฯ',
  '2025-04-13': 'วันสงกรานต์',
  '2025-04-14': 'วันสงกรานต์',
  '2025-04-15': 'วันสงกรานต์',
  '2025-05-01': 'วันแรงงานแห่งชาติ',
  '2025-05-04': 'วันฉัตรมงคล',
  '2025-05-12': 'วันวิสาขบูชา',
  '2025-06-03': 'วันเฉลิมพระชนมพรรษา ราชินี',
  '2025-07-10': 'วันอาสาฬหบูชา',
  '2025-07-11': 'วันเข้าพรรษา',
  '2025-07-28': 'วันเฉลิมพระชนมพรรษา ร.10',
  '2025-08-12': 'วันแม่แห่งชาติ',
  '2025-10-13': 'วันนวมินทรมหาราช',
  '2025-10-23': 'วันปิยมหาราช',
  '2025-12-05': 'วันพ่อแห่งชาติ',
  '2025-12-10': 'วันรัฐธรรมนูญ',
  '2025-12-31': 'วันสิ้นปี',
  // ── 2026 ──────────────────────────────────────────
  '2026-01-01': 'วันขึ้นปีใหม่',
  '2026-03-04': 'วันมาฆบูชา',
  '2026-04-06': 'วันจักรีฯ',
  '2026-04-13': 'วันสงกรานต์',
  '2026-04-14': 'วันสงกรานต์',
  '2026-04-15': 'วันสงกรานต์',
  '2026-05-01': 'วันแรงงานแห่งชาติ',
  '2026-05-04': 'วันฉัตรมงคล',
  '2026-05-22': 'วันวิสาขบูชา',
  '2026-06-03': 'วันเฉลิมพระชนมพรรษา ราชินี',
  '2026-07-09': 'วันอาสาฬหบูชา',
  '2026-07-10': 'วันเข้าพรรษา',
  '2026-07-28': 'วันเฉลิมพระชนมพรรษา ร.10',
  '2026-08-12': 'วันแม่แห่งชาติ',
  '2026-10-13': 'วันนวมินทรมหาราช',
  '2026-10-23': 'วันปิยมหาราช',
  '2026-12-05': 'วันพ่อแห่งชาติ',
  '2026-12-10': 'วันรัฐธรรมนูญ',
  '2026-12-31': 'วันสิ้นปี',
};

const WEVENT_PRIORITY: Record<WEventPriority, { label: string; icon: React.ReactNode; dot: string; badge: string }> = {
  High:   { label: 'สูง',   icon: <Flame size={9} />,  dot: 'bg-rose-500',  badge: 'bg-rose-100 text-rose-600' },
  Medium: { label: 'กลาง', icon: <Star  size={9} />,  dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-600' },
  Low:    { label: 'ต่ำ',  icon: <Minus size={9} />,  dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500' },
};

const WEVENT_CAT: Record<WEventCategory, { label: string; icon: React.ReactNode; bar: string; bg: string; chip: string; defaultColor: string }> = {
  meeting:  { label: 'Meeting',  icon: <Users        size={10} />, bar: 'bg-violet-500',  bg: 'bg-violet-50',  chip: 'bg-violet-100 text-violet-700',   defaultColor: 'violet'  },
  task:     { label: 'Task',     icon: <CheckCircle2 size={10} />, bar: 'bg-sky-500',     bg: 'bg-sky-50',     chip: 'bg-sky-100 text-sky-700',         defaultColor: 'sky'     },
  review:   { label: 'Review',   icon: <Eye          size={10} />, bar: 'bg-indigo-500',  bg: 'bg-indigo-50',  chip: 'bg-indigo-100 text-indigo-700',   defaultColor: 'indigo'  },
  training: { label: 'Training', icon: <BookOpen     size={10} />, bar: 'bg-emerald-500', bg: 'bg-emerald-50', chip: 'bg-emerald-100 text-emerald-700', defaultColor: 'emerald' },
  report:   { label: 'Report',   icon: <FileText     size={10} />, bar: 'bg-amber-500',   bg: 'bg-amber-50',   chip: 'bg-amber-100 text-amber-700',     defaultColor: 'amber'   },
  focus:    { label: 'Focus',    icon: <Zap          size={10} />, bar: 'bg-purple-500',  bg: 'bg-purple-50',  chip: 'bg-purple-100 text-purple-700',   defaultColor: 'purple'  },
  travel:   { label: 'Travel',   icon: <MapPin       size={10} />, bar: 'bg-teal-500',    bg: 'bg-teal-50',    chip: 'bg-teal-100 text-teal-700',       defaultColor: 'teal'    },
  reminder: { label: 'Reminder', icon: <Bell         size={10} />, bar: 'bg-orange-500',  bg: 'bg-orange-50',  chip: 'bg-orange-100 text-orange-700',   defaultColor: 'orange'  },
  personal: { label: 'Personal', icon: <Briefcase    size={10} />, bar: 'bg-pink-500',    bg: 'bg-pink-50',    chip: 'bg-pink-100 text-pink-700',       defaultColor: 'pink'    },
  event:    { label: 'Event',    icon: <Star         size={10} />, bar: 'bg-fuchsia-500', bg: 'bg-fuchsia-50', chip: 'bg-fuchsia-100 text-fuchsia-700', defaultColor: 'fuchsia' },
};
// Fallback for custom categories
const FALLBACK_CAT = { label: 'Custom', icon: <span>📌</span>, bar: 'bg-slate-500', bg: 'bg-slate-50', chip: 'bg-slate-100 text-slate-700', defaultColor: 'slate' };
const getCat = (cat: string) => WEVENT_CAT[cat as WEventCategory] ?? FALLBACK_CAT;

const BLANK_WEVENT = { subject: '', priority: 'Medium' as WEventPriority, category: 'meeting' as WEventCategory | string, allDay: false, startTime: '09:00', endTime: '10:00', endDate: '', note: '', colorId: 'violet' as EventColorId, notifyMobile: false, newCatLabel: '', newCatIcon: '📌' };

const REPAIR_PARTS = [
  { name: 'Display Assembly',        price: 8500,  qty: 1, total: 8500 },
  { name: 'Front Camera Adhesive',   price: 250,   qty: 1, total: 250 },
  { name: 'Heat Dissipation Sheet',  price: 380,   qty: 1, total: 380 },
  { name: 'Service Pack',            price: 1200,  qty: 1, total: 1200 },
];

const SYMPTOMS = [
  { name: 'Screen Crack',       count: 47864, pct: 38 },
  { name: 'Battery Issue',      count: 28430, pct: 22 },
  { name: 'Charging Port',      count: 18250, pct: 14 },
  { name: 'Speaker Failure',    count: 12180, pct: 10 },
  { name: 'Software Crash',     count: 9870,  pct: 8  },
  { name: 'Camera Module',      count: 7100,  pct: 8  },
];

const COMMON_MODELS = [
  { name: 'A35',         value: 33.6 },
  { name: 'A25',         value: 26.5 },
  { name: 'S24 Ultra',   value: 18.6 },
  { name: 'S24+',        value: 12.5 },
  { name: 'Tab S9',      value: 8.8 },
];

const PARTS_TABLE = [
  { model: 'A25', cat: 'Display', name: 'Display Assembly',     code: 'GH82-31234A', price: '฿8,500.00', updated: 'May 18, 2025' },
  { model: 'A25', cat: 'Battery', name: 'Battery Pack',          code: 'GH82-31235B', price: '฿1,250.00', updated: 'May 18, 2025' },
  { model: 'A25', cat: 'Back',    name: 'Back Cover',            code: 'GH82-31236C', price: '฿650.00',   updated: 'May 18, 2025' },
  { model: 'A25', cat: 'Frame',   name: 'Main Frame',            code: 'GH82-31237D', price: '฿1,800.00', updated: 'May 18, 2025' },
  { model: 'A25', cat: 'Cam',     name: 'Front Camera',          code: 'GH82-31238E', price: '฿920.00',   updated: 'May 18, 2025' },
  { model: 'A25', cat: 'Port',    name: 'Charging Port',         code: 'GH82-31239F', price: '฿420.00',   updated: 'May 18, 2025' },
  { model: 'A25', cat: 'Speaker', name: 'Speaker Module',        code: 'GH82-31240G', price: '฿350.00',   updated: 'May 18, 2025' },
];

const PARTS_DOT_KPI = [
  { label: 'Total Models',   value: '128',   sub: '+4 this week',   tone: 'from-violet-400 to-purple-500', icon: Smartphone },
  { label: 'Total Parts',    value: '5,842', sub: '+12% MoM',       tone: 'from-emerald-400 to-teal-500',  icon: Layers },
  { label: 'Recently Updated', value: '139', sub: 'Last 7 days',    tone: 'from-orange-400 to-pink-500',   icon: Activity },
  { label: 'Exports Ready',  value: '5,842', sub: 'CSV/Excel',      tone: 'from-sky-400 to-blue-500',      icon: Download },
];

const PRODUCTS_TOP = [
  { name: 'Galaxy S24 Ultra',  rating: 4.9, reviews: 2340, icon: '📱', tone: 'from-violet-400 to-purple-500' },
  { name: 'Galaxy Tab S9',     rating: 4.8, reviews: 1820, icon: '📱', tone: 'from-emerald-400 to-teal-500' },
  { name: 'Galaxy Z Fold 6',   rating: 4.7, reviews: 1450, icon: '📱', tone: 'from-rose-400 to-pink-500' },
  { name: 'Galaxy Watch 6',    rating: 4.6, reviews: 980,  icon: '⌚', tone: 'from-sky-400 to-blue-500' },
];

const PRODUCT_GRID = [
  { name: 'Galaxy S24',      cat: 'Smartphone', tone: 'from-violet-400 to-purple-500', icon: '📱' },
  { name: 'Galaxy S24+',     cat: 'Smartphone', tone: 'from-rose-400 to-pink-500',     icon: '📱' },
  { name: 'Galaxy S24 Ultra',cat: 'Smartphone', tone: 'from-emerald-400 to-teal-500',  icon: '📱' },
  { name: 'Galaxy Tab S9',   cat: 'Tablet',     tone: 'from-amber-400 to-orange-500',  icon: '📱' },
  { name: 'Watch 6 Classic', cat: 'Wearable',   tone: 'from-sky-400 to-blue-500',      icon: '⌚' },
  { name: 'Watch 6',         cat: 'Wearable',   tone: 'from-purple-400 to-violet-500', icon: '⌚' },
  { name: 'Buds Pro',        cat: 'Audio',      tone: 'from-orange-400 to-rose-500',   icon: '🎧' },
  { name: 'Buds FE',         cat: 'Audio',      tone: 'from-rose-400 to-fuchsia-500',  icon: '🎧' },
];

const MANPOWER_KPI = [
  { label: 'Total Service Centers', value: '142',   sub: 'Nationwide',       tone: 'from-violet-400 to-purple-500' },
  { label: 'Total Technicians',     value: '1,256', sub: 'Active',           tone: 'from-emerald-400 to-teal-500' },
  { label: 'Highest Workload',      value: 'Central', sub: 'Region',         tone: 'from-orange-400 to-pink-500' },
  { label: 'Understaffed Centers',  value: '18',    sub: 'Need attention',   tone: 'from-rose-400 to-fuchsia-500' },
];

const REGIONS_WORKLOAD = [
  { region: 'North',     load: 'Medium',     pct: 62, color: 'emerald' },
  { region: 'Northeast', load: 'High',       pct: 88, color: 'orange'  },
  { region: 'Central',   load: 'Very High',  pct: 95, color: 'rose'    },
  { region: 'South',     load: 'Low',        pct: 35, color: 'sky'     },
  { region: 'West',      load: 'Medium',     pct: 55, color: 'violet'  },
];

const SAMSUNG_MEMBERS_KPI = [
  { label: 'Total Members',    value: '128,420', sub: '+8.4% MoM',  tone: 'from-violet-400 to-purple-500' },
  { label: 'New This Week',    value: '4,250',   sub: '+12%',       tone: 'from-emerald-400 to-teal-500' },
  { label: 'Premium Members',  value: '32,180',  sub: '25% share',  tone: 'from-orange-400 to-pink-500' },
  { label: 'Avg Engagement',   value: '78%',     sub: 'Healthy',    tone: 'from-sky-400 to-blue-500' },
];

// ── Samsung Members: Apps Script API ─────────────────────────────────
const SM_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzeD1jJ-K36aFtUvBrvqZpAgFi-eYHa9K0vHxVh9JnGl9c9RUcDEv8x_FGruXCbEi9w/exec';

const PLM_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyzCx5C5Tb375duuAfTmGwWAzEXsshrxO-_Te49R7nSDf_cI7avKAiJaGixys3mCFba/exec';

interface SMTicket {
  ticket_ID: string;
  Questioned_Date: string;
  Month: string;
  status: string;
  Model_No: string;
  ACC_MarketName: string;
  Branch: string;
  Main_Type: string;
  Sub_Type: string;
  title: string;
  PLM_STATUS: string;
  PLM_ID?: string;
  Category?: string;
  content?: string;
  Channel?: string;
}

interface SMApiResponse {
  total: number;
  byMonth: Record<string, number>;
  byModel: Record<string, number>;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  byMainType: Record<string, number>;
  raw: SMTicket[];
}

// Fallback mock so page works before API loads
// Minimal fallback data matching real Sheet structure (used while API loads)
const SM_TICKETS_MOCK: SMTicket[] = [
  { ticket_ID: 'T001', Questioned_Date: '2026-01-03', Month: '2026-01', status: 'Resolved',    Model_No: 'SM-A356B', ACC_MarketName: 'Galaxy A35', Branch: 'Central',   Main_Type: 'Hardware', Sub_Type: 'Battery',  title: 'Battery drain fast',     PLM_STATUS: 'Open'   },
  { ticket_ID: 'T002', Questioned_Date: '2026-01-05', Month: '2026-01', status: 'Closed',      Model_No: 'SM-S928B', ACC_MarketName: 'Galaxy S24 Ultra', Branch: 'North', Main_Type: 'Hardware', Sub_Type: 'Display',  title: 'Screen flickering',      PLM_STATUS: 'Closed' },
  { ticket_ID: 'T003', Questioned_Date: '2026-02-10', Month: '2026-02', status: 'Resolved',    Model_No: 'SM-A256B', ACC_MarketName: 'Galaxy A25',       Branch: 'South', Main_Type: 'Hardware', Sub_Type: 'Charging', title: 'Charging slow',          PLM_STATUS: 'Closed' },
  { ticket_ID: 'T004', Questioned_Date: '2026-03-05', Month: '2026-03', status: 'In Progress', Model_No: 'SM-A356B', ACC_MarketName: 'Galaxy A35',       Branch: 'East',  Main_Type: 'Software', Sub_Type: 'Crash',    title: 'App keeps crashing',     PLM_STATUS: 'Open'   },
  { ticket_ID: 'T005', Questioned_Date: '2026-03-12', Month: '2026-03', status: 'Resolved',    Model_No: 'SM-S926B', ACC_MarketName: 'Galaxy S24+',      Branch: 'West',  Main_Type: 'Hardware', Sub_Type: 'Heat',     title: 'Overheating during call',PLM_STATUS: 'Closed' },
  { ticket_ID: 'T006', Questioned_Date: '2026-04-08', Month: '2026-04', status: 'Closed',      Model_No: 'SM-A356B', ACC_MarketName: 'Galaxy A35',       Branch: 'North', Main_Type: 'Hardware', Sub_Type: 'Camera',   title: 'Camera blurry',          PLM_STATUS: 'Closed' },
  { ticket_ID: 'T007', Questioned_Date: '2026-05-03', Month: '2026-05', status: 'Open',        Model_No: 'SM-X910',  ACC_MarketName: 'Galaxy Tab S9',    Branch: 'Central', Main_Type: 'Network', Sub_Type: 'WiFi',    title: 'Wi-Fi keeps dropping',   PLM_STATUS: 'Open'   },
  { ticket_ID: 'T008', Questioned_Date: '2026-05-15', Month: '2026-05', status: 'Resolved',    Model_No: 'SM-A556B', ACC_MarketName: 'Galaxy A55',       Branch: 'South', Main_Type: 'Software', Sub_Type: 'Update',   title: 'Update failed',          PLM_STATUS: 'Closed' },
  { ticket_ID: 'T009', Questioned_Date: '2026-06-01', Month: '2026-06', status: 'Open',        Model_No: 'SM-A356B', ACC_MarketName: 'Galaxy A35',       Branch: 'East',  Main_Type: 'Hardware', Sub_Type: 'Battery',  title: 'Battery drains overnight',PLM_STATUS:'Open'   },
  { ticket_ID: 'T010', Questioned_Date: '2026-06-03', Month: '2026-06', status: 'In Progress', Model_No: 'SM-S928B', ACC_MarketName: 'Galaxy S24 Ultra', Branch: 'West',  Main_Type: 'Hardware', Sub_Type: 'Display',  title: 'Screen has dead pixel',  PLM_STATUS: 'Open'   },
];

const PROJECTS_TIMELINE = [
  { name: 'SOP Refresh Q2',     start: 'May 1',  end: 'Jun 30',  status: 'In Progress', progress: 65, color: 'violet'  },
  { name: 'Part Price DOT Sync', start: 'May 10', end: 'Jun 15', status: 'On Track',    progress: 80, color: 'emerald' },
  { name: 'Manpower Reorg',     start: 'May 15', end: 'Jul 20',  status: 'In Progress', progress: 42, color: 'sky'     },
  { name: 'Samsung Members 2.0', start: 'May 20', end: 'Aug 30', status: 'Planned',     progress: 18, color: 'orange'  },
  { name: 'PLM Phase Review',   start: 'May 25', end: 'Jun 25',  status: 'On Track',    progress: 55, color: 'rose'    },
];

const TONE_BG = {
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  bar: 'bg-violet-500',  border: 'border-violet-200'  },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  bar: 'bg-purple-500',  border: 'border-purple-200'  },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', border: 'border-emerald-200' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     bar: 'bg-sky-500',     border: 'border-sky-200'     },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  bar: 'bg-orange-500',  border: 'border-orange-200'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    bar: 'bg-rose-500',    border: 'border-rose-200'    },
} as const;
type ToneKey = keyof typeof TONE_BG;

// ── Reusable components ───────────────────────────────────────────────
function KpiCard({ label, value, sub, tone, icon: Icon }: {
  label: string; value: string; sub: string; tone: string; icon?: React.ElementType;
}) {
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.18 } }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tone} p-4 shadow-lg h-[128px] hover:shadow-xl transition-all cursor-default`}
    >
      <div className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none" />
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest truncate">{label}</div>
          <div className="mt-2 text-3xl font-extrabold text-white leading-none stat-num">{value}</div>
          <div className="text-[10px] text-white/70 font-semibold mt-1">{sub}</div>
        </div>
        {Icon ? (
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ml-1">
            <Icon size={16} className="text-white" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/20 shrink-0 ml-1" />
        )}
      </div>
      <div className="mt-3 h-[2px] bg-white/25 rounded-full" />
    </motion.div>
  );
}

function SectionCard({ title, subtitle, action, children, className = '' }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp}
      className={`bg-white rounded-2xl border border-purple-100 p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Work Day Entry types & helpers ──────────────────────────────────
interface WorkDayEntry {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  status: 'great' | 'good' | 'average' | 'poor';
  notes: string;
  meetings: string;
  mood: 'energized' | 'focused' | 'neutral' | 'tired';
}

function loadDayEntries(): Record<string, WorkDayEntry> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('work-day-entries') || '{}'); } catch { return {}; }
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Custom Category helpers ─────────────────────────────────────────
interface CustomCat { id: string; label: string; icon: string; }
function loadCustomCats(): CustomCat[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('work-custom-cats') || '[]'); } catch { return []; }
}

// ─── DatePicker (Google Calendar style) ──────────────────────────────
const DP_WEEKDAYS = ['S','M','T','W','T','F','S'];
const todayForDP = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;

function DatePicker({ value, onChange, min, label }: {
  value: string; onChange: (v: string) => void; min?: string; label: string;
}) {
  const [open, setOpen]   = useState(false);
  const [vy, setVy]       = useState(() => value ? parseInt(value.slice(0,4)) : new Date().getFullYear());
  const [vm, setVm]       = useState(() => value ? parseInt(value.slice(5,7)) - 1 : new Date().getMonth());

  useEscClose(() => setOpen(false), open);

  React.useEffect(() => {
    if (value) { setVy(parseInt(value.slice(0,4))); setVm(parseInt(value.slice(5,7)) - 1); }
  }, [value]);

  const daysInM  = new Date(vy, vm + 1, 0).getDate();
  const firstDow = new Date(vy, vm, 1).getDay(); // Sun=0
  const total    = Math.ceil((firstDow + daysInM) / 7) * 7;
  const toStr    = (d: number) => `${vy}-${String(vm+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const prevM    = () => { if (vm === 0) { setVy(y=>y-1); setVm(11); } else setVm(m=>m-1); };
  const nextM    = () => { if (vm === 11) { setVy(y=>y+1); setVm(0); } else setVm(m=>m+1); };
  const display  = value
    ? new Date(value+'T00:00:00').toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })
    : 'เลือกวันที่';

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-gray-400">{label}</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-left transition
          ${open ? 'border-violet-400 ring-2 ring-violet-100' : 'border-gray-200 hover:border-violet-300'} bg-white`}>
        <Calendar size={14} className="text-violet-500 shrink-0" />
        <span className={value ? 'text-gray-700 font-semibold' : 'text-gray-400'}>{display}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-[280px]">
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
              <button onClick={prevM} className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-violet-600 font-bold transition">‹</button>
              <span className="text-sm font-bold text-gray-800">{MONTH_NAMES[vm]} {vy}</span>
              <button onClick={nextM} className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-violet-600 font-bold transition">›</button>
            </div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 px-3 pt-3">
              {DP_WEEKDAYS.map((d, i) => (
                <div key={i} className={`text-center text-[10px] font-bold pb-1.5 ${i===0||i===6 ? 'text-violet-400' : 'text-gray-400'}`}>{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
              {Array.from({ length: total }, (_, i) => {
                const d       = i - firstDow + 1;
                const isValid = d >= 1 && d <= daysInM;
                const ds      = isValid ? toStr(d) : '';
                const isSel   = ds === value;
                const isToday = ds === todayForDP;
                const isOff   = !!(min && ds && ds < min);
                return (
                  <button key={i} disabled={!isValid || isOff} type="button"
                    onClick={() => { onChange(ds); setOpen(false); }}
                    className={`h-8 w-full rounded-full text-[12px] font-semibold transition flex items-center justify-center
                      ${!isValid ? 'invisible' : ''}
                      ${isSel ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md font-bold' :
                        isToday ? 'border-2 border-violet-400 text-violet-700 font-bold' :
                        isOff   ? 'text-gray-300 cursor-not-allowed' :
                        'text-gray-700 hover:bg-violet-100'}
                    `}>
                    {isValid ? d : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Horizontal KPI Progress Card – Premium pastel theme ─────────────
function HorizontalProgressCard({ label, value, sub, gradient, gradientFrom, gradientTo }: {
  label: string; value: number; sub: string; gradient: string;
  gradientFrom?: string; gradientTo?: string;
}) {
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-4 shadow-sm hover:shadow-lg transition-all"
    >
      {/* Subtle gradient tint background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.04] pointer-events-none`} />
      {/* Left accent bar */}
      <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${gradient} rounded-l-2xl`} />

      <div className="pl-2">
        <div className="flex items-start justify-between mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
          <div className={`text-[26px] font-extrabold leading-none bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
            {value}<span className="text-[14px] font-bold">%</span>
          </div>
        </div>
        <div className="w-full bg-purple-50 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <div className="text-[10px] font-semibold text-slate-400 mt-1.5">{sub}</div>
      </div>
    </motion.div>
  );
}

// ─── Work Day Modal ───────────────────────────────────────────────────
function WorkDayModal({ date, existing, onSave, onClose }: {
  date: string;
  existing: WorkDayEntry | null;
  onSave: (e: WorkDayEntry) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<WorkDayEntry>(existing ?? {
    date,
    tasksCompleted: 0,
    totalTasks: 5,
    status: 'good',
    notes: '',
    meetings: '',
    mood: 'focused',
  });

  useEscClose(onClose);
  const up = <K extends keyof WorkDayEntry>(k: K, v: WorkDayEntry[K]) => setForm(f => ({ ...f, [k]: v }));
  const pct = form.totalTasks > 0 ? Math.round((form.tasksCompleted / form.totalTasks) * 100) : 0;
  const d = new Date(date + 'T00:00:00');
  const displayDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-5 py-4">
          <div className="text-white/70 text-[11px] uppercase tracking-wider">Work Day Log</div>
          <div className="text-white font-bold text-base mt-0.5">{displayDate}</div>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Tasks Completed</label>
              <input type="number" min={0} max={form.totalTasks}
                value={form.tasksCompleted}
                onChange={e => up('tasksCompleted', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Total Tasks</label>
              <input type="number" min={1}
                value={form.totalTasks}
                onChange={e => up('totalTasks', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Completion</span><span className="font-bold text-purple-700">{pct}%</span>
            </div>
            <div className="w-full bg-purple-50 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all"
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Day Status</label>
            <div className="grid grid-cols-4 gap-2">
              {(['great','good','average','poor'] as const).map(s => (
                <button key={s} onClick={() => up('status', s)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize transition ${
                    form.status === s
                      ? s === 'great' ? 'bg-emerald-500 text-white'
                        : s === 'good' ? 'bg-sky-500 text-white'
                        : s === 'average' ? 'bg-orange-400 text-white'
                        : 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Mood</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'energized' as const, icon: '⚡' },
                { key: 'focused'   as const, icon: '🎯' },
                { key: 'neutral'   as const, icon: '😐' },
                { key: 'tired'     as const, icon: '😴' },
              ].map(m => (
                <button key={m.key} onClick={() => up('mood', m.key)}
                  className={`py-2 rounded-lg text-center transition ${
                    form.mood === m.key ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-50 hover:bg-purple-50'
                  }`}>
                  <div className="text-lg">{m.icon}</div>
                  <div className="text-[9px] text-gray-600 capitalize mt-0.5">{m.key}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Meetings / Events</label>
            <input value={form.meetings} onChange={e => up('meetings', e.target.value)}
              placeholder="e.g. Team sync 14:00, Client call 16:30"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => up('notes', e.target.value)}
              rows={3} placeholder="What did you accomplish? Any blockers?"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-400" />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => onSave(form)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold hover:opacity-90">
              Save Day Log
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Task Detail Modal (XL) ────────────────────────────────────────────
type CrucialTask = typeof CRUCIAL_TASKS_DATA[number];
function TaskDetailModal({ task, onClose }: { task: CrucialTask; onClose: () => void }) {
  useEscClose(onClose);
  const days = daysUntil(task.deadline);
  const daysColor = days <= 3 ? 'text-rose-600' : days <= 7 ? 'text-orange-500' : 'text-emerald-600';
  const daysLabel = days < 0 ? `เลยกำหนด ${Math.abs(days)} วัน` : days === 0 ? 'ครบกำหนดวันนี้' : `เหลือ ${days} วัน`;
  const statusStyle: Record<string, string> = {
    'In Progress': 'bg-sky-100 text-sky-700',
    'On Track':    'bg-emerald-100 text-emerald-700',
    'Planned':     'bg-violet-100 text-violet-700',
  };
  const priBadge = task.priority === 'High' ? 'bg-rose-100 text-rose-700' : task.priority === 'Med' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
  const gradMap: Record<string, string> = {
    rose: 'from-rose-400 to-pink-500', orange: 'from-orange-400 to-amber-500',
    emerald: 'from-emerald-400 to-teal-500', sky: 'from-sky-400 to-blue-500',
  };
  const grad = gradMap[task.color] ?? 'from-violet-400 to-purple-500';
  const deadlineDisplay = new Date(task.deadline + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-2xl mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className={`bg-gradient-to-r ${grad} px-6 py-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider`}>{task.tag}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>{task.priority} Priority</span>
              </div>
              <h2 className="text-white font-extrabold text-lg leading-tight">{task.title}</h2>
              <div className={`mt-2 text-[13px] font-bold ${days <= 3 ? 'text-rose-200' : days <= 7 ? 'text-amber-200' : 'text-white/80'}`}>
                📅 {deadlineDisplay} · {daysLabel}
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white transition shrink-0">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status + Owner row */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px] rounded-2xl bg-gray-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusStyle[task.status] ?? 'bg-gray-100 text-gray-600'}`}>
                <CheckCircle2 size={11} /> {task.status}
              </span>
            </div>
            <div className="flex-1 min-w-[140px] rounded-2xl bg-gray-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Owner</div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                  {task.owner[0]}
                </div>
                <span className="text-sm font-semibold text-gray-700">{task.owner}</span>
              </div>
            </div>
            <div className="flex-1 min-w-[140px] rounded-2xl bg-gray-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Priority</div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${priBadge}`}>
                {task.priority === 'High' ? '🔴' : task.priority === 'Med' ? '🟡' : '⚪'} {task.priority}
              </span>
            </div>
          </div>

          {/* Days remaining visual */}
          <div className={`rounded-2xl border-2 p-4 ${days <= 3 ? 'border-rose-200 bg-rose-50' : days <= 7 ? 'border-orange-200 bg-orange-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className={days <= 3 ? 'text-rose-500' : days <= 7 ? 'text-orange-500' : 'text-emerald-500'} />
              <div>
                <div className={`font-bold text-sm ${daysColor}`}>{daysLabel}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Deadline: {deadlineDisplay}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">รายละเอียด</div>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-4">{task.desc}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
              ปิด
            </button>
            <button
              className={`flex-1 py-3 rounded-2xl bg-gradient-to-r ${grad} text-white text-sm font-bold hover:opacity-90 transition shadow-md`}>
              เปิด Task
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Premium iOS-style Wheel Time Picker ──────────────────────────────
function WheelColumn({ items, value, onChange, suffix }: {
  items: string[]; value: string; onChange: (v: string) => void; suffix?: string;
}) {
  const ITEM_H = 36;
  const ref = React.useRef<HTMLDivElement>(null);
  const scrollingRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const idx = Math.max(0, items.indexOf(value));
    if (ref.current) ref.current.scrollTop = idx * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (scrollingRef.current) window.clearTimeout(scrollingRef.current);
    scrollingRef.current = window.setTimeout(() => {
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(top / ITEM_H)));
      const snapped = idx * ITEM_H;
      if (Math.abs(top - snapped) > 0.5 && ref.current) {
        ref.current.scrollTo({ top: snapped, behavior: 'smooth' });
      }
      if (items[idx] !== value) onChange(items[idx]);
    }, 90);
  };

  const selectedIdx = items.indexOf(value);

  return (
    <div className="relative flex-1 h-[180px] overflow-hidden">
      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[72px] z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))' }} />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px] z-10"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))' }} />
      {/* Center highlight pill */}
      <div className="pointer-events-none absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[34px] rounded-xl z-0"
        style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.18), rgba(99,102,241,0.18))' }} />
      <div ref={ref} onScroll={onScroll}
        className="h-full overflow-y-auto no-scrollbar relative z-[1]"
        style={{ scrollSnapType: 'y mandatory', scrollPaddingTop: 0 }}>
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((it, i) => {
          const dist = Math.abs(i - selectedIdx);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.5 : dist === 2 ? 0.25 : 0.1;
          const scale = dist === 0 ? 1 : dist === 1 ? 0.92 : 0.85;
          return (
            <div key={it} style={{ height: ITEM_H, scrollSnapAlign: 'center', opacity, transform: `scale(${scale})` }}
              className="flex items-center justify-center text-base font-bold text-gray-800 transition-all duration-150 cursor-pointer"
              onClick={() => { ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' }); onChange(it); }}>
              {it}{suffix ?? ''}
            </div>
          );
        })}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
}

function WheelTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hh, mm] = (value || '09:00').split(':');
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), []);
  const mins  = React.useMemo(() => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')), []);
  const setH = (h: string) => onChange(`${h}:${mm || '00'}`);
  const setM = (m: string) => onChange(`${hh || '00'}:${m}`);
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}`}</style>
      <div className="flex items-stretch">
        <WheelColumn items={hours} value={hh || '09'} onChange={setH} />
        <div className="flex items-center justify-center text-lg font-extrabold text-violet-400 px-1">:</div>
        <WheelColumn items={mins} value={mm || '00'} onChange={setM} />
      </div>
    </div>
  );
}

// Compact time range row with Start/End wheel pickers side by side
function TimeRangePicker({ start, end, onStart, onEnd }: {
  start: string; end: string; onStart: (v: string) => void; onEnd: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-violet-500">เริ่ม</div>
        <WheelTimePicker value={start} onChange={onStart} />
      </div>
      <div>
        <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-violet-500">สิ้นสุด</div>
        <WheelTimePicker value={end} onChange={onEnd} />
      </div>
    </div>
  );
}

// ─── Tab: Overall ─────────────────────────────────────────────────────
function OverallTab({ showToast, onSwitchToTasks }: { showToast: (msg: string) => void; onSwitchToTasks: (taskId?: string) => void }) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [dayEntries, setDayEntries]   = useState<Record<string, WorkDayEntry>>(() => loadDayEntries());
  const [modalDay, setModalDay]       = useState<string | null>(null);
  const [userEvents, setUserEvents]   = useState<WorkEvent[]>(() => loadWorkEvents());
  const [mockOverrides, setMockOverrides] = useState<Record<string, WorkEvent>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('work-mock-overrides') || '{}'); } catch { return {}; }
  });
  const [hiddenMockIds, setHiddenMockIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('work-mock-hidden') || '[]'); } catch { return []; }
  });
  const saveMockOverrides = (m: Record<string, WorkEvent>) => {
    setMockOverrides(m);
    try { localStorage.setItem('work-mock-overrides', JSON.stringify(m)); } catch {}
  };
  const saveHiddenMockIds = (ids: string[]) => {
    setHiddenMockIds(ids);
    try { localStorage.setItem('work-mock-hidden', JSON.stringify(ids)); } catch {}
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm]                 = useState({ ...BLANK_WEVENT });
  const [popupDay, setPopupDay]         = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<CrucialTask | null>(null);
  const [notifGranted, setNotifGranted] = useState(false);
  const [popupPos, setPopupPos]         = useState({ x: 0, y: 0, above: false });
  const [customCats, setCustomCats]     = useState<CustomCat[]>(() => loadCustomCats());
  const [showNewCat, setShowNewCat]     = useState(false);
  const [calTasks, setCalTasks]         = useState<TaskItem[]>(() => loadTasks());
  const [editModalEvent, setEditModalEvent] = useState<WorkEvent | null>(null);
  const [editForm, setEditForm]             = useState({ ...BLANK_WEVENT });
  const [editTaskExtra, setEditTaskExtra]   = useState<{ status: TaskItem['status']; progress: number } | null>(null);
  const [confirmDel, setConfirmDel]         = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  useEscClose(() => setPopupDay(null), !!popupDay);
  useEscClose(() => setConfirmDel(null), !!confirmDel);
  useEscClose(() => setShowAddModal(false), showAddModal);
  useEscClose(() => setEditModalEvent(null), !!editModalEvent);

  const daysInCal  = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay   = new Date(calYear, calMonth, 1).getDay(); // Sun=0, Mon=1, ...
  const totalCells = Math.ceil((firstDay + daysInCal) / 7) * 7;

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  const toDateStr = (day: number) =>
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const saveUserEvents = (evs: WorkEvent[]) => {
    setUserEvents(evs);
    localStorage.setItem('work-cal-events', JSON.stringify(evs));
  };

  const taskEvents = useMemo<WorkEvent[]>(() =>
    calTasks
      .filter(t => !!t.deadline)
      .map(t => ({
        id: `task_${t.id}`,
        date: (t.startDate && t.startDate <= t.deadline) ? t.startDate : t.deadline,
        endDate: t.deadline,
        subject: `★ ${t.name}`,
        priority: (t.priority === 'High' ? 'High' : t.priority === 'Med' ? 'Medium' : 'Low') as WEventPriority,
        category: 'task' as WEventCategory,
        allDay: true,
      }))
  , [calTasks]);

  const effectiveMocks = WORK_EVENTS_MOCK
    .filter(e => !hiddenMockIds.includes(e.id))
    .map(e => mockOverrides[e.id] ?? e);
  const allEvents = [...effectiveMocks, ...userEvents, ...taskEvents];

  const eventsOnDate = (ds: string) =>
    allEvents.filter(e => ds >= e.date && ds <= (e.endDate || e.date));

  // Auto-close popup when all events on that day are deleted
  useEffect(() => {
    if (popupDay && eventsOnDate(popupDay).length === 0) setPopupDay(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calTasks, userEvents, hiddenMockIds, mockOverrides]);

  const dayEvents = eventsOnDate(selectedDay).slice().sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return (a.startTime ?? '').localeCompare(b.startTime ?? '');
  });

  const currentMonthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const isCurrentMonthDate = (ds: string) => ds.startsWith(currentMonthPrefix);

  // Pre-compute week-based lane layout – overflow days get real date strings
  const weeks = useMemo(() => {
    const cells: string[] = [];
    for (let i = 0; i < totalCells; i++) {
      const d = i - firstDay + 1;
      if (d >= 1 && d <= daysInCal) {
        cells.push(toDateStr(d));
      } else {
        // Overflow: compute real date for prev/next month day
        const date = new Date(calYear, calMonth, d);
        cells.push(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);
      }
    }
    const result: { dates: string[]; lanes: { ev: WorkEvent; startCol: number; endCol: number }[][] }[] = [];
    for (let w = 0; w < cells.length; w += 7) {
      const weekDates = cells.slice(w, w + 7);
      const wStart = weekDates.find(d => d) ?? '';
      const wEnd   = [...weekDates].reverse().find(d => d) ?? '';
      const evs = allEvents.filter(e => e.date <= wEnd && (e.endDate || e.date) >= wStart)
        .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
      const lanes: { ev: WorkEvent; startCol: number; endCol: number }[][] = [];
      const laneEnd: string[] = [];
      for (const ev of evs) {
        const sc = weekDates.findIndex(d => d >= ev.date && d !== '');
        const ec = weekDates.reduce((best, d, i) => d && d <= (ev.endDate || ev.date) ? i : best, -1);
        if (sc === -1 || ec === -1) continue;
        let li = laneEnd.findIndex(le => !le || le < weekDates[sc]);
        if (li === -1) { li = laneEnd.length; lanes.push([]); }
        laneEnd[li] = weekDates[ec];
        lanes[li].push({ ev, startCol: sc, endCol: ec });
      }
      result.push({ dates: weekDates, lanes });
    }
    return result;
  }, [calYear, calMonth, allEvents, totalCells, firstDay, daysInCal]);

  const handleDayClick = (ds: string, e: React.MouseEvent) => {
    setSelectedDay(ds);
    const evs = eventsOnDate(ds);
    if (evs.length === 0) {
      setPopupDay(null);
      setForm({ ...BLANK_WEVENT });
      setShowAddModal(true);
    } else {
      // Google Calendar style: popup near clicked cell
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const above = rect.bottom > window.innerHeight - 320;
      setPopupPos({
        x: Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 340),
        y: above ? rect.top - 8 : rect.bottom + 6,
        above,
      });
      setPopupDay(ds);
    }
  };

  const closePopup = () => setPopupDay(null);

  const handleSave = (entry: WorkDayEntry) => {
    const updated = { ...dayEntries, [entry.date]: entry };
    setDayEntries(updated);
    localStorage.setItem('work-day-entries', JSON.stringify(updated));
    setModalDay(null);
    showToast('Day log saved ✓');
  };

  const openEditModal = (ev: WorkEvent) => {
    const isTask = ev.id.startsWith('task_');
    const task = isTask ? calTasks.find(t => t.id === ev.id.replace('task_', '')) : null;
    setEditForm({
      subject: ev.subject.replace(/^★ /, ''),
      priority: ev.priority,
      category: ev.category,
      colorId: (ev.colorId ?? getCat(ev.category).defaultColor) as EventColorId,
      allDay: ev.allDay ?? true,
      startTime: ev.startTime ?? '09:00',
      endTime: ev.endTime ?? '10:00',
      endDate: ev.endDate ?? ev.date,
      note: ev.note ?? '',
      notifyMobile: ev.notifyMobile ?? false,
      newCatLabel: '',
      newCatIcon: '📌',
    });
    setEditTaskExtra(task ? { status: task.status, progress: task.progress } : null);
    setEditModalEvent(ev);
    closePopup();
  };

  const saveEditModal = () => {
    if (!editModalEvent) return;
    const evId = editModalEvent.id;
    if (evId.startsWith('uw_')) {
      const updated = userEvents.map(e => e.id === evId ? {
        ...e,
        subject: editForm.subject.trim(),
        priority: editForm.priority,
        category: editForm.category,
        colorId: editForm.colorId as EventColorId,
        allDay: editForm.allDay,
        startTime: editForm.allDay ? undefined : editForm.startTime,
        endTime: editForm.allDay ? undefined : editForm.endTime,
        endDate: editForm.endDate >= editModalEvent.date ? editForm.endDate : editModalEvent.date,
        note: editForm.note.trim() || undefined,
        notifyMobile: editForm.notifyMobile,
      } : e);
      saveUserEvents(updated);
    } else if (evId.startsWith('task_')) {
      const taskId = evId.replace('task_', '');
      const updatedTasks = calTasks.map(t => t.id === taskId ? {
        ...t,
        name: editForm.subject.trim(),
        priority: (editForm.priority === 'High' ? 'High' : editForm.priority === 'Medium' ? 'Med' : 'Low') as TaskItem['priority'],
        status: editTaskExtra?.status ?? t.status,
        progress: editTaskExtra?.progress ?? t.progress,
      } : t);
      setCalTasks(updatedTasks);
      try { localStorage.setItem('work-tasks', JSON.stringify(updatedTasks)); } catch {}
    } else if (evId.startsWith('w')) {
      // Mock event override
      const updated: WorkEvent = {
        ...editModalEvent,
        subject: editForm.subject.trim(),
        priority: editForm.priority,
        category: editForm.category,
        colorId: editForm.colorId as EventColorId,
        allDay: editForm.allDay,
        startTime: editForm.allDay ? undefined : editForm.startTime,
        endTime: editForm.allDay ? undefined : editForm.endTime,
        endDate: editForm.endDate >= editModalEvent.date ? editForm.endDate : editModalEvent.date,
        note: editForm.note.trim() || undefined,
        notifyMobile: editForm.notifyMobile,
      };
      saveMockOverrides({ ...mockOverrides, [evId]: updated });
    }
    setEditModalEvent(null);
    showToast('บันทึกแล้ว ✓');
  };

  const deleteEditModal = () => {
    if (!editModalEvent) return;
    const id = editModalEvent.id;
    if (id.startsWith('uw_')) {
      handleDeleteEvent(id);
    } else if (id.startsWith('w')) {
      saveHiddenMockIds([...hiddenMockIds, id]);
      const { [id]: _, ...rest } = mockOverrides;
      saveMockOverrides(rest);
    }
    setEditModalEvent(null);
    showToast('ลบแล้ว ✓');
  };

  const handleAddEvent = () => {
    if (!form.subject.trim()) return;
    const ev: WorkEvent = {
      id: `uw_${Date.now()}`,
      date: selectedDay,
      endDate: form.endDate && form.endDate >= selectedDay ? form.endDate : selectedDay,
      subject: form.subject.trim(),
      priority: form.priority,
      category: form.category,
      colorId: form.colorId as EventColorId,
      allDay: form.allDay,
      startTime: form.allDay ? undefined : form.startTime,
      endTime: form.allDay ? undefined : form.endTime,
      note: form.note.trim() || undefined,
      notifyMobile: form.notifyMobile,
    };
    saveUserEvents([...userEvents, ev]);
    setForm({ ...BLANK_WEVENT });
    setShowAddModal(false);
    showToast('เพิ่มกิจกรรมแล้ว ✓');
  };

  const handleDeleteEvent = (id: string) => {
    saveUserEvents(userEvents.filter(e => e.id !== id));
  };

  const selectedEntry = dayEntries[selectedDay] ?? null;
  const moodIcon = (m: WorkDayEntry['mood']) => ({ energized: '⚡', focused: '🎯', neutral: '😐', tired: '😴' })[m];

  const selDate = new Date(selectedDay + 'T00:00:00');
  const selDayNum = selDate.getDate();
  const selDayName = selDate.toLocaleDateString('th-TH', { weekday: 'long' });
  const selMonthName = selDate.toLocaleDateString('en-US', { month: 'long' });
  const selYear = selDate.getFullYear();

  const ff = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">

      {/* ── Calendar + Right Panel ── */}
      <div className="flex gap-4 items-start">
      {/* Calendar */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-purple-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base">ปฏิทินกิจกรรม</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {allEvents.filter(e => e.date.startsWith(currentMonthPrefix)).length} กิจกรรมในเดือนนี้ · คลิกวันที่เพื่อดูและเพิ่ม
            </p>
          </div>
          {/* Navigation – arrows only, no dropdown */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-lg bg-white text-violet-600 hover:bg-violet-50 flex items-center justify-center font-bold text-base shadow-sm transition">
              ‹
            </button>
            <button onClick={() => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth()); }}
              className="px-3 h-8 rounded-lg text-xs font-bold text-violet-600 hover:bg-violet-50 transition min-w-[130px] text-center">
              {MONTH_NAMES[calMonth]} {calYear}
            </button>
            <button onClick={nextMonth}
              className="w-8 h-8 rounded-lg bg-white text-violet-600 hover:bg-violet-50 flex items-center justify-center font-bold text-base shadow-sm transition">
              ›
            </button>
          </div>
        </div>

        {/* Weekday header – W col + Sun first */}
        <div className="bg-gray-50/60 border-b border-gray-100" style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)' }}>
          <div className="py-2.5 text-center text-[9px] font-bold uppercase tracking-wide text-violet-300">W</div>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
            <div key={d} className={`py-2.5 text-center text-[11px] font-bold uppercase tracking-wide
              ${i === 0 || i === 6 ? 'text-violet-400' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>

        {/* Week rows – fixed 3 lanes always = equal height */}
        {weeks.map((week, wi) => (
          <div key={wi} className="border-b border-gray-100 last:border-b-0">

            {/* Day numbers row – fixed h-16 */}
            <div className="divide-x divide-gray-100" style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)' }}>
              {/* W## cell */}
              <div className="flex items-center justify-center bg-violet-50/40">
                <span className="text-[9px] font-extrabold text-violet-500 leading-none">W{getISOWeek(new Date(week.dates[1]))}</span>
              </div>
              {week.dates.map((ds, di) => {
                const isCurMonth = isCurrentMonthDate(ds);
                const dayNum  = parseInt(ds.slice(8));
                const entry   = isCurMonth ? dayEntries[ds] : null;
                const isToday = ds === todayStr;
                const isSel   = ds === selectedDay;
                const isWknd  = di === 0 || di === 6;
                const holiday = THAI_HOLIDAYS[ds];
                return (
                  <button key={di}
                    onClick={(e) => isCurMonth && handleDayClick(ds, e)}
                    className={`relative h-11 w-full flex items-center gap-1 px-1.5 py-1 overflow-hidden transition group
                      ${!isCurMonth ? 'bg-gray-50/70 cursor-default' : 'cursor-pointer'}
                      ${isCurMonth && isSel ? 'bg-violet-50' :
                        isCurMonth && isWknd ? 'bg-violet-50/20 hover:bg-violet-50/50' :
                        isCurMonth ? 'hover:bg-gray-50/80' : ''}
                    `}
                  >
                    {/* Date number circle */}
                    {isToday ? (
                      <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full inline-flex items-center justify-center text-[14px] font-bold shadow-md shrink-0">{dayNum}</span>
                    ) : (
                      <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full text-[14px] font-semibold shrink-0 transition-all
                        ${!isCurMonth ? 'text-gray-300' :
                          holiday ? 'text-rose-500 font-bold' :
                          isSel ? 'bg-violet-100 text-violet-700 font-bold' :
                          isWknd ? 'text-violet-500' :
                          'text-gray-700 group-hover:text-gray-900 group-hover:bg-gray-100 group-hover:font-bold'}
                      `}>{dayNum}</span>
                    )}
                    {/* Holiday badge — inline, same row as date */}
                    {holiday && isCurMonth && (
                      <span className="text-[7px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 rounded px-1 py-0.5 leading-tight truncate min-w-0 flex-1">{holiday}</span>
                    )}
                    {/* Entry dot */}
                    {entry && (
                      <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                        entry.status === 'great' ? 'bg-emerald-400' :
                        entry.status === 'good'  ? 'bg-sky-400' :
                        entry.status === 'average' ? 'bg-orange-400' : 'bg-rose-400'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Always 3 event lane rows – ensures equal week height */}
            <div className="pt-1 pb-2 space-y-[3px]">
              {[0, 1, 2].map(li => {
                const laneItems = week.lanes[li] ?? [];
                return (
                  <div key={li} className="h-[22px]" style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)' }}>
                    <div className="bg-violet-50/20" />
                    {week.dates.map((ds, di) => {
                      const item = laneItems.find(it => di >= it.startCol && di <= it.endCol);
                      if (!item) return (
                        <div key={di}
                          onClick={(e) => { const curMonth = ds.startsWith(`${calYear}-${String(calMonth+1).padStart(2,'0')}`); if (curMonth) handleDayClick(ds, e); }}
                          className={`h-[22px] ${ds.startsWith(`${calYear}-${String(calMonth+1).padStart(2,'0')}`) ? 'cursor-pointer' : ''}`}
                        />
                      );
                      const isStart   = di === item.startCol;
                      const isEnd     = di === item.endCol;
                      const isSingle  = isStart && isEnd;
                      const isSel     = ds === selectedDay;
                      const barGrad   = getEventColor(item.ev.colorId ?? getCat(item.ev.category).defaultColor);
                      // Continuous gradient across span using bg-size + bg-position
                      const spanW     = item.endCol - item.startCol + 1;
                      const posInSpan = di - item.startCol;
                      const bgStyle: React.CSSProperties = {
                        backgroundImage: barGrad,
                        ...(spanW > 1 && {
                          backgroundSize:      `${spanW * 100}% 100%`,
                          backgroundPositionX: `${posInSpan * 100 / (spanW - 1)}%`,
                        }),
                      };
                      return (
                        <div key={di}
                          title={item.ev.subject}
                          onClick={(e) => { e.stopPropagation(); ds && handleDayClick(ds, e); }}
                          style={bgStyle}
                          className={`h-[20px] flex items-center cursor-pointer select-none
                            text-white text-[9px] font-semibold leading-none overflow-hidden shadow-sm
                            ${isSel ? 'opacity-75' : 'opacity-90 hover:opacity-100'}
                            ${isSingle ? 'rounded-md mx-0.5' :
                              isStart   ? 'rounded-l-md ml-0.5' :
                              isEnd     ? 'rounded-r-md mr-0.5' : ''}
                          `}
                        >
                          {isStart && <span className="truncate pl-2 pr-1 drop-shadow">{item.ev.subject}</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="px-5 py-2.5 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
          {(Object.keys(WEVENT_CAT) as WEventCategory[]).map(cat => {
            const c = WEVENT_CAT[cat];
            return (
              <div key={cat} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${c.bar} opacity-80`} />
                <span>{c.label}</span>
              </div>
            );
          })}
        </div>
      </div>{/* end calendar */}

      {/* Right: Day detail panel – always visible */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedDay}
          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="w-[280px] shrink-0 flex flex-col gap-3"
        >
          {selectedDay ? (
            (() => {
              // Dynamic color based on first event of selected day
              const firstEv     = dayEvents[0];
              const panelGrad   = firstEv
                ? getEventColor(firstEv.colorId ?? getCat(firstEv.category).defaultColor)
                : 'linear-gradient(135deg,#8b5cf6,#7c3aed)';
              const holidayName = THAI_HOLIDAYS[selectedDay];
              return (
                <>
                  {/* Date header – color synced to first event */}
                  <div className="rounded-2xl p-4 text-white shadow-lg" style={{ background: panelGrad }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm w-12 h-12">
                          <span className="text-[8px] font-bold uppercase tracking-widest opacity-75">{selMonthName.slice(0,3)}</span>
                          <span className="text-[22px] font-extrabold leading-none">{selDayNum}</span>
                        </div>
                        <div>
                          <div className="text-[13px] font-bold leading-tight">{selDayName}</div>
                          <div className="text-[11px] opacity-75 mt-0.5">{selMonthName} {selYear}</div>
                          {holidayName && (
                            <div className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 mt-1 font-bold">🎌 {holidayName}</div>
                          )}
                          <div className="mt-1.5 flex gap-1.5">
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">{dayEvents.length} กิจกรรม</span>
                            {selectedEntry && (
                              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                                {selectedEntry.tasksCompleted}/{selectedEntry.totalTasks}✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setModalDay(selectedDay)}
                        className="flex-1 rounded-xl bg-white/15 py-1.5 text-[11px] font-bold hover:bg-white/25 transition text-center">
                        <span className="inline-flex items-center justify-center gap-1.5">
                          {selectedEntry ? <Edit3 size={12} /> : <FileText size={12} />}
                          {selectedEntry ? 'Edit Log' : '+ Log Day'}
                        </span>
                      </button>
                      <button onClick={() => { setForm({ ...BLANK_WEVENT }); setShowAddModal(true); }}
                        className="flex-1 rounded-xl bg-white/90 py-1.5 text-[11px] font-bold hover:bg-white transition text-center shadow-sm"
                        style={{ color: EVENT_COLORS.find(c => getEventColor(c.id) === panelGrad)?.tw ?? '#7c3aed' }}>
                        + เพิ่มกิจกรรม
                      </button>
                    </div>
                  </div>

                  {/* Events list – header accent matches panel color */}
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex-1">
                    {/* Header with accent */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: panelGrad }} />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">กิจกรรมวันนี้</span>
                      </div>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: panelGrad }}>
                        {dayEvents.length}
                      </span>
                    </div>

                    {dayEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-10">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: panelGrad + '22' }}>
                          <Plus size={22} style={{ color: EVENT_COLORS[0].tw }} />
                        </div>
                        <span className="text-[12px] font-semibold text-gray-500">ไม่มีกิจกรรมในวันนี้</span>
                        <button
                          onClick={() => { setForm({ ...BLANK_WEVENT }); setShowAddModal(true); }}
                          className="rounded-xl px-4 py-2 text-[11px] font-bold text-white transition"
                          style={{ background: panelGrad }}>
                          + เพิ่มกิจกรรม
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                        {dayEvents.map(ev => {
                          const pri     = WEVENT_PRIORITY[ev.priority];
                          const cat     = getCat(ev.category);
                          const evGrad  = getEventColor(ev.colorId ?? cat.defaultColor);
                          const isUser  = ev.id.startsWith('uw_');
                          return (
                            <div key={ev.id} className="group flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50/80 transition">
                              {/* Gradient color stripe – matches event bar in calendar */}
                              <div className="mt-1 w-1.5 rounded-full min-h-[40px] shrink-0"
                                style={{ background: evGrad }} />
                              <div className="flex-1 min-w-0">
                                {/* Priority + Category badges */}
                                <div className="flex flex-wrap items-center gap-1 mb-1">
                                  <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${pri.badge}`}>
                                    {pri.icon} {pri.label}
                                  </span>
                                  <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                                    {cat.icon} {cat.label}
                                  </span>
                                </div>
                                {/* Subject */}
                                <div className="text-[13px] font-bold text-gray-800 leading-snug">{ev.subject}</div>
                                {/* Time row */}
                                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
                                  <Clock size={9} />
                                  {ev.allDay
                                    ? <span className="bg-sky-100 text-sky-600 rounded px-1.5 py-0.5 text-[9px] font-semibold">ทั้งวัน</span>
                                    : <span className={'font-medium text-gray-500'}>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>
                                  }
                                  {ev.endDate && ev.endDate !== ev.date && (
                                    <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-white"
                                      style={{ background: evGrad }}>
                                      {ev.date.slice(8)}→{ev.endDate.slice(8)}
                                    </span>
                                  )}
                                </div>
                                {ev.note && <div className="mt-0.5 text-[10px] italic text-gray-400 line-clamp-1">{ev.note}</div>}
                              </div>
                              {isUser && (
                                <button onClick={() => handleDeleteEvent(ev.id)}
                                  className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded-md bg-rose-100 text-rose-500 hover:bg-rose-200 shrink-0 mt-1 transition">
                                  <X size={9} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              );
            })()
          ) : (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/30 p-8 text-center text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">คลิกวันที่เพื่อดูกิจกรรม</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>{/* end flex row */}

      {/* Google Calendar–style event popup */}
      <AnimatePresence>
        {popupDay && (
          <>
            {/* Backdrop (invisible, click-to-close) */}
            <div className="fixed inset-0 z-40" onClick={closePopup} />

            <motion.div
              key={popupDay}
              initial={{ opacity: 0, scale: 0.94, y: popupPos.above ? 6 : -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left:  Math.max(8, popupPos.x),
                ...(popupPos.above
                  ? { bottom: window.innerHeight - popupPos.y }
                  : { top: popupPos.y }),
                zIndex: 50,
                width: 320,
              }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              {(() => {
                const evs      = eventsOnDate(popupDay).sort((a, b) =>
                  (a.startTime ?? '').localeCompare(b.startTime ?? ''));
                const firstEv  = evs[0];
                const panelG   = firstEv
                  ? getEventColor(firstEv.colorId ?? getCat(firstEv.category).defaultColor)
                  : 'linear-gradient(135deg,#8b5cf6,#7c3aed)';
                const holidayName = THAI_HOLIDAYS[popupDay];
                const d        = new Date(popupDay + 'T00:00:00');
                const dayLabel = d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

                return (
                  <>
                    {/* Popup header */}
                    <div className="px-4 pt-3 pb-2.5 flex items-start justify-between gap-2"
                      style={{ background: panelG }}>
                      <div>
                        <div className="text-white font-bold text-[13px] leading-tight">{dayLabel}</div>
                        {holidayName && (
                          <div className="mt-0.5 text-white/80 text-[10px] font-semibold">🎌 {holidayName}</div>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                            {evs.length} กิจกรรม
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { closePopup(); setForm({ ...BLANK_WEVENT }); setShowAddModal(true); }}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white transition"
                          title="เพิ่มกิจกรรม"
                        >
                          <Plus size={14} />
                        </button>
                        <button onClick={closePopup}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white transition">
                          <X size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Event list */}
                    <div className="divide-y divide-gray-50 max-h-[280px] overflow-y-auto">
                      {evs.map((ev) => {
                        const pri     = WEVENT_PRIORITY[ev.priority];
                        const cat     = getCat(ev.category);
                        const evGrad  = getEventColor(ev.colorId ?? cat.defaultColor);
                        const canEdit = ev.id.startsWith('uw_') || ev.id.startsWith('task_') || ev.id.startsWith('w');

                        const isTaskEvent = ev.id.startsWith('task_');
                        const cleanSubject = ev.subject.replace(/^★\s*/, '');
                        return (
                          <div key={ev.id} className="group relative flex items-start gap-3 pl-5 pr-4 py-3 hover:bg-gray-50 transition">
                            {/* Left ribbon strip - full height gradient */}
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundImage: evGrad }} />
                            <div className="flex-1 min-w-0">
                              {/* Badges row - moved to TOP for visibility */}
                              <div className="flex flex-wrap items-center gap-1 mb-1">
                                {isTaskEvent && (
                                  <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-sm"
                                    style={{ backgroundImage: 'linear-gradient(90deg,#7c3aed,#a855f7)' }}>
                                    ★ TASK
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${cat.chip}`}>
                                  {cat.icon} {cat.label}
                                </span>
                                <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${pri.badge}`}>
                                  {pri.icon} {pri.label}
                                </span>
                              </div>
                              <div className="text-[13px] font-extrabold text-gray-800 leading-tight">{cleanSubject}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                                <Clock size={10} />
                                {ev.allDay
                                  ? <span className="bg-sky-50 text-sky-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold">ทั้งวัน</span>
                                  : <span className="font-semibold">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>
                                }
                                {ev.endDate && ev.endDate !== ev.date && (
                                  <span className="text-[9px] font-bold text-white rounded-md px-1.5 py-0.5" style={{ backgroundImage: evGrad }}>
                                    {ev.date.slice(8)}→{ev.endDate.slice(8)}
                                  </span>
                                )}
                              </div>
                              {ev.note && <div className="mt-0.5 text-[10px] italic text-gray-400 line-clamp-1">{ev.note}</div>}
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-1 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isTaskEvent && (
                                  <button
                                    onClick={() => {
                                      closePopup();
                                      onSwitchToTasks(ev.id.replace('task_', ''));
                                    }}
                                    className="h-6 w-6 flex items-center justify-center rounded-full bg-sky-50 text-sky-400 hover:bg-sky-100 hover:text-sky-600 transition"
                                    title="ไปที่ Task">
                                    <ChevronRight size={10} />
                                  </button>
                                )}
                                <button onClick={() => openEditModal(ev)}
                                  className="h-6 w-6 flex items-center justify-center rounded-full bg-violet-50 text-violet-400 hover:bg-violet-100 hover:text-violet-600 transition"
                                  title="แก้ไข">
                                  <Edit3 size={10} />
                                </button>
                                <button
                                  onClick={() => {
                                    const isTask = ev.id.startsWith('task_');
                                    const isMock = ev.id.startsWith('w');
                                    const cleanName = ev.subject.replace(/^★\s*/, '');
                                    setConfirmDel({
                                      title: isTask ? 'ลบ Task นี้?' : 'ลบกิจกรรมนี้?',
                                      message: isTask
                                        ? `"${cleanName}" จะถูกลบออกจากแท็บ Tasks ด้วย`
                                        : `"${ev.subject}" จะถูกลบออกจากปฏิทิน`,
                                      onConfirm: () => {
                                        if (isTask) {
                                          const taskId = ev.id.replace('task_', '');
                                          const updated = calTasks.filter(t => t.id !== taskId);
                                          setCalTasks(updated);
                                          try { localStorage.setItem('work-tasks', JSON.stringify(updated)); } catch {}
                                          showToast('ลบ Task แล้ว');
                                        } else if (isMock) {
                                          saveHiddenMockIds([...hiddenMockIds, ev.id]);
                                          const { [ev.id]: _, ...rest } = mockOverrides;
                                          saveMockOverrides(rest);
                                          showToast('ลบกิจกรรมแล้ว');
                                        } else {
                                          saveUserEvents(userEvents.filter(e => e.id !== ev.id));
                                          showToast('ลบกิจกรรมแล้ว');
                                        }
                                      },
                                    });
                                  }}
                                  className="h-6 w-6 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition"
                                  title="ลบ">
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex justify-between items-center">
                      <span className="text-[10px] text-gray-400">คลิก + เพื่อเพิ่มกิจกรรมใหม่</span>
                      <button
                        onClick={() => { closePopup(); setForm({ ...BLANK_WEVENT }); setShowAddModal(true); }}
                        className="text-[11px] font-bold text-violet-600 hover:text-violet-800 transition">
                        + เพิ่ม
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-2xl mx-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-white/70 text-[10px] uppercase tracking-widest">เพิ่มกิจกรรม</div>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selDayName} {selDayNum} {selMonthName} {selYear}
                  </div>
                </div>
                <button onClick={() => { setShowAddModal(false); setForm({ ...BLANK_WEVENT }); }}
                  className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
                  <X size={14} className="text-white" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 max-h-[82vh] overflow-y-auto">

                {/* ── Left column ─────────────────────────────── */}
                <div className="p-5 space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500">ข้อมูลกิจกรรม</div>

                  {/* Subject */}
                  <input type="text" placeholder="ชื่อกิจกรรม *" value={form.subject}
                    onChange={e => ff('subject', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />

                  {/* Priority */}
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-gray-400">Priority</label>
                    <div className="flex gap-2">
                      {(['High','Medium','Low'] as WEventPriority[]).map(p => (
                        <button key={p} type="button" onClick={() => ff('priority', p)}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                            form.priority === p
                              ? p === 'High' ? 'bg-rose-500 text-white shadow-sm' : p === 'Medium' ? 'bg-amber-400 text-white shadow-sm' : 'bg-slate-400 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                          }`}>{p === 'High' ? '🔴 สูง' : p === 'Medium' ? '🟡 กลาง' : '⚪ ต่ำ'}</button>
                      ))}
                    </div>
                  </div>

                  {/* Category + Custom add */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wide text-gray-400">หมวดหมู่</label>
                      <button type="button" onClick={() => setShowNewCat(v => !v)}
                        className="text-[10px] font-bold text-violet-500 hover:text-violet-700 flex items-center gap-0.5 transition">
                        <Plus size={10} /> เพิ่มหมวดหมู่
                      </button>
                    </div>
                    <select value={form.category} onChange={e => ff('category', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-violet-400">
                      <optgroup label="– หมวดหมู่มาตรฐาน –">
                        <option value="meeting">👥 Meeting</option>
                        <option value="task">✅ Task</option>
                        <option value="review">🔍 Review</option>
                        <option value="training">📖 Training</option>
                        <option value="report">📊 Report</option>
                        <option value="focus">⚡ Focus</option>
                        <option value="travel">✈️ Travel</option>
                        <option value="reminder">🔔 Reminder</option>
                        <option value="personal">💼 Personal</option>
                        <option value="event">🎪 Event</option>
                      </optgroup>
                      {customCats.length > 0 && (
                        <optgroup label="– หมวดหมู่ของฉัน –">
                          {customCats.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {/* Add new category inline */}
                    <AnimatePresence>
                    {showNewCat && (
                      <motion.div
                        key="new-cat-form"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                        className="flex gap-2">
                        <input type="text" placeholder="ชื่อหมวดหมู่ใหม่" value={form.newCatLabel}
                          onChange={e => setForm(p => ({ ...p, newCatLabel: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.nextElementSibling && (e.currentTarget.nextElementSibling as HTMLElement).focus(); }}
                          className="flex-1 rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-violet-400" />
                        <input type="text" placeholder="🏷️" value={form.newCatIcon}
                          onChange={e => setForm(p => ({ ...p, newCatIcon: e.target.value }))}
                          className="w-12 rounded-xl border border-violet-200 bg-violet-50 px-2 py-1.5 text-center text-sm outline-none focus:border-violet-400" />
                        <button type="button"
                          onClick={() => {
                            const label = form.newCatLabel.trim();
                            if (!label) return;
                            const nc: CustomCat = { id: `cc_${Date.now()}`, label, icon: form.newCatIcon.trim() || '📌' };
                            const updated = [...customCats, nc];
                            setCustomCats(updated);
                            try { localStorage.setItem('work-custom-cats', JSON.stringify(updated)); } catch {}
                            setForm(p => ({ ...p, category: nc.id, newCatLabel: '', newCatIcon: '📌' }));
                            setShowNewCat(false);
                          }}
                          className="rounded-xl bg-violet-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-600 transition shrink-0">
                          <Check size={12} />
                        </button>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>

                  {/* Note – ใหญ่ขึ้น */}
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-gray-400">หมายเหตุ</label>
                    <textarea placeholder="รายละเอียด, หมายเหตุ, หรือลิงก์..." value={form.note}
                      onChange={e => ff('note', e.target.value)} rows={4}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none leading-relaxed" />
                  </div>

                  {/* Notification toggle */}
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 hover:bg-violet-50/40 transition">
                    <div onClick={() => ff('notifyMobile', !form.notifyMobile)}
                      className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${form.notifyMobile ? 'bg-violet-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.notifyMobile ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        <Bell size={13} className={form.notifyMobile ? 'text-violet-500' : 'text-gray-400'} />
                        แจ้งเตือนไปมือถือ
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {form.notifyMobile ? '🔔 จะแจ้งเตือนก่อนกิจกรรม 15 นาที' : 'ปิดการแจ้งเตือน'}
                      </div>
                    </div>
                  </label>
                </div>

                {/* ── Right column ─────────────────────────────── */}
                <div className="p-5 space-y-4 bg-gray-50/30">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500">วันที่, เวลา & สี</div>

                  {/* DatePicker: วันเริ่มต้น */}
                  <DatePicker label="วันเริ่มต้น" value={selectedDay} onChange={v => ff('endDate', v >= (form.endDate || selectedDay) ? form.endDate : v)} />

                  {/* DatePicker: วันสิ้นสุด */}
                  <DatePicker label="วันสิ้นสุด" value={form.endDate || selectedDay} min={selectedDay}
                    onChange={v => ff('endDate', v)} />

                  {/* All-day toggle + time */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => ff('allDay', !form.allDay)}
                        className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${form.allDay ? 'bg-sky-400' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.allDay ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">ทั้งวัน</span>
                    </label>

                    {!form.allDay && (
                      <div>
                        <label className="mb-2 block text-[9px] font-bold uppercase tracking-wide text-gray-400">เวลา (24 ชม.)</label>
                        <TimeRangePicker
                          start={form.startTime} end={form.endTime}
                          onStart={v => ff('startTime', v)} onEnd={v => ff('endTime', v)} />
                      </div>
                    )}
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-wide text-gray-400">สี Gradient</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EVENT_COLORS.map(c => (
                        <button key={c.id} type="button" onClick={() => ff('colorId', c.id)} title={c.label}
                          style={{ backgroundImage: c.g }}
                          className={`h-7 rounded-full transition-all flex items-center justify-center ${
                            form.colorId === c.id
                              ? 'ring-2 ring-offset-2 ring-violet-500 scale-105 shadow-lg'
                              : 'opacity-80 hover:opacity-100 hover:scale-105'
                          }`}>
                          {form.colorId === c.id && <span className="text-white text-xs font-bold drop-shadow">✓</span>}
                        </button>
                      ))}
                    </div>
                    {/* Preview */}
                    <div className="mt-3 h-8 rounded-xl flex items-center justify-center text-white text-sm font-semibold overflow-hidden shadow-sm"
                      style={{ background: getEventColor(form.colorId) }}>
                      <span className="truncate px-3 drop-shadow text-[12px]">{form.subject || 'ตัวอย่างกิจกรรม'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={handleAddEvent} disabled={!form.subject.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition shadow-md">
                      <Check size={15} /> บันทึก
                    </button>
                    <button type="button" onClick={() => { setShowAddModal(false); setForm({ ...BLANK_WEVENT }); setShowNewCat(false); }}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Event Modal – Google Calendar style ── */}
      <AnimatePresence>
        {editModalEvent && (() => {
          const isUserEv = editModalEvent.id.startsWith('uw_') || editModalEvent.id.startsWith('w');
          const isTaskEv = editModalEvent.id.startsWith('task_');
          const catKey   = (isUserEv ? editForm.category : editModalEvent.category) as WEventCategory;
          const headerGrad = getEventColor(isUserEv ? (editForm.colorId ?? getCat(catKey).defaultColor) : getCat(catKey).defaultColor);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={() => setEditModalEvent(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-lg mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-5 py-4 flex items-start justify-between gap-2" style={{ background: headerGrad }}>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5">
                      {isTaskEv ? '★ งานจาก Tasks Tab' : 'แก้ไขกิจกรรม'}
                    </div>
                    <input
                      type="text"
                      value={editForm.subject}
                      onChange={e => setEditForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="ชื่อกิจกรรม"
                      className="w-full bg-transparent text-white text-base font-bold placeholder-white/50 outline-none border-b border-white/25 pb-1 focus:border-white/60 transition"
                      autoFocus
                    />
                  </div>
                  <button onClick={() => setEditModalEvent(null)}
                    className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/35 transition ml-2 shrink-0">
                    <X size={13} className="text-white" />
                  </button>
                </div>

                <div className="p-5 space-y-4 max-h-[66vh] overflow-y-auto">

                  {/* Category chips – user events only */}
                  {isUserEv && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-2">หมวดหมู่</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {(Object.keys(WEVENT_CAT) as WEventCategory[]).map(cat => {
                          const c   = WEVENT_CAT[cat];
                          const sel = editForm.category === cat;
                          return (
                            <button key={cat} type="button"
                              onClick={() => setEditForm(p => ({ ...p, category: cat, colorId: c.defaultColor as EventColorId }))}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition ${
                                sel ? 'border-transparent shadow-md' : 'border-gray-100 hover:border-gray-200'
                              }`}
                              style={sel ? { background: getEventColor(c.defaultColor) } : {}}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${sel ? 'bg-white/30' : c.bar}`}>
                                <span className="text-white">{c.icon}</span>
                              </div>
                              <span className={`text-[8px] font-bold leading-none ${sel ? 'text-white' : 'text-gray-500'}`}>{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Priority */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Priority</label>
                    <div className="flex gap-2">
                      {(['High','Medium','Low'] as WEventPriority[]).map(p => (
                        <button key={p} type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, priority: p }))}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                            editForm.priority === p
                              ? p === 'High' ? 'bg-rose-500 text-white shadow-sm' : p === 'Medium' ? 'bg-amber-400 text-white shadow-sm' : 'bg-slate-400 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                          }`}>{p === 'High' ? '🔴 สูง' : p === 'Medium' ? '🟡 กลาง' : '⚪ ต่ำ'}</button>
                      ))}
                    </div>
                  </div>

                  {/* Task-specific: Status + Progress */}
                  {isTaskEv && editTaskExtra && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Status</label>
                        <select value={editTaskExtra.status}
                          onChange={e => setEditTaskExtra(p => p ? { ...p, status: e.target.value as TaskItem['status'] } : null)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-violet-400">
                          {(['In Progress','On Track','Planned','Waiting','On Hold','Completed','Overdue','Rejected'] as TaskItem['status'][]).map(s => (
                            <option key={s} value={s}>{s === 'Completed' ? '✓ Completed' : s === 'Overdue' ? '⚠ Overdue' : s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Progress</label>
                          <span className="text-base font-extrabold text-violet-600">{editTaskExtra.progress}%</span>
                        </div>
                        <input type="range" min={0} max={100} step={5}
                          value={editTaskExtra.progress}
                          onChange={e => setEditTaskExtra(p => p ? { ...p, progress: parseInt(e.target.value) } : null)}
                          className="w-full accent-violet-500" />
                        <div className="mt-2 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${editTaskExtra.progress}%`,
                            backgroundImage:
                              editTaskExtra.progress <= 20
                                ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                                : editTaskExtra.progress <= 60
                                ? 'linear-gradient(90deg,#ef4444,#f59e0b)'
                                : editTaskExtra.progress < 100
                                ? 'linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)'
                                : 'linear-gradient(90deg,#22c55e,#16a34a)',
                          }} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* User event-specific: end date, time, note, color */}
                  {isUserEv && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wide text-gray-400 block mb-1">วันเริ่มต้น</label>
                          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-400 flex items-center gap-1.5">
                            <Calendar size={13} className="text-violet-300" />
                            {new Date(editModalEvent.date + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <DatePicker label="วันสิ้นสุด" value={editForm.endDate || editModalEvent.date}
                          min={editModalEvent.date}
                          onChange={v => setEditForm(p => ({ ...p, endDate: v }))} />
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <div onClick={() => setEditForm(p => ({ ...p, allDay: !p.allDay }))}
                          className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${editForm.allDay ? 'bg-sky-400' : 'bg-gray-300'}`}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${editForm.allDay ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-600">ทั้งวัน</span>
                      </label>

                      {!editForm.allDay && (
                        <TimeRangePicker
                          start={editForm.startTime} end={editForm.endTime}
                          onStart={v => setEditForm(p => ({ ...p, startTime: v }))}
                          onEnd={v => setEditForm(p => ({ ...p, endTime: v }))} />
                      )}

                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">หมายเหตุ</label>
                        <textarea value={editForm.note} onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))}
                          placeholder="รายละเอียด..." rows={3}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-violet-400 resize-none" />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wide text-gray-400 block mb-2">สี Gradient</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {EVENT_COLORS.map(c => (
                            <button key={c.id} type="button"
                              onClick={() => setEditForm(p => ({ ...p, colorId: c.id as EventColorId }))}
                              style={{ backgroundImage: c.g }}
                              className={`h-7 rounded-full transition-all flex items-center justify-center ${
                                editForm.colorId === c.id ? 'ring-2 ring-offset-1 ring-violet-500 scale-105 shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-105'
                              }`}>
                              {editForm.colorId === c.id && <span className="text-white text-[10px] font-bold drop-shadow">✓</span>}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 h-7 rounded-xl overflow-hidden shadow-sm flex items-center justify-center"
                          style={{ background: getEventColor(editForm.colorId) }}>
                          <span className="text-white text-[11px] font-semibold drop-shadow px-2 truncate">{editForm.subject || 'ตัวอย่าง'}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                  {isUserEv ? (
                    <button onClick={deleteEditModal}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 transition px-3 py-2 rounded-xl hover:bg-rose-50">
                      <X size={13} /> ลบกิจกรรม
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic px-1">บันทึก → อัปเดต Tasks Tab</span>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setEditModalEvent(null)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition">
                      ยกเลิก
                    </button>
                    <button onClick={saveEditModal} disabled={!editForm.subject.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition shadow-md"
                      style={{ background: headerGrad }}>
                      <Check size={14} /> บันทึก
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Crucial Tasks + Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Crucial Tasks" subtitle="Top priority — คลิกเพื่อดูรายละเอียด"
          action={<span className="text-[10px] text-purple-400 font-medium">Click to view</span>}>
          <div className="space-y-2">
            {(() => {
              const colors = ['rose', 'orange', 'emerald', 'sky'];
              const dots = ['bg-rose-500', 'bg-orange-500', 'bg-emerald-500', 'bg-sky-500'];
              const crucial = calTasks
                .filter(t => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Overdue' && !!t.deadline)
                .sort((a, b) => a.deadline.localeCompare(b.deadline))
                .slice(0, 4);
              if (crucial.length === 0) {
                return <div className="text-center py-6 text-xs text-gray-400">ไม่มี Task สำคัญ — เพิ่มในแท็บ Tasks</div>;
              }
              return crucial.map((t, i) => {
                const days = daysUntil(t.deadline);
                const daysBadge = days <= 3 ? 'bg-rose-100 text-rose-700' : days <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                const crucialTask: CrucialTask = {
                  title: t.name,
                  priority: (t.priority === 'High' ? 'High' : t.priority === 'Med' ? 'Med' : 'Low') as CrucialTask['priority'],
                  deadline: t.deadline,
                  status: t.status,
                  owner: t.members.split(',')[0]?.trim() || 'Team',
                  tag: t.group || 'Task',
                  color: colors[i % colors.length] as CrucialTask['color'],
                  desc: t.description,
                };
                return (
                  <motion.div key={t.id} variants={fadeUp}
                    onClick={() => setSelectedTask(crucialTask)}
                    className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-purple-50 hover:shadow-sm transition cursor-pointer group border border-transparent hover:border-purple-100">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dots[i % dots.length]}`} />
                    <div className="text-xs text-gray-700 flex-1 font-semibold">{t.name}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${daysBadge} shrink-0`}>
                      {days <= 0 ? 'Overdue' : `${days}d`}
                    </span>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-purple-400 transition shrink-0" />
                  </motion.div>
                );
              });
            })()}
          </div>
        </SectionCard>

        <SectionCard title="Reminders" subtitle="What's coming up"
          action={
            <button
              onClick={async () => {
                if (!('Notification' in window)) { showToast('Browser ไม่รองรับการแจ้งเตือน'); return; }
                if (Notification.permission === 'granted') {
                  new Notification('Alpha Trader Work', { body: 'การแจ้งเตือนพร้อมใช้งาน ✓' });
                  showToast('แจ้งเตือนส่งแล้ว');
                } else {
                  const p = await Notification.requestPermission();
                  if (p === 'granted') {
                    setNotifGranted(true);
                    new Notification('Alpha Trader Work', { body: 'เปิดการแจ้งเตือนเรียบร้อยแล้ว 🔔' });
                    showToast('เปิดการแจ้งเตือนแล้ว!');
                  } else {
                    showToast('ไม่อนุญาตการแจ้งเตือน');
                  }
                }
              }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-violet-500 text-white font-bold hover:bg-violet-600 transition shadow-sm">
              <Bell size={11} />
              {notifGranted || (typeof window !== 'undefined' && Notification.permission === 'granted') ? 'แจ้งเตือน' : 'เปิดแจ้งเตือน'}
            </button>
          }>
          <div className="space-y-2">
            {[
              { name: 'Team Sync at 14:00',    tag: 'Daily',  color: 'sky'     },
              { name: 'Stock Audit prep',      tag: 'Weekly', color: 'emerald' },
              { name: 'Samsung Report due',    tag: 'Jun 25', color: 'rose'    },
              { name: 'Service Day – Central', tag: 'Jun 30', color: 'orange'  },
            ].map((r, i) => {
              const tone = TONE_BG[r.color as ToneKey];
              return (
                <motion.div key={i} variants={fadeUp}
                  className={`flex items-center gap-2 p-2.5 rounded-lg ${tone.bg} cursor-pointer`}
                  onClick={() => {
                    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
                      new Notification('Reminder', { body: r.name });
                      showToast(`แจ้งเตือน: ${r.name}`);
                    } else {
                      showToast(`${r.name} — ${r.tag}`);
                    }
                  }}>
                  <Bell size={14} className={tone.text} />
                  <div className="text-xs font-medium text-gray-800 flex-1">{r.name}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-white ${tone.text} font-semibold`}>{r.tag}</span>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Deadlines + Completion + Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Upcoming Deadlines" subtitle="คลิกเพื่อดูรายละเอียด">
          <div className="space-y-3">
            {UPCOMING_DEADLINES.map((d, i) => {
              const days = daysUntil(d.isoDate);
              const isUrgent = days <= 3;
              const isWarning = days > 3 && days <= 7;
              const containerCls = isUrgent
                ? 'border border-rose-200 bg-rose-50 hover:bg-rose-100'
                : isWarning
                ? 'border border-orange-200 bg-orange-50 hover:bg-orange-100'
                : 'hover:bg-purple-50';
              const iconCls   = isUrgent ? 'bg-rose-100' : isWarning ? 'bg-orange-100' : 'bg-purple-100';
              const iconColor = isUrgent ? 'text-rose-600' : isWarning ? 'text-orange-500' : 'text-purple-700';
              const dayText   = days < 0 ? `เลย ${Math.abs(days)}d` : days === 0 ? 'วันนี้!' : `${days} วัน`;
              const dayBadge  = isUrgent ? 'bg-rose-500 text-white' : isWarning ? 'bg-orange-400 text-white' : 'bg-purple-100 text-purple-700';
              const displayDate = new Date(d.isoDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const crucialTask = CRUCIAL_TASKS_DATA.find(t => t.tag === d.tag);
              return (
                <motion.div key={i} variants={fadeUp}
                  onClick={() => { if (crucialTask) setSelectedTask(crucialTask); }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer ${containerCls}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconCls}`}>
                    {isUrgent ? <AlertTriangle size={14} className={iconColor} /> : <FileText size={14} className={iconColor} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${isUrgent ? 'text-rose-800' : 'text-gray-800'}`}>{d.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isUrgent ? 'text-rose-500' : 'text-gray-500'}`}>{d.tag} · {displayDate}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${dayBadge}`}>{dayText}</span>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Completion Overview" subtitle="By Category">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={COMPLETION_BY_CAT} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                {COMPLETION_BY_CAT.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {COMPLETION_BY_CAT.map(c => (
              <div key={c.name} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-gray-700">{c.name} {c.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Task Completion Trend" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TASK_TREND}>
              <defs>
                <linearGradient id="trendG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9ff" />
              <XAxis dataKey="d" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="v" stroke="#7c5cbf" strokeWidth={2.5} fill="url(#trendG)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Day Modal */}
      <AnimatePresence>
        {modalDay && (
          <WorkDayModal date={modalDay} existing={dayEntries[modalDay] ?? null} onSave={handleSave} onClose={() => setModalDay(null)} />
        )}
      </AnimatePresence>

      {/* Task Detail Modal (Crucial Tasks / Deadlines) */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDel(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-sm mx-4 overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="px-6 pt-6 pb-3 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                  <AlertTriangle size={26} className="text-rose-500" />
                </div>
                <h3 className="text-base font-extrabold text-gray-800">{confirmDel.title}</h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{confirmDel.message}</p>
              </div>
              <div className="px-5 pb-5 pt-2 flex gap-2">
                <button onClick={() => setConfirmDel(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                  ยกเลิก
                </button>
                <button onClick={() => { confirmDel.onConfirm(); setConfirmDel(null); }}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 text-white text-sm font-bold hover:opacity-90 transition shadow-md">
                  ลบ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Task type ───────────────────────────────────────────────────────
interface TaskItem {
  id: string;
  name: string;
  description?: string;
  status: 'In Progress' | 'On Track' | 'Planned' | 'Waiting' | 'Rejected' | 'On Hold' | 'Completed' | 'Overdue';
  priority: 'High' | 'Med' | 'Low';
  deadline: string;
  startDate?: string;
  people: number;
  members?: string;
  group: string;
  progress: number;
}
function seedTasks(): TaskItem[] {
  return TASKS_LIST.map((t, i) => ({
    id: `ut_${i}`,
    name: t.name,
    description: t.description,
    status: t.status as TaskItem['status'],
    priority: t.priority as TaskItem['priority'],
    deadline: t.deadline,
    startDate: t.startDate,
    people: t.people,
    members: t.members,
    group: t.group,
    progress: t.progress,
  }));
}
function loadTasks(): TaskItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('work-tasks');
    return raw ? JSON.parse(raw) : seedTasks();
  } catch { return seedTasks(); }
}
const TASK_STATUS_STYLE: Record<TaskItem['status'], string> = {
  'In Progress': 'bg-sky-100 text-sky-700',
  'On Track':    'bg-emerald-100 text-emerald-700',
  'Planned':     'bg-violet-100 text-violet-700',
  'Waiting':     'bg-amber-100 text-amber-700',
  'Rejected':    'bg-rose-100 text-rose-700',
  'On Hold':     'bg-slate-100 text-slate-600',
  'Completed':   'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
  'Overdue':     'bg-rose-100 text-rose-700 ring-1 ring-rose-300',
};

// ─── Tab: Tasks ───────────────────────────────────────────────────────
const STATUS_PROGRESS: Record<TaskItem['status'], number> = {
  'Planned': 10, 'On Hold': 20, 'Waiting': 35, 'In Progress': 60, 'On Track': 80, 'Completed': 100, 'Overdue': 0, 'Rejected': 0,
};

function TasksTab({ showToast, jumpTaskId, onClearJump }: { showToast: (msg: string) => void; jumpTaskId?: string | null; onClearJump?: () => void }) {
  const [search, setSearch] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasks());

  useEffect(() => {
    if (!jumpTaskId) return;
    setHighlightId(jumpTaskId);
    setTimeout(() => {
      document.getElementById(`task-row-${jumpTaskId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    const t = setTimeout(() => { setHighlightId(null); onClearJump?.(); }, 2400);
    return () => clearTimeout(t);
  }, [jumpTaskId]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [newGroupInput, setNewGroupInput] = useState('');
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [customGroups, setCustomGroups] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('work-custom-groups') || '[]'); } catch { return []; }
  });

  const emptyForm: Omit<TaskItem, 'id'> = { name: '', description: '', status: 'In Progress', priority: 'High', deadline: '', startDate: '', people: 1, members: '', group: '', progress: 0 };

  const [taskForm, setTaskForm] = useState<Omit<TaskItem, 'id'>>(emptyForm);

  const allGroups = [...TASK_GROUPS, ...customGroups.filter(g => !TASK_GROUPS.includes(g))];

  const addCustomGroup = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || allGroups.includes(trimmed)) return;
    const updated = [...customGroups, trimmed];
    setCustomGroups(updated);
    try { localStorage.setItem('work-custom-groups', JSON.stringify(updated)); } catch {}
    setTaskForm(p => ({ ...p, group: trimmed }));
    setNewGroupInput('');
    setShowGroupInput(false);
  };

  const closeModal = () => {
    setShowAddTask(false);
    setEditingTask(null);
    setTaskForm(emptyForm);
    setNewGroupInput('');
    setShowGroupInput(false);
  };

  useEscClose(closeModal, showAddTask);

  const saveTasks = (updated: TaskItem[]) => {
    setTasks(updated);
    try { localStorage.setItem('work-tasks', JSON.stringify(updated)); } catch {}
  };

  // Auto-update status: progress=100% → Completed, past deadline → Overdue
  useEffect(() => {
    const todayMs = new Date().setHours(0, 0, 0, 0);
    let changed = false;
    const updated = tasks.map(t => {
      if (t.progress >= 100 && t.status !== 'Completed') {
        changed = true;
        return { ...t, status: 'Completed' as const };
      }
      if (t.progress < 100 && t.status !== 'Overdue' && t.status !== 'Completed' && t.deadline) {
        if (new Date(t.deadline + 'T00:00:00').getTime() < todayMs) {
          changed = true;
          return { ...t, status: 'Overdue' as const };
        }
      }
      // Revert Overdue if deadline was extended to future
      if (t.status === 'Overdue' && t.deadline) {
        if (new Date(t.deadline + 'T00:00:00').getTime() >= todayMs) {
          changed = true;
          return { ...t, status: 'In Progress' as const };
        }
      }
      return t;
    });
    if (changed) saveTasks(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = tasks
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.progress - b.progress);

  const statusCounts = {
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    inPlanning: tasks.filter(t => t.status === 'Planned').length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    overdue:    tasks.filter(t => t.status === 'Overdue').length,
    waiting:    tasks.filter(t => t.status === 'Waiting').length,
    onHold:     tasks.filter(t => t.status === 'On Hold').length,
    onTrack:    tasks.filter(t => t.status === 'On Track').length,
  };

  const autoStatus = (form: Omit<TaskItem, 'id'>): TaskItem['status'] => {
    const todayMs = new Date().setHours(0, 0, 0, 0);
    if (form.progress >= 100) return 'Completed';
    if (form.deadline && new Date(form.deadline + 'T00:00:00').getTime() < todayMs && form.progress < 100) return 'Overdue';
    if (form.status === 'Overdue' && form.deadline && new Date(form.deadline + 'T00:00:00').getTime() >= todayMs) return 'In Progress';
    return form.status;
  };

  const handleSaveTask = () => {
    if (!taskForm.name.trim()) return;
    const resolved = { ...taskForm, status: autoStatus(taskForm), name: taskForm.name.trim() };
    if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...resolved } : t));
      showToast('บันทึก Task แล้ว ✓');
    } else {
      saveTasks([...tasks, { id: `ut_${Date.now()}`, ...resolved }]);
      showToast('เพิ่ม Task แล้ว ✓');
    }
    closeModal();
  };

  const handleDeleteTask = (id: string) => saveTasks(tasks.filter(t => t.id !== id));

  const handleOpenTask = (t: TaskItem) => {
    setEditingTask(t);
    setTaskForm({ name: t.name, status: t.status, priority: t.priority, deadline: t.deadline, startDate: t.startDate ?? '', people: t.people, members: t.members ?? '', group: t.group ?? '', progress: t.progress ?? 0 });
    setShowAddTask(true);
  };

  const tf = <K extends keyof typeof taskForm>(k: K, v: typeof taskForm[K]) =>
    setTaskForm(p => ({ ...p, [k]: v }));

  const TASK_KPI = [
    { label: 'Total',       value: statusCounts.total,      sub: 'tasks',     grad: 'from-teal-400 to-emerald-500',   icon: Layers },
    { label: 'In Progress', value: statusCounts.inProgress, sub: 'active',    grad: 'from-violet-500 to-purple-600',  icon: Activity },
    { label: 'Planned',     value: statusCounts.inPlanning, sub: 'queued',    grad: 'from-sky-400 to-blue-500',       icon: BookOpen },
    { label: 'Completed',   value: statusCounts.completed,  sub: 'done',      grad: 'from-emerald-400 to-teal-600',   icon: CheckCircle2 },
    { label: 'Overdue',     value: statusCounts.overdue,    sub: 'late',      grad: 'from-rose-500 to-red-600',       icon: AlertTriangle },
    { label: 'Waiting',     value: statusCounts.waiting,    sub: 'on hold',   grad: 'from-blue-500 to-indigo-600',    icon: Clock },
    { label: 'On Hold',     value: statusCounts.onHold,     sub: 'paused',    grad: 'from-amber-400 to-orange-500',   icon: Minus },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">

      {/* ── KPI Cards – full-gradient style ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {TASK_KPI.map(k => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label} variants={fadeUp}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.18 } }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${k.grad} p-4 shadow-lg hover:shadow-xl transition-all cursor-default`}
            >
              {/* Soft glow overlay */}
              <div className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none" />
              {/* Decorative circle */}
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

              <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest truncate">{k.label}</div>
                  <div className="mt-2 text-3xl font-extrabold text-white leading-none">{k.value}</div>
                  <div className="text-[10px] text-white/70 font-semibold mt-1">{k.sub}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ml-1">
                  <Icon size={16} className="text-white" />
                </div>
              </div>
              {/* Bottom sparkline decoration */}
              <div className="mt-3 h-[2px] bg-white/25 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full" style={{ width: `${Math.min(100, (k.value / Math.max(statusCounts.total, 1)) * 100)}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <SectionCard title="Task List" subtitle={`Showing ${filtered.length} of ${tasks.length} tasks`}
        action={
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-40 outline-none focus:border-violet-300" />
            </div>
            <button className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-100 text-xs flex items-center gap-1 text-gray-500">
              <Filter size={11} /> Filter
            </button>
            <button onClick={() => setShowAddTask(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold flex items-center gap-1 hover:opacity-90 transition">
              <Plus size={11} /> Add Task
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="text-left py-2 min-w-[90px]">Start</th>
                <th className="text-left py-2 min-w-[90px]">Due</th>
                <th className="text-left py-2 min-w-[72px]">เหลือ</th>
                <th className="text-left py-2">Task</th>
                <th className="text-left py-2 min-w-[160px]">Description</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2 min-w-[110px]">Progress</th>
                <th className="text-left py-2">Priority</th>
                <th className="text-left py-2">People</th>
                <th className="text-right py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <motion.tr key={t.id} id={`task-row-${t.id}`} variants={fadeUp}
                  className={`border-b border-gray-50 hover:bg-purple-50/30 transition group ${highlightId === t.id ? 'bg-violet-100/70 ring-2 ring-inset ring-violet-400 rounded-sm' : ''}`}>
                  {/* Start column */}
                  <td className="py-3 min-w-[90px]">
                    {t.startDate
                      ? <span className="text-[11px] text-gray-600 font-medium">{fmtDate(t.startDate)}</span>
                      : <span className="text-[10px] text-gray-300 italic">—</span>}
                  </td>
                  {/* Due column */}
                  <td className="py-3 min-w-[90px]">
                    {(() => {
                      const d = daysLeftFromDeadline(t.deadline);
                      const overdue = d !== null && d < 0 && t.progress < 100;
                      return t.deadline
                        ? <span className={`text-[11px] font-semibold ${overdue ? 'text-rose-600' : 'text-gray-700'}`}>{fmtDate(t.deadline)}</span>
                        : <span className="text-[10px] text-gray-300 italic">—</span>;
                    })()}
                  </td>
                  {/* Days Left column */}
                  <td className="py-3 min-w-[72px]">
                    {(() => {
                      const d = daysLeftFromDeadline(t.deadline);
                      if (d === null) return <span className="text-[10px] text-gray-300 italic">—</span>;
                      if (t.progress >= 100) return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Done</span>;
                      const overdue = d < 0;
                      const warn = d >= 0 && d <= 7;
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          overdue ? 'bg-rose-100 text-rose-700' :
                          warn    ? 'bg-amber-100 text-amber-700' :
                                    'bg-emerald-50 text-emerald-700'
                        }`}>
                          {overdue ? `เลย ${Math.abs(d)}d` : d === 0 ? 'วันนี้!' : `${d}d`}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 min-w-[160px]">
                    <div className="font-semibold text-gray-800 text-xs leading-tight">{t.name}</div>
                    {t.group && <div className="text-[10px] text-violet-500 mt-0.5 font-semibold">{t.group}</div>}
                  </td>
                  <td className="py-3 min-w-[180px]">
                    {t.description
                      ? <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{t.description}</p>
                      : <span className="text-[10px] text-gray-300 italic">—</span>
                    }
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TASK_STATUS_STYLE[t.status] ?? 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                  </td>
                  <td className="py-3 min-w-[110px]">
                    {(() => {
                      const pct = t.progress ?? 0;
                      const d = daysLeftFromDeadline(t.deadline);
                      const overdue = d !== null && d < 0 && pct < 100;
                      const d2 = daysLeftFromDeadline(t.deadline);
                      const warn2 = d2 !== null && d2 >= 0 && d2 <= 7 && pct < 100;
                      const barColor = overdue ? '#f43f5e' : pct >= 100 ? '#10b981' : pct >= 60 ? '#7c3aed' : pct >= 30 ? '#f59e0b' : '#d1d5db';
                      const trackColor = overdue ? '#fee2e2' : warn2 ? '#fef3c7' : '#f3f4f6';
                      return (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full overflow-hidden flex-1 max-w-[70px]" style={{ background: trackColor }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                          <span className={`text-[10px] font-bold ${overdue ? 'text-rose-500' : warn2 ? 'text-amber-600' : 'text-gray-500'}`}>{pct}%</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                      t.priority === 'Med'  ? 'bg-amber-100 text-amber-700' :
                                              'bg-slate-100 text-slate-600'
                    }`}>{t.priority}</span>
                  </td>
                  <td className="py-3">
                    {(() => {
                      const memberList = t.members?.split(',').map(m => m.trim()).filter(Boolean) ?? [];
                      const displayNames = memberList.length > 0 ? memberList : Array.from({length: t.people}, (_, j) => String.fromCharCode(65 + j));
                      const colors = ['bg-violet-400','bg-emerald-400','bg-sky-400','bg-fuchsia-400','bg-amber-400'];
                      const shown = displayNames.slice(0, 3);
                      const extra = displayNames.length - 3;
                      return (
                        <div className="relative flex -space-x-2 group/people">
                          {shown.map((name, j) => (
                            <div key={j} className={`w-6 h-6 rounded-full ring-2 ring-white text-[9px] text-white flex items-center justify-center font-bold ${colors[j % colors.length]}`}>
                              {taskInitials(name)}
                            </div>
                          ))}
                          {extra > 0 && <div className="w-6 h-6 rounded-full ring-2 ring-white bg-gray-200 text-[9px] text-gray-600 flex items-center justify-center font-bold">+{extra}</div>}
                          {/* Styled tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/people:flex flex-col gap-1 bg-gray-900 text-white text-[10px] rounded-xl px-3 py-2.5 shadow-xl z-50 whitespace-nowrap min-w-[110px] pointer-events-none">
                            {displayNames.map((name, j) => (
                              <div key={j} className="flex items-center gap-1.5">
                                <div className={`w-4 h-4 rounded-full text-[7px] text-white flex items-center justify-center font-bold shrink-0 ${colors[j % colors.length]}`}>{taskInitials(name)}</div>
                                <span className="font-medium">{name}</span>
                              </div>
                            ))}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenTask(t)}
                        className="h-7 w-7 flex items-center justify-center rounded-full bg-violet-50 text-violet-400 hover:bg-violet-100 hover:text-violet-600 transition"
                        title="แก้ไข">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => handleDeleteTask(t.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                        title="ลบ">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Add Task Modal ── */}
      <AnimatePresence>
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-lg mx-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-white/70 text-[10px] uppercase tracking-widest">Task Management</div>
                  <div className="text-white font-bold text-sm mt-0.5">{editingTask ? 'แก้ไข Task' : 'เพิ่ม Task ใหม่'}</div>
                </div>
                <button onClick={closeModal}
                  className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
                  <X size={14} className="text-white" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Task Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Task Name *</label>
                  <input type="text" placeholder="ชื่องาน / หัวข้อ Task" value={taskForm.name}
                    onChange={e => tf('name', e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Description</label>
                  <textarea placeholder="รายละเอียดงาน / scope หรือ note สั้นๆ" value={taskForm.description ?? ''}
                    onChange={e => tf('description', e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none" />
                </div>

                {/* Status + Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Status</label>
                    <select value={taskForm.status} onChange={e => tf('status', e.target.value as TaskItem['status'])}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-violet-400">
                      <option value="In Progress">In Progress</option>
                      <option value="On Track">On Track</option>
                      <option value="Planned">Planned</option>
                      <option value="Waiting">Waiting</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">✓ Completed</option>
                      <option value="Overdue">⚠ Overdue</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Priority</label>
                    <div className="flex gap-2">
                      {(['High','Med','Low'] as TaskItem['priority'][]).map(p => (
                        <button key={p} type="button" onClick={() => tf('priority', p)}
                          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                            taskForm.priority === p
                              ? p === 'High' ? 'bg-rose-500 text-white shadow-sm'
                                : p === 'Med' ? 'bg-amber-400 text-white shadow-sm'
                                : 'bg-slate-400 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                          }`}>{p === 'High' ? '🔴' : p === 'Med' ? '🟡' : '⚪'} {p}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Start + Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Start Date</label>
                    <input type="date" value={taskForm.startDate ?? ''} onChange={e => tf('startDate', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">Deadline *</label>
                    <input type="date" value={taskForm.deadline} onChange={e => tf('deadline', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-violet-400" />
                  </div>
                </div>

                {/* Group */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">กลุ่มงาน</label>
                  <div className="flex gap-2">
                    <select value={taskForm.group} onChange={e => tf('group', e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-violet-400">
                      <option value="">-- เลือกกลุ่ม --</option>
                      {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowGroupInput(v => !v)}
                      className="px-3 py-2.5 rounded-xl border border-violet-200 text-violet-600 text-xs font-bold hover:bg-violet-50 transition shrink-0">+ ใหม่</button>
                  </div>
                  {showGroupInput && (
                    <div className="mt-2 flex gap-2">
                      <input type="text" placeholder="ชื่อกลุ่มงานใหม่" value={newGroupInput}
                        onChange={e => setNewGroupInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomGroup(newGroupInput)}
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400" />
                      <button type="button" onClick={() => addCustomGroup(newGroupInput)}
                        className="px-3 py-2 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 transition">เพิ่ม</button>
                    </div>
                  )}
                </div>

                {/* Progress slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Progress</label>
                    <span className={`text-sm font-extrabold ${taskForm.progress >= 100 ? 'text-emerald-600' : taskForm.progress >= 60 ? 'text-violet-600' : taskForm.progress >= 30 ? 'text-amber-500' : 'text-gray-400'}`}>{taskForm.progress}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={taskForm.progress}
                    onChange={e => tf('progress', parseInt(e.target.value))}
                    className="w-full" />
                  <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{
                      width: `${taskForm.progress}%`,
                      background: taskForm.progress >= 100 ? '#10b981' : taskForm.progress >= 60 ? '#7c3aed' : taskForm.progress >= 30 ? '#f59e0b' : '#d1d5db',
                    }} />
                  </div>
                </div>

                {/* Members */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1.5">สมาชิก (คั่นด้วย ,)</label>
                  <input type="text" placeholder="เช่น Alice T, Bob K, Charlie R" value={taskForm.members ?? ''}
                    onChange={e => tf('members', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-violet-400" />
                  {taskForm.members && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {taskForm.members.split(',').map(m => m.trim()).filter(Boolean).map((name, j) => {
                        const colors = ['bg-violet-400','bg-emerald-400','bg-sky-400','bg-fuchsia-400','bg-amber-400'];
                        return (
                          <div key={j} className={`flex items-center gap-1 px-2 py-1 rounded-full ${colors[j % colors.length]} text-white text-[10px] font-bold`}>
                            <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[8px]">{taskInitials(name)}</span>
                            {name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                    ยกเลิก
                  </button>
                  <button onClick={handleSaveTask} disabled={!taskForm.name.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition shadow-md flex items-center justify-center gap-2">
                    <Check size={15} /> บันทึก Task
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// ─── Tab: Estimator ───────────────────────────────────────────────────
function EstimatorTab({ showToast }: { showToast: (msg: string) => void }) {
  const [device, setDevice] = useState('Galaxy Z Fold 6');
  const partsTotal = REPAIR_PARTS.reduce((s, p) => s + p.total, 0);
  const labor = 1500;
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Select Repair Details" subtitle="Device & Service" className="xl:col-span-1">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700">Device Category</label>
              <select className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                <option>Smartphone</option><option>Tablet</option><option>Watch</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Model</label>
              <select value={device} onChange={e => setDevice(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                <option>Galaxy Z Fold 6</option><option>Galaxy S24 Ultra</option><option>Galaxy A25</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Service Type</label>
              <select className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                <option>Display Replacement</option><option>Battery Replacement</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
              <span className="text-xs text-gray-700">Out of Warranty</span>
              <button className="w-9 h-5 rounded-full bg-purple-500 relative">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <button onClick={() => showToast('Estimate calculated')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90">
              <Zap size={13} /> Generate Estimate
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Estimator Result" subtitle={`Galaxy Z Fold 6`} className="xl:col-span-2"
          action={
            <button onClick={() => showToast('Quote exported')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1">
              <Download size={11} /> Export
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="text-left py-2">Part Name</th>
                  <th className="text-right py-2">Part Price</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {REPAIR_PARTS.map((p, i) => (
                  <motion.tr key={i} variants={fadeUp}
                    className="border-b border-gray-50 hover:bg-purple-50/30">
                    <td className="py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 text-right text-gray-600 stat-num">฿{p.price.toLocaleString()}</td>
                    <td className="py-3 text-center text-gray-600">{p.qty}</td>
                    <td className="py-3 text-right font-bold text-purple-700 stat-num">฿{p.total.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50">
                  <td className="py-3 font-semibold text-gray-700">Labor Cost</td>
                  <td colSpan={2} />
                  <td className="py-3 text-right font-bold text-purple-700 stat-num">฿{labor.toLocaleString()}</td>
                </tr>
                <tr className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                  <td className="py-3 px-2 font-bold">Estimated Total (Incl. Labor)</td>
                  <td colSpan={2} />
                  <td className="py-3 px-2 text-right text-lg font-bold stat-num">฿{(partsTotal + labor).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
            <div className="text-[11px] uppercase tracking-wider text-orange-700 font-bold mb-1">Repair Remarks</div>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>· Genuine parts only, OEM certified</li>
              <li>· 6-month warranty on replaced parts</li>
              <li>· Estimated turnaround: 3-5 business days</li>
            </ul>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Most Reported Symptoms" subtitle="Common issues this month">
          <div className="space-y-2.5">
            {SYMPTOMS.slice(0, 4).map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="text-gray-500 stat-num">{s.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-purple-50 rounded-full h-1.5">
                  <motion.div className="bg-purple-500 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct * 2.5}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Highest Cost Repairs" subtitle="Top-tier repairs">
          <div className="text-center py-3">
            <div className="text-3xl font-bold text-purple-700 stat-num">฿46,850</div>
            <div className="text-xs text-gray-500 mt-1">Galaxy Z Fold 6</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-purple-50 rounded-lg">
                <div className="text-gray-500">Avg</div>
                <div className="font-bold text-purple-700 stat-num">฿18,420</div>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <div className="text-gray-500">Min</div>
                <div className="font-bold text-emerald-700 stat-num">฿3,200</div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Common Models" subtitle="Highest repair count">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={COMMON_MODELS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9ff" />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={60} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="value" fill="#a78bfa" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Repair Workflow" subtitle="Step-by-step service process">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { step: 'Check-in',          icon: '📥', tone: 'from-violet-400 to-purple-500' },
            { step: 'Symptom Detection', icon: '🔍', tone: 'from-sky-400 to-blue-500' },
            { step: 'Estimate Approved', icon: '✅', tone: 'from-emerald-400 to-teal-500' },
            { step: 'Repair',             icon: '🔧', tone: 'from-orange-400 to-pink-500' },
            { step: 'Quality Check',     icon: '⭐', tone: 'from-rose-400 to-fuchsia-500' },
          ].map((w, i) => (
            <motion.div key={i} variants={fadeUp}
              className={`p-4 rounded-xl bg-gradient-to-br ${w.tone} text-white text-center cursor-pointer hover:shadow-md transition`}>
              <div className="text-3xl mb-2">{w.icon}</div>
              <div className="text-[11px] uppercase tracking-wider opacity-90">Step {i + 1}</div>
              <div className="text-sm font-bold mt-1">{w.step}</div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}

// ─── Tab: Part Price DOT ──────────────────────────────────────────────
function PartPriceDOTTab({ showToast }: { showToast: (msg: string) => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('A25');
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PARTS_DOT_KPI.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Parts Catalog" subtitle="Search and explore the full inventory" className="xl:col-span-2"
          action={
            <div className="flex gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search parts…"
                  className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-40" />
              </div>
              <button onClick={() => showToast('CSV exported')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold">CSV</button>
              <button onClick={() => showToast('Excel exported')}
                className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-semibold">Excel</button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="text-left py-2">Model</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Part Name</th>
                  <th className="text-left py-2">Code</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-left py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {PARTS_TABLE.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p, i) => (
                  <motion.tr key={i} variants={fadeUp}
                    onClick={() => { setSelected(p.model); showToast(`${p.model} selected`); }}
                    className={`border-b border-gray-50 hover:bg-purple-50/30 cursor-pointer ${selected === p.model && p.cat === 'Display' ? 'bg-purple-50' : ''}`}>
                    <td className="py-2.5 font-semibold text-gray-800">{p.model}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px]">{p.cat}</span>
                    </td>
                    <td className="py-2.5 text-gray-700">{p.name}</td>
                    <td className="py-2.5 text-gray-500 font-mono text-[10px]">{p.code}</td>
                    <td className="py-2.5 text-right font-bold text-purple-700 stat-num">{p.price}</td>
                    <td className="py-2.5 text-gray-500 text-[10px]">{p.updated}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Showing 7 of 5,842 parts</span>
            <div className="flex gap-1">
              <button className="w-6 h-6 rounded-md bg-purple-100 text-purple-700">1</button>
              <button className="w-6 h-6 rounded-md hover:bg-purple-50">2</button>
              <button className="w-6 h-6 rounded-md hover:bg-purple-50">3</button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={selected} subtitle="Model overview">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-white mb-3">
            <div className="text-3xl mb-2">📱</div>
            <div className="font-bold text-base">Galaxy {selected}</div>
            <div className="text-xs opacity-90 mt-1">Smartphone · 2024</div>
          </div>
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Parts Summary (5)</div>
          <div className="space-y-2">
            {PARTS_TABLE.slice(0, 5).map((p, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-purple-50 text-xs">
                <span className="text-gray-700">{p.cat}</span>
                <span className="font-bold text-purple-700 stat-num">{p.price}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}

// ─── Tab: Part Price Retail ───────────────────────────────────────────
// Paste your Google Apps Script Web App URL here (one script serves all 4 sheets via ?sheet= param)
const PART_PRICE_RETAIL_URL = 'https://script.google.com/macros/s/AKfycbymwlVkKkPmrKy2fb9fXBgUreUOkyMGvrzbKTcGtN8ZwkS8QqgEtaJknf4H001aIFkA/exec';

// Map sheet name → display Series label
const RETAIL_SHEETS: { sheetName: string; series: string }[] = [
  { sheetName: 'UB A Series',      series: 'A Series'      },
  { sheetName: 'UB S/Note Series', series: 'S Series'      },
  { sheetName: 'UB Z Flip Series', series: 'Z Flip Series' },
  { sheetName: 'UB Z Fold Series', series: 'Z Fold Series' },
];

// Raw row from Google Sheet
interface RetailRawRow {
  'Model Market': string;
  'ตัวเลือกสีพาส': string;
  'Part Number': string;
  'Part Desc.': string;
  'Color': string;
  'Retail Price Total': number | string;
  'Description': string;
  'Check Part': boolean | string;
  'QTY': number | string;
  'Total': number | string;
  ' Stock MBK': number | string;
  ' Stock Future': number | string;
  'Stock Bangkae': number | string;
  'Stock  Rayong': number | string;
  'Stock  Ayuttaya': number | string;
  'Stock The Mall': number | string;
  _series?: string;
}

interface RetailPartRow {
  partNumber: string;
  partDesc: string;
  color: string;
  description: string;
  retailPrice: number;
  qty: number;
  total: number;
  checkPart: boolean;
  stocks: { label: string; qty: number }[];
}

interface RetailModel {
  fullName: string;   // e.g. "A34 (SM-A346B)"
  shortName: string;  // e.g. "A34"
  series: string;
  parts: RetailPartRow[];
  totalCost: number;
}

const STOCK_LOCATIONS = ['MBK', 'Future', 'Bangkae', 'Rayong', 'Ayuttaya', 'The Mall'];
const STOCK_KEYS = [' Stock MBK', ' Stock Future', 'Stock Bangkae', 'Stock  Rayong', 'Stock  Ayuttaya', 'Stock The Mall'] as const;

function parseRetailSheet(rows: RetailRawRow[], series: string): RetailModel[] {
  const models: RetailModel[] = [];
  for (const row of rows) {
    const modelField = String(row['Model Market'] ?? '').trim();
    const partNumber = String(row['Part Number'] ?? '').trim();
    const color = String(row['Color'] ?? '').trim();
    const retailPrice = row['Retail Price Total'];

    // Model header row: has "(SM-" in Model Market and no Part Number
    if (modelField.includes('(SM-') || modelField.includes('(SM ')) {
      models.push({
        fullName: modelField,
        shortName: modelField.split('(')[0].trim(),
        series,
        parts: [],
        totalCost: 0,
      });
      continue;
    }

    // Skip: total rows, #N/A rows, empty rows
    if (color === 'Total Parts' || retailPrice === '#N/A' || color === '#N/A') continue;
    if (!partNumber || partNumber === ' ' || partNumber === '') continue;

    // Valid part row – attach to latest model
    if (models.length === 0) continue;
    const m = models[models.length - 1];
    const price = typeof retailPrice === 'number' ? retailPrice : parseFloat(String(retailPrice)) || 0;
    const qty   = typeof row['QTY'] === 'number'  ? row['QTY']  : parseInt(String(row['QTY'])) || 1;
    const total = typeof row['Total'] === 'number' ? row['Total'] : parseFloat(String(row['Total'])) || 0;

    m.parts.push({
      partNumber,
      partDesc: String(row['Part Desc.'] ?? '').trim(),
      color,
      description: String(row['Description'] ?? '').trim(),
      retailPrice: price,
      qty,
      total,
      checkPart: row['Check Part'] === true || row['Check Part'] === 'TRUE',
      stocks: STOCK_KEYS.map((k, i) => ({
        label: STOCK_LOCATIONS[i],
        qty: typeof row[k] === 'number' ? (row[k] as number) : parseInt(String(row[k])) || 0,
      })),
    });
    m.totalCost = m.parts.reduce((s, p) => s + p.total, 0);
  }
  return models.filter(m => m.parts.length > 0);
}

const SERIES_COLORS: Record<string, { from: string; to: string; text: string; badge: string; glow: string }> = {
  'S Series':      { from: 'from-violet-400', to: 'to-purple-600',  text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', glow: '#7c3aed' },
  'A Series':      { from: 'from-teal-400',   to: 'to-emerald-600', text: 'text-teal-700',   badge: 'bg-teal-100 text-teal-700',    glow: '#0d9488' },
  'Z Flip Series': { from: 'from-sky-400',    to: 'to-blue-600',    text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-700',      glow: '#0284c7' },
  'Z Fold Series': { from: 'from-rose-400',   to: 'to-pink-600',    text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-700',    glow: '#e11d48' },
};

function PartPriceRetailTab({ showToast }: { showToast: (msg: string) => void }) {
  const [allModels, setAllModels]   = useState<RetailModel[]>([]);
  const [loading, setLoading]       = useState(true);
  const [errors, setErrors]         = useState<string[]>([]);
  const [activeSeries, setActiveSeries] = useState<string>(RETAIL_SHEETS[0].series);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [search, setSearch]         = useState('');

  // Fetch all 4 sheets in parallel
  useEffect(() => {
    setLoading(true);
    const fetches = RETAIL_SHEETS.map(({ sheetName, series }) =>
      fetch(`${PART_PRICE_RETAIL_URL}?sheet=${encodeURIComponent(sheetName)}`)
        .then(r => r.json())
        .then(json => {
          if (json.data && Array.isArray(json.data)) {
            return parseRetailSheet(json.data as RetailRawRow[], series);
          }
          return [] as RetailModel[];
        })
        .catch(() => {
          setErrors(prev => [...prev, `โหลด ${sheetName} ไม่สำเร็จ`]);
          return [] as RetailModel[];
        })
    );
    Promise.all(fetches)
      .then(results => setAllModels(results.flat()))
      .finally(() => setLoading(false));
  }, []);

  // KPI per series
  const seriesKpis = useMemo(() => RETAIL_SHEETS.map(({ series }) => {
    const sm = allModels.filter(m => m.series === series);
    const avg = sm.length === 0 ? 0 : sm.reduce((s, m) => s + m.totalCost, 0) / sm.length;
    const c = SERIES_COLORS[series] ?? SERIES_COLORS['S Series'];
    return { series, modelCount: sm.length, avgCost: Math.round(avg), colors: c };
  }), [allModels]);

  // Models for active series
  const seriesModels = useMemo(() =>
    allModels.filter(m => m.series === activeSeries),
    [allModels, activeSeries]);

  // Auto-select first model when series changes
  useEffect(() => {
    setSelectedModel(seriesModels[0]?.shortName ?? '');
  }, [seriesModels]);

  const currentModel = seriesModels.find(m => m.shortName === selectedModel) ?? null;

  // Filter parts by search
  const displayParts = useMemo(() => {
    if (!currentModel) return [];
    const q = search.toLowerCase();
    if (!q) return currentModel.parts;
    return currentModel.parts.filter(p =>
      p.partDesc.toLowerCase().includes(q) ||
      p.partNumber.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q)
    );
  }, [currentModel, search]);

  const thb = (n: number) => `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const c = SERIES_COLORS[activeSeries] ?? SERIES_COLORS['S Series'];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-xs text-sky-600 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          กำลังโหลดข้อมูลจาก Google Sheet ({RETAIL_SHEETS.length} sheets)…
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs text-orange-700 space-y-0.5">
          {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
        </div>
      )}

      {/* KPI Cards – 4 series */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {seriesKpis.map(k => (
          <button
            key={k.series}
            onClick={() => setActiveSeries(k.series)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-1 focus:outline-none ${
              activeSeries === k.series ? 'ring-2 ring-offset-2 ring-white/60 shadow-xl scale-[1.02]' : 'shadow-sm opacity-85'
            }`}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${k.colors.from} ${k.colors.to}`} />
            <div className="relative z-10">
              <div className="text-[11px] font-extrabold text-white/80 uppercase tracking-widest mb-1">{k.series}</div>
              <div className="text-3xl font-extrabold text-white leading-none stat-num">{loading ? '–' : k.modelCount}</div>
              <div className="text-[10px] text-white/70 mt-0.5">รุ่น</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                {loading ? '–' : `เฉลี่ย ${thb(k.avgCost)}`}
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Main 2-col layout */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT: model chips + parts table */}
        <div className="xl:col-span-2 space-y-3">
          <SectionCard
            title={`${activeSeries} – รายการอะไหล่`}
            subtitle="เลือกรุ่นเพื่อดูอะไหล่และราคา Retail"
            action={
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="ค้นหา part…"
                  className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-36 focus:outline-none focus:ring-1 focus:ring-purple-300"
                />
              </div>
            }
          >
            {/* Model chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {seriesModels.map(m => {
                const active = m.shortName === selectedModel;
                return (
                  <button key={m.shortName} onClick={() => setSelectedModel(m.shortName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? `bg-gradient-to-r ${c.from} ${c.to} text-white shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {m.shortName}
                  </button>
                );
              })}
              {!loading && seriesModels.length === 0 && (
                <span className="text-xs text-gray-400">ไม่มีข้อมูล</span>
              )}
            </div>

            {/* Parts table */}
            {currentModel && (
              <>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {currentModel.fullName} – {displayParts.length} รายการ
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-2 pr-3">Part Desc.</th>
                        <th className="text-left py-2 pr-3">Part Number</th>
                        <th className="text-left py-2 pr-3">Color / Type</th>
                        <th className="text-center py-2 pr-3">QTY</th>
                        <th className="text-right py-2 pr-3">Retail Price</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayParts.map((p, i) => (
                        <motion.tr key={i} variants={fadeUp}
                          className={`border-b border-gray-50 hover:bg-purple-50/40 transition-colors ${p.checkPart ? 'bg-emerald-50/30' : ''}`}
                        >
                          <td className="py-2.5 pr-3">
                            <div className="font-semibold text-gray-800 leading-tight">{p.partDesc || '–'}</div>
                            {p.description && (
                              <div className="text-[9px] text-gray-400 mt-0.5 leading-tight max-w-[200px] truncate">{p.description}</div>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-[10px] text-gray-500 whitespace-nowrap">{p.partNumber}</td>
                          <td className="py-2.5 pr-3">
                            {p.color && p.color !== p.partDesc && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.badge}`}>{p.color}</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-center">
                            <span className="font-bold text-gray-600">{p.qty}</span>
                          </td>
                          <td className="py-2.5 pr-3 text-right text-gray-600">{p.retailPrice > 0 ? thb(p.retailPrice) : '–'}</td>
                          <td className="py-2.5 text-right font-extrabold stat-num" style={{ color: c.glow }}>
                            {p.total > 0 ? thb(p.total) : '–'}
                          </td>
                        </motion.tr>
                      ))}
                      {displayParts.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-xs text-gray-400">ไม่พบรายการอะไหล่</td></tr>
                      )}
                    </tbody>
                    {displayParts.length > 0 && currentModel && (
                      <tfoot>
                        <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                          <td colSpan={5} className="py-3 text-xs font-bold text-gray-700 pl-1">รวมราคา Retail ทั้งหมด</td>
                          <td className="py-3 text-right text-sm font-extrabold stat-num" style={{ color: c.glow }}>
                            {thb(currentModel.totalCost)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Stock levels */}
                {currentModel.parts.some(p => p.stocks.some(s => s.qty > 0)) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Stock per Location</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {STOCK_LOCATIONS.map((loc, li) => {
                        const total = currentModel.parts.reduce((s, p) => s + (p.stocks[li]?.qty ?? 0), 0);
                        const hasStock = total > 0;
                        return (
                          <div key={loc} className={`rounded-xl p-2 text-center border ${hasStock ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
                            <div className={`text-xs font-bold ${hasStock ? 'text-emerald-700' : 'text-gray-400'}`}>{total}</div>
                            <div className="text-[9px] text-gray-500 mt-0.5">{loc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>
        </div>

        {/* RIGHT: summary + breakdown */}
        <div className="space-y-3">
          {/* Hero card */}
          {currentModel ? (
            <div className={`rounded-2xl p-5 bg-gradient-to-br ${c.from} ${c.to} text-white shadow-lg`}>
              <div className="text-3xl mb-2">{activeSeries.includes('Fold') ? '📖' : activeSeries.includes('Flip') ? '🔄' : '📱'}</div>
              <div className="font-extrabold text-lg leading-tight">{currentModel.shortName}</div>
              <div className="text-[11px] opacity-70 mt-0.5 font-mono">{currentModel.fullName}</div>
              <div className="mt-4 border-t border-white/25 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="opacity-75">จำนวนอะไหล่</span>
                  <span className="font-bold">{currentModel.parts.length} รายการ</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-75">ราคา Retail รวม</span>
                  <span className="font-extrabold text-lg stat-num">{thb(currentModel.totalCost)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-5 bg-gray-100 text-gray-400 text-xs text-center">
              {loading ? 'กำลังโหลด…' : 'เลือกรุ่นเพื่อดูสรุป'}
            </div>
          )}

          {/* Cost breakdown bars */}
          <SectionCard title="Cost Breakdown" subtitle="สัดส่วนต้นทุนแต่ละชิ้น">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(currentModel?.parts ?? []).filter(p => p.total > 0).map((p, i) => {
                const pct = currentModel!.totalCost > 0
                  ? Math.round((p.total / currentModel!.totalCost) * 100) : 0;
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-700 font-medium truncate max-w-[140px]">
                        {p.partDesc || p.color || '–'}
                      </span>
                      <span className="font-bold text-gray-700">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${c.from} ${c.to} transition-all duration-500`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!currentModel || currentModel.parts.filter(p => p.total > 0).length === 0) && (
                <div className="text-xs text-gray-400">เลือกรุ่นเพื่อดู breakdown</div>
              )}
            </div>
          </SectionCard>

          {/* Export */}
          <button
            onClick={() => {
              if (!currentModel) return showToast('เลือกรุ่นก่อน');
              const rows = [
                ['Part Desc.', 'Part Number', 'Color', 'Retail Price', 'QTY', 'Total'],
                ...currentModel.parts.map(p => [p.partDesc, p.partNumber, p.color, p.retailPrice, p.qty, p.total]),
              ];
              const csv = rows.map(r => r.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `${currentModel.shortName}_retail_parts.csv`; a.click();
              URL.revokeObjectURL(url);
              showToast(`Export ${currentModel.shortName} สำเร็จ`);
            }}
            className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${c.from} ${c.to} text-white text-xs font-bold hover:opacity-90 transition shadow-md`}
          >
            ⬇ Export CSV – {currentModel?.shortName ?? '…'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Tab: Product ─────────────────────────────────────────────────────
const PRODUCT_API_URL = 'https://script.google.com/macros/s/AKfycbwDqf1FCbB7CAgNFSVOC_80dn4XO-FLgWztYGPdxBVGK74stb7M8gcGwFzdJ7h8AtOxwA/exec';

// Cache: url → blob URL (transparent PNG)
// ── ProductImage: simple fast version – no background removal (too heavy) ──
function ProductImage({ src, alt, className, style }: {
  src: string; alt: string; className?: string; style?: React.CSSProperties; bgTone?: string;
}) {
  const [imgSrc, setImgSrc] = React.useState(src);
  React.useEffect(() => { setImgSrc(src); }, [src]);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setImgSrc('')}
    />
  );
}

// Manual overrides for models whose slug doesn't match the auto-pattern
const GSMARENA_SLUG_OVERRIDE: Record<string, string> = {
  // ── Galaxy S ──
  'Galaxy S9+':          'samsung-galaxy-s9-plus',
  'Galaxy S9':           'samsung-galaxy-s9',
  'Galaxy S10+':         'samsung-galaxy-s10-plus',
  'Galaxy S10':          'samsung-galaxy-s10',
  'Galaxy S10e':         'samsung-galaxy-s10e',
  'Galaxy S10 5G':       'samsung-galaxy-s10-5g',
  'Galaxy S20':          'samsung-galaxy-s20',
  'Galaxy S20+':         'samsung-galaxy-s20-plus',
  'Galaxy S20 Ultra':    'samsung-galaxy-s20-ultra',
  'Galaxy S20 FE':       'samsung-galaxy-s20-fe',
  'Galaxy S21':          'samsung-galaxy-s21-5g',
  'Galaxy S21+':         'samsung-galaxy-s21-plus-5g',
  'Galaxy S21 Ultra':    'samsung-galaxy-s21-ultra-5g',
  'Galaxy S21 FE':       'samsung-galaxy-s21-fe-5g',
  'Galaxy S22':          'samsung-galaxy-s22',
  'Galaxy S22+':         'samsung-galaxy-s22-plus',
  'Galaxy S22 Ultra':    'samsung-galaxy-s22-ultra',
  'Galaxy S23':          'samsung-galaxy-s23',
  'Galaxy S23+':         'samsung-galaxy-s23-plus',
  'Galaxy S23 Ultra':    'samsung-galaxy-s23-ultra',
  'Galaxy S23 FE':       'samsung-galaxy-s23-fe',
  'Galaxy S24':          'samsung-galaxy-s24',
  'Galaxy S24+':         'samsung-galaxy-s24-plus',
  'Galaxy S24 Ultra':    'samsung-galaxy-s24-ultra',
  'Galaxy S24 FE':       'samsung-galaxy-s24-fe',
  'Galaxy S25':          'samsung-galaxy-s25',
  'Galaxy S25+':         'samsung-galaxy-s25-plus',
  'Galaxy S25 Ultra':    'samsung-galaxy-s25-ultra',
  // ── Galaxy A ──
  'Galaxy A54':          'samsung-galaxy-a54',
  'Galaxy A53 5G':       'samsung-galaxy-a53-5g',
  'Galaxy A52s 5G':      'samsung-galaxy-a52s-5g',
  'Galaxy A52 5G':       'samsung-galaxy-a52-5g',
  'Galaxy A52':          'samsung-galaxy-a52',
  'Galaxy A34':          'samsung-galaxy-a34',
  'Galaxy A33 5G':       'samsung-galaxy-a33-5g',
  'Galaxy A14':          'samsung-galaxy-a14',
  'Galaxy A14 5G':       'samsung-galaxy-a14-5g',
  // ── Galaxy Z ──
  'Galaxy Z Fold 2':     'samsung-galaxy-z-fold2-5g',
  'Galaxy Z Fold 3':     'samsung-galaxy-z-fold3-5g',
  'Galaxy Z Fold 4':     'samsung-galaxy-z-fold4',
  'Galaxy Z Fold 5':     'samsung-galaxy-z-fold5',
  'Galaxy Z Fold 6':     'samsung-galaxy-z-fold6',
  'Galaxy Z Flip':       'samsung-galaxy-z-flip-5g',
  'Galaxy Z Flip 3':     'samsung-galaxy-z-flip3-5g',
  'Galaxy Z Flip 4':     'samsung-galaxy-z-flip4',
  'Galaxy Z Flip 5':     'samsung-galaxy-z-flip5',
  'Galaxy Z Flip 6':     'samsung-galaxy-z-flip6',
  // ── Galaxy Tab ──
  'Galaxy Tab S9+':      'samsung-galaxy-tab-s9-plus',
  'Galaxy Tab S9 Ultra': 'samsung-galaxy-tab-s9-ultra',
  'Galaxy Tab S9 FE':    'samsung-galaxy-tab-s9-fe',
  'Galaxy Tab S9 FE+':   'samsung-galaxy-tab-s9-fe-plus',
  'Galaxy Tab S8+':      'samsung-galaxy-tab-s8-plus',
  'Galaxy Tab S8 Ultra': 'samsung-galaxy-tab-s8-ultra',
  'Galaxy Tab S7+':      'samsung-galaxy-tab-s7-plus',
  'Galaxy Tab S7 FE':    'samsung-galaxy-tab-s7-fe-5g',
  'Galaxy Tab S6 Lite':  'samsung-galaxy-tab-s6-lite',
  // ── Galaxy Watch ──
  'Galaxy Watch 4':          'samsung-galaxy-watch4',
  'Galaxy Watch 4 Classic':  'samsung-galaxy-watch4-classic',
  'Galaxy Watch 5':          'samsung-galaxy-watch5',
  'Galaxy Watch 5 Pro':      'samsung-galaxy-watch5-pro',
  'Galaxy Watch 6':          'samsung-galaxy-watch6',
  'Galaxy Watch 6 Classic':  'samsung-galaxy-watch6-classic',
  'Galaxy Watch 7':          'samsung-galaxy-watch7',
  'Galaxy Watch Ultra':      'samsung-galaxy-watch-ultra',
  // ── Galaxy Buds ──
  'Galaxy Buds+':        'samsung-galaxy-buds-plus',
  'Galaxy Buds Live':    'samsung-galaxy-buds-live',
  'Galaxy Buds Pro':     'samsung-galaxy-buds-pro',
  'Galaxy Buds2':        'samsung-galaxy-buds2',
  'Galaxy Buds2 Pro':    'samsung-galaxy-buds2-pro',
  'Galaxy Buds FE':      'samsung-galaxy-buds-fe',
  'Galaxy Buds3':        'samsung-galaxy-buds3',
  'Galaxy Buds3 Pro':    'samsung-galaxy-buds3-pro',
};

function getProductImageUrl(model: string, sheetImageUrl?: string): string {
  // Priority 1: Image_URL จาก Google Sheet (ถ้ามี)
  if (sheetImageUrl && sheetImageUrl.trim() !== '') return sheetImageUrl.trim();
  // Priority 2: Manual override slug
  if (GSMARENA_SLUG_OVERRIDE[model]) {
    return `https://fdn2.gsmarena.com/vv/bigpic/${GSMARENA_SLUG_OVERRIDE[model]}.jpg`;
  }
  // Priority 3: Auto-generate slug
  const slug = 'samsung-' + model
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`;
}

interface SheetProduct {
  Category: string;
  Series: string;
  Model: string;
  Launch_Date: string;
  Launch_Year: string | number;
  'Scope/Market': string;
  'CPU/SoC': string;
  RAM: string;
  'ROM/Storage': string;
  Display: string;
  Battery_mAh: string | number;
  Rear_Camera_Count: string | number;
  Rear_Camera_Spec: string;
  Front_Camera_Count: string | number;
  Front_Camera_Spec: string;
  'Normal/Retail_Colors': string;
  Online_Exclusive_Colors: string;
  Image_URL?: string;
}

const CATEGORY_TONE: Record<string, string> = {
  Phone:        'from-violet-400 to-purple-500',
  Tablet:       'from-amber-400 to-orange-500',
  Watch:        'from-sky-400 to-blue-500',
  'TWS/Earbuds':'from-rose-400 to-pink-500',
  Laptop:       'from-emerald-400 to-teal-500',
  default:      'from-slate-400 to-gray-500',
};

// Radial glow color for detail panel hero background
const CATEGORY_GLOW: Record<string, string> = {
  Phone:        'rgba(167,139,250,0.18)',
  Tablet:       'rgba(251,191,36,0.18)',
  Watch:        'rgba(56,189,248,0.18)',
  'TWS/Earbuds':'rgba(251,113,133,0.18)',
  Laptop:       'rgba(52,211,153,0.18)',
  default:      'rgba(148,163,184,0.14)',
};

// Premium pastel gradient for hero bg
const CATEGORY_HERO_BG: Record<string, string> = {
  Phone:        'linear-gradient(145deg, #f3f0ff 0%, #ede9fe 40%, #ddd6fe 100%)',
  Tablet:       'linear-gradient(145deg, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)',
  Watch:        'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 40%, #bae6fd 100%)',
  'TWS/Earbuds':'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 40%, #fecdd3 100%)',
  Laptop:       'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 40%, #bbf7d0 100%)',
  default:      'linear-gradient(145deg, #f8f7ff 0%, #ede9fe 40%, #ddd6fe 100%)',
};

function getCatGlow(cat: string) { return CATEGORY_GLOW[cat] ?? CATEGORY_GLOW.default; }
function getCatHeroBg(cat: string) { return CATEGORY_HERO_BG[cat] ?? CATEGORY_HERO_BG.default; }

// Display name override
const CATEGORY_DISPLAY: Record<string, string> = { Phone: 'Smartphone' };
function getCatDisplay(cat: string) { return CATEGORY_DISPLAY[cat] ?? cat; }

// Representative flagship image per category
const CATEGORY_FLAGSHIP_IMG: Record<string, string> = {
  Phone:        'https://images.contentstack.io/v3/assets/blt8ba403bee4433fd8/bltfa73b1d048e03995/699d22718b33e4000870cd58/packshort-s26u.png?auto=webp&quality=85',
  'S Series':   'https://images.contentstack.io/v3/assets/blt8ba403bee4433fd8/bltfa73b1d048e03995/699d22718b33e4000870cd58/packshort-s26u.png?auto=webp&quality=85',
  'A Series':   'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a56.jpg',
  Tablet:       'https://images.samsung.com/is/image/samsung/p6pim/th/sm-x936bzaethl/gallery/th-galaxy-tab-s11-ultra-sm-x930-sm-x936bzaethl-548834312?$624_468_PNG$',
  Watch:        'https://images.samsung.com/is/image/samsung/p6pim/th/f2507/gallery/th-galaxy-watch-ultra-2025-l705-sm-l705fzb1thl-547646925?$624_624_PNG$',
  'TWS/Earbuds':'https://techxpressug.com/wp-content/uploads/2026/03/Galaxy_Buds_4_Pro_-_Black.webp',
  Buds:         'https://techxpressug.com/wp-content/uploads/2026/03/Galaxy_Buds_4_Pro_-_Black.webp',
  Laptop:       'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-book4-ultra.jpg',
};

// Sort: ปีใหม่ก่อน → ใน generation เดียวกัน Ultra > Fold > Flip > + > base > Edge > FE
function getVariantOrder(model: string): number {
  const m = model.toLowerCase();
  if (m.includes('ultra')) return 0;
  if (m.includes('fold'))  return 1;
  if (m.includes('flip'))  return 2;
  if (m.includes('+') || m.includes('plus')) return 3;
  if (m.includes('edge')) return 4;
  if (m.includes(' fe'))  return 5;
  return 4;
}
function sortProducts(a: SheetProduct, b: SheetProduct) {
  const yearDiff = Number(b.Launch_Year) - Number(a.Launch_Year);
  if (yearDiff !== 0) return yearDiff;
  return getVariantOrder(a.Model) - getVariantOrder(b.Model);
}

const CATEGORY_ICON: Record<string, string> = {
  Phone:   '📱',
  Tablet:  '📲',
  Watch:   '⌚',
  'TWS/Earbuds': '🎧',
  Laptop:  'ðŸ’»',
  default: '📦',
};

function getCatTone(cat: string) {
  return CATEGORY_TONE[cat] ?? CATEGORY_TONE.default;
}
function getCatIcon(cat: string) {
  return CATEGORY_ICON[cat] ?? CATEGORY_ICON.default;
}

function ProductTab({ showToast }: { showToast: (msg: string) => void }) {
  const [products, setProducts] = useState<SheetProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState<SheetProduct | null>(null);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [page, setPage]             = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetch(PRODUCT_API_URL)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setProducts(json.data);
          // default เลือก S26 Ultra ถ้ามี ไม่งั้นเลือกตัวแรก
          const s26 = json.data.find((p: SheetProduct) =>
            p.Model?.toLowerCase().includes('s26 ultra')
          );
          setSelected(s26 ?? json.data[0] ?? null);
        } else {
          setError('No data returned');
        }
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.Category).filter(Boolean)));
    return ['All', ...cats];
  }, [products]);

  const years = useMemo(() => {
    const ys = Array.from(new Set(products.map(p => String(p.Launch_Year)).filter(Boolean)))
      .sort((a, b) => Number(b) - Number(a));
    return ['All', ...ys];
  }, [products]);

  const filtered = useMemo(() => {
    setPage(1);
    return products
      .filter(p => {
        const matchCat =
          filterCat === 'All'      ? true :
          filterCat === 'S Series' ? (p.Category === 'Phone' && /galaxy s\d/i.test(p.Model)) :
          filterCat === 'A Series' ? (p.Category === 'Phone' && /galaxy a\d/i.test(p.Model)) :
          filterCat === 'Z Series' ? (p.Category === 'Phone' && /galaxy z/i.test(p.Model)) :
          filterCat === 'Phone'    ? p.Category === 'Phone' :
          p.Category === filterCat;
        const matchYear   = filterYear === 'All' || String(p.Launch_Year) === filterYear;
        const matchSearch = search === '' ||
          p.Model?.toLowerCase().includes(search.toLowerCase()) ||
          p.Series?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchYear && matchSearch;
      })
      .sort(sortProducts);
  }, [products, filterCat, filterYear, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  const catCounts = useMemo(() => {
    return categories.filter(c => c !== 'All').map(cat => ({
      cat,
      displayName: getCatDisplay(cat),
      count: products.filter(p => p.Category === cat).length,
      tone: getCatTone(cat),
      icon: getCatIcon(cat),
    }));
  }, [categories, products]);

  // Filter dropdown options – เพิ่ม S/A/Z Series ไว้หลัง Smartphone
  const filterOptions = useMemo(() => {
    const base = categories; // ['All', 'Phone', 'Tablet', ...]
    const phoneIdx = base.indexOf('Phone');
    const extra = ['S Series', 'A Series', 'Z Series'];
    const result = [...base];
    if (phoneIdx !== -1) result.splice(phoneIdx + 1, 0, ...extra);
    return result;
  }, [categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-400 text-sm">{error}</div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">

      {/* KPI by Category */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {catCounts.map((c, i) => {
          const flagshipImg = CATEGORY_FLAGSHIP_IMG[c.cat];
          const isActive = filterCat === c.cat;
          return (
            <motion.div key={i} variants={fadeUp}
              onClick={() => setFilterCat(isActive ? 'All' : c.cat)}
              whileHover={{ y: -6, scale: 1.02, boxShadow: '0 16px 40px rgba(0,0,0,0.13)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border ${isActive ? 'border-purple-400 ring-2 ring-purple-200 shadow-lg' : 'border-gray-100 dark:border-gray-700 shadow-sm'}`}>
              {/* Image hero */}
              <div className={`relative h-28 bg-gradient-to-br ${c.tone} flex items-end justify-center overflow-hidden`}>
                {/* shimmer overlay on hover */}
                <motion.div
                  className="absolute inset-0 bg-white pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.08 }}
                  transition={{ duration: 0.2 }}
                />
                {flagshipImg ? (
                  <motion.img
                    src={flagshipImg}
                    alt={c.cat}
                    className="h-[90%] w-full object-contain"
                    style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.20))' }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                    whileHover={{ y: -6, scale: 1.08, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.30))' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('hidden');
                    }}
                  />
                ) : null}
                <span hidden={!!flagshipImg} className="text-4xl pb-3">{c.icon}</span>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow"
                    >
                      <Check size={11} className="text-purple-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Info */}
              <div className="px-3 py-2.5">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{c.displayName}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-400">models</span>
                  <span className={`text-sm font-bold bg-gradient-to-r ${c.tone} bg-clip-text text-transparent stat-num`}>{c.count}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Product List */}
        <SectionCard
          title="Product Catalog"
          subtitle={`${filtered.length} models · Page ${page}/${totalPages}`}
          className="xl:col-span-2"
          action={
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search model..."
                  className="pl-6 pr-3 py-1 text-xs rounded-lg border border-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-300 w-28"
                />
              </div>
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg border border-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white"
              >
                {filterOptions.map(c => (
                  <option key={c} value={c}>
                    {c === 'Phone' ? 'Smartphone' : c}
                  </option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg border border-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white"
              >
                {years.map(y => <option key={y}>{y === 'All' ? 'All Years' : y}</option>)}
              </select>
              {(filterCat !== 'All' || filterYear !== 'All' || search !== '') && (
                <button
                  onClick={() => { setFilterCat('All'); setFilterYear('All'); setSearch(''); }}
                  className="text-[10px] text-purple-500 hover:text-purple-700 font-medium px-2 py-1 rounded-lg border border-purple-100 hover:bg-purple-50"
                >
                  Clear
                </button>
              )}
            </div>
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filterCat}-${filterYear}-${search}-${page}`}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
            {paginated.map((p, i) => (
              <motion.div key={p.Model}
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22, delay: i * 0.04 } },
                }}
                onClick={() => setSelected(p)}
                whileHover={{ y: -5, boxShadow: '0 10px 28px rgba(0,0,0,0.11)', scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                {/* Image area – 1:1 aspect ratio, same size all cards */}
                <div className="bg-[#f5f5f5] dark:bg-gray-700 relative w-full" style={{ paddingBottom: '100%' }}>
                  <div className="absolute inset-0 flex items-center justify-center p-5">
                    <img
                      src={getProductImageUrl(p.Model, p.Image_URL)}
                      alt={p.Model}
                      className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.15))' }}
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = 'none';
                        (t.nextElementSibling as HTMLElement | null)?.removeAttribute('hidden');
                      }}
                    />
                    <span hidden className={`absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br ${getCatTone(p.Category)}`}>{getCatIcon(p.Category)}</span>
                  </div>
                </div>
                {/* Divider */}
                <div className={`h-0.5 bg-gradient-to-r ${getCatTone(p.Category)}`} />
                {/* Info */}
                <div className="px-3 py-2.5 bg-white dark:bg-gray-800">
                  <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{p.Model}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-gray-400">{p.Category}</span>
                    <span className="text-[10px] text-purple-500 font-semibold">{p.Launch_Year}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-100 dark:border-gray-700">
              <span className="text-[11px] text-gray-400">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium disabled:opacity-30 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                >«</button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium disabled:opacity-30 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                >‹ Prev</button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                    if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === '...'
                      ? <span key={`e${i}`} className="px-1 text-[11px] text-gray-400">…</span>
                      : <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition ${page === n ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow' : 'hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >{n}</button>
                  )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium disabled:opacity-30 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                >Next ›</button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium disabled:opacity-30 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                >»</button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Detail Panel */}
        {selected && (
          <SectionCard title={selected.Model} subtitle={`${selected.Category} · ${selected.Series}`}>
            {/* Hero image panel – Samsung.com style */}
            <div className="rounded-2xl overflow-hidden mb-3 bg-[#f5f5f5] dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
              <div className="h-72 flex items-center justify-center relative p-6">
                <ProductImage
                  key={selected.Model}
                  src={getProductImageUrl(selected.Model, selected.Image_URL)}
                  alt={selected.Model}
                  className="h-full w-full object-contain"
                  style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.16)) drop-shadow(0 2px 6px rgba(0,0,0,0.10))' }}
                />
                {/* category chip */}
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r ${getCatTone(selected.Category)} text-white text-[10px] font-semibold shadow-sm`}>
                  {selected.Category}
                </div>
                {/* year badge */}
                <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r ${getCatTone(selected.Category)} text-white text-[11px] font-bold shadow-sm`}>
                  {selected.Launch_Year}
                </div>
              </div>
              {/* colored bottom bar */}
              <div className={`h-1 bg-gradient-to-r ${getCatTone(selected.Category)}`} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Launch Year', value: String(selected.Launch_Year) },
                { label: 'Market',      value: selected['Scope/Market'] },
                { label: 'CPU/SoC',     value: selected['CPU/SoC'] },
                { label: 'RAM',         value: String(selected.RAM) },
                { label: 'Storage',     value: selected['ROM/Storage'] },
                { label: 'Display',     value: selected.Display },
                { label: 'Battery',     value: selected.Battery_mAh ? `${selected.Battery_mAh} mAh` : '-' },
                { label: 'Rear Cam',    value: selected.Rear_Camera_Spec },
                { label: 'Front Cam',   value: selected.Front_Camera_Spec },
              ].map((s, i) => (
                <div key={i} className="p-2 rounded-lg bg-purple-50">
                  <div className="text-[10px] text-gray-400 uppercase">{s.label}</div>
                  <div className="text-xs font-semibold text-gray-800 leading-tight">{s.value || '-'}</div>
                </div>
              ))}
            </div>

            {selected['Normal/Retail_Colors'] && (
              <div className="mt-3 p-2 rounded-lg bg-purple-50">
                <div className="text-[10px] text-gray-400 uppercase mb-1">Colors</div>
                <div className="text-xs text-gray-700">{selected['Normal/Retail_Colors']}</div>
              </div>
            )}
            {selected.Online_Exclusive_Colors && selected.Online_Exclusive_Colors !== 'Not specified' && (
              <div className="mt-2 p-2 rounded-lg bg-violet-50">
                <div className="text-[10px] text-gray-400 uppercase mb-1">Online Exclusive</div>
                <div className="text-xs text-gray-700">{selected.Online_Exclusive_Colors}</div>
              </div>
            )}

            <button onClick={() => showToast(`Full specs: ${selected.Model}`)}
              className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold hover:opacity-90">
              View Full Spec
            </button>
          </SectionCard>
        )}
      </div>
    </motion.div>
  );
}

// ─── Tab: Manpower ────────────────────────────────────────────────────
// ─── Manpower Mock Data ───────────────────────────────────────────────
interface MPStaff { id: string; name: string; role: 'Manager'|'Senior Technician'|'Technician'|'Customer Service'; status: 'Active'|'On Leave'|'Training'; cert: 'L1'|'L2'|'L3'; specialty: string; }
interface MPCenter { id: string; province: string; centerName: string; address: string; phone: string; region: 'North'|'Northeast'|'Central'|'East'|'South'; totalStaff: number; activeStaff: number; staff: MPStaff[]; }

const MP_CENTERS: MPCenter[] = [
  { id:'bkk1', province:'กรุงเทพฯ', centerName:'Samsung ASC – เซ็นทรัลเวิลด์', address:'999/9 ถ.พระราม 1 ปทุมวัน กทม.', phone:'02-100-9999', region:'Central', totalStaff:18, activeStaff:16, staff:[
    {id:'c1s1',name:'ธนวัฒน์ สุขใจ',role:'Manager',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c1s2',name:'ปิยะ มีสุข',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy Fold/Flip'},
    {id:'c1s3',name:'วรรณา ดีงาม',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c1s4',name:'สมชาย แสนดี',role:'Technician',status:'Active',cert:'L2',specialty:'Tablet'},
    {id:'c1s5',name:'นภา รักดี',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
    {id:'c1s6',name:'อนุชา พรทิพย์',role:'Technician',status:'On Leave',cert:'L2',specialty:'Galaxy S Series'},
    {id:'c1s7',name:'กนกวรรณ ใจดี',role:'Customer Service',status:'Active',cert:'L1',specialty:'Support'},
  ]},
  { id:'bkk2', province:'กรุงเทพฯ (ลาดพร้าว)', centerName:'Samsung ASC – เซ็นทรัลลาดพร้าว', address:'1693 ถ.พหลโยธิน ลาดยาว กทม.', phone:'02-541-1234', region:'Central', totalStaff:14, activeStaff:13, staff:[
    {id:'c2s1',name:'ชาญชัย วงษ์ดี',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c2s2',name:'ศิริพร เพ็ชรงาม',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c2s3',name:'ภูเบศร์ สมบูรณ์',role:'Technician',status:'Training',cert:'L1',specialty:'Basic Repair'},
    {id:'c2s4',name:'จิตรา มงคล',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c2s5',name:'วิชัย ทองดี',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'cnx', province:'เชียงใหม่', centerName:'Samsung ASC – เซ็นทรัลแอร์พอร์ต', address:'2 ถ.มหิดล ต.หายยา อ.เมือง เชียงใหม่', phone:'053-201-234', region:'North', totalStaff:12, activeStaff:11, staff:[
    {id:'c3s1',name:'เกียรติศักดิ์ ล้านนา',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c3s2',name:'พิมพ์ใจ ดอกคำ',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c3s3',name:'อาทิตย์ ดาวเหนือ',role:'Technician',status:'Active',cert:'L2',specialty:'Tablet & PC'},
    {id:'c3s4',name:'นลินี สวยงาม',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c3s5',name:'บุญมา มีโชค',role:'Customer Service',status:'On Leave',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'cri', province:'เชียงราย', centerName:'Samsung ASC – เชียงราย', address:'590/1 ถ.บรรพปราการ ต.เวียง อ.เมือง เชียงราย', phone:'053-715-678', region:'North', totalStaff:8, activeStaff:8, staff:[
    {id:'c4s1',name:'ประสิทธิ์ ชาติล้านนา',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c4s2',name:'สุนิสา ทองแดง',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy S Series'},
    {id:'c4s3',name:'ณัฐวุฒิ ดีมาก',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c4s4',name:'ลัดดา ขวัญดี',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'kkn', province:'ขอนแก่น', centerName:'Samsung ASC – เซ็นทรัลขอนแก่น', address:'99/9 ถ.ศรีจันทร์ ต.ในเมือง ขอนแก่น', phone:'043-224-456', region:'Northeast', totalStaff:11, activeStaff:10, staff:[
    {id:'c5s1',name:'วีรชัย อีสานรัก',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c5s2',name:'จิราพร ขยันดี',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c5s3',name:'สุรศักดิ์ ทุ่งกว้าง',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy Fold/Flip'},
    {id:'c5s4',name:'มณีรัตน์ งามพร้อม',role:'Technician',status:'On Leave',cert:'L2',specialty:'Tablet'},
    {id:'c5s5',name:'ดวงใจ รักษ์ดี',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'udn', province:'อุดรธานี', centerName:'Samsung ASC – อุดรธานี', address:'277/1 ถ.ประจักษ์ศิลปาคม อ.เมือง อุดรธานี', phone:'042-245-678', region:'Northeast', totalStaff:9, activeStaff:9, staff:[
    {id:'c6s1',name:'กิตติพงษ์ ภาคอีสาน',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c6s2',name:'ยุพา รักชาติ',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy S Series'},
    {id:'c6s3',name:'ไพโรจน์ โคกสูง',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c6s4',name:'สาวิตรี ดีชนะ',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'nma', province:'นครราชสีมา', centerName:'Samsung ASC – เซ็นทรัลโคราช', address:'44/1 ถ.มิตรภาพ อ.เมือง นครราชสีมา', phone:'044-256-789', region:'Northeast', totalStaff:13, activeStaff:12, staff:[
    {id:'c7s1',name:'ณัฐพล โคราชสุข',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c7s2',name:'ศิริลักษณ์ สีเขียว',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c7s3',name:'อนุวัตร แสนดี',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy Fold/Flip'},
    {id:'c7s4',name:'ปณิธาน มั่นคง',role:'Technician',status:'Active',cert:'L2',specialty:'Tablet'},
    {id:'c7s5',name:'วัชรี สดใส',role:'Customer Service',status:'Training',cert:'L1',specialty:'Support'},
  ]},
  { id:'ubn', province:'อุบลราชธานี', centerName:'Samsung ASC – อุบลราชธานี', address:'155 ถ.ชยางกูร อ.เมือง อุบลราชธานี', phone:'045-312-456', region:'Northeast', totalStaff:8, activeStaff:7, staff:[
    {id:'c8s1',name:'ชลธิชา อุบลรัก',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c8s2',name:'วิทยา ลุ่มน้ำมูล',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy S Series'},
    {id:'c8s3',name:'สมหญิง ดีเสมอ',role:'Technician',status:'On Leave',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c8s4',name:'ณัฐกิตติ์ ทุ่งอีสาน',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'chb', province:'ชลบุรี (พัทยา)', centerName:'Samsung ASC – เซ็นทรัลพัทยา', address:'333/99 ถ.พัทยาสาย2 อ.บางละมุง ชลบุรี', phone:'038-411-234', region:'East', totalStaff:10, activeStaff:9, staff:[
    {id:'c9s1',name:'ทวีศักดิ์ อ่าวไทย',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c9s2',name:'อุไรวรรณ ชายทะเล',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c9s3',name:'สมศักดิ์ พัทยาดี',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy Fold/Flip'},
    {id:'c9s4',name:'ปิ่นมณี ตะวันออก',role:'Technician',status:'Training',cert:'L1',specialty:'Basic Repair'},
    {id:'c9s5',name:'เอกชัย ทะเลสวย',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'pkt', province:'ภูเก็ต', centerName:'Samsung ASC – เซ็นทรัลภูเก็ต', address:'130 ถ.เฉลิมพระเกียรติ อ.เมือง ภูเก็ต', phone:'076-290-123', region:'South', totalStaff:10, activeStaff:10, staff:[
    {id:'c10s1',name:'ภูวิศ อันดามัน',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c10s2',name:'กัลยา สมุทรงาม',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c10s3',name:'ธนภัทร ทะเลใส',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy Fold/Flip'},
    {id:'c10s4',name:'อรอนงค์ ริมหาด',role:'Technician',status:'Active',cert:'L2',specialty:'Tablet'},
    {id:'c10s5',name:'ปราโมทย์ ซันไชน์',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'srt', province:'สุราษฎร์ธานี', centerName:'Samsung ASC – สุราษฎร์ธานี', address:'222/1 ถ.ดอนนก อ.เมือง สุราษฎร์ธานี', phone:'077-272-345', region:'South', totalStaff:7, activeStaff:7, staff:[
    {id:'c11s1',name:'สราวุธ คีรีวรรณ',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c11s2',name:'ปรีดา ใจซื่อ',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy S Series'},
    {id:'c11s3',name:'กาญจนา ทักษิณ',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c11s4',name:'นิพนธ์ ทะเลใต้',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
  { id:'hty', province:'สงขลา (หาดใหญ่)', centerName:'Samsung ASC – เซ็นทรัลหาดใหญ่', address:'55 ถ.สนามบิน อ.หาดใหญ่ สงขลา', phone:'074-233-456', region:'South', totalStaff:11, activeStaff:10, staff:[
    {id:'c12s1',name:'อภิชาต ใต้ฟ้า',role:'Manager',status:'Active',cert:'L3',specialty:'All Devices'},
    {id:'c12s2',name:'ลดาวัลย์ ดีสม',role:'Senior Technician',status:'Active',cert:'L3',specialty:'Galaxy S Series'},
    {id:'c12s3',name:'ศุภกิจ ฝั่งใต้',role:'Technician',status:'Active',cert:'L2',specialty:'Galaxy A Series'},
    {id:'c12s4',name:'สุพรรณี ทองใต้',role:'Technician',status:'On Leave',cert:'L2',specialty:'Tablet'},
    {id:'c12s5',name:'จตุพร มั่งมี',role:'Customer Service',status:'Active',cert:'L1',specialty:'Warranty'},
  ]},
];

const MP_REGIONS = ['All','North','Northeast','Central','East','West','South'] as const;
type MPRegion = typeof MP_REGIONS[number];

const MP_REGION_META: Record<string, { color: string; bg: string; light: string; label: string; labelTH: string; centers: number; icon: React.ReactNode }> = {
  All:       { color:'#7c3aed', bg:'from-violet-500 to-purple-600', light:'#ede9fe', label:'All Regions', labelTH:'ทั่วประเทศ',   centers:0, icon:<Globe       size={13}/> },
  North:     { color:'#4f46e5', bg:'from-indigo-400 to-violet-500', light:'#eef2ff', label:'North',        labelTH:'ภาคเหนือ',     centers:0, icon:<Mountain    size={13}/> },
  Northeast: { color:'#059669', bg:'from-emerald-400 to-teal-500',  light:'#ecfdf5', label:'Northeast',    labelTH:'ภาคอีสาน',     centers:0, icon:<Leaf        size={13}/> },
  Central:   { color:'#7c3aed', bg:'from-violet-400 to-purple-500', light:'#f5f3ff', label:'Central',      labelTH:'ภาคกลาง',      centers:0, icon:<Building2   size={13}/> },
  East:      { color:'#0284c7', bg:'from-sky-400 to-blue-500',      light:'#eff6ff', label:'East',         labelTH:'ภาคตะวันออก',  centers:0, icon:<Anchor      size={13}/> },
  West:      { color:'#ea580c', bg:'from-orange-400 to-red-500',    light:'#fff7ed', label:'West',         labelTH:'ภาคตะวันตก',   centers:0, icon:<TreePine    size={13}/> },
  South:     { color:'#d97706', bg:'from-amber-400 to-orange-500',  light:'#fffbeb', label:'South',        labelTH:'ภาคใต้',       centers:0, icon:<Umbrella    size={13}/> },
};

function ManpowerTab({ showToast }: { showToast: (msg: string) => void }) {
  const [activeRegion, setActiveRegion] = useState<MPRegion>('All');
  const [selectedCenter, setSelectedCenter] = useState<MPCenter | null>(null);

  const filteredCenters = activeRegion === 'All' ? MP_CENTERS : MP_CENTERS.filter(c => c.region === activeRegion);
  const totalStaff    = filteredCenters.reduce((s, c) => s + c.totalStaff, 0);
  const activeStaff   = filteredCenters.reduce((s, c) => s + c.activeStaff, 0);
  const onLeaveCount  = filteredCenters.flatMap(c => c.staff).filter(s => s.status === 'On Leave').length;
  const trainingCount = filteredCenters.flatMap(c => c.staff).filter(s => s.status === 'Training').length;
  const meta = MP_REGION_META[activeRegion];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col gap-4">

      {/* ── Header row: compact KPIs + region filter ── */}
      {/* KPI pills + region filter */}
      <motion.div variants={fadeUp} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { label:'ศูนย์บริการ', value: filteredCenters.length, color: meta.color,  icon:<MapPin    size={14}/> },
            { label:'ปฏิบัติงาน',  value: activeStaff,            color:'#10b981',    icon:<UserCog   size={14}/> },
            { label:'พนักงานรวม', value: totalStaff,              color:'#6366f1',    icon:<Users     size={14}/> },
            { label:'ลาพัก',       value: onLeaveCount,            color:'#f59e0b',    icon:<Umbrella  size={14}/> },
            { label:'อบรม',        value: trainingCount,           color:'#60a5fa',    icon:<BookOpen  size={14}/> },
          ].map(k => (
            <div key={k.label} className="flex items-center gap-2 rounded-2xl bg-white border border-purple-100 px-4 py-2 shadow-sm">
              <span style={{ color: k.color }}>{k.icon}</span>
              <div>
                <div className="text-xl font-black leading-none" style={{ color: k.color }}>{k.value}</div>
                <div className="text-[10px] text-gray-500 font-medium">{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MP_REGIONS.map(r => {
            const m = MP_REGION_META[r];
            const isActive = activeRegion === r;
            const cnt = r === 'All' ? MP_CENTERS.length : MP_CENTERS.filter(c => c.region === r).length;
            return (
              <motion.button key={r} whileHover={{ y:-1 }} whileTap={{ scale:0.96 }}
                onClick={() => { setActiveRegion(r); setSelectedCenter(null); }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border ${
                  isActive ? 'text-white shadow-md border-transparent' : 'bg-white text-gray-600 hover:shadow-sm border-purple-100'
                }`}
                style={isActive ? { background:`linear-gradient(135deg,${m.color}cc,${m.color})`, color:'white' } : {}}
              >
                <span style={isActive ? { color:'white' } : { color: m.color }}>{m.icon}</span>
                <span>{m.labelTH}</span>
                <span className={`rounded-full px-1.5 text-[9px] font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-purple-100 text-purple-600'}`}>{cnt}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Main 60:40 – Map LEFT + Panel RIGHT ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-4 items-start">

        {/* ── MAP ── */}
        <motion.div variants={fadeUp} className="rounded-3xl border border-purple-100 shadow-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between px-5 py-3 border-b border-purple-50">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ background: meta.color }} />
              <span className="text-sm font-bold text-gray-800">แผนที่ประเทศไทย</span>
              <span className="text-[11px] text-gray-400">Samsung ASC 2026</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-xl px-3 py-1 text-[11px] font-bold text-white" style={{ background: meta.color }}>
              <span style={{ color:'white' }}>{meta.icon}</span>
              {meta.labelTH}
            </span>
          </div>

          <ThailandManpowerMap
            activeRegion={activeRegion as import('@/components/manpower/ThailandManpowerMap').TRegion}
            onRegionClick={(r) => { setActiveRegion(r as MPRegion); setSelectedCenter(null); }}
            selectedSC={selectedCenter?.id ?? null}
            onSCClick={(id) => {
              if (!id) { setSelectedCenter(null); return; }
              const found = MP_CENTERS.find(c => c.id === id);
              if (found) { setSelectedCenter(found); setActiveRegion(found.region as MPRegion); }
            }}
          />
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-col gap-3 xl:sticky xl:top-4">

          {/* Region summary */}
          <motion.div key={activeRegion}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className={`rounded-2xl bg-gradient-to-br ${meta.bg} p-4 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{meta.label}</div>
                <div className="text-3xl font-black">{meta.labelTH}</div>
                <div className="text-xs opacity-75 mt-1">{filteredCenters.length} ศูนย์ · {activeStaff}/{totalStaff} คนทำงาน</div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <span className="text-white scale-150">{meta.icon}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[
                { label:'Active',   val:activeStaff,   c:'bg-white/25' },
                { label:'On Leave', val:onLeaveCount,  c:'bg-white/15' },
                { label:'Training', val:trainingCount, c:'bg-white/15' },
              ].map(s => (
                <div key={s.label} className={`${s.c} rounded-xl py-2 text-center backdrop-blur-sm`}>
                  <div className="text-xl font-black">{s.val}</div>
                  <div className="text-[9px] opacity-70">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Center list – scrollable */}
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-purple-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={12} className="text-purple-500" />ศูนย์บริการ
              </span>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                {filteredCenters.length} แห่ง
              </span>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
              {filteredCenters.map((center, i) => {
                const m = MP_REGION_META[center.region];
                const isSelected = selectedCenter?.id === center.id;
                const rate = Math.round((center.activeStaff / center.totalStaff) * 100);
                return (
                  <motion.div key={center.id}
                    initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                    onClick={() => setSelectedCenter(isSelected ? null : center)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-sm font-black shadow-sm"
                      style={{ background: `linear-gradient(135deg,${m.color}99,${m.color})` }}>
                      {center.activeStaff}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{center.province}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                          <div className="h-full rounded-full transition-all" style={{ width:`${rate}%`, background:m.color }} />
                        </div>
                        <span className="text-[10px] font-bold shrink-0" style={{ color:m.color }}>{rate}%</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`shrink-0 text-gray-300 transition-transform ${isSelected?'rotate-90':''}`} />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Staff detail – slides in when center selected */}
          <AnimatePresence>
            {selectedCenter && (() => {
              const m = MP_REGION_META[selectedCenter.region];
              return (
                <motion.div
                  key={selectedCenter.id}
                  initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                  transition={{ duration:0.22 }}
                  className="rounded-2xl bg-white border border-purple-100 shadow-lg overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${m.bg} px-4 py-3`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Service Center</div>
                        <div className="text-white font-black text-sm mt-0.5">{selectedCenter.province}</div>
                        <div className="text-white/75 text-[10px]">{selectedCenter.centerName.replace('Samsung ASC – ','')}</div>
                      </div>
                      <button onClick={() => setSelectedCenter(null)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition">
                        <X size={11} />
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {[
                        { v:selectedCenter.staff.filter(s=>s.status==='Active').length,    l:'Active',   bg:'bg-emerald-500' },
                        { v:selectedCenter.staff.filter(s=>s.status==='On Leave').length,  l:'Leave',    bg:'bg-amber-400'   },
                        { v:selectedCenter.staff.filter(s=>s.status==='Training').length,  l:'Training', bg:'bg-sky-400'     },
                      ].map(s => (
                        <span key={s.l} className={`${s.bg} rounded-lg px-2 py-0.5 text-[10px] font-bold text-white`}>
                          {s.v} {s.l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                    {selectedCenter.staff.map((s, i) => {
                      const sc = s.status==='Active'
                        ? {dot:'#10b981',bg:'#f0fdf4',text:'#15803d'}
                        : s.status==='On Leave'
                        ? {dot:'#f59e0b',bg:'#fffbeb',text:'#b45309'}
                        : {dot:'#60a5fa',bg:'#eff6ff',text:'#1d4ed8'};
                      const em = s.role==='Manager'?'⭐':s.role==='Senior Technician'?'ðŸ…':s.role==='Technician'?'🔧':'ðŸ‘¤';
                      return (
                        <motion.div key={s.id}
                          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-sm font-bold text-purple-700">
                            {s.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold text-gray-800 truncate">{s.name}</span>
                              <span className="text-[11px]">{em}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] text-gray-400 truncate">{s.role}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[9px] font-bold text-indigo-500">{s.cert}</span>
                            </div>
                          </div>
                          <span className="rounded-lg px-1.5 py-0.5 text-[9px] font-bold shrink-0"
                            style={{ background:sc.bg, color:sc.text }}>
                            <span className="inline-block h-1.5 w-1.5 rounded-full mr-0.5 align-middle" style={{ background:sc.dot }} />
                            {s.status}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
}

// ─── Model Detail Popup component ────────────────────────────────────
function ModelDetailPopup({ popupModel, allTickets, topModels, filter, selectedMonth, selectedDay, onClose }: {
  popupModel: string;
  allTickets: SMTicket[];
  topModels: { model: string; count: number }[];
  filter: SMFilter;
  selectedMonth: string;
  selectedDay: string;
  onClose: () => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEscClose(onClose);

  const isOther = popupModel === 'Other Models';
  const topModelNames = topModels.filter(m => m.model !== 'Other Models').map(m => m.model);

  const rawModelTickets = allTickets
    .filter(t => {
      const name = t.ACC_MarketName || t.Model_No || 'Unknown';
      if (isOther) return !topModelNames.includes(name);
      return name === popupModel;
    })
    .sort((a, b) => (b.Questioned_Date || '').localeCompare(a.Questioned_Date || ''));

  const displayedTickets = rawModelTickets.filter(t => {
    const kw = keyword.toLowerCase();
    const matchKw = !kw ||
      (t.title || '').toLowerCase().includes(kw) ||
      (t.content || '').toLowerCase().includes(kw) ||
      (t.Category || '').toLowerCase().includes(kw) ||
      (t.Main_Type || '').toLowerCase().includes(kw) ||
      (t.Sub_Type || '').toLowerCase().includes(kw) ||
      String(t.ticket_ID || '').toLowerCase().includes(kw) ||
      (t.Model_No || '').toLowerCase().includes(kw);
    const su = (t.status || '').toUpperCase();
    const matchStatus = statusFilter === 'ALL' ||
      (statusFilter === 'OPEN'     && su.includes('OPEN')) ||
      (statusFilter === 'CLOSED'   && (su.includes('CLOS'))) ||
      (statusFilter === 'INPROG'   && su.includes('PROG')) ||
      (statusFilter === 'RESOLVED' && su.includes('RESOL'));
    return matchKw && matchStatus;
  });

  const statusColor = (s: string) => {
    const u = s.toUpperCase();
    return u.includes('CLOS') ? 'bg-slate-100 text-slate-500' :
      u.includes('OPEN')  ? 'bg-orange-100 text-orange-700' :
      u.includes('PROG')  ? 'bg-sky-100 text-sky-700' :
      u.includes('RESOL') ? 'bg-emerald-100 text-emerald-700' :
      'bg-gray-100 text-gray-500';
  };

  const modelIdx = topModels.findIndex(m => m.model === popupModel);
  const accentColor = MODEL_COLORS[modelIdx >= 0 ? modelIdx % MODEL_COLORS.length : 0];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-x-3 top-[3%] bottom-[3%] z-50 max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between shrink-0"
          style={{ background: `linear-gradient(135deg,${accentColor}1a,${accentColor}06)`, borderBottom: `2px solid ${accentColor}2a` }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Smartphone size={14} style={{ color: accentColor }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>Model Inquiry Detail</span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 truncate">{popupModel}</h2>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: accentColor }}>
                {rawModelTickets.length} tickets ทั้งหมด
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                {displayedTickets.length} แสดงผล
              </span>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-semibold text-purple-600">
                {filter === 'All' ? 'ทั้งหมด' : filter === 'Monthly' ? selectedMonth : selectedDay}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition shrink-0 ml-3">
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Search + Status Filter Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2 shrink-0">
          {/* Keyword search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:border-violet-400 transition">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="ค้นหา keyword เช่น display, crash, battery…"
              className="flex-1 text-xs focus:outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
            />
            {keyword && (
              <button onClick={() => setKeyword('')} className="text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
          </div>
          {/* Status filter */}
          <div className="flex gap-1">
            {[
              { key: 'ALL', label: 'ทั้งหมด' },
              { key: 'OPEN',     label: 'Open'     },
              { key: 'INPROG',   label: 'In Prog'  },
              { key: 'RESOLVED', label: 'Resolved' },
              { key: 'CLOSED',   label: 'Closed'   },
            ].map(s => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition ${
                  statusFilter === s.key
                    ? 'text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-purple-50'
                }`}
                style={statusFilter === s.key ? { background: accentColor } : {}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">Ticket ID</th>
                <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">วันที่</th>
                <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px]">รุ่น</th>
                <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px]">หัวข้อ / เนื้อหาที่ถาม</th>
                <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">Category</th>
                <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedTickets.map((t, idx) => {
                const modelName = (t.ACC_MarketName || t.Model_No || '-').replace(/Galaxy |Samsung /g, '');
                const highlight = (text: string) => {
                  if (!keyword) return <span>{text}</span>;
                  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                  return <span>{parts.map((p, i) => i % 2 === 1 ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{p}</mark> : p)}</span>;
                };
                return (
                  <tr key={t.ticket_ID ?? idx} className="hover:bg-purple-50/30 transition">
                    <td className="px-5 py-3 font-bold text-purple-600 whitespace-nowrap">{highlight(String(t.ticket_ID || ''))}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{t.Questioned_Date || '-'}</td>
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap font-medium">{modelName}</td>
                    <td className="px-5 py-3 max-w-[320px]">
                      <div className="font-semibold text-gray-800 line-clamp-2 leading-snug">
                        {highlight(t.title || t.content?.replace(/<[^>]+>/g, '').slice(0, 100) || '-')}
                      </div>
                      {t.Sub_Type && <div className="text-[9px] text-gray-400 mt-0.5">{highlight(t.Sub_Type)}</div>}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{highlight(t.Category || t.Main_Type || '-')}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${statusColor(t.status || '')}`}>
                        {t.status || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {displayedTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Search size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">ไม่พบข้อมูลที่ตรงกับ keyword "{keyword}"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center shrink-0 bg-gray-50/50">
          <span className="text-[10px] text-gray-400">
            แสดง <span className="font-bold text-gray-700">{displayedTickets.length}</span> / {rawModelTickets.length} รายการ
          </span>
          <button onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[11px] font-bold hover:opacity-90 transition">
            ปิด
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Tab: Samsung Members ─────────────────────────────────────────────
type SMFilter = 'All' | 'Monthly' | 'Daily';
const SM_MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MODEL_COLORS = ['#a78bfa','#7c3aed','#818cf8','#38bdf8','#10b981','#f59e0b','#fb923c'];

// ── Date normalizer: "14-May-2026" → "2026-05-14" ────────────────
const MONTH_MAP: Record<string, string> = {
  Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',
  Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12',
};
function normalizeDate(d: string): string {
  if (!d || d === 'undefined' || d === 'null') return '';
  // â‘  yyyy-MM-dd (ISO – most common)
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  // â‘¡ "14-May-2026" OR "14-May-26" (2-digit year)
  const m1 = d.match(/^(\d{1,2})-([A-Za-z]{3,})-(\d{2,4})/);
  if (m1) {
    const yr = m1[3].length === 2 ? `20${m1[3]}` : m1[3];
    return `${yr}-${MONTH_MAP[m1[2].slice(0,3)] ?? '01'}-${m1[1].padStart(2,'0')}`;
  }
  // â‘¢ "5/17/2026" or "5/17/26" (M/D/YYYY or M/D/YY)
  const m2 = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m2) {
    const yr = m2[3].length === 2 ? `20${m2[3]}` : m2[3];
    return `${yr}-${m2[1].padStart(2,'0')}-${m2[2].padStart(2,'0')}`;
  }
  // â‘£ "2026/05/17" (YYYY/MM/DD)
  const m3 = d.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m3) return `${m3[1]}-${m3[2].padStart(2,'0')}-${m3[3].padStart(2,'0')}`;
  // â‘¤ "May 17, 2026" or "May 17 26"
  const m4 = d.match(/^([A-Za-z]+)\s+(\d{1,2})[, ]+(\d{2,4})/);
  if (m4) {
    const yr = m4[3].length === 2 ? `20${m4[3]}` : m4[3];
    return `${yr}-${MONTH_MAP[m4[1].slice(0,3)] ?? '01'}-${m4[2].padStart(2,'0')}`;
  }
  return ''; // unrecognized → filtered out
}

function normalizePLMDate(d: string): string {
  if (!d) return '';
  const slash = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`;
  return normalizeDate(d);
}

// ── Aggregate raw tickets into byMonth/byModel/etc ─────────────────
function aggregateTickets(rows: SMTicket[]): Omit<SMApiResponse,'raw'> {
  const byMonth: Record<string,number> = {};
  const byModel: Record<string,number> = {};
  const byStatus: Record<string,number> = {};
  const byBranch: Record<string,number> = {};
  const byMainType: Record<string,number> = {};
  rows.forEach(r => {
    const qd    = r.Questioned_Date || '';
    const month = qd.slice(0,7);
    const model = r.ACC_MarketName || r.Model_No || 'Unknown';
    const stat  = r.status || 'Unknown';
    const branch    = r.Branch || 'Unknown';
    const mainType  = r.Category || r.Main_Type || 'Unknown';
    if (month) byMonth[month] = (byMonth[month] ?? 0) + 1;
    byModel[model]       = (byModel[model]    ?? 0) + 1;
    byStatus[stat]       = (byStatus[stat]    ?? 0) + 1;
    byBranch[branch]     = (byBranch[branch]  ?? 0) + 1;
    byMainType[mainType] = (byMainType[mainType] ?? 0) + 1;
  });
  return { total: rows.length, byMonth, byModel, byStatus, byBranch, byMainType };
}

// v2 – real API + popup
function SamsungMembersTab({ showToast }: { showToast: (msg: string) => void }) {
  const [apiData, setApiData]     = useState<SMApiResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState(false);
  const [filter, setFilter]       = useState<SMFilter>('All');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay]     = useState('');
  const [lastUpdated, setLastUpdated]     = useState('');
  // ── Model popup ────────────────────────────────────────────────────
  const [popupModel, setPopupModel] = useState<string | null>(null);
  // ── PLM Status popup ───────────────────────────────────────────────
  const [popupPLM, setPopupPLM] = useState<string | null>(null);
  // ── Ticket Status popup ────────────────────────────────────────────
  const [popupStatus, setPopupStatus] = useState<string | null>(null);

  useEscClose(() => setPopupPLM(null), !!popupPLM);
  useEscClose(() => setPopupStatus(null), !!popupStatus);

  // ── Fetch – handles both { raw, byMonth, ... } and { data: [...] } ─
  const fetchData = useCallback(() => {
    setLoading(true);
    setApiError(false);
    fetch(SM_APPS_SCRIPT_URL)
      .then(r => r.json())
      .then((json: Record<string, unknown>) => {
        // Normalize raw tickets array (handle both API formats)
        let rows: SMTicket[] = [];
        if (Array.isArray(json.raw)) {
          rows = json.raw as SMTicket[];
        } else if (Array.isArray(json.data)) {
          rows = json.data as SMTicket[];
        }
        // Normalize date format for every row
        rows = rows.map(t => ({
          ...t,
          Questioned_Date: normalizeDate(t.Questioned_Date),
        }));
        // Use pre-aggregated data if available, else compute
        const agg = (json.byMonth && Object.keys(json.byMonth as object).length > 0)
          ? { total: (json.total as number) ?? rows.length, byMonth: json.byMonth as Record<string,number>, byModel: json.byModel as Record<string,number>, byStatus: json.byStatus as Record<string,number>, byBranch: json.byBranch as Record<string,number>, byMainType: json.byMainType as Record<string,number> }
          : aggregateTickets(rows);
        const normalized: SMApiResponse = { ...agg, raw: rows };
        setApiData(normalized);
        const months = Object.keys(normalized.byMonth).sort();
        if (months.length > 0) setSelectedMonth(m => m || months[months.length - 1]);
        const days = [...new Set(rows.map(t => t.Questioned_Date).filter(Boolean))].sort();
        if (days.length > 0) setSelectedDay(d => d || days[days.length - 1]);
        setLastUpdated(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
        setLoading(false);
      })
      .catch(() => { setApiError(true); setLoading(false); });
  }, []);

  useEffect(() => { fetchData(); }, []);

  // ── Use real API data or fallback mock ────────────────────────────
  const allTickets: SMTicket[] = apiData?.raw ?? SM_TICKETS_MOCK;

  // ── Filtered tickets ──────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    if (filter === 'Monthly') return allTickets.filter(t =>
      (t.Month || t.Questioned_Date?.slice(0, 7)) === selectedMonth);
    if (filter === 'Daily')   return allTickets.filter(t => t.Questioned_Date === selectedDay);
    return allTickets;
  }, [allTickets, filter, selectedMonth, selectedDay]);

  // ── Monthly trend – always compute from raw tickets for accuracy ────
  const monthlyTrend = useMemo(() => {
    // Use allTickets (real API or mock) and group by yyyy-MM
    const counts: Record<string, number> = {};
    allTickets.forEach(t => {
      const qd = t.Questioned_Date || '';
      // Only accept valid yyyy-MM-dd format (already normalized)
      const key = /^\d{4}-\d{2}/.test(qd) ? qd.slice(0, 7) : '';
      if (key) counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([k]) => /^\d{4}-\d{2}$/.test(k))  // only valid yyyy-MM keys
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => {
        const monthIdx = parseInt(k.slice(5, 7)) - 1;
        const label = SM_MONTH_LABELS[monthIdx] ?? '?';
        return { m: `${label} ${k.slice(0, 4)}`, tickets: v };
      });
  }, [allTickets]);

  const peakMonth = useMemo(() => {
    if (monthlyTrend.length === 0) return '-';
    const max = Math.max(...monthlyTrend.map(x => x.tickets));
    return monthlyTrend.find(x => x.tickets === max)?.m ?? '-';
  }, [monthlyTrend]);

  const TOP_N = 7;

  // ── Top models + "Other" bucket ───────────────────────────────────
  const topModels = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const name = t.ACC_MarketName || t.Model_No || 'Unknown';
      counts[name] = (counts[name] ?? 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, TOP_N).map(([model, count]) => ({ model, count }));
    const otherCount = sorted.slice(TOP_N).reduce((s, [, c]) => s + c, 0);
    if (otherCount > 0) top.push({ model: 'Other Models', count: otherCount });
    return top;
  }, [filteredTickets]);

  // ── Main Type breakdown ───────────────────────────────────────────
  const mainTypeData = useMemo(() => {
    const c: Record<string, number> = {};
    filteredTickets.forEach(t => { const k = t.Category || t.Main_Type || 'Other'; c[k] = (c[k] ?? 0) + 1; });
    const colors = ['#a78bfa','#10b981','#38bdf8','#f59e0b','#fb923c','#f472b6'];
    return Object.entries(c)
      .filter(([k]) => k && k !== 'Unknown' && k !== '')
      .sort((a,b) => b[1] - a[1]).slice(0, 6)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [filteredTickets]);

  // ── Ticket Status – always compute from filteredTickets for accuracy ─
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    filteredTickets.forEach(t => { const k = (t.status || 'Unknown').toUpperCase(); c[k] = (c[k] ?? 0) + 1; });
    return c;
  }, [filteredTickets]);

  // ── PLM Status – separate from ticket status ──────────────────────
  const plmStatusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const k = t.PLM_STATUS ? t.PLM_STATUS.toUpperCase() : 'N/A';
      c[k] = (c[k] ?? 0) + 1;
    });
    return c;
  }, [filteredTickets]);

  const totalTickets  = filteredTickets?.length ?? 0;
  const closedCount   = (statusCounts['CLOSED'] ?? 0) + (statusCounts['CLOSE'] ?? 0);
  const openCount     = statusCounts['OPEN'] ?? 0;
  const inProgCount   = (statusCounts['IN PROGRESS'] ?? 0) + (statusCounts['IN_PROGRESS'] ?? 0) + (statusCounts['INPROGRESS'] ?? 0);
  const resolvedCount = statusCounts['RESOLVED'] ?? 0;
  const reviewCount   = (statusCounts['REVIEW'] ?? 0) + (statusCounts['IN REVIEW'] ?? 0) + (statusCounts['REVIEWING'] ?? 0);
  const knownCount    = closedCount + openCount + inProgCount + resolvedCount + reviewCount;
  const otherStatusCount = Math.max(0, totalTickets - knownCount);

  // ── Available months & days for dropdowns ─────────────────────────
  const availableMonths = useMemo(() =>
    [...new Set(allTickets.map(t => t.Month || t.Questioned_Date?.slice(0,7)).filter(Boolean))].sort().reverse()
  , [allTickets]);

  const availableDays = useMemo(() =>
    [...new Set(allTickets.map(t => t.Questioned_Date).filter(Boolean))].sort().reverse()
  , [allTickets]);

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">

      {/* ── Status bar ───────────────────────────────────────────── */}
      {(loading || apiError || lastUpdated) && (
        <motion.div variants={fadeUp}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold
            ${loading ? 'bg-violet-50 text-violet-600 border border-violet-200'
              : apiError ? 'bg-orange-50 text-orange-600 border border-orange-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {loading && <><Activity size={12} className="animate-pulse" /> กำลังโหลดข้อมูลจาก Google Sheet…</>}
          {!loading && apiError && (
            <><AlertTriangle size={12} /> เชื่อมต่อ Apps Script ไม่ได้ – แสดงข้อมูล mock แทน
              <button onClick={fetchData} className="ml-auto underline text-[10px]">ลองใหม่</button>
            </>
          )}
          {!loading && !apiError && (
            <><Check size={12} /> ข้อมูลจาก Google Sheet – อัพเดตล่าสุด {lastUpdated}
              <button onClick={fetchData} className="ml-auto text-[10px] underline">Refresh</button>
            </>
          )}
        </motion.div>
      )}

      {/* ── KPI Cards (standard size) ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tickets',  value: totalTickets.toLocaleString(),       sub: filter === 'All' ? 'ทั้งหมด' : filter, tone: 'from-violet-400 to-purple-500', icon: FileText      },
          { label: 'Open',           value: openCount.toLocaleString(),           sub: 'รอดำเนินการ',                         tone: 'from-orange-400 to-pink-500',   icon: AlertTriangle },
          { label: 'Closed',         value: closedCount.toLocaleString(),         sub: 'ปิดแล้ว',                             tone: 'from-emerald-400 to-teal-500',  icon: Check         },
          { label: 'Peak Month',     value: peakMonth,                            sub: 'สูงสุดในเดือน',                       tone: 'from-sky-400 to-blue-500',      icon: TrendingUp    },
        ].map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ── Filter row ───────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 justify-end flex-wrap bg-white rounded-2xl border border-purple-100 shadow-sm p-1.5">
        <span className="text-[10px] font-bold text-gray-400 px-1">Filter:</span>
        {(['All','Monthly','Daily'] as SMFilter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
              filter === f ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm' : 'text-slate-500 hover:bg-purple-50'
            }`}>{f}</button>
        ))}
        {filter === 'Monthly' && (
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-purple-200 px-2 py-1.5 text-[11px] font-semibold text-purple-700 focus:outline-none bg-purple-50">
            {availableMonths.map(k => (
              <option key={k} value={k}>{SM_MONTH_LABELS[parseInt(k.slice(5,7))-1]} {k.slice(0,4)}</option>
            ))}
          </select>
        )}
        {filter === 'Daily' && (
          <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
            className="rounded-xl border border-purple-200 px-2 py-1.5 text-[11px] font-semibold text-purple-700 focus:outline-none bg-purple-50">
            {availableDays.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </motion.div>

      {/* ── Monthly Trend + Top Models ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <SectionCard title="Monthly Report Trend" subtitle={`Peak: ${peakMonth}`} className="xl:col-span-3">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={monthlyTrend} barCategoryGap="32%"
              margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="smBarG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#a78bfa" stopOpacity={1}    />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.80} />
                </linearGradient>
                <filter id="barShadow">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#a78bfa" floodOpacity="0.22" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="#ede9fe" vertical={false} />
              <XAxis dataKey="m" stroke="transparent" fontSize={10} tickLine={false} axisLine={false}
                tick={{ fill: '#64748b', fontWeight: 600 }} />
              <YAxis hide domain={[0, (max: number) => Math.ceil(max * 1.20)]} />
              <Tooltip
                cursor={{ fill: '#f5f3ff80', radius: 8 }}
                contentStyle={{ fontSize: 12, borderRadius: 14, border: 'none', boxShadow: '0 8px 32px #7c3aed18', background: 'white' }}
                labelStyle={{ fontWeight: 700, color: '#4c1d95', marginBottom: 2 }}
                formatter={(v: number) => [`${v.toLocaleString()} tickets`, 'Inquiries']}
              />
              <Bar dataKey="tickets" fill="url(#smBarG2)" radius={[8,8,0,0]} maxBarSize={64}
                style={{ filter: 'url(#barShadow)' }}
                label={{ position: 'top', fontSize: 10, fill: '#7c3aed', fontWeight: 700, offset: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top Inquired Models"
          subtitle={`คลิกเพื่อดูรายละเอียด • ${filter === 'All' ? 'ทั้งหมด' : filter === 'Monthly' ? selectedMonth : selectedDay}`}
          className="xl:col-span-2">
          {topModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <Smartphone size={28} className="opacity-30" />
              <p className="text-xs">ไม่มีข้อมูลในช่วงนี้</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topModels.map((m, i) => {
                const pct = topModels[0].count > 0 ? Math.round((m.count / topModels[0].count) * 100) : 0;
                return (
                  <motion.div key={m.model} variants={fadeUp}
                    onClick={() => setPopupModel(m.model)}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition group">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ background: MODEL_COLORS[i % MODEL_COLORS.length] }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-semibold text-gray-700 truncate group-hover:text-purple-700 transition">{m.model}</span>
                        <span className="font-bold text-purple-700 shrink-0 ml-1 stat-num">{m.count}</span>
                      </div>
                      <div className="w-full bg-purple-50 rounded-full h-1.5 overflow-hidden">
                        <motion.div className="h-1.5 rounded-full"
                          style={{ background: MODEL_COLORS[i % MODEL_COLORS.length] }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }} />
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-purple-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Ticket Status + PLM Status + Issue Category ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Ticket Status – computed from filteredTickets directly */}
        <SectionCard title="Ticket Status" subtitle={`รวม ${totalTickets.toLocaleString()} tickets`}>
          {/* All statuses – dynamic + clickable */}
          {(() => {
            const allStatuses = Object.entries(statusCounts)
              .filter(([k]) => k && k !== 'UNKNOWN' && k !== '')
              .sort((a, b) => b[1] - a[1]);
            const getStyle = (s: string) => {
              const u = s.toUpperCase();
              if (u.includes('OPEN'))   return { cls: 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100',  dot: 'bg-orange-400'  };
              if (u.includes('PROG'))   return { cls: 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100',               dot: 'bg-sky-400'     };
              if (u.includes('REVIEW')) return { cls: 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100',   dot: 'bg-violet-500'  };
              if (u.includes('RESOL'))  return { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',dot:'bg-emerald-400' };
              if (u.includes('CLOS'))   return { cls: 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100',       dot: 'bg-slate-400'   };
              return                           { cls: 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100',           dot: 'bg-gray-400'    };
            };
            const cols = allStatuses.length <= 2 ? 2 : allStatuses.length <= 4 ? 2 : 3;
            return (
              <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {allStatuses.map(([status, cnt]) => {
                  const { cls, dot } = getStyle(status);
                  const label = status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g,' ');
                  return (
                    <motion.button key={status} variants={fadeUp}
                      onClick={() => setPopupStatus(status)}
                      className={`flex flex-col items-center justify-center rounded-xl p-2 gap-0.5 transition cursor-pointer ${cls}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <div className="text-base font-extrabold stat-num leading-none">{cnt.toLocaleString()}</div>
                      <div className="text-[8px] font-semibold text-center leading-tight">{label}</div>
                    </motion.button>
                  );
                })}
              </div>
            );
          })()}
          {/* PLM Status – clickable rows */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">PLM Status <span className="normal-case font-normal">(คลิกเพื่อดูรายละเอียด)</span></div>
            <div className="space-y-1">
              {Object.entries(plmStatusCounts)
                .filter(([k]) => k && k !== 'N/A' && k !== '')
                .sort((a, b) => b[1] - a[1]).slice(0, 6)
                .map(([status, cnt]) => {
                  const dot = status.includes('OPEN') ? 'bg-orange-400' : status.includes('CLOS') ? 'bg-slate-400' : status.includes('REVIEW') ? 'bg-violet-400' : 'bg-purple-400';
                  return (
                    <button key={status} onClick={() => setPopupPLM(status)}
                      className="w-full flex items-center gap-2 text-[11px] rounded-lg px-2 py-1 hover:bg-purple-50 transition group text-left">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                      <span className="text-gray-600 font-medium flex-1 truncate group-hover:text-purple-700">{status}</span>
                      <div className="w-14 bg-gray-100 rounded-full h-1 shrink-0">
                        <div className={`h-1 rounded-full ${dot}`}
                          style={{ width: `${Math.round((cnt / totalTickets) * 100)}%` }} />
                      </div>
                      <span className="font-bold text-purple-700 stat-num w-7 text-right shrink-0">{cnt}</span>
                      <ChevronRight size={9} className="text-purple-300 opacity-0 group-hover:opacity-100 shrink-0" />
                    </button>
                  );
                })}
              {Object.keys(plmStatusCounts).filter(k => k !== 'N/A' && k !== '').length === 0 && (
                <div className="text-[10px] text-gray-400 italic">ไม่มี PLM Status ในชุดข้อมูลนี้</div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Issue Category Pie */}
        <SectionCard title="Issue Category" subtitle="Category breakdown">
          {mainTypeData.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-xs">ไม่มีข้อมูล</div>
          ) : (
            <div className="flex flex-col">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <Pie
                    data={mainTypeData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={98}
                    paddingAngle={2}>
                    {mainTypeData.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e9d5ff' }}
                    formatter={(v: number, name: string) => [`${v.toLocaleString()} tickets`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Clean legend – no overlap */}
              <div className="space-y-1 mt-1">
                {mainTypeData.map(c => {
                  const pct = totalTickets > 0 ? Math.round((c.value / totalTickets) * 100) : 0;
                  return (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                      <span className="text-[10px] text-gray-600 flex-1 truncate">{c.name}</span>
                      <span className="text-[10px] font-bold text-gray-800 stat-num">{c.value.toLocaleString()}</span>
                      <span className="text-[9px] text-gray-400 w-7 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Recent Tickets */}
        <SectionCard title="Recent Tickets" subtitle="Latest from selected period"
          action={
            <button onClick={() => showToast('Exported tickets ✓')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-violet-50 text-violet-700 text-[10px] font-bold hover:bg-violet-100 transition border border-violet-200">
              <Download size={10} /> Export
            </button>
          }>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
            {filteredTickets.slice().reverse().slice(0, 12).map(t => {
              const su = (t.status || '').toUpperCase();
              const sc = su.includes('CLOS') ? 'bg-slate-100 text-slate-500'
                : su.includes('OPEN')  ? 'bg-orange-100 text-orange-700'
                : su.includes('PROG')  ? 'bg-sky-100 text-sky-700'
                : su.includes('RESOL') ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500';
              const modelName = (t.ACC_MarketName || t.Model_No || '').replace(/Galaxy |Samsung /g, '');
              return (
                <div key={t.ticket_ID} className="flex items-center gap-2 rounded-xl bg-gray-50 px-2.5 py-2 hover:bg-purple-50 transition">
                  <div className="text-[9px] font-bold text-purple-600 shrink-0 w-14 truncate">{t.ticket_ID}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-gray-800 truncate">{modelName}</div>
                    <div className="text-[9px] text-gray-400 truncate">{t.title || t.content?.slice(0,50) || t.Category || t.Main_Type}</div>
                  </div>
                  <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[9px] font-bold ${sc}`}>{t.status}</span>
                </div>
              );
            })}
            {filteredTickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                <FileText size={22} className="opacity-30" />
                <p className="text-xs">ไม่มี ticket ในช่วงนี้</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Model Detail Popup ────────────────────────────────────── */}
      <AnimatePresence>
        {popupModel && (
          <ModelDetailPopup
            popupModel={popupModel}
            allTickets={allTickets}
            topModels={topModels}
            filter={filter}
            selectedMonth={selectedMonth}
            selectedDay={selectedDay}
            onClose={() => setPopupModel(null)}
          />
        )}
      </AnimatePresence>

      {/* ── PLM Status Detail Popup ───────────────────────────────── */}
      <AnimatePresence>
        {popupPLM && (() => {
          const plmTickets = filteredTickets
            .filter(t => (t.PLM_STATUS || '').toUpperCase() === popupPLM)
            .sort((a, b) => (b.Questioned_Date || '').localeCompare(a.Questioned_Date || ''));
          const accentColor = '#a78bfa';
          const statusColor = (s: string) => {
            const u = (s || '').toUpperCase();
            return u.includes('CLOS') ? 'bg-slate-100 text-slate-500' :
              u.includes('OPEN')  ? 'bg-orange-100 text-orange-700' :
              u.includes('PROG')  ? 'bg-sky-100 text-sky-700' :
              u.includes('RESOL') ? 'bg-emerald-100 text-emerald-700' :
              u.includes('REVIEW')? 'bg-violet-100 text-violet-700' :
              'bg-gray-100 text-gray-500';
          };
          return (
            <>
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setPopupPLM(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 24 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-x-3 top-[4%] bottom-[4%] z-50 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-4 flex items-start justify-between shrink-0"
                  style={{ background: 'linear-gradient(135deg,#a78bfa1a,#7c3aed06)', borderBottom: '2px solid #a78bfa2a' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <FileText size={14} className="text-violet-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">PLM Status Detail</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900">{popupPLM}</h2>
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white mt-1.5 inline-block" style={{ background: accentColor }}>
                      {plmTickets.length} tickets
                    </span>
                  </div>
                  <button onClick={() => setPopupPLM(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition shrink-0 ml-3">
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                      <tr>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">Ticket ID</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">PLM ID</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">วันที่ Register</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px]">Model</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px]">หัวข้อปัญหา</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">Ticket Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {plmTickets.map((t, idx) => {
                        const model = (t.ACC_MarketName || t.Model_No || '-').replace(/Galaxy |Samsung /g,'');
                        return (
                          <tr key={t.ticket_ID ?? idx} className="hover:bg-violet-50/30 transition">
                            <td className="px-5 py-2.5 font-bold text-purple-600 whitespace-nowrap">{t.ticket_ID}</td>
                            <td className="px-5 py-2.5 text-violet-700 font-semibold whitespace-nowrap">{t.PLM_ID || '-'}</td>
                            <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{t.Questioned_Date || '-'}</td>
                            <td className="px-5 py-2.5 text-gray-700 font-medium whitespace-nowrap">{model}</td>
                            <td className="px-5 py-2.5 max-w-[280px]">
                              <div className="font-semibold text-gray-800 line-clamp-2 leading-snug">
                                {t.title || t.content?.replace(/<[^>]+>/g,'').slice(0,100) || t.Category || '-'}
                              </div>
                              {t.Category && <div className="text-[9px] text-gray-400 mt-0.5">{t.Category}</div>}
                            </td>
                            <td className="px-5 py-2.5">
                              <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${statusColor(t.status || '')}`}>
                                {t.status || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {plmTickets.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-12 text-gray-400">ไม่มีข้อมูล</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center shrink-0 bg-gray-50/50">
                  <span className="text-[10px] text-gray-400">{plmTickets.length} รายการทั้งหมด</span>
                  <button onClick={() => setPopupPLM(null)}
                    className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[11px] font-bold hover:opacity-90 transition">
                    ปิด
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ── Ticket Status Detail Popup ────────────────────────────── */}
      <AnimatePresence>
        {popupStatus && (() => {
          const statusTickets = filteredTickets
            .filter(t => (t.status || '').toUpperCase() === popupStatus)
            .sort((a, b) => (b.Questioned_Date || '').localeCompare(a.Questioned_Date || ''));

          const statusLabel = popupStatus.charAt(0) + popupStatus.slice(1).toLowerCase().replace(/_/g,' ');
          const getAccent = (s: string) => {
            const u = s.toUpperCase();
            if (u.includes('OPEN'))   return '#f97316';
            if (u.includes('PROG'))   return '#38bdf8';
            if (u.includes('REVIEW')) return '#a78bfa';
            if (u.includes('RESOL'))  return '#10b981';
            if (u.includes('CLOS'))   return '#94a3b8';
            return '#a78bfa';
          };
          const accentColor = getAccent(popupStatus);
          const statusColor = (s: string) => {
            const u = (s || '').toUpperCase();
            return u.includes('CLOS') ? 'bg-slate-100 text-slate-500' :
              u.includes('OPEN')  ? 'bg-orange-100 text-orange-700' :
              u.includes('PROG')  ? 'bg-sky-100 text-sky-700' :
              u.includes('RESOL') ? 'bg-emerald-100 text-emerald-700' :
              u.includes('REVIEW')? 'bg-violet-100 text-violet-700' :
              'bg-gray-100 text-gray-500';
          };

          // ── Excel export (CSV format) ─────────────────────────────
          const exportExcel = () => {
            const headers = ['Ticket ID','Date','Model No','Market Name','Category','Title/Issue','Status','PLM Status','PLM ID','Branch'];
            const csvRows = [headers.join(',')];
            statusTickets.forEach(t => {
              const row = [
                t.ticket_ID,
                t.Questioned_Date,
                t.Model_No,
                t.ACC_MarketName,
                t.Category || t.Main_Type,
                `"${(t.title || t.content?.replace(/<[^>]+>/g,'').slice(0,100) || '').replace(/"/g,"''")}"`,
                t.status,
                t.PLM_STATUS,
                t.PLM_ID,
                t.Branch,
              ];
              csvRows.push(row.join(','));
            });
            const bom = '﻿'; // BOM for Thai characters in Excel
            const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tickets_${popupStatus}_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          };

          return (
            <>
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setPopupStatus(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 24 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-x-3 top-[3%] bottom-[3%] z-50 max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-4 flex items-start justify-between shrink-0"
                  style={{ background: `linear-gradient(135deg,${accentColor}18,${accentColor}05)`, borderBottom: `2px solid ${accentColor}28` }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <FileText size={14} style={{ color: accentColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>Ticket Status Detail</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900">{statusLabel}</h2>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: accentColor }}>
                        {statusTickets.length.toLocaleString()} tickets
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                        {filter === 'All' ? 'ทั้งหมด' : filter === 'Monthly' ? selectedMonth : selectedDay}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Export Excel */}
                    <button onClick={exportExcel}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition"
                      style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}10` }}
                      title="Export to Excel (CSV)">
                      <Download size={12} /> Export Excel
                    </button>
                    <button onClick={() => setPopupStatus(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                      <tr>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">Ticket ID</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">วันที่</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px]">Model</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px]">หัวข้อปัญหา</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">Category</th>
                        <th className="text-left px-5 py-3 font-bold text-gray-400 uppercase tracking-wide text-[9px] whitespace-nowrap">PLM Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {statusTickets.map((t, idx) => {
                        const model = (t.ACC_MarketName || t.Model_No || '-').replace(/Galaxy |Samsung /g,'');
                        return (
                          <tr key={t.ticket_ID ?? idx} className="hover:bg-orange-50/20 transition">
                            <td className="px-5 py-2.5 font-bold text-purple-600 whitespace-nowrap">{t.ticket_ID}</td>
                            <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{t.Questioned_Date || '-'}</td>
                            <td className="px-5 py-2.5 text-gray-700 font-medium whitespace-nowrap">{model}</td>
                            <td className="px-5 py-2.5 max-w-[280px]">
                              <div className="font-semibold text-gray-800 line-clamp-2 leading-snug">
                                {t.title || t.content?.replace(/<[^>]+>/g,'').slice(0,100) || t.Category || '-'}
                              </div>
                            </td>
                            <td className="px-5 py-2.5 text-gray-600 whitespace-nowrap">{t.Category || t.Main_Type || '-'}</td>
                            <td className="px-5 py-2.5">
                              {t.PLM_STATUS ? (
                                <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${statusColor(t.PLM_STATUS)}`}>
                                  {t.PLM_STATUS}
                                </span>
                              ) : <span className="text-gray-300">–</span>}
                            </td>
                          </tr>
                        );
                      })}
                      {statusTickets.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-12 text-gray-400">ไม่มีข้อมูล</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center shrink-0 bg-gray-50/50">
                  <span className="text-[10px] text-gray-400">
                    แสดง <span className="font-bold text-gray-700">{statusTickets.length.toLocaleString()}</span> รายการ
                  </span>
                  <div className="flex gap-2">
                    <button onClick={exportExcel}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-bold border transition"
                      style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}10` }}>
                      <Download size={11} /> Export Excel
                    </button>
                    <button onClick={() => setPopupStatus(null)}
                      className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[11px] font-bold hover:opacity-90 transition">
                      ปิด
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Tab: PLM Status ──────────────────────────────────────────────────
function PLMStatusTab({ showToast }: { showToast: (msg: string) => void }) {
  const [rows, setRows] = useState<SMTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [plmDetail, setPlmDetail] = useState<{ title: string; subtitle: string; rows: SMTicket[] } | null>(null);
  const [registerKeyword, setRegisterKeyword] = useState('');
  const [registerStatusFilter, setRegisterStatusFilter] = useState('ALL');
  const [registerModelFilter, setRegisterModelFilter] = useState('ALL');
  const [registerGroupFilter, setRegisterGroupFilter] = useState('ALL');
  const [registerPage, setRegisterPage] = useState(1);

  const fetchPLMData = useCallback(() => {
    setLoading(true);
    setApiError(false);
    fetch(PLM_APPS_SCRIPT_URL)
      .then(r => r.json())
      .then((json: Record<string, unknown>) => {
        const rawRows = Array.isArray(json.rows)
          ? (json.rows as Record<string, unknown>[]).map((r): SMTicket => {
            const questionedDate = normalizePLMDate(String(r.register_date || r.request_date || ''));
            const model = String(r.model || 'Unknown');
            const status = String(r.status || '');
            const symptom = String(r.symptom || '');
            return {
              ticket_ID: String(r.plm || r.id || ''),
              PLM_ID: String(r.plm || ''),
              Questioned_Date: questionedDate,
              Month: questionedDate.slice(0, 7),
              status,
              Model_No: model,
              ACC_MarketName: model,
              Branch: String(r.pic || ''),
              Channel: String(r.channel || ''),
              Main_Type: String(r.group || ''),
              Sub_Type: String(r.group || ''),
              Category: String(r.group || ''),
              title: symptom,
              content: String(r.remark || symptom),
              PLM_STATUS: status,
            };
          })
          : Array.isArray(json.raw)
          ? json.raw as SMTicket[]
          : Array.isArray(json.data)
            ? json.data as SMTicket[]
            : [];
        setRows(rawRows.map(t => ({
          ...t,
          Questioned_Date: normalizePLMDate(t.Questioned_Date),
        })));
        setLastUpdated(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
        setLoading(false);
      })
      .catch(() => {
        setRows(SM_TICKETS_MOCK);
        setApiError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchPLMData);
  }, [fetchPLMData]);

  useEffect(() => {
    if (!plmDetail) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPlmDetail(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [plmDetail]);

  const isClosedPLM = useCallback((status: string) => {
    const s = status.trim().toUpperCase();
    return s.includes('CLOS') || s.includes('COMPLETE') || s.includes('RESOLVED') || s === 'DONE';
  }, []);

  const plmRows = useMemo(() => rows.filter(t => {
    const status = (t.PLM_STATUS || '').trim().toUpperCase();
    return status && status !== 'N/A' && status !== '-';
  }), [rows]);

  const registeredCount = plmRows.length;
  const closedCount = useMemo(() =>
    plmRows.filter(t => isClosedPLM(t.PLM_STATUS || '')).length
  , [plmRows, isClosedPLM]);
  const pendingCount = Math.max(0, registeredCount - closedCount);

  const topModels = useMemo(() => {
    const counts: Record<string, number> = {};
    plmRows.forEach(t => {
      const model = t.ACC_MarketName || t.Model_No || 'Unknown';
      counts[model] = (counts[model] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([model, count]) => ({ model, count }));
  }, [plmRows]);

  const topModel = topModels[0];
  const plmStatusRows = useMemo(() => {
    const counts: Record<string, number> = {};
    plmRows.forEach(t => {
      const status = (t.PLM_STATUS || 'Unknown').trim().toUpperCase();
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [plmRows]);

  const registeredPLMRows = useMemo(() =>
    [...plmRows]
      .sort((a, b) => (b.Questioned_Date || '').localeCompare(a.Questioned_Date || ''))
  , [plmRows]);

  const registerStatusOptions = useMemo(() =>
    [...new Set(registeredPLMRows.map(t => (t.PLM_STATUS || '').trim().toUpperCase()).filter(Boolean))].sort()
  , [registeredPLMRows]);

  const registerModelOptions = useMemo(() =>
    [...new Set(registeredPLMRows.map(t => t.ACC_MarketName || t.Model_No || '').filter(Boolean))].sort()
  , [registeredPLMRows]);

  const registerGroupOptions = useMemo(() =>
    [...new Set(registeredPLMRows.map(t => t.Category || t.Main_Type || '').filter(Boolean))].sort()
  , [registeredPLMRows]);

  const filteredRegisterRows = useMemo(() => {
    const kw = registerKeyword.trim().toLowerCase();
    return registeredPLMRows.filter(t => {
      const status = (t.PLM_STATUS || '').trim().toUpperCase();
      const model = t.ACC_MarketName || t.Model_No || '';
      const group = t.Category || t.Main_Type || '';
      const matchesStatus = registerStatusFilter === 'ALL' || status === registerStatusFilter;
      const matchesModel = registerModelFilter === 'ALL' || model === registerModelFilter;
      const matchesGroup = registerGroupFilter === 'ALL' || group === registerGroupFilter;
      const searchable = [
        t.PLM_ID, t.ticket_ID, t.Questioned_Date, model, group, t.Branch,
        t.Channel, status, t.title, t.content, t.Sub_Type,
      ].join(' ').toLowerCase();
      return matchesStatus && matchesModel && matchesGroup && (!kw || searchable.includes(kw));
    });
  }, [registeredPLMRows, registerKeyword, registerStatusFilter, registerModelFilter, registerGroupFilter]);

  const REGISTER_PAGE_SIZE = 12;
  const registerTotalPages = Math.max(1, Math.ceil(filteredRegisterRows.length / REGISTER_PAGE_SIZE));
  const registerSafePage = Math.min(registerPage, registerTotalPages);
  const pagedRegisterRows = useMemo(() => {
    const start = (registerSafePage - 1) * REGISTER_PAGE_SIZE;
    return filteredRegisterRows.slice(start, start + REGISTER_PAGE_SIZE);
  }, [filteredRegisterRows, registerSafePage]);

  const resetRegisterPage = () => setRegisterPage(1);

  const openPLMDetail = (title: string, subtitle: string, detailRows: SMTicket[]) => {
    setPlmDetail({ title, subtitle, rows: detailRows });
  };

  const breakdownRows = (detailRows: SMTicket[], getKey: (t: SMTicket) => string) => {
    const counts: Record<string, number> = {};
    detailRows.forEach(t => {
      const key = getKey(t).trim() || 'Unknown';
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">
      {(loading || apiError || lastUpdated) && (
        <motion.div variants={fadeUp}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold
            ${loading ? 'bg-violet-50 text-violet-600 border border-violet-200'
              : apiError ? 'bg-orange-50 text-orange-600 border border-orange-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {loading && <><Activity size={12} className="animate-pulse" /> กำลังโหลดข้อมูล PLM จาก Google Sheet...</>}
          {!loading && apiError && (
            <><AlertTriangle size={12} /> เชื่อมต่อ Google Sheet ไม่ได้ - แสดงข้อมูลสำรองแทน
              <button onClick={fetchPLMData} className="ml-auto underline text-[10px]">ลองใหม่</button>
            </>
          )}
          {!loading && !apiError && (
            <><Check size={12} /> ข้อมูล PLM จาก Google Sheet - อัพเดตล่าสุด {lastUpdated}
              <button onClick={() => { fetchPLMData(); showToast('Refreshing PLM Status'); }} className="ml-auto text-[10px] underline">Refresh</button>
            </>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Registered Cases',
            value: registeredCount.toLocaleString(),
            sub: 'PLM register แล้ว',
            tone: 'from-violet-400 to-purple-500',
            icon: FileText,
            rows: registeredPLMRows,
            title: 'Registered PLM Cases',
            subtitle: 'ข้อมูล Register ทั้งหมดจาก Google Sheet',
          },
          {
            label: 'Top Model',
            value: topModel ? topModel.count.toLocaleString() : '0',
            sub: topModel?.model ?? 'ยังไม่มีข้อมูล',
            tone: 'from-sky-400 to-blue-500',
            icon: Smartphone,
            rows: topModel ? registeredPLMRows.filter(t => (t.ACC_MarketName || t.Model_No || 'Unknown') === topModel.model) : [],
            title: topModel ? `Top Model: ${topModel.model}` : 'Top Model',
            subtitle: 'รายละเอียดเคสของรุ่นที่ Register สูงสุด',
          },
          {
            label: 'Closed Cases',
            value: closedCount.toLocaleString(),
            sub: 'ปิดเคสแล้ว',
            tone: 'from-emerald-400 to-teal-500',
            icon: Check,
            rows: registeredPLMRows.filter(t => isClosedPLM(t.PLM_STATUS || '')),
            title: 'Closed PLM Cases',
            subtitle: 'เคส PLM ที่ปิดแล้ว',
          },
          {
            label: 'Pending Cases',
            value: pendingCount.toLocaleString(),
            sub: 'ยังค้างอยู่',
            tone: 'from-orange-400 to-pink-500',
            icon: AlertTriangle,
            rows: registeredPLMRows.filter(t => !isClosedPLM(t.PLM_STATUS || '')),
            title: 'Pending PLM Cases',
            subtitle: 'เคส PLM ที่ยังค้างอยู่',
          },
        ].map(k => (
          <button key={k.label} type="button" onClick={() => openPLMDetail(k.title, k.subtitle, k.rows)} className="text-left">
            <KpiCard {...k} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard title="PLM Status Breakdown" subtitle="สัดส่วนเคสตามสถานะ PLM">
          <div className="space-y-2">
            {plmStatusRows.map(([status, count]) => {
              const pct = registeredCount ? Math.round((count / registeredCount) * 100) : 0;
              const closed = isClosedPLM(status);
              return (
                <motion.button
                  key={status}
                  type="button"
                  variants={fadeUp}
                  onClick={() => openPLMDetail(
                    `PLM Status: ${status}`,
                    `รายละเอียดเคสสถานะ ${status}`,
                    registeredPLMRows.filter(t => (t.PLM_STATUS || '').trim().toUpperCase() === status)
                  )}
                  className="w-full rounded-xl bg-gray-50 p-3 text-left transition hover:bg-purple-50"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${closed ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                      <span className="truncate text-xs font-bold text-gray-700">{status}</span>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${closed ? 'bg-emerald-400' : 'bg-orange-400'}`}
                    />
                  </div>
                  <div className="mt-1 text-right text-[10px] font-semibold text-gray-400">{pct}%</div>
                </motion.button>
              );
            })}
            {plmStatusRows.length === 0 && (
              <div className="rounded-xl bg-gray-50 p-6 text-center text-xs font-semibold text-gray-400">
                ยังไม่มีข้อมูล PLM_STATUS จาก Google Sheet
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Top Registered Models" subtitle="รุ่นที่ Register PLM มากที่สุด">
          <div className="space-y-2">
            {topModels.slice(0, 7).map((item, idx) => {
              const pct = topModel?.count ? Math.round((item.count / topModel.count) * 100) : 0;
              return (
                <motion.button
                  key={item.model}
                  type="button"
                  variants={fadeUp}
                  onClick={() => openPLMDetail(
                    `Model: ${item.model}`,
                    'รายละเอียดเคส Register ของรุ่นนี้',
                    registeredPLMRows.filter(t => (t.ACC_MarketName || t.Model_No || 'Unknown') === item.model)
                  )}
                  className="flex w-full items-center gap-3 rounded-xl bg-purple-50/60 px-3 py-2 text-left transition hover:bg-purple-100/70"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-extrabold text-purple-600">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-gray-800">{item.model}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.04 }}
                        className="h-full rounded-full bg-purple-400"
                      />
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-purple-700">{item.count.toLocaleString()}</div>
                </motion.button>
              );
            })}
            {topModels.length === 0 && (
              <div className="rounded-xl bg-gray-50 p-6 text-center text-xs font-semibold text-gray-400">
                ยังไม่มีรุ่นที่ Register PLM
              </div>
            )}
          </div>
        </SectionCard>

      </div>

      <SectionCard title="All Registered PLM Cases" subtitle="ข้อมูล Register ทั้งหมดจาก Google Sheet">
        <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={registerKeyword}
              onChange={(e) => { setRegisterKeyword(e.target.value); resetRegisterPage(); }}
              placeholder="Search PLM, model, symptom, PIC..."
              className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-8 pr-3 text-xs font-semibold text-gray-700 outline-none transition focus:border-violet-300 focus:bg-white"
            />
          </div>
          <select
            value={registerStatusFilter}
            onChange={(e) => { setRegisterStatusFilter(e.target.value); resetRegisterPage(); }}
            className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:border-violet-300 focus:bg-white"
          >
            <option value="ALL">All Status</option>
            {registerStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={registerModelFilter}
            onChange={(e) => { setRegisterModelFilter(e.target.value); resetRegisterPage(); }}
            className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:border-violet-300 focus:bg-white"
          >
            <option value="ALL">All Models</option>
            {registerModelOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={registerGroupFilter}
            onChange={(e) => { setRegisterGroupFilter(e.target.value); resetRegisterPage(); }}
            className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:border-violet-300 focus:bg-white"
          >
            <option value="ALL">All Groups</option>
            {registerGroupOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <button
            type="button"
            onClick={() => {
              setRegisterKeyword('');
              setRegisterStatusFilter('ALL');
              setRegisterModelFilter('ALL');
              setRegisterGroupFilter('ALL');
              setRegisterPage(1);
            }}
            className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition hover:bg-purple-50 hover:text-purple-700"
          >
            Clear
          </button>
        </div>

        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-gray-400">
          <div className="flex items-center gap-1">
            <Filter size={12} />
            Showing <span className="text-gray-700">{filteredRegisterRows.length.toLocaleString()}</span> of {registeredPLMRows.length.toLocaleString()} cases
          </div>
          <div>Page {registerSafePage} / {registerTotalPages}</div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="sticky top-0 z-10 bg-gray-50 text-[9px] uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-bold">PLM</th>
                  <th className="px-3 py-2 font-bold">Register Date</th>
                  <th className="px-3 py-2 font-bold">Model</th>
                  <th className="px-3 py-2 font-bold">Group</th>
                  <th className="px-3 py-2 font-bold">PIC</th>
                  <th className="px-3 py-2 font-bold">Status</th>
                  <th className="px-3 py-2 font-bold">Symptom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedRegisterRows.map((t, idx) => {
                  const status = (t.PLM_STATUS || '-').toUpperCase();
                  const closed = isClosedPLM(status);
                  return (
                    <tr
                      key={t.ticket_ID || idx}
                      onClick={() => openPLMDetail(t.PLM_ID || t.ticket_ID || 'PLM Case', 'รายละเอียดเคสที่เลือก', [t])}
                      className="cursor-pointer hover:bg-purple-50/60 transition"
                    >
                      <td className="px-3 py-2 font-bold text-purple-600 whitespace-nowrap">{t.PLM_ID || t.ticket_ID || '-'}</td>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{t.Questioned_Date || '-'}</td>
                      <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{t.ACC_MarketName || t.Model_No || '-'}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{t.Category || t.Main_Type || '-'}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{t.Branch || '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${closed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-[360px]">
                        <div className="line-clamp-2 font-medium text-gray-700">{t.title || t.content || '-'}</div>
                      </td>
                    </tr>
                  );
                })}
                {pagedRegisterRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-xs font-semibold text-gray-400">
                      ไม่พบรายการ Register PLM ที่ตรงกับ filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={registerSafePage <= 1}
            onClick={() => setRegisterPage(p => Math.max(1, p - 1))}
            className="rounded-xl border border-gray-100 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={registerSafePage >= registerTotalPages}
            onClick={() => setRegisterPage(p => Math.min(registerTotalPages, p + 1))}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </SectionCard>

      <AnimatePresence>
        {plmDetail && (() => {
          const detailRows = [...plmDetail.rows].sort((a, b) => (b.Questioned_Date || '').localeCompare(a.Questioned_Date || ''));
          const detailClosed = detailRows.filter(t => isClosedPLM(t.PLM_STATUS || '')).length;
          const detailPending = Math.max(0, detailRows.length - detailClosed);
          const statusBreakdown = breakdownRows(detailRows, t => (t.PLM_STATUS || '').toUpperCase());
          const modelBreakdown = breakdownRows(detailRows, t => t.ACC_MarketName || t.Model_No || 'Unknown');
          const groupBreakdown = breakdownRows(detailRows, t => t.Category || t.Main_Type || 'Unknown');
          const picBreakdown = breakdownRows(detailRows, t => t.Branch || 'Unknown');
          const selectedCase = detailRows.length === 1 ? detailRows[0] : null;
          const breakdownBlock = (title: string, items: [string, number][], color: string) => (
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">{title}</div>
              <div className="space-y-2">
                {items.map(([name, count]) => {
                  const pct = detailRows.length ? Math.round((count / detailRows.length) * 100) : 0;
                  return (
                    <div key={name}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-bold text-gray-700">{name}</span>
                        <span className="text-[11px] font-extrabold text-gray-900">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="text-[11px] font-semibold text-gray-400">ไม่มีข้อมูล</div>}
              </div>
            </div>
          );

          return (
            <>
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setPlmDetail(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 18 }}
                className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[min(1120px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-500">
                      <FileText size={14} /> PLM Detail
                    </div>
                    <h2 className="truncate text-xl font-extrabold text-gray-900">{plmDetail.title}</h2>
                    <p className="mt-1 text-xs font-medium text-gray-500">{plmDetail.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlmDetail(null)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                    {[
                      { label: 'Cases', value: detailRows.length, tone: 'bg-violet-50 text-violet-700' },
                      { label: 'Closed', value: detailClosed, tone: 'bg-emerald-50 text-emerald-700' },
                      { label: 'Pending', value: detailPending, tone: 'bg-orange-50 text-orange-700' },
                      { label: 'Models', value: modelBreakdown.length, tone: 'bg-sky-50 text-sky-700' },
                    ].map(item => (
                      <div key={item.label} className={`rounded-xl p-3 ${item.tone}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">{item.label}</div>
                        <div className="mt-1 text-2xl font-extrabold stat-num">{item.value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {selectedCase && (
                    <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                      <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-violet-500">Selected Case</div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {[
                          ['PLM', selectedCase.PLM_ID || selectedCase.ticket_ID || '-'],
                          ['Register Date', selectedCase.Questioned_Date || '-'],
                          ['Model', selectedCase.ACC_MarketName || selectedCase.Model_No || '-'],
                          ['Group', selectedCase.Category || selectedCase.Main_Type || '-'],
                          ['PIC', selectedCase.Branch || '-'],
                          ['Status', selectedCase.PLM_STATUS || '-'],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
                            <div className="mt-1 text-xs font-bold text-gray-800">{value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Symptom / Remark</div>
                        <div className="mt-1 whitespace-pre-wrap text-xs font-medium leading-relaxed text-gray-700">
                          {selectedCase.title || selectedCase.content || '-'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {breakdownBlock('Status', statusBreakdown, 'bg-violet-500')}
                    {breakdownBlock('Model', modelBreakdown, 'bg-sky-500')}
                    {breakdownBlock('Group', groupBreakdown, 'bg-emerald-500')}
                    {breakdownBlock('PIC', picBreakdown, 'bg-orange-500')}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <div className="max-h-[360px] overflow-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="sticky top-0 bg-gray-50 text-[9px] uppercase tracking-wide text-gray-400">
                          <tr>
                            <th className="px-3 py-2 font-bold">PLM</th>
                            <th className="px-3 py-2 font-bold">Date</th>
                            <th className="px-3 py-2 font-bold">Model</th>
                            <th className="px-3 py-2 font-bold">Group</th>
                            <th className="px-3 py-2 font-bold">Status</th>
                            <th className="px-3 py-2 font-bold">Symptom</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {detailRows.map((t, idx) => {
                            const status = (t.PLM_STATUS || '-').toUpperCase();
                            const closed = isClosedPLM(status);
                            return (
                              <tr key={t.ticket_ID || idx} className="hover:bg-purple-50/40">
                                <td className="px-3 py-2 font-bold text-purple-600 whitespace-nowrap">{t.PLM_ID || t.ticket_ID || '-'}</td>
                                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{t.Questioned_Date || '-'}</td>
                                <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{t.ACC_MarketName || t.Model_No || '-'}</td>
                                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{t.Category || t.Main_Type || '-'}</td>
                                <td className="px-3 py-2">
                                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${closed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 max-w-[360px]">
                                  <div className="line-clamp-2 font-medium text-gray-700">{t.title || t.content || '-'}</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );

}

// ─── Tab: Projects & Timeline ─────────────────────────────────────────
function ProjectsTimelineTab({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">
      <SectionCard title="Active Projects" subtitle="Gantt-style timeline overview"
        action={
          <button onClick={() => showToast('New project created')}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold flex items-center gap-1">
            <Plus size={11} /> Add Project
          </button>
        }
      >
        <div className="space-y-3">
          {PROJECTS_TIMELINE.map((p, i) => {
            const tone = TONE_BG[p.color as ToneKey];
            return (
              <motion.div key={i} variants={fadeUp}
                className={`p-3 rounded-xl ${tone.bg}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.start} → {p.end}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${tone.text} bg-white`}>{p.status}</span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2 relative overflow-hidden">
                  <motion.div className={`${tone.bar} h-2 rounded-full flex items-center justify-end pr-1`}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.1 }}>
                    <span className="text-[9px] text-white font-bold">{p.progress}%</span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Projects',  value: '5',  sub: 'Active',     tone: 'from-violet-400 to-purple-500' },
          { label: 'Avg Progress',    value: '52%',sub: 'On track',   tone: 'from-emerald-400 to-teal-500' },
          { label: 'Approaching Due', value: '2',  sub: 'This week',  tone: 'from-orange-400 to-pink-500' },
        ].map(k => <KpiCard key={k.label} {...k} />)}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────
export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<WorkTab>('Overall');
  const [jumpTaskId, setJumpTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <>
      <TopBar title="Work" subtitle="Manage tasks, products, manpower, and service operations" />

      {/* Tabs */}
      <div className="mb-4 overflow-x-auto rounded-2xl border border-purple-100/70 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex min-w-max items-center gap-2">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`h-10 rounded-xl px-4 text-[12px] font-extrabold whitespace-nowrap transition ${
                activeTab === tab
                  ? 'bg-purple-100 text-purple-700 shadow-[inset_0_-2px_0_rgba(124,58,237,0.45)] dark:bg-purple-500/20 dark:text-purple-300'
                  : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-purple-500/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'Overall'              && <OverallTab            showToast={showToast} onSwitchToTasks={(taskId) => { setActiveTab('Tasks'); setJumpTaskId(taskId ?? null); }} />}
        {activeTab === 'Tasks'                && <TasksTab              showToast={showToast} jumpTaskId={jumpTaskId} onClearJump={() => setJumpTaskId(null)} />}
        {activeTab === 'Estimator'            && <EstimatorTab          showToast={showToast} />}
        {activeTab === 'Part Price DOT'       && <PartPriceDOTTab       showToast={showToast} />}
        {activeTab === 'Part Price Retail'    && <PartPriceRetailTab    showToast={showToast} />}
        {activeTab === 'Product'              && <ProductTab            showToast={showToast} />}
        {activeTab === 'Manpower'             && <ManpowerTab           showToast={showToast} />}
        {activeTab === 'Samsung Members'      && <SamsungMembersTab     showToast={showToast} />}
        {activeTab === 'PLM Status'           && <PLMStatusTab          showToast={showToast} />}
        {activeTab === 'Projects & Timeline'  && <ProjectsTimelineTab   showToast={showToast} />}
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium z-50 flex items-center gap-2"
          >
            <CheckCircle2 size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
