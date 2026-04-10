# Build Notes: Phase 1 (FTUX & Offline Core)

## What We Built

1.  **Project Architecture:** Initialized Next.js 15 (App Router) scaffolding completely configured with Tailwind CSS, `next-pwa` wrapper, and core UI dependencies.
2.  **Adaptive UI:** Created `src/hooks/useAdaptiveUI.ts` (with a zero-crash fallback pattern) and wrapped it in `AdaptiveUIWrapper.tsx` inside `layout.tsx` to automatically disable taxing CSS glass filters on slower mobile devices.
3.  **FTUX:** Built an elegant `app/page.tsx` landing page containing the Instant Demo. Followed by a dynamic 3-step interactive setup process in `app/onboarding/page.tsx`, which persists directly to `localStorage` and routes the user into the primary application.
4.  **Lazy Editors:** Encapsulated massive web bundles (Monaco for code, TipTap for text) in `next/dynamic` wrappers (`src/components/editor/*`) to aggressively preserve the 150KB fast load objective.
5.  **Browser Execution:** Set up `pyodide.ts` (`src/lib/execute/pyodide.ts`) that downloads the Pyodide WASM environment over CDN automatically without backend orchestration. Placed explicit `try/catch` checks for absent connections.
6.  **Offline State Engine:** Modeled an IndexedDB instance from scratch using Promises inside `src/lib/storage/indexedDB.ts`. Linked it directly to `useOfflineSync.ts` to push autosaves every 30 seconds. Finally, wrapped the App Router in a static DOM element (`OfflineBanner.tsx`) that surfaces instantly when internet access is lost without disrupting user work.

## What's Next
Ready for Phase 2: Supabase Integrations (Auth, DB Sync, Server Components).
