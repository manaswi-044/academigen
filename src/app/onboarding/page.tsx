"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, UploadCloud } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("");
  const [template, setTemplate] = useState("default");
  const router = useRouter();

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("academigen_prefs", JSON.stringify({ subject, language, template }));
    }
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-in fade-in duration-500">
      <div className="w-full max-w-xl glass rounded-3xl p-8 relative shadow-2xl">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="mb-8 mt-4 flex items-center justify-between">
          <button 
            onClick={handlePrev}
            className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-slate-500 tracking-widest uppercase">Step {step} of 3</span>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Step 1: Subject */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div>
              <h2 className="text-3xl font-extrabold mb-2 dark:text-white">What's your subject?</h2>
              <p className="text-slate-500 mb-6">This helps us load the right core sections.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {['Data Structures', 'Python Lab', 'DBMS', 'OS / Networks', 'Web Tech', 'Other'].map((subj) => (
                <button
                  key={subj}
                  onClick={() => { setSubject(subj); setTimeout(handleNext, 300); }}
                  className={`p-4 rounded-xl text-left font-medium transition-all duration-200 border-2 ${
                    subject === subj 
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:-translate-y-1'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{subj}</span>
                    {subject === subj && <CheckCircle2 className="h-5 w-5 text-brand-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Language */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div>
              <h2 className="text-3xl font-extrabold mb-2 dark:text-white">Execution Language?</h2>
              <p className="text-slate-500 mb-6">Which language will you be writing and running your code in?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {['Python', 'C / C++', 'Java', 'SQL'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setTimeout(handleNext, 300); }}
                  className={`p-4 rounded-xl text-left font-medium transition-all duration-200 border-2 ${
                    language === lang 
                      ? 'border-accent bg-accent/10 text-accent dark:text-accent-hover' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:-translate-y-1'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{lang}</span>
                    {language === lang && <CheckCircle2 className="h-5 w-5 text-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Template */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div>
              <h2 className="text-3xl font-extrabold mb-2 dark:text-white">Choose Template</h2>
              <p className="text-slate-500 mb-6">Upload your official college template PDF/DOCX or use our academic defaults.</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setTemplate("upload")}
                className={`w-full p-6 rounded-xl text-left transition-all duration-200 border-2 border-dashed ${
                  template === "upload" 
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' 
                    : 'border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${template === 'upload' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">Upload Custom Template</h3>
                    <p className="text-sm text-slate-500">PDF or DOCX from your college</p>
                  </div>
                  {template === "upload" && <CheckCircle2 className="h-6 w-6 text-brand-500 ml-auto" />}
                </div>
              </button>

              <button
                onClick={() => setTemplate("default")}
                className={`w-full p-6 rounded-xl text-left transition-all duration-200 border-2 ${
                  template === "default" 
                    ? 'border-brand-500 shadow-lg shadow-brand-500/20' 
                    : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">Use Academic Default</h3>
                    <p className="text-sm text-slate-500">Standardized layout perfect for most subjects</p>
                  </div>
                  {template === "default" && <CheckCircle2 className="h-6 w-6 text-brand-500 ml-auto" />}
                </div>
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={handleFinish} className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl flex items-center transition-colors">
                Finish Setup <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
