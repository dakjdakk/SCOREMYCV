"use client";
import { useState } from "react";

const IT_JOB_ROLES = [
  "Software Engineer / Developer","Frontend Developer","Backend Developer",
  "Full Stack Developer","React Developer","Angular Developer","Vue.js Developer",
  "Node.js Developer","Python Developer","Java Developer",".NET Developer",
  "PHP Developer","Mobile Developer (Android)","Mobile Developer (iOS)",
  "React Native Developer","Data Analyst","Data Scientist","Data Engineer",
  "Machine Learning Engineer","AI / Generative AI Engineer","Computer Vision Engineer",
  "NLP Engineer","Business Intelligence Developer","Power BI Developer",
  "Tableau Developer","SQL Developer / Database Developer","Database Administrator (DBA)",
  "DevOps Engineer","Site Reliability Engineer (SRE)","Cloud Engineer (AWS)",
  "Cloud Engineer (Azure)","Cloud Engineer (GCP)","Platform Engineer",
  "Kubernetes / Docker Engineer","QA Engineer / Test Engineer",
  "Automation Test Engineer","Performance Test Engineer","Cybersecurity Analyst",
  "Information Security Engineer","Penetration Tester / Ethical Hacker",
  "Network Engineer","System Administrator","IT Support Engineer / Help Desk",
  "Technical Lead","Solution Architect","Enterprise Architect","Cloud Architect",
  "Product Manager (Technical)","Business Analyst","Scrum Master","Agile Coach",
  "IT Project Manager","Salesforce Developer","SAP Consultant","ERP Consultant",
  "Blockchain Developer","Embedded Systems Engineer","Game Developer",
  "UI/UX Designer","Technical Writer",
];

const OPTIONS = [
  { id: "1", label: "Option 1", desc: "Standard — Education left, Certs by length rule", color: "purple" },
  { id: "2", label: "Option 2", desc: "Education always in right column", color: "blue" },
  { id: "3", label: "Option 3", desc: "Education + Certifications both always in right column", color: "green" },
  { id: "4", label: "Option 4", desc: "Single-column traditional format — no sidebar, full width", color: "orange" },
  { id: "5", label: "Option 5", desc: "Option 4 + ATS keyword injection in summary & skills only", color: "teal" },
];

export default function TestRewritePage() {
  const [file,     setFile]     = useState<File | null>(null);
  const [jobRole,  setJobRole]  = useState("Data Analyst");
  const [linkedin,  setLinkedin]  = useState("");
  const [github,    setGithub]    = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [loading,  setLoading]  = useState<string | null>(null); // "1" | "2" | null
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState<string | null>(null); // which option completed

  async function handleGenerate(option: string) {
    if (!file) { setError("Please select a CV file first."); return; }
    setLoading(option); setError(""); setDone(null);

    try {
      const fd = new FormData();
      fd.append("file",       file);
      fd.append("jobRole",    jobRole);
      fd.append("experience", "0 – 2 years");
      fd.append("email",      "");
      fd.append("linkedin",   linkedin);
      fd.append("github",     github);
      fd.append("portfolio",  portfolio);
      fd.append("scoreBefore","0");
      fd.append("paymentId",  "ADMIN-TEST");
      fd.append("option",     option);

      const res = await fetch("/api/admin/test-rewrite", { method: "POST", body: fd });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Rewrite failed.");
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${file.name.replace(/\.[^.]+$/, "")}-option${option}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(option);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <a href="/admin" className="text-slate-500 hover:text-slate-700 text-sm">← Admin</a>
          <h1 className="text-2xl font-extrabold text-slate-800">🧪 Test CV Rewrite</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <p className="text-slate-500 text-sm">
            Upload a CV, pick a job role, then click an option to generate and download the PDF instantly.
          </p>

          {/* File upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">CV File <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => { setFile(e.target.files?.[0] || null); setDone(null); setError(""); }}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:text-sm file:font-semibold hover:file:bg-purple-100"
            />
            {file && <p className="text-xs text-slate-400 mt-1">{file.name}</p>}
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Job Role <span className="text-red-500">*</span></label>
            <select
              value={jobRole}
              onChange={e => setJobRole(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {IT_JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">LinkedIn URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">GitHub URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="https://github.com/username"
              value={github}
              onChange={e => setGithub(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Portfolio URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="https://yourportfolio.com"
              value={portfolio}
              onChange={e => setPortfolio(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Option buttons */}
          <div className="flex flex-col gap-3 pt-1">
            {OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleGenerate(opt.id)}
                disabled={!!loading}
                className={`flex items-center gap-4 py-3 px-4 rounded-xl font-bold text-sm transition disabled:opacity-50 border-2 text-left
                  ${done === opt.id
                    ? "bg-green-50 border-green-400 text-green-700"
                    : opt.color === "purple"
                    ? "bg-purple-600 hover:bg-purple-700 border-purple-600 text-white"
                    : opt.color === "blue"
                    ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                    : "bg-teal-600 hover:bg-teal-700 border-teal-600 text-white"
                  }`}
              >
                <span className="text-xl shrink-0">
                  {loading === opt.id ? "⏳" : done === opt.id ? "✅" : opt.id === "1" ? "📄" : opt.id === "2" ? "📐" : "🔀"}
                </span>
                <div>
                  <div>{loading === opt.id ? "Generating..." : opt.label}</div>
                  <div className={`text-xs font-normal leading-tight mt-0.5 ${done === opt.id ? "text-green-600" : "opacity-80"}`}>
                    {done === opt.id ? "Downloaded!" : opt.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
