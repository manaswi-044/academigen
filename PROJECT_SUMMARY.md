# AcademiGen Project Summary

AcademiGen is an AI-powered academic record generator designed for students to automate lab record writing, code execution, and document formatting.

## 🚀 Tech Stack

### Frontend & UI
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Native v4 configuration)
- **Icons**: Lucide React
- **Animations**: CSS Transitions & Framer Motion (installed)
- **Adaptive UI**: Hardware-concurrency aware rendering (dynamic glassmorphism)

### Backend & Infrastructure
- **Auth & Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Rate Limiting**: Upstash Redis
- **PWA**: `next-pwa` for offline capabilities

### Core Engines
- **Text Editor**: TipTap (Rich Text)
- **Code Editor**: Monaco (VS Code engine)
- **Execution**: Pyodide (Python WASM in-browser)

---

## 📂 Current File Structure

```text
/src
├── app/
│   ├── (auth)/             # Authentication Group
│   │   ├── login/          # Login Page (Email/Google)
│   │   └── signup/         # Signup Page
│   ├── auth/callback/      # OAuth Handlers
│   ├── onboarding/         # 3-Step Setup Flow
│   ├── globals.css         # Theme & Glassmorphism
│   ├── layout.tsx          # Root Layout (Banner + Wrappers)
│   └── page.tsx            # Hero Landing & Instant Demo
├── components/
│   ├── editor/             # Lazy-loaded Editors
│   ├── AdaptiveUIWrapper.ts # Hardware filter guard
│   └── OfflineBanner.tsx   # Network status indicator
├── hooks/
│   ├── useAdaptiveUI.ts    # Device capability detection
│   └── useOfflineSync.ts   # Autosave & Sync loop
├── lib/
│   ├── execute/            # Pyodide script injection
│   ├── storage/            # IndexedDB Promise wrapper
│   └── supabase/           # Client/Server client factories
├── middleware.ts           # Auth guards & Session refresh
└── next.config.ts          # PWA & Service Worker config
```

---

## ✅ Completed Features

### Phase 1: Foundations & Offline Core
- [x] **Project Scaffolding**: Next.js 15 + Tailwind v4 + PWA setup.
- [x] **Adaptive UI**: System that automatically disables heavy blur effects on low-end devices.
- [x] **Instant Demo**: Functionality to trigger record generation from the landing page.
- [x] **3-Step Onboarding**: Subject selection, Language setup, and Template configuration.
- [x] **Lazy Editors**: Both Monaco and TipTap load dynamically to keep bundles small (<150KB).
- [x] **Offline Storage**: IndexedDB integration with a 30-second background autosave loop.
- [x] **WASM Execution**: Python code execution runs natively in the browser via Pyodide.

### Phase 2: Supabase & Infrastructure (In Progress)
- [x] **Supabase Setup**: Client/Server client factories and environment configuration.
- [x] **Authentication**: Beautiful Login/Signup pages using Supabase Auth.
- [x] **OAuth Support**: Google Login handler successfully implemented.
- [x] **Auth Guards**: Middleware protecting dashboard and editor routes.

---

## ⏳ Pending Tasks

### Phase 2: Persistence & Storage
- [ ] **Database Schema**: Push SQL tables (profiles, documents, versions) to Supabase.
- [ ] **Data Queries**: Implement CRUD functions in `queries.ts`.
- [ ] **Storage Integration**: Set up Cloudflare R2 for PDF and screenshot uploads.
- [ ] **Sync Migration**: Move `localStorage` data to Supabase upon login.
- [ ] **Rate Limiting**: Apply Upstash Redis limits to AI and Execution endpoints.

### Phase 3: AI Intelligence (Future)
- [ ] **Claude AI Integration**: Edge streaming for lab record generation.
- [ ] **Fallback System**: 3-layer AI resilience loop (Haiku -> LLaMA3 -> Templates).
- [ ] **Document Export**: PDF/DOCX generation using templates.
- [ ] **Verification Loop**: AI auto-fixes code based on browser execution errors.

---

*Last Updated: April 11, 2026*
