'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import {
  BookOpen, Trophy, Clock, Flame, Target, TrendingUp,
  Search, Plus, Play, Pause, Code2, Bookmark, FileText, Video,
  Link as LinkIcon, FileQuestion, Calendar, ChevronRight, ChevronDown,
  CheckCircle2, Circle, Award,
  Brain, Coffee, Sparkles, Zap,
  Download, Upload, Eye, Edit3, Save, Filter, X, Lightbulb, Star,
  Settings, Volume2, SkipBack, SkipForward,
  ExternalLink, RefreshCw, Globe, AlignLeft, Bell, BarChart2,
  GraduationCap, Headphones, Hash, Heart, Check, Bold, Underline, Highlighter,
  Heading1, Heading2, List, ListOrdered, Quote,
  Share2, Image, Briefcase, MessageSquare, Music, Lock, Link2,
} from 'lucide-react';

import { Aws, Github, Discord, Notion, Youtube, Instagram, Linkedin, X as XIcon } from '@thesvg/react';
// FacebookIcon and TiktokIcon defined below as inline SVG components
const FacebookIcon = ({ size = 14 }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="#1877F2"/>
    <path
      d="M62 8H52C42.1 8 34 16.1 34 26v10H22v16h12v40h18V52h14l2-16H52v-8c0-2.2 1.8-4 4-4h8V8Z"
      fill="white"
    />
  </svg>
);
const TiktokIcon = ({ size = 14 }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#010101"/>
    <path d="M28 16.5a7 7 0 0 1-4-1.3V23a6 6 0 1 1-6-6c.3 0 .6 0 .9.1v3.1a3 3 0 1 0 2.1 2.8V8h3s.4 5 4 6v2.5z" fill="white"/>
    <path d="M28 16.5a7 7 0 0 1-4-1.3V23a6 6 0 1 1-6-6c.3 0 .6 0 .9.1v3.1a3 3 0 1 0 2.1 2.8V8h3s.4 5 4 6v2.5z" fill="#69C9D0" fillOpacity="0.6"/>
  </svg>
);
import IconGlyph from '@/components/IconGlyph';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Tabs ──────────────────────────────────────────────────────────────
const TABS = [
  'Overall', 'Skill Roadmap', 'Courses', 'Course Builder',
  'Practice Lab', 'Resource Inbox', 'Schedule Planner',
  'Exams & Certificates', 'Review & Portfolio',
] as const;
type LearningTab = (typeof TABS)[number];

// ── Mock data ─────────────────────────────────────────────────────────
const KPI = [
  { label: 'Learning Score',  value: '87',   sub: '+5 vs last week',  icon: Trophy,     tone: 'from-violet-400 to-purple-500' },
  { label: 'Active Courses',  value: '4',    sub: '2 due this week',  icon: BookOpen,   tone: 'from-emerald-400 to-teal-500' },
  { label: 'Hours This Week', value: '12.4', sub: 'Goal 15h',         icon: Clock,      tone: 'from-sky-400 to-blue-500' },
  { label: 'Day Streak',      value: '24',   sub: 'Personal best!',   icon: Flame,      tone: 'from-orange-400 to-pink-500' },
  { label: 'Avg Mastery',     value: '68%',  sub: '+3% vs last',      icon: Target,     tone: 'from-rose-400 to-fuchsia-500' },
  { label: 'Goal Progress',   value: '62%',  sub: 'Q2 target',        icon: TrendingUp, tone: 'from-amber-400 to-orange-500' },
];

const TODAY_PLAN = [
  { time: '09:00', title: 'English Grammar Essentials',  duration: '30m', cat: 'Language',  done: true,  color: 'purple' },
  { time: '10:30', title: 'AI Foundations · Module 4',   duration: '45m', cat: 'AI',        done: true,  color: 'sky' },
  { time: '13:00', title: 'React Basics — Components',   duration: '60m', cat: 'Coding',    done: false, color: 'emerald' },
  { time: '15:00', title: 'Data Structures Practice',    duration: '40m', cat: 'CS',        done: false, color: 'orange' },
  { time: '17:00', title: 'Investing 101 — Risk',        duration: '30m', cat: 'Finance',   done: false, color: 'rose' },
];

const ACTIVE_COURSES = [
  { name: 'English Mastery',     progress: 72, lessons: '24/33', tone: 'from-violet-400 to-purple-500', icon: '🎯' },
  { name: 'React / Web Dev',     progress: 58, lessons: '18/31', tone: 'from-emerald-400 to-teal-500', icon: '⚛️' },
  { name: 'AI Foundations',      progress: 84, lessons: '21/25', tone: 'from-sky-400 to-blue-500',     icon: '🤖' },
  { name: 'Investing & Risk',    progress: 41, lessons: '9/22',  tone: 'from-orange-400 to-rose-500',  icon: '📈' },
];

// ── Learning Card View data ───────────────────────────────────────────
// ── Progress logic ────────────────────────────────────────────────────
// Progress is COMPUTED from learning stages, not set by hand.
// e.g. "อ่านแล้วแต่ยังไม่ได้ Recap" = read ✓ only → 30%.
const PROGRESS_STAGES = [
  { key: 'read',   label: 'Read',   thai: 'อ่านแล้ว',  weight: 30, Icon: BookOpen,     tone: 'violet'  },
  { key: 'recap',  label: 'Recap',  thai: 'สรุปแล้ว',  weight: 25, Icon: Lightbulb,    tone: 'sky'     },
  { key: 'apply',  label: 'Apply',  thai: 'นำไปใช้',   weight: 25, Icon: Target,       tone: 'orange'  },
  { key: 'review', label: 'Review', thai: 'ทบทวนแล้ว', weight: 20, Icon: Award,        tone: 'emerald' },
] as const;
type StageKey = (typeof PROGRESS_STAGES)[number]['key'];
type LearnStages = Record<StageKey, boolean>;

const STAGE_TONE: Record<string, { active: string; idle: string; bar: string }> = {
  violet:  { active: 'bg-violet-100 text-violet-700 border-violet-300',   idle: 'bg-white text-violet-600 border-violet-200 hover:bg-violet-50',   bar: 'bg-violet-500'  },
  sky:     { active: 'bg-sky-100 text-sky-700 border-sky-300',         idle: 'bg-white text-sky-600 border-sky-200 hover:bg-sky-50',           bar: 'bg-sky-500'     },
  orange:  { active: 'bg-orange-100 text-orange-700 border-orange-300',   idle: 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50',   bar: 'bg-orange-400'  },
  emerald: { active: 'bg-emerald-100 text-emerald-700 border-emerald-300', idle: 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50', bar: 'bg-emerald-500' },
};

function computeProgress(stages: LearnStages): number {
  return PROGRESS_STAGES.reduce((sum, s) => sum + (stages[s.key] ? s.weight : 0), 0);
}

function statusFromStages(stages: LearnStages): 'Reading' | 'Done' | 'Unread' {
  if (PROGRESS_STAGES.every(s => stages[s.key])) return 'Done';
  if (PROGRESS_STAGES.some(s => stages[s.key])) return 'Reading';
  return 'Unread';
}

// Derive stages from a legacy card (no `stages` field saved yet).
function deriveStages(card: LearningCard): LearnStages {
  const recap = !isRichTextEmpty(card.understanding) && card.understanding !== 'Notes not added yet.';
  const apply = !isRichTextEmpty(card.application) && card.application !== 'Application not added yet.';
  const read  = card.status !== 'Unread' || card.progress > 0 || recap || apply;
  const review = card.status === 'Done';
  return { read, recap, apply, review };
}

interface LearningCard {
  id: number;
  title: string;
  provider: string;
  providerInitial: string;
  providerColor: string;
  tags: string[];
  status: 'Reading' | 'Done' | 'Unread';
  progress: number;
  understanding: string;
  application: string;
  reviewDays: number;
  coverGradient: string;
  coverEmoji: string;
  progressColor: string;
  imageUrl?: string;
  imagePosition?: 'top' | 'center' | 'bottom';
  imageDragOffset?: number;
  rating?: number;
  userTags?: string[];
  content?: string;
  stages?: LearnStages;
  role?: string;
  postedAgo?: string;
  aiSummary?: string;
  keyTakeaways?: string;
  nextAction?: string;
  reviewQuestions?: string;
  // Clarity & Spaced Review
  sourceUrl?: string;
  clarityQ1?: string;
  clarityQ2?: string;
  clarityBelief?: number;
  capturedAt?: string;
  nextReviewAt?: string;
  reviewCount?: number;
  // Content type & progress details
  contentType?: 'book' | 'course' | 'video' | 'article' | 'social' | 'podcast' | 'pdf';
  totalPages?: number;
  pagesRead?: number;
  totalLessons?: number;
  lessonsRead?: number;
  totalMins?: number;
  watchedMins?: number;
  // Type-specific notes
  typeNotes?: string;
  quotesList?: string;
  timestamps?: string;
  episodeNumber?: string;
  guestName?: string;
  // Course-specific standard fields
  instructor?: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: string;
  totalHours?: number;
  startDate?: string;
  targetDate?: string;
  hasCertificate?: boolean;
  price?: 'Free' | 'Paid';
  courseGoal?: string;
  targetSkill?: string;
  wouldRecommend?: boolean;
  certificateUrl?: string;
  pageIconUrl?: string;
  chapter?: string;
  genre?: string;
  syllabus?: string;
  platform?: string;
  transcriptAvailable?: boolean;
  estimatedReadTime?: number;
  cleanArticleContent?: string;
  extractedPostText?: string;
  whySaved?: string;
  keyInsight?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  documentOutline?: string;
  sourceOwner?: string;
}

const SPACED_INTERVALS = [1, 3, 7, 14, 30];

function computeClarityScore(q1?: string, q2?: string, belief?: number): number {
  return Math.min(
    (q1 && q1.trim().length > 10 ? 40 : q1 && q1.trim().length > 0 ? 20 : 0) +
    (q2 && q2.trim().length > 10 ? 40 : q2 && q2.trim().length > 0 ? 20 : 0) +
    Math.round(((belief ?? 0) / 5) * 20),
    100
  );
}

function nextReviewDate(reviewCount: number): string {
  const days = SPACED_INTERVALS[Math.min(reviewCount, SPACED_INTERVALS.length - 1)];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function richTextToPlainText(value?: string): string {
  if (!value) return '';
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|blockquote|h1|h2|h3|h4|h5|h6)>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function isRichTextEmpty(value?: string): boolean {
  return richTextToPlainText(value).length === 0;
}

function RichTextContent({
  value,
  className = '',
}: {
  value?: string;
  className?: string;
}) {
  if (isRichTextEmpty(value)) return null;
  return (
    <>
      <style jsx global>{`
        .learning-rich-content h1 { font-size: 1.45em; line-height: 1.25; font-weight: 800; margin: 0 0 0.6em; }
        .learning-rich-content h2 { font-size: 1.2em; line-height: 1.3; font-weight: 700; margin: 0 0 0.55em; }
        .learning-rich-content p { margin: 0 0 0.8em; }
        .learning-rich-content p:last-child { margin-bottom: 0; }
        .learning-rich-content ul, .learning-rich-content ol { margin: 0 0 0.8em 1.1em; padding: 0; }
        .learning-rich-content li { margin: 0.2em 0; }
        .learning-rich-content blockquote {
          margin: 0 0 0.8em;
          padding-left: 0.9em;
          border-left: 3px solid rgba(139, 92, 246, 0.28);
          color: inherit;
          font-style: italic;
        }
        .learning-rich-content mark {
          background: linear-gradient(180deg, rgba(254, 240, 138, 0.16) 0%, rgba(253, 224, 71, 0.55) 100%);
          color: inherit;
          padding: 0 0.14em;
          border-radius: 0.2em;
        }
      `}</style>
      <div
        className={`learning-rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
    </>
  );
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 140,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const syncValue = () => {
    if (!editorRef.current) return;
    const nextValue = isRichTextEmpty(editorRef.current.innerHTML) ? '' : editorRef.current.innerHTML;
    onChange(nextValue);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncValue();
  };

  const applyBlock = (tag: 'P' | 'H1' | 'H2') => {
    runCommand('formatBlock', tag);
  };

  return (
    <>
      <style jsx global>{`
        .learning-rich-editor[contenteditable="true"]:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
      <div className="mt-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50/80 px-2.5 py-2">
          {[
            { label: 'B', Icon: Bold, onClick: () => runCommand('bold') },
            { label: 'U', Icon: Underline, onClick: () => runCommand('underline') },
            { label: 'Highlight', Icon: Highlighter, onClick: () => runCommand('hiliteColor', '#FDE68A') },
            { label: 'H1', Icon: Heading1, onClick: () => applyBlock('H1') },
            { label: 'H2', Icon: Heading2, onClick: () => applyBlock('H2') },
            { label: 'List', Icon: List, onClick: () => runCommand('insertUnorderedList') },
            { label: 'Numbered', Icon: ListOrdered, onClick: () => runCommand('insertOrderedList') },
            { label: 'Quote', Icon: Quote, onClick: () => runCommand('formatBlock', 'BLOCKQUOTE') },
          ].map(tool => (
            <button
              key={tool.label}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={tool.onClick}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-transparent px-2 text-[11px] font-bold text-gray-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
              title={tool.label}
            >
              <tool.Icon size={13} />
              <span>{tool.label}</span>
            </button>
          ))}
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => runCommand('removeFormat')}
            className="ml-auto inline-flex h-8 items-center rounded-lg border border-transparent px-2 text-[11px] font-bold text-gray-400 transition hover:border-gray-200 hover:bg-white hover:text-gray-600"
          >
            Clear
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={syncValue}
          className="learning-rich-editor px-3 py-3 text-sm leading-7 text-gray-800 focus:outline-none"
          style={{ minHeight }}
        />
      </div>
    </>
  );
}

const SOURCE_PLATFORM_OPTIONS = [
  {
    key: 'Website',
    label: 'Website',
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: () => <Globe size={14} className="text-slate-600" />,
  },
  {
    key: 'Facebook',
    label: 'Facebook',
    tone: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: () => <FacebookIcon size={14} className="text-blue-600" />,
  },
  {
    key: 'Instagram',
    label: 'Instagram',
    tone: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: () => <Instagram size={14} className="text-pink-600" />,
  },
  {
    key: 'YouTube',
    label: 'YouTube',
    tone: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: () => <Youtube size={14} className="text-rose-600" />,
  },
  {
    key: 'X',
    label: 'X',
    tone: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: () => <XIcon size={14} className="text-gray-700" />,
  },
  {
    key: 'LinkedIn',
    label: 'LinkedIn',
    tone: 'bg-sky-100 text-sky-700 border-sky-200',
    icon: () => <Linkedin size={14} className="text-sky-600" />,
  },
  {
    key: 'TikTok',
    label: 'TikTok',
    tone: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    icon: () => <TiktokIcon size={14} className="text-fuchsia-600" />,
  },
] as const;

const CARD_THEMES = [
  { gradient: 'from-violet-400 via-purple-300 to-indigo-200', emoji: '🖥️', progress: 'bg-violet-500' },
  { gradient: 'from-teal-300 via-emerald-200 to-cyan-200',    emoji: '🤖', progress: 'bg-emerald-500' },
  { gradient: 'from-sky-300 via-blue-200 to-indigo-100',      emoji: '💰', progress: 'bg-sky-500' },
  { gradient: 'from-orange-200 via-amber-100 to-rose-100',    emoji: '🧠', progress: 'bg-orange-400' },
  { gradient: 'from-pink-300 via-rose-200 to-pink-100',       emoji: '📅', progress: 'bg-pink-500' },
  { gradient: 'from-purple-600 via-violet-500 to-indigo-400', emoji: '📚', progress: 'bg-purple-500' },
];

type ContentType = 'book' | 'course' | 'video' | 'article' | 'social' | 'podcast' | 'pdf';

const PREDEFINED_TAGS = [
  'Trading', 'Finance', 'Investing', 'Stock Market', 'Options', 'Forex', 'Crypto',
  'Technical Analysis', 'Risk Management', 'Portfolio', 'Macroeconomics',
  'React', 'TypeScript', 'JavaScript', 'Python', 'Next.js', 'SQL', 'Data Science', 'AI / ML',
  'Productivity', 'Marketing', 'Design', 'Business', 'Leadership', 'Strategy',
  'Personal Development', 'Health', 'Psychology', 'Communication',
];

const CONTENT_TYPES: {
  key: ContentType;
  label: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  providerLabel: string;
  hasPages: boolean;
  hasLessons: boolean;
  hasMins: boolean;
  hasUrl: boolean;
}[] = [
  { key: 'book',    label: 'Book',        Icon: BookOpen,      accentText: 'text-violet-600', accentBorder: 'border-violet-300', accentBg: 'bg-violet-50',  providerLabel: 'Author',          hasPages: true,  hasLessons: false, hasMins: false, hasUrl: false },
  { key: 'course',  label: 'Course',      Icon: GraduationCap, accentText: 'text-sky-600',    accentBorder: 'border-sky-300',    accentBg: 'bg-sky-50',     providerLabel: 'Platform',        hasPages: false, hasLessons: true,  hasMins: false, hasUrl: false },
  { key: 'video',   label: 'Video',       Icon: Video,         accentText: 'text-rose-600',   accentBorder: 'border-rose-300',   accentBg: 'bg-rose-50',    providerLabel: 'Channel',         hasPages: false, hasLessons: false, hasMins: true,  hasUrl: true  },
  { key: 'article', label: 'Article',     Icon: FileText,      accentText: 'text-emerald-600',accentBorder: 'border-emerald-300',accentBg: 'bg-emerald-50', providerLabel: 'Author / Site',   hasPages: false, hasLessons: false, hasMins: false, hasUrl: true  },
  { key: 'social',  label: 'Social Post', Icon: Globe,         accentText: 'text-orange-600', accentBorder: 'border-orange-300', accentBg: 'bg-orange-50',  providerLabel: 'Page / Account',  hasPages: false, hasLessons: false, hasMins: false, hasUrl: true  },
  { key: 'podcast', label: 'Podcast',     Icon: Headphones,    accentText: 'text-teal-600',   accentBorder: 'border-teal-300',   accentBg: 'bg-teal-50',    providerLabel: 'Show Name',       hasPages: false, hasLessons: false, hasMins: true,  hasUrl: false },
  { key: 'pdf',     label: 'PDF / Doc',   Icon: FileQuestion,  accentText: 'text-amber-600',  accentBorder: 'border-amber-300',  accentBg: 'bg-amber-50',   providerLabel: 'Source',          hasPages: true,  hasLessons: false, hasMins: false, hasUrl: true  },
];

const INIT_LEARNING_CARDS: LearningCard[] = [
  {
    id: 1,
    title: 'Designing Delightful Products',
    provider: 'Google Design',
    providerInitial: 'G',
    providerColor: 'bg-blue-500',
    tags: ['#Product Design', '#UX', '#User Research', '#Design Systems'],
    status: 'Reading',
    progress: 50,
    understanding: 'Great products solve real problems with clarity and empathy.',
    keyTakeaways: 'Focus on user needs first, then iterate with data.',
    application: '',
    nextAction: '',
    reviewDays: 3,
    coverGradient: 'from-violet-400 via-purple-300 to-indigo-200',
    coverEmoji: '🖥️',
    progressColor: 'bg-violet-500',
    role: 'Product Design',
    postedAgo: '2h ago',
    stages: { read: true, recap: true, apply: false, review: false },
    contentType: 'course',
  },
  {
    id: 2,
    title: 'AI Foundations for Everyone',
    provider: 'DeepLearning.AI',
    providerInitial: 'D',
    providerColor: 'bg-emerald-500',
    tags: ['#AI', '#Machine Learning', '#Deep Learning'],
    status: 'Done',
    progress: 100,
    understanding: 'AI learns patterns from data to make predictions or decisions.',
    keyTakeaways: 'Neural networks mimic the brain — layers of pattern recognition.',
    application: 'Explore AI tools that can automate and enhance my workflow.',
    nextAction: 'Build a simple classifier with Python this week.',
    reviewDays: 5,
    coverGradient: 'from-teal-300 via-emerald-200 to-cyan-200',
    coverEmoji: '🤖',
    progressColor: 'bg-emerald-500',
    role: 'AI · Machine Learning',
    postedAgo: '1d ago',
    stages: { read: true, recap: true, apply: true, review: true },
    contentType: 'video',
  },
  {
    id: 3,
    title: 'Investing 101: Build Wealth Smartly',
    provider: 'Coursera',
    providerInitial: 'C',
    providerColor: 'bg-sky-500',
    tags: ['#Finance', '#Investing', '#Wealth', '#Basics'],
    status: 'Reading',
    progress: 33,
    understanding: 'Investing is about time in the market, not timing the market.',
    keyTakeaways: '',
    application: '',
    nextAction: '',
    reviewDays: 3,
    coverGradient: 'from-sky-300 via-blue-200 to-indigo-100',
    coverEmoji: '💰',
    progressColor: 'bg-sky-500',
    role: 'Finance · Investing',
    postedAgo: '5h ago',
    stages: { read: true, recap: false, apply: false, review: false },
    contentType: 'course',
  },
  {
    id: 4,
    title: 'The Psychology of Habits',
    provider: 'James Clear',
    providerInitial: 'J',
    providerColor: 'bg-orange-400',
    tags: ['#Psychology', '#Habits', '#Mindset'],
    status: 'Reading',
    progress: 50,
    understanding: 'Habits are identity-based and shaped by tiny, consistent actions.',
    keyTakeaways: 'The habit loop: Cue → Craving → Response → Reward.',
    application: 'Focus on 1% daily improvements and track my habits.',
    nextAction: '',
    reviewDays: 5,
    coverGradient: 'from-orange-200 via-amber-100 to-rose-100',
    coverEmoji: '🧠',
    progressColor: 'bg-orange-400',
    role: 'Psychology · Habits',
    postedAgo: '2d ago',
    stages: { read: true, recap: true, apply: true, review: false },
    contentType: 'book',
  },
  {
    id: 5,
    title: 'Getting Things Done',
    provider: 'David Allen',
    providerInitial: 'D',
    providerColor: 'bg-pink-500',
    tags: ['#Productivity', '#GTD', '#Focus', '#Time Management'],
    status: 'Done',
    progress: 100,
    understanding: 'Capture everything, clarify, and focus on what matters most.',
    keyTakeaways: 'GTD = Capture → Clarify → Organize → Reflect → Engage.',
    application: 'Use my inbox system and weekly review every Sunday.',
    nextAction: 'Set up weekly review ritual every Sunday 9 AM.',
    reviewDays: 3,
    coverGradient: 'from-pink-300 via-rose-200 to-pink-100',
    coverEmoji: '📅',
    progressColor: 'bg-pink-500',
    role: 'Productivity · GTD',
    postedAgo: '3d ago',
    stages: { read: true, recap: true, apply: true, review: true },
    contentType: 'book',
  },
  {
    id: 6,
    title: 'How to Learn Anything Faster',
    provider: 'Scott H. Young',
    providerInitial: 'S',
    providerColor: 'bg-purple-500',
    tags: ['#Learning', '#Study Skills', '#Meta Learning'],
    status: 'Unread',
    progress: 0,
    understanding: '',
    keyTakeaways: '',
    application: '',
    nextAction: '',
    reviewDays: 5,
    coverGradient: 'from-purple-600 via-violet-500 to-indigo-400',
    coverEmoji: '📚',
    progressColor: 'bg-purple-500',
    role: 'Meta Learning',
    postedAgo: '1w ago',
    stages: { read: false, recap: false, apply: false, review: false },
  },
];

const MASTERY_DATA = [
  { month: 'Jan', score: 52 }, { month: 'Feb', score: 58 },
  { month: 'Mar', score: 61 }, { month: 'Apr', score: 64 },
  { month: 'May', score: 68 }, { month: 'Jun', score: 72 },
];

const PRODUCTIVE_HOURS = [
  { h: '06', v: 12 }, { h: '08', v: 28 }, { h: '10', v: 65 },
  { h: '12', v: 45 }, { h: '14', v: 72 }, { h: '16', v: 58 },
  { h: '18', v: 38 }, { h: '20', v: 22 },
];

const SKILL_RADAR = [
  { skill: 'English',   value: 78 },
  { skill: 'Coding',    value: 65 },
  { skill: 'AI',        value: 84 },
  { skill: 'Finance',   value: 41 },
  { skill: 'Habits',    value: 88 },
  { skill: 'Writing',   value: 72 },
];

const ROADMAP_SKILLS = [
  { name: 'English',         level: 'Foundation → Intermediate', progress: 78, color: 'purple',  next: 'IELTS Speaking · 7.0' },
  { name: 'AI',              level: 'Beginner → Practitioner',   progress: 84, color: 'sky',     next: 'LLM Fine-tuning' },
  { name: 'React / Web Dev', level: 'Junior → Mid',              progress: 58, color: 'emerald', next: 'Server Components' },
  { name: 'Time / Habits',   level: 'Habit Building',            progress: 88, color: 'rose',    next: '90-day streak' },
  { name: 'Investing',       level: 'Foundation',                progress: 41, color: 'orange',  next: 'Risk Management' },
];

const MILESTONES = [
  { date: '15 May', title: 'Complete React Module 4',         tag: 'Coding',  status: 'In progress' },
  { date: '22 May', title: 'IELTS Mock Test',                 tag: 'English', status: 'Pending' },
  { date: '30 May', title: 'AI Capstone — Build a Chatbot',   tag: 'AI',      status: 'Pending' },
  { date: '12 Jun', title: 'Investing Risk Assessment Quiz',  tag: 'Finance', status: 'Pending' },
];

const COURSES_LIST = [
  { name: 'English Mastery',     hours: 28, lessons: 33, level: 'Inter',   icon: '🎯', tone: 'from-violet-400 to-purple-500' },
  { name: 'AI Workflow Builder', hours: 17, lessons: 22, level: 'Adv',     icon: '🤖', tone: 'from-emerald-400 to-teal-500' },
  { name: 'React / Web Dev',     hours: 24, lessons: 31, level: 'Inter',   icon: '⚛️', tone: 'from-sky-400 to-indigo-500' },
  { name: 'Time / Habits Coach', hours: 9,  lessons: 14, level: 'Easy',    icon: '⏱️', tone: 'from-orange-400 to-pink-500' },
  { name: 'Knowledge Synthesis', hours: 12, lessons: 18, level: 'Adv',     icon: '🧠', tone: 'from-rose-400 to-fuchsia-500' },
];

const PROGRESS_OVER_TIME = [
  { d: '1',  v: 32 }, { d: '5',  v: 42 }, { d: '10', v: 51 },
  { d: '15', v: 58 }, { d: '20', v: 64 }, { d: '25', v: 68 }, { d: '30', v: 72 },
];

const MODULES_OUTLINE = [
  { name: 'Foundations of Habits',        time: '30m', items: 4 },
  { name: 'Designing Your Environment',   time: '45m', items: 5 },
  { name: 'Cue · Craving · Reward',       time: '35m', items: 3 },
  { name: 'Goal & Habit Mapping',         time: '40m', items: 6 },
  { name: 'Time Blocking Systems',        time: '50m', items: 5 },
  { name: 'Habit Tracking & Review',      time: '30m', items: 4 },
];

const PRACTICE_CARDS = [
  { name: 'English Speaking',        score: 92, icon: '🗣️', tone: 'from-violet-400 to-purple-500' },
  { name: 'AI Pickleball Challenge', score: 88, icon: '🤖', tone: 'from-emerald-400 to-teal-500' },
  { name: 'React Component Build',   score: 76, icon: '⚛️', tone: 'from-sky-400 to-blue-500' },
  { name: 'Data Cards Quiz',         score: 85, icon: '📊', tone: 'from-orange-400 to-rose-500' },
  { name: 'Investing Analysis',      score: 90, icon: '📈', tone: 'from-rose-400 to-pink-500' },
];

const RESOURCES = [
  { type: 'Articles', count: 128, icon: FileText,     tone: 'from-violet-400 to-purple-500' },
  { type: 'Videos',   count: 64,  icon: Video,        tone: 'from-emerald-400 to-teal-500' },
  { type: 'Links',    count: 212, icon: LinkIcon,     tone: 'from-sky-400 to-blue-500' },
  { type: 'Quotes',   count: 85,  icon: Bookmark,     tone: 'from-orange-400 to-pink-500' },
  { type: 'Quizzes',  count: 37,  icon: FileQuestion, tone: 'from-rose-400 to-fuchsia-500' },
];

const SAVED_RESOURCES = [
  { title: 'The Feynman Technique Explained',     tag: 'Learning Method', date: '2d ago' },
  { title: 'Spaced Repetition Research Overview', tag: 'Memory',          date: '4d ago' },
  { title: 'Cognitive Load & Focus',              tag: 'Productivity',    date: '1w ago' },
  { title: 'React Custom Hook Patterns',          tag: 'Coding',          date: '1w ago' },
  { title: 'Build a Lifetime Knowledge Base',     tag: 'Note-taking',     date: '2w ago' },
];

const EXAMS: { name: string; date: string; level: string; status: string; SvgIcon?: React.ComponentType<{ style?: React.CSSProperties }> }[] = [
  { name: 'IELTS Speaking',           date: '22 May', level: 'B2',          status: 'Upcoming' },
  { name: 'AWS Cloud Practitioner',   date: '5 Jun',  level: 'Foundation',  status: 'Studying', SvgIcon: Aws },
  { name: 'React Developer Cert',     date: '18 Jun', level: 'Inter',       status: 'Studying' },
  { name: 'Python Data Analysis',     date: '2 Jul',  level: 'Inter',       status: 'Pending' },
  { name: 'AI Engineering Track',     date: '15 Jul', level: 'Adv',         status: 'Pending' },
  { name: 'Personal Finance Quiz',    date: '28 Jul', level: 'Basic',       status: 'Pending' },
];

const CERTIFICATES = [
  { name: 'Python Basics',         issuer: 'CodeAcademy',  date: 'Apr 2026', color: 'violet'  },
  { name: 'AI Foundations',        issuer: 'OpenLearn',    date: 'Mar 2026', color: 'emerald' },
  { name: 'Web Development',       issuer: 'Frontend Pro', date: 'Feb 2026', color: 'sky'     },
  { name: 'Data Visualization',    issuer: 'DataCamp',     date: 'Jan 2026', color: 'rose'    },
];

const TONE_BG = {
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  bar: 'bg-violet-500'  },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  bar: 'bg-purple-500'  },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     bar: 'bg-sky-500'     },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  bar: 'bg-orange-500'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    bar: 'bg-rose-500'    },
} as const;
type ToneKey = keyof typeof TONE_BG;

const CATEGORY_LIST = [
  'Finance', 'Investing', 'Trading', 'Technology', 'AI / Machine Learning',
  'Self-Development', 'Psychology', 'Productivity', 'Design',
  'Marketing', 'Leadership', 'Science', 'History',
  'Philosophy', 'Health & Wellness', 'Communication', 'Creativity',
  'Business', 'Coding', 'Language Learning', 'Mindset',
];

const TAG_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
];

// ─── Reusable card components ─────────────────────────────────────────
function KpiCard({ item }: { item: typeof KPI[number] }) {
  const Icon = item.icon;
  const glowMap: Record<string, string> = {
    'from-violet-400 to-purple-500': 'rgba(167,139,250,0.35)',
    'from-emerald-400 to-teal-500':  'rgba(20,184,166,0.35)',
    'from-sky-400 to-blue-500':      'rgba(59,130,246,0.35)',
    'from-orange-400 to-pink-500':   'rgba(236,72,153,0.35)',
    'from-rose-400 to-fuchsia-500':  'rgba(217,70,239,0.35)',
    'from-amber-400 to-orange-500':  'rgba(249,115,22,0.35)',
  };
  const glow = glowMap[item.tone] ?? 'rgba(167,139,250,0.35)';

  return (
    <div className={`vivid-card relative overflow-hidden rounded-[22px] bg-gradient-to-br ${item.tone} h-[128px] p-4 text-white transition-all duration-200 hover:-translate-y-1`}
      style={{ boxShadow: `0 14px 32px ${glow}` }}>
      {/* sparkles */}
      <span className="spark-dot" style={{ top: 14, right: 16, width: 7, height: 7 }} />
      <span className="spark-dot" style={{ top: 30, right: 30, width: 4, height: 4, opacity: 0.7 }} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-bold leading-tight text-white/85">{item.label}</div>
          <div className="stat-num mt-2 text-[24px] font-extrabold leading-none tracking-[-0.035em] text-white drop-shadow-sm">
            {item.value}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/22 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
            {item.sub}
          </div>
        </div>
        <div className="icon-frost flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
          <Icon size={16} className="text-white" />
        </div>
      </div>
    </div>
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
    <div className={`bg-white rounded-2xl border border-purple-100 p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Stage progress bar (computed, adjustable) ───────────────────────
function StageProgress({
  stages,
  progress,
  onToggle,
}: {
  stages: LearnStages;
  progress: number;
  onToggle: (key: StageKey) => void;
}) {
  return (
    <div>
      {/* Computed bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[12px] font-extrabold text-gray-700 stat-num shrink-0 w-10 text-right">{progress}%</span>
      </div>

      {/* Stage toggles — adjustable */}
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {PROGRESS_STAGES.map(s => {
          const on = stages[s.key];
          const tone = STAGE_TONE[s.tone];
          const Icon = s.Icon;
          return (
            <TipLabel key={s.key} label={`${s.label} · ${s.thai} (+${s.weight}%)`}>
              <motion.button
                type="button"
                onClick={() => onToggle(s.key)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className={`w-full flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 text-xs font-semibold transition ${on ? tone.active : tone.idle}`}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span className="leading-tight text-center">{s.label}</span>
              </motion.button>
            </TipLabel>
          );
        })}
      </div>
    </div>
  );
}

// ─── Learning Card Item — feed / post style ──────────────────────────
function DeleteModal({ title, onConfirm, onCancel }: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-[340px] overflow-hidden"
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 16 }}
        transition={{ duration: 0.3, ease: [0.34, 1.26, 0.64, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-6 text-center">
          <motion.div
            className="flex justify-center mb-5"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28, ease: 'easeOut' }}
          >
            <h3 className="font-bold text-[17px] text-gray-900 mb-1.5">ลบบัตรเรียน?</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
              คุณต้องการลบ<br />
              <span className="font-semibold text-gray-800 line-clamp-1">&ldquo;{title}&rdquo;</span><br />
              ออกจาก Library หรือเปล่า?
            </p>
          </motion.div>
          <motion.div
            className="flex gap-2.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.28, ease: 'easeOut' }}
          >
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-2xl text-white text-sm font-bold hover:opacity-90 transition-opacity duration-200"
              style={{ background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)' }}
            >
              ลบออก
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TipLabel({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const show = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
      if (ref.current) {
        const r = ref.current.getBoundingClientRect();
        setPos({ x: r.left + r.width / 2, y: r.top });
      }
    }, 500);
  };
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setPos(null);
  };

  return (
    <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {pos && createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, y: 2, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ position: 'fixed', left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)', zIndex: 9999, pointerEvents: 'none' }}
            >
              <div className="whitespace-nowrap bg-gray-900 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-lg">
                {label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function LearningCardItem({
  card,
  onRead,
  onToggleStage,
  onEdit,
  onDelete,
  onUpdateOffset,
  onUpdatePageIcon,
}: {
  card: LearningCard;
  onRead: () => void;
  onToggleStage: (id: number, key: StageKey) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateOffset: (id: number, offset: number) => void;
  onUpdatePageIcon: (id: number, url: string) => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adjustingImage, setAdjustingImage] = useState(false);
  const [localOffset, setLocalOffset] = useState(card.imageDragOffset ?? 50);
  const [showIconMenu, setShowIconMenu] = useState(false);
  const dragRef = useRef(localOffset);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const iconMenuRef = useRef<HTMLDivElement>(null);

  const handlePasteIcon = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (ev) => {
            const url = ev.target?.result as string;
            if (url) { onUpdatePageIcon(card.id, url); setShowIconMenu(false); }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      showToast('ไม่พบรูปใน Clipboard');
    } catch {
      showToast('ไม่สามารถอ่าน Clipboard ได้ — ลอง Upload แทน');
    }
  };

  useEffect(() => {
    if (!showIconMenu) return;
    const close = (e: MouseEvent) => {
      if (iconMenuRef.current && !iconMenuRef.current.contains(e.target as Node)) {
        setShowIconMenu(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showIconMenu]);

  const stages = card.stages ?? deriveStages(card);
  const statusLabel = card.status === 'Done' ? 'Completed' : card.status === 'Reading' ? 'In Progress' : 'Ready to Start';
  const statusDot = card.status === 'Done' ? 'bg-emerald-500' : card.status === 'Reading' ? 'bg-violet-500' : 'bg-gray-300';
  const clarityScore = computeClarityScore(card.clarityQ1, card.clarityQ2, card.clarityBelief);
  const hasClarityFilter = clarityScore > 0;
  const isDueForReview = card.nextReviewAt && card.nextReviewAt <= todayStr() && card.capturedAt !== todayStr();
  const ctBadge = card.contentType ? CONTENT_TYPES.find(c => c.key === card.contentType) ?? null : null;
  const CtBadgeIcon = ctBadge ? ctBadge.Icon : null;
  const fitImage = shouldFitLearningImage(card.contentType);

  return (
    <>
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            title={card.title}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={() => { onDelete(card.id); setShowDeleteModal(false); }}
          />
        )}
      </AnimatePresence>

      <article className="group/card relative bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(139,92,246,0.07)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.14)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col h-full">

        {/* ── IMAGE FIRST — full width, no padding ── */}
        <div className="relative w-full shrink-0 aspect-video overflow-hidden">
          {card.imageUrl ? (
            <>
              {fitImage && (
                <img src={card.imageUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full scale-110 object-cover blur-xl opacity-55" />
              )}
              <img
                src={card.imageUrl}
                alt={card.title}
                className={`absolute inset-0 w-full h-full transition-transform duration-500 ${fitImage ? 'object-contain' : 'object-cover'} ${!adjustingImage ? 'cursor-pointer hover:scale-[1.04]' : 'cursor-ns-resize'}`}
                style={{ objectPosition: `center ${localOffset}%` }}
                onClick={() => { if (!adjustingImage) onRead(); }}
                onMouseDown={adjustingImage && !fitImage ? (e) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const startOff = dragRef.current;
                  const move = (me: MouseEvent) => {
                    const delta = (me.clientY - startY) / 3;
                    const next = Math.max(0, Math.min(100, startOff - delta));
                    dragRef.current = next;
                    setLocalOffset(next);
                  };
                  const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                  };
                  document.addEventListener('mousemove', move);
                  document.addEventListener('mouseup', up);
                } : undefined}
              />
              <AnimatePresence>
                {!adjustingImage && !fitImage && (
                  <motion.button
                    key="adjust-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => { e.stopPropagation(); setAdjustingImage(true); setLocalOffset(card.imageDragOffset ?? 50); dragRef.current = card.imageDragOffset ?? 50; }}
                    className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-xl px-2 py-1 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="3" /></svg>
                    ปรับรูป
                  </motion.button>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {adjustingImage && !fitImage && (
                  <motion.div
                    key="adjuster-panel"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-black/60 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-white">ลากรูป หรือใช้ Slider</span>
                      <span className="text-[11px] font-bold text-white bg-white/20 rounded-lg px-2 py-0.5">{Math.round(localOffset)}%</span>
                    </div>
                    <input
                      type="range" min={0} max={100} value={localOffset}
                      onChange={e => { const v = Number(e.target.value); dragRef.current = v; setLocalOffset(v); }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0.6) ${localOffset}%,rgba(255,255,255,0.15) ${localOffset}%,rgba(255,255,255,0.15) 100%)` }}
                    />
                    <div className="flex justify-between text-[9px] text-white/60 mt-1 mb-2.5">
                      <span>↑ บน</span><span>กลาง</span><span>↓ ล่าง</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setLocalOffset(card.imageDragOffset ?? 50); dragRef.current = card.imageDragOffset ?? 50; setAdjustingImage(false); }} className="flex-1 py-1.5 rounded-xl border border-white/30 text-white text-[11px] font-semibold hover:bg-white/10 transition-colors duration-200">ยกเลิก</button>
                      <button onClick={() => { onUpdateOffset(card.id, localOffset); setAdjustingImage(false); }} className="flex-1 py-1.5 rounded-xl bg-violet-500 text-white text-[11px] font-bold hover:bg-violet-600 transition-colors duration-200">บันทึก</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${card.coverGradient} cursor-pointer`} onClick={onRead}>
              <div className="absolute -top-8 -right-6 w-32 h-32 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-black/10 blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl ring-2 ring-white/60 flex items-center justify-center"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.6)' }}
                >
                  <IconGlyph token={card.coverEmoji} size={42} color="rgba(255,255,255,0.99)" />
                </motion.div>
              </div>
            </div>
          )}
          {/* Gradient overlay bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          {/* Tag chip top-left */}
          {!adjustingImage && (
            <span className="absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/25 shadow-sm pointer-events-none">
              {card.tags[0]?.replace('#', '') ?? 'Learning'}
            </span>
          )}
          {/* Action buttons top-right — fade in on hover */}
          {!adjustingImage && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10">
              <TipLabel label="Bookmark">
                <button onClick={e => e.stopPropagation()} className="p-1 bg-black/30 hover:bg-black/60 rounded-xl transition-colors duration-150 backdrop-blur-sm">
                  <Bookmark size={12} className="text-white/80" />
                </button>
              </TipLabel>
              <TipLabel label="Edit">
                <button onClick={(e) => { e.stopPropagation(); onEdit(card.id); }} className="p-1 bg-black/30 hover:bg-black/60 rounded-xl transition-colors duration-150 backdrop-blur-sm">
                  <Edit3 size={12} className="text-white/80" />
                </button>
              </TipLabel>
              <TipLabel label="Delete">
                <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }} className="p-1 bg-black/30 hover:bg-black/60 rounded-xl transition-colors duration-150 backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </TipLabel>
            </div>
          )}
          {/* Read hover overlay — no image */}
          {!adjustingImage && !card.imageUrl && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center cursor-pointer group/read" onClick={onRead}>
              <div className="opacity-0 group-hover/read:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-1.5 text-xs font-bold text-gray-800 flex items-center gap-1.5 shadow-lg">
                <Play size={11} className="text-violet-600" /> Read
              </div>
            </div>
          )}
        </div>

        {/* ── CONTENT BELOW IMAGE ── */}
        <div className="p-4 flex flex-col flex-1 relative">

          {/* Hidden file input */}
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const url = ev.target?.result as string;
                if (url) onUpdatePageIcon(card.id, url);
              };
              reader.readAsDataURL(file);
              e.target.value = '';
            }}
          />

          {/* 1. Title */}
          <h4 className="font-bold text-gray-900 text-[16px] leading-snug tracking-tight line-clamp-2 mb-2.5">{card.title}</h4>

          {/* 2. Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {ctBadge && CtBadgeIcon && (
              <div className={`inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full ${ctBadge.accentBg} border ${ctBadge.accentBorder}`}>
                <CtBadgeIcon size={10} className={ctBadge.accentText} />
                <span className={`text-[10px] font-bold tracking-wide ${ctBadge.accentText}`}>{ctBadge.label}</span>
              </div>
            )}
            {isDueForReview && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-[3px]">
                <Bell size={9} /> Review
              </span>
            )}
            {hasClarityFilter && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-[3px]">
                <BarChart2 size={9} /> {clarityScore}
              </span>
            )}
          </div>

          {/* 3. Provider row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative shrink-0" ref={iconMenuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowIconMenu(v => !v); }}
                className="group/icon relative w-8 h-8 rounded-full focus:outline-none"
                title="เปลี่ยน Logo"
              >
                {card.pageIconUrl ? (
                  <img src={card.pageIconUrl} alt={card.provider} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white ${card.providerColor}`}>
                    {card.contentType === 'video' && <Video size={14} className="text-white" />}
                    {card.contentType === 'article' && <Globe size={14} className="text-white" />}
                    {card.contentType === 'social' && <Share2 size={14} className="text-white" />}
                    {card.contentType === 'book' && <BookOpen size={14} className="text-white" />}
                    {card.contentType === 'course' && <GraduationCap size={14} className="text-white" />}
                    {card.contentType === 'podcast' && <Headphones size={14} className="text-white" />}
                    {card.contentType === 'pdf' && <FileText size={14} className="text-white" />}
                    {!['video','article','social','book','course','podcast','pdf'].includes(card.contentType ?? '') && (
                      <span className="text-[10px] font-bold text-white">{card.providerInitial}</span>
                    )}
                  </div>
                )}
                <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </span>
              </button>
              <AnimatePresence>
                {showIconMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-0 top-10 z-50 bg-white rounded-2xl shadow-xl border border-purple-100 p-1.5 min-w-[152px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => { iconInputRef.current?.click(); setShowIconMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      Upload File
                    </button>
                    <button onClick={handlePasteIcon} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                      Paste Image
                    </button>
                    {card.pageIconUrl && (
                      <button onClick={() => { onUpdatePageIcon(card.id, ''); setShowIconMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        ลบ Logo
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-gray-800 truncate leading-tight">{card.provider}</span>
              {(card.role ?? card.tags[0]) && (
                <span className="text-[11px] text-gray-400 truncate leading-tight">{(card.role ?? card.tags[0]?.replace('#', ''))}</span>
              )}
            </div>
          </div>

          {/* 4. Notes */}
          {richTextToPlainText(card.understanding) ? (
            <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 italic mb-3">{richTextToPlainText(card.understanding)}</p>
          ) : (
            <p className="text-[11.5px] text-gray-300 italic mb-3">Notes not added yet.</p>
          )}

          {/* 5. Stage buttons + progress bar */}
          <div className="mt-auto">
            <StageProgress stages={stages} progress={card.progress} onToggle={key => onToggleStage(card.id, key)} />
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100/80 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-violet-500/80 bg-violet-50/60 px-2 py-1 rounded-full">
              <Calendar size={9} />
              {card.reviewDays}d review
            </span>
            <button
              onClick={onRead}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
            >
              Read More <ChevronRight size={11} />
            </button>
          </div>
        </div>
      </article>
    </>
  );
}

// ─── Legacy Resource Modal ────────────────────────────────────────────
function cardToFormState(card: LearningCard) {
  const themeIdx = Math.max(0, CARD_THEMES.findIndex(t => t.gradient === card.coverGradient));
  return {
    contentType: (card.contentType ?? 'book') as ContentType,
    title: card.title,
    provider: card.provider === 'Unknown' ? '' : card.provider,
    tags: card.tags.map(t => t.replace(/^#/, '')),
    sourceUrl: card.sourceUrl ?? '',
    status: card.status,
    totalPages: card.totalPages?.toString() ?? '',
    pagesRead: card.pagesRead?.toString() ?? '',
    totalLessons: card.totalLessons?.toString() ?? '',
    lessonsRead: card.lessonsRead?.toString() ?? '',
    instructor: card.instructor ?? '',
    category: card.category ?? '',
    level: (card.level ?? '') as '' | 'Beginner' | 'Intermediate' | 'Advanced',
    language: card.language ?? 'Thai',
    totalHours: card.totalHours?.toString() ?? '',
    startDate: card.startDate ?? '',
    targetDate: card.targetDate ?? '',
    hasCertificate: card.hasCertificate ?? false,
    price: (card.price ?? 'Free') as 'Free' | 'Paid',
    courseGoal: card.courseGoal ?? '',
    targetSkill: card.targetSkill ?? '',
    rating: card.rating ?? 0,
    wouldRecommend: card.wouldRecommend ?? false,
    certificateUrl: card.certificateUrl ?? '',
    totalMins: card.totalMins?.toString() ?? '',
    watchedMins: card.watchedMins?.toString() ?? '',
    manualProgress: card.progress ?? 0,
    understanding: card.understanding === 'Notes not added yet.' ? '' : (card.understanding ?? ''),
    application: card.application === 'Application not added yet.' ? '' : (card.application ?? ''),
    content: card.content ?? '',
    reviewDays: card.reviewDays ?? 3,
    themeIdx,
    imageUrl: card.imageUrl ?? '',
    fileName: '',
    imagePosition: (card.imagePosition ?? 'center') as 'top' | 'center' | 'bottom',
    imageDragOffset: card.imageDragOffset ?? 50,
    imageCaption: '',
    imageWidth: 0,
    imageHeight: 0,
    imageSize: 0,
    imageAspectRatio: '16/9',
    pageIconUrl: card.pageIconUrl ?? '',
  };
}

function cropImageToLearningCover(img: HTMLImageElement, quality = 0.9) {
  const targetWidth = 1280;
  const targetHeight = 720;
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = img.width / img.height;

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (sourceRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  canvas.getContext('2d')?.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width: targetWidth,
    height: targetHeight,
    aspectRatio: '16/9',
  };
}

function resizeImageToLearningFit(img: HTMLImageElement, quality = 0.9) {
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / img.width);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width,
    height,
    aspectRatio: `${width}/${height}`,
  };
}

function shouldFitLearningImage(contentType?: ContentType) {
  return contentType === 'article' || contentType === 'social';
}

function LegacyResourceModal({ onClose, onAdd, onUpdate, initialCard }: {
  onClose: () => void;
  onAdd: (card: LearningCard) => void;
  onUpdate?: (card: LearningCard) => void;
  initialCard?: LearningCard;
}) {
  const isEdit = !!initialCard;
  const [form, setForm] = useState(() =>
    initialCard ? cardToFormState(initialCard) : {
      contentType: 'book' as ContentType,
      title: '', provider: '', tags: [] as string[], sourceUrl: '',
      status: 'Reading' as 'Reading' | 'Done' | 'Unread',
      totalPages: '', pagesRead: '',
      totalLessons: '', lessonsRead: '',
      instructor: '', category: '', level: '' as '' | 'Beginner' | 'Intermediate' | 'Advanced',
      language: 'Thai', totalHours: '', startDate: '', targetDate: '',
      hasCertificate: false, price: 'Free' as 'Free' | 'Paid',
      courseGoal: '', targetSkill: '',
      rating: 0, wouldRecommend: false, certificateUrl: '',
      totalMins: '', watchedMins: '',
      manualProgress: 0,
      understanding: '', application: '',
      content: '', reviewDays: 3, themeIdx: 0, imageUrl: '',
      fileName: '',
      imagePosition: 'center' as 'top' | 'center' | 'bottom',
      imageDragOffset: 50,
      imageCaption: '',
      imageWidth: 0,
      imageHeight: 0,
      imageSize: 0,
      imageAspectRatio: '16/9',
      pageIconUrl: '',
    }
  );
  const [mounted, setMounted] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const dragOffsetRef = useRef(form.imageDragOffset);
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { dragOffsetRef.current = form.imageDragOffset; }, [form.imageDragOffset]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const loadExternalImageUrl = (url: string) => {
    const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => {
      setForm(f => ({
        ...f,
        imageUrl: url,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
        imageAspectRatio: '16/9',
      }));
    };
    img.onerror = () => {
      setForm(f => ({ ...f, imageUrl: url }));
    };
    img.src = url;
  };

  const processImagePaste = (items: DataTransferItemList) => {
    // 1. Binary image (screenshot, Ctrl+C from file, or browser "copy image")
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.includes('image')) {
        const file = items[i].getAsFile();
        if (file) {
          if (file.size > 5 * 1024 * 1024) { alert('ไฟล์ต้องไม่เกิน 5MB'); return; }
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = document.createElement('img') as HTMLImageElement;
            img.onload = () => {
              const cover = shouldFitLearningImage(form.contentType)
                ? resizeImageToLearningFit(img, 0.9)
                : cropImageToLearningCover(img, 0.9);
              setForm(f => ({
                ...f,
                imageUrl: cover.dataUrl,
                imageWidth: cover.width,
                imageHeight: cover.height,
                imageSize: parseFloat(fileSizeMB),
                imageAspectRatio: cover.aspectRatio,
                imageDragOffset: 50,
              }));
            };
            img.src = ev.target?.result as string;
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
    // 2. HTML snippet with <img> (copy image from IG/FB/Twitter in browser)
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === 'text/html') {
        items[i].getAsString((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const imgEl = doc.querySelector('img');
          if (imgEl?.src?.startsWith('http')) {
            loadExternalImageUrl(imgEl.src);
          }
        });
        return;
      }
    }
    // 3. Plain text URL pointing to an image file
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === 'text/plain') {
        items[i].getAsString((text) => {
          const url = text.trim();
          if (/^https?:\/\/.+/i.test(url) && /\.(jpg|jpeg|png|gif|webp|avif)/i.test(url)) {
            loadExternalImageUrl(url);
          }
        });
        return;
      }
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // ถ้า focused element เป็น textarea (content field) ให้ paste text ปกติ ไม่ต้อง intercept
      if (target.tagName === 'TEXTAREA') return;

      const items = e.clipboardData?.items;
      if (!items) return;
      let hasImage = false;
      let hasHtml = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes('image')) hasImage = true;
        if (items[i].type === 'text/html') hasHtml = true;
      }
      if (hasImage || hasHtml) {
        e.preventDefault();
        processImagePaste(items);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const ct = form.contentType;
  const ctDef = CONTENT_TYPES.find(c => c.key === ct)!;
  const isManualProgress = ct === 'article' || ct === 'social';
  const fitPreviewImage = shouldFitLearningImage(ct);

  const computedProgress = (() => {
    if (form.status === 'Done') return 100;
    if (form.status === 'Unread') return 0;
    if (ct === 'book' || ct === 'pdf') {
      const t = Number(form.totalPages), r = Number(form.pagesRead);
      if (t > 0 && r >= 0) return Math.min(100, Math.round((r / t) * 100));
    }
    if (ct === 'course') {
      const t = Number(form.totalLessons), r = Number(form.lessonsRead);
      if (t > 0 && r >= 0) return Math.min(100, Math.round((r / t) * 100));
    }
    if (ct === 'video' || ct === 'podcast') {
      const t = Number(form.totalMins), r = Number(form.watchedMins);
      if (t > 0 && r >= 0) return Math.min(100, Math.round((r / t) * 100));
    }
    return form.manualProgress;
  })();

  const extractYouTubeThumbnail = (url: string) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    return null;
  };

  const detectPlatformFromUrl = (url: string): string => {
    if (!url || !url.startsWith('http')) return 'Website';
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'YouTube';
      if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'Facebook';
      if (domain.includes('instagram.com')) return 'Instagram';
      if (domain.includes('twitter.com') || domain.includes('x.com')) return 'X';
      if (domain.includes('linkedin.com')) return 'LinkedIn';
      if (domain.includes('tiktok.com')) return 'TikTok';
      return 'Website';
    } catch {
      return 'Website';
    }
  };

  const detectThumbnailFromUrl = (url: string) => {
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    urlDebounceRef.current = setTimeout(async () => {
      const trimmed = url.trim();
      if (!trimmed || !trimmed.startsWith('http')) return;

      // YouTube — instant, no proxy needed
      const ytThumb = extractYouTubeThumbnail(trimmed);
      if (ytThumb) {
        loadExternalImageUrl(ytThumb);
        return;
      }

      setUrlLoading(true);
      try {
        // Instagram: use embed URL (public, no auth required) instead of main post URL
        const igMatch = trimmed.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
        const fetchUrl = igMatch
          ? `https://www.instagram.com/p/${igMatch[1]}/embed/`
          : trimmed;

        // Try corsproxy.io first, fall back to allorigins
        const proxies = [
          `https://corsproxy.io/?url=${encodeURIComponent(fetchUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`,
        ];

        let html = '';
        for (const proxyUrl of proxies) {
          try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(tid);
            if (res.ok) {
              html = await res.text();
              if (html.length > 200) break;
            }
          } catch { continue; }
        }

        if (!html) { setUrlLoading(false); return; }

        let imageUrl: string | null = null;

        // Instagram: extract display_url from embedded JSON
        if (igMatch) {
          const duMatch = html.match(/"display_url"\s*:\s*"([^"]+)"/);
          if (duMatch) {
            imageUrl = duMatch[1]
              .replace(/\\u0026/g, '&')
              .replace(/\\u002F/gi, '/')
              .replace(/\\\//g, '/')
              .replace(/\\"/g, '"');
          }
          // Fallback: look for cdninstagram.com or fbcdn.net image URLs in the embed HTML
          if (!imageUrl) {
            const cdnMatch = html.match(/https:\/\/[^"'\s]+(?:cdninstagram\.com|fbcdn\.net)[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*/);
            if (cdnMatch) imageUrl = cdnMatch[0].replace(/&amp;/g, '&');
          }
        }

        // General: og:image or twitter:image
        if (!imageUrl) {
          const metaMatch =
            html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
            html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i);
          if (metaMatch?.[1]) imageUrl = metaMatch[1].replace(/&amp;/g, '&');
        }

        if (imageUrl) loadExternalImageUrl(imageUrl);
      } catch {
        // Silent — user can still Ctrl+V or upload
      } finally {
        setUrlLoading(false);
      }
    }, 900);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('ไฟล์ต้องไม่เกิน 5MB'); return; }
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        const cover = shouldFitLearningImage(form.contentType)
          ? resizeImageToLearningFit(img, 0.88)
          : cropImageToLearningCover(img, 0.88);
        setForm(f => ({
          ...f,
          imageUrl: cover.dataUrl,
          imageWidth: cover.width,
          imageHeight: cover.height,
          imageSize: parseFloat(fileSizeMB),
          imageAspectRatio: cover.aspectRatio,
          imageDragOffset: 50,
        }));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm(f => ({ ...f, fileName: file.name, sourceUrl: URL.createObjectURL(file) }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const theme = CARD_THEMES[form.themeIdx];
    const stages: LearnStages = {
      read: form.status !== 'Unread',
      recap: form.understanding.trim().length > 0,
      apply: form.application.trim().length > 0,
      review: form.status === 'Done',
    };
    const tagList = form.tags.map(t => t.startsWith('#') ? t : `#${t}`);
    const newCard: LearningCard = {
      id: Date.now(),
      title: form.title.trim(),
      provider: form.provider.trim() || 'Unknown',
      providerInitial: (form.provider.trim()[0] || 'U').toUpperCase(),
      providerColor: 'bg-purple-500',
      tags: tagList,
      status: statusFromStages(stages),
      progress: computedProgress,
      stages,
      role: tagList[0]?.replace('#', ''),
      postedAgo: 'just now',
      understanding: form.understanding.trim() || 'Notes not added yet.',
      application: form.application.trim() || 'Application not added yet.',
      content: form.content.trim(),
      reviewDays: form.reviewDays,
      coverGradient: theme.gradient, coverEmoji: theme.emoji, progressColor: theme.progress,
      imageUrl: form.imageUrl || undefined,
      imagePosition: form.imagePosition,
      imageDragOffset: form.imageUrl ? form.imageDragOffset : undefined,
      sourceUrl: form.sourceUrl.trim() || undefined,
      capturedAt: todayStr(),
      nextReviewAt: nextReviewDate(0),
      reviewCount: 0,
      contentType: ct,
      totalPages:   form.totalPages   ? Number(form.totalPages)   : undefined,
      pagesRead:    form.pagesRead    ? Number(form.pagesRead)    : undefined,
      totalLessons: form.totalLessons ? Number(form.totalLessons) : undefined,
      lessonsRead:  form.lessonsRead  ? Number(form.lessonsRead)  : undefined,
      totalMins:    form.totalMins    ? Number(form.totalMins)    : undefined,
      watchedMins:  form.watchedMins  ? Number(form.watchedMins)  : undefined,
      instructor:   form.instructor.trim()   || undefined,
      category:     form.category.trim()     || undefined,
      level:        form.level               || undefined,
      language:     form.language.trim()     || undefined,
      totalHours:   form.totalHours ? Number(form.totalHours) : undefined,
      startDate:    form.startDate           || undefined,
      targetDate:   form.targetDate          || undefined,
      hasCertificate: form.hasCertificate || undefined,
      price:        form.price               || undefined,
      courseGoal:   form.courseGoal.trim()   || undefined,
      targetSkill:  form.targetSkill.trim()  || undefined,
      wouldRecommend: form.wouldRecommend || undefined,
      certificateUrl: form.certificateUrl.trim() || undefined,
      pageIconUrl: form.pageIconUrl?.trim() || undefined,
    };
    if (isEdit && onUpdate && initialCard) {
      onUpdate({
        ...newCard,
        id: initialCard.id,
        capturedAt: initialCard.capturedAt,
        nextReviewAt: initialCard.nextReviewAt,
        reviewCount: initialCard.reviewCount,
      });
    } else {
      onAdd(newCard);
    }
    onClose();
  };

  const inputCls = 'mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white';

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-2xl flex overflow-hidden mx-auto"
        style={{ maxWidth: '90vw', minHeight: '85vh', maxHeight: '92vh', width: '90vw' }}>

        {/* ── LEFT: Live cover preview ── */}
        <div
          className={`relative flex-shrink-0 overflow-hidden outline-none ${!form.imageUrl ? `bg-gradient-to-br ${CARD_THEMES[form.themeIdx].gradient}` : 'bg-black/90'}`}
          style={{ width: 360 }}
          tabIndex={0}
          onPaste={(e) => {
            const items = e.clipboardData?.items;
            if (items) { e.preventDefault(); processImagePaste(items); }
          }}
        >
          {form.imageUrl ? (
            <>
              <img src={form.imageUrl} alt="" aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-45"
                style={{ objectPosition: `center ${form.imageDragOffset}%` }} />
              <img src={form.imageUrl} alt="preview" className={`absolute inset-0 w-full h-full select-none ${fitPreviewImage ? 'object-contain' : 'object-cover cursor-grab active:cursor-grabbing'}`}
                style={{ objectPosition: `center ${form.imageDragOffset}%` }}
                onMouseDown={!fitPreviewImage ? (e) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const startOffset = dragOffsetRef.current;
                  const handleMouseMove = (me: MouseEvent) => {
                    const delta = (me.clientY - startY) / 2;
                    const newOffset = Math.max(0, Math.min(100, startOffset - delta));
                    dragOffsetRef.current = newOffset;
                    setForm(f => ({ ...f, imageDragOffset: newOffset }));
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                } : undefined}
                onTouchStart={!fitPreviewImage ? (e) => {
                  const startY = e.touches[0].clientY;
                  const startOffset = dragOffsetRef.current;
                  const handleTouchMove = (te: TouchEvent) => {
                    const delta = (te.touches[0].clientY - startY) / 2;
                    const newOffset = Math.max(0, Math.min(100, startOffset - delta));
                    dragOffsetRef.current = newOffset;
                    setForm(f => ({ ...f, imageDragOffset: newOffset }));
                  };
                  const handleTouchEnd = () => {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                  };
                  document.addEventListener('touchmove', handleTouchMove);
                  document.addEventListener('touchend', handleTouchEnd);
                } : undefined} />
              <div className="absolute bottom-4 left-4 right-4 z-10 space-y-3 bg-black/40 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                {/* Image info row */}
                <div className="flex items-center justify-between text-[10px] text-white/70">
                  <span className="flex items-center gap-1">
                    <span className="text-white">{form.imageWidth} x {form.imageHeight}px</span>
                  </span>
                  <span className="text-white/50">·</span>
                  <span className="flex items-center gap-1">
                    <span className="text-white">{form.imageSize} MB</span>
                  </span>
                </div>

                {/* Slider with visual indicator */}
                {!fitPreviewImage && <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-white">Position</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-lg min-w-12 text-center">
                        {Math.round(form.imageDragOffset)}%
                      </span>
                      <button
                        onClick={() => setForm(f => ({ ...f, imageDragOffset: 50 }))}
                        className="text-[10px] font-semibold text-white/70 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <input type="range" min={0} max={100} value={form.imageDragOffset}
                      onChange={e => setForm(f => ({ ...f, imageDragOffset: Number(e.target.value) }))}
                      className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-white/90 transition"
                      style={{
                        background: `linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.4) ${form.imageDragOffset}%, rgba(255,255,255,0.15) ${form.imageDragOffset}%, rgba(255,255,255,0.15) 100%)`
                      }} />
                    <div className="flex justify-between text-[9px] text-white/50 mt-1 px-0.5">
                      <span>↑ Top</span>
                      <span>Center</span>
                      <span>↓ Bottom</span>
                    </div>
                  </div>
                </div>}

                {/* Caption field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-white/80 block">Caption (optional)</label>
                  <input type="text"
                    value={form.imageCaption}
                    onChange={e => setForm(f => ({ ...f, imageCaption: e.target.value }))}
                    placeholder="Add a caption for this image..."
                    className="w-full px-2.5 py-1.5 bg-white/10 border border-white/20 rounded-lg text-[11px] text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <IconGlyph token={CARD_THEMES[form.themeIdx].emoji} size={64} color="rgba(255,255,255,0.9)" />
                <label className="cursor-pointer flex flex-col items-center gap-1.5 group">
                  <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2.5 transition-all group-hover:scale-105">
                    <div className="flex items-center gap-2 text-white text-[12px] font-bold">
                      <Upload size={13} /> คลิกเพื่ออัพโหลด
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
                  <span className="text-white/80 text-[11px] font-medium">หรือกด</span>
                  <kbd className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">Ctrl</kbd>
                  <span className="text-white/60 text-[10px]">+</span>
                  <kbd className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">V</kbd>
                  <span className="text-white/80 text-[11px] font-medium">วาง</span>
                </div>
              </div>
              <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-24 left-6 w-14 h-14 rounded-full bg-white/10 blur-xl" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Content type badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white rounded-xl px-2.5 py-1.5">
              <ctDef.Icon size={11} />
              <span className="text-[11px] font-semibold">{ctDef.label}</span>
            </div>
          </div>

          {/* Upload overlay */}
          <div className="absolute top-4 right-4 z-10 group">
            <label className="cursor-pointer">
              <div className="bg-black/50 hover:bg-black/70 text-white rounded-xl px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-1.5 transition backdrop-blur-sm">
                <Upload size={11} /> {form.imageUrl ? 'Change' : 'Upload'}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-gray-900 text-white text-[10px] rounded-lg p-2 w-48 z-20 shadow-lg">
              <div className="font-semibold mb-1">รูปที่แนะนำ:</div>
              <div className="space-y-0.5 text-gray-300">
                <div>• ขนาด: <span className="text-white">1280 x 720px</span> (16:9)</div>
                <div>• ขนาดไฟล์: <span className="text-white">ต่ำกว่า 5MB</span></div>
                <div>• YouTube: <span className="text-white">16:9 cover crop</span></div>
                <div>• FB/IG/Article: <span className="text-white">Fit + blur bg</span></div>
              </div>
            </div>
          </div>
          {form.imageUrl && (
            <button onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
              className="absolute top-14 right-4 z-10 bg-black/40 hover:bg-rose-500/80 text-white rounded-xl px-2 py-1.5 text-[10px] font-medium transition">
              × Remove
            </button>
          )}

          {/* Title preview */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            {form.title && (
              <div className="text-white font-bold text-sm leading-snug line-clamp-2 mb-2 drop-shadow">
                {form.title}
              </div>
            )}
            {form.provider && (
              <div className="text-white/70 text-[11px] mb-2">{form.provider}</div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{isEdit ? `แก้ไข — ${initialCard?.title ?? ''}` : 'Add to Learning Library'}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{isEdit ? 'แก้ไขข้อมูลแล้วกด Save Changes' : 'เลือกประเภทก่อน แล้วกรอกรายละเอียด'}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
              <X size={15} className="text-gray-500" />
            </button>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* ── Step 1: Content Type selector ── */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Step 1 — What are you adding?</label>
              <div className="grid grid-cols-7 gap-1.5 mt-2">
                {CONTENT_TYPES.map(c => {
                  const active = form.contentType === c.key;
                  return (
                    <button key={c.key} type="button"
                      onClick={() => setForm(f => ({ ...f, contentType: c.key }))}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl border-2 transition text-center ${
                        active
                          ? `${c.accentBg} ${c.accentBorder} ${c.accentText}`
                          : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600 bg-gray-50'
                      }`}>
                      <c.Icon size={18} />
                      <span className="text-[9px] font-semibold leading-tight">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Step 2: Source URL (for social / video / article / pdf) ── */}
            {ctDef.hasUrl && (
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  Source URL
                  <span className="font-normal normal-case text-[10px] text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full">
                    วาง link → รูปขึ้นอัตโนมัติ
                  </span>
                  {urlLoading && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-normal normal-case">
                      <svg className="animate-spin h-2.5 w-2.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      กำลังดึงรูป...
                    </span>
                  )}
                </label>
                <div className="relative mt-1.5">
                  <ExternalLink size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.sourceUrl}
                    onChange={e => {
                      const url = e.target.value;
                      const detectedPlatform = detectPlatformFromUrl(url);
                      setForm(f => ({ ...f, sourceUrl: url, platform: detectedPlatform }));
                      detectThumbnailFromUrl(url);
                    }}
                    placeholder={
                      ct === 'social' ? 'https://www.instagram.com/p/... หรือ facebook.com/...' :
                      ct === 'video' ? 'https://www.youtube.com/watch?v=...' :
                      'https://...'
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-violet-400 bg-gray-50" />
                </div>
                <p className="mt-1 text-[10px] text-gray-400">
                  รองรับ YouTube · Instagram · Facebook · Twitter · บทความทั่วไป
                </p>
              </div>
            )}

            {/* ── Steps 2–4: Generic (non-course) or Course-specific ── */}
            {ct !== 'course' ? (
              <>
                {/* ── Step 2: Title + Provider ── */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Step 2 — Details</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700">Title *</label>
                      <input value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder={ct === 'book' ? 'e.g. Deep Work by Cal Newport' : ct === 'social' ? 'Summary or caption of the post' : 'Title'}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">{ctDef.providerLabel}</label>
                      <input value={form.provider}
                        onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                        placeholder={ctDef.providerLabel}
                        className={inputCls} />
                    </div>
                    {(ct === 'social' || ct === 'article') && (
                      <div>
                        <label className="text-[11px] font-semibold text-gray-700">Page Icon URL</label>
                        <input value={form.pageIconUrl ?? ''}
                          onChange={e => setForm(f => ({ ...f, pageIconUrl: e.target.value }))}
                          placeholder="https://... (รูป logo/profile ของเพจ)"
                          className={inputCls} />
                        <p className="text-[10px] text-gray-400 mt-0.5">วาง URL รูป profile icon ของเพจหรือ author</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 flex items-center gap-1 mb-1">
                        <Hash size={10} />Tags
                      </label>
                      <div className="relative">
                        {tagsOpen && <div className="fixed inset-0 z-40" onClick={() => setTagsOpen(false)} />}
                        <div onClick={() => setTagsOpen(o => !o)}
                          className="min-h-[38px] w-full px-2 py-1.5 border border-gray-200 rounded-xl bg-white flex flex-wrap gap-1 cursor-pointer hover:border-violet-400 transition">
                          {form.tags.length === 0 && (
                            <span className="text-[12px] text-gray-400 py-0.5 px-1">เลือก tags...</span>
                          )}
                          {form.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-violet-100 text-violet-700 text-[11px] font-medium">
                              #{tag}
                              <button type="button" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) })); }}
                                className="ml-0.5 hover:text-rose-500 transition">
                                <X size={9} />
                              </button>
                            </span>
                          ))}
                        </div>
                        {tagsOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 max-h-44 overflow-y-auto">
                            {PREDEFINED_TAGS.map(tag => {
                              const selected = form.tags.includes(tag);
                              return (
                                <button key={tag} type="button"
                                  onClick={() => setForm(f => ({ ...f, tags: selected ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))}
                                  className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 hover:bg-violet-50 transition ${selected ? 'text-violet-700 font-semibold' : 'text-gray-600'}`}>
                                  <div className={`w-3 h-3 rounded-sm border flex-shrink-0 ${selected ? 'bg-violet-500 border-violet-500' : 'border-gray-300'}`} />
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Theme / Icon Picker */}
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5 mb-2.5">
                        <Sparkles size={11} className="text-violet-500" /> Select Theme & Icon
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {CARD_THEMES.map((theme, idx) => (
                          <motion.button
                            key={idx}
                            type="button"
                            whileHover={{ scale: 1.08, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setForm(f => ({ ...f, themeIdx: idx }))}
                            className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                              form.themeIdx === idx
                                ? 'border-violet-400 bg-violet-50 shadow-md'
                                : 'border-gray-200 hover:border-violet-300 bg-white'
                            }`}
                          >
                            <motion.div
                              animate={form.themeIdx === idx ? { rotate: 360 } : { rotate: 0 }}
                              transition={{ duration: 0.5 }}
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-lg shadow-sm`}
                            >
                              {theme.emoji}
                            </motion.div>
                            <span className="text-xs font-medium text-gray-600 text-center leading-tight">{theme.emoji}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {(ct === 'article' || ct === 'pdf') && (
                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold text-gray-700 flex items-center gap-1 mb-1">
                          <Upload size={10} />Upload File
                          <span className="text-gray-400 font-normal">{ct === 'pdf' ? '(.pdf)' : '(.pdf, .html, .txt)'}</span>
                        </label>
                        {form.fileName ? (
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50">
                            <FileText size={13} className="text-emerald-600 flex-shrink-0" />
                            <span className="text-[12px] text-emerald-700 font-medium flex-1 truncate">{form.fileName}</span>
                            <button type="button"
                              onClick={() => setForm(f => ({ ...f, fileName: '', sourceUrl: '' }))}
                              className="text-gray-400 hover:text-rose-500 transition">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 cursor-pointer transition">
                            <Upload size={13} className="text-gray-400" />
                            <span className="text-[12px] text-gray-500">Click to upload</span>
                            <input type="file" className="hidden"
                              accept={ct === 'pdf' ? '.pdf,application/pdf' : '.pdf,.html,.htm,.txt,.md'}
                              onChange={handleFileUpload} />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Step 3: Content (for social/article only) ── */}
                {(ct === 'social' || ct === 'article') && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      {ct === 'social' ? 'Caption / Text from Post' : 'Article Text / Summary'}
                      <span className="font-normal normal-case text-gray-400 ml-1">(optional)</span>
                    </label>
                    <textarea value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      placeholder={ct === 'social' ? 'วางข้อความ caption หรือ text จากโพส...' : 'วางข้อความจากบทความ หรือเขียนสรุป...'}
                      rows={4}
                      className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 resize-none" />
                  </div>
                )}
              </>
            ) : (
              /* ══ COURSE STANDARD FORM ══ */
              <>
                {/* Course Section 1: Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-sky-100">
                    <GraduationCap size={13} className="text-sky-600" />
                    <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wide">Section 1 — Basic Info</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700">Course Title *</label>
                      <input value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Complete React Developer Bootcamp"
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Platform *</label>
                      <input value={form.provider}
                        onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                        placeholder="e.g. Udemy, Coursera, YouTube"
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Instructor</label>
                      <input value={form.instructor}
                        onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                        placeholder="e.g. Andrew Ng"
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Course URL</label>
                      <input value={form.sourceUrl}
                        onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
                        placeholder="https://..."
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Category</label>
                      <input value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        placeholder="e.g. Programming, Finance"
                        className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1.5">Level</label>
                      <div className="flex gap-2">
                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lv => (
                          <button key={lv} type="button"
                            onClick={() => setForm(f => ({ ...f, level: lv }))}
                            className={`flex-1 py-2 rounded-xl text-[11px] font-semibold border transition ${
                              form.level === lv
                                ? lv === 'Beginner' ? 'bg-emerald-500 text-white border-emerald-500'
                                : lv === 'Intermediate' ? 'bg-sky-500 text-white border-sky-500'
                                : 'bg-violet-500 text-white border-violet-500'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                            }`}>
                            {lv}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Language</label>
                      <input value={form.language}
                        onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                        placeholder="e.g. Thai, English"
                        className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 flex items-center gap-1 mb-1">
                        <Hash size={10} />Tags
                      </label>
                      <div className="relative">
                        {tagsOpen && <div className="fixed inset-0 z-40" onClick={() => setTagsOpen(false)} />}
                        <div onClick={() => setTagsOpen(o => !o)}
                          className="min-h-[38px] w-full px-2 py-1.5 border border-sky-200 rounded-xl bg-white flex flex-wrap gap-1 cursor-pointer hover:border-sky-400 transition">
                          {form.tags.length === 0 && (
                            <span className="text-[12px] text-gray-400 py-0.5 px-1">เลือก tags...</span>
                          )}
                          {form.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 text-[11px] font-medium">
                              #{tag}
                              <button type="button" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) })); }}
                                className="ml-0.5 hover:text-rose-500 transition">
                                <X size={9} />
                              </button>
                            </span>
                          ))}
                        </div>
                        {tagsOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 max-h-44 overflow-y-auto">
                            {PREDEFINED_TAGS.map(tag => {
                              const selected = form.tags.includes(tag);
                              return (
                                <button key={tag} type="button"
                                  onClick={() => setForm(f => ({ ...f, tags: selected ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))}
                                  className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 hover:bg-sky-50 transition ${selected ? 'text-sky-700 font-semibold' : 'text-gray-600'}`}>
                                  <div className={`w-3 h-3 rounded-sm border flex-shrink-0 ${selected ? 'bg-sky-500 border-sky-500' : 'border-gray-300'}`} />
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Section 2: Structure */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-sky-100">
                    <BarChart2 size={13} className="text-sky-600" />
                    <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wide">Section 2 — Structure</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Total Lessons</label>
                      <input type="number" min={1} value={form.totalLessons}
                        onChange={e => setForm(f => ({ ...f, totalLessons: e.target.value }))}
                        placeholder="e.g. 120" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Total Hours</label>
                      <input type="number" min={0} step={0.5} value={form.totalHours}
                        onChange={e => setForm(f => ({ ...f, totalHours: e.target.value }))}
                        placeholder="e.g. 24.5" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Start Date</label>
                      <input type="date" value={form.startDate}
                        onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Target Date</label>
                      <input type="date" value={form.targetDate}
                        onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1.5">Certificate</label>
                      <button type="button" onClick={() => setForm(f => ({ ...f, hasCertificate: !f.hasCertificate }))}
                        className={`w-full py-2 rounded-xl text-[11px] font-semibold border transition flex items-center justify-center gap-1.5 ${
                          form.hasCertificate ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                        }`}>
                        <Award size={11} />
                        {form.hasCertificate ? 'Has Certificate' : 'No Certificate'}
                      </button>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1.5">Price</label>
                      <div className="flex gap-2">
                        {(['Free', 'Paid'] as const).map(p => (
                          <button key={p} type="button"
                            onClick={() => setForm(f => ({ ...f, price: p }))}
                            className={`flex-1 py-2 rounded-xl text-[11px] font-semibold border transition ${
                              form.price === p
                                ? p === 'Free' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-orange-500 text-white border-orange-500'
                                : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                            }`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Section 3: My Goal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-sky-100">
                    <Target size={13} className="text-sky-600" />
                    <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wide">Section 3 — My Goal <span className="text-sky-400 font-normal normal-case">(before starting)</span></span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Why am I taking this course?</label>
                    <textarea value={form.courseGoal}
                      onChange={e => setForm(f => ({ ...f, courseGoal: e.target.value }))}
                      placeholder="e.g. I want to switch career to frontend development..."
                      rows={2}
                      className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 resize-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Target Skill / Outcome</label>
                    <input value={form.targetSkill}
                      onChange={e => setForm(f => ({ ...f, targetSkill: e.target.value }))}
                      placeholder="e.g. Build a full-stack app with React + Node"
                      className={inputCls} />
                  </div>
                </div>

                {/* Course Section 4: Results — shown only when Done */}
                {form.status === 'Done' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-emerald-100">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Section 4 — Results <span className="text-emerald-400 font-normal normal-case">(after completion)</span></span>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1.5">Rating</label>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type="button"
                            onClick={() => setForm(f => ({ ...f, rating: n }))}
                            className={`flex-1 py-2 rounded-xl border transition flex items-center justify-center ${
                              form.rating >= n ? 'bg-amber-400 text-white border-amber-400' : 'border-gray-200 text-gray-400 bg-white hover:border-amber-300'
                            }`}>
                            <Star size={13} />
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 text-center">
                        {form.rating === 0 ? 'Not rated yet' : form.rating === 1 ? 'Poor' : form.rating === 2 ? 'Fair' : form.rating === 3 ? 'Good' : form.rating === 4 ? 'Great' : 'Excellent'}
                      </p>
                    </div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, wouldRecommend: !f.wouldRecommend }))}
                      className={`w-full py-2 rounded-xl text-[11px] font-semibold border transition flex items-center justify-center gap-1.5 ${
                        form.wouldRecommend ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 text-gray-500 bg-white hover:border-emerald-200'
                      }`}>
                      <Trophy size={11} />
                      {form.wouldRecommend ? 'Would Recommend' : 'Would NOT Recommend'}
                    </button>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">My Review / Summary</label>
                      <textarea value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        placeholder="เรียนรู้อะไรบ้าง? แนะนำไหม? อะไรดีหรือขาดหายไปจากเนื้อหา?"
                        rows={3}
                        className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 resize-none" />
                    </div>
                    {form.hasCertificate && (
                      <div>
                        <label className="text-[11px] font-semibold text-gray-700">Certificate URL <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input value={form.certificateUrl}
                          onChange={e => setForm(f => ({ ...f, certificateUrl: e.target.value }))}
                          placeholder="https://certificate-link..."
                          className={inputCls} />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-violet-600 flex items-center gap-1">
                          <Lightbulb size={11} /> My Understanding
                        </label>
                        <textarea value={form.understanding}
                          onChange={e => setForm(f => ({ ...f, understanding: e.target.value }))}
                          placeholder="ข้อคิดสำคัญที่ได้รับ?"
                          rows={2}
                          className="mt-1 w-full px-3 py-2 border border-violet-100 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-violet-50/30 resize-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-orange-600 flex items-center gap-1">
                          <Target size={11} /> How I Can Apply This
                        </label>
                        <textarea value={form.application}
                          onChange={e => setForm(f => ({ ...f, application: e.target.value }))}
                          placeholder="นำไปใช้ในชีวิตจริงได้อย่างไร?"
                          rows={2}
                          className="mt-1 w-full px-3 py-2 border border-orange-100 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-orange-50/30 resize-none" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!form.title.trim()}
              title={!form.title.trim() ? 'กรุณากรอก Title ก่อน' : ''}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-200 flex items-center justify-center gap-2">
              {isEdit ? <><Check size={14} /> Save Changes</> : <><Plus size={14} /> Add to Library</>}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────
type AddLearningFormState = {
  contentType: ContentType;
  title: string;
  sourceUrl: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  tags: string[];
  category: string;
  status: 'Reading' | 'Done' | 'Unread';
  reviewDays: 3 | 5 | 10 | 30;
  authorCreator: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  aiSummary: string;
  keyTakeaways: string;
  understanding: string;
  application: string;
  actionIdea: string;
  reviewQuestions: string;
  totalPages: string;
  currentPage: string;
  chapter: string;
  genre: string;
  provider: string;
  totalLessons: string;
  totalDuration: string;
  difficulty: '' | 'Beginner' | 'Intermediate' | 'Advanced';
  learningObjective: string;
  syllabus: string;
  targetCompletionDate: string;
  channelCreator: string;
  duration: string;
  transcriptAvailable: boolean;
  keyTimestamps: string;
  sourceWebsite: string;
  estimatedReadTime: string;
  cleanArticleContent: string;
  importantQuotes: string;
  platform: string;
  extractedPostText: string;
  whySaved: string;
  keyInsight: string;
  episodeTitle: string;
  showName: string;
  hostGuest: string;
  audioProgress: string;
  timestampNotes: string;
  pageCount: string;
  documentOutline: string;
  sourceOwner: string;
  pageIconUrl: string;
};

const TYPE_TAG_SUGGESTIONS: Record<ContentType, string[]> = {
  book: ['Book', 'Reading', 'Ideas'],
  course: ['Course', 'Skill Building', 'Practice'],
  video: ['Video', 'YouTube', 'Tutorial'],
  article: ['Article', 'Research', 'Insight'],
  social: ['Social Post', 'Saved Post', 'Insight'],
  podcast: ['Podcast', 'Audio', 'Interview'],
  pdf: ['PDF', 'Document', 'Reference'],
};

const TYPE_CATEGORY_DEFAULTS: Record<ContentType, string> = {
  book: 'Reading',
  course: 'Skill Building',
  video: 'Video Learning',
  article: 'Article',
  social: 'Social Insight',
  podcast: 'Podcast',
  pdf: 'Document',
};

function makeBlankAddLearningForm(type: ContentType = 'article'): AddLearningFormState {
  return {
    contentType: type,
    title: '',
    sourceUrl: '',
    fileName: '',
    fileType: '',
    fileSize: '',
    tags: TYPE_TAG_SUGGESTIONS[type].slice(0, 2),
    category: TYPE_CATEGORY_DEFAULTS[type],
    status: 'Unread',
    reviewDays: 3,
    authorCreator: '',
    imageUrl: '',
    imageWidth: 0,
    imageHeight: 0,
    imageSize: 0,
    aiSummary: '',
    keyTakeaways: '',
    understanding: '',
    application: '',
    actionIdea: '',
    reviewQuestions: '',
    totalPages: '',
    currentPage: '',
    chapter: '',
    genre: '',
    provider: '',
    totalLessons: '',
    totalDuration: '',
    difficulty: '',
    learningObjective: '',
    syllabus: '',
    targetCompletionDate: '',
    channelCreator: '',
    duration: '',
    transcriptAvailable: false,
    keyTimestamps: '',
    sourceWebsite: '',
    estimatedReadTime: '',
    cleanArticleContent: '',
    importantQuotes: '',
    platform: '',
    extractedPostText: '',
    whySaved: '',
    keyInsight: '',
    episodeTitle: '',
    showName: '',
    hostGuest: '',
    audioProgress: '',
    timestampNotes: '',
    pageCount: '',
    documentOutline: '',
    sourceOwner: '',
    pageIconUrl: '',
  };
}

function cardToAddLearningForm(card?: LearningCard): AddLearningFormState {
  if (!card) return makeBlankAddLearningForm();
  const type = (card.contentType ?? 'article') as ContentType;
  const legacySourceContent = card.content ?? '';
  return {
    ...makeBlankAddLearningForm(type),
    title: card.title ?? '',
    sourceUrl: card.sourceUrl ?? '',
    fileName: card.fileName ?? '',
    fileType: card.fileType ?? '',
    fileSize: card.fileSize ? String(card.fileSize) : '',
    tags: card.tags.map(t => t.replace(/^#/, '')),
    category: card.category ?? TYPE_CATEGORY_DEFAULTS[type],
    status: card.status,
    reviewDays: (card.reviewDays === 5 || card.reviewDays === 10 || card.reviewDays === 30 ? card.reviewDays : 3) as 3 | 5 | 10 | 30,
    authorCreator: card.instructor ?? card.provider ?? '',
    imageUrl: card.imageUrl ?? '',
    pageIconUrl: card.pageIconUrl ?? '',
    aiSummary: card.aiSummary ?? '',
    keyTakeaways: card.keyTakeaways ?? '',
    understanding: card.understanding === 'Notes not added yet.' ? '' : card.understanding,
    application: card.application === 'Application not added yet.' ? '' : card.application,
    actionIdea: card.nextAction ?? '',
    reviewQuestions: card.reviewQuestions ?? card.clarityQ1 ?? '',
    totalPages: card.totalPages ? String(card.totalPages) : '',
    currentPage: card.pagesRead ? String(card.pagesRead) : '',
    chapter: card.chapter ?? '',
    genre: card.genre ?? '',
    provider: card.provider === 'Unknown' ? '' : card.provider,
    totalLessons: card.totalLessons ? String(card.totalLessons) : '',
    totalDuration: card.totalHours ? String(card.totalHours) : '',
    difficulty: card.level ?? '',
    learningObjective: card.courseGoal ?? '',
    syllabus: card.syllabus ?? (type === 'course' ? legacySourceContent : ''),
    targetCompletionDate: card.targetDate ?? '',
    channelCreator: card.provider ?? '',
    duration: card.totalMins ? String(card.totalMins) : '',
    transcriptAvailable: !!card.transcriptAvailable,
    keyTimestamps: card.timestamps ?? '',
    sourceWebsite: card.provider ?? '',
    estimatedReadTime: card.estimatedReadTime ? String(card.estimatedReadTime) : '',
    cleanArticleContent: card.cleanArticleContent ?? (type === 'article' ? legacySourceContent : ''),
    importantQuotes: card.quotesList ?? '',
    platform: card.platform ?? '',
    extractedPostText: card.extractedPostText ?? (type === 'social' ? legacySourceContent : ''),
    whySaved: card.whySaved ?? (type === 'social' ? card.typeNotes ?? '' : ''),
    keyInsight: card.keyInsight ?? '',
    episodeTitle: card.episodeNumber ?? card.title ?? '',
    showName: card.provider ?? '',
    hostGuest: card.guestName ?? '',
    audioProgress: card.watchedMins ? String(card.watchedMins) : '',
    timestampNotes: card.timestamps ?? '',
    pageCount: card.totalPages ? String(card.totalPages) : '',
    documentOutline: card.documentOutline ?? (type === 'pdf' ? legacySourceContent : ''),
    sourceOwner: card.sourceOwner ?? card.provider ?? '',
  };
}

function AddLearningModal({ onClose, onAdd, onUpdate, initialCard }: {
  onClose: () => void;
  onAdd: (card: LearningCard) => void;
  onUpdate?: (card: LearningCard) => void;
  initialCard?: LearningCard;
}) {
  const isEdit = !!initialCard;
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'done'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<AddLearningFormState>(() => cardToAddLearningForm(initialCard));
  const [tagInput, setTagInput] = useState('');
  const [tagPickerOpen, setTagPickerOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const requestClose = () => {
    setClosing(true);
    window.setTimeout(onClose, 180);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') requestClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const typeDef = CONTENT_TYPES.find(t => t.key === form.contentType)!;
  const TypeIcon = typeDef.Icon;
  const inputCls = 'mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white';
  const labelCls = 'text-[11px] font-semibold text-gray-700';
  const update = <K extends keyof AddLearningFormState>(key: K, value: AddLearningFormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const sourceReady = !!form.sourceUrl.trim() || !!form.fileName.trim();
  const fieldError = (key: string) => errors[key] ? <p className="mt-1 text-[10px] font-semibold text-rose-500">{errors[key]}</p> : null;

  const selectType = (type: ContentType) => {
    setForm(f => ({ ...f, contentType: type, category: TYPE_CATEGORY_DEFAULTS[type], tags: TYPE_TAG_SUGGESTIONS[type].slice(0, 2) }));
    setStep(2);
  };

  const sourceHost = () => {
    try { return new URL(form.sourceUrl).hostname.replace(/^www\./, ''); }
    catch { return ''; }
  };

  const titleFromSource = () => {
    if (form.fileName) return form.fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    try {
      const url = new URL(form.sourceUrl);
      return (url.pathname.split('/').filter(Boolean).pop() || url.hostname).replace(/[-_]/g, ' ');
    } catch {
      return form.sourceUrl.replace(/^https?:\/\//, '').slice(0, 72);
    }
  };

  const runAiAutofill = () => {
    const host = sourceHost();
    setForm(f => ({
      ...f,
      title: f.title || titleFromSource() || `${typeDef.label} resource`,
      category: f.category || TYPE_CATEGORY_DEFAULTS[f.contentType],
      tags: f.tags.length ? f.tags : TYPE_TAG_SUGGESTIONS[f.contentType].slice(0, 3),
      reviewDays: f.reviewDays || 3,
      authorCreator: f.authorCreator || host,
      provider: f.provider || host,
      channelCreator: f.channelCreator || host,
      sourceWebsite: f.sourceWebsite || host,
      showName: f.showName || host,
      platform: f.platform || (
        host.includes('facebook') ? 'Facebook'
        : host.includes('instagram') ? 'Instagram'
        : host.includes('youtube') ? 'YouTube'
        : host.includes('linkedin') ? 'LinkedIn'
        : host.includes('tiktok') ? 'TikTok'
        : host.includes('x.com') || host.includes('twitter') ? 'X'
        : host ? 'Website'
        : ''
      ),
      aiSummary: f.aiSummary || `AI draft: saved ${typeDef.label.toLowerCase()} from ${host || 'your upload'} for later review.`,
      keyTakeaways: f.keyTakeaways || 'Key idea to confirm in Read Mode.',
      estimatedReadTime: f.estimatedReadTime || (f.contentType === 'article' ? '6' : f.estimatedReadTime),
      duration: f.duration || (f.contentType === 'video' ? '10' : f.duration),
      totalDuration: f.totalDuration || (f.contentType === 'course' ? '1' : f.totalDuration),
    }));
    setAiState('done');
  };

  const handleSourceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileSize = Number((file.size / (1024 * 1024)).toFixed(2));
    setForm(f => ({
      ...f,
      fileName: file.name,
      fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'File',
      fileSize: String(fileSize),
      sourceUrl: f.sourceUrl || URL.createObjectURL(file),
      title: f.title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    }));
    setErrors(e => {
      const next = { ...e };
      delete next.source;
      delete next.fileName;
      return next;
    });
    // If source file is an image, auto-set as cover thumbnail
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = document.createElement('img') as HTMLImageElement;
        img.onload = () => {
          const cover = shouldFitLearningImage(form.contentType) ? resizeImageToLearningFit(img, 0.88) : cropImageToLearningCover(img, 0.88);
          setForm(f => f.imageUrl ? f : { ...f, imageUrl: cover.dataUrl, imageWidth: cover.width, imageHeight: cover.height });
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Icon ต้องไม่เกิน 2MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setForm(f => ({ ...f, pageIconUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        const cover = shouldFitLearningImage(form.contentType) ? resizeImageToLearningFit(img, 0.88) : cropImageToLearningCover(img, 0.88);
        setForm(f => ({ ...f, imageUrl: cover.dataUrl, imageWidth: cover.width, imageHeight: cover.height, imageSize: Number((file.size / (1024 * 1024)).toFixed(2)) }));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addTag = (tag: string) => {
    const clean = tag.replace(/^#/, '').trim();
    if (clean && !form.tags.includes(clean)) update('tags', [...form.tags, clean]);
  };

  const removeTag = (tag: string) => update('tags', form.tags.filter(t => t !== tag));

  const tagSuggestions = Array.from(new Set([
    ...TYPE_TAG_SUGGESTIONS[form.contentType],
    ...PREDEFINED_TAGS,
  ])).filter(tag =>
    !form.tags.includes(tag) &&
    (!tagInput.trim() || tag.toLowerCase().includes(tagInput.trim().toLowerCase()))
  ).slice(0, 8);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!sourceReady) next.source = 'Add a source URL or upload a file';
    if (!form.category.trim()) next.category = 'Category is required';
    if (form.tags.length === 0) next.tags = 'Add at least one tag';
    if (form.contentType === 'book' && !form.authorCreator.trim()) next.authorCreator = 'Author is required';
    if (form.contentType === 'course' && !form.provider.trim() && !form.authorCreator.trim()) next.provider = 'Instructor / provider is required';
    if (form.contentType === 'video' && !form.channelCreator.trim()) next.channelCreator = 'Channel / creator is required';
    if (form.contentType === 'article' && !form.sourceWebsite.trim()) next.sourceWebsite = 'Source website is required';
    if (form.contentType === 'social' && !form.platform.trim()) next.platform = 'Platform is required';
    if (form.contentType === 'podcast' && !form.showName.trim()) next.showName = 'Show name is required';
    if (form.contentType === 'pdf' && !form.fileName.trim()) next.fileName = 'Upload a PDF/DOC file';
    setErrors(next);
    return next;
  };

  const computeProgressForSave = () => {
    if (form.status === 'Done') return 100;
    if (form.status === 'Unread') return 0;
    if (form.contentType === 'book' || form.contentType === 'pdf') {
      const total = Number(form.contentType === 'pdf' ? form.pageCount : form.totalPages);
      const current = Number(form.currentPage);
      if (total > 0 && current >= 0) return Math.min(100, Math.round((current / total) * 100));
    }
    if (form.contentType === 'podcast') {
      const total = Number(form.duration);
      const current = Number(form.audioProgress);
      if (total > 0 && current > 0) return Math.min(100, Math.round((current / total) * 100));
    }
    return 30;
  };

  const providerForSave = () => {
    if (form.contentType === 'book') return form.authorCreator;
    if (form.contentType === 'course') return form.provider || form.authorCreator;
    if (form.contentType === 'video') return form.channelCreator;
    if (form.contentType === 'article') return form.sourceWebsite || form.authorCreator;
    if (form.contentType === 'social') return form.authorCreator || form.platform;
    if (form.contentType === 'podcast') return form.showName;
    return form.sourceOwner || form.fileName || 'Document';
  };

  const sourceContentForSave = () => {
    if (form.contentType === 'course') return form.syllabus;
    if (form.contentType === 'article') return form.cleanArticleContent;
    if (form.contentType === 'social') return form.extractedPostText;
    if (form.contentType === 'pdf') return form.documentOutline;
    return '';
  };

  const save = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) return;
    const effectiveStatus = isEdit ? form.status : 'Unread';
    const progress = effectiveStatus === 'Unread' ? 0 : computeProgressForSave();
    const stages: LearnStages = effectiveStatus === 'Unread'
      ? { read: false, recap: false, apply: false, review: false }
      : {
          read: true,
          recap: !isRichTextEmpty(form.keyTakeaways) || !isRichTextEmpty(form.aiSummary),
          apply: false,
          review: effectiveStatus === 'Done',
        };
    const provider = providerForSave().trim() || 'Unknown';
    const theme = CARD_THEMES[Math.max(0, CONTENT_TYPES.findIndex(t => t.key === form.contentType)) % CARD_THEMES.length];
    const sourceContent = sourceContentForSave();
    const card: LearningCard = {
      id: initialCard?.id ?? Date.now(),
      title: form.title.trim(),
      provider,
      providerInitial: (provider[0] || 'U').toUpperCase(),
      providerColor: 'bg-purple-500',
      tags: form.tags.map(t => t.startsWith('#') ? t : `#${t}`),
      status: effectiveStatus,
      progress,
      stages,
      understanding: !isRichTextEmpty(form.understanding) ? form.understanding : 'Notes not added yet.',
      application: !isRichTextEmpty(form.application) ? form.application : 'Application not added yet.',
      reviewDays: form.reviewDays,
      coverGradient: theme.gradient,
      coverEmoji: theme.emoji,
      progressColor: theme.progress,
      imageUrl: form.imageUrl || undefined,
      imageDragOffset: 50,
      role: form.category,
      postedAgo: initialCard ? initialCard.postedAgo : 'just now',
      sourceUrl: form.sourceUrl.trim() || undefined,
      capturedAt: initialCard?.capturedAt ?? todayStr(),
      nextReviewAt: nextReviewDate([3, 5, 10, 30].indexOf(form.reviewDays)),
      reviewCount: initialCard?.reviewCount ?? 0,
      contentType: form.contentType,
      category: form.category,
      instructor: form.authorCreator || form.provider || undefined,
      aiSummary: form.aiSummary || undefined,
      keyTakeaways: form.keyTakeaways || undefined,
      nextAction: form.actionIdea || undefined,
      reviewQuestions: form.reviewQuestions || undefined,
      content: sourceContent || undefined,
      totalPages: Number(form.contentType === 'pdf' ? form.pageCount : form.totalPages) || undefined,
      pagesRead: Number(form.currentPage) || undefined,
      totalLessons: Number(form.totalLessons) || undefined,
      totalHours: Number(form.totalDuration) || undefined,
      totalMins: Number(form.duration || form.estimatedReadTime) || undefined,
      watchedMins: Number(form.audioProgress) || undefined,
      level: form.difficulty || undefined,
      targetDate: form.targetCompletionDate || undefined,
      courseGoal: form.learningObjective || undefined,
      chapter: form.chapter || undefined,
      genre: form.genre || undefined,
      syllabus: form.syllabus || undefined,
      platform: form.platform || undefined,
      transcriptAvailable: form.transcriptAvailable || undefined,
      estimatedReadTime: Number(form.estimatedReadTime) || undefined,
      cleanArticleContent: form.cleanArticleContent || undefined,
      quotesList: form.importantQuotes || undefined,
      extractedPostText: form.extractedPostText || undefined,
      whySaved: form.whySaved || undefined,
      keyInsight: form.keyInsight || undefined,
      episodeNumber: form.episodeTitle || undefined,
      guestName: form.hostGuest || undefined,
      timestamps: form.keyTimestamps || form.timestampNotes || undefined,
      fileName: form.fileName || undefined,
      fileType: form.fileType || undefined,
      fileSize: Number(form.fileSize) || undefined,
      documentOutline: form.documentOutline || undefined,
      sourceOwner: form.sourceOwner || undefined,
      pageIconUrl: form.pageIconUrl?.trim() || undefined,
    };
    if (isEdit && onUpdate) onUpdate(card);
    else onAdd(card);
    requestClose();
  };

  const goNext = () => {
    setStep(2);
  };

  const textArea = (key: keyof AddLearningFormState, placeholder: string, rows = 3) => (
    <RichTextEditor
      value={String(form[key] ?? '')}
      onChange={nextValue => update(key, nextValue as AddLearningFormState[typeof key])}
      placeholder={placeholder}
      minHeight={Math.max(112, rows * 30)}
    />
  );

  const renderTags = () => (
    <div>
      <label className={labelCls}>Tags <span className="text-rose-500">*</span></label>
      <div className="relative mt-1">
        <div className="rounded-xl border border-gray-200 bg-white p-2">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {form.tags.map(tag => (
              <button key={tag} type="button" onClick={() => removeTag(tag)}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                #{tag}<X size={10} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-violet-200 px-2.5 py-2">
            <Hash size={13} className="text-violet-400 shrink-0" />
            <input
              value={tagInput}
              onChange={e => {
                setTagInput(e.target.value);
                setTagPickerOpen(true);
              }}
              onFocus={() => setTagPickerOpen(true)}
              onBlur={() => window.setTimeout(() => setTagPickerOpen(false), 120)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = tagInput.trim() || tagSuggestions[0];
                  if (!value) return;
                  addTag(value);
                  setTagInput('');
                  setTagPickerOpen(true);
                }
              }}
              placeholder="Type a tag and press Enter..."
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
        {tagPickerOpen && tagSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Recommended</div>
            <div className="flex flex-wrap gap-1.5">
              {tagSuggestions.map(tag => (
                <button key={tag} type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
                  addTag(tag);
                  setTagInput('');
                  setTagPickerOpen(true);
                }}
                  className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-600 transition hover:bg-violet-100">
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {fieldError('tags')}
    </div>
  );

  const renderSourcePlatformPicker = (keys: string[], required = false) => (
    <div className="col-span-2">
      <label className={labelCls}>
        Source icon {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="mt-1 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {SOURCE_PLATFORM_OPTIONS.filter(option => keys.includes(option.key)).map(option => {
          const active = form.platform === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => update('platform', option.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                active ? option.tone : 'border-gray-200 bg-white text-gray-500 hover:border-violet-200 hover:bg-violet-50'
              }`}
            >
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                active ? 'border-current/15 bg-white/75' : 'border-gray-200 bg-gray-50'
              }`}>
                {option.icon()}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
      {required && fieldError('platform')}
    </div>
  );

  const renderBookFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div><label className={labelCls}>Author <span className="text-rose-500">*</span></label><input className={inputCls} value={form.authorCreator} onChange={e => update('authorCreator', e.target.value)} />{fieldError('authorCreator')}</div>
      <div><label className={labelCls}>Total pages</label><input type="number" className={inputCls} value={form.totalPages} onChange={e => update('totalPages', e.target.value)} /></div>
      <div><label className={labelCls}>Genre</label><input className={inputCls} value={form.genre} onChange={e => update('genre', e.target.value)} /></div>
      <div className="col-span-2"><label className={labelCls}>Chapter</label><input className={inputCls} value={form.chapter} onChange={e => update('chapter', e.target.value)} /></div>
    </div>
  );

  const renderCourseFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div><label className={labelCls}>Instructor / Provider <span className="text-rose-500">*</span></label><input className={inputCls} value={form.provider} onChange={e => update('provider', e.target.value)} />{fieldError('provider')}</div>
      <div><label className={labelCls}>Difficulty</label><select className={inputCls} value={form.difficulty} onChange={e => update('difficulty', e.target.value as AddLearningFormState['difficulty'])}><option value="">Select</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
      <div><label className={labelCls}>Total lessons</label><input type="number" className={inputCls} value={form.totalLessons} onChange={e => update('totalLessons', e.target.value)} /></div>
      <div><label className={labelCls}>Total duration (hours)</label><input type="number" className={inputCls} value={form.totalDuration} onChange={e => update('totalDuration', e.target.value)} /></div>
      <div className="col-span-2"><label className={labelCls}>Target completion date</label><input type="date" className={inputCls} value={form.targetCompletionDate} onChange={e => update('targetCompletionDate', e.target.value)} /></div>
    </div>
  );

  const renderVideoFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><label className={labelCls}>Video URL <span className="text-rose-500">*</span></label><input className={inputCls} value={form.sourceUrl} onChange={e => update('sourceUrl', e.target.value)} />{fieldError('source')}</div>
      {renderSourcePlatformPicker(['YouTube', 'TikTok', 'Website'])}
      <div><label className={labelCls}>Channel / Creator <span className="text-rose-500">*</span></label><input className={inputCls} value={form.channelCreator} onChange={e => update('channelCreator', e.target.value)} />{fieldError('channelCreator')}</div>
      <div><label className={labelCls}>Duration (min)</label><input type="number" className={inputCls} value={form.duration} onChange={e => update('duration', e.target.value)} /></div>
      <button type="button" onClick={() => update('transcriptAvailable', !form.transcriptAvailable)}
        className={`col-span-2 rounded-xl border px-3 py-2 text-xs font-bold ${form.transcriptAvailable ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>
        Transcript available: {form.transcriptAvailable ? 'Yes' : 'No'}
      </button>
    </div>
  );

  const renderArticleFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div><label className={labelCls}>Source website <span className="text-rose-500">*</span></label><input className={inputCls} value={form.sourceWebsite} onChange={e => update('sourceWebsite', e.target.value)} />{fieldError('sourceWebsite')}</div>
      <div><label className={labelCls}>Author</label><input className={inputCls} value={form.authorCreator} onChange={e => update('authorCreator', e.target.value)} /></div>
      {renderSourcePlatformPicker(['Website', 'Facebook', 'Instagram', 'LinkedIn', 'X'])}
      <div><label className={labelCls}>Estimated read time (min)</label><input type="number" className={inputCls} value={form.estimatedReadTime} onChange={e => update('estimatedReadTime', e.target.value)} /></div>
      <div className="col-span-2">
        <label className={labelCls}>Article Content <span className="text-gray-400 font-normal">(วางเนื้อหาบทความ หรือสรุปย่อ)</span></label>
        <textarea className={`${inputCls} resize-y`} rows={5} value={form.cleanArticleContent} onChange={e => update('cleanArticleContent', e.target.value)} placeholder="วาง copy ข้อความจากบทความ หรือเขียนสรุปสั้นๆ..." />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Page / Author Icon</label>
        <div className="flex items-center gap-2 mt-1">
          {form.pageIconUrl ? (
            <div className="relative shrink-0">
              <img src={form.pageIconUrl} alt="icon" className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200" />
              <button type="button" onClick={() => update('pageIconUrl', '')}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">✕</button>
            </div>
          ) : null}
          <input className={`${inputCls} mt-0 flex-1`} value={form.pageIconUrl.startsWith('data:') ? '' : form.pageIconUrl}
            onChange={e => update('pageIconUrl', e.target.value)}
            placeholder="วาง URL รูป icon หรืออัปโหลดรูป" />
          <label className="shrink-0 flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-violet-200 px-3 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 whitespace-nowrap">
            <Upload size={13} /> Upload Icon
            <input type="file" className="hidden" accept="image/*" onChange={handleIconUpload} />
          </label>
        </div>
      </div>
    </div>
  );

  const renderSocialFields = () => (
    <div className="grid grid-cols-2 gap-3">
      {renderSourcePlatformPicker(['Facebook', 'Instagram', 'X', 'LinkedIn', 'TikTok', 'Website'], true)}
      <div><label className={labelCls}>Creator / Page</label><input className={inputCls} value={form.authorCreator} onChange={e => update('authorCreator', e.target.value)} /></div>
      <div><label className={labelCls}>Post URL</label><input className={inputCls} value={form.sourceUrl} onChange={e => update('sourceUrl', e.target.value)} /></div>
      <div className="col-span-2">
        <label className={labelCls}>Post Text / Caption <span className="text-gray-400 font-normal">(วางข้อความจากโพส แล้ว Highlight ส่วนสำคัญ)</span></label>
        <RichTextEditor
          value={form.extractedPostText}
          onChange={v => update('extractedPostText', v)}
          placeholder="วางข้อความ caption หรือ text จากโพส แล้ว Highlight ส่วนที่สำคัญ..."
          minHeight={120}
        />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Page / Creator Icon</label>
        <div className="flex items-center gap-2 mt-1">
          {form.pageIconUrl ? (
            <div className="relative shrink-0">
              <img src={form.pageIconUrl} alt="icon" className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200" />
              <button type="button" onClick={() => update('pageIconUrl', '')}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">✕</button>
            </div>
          ) : null}
          <input className={`${inputCls} mt-0 flex-1`} value={form.pageIconUrl.startsWith('data:') ? '' : form.pageIconUrl}
            onChange={e => update('pageIconUrl', e.target.value)}
            placeholder="วาง URL รูป icon หรืออัปโหลดรูป" />
          <label className="shrink-0 flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-violet-200 px-3 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 whitespace-nowrap">
            <Upload size={13} /> Upload Icon
            <input type="file" className="hidden" accept="image/*" onChange={handleIconUpload} />
          </label>
        </div>
      </div>
    </div>
  );

  const renderPodcastFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div><label className={labelCls}>Episode title</label><input className={inputCls} value={form.episodeTitle} onChange={e => update('episodeTitle', e.target.value)} /></div>
      <div><label className={labelCls}>Show name <span className="text-rose-500">*</span></label><input className={inputCls} value={form.showName} onChange={e => update('showName', e.target.value)} />{fieldError('showName')}</div>
      <div><label className={labelCls}>Host / Guest</label><input className={inputCls} value={form.hostGuest} onChange={e => update('hostGuest', e.target.value)} /></div>
      <div><label className={labelCls}>Duration (min)</label><input type="number" className={inputCls} value={form.duration} onChange={e => update('duration', e.target.value)} /></div>
    </div>
  );

  const renderPdfFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div><label className={labelCls}>File name <span className="text-rose-500">*</span></label><input className={inputCls} value={form.fileName} onChange={e => update('fileName', e.target.value)} />{fieldError('fileName')}</div>
      <div><label className={labelCls}>File type</label><input className={inputCls} value={form.fileType} onChange={e => update('fileType', e.target.value)} /></div>
      <div><label className={labelCls}>File size (MB)</label><input className={inputCls} value={form.fileSize} onChange={e => update('fileSize', e.target.value)} /></div>
      <div><label className={labelCls}>Page count</label><input type="number" className={inputCls} value={form.pageCount} onChange={e => update('pageCount', e.target.value)} /></div>
      <div className="col-span-2"><label className={labelCls}>Source / Owner</label><input className={inputCls} value={form.sourceOwner} onChange={e => update('sourceOwner', e.target.value)} /></div>
    </div>
  );

  const renderTypeFields = () => {
    switch (form.contentType) {
      case 'book': return renderBookFields();
      case 'course': return renderCourseFields();
      case 'video': return renderVideoFields();
      case 'article': return renderArticleFields();
      case 'social': return renderSocialFields();
      case 'podcast': return renderPodcastFields();
      case 'pdf': return renderPdfFields();
    }
  };

  if (!mounted) return null;
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-2.5 py-3 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <motion.div
        className="flex h-[803px] max-h-[calc(100vh-24px)] w-[1040px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-violet-950/20"
        initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
        animate={closing ? { opacity: 0, y: 18, filter: 'blur(5px)' } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.9 }}
      >
        <div className="shrink-0 border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-emerald-50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">Learning capture</p>
              <h3 className="mt-1 text-lg font-extrabold text-gray-950">{isEdit ? 'Edit Learning Resource' : 'Add Learning Resource'}</h3>
              <p className="text-xs text-gray-500">Fast capture first. Notes and deeper review can happen later in Read Mode.</p>
            </div>
            <button onClick={requestClose} className="rounded-xl p-2 text-gray-400 transition hover:bg-white hover:text-gray-700">
              <X size={17} />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { id: 1, label: 'Type' },
              { id: 2, label: 'Details + Save' },
            ].map(item => (
              <button key={item.id} type="button" onClick={() => setStep(item.id as 1 | 2)}
                className={`rounded-xl px-3 py-2 text-left text-xs font-bold transition ${step === item.id ? 'bg-violet-500 text-white shadow-lg shadow-violet-200' : 'bg-white text-gray-500 ring-1 ring-gray-100 hover:bg-violet-50'}`}>
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">{item.id}</span>{item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="type-step"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
            <div className="space-y-4">
              <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <div className="text-sm font-bold text-gray-900">Select content type</div>
                <div className="mt-1 text-xs text-gray-500">Each type has its own focused fields. No giant one-size-fits-all form.</div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {CONTENT_TYPES.map(type => {
                  const Icon = type.Icon;
                  const active = form.contentType === type.key;
                  return (
                    <button key={type.key} type="button" onClick={() => selectType(type.key)}
                      className={`rounded-2xl border p-3 text-left transition ${active ? 'border-violet-300 bg-violet-50 shadow-md shadow-violet-100' : 'border-gray-100 bg-white hover:border-violet-200 hover:bg-violet-50/50'}`}>
                      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${type.accentBg} ${type.accentText}`}>
                        <Icon size={17} />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{type.label}</div>
                      <div className="mt-1 text-[11px] text-gray-500">{TYPE_CATEGORY_DEFAULTS[type.key]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="details-step"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${typeDef.accentBg} ${typeDef.accentText}`}>
                  <TypeIcon size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{typeDef.label}</div>
                  <div className="text-xs text-gray-500">Paste a link or upload a file, then review the key fields below. AI Auto-fill stays here when you want a faster draft.</div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <label className={labelCls}>{form.contentType === 'pdf' ? 'Source URL (optional)' : 'Source URL'} <span className="text-rose-500">*</span></label>
                  <input className={inputCls} value={form.sourceUrl}
                    onChange={e => update('sourceUrl', e.target.value)}
                    placeholder={form.contentType === 'video' ? 'https://youtube.com/watch...' : 'https://...'} />
                  {fieldError('source')}
                </div>
                <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-violet-200 px-4 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50">
                  <Upload size={14} /> Upload
                  <input type="file" className="hidden" onChange={handleSourceFile} accept={form.contentType === 'pdf' ? '.pdf,.doc,.docx' : '*'} />
                </label>
              </div>

              {form.fileName && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                  File ready: {form.fileName} {form.fileSize && <span className="text-emerald-500">({form.fileSize} MB)</span>}
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50">
                  <Upload size={14} /> Upload preview image
                  <input type="file" className="hidden" onChange={handleCoverUpload} accept="image/*" />
                </label>
                <button type="button" onClick={runAiAutofill}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-90">
                  <Sparkles size={14} className="mr-1 inline" /> AI Auto-fill
                </button>
              </div>

              {form.imageUrl && (
                <div className="rounded-2xl border border-violet-100 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-bold text-gray-800">Image preview</div>
                    <button type="button" onClick={() => update('imageUrl', '')}
                      className="rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-500 transition hover:bg-rose-50">
                      Remove
                    </button>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {aiState === 'done' && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                  Metadata drafted. Review before saving.
                </div>
              )}

              <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Review required fields</div>
                    <div className="text-xs text-gray-500">Short by default. Advanced notes stay collapsed.</div>
                  </div>
                  <div className="rounded-xl bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-600">{typeDef.label}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelCls}>Title <span className="text-rose-500">*</span></label>
                    <input className={inputCls} value={form.title} onChange={e => update('title', e.target.value)} />
                    {fieldError('title')}
                  </div>
                  <div>
                    <label className={labelCls}>Category <span className="text-rose-500">*</span></label>
                    <input className={inputCls} value={form.category} onChange={e => update('category', e.target.value)} />
                    {fieldError('category')}
                  </div>
                  <div>
                    <label className={labelCls}>Review reminder <span className="text-rose-500">*</span></label>
                    <select className={inputCls} value={form.reviewDays} onChange={e => update('reviewDays', Number(e.target.value) as AddLearningFormState['reviewDays'])}>
                      {[3, 5, 10, 30].map(days => <option key={days} value={days}>Review in {days} days</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">{renderTags()}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-1 text-sm font-bold text-gray-900">{typeDef.label} fields</div>
                <div className="mb-3 text-xs text-gray-500">Capture only the essentials here. Progress, extracted content, and deeper notes can wait for Reading Mode.</div>
                {renderTypeFields()}
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Quick Notes & Highlights</div>
                    <div className="text-xs text-gray-500">Keep this short. Deeper reflection can wait for Reading Mode.</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600">Rich Text</div>
                </div>
                <div>
                  <label className={labelCls}>Key Takeaways</label>
                  {textArea('keyTakeaways', 'Use bold, underline, highlight, headings, lists, or quotes for the key parts...', 5)}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <button type="button" onClick={() => setAdvancedOpen(o => !o)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-gray-900">
                  Show Advanced Fields
                  <ChevronRight size={16} className={`transition ${advancedOpen ? 'rotate-90' : ''}`} />
                </button>
                {advancedOpen && (
                  <div className="space-y-3 border-t border-gray-100 p-4">
                    <div><label className={labelCls}>AI Summary</label>{textArea('aiSummary', 'AI generated or manual summary...', 3)}</div>
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      Understanding, application, review questions, and action steps are now meant to be added in Reading Mode.
                    </div>
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-5">
          <button onClick={requestClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50">Cancel</button>
          <div className="flex gap-2">
            {step > 1 && <button onClick={() => setStep(1)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50">Back</button>}
            {step < 2 ? (
              <button onClick={goNext}
                className="rounded-xl bg-violet-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-600">
                Next
              </button>
            ) : (
              <button onClick={save}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-90">
                {isEdit ? 'Save Changes' : 'Save Learning'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star === value ? 0 : star)}
          className="transition-transform hover:scale-125 focus:outline-none"
        >
          <Star
            size={24}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200 fill-gray-100'
            }`}
          />
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span className="text-xs font-semibold text-amber-500 ml-1">
          {labels[hovered || value]} · {hovered || value}/5
        </span>
      )}
    </div>
  );
}

// ─── Tag Selector ─────────────────────────────────────────────────────
function TagSelector({ selected, onChange }: { selected: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = CATEGORY_LIST.filter(c =>
    c.toLowerCase().includes(input.toLowerCase()) && !selected.includes(`#${c}`) && !selected.includes(c)
  );

  const addTag = (tag: string) => {
    const formatted = tag.startsWith('#') ? tag : `#${tag}`;
    if (!selected.includes(formatted)) onChange([...selected, formatted]);
    setInput('');
    setOpen(false);
  };

  const removeTag = (tag: string) => onChange(selected.filter(t => t !== tag));

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((tag, i) => (
            <span key={i} className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 opacity-60 hover:opacity-100 text-sm leading-none">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search categories or type a custom #tag…"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-400"
        />
        {open && (filtered.length > 0 || input.trim()) && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl max-h-44 overflow-y-auto">
            {filtered.slice(0, 12).map((cat, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => addTag(cat)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition"
              >
                <span className="text-violet-400 font-bold">#</span>{cat}
              </button>
            ))}
            {input.trim() && !CATEGORY_LIST.some(c => c.toLowerCase() === input.trim().toLowerCase()) && (
              <button
                type="button"
                onMouseDown={() => addTag(input.trim())}
                className="w-full text-left px-3 py-2 text-xs text-purple-600 hover:bg-purple-50 font-semibold border-t border-gray-50 flex items-center gap-2"
              >
                <Plus size={11} /> Add &quot;{input.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reflection Steps (sequential, aligned 1:1 with the sidebar Stepper) ──
// Four gated steps matching the stepper: Understand → Connect → Apply → Act.
// Each step unlocks only once the previous one is filled (standard learn-to-unlock
// flow). Locked steps stay visible but dimmed + disabled. Status colours mirror the
// stepper: emerald = done, sky = current/in-progress, gray = locked.
function StepBoxes({
  status, subjectLabel,
  understanding, setUnderstanding,
  keyTakeaways, setKeyTakeaways,
  application, setApplication,
  nextAction, setNextAction,
}: {
  status: 'Reading' | 'Done' | 'Unread';
  subjectLabel: string;
  understanding: string; setUnderstanding: (v: string) => void;
  keyTakeaways: string; setKeyTakeaways: (v: string) => void;
  application: string; setApplication: (v: string) => void;
  nextAction: string; setNextAction: (v: string) => void;
}) {
  const filled = (v: string, sentinel?: string) => !!(v?.trim()) && v !== sentinel;
  const boxes = [
    {
      n: 1, label: 'Understand', sub: 'จับใจความสำคัญ', icon: Lightbulb,
      accent: 'bg-violet-400', numCls: 'bg-violet-100 text-violet-700',
      value: understanding === 'Notes not added yet.' ? '' : understanding,
      set: setUnderstanding,
      placeholder: `สิ่งสำคัญที่ได้จาก${subjectLabel}คืออะไร...`,
      done: filled(understanding, 'Notes not added yet.'),
    },
    {
      n: 2, label: 'Connect', sub: 'เชื่อมกับชีวิตจริง', icon: Link2,
      accent: 'bg-sky-400', numCls: 'bg-sky-100 text-sky-700',
      value: keyTakeaways, set: setKeyTakeaways,
      placeholder: 'เนื้อหานี้เชื่อมโยงกับชีวิต/งานของคุณยังไง...',
      done: filled(keyTakeaways),
    },
    {
      n: 3, label: 'Apply', sub: 'วางแผนใช้ยังไง', icon: Target,
      accent: 'bg-emerald-400', numCls: 'bg-emerald-100 text-emerald-700',
      value: application === 'Application not added yet.' ? '' : application,
      set: setApplication,
      placeholder: 'จะนำไอเดียนี้ไปใช้จริงยังไง...',
      done: filled(application, 'Application not added yet.'),
    },
    {
      n: 4, label: 'Act', sub: 'action เล็กๆ', icon: Zap,
      accent: 'bg-amber-400', numCls: 'bg-amber-100 text-amber-700',
      value: nextAction, set: setNextAction,
      placeholder: 'action เล็กๆ ที่จะลงมือทำวันนี้...',
      done: filled(nextAction),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {boxes.map(box => {
        const Icon = box.icon;
        return (
          <div
            key={box.n}
            className={`relative rounded-2xl border-2 overflow-hidden bg-white transition-all duration-300 ${
              box.done
                ? 'border-emerald-300 shadow-[0_0_0_3px_rgba(52,211,153,0.10)]'
                : 'border-gray-200 focus-within:border-violet-200'
            }`}
          >
            <div className={`h-1 w-full ${box.done ? 'bg-emerald-400' : box.accent} opacity-75 transition-colors duration-300`} />
            <div className="p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg tabular-nums leading-none ${box.numCls}`}>
                    {String(box.n).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="text-[12px] font-bold text-gray-800 leading-none">{box.label}</div>
                    <div className={`text-[9px] font-semibold mt-0.5 ${box.done ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {box.sub}
                    </div>
                  </div>
                </div>
                {box.done && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <Icon size={13} className={`mb-1.5 ${box.done ? 'text-emerald-400' : 'text-gray-300'} transition-colors`} />
              <textarea
                value={box.value}
                onChange={e => box.set(e.target.value)}
                placeholder={box.placeholder}
                rows={3}
                className="w-full text-[12px] bg-transparent resize-none focus:outline-none text-gray-700 placeholder:text-gray-300 leading-relaxed border-0"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Course Detail Modal (3-panel: Info | Reading | Pomodoro) ─────────
function CourseDetailModal({
  card,
  onClose,
  onSave,
}: {
  card: LearningCard;
  onClose: () => void;
  onSave: (
    id: number, understanding: string, application: string, rating: number,
    userTags: string[], content: string, status: 'Reading' | 'Done' | 'Unread',
    progress: number, keyTakeaways?: string, nextAction?: string,
    clarityQ1?: string, clarityQ2?: string, clarityBelief?: number,
    nextReviewAt?: string, reviewCount?: number,
    typeNotes?: string, quotesList?: string, timestamps?: string,
    episodeNumber?: string, guestName?: string, imageUrl?: string
  ) => void;
}) {
  const defaultU = card.understanding === 'Notes not added yet.' ? '' : richTextToPlainText(card.understanding);
  const defaultA = card.application === 'Application not added yet.' ? '' : richTextToPlainText(card.application);
  const [understanding, setUnderstanding] = useState(defaultU);
  const [application, setApplication] = useState(defaultA);
  const [keyTakeaways, setKeyTakeaways] = useState(richTextToPlainText(card.keyTakeaways));
  const [nextAction, setNextAction] = useState(card.nextAction ?? '');
  const [content, setContent] = useState(richTextToPlainText(card.content));
  // Clarity Filter
  const [clarityQ1, setClarityQ1] = useState(card.clarityQ1 ?? '');
  const [clarityQ2, setClarityQ2] = useState(card.clarityQ2 ?? '');
  const [clarityBelief, setClarityBelief] = useState(card.clarityBelief ?? 0);
  // Type-specific
  const [typeNotes, setTypeNotes] = useState(card.typeNotes ?? '');
  const [quotesList, setQuotesList] = useState<string[]>(
    card.quotesList ? card.quotesList.split('\n').filter(Boolean) : []
  );
  const [timestamps, setTimestamps] = useState<{t: string; note: string}[]>(
    card.timestamps ? card.timestamps.split('\n').filter(Boolean).map(l => {
      const [t, ...rest] = l.split(' — '); return { t: t ?? '', note: rest.join(' — ') };
    }) : []
  );
  const [episodeNumber, setEpisodeNumber] = useState(card.episodeNumber ?? '');
  const [guestName, setGuestName] = useState(card.guestName ?? '');
  const [modalImageUrl, setModalImageUrl] = useState(card.imageUrl ?? '');
  const [newQuote, setNewQuote] = useState('');
  const [newTs, setNewTs] = useState('');
  const [newTsNote, setNewTsNote] = useState('');
  const clarityScore = computeClarityScore(clarityQ1, clarityQ2, clarityBelief);
  const [rating, setRating] = useState(card.rating ?? 0);
  const [userTags, setUserTags] = useState<string[]>(card.userTags ?? []);
  const [status, setStatus] = useState<'Reading' | 'Done' | 'Unread'>(card.status);
  const [progress, setProgress] = useState(card.progress);
  const stepProgressPct = Math.round([
    true,
    status === 'Reading' || status === 'Done',
    !!(card.understanding?.trim() && card.understanding !== 'Notes not added yet.'),
    !!(card.keyTakeaways?.trim()),
    !!(card.application?.trim() && card.application !== 'Application not added yet.'),
    !!(card.nextAction?.trim()),
  ].filter(Boolean).length / 6 * 100);

  // Pomodoro
  const [pomodoroMin, setPomodoroMin] = useState(25);
  const [timerActive, setTimerActive] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [sessionsDone, setSessionsDone] = useState(0);
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [clockStyle, setClockStyle] = useState<'ring' | 'minimal' | 'flip' | 'analog' | 'bar' | 'breathing' | 'hourglass' | 'tomato' | 'segment'>('ring');
  const [showClockMenu, setShowClockMenu] = useState(false);
  const [showDurationMenu, setShowDurationMenu] = useState(false);
  const totalSessions = 4;
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);

  // Audio
  const [musicType, setMusicType] = useState<'off' | 'lofi' | 'white' | 'brown' | 'binaural' | 'file' | 'youtube'>('off');
  const [volumeLevel, setVolumeLevel] = useState(60);
  const [customAudio, setCustomAudio] = useState<Array<{ name: string; url: string }>>([]);
  const [selectedCustomAudio, setSelectedCustomAudio] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [customImages, setCustomImages] = useState<Array<{ name: string; url: string }>>([]);
  const [selectedCustomImage, setSelectedCustomImage] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [addMusicMode, setAddMusicMode] = useState<'youtube' | 'file'>('youtube');
  // Video utility
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 0.75 | 1 | 1.25 | 1.5 | 2>(1);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ disconnect: () => void } | null>(null);
  const audioFileRef = useRef<HTMLAudioElement | null>(null);
  const timerIntRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep latest values accessible inside setInterval without re-creating the interval
  const timerModeRef = useRef<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const sessionsDoneRef = useRef(0);
  const pomodoroMinRef = useRef(25);
  const shortBreakMinRef = useRef(5);
  const longBreakMinRef = useRef(15);
  timerModeRef.current = timerMode;
  sessionsDoneRef.current = sessionsDone;
  pomodoroMinRef.current = pomodoroMin;
  shortBreakMinRef.current = shortBreakMin;
  longBreakMinRef.current = longBreakMin;

  const clockStyleOptions = [
    { key: 'ring', label: 'Ring' },
    { key: 'minimal', label: 'Minimal' },
    { key: 'flip', label: 'Flip' },
    { key: 'analog', label: 'Analog' },
    { key: 'bar', label: 'Bar' },
    { key: 'breathing', label: 'Breathing' },
    { key: 'hourglass', label: 'Hourglass' },
    { key: 'tomato', label: 'Tomato' },
    { key: 'segment', label: 'Segment' },
  ] as const;

  const soundPresets = [
    { key: 'off' as const, label: 'Silent', note: 'Read without background sound' },
    { key: 'binaural' as const, label: 'Memory Recall', note: 'Binaural tone for recall sessions' },
    { key: 'lofi' as const, label: 'Deep Focus', note: 'Warm lo-fi loop for long reading' },
    { key: 'brown' as const, label: 'Heavy Focus', note: 'Brown noise to block distractions' },
    { key: 'white' as const, label: 'Clean Noise', note: 'Light white noise for neutral focus' },
  ];

  const durationPresets = {
    focus: [25, 45, 60, 90, 120],
    shortBreak: [5, 10, 15, 20],
    longBreak: [15, 25, 30, 45],
  } as const;

  const setDurationForMode = (mode: 'focus' | 'shortBreak' | 'longBreak', minutes: number) => {
    setTimerActive(false);
    if (mode === 'focus') {
      setPomodoroMin(minutes);
      pomodoroMinRef.current = minutes;
    } else if (mode === 'shortBreak') {
      setShortBreakMin(minutes);
      shortBreakMinRef.current = minutes;
    } else {
      setLongBreakMin(minutes);
      longBreakMinRef.current = minutes;
    }
    if (timerMode === mode) setRemaining(minutes * 60);
  };

  const switchMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setTimerActive(false);
    setTimerMode(mode);
    if (mode === 'focus') setRemaining(pomodoroMin * 60);
    else if (mode === 'shortBreak') setRemaining(shortBreakMin * 60);
    else setRemaining(longBreakMin * 60);
  };

  const scrollAtOpen = useRef(0);
  const [mounted, setMounted] = useState(false);
  const isReadingType = card.contentType === 'article' || card.contentType === 'social' || card.contentType === 'book';
  const [readingMode, setReadingMode] = useState(isReadingType);
  const [p3Tab, setP3Tab] = useState<'timer'|'review'>('timer');
  const fitImage = shouldFitLearningImage(card.contentType);
  const showReadingUtilityRail = true;
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Focus overlay with preventScroll so the portal mount cannot scroll the page.
  // The entrance animation is handled by framer-motion's initial/animate.
  useLayoutEffect(() => {
    if (!mounted) return;
    overlayRef.current?.focus({ preventScroll: true });
  }, [mounted]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const processImagePaste = (items: DataTransferItemList) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.includes('image')) {
        const file = items[i].getAsFile();
        if (file) {
          if (file.size > 5 * 1024 * 1024) { alert('ไฟล์ต้องไม่เกิน 5MB'); return; }
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = document.createElement('img') as HTMLImageElement;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxWidth = 800;
              const scale = Math.min(1, maxWidth / img.width);
              canvas.width = Math.round(img.width * scale);
              canvas.height = Math.round(img.height * scale);
              canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
              setModalImageUrl(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = ev.target?.result as string;
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes('image')) {
          e.preventDefault();
          processImagePaste(items);
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // ── Audio helpers ──────────────────────────────────────────────────
  const stopAudio = () => {
    try { audioNodesRef.current?.disconnect(); } catch {}
    audioNodesRef.current = null;
    if (audioFileRef.current) { audioFileRef.current.pause(); audioFileRef.current = null; }
  };

  const startLofi = (ctx: AudioContext) => {
    const freqs = [130.81, 164.81, 196.00, 261.63];
    const oscs = freqs.map(f => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; return o; });
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400; filter.Q.value = 0.5;
    const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain(); lfo.frequency.value = 0.2; lfoGain.gain.value = 2;
    lfo.connect(lfoGain); lfoGain.connect(oscs[0].frequency);
    const gain = ctx.createGain(); gain.gain.value = 0.06 * (volumeLevel / 100);
    oscs.forEach(o => o.connect(filter)); filter.connect(gain); gain.connect(ctx.destination);
    oscs.forEach(o => o.start()); lfo.start();
    audioNodesRef.current = { disconnect: () => { try { oscs.forEach(o => o.stop()); lfo.stop(); gain.disconnect(); } catch {} } };
  };

  const startWhiteNoise = (ctx: AudioContext) => {
    const bufSize = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const gain = ctx.createGain(); gain.gain.value = 0.12 * (volumeLevel / 100);
    src.connect(gain); gain.connect(ctx.destination); src.start();
    audioNodesRef.current = { disconnect: () => { try { src.stop(); gain.disconnect(); } catch {} } };
  };

  const startBrownNoise = (ctx: AudioContext) => {
    const bufSize = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < bufSize; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const gain = ctx.createGain(); gain.gain.value = 0.35 * (volumeLevel / 100);
    src.connect(gain); gain.connect(ctx.destination); src.start();
    audioNodesRef.current = { disconnect: () => { try { src.stop(); gain.disconnect(); } catch {} } };
  };

  const startBinaural = (ctx: AudioContext) => {
    const merger = ctx.createChannelMerger(2);
    const oL = ctx.createOscillator(), oR = ctx.createOscillator();
    oL.frequency.value = 200; oR.frequency.value = 240;
    const gL = ctx.createGain(), gR = ctx.createGain();
    gL.gain.value = gR.gain.value = 0.12 * (volumeLevel / 100);
    oL.connect(gL); gL.connect(merger, 0, 0); oR.connect(gR); gR.connect(merger, 0, 1);
    merger.connect(ctx.destination); oL.start(); oR.start();
    audioNodesRef.current = { disconnect: () => { try { oL.stop(); oR.stop(); merger.disconnect(); } catch {} } };
  };

  // Load persisted audio from IndexedDB on mount
  useEffect(() => {
    const req = indexedDB.open('PomodoroAudio', 1);
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore('tracks', { keyPath: 'name' });
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const getAll = store.getAll();
      getAll.onsuccess = () => {
        const rows = getAll.result as Array<{ name: string; blob: Blob }>;
        if (rows.length > 0) {
          const tracks = rows.map(r => ({ name: r.name, url: URL.createObjectURL(r.blob) }));
          setCustomAudio(tracks);
          setMusicType('file');
        }
      };
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    const newTracks = fileArr.map(f => ({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) }));
    setCustomAudio(prev => {
      const next = [...prev, ...newTracks];
      setSelectedCustomAudio(next.length - 1);
      // Persist to IndexedDB
      const req = indexedDB.open('PomodoroAudio', 1);
      req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        (e.target as IDBOpenDBRequest).result.createObjectStore('tracks', { keyPath: 'name' });
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('tracks', 'readwrite');
        const store = tx.objectStore('tracks');
        fileArr.forEach(f => {
          const name = f.name.replace(/\.[^.]+$/, '');
          store.put({ name, blob: f });
        });
      };
      return next;
    });
    setMusicType('file');
    setShowAddMusic(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    const newImages = Array.from(files).map(f => ({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) }));
    setCustomImages(prev => { const next = [...prev, ...newImages]; setSelectedCustomImage(next.length - 1); return next; });
  };

  const prevTrack = () => {
    if (musicType === 'file' && customAudio.length > 0)
      setSelectedCustomAudio(i => Math.max(0, i - 1));
  };
  const nextTrack = () => {
    if (musicType === 'file' && customAudio.length > 0)
      setSelectedCustomAudio(i => Math.min(customAudio.length - 1, i + 1));
  };

  const handleYoutubeSubmit = () => {
    const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
    if (match) { setYoutubeVideoId(match[1]); setMusicType('youtube'); setShowAddMusic(false); }
  };

  useEffect(() => {
    if (!timerActive) {
      if (timerIntRef.current) { clearInterval(timerIntRef.current); timerIntRef.current = null; } return;
    }
    timerIntRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setTimerActive(false);
          const mode = timerModeRef.current;
          const sessions = sessionsDoneRef.current;
          if (mode === 'focus') {
            const next = Math.min(sessions + 1, totalSessions);
            if (next >= totalSessions) {
              setSessionsDone(0); setTimerMode('longBreak'); return longBreakMinRef.current * 60;
            }
            setSessionsDone(next); setTimerMode('shortBreak'); return shortBreakMinRef.current * 60;
          } else {
            setTimerMode('focus'); return pomodoroMinRef.current * 60;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (timerIntRef.current) { clearInterval(timerIntRef.current); timerIntRef.current = null; } };
  }, [timerActive]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    stopAudio();
    if (!timerActive) return;
    if (musicType === 'off' || musicType === 'youtube') { audioCtxRef.current?.close(); audioCtxRef.current = null; return; }
    if (musicType === 'file' && customAudio[selectedCustomAudio]) {
      const audio = new Audio();
      audio.src = customAudio[selectedCustomAudio].url;
      audio.loop = false;
      audio.volume = volumeLevel / 100;
      audioFileRef.current = audio;
      const onTime = () => { setAudioCurrentTime(audio.currentTime); setAudioDuration(audio.duration || 0); };
      const onMeta = () => setAudioDuration(audio.duration || 0);
      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('loadedmetadata', onMeta);
      audio.play().catch(() => {});
      return () => {
        audio.removeEventListener('timeupdate', onTime);
        audio.removeEventListener('loadedmetadata', onMeta);
        stopAudio();
      };
    }
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    if (musicType === 'lofi') startLofi(ctx);
    else if (musicType === 'white') startWhiteNoise(ctx);
    else if (musicType === 'brown') startBrownNoise(ctx);
    else if (musicType === 'binaural') startBinaural(ctx);
    return () => stopAudio();
  }, [musicType, selectedCustomAudio, customAudio, volumeLevel, timerActive]);

  useEffect(() => {
    return () => {
      try { audioNodesRef.current?.disconnect(); } catch {}
      audioCtxRef.current?.close();
      if (timerIntRef.current) clearInterval(timerIntRef.current);
    };
  }, []);

  const fmtTime = (s: number) => {
    s = Math.floor(Math.max(0, s));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const handleStatusChange = (s: 'Reading' | 'Done' | 'Unread') => {
    setStatus(s);
    if (s === 'Done') setProgress(100);
    if (s === 'Unread') setProgress(0);
  };

  const handleSaveClose = () => {
    const didClarityWork = clarityQ1.trim().length > 0;
    const newCount = didClarityWork ? (card.reviewCount ?? 0) + 1 : (card.reviewCount ?? 0);
    const newNextReview = didClarityWork ? nextReviewDate(newCount) : card.nextReviewAt;
    onSave(
      card.id, understanding.trim(), application.trim(), rating, userTags,
      content.trim(), status, progress, keyTakeaways.trim(), nextAction.trim(),
      clarityQ1.trim(), clarityQ2.trim(), clarityBelief || undefined,
      newNextReview, newCount || undefined,
      typeNotes.trim() || undefined,
      quotesList.filter(Boolean).join('\n') || undefined,
      timestamps.filter(t => t.t).map(t => `${t.t} — ${t.note}`).join('\n') || undefined,
      episodeNumber.trim() || undefined,
      guestName.trim() || undefined,
      modalImageUrl
    );
    onClose();
  };

  // Ring calculations
  const ringR = 70;
  const circumference = 2 * Math.PI * ringR;
  const currentDuration = timerMode === 'focus' ? pomodoroMin * 60 : timerMode === 'shortBreak' ? shortBreakMin * 60 : longBreakMin * 60;
  const progressFraction = remaining / currentDuration;
  const strokeDashoffset = circumference * (1 - progressFraction);
  const currentMinutes = timerMode === 'focus' ? pomodoroMin : timerMode === 'shortBreak' ? shortBreakMin : longBreakMin;
  const activeSoundLabel =
    musicType === 'off'
      ? 'Silent'
      : musicType === 'binaural'
      ? 'Memory Recall'
      : musicType === 'lofi'
      ? 'Deep Focus'
      : musicType === 'brown'
      ? 'Heavy Focus'
      : musicType === 'white'
      ? 'Clean Noise'
      : customAudio[selectedCustomAudio]?.name ?? 'My Sound';

  const renderReadingClock = () => {
    const theme =
      timerMode === 'focus'
        ? { strong: '#8b5cf6', soft: '#ede9fe', accent: '#c4b5fd', text: 'text-violet-700', chip: 'border-violet-100 bg-violet-50 text-violet-700' }
        : timerMode === 'shortBreak'
        ? { strong: '#10b981', soft: '#ecfdf5', accent: '#a7f3d0', text: 'text-emerald-700', chip: 'border-emerald-100 bg-emerald-50 text-emerald-700' }
        : { strong: '#0ea5e9', soft: '#f0f9ff', accent: '#bae6fd', text: 'text-sky-700', chip: 'border-sky-100 bg-sky-50 text-sky-700' };

    if (clockStyle === 'minimal') {
      return (
        <div className="flex min-w-[180px] flex-col items-center justify-center">
          <div className={`font-mono text-[34px] font-black tracking-tight ${theme.text}`}>{fmtTime(remaining)}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{Math.round(progressFraction * 100)}% left</div>
        </div>
      );
    }

    if (clockStyle === 'flip') {
      return (
        <div className="flex min-w-[200px] items-center justify-center gap-1.5">
          {fmtTime(remaining).split('').map((ch, i) =>
            ch === ':' ? (
              <span key={i} className={`pb-1 text-2xl font-black ${theme.text}`}>:</span>
            ) : (
              <div key={i} className="flex h-12 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-md">
                <span className="font-mono text-[22px] font-black text-white">{ch}</span>
              </div>
            )
          )}
        </div>
      );
    }

    if (clockStyle === 'bar') {
      return (
        <div className="min-w-[220px] space-y-2">
          <div className={`text-center font-mono text-[30px] font-black ${theme.text}`}>{fmtTime(remaining)}</div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressFraction * 100}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.strong})` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400">
            <span>0:00</span>
            <span>{currentMinutes}:00</span>
          </div>
        </div>
      );
    }

    if (clockStyle === 'analog') {
      const elapsed = currentDuration - remaining;
      const secAngle = (elapsed % 60) / 60 * 360 - 90;
      const minAngle = (elapsed / currentDuration) * 360 - 90;
      const toXY = (deg: number, r: number): [number, number] => [60 + r * Math.cos(deg * Math.PI / 180), 60 + r * Math.sin(deg * Math.PI / 180)];
      const [mx, my] = toXY(minAngle, 28);
      const [sx, sy] = toXY(secAngle, 36);
      return (
        <div className="flex min-w-[170px] items-center justify-center gap-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill={theme.soft} stroke={theme.accent} strokeWidth="2" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              return (
                <line
                  key={i}
                  x1={60 + 38 * Math.cos(angle)}
                  y1={60 + 38 * Math.sin(angle)}
                  x2={60 + 46 * Math.cos(angle)}
                  y2={60 + 46 * Math.sin(angle)}
                  stroke={theme.strong}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
            <line x1="60" y1="60" x2={mx} y2={my} stroke={theme.strong} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="60" y1="60" x2={sx} y2={sy} stroke="#f0abfc" strokeWidth="2" strokeLinecap="round" />
            <circle cx="60" cy="60" r="4" fill={theme.strong} />
          </svg>
          <div className="space-y-1 text-center">
            <div className={`font-mono text-[28px] font-black ${theme.text}`}>{fmtTime(remaining)}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Analog</div>
          </div>
        </div>
      );
    }

    if (clockStyle === 'breathing') {
      return (
        <div className="flex min-w-[190px] items-center justify-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className={`absolute h-20 w-20 rounded-full ${timerActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: theme.soft }} />
            <div className="absolute h-12 w-12 rounded-full" style={{ backgroundColor: theme.accent }} />
            <div className="absolute h-7 w-7 rounded-full" style={{ backgroundColor: theme.strong }} />
          </div>
          <div className="space-y-1 text-center">
            <div className={`font-mono text-[28px] font-black ${theme.text}`}>{fmtTime(remaining)}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Breathing</div>
          </div>
        </div>
      );
    }

    if (clockStyle === 'hourglass') {
      return (
        <div className="flex min-w-[190px] items-center justify-center gap-4">
          <div className="relative flex h-20 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-[18px] bg-gradient-to-b from-white to-gray-50 shadow-inner" />
            <div className="absolute top-2 h-0 w-0 border-l-[22px] border-r-[22px] border-t-0 border-b-[24px] border-l-transparent border-r-transparent" style={{ borderBottomColor: theme.accent }} />
            <div className="absolute bottom-2 h-0 w-0 border-l-[22px] border-r-[22px] border-b-0 border-t-[24px] border-l-transparent border-r-transparent" style={{ borderTopColor: theme.strong }} />
          </div>
          <div className="space-y-1 text-center">
            <div className={`font-mono text-[28px] font-black ${theme.text}`}>{fmtTime(remaining)}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Hourglass</div>
          </div>
        </div>
      );
    }

    if (clockStyle === 'tomato') {
      return (
        <div className="flex min-w-[190px] items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 shadow-inner">
            <span className="text-[36px]">🍅</span>
          </div>
          <div className="space-y-1 text-center">
            <div className="font-mono text-[28px] font-black text-rose-600">{fmtTime(remaining)}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-300">Tomato</div>
          </div>
        </div>
      );
    }

    if (clockStyle === 'segment') {
      const segs = 24;
      const activeSegs = Math.round(progressFraction * segs);
      const innerRadius = 26;
      const outerRadius = 42;
      const cx = 48;
      const cy = 48;
      const span = 360 / segs;
      const gap = 4;
      const toRad = (deg: number) => deg * Math.PI / 180;
      return (
        <div className="flex min-w-[200px] items-center justify-center gap-4">
          <svg width="96" height="96" viewBox="0 0 96 96">
            {Array.from({ length: segs }).map((_, i) => {
              const start = i * span - 90 + gap / 2;
              const end = start + span - gap;
              const x1 = cx + outerRadius * Math.cos(toRad(start));
              const y1 = cy + outerRadius * Math.sin(toRad(start));
              const x2 = cx + outerRadius * Math.cos(toRad(end));
              const y2 = cy + outerRadius * Math.sin(toRad(end));
              const x3 = cx + innerRadius * Math.cos(toRad(end));
              const y3 = cy + innerRadius * Math.sin(toRad(end));
              const x4 = cx + innerRadius * Math.cos(toRad(start));
              const y4 = cy + innerRadius * Math.sin(toRad(start));
              return (
                <path
                  key={i}
                  d={`M${x1},${y1} A${outerRadius},${outerRadius} 0 0,1 ${x2},${y2} L${x3},${y3} A${innerRadius},${innerRadius} 0 0,0 ${x4},${y4} Z`}
                  fill={i < activeSegs ? theme.strong : theme.accent}
                />
              );
            })}
            <circle cx={cx} cy={cy} r="20" fill="white" />
          </svg>
          <div className="space-y-1 text-center">
            <div className={`font-mono text-[28px] font-black ${theme.text}`}>{fmtTime(remaining)}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Segment</div>
          </div>
        </div>
      );
    }

    const ringRadius = 36;
    const ringCircumference = 2 * Math.PI * ringRadius;
    return (
      <div className="flex min-w-[190px] items-center justify-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={ringRadius} fill="none" stroke={theme.soft} strokeWidth="7" />
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              fill="none"
              stroke={theme.strong}
              strokeWidth="7"
              strokeDasharray={`${ringCircumference} ${ringCircumference}`}
              strokeDashoffset={ringCircumference * (1 - progressFraction)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{Math.round(progressFraction * 100)}%</span>
        </div>
        <div className="space-y-1 text-center">
          <div className={`font-mono text-[30px] font-black ${theme.text}`}>{fmtTime(remaining)}</div>
          <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.chip}`}>
            Ring
          </div>
        </div>
      </div>
    );
  };

  if (!mounted) return null;
  return createPortal(
        <motion.div
          ref={overlayRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center p-5 outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            className={`flex w-full max-w-[1400px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 transition-colors duration-500 ${readingMode ? 'bg-[#f4f6fb]' : 'bg-gray-50'}`}
            style={{ height: '92vh' }}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >

        {/* ══ PANEL 1: Left Info ═══════════════════════════════════════ */}
        <AnimatePresence initial={false}>
        <motion.div
          key="panel1"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1], opacity: { delay: 0.18, duration: 0.28 } }}
          style={{ flexShrink: 0 }}
          className="border-r border-gray-200 flex flex-col bg-white overflow-y-auto overflow-x-hidden"
        >
          <div className="p-4">
            <label className={`block relative w-full aspect-video rounded-xl overflow-hidden shadow-md cursor-pointer group ${!modalImageUrl ? `bg-gradient-to-br ${card.coverGradient}` : ''}`} title="คลิกเพื่อเปลี่ยนรูปปก หรือ Ctrl+V วางรูปได้เลย">
              <input type="file" accept="image/*" className="sr-only" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { alert('ไฟล์ต้องไม่เกิน 5MB'); return; }
                const reader = new FileReader();
                reader.onload = ev => {
                  const img = document.createElement('img') as HTMLImageElement;
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scale = Math.min(1, 800 / img.width);
                    canvas.width = Math.round(img.width * scale);
                    canvas.height = Math.round(img.height * scale);
                    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    setModalImageUrl(canvas.toDataURL('image/jpeg', 0.85));
                  };
                  img.src = ev.target?.result as string;
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }} />
              {modalImageUrl ? (
                <>
                  {fitImage && (
                    <img src={modalImageUrl} alt="" aria-hidden="true"
                      className="absolute inset-0 w-full h-full scale-110 object-cover blur-xl opacity-55" />
                  )}
                  <img src={modalImageUrl} alt={card.title}
                    className={`absolute inset-0 w-full h-full ${fitImage ? 'object-contain' : 'object-cover'}`}
                    style={{ objectPosition: `center ${card.imageDragOffset ?? 50}%` }} />
                </>
              ) : (
                <>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 blur-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center">
                      <IconGlyph token={card.coverEmoji} size={28} color="rgba(255,255,255,0.97)" />
                    </div>
                  </div>
                </>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Image size={20} className="text-white" />
              </div>
            </label>
          </div>

          <div className="px-4 pb-4 flex flex-col gap-3 flex-1">
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{card.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{card.provider}</p>
              {card.tags[0] && (
                <span className="mt-1.5 inline-block text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                  {card.tags[0].replace('#', '')}
                </span>
              )}
            </div>

            {/* Stepper Progress — live state */}
            <div className="space-y-0">
              {(() => {
                const steps = [
                  { label: 'เริ่มต้น', sub: 'เพิ่มการเรียนรู้แล้ว', value: true },
                  { label: 'กำลังอ่าน', sub: 'Reading in progress', value: status === 'Reading' || status === 'Done' },
                  { label: 'Understand', sub: 'จับใจความสำคัญ', value: !!(understanding?.trim() && understanding !== 'Notes not added yet.') },
                  { label: 'Connect', sub: 'เชื่อมกับชีวิตจริง', value: !!(keyTakeaways?.trim()) },
                  { label: 'Apply', sub: 'วางแผนใช้ยังไง', value: !!(application?.trim() && application !== 'Application not added yet.') },
                  { label: 'Act', sub: 'action เล็กๆ', value: !!(nextAction?.trim()) },
                ];
                const completedSteps = steps.filter(s => s.value).length;
                const progressPercent = Math.round((completedSteps / steps.length) * 100);

                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                      <span className="text-[11px] font-extrabold text-violet-600">{progressPercent}%</span>
                    </div>
                    {steps.map((step, idx) => {
                      const isCompleted = !!step.value;
                      const canAccess = idx === 0 || steps.slice(0, idx).every(s => s.value);
                      const isActive = canAccess && !isCompleted;
                      const isLast = idx === steps.length - 1;
                      return (
                        <div key={idx} className="flex gap-0">
                          <div className="flex flex-col items-center w-6 shrink-0">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 z-10 ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-400'
                                : isActive
                                ? 'bg-white border-sky-400 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]'
                                : 'bg-white border-gray-200'
                            }`}>
                              {isCompleted
                                ? <Check size={9} className="text-white" strokeWidth={3} />
                                : isActive
                                ? <span className="w-1.5 h-1.5 rounded-full bg-sky-400 block" />
                                : <span className="w-1 h-1 rounded-full bg-gray-300 block" />
                              }
                            </div>
                            {!isLast && (
                              <div
                                className="w-px flex-1 my-0.5 min-h-[22px] transition-colors duration-300"
                                style={{ backgroundColor: isCompleted ? '#a7f3d0' : '#e5e7eb' }}
                              />
                            )}
                          </div>
                          <div className={`pl-2.5 ${isLast ? 'pb-0' : 'pb-2.5'}`}>
                            <span className={`text-[11px] font-bold leading-tight block transition-colors duration-300 ${
                              isCompleted ? 'text-emerald-700' : isActive ? 'text-sky-700' : 'text-gray-300'
                            }`}>
                              {step.label}
                            </span>
                            <span className={`text-[9px] font-semibold block transition-colors duration-300 ${
                              isCompleted ? 'text-emerald-500' : isActive ? 'text-sky-400' : 'text-gray-300'
                            }`}>
                              {isCompleted ? '✓ เสร็จแล้ว' : isActive ? '◉ กำลังทำ' : step.sub}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2.5 mt-1 border-t border-gray-100">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400 transition-all duration-700"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[9px] text-gray-400 font-medium">{completedSteps}/{steps.length} ขั้นตอน</div>
                    </div>
                  </>
                );
              })()}
            </div>


            <div className="space-y-1.5 text-[11px] border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <FileText size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-500">Type</span>
                <span className="ml-auto font-medium text-gray-800">
                  {(() => {
                    const types = { book: 'Book', course: 'Course', video: 'Video', article: 'Article', social: 'Social Post', podcast: 'Podcast', pdf: 'PDF' };
                    return types[card.contentType as keyof typeof types] || 'Content';
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-500">Est. Time</span>
                <span className="ml-auto font-medium text-gray-800">~3h</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-500">Rating</span>
                <span className="ml-auto font-medium text-gray-800">{rating > 0 ? `${rating}/5` : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-500">Review</span>
                <span className="ml-auto font-medium text-gray-800">in {card.reviewDays}d</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-amber-600 mb-1">Rating</div>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <div className="text-[10px] font-semibold text-gray-500 mb-1">My Tags</div>
              <TagSelector selected={userTags} onChange={setUserTags} />
            </div>

            <div className="mt-auto pt-3 border-t border-gray-100">
              <button className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition">
                View in Library <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
        </AnimatePresence>

        {/* ══ PANEL 2: Center Reading ══════════════════════════════════ */}
        <div className={readingMode ? 'flex-1 flex items-center justify-center py-4 px-3 overflow-hidden' : 'relative flex min-w-0 flex-1 flex-col bg-white'}>
        <div className={`${readingMode ? 'relative flex h-full max-h-full w-full max-w-[960px] flex-col overflow-hidden rounded-[30px] border border-violet-100/80 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.08)]' : 'relative flex min-w-0 flex-1 flex-col bg-white'}`}>

          {/* Header bar — only in normal mode */}
          {!readingMode && (
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 min-w-0">
              <BookOpen size={11} className="text-violet-400 shrink-0" />
              <span>Library</span>
              <ChevronRight size={9} className="shrink-0" />
              <span className="truncate max-w-[120px] text-gray-700 font-medium">{card.title}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => setReadingMode(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition border border-gray-200 text-gray-600 hover:bg-gray-100">
                Read Mode
              </button>
              <button className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition">
                <ChevronRight size={11} className="rotate-180 text-gray-500" />
              </button>
              <button className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition">
                <ChevronRight size={11} className="text-gray-500" />
              </button>
              <button onClick={onClose} className="w-6 h-6 rounded-md border border-red-100 bg-red-50 flex items-center justify-center hover:bg-red-100 transition">
                <X size={11} className="text-red-400" />
              </button>
            </div>
          </div>
          )}

          {readingMode && (
          <div className="shrink-0 border-b border-violet-100/70 bg-white/92 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-6 py-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/70 px-3 py-1 text-[11px] font-semibold text-violet-600">
                <BookOpen size={12} />
                Comfort Reading
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReadingMode(false)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-500 shadow-sm transition hover:text-gray-700"
                >
                  Normal Mode
                </button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-400 shadow-sm transition hover:bg-red-100"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>
          )}

          <div className={`flex-1 overflow-y-auto ${readingMode ? 'px-6 py-6 sm:px-8 sm:py-7' : 'px-6 py-5'}`}>
            <div className={`${readingMode ? 'mx-auto w-full max-w-[760px]' : ''}`}>
            {/* Title block — skip for article/social (own title) AND for reading mode types that render their own header */}
            {card.contentType !== 'article' && card.contentType !== 'social' && !(readingMode && (card.contentType === 'book' || card.contentType === 'video' || card.contentType === 'podcast' || card.contentType === 'course' || card.contentType === 'pdf')) && (
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900 leading-snug mb-1">{card.title}</h2>
              {card.provider && card.provider !== 'Unknown' && (
                <p className="text-sm text-gray-400 font-medium">{card.provider}</p>
              )}
            </div>
            )}

            {!isRichTextEmpty(understanding) && !(readingMode && card.contentType === 'book') && (
              <div className="mb-5 p-4 rounded-xl bg-violet-50 border-l-4 border-violet-400">
                <div className="text-violet-300 text-3xl leading-none mb-1 font-serif">"</div>
                <RichTextContent value={understanding} className="text-sm font-medium italic leading-relaxed text-violet-800" />
                <p className="text-xs text-violet-500 mt-2 font-medium">— {card.provider}</p>
              </div>
            )}

            {/* ── Generic Content Display — skip for article/social/book-readingMode (they render their own) ── */}
            {!isRichTextEmpty(content) && card.contentType !== 'article' && card.contentType !== 'social' && !(readingMode && card.contentType === 'book') && (
              <div className="mb-8 pb-6 border-b border-gray-100">
                <RichTextContent
                  value={content}
                  className={`${readingMode ? 'max-w-[800px] text-[18px] leading-[2.0]' : 'max-w-[680px] text-[16px] leading-[1.95]'} mx-auto tracking-[0.003em] font-normal text-gray-800`}
                />
              </div>
            )}

            {/* ── Type-Specific Section ── */}
            {(() => {
              const ct = card.contentType;
              const textareaCls = 'w-full text-xs text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none leading-relaxed min-h-[64px]';
              const sectionCls = 'mb-5 rounded-2xl border overflow-hidden';
              const headerCls = 'px-4 py-2.5 flex items-center gap-2 border-b';
              const iconCls = 'w-6 h-6 rounded-lg flex items-center justify-center shrink-0';

              /* Book — structured reading layout per content-type spec */
              if (ct === 'book' && readingMode) {
                const bookParagraphs = (card.content ?? '')
                  .replace(/\. (?=[0-9]+\. )/g, '.\n\n')
                  .split(/\n\n+/)
                  .filter(Boolean);
                const tocItems = typeNotes
                  .split('\n')
                  .filter(line => /^(chapter|บทที่|ch\.|part)/i.test(line.trim()))
                  .slice(0, 12);
                return (
                  <div className="max-w-[820px] mx-auto">
                    {/* ═══ 1. Content Header (compact) ═══ */}
                    <div className="mb-8 pb-6 border-b border-violet-100">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-wider">
                          <BookOpen size={10} /> Book
                        </span>
                        {card.category && (
                          <span className="text-[11px] text-violet-500 font-semibold">{card.category}</span>
                        )}
                        {card.tags.slice(0, 2).map((t, i) => (
                          <span key={i} className="text-[10px] text-gray-400 font-medium">{t}</span>
                        ))}
                        <span className="text-[10px] text-gray-400 ml-auto">Saved {card.capturedAt}</span>
                      </div>

                      <div className="flex items-start gap-5 mb-5">
                        <label className={`relative w-20 h-28 rounded-xl overflow-hidden shadow-md shrink-0 cursor-pointer group ${!modalImageUrl ? `bg-gradient-to-br ${card.coverGradient}` : ''}`} title="คลิกเพื่อเปลี่ยนรูปปก หรือ Ctrl+V วางรูปได้เลย">
                          <input type="file" accept="image/*" className="sr-only" onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { alert('ไฟล์ต้องไม่เกิน 5MB'); return; }
                            const reader = new FileReader();
                            reader.onload = ev => {
                              const img = document.createElement('img') as HTMLImageElement;
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const scale = Math.min(1, 800 / img.width);
                                canvas.width = Math.round(img.width * scale);
                                canvas.height = Math.round(img.height * scale);
                                canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
                                setModalImageUrl(canvas.toDataURL('image/jpeg', 0.85));
                              };
                              img.src = ev.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }} />
                          {modalImageUrl ? (
                            <img src={modalImageUrl} alt={card.title} className="w-full h-full object-cover" style={{ objectPosition: `center ${card.imageDragOffset ?? 50}%` }} />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <IconGlyph token={card.coverEmoji} size={32} color="rgba(255,255,255,0.95)" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Image size={16} className="text-white" />
                          </div>
                        </label>

                        <div className="flex-1 min-w-0">
                          <h1 className="text-[28px] font-extrabold text-gray-950 leading-[1.15] mb-1.5 tracking-tight">
                            {card.title}
                          </h1>
                          <div className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap">
                            <span className="font-bold text-gray-800">{card.provider === 'Unknown' ? 'Unknown Author' : card.provider}</span>
                            {card.totalPages && (<><span className="text-gray-300">·</span><span>{card.totalPages} pages</span></>)}
                            {card.level && (<><span className="text-gray-300">·</span><span className="text-violet-500 font-semibold">{card.level}</span></>)}
                          </div>

                          {card.totalPages && (
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-gray-500">Page <span className="font-bold text-gray-700">{card.pagesRead ?? 0}</span> of <span className="font-bold text-gray-700">{card.totalPages}</span></span>
                                <span className="font-black text-violet-600 stat-num">{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
                                <div className={`h-full ${card.progressColor} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <details className="group">
                        <summary className="cursor-pointer text-[11px] font-bold text-violet-600 hover:text-violet-700 list-none flex items-center gap-1.5 select-none">
                          <ChevronRight size={12} className="group-open:rotate-90 transition" />
                          Table of Contents
                          {tocItems.length > 0 && <span className="text-violet-400 font-medium">({tocItems.length})</span>}
                        </summary>
                        <div className="mt-3 pl-5 space-y-1.5">
                          {tocItems.length > 0 ? tocItems.map((t, i) => (
                            <div key={i} className="text-[12px] text-gray-600 flex items-center gap-2">
                              <span className="text-violet-300 font-bold w-5 text-right tabular-nums">{i + 1}.</span>
                              <span className="flex-1 leading-relaxed">{t.trim()}</span>
                            </div>
                          )) : (
                            <p className="text-[11px] text-gray-400 italic">ยังไม่มีสารบัญ — เพิ่ม "Chapter 1: ..." ใน Key Ideas ด้านล่างเพื่อสร้างสารบัญอัตโนมัติ</p>
                          )}
                        </div>
                      </details>
                    </div>

                    {/* ═══ 2. Main Content Body ═══ */}
                    <div className="mb-10">
                      {bookParagraphs.length > 0 ? (
                        <div className="space-y-6">
                          {bookParagraphs.map((para, i) => (
                            <p key={i} className="text-[17px] text-gray-800 leading-[1.95] tracking-[0.005em]">{para}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center border border-dashed border-violet-200 rounded-2xl bg-violet-50/30">
                          <BookOpen size={32} className="text-violet-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 font-medium">ยังไม่มีเนื้อหา</p>
                          <p className="text-xs text-gray-400 mt-1">กด Edit เพื่อเพิ่มข้อความ หรือกด "Read Original" เพื่อเปิดต้นฉบับ</p>
                        </div>
                      )}
                    </div>

                    {/* ═══ 3. Reflection & Application ═══ */}
                    <div className="space-y-5 pt-8 border-t-2 border-violet-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="หนังสือเล่มนี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />

                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/30">
                              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                <Calendar size={16} className="text-rose-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[12px] font-black text-rose-700">Review Reminder</div>
                                <div className="text-[11px] text-rose-500 mt-0.5">
                                  {card.nextReviewAt ? `Next review: ${card.nextReviewAt}` : `Review in ${card.reviewDays} days`}
                                  {card.reviewCount != null && card.reviewCount > 0 && ` · reviewed ${card.reviewCount}x`}
                                </div>
                              </div>
                              {card.sourceUrl && (
                                <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold hover:bg-rose-50 transition shrink-0">
                                  <ExternalLink size={11} /> Read Original
                                </a>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              }

              /* PDF/DOC — structured reading layout per content-type spec */
              if (ct === 'pdf' && readingMode) {
                const pdfContentHtml = card.content ?? '';
                const outlineItems = typeNotes
                  .split('\n')
                  .filter(l => /^(section|chapter|part|บทที่|§|\d+\.)/i.test(l.trim()))
                  .slice(0, 15);
                const fileExt = (() => {
                  const url = card.sourceUrl ?? '';
                  if (/\.docx?$/i.test(url)) return 'DOCX';
                  if (/\.pdf$/i.test(url)) return 'PDF';
                  return 'PDF';
                })();
                return (
                  <div className="max-w-[820px] mx-auto">
                    {/* ═══ 1. Content Header (compact, document-style) ═══ */}
                    <div className="mb-6 pb-5 border-b border-violet-100">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-wider">
                          <FileText size={10} /> {fileExt}
                        </span>
                        {card.category && (
                          <span className="text-[11px] text-violet-500 font-semibold">{card.category}</span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">Saved {card.capturedAt}</span>
                      </div>

                      <div className="flex items-start gap-4 mb-4">
                        <div className={`relative w-16 h-20 rounded-xl overflow-hidden shadow-md shrink-0 bg-gradient-to-br ${card.coverGradient} flex items-center justify-center`}>
                          <div className="absolute top-1 right-1 px-1 py-0.5 rounded text-[7px] font-black text-white bg-black/30 backdrop-blur-sm">{fileExt}</div>
                          <FileText size={26} className="text-white/95" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h1 className="text-[24px] font-extrabold text-gray-950 leading-[1.2] mb-1.5 tracking-tight">
                            {card.title}
                          </h1>
                          <div className="flex items-center gap-2 text-[12px] text-gray-500 flex-wrap">
                            <span className="font-bold text-gray-800">{card.provider === 'Unknown' ? 'Unknown Source' : card.provider}</span>
                            {card.totalPages && (<><span className="text-gray-300">·</span><span>{card.totalPages} pages</span></>)}
                            <span className="text-gray-300">·</span>
                            <span className="text-violet-500 font-semibold">{fileExt} document</span>
                          </div>
                        </div>
                      </div>

                      {/* Page navigation + Search */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {card.totalPages && (
                          <div className="inline-flex items-center gap-1 rounded-xl border border-violet-200 bg-white px-2 py-1">
                            <button className="w-6 h-6 rounded-lg hover:bg-violet-50 transition flex items-center justify-center text-violet-500">
                              <ChevronRight size={12} className="rotate-180" />
                            </button>
                            <span className="text-[11px] font-bold text-gray-700 px-2 stat-num">
                              {card.pagesRead ?? 1} / {card.totalPages}
                            </span>
                            <button className="w-6 h-6 rounded-lg hover:bg-violet-50 transition flex items-center justify-center text-violet-500">
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        )}
                        <div className="flex-1 min-w-0 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
                          <Search size={11} className="text-gray-400 shrink-0" />
                          <input placeholder="Search in document..."
                            className="flex-1 min-w-0 text-[12px] focus:outline-none bg-transparent placeholder:text-gray-300" />
                        </div>
                        {card.sourceUrl && (
                          <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-violet-200 text-violet-600 rounded-xl text-[11px] font-bold hover:bg-violet-50 transition shrink-0">
                            <ExternalLink size={11} /> Open File
                          </a>
                        )}
                      </div>

                      {/* Outline */}
                      <details className="mt-4 group">
                        <summary className="cursor-pointer text-[11px] font-bold text-violet-600 hover:text-violet-700 list-none flex items-center gap-1.5 select-none">
                          <ChevronRight size={12} className="group-open:rotate-90 transition" />
                          Outline / Section Index
                          {outlineItems.length > 0 && <span className="text-violet-400 font-medium">({outlineItems.length})</span>}
                        </summary>
                        <div className="mt-3 pl-5 space-y-1.5">
                          {outlineItems.length > 0 ? outlineItems.map((t, i) => (
                            <div key={i} className="text-[12px] text-gray-600 flex items-center gap-2">
                              <span className="text-violet-300 font-bold w-5 text-right tabular-nums">{i + 1}.</span>
                              <span className="flex-1 leading-relaxed">{t.trim()}</span>
                            </div>
                          )) : (
                            <p className="text-[11px] text-gray-400 italic">ยังไม่มี Outline — เพิ่ม "Section 1: ..." ใน Key Sections ด้านล่าง</p>
                          )}
                        </div>
                      </details>
                    </div>

                    {/* ═══ 2. Main Content Body — Embedded Document Viewer ═══ */}
                    <div className="mb-10">
                      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                          <FileText size={11} className="text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Document Preview</span>
                          {card.totalPages && (
                            <span className="text-[10px] text-gray-400 ml-auto">Page {card.pagesRead ?? 1} of {card.totalPages}</span>
                          )}
                        </div>
                        <div className="px-8 py-8 bg-white min-h-[320px]">
                          {!isRichTextEmpty(pdfContentHtml) ? (
                            <RichTextContent value={pdfContentHtml} className="text-[15px] leading-[1.85] font-serif text-gray-800" />
                          ) : (
                            <div className="py-16 text-center">
                              <FileText size={40} className="text-violet-200 mx-auto mb-3" />
                              <p className="text-sm text-gray-500 font-medium">เอกสารเปล่า</p>
                              <p className="text-xs text-gray-400 mt-1">กด "Open File" ด้านบนเพื่อเปิดเอกสารต้นฉบับ</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ═══ 3. Reflection & Application ═══ */}
                    <div className="space-y-5 pt-8 border-t-2 border-violet-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="เอกสารนี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />

                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/30">
                              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                <Calendar size={16} className="text-rose-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[12px] font-black text-rose-700">Review Reminder</div>
                                <div className="text-[11px] text-rose-500 mt-0.5">
                                  {card.nextReviewAt ? `Next review: ${card.nextReviewAt}` : `Review in ${card.reviewDays} days`}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              }

              /* Book (non-reading mode) + PDF */
              if (ct === 'book' || ct === 'pdf') return (
                <div className={`${sectionCls} border-violet-100`}>
                  <div className={`${headerCls} border-violet-100 bg-violet-50`}>
                    <div className={`${iconCls} bg-violet-100`}><BookOpen size={13} className="text-violet-600" /></div>
                    <div>
                      <div className="text-[12px] font-bold text-gray-900">{ct === 'pdf' ? 'Document Notes' : 'Reading Notes'}</div>
                      <div className="text-[10px] text-gray-400">{card.totalPages ? `${card.pagesRead ?? 0} / ${card.totalPages} หน้า` : 'ติดตามความคืบหน้าการอ่าน'}</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Chapter / Section Notes</div>
                      <textarea value={typeNotes} onChange={e => setTypeNotes(e.target.value)}
                        placeholder="บันทึกจากแต่ละบทหรือส่วน..." rows={3}
                        className={`${textareaCls} px-3 py-2 bg-gray-50 rounded-xl border border-gray-100`} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Favorite Quotes</div>
                        <span className="text-[9px] text-violet-400">{quotesList.length} quotes saved</span>
                      </div>
                      <div className="flex gap-1.5 mb-2">
                        <input value={newQuote} onChange={e => setNewQuote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); e.preventDefault(); }}}
                          placeholder='"Paste a memorable quote..."'
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-violet-400 bg-gray-50" />
                        <button onClick={() => { if (newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); }}}
                          className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-xl text-xs font-bold hover:bg-violet-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      {quotesList.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5 p-2.5 bg-violet-50 rounded-xl border border-violet-100">
                          <span className="text-violet-300 text-lg font-serif leading-none mt-0.5">"</span>
                          <p className="flex-1 text-xs text-violet-800 italic leading-relaxed">{q}</p>
                          <button onClick={() => setQuotesList(ql => ql.filter((_, j) => j !== i))}
                            className="shrink-0 text-gray-300 hover:text-rose-400 transition mt-0.5"><X size={11} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );

              /* Course — reading mode (lesson tracker + reflection) */
              if (ct === 'course' && readingMode) {
                const lessonPct = card.totalLessons ? Math.min(100, Math.round(((card.lessonsRead ?? 0) / card.totalLessons) * 100)) : 0;
                const modules = typeNotes.split('\n').filter(l => /^(module|section|lesson|week|unit|\d+[.:])/i.test(l.trim()));
                return (
                  <div className="max-w-[800px] mx-auto">

                    {/* 1. Compact header */}
                    <div className="mb-5 pb-5 border-b border-sky-100">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-wider">
                          <GraduationCap size={10} /> Course
                        </span>
                        {card.tags[0] && <span className="text-[11px] text-sky-500 font-semibold">{card.tags[0].replace('#', '')}</span>}
                        {card.totalLessons && (
                          <span className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-1">
                            <BookOpen size={10} /> {card.totalLessons} lessons
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">Saved {card.capturedAt}</span>
                      </div>
                      <h1 className="text-[26px] font-extrabold text-gray-950 leading-[1.2] tracking-tight mb-3">{card.title}</h1>
                      <div className="flex items-center gap-2">
                        {card.pageIconUrl ? (
                          <img src={card.pageIconUrl} alt="" className="w-8 h-8 rounded-xl object-cover ring-2 ring-white shadow-sm shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shrink-0">
                            <GraduationCap size={16} className="text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 leading-none">{card.provider}</p>
                          <p className="text-[11px] text-gray-400">Platform</p>
                        </div>
                        {card.sourceUrl && (
                          <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-[11px] font-semibold hover:bg-sky-200 transition shrink-0">
                            <ExternalLink size={10} /> Open Course
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 2. Lesson progress */}
                    {card.totalLessons && (
                      <div className="mb-6 p-4 rounded-2xl border border-sky-100 bg-sky-50/40">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap size={13} className="text-sky-500" />
                            <span className="text-[11px] font-black text-sky-700 uppercase tracking-wide">Lesson Progress</span>
                          </div>
                          <span className="text-[11px] font-black text-sky-600 stat-num">{card.lessonsRead ?? 0} / {card.totalLessons} done · {lessonPct}%</span>
                        </div>
                        <div className="h-2.5 bg-sky-100 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all" style={{ width: `${lessonPct}%` }} />
                        </div>
                        {/* Quick lesson counter */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-base font-black text-sky-700 stat-num">{card.lessonsRead ?? 0}</div>
                            <div className="text-[9px] text-sky-500 font-bold uppercase">Done</div>
                          </div>
                          <div className="border-x border-sky-200">
                            <div className="text-base font-black text-sky-700 stat-num">{card.totalLessons - (card.lessonsRead ?? 0)}</div>
                            <div className="text-[9px] text-sky-500 font-bold uppercase">Left</div>
                          </div>
                          <div>
                            <div className="text-base font-black text-sky-700 stat-num">{lessonPct}%</div>
                            <div className="text-[9px] text-sky-500 font-bold uppercase">Complete</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Module / Lesson list (from typeNotes) */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={14} className="text-sky-500" />
                        <span className="text-[11px] font-black text-sky-700 uppercase tracking-widest">Module / Lesson Notes</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mb-3">บันทึกสำหรับแต่ละโมดูลหรือบทเรียน</p>
                      <textarea value={typeNotes} onChange={e => setTypeNotes(e.target.value)}
                        placeholder={"บันทึกสำหรับแต่ละโมดูลหรือบทเรียน...\nModule 1: บทนำ\nModule 2: แนวคิดหลัก\nLesson 3: ฝึกปฏิบัติ"}
                        rows={7}
                        className="w-full text-[13px] text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed border border-sky-100 rounded-2xl p-4 focus:border-sky-300 transition" />
                      {modules.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {modules.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 rounded-xl border border-sky-100">
                              <span className="text-sky-300 font-bold text-[10px] shrink-0">{i + 1}.</span>
                              <span className="text-[12px] text-sky-800 font-medium flex-1 leading-snug">{m.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4. Skills Gained */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Award size={14} className="text-sky-500" />
                        <span className="text-[11px] font-black text-sky-700 uppercase tracking-widest">Skills Gained</span>
                        {quotesList.length > 0 && <span className="text-[10px] text-sky-400 font-bold ml-auto">{quotesList.length}</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 mb-3">ทักษะใหม่ที่ได้เรียนรู้จากคอร์สนี้</p>
                      <div className="flex gap-1.5 mb-3">
                        <input value={newQuote} onChange={e => setNewQuote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); e.preventDefault(); }}}
                          placeholder="e.g. React Hooks, API Design, TypeScript..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-sky-400 bg-gray-50" />
                        <button type="button" onClick={() => { if (newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); }}}
                          className="px-3 py-2 bg-sky-100 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      {quotesList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {quotesList.map((skill, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-full text-[12px] font-semibold hover:bg-sky-100 transition">
                              {skill}
                              <button type="button" onClick={() => setQuotesList(ql => ql.filter((_, j) => j !== i))}
                                className="text-sky-400 hover:text-rose-400 transition"><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 5. Reflection & Application */}
                    <div className="space-y-5 pt-8 border-t-2 border-sky-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="คอร์สนี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />

                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/30">
                              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                <Calendar size={16} className="text-rose-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[12px] font-black text-rose-700">Review Reminder</div>
                                <div className="text-[11px] text-rose-500 mt-0.5">
                                  {card.nextReviewAt ? `Next review: ${card.nextReviewAt}` : `Review in ${card.reviewDays} days`}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              }

              /* Course — non-reading mode (compact card) */
              if (ct === 'course') return (
                <div className={`${sectionCls} border-sky-100`}>
                  <div className={`${headerCls} border-sky-100 bg-sky-50`}>
                    <div className={`${iconCls} bg-sky-100`}><GraduationCap size={13} className="text-sky-600" /></div>
                    <div>
                      <div className="text-[12px] font-bold text-gray-900">Lesson Notes</div>
                      <div className="text-[10px] text-gray-400">{card.totalLessons ? `${card.lessonsRead ?? 0} / ${card.totalLessons} บทเรียน` : 'ติดตามความคืบหน้า'}</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Module / Assignment Notes</div>
                      <textarea value={typeNotes} onChange={e => setTypeNotes(e.target.value)}
                        placeholder="บันทึกสำหรับแต่ละโมดูล งานที่เสร็จ หรือแบบฝึกหัดที่ทำ..." rows={4}
                        className={`${textareaCls} px-3 py-2 bg-gray-50 rounded-xl border border-gray-100`} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Skills Gained</div>
                      <div className="flex gap-1.5 mb-2">
                        <input value={newQuote} onChange={e => setNewQuote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); e.preventDefault(); }}}
                          placeholder="e.g. React Hooks, API design..."
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-sky-400 bg-gray-50" />
                        <button onClick={() => { if (newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); }}}
                          className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {quotesList.map((skill, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-full text-[11px] font-semibold">
                            {skill}
                            <button onClick={() => setQuotesList(ql => ql.filter((_, j) => j !== i))}><X size={9} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );

              /* Video — reading mode (player + timestamps + reflection) */
              if (ct === 'video' && readingMode) {
                const ytMatch = (card.sourceUrl ?? '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
                const ytId = ytMatch ? ytMatch[1] : null;
                const watchPct = card.totalMins ? Math.min(100, Math.round(((card.watchedMins ?? 0) / card.totalMins) * 100)) : 0;
                const chapterLines = typeNotes.split('\n').filter(l => /^(chapter|ch\.|part|section|\d+[.:])/i.test(l.trim()));
                return (
                  <div className="max-w-[800px] mx-auto">

                    {/* 1. Compact header */}
                    <div className="mb-5 pb-5 border-b border-rose-100">
                      {card.totalMins && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-1">
                            <Clock size={10} /> {card.totalMins} min
                          </span>
                          <span className="text-[10px] text-gray-400 ml-auto">Saved {card.capturedAt}</span>
                        </div>
                      )}
                      <h1 className="text-[26px] font-extrabold text-gray-950 leading-[1.2] tracking-tight mb-3">{card.title}</h1>
                      <div className="flex items-center gap-2 mb-2">
                        {card.pageIconUrl ? (
                          <img src={card.pageIconUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-bold">{(card.provider ?? 'V')[0].toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 leading-none">{card.provider}</p>
                          <p className="text-[11px] text-gray-400">{card.capturedAt}</p>
                        </div>
                        {card.sourceUrl && (
                          <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-[11px] font-semibold hover:bg-rose-200 transition shrink-0">
                            <ExternalLink size={10} /> Watch Original
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                          <Video size={10} /> Video
                        </span>
                        {card.tags[0] && <span className="text-[11px] text-rose-500 font-semibold">{card.tags[0].replace('#', '')}</span>}
                      </div>
                    </div>

                    {/* 2. Video player */}
                    <div className="mb-6">
                      {ytId ? (
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-lg" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={card.title}
                          />
                        </div>
                      ) : (
                        <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900" style={{ paddingBottom: '56.25%' }}>
                          {card.imageUrl ? (
                            <img src={card.imageUrl} alt={card.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                              <Video size={48} className="text-gray-600 mb-3" />
                              <p className="text-sm text-gray-500 font-medium">No embed available</p>
                            </div>
                          )}
                          {card.sourceUrl && (
                            <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center group">
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                                <Play size={24} className="text-rose-600 ml-1" fill="currentColor" />
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. Watch Progress */}
                    {card.totalMins && (
                      <div className="mb-6 p-4 rounded-2xl border border-rose-100 bg-rose-50/40">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Play size={12} className="text-rose-500" fill="currentColor" />
                            <span className="text-[11px] font-black text-rose-700 uppercase tracking-wide">Watch Progress</span>
                          </div>
                          <span className="text-[11px] font-black text-rose-600 stat-num">{card.watchedMins ?? 0} / {card.totalMins} min · {watchPct}%</span>
                        </div>
                        <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full transition-all" style={{ width: `${watchPct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* 4. Key Timestamps */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-rose-500" />
                        <span className="text-[11px] font-black text-rose-700 uppercase tracking-widest">Key Timestamps</span>
                        {timestamps.length > 0 && <span className="text-[10px] text-rose-400 font-bold ml-auto">{timestamps.length} notes</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 mb-3">บันทึกเวลาสำคัญและเนื้อหาหลักจากวิดีโอ</p>
                      <div className="flex gap-1.5 mb-3">
                        <input value={newTs} onChange={e => setNewTs(e.target.value)}
                          placeholder="1:30" className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-gray-50 text-center font-mono" />
                        <input value={newTsNote} onChange={e => setNewTsNote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); e.preventDefault(); }}}
                          placeholder="เกิดอะไรขึ้นในช่วงนี้..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-gray-50" />
                        <button type="button" onClick={() => { if (newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); }}}
                          className="px-3 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      {timestamps.length > 0 ? (
                        <div className="space-y-2">
                          {timestamps.map((ts, i) => (
                            <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-rose-100 hover:border-rose-200 transition">
                              <span className="font-mono text-[12px] font-bold text-rose-600 shrink-0 mt-0.5 min-w-[38px]">{ts.t}</span>
                              <span className="text-[13px] text-gray-700 flex-1 leading-relaxed">{ts.note || '—'}</span>
                              <button type="button" onClick={() => setTimestamps(tss => tss.filter((_, j) => j !== i))}
                                className="shrink-0 text-gray-300 hover:text-rose-400 transition"><X size={11} /></button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-gray-400 italic px-1">ยังไม่มี — เพิ่ม Timestamp ของช่วงสำคัญในคลิปนี้</p>
                      )}
                    </div>

                    {/* 5. Transcript / Chapter Notes */}
                    <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlignLeft size={13} className="text-amber-500" />
                        <span className="text-[11px] font-black text-amber-700 uppercase tracking-wide">Transcript / Chapter Notes</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mb-2">เขียนข้อมูลเขียนสำหรับ บทบรรยาย แต่ละบท หรือ สรุปเนื้อหา</p>
                      <textarea value={typeNotes} onChange={e => setTypeNotes(e.target.value)}
                        placeholder={"บทถอดเสียงหรือโครงสร้างแต่ละบท...\nChapter 1: บทนำ\nChapter 2: แนวคิดหลัก"}
                        rows={5}
                        className="w-full text-[13px] text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed" />
                    </div>

                    {/* 6. Reflection & Application */}
                    <div className="space-y-5 pt-8 border-t-2 border-rose-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="วิดีโอนี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />

                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/30">
                              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                <Calendar size={16} className="text-rose-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[12px] font-black text-rose-700">Review Reminder</div>
                                <div className="text-[11px] text-rose-500 mt-0.5">
                                  {card.nextReviewAt ? `Next review: ${card.nextReviewAt}` : `Review in ${card.reviewDays} days`}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              }

              /* Video — non-reading mode (compact card) */
              if (ct === 'video') return (
                <div className={`${sectionCls} border-rose-100`}>
                  <div className={`${headerCls} border-rose-100 bg-rose-50`}>
                    <div className={`${iconCls} bg-rose-100`}><Video size={13} className="text-rose-600" /></div>
                    <div className="flex-1">
                      <div className="text-[12px] font-bold text-gray-900">Video Notes</div>
                      <div className="text-[10px] text-gray-400">{card.totalMins ? `${card.watchedMins ?? 0} / ${card.totalMins} นาทีที่ดู` : 'เพิ่มโน้ต Timestamp'}</div>
                    </div>
                    {card.sourceUrl && (
                      <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-bold hover:bg-rose-200 transition shrink-0">
                        <ExternalLink size={10} /> Open Video
                      </a>
                    )}
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Timestamp Notes</div>
                        <span className="text-[9px] text-rose-400">{timestamps.length} notes</span>
                      </div>
                      <div className="flex gap-1.5 mb-2">
                        <input value={newTs} onChange={e => setNewTs(e.target.value)}
                          placeholder="1:30" className="w-16 px-2 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-gray-50 text-center font-mono" />
                        <input value={newTsNote} onChange={e => setNewTsNote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); e.preventDefault(); }}}
                          placeholder="Note about this moment..."
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-gray-50" />
                        <button onClick={() => { if (newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); }}}
                          className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {timestamps.map((ts, i) => (
                          <div key={i} className="flex items-start gap-2 px-3 py-2 bg-rose-50 rounded-xl border border-rose-100">
                            <span className="font-mono text-[11px] font-bold text-rose-600 shrink-0 mt-0.5">{ts.t}</span>
                            <span className="text-xs text-gray-700 flex-1 leading-relaxed">{ts.note || '—'}</span>
                            <button onClick={() => setTimestamps(tss => tss.filter((_, j) => j !== i))}
                              className="shrink-0 text-gray-300 hover:text-rose-400 transition"><X size={11} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );

              /* Article */
              /* ── Article — Blogger/Medium reader style ── */
              if (ct === 'article') {
                const articleContentHtml = content; // local state — reflects edits before save
                const wordCount = richTextToPlainText(articleContentHtml).split(/\s+/).filter(Boolean).length;
                const readMins = Math.max(1, Math.ceil(wordCount / 200));

                const AuthorBar = ({ large = false }: { large?: boolean }) => (
                  <div className={`flex items-center gap-3 ${large ? 'pb-6 mb-8 border-b border-gray-100' : 'pb-4 mb-5 border-b border-gray-100'}`}>
                    {card.pageIconUrl ? (
                      <img src={card.pageIconUrl} alt={card.provider ?? ''} className={`${large ? 'w-11 h-11' : 'w-9 h-9'} rounded-full object-cover ring-2 ring-white shadow-sm shrink-0`} />
                    ) : (
                      <div className={`${large ? 'w-11 h-11' : 'w-9 h-9'} rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}>
                        <span className={`text-white ${large ? 'text-base' : 'text-sm'} font-bold leading-none`}>{(card.provider ?? 'A')[0].toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`${large ? 'text-[15px]' : 'text-sm'} font-semibold text-gray-900 leading-none mb-0.5`}>{card.provider}</p>
                      <p className="text-[11px] text-gray-400">
                        {card.capturedAt}{wordCount > 0 && <span> · {readMins} min read</span>}
                      </p>
                    </div>
                    {card.sourceUrl && (
                      <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-semibold hover:bg-emerald-50 transition shrink-0">
                        <ExternalLink size={10} /> Read Original
                      </a>
                    )}
                  </div>
                );

                if (readingMode) return (
                  /* ── READING MODE: structured layout per content-type spec ── */
                  <div className="max-w-[760px] mx-auto">
                    {/* ═══ 1. Content Header ═══ */}
                    <div className="mb-6">
                      {/* Meta row */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                          <AlignLeft size={10} /> Article
                        </span>
                        {card.tags[0] && (
                          <span className="text-[11px] text-emerald-500 font-semibold">{card.tags[0].replace('#', '')}</span>
                        )}
                        {wordCount > 0 && (
                          <span className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-1">
                            <Clock size={10} /> {readMins} min read · {wordCount.toLocaleString()} words
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">Saved {card.capturedAt}</span>
                      </div>

                      {/* Title */}
                      <h1 className="text-[32px] font-extrabold text-gray-950 leading-[1.15] tracking-tight mb-4">
                        {card.title}
                      </h1>

                      {/* Author bar with bottom divider */}
                      <AuthorBar />

                      {/* Cover image — full width, blurred bg for portrait/fitted images */}
                      {card.imageUrl && (
                        <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 mt-3" style={{ maxHeight: 320 }}>
                          <img src={card.imageUrl} alt="" aria-hidden="true"
                            className="absolute inset-0 w-full h-full scale-110 object-cover blur-xl opacity-40" />
                          <img src={card.imageUrl} alt={card.title}
                            className={`relative w-full ${fitImage ? 'object-contain' : 'object-cover'} mx-auto`}
                            style={{ maxHeight: 320, objectPosition: `center ${card.imageDragOffset ?? 50}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mb-6" />

                    {/* ═══ 2. Main Content Body ═══ */}
                    <div className="mb-10">
                      {!isRichTextEmpty(articleContentHtml) ? (
                        <div>
                          <RichTextContent value={articleContentHtml} className="text-[17px] leading-[1.95] tracking-[0.003em] text-gray-800" />
                          <div className="mt-4 border border-dashed border-emerald-200 rounded-2xl p-3">
                            <p className="text-[10px] font-bold text-emerald-600 mb-1.5 uppercase tracking-wide">แก้ไข / เพิ่มเนื้อหา</p>
                            <textarea
                              value={content}
                              onChange={e => setContent(e.target.value)}
                              rows={5}
                              placeholder="วางหรือพิมพ์เนื้อหาเพิ่มเติม..."
                              className="w-full text-[14px] text-gray-700 placeholder:text-gray-300 resize-y focus:outline-none leading-relaxed bg-transparent"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-emerald-200 rounded-2xl bg-emerald-50/20 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <AlignLeft size={14} className="text-emerald-400" />
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wide">เนื้อหาบทความ</p>
                            <span className="text-[10px] text-emerald-400 ml-auto">วาง URL หรือ copy ข้อความ</span>
                          </div>
                          <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={8}
                            placeholder="วางเนื้อหาบทความที่นี่... (Ctrl+V)"
                            className="w-full text-[15px] text-gray-700 placeholder:text-emerald-200 resize-y focus:outline-none leading-relaxed bg-transparent"
                          />
                          <p className="text-[10px] text-gray-400 mt-2">กด "Read Original" ด้านบนเพื่อเปิดบทความต้นฉบับในแท็บใหม่</p>
                        </div>
                      )}
                    </div>

                    {/* ═══ 3. Reflection & Application ═══ */}
                    <div className="space-y-5 pt-8 border-t-2 border-emerald-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="บทความนี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />

                            {/* Review reminder */}
                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/30">
                              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                <Calendar size={16} className="text-rose-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[12px] font-black text-rose-700">Review Reminder</div>
                                <div className="text-[11px] text-rose-500 mt-0.5">
                                  {card.nextReviewAt ? `Next review: ${card.nextReviewAt}` : `Review in ${card.reviewDays} days`}
                                  {card.reviewCount != null && card.reviewCount > 0 && ` · reviewed ${card.reviewCount}x`}
                                </div>
                              </div>
                              {card.sourceUrl && (
                                <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-[11px] font-bold hover:bg-emerald-50 transition shrink-0">
                                  <ExternalLink size={11} /> Original
                                </a>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );

                return (
                  /* ── NORMAL MODE: compact layout ── */
                  <div className="space-y-8">
                    <div className="max-w-[640px] mx-auto">
                      {card.tags[0] && (
                        <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.12em] mb-2">
                          {card.tags[0].replace('#', '')}
                        </p>
                      )}
                      <h1 className="text-[26px] font-extrabold text-gray-950 leading-tight tracking-tight mb-4">
                        {card.title}
                      </h1>
                      <AuthorBar />

                      {card.imageUrl && (
                        <div className="-mx-6 mb-6 relative overflow-hidden bg-black/90">
                          {fitImage && (
                            <img src={card.imageUrl} alt="" aria-hidden="true"
                              className="absolute inset-0 w-full h-full scale-110 object-cover blur-xl opacity-55" />
                          )}
                          <img src={card.imageUrl} alt={card.title}
                            className={`relative w-full max-h-64 ${fitImage ? 'object-contain' : 'object-cover'}`}
                            style={{ objectPosition: `center ${card.imageDragOffset ?? 50}%` }} />
                        </div>
                      )}

                      {!isRichTextEmpty(articleContentHtml) ? (
                        <RichTextContent value={articleContentHtml} className="text-[17px] leading-[1.95] tracking-[0.005em] font-normal text-gray-800" />
                      ) : (
                        <div className="py-10 text-center border border-dashed border-gray-200 rounded-2xl">
                          <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 font-medium">ยังไม่มีเนื้อหา</p>
                          <p className="text-xs text-gray-300 mt-1">กด Edit เพื่อเพิ่มข้อความ หรือกด Read Original</p>
                        </div>
                      )}

                      {quotesList.length > 0 && (
                        <div className="mt-6 space-y-2.5 pt-5 border-t border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Highlighted Quotes</p>
                          {quotesList.map((q, i) => (
                            <div key={i} className="flex items-start gap-3 group">
                              <div className="w-0.5 rounded-full bg-emerald-300 self-stretch shrink-0" />
                              <p className="flex-1 text-sm text-gray-600 italic leading-relaxed">{q}</p>
                              <button onClick={() => setQuotesList(ql => ql.filter((_, j) => j !== i))}
                                className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-rose-400 shrink-0 mt-0.5">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-6 max-w-[640px] mx-auto space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="เนื้อหานี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              }

              /* ── Social Post — IG/FB style ── */
              /* Social Post — structured reading layout per content-type spec */
              if (ct === 'social' && readingMode) {
                const platformLabel = (() => {
                  const p = (card.provider ?? '').toLowerCase();
                  if (p.includes('insta') || p.includes('ig')) return { name: 'Instagram', color: 'from-pink-400 via-purple-400 to-orange-400' };
                  if (p.includes('twitter') || p.includes('x.com')) return { name: 'X / Twitter', color: 'from-gray-700 to-gray-900' };
                  if (p.includes('facebook') || p.includes('fb')) return { name: 'Facebook', color: 'from-blue-500 to-blue-600' };
                  if (p.includes('linkedin')) return { name: 'LinkedIn', color: 'from-sky-600 to-sky-700' };
                  if (p.includes('tiktok')) return { name: 'TikTok', color: 'from-rose-500 to-pink-600' };
                  if (p.includes('threads')) return { name: 'Threads', color: 'from-gray-800 to-black' };
                  return { name: card.provider ?? 'Social', color: 'from-orange-400 to-pink-500' };
                })();
                return (
                  <div className="max-w-[720px] mx-auto">
                    {/* ═══ 1. Content Header (compact) ═══ */}
                    <div className="mb-6 pb-5 border-b border-orange-100">
                      {/* AI-generated Title */}
                      <h1 className="text-[24px] font-extrabold text-gray-950 leading-[1.25] tracking-tight mb-4">
                        {card.title}
                      </h1>

                      {/* Creator/platform info */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {card.pageIconUrl ? (
                            <img src={card.pageIconUrl} alt={card.provider ?? ''} className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-100 shadow-sm shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 flex items-center justify-center ring-2 ring-orange-100 shadow-sm shrink-0">
                              <span className="text-white text-lg font-bold">{(card.provider ?? 'P')[0].toUpperCase()}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-gray-900">{card.provider}</p>
                            <p className="text-[12px] text-gray-500">Saved {card.capturedAt}</p>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r ${platformLabel.color} text-white text-[10px] font-black uppercase tracking-wider mt-1.5`}>
                              {platformLabel.name}
                            </span>
                          </div>
                        </div>
                        {card.sourceUrl && (
                          <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 text-orange-600 rounded-full text-[11px] font-bold hover:bg-orange-50 transition shrink-0 whitespace-nowrap">
                            <ExternalLink size={10} /> Open Original
                          </a>
                        )}
                      </div>
                    </div>

                    {/* ═══ 2. Main Content Body — Compact original preview ═══ */}
                    <div className="mb-4">
                      <div className="rounded-2xl border border-orange-100 bg-orange-50/20 overflow-hidden">
                        {card.imageUrl && (
                          <div className="w-full overflow-hidden">
                            <img src={card.imageUrl} alt={card.title}
                              className="w-full h-auto block" />
                          </div>
                        )}
                        {card.tags.length > 0 && (
                          <div className="px-4 py-3.5 flex flex-wrap gap-1.5">
                            {card.tags.map((t, i) => (
                              <span key={i} className="text-[11px] text-sky-500 font-medium">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ═══ 3. Reflection & Application ═══ */}
                    <div className="space-y-5 pt-8 border-t-2 border-orange-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="โพสต์นี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />
                          </>
                        );
                      })()}

                      {/* Review reminder */}
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/30">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                          <Calendar size={16} className="text-rose-500" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-black text-rose-700">Review Reminder</div>
                          <div className="text-[11px] text-rose-500 mt-0.5">
                            {card.nextReviewAt ? `Next review: ${card.nextReviewAt}` : `Review in ${card.reviewDays} days`}
                            {card.reviewCount != null && card.reviewCount > 0 && ` · reviewed ${card.reviewCount}x`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              /* Social Post (non-reading mode) — original IG-style preview */
              if (ct === 'social') return (
                <div className="space-y-4">
                  {/* Post card */}
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm max-w-sm mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-gray-100">
                      {card.pageIconUrl ? (
                        <img src={card.pageIconUrl} alt={card.provider ?? ''} className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-200 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 flex items-center justify-center shrink-0 ring-2 ring-orange-200">
                          <span className="text-white text-sm font-bold">{(card.provider ?? 'P')[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-gray-900 truncate">{card.provider}</div>
                        <div className="text-[10px] text-gray-400">{card.capturedAt}</div>
                      </div>
                      {card.sourceUrl && (
                        <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-blue-500 shrink-0">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {/* Image */}
                    {card.imageUrl ? (
                      <div className="relative w-full bg-black overflow-hidden">
                        {fitImage && (
                          <img src={card.imageUrl} alt="" aria-hidden="true"
                            className="absolute inset-0 w-full h-full scale-110 object-cover blur-xl opacity-55" />
                        )}
                        <img src={card.imageUrl} alt={card.title}
                          className={`relative w-full max-h-80 ${fitImage ? 'object-contain' : 'object-cover'}`}
                          style={{ objectPosition: `center ${card.imageDragOffset ?? 50}%` }} />
                      </div>
                    ) : (
                      <div className={`w-full h-36 bg-gradient-to-br ${card.coverGradient} flex items-center justify-center`}>
                        <IconGlyph token={card.coverEmoji} size={48} color="rgba(255,255,255,0.8)" />
                      </div>
                    )}

                    {/* Action row */}
                    <div className="flex items-center gap-3 px-3.5 pt-3 pb-1">
                      <button className="p-1.5 rounded-full hover:bg-rose-50 transition group">
                        <Heart size={20} className="text-gray-400 group-hover:text-rose-500 transition" />
                      </button>
                      <button className="p-1.5 rounded-full hover:bg-violet-50 transition group">
                        <Bookmark size={20} className="text-gray-400 group-hover:text-violet-500 transition" />
                      </button>
                      {card.sourceUrl && (
                        <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-full hover:bg-sky-50 transition group ml-auto">
                          <ExternalLink size={18} className="text-gray-400 group-hover:text-sky-500 transition" />
                        </a>
                      )}
                    </div>

                    {/* Caption */}
                    <div className="p-5">
                      <span className="font-bold text-[14px] text-gray-900 mr-1.5">{card.provider}</span>
                      {card.extractedPostText ? (
                        <RichTextContent value={card.extractedPostText} className="text-[15px] leading-[1.9] text-gray-800 mt-2" />
                      ) : (
                        <p className="text-[14px] text-gray-500 italic mt-1">{card.title}</p>
                      )}
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {card.tags.map((t, i) => (
                            <span key={i} className="text-[11px] text-orange-500 font-medium">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className={`${sectionCls} border-orange-100`}>
                    <div className={`${headerCls} border-orange-100 bg-orange-50`}>
                      <div className={`${iconCls} bg-orange-100`}><Globe size={13} className="text-orange-600" /></div>
                      <div className="flex-1">
                        <div className="text-[12px] font-bold text-gray-900">Post Capture Notes</div>
                        <div className="text-[10px] text-gray-400">บันทึก insight จากโพสนี้</div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">ทำไมถึงสนใจ Post นี้?</div>
                        <textarea value={typeNotes} onChange={e => setTypeNotes(e.target.value)}
                          placeholder="อะไรใน post นี้ที่ทำให้เราหยุดอ่าน..." rows={2}
                          className={`${textareaCls} px-3 py-2 bg-orange-50/40 rounded-xl border border-orange-100`} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Action ที่จะทำทันที</div>
                        <div className="flex gap-1.5">
                          <input value={newQuote} onChange={e => setNewQuote(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); e.preventDefault(); }}}
                            placeholder="สิ่งที่จะทำหลังอ่าน post นี้..."
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-400 bg-gray-50" />
                          <button onClick={() => { if (newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); }}}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold hover:bg-orange-200 transition">
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="mt-2 space-y-1">
                          {quotesList.map((a, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl border border-orange-100">
                              <CheckCircle2 size={12} className="text-orange-400 shrink-0" />
                              <span className="flex-1 text-xs text-gray-700">{a}</span>
                              <button onClick={() => setQuotesList(ql => ql.filter((_, j) => j !== i))}
                                className="text-gray-300 hover:text-rose-400 transition"><X size={11} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

              /* Podcast — reading mode (audio player + notes + reflection) */
              if (ct === 'podcast' && readingMode) {
                const listenPct = card.totalMins ? Math.min(100, Math.round(((card.watchedMins ?? 0) / card.totalMins) * 100)) : 0;
                return (
                  <div className="max-w-[800px] mx-auto">

                    {/* 1. Episode header */}
                    <div className="mb-5 pb-5 border-b border-teal-100">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black uppercase tracking-wider">
                          <Headphones size={10} /> Podcast
                        </span>
                        {episodeNumber && <span className="text-[11px] text-teal-600 font-black">{episodeNumber}</span>}
                        {guestName && <span className="text-[11px] text-gray-500 font-medium">w/ {guestName}</span>}
                        {card.totalMins && (
                          <span className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-1">
                            <Clock size={10} /> {card.totalMins} min
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">Saved {card.capturedAt}</span>
                      </div>
                      <h1 className="text-[26px] font-extrabold text-gray-950 leading-[1.2] tracking-tight mb-3">{card.title}</h1>

                      {/* Show / host row */}
                      <div className="flex items-center gap-3">
                        {card.pageIconUrl ? (
                          <img src={card.pageIconUrl} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Headphones size={18} className="text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 leading-none">{card.provider}</p>
                          {guestName && <p className="text-[11px] text-teal-600 mt-0.5 font-medium">Guest: {guestName}</p>}
                        </div>
                        {card.sourceUrl && (
                          <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-[11px] font-semibold hover:bg-teal-200 transition shrink-0">
                            <ExternalLink size={10} /> Listen
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 2. Episode/cover art + listening progress */}
                    <div className="mb-6 flex gap-4 items-start">
                      {/* Cover */}
                      <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                            <Headphones size={36} className="text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Listen progress block */}
                      <div className="flex-1">
                        {card.totalMins ? (
                          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/40">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Headphones size={12} className="text-teal-500" />
                                <span className="text-[11px] font-black text-teal-700 uppercase tracking-wide">Listen Progress</span>
                              </div>
                              <span className="text-[11px] font-black text-teal-600 stat-num">{card.watchedMins ?? 0} / {card.totalMins} min · {listenPct}%</span>
                            </div>
                            <div className="h-2 bg-teal-100 rounded-full overflow-hidden mb-3">
                              <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all" style={{ width: `${listenPct}%` }} />
                            </div>
                            {/* Playback speed reference */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-teal-500 font-semibold">Suggested speed:</span>
                              <span className="text-[11px] font-black text-teal-700 stat-num">{playbackSpeed}x</span>
                              <span className="text-[10px] text-teal-400">(set in player)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/40">
                            <p className="text-[12px] text-teal-600 font-medium">Add episode duration to track progress</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Episode details (number + guest) */}
                    <div className="mb-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-teal-100 bg-teal-50/30 p-3">
                        <div className="text-[10px] font-black text-teal-600 uppercase tracking-wide mb-1.5">Episode #</div>
                        <input value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)}
                          placeholder="e.g. EP.142"
                          className="w-full text-[13px] font-bold text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300" />
                      </div>
                      <div className="rounded-xl border border-teal-100 bg-teal-50/30 p-3">
                        <div className="text-[10px] font-black text-teal-600 uppercase tracking-wide mb-1.5">Guest / Host</div>
                        <input value={guestName} onChange={e => setGuestName(e.target.value)}
                          placeholder="Guest name"
                          className="w-full text-[13px] font-bold text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300" />
                      </div>
                    </div>

                    {/* 4. Key Timestamps */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-teal-500" />
                        <span className="text-[11px] font-black text-teal-700 uppercase tracking-widest">Key Timestamps</span>
                        {timestamps.length > 0 && <span className="text-[10px] text-teal-400 font-bold ml-auto">{timestamps.length} notes</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 mb-3">บันทึกเวลาและหัวข้อสำคัญในตอนพอดแคสต์นี้</p>
                      <div className="flex gap-1.5 mb-3">
                        <input value={newTs} onChange={e => setNewTs(e.target.value)}
                          placeholder="5:30" className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 bg-gray-50 text-center font-mono" />
                        <input value={newTsNote} onChange={e => setNewTsNote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); e.preventDefault(); }}}
                          placeholder="ข้อคิดสำคัญในช่วงนี้..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 bg-gray-50" />
                        <button type="button" onClick={() => { if (newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); }}}
                          className="px-3 py-2 bg-teal-100 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      {timestamps.length > 0 ? (
                        <div className="space-y-2">
                          {timestamps.map((ts, i) => (
                            <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-teal-100 hover:border-teal-200 transition">
                              <span className="font-mono text-[12px] font-bold text-teal-600 shrink-0 mt-0.5 min-w-[38px]">{ts.t}</span>
                              <span className="text-[13px] text-gray-700 flex-1 leading-relaxed">{ts.note || '—'}</span>
                              <button type="button" onClick={() => setTimestamps(tss => tss.filter((_, j) => j !== i))}
                                className="shrink-0 text-gray-300 hover:text-rose-400 transition"><X size={11} /></button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-gray-400 italic px-1">ยังไม่มี Timestamp — เพิ่มช่วงสำคัญในตอนนี้</p>
                      )}
                    </div>

                    {/* 5. Show Notes / Transcript */}
                    <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlignLeft size={13} className="text-amber-500" />
                        <span className="text-[11px] font-black text-amber-700 uppercase tracking-wide">Show Notes / Transcript</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mb-2">สรุปเนื้อหา หัวข้อหลัก และบันทึกการสนทนา</p>
                      <textarea value={typeNotes} onChange={e => setTypeNotes(e.target.value)}
                        placeholder={"Show notes สรุปเนื้อหา หัวข้อหลักที่พูดถึง...\n- หัวข้อ 1: ...\n- หัวข้อ 2: ..."}
                        rows={5}
                        className="w-full text-[13px] text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed" />
                    </div>

                    {/* 6. Key Quotes */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Star size={14} className="text-amber-500" />
                        <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Key Quotes</span>
                        {quotesList.length > 0 && <span className="text-[10px] text-amber-400 font-bold ml-auto">{quotesList.length}</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 mb-3">คำพูดน่าจำหรือประโยคสำคัญจากตอนนี้</p>
                      <div className="flex gap-1.5 mb-3">
                        <input value={newQuote} onChange={e => setNewQuote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); e.preventDefault(); }}}
                          placeholder="คำพูดน่าจำจากตอนนี้..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-400 bg-gray-50" />
                        <button type="button" onClick={() => { if (newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); }}}
                          className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      {quotesList.map((q, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3.5 mb-2 bg-amber-50 rounded-xl border border-amber-100">
                          <span className="text-amber-300 text-2xl font-serif leading-none mt-0.5 shrink-0">"</span>
                          <p className="flex-1 text-[13px] text-amber-900 italic leading-relaxed">{q}</p>
                          <button type="button" onClick={() => setQuotesList(ql => ql.filter((_, j) => j !== i))}
                            className="shrink-0 text-gray-300 hover:text-rose-400 transition"><X size={11} /></button>
                        </div>
                      ))}
                    </div>

                    {/* 7. Reflection & Application */}
                    <div className="space-y-5 pt-8 border-t-2 border-teal-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Reflection &amp; Application</p>
                      </div>

                      {(() => {
                        const isStep1Complete = status === 'Reading';
                        const isStep2Complete = typeNotes?.trim();
                        const isStep3Complete = keyTakeaways?.trim();
                        const isStep4Complete = application?.trim() && application !== 'Application not added yet.';

                        return (
                          <>
                            {/* CONTENT DISPLAY — read-only, content was added via Add Learning */}
                            {!isRichTextEmpty(content) ? (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 max-h-[360px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlignLeft size={13} className="text-gray-400" />
                                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Content</span>
                                </div>
                                <RichTextContent value={content} className="text-[15px] leading-[1.9] text-gray-800" />
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/20 p-6 text-center">
                                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-[13px] font-semibold text-gray-400">ยังไม่มีเนื้อหา</p>
                                <p className="text-[11px] text-gray-300 mt-1">กด Edit เพื่อเพิ่มเนื้อหาจาก Add Learning</p>
                              </div>
                            )}

                            <StepBoxes
                              status={status} subjectLabel="ตอนนี้"
                              understanding={understanding} setUnderstanding={setUnderstanding}
                              keyTakeaways={keyTakeaways} setKeyTakeaways={setKeyTakeaways}
                              application={application} setApplication={setApplication}
                              nextAction={nextAction} setNextAction={setNextAction}
                            />

                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/30">
                              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                <Calendar size={16} className="text-rose-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[12px] font-black text-rose-700">Review Reminder</div>
                                <div className="text-[11px] text-rose-500 mt-0.5">
                                  {card.nextReviewAt ? `Next review: ${card.nextReviewAt}` : `Review in ${card.reviewDays} days`}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              }

              /* Podcast — non-reading mode (compact card) */
              if (ct === 'podcast') return (
                <div className={`${sectionCls} border-teal-100`}>
                  <div className={`${headerCls} border-teal-100 bg-teal-50`}>
                    <div className={`${iconCls} bg-teal-100`}><Headphones size={13} className="text-teal-600" /></div>
                    <div>
                      <div className="text-[12px] font-bold text-gray-900">Podcast Notes</div>
                      <div className="text-[10px] text-gray-400">{card.totalMins ? `${card.watchedMins ?? 0} / ${card.totalMins} นาทีที่ฟัง` : 'เพิ่มโน้ตของคุณ'}</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[10px] font-semibold text-gray-500 mb-1">Episode #</div>
                        <input value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)}
                          placeholder="e.g. EP.142"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 bg-gray-50" />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-gray-500 mb-1">Guest / Host</div>
                        <input value={guestName} onChange={e => setGuestName(e.target.value)}
                          placeholder="Guest name"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 bg-gray-50" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Timestamp Notes</div>
                        <span className="text-[9px] text-teal-400">{timestamps.length} notes</span>
                      </div>
                      <div className="flex gap-1.5 mb-2">
                        <input value={newTs} onChange={e => setNewTs(e.target.value)}
                          placeholder="5:30" className="w-16 px-2 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 bg-gray-50 text-center font-mono" />
                        <input value={newTsNote} onChange={e => setNewTsNote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); e.preventDefault(); }}}
                          placeholder="ข้อคิดสำคัญในช่วงนี้..."
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 bg-gray-50" />
                        <button onClick={() => { if (newTs.trim()) { setTimestamps(ts => [...ts, { t: newTs.trim(), note: newTsNote.trim() }]); setNewTs(''); setNewTsNote(''); }}}
                          className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      {timestamps.map((ts, i) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5 px-3 py-2 bg-teal-50 rounded-xl border border-teal-100">
                          <span className="font-mono text-[11px] font-bold text-teal-600 shrink-0 mt-0.5">{ts.t}</span>
                          <span className="text-xs text-gray-700 flex-1 leading-relaxed">{ts.note || '—'}</span>
                          <button onClick={() => setTimestamps(tss => tss.filter((_, j) => j !== i))}
                            className="shrink-0 text-gray-300 hover:text-rose-400 transition"><X size={11} /></button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Key Quotes</div>
                      <div className="flex gap-1.5 mb-2">
                        <input value={newQuote} onChange={e => setNewQuote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); e.preventDefault(); }}}
                          placeholder="Notable quote from the episode..."
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 bg-gray-50" />
                        <button onClick={() => { if (newQuote.trim()) { setQuotesList(q => [...q, newQuote.trim()]); setNewQuote(''); }}}
                          className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-200 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                      {quotesList.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5 p-2.5 bg-teal-50 rounded-xl border border-teal-100">
                          <span className="text-teal-300 text-lg font-serif leading-none mt-0.5">"</span>
                          <p className="flex-1 text-xs text-teal-800 italic leading-relaxed">{q}</p>
                          <button onClick={() => setQuotesList(ql => ql.filter((_, j) => j !== i))}
                            className="shrink-0 text-gray-300 hover:text-rose-400 transition"><X size={11} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );

              return null;
            })()}
            </div>

          </div>

          {/* Bottom bar — reading progress driven by stepper */}
          <div className="shrink-0 px-6 py-2.5 border-t border-gray-100 bg-white flex items-center gap-3">
            <BookOpen size={10} className="text-violet-400 shrink-0" />
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400" style={{ width: `${stepProgressPct}%` }} />
            </div>
            <span className="text-[11px] font-extrabold text-gray-700 font-mono shrink-0">{stepProgressPct}%</span>
          </div>
        </div>
        </div>

        {/* ══ PANEL 3: Right Pomodoro (reading mode only, compact) ══════ */}
        <AnimatePresence initial={false}>
        {showReadingUtilityRail && readingMode && (
        <motion.div
          key="panel3"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1], opacity: { delay: 0.18, duration: 0.28 } }}
          style={{ flexShrink: 0 }}
          className="border-l border-gray-100 bg-white flex flex-col overflow-y-auto overflow-x-hidden"
        >
          {/* ══ VideoRail — shown instead of Pomodoro for video content ══ */}
          {card.contentType === 'video' && (() => {
            const vWatchPct = card.totalMins ? Math.min(100, Math.round(((card.watchedMins ?? 0) / card.totalMins) * 100)) : 0;
            const vChapters = typeNotes.split('\n').filter(l => /^(chapter|ch\.|part|section|\d+[.:])/i.test(l.trim()));
            return (
              <>
                {/* VideoRail Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span>🎬</span>
                    <span className="text-sm font-bold text-gray-900">Video Utility</span>
                  </div>
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">No Pomodoro</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {/* Playback Speed */}
                  <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Play size={10} className="text-rose-500" fill="currentColor" />
                      <span className="text-[10px] font-black text-rose-700 uppercase tracking-wide">Playback Speed</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([0.75, 1, 1.25, 1.5, 2] as const).map(s => (
                        <button key={s} type="button" onClick={() => setPlaybackSpeed(s as typeof playbackSpeed)}
                          className={`py-1.5 rounded-lg text-[10px] font-black transition ${
                            playbackSpeed === s
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-300 hover:text-rose-600'
                          }`}>
                          {s}x
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-[9px] text-rose-400 font-medium">
                      Set video speed manually in player
                    </div>
                  </div>

                  {/* Watch Progress */}
                  {card.totalMins && (
                    <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-orange-500" />
                          <span className="text-[10px] font-black text-orange-700 uppercase tracking-wide">Progress</span>
                        </div>
                        <span className="text-[10px] font-black text-orange-600 stat-num">{vWatchPct}%</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mb-1.5">
                        <span className="font-bold text-gray-700">{card.watchedMins ?? 0}</span> / {card.totalMins} min
                      </div>
                      <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full transition-all" style={{ width: `${vWatchPct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Chapter List */}
                  {vChapters.length > 0 && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-2.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <BookOpen size={11} className="text-amber-500" />
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide">Chapters</span>
                        <span className="text-[9px] text-amber-400 ml-auto font-bold">{vChapters.length}</span>
                      </div>
                      <div className="space-y-1">
                        {vChapters.slice(0, 6).map((ch, i) => (
                          <div key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5 leading-snug">
                            <span className="text-amber-300 font-bold shrink-0">{i + 1}.</span>
                            <span className="flex-1 truncate">{ch.trim()}</span>
                          </div>
                        ))}
                        {vChapters.length > 6 && (
                          <div className="text-[10px] text-amber-400 font-bold">+{vChapters.length - 6} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamp Notes */}
                  {timestamps.length > 0 && (
                    <div className="rounded-xl border border-rose-100 bg-white p-2.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock size={11} className="text-rose-500" />
                        <span className="text-[10px] font-black text-rose-700 uppercase tracking-wide">Timestamps</span>
                        <span className="text-[9px] text-rose-400 ml-auto font-bold">{timestamps.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {timestamps.slice(0, 5).map((ts, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-rose-600 shrink-0 mt-0.5">{ts.t}</span>
                            <span className="text-[11px] text-gray-600 flex-1 leading-snug truncate">{ts.note || '—'}</span>
                          </div>
                        ))}
                        {timestamps.length > 5 && (
                          <div className="text-[10px] text-rose-400 font-bold">+{timestamps.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Watch Status */}
                  <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 size={11} className="text-sky-500" />
                      <span className="text-[10px] font-black text-sky-700 uppercase tracking-wide">Status</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Unread', 'Watching', 'Done'] as const).map(s => {
                        const active = s === 'Unread' ? status === 'Unread' : s === 'Watching' ? status === 'Reading' : status === 'Done';
                        const mapped = s === 'Watching' ? 'Reading' : s;
                        return (
                          <button key={s} type="button" onClick={() => setStatus(mapped as typeof status)}
                            className={`py-1 rounded-lg text-[9px] font-black uppercase tracking-wide transition ${
                              active
                                ? s === 'Done' ? 'bg-emerald-500 text-white shadow-sm'
                                : s === 'Watching' ? 'bg-sky-500 text-white shadow-sm'
                                : 'bg-gray-400 text-white shadow-sm'
                                : 'bg-white text-gray-400 border border-gray-200 hover:text-gray-700'
                            }`}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Review */}
                  <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar size={11} className="text-rose-500" />
                      <span className="text-[10px] font-black text-rose-700 uppercase tracking-wide">Next Review</span>
                    </div>
                    <div className="text-[11px] font-bold text-rose-700 leading-tight">
                      {card.nextReviewAt ? card.nextReviewAt : `in ${card.reviewDays} days`}
                    </div>
                    {card.reviewCount != null && card.reviewCount > 0 && (
                      <div className="text-[9px] text-rose-400 mt-0.5">reviewed {card.reviewCount}x</div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

          {/* ══ PodcastRail — shown instead of Pomodoro for podcast content ══ */}
          {card.contentType === 'podcast' && (() => {
            const pListenPct = card.totalMins ? Math.min(100, Math.round(((card.watchedMins ?? 0) / card.totalMins) * 100)) : 0;
            return (
              <>
                {/* PodcastRail Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span>🎧</span>
                    <span className="text-sm font-bold text-gray-900">Podcast Utility</span>
                  </div>
                  <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">No Pomodoro</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {/* Playback Speed */}
                  <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Headphones size={10} className="text-teal-500" />
                      <span className="text-[10px] font-black text-teal-700 uppercase tracking-wide">Playback Speed</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([0.75, 1, 1.25, 1.5, 2] as const).map(s => (
                        <button key={s} type="button" onClick={() => setPlaybackSpeed(s as typeof playbackSpeed)}
                          className={`py-1.5 rounded-lg text-[10px] font-black transition ${
                            playbackSpeed === s
                              ? 'bg-teal-500 text-white shadow-sm'
                              : 'bg-white text-gray-500 border border-gray-200 hover:border-teal-300 hover:text-teal-600'
                          }`}>
                          {s}x
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-[9px] text-teal-400 font-medium">
                      Set speed in your podcast app
                    </div>
                  </div>

                  {/* Listen Progress */}
                  {card.totalMins && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Progress</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 stat-num">{pListenPct}%</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mb-1.5">
                        <span className="font-bold text-gray-700">{card.watchedMins ?? 0}</span> / {card.totalMins} min
                      </div>
                      <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all" style={{ width: `${pListenPct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Episode Info */}
                  {(episodeNumber || guestName) && (
                    <div className="rounded-xl border border-teal-100 bg-teal-50/30 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Bookmark size={11} className="text-teal-500" />
                        <span className="text-[10px] font-black text-teal-700 uppercase tracking-wide">Episode</span>
                      </div>
                      {episodeNumber && (
                        <div className="text-[11px] font-black text-teal-700">{episodeNumber}</div>
                      )}
                      {guestName && (
                        <div className="text-[10px] text-gray-500 mt-0.5">w/ {guestName}</div>
                      )}
                    </div>
                  )}

                  {/* Quotes count */}
                  {quotesList.length > 0 && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Star size={11} className="text-amber-500" />
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide">Quotes</span>
                      </div>
                      <div className="text-xl font-black text-amber-700 stat-num leading-none">{quotesList.length}</div>
                    </div>
                  )}

                  {/* Timestamp Notes */}
                  {timestamps.length > 0 && (
                    <div className="rounded-xl border border-teal-100 bg-white p-2.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock size={11} className="text-teal-500" />
                        <span className="text-[10px] font-black text-teal-700 uppercase tracking-wide">Timestamps</span>
                        <span className="text-[9px] text-teal-400 ml-auto font-bold">{timestamps.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {timestamps.slice(0, 5).map((ts, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-teal-600 shrink-0 mt-0.5">{ts.t}</span>
                            <span className="text-[11px] text-gray-600 flex-1 leading-snug truncate">{ts.note || '—'}</span>
                          </div>
                        ))}
                        {timestamps.length > 5 && (
                          <div className="text-[10px] text-teal-400 font-bold">+{timestamps.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Listen Status */}
                  <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 size={11} className="text-sky-500" />
                      <span className="text-[10px] font-black text-sky-700 uppercase tracking-wide">Status</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Unread', 'Listening', 'Done'] as const).map(s => {
                        const active = s === 'Unread' ? status === 'Unread' : s === 'Listening' ? status === 'Reading' : status === 'Done';
                        const mapped = s === 'Listening' ? 'Reading' : s;
                        return (
                          <button key={s} type="button" onClick={() => setStatus(mapped as typeof status)}
                            className={`py-1 rounded-lg text-[9px] font-black uppercase tracking-wide transition ${
                              active
                                ? s === 'Done' ? 'bg-emerald-500 text-white shadow-sm'
                                : s === 'Listening' ? 'bg-teal-500 text-white shadow-sm'
                                : 'bg-gray-400 text-white shadow-sm'
                                : 'bg-white text-gray-400 border border-gray-200 hover:text-gray-700'
                            }`}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Review */}
                  <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar size={11} className="text-rose-500" />
                      <span className="text-[10px] font-black text-rose-700 uppercase tracking-wide">Next Review</span>
                    </div>
                    <div className="text-[11px] font-bold text-rose-700 leading-tight">
                      {card.nextReviewAt ? card.nextReviewAt : `in ${card.reviewDays} days`}
                    </div>
                    {card.reviewCount != null && card.reviewCount > 0 && (
                      <div className="text-[9px] text-rose-400 mt-0.5">reviewed {card.reviewCount}x</div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

          {/* ══ Pomodoro Rail — shown for reading types (not video/podcast) ══ */}
          {card.contentType !== 'video' && card.contentType !== 'podcast' && (<>

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span>{timerMode === 'focus' ? '🎯' : timerMode === 'shortBreak' ? '☕' : '🌿'}</span>
              <span className="text-sm font-bold text-gray-900">Pomodoro</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowClockMenu(v => !v)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <Settings size={13} className="text-gray-400" />
              </button>
              {showClockMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-20 w-48">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1.5">Clock Style</div>
                  {([
                    { key: 'ring',      label: '⭕ Ring (Circular)'  },
                    { key: 'minimal',   label: '🔢 Minimal Text'     },
                    { key: 'flip',      label: '📟 Digital Flip'     },
                    { key: 'analog',    label: '🕐 Analog Clock'     },
                    { key: 'bar',       label: '▬ Progress Bar'      },
                    { key: 'breathing', label: '🫧 Breathing Pulse'   },
                    { key: 'hourglass', label: '⏳ Hourglass'         },
                    { key: 'tomato',    label: '🍅 Tomato'            },
                    { key: 'segment',   label: '🥧 Segment Pie'       },
                  ] as const).map(s => (
                    <button key={s.key} onClick={() => { setClockStyle(s.key); setShowClockMenu(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${clockStyle === s.key ? 'bg-violet-100 text-violet-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Apple Music–style Player */}
          {musicType !== 'off' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}
              className="px-3 pt-2 pb-3 border-b border-gray-100"
            >
              <div
                className="relative overflow-hidden rounded-2xl shadow-lg"
                style={{
                  background: customImages.length > 0
                    ? `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('${customImages[selectedCustomImage]?.url}') center/cover no-repeat`
                    : timerMode === 'focus'
                    ? 'linear-gradient(145deg,#f97316 0%,#db2777 45%,#7c3aed 100%)'
                    : timerMode === 'shortBreak'
                    ? 'linear-gradient(145deg,#10b981 0%,#0891b2 55%,#6366f1 100%)'
                    : 'linear-gradient(145deg,#38bdf8 0%,#818cf8 55%,#4f46e5 100%)',
                }}
              >
                {/* Decorative blobs */}
                {customImages.length === 0 && (
                  <>
                    <div className="pointer-events-none absolute -top-10 -left-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-black/15 blur-2xl" />
                  </>
                )}

                <div className="relative z-10 flex flex-col items-center gap-3 px-5 py-5">
                  {/* Spinning album disc */}
                  <motion.div
                    animate={timerActive ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-white/40 bg-white/20 text-[34px] shadow-xl backdrop-blur-sm"
                  >
                    {musicType === 'lofi' ? '🎶' : musicType === 'brown' ? '🌊' : musicType === 'white' ? '☁️' : musicType === 'binaural' ? '🧠' : '🎵'}
                  </motion.div>

                  {/* Track name + subtitle */}
                  <div className="w-full text-center">
                    <div className="truncate text-[15px] font-black leading-tight text-white">{activeSoundLabel}</div>
                    <div className="mt-0.5 text-[11px] font-semibold text-white/60">
                      {timerMode === 'focus' ? '🎯 Focus Session' : timerMode === 'shortBreak' ? '☕ Short Break' : '🌿 Long Rest'}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full space-y-1">
                    <div className="h-[3px] overflow-hidden rounded-full bg-white/25">
                      <motion.div
                        animate={{ width: `${musicType === 'file' && audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : progressFraction * 100}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-white"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-white/50">
                      <span>{musicType === 'file' && audioDuration > 0 ? fmtTime(audioCurrentTime) : fmtTime(currentDuration - remaining)}</span>
                      <span>{musicType === 'file' && audioDuration > 0 ? fmtTime(audioDuration) : fmtTime(currentDuration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-5">
                    <motion.button
                      whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                      onClick={prevTrack}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/28"
                    >
                      <SkipBack size={16} fill="currentColor" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => setTimerActive(!timerActive)}
                      className="flex items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-white/90"
                      style={{ width: 52, height: 52 }}
                    >
                      {timerActive
                        ? <Pause size={20} className="text-gray-800" fill="currentColor" />
                        : <Play  size={20} className="ml-0.5 text-gray-800" fill="currentColor" />}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                      onClick={nextTrack}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/28"
                    >
                      <SkipForward size={16} fill="currentColor" />
                    </motion.button>
                  </div>

                  {/* Offline track list */}
                  {musicType === 'file' && customAudio.length > 0 && (
                    <div className="w-full max-h-[90px] space-y-1 overflow-y-auto">
                      {customAudio.map((t, i) => (
                        <div key={i}
                          className={`w-full rounded-xl px-3 py-1.5 text-left text-[11px] font-semibold transition flex items-center justify-between gap-2 ${
                            i === selectedCustomAudio
                              ? 'bg-white text-gray-800 shadow-sm'
                              : 'bg-white/15 text-white/80 hover:bg-white/25'
                          }`}>
                          <button onClick={() => setSelectedCustomAudio(i)} className="flex-1 truncate text-left">
                            {i === selectedCustomAudio ? '▶ ' : ''}{t.name}
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCustomAudio(prev => prev.filter((_, idx) => idx !== i))}
                            className="flex-shrink-0 p-1 hover:opacity-70 transition"
                            title="Delete track">
                            <span className="text-xs">✕</span>
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload buttons row */}
                  <div className="w-full flex gap-2">
                    <motion.label
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/15 border border-white/25 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-white/25 transition cursor-pointer"
                    >
                      🎵 Add Sound
                      <input type="file" multiple accept="audio/*" className="hidden" onChange={handleFileUpload} />
                    </motion.label>
                    <motion.label
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/15 border border-white/25 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-white/25 transition cursor-pointer"
                    >
                      🖼️ Set BG
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </motion.label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Mode tabs */}
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-xl">
              {([
                { key: 'focus',      label: 'Focus'       },
                { key: 'shortBreak', label: 'Short Break' },
                { key: 'longBreak',  label: 'Long Break'  },
              ] as const).map(m => (
                <motion.button key={m.key} type="button" onClick={() => switchMode(m.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  animate={timerMode === m.key ? { scale: 1 } : { scale: 0.98 }}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                    timerMode === m.key
                      ? m.key === 'focus' ? 'bg-violet-600 text-white shadow-sm'
                      : m.key === 'shortBreak' ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-sky-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {m.label}
                </motion.button>
              ))}
            </div>

            {/* Clock display */}
            <div className="flex justify-center items-center">

              {/* ── Ring ── */}
              {clockStyle === 'ring' && (
                <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
                  <svg className="-rotate-90 absolute inset-0" width="180" height="180" viewBox="0 0 180 180">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const angle = (i * 6) * Math.PI / 180;
                      const isLong = i % 5 === 0; const r1 = isLong ? 76 : 79; const r2 = 84;
                      return <line key={i} x1={90 + r1 * Math.cos(angle)} y1={90 + r1 * Math.sin(angle)} x2={90 + r2 * Math.cos(angle)} y2={90 + r2 * Math.sin(angle)}
                        stroke={timerMode === 'focus' ? '#e9d5ff' : timerMode === 'shortBreak' ? '#a7f3d0' : '#bae6fd'}
                        strokeWidth={isLong ? 2 : 1} strokeLinecap="round" />;
                    })}
                    <circle cx="90" cy="90" r={ringR} fill="none" stroke={timerMode === 'focus' ? '#f3e8ff' : timerMode === 'shortBreak' ? '#d1fae5' : '#e0f2fe'} strokeWidth="7" />
                    <circle cx="90" cy="90" r={ringR} fill="none" stroke="url(#pomGrad2)" strokeWidth="7"
                      strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    <defs>
                      <linearGradient id="pomGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        {timerMode === 'focus'
                          ? <><stop offset="0%" stopColor="#f0abfc"/><stop offset="100%" stopColor="#818cf8"/></>
                          : timerMode === 'shortBreak'
                          ? <><stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="#059669"/></>
                          : <><stop offset="0%" stopColor="#7dd3fc"/><stop offset="100%" stopColor="#0284c7"/></>}
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center z-10 relative">
                    <div className="text-4xl font-black text-gray-900 stat-num tabular-nums leading-none">{fmtTime(remaining)}</div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                        timerMode === 'focus' ? (timerActive ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500')
                        : timerMode === 'shortBreak' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                        {timerMode === 'focus' ? (timerActive ? '🎯 Focus' : '⏸ Ready') : timerMode === 'shortBreak' ? '☕ Break' : '🌿 Rest'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Minimal ── */}
              {clockStyle === 'minimal' && (
                <div className="flex flex-col items-center py-6">
                  <div className="text-6xl font-black text-gray-900 stat-num tabular-nums">{fmtTime(remaining)}</div>
                  <div className="mt-1 text-xs text-gray-400">{Math.round(progressFraction * 100)}% คงเหลือ</div>
                </div>
              )}

              {/* ── Digital Flip ── */}
              {clockStyle === 'flip' && (
                <div className="flex items-center gap-1.5 py-5">
                  {fmtTime(remaining).split('').map((ch, i) =>
                    ch === ':' ? (
                      <span key={i} className={`text-3xl font-black pb-1 ${timerMode === 'focus' ? 'text-violet-500' : timerMode === 'shortBreak' ? 'text-emerald-500' : 'text-sky-500'}`}>:</span>
                    ) : (
                      <div key={i} className="w-10 h-14 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-black text-white stat-num">{ch}</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ── Analog Clock ── */}
              {clockStyle === 'analog' && (() => {
                const elapsed = currentDuration - remaining;
                const secAngle = (elapsed % 60) / 60 * 360 - 90;
                const minAngle = (elapsed / currentDuration) * 360 - 90;
                const toXY = (deg: number, r: number): [number, number] => [90 + r * Math.cos(deg * Math.PI / 180), 90 + r * Math.sin(deg * Math.PI / 180)];
                const [mx, my] = toXY(minAngle, 46);
                const [sx, sy] = toXY(secAngle, 60);
                const fc = timerMode === 'focus' ? '#f5f3ff' : timerMode === 'shortBreak' ? '#ecfdf5' : '#f0f9ff';
                const mc = timerMode === 'focus' ? '#8b5cf6' : timerMode === 'shortBreak' ? '#10b981' : '#0ea5e9';
                const lc = timerMode === 'focus' ? '#c4b5fd' : timerMode === 'shortBreak' ? '#a7f3d0' : '#bae6fd';
                return (
                  <div className="flex justify-center py-1">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="78" fill={fc} stroke={lc} strokeWidth="2"/>
                      {Array.from({length: 60}).map((_, i) => {
                        const a = (i * 6 - 90) * Math.PI / 180;
                        const r1 = i % 5 === 0 ? 65 : 72;
                        return <line key={i} x1={90+r1*Math.cos(a)} y1={90+r1*Math.sin(a)} x2={90+76*Math.cos(a)} y2={90+76*Math.sin(a)} stroke={i%5===0 ? mc : lc} strokeWidth={i%5===0 ? 2 : 1} strokeLinecap="round"/>;
                      })}
                      {([{n:'12',d:-90},{n:'3',d:0},{n:'6',d:90},{n:'9',d:180}] as {n:string,d:number}[]).map(({n,d}) => {
                        const [x,y] = toXY(d, 55);
                        return <text key={n} x={x} y={y+4} textAnchor="middle" fontSize="11" fontWeight="700" fill={mc}>{n}</text>;
                      })}
                      <line x1="90" y1="90" x2={mx} y2={my} stroke={mc} strokeWidth="3.5" strokeLinecap="round"/>
                      <line x1="90" y1="90" x2={sx} y2={sy} stroke="#f0abfc" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="90" cy="90" r="4" fill={mc}/>
                      <text x="90" y="133" textAnchor="middle" fontSize="13" fontWeight="800" fill={mc}>{fmtTime(remaining)}</text>
                    </svg>
                  </div>
                );
              })()}

              {/* ── Progress Bar ── */}
              {clockStyle === 'bar' && (() => {
                const barC = timerMode === 'focus' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : timerMode === 'shortBreak' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-sky-400 to-blue-500';
                const txtC = timerMode === 'focus' ? 'text-violet-600' : timerMode === 'shortBreak' ? 'text-emerald-600' : 'text-sky-600';
                const totalLabel = timerMode === 'focus' ? `${pomodoroMin}:00` : timerMode === 'shortBreak' ? `${shortBreakMin}:00` : `${longBreakMin}:00`;
                return (
                  <div className="w-full py-4 space-y-3">
                    <div className={`text-5xl font-black text-center stat-num tabular-nums ${txtC}`}>{fmtTime(remaining)}</div>
                    <div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${barC}`} style={{width:`${progressFraction*100}%`}}/>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>0:00</span>
                        <span className="font-semibold text-gray-600">{Math.round(progressFraction*100)}% left</span>
                        <span>{totalLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Breathing Pulse ── */}
              {clockStyle === 'breathing' && (() => {
                const c1 = timerMode === 'focus' ? '#8b5cf6' : timerMode === 'shortBreak' ? '#10b981' : '#0ea5e9';
                const c2 = timerMode === 'focus' ? '#ddd6fe' : timerMode === 'shortBreak' ? '#a7f3d0' : '#bae6fd';
                const c3 = timerMode === 'focus' ? '#ede9fe' : timerMode === 'shortBreak' ? '#d1fae5' : '#e0f2fe';
                return (
                  <div className="flex justify-center py-1">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="68" fill={c3} opacity="0.4">
                        {timerActive && <animate attributeName="r" values="56;72;56" dur="4s" repeatCount="indefinite"/>}
                        {timerActive && <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite"/>}
                      </circle>
                      <circle cx="90" cy="90" r="50" fill={c2} opacity="0.6">
                        {timerActive && <animate attributeName="r" values="42;56;42" dur="4s" repeatCount="indefinite"/>}
                      </circle>
                      <circle cx="90" cy="90" r="34" fill={c1}/>
                      <text x="90" y="86" textAnchor="middle" fontSize="15" fontWeight="900" fill="white" fontFamily="monospace">{fmtTime(remaining)}</text>
                      <text x="90" y="101" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.85)">
                        {timerActive ? (timerMode === 'focus' ? 'Breathe & Focus' : 'Relax...') : 'Ready'}
                      </text>
                    </svg>
                  </div>
                );
              })()}

              {/* ── Hourglass ── */}
              {clockStyle === 'hourglass' && (() => {
                const sc = timerMode === 'focus' ? '#a78bfa' : timerMode === 'shortBreak' ? '#34d399' : '#38bdf8';
                const sd = timerMode === 'focus' ? '#7c3aed' : timerMode === 'shortBreak' ? '#059669' : '#0284c7';
                const topH = progressFraction * 64; const botH = (1-progressFraction) * 64;
                return (
                  <div className="flex justify-center py-1">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <polygon points="30,12 150,12 90,88" fill="#f3e8ff" stroke="#c4b5fd" strokeWidth="2" strokeLinejoin="round"/>
                      <clipPath id="hgT"><polygon points="30,12 150,12 90,88"/></clipPath>
                      <rect x="30" y={12+(64-topH)} width="120" height={topH} fill={sc} opacity="0.75" clipPath="url(#hgT)"/>
                      <polygon points="30,168 150,168 90,92" fill="#f3e8ff" stroke="#c4b5fd" strokeWidth="2" strokeLinejoin="round"/>
                      <clipPath id="hgB"><polygon points="30,168 150,168 90,92"/></clipPath>
                      <rect x="30" y={168-botH} width="120" height={botH} fill={sd} opacity="0.75" clipPath="url(#hgB)"/>
                      {timerActive && <circle cx="90" r="2.5" fill={sc}><animate attributeName="cy" values="88;92" dur="0.6s" repeatCount="indefinite"/></circle>}
                      <text x="90" y="93" textAnchor="middle" fontSize="12" fontWeight="800" fill="#4c1d95" fontFamily="monospace">{fmtTime(remaining)}</text>
                    </svg>
                  </div>
                );
              })()}

              {/* ── Tomato ── */}
              {clockStyle === 'tomato' && (() => {
                const fillH = (1-progressFraction) * 88;
                return (
                  <div className="flex justify-center py-1">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <path d="M90 38 C84 22 66 16 70 30 C74 16 90 10 90 38 C90 10 106 16 110 30 C114 16 96 22 90 38Z" fill="#4ade80"/>
                      <line x1="90" y1="38" x2="90" y2="54" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round"/>
                      <ellipse cx="90" cy="112" rx="54" ry="50" fill="#fca5a5"/>
                      <clipPath id="tClip"><ellipse cx="90" cy="112" rx="54" ry="50"/></clipPath>
                      <rect x="36" y={162-fillH} width="108" height={fillH} fill="#ef4444" clipPath="url(#tClip)"/>
                      <ellipse cx="74" cy="92" rx="11" ry="8" fill="rgba(255,255,255,0.3)"/>
                      <text x="90" y="117" textAnchor="middle" fontSize="18" fontWeight="900" fill="white" fontFamily="monospace">{fmtTime(remaining)}</text>
                    </svg>
                  </div>
                );
              })()}

              {/* ── Segment / Pie ── */}
              {clockStyle === 'segment' && (() => {
                const segs = 60; const activeSegs = Math.round(progressFraction * segs);
                const iR = 50; const oR = 72; const cx = 90; const cy = 90;
                const span = 360/segs; const gap = 1.5;
                const toRad = (d: number) => d * Math.PI / 180;
                const fc = timerMode === 'focus' ? '#8b5cf6' : timerMode === 'shortBreak' ? '#10b981' : '#0ea5e9';
                const ec = timerMode === 'focus' ? '#e9d5ff' : timerMode === 'shortBreak' ? '#a7f3d0' : '#bae6fd';
                const tc = timerMode === 'focus' ? '#4c1d95' : timerMode === 'shortBreak' ? '#065f46' : '#0c4a6e';
                return (
                  <div className="flex justify-center py-1">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      {Array.from({length:segs}).map((_,i) => {
                        const s = i*span-90+gap/2; const e = s+span-gap;
                        const x1=cx+oR*Math.cos(toRad(s)); const y1=cy+oR*Math.sin(toRad(s));
                        const x2=cx+oR*Math.cos(toRad(e)); const y2=cy+oR*Math.sin(toRad(e));
                        const x3=cx+iR*Math.cos(toRad(e)); const y3=cy+iR*Math.sin(toRad(e));
                        const x4=cx+iR*Math.cos(toRad(s)); const y4=cy+iR*Math.sin(toRad(s));
                        return <path key={i} d={`M${x1},${y1} A${oR},${oR} 0 0,1 ${x2},${y2} L${x3},${y3} A${iR},${iR} 0 0,0 ${x4},${y4} Z`} fill={i<activeSegs?fc:ec}/>;
                      })}
                      <circle cx={cx} cy={cy} r={iR-5} fill="white"/>
                      <text x={cx} y={cy-4} textAnchor="middle" fontSize="19" fontWeight="900" fill={tc} fontFamily="monospace">{fmtTime(remaining)}</text>
                      <text x={cx} y={cy+12} textAnchor="middle" fontSize="9" fill={fc} fontWeight="600">{Math.round(progressFraction*100)}% left</text>
                    </svg>
                  </div>
                );
              })()}
            </div>

            {/* Session counter */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>Session <strong className="text-gray-800 stat-num">{sessionsDone + 1} / {totalSessions}</strong></span>
              <div className="flex gap-1">
                {Array.from({ length: totalSessions }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition ${i < sessionsDone ? 'bg-violet-600' : i === sessionsDone ? 'bg-violet-400 ring-2 ring-violet-100' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>


            {/* Timer controls */}
            <motion.button type="button" onClick={() => setTimerActive(a => !a)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                timerActive ? 'bg-gray-100 text-gray-700 border border-gray-200'
                : timerMode === 'focus' ? 'bg-violet-600 text-white hover:bg-violet-700'
                : timerMode === 'shortBreak' ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-sky-500 text-white hover:bg-sky-600'
              }`}>
              <motion.span key={timerActive ? 'pause' : 'play'} initial={{ opacity: 0, rotate: -20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 20 }} transition={{ duration: 0.3 }}>
                {timerActive ? '⏸' : '▶'}
              </motion.span>
              {timerActive ? 'Running...' : timerMode === 'focus' ? 'Start Focus' : timerMode === 'shortBreak' ? 'Start Break' : 'Start Rest'}
            </motion.button>
            <div className="grid grid-cols-2 gap-2">
              <motion.button type="button" onClick={() => setTimerActive(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1">
                ⏸ Pause
              </motion.button>
              <motion.button type="button" onClick={() => { setTimerActive(false); setRemaining(currentDuration); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1">
                ↺ Reset
              </motion.button>
            </div>

            {/* ── Type-specific rail blocks (Reading progress · Status · Notes · Next review) ── */}
            {(card.contentType === 'book' || card.contentType === 'article' || card.contentType === 'social' || card.contentType === 'pdf' || card.contentType === 'course') && (
              <div className="space-y-2 pt-3 mt-3 border-t border-gray-100">
                {/* PDF current page progress + search shortcut */}
                {card.contentType === 'pdf' && card.totalPages && (
                  <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <FileText size={11} className="text-violet-500" />
                        <span className="text-[10px] font-black text-violet-700 uppercase tracking-wide">Current Page</span>
                      </div>
                      <span className="text-[10px] font-black text-violet-600 stat-num">{progress}%</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mb-1.5">
                      <span className="font-bold text-gray-700">{card.pagesRead ?? 1}</span> / {card.totalPages}
                    </div>
                    <div className="h-1 bg-violet-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {card.contentType === 'pdf' && (
                  <button type="button" className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-2 flex items-center gap-1.5 hover:bg-gray-50 transition">
                    <Search size={11} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Search in Doc</span>
                    <kbd className="ml-auto text-[8px] font-mono text-gray-400 bg-gray-100 px-1 py-0.5 rounded">⌘F</kbd>
                  </button>
                )}

                {/* Course: Lesson Progress */}
                {card.contentType === 'course' && card.totalLessons && (
                  <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={11} className="text-sky-500" />
                        <span className="text-[10px] font-black text-sky-700 uppercase tracking-wide">Lessons</span>
                      </div>
                      <span className="text-[10px] font-black text-sky-600 stat-num">{progress}%</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mb-1.5">
                      <span className="font-bold text-gray-700">{card.lessonsRead ?? 0}</span> / {card.totalLessons} done
                    </div>
                    <div className="h-1.5 bg-sky-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {/* Course: Skills count */}
                {card.contentType === 'course' && quotesList.length > 0 && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Award size={11} className="text-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wide">Skills</span>
                    </div>
                    <div className="text-xl font-black text-indigo-700 stat-num leading-none">{quotesList.length}</div>
                    <div className="text-[9px] text-indigo-400 font-bold mt-0.5 uppercase">Gained</div>
                  </div>
                )}

                {/* Reading progress — Book uses pages; Article uses scroll/progress */}
                {card.contentType === 'book' && card.totalPages && (
                  <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={11} className="text-violet-500" />
                        <span className="text-[10px] font-black text-violet-700 uppercase tracking-wide">Page Progress</span>
                      </div>
                      <span className="text-[10px] font-black text-violet-600 stat-num">{progress}%</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mb-1.5">
                      <span className="font-bold text-gray-700">{card.pagesRead ?? 0}</span> / {card.totalPages} pages
                    </div>
                    <div className="h-1 bg-violet-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {card.contentType === 'article' && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-3.5">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <AlignLeft size={13} className="text-emerald-600" />
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wide">Reading Progress</span>
                      </div>
                      <span className="text-lg font-black text-emerald-600 stat-num leading-none">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-1.5 text-[10px] text-emerald-600 font-medium">
                      {progress === 0 ? 'ยังไม่เริ่มอ่าน' : progress === 100 ? 'อ่านเสร็จแล้ว ✓' : `อ่านไปแล้ว ${progress}%`}
                    </div>
                  </div>
                )}

                {/* Note count — Book only */}
                {card.contentType === 'book' && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileText size={11} className="text-amber-500" />
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide">Notes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center">
                        <div className="text-base font-black text-amber-700 stat-num leading-none">{quotesList.length}</div>
                        <div className="text-[9px] text-amber-500 font-bold uppercase mt-0.5">Quotes</div>
                      </div>
                      <div className="text-center border-l border-amber-200">
                        <div className="text-base font-black text-amber-700 stat-num leading-none">{typeNotes.split('\n').filter(l => l.trim()).length}</div>
                        <div className="text-[9px] text-amber-500 font-bold uppercase mt-0.5">Lines</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next review — All three types */}
                <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50/60 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={13} className="text-rose-500" />
                    <span className="text-[11px] font-black text-rose-700 uppercase tracking-wide">Next Review</span>
                    {card.reviewCount != null && card.reviewCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold text-rose-400 bg-rose-100 px-2 py-0.5 rounded-full">reviewed {card.reviewCount}x</span>
                    )}
                  </div>
                  <div className="text-[15px] font-black text-rose-700 leading-snug">
                    {card.nextReviewAt ? card.nextReviewAt : `in ${card.reviewDays} days`}
                  </div>
                  <div className="mt-1 text-[10px] text-rose-400 font-medium">
                    {card.nextReviewAt ? 'วันที่กำหนดทบทวน' : 'หลังจากอ่านจบ'}
                  </div>
                </div>
              </div>
            )}
          </div>
          </>)}
        </motion.div>
        )}
        </AnimatePresence>

      </motion.div>
      </motion.div>,
    document.body
  );
}

// ─── Tab: Overall ─────────────────────────────────────────────────────
function OverallTab({ showToast, learningCards, setLearningCards }: {
  showToast: (msg: string) => void;
  learningCards: LearningCard[];
  setLearningCards: React.Dispatch<React.SetStateAction<LearningCard[]>>;
}) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [reviewingCardId, setReviewingCardId] = useState<number | null>(null);
  const [editCardId, setEditCardId] = useState<number | null>(null);
  const selectedCard = selectedCardId !== null ? learningCards.find(c => c.id === selectedCardId) ?? null : null;
  const editCard = editCardId !== null ? learningCards.find(c => c.id === editCardId) ?? null : null;
  const dueCards = learningCards.filter(c => c.nextReviewAt && c.nextReviewAt <= todayStr() && c.capturedAt !== todayStr());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPI.map(k => <KpiCard key={k.label} item={k} />)}
      </div>

      {/* Due for Review Banner — Premium Pastel Design */}
      <AnimatePresence>
      {dueCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-rose-50/70 to-violet-50/80 p-5 shadow-[0_8px_28px_-12px_rgba(251,191,36,0.25)] dark:border-amber-400/15 dark:from-amber-500/[0.08] dark:via-rose-500/[0.06] dark:to-violet-500/[0.08] dark:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.4)]"
        >
          {/* Ambient orbs */}
          <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br from-amber-200/40 to-rose-200/30 blur-3xl dark:from-amber-400/15 dark:to-rose-400/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-gradient-to-br from-violet-200/35 to-sky-200/25 blur-3xl dark:from-violet-400/15 dark:to-sky-400/10" />

          {/* Header */}
          <div className="relative flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-2xl bg-amber-300/40 blur-md"
                />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 shadow-[0_4px_12px_-2px_rgba(251,146,60,0.5)]">
                  <RefreshCw size={16} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-extrabold tracking-tight text-slate-900 dark:text-white">Due for Review Today</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 shadow-sm ring-1 ring-amber-200/70 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/20">
                    <Sparkles size={9} /> {dueCards.length}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                  ปิดโน้ตแล้วเขียนจากความจำก่อนเปิดอ่าน — เพื่อความจำระยะยาว
                </p>
              </div>
            </div>
          </div>

          {/* Card chips — click to expand review panel */}
          <div className="relative flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {dueCards.map((c, idx) => {
              const cs = computeClarityScore(c.clarityQ1, c.clarityQ2, c.clarityBelief);
              const clarityPct = Math.min(100, Math.max(0, cs));
              const circumference = 2 * Math.PI * 14;
              const dashOffset = circumference * (1 - clarityPct / 100);
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  onClick={() => setReviewingCardId(prev => prev === c.id ? null : c.id)}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: 'easeOut', delay: idx * 0.04 }}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="group flex-shrink-0 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5 text-left shadow-[0_4px_14px_-6px_rgba(124,58,237,0.18)] backdrop-blur-sm transition-colors hover:border-violet-200 hover:bg-white hover:shadow-[0_10px_24px_-8px_rgba(124,58,237,0.28)] dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-400/30 dark:hover:bg-white/[0.08]"
                >
                  {/* Cover with clarity ring */}
                  <div className="relative shrink-0">
                    {cs > 0 && (
                      <svg className="absolute inset-0 -rotate-90" width="44" height="44" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-100 dark:text-white/10" />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke="url(#clarityGrad)" strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={circumference} strokeDashoffset={dashOffset}
                          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                        <defs>
                          <linearGradient id="clarityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#f472b6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                    <div className={`relative w-11 h-11 m-[2px] rounded-xl bg-gradient-to-br ${c.coverGradient} flex items-center justify-center shadow-inner`}>
                      <IconGlyph token={c.coverEmoji} size={20} color="rgba(255,255,255,0.95)" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="min-w-0 pr-1">
                    <div className="text-[12px] font-extrabold tracking-tight text-slate-800 dark:text-slate-100 truncate max-w-[160px] group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                      {c.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {cs > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-violet-100 to-fuchsia-100 px-1.5 py-[1px] text-[9px] font-extrabold text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/20 dark:text-violet-200">
                          <BarChart2 size={8} strokeWidth={3}/>{cs}
                        </span>
                      )}
                      {c.reviewCount != null && c.reviewCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                          <RefreshCw size={8} />{c.reviewCount}x
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow hint */}
                  <motion.div
                    className="ml-auto text-violet-400 dark:text-violet-300/70 opacity-0 group-hover:opacity-100"
                    initial={false}
                    animate={{ x: 0 }}
                    whileHover={{ x: 2 }}
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          {/* Quick Review Panel */}
          <AnimatePresence>
            {reviewingCardId !== null && (() => {
              const rc = dueCards.find(c => c.id === reviewingCardId);
              if (!rc) return null;
              const ctBadge = rc.contentType ? CONTENT_TYPES.find(c => c.key === rc.contentType) ?? null : null;
              const CtIcon = ctBadge?.Icon ?? null;
              const hasUnderstanding = rc.understanding && rc.understanding !== 'Notes not added yet.' && richTextToPlainText(rc.understanding).trim();
              const hasApplication = rc.application && rc.application !== 'Application not added yet.' && richTextToPlainText(rc.application ?? '').trim();
              return (
                <motion.div
                  key={reviewingCardId}
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-2xl bg-white/90 border border-white shadow-[0_4px_20px_-8px_rgba(139,92,246,0.2)] backdrop-blur-sm p-4">

                    {/* Panel header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        {rc.pageIconUrl ? (
                          <img src={rc.pageIconUrl} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0" alt={rc.provider} />
                        ) : (
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.coverGradient} flex items-center justify-center shrink-0 shadow-sm`}>
                            <IconGlyph token={rc.coverEmoji} size={18} color="rgba(255,255,255,0.95)" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-[14px] font-bold text-gray-900 leading-tight">{rc.title}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {ctBadge && CtIcon && (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${ctBadge.accentBg} ${ctBadge.accentText}`}>
                                <CtIcon size={9} />{ctBadge.label}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-400">{rc.provider}</span>
                            {rc.reviewCount != null && rc.reviewCount > 0 && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><RefreshCw size={9} />{rc.reviewCount}x reviewed</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setReviewingCardId(null)} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-50">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {/* Notes sections */}
                    <div className="space-y-3 mb-4">
                      {hasUnderstanding ? (
                        <div className="bg-violet-50/60 rounded-xl p-3 border border-violet-100/80">
                          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            สิ่งที่เรียนรู้ / ความเข้าใจ
                          </p>
                          <p className="text-[12.5px] text-gray-700 leading-relaxed whitespace-pre-line">{richTextToPlainText(rc.understanding)}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200">
                          <p className="text-[11px] text-gray-400 italic">ยังไม่ได้เพิ่ม notes — กด Read More เพื่อเพิ่ม</p>
                        </div>
                      )}

                      {hasApplication && (
                        <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100/80">
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            สิ่งที่นำไปใช้
                          </p>
                          <p className="text-[12.5px] text-gray-700 leading-relaxed whitespace-pre-line">{richTextToPlainText(rc.application ?? '')}</p>
                        </div>
                      )}
                    </div>

                    {/* Review action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setLearningCards(prev => prev.map(c => c.id === rc.id ? {
                            ...c,
                            reviewCount: (c.reviewCount ?? 0) + 1,
                            nextReviewAt: addDays(todayStr(), Math.min((c.reviewDays ?? 3) * 2, 30)),
                            reviewDays: Math.min((c.reviewDays ?? 3) * 2, 30),
                          } : c));
                          setReviewingCardId(null);
                          showToast(`"${rc.title}" — เลื่อน review ออกไปแล้ว`);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[12px] font-bold hover:from-violet-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        เข้าใจแล้ว — เลื่อน Review
                      </button>
                      <button
                        onClick={() => {
                          setLearningCards(prev => prev.map(c => c.id === rc.id ? {
                            ...c,
                            reviewCount: (c.reviewCount ?? 0) + 1,
                            nextReviewAt: addDays(todayStr(), 1),
                            reviewDays: 1,
                          } : c));
                          setReviewingCardId(null);
                          showToast(`"${rc.title}" — ตั้ง review ใหม่พรุ่งนี้`);
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-[12px] font-bold hover:bg-rose-100 transition-colors"
                      >
                        <RefreshCw size={12} />
                        ต้องเรียนซ้ำ
                      </button>
                      <button
                        onClick={() => { setSelectedCardId(rc.id); setReviewingCardId(null); }}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-[12px] font-semibold hover:bg-gray-100 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        เปิดอ่าน
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

        </motion.div>
      )}
      </AnimatePresence>

      {/* Learning Card Grid — replaces Today Plan + Active Courses.
          Kept mounted while the detail modal is open (it's a fixed overlay)
          so the page height never collapses and the scroll position can't jump. */}
      <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">My Learning Library</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {learningCards.filter(c => c.status !== 'Done').length} กำลังเรียนอยู่
              {learningCards.filter(c => c.status === 'Done').length > 0 && (
                <span className="ml-2 text-emerald-600 font-medium">
                  · {learningCards.filter(c => c.status === 'Done').length} เรียนจบแล้ว (ดูใน Review &amp; Portfolio)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            <Plus size={13} /> Add Learning
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {learningCards.filter(c => c.status !== 'Done').map(card => (
            <LearningCardItem
              key={card.id}
              card={card}
              onRead={() => setSelectedCardId(card.id)}
              onToggleStage={(id, key) => {
                setLearningCards(prev => prev.map(c => {
                  if (c.id !== id) return c;
                  const cur = c.stages ?? deriveStages(c);
                  const next = { ...cur, [key]: !cur[key] };
                  return { ...c, stages: next, progress: computeProgress(next), status: statusFromStages(next) };
                }));
                showToast('Progress updated');
              }}
              onEdit={(id) => {
                setEditCardId(id);
              }}
              onDelete={(id) => {
                setLearningCards(prev => prev.filter(c => c.id !== id));
                showToast('บัตรเรียนถูกลบแล้ว');
              }}
              onUpdateOffset={(id, offset) => {
                setLearningCards(prev => prev.map(c => c.id === id ? { ...c, imageDragOffset: offset } : c));
                showToast('บันทึกตำแหน่งรูปแล้ว');
              }}
              onUpdatePageIcon={(id, url) => {
                setLearningCards(prev => prev.map(c => c.id === id ? { ...c, pageIconUrl: url } : c));
                showToast('อัปเดต Logo แล้ว ✓');
              }}
            />
          ))}
        </div>
      </div>

      {showAddCard && (
        <AddLearningModal
          onClose={() => setShowAddCard(false)}
          onAdd={(card) => {
            setLearningCards(prev => [...prev, card]);
            showToast('Course card added!');
          }}
        />
      )}

      {editCard && (
        <AddLearningModal
          key={editCard.id}
          initialCard={editCard}
          onClose={() => setEditCardId(null)}
          onAdd={() => {}}
          onUpdate={(updated) => {
            setLearningCards(prev => prev.map(c => c.id === updated.id ? updated : c));
            showToast('บันทึกการแก้ไขแล้ว ✓');
          }}
        />
      )}

      {selectedCard && (
        <CourseDetailModal
          card={selectedCard}
          onClose={() => setSelectedCardId(null)}
          onSave={(id, understanding, application, rating, userTags, content, status, progress, keyTakeaways, nextAction, clarityQ1, clarityQ2, clarityBelief, nextReviewAt, reviewCount, typeNotes, quotesList, timestamps, episodeNumber, guestName, imageUrl) => {
            setLearningCards(prev => prev.map(c => {
              if (c.id !== id) return c;
              const stages: LearnStages = {
                read: status !== 'Unread',
                recap: understanding.trim().length > 0,
                apply: application.trim().length > 0,
                review: status === 'Done',
              };
              return {
                ...c, understanding, application, rating, userTags, content, status,
                stages, progress, keyTakeaways, nextAction,
                clarityQ1, clarityQ2, clarityBelief, nextReviewAt, reviewCount,
                typeNotes, quotesList, timestamps, episodeNumber, guestName,
                imageUrl: imageUrl ?? c.imageUrl,
              };
            }));
            showToast('Learning notes saved!');
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Mastery Progress" subtitle="Monthly average score">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MASTERY_DATA}>
              <defs>
                <linearGradient id="masterG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9ff" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="score" stroke="#7c5cbf" strokeWidth={2.5} fill="url(#masterG)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Most Productive Hours" subtitle="Average focus per hour">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PRODUCTIVE_HOURS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9ff" />
              <XAxis dataKey="h" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="v" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Certificate Status" subtitle="Recent achievements"
          action={<Award size={16} className="text-amber-500" />}>
          <div className="space-y-3">
            {CERTIFICATES.slice(0, 3).map(c => {
              const tone = TONE_BG[c.color as ToneKey];
              return (
                <div key={c.name} className={`flex items-center gap-3 p-2.5 rounded-lg ${tone.bg}`}>
                  <div className={`w-8 h-8 rounded-lg ${tone.bar} flex items-center justify-center`}>
                    <Award size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{c.name}</div>
                    <div className="text-[10px] text-gray-500">{c.issuer} · {c.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Tab: Skill Roadmap ───────────────────────────────────────────────
function SkillRoadmapTab({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Current Skill Level', value: 'Lv. 18',  sub: 'Mastery growing', tone: 'from-violet-400 to-purple-500' },
          { label: 'Hours to Next Level', value: '18.5h',   sub: 'Almost there!',   tone: 'from-emerald-400 to-teal-500' },
          { label: 'Best Skill',          value: 'AI',      sub: '84% mastery',     tone: 'from-sky-400 to-blue-500' },
          { label: 'Weakest Skill',       value: 'Investing', sub: '41% mastery',   tone: 'from-orange-400 to-pink-500' },
          { label: 'Active Projects',     value: '5',       sub: 'In progress',     tone: 'from-rose-400 to-fuchsia-500' },
        ].map((k, i) => (
          <div key={i} className={`vivid-card relative overflow-hidden rounded-[22px] bg-gradient-to-br ${k.tone} min-h-[116px] p-4 text-white transition-all duration-200 hover:-translate-y-1`}>
            <span className="spark-dot" style={{ top: 14, right: 16, width: 7, height: 7 }} />
            <span className="spark-dot" style={{ top: 30, right: 30, width: 4, height: 4, opacity: 0.7 }} />
            <div className="truncate text-[11px] font-bold leading-tight text-white/85">{k.label}</div>
            <div className="stat-num mt-2 text-[24px] font-extrabold leading-none tracking-[-0.035em] text-white drop-shadow-sm">{k.value}</div>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/22 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Skill Roadmap Overview" subtitle="Track each skill journey from foundation to mastery" className="xl:col-span-2"
          action={
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
              <option>All Skills</option><option>Coding</option><option>Languages</option>
            </select>
          }
        >
          <div className="space-y-3">
            {ROADMAP_SKILLS.map(s => {
              const tone = TONE_BG[s.color as ToneKey];
              return (
                <div key={s.name} className={`p-3 rounded-xl ${tone.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{s.name}</div>
                      <div className="text-[11px] text-gray-500">{s.level}</div>
                    </div>
                    <div className={`text-xs font-bold ${tone.text} stat-num`}>{s.progress}%</div>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5">
                    <div className={`${tone.bar} h-1.5 rounded-full transition-all`} style={{ width: `${s.progress}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[11px] text-gray-600 flex items-center gap-1">
                      <Target size={11} /> Next: {s.next}
                    </div>
                    <button onClick={() => showToast(`Continue ${s.name}`)}
                      className={`text-[11px] ${tone.text} font-medium hover:underline`}>
                      Continue →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="React / Web Dev" subtitle="Detail of focused skill">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white mb-3">
            <div className="text-[11px] opacity-90">Focused Skill</div>
            <div className="font-bold text-lg">React / Web Dev</div>
            <div className="text-xs opacity-80 mt-1">3 modules, 9 lessons left</div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Foundation', val: 100 },
              { label: 'Practice',   val: 85  },
              { label: 'Projects',   val: 62  },
              { label: 'Advanced',   val: 28  },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{m.label}</span>
                  <span className="text-gray-500 stat-num">{m.val}%</span>
                </div>
                <div className="w-full bg-emerald-50 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${m.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Continue learning')}
            className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold hover:opacity-90">
            Continue Learning →
          </button>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Skill Mastery Radar" subtitle="Multi-domain proficiency">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={SKILL_RADAR}>
              <PolarGrid stroke="#e9d5ff" />
              <PolarAngleAxis dataKey="skill" fontSize={10} stroke="#64748b" />
              <PolarRadiusAxis stroke="#cbd5e1" fontSize={9} />
              <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Upcoming Milestones" subtitle="Goals to hit this quarter"
          action={<button className="text-xs text-purple-600 font-medium hover:underline">Add Milestone</button>}
        >
          <div className="space-y-2">
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-purple-50/40 hover:bg-purple-50 transition">
                <div className="w-10 text-center">
                  <div className="text-[10px] text-gray-500 uppercase">{m.date.split(' ')[1]}</div>
                  <div className="text-base font-bold text-purple-700 stat-num">{m.date.split(' ')[0]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{m.title}</div>
                  <div className="text-[10px] text-gray-500">{m.tag} · {m.status}</div>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Focus Recommendations" subtitle="Smart suggestions based on your learning patterns">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Improve Investing fundamentals', desc: 'Allocate 30 min/day to compounding strategies', icon: '📊', tone: 'from-orange-100 to-rose-100' },
            { title: 'Maintain English streak',        desc: 'Speaking practice 3x this week',                icon: '🎯', tone: 'from-violet-100 to-purple-100' },
            { title: 'Deep dive into React Hooks',     desc: 'Build 2 small projects to anchor learning',     icon: '⚛️', tone: 'from-emerald-100 to-teal-100' },
          ].map((r, i) => (
            <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${r.tone} border border-white/40`}>
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className="font-semibold text-sm text-gray-800">{r.title}</div>
              <div className="text-xs text-gray-600 mt-1">{r.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Courses ─────────────────────────────────────────────────────
function CoursesTab({ showToast }: { showToast: (msg: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = COURSES_LIST.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-purple-100 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
        </div>
        <select className="px-3 py-2 bg-white border border-purple-100 rounded-xl text-xs">
          <option>All Categories</option><option>Coding</option><option>Language</option>
        </select>
        <button onClick={() => showToast('Open Overall and use Add Learning to capture a resource')}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold flex items-center gap-1 hover:opacity-90">
          <Plus size={13} /> Add Learning
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(c => (
          <div key={c.name} className="rounded-2xl overflow-hidden bg-white border border-purple-100 shadow-sm hover:shadow-md transition">
            <div className={`p-4 bg-gradient-to-br ${c.tone} text-white`}>
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-xs opacity-90">Course</div>
              <div className="font-bold text-base">{c.name}</div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Hours</div>
                  <div className="text-sm font-bold text-gray-800 stat-num">{c.hours}h</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Lessons</div>
                  <div className="text-sm font-bold text-gray-800 stat-num">{c.lessons}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Level</div>
                  <div className="text-sm font-bold text-purple-700">{c.level}</div>
                </div>
              </div>
              <button onClick={() => showToast(`Resume ${c.name}`)}
                className="w-full py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-semibold transition">
                Resume Course
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="English Mastery" subtitle="In Progress" className="xl:col-span-2"
          action={<span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-full">72% Complete</span>}
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PROGRESS_OVER_TIME}>
              <defs>
                <linearGradient id="engG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9ff" />
              <XAxis dataKey="d" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="v" stroke="#7c5cbf" strokeWidth={2.5} fill="url(#engG)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Study Streak" subtitle="Days in a row">
          <div className="text-center py-2">
            <div className="text-5xl">🔥</div>
            <div className="text-4xl font-bold text-orange-500 stat-num mt-1">12</div>
            <div className="text-xs text-gray-500">days</div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {Array(28).fill(null).map((_, i) => (
                <div key={i} className={`h-3 rounded ${i < 24 ? 'bg-orange-300' : 'bg-gray-100'}`} />
              ))}
            </div>
            <div className="text-[11px] text-gray-500 mt-2">28 day view</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Tab: Course Builder ──────────────────────────────────────────────
function CourseBuilderTab({ showToast }: { showToast: (msg: string) => void }) {
  const [courseName, setCourseName] = useState('Mastering Productive Habits');
  const [category, setCategory] = useState('Habits & Discipline');
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Course Information" subtitle="Design and organize your course" className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700">Course Name</label>
              <input value={courseName} onChange={e => setCourseName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
                <option>Habits & Discipline</option><option>Coding</option><option>AI</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Target Audience</label>
              <input defaultValue="Self-improvement learners"
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Estimated Hours</label>
              <input type="number" defaultValue="24"
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-gray-700">Course Description</label>
            <textarea defaultValue="A comprehensive course on building lasting productive habits through behavioral science and progressive systems."
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <button onClick={() => showToast('Course saved!')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90">
              <Save size={13} /> Save Draft
            </button>
            <button onClick={() => showToast('Preview opened')}
              className="px-4 py-2 rounded-xl border-2 border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-50">
              <Eye size={13} /> Preview
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Import Assets" subtitle="Bring in your existing content">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Videos',   icon: Video,        count: 6,  tone: 'from-violet-400 to-purple-500' },
              { label: 'Articles', icon: FileText,     count: 24, tone: 'from-emerald-400 to-teal-500' },
              { label: 'Quizzes',  icon: FileQuestion, count: 18, tone: 'from-sky-400 to-blue-500' },
              { label: 'Modules',  icon: BookOpen,     count: 85, tone: 'from-orange-400 to-pink-500' },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className={`p-3 rounded-xl bg-gradient-to-br ${a.tone} text-white text-center cursor-pointer hover:shadow-md transition`}
                  onClick={() => showToast(`Import ${a.label}`)}>
                  <Icon size={20} className="mx-auto mb-1" />
                  <div className="text-[10px] opacity-90">{a.label}</div>
                  <div className="text-xl font-bold stat-num">{a.count}</div>
                </div>
              );
            })}
          </div>
          <button onClick={() => showToast('File uploaded')}
            className="mt-3 w-full py-2 rounded-xl border-2 border-dashed border-purple-200 text-purple-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-purple-50">
            <Upload size={13} /> Drop or Click to Upload
          </button>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Module Outline Builder" subtitle="Drag to reorder modules" className="xl:col-span-2"
          action={<button onClick={() => showToast('Module added')}
            className="text-xs px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-medium flex items-center gap-1">
            <Plus size={11} /> Add Module
          </button>}
        >
          <div className="space-y-2">
            {MODULES_OUTLINE.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 hover:shadow-sm transition">
                <div className="w-7 h-7 rounded-lg bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-800">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{m.name}</div>
                  <div className="text-[11px] text-gray-500">{m.time} · {m.items} lessons</div>
                </div>
                <button onClick={() => showToast('Editing module')}>
                  <Edit3 size={14} className="text-gray-400 hover:text-purple-600" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Course Structure Preview" subtitle="Final lesson layout">
          <div className="space-y-2">
            {[
              'Foundations of Habits',
              'Designing Your Environment',
              'Cue · Craving · Reward',
              'Goal & Habit Mapping',
              'Time Blocking Systems',
              'Habit Tracking & Review',
            ].map((title, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50/50 transition">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <div className="text-xs text-gray-700 flex-1">{title}</div>
                <CheckCircle2 size={12} className="text-emerald-500" />
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 border border-purple-200">
            <div className="text-[11px] text-purple-700 font-medium uppercase tracking-wider mb-1">Lesson Preview</div>
            <div className="text-sm font-bold text-gray-800">The Habit Loop</div>
            <div className="text-xs text-gray-600 mt-1">Understand the 4 stages that drive lasting habits.</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Tab: Practice Lab ────────────────────────────────────────────────
function PracticeLabTab({ showToast }: { showToast: (msg: string) => void }) {
  const [code, setCode] = useState(`function Mountain() {
  return (
    <div className="mountain">
      <h1>Explore the Mountains</h1>
      <p>Beautiful scenery awaits.</p>
    </div>
  );
}`);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PRACTICE_CARDS.map((p, i) => (
          <div key={i} className={`rounded-2xl p-4 bg-gradient-to-br ${p.tone} text-white shadow-sm hover:shadow-md transition cursor-pointer`}
            onClick={() => showToast(`Start ${p.name}`)}>
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="text-[11px] opacity-90">{p.name}</div>
            <div className="text-3xl font-bold stat-num mt-1">{p.score}%</div>
            <div className="mt-2 w-full bg-white/30 rounded-full h-1">
              <div className="bg-white h-1 rounded-full" style={{ width: `${p.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Task Prompt" subtitle="Build a reusable React Component">
          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">Requirements</div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex gap-1.5"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5" /> Component reusable across pages</li>
                <li className="flex gap-1.5"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5" /> Props validation with TypeScript</li>
                <li className="flex gap-1.5"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5" /> Responsive with Tailwind</li>
                <li className="flex gap-1.5"><Circle size={12} className="text-gray-300 mt-0.5" /> Add accessibility labels</li>
                <li className="flex gap-1.5"><Circle size={12} className="text-gray-300 mt-0.5" /> Write unit tests</li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">Acceptance Criteria</div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>· Renders heading + image</li>
                <li>· Accepts custom className</li>
                <li>· Lazy loads image asset</li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Code Workspace" subtitle="Try and submit your solution">
          <textarea
            value={code} onChange={e => setCode(e.target.value)}
            className="w-full bg-[#1e1b3a] rounded-xl p-3 font-mono text-xs text-purple-100 focus:outline-none"
            style={{ minHeight: 220 }}
          />
          <div className="mt-3 flex gap-2">
            <button onClick={() => showToast('Code executed!')}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90">
              <Play size={12} /> Run Code
            </button>
            <button onClick={() => showToast('Solution submitted')}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90">
              <Save size={12} /> Submit
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Live Preview" subtitle="Output of your code">
          <div className="rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 p-6 text-center" style={{ minHeight: 220 }}>
            <div className="text-4xl mb-2">⛰️</div>
            <div className="font-bold text-base text-gray-800">Explore the Mountains</div>
            <div className="text-xs text-gray-600 mt-1">Beautiful scenery awaits.</div>
            <button onClick={() => showToast('Learn More')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-white text-sky-600 text-xs font-semibold hover:shadow-sm">
              Learn More
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Performance Overview" subtitle="Your improvement curve">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MASTERY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9ff" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Recent Sessions" subtitle="Last 5 practice runs">
          <div className="space-y-2">
            {[
              { name: 'React Hooks Drill',   time: '2h ago', score: 92 },
              { name: 'TypeScript Generics', time: '1d ago', score: 78 },
              { name: 'Algorithm Sorting',   time: '2d ago', score: 85 },
              { name: 'CSS Grid Layout',     time: '3d ago', score: 88 },
              { name: 'API Integration',     time: '5d ago', score: 70 },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Code2 size={13} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{s.name}</div>
                  <div className="text-[10px] text-gray-500">{s.time}</div>
                </div>
                <div className={`text-sm font-bold stat-num ${s.score >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{s.score}%</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Tab: Resource Inbox ──────────────────────────────────────────────
function ResourceInboxTab({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {RESOURCES.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className={`rounded-2xl p-4 bg-gradient-to-br ${r.tone} text-white shadow-sm hover:shadow-md transition cursor-pointer`}
              onClick={() => showToast(`View ${r.type}`)}>
              <Icon size={20} className="mb-2" />
              <div className="text-[11px] opacity-90">{r.type}</div>
              <div className="text-3xl font-bold stat-num">{r.count}</div>
              <div className="text-[10px] opacity-80 mt-1">Saved items</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Saved Resources" subtitle="Everything you've bookmarked" className="xl:col-span-2"
          action={
            <div className="flex gap-2">
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                <option>All Categories</option>
              </select>
              <button onClick={() => showToast('Add resource')}
                className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                <Plus size={11} /> Add
              </button>
            </div>
          }
        >
          <div className="space-y-2">
            {SAVED_RESOURCES.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-200 to-violet-200 flex items-center justify-center flex-shrink-0">
                  <Bookmark size={14} className="text-purple-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{r.title}</div>
                  <div className="text-[11px] text-gray-500">{r.tag} · saved {r.date}</div>
                </div>
                <button onClick={() => showToast('Resource opened')}>
                  <ChevronRight size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Showing more')}
            className="mt-3 w-full py-2 rounded-xl border-2 border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50">
            Load More
          </button>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Most Saved Topics" subtitle="What you reference most">
            <div className="space-y-2.5">
              {[
                { name: 'Productivity',     pct: 84, tone: 'purple' as const },
                { name: 'Cognitive Biases', pct: 72, tone: 'emerald' as const },
                { name: 'Coding Patterns',  pct: 65, tone: 'sky' as const },
                { name: 'Mental Models',    pct: 58, tone: 'orange' as const },
              ].map(t => {
                const tone = TONE_BG[t.tone];
                return (
                  <div key={t.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700">{t.name}</span>
                      <span className={`font-semibold stat-num ${tone.text}`}>{t.pct}%</span>
                    </div>
                    <div className={`w-full ${tone.bg} rounded-full h-1.5`}>
                      <div className={`${tone.bar} h-1.5 rounded-full`} style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Pending Summaries" subtitle="To-do briefs">
            <div className="text-center py-3">
              <div className="relative inline-flex">
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="38" stroke="#ede9ff" strokeWidth="8" fill="none" />
                  <circle cx="45" cy="45" r="38" stroke="#a78bfa" strokeWidth="8" fill="none"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - 0.7)}
                    strokeLinecap="round" transform="rotate(-90 45 45)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold stat-num text-purple-700">14</div>
                  <div className="text-[10px] text-gray-500">pending</div>
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-2 text-[10px]">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">8 Done</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">3 Today</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Learning Platforms" subtitle="แหล่งเรียนรู้ที่ใช้อยู่">
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'YouTube',  Icon: Youtube,  count: '24 saved', color: '#FF0000' },
                { name: 'GitHub',   Icon: Github,   count: '18 repos',  color: '#181717' },
                { name: 'Discord',  Icon: Discord,  count: '5 servers', color: '#5865F2' },
                { name: 'Notion',   Icon: Notion,   count: '12 pages',  color: '#000000' },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0">
                    <p.Icon style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-gray-700">{p.name}</div>
                    <div className="text-[9px] text-gray-400">{p.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Schedule Planner ────────────────────────────────────────────
function SchedulePlannerTab({ showToast }: { showToast: (msg: string) => void }) {
  const days = ['Mon 18', 'Tue 19', 'Wed 20', 'Thu 21', 'Fri 22', 'Sat 23', 'Sun 24'];
  const blocks = [
    { day: 0, top: '12%', height: '15%', label: 'Work Shift',     tone: 'from-purple-300 to-purple-400'    },
    { day: 0, top: '50%', height: '12%', label: 'Light Study',    tone: 'from-emerald-200 to-emerald-300'  },
    { day: 1, top: '15%', height: '20%', label: 'React Lesson',   tone: 'from-sky-300 to-blue-400'         },
    { day: 1, top: '55%', height: '15%', label: 'AI Project',     tone: 'from-rose-300 to-pink-400'        },
    { day: 2, top: '10%', height: '10%', label: 'Morning Review', tone: 'from-amber-200 to-orange-300'     },
    { day: 2, top: '40%', height: '18%', label: 'English Speak',  tone: 'from-violet-300 to-purple-400'    },
    { day: 3, top: '20%', height: '14%', label: 'Practice Lab',   tone: 'from-emerald-300 to-teal-400'     },
    { day: 3, top: '60%', height: '12%', label: 'Reading',        tone: 'from-orange-200 to-pink-300'      },
    { day: 4, top: '25%', height: '20%', label: 'Investing 101',  tone: 'from-rose-300 to-fuchsia-400'     },
    { day: 5, top: '35%', height: '25%', label: 'Deep Work',      tone: 'from-purple-300 to-indigo-400'    },
    { day: 6, top: '45%', height: '10%', label: 'Review Notes',   tone: 'from-sky-200 to-cyan-300'         },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-xs">‹</button>
          <div className="text-base font-bold text-gray-900">May 2026</div>
          <button className="px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-xs">›</button>
          <button onClick={() => showToast('Jump to today')}
            className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium">Today</button>
        </div>
        <div className="flex items-center gap-2">
          {['Day', 'Week', 'Month'].map((v, i) => (
            <button key={v} onClick={() => showToast(`${v} view`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i === 1 ? 'bg-purple-500 text-white' : 'bg-white border border-purple-100 text-gray-600'}`}>
              {v}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-xs flex items-center gap-1">
            <Filter size={11} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <SectionCard title="Weekly Schedule" subtitle="Drag blocks to adjust" className="xl:col-span-3">
          <div className="grid grid-cols-7 gap-1 mt-2">
            {days.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-600 pb-2 border-b border-gray-100">
                {d}
              </div>
            ))}
            {Array(7).fill(null).map((_, dayIdx) => (
              <div key={dayIdx} className="relative h-[420px] border-r border-gray-50">
                {Array(12).fill(null).map((_, hourIdx) => (
                  <div key={hourIdx} className="h-[35px] border-b border-gray-50 text-[9px] text-gray-300 pl-1">
                    {6 + hourIdx}:00
                  </div>
                ))}
                {blocks.filter(b => b.day === dayIdx).map((b, i) => (
                  <div key={i}
                    className={`absolute inset-x-1 rounded-lg bg-gradient-to-br ${b.tone} p-1.5 text-[10px] text-white font-medium shadow-sm cursor-pointer hover:shadow-md transition`}
                    style={{ top: b.top, height: b.height }}
                    onClick={() => showToast(`Edit ${b.label}`)}>
                    {b.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Schedule Logic" subtitle="Smart rules">
          <div className="space-y-3">
            {[
              { icon: Coffee,    text: 'Morning study blocks pre-shift' },
              { icon: Brain,     text: 'High-focus tasks during peak hours' },
              { icon: Zap,       text: 'Light tasks post-work to maintain streak' },
              { icon: Sparkles,  text: 'Auto break every 50 min' },
            ].map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-purple-700" />
                  </div>
                  <div className="text-gray-700 leading-snug">{r.text}</div>
                </div>
              );
            })}
          </div>
          <button onClick={() => showToast('Schedule auto-set')}
            className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold hover:opacity-90">
            Auto-Schedule Week
          </button>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { label: 'Planned Study Hours', value: '16.5h', sub: '+2h vs last week', tone: 'from-violet-400 to-purple-500' },
          { label: 'Completion Rate',     value: '92%',   sub: 'Excellent!',       tone: 'from-emerald-400 to-teal-500' },
          { label: 'Missed Sessions',     value: '2',     sub: 'Rescheduled',      tone: 'from-orange-400 to-pink-500' },
          { label: 'Auto Focus Score',    value: '88',    sub: '/100',             tone: 'from-sky-400 to-blue-500' },
        ].map((k, i) => (
          <div key={i} className={`vivid-card relative overflow-hidden rounded-[22px] bg-gradient-to-br ${k.tone} min-h-[116px] p-4 text-white transition-all duration-200 hover:-translate-y-1`}>
            <span className="spark-dot" style={{ top: 8, right: 10, width: 3.5, height: 3.5 }} />
            <div className="text-[10px] font-bold text-white/85 uppercase tracking-wider leading-tight">{k.label}</div>
            <div className="text-xl font-extrabold text-white stat-num mt-1 leading-tight drop-shadow-sm">{k.value}</div>
            <div className="text-[10px] font-medium text-white/85 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Energy Forecast" subtitle="Plan around your peak performance windows">
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={[
            { h: '6a', v: 30 }, { h: '8a', v: 72 }, { h: '10a', v: 88 },
            { h: '12p', v: 65 }, { h: '2p', v: 78 }, { h: '4p', v: 82 },
            { h: '6p', v: 55 }, { h: '8p', v: 35 }, { h: '10p', v: 18 },
          ]}>
            <defs>
              <linearGradient id="enG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e9ff" />
            <XAxis dataKey="h" stroke="#94a3b8" fontSize={10} />
            <YAxis stroke="#94a3b8" fontSize={10} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2.5} fill="url(#enG)" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Exams & Certificates ────────────────────────────────────────
function ExamsCertificatesTab({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Exam Readiness',      value: '87%', sub: 'Average across all', tone: 'from-violet-400 to-purple-500', icon: Trophy },
          { label: 'Pass Rate',           value: '92%', sub: '11 of 12 passed',    tone: 'from-emerald-400 to-teal-500',  icon: CheckCircle2 },
          { label: 'Upcoming Exams',      value: '3',   sub: 'Next: 22 May',       tone: 'from-orange-400 to-rose-500',   icon: Calendar },
          { label: 'Certificates Earned', value: '12',  sub: '4 this quarter',     tone: 'from-sky-400 to-blue-500',      icon: Award },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className={`vivid-card relative overflow-hidden rounded-[22px] bg-gradient-to-br ${k.tone} min-h-[116px] p-4 text-white transition-all duration-200 hover:-translate-y-1`}>
              <span className="spark-dot" style={{ top: 14, right: 16, width: 7, height: 7 }} />
              <span className="spark-dot" style={{ top: 30, right: 30, width: 4, height: 4, opacity: 0.7 }} />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-bold leading-tight text-white/85">{k.label}</div>
                  <div className="stat-num mt-2 text-[24px] font-extrabold leading-none tracking-[-0.035em] text-white drop-shadow-sm">{k.value}</div>
                  <div className="mt-1.5 inline-flex items-center rounded-full bg-white/22 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">{k.sub}</div>
                </div>
                <div className="icon-frost flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
                  <Icon size={16} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Assessment List" subtitle="Track your upcoming and past exams" className="xl:col-span-2"
          action={
            <div className="flex gap-2">
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                <option>All Status</option>
              </select>
              <button onClick={() => showToast('Add new exam')}
                className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                <Plus size={11} /> Add
              </button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="text-left py-2">Exam</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Level</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {EXAMS.map((e, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-purple-50/30 transition">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {e.SvgIcon && <e.SvgIcon style={{ width: 16, height: 16 }} />}
                        <span className="font-semibold text-gray-800">{e.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{e.date}</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px]">{e.level}</span></td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        e.status === 'Upcoming' ? 'bg-orange-100 text-orange-700' :
                        e.status === 'Studying' ? 'bg-sky-100 text-sky-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{e.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => showToast(`Open ${e.name}`)}
                        className="text-purple-600 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Certificates Earned" subtitle="Your achievements">
          <div className="space-y-3">
            {CERTIFICATES.map(c => {
              const tone = TONE_BG[c.color as ToneKey];
              return (
                <div key={c.name} className={`p-3 rounded-xl ${tone.bg} border border-white relative overflow-hidden`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${tone.bar} flex items-center justify-center flex-shrink-0`}>
                      <Award size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800 truncate">{c.name}</div>
                      <div className="text-[11px] text-gray-500">{c.issuer}</div>
                      <div className={`text-[10px] ${tone.text} font-medium mt-0.5`}>Earned {c.date}</div>
                    </div>
                    <button onClick={() => showToast(`Download ${c.name}`)}>
                      <Download size={14} className={tone.text} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="How to Unlock Certificate" subtitle="Steps to earn your next credential">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { step: '01', title: 'Complete Course Modules', desc: 'Finish all required lessons and quizzes',            tone: 'from-violet-100 to-purple-100' },
            { step: '02', title: 'Pass Final Assessment',   desc: 'Score 80% or higher on the cumulative test',         tone: 'from-emerald-100 to-teal-100' },
            { step: '03', title: 'Project Submission',     desc: 'Submit a capstone project demonstrating mastery',     tone: 'from-orange-100 to-pink-100' },
          ].map((s, i) => (
            <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${s.tone} border border-white/50`}>
              <div className="text-3xl font-bold text-purple-700 stat-num opacity-50">{s.step}</div>
              <div className="font-bold text-sm text-gray-800 mt-1">{s.title}</div>
              <div className="text-xs text-gray-600 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Review & Portfolio ──────────────────────────────────────────
function ArchiveCard({ card }: { card: LearningCard }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-purple-100/60 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-4">

        {/* ── Row 1: Thumbnail + Title + Provider ── */}
        <div className="flex gap-3">
          {/* Square thumbnail */}
          <div className={`relative w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden shadow-sm ${!card.imageUrl ? `bg-gradient-to-br ${card.coverGradient}` : 'bg-gray-100'}`}>
            {card.imageUrl
              ? <img src={card.imageUrl} alt={card.title} className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: `center ${card.imageDragOffset ?? 50}%` }} />
              : <div className="absolute inset-0 flex items-center justify-center"><IconGlyph token={card.coverEmoji} size={22} color="rgba(255,255,255,0.9)" /></div>
            }
          </div>

          {/* Title + Provider */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2">{card.title}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-4 h-4 rounded text-[8px] font-bold text-white flex items-center justify-center shrink-0 ${card.providerColor}`}>
                {card.providerInitial}
              </div>
              <span className="text-[11px] text-gray-500 truncate">{card.provider}</span>
              {card.role && <span className="text-[10px] text-gray-400 truncate">· {card.role}</span>}
            </div>
          </div>

          {/* Expand button */}
          <button onClick={() => setExpanded(e => !e)}
            className="shrink-0 p-1.5 hover:bg-purple-50 rounded-lg transition self-start">
            <ChevronRight size={14} className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* ── Row 2: Key Insight (what this content is about) ── */}
        {!isRichTextEmpty(card.understanding) && card.understanding !== 'Notes not added yet.' && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-violet-50/70 border border-violet-100/70">
            <div className="flex items-start gap-1.5">
              <Lightbulb size={11} className="text-violet-500 mt-0.5 shrink-0" />
              <p className={`text-[11px] text-gray-700 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                {richTextToPlainText(card.understanding)}
              </p>
            </div>
          </div>
        )}

        {/* ── Row 3: Tags + Stars (secondary) ── */}
        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-1">
            {[...card.tags, ...(card.userTags ?? [])].slice(0, 4).map((tag, i) => (
              <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>{tag}</span>
            ))}
          </div>
          {(card.rating ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 shrink-0">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} className={s <= (card.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-100 fill-gray-100'} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2.5">
          {!isRichTextEmpty(card.application) && card.application !== 'Application not added yet.' && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-orange-50/60 border border-orange-100/60">
              <Target size={12} className="text-orange-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] text-orange-500 font-bold uppercase tracking-wide mb-1">How I Apply This</div>
                <p className="text-xs text-gray-700 leading-relaxed">{richTextToPlainText(card.application)}</p>
              </div>
            </div>
          )}
          {card.content && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-sky-50/50 border border-sky-100/60">
              <BookOpen size={12} className="text-sky-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] text-sky-500 font-bold uppercase tracking-wide mb-1">Course Notes</div>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{richTextToPlainText(card.content)}</p>
              </div>
            </div>
          )}
          {(card.userTags ?? []).length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-gray-400 font-medium">My Categories:</span>
              {(card.userTags ?? []).map((tag, i) => (
                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[(i + 5) % TAG_COLORS.length]}`}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewPortfolioTab({ showToast, completedCards }: {
  showToast: (msg: string) => void;
  completedCards: LearningCard[];
}) {
  const [search, setSearch] = useState('');
  const filtered = completedCards.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.provider.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Books / Courses Read', value: String(completedCards.length), sub: 'Total completed', tone: 'from-emerald-400 to-teal-500' },
          { label: 'Avg Rating',   value: completedCards.length ? (completedCards.reduce((s,c)=>s+(c.rating??0),0)/completedCards.length).toFixed(1) : '—', sub: 'Out of 5 ⭐', tone: 'from-amber-400 to-orange-500' },
          { label: 'With Notes',   value: String(completedCards.filter(c => !isRichTextEmpty(c.understanding) && c.understanding !== 'Notes not added yet.').length), sub: 'Have key insights', tone: 'from-violet-400 to-purple-500' },
          { label: 'Portfolio Score', value: '91', sub: 'Excellent', tone: 'from-rose-400 to-fuchsia-500' },
        ].map((k, i) => (
          <div key={i} className={`vivid-card relative overflow-hidden rounded-[22px] bg-gradient-to-br ${k.tone} min-h-[116px] p-4 text-white transition-all duration-200 hover:-translate-y-1`}>
            <span className="spark-dot" style={{ top: 8, right: 10, width: 3.5, height: 3.5 }} />
            <div className="text-[10px] font-bold text-white/85 uppercase tracking-wider leading-tight">{k.label}</div>
            <div className="text-xl font-extrabold text-white stat-num mt-1 leading-tight drop-shadow-sm">{k.value}</div>
            <div className="text-[10px] font-medium text-white/85 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* My Reading Archive */}
      <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <BookOpen size={15} className="text-emerald-500" />
              My Reading Archive
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedCards.length > 0 ? `${completedCards.length} book/course ที่อ่านเสร็จแล้ว` : 'ยังไม่มีรายการที่อ่านเสร็จ — ไปที่ Overall แล้วเปลี่ยน Status เป็น Done'}
            </p>
          </div>
          {completedCards.length > 0 && (
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ / ผู้แต่ง / tag…"
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-400 w-52" />
            </div>
          )}
        </div>

        {completedCards.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <div className="text-5xl mb-3">📚</div>
            <div className="font-semibold text-sm">ยังไม่มีรายการที่อ่านเสร็จ</div>
            <div className="text-xs mt-1">กลับไปที่ Overall tab แล้วเปลี่ยน Status ของ card เป็น <span className="text-emerald-600 font-medium">Done</span></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">ไม่พบผลการค้นหา &quot;{search}&quot;</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(card => <ArchiveCard key={card.id} card={card} />)}
          </div>
        )}
      </div>

      {/* Reflection Log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Portfolio Projects" subtitle="Showcase of your work" className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Weather App',    tag: 'React',   tone: 'from-violet-400 to-purple-500' },
              { name: 'AI Chatbot',     tag: 'Python',  tone: 'from-emerald-400 to-teal-500' },
              { name: 'Portfolio Site', tag: 'Next.js', tone: 'from-sky-400 to-blue-500' },
              { name: 'Habit Tracker',  tag: 'Mobile',  tone: 'from-orange-400 to-rose-500' },
            ].map((p, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-purple-100 hover:shadow-md transition">
                <div className={`h-24 bg-gradient-to-br ${p.tone} flex items-center justify-center`}>
                  <Code2 size={32} className="text-white/80" />
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm text-gray-800">{p.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{p.tag}</div>
                  <button onClick={() => showToast(`View ${p.name}`)}
                    className="mt-2 text-xs text-purple-600 font-medium hover:underline">View →</button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Reflection Log" subtitle="Weekly review">
          <div className="space-y-3">
            {[
              { week: 'Week 21', win: 'Finished React Module', loss: 'Missed 2 sessions' },
              { week: 'Week 20', win: 'AI capstone progress',  loss: 'Skipped review' },
              { week: 'Week 19', win: 'Streak hit 14 days',    loss: 'Weak focus mid-week' },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-purple-50/40">
                <div className="text-[11px] font-semibold text-purple-700">{r.week}</div>
                <div className="text-xs text-emerald-700 mt-1">✓ {r.win}</div>
                <div className="text-xs text-rose-600 mt-0.5">✗ {r.loss}</div>
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Add new entry')}
            className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold">
            Add Reflection
          </button>
        </SectionCard>
      </div>
    </div>
  );
}

const LEARNING_CARDS_KEY = 'alpha_learning_cards';

// Ensure every card has `stages` and a progress/status that match the stage logic.
function normalizeCard(c: LearningCard): LearningCard {
  const stages = c.stages ?? deriveStages(c);
  return { ...c, stages, progress: computeProgress(stages), status: statusFromStages(stages) };
}

function loadLearningCards(): LearningCard[] {
  if (typeof window === 'undefined') return INIT_LEARNING_CARDS.map(normalizeCard);
  try {
    const raw = localStorage.getItem(LEARNING_CARDS_KEY);
    if (raw) return (JSON.parse(raw) as LearningCard[]).map(normalizeCard);
  } catch { /* ignore */ }
  return INIT_LEARNING_CARDS.map(normalizeCard);
}

// ─── Main page ────────────────────────────────────────────────────────
export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<LearningTab>('Overall');
  const [toast, setToast] = useState('');
  const [learningCards, setLearningCards] = useState<LearningCard[]>(INIT_LEARNING_CARDS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLearningCards(loadLearningCards());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LEARNING_CARDS_KEY, JSON.stringify(learningCards));
    }
  }, [learningCards, hydrated]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <>
      <TopBar title="Learning" subtitle="Build skills. Track progress. Master your craft." />

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
      <div>
        {activeTab === 'Overall'              && <OverallTab            showToast={showToast} learningCards={learningCards} setLearningCards={setLearningCards} />}
        {activeTab === 'Skill Roadmap'        && <SkillRoadmapTab       showToast={showToast} />}
        {activeTab === 'Courses'              && <CoursesTab            showToast={showToast} />}
        {activeTab === 'Course Builder'       && <CourseBuilderTab      showToast={showToast} />}
        {activeTab === 'Practice Lab'         && <PracticeLabTab        showToast={showToast} />}
        {activeTab === 'Resource Inbox'       && <ResourceInboxTab      showToast={showToast} />}
        {activeTab === 'Schedule Planner'     && <SchedulePlannerTab    showToast={showToast} />}
        {activeTab === 'Exams & Certificates' && <ExamsCertificatesTab  showToast={showToast} />}
        {activeTab === 'Review & Portfolio'   && <ReviewPortfolioTab    showToast={showToast} completedCards={learningCards.filter(c => c.status === 'Done')} />}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium z-50 flex items-center gap-2">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}
    </>
  );
}

