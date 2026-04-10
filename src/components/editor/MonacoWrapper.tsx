"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-900 flex items-center justify-center rounded-xl border border-slate-700 animate-pulse">
      <div className="flex items-center text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading Editor Engine...</span>
      </div>
    </div>
  ),
});

interface MonacoWrapperProps {
  language: string;
  value: string;
  onChange: (val: string | undefined) => void;
}

export default function MonacoWrapper({ language, value, onChange }: MonacoWrapperProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <MonacoEditor
        height="400px"
        language={language.toLowerCase() === "c / c++" ? "c" : language.toLowerCase()}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Geist Mono', 'Fira Code', monospace",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
        }}
      />
    </div>
  );
}
