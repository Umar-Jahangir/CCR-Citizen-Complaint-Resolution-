export type Priority = 'high' | 'medium' | 'low';
export type Status = 'pending' | 'in-progress' | 'resolved';
export type Category = 
  | 'sanitation'
  | 'water-supply'
  | 'electricity'
  | 'roads'
  | 'public-safety'
  | 'healthcare'
  | 'education'
  | 'housing'
  | 'other';

export interface Grievance {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  department: string;
  location: string;
  submittedBy: string;
  submittedAt: Date;
  updatedAt: Date;
  aiClassification?: {
    confidence: number;
    suggestedCategory: Category;
    urgencyScore: number;
    sentiment: 'negative' | 'neutral' | 'positive';
  };
}

export interface Department {
  id: string;
  name: string;
  categories: Category[];
  pendingCount: number;
  resolvedCount: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  'sanitation': 'Sanitation & Waste',
  'water-supply': 'Water Supply',
  'electricity': 'Electricity',
  'roads': 'Roads & Infrastructure',
  'public-safety': 'Public Safety',
  'healthcare': 'Healthcare',
  'education': 'Education',
  'housing': 'Housing',
  'other': 'Other',
};

export const CATEGORY_DEPARTMENTS: Record<Category, string> = {
  'sanitation': 'Municipal Corporation - Sanitation',
  'water-supply': 'Water Supply Board',
  'electricity': 'Electricity Board',
  'roads': 'Public Works Department',
  'public-safety': 'Police Department',
  'healthcare': 'Health Department',
  'education': 'Education Department',
  'housing': 'Housing Authority',
  'other': 'General Administration',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  'sanitation': '🗑️',
  'water-supply': '💧',
  'electricity': '⚡',
  'roads': '🛣️',
  'public-safety': '🛡️',
  'healthcare': '🏥',
  'education': '📚',
  'housing': '🏠',
  'other': '📋',
};
