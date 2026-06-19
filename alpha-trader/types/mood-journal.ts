export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodMeta {
  level: MoodLevel;
  label: string;      // English
  labelTh: string;    // Thai
  emoji: string;
  color: string;      // accent
  bg: string;         // soft bg
}

export interface DayEntry {
  date: string;        // ISO yyyy-mm-dd
  day: number;         // day of month
  mood: MoodLevel | null;
  energy: number;      // 0-10
  score: number;       // 0-10 day score
  tags: string[];
  hasJournal: boolean;
  hasAttachment: boolean;
  moneyFeeling?: string;
  note?: string;
  title?: string;
}

export interface JournalEntry {
  id: string;
  date: string;        // display date
  time: string;
  mood: MoodLevel;
  energy: number;
  tags: string[];
  moneyFeeling: string;
  highlights: string;
  moneyBelief: string;
  nextIntention: string;
  hasImage: boolean;
  hasDoc: boolean;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface CorrelationPoint {
  x: number;
  y: number;
}

export interface Correlation {
  labelA: string;
  labelB: string;
  iconA: string;
  iconB: string;
  r: number;
  strength: string;
  color: string;
  points: CorrelationPoint[];
}

export interface ThemeWord {
  word: string;
  weight: number;   // 1-5 visual size
}

export interface ImprovementTheme {
  label: string;
  pct: number;
}

export interface PromptCategory {
  id: string;
  label: string;
  icon: string;
  gradient: [string, string];
}

export interface GuidedPrompt {
  id: string;
  question: string;
  category: string;
  categoryColor: string;
}

export interface MoneyEntry {
  date: string;
  emotion: string;
  emoji: string;
  note: string;
  score: number;
  dotColor: string;
}

export interface FillInItem {
  label: string;
  desc: string;
}

export interface MotionNote {
  icon: string;
  title: string;
  desc: string;
}
