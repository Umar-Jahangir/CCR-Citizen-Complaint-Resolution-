const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TextAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  urgency_score?: number;
  similarity_scores?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  error?: string;
}

export interface ImageAnalysisResult {
  description: string;
  identified_problems: string[];
  severity: 'low' | 'medium' | 'high' | 'unknown';
  image_index?: number;
  error?: string;
}

export interface GrievanceAnalysisResult {
  text_analysis: TextAnalysisResult;
  image_analyses: ImageAnalysisResult[];
  overall_urgency: number;
  overall_severity: 'low' | 'medium' | 'high';
}

export async function analyzeText(text: string): Promise<TextAnalysisResult> {
  try {
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
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      sentiment: 'neutral',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function analyzeImage(imageBase64: string): Promise<ImageAnalysisResult> {
  try {
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
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      description: '',
      identified_problems: [],
      severity: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function analyzeGrievance(
  text: string,
  images?: string[]
): Promise<GrievanceAnalysisResult> {
  try {
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
  } catch (error) {
    console.error('Error analyzing grievance:', error);
    return {
      text_analysis: {
        sentiment: 'neutral',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      image_analyses: [],
      overall_urgency: 5,
      overall_severity: 'medium',
    };
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
