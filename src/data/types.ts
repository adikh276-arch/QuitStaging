export type SubstanceSlug = 'alcohol' | 'tobacco' | 'opioids' | 'cannabis' | 'stimulants' | 'benzodiazepines' | 'kratom' | 'mdma';

export interface SubstanceConfig {
  slug: SubstanceSlug;
  name: string;
  descriptor: string;
  icon: string;
  accentVar: string;
  trackers: TrackerConfig[];
  calculator: CalculatorConfig;
  activities: ActivityConfig[];
  articles: ArticleConfig[];
  communityPosts: CommunityPost[];
  achievements: AchievementConfig[];
  banner?: BannerConfig;
}

export interface TrackerConfig {
  id: string;
  name: string;
  chartType: 'bar' | 'line' | 'area' | 'stacked-bar' | 'calendar';
  yAxisLabel: string;
  insight: string;
  fields: FieldConfig[];
  mockGenerator: (day: number) => Record<string, any>;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'slider' | 'number' | 'chips' | 'single-select' | 'textarea' | 'icon-picker' | 'date-picker';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  multiSelect?: boolean;
}

export interface CalculatorConfig {
  title: string;
  inputs: CalcInputConfig[];
  compute: (inputs: Record<string, number>) => CalcOutput[];
  note?: string;
}

export interface CalcInputConfig {
  key: string;
  label: string;
  type: 'slider' | 'dropdown';
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: number }[];
  defaultValue: number;
  unit?: string;
}

export interface CalcOutput {
  label: string;
  value: string;
  color?: string;
}

export interface ActivityConfig {
  id: string;
  name: string;
  duration: string;
  type: 'breathing' | 'timer' | 'checklist' | 'calculator' | 'journal';
  description?: string;
  phases?: { time: number; text: string }[];
  items?: { title: string; content: string }[];
  fields?: FieldConfig[];
}

export interface ArticleConfig {
  id: string;
  title: string;
  tag: string;
  content: string;
}

export interface CommunityPost {
  id: string;
  type: 'Milestone' | 'Question' | 'Tip' | 'Story' | 'Support';
  title: string;
  body: string;
  upvotes: number;
  comments: number;
  timeAgo: string;
  username: string;
  replies?: { username: string; text: string; timeAgo: string }[];
}

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (data: any) => { unlocked: boolean; progress?: string };
}

export interface BannerConfig {
  text: string;
  type: 'info' | 'warning' | 'danger';
  dismissable: boolean;
}

export interface TrackerEntry {
  date: string;
  values: Record<string, any>;
  notes?: string;
}

export interface AssessmentResult {
  score: number;
  date: string;
  answers: boolean[];
}
