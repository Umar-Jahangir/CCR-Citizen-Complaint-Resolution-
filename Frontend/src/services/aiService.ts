const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AnalysisResult {
  text_analysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    urgency_score: number;
    similarity_scores?: Record<string, number>;
  };
  image_analyses: Array<{
    description: string;
    key_observations: string[];
    identified_problems: string[];
    affected_areas: string[];
    recommended_actions: string[];
    severity: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
    severity_reason: string;
    image_index: number;
  }>;
  overall_urgency: number;
  overall_severity: string;
}

export async function analyzeGrievance(
  text: string,
  images?: string[]
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-grievance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, images }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to analyze grievance');
  }

  return await response.json();
}

export async function analyzeText(text: string): Promise<{
  sentiment: string;
  confidence: number;
  urgency_score: number;
  similarity_scores: Record<string, number>;
}> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to analyze text');
  }

  return await response.json();
}

export async function analyzeImage(imageBase64: string): Promise<{
  description: string;
  key_observations: string[];
  identified_problems: string[];
  severity: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to analyze image');
  }

  return await response.json();
}
