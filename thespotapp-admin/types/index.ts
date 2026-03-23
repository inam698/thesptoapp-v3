export type ArticleCategory =
  | "menstrual-health"
  | "hiv-stis"
  | "maternal-health"
  | "safe-abortion"
  | "contraceptives"
  | "srhr-laws"
  | "fact-check"
  | "find-services"
  | "safety";

export type ArticleDifficulty = "beginner" | "intermediate" | "advanced";

export interface ArticleSubsection {
  id: string;
  title: string;
  order: number;
  content: string;
}

export interface ArticleSection {
  id: string;
  title: string;
  order: number;
  content: string;
  subsections?: ArticleSubsection[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  tags: string[];
  featuredImage: string;
  estimatedReadTime: number;
  publishedDate: string;
  lastUpdated: string;
  author: string;
  sources: string[];
  isPublished: boolean;
  difficulty: ArticleDifficulty;
  targetAudience: string[];
  sections: ArticleSection[];
  scheduledPublishDate?: string;
  status?: "draft" | "scheduled" | "published";
  viewCount?: number;
}

export type ArticleFormData = Omit<Article, "id">;

export const SUPPORTED_LANGUAGES = [
  "en",
  "sw",
  "zu",
  "am",
  "ha",
  "yo",
  "ig",
  "af",
  "so",
  "st",
  "xh",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  sw: "Swahili",
  zu: "Zulu",
  am: "Amharic",
  ha: "Hausa",
  yo: "Yoruba",
  ig: "Igbo",
  af: "Afrikaans",
  so: "Somali",
  st: "Sesotho",
  xh: "Xhosa",
};

export interface LanguageTranslation {
  title: string;
  body: string;
}

export type HealthTipTranslations = {
  [key in SupportedLanguage]: LanguageTranslation;
};

export interface HealthTip {
  id: string;
  numericId: number;
  emoji: string;
  translations: HealthTipTranslations;
}

export type HealthTipFormData = Omit<HealthTip, "id">;

export interface AppUser {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
  [key: string]: unknown;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalHealthTips: number;
  totalUsers: number;
}

export interface ContentOverTime {
  month: string;
  published: number;
  drafts: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

export interface ContentAnalytics {
  articlesOverTime: ContentOverTime[];
  articlesByCategory: CategoryStat[];
  statusDistribution: StatusSlice[];
}

export const ARTICLE_CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: "menstrual-health", label: "Menstrual Health" },
  { value: "hiv-stis", label: "HIV & STIs" },
  { value: "maternal-health", label: "Maternal Health" },
  { value: "safe-abortion", label: "Safe Abortion" },
  { value: "contraceptives", label: "Contraceptives" },
  { value: "srhr-laws", label: "SRHR Laws" },
  { value: "fact-check", label: "Fact Check" },
  { value: "find-services", label: "Find Services" },
  { value: "safety", label: "Safety" },
];

export const DIFFICULTY_OPTIONS: {
  value: ArticleDifficulty;
  label: string;
}[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  adminEmail: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ArticleViewEvent {
  id: string;
  articleId: string;
  userId: string;
  timestamp: string;
  readDurationSeconds: number;
  completedReading: boolean;
}

export interface ArticleAnalytics {
  articleId: string;
  title: string;
  viewCount: number;
  avgReadTime: number;
  category: string;
}

// ---------------------------------------------------------------------------
// Deployment / Version Management
// ---------------------------------------------------------------------------

export interface AppVersionConfig {
  currentVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
  updatedAt: string;
}

export interface DeploymentLog {
  id: string;
  type: "ota" | "build" | "version_change" | "force_update_toggle" | "rollout_change" | "feature_toggle" | "kill_switch";
  version: string;
  message: string;
  adminEmail: string;
  createdAt: string;
}

export interface RolloutConfig {
  rolloutPercentage: number;
  disableUpdates: boolean;
}

export interface FeatureFlags {
  [key: string]: boolean;
}
