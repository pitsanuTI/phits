/* Local journal store — saves daily reflection entries to localStorage.
   Keyed by ISO-ish day key (e.g. "2025-05-20"). */

export interface FeelingTag {
  icon: string;   // emoji icon
  label: string;  // text label (Thai or English)
}

export interface JournalReflection {
  title: string;       // หัวเรื่อง — รู้สึกยังไงวันนี้
  score: number;       // คะแนนวันนี้ 1-10
  energy: number;      // พลังงานวันนี้ 1-10
  feelings: FeelingTag[]; // icon+label tags — อารมณ์ที่รู้สึก
  keepDoing: string;   // 1. สิ่งที่ฉันทำ "ถูก" (Keep Doing)
  fix: string;         // 2. สิ่งที่พลาด (Fix จริง ไม่โลกสวย)
  money: string;       // 3. Money & Growth Thinking
  oneBigMove: string;  // 4. One Big Move (โฟกัสของพรุ่งนี้)
  commitment: string;  // 5. Commitment (คำสั่งตัวเอง)
  gratitude: string;   // 6. Gratitude (แต่ต้องมีพลัง)
}

const KEY = 'alpha_journal_entries';
const FEELINGS_KEY = 'alpha_journal_feelings_v2';

function normalizeFeelings(raw: (string | FeelingTag)[]): FeelingTag[] {
  return raw.map(f => (typeof f === 'string' ? { icon: '', label: f } : f));
}

export function loadEntries(): Record<string, JournalReflection> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Record<string, unknown>>;
    const result: Record<string, JournalReflection> = {};
    for (const [k, v] of Object.entries(raw)) {
      result[k] = {
        ...(v as unknown as JournalReflection),
        feelings: normalizeFeelings((v.feelings || []) as (string | FeelingTag)[]),
      };
    }
    return result;
  } catch {
    return {};
  }
}

export function saveEntry(dayKey: string, entry: JournalReflection): void {
  if (typeof window === 'undefined') return;
  const all = loadEntries();
  all[dayKey] = entry;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getEntry(dayKey: string): JournalReflection | undefined {
  return loadEntries()[dayKey];
}

export function deleteEntry(dayKey: string): void {
  if (typeof window === 'undefined') return;
  const all = loadEntries();
  delete all[dayKey];
  localStorage.setItem(KEY, JSON.stringify(all));
}

export const EMPTY_REFLECTION: JournalReflection = {
  title: '', score: 5, energy: 5, feelings: [],
  keepDoing: '', fix: '', money: '', oneBigMove: '', commitment: '', gratitude: '',
};

export const DEFAULT_FEELINGS: FeelingTag[] = [
  { icon: '✅', label: 'ฉันทำสำเร็จแล้ว' },
  { icon: '🌀', label: 'ความวุ่นวายทั้งหมด' },
  { icon: '💎', label: 'ความชัดเจน' },
  { icon: '🚫', label: 'ความเป็นไปไม่ได้' },
  { icon: '⚡', label: 'พลังงานสูง' },
  { icon: '😌', label: 'ความสงบ' },
  { icon: '🎯', label: 'โฟกัสมาก' },
  { icon: '💪', label: 'มั่นใจ' },
  { icon: '😤', label: 'หงุดหงิด' },
  { icon: '😰', label: 'วิตกกังวล' },
  { icon: '😴', label: 'เหนื่อย' },
  { icon: '🥳', label: 'ตื่นเต้น' },
  { icon: '🙏', label: 'ขอบคุณ' },
  { icon: '💡', label: 'ได้ไอเดียใหม่' },
  { icon: '📈', label: 'กำลังพัฒนา' },
  { icon: '😔', label: 'เศร้าใจ' },
  { icon: '🤔', label: 'คิดเยอะ' },
  { icon: '🔥', label: 'มีไฟมาก' },
  { icon: '😊', label: 'มีความสุข' },
  { icon: '🌟', label: 'วันที่ดี' },
  { icon: '🧘', label: 'ผ่อนคลาย' },
  { icon: '📚', label: 'เรียนรู้มาก' },
  { icon: '💰', label: 'ความคิดทางการเงิน' },
  { icon: '🏆', label: 'ความสำเร็จ' },
  { icon: '🌈', label: 'วันสดใส' },
];

export function loadFeelings(): FeelingTag[] {
  if (typeof window === 'undefined') return DEFAULT_FEELINGS;
  try {
    const saved = localStorage.getItem(FEELINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as (string | FeelingTag)[];
      const normalized = normalizeFeelings(parsed);
      const existingLabels = new Set(normalized.map(f => f.label.toLowerCase()));
      return [
        ...normalized,
        ...DEFAULT_FEELINGS.filter(f => !existingLabels.has(f.label.toLowerCase())),
      ];
    }
    return DEFAULT_FEELINGS;
  } catch {
    return DEFAULT_FEELINGS;
  }
}

export function addCustomFeeling(feeling: FeelingTag): void {
  if (typeof window === 'undefined') return;
  const all = loadFeelings();
  if (!all.some(f => f.label.toLowerCase() === feeling.label.toLowerCase())) {
    all.unshift(feeling);
    localStorage.setItem(FEELINGS_KEY, JSON.stringify(all));
  }
}

export const REFLECTION_SECTIONS: {
  key: 'keepDoing' | 'fix' | 'money' | 'oneBigMove' | 'commitment' | 'gratitude';
  emoji: string;
  title: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    key: 'keepDoing', emoji: '✅', title: 'สิ่งที่ฉันทำ "ถูก" (Keep Doing)',
    hint: 'วันนี้มีอะไรที่ทำแล้วดี → ต้องทำต่อ',
    placeholder: 'List สิ่งที่ทำได้ดีวันนี้...',
  },
  {
    key: 'fix', emoji: '❌', title: 'สิ่งที่พลาด (Fix จริง ไม่โลกสวย)',
    hint: 'วันนี้พลาดอะไร · พลาดเพราะอะไร (ระบบ/อารมณ์/ขี้เกียจ) · วิธีแก้ "พรุ่งนี้"',
    placeholder: 'เขียนแบบตรงๆ ไม่โลกสวย...',
  },
  {
    key: 'money', emoji: '💰', title: 'Money & Growth Thinking',
    hint: 'วันนี้ "เข้าใกล้เงิน" ยังไง · Skill ไหนพัฒนา 1% · ถ้าทำต่อ 30 วันจะเกิดอะไร',
    placeholder: 'ช่องว่างสำหรับเขียนถึงข้อคิดและบทเรียนที่ได้รับ...',
  },
  {
    key: 'oneBigMove', emoji: '🍀', title: 'One Big Move (โฟกัสของพรุ่งนี้)',
    hint: 'พรุ่งนี้ "สิ่งเดียว" ที่ต้องทำให้ได้ · ถ้าทำได้ = วันนั้นชนะทันที',
    placeholder: 'สิ่งเดียวที่ต้องโฟกัสพรุ่งนี้...',
  },
  {
    key: 'commitment', emoji: '🔒', title: 'Commitment (คำสั่งตัวเอง)',
    hint: 'พรุ่งนี้ฉันจะ ___ (ชัดเจน วัดผลได้) · ถ้าไม่ทำ = ฉันกำลังหนีความสำเร็จของตัวเอง',
    placeholder: 'พรุ่งนี้ฉันจะ...',
  },
  {
    key: 'gratitude', emoji: '🙏', title: 'Gratitude (แต่ต้องมีพลัง)',
    hint: 'วันนี้ขอบคุณอะไร 3 อย่าง · อย่างน้อย 1 อย่างต้องเกี่ยวกับ "ตัวเอง"',
    placeholder: 'ขอบคุณ 3 อย่าง...',
  },
];
