"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveDocumentLocally, queueForSync } from "@/lib/storage/indexedDB";
import { runPythonCode } from "@/lib/execute/pyodide";
import {
  Sparkles, Play, Save, ArrowLeft, Loader2,
  CheckCircle2, AlertCircle, Terminal, FileText, Download, Wrench
} from "lucide-react";
import Link from "next/link";

interface EditorState {
  title: string;
  subject: string;
  language: string;
  exNumber: string;
  generatedContent: string;
  code: string;
  output: string;
  status: "idle" | "generating" | "executing" | "saving" | "done" | "exporting" | "fixing";
  error: string;
  layer: "" | "claude" | "groq" | "offline";
}

export default function EditorPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [state, setState] = useState<EditorState>({
    title: "",
    subject: "",
    language: "Python",
    exNumber: "",
    generatedContent: "",
    code: "",
    output: "",
    status: "idle",
    error: "",
    layer: "",
  });

  // Auto-load preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefs = localStorage.getItem("academigen_prefs");
      if (prefs) {
        const { subject, language } = JSON.parse(prefs);
        setState((s) => ({ ...s, subject: subject ?? "", language: language ?? "Python" }));
      }
    }
  }, []);

  const set = (key: keyof EditorState, value: string) =>
    setState((s) => ({ ...s, [key]: value }));

  // ── AI Generation ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!state.title) {
      setState((s) => ({ ...s, error: "Please enter a program title first." }));
      return;
    }

    setState((s) => ({ ...s, status: "generating", error: "", generatedContent: "" }));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programTitle: state.title,
          language: state.language,
          subject: state.subject,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              setState((s) => ({ ...s, generatedContent: fullText }));
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch {}
        }
      }

      // Extract code block from generated content
      const codeMatch = fullText.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        setState((s) => ({ ...s, code: codeMatch[1], status: "idle" }));
      } else {
        setState((s) => ({ ...s, status: "idle" }));
      }
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message, status: "idle" }));
    }
  };

  // ── Code Execution ─────────────────────────────────────────────────────────
  const handleExecute = async () => {
    if (!state.code) return;
    setState((s) => ({ ...s, status: "executing", output: "", error: "" }));

    try {
      if (state.language === "Python") {
        // Client-side via Pyodide
        const result = await runPythonCode(state.code);
        setState((s) => ({ ...s, output: result, status: "idle" }));
      } else {
        // Server-side via Piston
        const res = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: state.code, language: state.language }),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setState((s) => ({
          ...s,
          output: result.stdout || result.stderr || "No output.",
          status: "idle",
        }));
      }
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message, status: "idle" }));
    }
  };

  // ── Auto-Fix Code ──────────────────────────────────────────────────────────
  const handleFixCode = async () => {
    setState((s) => ({ ...s, status: "fixing", error: "" }));
    try {
      const errorText = state.error || state.output;
      const res = await fetch("/api/fix-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: state.code, error: errorText, language: state.language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fix code");
      
      setState((s) => ({ 
        ...s, 
        code: data.fixedCode, 
        status: "idle", 
        output: "Code fixed by AI! Click Run to test it.",
        error: ""
      }));
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message, status: "idle" }));
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setState((s) => ({ ...s, status: "saving" }));

    const docId = isNew ? crypto.randomUUID() : params.id;
    const doc = {
      id: docId,
      title: state.title || "Untitled Record",
      subject: state.subject,
      language: state.language,
      content_json: {
        generated: state.generatedContent,
        code: state.code,
        output: state.output,
      },
      updated_at: Date.now(),
    };

    // Save locally first
    await saveDocumentLocally(doc);
    await queueForSync(docId);

    // Try cloud save
    try {
      await supabase.from("documents").upsert({
        id: docId,
        title: doc.title,
        subject: doc.subject,
        language: doc.language,
        content_json: doc.content_json,
      });
    } catch {}

    setState((s) => ({ ...s, status: "done" }));
    setTimeout(() => setState((s) => ({ ...s, status: "idle" })), 2000);
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setState((s) => ({ ...s, status: "exporting", error: "" }));
    try {
      const docId = isNew ? crypto.randomUUID() : params.id;
      // Extract aim, algorithm, result from generated content
      const aimMatch = state.generatedContent.match(/\*\*Aim\*\*[^\n]*\n([\s\S]*?)(?=\n\*\*|$)/i) || state.generatedContent.match(/Aim:[^\n]*\n([\s\S]*?)(?=\n|$)/i);
      const algoMatch = state.generatedContent.match(/\*\*Algorithm\*\*[^\n]*\n([\s\S]*?)(?=\n\*\*|$)/i) || state.generatedContent.match(/Algorithm:[^\n]*\n([\s\S]*?)(?=\n|$)/i);
      const resultMatch = state.generatedContent.match(/\*\*Result\*\*[^\n]*\n([\s\S]*?)(?=\n\*\*|$)/i) || state.generatedContent.match(/Result:[^\n]*\n([\s\S]*?)(?=\n|$)/i);

      const content = {
        title: state.title || "Untitled Record",
        subject: state.subject,
        language: state.language,
        aim: aimMatch ? aimMatch[1].trim() : "To execute the program.",
        algorithm: algoMatch ? algoMatch[1].trim() : "1. Start\n2. Execute logic\n3. Stop",
        code: state.code,
        output: state.output,
        result: resultMatch ? resultMatch[1].trim() : "Program executed successfully."
      };

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");

      if (data.url) {
        window.open(data.url, "_blank");
      }
      setState((s) => ({ ...s, status: "idle" }));
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message, status: "idle" }));
    }
  };

  const isbusy = ["generating", "executing", "saving", "exporting", "fixing"].includes(state.status);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20 px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <input
          type="text"
          value={state.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Program Title..."
          className="flex-1 bg-transparent font-bold text-xl focus:outline-none dark:text-white placeholder:text-slate-400"
        />
        <div className="flex items-center gap-2">
          {state.status === "done" && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
          <button
            onClick={handleExport}
            disabled={isbusy}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {state.status === "exporting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
          <button
            onClick={handleSave}
            disabled={isbusy}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {state.status === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Left Panel — Controls + Generated Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Config Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Subject</label>
              <input
                value={state.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="e.g. Data Structures"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Language</label>
              <select
                value={state.language}
                onChange={(e) => set("language", e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {["Python", "C", "C++", "C / C++", "Java", "SQL"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isbusy}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent hover:opacity-90 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-brand-500/20 disabled:opacity-60 transition-all"
          >
            {state.status === "generating" ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate with AI</>
            )}
          </button>

          {/* Error */}
          {state.error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-500/20">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {state.error}
            </div>
          )}

          {/* Generated Content Preview */}
          {state.generatedContent && (
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Generated Record</span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-y-auto max-h-96 leading-relaxed text-slate-700 dark:text-slate-300">
                {state.generatedContent}
              </pre>
            </div>
          )}
        </div>

        {/* Right Panel — Code Editor + Terminal */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</span>
              <div className="flex gap-2">
                {(state.error || (state.output && state.output.toLowerCase().includes("error"))) && (
                  <button
                    onClick={handleFixCode}
                    disabled={isbusy}
                    className="flex items-center gap-2 px-4 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-700 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 dark:text-brand-300 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors border border-brand-200 dark:border-brand-800"
                  >
                    {state.status === "fixing" ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Fixing...</>
                    ) : (
                      <><Wrench className="w-3 h-3" /> Auto-Fix</>
                    )}
                  </button>
                )}
                <button
                  onClick={handleExecute}
                  disabled={isbusy || !state.code}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
                >
                  {state.status === "executing" ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Running...</>
                  ) : (
                    <><Play className="w-3 h-3" /> Run</>
                  )}
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={state.code}
              onChange={(e) => set("code", e.target.value)}
              spellCheck={false}
              rows={16}
              placeholder={`Write your ${state.language} code here...`}
              className="w-full font-mono text-sm bg-slate-900 text-green-400 border border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none leading-relaxed"
            />
          </div>

          {/* Terminal Output */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Output</span>
            </div>
            <pre className="min-h-24 font-mono text-sm bg-slate-900 text-green-400 border border-slate-700 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
              {state.output || <span className="text-slate-600">Output will appear here after running...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
