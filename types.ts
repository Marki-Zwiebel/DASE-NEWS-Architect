
export interface NewsTopic {
  id: string;
  notes: string;
}

export interface NewsletterDraft {
  id: string;
  date: string;
  language: string;
  topics: NewsTopic[];
  content: string;
  isLearned: boolean;
}

export interface StyleProfile {
  summary: string;
  vocabulary: string[];
  tone: string;
  structure: string;
  lastUpdated: string;
}

export interface StorageConfig {
  type: 'local' | 'remote';
  apiUrl?: string;
  apiKey?: string;
}

export enum AppStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  LEARNING = 'learning',
  SAVING = 'saving',
  ERROR = 'error'
}
