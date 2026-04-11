import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDocuments } from "@/lib/supabase/queries";
import Link from "next/link";
import { FileText, Plus, Clock, BookOpen } from "lucide-react";

export const metadata = {
  title: "Dashboard | AcademiGen",
  description: "Manage your academic lab records",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch documents
  let documents: any[] = [];
  try {
    documents = await getDocuments();
  } catch {
    // Table may be empty or not yet set up — graceful fallback
    documents = [];
  }

  const prefs = await supabase
    .from("profiles")
    .select("full_name, subject, language")
    .eq("id", user.id)
    .single();

  const name = prefs.data?.full_name ?? user.email?.split("@")[0] ?? "Student";
  const subject = prefs.data?.subject ?? "General";

  return (
    <div className="flex-1 flex flex-col min-h-screen p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gradient mb-2">
          Welcome back, {name} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Subject: <span className="font-semibold text-slate-700 dark:text-slate-200">{subject}</span>
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          href="/editor/new"
          className="group flex items-center gap-4 p-6 bg-gradient-to-br from-brand-600 to-accent rounded-2xl text-white shadow-xl shadow-brand-500/20 hover:scale-[1.02] transition-transform"
        >
          <div className="bg-white/20 rounded-xl p-3">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">New Record</h3>
            <p className="text-white/70 text-sm">Start writing with AI</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 p-6 glass rounded-2xl shadow-md">
          <div className="bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl p-3">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl dark:text-white">{documents.length}</h3>
            <p className="text-slate-500 text-sm">Total Records</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 glass rounded-2xl shadow-md">
          <div className="bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl p-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl dark:text-white">{subject}</h3>
            <p className="text-slate-500 text-sm">Active Subject</p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="text-xl font-bold mb-4 dark:text-white">Your Records</h2>

        {documents.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No records yet</h3>
            <p className="text-slate-400 mb-6">Create your first AI-powered lab record to get started.</p>
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Record
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/editor/${doc.id}`}
                className="glass rounded-2xl p-6 hover:shadow-lg hover:scale-[1.01] transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {doc.title}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    doc.status === "complete"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{doc.subject} • {doc.language}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
