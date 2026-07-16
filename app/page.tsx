"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Razorpay window type
declare global {
  interface Window { Razorpay: any; }
}

const OWNER_EMAIL = "scoremycv.in@gmail.com";

// ──────────────────────────────────────────────────────────────────────
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

const EXPERIENCE_LEVELS = [
  "Fresher (0 years)","0 – 2 years","2 – 5 years","5 – 8 years",
  "8 – 10 years","10 – 15 years","15+ years",
];

function generateOrderId() {
  return "SCR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const features = [
  { icon: "📊", title: "ATS Score Report", desc: "See exactly how your resume is scoring and where it is failing — with a full breakdown by category." },
  { icon: "🔑", title: "Missing Keywords Added", desc: "We identify and inject the exact keywords ATS systems scan for, so your resume gets seen." },
  { icon: "✏️", title: "CV Fully Rewritten", desc: "Every section is rewritten professionally — better language, stronger action verbs, and job-role tailored content." },
  { icon: "⚡", title: "Instant PDF Download", desc: "No waiting, no email delays. Your rewritten CV downloads automatically the moment payment is confirmed." },
];

const steps = [
  { step: "01", title: "Upload Your Resume", desc: "Upload your existing resume in PDF or Word format." },
  { step: "02", title: "Get Free ATS Score", desc: "Instantly see your score, missing keywords, and what's holding your resume back." },
  { step: "03", title: "Pay ₹19 Securely", desc: "One-time payment via UPI, GPay, PhonePe, or card. No subscription, no hidden charges." },
  { step: "04", title: "Download Instantly", desc: "Your rewritten, ATS-optimised CV downloads automatically — right away." },
];

const faqs = [
  {
    q: "What is an ATS score and why does it matter?",
    a: "ATS stands for Applicant Tracking System — software companies use to automatically filter resumes before a human ever sees them. If your score is too low, your resume gets rejected instantly. Our free check tells you exactly where you stand.",
  },
  {
    q: "What do I get for ₹19?",
    a: "Your entire CV is professionally rewritten — better language, strong action verbs, missing keywords added, and ATS-optimised formatting. The rewritten CV is generated instantly and downloads as a clean PDF the moment payment is confirmed.",
  },
  {
    q: "Will my CV actually be rewritten — or just suggestions?",
    a: "Fully rewritten. Every section is improved — language, structure, keywords, and formatting — tailored to your target job role. You download the final polished PDF instantly after payment.",
  },
  {
    q: "How long does it take?",
    a: "Instant. Your CV is rewritten in seconds after payment. Your PDF downloads automatically — no waiting, no email.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your resume is used only to generate the rewritten CV. We do not store, sell, or share your information with any third party.",
  },
  {
    q: "Can I use this for any job role or industry?",
    a: "Yes — it works across all IT and tech roles. You choose your target job role and the rewrite is tailored accordingly.",
  },
  {
    q: "What if the download does not start?",
    a: "If the download doesn't start automatically, check your browser's pop-up blocker and allow downloads from scoremycv.in. You can also reach us at scoremycv.in@gmail.com with your payment ID.",
  },
];

// ── ATS Types ─────────────────────────────────────────────────────────
type ScoreBreakdown = { score: number; max: number; label: string; issues: string[] };
type ATSResult = {
  score: number; wordCount: number;
  breakdown: Record<string, ScoreBreakdown>;
  topMissingKeywords: string[]; foundKeywords: string[]; allIssues: string[];
};

// ── Score Gauge ───────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const color    = score >= 90 ? "#16a34a" : score >= 70 ? "#d97706" : "#dc2626";
  const pillText = score >= 90 ? "Shortlist-Ready" : score >= 70 ? "Below Shortlist Threshold" : score >= 50 ? "High Rejection Risk" : "Auto-Rejected by ATS";
  return (
    <div className="flex flex-col items-center">
      <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 shadow-lg"
        style={{ borderColor: color }}>
        <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-xs font-bold" style={{ color }}>/100</span>
      </div>
      <span className="mt-2 text-sm font-bold px-3 py-1 rounded-full"
        style={{ background: color + "20", color }}>
        {pillText}
      </span>
    </div>
  );
}

// ── CV Mockup (animated hero visual) ─────────────────────────────────
function CVMockup() {
  const [score, setScore]   = useState(58);
  const [phase, setPhase]   = useState<"before" | "rewriting" | "after">("before");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    function runCycle() {
      setScore(58); setPhase("before");
      t1 = setTimeout(() => {
        setPhase("rewriting");
        let cur = 58;
        interval = setInterval(() => {
          cur += 1; setScore(cur);
          if (cur >= 95) {
            clearInterval(interval);
            setPhase("after");
            t2 = setTimeout(runCycle, 4000);
          }
        }, 40);
      }, 2500);
    }
    runCycle();
    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scoreColor = score >= 85 ? "#16a34a" : score >= 65 ? "#d97706" : "#dc2626";

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Labels */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all duration-500 ${
          phase === "after" ? "bg-green-100 text-green-700" : phase === "rewriting" ? "bg-amber-100 text-amber-600 animate-pulse" : "bg-slate-100 text-slate-500"
        }`}>
          {phase === "before" ? "❌ Before Rewrite" : phase === "rewriting" ? "⚡ Rewriting CV..." : "✅ After ATS Rewrite"}
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm" style={{ color: scoreColor }}>
          ATS Score: {score}/100
        </span>
      </div>

      {/* CV Card */}
      <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden transition-all duration-700 ${
        phase === "after" ? "border-green-300 shadow-green-100" : "border-slate-200"
      }`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-2.5 border-b border-slate-100 text-center">
          <div className="text-[11px] font-black text-slate-800 tracking-wide uppercase">Swapnil Vainkatrao Mortale</div>
          <div className="text-[9px] font-semibold text-blue-600 mt-0.5">Software Engineer / Developer</div>
          <div className="text-[7px] text-slate-400 mt-0.5">+91 876-764-9179 · swapnil@email.com · Pune, Maharashtra</div>
        </div>

        {/* Two-column body */}
        <div className="flex">
          {/* Left col */}
          <div className="flex-1 px-3 py-3 space-y-2.5">
            <div>
              <div className="text-[7px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-0.5 mb-1.5">Summary</div>
              <div className="space-y-1">
                {[1, 0.9, 0.75].map((w, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${phase === "after" ? "bg-slate-300" : "bg-slate-200"}`} style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[7px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-0.5 mb-1.5">Projects</div>
              <div className="text-[8px] font-bold text-slate-600 mb-1">MGM's Campus Bridge</div>
              <div className="space-y-1">
                {[1, 0.85, 0.95, 0.7].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
              <div className="text-[8px] font-bold text-slate-600 mb-1 mt-2">Promptify AI Assistant</div>
              <div className="space-y-1">
                {[1, 0.9, 0.8].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-20 bg-slate-50 border-l border-slate-100 px-2.5 py-3 space-y-2.5">
            <div>
              <div className="text-[7px] font-black text-blue-600 uppercase tracking-widest mb-1">Skills</div>
              {["Java", "Spring Boot", "React.js", "MySQL"].map(s => (
                <div key={s} className="text-[7px] text-slate-600 leading-5">{s}</div>
              ))}
              {phase === "after" && (
                <div className="mt-0.5 space-y-0.5">
                  {["Docker", "Kubernetes", "REST API", "CI/CD"].map(s => (
                    <div key={s} className="text-[7px] text-green-600 font-semibold leading-5">{s}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-[7px] font-black text-blue-600 uppercase tracking-widest mb-1">Keywords</div>
              {phase === "after" ? (
                ["Microservices", "JWT", "AWS", "Agile"].map(k => (
                  <div key={k} className="text-[7px] text-green-600 font-semibold leading-5">✓ {k}</div>
                ))
              ) : (
                <div className="text-[7px] text-red-400 italic leading-4">Missing keywords detected</div>
              )}
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="text-[7px] text-slate-500 font-semibold whitespace-nowrap">ATS</span>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
            </div>
            <span className="text-[8px] font-black whitespace-nowrap" style={{ color: scoreColor }}>{score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero + ATS Checker (combined above-the-fold section) ─────────────
function HeroSection({ onUpgrade }: {
  onUpgrade: (data: { file: File; jobRole: string; score?: number }) => void;
}) {
  const [file, setFile]       = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<ATSResult | null>(null);

  const canCheck = !!file && !!jobRole;

  async function handleCheck() {
    if (!file || !jobRole) return;
    setError(""); setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobRole", jobRole);
      if (email.trim()) fd.append("email", email.trim());
      const res  = await fetch("/api/ats-score", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to score CV");
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const upsellMsg = result
    ? result.score < 90
      ? `⚠️ Your score is below ${Math.ceil(result.score / 10) * 10} — you are in the rejection zone. Our rewrite pushes your CV to 90+ so recruiters can't ignore you. Just ₹19.`
      : "✅ You're in the shortlist zone! A professional rewrite polishes your CV further and maximises your chances of getting called — just ₹19."
    : "";

  // Scroll to top when results appear
  useEffect(() => {
    if (result) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [result]);

  if (result) return (
    <section className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Score header */}
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-5 sm:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <ScoreGauge score={result.score} />
            <div className="flex-1 text-center sm:text-left w-full">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-1">Your ATS Score: {result.score}/100</h2>
              <p className="text-sm mb-3 font-semibold text-orange-600">{upsellMsg}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div>
                  <button onClick={() => file && onUpgrade({ file, jobRole, score: result?.score })}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm">
                    🚀 Build My ATS-Friendly Resume →
                  </button>
                  <p className="text-xs text-slate-500 mt-1.5">✅ 90+ Score Guaranteed · Instant PDF Download</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* #3 — Issues count banner (only below 85) */}
        {result.score < 90 && (() => {
          const totalIssues = result.allIssues?.length || Object.values(result.breakdown).reduce((acc, b) => acc + b.issues.length, 0);
          return totalIssues > 0 ? (
            <div className="bg-red-600 rounded-3xl p-5 mb-6 flex items-center gap-4">
              <div className="text-4xl font-black text-white">{totalIssues}</div>
              <div>
                <p className="text-white font-extrabold text-lg leading-tight">Issues found in your CV</p>
                <p className="text-red-200 text-sm">Every issue reduces your chances of getting shortlisted. Recruiters won't tell you — they just move on.</p>
              </div>
            </div>
          ) : null;
        })()}

        {/* #1 — Recruiter Reality Check (only below 85) */}
        {result.score < 90 && (
        <div className="bg-white border-2 border-red-100 rounded-3xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👀</span>
            <h4 className="font-extrabold text-slate-800 text-lg">Recruiter Reality Check</h4>
          </div>
          <p className="text-slate-500 text-sm mb-4">A recruiter spends just <span className="text-red-600 font-bold">6 seconds</span> on your CV. Here is what they see:</p>
          <div className="space-y-2.5">
            {result.score < 90 && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5">
                <span className="text-base mt-0.5">❌</span>
                <span className="text-sm text-red-700 font-medium">CV scores below the 90+ shortlist threshold at most companies</span>
              </div>
            )}
            {result.topMissingKeywords.length > 0 && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5">
                <span className="text-base mt-0.5">❌</span>
                <span className="text-sm text-red-700 font-medium">{result.topMissingKeywords.length} keywords missing that ATS systems scan for</span>
              </div>
            )}
            {Object.values(result.breakdown).some(b => b.score / b.max < 0.5) && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5">
                <span className="text-base mt-0.5">❌</span>
                <span className="text-sm text-red-700 font-medium">Critical CV sections are weak or incomplete</span>
              </div>
            )}
            {Object.values(result.breakdown).some(b => b.label === "Action Verbs" && b.score / b.max < 0.7) && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5">
                <span className="text-base mt-0.5">❌</span>
                <span className="text-sm text-red-700 font-medium">Weak action verbs — your experience doesn't sound impactful</span>
              </div>
            )}
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
              <span className="text-base mt-0.5">📋</span>
              <span className="text-sm text-slate-600 font-medium">Your CV looks similar to 80% of rejected applications</span>
            </div>
          </div>
        </div>
        )}

        {/* #2 — Shortlist threshold (only below 85) */}
        {result.score < 90 && <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 mb-6">
          <h4 className="font-extrabold text-amber-800 mb-2 text-base">🏢 What Companies Actually Require</h4>
          <p className="text-amber-700 text-sm mb-3">Top companies using ATS software typically shortlist CVs scoring <span className="font-black">90 or above.</span></p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-amber-200 rounded-full h-3">
              <div className="h-3 rounded-full bg-amber-500" style={{ width: `${result.score}%` }} />
            </div>
            <span className="text-amber-800 font-bold text-sm whitespace-nowrap">You: {result.score}/100</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 bg-green-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-green-500" style={{ width: "90%" }} />
            </div>
            <span className="text-green-700 font-bold text-sm whitespace-nowrap">Shortlist: 90/100</span>
          </div>
          {result.score < 90 && <p className="text-amber-800 font-bold text-sm mt-3">⚠️ You are {90 - result.score} points below the shortlist threshold.</p>}
        </div>}

        {/* Breakdown */}
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-6 sm:p-8 mb-6">
          <h4 className="font-extrabold text-slate-800 mb-5 text-lg">Score Breakdown</h4>
          <div className="space-y-4">
            {Object.values(result.breakdown).map((b) => (
              <div key={b.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-700">{b.label}</span>
                  <span className={`text-sm font-bold ${b.score / b.max < 0.5 ? "text-red-600" : b.score / b.max < 0.7 ? "text-orange-500" : "text-slate-800"}`}>{b.score}/{b.max}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{
                    width: `${(b.score / b.max) * 100}%`,
                    background: b.score / b.max >= 0.7 ? "#16a34a" : b.score / b.max >= 0.4 ? "#d97706" : "#dc2626",
                  }} />
                </div>
                {b.issues.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {b.issues.slice(0, 3).map((issue, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start gap-1"><span>⚠</span> {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Missing keywords */}
        {result.topMissingKeywords.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-6 sm:p-8 mb-6">
            <h4 className="font-extrabold text-red-600 mb-1 text-lg">🚨 Missing Keywords ({result.topMissingKeywords.length})</h4>
            <p className="text-slate-600 text-sm mb-1 font-medium">Recruiters at TCS, Infosys, Wipro, Accenture filter CVs using these exact keywords.</p>
            <p className="text-red-500 text-sm mb-4 font-semibold">Your CV is missing all of these — it is being filtered out automatically before a human reads it.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.topMissingKeywords.map((kw) => (
                <span key={kw} className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full">{kw}</span>
              ))}
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
              💡 Our rewrite adds all these missing keywords naturally into your CV — so ATS systems pass it through.
            </div>
          </div>
        )}

        {/* #5 — Jobs being posted right now */}
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-6 sm:p-8 mb-6">
          <h4 className="font-extrabold text-slate-800 mb-3 text-lg">📢 Jobs Being Posted Right Now</h4>
          <p className="text-slate-500 text-sm mb-4">Hundreds of <span className="font-bold text-slate-700">{jobRole}</span> positions are posted every week on Naukri, LinkedIn, and Indeed. CVs scoring below 80 are filtered out before a recruiter ever sees them.</p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-700 font-semibold">
            ⏳ Every week you delay with this CV = more opportunities lost silently.
          </div>
        </div>

        {/* #4 — Blurred rewritten CV preview */}
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-6 sm:p-8 mb-6 relative overflow-hidden">
          <h4 className="font-extrabold text-slate-800 mb-1 text-lg">📄 Your Rewritten CV Preview</h4>
          <p className="text-slate-500 text-sm mb-4">This is what your CV looks like after our rewrite — ATS-optimised, keyword-rich, professionally structured.</p>
          <div className="relative rounded-2xl overflow-hidden border border-slate-200">
            {/* Fake CV content - blurred */}
            <div className="blur-sm pointer-events-none select-none p-6 bg-white space-y-3">
              <div className="text-center mb-4">
                <div className="h-5 bg-slate-800 rounded w-48 mx-auto mb-1" />
                <div className="h-3 bg-blue-400 rounded w-32 mx-auto mb-1" />
                <div className="h-2 bg-slate-300 rounded w-64 mx-auto" />
              </div>
              <div className="h-3 bg-slate-200 rounded w-24 mb-2" />
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-5/6" />
              <div className="h-2 bg-slate-100 rounded w-4/6" />
              <div className="h-3 bg-slate-200 rounded w-24 mt-3 mb-2" />
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-5/6" />
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-24 mt-3 mb-2" />
              <div className="flex flex-wrap gap-1">
                {["SQL","Python","Power BI","Tableau","Data Analysis","ETL","Dashboard","KPI","Pandas","NumPy"].map(k => (
                  <span key={k} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{k}</span>
                ))}
              </div>
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-3">
              <div className="text-3xl">🔒</div>
              <p className="font-extrabold text-slate-800 text-base text-center px-4">Get your ATS-Friendly Resume — 90+ Score Guaranteed</p>
              <p className="text-slate-500 text-xs text-center px-6">Keywords added · ATS-optimised · Instant PDF download · Just ₹19</p>
              <button onClick={() => file && onUpgrade({ file, jobRole, score: result?.score })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm mt-1">
                🚀 Build My ATS-Friendly Resume →
              </button>
              <p className="text-xs text-slate-500 mt-1">✅ 90+ Score Guaranteed</p>
            </div>
          </div>
        </div>


        {/* Final CTA */}
        <div className="bg-blue-600 rounded-3xl p-6 sm:p-8 text-center text-white">
          <h4 className="text-xl font-extrabold mb-2">Every day you wait = more rejections</h4>
          <p className="text-blue-200 text-sm mb-2">Companies are posting jobs right now — and your CV is getting filtered out.</p>
          <p className="text-white text-sm font-semibold mb-5">For ₹19 we rewrite your entire CV — missing keywords added, action verbs fixed, ATS-optimised — download the polished PDF instantly.</p>
          <button onClick={() => file && onUpgrade({ file, jobRole, score: result?.score })}
            className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition text-sm shadow-lg">
            🚀 Build My ATS-Friendly Resume →
          </button>
          <p className="text-blue-300 text-xs mt-3">✅ 90+ Score Guaranteed · Instant Download · No subscription</p>
        </div>

      </div>
    </section>
  );

  return (
    <section id="free-ats" className="relative bg-blue-600 lg:bg-gradient-to-br lg:from-white lg:via-slate-50 lg:to-indigo-50 pt-20 lg:pt-20 pb-10 lg:pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100/40 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

      {/* Mobile headline */}
      <div className="lg:hidden text-center mb-5 relative px-1">
        <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Free ATS Check · Instant CV Rewrite
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
          <span className="text-yellow-300 text-base leading-none tracking-tight">★★★★★</span>
          <span className="text-sm font-semibold text-white">4.5</span>
          <span className="text-blue-200">·</span>
          <span className="text-sm text-blue-100"><span className="font-bold text-white">2,000+</span> landed interviews last month</span>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

        {/* LEFT: Headline */}
        <div className="hidden lg:flex flex-col gap-4 pt-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Free ATS Check · Instant CV Rewrite
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 leading-tight">
            Land More Interviews<br />
            <span className="text-indigo-600">With an ATS-Optimised Resume</span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Free ATS score check · Full CV rewrite · Instant PDF download.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-yellow-400 text-base leading-none tracking-tight">★★★★★</span>
            <span className="font-semibold text-slate-800">4.5</span>
            <span className="text-slate-400">·</span>
            <span><span className="font-bold text-slate-800">2,000+</span> landed interviews last month</span>
          </div>
        </div>

        {/* RIGHT: Upload card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-8 w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-3 sm:mb-4">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">✅ 100% Free</span>
            <h2 className="text-xl font-extrabold text-slate-800">Check Your ATS Score</h2>
            <p className="text-slate-500 text-xs mt-0.5">See exactly why recruiters are ignoring your CV.</p>
          </div>

          <label className="flex items-center gap-3 border-2 border-dashed border-blue-200 rounded-2xl px-4 py-3.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition mb-3">
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <span className="text-2xl flex-shrink-0">📄</span>
            {file ? (
              <p className="text-blue-600 font-semibold text-sm truncate">✅ {file.name}</p>
            ) : (
              <div>
                <p className="text-slate-700 font-semibold text-sm">Tap to upload your CV</p>
                <p className="text-slate-400 text-xs">PDF, DOC, DOCX · Max 5MB</p>
              </div>
            )}
          </label>

          <select
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white mb-3"
            value={jobRole} onChange={(e) => setJobRole(e.target.value)}
          >
            <option value="">— Select Your Target Job Role —</option>
            {IT_JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-3">
              {error}
            </div>
          )}

          <button onClick={handleCheck} disabled={!canCheck || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl transition text-sm">
            {loading ? "⏳ Analysing your CV..." : "🔍 Check My ATS Score — Free"}
          </button>
          <p className="text-center text-slate-400 text-xs mt-2">No sign-up · Results in seconds · 100% free</p>
        </div>

      </div>
    </section>
  );
}

// ── Payment Modal ─────────────────────────────────────────────────────
function PaymentModal({
  preFile, preJobRole, preScore, onClose,
}: {
  preFile?: File;
  preJobRole?: string;
  preScore?: number;
  onClose: () => void;
}) {
  const [step, setStep]           = useState<1 | 2>(1);
  const [file, setFile]           = useState<File | null>(preFile || null);
  const [jobRole, setJobRole]     = useState(preJobRole || "");
  const [experience, setExperience] = useState("");
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError]         = useState("");
  const [orderId]                 = useState(generateOrderId);
  const [paymentId, setPaymentId] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadFilename, setDownloadFilename] = useState("rewritten-cv.pdf");
  const [email, setEmail]         = useState("");
  const [linkedin, setLinkedin]   = useState("");
  const [reviewStars, setReviewStars]     = useState(0);
  const [reviewHover, setReviewHover]     = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSent, setReviewSent]       = useState(false);

  async function submitReview() {
    try {
      await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, stars: reviewStars, comment: reviewComment, email }),
      });
      setReviewSent(true);
    } catch {}
  }
  const [github, setGithub]       = useState("");

  // If coming from ATS check, file+role already known — only need experience (optional)
  const fromATS = !!preFile && !!preJobRole;
  const canProceed = fromATS ? !!file : (!!file && !!jobRole && !!experience);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  async function handlePay(expOverride?: string) {
    if (!file) return;
    setError(""); setLoading(true);

    try {
      // 1. Create Razorpay order
      setLoadingMsg("⏳ Creating order...");
      const orderRes  = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1900, currency: "INR", receipt: orderId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      setLoading(false);
      setLoadingMsg("");

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        "ScoreMyCV",
        description: "CV Rewrite — Instant Download",
        order_id:    orderData.order_id,
        theme:       { color: "#2563eb" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setLoading(true);

          // 3. Verify payment
          setLoadingMsg("⏳ Verifying payment...");
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) {
            setLoading(false);
            setError("Payment verification failed. Contact us with payment ID: " + response.razorpay_payment_id);
            return;
          }

          setPaymentId(response.razorpay_payment_id);

          // 4. Rewrite CV with AI
          setLoadingMsg("⏳ Rewriting your CV...");
          const fd = new FormData();
          fd.append("file",        file!);
          fd.append("jobRole",     jobRole);
          fd.append("experience",  expOverride || experience || "Not specified");
          fd.append("email",       email);
          fd.append("linkedin",    linkedin);
          fd.append("github",      github);
          fd.append("scoreBefore", String(preScore || 0));
          fd.append("paymentId",   response.razorpay_payment_id);

          const rewriteRes = await fetch("/api/rewrite-cv", { method: "POST", body: fd });

          if (!rewriteRes.ok) {
            const err = await rewriteRes.json().catch(() => ({}));
            setLoading(false);
            setError((err as any).error || "CV rewrite failed. Please email us at " + OWNER_EMAIL + " with your payment ID: " + response.razorpay_payment_id);
            return;
          }

          // 5. Trigger download
          setLoadingMsg("⬇️ Preparing your download...");
          const contentDisposition = rewriteRes.headers.get("Content-Disposition");
          const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
          const pdfFilename = filenameMatch?.[1] || "rewritten-cv.pdf";
          const blob = await rewriteRes.blob();
          const url  = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setDownloadFilename(pdfFilename);

          // Auto-trigger download (desktop); on iOS Safari a.click() is blocked — fallback to new tab
          try {
            const a = document.createElement("a");
            a.href     = url;
            a.download = pdfFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch {
            window.open(url, "_blank");
          }

          setLoading(false);
          setLoadingMsg("");
          setStep(2);
        },
      });

      rzp.on("payment.failed", (r: any) => {
        setError("Payment failed: " + (r.error?.description || "Please try again."));
      });

      rzp.open();

    } catch (err: any) {
      setLoading(false);
      setLoadingMsg("");
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-2 sm:p-4 sm:pt-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden my-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="font-bold text-white text-lg">ScoreMyCV</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-3xl leading-none">×</button>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-white text-blue-700" : "bg-white/20 text-white/60"}`}>{s}</div>
                {s < 2 && <div className={`h-0.5 w-12 rounded ${step > s ? "bg-white" : "bg-white/20"}`} />}
              </div>
            ))}
            <span className="text-white/80 text-xs ml-2">
              {step === 1 ? "Your Details" : "Download Ready!"}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              {loading && (
                <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center gap-4 rounded-3xl">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-700 font-semibold text-sm text-center px-6">{loadingMsg || "⏳ Please wait..."}</p>
                  <p className="text-slate-400 text-xs text-center px-6">This may take 10–15 seconds</p>
                  <p className="text-red-500 text-xs font-medium text-center px-6">⚠️ Please don't close or refresh this page</p>
                </div>
              )}
              {fromATS ? (
                /* Coming from ATS check — file & role already known, go straight to pay */
                <>
                  <h3 className="text-lg font-extrabold text-slate-800">Ready to Rewrite Your CV</h3>

                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✅</span>
                      <span className="text-slate-700 font-medium truncate">{file?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✅</span>
                      <span className="text-slate-700 font-medium">{jobRole}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-700 font-medium">
                    ℹ️ Enter your email to receive the ATS-Optimised CV. LinkedIn and GitHub are optional overrides.
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Email <span className="text-slate-400 font-normal">(we'll email your rewritten CV here)</span></label>
                    <input
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">LinkedIn URL <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input
                      type="url"
                      placeholder="linkedin.com/in/yourname"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">GitHub URL <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input
                      type="url"
                      placeholder="github.com/yourusername"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
                  )}

                  <button
                    onClick={() => handlePay()}
                    disabled={loading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition text-base"
                  >
                    {loading ? loadingMsg || "⏳ Please wait..." : <span>🔒 Build My ATS Resume — Pay ₹19 & Download →</span>}
                  </button>
                  <p className="text-center text-slate-400 text-xs">Secured by Razorpay · GPay, PhonePe, UPI, Cards accepted</p>
                </>
              ) : (
                /* Direct entry — ask for all details */
                <>
                  <h3 className="text-lg font-extrabold text-slate-800">Upload Your Resume</h3>

                  <label className="block border-2 border-dashed border-blue-200 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    {file
                      ? <p className="text-blue-600 font-semibold text-sm">✅ {file.name}</p>
                      : <><p className="text-slate-500 text-sm">📎 Click to upload your resume</p><p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX</p></>
                    }
                  </label>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Job Role</label>
                    <select
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer"
                      value={jobRole} onChange={(e) => setJobRole(e.target.value)}
                    >
                      <option value="">— Select Job Role —</option>
                      {IT_JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Years of Experience</label>
                    <select
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer"
                      value={experience} onChange={(e) => setExperience(e.target.value)}
                    >
                      <option value="">— Select Experience —</option>
                      {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-700 font-medium">
                    ℹ️ Enter your email to receive the ATS-Optimised CV. LinkedIn and GitHub are optional overrides.
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Email <span className="text-slate-400 font-normal">(we'll email your rewritten CV here)</span></label>
                    <input
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">LinkedIn URL <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input
                      type="url"
                      placeholder="linkedin.com/in/yourname"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">GitHub URL <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input
                      type="url"
                      placeholder="github.com/yourusername"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
                  )}

                  <button
                    onClick={() => handlePay()}
                    disabled={!canProceed || loading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition text-base"
                  >
                    {loading ? loadingMsg || "⏳ Please wait..." : <span>🔒 Build My ATS Resume — Pay ₹19 & Download →</span>}
                  </button>
                  <p className="text-center text-slate-400 text-xs">Secured by Razorpay · GPay, PhonePe, UPI, Cards accepted</p>
                </>
              )}
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h3 className="text-2xl font-extrabold text-slate-800">Your CV is Ready!</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your ATS-optimised CV is ready. Tap the button below to download it.
              </p>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadFilename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-4 rounded-2xl transition text-base"
                >
                  ⬇️ Download Your CV
                </a>
              )}

              <div className="bg-slate-50 rounded-2xl px-4 py-3 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Order ID</span>
                  <span className="font-bold text-slate-700 text-sm">{orderId}</span>
                </div>
                {paymentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Payment ID</span>
                    <span className="font-bold text-slate-700 text-xs break-all">{paymentId}</span>
                  </div>
                )}
              </div>

              {/* ── Star Rating ── */}
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                {reviewSent ? (
                  <p className="text-green-600 font-bold text-sm">🙏 Thank you for your feedback!</p>
                ) : (
                  <>
                    <p className="text-slate-600 text-sm font-semibold mb-3">How was your rewritten CV?</p>
                    <div className="flex justify-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setReviewStars(s)}
                          onMouseEnter={() => setReviewHover(s)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                        >
                          <span className={(reviewHover || reviewStars) >= s ? "text-yellow-400" : "text-slate-300"}>★</span>
                        </button>
                      ))}
                    </div>
                    {reviewStars > 0 && !reviewSent && (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Any comments? (optional)"
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          rows={2}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                        />
                        <button
                          onClick={() => submitReview()}
                          className="w-full bg-blue-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-blue-700 transition"
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="text-slate-400 text-xs">
                Issues? Email us at <a href={`mailto:${OWNER_EMAIL}`} className="text-blue-600 underline">{OWNER_EMAIL}</a>
              </p>

              <button onClick={onClose}
                className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-2xl transition text-sm">
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────
function Navbar({ onUpload }: { onUpload: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { href: "#features",     label: "What You Get" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#free-ats",     label: "Check ATS Score" },
    { href: "#faq",          label: "FAQ" },
    { href: "/blog/how-to-check-ats-score", label: "Blog" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 py-3 pr-4" style={{ touchAction: "manipulation" }}>
          <span className="text-2xl">📄</span>
          <span className="font-bold text-blue-700 text-lg">ScoreMyCV</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-blue-600 transition">{l.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a href="/sql-practice"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">⚡ Practice SQL · Get Hired</span>
            <span className="sm:hidden">⚡ SQL</span>
          </a>
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-slate-100 transition"
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-blue-100 px-4 py-3 flex flex-col gap-1 shadow-lg">
          <Link href="/"
            className="text-slate-700 hover:text-blue-600 font-medium text-sm py-2.5 px-2 rounded-lg hover:bg-blue-50 transition"
            onClick={() => setMenuOpen(false)}>
            🏠 Home
          </Link>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}
              className="text-slate-700 hover:text-blue-600 font-medium text-sm py-2.5 px-2 rounded-lg hover:bg-blue-50 transition"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}

        </div>
      )}
    </nav>
  );
}

// ── Features ──────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">What You Get</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800">Everything in One Click</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((f) => (
            <div key={f.title}
              className="group p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-white mb-2">{f.title}</h3>
              <p className="text-slate-500 group-hover:text-blue-100 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800">4 Steps. Rewritten CV in Seconds.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {steps.map((s) => (
            <div key={s.step} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-blue-100">
              <div className="text-4xl font-extrabold text-blue-100 mb-3">{s.step}</div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 bg-blue-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                className="w-full text-left flex items-center justify-between p-4 sm:p-6 font-semibold text-slate-800 hover:text-blue-600 transition"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="pr-4 text-sm sm:text-base">{faq.q}</span>
                <span className="text-blue-500 text-xl flex-shrink-0">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <span className="font-bold text-white text-lg">ScoreMyCV</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} ScoreMyCV · Professional CV rewrite, instantly</p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href={`mailto:${OWNER_EMAIL}`} className="hover:text-white transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f) => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
};

export default function Home() {
  const [showModal, setShowModal]     = useState(false);
  const [upgradeData, setUpgradeData] = useState<{ file?: File; jobRole?: string; score?: number } | null>(null);

  function openModal(data?: { file?: File; jobRole?: string; score?: number }) {
    setUpgradeData(data || null);
    setShowModal(true);
  }

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar onUpload={() => openModal()} />
      <HeroSection onUpgrade={(data) => openModal(data)} />
      <Features />
      <HowItWorks />
      <FAQ />
      <Footer />
      {showModal && (
        <PaymentModal
          preFile={upgradeData?.file}
                    preJobRole={upgradeData?.jobRole}
          preScore={upgradeData?.score}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
