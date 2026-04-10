"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function TipTapImpl({ content, onChange }: { content: string, onChange?: (val: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "<p>Start typing your record here...</p>",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-brand sm:prose-base max-w-none focus:outline-none min-h-[300px] p-6 text-slate-800 dark:text-slate-200",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
      <div className="border-b border-slate-100 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/50 flex gap-1">
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-md text-sm font-bold ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'}`}
        >
          B
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-md text-sm italic ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'}`}
        >
          I
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'}`}
        >
          H2
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
