export type WorkTabId =
  | 'overall'
  | 'tasks'
  | 'estimator'
  | 'part-price-dot'
  | 'product'
  | 'manpower'
  | 'samsung-members'
  | 'plm-status'
  | 'projects-timeline';

export type WorkTabMeta = {
  id: WorkTabId;
  label: string;
};

export type SparkPoint = {
  label: string;
  value: number;
};

export type WorkKpi = {
  id: string;
  label: string;
  value: string;
  note: string;
  tone: 'purple' | 'mint' | 'blue' | 'orange' | 'coral';
  icon: string;
  trend: SparkPoint[];
};

export type WorkCalendarEvent = {
  id: string;
  date: string;
  title: string;
  time: string;
  type:
    | 'plm'
    | 'part'
    | 'team'
    | 'estimate'
    | 'product'
    | 'members'
    | 'timeline'
    | 'review'
    | 'meeting';
  priority?: 'low' | 'medium' | 'high';
};

export type ProgressCard = {
  id: string;
  title: string;
  percent: number;
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
  tone: 'purple' | 'mint' | 'pink';
};

export type ListAlertItem = {
  id: string;
  title: string;
  sub: string;
  age: string;
  badge?: string;
};

export type UpcomingDeadline = {
  id: string;
  date: string;
  title: string;
  project: string;
  level: 'high' | 'medium' | 'low';
  dueIn: string;
};

export type CompletionCategory = {
  name: string;
  value: number;
  color: string;
};

export type CompletionTrendPoint = {
  day: string;
  value: number;
};

export type TaskStatus =
  | 'In Progress'
  | 'Waiting'
  | 'Blocked'
  | 'Planned'
  | 'Completed';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type WorkTask = {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  daysLeft: string;
  assignees: string[];
  email: string;
  reminder: string;
  notes: string;
  tag: string;
};

export type KanbanColumn = {
  status: TaskStatus;
  total: number;
  items: { id: string; name: string; assignee: string }[];
};

export type EstimatorCategory = 'Smartphone' | 'Tablet' | 'Galaxy Watch' | 'Galaxy Buds';

export type EstimatorPart = {
  id: string;
  name: string;
  desc: string;
  partCode: string;
  qty: number;
  price: number;
};

export type SymptomRow = {
  rank: number;
  title: string;
  count: number;
  percent: number;
};

export type CommonModelRow = {
  model: string;
  count: number;
  percent: number;
};

export type PartPriceRow = {
  id: string;
  model: string;
  category: string;
  partName: string;
  partCode: string;
  price: number;
  updatedAt: string;
};

export type ModelPartSummary = {
  id: string;
  icon: string;
  title: string;
  sub: string;
  code: string;
  price: number;
};

export type ProductReview = {
  id: string;
  source: string;
  date: string;
  quote: string;
  score: number;
  tone: 'purple' | 'mint' | 'gold' | 'pink';
};

export type ProductCategory = 'All' | 'Smartphone' | 'Tablet' | 'Watch' | 'Buds';

export type ProductCardItem = {
  id: string;
  name: string;
  year: number;
  series: string;
  category: Exclude<ProductCategory, 'All'>;
  imageType: 'phone' | 'tablet' | 'watch' | 'buds';
  tone: 'purple' | 'mint' | 'gold' | 'blue';
  isNew?: boolean;
};

export type ProductSpecGroup = {
  key: string;
  label: string;
  value: string;
};

export type WorkloadBand = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';

export type ServiceCenter = {
  id: string;
  name: string;
  province: string;
  region: 'Northern' | 'Northeastern' | 'Central' | 'Western' | 'Eastern' | 'Southern';
  phone: string;
  email: string;
  technicians: number;
  workload: number;
  status: 'Active' | 'Warning';
  position: { x: number; y: number };
};

export type TechnicianItem = {
  id: string;
  name: string;
  role: string;
  skills: string[];
  workload: number;
};
