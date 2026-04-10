import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FileCode2, Sparkles, TerminalSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center overflow-x-hidden">
      {/* Premium Hero Section */}
      <div className="w-full relative px-6 py-24 flex flex-col items-center justify-center text-center bg-gradient-premium">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-md">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>The intelligent way to write lab records</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
            Turn Effort into Excellence, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">Automatically.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-blue-100/90 leading-relaxed">
            AcademiGen uses AI to instantly generate structured academic records, execute code, and export perfect PDFs—saving you hours of document formatting.
          </p>
          
          {/* Instant Demo Box (FTUX Step 1) */}
          <div className="mt-12 glass p-2 rounded-2xl max-w-2xl mx-auto shadow-2xl flex flex-col md:flex-row gap-2 transition-transform hover:scale-[1.02] duration-300">
            <input 
              type="text" 
              placeholder="e.g., Python program for Bubble Sort..."
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            />
            <Link href="/onboarding" className="bg-white text-brand-900 rounded-xl px-8 py-4 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap group">
              Try Instant Demo
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Value Proposition Grid */}
      <div className="w-full max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100/50">
            <FileCode2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold dark:text-white">Smart Generation</h3>
          <p className="text-slate-600 dark:text-slate-400">Aim, algorithm, logic, and working code fully written by AI in seconds.</p>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100/50">
            <TerminalSquare className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold dark:text-white">Safe Execution</h3>
          <p className="text-slate-600 dark:text-slate-400">Execute code safely in your browser or our cloud sandboxes to capture verified output screenshots.</p>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
            <Clock className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold dark:text-white">Zero Formatting</h3>
          <p className="text-slate-600 dark:text-slate-400">Upload your college&apos;s template and AcademiGen replicates the exact structure automatically.</p>
        </div>
      </div>
    </div>
  );
}
