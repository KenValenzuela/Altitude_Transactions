export type ChecklistState = 'todo' | 'doing' | 'done' | 'na';
export type DocumentState = 'received' | 'pending' | 'upcoming' | 'na';
export type ScreenId =
  | 'login' | 'dashboard' | 'upload' | 'extracting' | 'review'
  | 'overview' | 'checklist' | 'deadlines' | 'parties' | 'documents'
  | 'summary' | 'postclose' | 'next' | 'prev';

export type GoFn = (id: string) => void;

export interface StateCfg {
  label: string;
  bg: string;
  fg: string;
  dot: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  due: string;
  state: ChecklistState;
  ai?: string;
  detail?: string;
}

export interface ChecklistGroup {
  group: string;
  items: ChecklistItem[];
}

export interface Party {
  role: string;
  name: string;
  sub: string;
  phone: string;
  email: string;
  initials: string;
  color: string;
}

export interface Stage {
  id: string;
  label: string;
  day: number;
  done: boolean;
  current?: boolean;
}

export interface Deadline {
  date: string;
  day: string;
  label: string;
  tag: string;
  urgent: boolean;
  days: number;
}

export interface DocItem {
  id: string;
  name: string;
  src: string;
  received: string;
  state: DocumentState;
  detail?: string;
  urgent?: boolean;
}

export interface Note {
  author: string;
  when: string;
  text: string;
}

export interface DashboardTx {
  id: string;
  address: string;
  city: string;
  stage: string;
  daysToClose: number;
  progress: number;
  next: string;
  urgent: boolean;
  parties: string;
  price: number;
  active: boolean;
}

export interface Property {
  address: string;
  city: string;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  list: number;
  contract: number;
  earnest: number;
  loanType: string;
  mls: string;
  photoTint: string;
}

export interface Summary {
  week: string;
  completed: string[];
  upcoming: Array<{ d: string; t: string }>;
  risks: Array<{ sev: string; t: string }>;
}

export interface PostCloseTask {
  t: string;
  when: string;
  state: ChecklistState;
}

export interface AppData {
  property: Property;
  parties: Party[];
  stages: Stage[];
  checklist: ChecklistGroup[];
  deadlines: Deadline[];
  documents: DocItem[];
  notes: Note[];
  dashboard: DashboardTx[];
  summary: Summary;
  postClose: PostCloseTask[];
  user: { name: string; initials: string; brokerage: string };
}

export interface TweakValues {
  theme: 'light' | 'dark';
  accent: string;
  density: 'compact' | 'regular' | 'comfy';
  view: 'focus' | 'film';
  showAIReasoning: boolean;
  stage: string;
}
