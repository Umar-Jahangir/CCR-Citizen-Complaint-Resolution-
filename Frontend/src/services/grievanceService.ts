const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GrievanceCreateData {
  name: string;
  phone: string;
  email?: string;
  title: string;
  description: string;
  category?: string;
  location: string;
  images?: string[];
}

export interface ImageAnalysis {
  description: string;
  key_observations: string[];
  identified_problems: string[];
  affected_areas: string[];
  recommended_actions: string[];
  severity: 'low' | 'medium' | 'high' | 'unknown';
  severity_reason: string;
  image_index?: number;
}

export interface Grievance {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  category: string | null;
  location: string;
  status: string;
  priority: string;
  department: string;
  citizen_name: string;
  citizen_phone: string;
  citizen_email: string | null;
  images: string[];
  sentiment: string | null;
  sentiment_confidence: number | null;
  urgency_score: number | null;
  image_analyses: ImageAnalysis[];
  created_at: string;
}

export interface CreateGrievanceResponse {
  success: boolean;
  ticket_id: string;
  grievance_id: string;
  message: string;
  ai_analysis: {
    sentiment: string;
    urgency_score: number;
    priority: string;
    department: string;
  };
}

export interface ListGrievancesResponse {
  grievances: Grievance[];
  total: number;
}

export async function createGrievance(data: GrievanceCreateData): Promise<CreateGrievanceResponse> {
  console.log('Submitting grievance to:', `${API_BASE_URL}/api/grievances`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/grievances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit grievance');
    }

    return await response.json();
  } catch (error) {
    console.error('Network error details:', error);
    throw error;
  }
}

export async function listGrievances(filters?: {
  status?: string;
  priority?: string;
  department?: string;
  search?: string;
}): Promise<ListGrievancesResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.department) params.append('department', filters.department);
  if (filters?.search) params.append('search', filters.search);

  const url = `${API_BASE_URL}/api/grievances${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch grievances');
  }

  return await response.json();
}

export async function getGrievance(id: string): Promise<Grievance> {
  const response = await fetch(`${API_BASE_URL}/api/grievances/${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch grievance');
  }

  return await response.json();
}

export async function updateGrievance(
  id: string,
  data: { status?: string; department?: string; priority?: string }
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/grievances/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update grievance');
  }

  return await response.json();
}

export async function deleteGrievance(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/grievances/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to delete grievance');
  }

  return await response.json();
}
