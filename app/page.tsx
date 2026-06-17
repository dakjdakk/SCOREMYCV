"use client";
import { useState, useEffect } from "react";

// Razorpay window type
declare global {
  interface Window { Razorpay: any; }
}

const OWNER_EMAIL = "akshaypaip@gmail.com";

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
  { step: "03", title: "Pay ₹18 Securely", desc: "One-time payment via UPI, GPay, PhonePe, or card. No subscription, no hidden charges." },
  { step: "04", title: "Download Instantly", desc: "Your rewritten, ATS-optimised CV downloads automatically — right away." },
];

const faqs = [
  {
    q: "What is an ATS score and why does it matter?",
    a: "ATS stands for Applicant Tracking System — software companies use to automatically filter resumes before a human ever sees them. If your score is too low, your resume gets rejected instantly. Our free check tells you exactly where you stand.",
  },
  {
    q: "What do I get for ₹18?",
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
    a: "If the download doesn't start automatically, check your browser's pop-up blocker and allow downloads from scoremycv.in. You can also reach us at akshaypaip@gmail.com with your payment ID.",
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
  const color = score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const label = score >= 70 ? "Good" : score >= 50 ? "Average" : "Poor";
  return (
    <div className="flex flex-col items-center">
      <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 shadow-lg"
        style={{ borderColor: color }}>
        <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-xs font-bold" style={{ color }}>/100</span>
      </div>
      <span className="mt-2 text-sm font-bold px-3 py-1 rounded-full"
        style={{ background: color + "20", color }}>
        {label} ATS Score
      </span>
    </div>
  );
}

// ── Hero + ATS Checker (combined above-the-fold section) ─────────────
function HeroSection({ onUpgrade }: {
  onUpgrade: (data: { file: File; jobRole: string }) => void;
}) {
  const [file, setFile]       = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
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
    ? result.score < 50
      ? "Your CV is being auto-rejected by most ATS systems. Get it fixed for just ₹18."
      : result.score < 70
      ? "Your CV is below average — most companies will skip it. Get it rewritten for ₹18."
      : "Good start! A professionally rewritten CV can push your score above 85. Fix it for ₹18."
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
              <p className="text-slate-500 text-sm mb-4">{upsellMsg}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button onClick={() => file && onUpgrade({ file, jobRole })}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm">
                  🚀 Fix My CV for ₹18 — Instant Download
                </button>
                <button onClick={() => { setResult(null); setFile(null); setJobRole(""); }}
                  className="w-full sm:w-auto border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold px-6 py-3 rounded-2xl transition text-sm">
                  Check Another CV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-6 sm:p-8 mb-6">
          <h4 className="font-extrabold text-slate-800 mb-5 text-lg">Score Breakdown</h4>
          <div className="space-y-4">
            {Object.values(result.breakdown).map((b) => (
              <div key={b.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-700">{b.label}</span>
                  <span className="text-sm font-bold text-slate-800">{b.score}/{b.max}</span>
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
          <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-6 sm:p-8 mb-6">
            <h4 className="font-extrabold text-slate-800 mb-1 text-lg">❌ Missing Keywords ({result.topMissingKeywords.length})</h4>
            <p className="text-slate-500 text-sm mb-4">ATS systems scan for these — your CV is missing them.</p>
            <div className="flex flex-wrap gap-2">
              {result.topMissingKeywords.map((kw) => (
                <span key={kw} className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Found keywords */}
        {result.foundKeywords.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6 sm:p-8 mb-6">
            <h4 className="font-extrabold text-slate-800 mb-3 text-lg">✅ Keywords Found ({result.foundKeywords.length})</h4>
            <div className="flex flex-wrap gap-2">
              {result.foundKeywords.map((kw) => (
                <span key={kw} className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1 rounded-full">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="bg-blue-600 rounded-3xl p-6 sm:p-8 text-center text-white">
          <h4 className="text-xl font-extrabold mb-2">Want all of this fixed?</h4>
          <p className="text-blue-200 text-sm mb-5">For just ₹18 your entire CV gets rewritten — missing keywords added, action verbs fixed, every line improved — download the polished PDF instantly.</p>
          <button onClick={() => file && onUpgrade({ file, jobRole })}
            className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition text-sm shadow-lg">
            🚀 Get My CV Rewritten for ₹18 — Instant Download
          </button>
        </div>

      </div>
    </section>
  );

  return (
    <section id="free-ats" className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 pt-16 sm:pt-20 pb-10 sm:pb-16 px-4 sm:px-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-900/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      {/* Mobile-only headline */}
      <div className="lg:hidden text-center mb-4 relative">
        <h1 className="text-2xl font-extrabold text-white leading-tight">
          Stop Getting Rejected.<br />
          <span className="text-blue-200">Check Your ATS Score Free.</span>
        </h1>
      </div>

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

        {/* Upload card — right on desktop, full width on mobile */}
        <div className="lg:order-last bg-white rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-3 sm:mb-4">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">✅ 100% Free</span>
            <h2 className="text-xl sm:text-xl font-extrabold text-slate-800">Check Your ATS Score</h2>
            <p className="text-slate-500 text-xs mt-0.5">See exactly why recruiters are ignoring your CV.</p>
          </div>

          <label className="flex items-center gap-3 border-2 border-dashed border-blue-200 rounded-2xl px-4 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition mb-3">
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <span className="text-2xl flex-shrink-0">📄</span>
            {file ? (
              <p className="text-blue-600 font-semibold text-sm truncate">✅ {file.name}</p>
            ) : (
              <div>
                <p className="text-slate-700 font-semibold text-sm">Tap to upload your CV</p>
                <p className="text-slate-400 text-xs">PDF, DOC, DOCX</p>
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

        {/* Text — hidden on mobile, left on desktop */}
        <div className="hidden lg:block text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Free ATS Check · Instant CV Rewrite
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Stop Getting Rejected.<br />
            <span className="text-blue-200">Get Your CV ATS-Optimised.</span>
          </h1>
          <p className="text-blue-100 text-base mb-5 max-w-md leading-relaxed">
            Check your ATS score for free. See exactly what's holding your CV back — then get it fully rewritten and download the polished PDF instantly.
          </p>
          <div className="flex flex-wrap gap-3 text-blue-100 text-sm">
            <div className="flex items-center gap-1.5"><span className="text-yellow-300">★★★★★</span> 4.9/5 · 2,400+ users</div>
            <div>✅ 86% got more interview calls</div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Payment Modal ─────────────────────────────────────────────────────
function PaymentModal({
  preFile, preJobRole, onClose,
}: {
  preFile?: File;
  preJobRole?: string;
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
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [linkedin, setLinkedin]   = useState("");
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
        body: JSON.stringify({ amount: 1800, currency: "INR", receipt: orderId }),
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
          fd.append("file",       file!);
          fd.append("jobRole",    jobRole);
          fd.append("experience", expOverride || experience || "Not specified");
          fd.append("email",      email);
          fd.append("phone",      phone);
          fd.append("linkedin",   linkedin);
          fd.append("github",     github);

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
                    ℹ️ Fill your contact details below so they appear correctly in your rewritten CV.
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Email <span className="text-slate-400 font-normal">(for CV header + delivery)</span></label>
                    <input
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(for CV header)</span></label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                    disabled={loading || !email || !phone}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition text-base"
                  >
                    {loading ? loadingMsg || "⏳ Please wait..." : "🔒 Pay ₹18 & Download CV →"}
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
                    ℹ️ Fill your contact details below so they appear correctly in your rewritten CV.
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Email <span className="text-slate-400 font-normal">(for CV header + delivery)</span></label>
                    <input
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(for CV header)</span></label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                    disabled={!canProceed || loading || !email || !phone}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition text-base"
                  >
                    {loading ? loadingMsg || "⏳ Please wait..." : "🔒 Pay ₹18 & Download CV →"}
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
                  download="rewritten-cv.pdf"
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
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <span className="font-bold text-blue-700 text-lg">ScoreMyCV</span>
        </div>
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
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}
              className="text-slate-700 hover:text-blue-600 font-medium text-sm py-2.5 px-2 rounded-lg hover:bg-blue-50 transition"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-2">
            <button onClick={() => { setMenuOpen(false); onUpload(); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition text-sm">
              📄 Fix My CV for ₹18
            </button>
          </div>
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

// ── How It Works ──────────────────────────────────────────────────────
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


// ── FAQ ───────────────────────────────────────────────────────────────
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

// ── Footer ────────────────────────────────────────────────────────────
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

// ── Home ──────────────────────────────────────────────────────────────
export default function Home() {
  const [showModal, setShowModal]     = useState(false);
  const [upgradeData, setUpgradeData] = useState<{ file?: File; jobRole?: string } | null>(null);

  function openModal(data?: { file?: File; jobRole?: string }) {
    setUpgradeData(data || null);
    setShowModal(true);
  }

  return (
    <main className="min-h-screen bg-white">
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
          onClose={() => { setShowModal(false); setUpgradeData(null); }}
        />
      )}
    </main>
  );
}
