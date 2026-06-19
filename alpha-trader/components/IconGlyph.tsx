import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Banknote, Bell, BookOpen, Brain,
  Briefcase, Calendar, Camera, Check, CheckCircle2, CircleDollarSign, ClipboardList,
  Clock, Droplets, Dumbbell, Eye, FileText, Flag, HeartPulse, Image, Landmark,
  Laptop, Lightbulb, Lock, MapPin, Medal, Moon, Package, PenLine, PiggyBank,
  RefreshCw, Scale, Search, Shield, Smartphone, Smile, Sparkles, Target, Trophy,
  Upload, Wallet, X, Zap,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type React from 'react';

type GlyphMeta = {
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  color: string;
  label: string;
};

const GLYPHS: Record<string, GlyphMeta> = {
  done: { Icon: CheckCircle2, color: '#10b981', label: 'Done' },
  check: { Icon: Check, color: '#10b981', label: 'Done' },
  error: { Icon: X, color: '#f43f5e', label: 'Remove' },
  warning: { Icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  blocked: { Icon: Shield, color: '#f43f5e', label: 'Blocked' },
  neutral: { Icon: Activity, color: '#94a3b8', label: 'Neutral' },
  mood: { Icon: Smile, color: '#7c5cbf', label: 'Mood' },
  calm: { Icon: Smile, color: '#10b981', label: 'Calm' },
  lowMood: { Icon: AlertTriangle, color: '#f97316', label: 'Low mood' },
  tired: { Icon: Moon, color: '#8b5cf6', label: 'Tired' },
  energy: { Icon: Zap, color: '#f59e0b', label: 'Energy' },
  momentum: { Icon: Zap, color: '#f97316', label: 'Momentum' },
  strength: { Icon: Dumbbell, color: '#10b981', label: 'Strength' },
  exercise: { Icon: Activity, color: '#f59e0b', label: 'Exercise' },
  meditation: { Icon: Brain, color: '#8b5cf6', label: 'Meditation' },
  heart: { Icon: HeartPulse, color: '#ec4899', label: 'Heart' },
  hydration: { Icon: Droplets, color: '#3b82f6', label: 'Hydration' },
  sleep: { Icon: Moon, color: '#7c3aed', label: 'Sleep' },
  weight: { Icon: Scale, color: '#10b981', label: 'Weight' },
  chart: { Icon: Activity, color: '#38bdf8', label: 'Chart' },
  growth: { Icon: ArrowUp, color: '#10b981', label: 'Growth' },
  decline: { Icon: ArrowDown, color: '#f43f5e', label: 'Decline' },
  target: { Icon: Target, color: '#7c3aed', label: 'Target' },
  achievement: { Icon: Trophy, color: '#f59e0b', label: 'Achievement' },
  sparkle: { Icon: Sparkles, color: '#a78bfa', label: 'Sparkle' },
  insight: { Icon: Lightbulb, color: '#f59e0b', label: 'Insight' },
  learning: { Icon: BookOpen, color: '#38bdf8', label: 'Learning' },
  journal: { Icon: BookOpen, color: '#7c3aed', label: 'Journal' },
  notes: { Icon: FileText, color: '#7c3aed', label: 'Notes' },
  text: { Icon: PenLine, color: '#7c3aed', label: 'Text' },
  checklist: { Icon: ClipboardList, color: '#7c3aed', label: 'Checklist' },
  file: { Icon: FileText, color: '#64748b', label: 'File' },
  link: { Icon: RefreshCw, color: '#38bdf8', label: 'Link' },
  money: { Icon: CircleDollarSign, color: '#10b981', label: 'Money' },
  payout: { Icon: Banknote, color: '#10b981', label: 'Payout' },
  bank: { Icon: Landmark, color: '#38bdf8', label: 'Bank' },
  savings: { Icon: PiggyBank, color: '#f59e0b', label: 'Savings' },
  time: { Icon: Clock, color: '#64748b', label: 'Time' },
  calendar: { Icon: Calendar, color: '#38bdf8', label: 'Calendar' },
  entry: { Icon: MapPin, color: '#f43f5e', label: 'Entry' },
  exit: { Icon: Flag, color: '#10b981', label: 'Exit' },
  exitReason: { Icon: X, color: '#f97316', label: 'Exit reason' },
  camera: { Icon: Camera, color: '#7c3aed', label: 'Screenshot' },
  image: { Icon: Image, color: '#7c3aed', label: 'Image' },
  phone: { Icon: Smartphone, color: '#7c5cbf', label: 'Phone' },
  tablet: { Icon: Smartphone, color: '#38bdf8', label: 'Tablet' },
  laptop: { Icon: Laptop, color: '#64748b', label: 'Laptop' },
  audio: { Icon: Zap, color: '#f97316', label: 'Audio' },
  product: { Icon: Package, color: '#64748b', label: 'Product' },
  repair: { Icon: Activity, color: '#f97316', label: 'Repair' },
  search: { Icon: Search, color: '#38bdf8', label: 'Search' },
  reminder: { Icon: Bell, color: '#f59e0b', label: 'Reminder' },
  work: { Icon: Briefcase, color: '#7c3aed', label: 'Work' },
  pin: { Icon: MapPin, color: '#7c3aed', label: 'Pin' },
  lock: { Icon: Lock, color: '#7c3aed', label: 'Lock' },
  '✅': { Icon: CheckCircle2, color: '#10b981', label: 'Done' },
  '✓': { Icon: Check, color: '#10b981', label: 'Done' },
  '❌': { Icon: X, color: '#f43f5e', label: 'Remove' },
  '✗': { Icon: X, color: '#f43f5e', label: 'Remove' },
  '⚠': { Icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  '⚠️': { Icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  '🚫': { Icon: Shield, color: '#f43f5e', label: 'Blocked' },
  '➖': { Icon: Activity, color: '#94a3b8', label: 'Neutral' },

  '😊': { Icon: Smile, color: '#7c5cbf', label: 'Mood' },
  '🙂': { Icon: Smile, color: '#7c5cbf', label: 'Mood' },
  '😄': { Icon: Smile, color: '#10b981', label: 'Great mood' },
  '😐': { Icon: Activity, color: '#f59e0b', label: 'Neutral mood' },
  '😟': { Icon: AlertTriangle, color: '#f97316', label: 'Low mood' },
  '😔': { Icon: AlertTriangle, color: '#f97316', label: 'Low mood' },
  '😣': { Icon: AlertTriangle, color: '#f43f5e', label: 'Tough mood' },
  '😴': { Icon: Moon, color: '#8b5cf6', label: 'Tired' },
  '😌': { Icon: Smile, color: '#10b981', label: 'Calm' },

  '⚡': { Icon: Zap, color: '#f59e0b', label: 'Energy' },
  '🔥': { Icon: Zap, color: '#f97316', label: 'Momentum' },
  '💪': { Icon: Dumbbell, color: '#10b981', label: 'Strength' },
  '🏃': { Icon: Activity, color: '#f59e0b', label: 'Exercise' },
  '🧘': { Icon: Brain, color: '#8b5cf6', label: 'Meditation' },
  '🤸': { Icon: Activity, color: '#38bdf8', label: 'Mobility' },
  '❤️': { Icon: HeartPulse, color: '#ec4899', label: 'Heart' },
  '💚': { Icon: HeartPulse, color: '#10b981', label: 'Gratitude' },
  '🌙': { Icon: Moon, color: '#7c3aed', label: 'Sleep' },
  '💧': { Icon: Droplets, color: '#3b82f6', label: 'Hydration' },
  '🫁': { Icon: HeartPulse, color: '#38bdf8', label: 'Vitals' },
  '🩸': { Icon: HeartPulse, color: '#ef4444', label: 'Blood pressure' },
  '⚖️': { Icon: Scale, color: '#10b981', label: 'Weight' },
  '🧭': { Icon: Activity, color: '#38bdf8', label: 'BMI' },

  '📈': { Icon: ArrowUp, color: '#10b981', label: 'Growth' },
  '📉': { Icon: ArrowDown, color: '#f43f5e', label: 'Decline' },
  '📊': { Icon: Activity, color: '#38bdf8', label: 'Chart' },
  '🎯': { Icon: Target, color: '#7c3aed', label: 'Target' },
  '🏆': { Icon: Trophy, color: '#f59e0b', label: 'Achievement' },
  '🏅': { Icon: Medal, color: '#f59e0b', label: 'Award' },
  '⭐': { Icon: Sparkles, color: '#f59e0b', label: 'Highlight' },
  '✨': { Icon: Sparkles, color: '#a78bfa', label: 'Sparkle' },
  '✦': { Icon: Sparkles, color: '#a78bfa', label: 'Sparkle' },
  '💡': { Icon: Lightbulb, color: '#f59e0b', label: 'Insight' },

  '📖': { Icon: BookOpen, color: '#38bdf8', label: 'Learning' },
  '📚': { Icon: BookOpen, color: '#38bdf8', label: 'Learning' },
  '📓': { Icon: BookOpen, color: '#7c3aed', label: 'Journal' },
  '📔': { Icon: BookOpen, color: '#7c3aed', label: 'Journal' },
  '📝': { Icon: FileText, color: '#7c3aed', label: 'Notes' },
  '✏️': { Icon: PenLine, color: '#7c3aed', label: 'Text' },
  '📋': { Icon: ClipboardList, color: '#7c3aed', label: 'Checklist' },
  '📥': { Icon: Upload, color: '#38bdf8', label: 'Import' },
  '📤': { Icon: Upload, color: '#10b981', label: 'Export' },
  '📁': { Icon: FileText, color: '#64748b', label: 'File' },
  '📎': { Icon: FileText, color: '#64748b', label: 'Attachment' },
  '🔗': { Icon: RefreshCw, color: '#38bdf8', label: 'Link' },

  '💰': { Icon: CircleDollarSign, color: '#10b981', label: 'Money' },
  '💸': { Icon: Banknote, color: '#10b981', label: 'Payout' },
  '💳': { Icon: Wallet, color: '#7c3aed', label: 'Card' },
  '🏦': { Icon: Landmark, color: '#38bdf8', label: 'Bank' },
  '🐷': { Icon: PiggyBank, color: '#f59e0b', label: 'Savings' },
  '💎': { Icon: Sparkles, color: '#a78bfa', label: 'Premium' },
  '🤑': { Icon: CircleDollarSign, color: '#a78bfa', label: 'Greedy' },
  '👑': { Icon: Trophy, color: '#f59e0b', label: 'Confidence' },

  '🕐': { Icon: Clock, color: '#64748b', label: 'Time' },
  '🕗': { Icon: Clock, color: '#64748b', label: 'Best time' },
  '📅': { Icon: Calendar, color: '#38bdf8', label: 'Calendar' },
  '📍': { Icon: MapPin, color: '#f43f5e', label: 'Entry' },
  '🏁': { Icon: Flag, color: '#10b981', label: 'Exit' },
  '🚪': { Icon: X, color: '#f97316', label: 'Exit reason' },
  '📸': { Icon: Camera, color: '#7c3aed', label: 'Screenshot' },
  '🖼': { Icon: Image, color: '#7c3aed', label: 'Image' },

  '📱': { Icon: Smartphone, color: '#7c3aed', label: 'Phone' },
  '📲': { Icon: Smartphone, color: '#38bdf8', label: 'Tablet' },
  '💻': { Icon: Laptop, color: '#64748b', label: 'Laptop' },
  '🎧': { Icon: Zap, color: '#f97316', label: 'Audio' },
  '📦': { Icon: Package, color: '#64748b', label: 'Product' },
  '🔧': { Icon: Activity, color: '#f97316', label: 'Repair' },
  '🔍': { Icon: Search, color: '#38bdf8', label: 'Search' },
  '🔔': { Icon: Bell, color: '#f59e0b', label: 'Reminder' },
  '💼': { Icon: Briefcase, color: '#7c3aed', label: 'Work' },
  '👥': { Icon: Briefcase, color: '#7c3aed', label: 'Meeting' },
  '👤': { Icon: Briefcase, color: '#64748b', label: 'Person' },
  '📌': { Icon: MapPin, color: '#7c3aed', label: 'Pin' },
  '🏷️': { Icon: Flag, color: '#f59e0b', label: 'Tag' },
  '👁': { Icon: Eye, color: '#64748b', label: 'Preview' },
  '🔒': { Icon: Lock, color: '#7c3aed', label: 'Lock' },
  '⚙️': { Icon: SettingsIcon, color: '#64748b', label: 'Settings' },
};

function SettingsIcon(props: { size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }) {
  return <Activity {...props} />;
}

export function getGlyphMeta(token: string): GlyphMeta {
  return GLYPHS[token] ?? { Icon: Activity, color: '#7c3aed', label: token || 'Icon' };
}

export default function IconGlyph({
  token,
  size = 16,
  className = '',
  color,
  title,
}: {
  token: string;
  size?: number;
  className?: string;
  color?: string;
  title?: string;
}) {
  const { Icon, color: defaultColor, label } = getGlyphMeta(token);
  return (
    <Icon
      aria-label={title ?? label}
      role="img"
      size={size}
      strokeWidth={2.2}
      className={className}
      style={{ color: color ?? defaultColor }}
    />
  );
}
