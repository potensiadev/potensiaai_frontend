// API Client for FastAPI Backend
// Supports both Railway (production) and localhost (development)

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Log the API URL being used (helpful for debugging)
console.log(`[API Client] Using base URL: ${API_BASE_URL}`);

// Type definitions matching backend responses
export interface WriteRequest {
  topic: string;
  model?: string;
}

export interface RefineRequest {
  topic: string;
}

export interface ValidateRequest {
  content: string;
  model?: string;
}

export interface FixRequest {
  content: string;
  validation_report: ValidationReport;
  metadata?: {
    focus_keyphrase?: string;
    language?: string;
    style?: string;
  };
}

export interface WriteResponse {
  status: string;
  input_topic: string;
  refined_topic: string;
  content: string;
  validation: ValidationReport;
}

export interface RefineResponse {
  status: string;
  input_topic: string;
  refined_topic: string;
}

export interface ValidationReport {
  scores: {
    grammar: number;
    human: number;
    seo: number;
  };
  has_faq: boolean;
  issues: Array<{
    type: string;
    message: string;
  }>;
  grammar_score?: number;
  human_score?: number;
  seo_score?: number;
  suggestions?: string[];
}

export interface ValidateResponse {
  status: string;
  validation: ValidationReport;
}

export interface FixResponse {
  status: string;
  fixed_content: string;
  fix_summary: string[];
  added_FAQ: boolean;
  keyword_density: number;
}

// Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Base fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log(`[API] Fetching: ${url}`);
    const response = await fetch(url, config);

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, create a generic error object
      data = {
        detail: `Invalid JSON response from server (status: ${response.status})`,
        raw: await response.text().catch(() => "Unable to read response")
      };
    }

    // Check for HTTP errors
    if (!response.ok) {
      const errorMessage = data.detail || data.message || `API request failed with status ${response.status}`;
      console.error(`[API Error] ${response.status}: ${errorMessage}`, data);

      throw new APIError(
        errorMessage,
        response.status,
        data
      );
    }

    console.log(`[API] Success: ${endpoint}`);
    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or parsing errors
    if (error instanceof Error) {
      console.error(`[API Network Error]:`, error);
      throw new APIError(`Network error: ${error.message}. Please check if the backend server is running at ${API_BASE_URL}`);
    }

    throw new APIError("Unknown error occurred");
  }
}

/**
 * Full content generation pipeline
 * POST /api/write
 */
export async function generateFullContent(
  request: WriteRequest
): Promise<WriteResponse> {
  return apiFetch<WriteResponse>("/api/write", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Refine topic only
 * POST /api/write/refine
 */
export async function refineTopic(
  request: RefineRequest
): Promise<RefineResponse> {
  return apiFetch<RefineResponse>("/api/write/refine", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Validate content
 * POST /api/write/validate
 */
export async function validateContent(
  request: ValidateRequest
): Promise<ValidateResponse> {
  return apiFetch<ValidateResponse>("/api/write/validate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Fix content based on validation
 * POST /api/write/fix
 */
export async function fixContent(
  request: FixRequest
): Promise<FixResponse> {
  return apiFetch<FixResponse>("/api/write/fix", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Health check
 * GET /api/health
 */
export async function healthCheck(): Promise<{ status: string; app: string; env: string }> {
  return apiFetch("/api/health", {
    method: "GET",
  });
}

// Export all functions as a single API object for convenience
export const api = {
  generateFullContent,
  refineTopic,
  validateContent,
  fixContent,
  healthCheck,
};

export default api;
