"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// TipTap components are heavy, ensure SSR is strictly disabled for these rich chunks.
const EditorProvider = dynamic(() => import("@tiptap/react").then(m => m.EditorProvider), { ssr: false });
const StarterKit = dynamic(() => import("@tiptap/starter-kit").then(m => m.default as any), { ssr: false }) as any;

// Simple wrapper fallback while TipTap parses modules
function TipTapFallback() {
  return (
    <div className="w-full h-full min-h-[200px] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading formatting engine...</span>
      </div>
    </div>
  );
}

// We use Next.js dynamic to import the actual implementation 
// so the layout doesn't crash on initial hydration.
const ActualTipTap = dynamic(
  () => import("./TipTapImpl"),
  { 
    ssr: false, 
    loading: () => <TipTapFallback /> 
  }
);

export default function TipTapWrapper({ content, onChange }: { content: string, onChange?: (val: string) => void }) {
  return <ActualTipTap content={content} onChange={onChange} />;
}
