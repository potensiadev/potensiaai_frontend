// API Client for Railway FastAPI Backend
// Base URL: https://potensiaai-production.up.railway.app

const API_BASE_URL = "https://potensiaai-production.up.railway.app";

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

// Base fetch wrapper with error handling with retry logic
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
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
    mode: 'cors',
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting API call to ${url} (attempt ${attempt + 1}/${retries + 1})`);
      
      const response = await fetch(url, config);

      console.log(`Response status: ${response.status}`);

      // Try to parse response
      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new APIError(
          `서버가 올바르지 않은 응답을 반환했습니다. Railway 앱이 제대로 실행 중인지 확인해주세요.`,
          response.status,
          { raw: text }
        );
      }

      // Check for HTTP errors
      if (!response.ok) {
        throw new APIError(
          data.detail || data.message || `API 요청 실패 (상태 코드: ${response.status})`,
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      // Network or CORS errors
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new APIError(
          `Railway API 서버에 연결할 수 없습니다. 서버 상태를 확인해주세요.\n- Railway 앱이 실행 중인지 확인\n- CORS가 올바르게 설정되었는지 확인\n- URL이 올바른지 확인: ${API_BASE_URL}`,
          undefined,
          { originalError: error.message }
        );
      }

      // Parsing or other errors
      if (error instanceof Error) {
        throw new APIError(`오류: ${error.message}`, undefined, { originalError: error.message });
      }

      throw new APIError("알 수 없는 오류가 발생했습니다");
    }
  }

  throw new APIError("최대 재시도 횟수를 초과했습니다");
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
 * GET /api/health or /api/write/health
 */
export async function healthCheck(): Promise<{ status: string; service?: string; app?: string; env?: string; timestamp?: string }> {
  try {
    // Try the write health endpoint first
    return await apiFetch("/api/write/health", {
      method: "GET",
    }, 1); // Only 1 retry for health check
  } catch (error) {
    // Fallback to general health endpoint
    return apiFetch("/api/health", {
      method: "GET",
    }, 1);
  }
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
