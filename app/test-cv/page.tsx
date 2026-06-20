"use client";
import { useState, useRef } from "react";

const JOB_ROLES = [
  "Data Analyst", "Data Scientist", "Data Engineer", "Business Analyst",
  "Power BI Developer", "Software Engineer / Developer", "Frontend Developer",
  "Backend Developer", "Full Stack Developer", "DevOps Engineer",
  "Machine Learning Engineer", "SQL Developer / Database Developer",
];

const EXP_OPTIONS = [
  "0-2 years (Fresher)", "2-4 years", "4-7 years", "7-10 years", "10+ years",
];

export default function TestCVPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [jobRole, setJobRole]   = useState(JOB_ROLES[0]);
  const [experience, setExp]    = useState(EXP_OPTIONS[0]);
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please upload your CV file."); return; }
    setError("");
    setLoading(true);
    setDone(false);
    try {
      const fd = new FormData();
      fd.append("file",       file);
      fd.append("jobRole",    jobRole);
      fd.append("experience", experience);
      fd.append("email",      email);
      fd.append("phone",      phone);
      fd.append("linkedin",   linkedin);
      fd.append("github",     github);

      const res = await fetch("/api/test-rewrite", { method: "POST", body: fd });

      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(msg || "Rewrite failed");
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      const name = file.name.replace(/\.[^.]+$/, "");
      a.download = `${name}-ATS-Optimised.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-7">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ATS-Optimised CV — New Template
            </h1>
            <p className="mt-1 text-blue-100 text-sm">
              Upload your CV and get a professionally redesigned two-column PDF, free.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Your CV <span className="text-blue-400">*</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-white/20 hover:border-blue-500 transition-colors rounded-xl p-5 text-center"
              >
                {file ? (
                  <p className="text-sm text-blue-300 font-medium truncate">{file.name}</p>
                ) : (
                  <>
                    <p className="text-slate-400 text-sm">Click to upload PDF, DOC, or DOCX</p>
                    <p className="text-slate-600 text-xs mt-1">Max 10 MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Job role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Job Role</label>
              <select
                value={jobRole}
                onChange={e => setJobRole(e.target.value)}
                className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JOB_ROLES.map(r => <option key={r} value={r} className="bg-slate-800">{r}</option>)}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Experience Level</label>
              <select
                value={experience}
                onChange={e => setExp(e.target.value)}
                className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXP_OPTIONS.map(o => <option key={o} value={o} className="bg-slate-800">{o}</option>)}
              </select>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9XXXXXXXXX"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* LinkedIn + GitHub */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">LinkedIn</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/you"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub</label>
                <input
                  type="url"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  placeholder="github.com/you"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {done && !loading && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-sm text-green-400">
                Your new-template CV is downloading now!
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all
                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                text-white shadow-lg shadow-blue-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Rewriting your CV... (~30 seconds)
                </span>
              ) : "Generate My New CV →"}
            </button>

            <p className="text-center text-xs text-slate-600">
              Free preview — no payment required. Powered by Gemini AI.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
