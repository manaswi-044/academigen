# Phase 2 Implementation Guide

## What's Been Added

This commit implements the Phase 2 persistence layer for AcademiGen:

### 1. **Database Query Layer** (`src/lib/supabase/queries.ts`)
- Complete CRUD operations for Documents, Versions, and Templates
- Type-safe Supabase queries with proper error handling
- Functions:
  - `createDocument()` - Create new lab record
  - `getDocument()` - Fetch single document
  - `listDocuments()` - List all user documents with pagination
  - `updateDocument()` - Save changes to document
  - `deleteDocument()` - Remove document
  - `createVersion()` - Create version snapshot
  - `getVersions()` - Fetch version history
  - `restoreVersion()` - Restore document to previous version
  - `getTemplates()` - Fetch templates by subject
  - `createTemplate()` - Upload custom template

### 2. **API Routes** (RESTful endpoints)

#### Documents
- `GET /api/documents` - List all documents (paginated)
- `POST /api/documents` - Create new document
- `GET /api/documents/[id]` - Get single document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

#### Versions
- `GET /api/documents/[id]/versions` - Get version history
- `POST /api/documents/[id]/versions` - Create version snapshot
- `POST /api/documents/[id]/versions/[versionId]/restore` - Restore version

#### Export
- `POST /api/export/pdf` - Generate PDF (calls Python FastAPI service)

#### Templates
- `GET /api/templates` - List templates by subject

#### Sync
- `POST /api/sync/localstorage` - Migrate localStorage to Supabase on login

### 3. **Storage Layer** (`src/lib/supabase/storage.ts`)
- Upload files to Supabase Storage / Cloudflare R2
- `uploadFile()` - Upload PDF, screenshots, templates
- `getPublicUrl()` - Get signed URLs for downloads
- `deleteFile()` - Remove old files

### 4. **Hooks for UI Integration**

#### `useDocuments()` - Manage document lifecycle
- Fetch all documents
- Create new document
- Delete document
- Built-in loading, error, and state management

#### `useDocumentSync()` - Auto-save changes
- Debounced saves (default: 2 seconds)
- Prevents duplicate saves
- Runs in background without blocking UI

### 5. **Security**
- All endpoints enforce authentication (JWT via Supabase)
- Row-Level Security (RLS) policies check ownership
- Only users can access their own documents
- Service role key protected on backend

## Next Steps

### 1. Set Up Supabase
```bash
# Copy example env file
cp .env.local.example .env.local

# Add your Supabase credentials
```

### 2. Run Database Schema
In Supabase SQL Editor, copy the entire contents of `database_schema.sql` and execute.

This will:
- Create all required tables
- Set up Row-Level Security policies
- Create auto-sync trigger for new users
- Create auto-timestamp update trigger

### 3. Start Python Service
```bash
cd python-service
pip install -r requirements.txt
fastapi run main.py
# Runs at http://localhost:8000
```

### 4. Test in Frontend
```bash
npm run dev

# Test document creation:
fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Bubble Sort',
    subject: 'Data Structures',
    language: 'Python'
  })
}).then(r => r.json()).then(console.log)
```

## Using the Hooks in Components

### List Documents
```tsx
import { useDocuments } from '@/hooks/useDocuments';

export default function Dashboard() {
  const { documents, loading, error, createDocument, deleteDocument } = useDocuments();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <p>{doc.subject}</p>
          <button onClick={() => deleteDocument(doc.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Auto-Save Editor
```tsx
import { useDocumentSync } from '@/hooks/useDocumentSync';

export default function Editor({ documentId, content, onChange }) {
  const { debouncedSave } = useDocumentSync(documentId);

  const handleChange = (e) => {
    const newContent = { ...content, [e.target.name]: e.target.value };
    onChange(newContent);
    debouncedSave(newContent); // Auto-save after 2 seconds
  };

  return (
    <input
      name="title"
      value={content.title}
      onChange={handleChange}
      placeholder="Program title"
    />
  );
}
```

## Environment Variables Needed

```env
# Core
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Python backend
PYTHON_SERVICE_URL=http://localhost:8000

# Optional: Rate limiting
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Optional: Storage (if not using Supabase Storage)
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=academigen-storage
```

## What's Still Missing (Phase 3)

- [ ] Claude AI integration for NL-to-record generation
- [ ] Code error detection and auto-fix (partially done in `/api/fix-code`)
- [ ] Template upload and parsing (PDF/DOCX)
- [ ] Document export to DOCX
- [ ] Flowchart generation from code
- [ ] Regional language support
- [ ] LMS integrations (Google Classroom, Moodle)
- [ ] Rate limiting via Upstash
- [ ] Advanced AI features (viva Q&A, complexity analysis)

## Files Modified/Created

```
✅ src/lib/supabase/queries.ts (NEW) - 270 lines
✅ src/lib/supabase/storage.ts (NEW) - 60 lines
✅ src/app/api/documents/route.ts (NEW) - 50 lines
✅ src/app/api/documents/[id]/route.ts (NEW) - 90 lines
✅ src/app/api/documents/[id]/versions/route.ts (NEW) - 70 lines
✅ src/app/api/documents/[id]/versions/[versionId]/restore/route.ts (NEW) - 40 lines
✅ src/app/api/templates/route.ts (NEW) - 20 lines
✅ src/app/api/export/pdf/route.ts (NEW) - 70 lines
✅ src/app/api/sync/localstorage/route.ts (NEW) - 70 lines
✅ src/hooks/useDocuments.ts (NEW) - 90 lines
✅ src/hooks/useDocumentSync.ts (NEW) - 80 lines
✅ .env.local.example (NEW) - Config template
✅ IMPLEMENTATION_GUIDE.md (THIS FILE)
```

## Testing Checklist

- [ ] Supabase tables created successfully
- [ ] Auth guard working on all endpoints
- [ ] Can create new document
- [ ] Can fetch document list
- [ ] Can update document content
- [ ] Can create version snapshot
- [ ] Can restore from version
- [ ] Can delete document
- [ ] localStorage sync works on login
- [ ] PDF export calls Python service
- [ ] RLS policies prevent unauthorized access

## Common Issues

### "Missing SUPABASE_SERVICE_ROLE_KEY"
- This is needed for server-side operations. Add it to `.env.local`
- Get it from Supabase dashboard → Settings → API

### "PDF export returns 500"
- Ensure Python FastAPI service is running on the configured URL
- Check `PYTHON_SERVICE_URL` in `.env.local`

### "Cannot read documents - 403 Forbidden"
- This means RLS policy is blocking access
- Ensure you're authenticated
- Check that document.user_id matches auth.uid()

---

**Ready to proceed to Phase 3?**
Next: Claude AI integration + advanced features
