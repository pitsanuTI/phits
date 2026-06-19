import {
  CommonModelRow,
  CompletionCategory,
  CompletionTrendPoint,
  EstimatorCategory,
  EstimatorPart,
  KanbanColumn,
  ListAlertItem,
  ModelPartSummary,
  ProductCardItem,
  ProductCategory,
  ProductReview,
  ProductSpecGroup,
  ProgressCard,
  ServiceCenter,
  SparkPoint,
  SymptomRow,
  TaskPriority,
  TaskStatus,
  TechnicianItem,
  UpcomingDeadline,
  WorkCalendarEvent,
  WorkKpi,
  WorkTabMeta,
  WorkTask,
} from '@/types/work';

export const workTabs: WorkTabMeta[] = [
  { id: 'overall', label: 'Overall' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'estimator', label: 'Estimator' },
  { id: 'part-price-dot', label: 'Part Price DOT' },
  { id: 'product', label: 'Product' },
  { id: 'manpower', label: 'Manpower' },
  { id: 'samsung-members', label: 'Samsung Members' },
  { id: 'plm-status', label: 'PLM Status' },
  { id: 'projects-timeline', label: 'Projects & Timeline' },
];

const spark = (values: number[]): SparkPoint[] =>
  values.map((value, index) => ({ label: `${index + 1}`, value }));

export const overallProgressCards: ProgressCard[] = [
  {
    id: 'daily',
    title: 'Daily Progress',
    percent: 76,
    completed: 16,
    inProgress: 5,
    pending: 4,
    total: 25,
    tone: 'purple',
  },
  {
    id: 'weekly',
    title: 'Weekly Progress',
    percent: 68,
    completed: 34,
    inProgress: 12,
    pending: 4,
    total: 50,
    tone: 'mint',
  },
  {
    id: 'monthly',
    title: 'Monthly Progress',
    percent: 72,
    completed: 86,
    inProgress: 22,
    pending: 12,
    total: 120,
    tone: 'pink',
  },
];

export const overallKpis: WorkKpi[] = [
  {
    id: 'daily',
    label: 'Daily Progress',
    value: '76% Completed',
    note: 'Completed 16 · In Progress 5',
    tone: 'purple',
    icon: 'target',
    trend: spark([62, 64, 68, 71, 73, 75, 76]),
  },
  {
    id: 'weekly',
    label: 'Weekly Progress',
    value: '68% Completed',
    note: '34 of 50 tasks',
    tone: 'mint',
    icon: 'bar',
    trend: spark([54, 58, 60, 62, 64, 67, 68]),
  },
  {
    id: 'monthly',
    label: 'Monthly Progress',
    value: '72% Completed',
    note: '86 completed this month',
    tone: 'coral',
    icon: 'chart',
    trend: spark([48, 53, 57, 60, 64, 69, 72]),
  },
];

export const overallCalendarEvents: WorkCalendarEvent[] = [
  { id: 'e1', date: '2025-05-01', title: 'PLM Review', time: '10:00 AM', type: 'plm', priority: 'medium' },
  { id: 'e2', date: '2025-05-02', title: 'Part Price DOT', time: '02:30 PM', type: 'part', priority: 'high' },
  { id: 'e3', date: '2025-05-05', title: 'Team Sync', time: '10:00 AM', type: 'team' },
  { id: 'e4', date: '2025-05-06', title: 'Estimator Check', time: '01:30 PM', type: 'estimate' },
  { id: 'e5', date: '2025-05-07', title: 'Product Meeting', time: '11:00 AM', type: 'meeting' },
  { id: 'e6', date: '2025-05-09', title: 'Samsung Members', time: '03:00 PM', type: 'members' },
  { id: 'e7', date: '2025-05-12', title: 'PLM Review', time: '09:30 AM', type: 'plm' },
  { id: 'e8', date: '2025-05-13', title: 'DOT Update', time: '02:30 PM', type: 'part' },
  { id: 'e9', date: '2025-05-14', title: 'Project Review', time: '11:00 AM', type: 'timeline' },
  { id: 'e10', date: '2025-05-15', title: 'Timeline Check', time: '04:00 PM', type: 'timeline' },
  { id: 'e11', date: '2025-05-19', title: 'Estimator Check', time: '01:30 PM', type: 'estimate' },
  { id: 'e12', date: '2025-05-20', title: 'Manpower Plan', time: '02:00 PM', type: 'meeting' },
  { id: 'e13', date: '2025-05-21', title: 'Product Update', time: '11:00 AM', type: 'product' },
  { id: 'e14', date: '2025-05-22', title: 'Part Price DOT', time: '02:30 PM', type: 'part' },
  { id: 'e15', date: '2025-05-23', title: 'PLM Submission', time: '03:00 PM', type: 'plm', priority: 'high' },
  { id: 'e16', date: '2025-05-26', title: 'Samsung Members', time: '10:30 AM', type: 'members' },
  { id: 'e17', date: '2025-05-27', title: 'Project Review', time: '11:00 AM', type: 'timeline' },
  { id: 'e18', date: '2025-05-28', title: 'Timeline Check', time: '04:00 PM', type: 'timeline' },
  { id: 'e19', date: '2025-05-29', title: 'Manpower Review', time: '02:00 PM', type: 'meeting' },
  { id: 'e20', date: '2025-05-30', title: 'Sprint Review', time: '10:00 AM', type: 'review' },
];

export const overdueTasks: ListAlertItem[] = [
  { id: 'ov-1', title: 'PLM Review - Camera Module', sub: 'Critical path item', age: '2 days ago' },
  { id: 'ov-2', title: 'Part Price DOT - A56 Project', sub: 'Supplier dependency', age: '1 day ago' },
  { id: 'ov-3', title: 'Estimator Check - Display', sub: 'Validation pending', age: '1 day ago' },
  { id: 'ov-4', title: 'Manpower Plan - May', sub: 'Coverage update needed', age: '3 days ago' },
  { id: 'ov-5', title: 'Samsung Members Report', sub: 'Waiting final draft', age: '2 days ago' },
];

export const atRiskItems: ListAlertItem[] = [
  { id: 'rk-1', title: 'DOT update delayed - A56', sub: 'BOM pending', age: 'High', badge: 'High' },
  { id: 'rk-2', title: 'PLM submission behind', sub: 'ECR feedback pending', age: 'High', badge: 'High' },
  { id: 'rk-3', title: 'Manpower shortfall - Dev', sub: 'Need 2 temporary techs', age: 'Medium', badge: 'Medium' },
  { id: 'rk-4', title: 'Estimator variance > 10%', sub: 'Price refresh pending', age: 'Medium', badge: 'Medium' },
  { id: 'rk-5', title: 'Timeline slip - Module X', sub: 'Dependencies not closed', age: 'Medium', badge: 'Medium' },
];

export const criticalFollowUps: ListAlertItem[] = [
  { id: 'cf-1', title: 'PLM Review - Camera Module', sub: 'Cross-team alignment', age: 'Open', badge: 'Open' },
  { id: 'cf-2', title: 'ECR - Hinge Bracket', sub: 'Awaiting approval', age: 'Open', badge: 'Open' },
  { id: 'cf-3', title: 'DCR - PCB Layout', sub: 'Needs QA confirmation', age: 'Open', badge: 'Open' },
  { id: 'cf-4', title: 'Approval - New BOM', sub: 'Final sign-off', age: 'Open', badge: 'Open' },
];

export const upcomingDeadlines: UpcomingDeadline[] = [
  { id: 'd1', date: 'May 16', title: 'PLM Submission - Final', project: 'A56 Project', level: 'high', dueIn: 'In 2 days' },
  { id: 'd2', date: 'May 20', title: 'Part Price DOT Freeze', project: 'A56 Project', level: 'high', dueIn: 'In 6 days' },
  { id: 'd3', date: 'May 23', title: 'Samsung Members Report', project: 'May 2025', level: 'medium', dueIn: 'In 9 days' },
  { id: 'd4', date: 'May 30', title: 'Sprint Review & Demo', project: 'Platform Team', level: 'low', dueIn: 'In 16 days' },
];

export const completionOverviewByCategory: CompletionCategory[] = [
  { name: 'Product', value: 78, color: '#a855f7' },
  { name: 'Estimator', value: 65, color: '#3b82f6' },
  { name: 'PLM', value: 70, color: '#06b6d4' },
  { name: 'DOT / Pricing', value: 75, color: '#6366f1' },
  { name: 'Manpower', value: 60, color: '#fb923c' },
  { name: 'Samsung Members', value: 80, color: '#34d399' },
  { name: 'Projects', value: 68, color: '#4f46e5' },
];

export const taskCompletionTrend: CompletionTrendPoint[] = [
  { day: 'May 8', value: 45 },
  { day: 'May 9', value: 55 },
  { day: 'May 10', value: 60 },
  { day: 'May 11', value: 65 },
  { day: 'May 12', value: 72 },
  { day: 'May 13', value: 75 },
  { day: 'May 14', value: 76 },
];

export const taskListSeed: WorkTask[] = [
  {
    id: 't-1',
    name: 'Finalize Q2 Product Roadmap',
    status: 'In Progress',
    priority: 'High',
    deadline: 'May 28, 2025',
    daysLeft: '2 days',
    assignees: ['Sarah K.', 'Arjun P.'],
    email: 'sarah.kim@samsung.com',
    reminder: 'May 26, 9:00 AM',
    notes: 'Waiting on UX feedback from Sarah.',
    tag: 'Roadmap',
  },
  {
    id: 't-2',
    name: 'Review DOT Cost Sheet',
    status: 'Waiting',
    priority: 'Medium',
    deadline: 'May 30, 2025',
    daysLeft: '4 days',
    assignees: ['James L.'],
    email: 'james.lee@samsung.com',
    reminder: 'May 27, 11:00 AM',
    notes: 'James to share latest numbers.',
    tag: 'DOT',
  },
  {
    id: 't-3',
    name: 'Update PLM Status',
    status: 'In Progress',
    priority: 'High',
    deadline: 'Jun 2, 2025',
    daysLeft: '7 days',
    assignees: ['Minji C.'],
    email: 'minji.choi@samsung.com',
    reminder: '—',
    notes: 'Update after ECR approval.',
    tag: 'PLM',
  },
  {
    id: 't-4',
    name: 'Manpower Plan - June',
    status: 'Planned',
    priority: 'Medium',
    deadline: 'Jun 5, 2025',
    daysLeft: '10 days',
    assignees: ['HR Team', 'Arjun P.'],
    email: 'hr.team@samsung.com',
    reminder: 'Jun 1, 10:00 AM',
    notes: 'Need final headcount by end of week.',
    tag: 'Manpower',
  },
  {
    id: 't-5',
    name: 'Samsung Members Content Plan',
    status: 'In Progress',
    priority: 'Low',
    deadline: 'Jun 6, 2025',
    daysLeft: '11 days',
    assignees: ['SEO Team'],
    email: 'seo.team@samsung.com',
    reminder: 'Jun 2, 2:00 PM',
    notes: 'Focus on community engagement.',
    tag: 'Members',
  },
  {
    id: 't-6',
    name: 'Supplier Part Price Validation',
    status: 'Blocked',
    priority: 'High',
    deadline: 'May 23, 2025',
    daysLeft: 'Overdue',
    assignees: ['Vendors'],
    email: 'vendors@samsung.com',
    reminder: 'May 23, 9:00 AM',
    notes: 'Need vendor response on pricing.',
    tag: 'Pricing',
  },
  {
    id: 't-7',
    name: 'Projects & Timeline Update',
    status: 'Completed',
    priority: 'Low',
    deadline: 'May 20, 2025',
    daysLeft: 'Done',
    assignees: ['PM Office'],
    email: 'pm.office@samsung.com',
    reminder: '—',
    notes: 'Updated timeline in confluence.',
    tag: 'Timeline',
  },
];

export const taskKpis = [
  { id: 'total', label: 'Total Tasks', value: 68, note: 'All time tasks', tone: 'purple', status: 'neutral' },
  { id: 'in-progress', label: 'In Progress', value: 18, note: '26% of total', tone: 'blue', status: 'good' },
  { id: 'completed', label: 'Completed', value: 27, note: '40% of total', tone: 'mint', status: 'good' },
  { id: 'waiting', label: 'Waiting', value: 9, note: '13% of total', tone: 'orange', status: 'warn' },
  { id: 'blocked', label: 'Blocked / Overdue', value: 7, note: '11% of total', tone: 'coral', status: 'bad' },
  { id: 'planned', label: 'Planned', value: 7, note: '11% of total', tone: 'purple', status: 'neutral' },
] as const;

export const taskKanban: KanbanColumn[] = [
  {
    status: 'In Progress',
    total: 18,
    items: [
      { id: 'kb-1', name: 'Finalize Q2 Product Roadmap', assignee: 'Sarah' },
      { id: 'kb-2', name: 'Update PLM Status', assignee: 'Minji' },
      { id: 'kb-3', name: 'Samsung Members Content Plan', assignee: 'SEO' },
    ],
  },
  {
    status: 'Waiting',
    total: 9,
    items: [
      { id: 'kb-4', name: 'Review DOT Cost Sheet', assignee: 'James' },
      { id: 'kb-5', name: 'Supplier Feedback', assignee: 'Vendors' },
    ],
  },
  {
    status: 'Blocked',
    total: 7,
    items: [
      { id: 'kb-6', name: 'Supplier Part Price Validation', assignee: 'Vendor' },
      { id: 'kb-7', name: 'ECR Approval', assignee: 'QA' },
    ],
  },
  {
    status: 'Planned',
    total: 7,
    items: [
      { id: 'kb-8', name: 'Manpower Plan - June', assignee: 'HR' },
      { id: 'kb-9', name: 'Training Plan - Q2', assignee: 'Ops' },
    ],
  },
  {
    status: 'Completed',
    total: 27,
    items: [
      { id: 'kb-10', name: 'Projects & Timeline Update', assignee: 'PMO' },
      { id: 'kb-11', name: 'March Report Submitted', assignee: 'PMO' },
    ],
  },
];

export const estimatorCategories: EstimatorCategory[] = ['Smartphone', 'Tablet', 'Galaxy Watch', 'Galaxy Buds'];

export const estimatorPartsByCategory: Record<EstimatorCategory, EstimatorPart[]> = {
  Smartphone: [
    { id: 'ep-1', name: 'Display Assembly (Main)', desc: '6.8" Dynamic AMOLED 2X', partCode: 'GH82-30488A', qty: 1, price: 18490 },
    { id: 'ep-2', name: 'Front Cover Adhesive', desc: 'Adhesive for Front Cover', partCode: 'GH02-24656A', qty: 1, price: 249 },
    { id: 'ep-3', name: 'Heat Dissipation Sheet', desc: 'Display Thermal Film', partCode: 'GH02-24615A', qty: 1, price: 199 },
    { id: 'ep-4', name: 'Service Pack', desc: 'Consumables', partCode: 'GH81-22185A', qty: 1, price: 199 },
  ],
  Tablet: [
    { id: 'ep-t1', name: 'Tablet Display Unit', desc: '11" TFT Panel', partCode: 'TB90-11201', qty: 1, price: 9650 },
    { id: 'ep-t2', name: 'Adhesive Kit', desc: 'Display adhesive', partCode: 'TB90-88211', qty: 1, price: 199 },
    { id: 'ep-t3', name: 'Back Plate', desc: 'Rear cover panel', partCode: 'TB90-77220', qty: 1, price: 990 },
  ],
  'Galaxy Watch': [
    { id: 'ep-w1', name: 'Watch Display Unit', desc: '1.5" AMOLED', partCode: 'GW22-00811', qty: 1, price: 4380 },
    { id: 'ep-w2', name: 'Battery Module', desc: 'Watch battery', partCode: 'GW22-55211', qty: 1, price: 620 },
  ],
  'Galaxy Buds': [
    { id: 'ep-b1', name: 'Earbud Driver Unit', desc: 'Dual-driver replacement', partCode: 'GB33-77211', qty: 2, price: 1120 },
    { id: 'ep-b2', name: 'Charging Case Shell', desc: 'External shell', partCode: 'GB33-21200', qty: 1, price: 780 },
  ],
};

export const symptomsData: SymptomRow[] = [
  { rank: 1, title: 'Display not working / No display', count: 12842, percent: 24 },
  { rank: 2, title: 'Battery draining fast', count: 9756, percent: 18 },
  { rank: 3, title: 'Phone not charging', count: 7893, percent: 15 },
  { rank: 4, title: 'Touch screen not working', count: 6421, percent: 12 },
  { rank: 5, title: 'Water damage', count: 4982, percent: 9 },
];

export const commonModelData: CommonModelRow[] = [
  { model: 'Galaxy S23 Ultra', count: 4562, percent: 24.6 },
  { model: 'Galaxy A54 5G', count: 3248, percent: 17.5 },
  { model: 'Galaxy S22 Ultra', count: 2987, percent: 16.1 },
  { model: 'Galaxy A34 5G', count: 2456, percent: 13.2 },
  { model: 'Galaxy S21 FE 5G', count: 1987, percent: 10.7 },
  { model: 'Others', count: 3322, percent: 17.9 },
];

export const partPriceKpis: WorkKpi[] = [
  { id: 'models', label: 'Total Models', value: '128', note: 'Models in master', tone: 'purple', icon: 'cube', trend: spark([52, 57, 55, 63, 62, 71, 70]) },
  { id: 'parts', label: 'Total Parts', value: '5,842', note: 'Across all models', tone: 'mint', icon: 'layers', trend: spark([68, 70, 69, 71, 74, 73, 76]) },
  { id: 'updated', label: 'Recently Updated', value: '139', note: 'In last 7 days', tone: 'orange', icon: 'clock', trend: spark([42, 45, 47, 50, 49, 53, 55]) },
  { id: 'ready', label: 'Export-Ready', value: '5,842', note: '100% ready', tone: 'blue', icon: 'upload', trend: spark([61, 64, 63, 66, 68, 69, 70]) },
];

export const partPriceRows: PartPriceRow[] = [
  { id: 'pp-1', model: 'A25', category: 'Display', partName: 'Main Display Assembly', partCode: 'GH82-31234A', price: 68.5, updatedAt: 'May 20, 2025 10:30 AM' },
  { id: 'pp-2', model: 'A25', category: 'Board', partName: 'Main Board (128GB)', partCode: 'GH82-31235A', price: 112, updatedAt: 'May 19, 2025 04:15 PM' },
  { id: 'pp-3', model: 'A25', category: 'Camera', partName: 'Rear Camera Module', partCode: 'GH96-15987A', price: 24.3, updatedAt: 'May 18, 2025 09:45 AM' },
  { id: 'pp-4', model: 'A25', category: 'Battery', partName: 'Battery Pack', partCode: 'EB-BA256ABY', price: 13.9, updatedAt: 'May 17, 2025 02:20 PM' },
  { id: 'pp-5', model: 'A25', category: 'Back Cover', partName: 'Back Cover (Blue)', partCode: 'GH82-31236A', price: 8.2, updatedAt: 'May 16, 2025 11:05 AM' },
  { id: 'pp-6', model: 'A35', category: 'Display', partName: 'Main Display Assembly', partCode: 'GH82-31747A', price: 72.1, updatedAt: 'May 20, 2025 09:10 AM' },
  { id: 'pp-7', model: 'A35', category: 'Board', partName: 'Main Board (128GB)', partCode: 'GH82-31748A', price: 118.4, updatedAt: 'May 19, 2025 03:35 PM' },
  { id: 'pp-8', model: 'S24', category: 'Camera', partName: 'Rear Camera Module', partCode: 'GH96-17012A', price: 31.6, updatedAt: 'May 18, 2025 08:50 AM' },
  { id: 'pp-9', model: 'S24', category: 'Battery', partName: 'Battery Pack', partCode: 'EB-BS921ABY', price: 14.8, updatedAt: 'May 17, 2025 01:40 PM' },
  { id: 'pp-10', model: 'S24', category: 'Back Cover', partName: 'Back Cover (Graphite)', partCode: 'GH82-31749A', price: 9.2, updatedAt: 'May 16, 2025 10:30 AM' },
];

export const modelPartSummary: ModelPartSummary[] = [
  { id: 'ms-1', icon: 'display', title: 'Display', sub: 'Main Display Assembly', code: 'GH82-31234A', price: 68.5 },
  { id: 'ms-2', icon: 'board', title: 'Board', sub: 'Main Board (128GB)', code: 'GH82-31235A', price: 112 },
  { id: 'ms-3', icon: 'camera', title: 'Camera', sub: 'Rear Camera Module', code: 'GH96-15987A', price: 24.3 },
  { id: 'ms-4', icon: 'battery', title: 'Battery', sub: 'Battery Pack', code: 'EB-BA256ABY', price: 13.9 },
  { id: 'ms-5', icon: 'cover', title: 'Back Cover', sub: 'Back Cover (Blue)', code: 'GH82-31236A', price: 8.2 },
];

export const productReviews: ProductReview[] = [
  {
    id: 'rv-1',
    source: 'TechRadar',
    date: 'May 10, 2024',
    quote: 'The Galaxy S24 Ultra is the definitive Android flagship.',
    score: 4.8,
    tone: 'purple',
  },
  {
    id: 'rv-2',
    source: 'GSMArena',
    date: 'Jan 18, 2024',
    quote: 'Top-tier performance and an outstanding display.',
    score: 4.7,
    tone: 'mint',
  },
  {
    id: 'rv-3',
    source: 'The Verge',
    date: 'Feb 2, 2024',
    quote: 'AI features make this phone truly future-ready.',
    score: 4.5,
    tone: 'gold',
  },
  {
    id: 'rv-4',
    source: 'Android Authority',
    date: 'Apr 25, 2024',
    quote: 'One of the best battery lives on any flagship.',
    score: 4.6,
    tone: 'pink',
  },
];

export const productCategoryTabs: ProductCategory[] = ['All', 'Smartphone', 'Tablet', 'Watch', 'Buds'];

export const productItems: ProductCardItem[] = [
  { id: 'pr-1', name: 'Galaxy S24 Ultra', year: 2024, series: 'S Series', category: 'Smartphone', imageType: 'phone', tone: 'purple', isNew: true },
  { id: 'pr-2', name: 'Galaxy S24+', year: 2024, series: 'S Series', category: 'Smartphone', imageType: 'phone', tone: 'mint', isNew: true },
  { id: 'pr-3', name: 'Galaxy S24', year: 2024, series: 'S Series', category: 'Smartphone', imageType: 'phone', tone: 'gold', isNew: true },
  { id: 'pr-4', name: 'Galaxy Tab S9 Ultra', year: 2023, series: 'Tab S Series', category: 'Tablet', imageType: 'tablet', tone: 'blue' },
  { id: 'pr-5', name: 'Galaxy Watch6 Classic', year: 2023, series: 'Watch Series', category: 'Watch', imageType: 'watch', tone: 'mint' },
  { id: 'pr-6', name: 'Galaxy Watch6', year: 2023, series: 'Watch Series', category: 'Watch', imageType: 'watch', tone: 'purple' },
  { id: 'pr-7', name: 'Galaxy Buds2 Pro', year: 2023, series: 'Buds Series', category: 'Buds', imageType: 'buds', tone: 'gold' },
  { id: 'pr-8', name: 'Galaxy Buds FE', year: 2023, series: 'Buds Series', category: 'Buds', imageType: 'buds', tone: 'blue' },
];

export const selectedProductSpecsTop: ProductSpecGroup[] = [
  { key: 'launch', label: 'Launch Year', value: '2024 · Jan 31, 2024' },
  { key: 'cpu', label: 'CPU', value: 'Snapdragon 8 Gen 3 for Galaxy' },
  { key: 'android', label: 'Android', value: '14 · One UI 6.1' },
  { key: 'battery', label: 'Battery', value: '5000 mAh · 45W Fast Charge' },
];

export const selectedProductSpecsBody: ProductSpecGroup[] = [
  { key: 'display', label: 'Display', value: '6.8” Dynamic AMOLED 2X · 3120×1440 · 120Hz Adaptive' },
  { key: 'camera', label: 'Camera', value: '200MP + 12MP + 50MP + 10MP · Front 12MP' },
  { key: 'memory', label: 'Memory', value: 'RAM 12GB · ROM 256/512GB/1TB · LPDDR5X/UFS 4.0' },
  { key: 'connectivity', label: 'Connectivity', value: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, UWB, USB-C 3.2' },
];

export const selectedProductNotes = [
  'Built with premium titanium frame and Gorilla Armor display protection.',
  'Galaxy AI features including Live Translate, Note Assist, and Photo Assist.',
  'S Pen with Air Actions and low latency.',
  'IP68 water and dust resistance.',
];

export const manpowerKpis: WorkKpi[] = [
  {
    id: 'centers',
    label: 'Total Service Centers',
    value: '142',
    note: 'Across Thailand',
    tone: 'purple',
    icon: 'building',
    trend: spark([118, 121, 123, 126, 129, 135, 142]),
  },
  {
    id: 'techs',
    label: 'Total Technicians',
    value: '1,256',
    note: 'Active technicians',
    tone: 'mint',
    icon: 'users',
    trend: spark([1080, 1106, 1132, 1160, 1184, 1210, 1256]),
  },
  {
    id: 'region',
    label: 'Highest Workload Region',
    value: 'Central',
    note: 'Avg. workload 87%',
    tone: 'orange',
    icon: 'award',
    trend: spark([64, 68, 71, 75, 81, 84, 87]),
  },
  {
    id: 'understaffed',
    label: 'Understaffed Centers',
    value: '18',
    note: 'Require attention',
    tone: 'coral',
    icon: 'alert',
    trend: spark([10, 12, 13, 14, 16, 17, 18]),
  },
];

export const serviceCenters: ServiceCenter[] = [
  { id: 'sc-1', name: 'Central Plaza Chiangmai Service Center', province: 'Chiang Mai', region: 'Northern', phone: '053-123-4567', email: 'cm.center@samsung.com', technicians: 18, workload: 76, status: 'Active', position: { x: 25, y: 18 } },
  { id: 'sc-2', name: 'Udonthani Service Center', province: 'Udon Thani', region: 'Northeastern', phone: '042-245-1187', email: 'ud.center@samsung.com', technicians: 14, workload: 62, status: 'Active', position: { x: 67, y: 22 } },
  { id: 'sc-3', name: 'Central Rama 9 Service Center', province: 'Bangkok', region: 'Central', phone: '02-886-1098', email: 'bkk.center@samsung.com', technicians: 32, workload: 92, status: 'Warning', position: { x: 47, y: 48 } },
  { id: 'sc-4', name: 'Khon Kaen Service Center', province: 'Khon Kaen', region: 'Northeastern', phone: '043-778-2291', email: 'kk.center@samsung.com', technicians: 11, workload: 58, status: 'Active', position: { x: 58, y: 32 } },
  { id: 'sc-5', name: 'Phuket Service Center', province: 'Phuket', region: 'Southern', phone: '076-514-7234', email: 'pk.center@samsung.com', technicians: 9, workload: 45, status: 'Active', position: { x: 32, y: 86 } },
  { id: 'sc-6', name: 'Chonburi Service Center', province: 'Chonburi', region: 'Eastern', phone: '038-556-1182', email: 'cb.center@samsung.com', technicians: 16, workload: 65, status: 'Active', position: { x: 62, y: 62 } },
  { id: 'sc-7', name: 'Nakhon Ratchasima Service Center', province: 'Nakhon Ratchasima', region: 'Northeastern', phone: '044-332-1120', email: 'nr.center@samsung.com', technicians: 13, workload: 70, status: 'Active', position: { x: 58, y: 43 } },
  { id: 'sc-8', name: 'Songkhla Service Center', province: 'Songkhla', region: 'Southern', phone: '074-661-7782', email: 'sk.center@samsung.com', technicians: 10, workload: 51, status: 'Active', position: { x: 66, y: 74 } },
];

export const techniciansByCenter: Record<string, TechnicianItem[]> = {
  'sc-1': [
    { id: 'tc-1', name: 'Somsak J.', role: 'Senior Technician', skills: ['Mobile', 'TV', 'AC'], workload: 92 },
    { id: 'tc-2', name: 'Worapong K.', role: 'Technician', skills: ['Mobile', 'Tablet'], workload: 78 },
    { id: 'tc-3', name: 'Nattapol R.', role: 'Technician', skills: ['TV', 'Audio'], workload: 65 },
    { id: 'tc-4', name: 'Piyawat T.', role: 'Technician', skills: ['Mobile', 'AC'], workload: 58 },
    { id: 'tc-5', name: 'Supaporn S.', role: 'Technician', skills: ['Mobile', 'Tablet'], workload: 45 },
  ],
};

export const topSkills = [
  { name: 'Mobile', count: 12 },
  { name: 'TV', count: 8 },
  { name: 'AC', count: 6 },
  { name: 'Tablet', count: 5 },
  { name: 'Audio', count: 4 },
];

export const workloadTrend30d = [62, 65, 69, 66, 72, 76, 74, 73, 77, 76];

export const manpowerQuickStats = [
  { label: 'Active Work Orders', value: '3,842', tone: 'blue' },
  { label: 'Pending Work Orders', value: '1,126', tone: 'orange' },
  { label: 'Completed (This Month)', value: '5,671', tone: 'mint' },
  { label: 'Avg. Workload', value: '62%', tone: 'purple' },
];

export const taskStatusOptions: TaskStatus[] = ['In Progress', 'Waiting', 'Blocked', 'Planned', 'Completed'];
export const taskPriorityOptions: TaskPriority[] = ['High', 'Medium', 'Low'];
export const taskAssigneeOptions = ['Me (Arjun Patel)', 'Sarah K.', 'James L.', 'Minji C.', 'HR Team', 'SEO Team', 'Vendors'];
export const taskDueOptions = ['Anytime', 'This Week', 'Next 2 Weeks', 'Overdue'];
export const taskTagOptions = ['All Tags', 'Roadmap', 'DOT', 'PLM', 'Manpower', 'Members', 'Pricing', 'Timeline'];
