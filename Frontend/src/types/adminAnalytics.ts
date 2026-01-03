export interface WeeklyTrendItem {
  day: string;
  complaints: number;
  resolved: number;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
}

export interface DepartmentPerformanceItem {
  name: string;
  pending: number;
  inProgress: number;
  resolved: number;
}

export interface AdminAnalytics {
  weeklyTrend: WeeklyTrendItem[];
  categoryDistribution: CategoryDistributionItem[];
  departmentStats: DepartmentPerformanceItem[];
}
