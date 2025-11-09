# Railway FastAPI Backend Integration

This document describes the integration between the Lovable frontend and the Railway-hosted FastAPI backend.

## API Endpoints

Base URL: `https://potensiaai-production.up.railway.app`

### 1. Full Content Generation Pipeline
**POST** `/api/write`

Generates complete content with topic refinement, content generation, and automatic validation.

**Request:**
```typescript
{
  topic: string;
  model?: string;
}
```

**Response:**
```typescript
{
  status: "success";
  input_topic: string;
  refined_topic: string;
  content: string;
  validation: ValidationReport;
}
```

### 2. Topic Refinement
**POST** `/api/write/refine`

Refines a raw topic into an SEO-optimized question format.

**Request:**
```typescript
{
  topic: string;
}
```

**Response:**
```typescript
{
  status: "success";
  input_topic: string;
  refined_topic: string;
}
```

### 3. Content Validation
**POST** `/api/write/validate`

Validates content quality across multiple dimensions.

**Request:**
```typescript
{
  content: string;
  model?: string;
}
```

**Response:**
```typescript
{
  status: "success";
  validation: {
    scores: {
      grammar: number;   // 0-10
      human: number;     // 0-10
      seo: number;       // 0-10
    };
    has_faq: boolean;
    issues: Array<{
      type: string;
      message: string;
    }>;
  };
}
```

### 4. Content Auto-Fix
**POST** `/api/write/fix`

Automatically fixes content based on validation results.

**Request:**
```typescript
{
  content: string;
  validation_report: ValidationReport;
  metadata?: {
    focus_keyphrase?: string;
    language?: string;
    style?: string;
  };
}
```

**Response:**
```typescript
{
  status: "success";
  fixed_content: string;
  fix_summary: string[];
  added_FAQ: boolean;
  keyword_density: number;
}
```

## Frontend Integration

### API Client

Located at `src/lib/api.ts`, the API client provides:

- **Type-safe requests/responses** using TypeScript interfaces
- **Comprehensive error handling** with custom `APIError` class
- **Automatic JSON parsing** and error transformation
- **Network error handling** for offline/timeout scenarios

### Usage Example

```typescript
import * as api from "@/lib/api";

try {
  const response = await api.generateFullContent({
    topic: "파이썬 웹 크롤링"
  });

  console.log(response.content);
  console.log(response.validation.scores);
} catch (error) {
  if (error instanceof api.APIError) {
    console.error(error.message, error.status);
  }
}
```

## State Management

The `Write.tsx` component manages the following states:

- `loading`: Topic refinement in progress
- `generating`: Content generation/fixing in progress
- `validating`: Content validation in progress
- `apiError`: Current API error message (if any)
- `validationResult`: Latest validation results
- `generatedContent`: AI-generated content

## Error Handling

Errors are handled at multiple levels:

1. **Network level**: Catch fetch errors, timeouts
2. **HTTP level**: Parse error responses from API
3. **UI level**: Display user-friendly error messages via toast + alert

```typescript
try {
  const response = await api.validateContent({ content });
  // Handle success
} catch (err) {
  if (err instanceof api.APIError) {
    setApiError(err.message);
    toast({
      title: "검증 실패",
      description: err.message,
      variant: "destructive"
    });
  }
}
```

## User Flow

1. **Enter topic** → Auto-refines to optimized version (debounced 600ms)
2. **Click "콘텐츠 생성"** → Full pipeline runs (refine + generate + validate)
3. **View validation results** → See grammar/human/SEO scores + issues
4. **Click "자동 수정"** (if issues exist) → Auto-fix content + re-validate
5. **Save to history** → Persist to Supabase for logged-in users

## Testing

To test the integration locally:

1. Ensure backend is running at Railway URL
2. Run frontend: `npm run dev`
3. Navigate to `/write`
4. Enter a topic and click "콘텐츠 생성"

Expected behavior:
- Topic refines automatically
- Content generates within 10-30 seconds
- Validation scores appear automatically
- Fix button appears if issues detected

## Environment Variables

No frontend environment variables needed. API base URL is hardcoded in `src/lib/api.ts`:

```typescript
const API_BASE_URL = "https://potensiaai-production.up.railway.app";
```

For local development, you can modify this to:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:8000";
```

## Troubleshooting

### CORS Errors
Backend already has CORS enabled for all origins. If issues persist, check:
- Railway deployment logs
- Browser console for specific CORS error

### Timeout Errors
Content generation can take 20-30 seconds. Current timeout: 2 minutes (120s).

### Validation Issues Not Showing
Check if `validationResult.issues` exists. Backend always returns this field.

### Fix Button Not Appearing
Fix button only shows when `validationResult.issues.length > 0`.

## Migration Notes

Migrated from Supabase Edge Functions to Railway FastAPI:

| Old (Supabase) | New (Railway) | Notes |
|----------------|---------------|-------|
| `generate-content` | `/api/write` | Returns validation automatically |
| `validate-content` | `/api/write/validate` | New response structure |
| `refine-keyword` | `/api/write/refine` | Returns single refined topic |
| N/A | `/api/write/fix` | New endpoint for auto-fix |

## Performance

- **Topic refinement**: ~2-3 seconds
- **Content generation**: ~15-30 seconds
- **Validation**: ~5-8 seconds
- **Auto-fix**: ~10-20 seconds

Total end-to-end (full pipeline): ~20-40 seconds
