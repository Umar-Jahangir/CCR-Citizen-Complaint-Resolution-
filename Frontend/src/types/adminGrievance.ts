export interface AIClassification {
  confidence: number;
  urgencyScore: number;
  sentiment: string;
}

export interface AdminGrievance {
  ticketId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  category: string;
  location: string;
  department: string;
  priority: "low" | "medium" | "high";
  submittedAt: string | Date; 
  escalationNeeded: boolean;
  updatedAt?: string | Date;
  aiClassification?: {
    confidence: number;
    urgencyScore: number;
    sentiment: string;
  };
}
