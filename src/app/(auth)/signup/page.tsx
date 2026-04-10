"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full bg-gradient-premium relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-32 left-32 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
        <div className="absolute bottom-32 -right-16 w-96 h-96 bg-brand-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
      </div>

      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-white mb-4 shadow-lg shadow-accent/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join AcademiGen for free.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="student@college.edu"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-colors flex items-center justify-center shadow-lg shadow-accent/20 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
