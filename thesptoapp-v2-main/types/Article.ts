export interface ArticleSection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections?: ArticleSubsection[];
}

export interface ArticleSubsection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: 'menstrual-health' | 'hiv-stis' | 'maternal-health' | 'safe-abortion' | 'contraceptives' | 'srhr-laws' | 'fact-check' | 'find-services' | 'safety';
  tags: string[];
  featuredImage: string;
  estimatedReadTime: number; // in minutes
  lastUpdated: Date;
  publishedDate: Date;
  author?: string;
  sources: string[]; // URLs for additional information
  sections: ArticleSection[];
  isPublished: boolean;
  viewCount?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience?: string[];
}

export interface ArticleMetadata {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  featuredImage: string;
  estimatedReadTime: number;
  publishedDate: Date;
  difficulty: string;
} 