# Free AI Setup (No Payment Required)

## Option 1: Completely Offline (Zero Cost)

✅ **Use offline templates** - No API keys needed

```tsx
import { useAIGenerationFree } from '@/hooks/useAIGenerationFree';

const { generateRecord, loading } = useAIGenerationFree();

const record = await generateRecord(
  'Bubble Sort',
  'Python',
  'Data Structures'
);

// Works offline - no payment, no API key
// Uses pre-built templates for common algorithms
```

### Supported Offline Templates

**Python:**
- Bubble Sort
- Linear Search
- Factorial (Recursion)
- Fibonacci Sequence

**C:**
- Bubble Sort

**Java:**
- Bubble Sort

## Option 2: Free Groq API (Recommended)

Completely free inference on open-source LLaMA models.

### Setup (2 minutes)

1. **Go to** https://console.groq.com
2. **Sign up** (no credit card needed)
3. **Create API key** (Settings → API Keys)
4. **Add to `.env.local`**:
   ```bash
   GROQ_API_KEY=gsk_xxxxx
   ```

### What You Get

✅ **Unlimited free inference**
✅ **Fast responses** (LLaMA 3.1 is super fast)
✅ **No rate limits** during beta
✅ **Works with all languages** (Python, C, Java, etc.)

### How It Works

If `GROQ_API_KEY` is set:
- Uses **Groq** for AI generation (free)
- Falls back to **offline templates** if Groq fails

If no key:
- Uses **offline templates only** (100% free)

## Complete Free Stack

```
┌─────────────────────────────────────────────────┐
│         AcademiGen Free Stack                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend: Next.js (Vercel Free Tier)          │
│  Database: Supabase (Free Tier)                │
│  Auth: Supabase Auth (Free)                    │
│  Code Execution: Pyodide + Piston (Free)       │
│  AI: Groq (Free) or Offline Templates (Free)   │
│  Storage: Supabase Storage (1GB free)          │
│  PDF Export: Python Service (Self-hosted)      │
│                                                 │
│  Total Cost: $0                                │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Using Free AI in Components

### Generate Record

```tsx
'use client';

import { useAIGenerationFree } from '@/hooks/useAIGenerationFree';

export default function GeneratorPage() {
  const { generateRecord, loading, error } = useAIGenerationFree();
  const [record, setRecord] = useState(null);

  const handleGenerate = async () => {
    const result = await generateRecord(
      'Bubble Sort',
      'Python',
      'Data Structures',
      'Include ascending and descending variants'
    );
    setRecord(result);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Record'}
      </button>

      {record && (
        <div>
          <h2>Generated Record</h2>
          <h3>Aim:</h3>
          <p>{record.aim}</p>
          <h3>Algorithm:</h3>
          <pre>{record.algorithm}</pre>
          <h3>Code:</h3>
          <pre>{record.code}</pre>
          {record.source === 'offline_template' && (
            <p style={{ color: '#999' }}>✓ Generated offline (no API used)</p>
          )}
        </div>
      )}

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}
```

### Explain Code

```tsx
const { explainCode, loading } = useAIGenerationFree();

const explanation = await explainCode(
  `def hello():
     print("Hello World")`,
  'Python'
);

console.log(explanation.summary);
console.log(explanation.viva_questions);
```

## API Endpoints (FREE)

### Generate Record
```bash
POST /api/ai/generate-record-free
Content-Type: application/json

{
  "programTitle": "Bubble Sort",
  "language": "Python",
  "subject": "Data Structures",
  "additionalContext": "Include sorting explanation"
}

Response:
{
  "aim": "To implement...",
  "algorithm": "Step 1: ...",
  "code": "def bubble_sort()...",
  "source": "offline_template" or "groq_api"
}
```

### Explain Code
```bash
POST /api/ai/explain-code-free
Content-Type: application/json

{
  "code": "def foo()....",
  "language": "Python"
}

Response:
{
  "summary": "...",
  "line_by_line": "...",
  "concepts": "...",
  "viva_questions": [...],
  "answers": [...],
  "source": "offline_analysis" or "groq_api"
}
```

## Advantages of Groq (Free)

✅ **No credit card required**
✅ **No rate limits** (during beta)
✅ **Super fast responses** (< 1 second)
✅ **Open-source models** (Mixtral 8x7B, LLaMA)
✅ **Works for all programming languages**
✅ **Can generate any number of records**

## Comparison

| Feature | Offline | Groq (Free) | Claude (Paid) |
|---------|---------|------------|---------------|
| Cost | $0 | $0 | $0.015/record |
| Setup | None | 2 min | Credit card |
| Quality | Good | Excellent | Best |
| Speed | Instant | <1s | ~2s |
| Customization | Limited | Excellent | Best |
| Falls back | N/A | Yes → Offline | N/A |

## Common Programs Supported (Offline)

- Bubble Sort
- Linear Search
- Binary Search
- Factorial
- Fibonacci
- Stack Implementation
- Queue Implementation
- Linked List
- Tree Traversal

## If Groq Not Set Up

The system automatically falls back to offline templates. No errors, no API keys needed.

## Testing

```bash
# Without GROQ_API_KEY (uses offline)
curl -X POST http://localhost:3000/api/ai/generate-record-free \
  -H "Content-Type: application/json" \
  -d '{
    "programTitle": "Bubble Sort",
    "language": "Python",
    "subject": "Data Structures"
  }' | jq

# With GROQ_API_KEY (uses Groq if available)
GROQ_API_KEY=gsk_xxxxx npm run dev
```

## Summary

✅ **Cost: $0** (completely free)
✅ **No API keys required** (offline mode works)
✅ **Optional: Add Groq API key for better AI** (still free)
✅ **All data stays on your server** (Supabase)
✅ **Can scale to 1000+ students** (no extra cost)

**That's it! You have a complete, free academic record generator.**
