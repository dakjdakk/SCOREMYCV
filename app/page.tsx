"use client";
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

// Razorpay window type
declare global {
  interface Window {
    Razorpay: any;
  }
}
// ── Credentials ───────────────────────────────────────────────────────
const EJS_SERVICE       = "service_ksveb33";
const EJS_OWNER_TPL     = "template_o8gfe6o";
const EJS_CUSTOMER_TPL  = "template_3k1yipp";
const EJS_PUBLIC_KEY    = "Icq14zi9nWQuOdDBi";
const CLOUDINARY_CLOUD  = "dqhxptonc";
const CLOUDINARY_PRESET = "scoremycv_resumes";
const OWNER_EMAIL = "akshaypaip@gmail.com";
// ──────────────────────────────────────────────────────────────────────
const IT_JOB_ROLES = [
  "Software Engineer / Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Angular Developer",
  "Vue.js Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  ".NET Developer",
  "PHP Developer",
  "Mobile Developer (Android)",
  "Mobile Developer (iOS)",
  "React Native Developer",
  "Data Analyst",
  "Data Scientist",
  "Data Engineer",
  "Machine Learning Engineer",
  "AI / Generative AI Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
  "Business Intelligence Developer",
  "Power BI Developer",
  "Tableau Developer",
  "SQL Developer / Database Developer",
  "Database Administrator (DBA)",
  "DevOps Engineer",
  "Site Reliability Engineer (SRE)",
  "Cloud Engineer (AWS)",
  "Cloud Engineer (Azure)",
  "Cloud Engineer (GCP)",
  "Platform Engineer",
  "Kubernetes / Docker Engineer",
  "QA Engineer / Test Engineer",
  "Automation Test Engineer",
  "Performance Test Engineer",
  "Cybersecurity Analyst",
  "Information Security Engineer",
  "Penetration Tester / Ethical Hacker",
  "Network Engineer",
  "System Administrator",
  "IT Support Engineer / Help Desk",
  "Technical Lead",
  "Solution Architect",
  "Enterprise Architect",
  "Cloud Architect",
  "Product Manager (Technical)",
  "Business Analyst",
  "Scrum Master",
  "Agile Coach",
  "IT Project Manager",
  "Salesforce Developer",
  "SAP Consultant",
  "ERP Consultant",
  "Blockchain Developer",
  "Embedded Systems Engineer",
  "Game Developer",
  "UI/UX Designer",
  "Technical Writer",
];
const EXPERIENCE_LEVELS = [
  "Fresher (0 years)",
  "0 – 2 years",
  "2 – 5 years",
  "5 – 8 years",
  "8 – 10 years",
  "10 – 15 years",
  "15+ years",
];
function generateOrderId() {
  return "SCR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}
async function uploadResume(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/raw/upload`,
    { method: "POST", body: fd }
  );
  const data = await res.json();
  return data.secure_url || "";
}
const features = [
  { icon: "📊", title: "ATS Score Report", desc: "Get a clear percentage score showing exactly how well your resume matches the job role — with a full breakdown of what's working and what's not." },
  { icon: "🔑", title: "Missing Keywords", desc: "We identify the exact keywords recruiters are scanning for, so you know precisely what was holding your resume back." },
  { icon: "✏️", title: "CV Fully Rewritten", desc: "Your resume is professionally rewritten from scratch, tailored to your target job role, and delivered as a polished PDF straight to your inbox." },
  { icon: "🎁", title: "FREE Bonus Worth ₹499", desc: "Every order includes 100+ Interview Q&A covering Python, SQL, Advanced Excel, and Power BI — the most in-demand skills in today's job market." },
];
const steps = [
  { step: "01", title: "Upload Your Resume", desc: "Upload your existing resume in PDF or Word format." },
  { step: "02", title: "Select Job Role", desc: "Choose your target job role and years of experience from the dropdowns." },
  { step: "03", title: "Pay ₹99 via UPI", desc: "One-time payment — no subscription, no hidden charges. Pay securely via any UPI app." },
  { step: "04", title: "Check Your Inbox", desc: "Within 3 hours, your rewritten CV, ATS report, and 100+ Interview Q&A land directly in your email." },
];
const faqs = [
  {
    q: "What is an ATS score and why does it matter?",
    a: "ATS stands for Applicant Tracking System — software that companies use to automatically filter resumes before any human ever sees them. If your resume does not match the job role closely enough, it gets rejected instantly. Your ATS score tells you exactly how well your resume is performing, so you know what to fix before applying.",
  },
  {
    q: "What do I get for ₹99?",
    a: "You get four things delivered to your email within 3 hours: (1) A full ATS score report with a detailed breakdown, (2) A list of missing keywords you need to add, (3) Your resume fully rewritten and polished as a ready-to-send PDF, and (4) A FREE bonus guide with 100+ Interview Questions and Answers covering Python, SQL, Advanced Excel, and Power BI — worth ₹499 on its own.",
  },
  {
    q: "Will my CV actually be rewritten — or just given suggestions?",
    a: "Your CV is fully rewritten — not just reviewed. We rewrite every section to match your target job role, fix the language, improve the structure, and make sure it clears ATS filters. The final rewritten resume is sent as a clean, professional PDF directly to your email, ready to submit.",
  },
  {
    q: "What is included in the FREE interview preparation bonus?",
    a: "Every order comes with a comprehensive guide of 100+ Interview Questions and Answers covering four of the most in-demand skills: Python, SQL, Advanced Excel, and Power BI. These are the exact topics hiring managers ask about in technical rounds — having them prepared in one place gives you a serious advantage walking into any interview.",
  },
  {
    q: "How long does it take to receive everything?",
    a: "Everything is delivered to your email within 3 hours of payment — the ATS report, your rewritten CV, and the interview preparation bonus guide. All in one email, all as downloadable PDFs.",
  },
  {
    q: "Is my data safe?",
    a: "Yes, completely. Your resume and job role details are used solely to prepare your report and rewritten CV. We do not store, sell, or share your information with any third party.",
  },
  {
    q: "Can I use this for any job or industry?",
    a: "Yes — our service works across all industries including IT, finance, marketing, operations, healthcare, and engineering. Whether you are a fresher or a senior professional, the ATS analysis and CV rewrite are tailored to your specific job role.",
  },
];
// ── Payment Modal ─────────────────────────────────────────────────────
function PaymentModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);  // 1 = details, 2 = confirmed
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [orderId] = useState(generateOrderId);
  const [paymentId, setPaymentId] = useState("");

  const canProceed = file && jobRole && experience && email.includes("@");

  // Load Razorpay checkout script once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  async function handlePay() {
    if (!file || !canProceed) return;
    setError("");
    setLoading(true);

    try {
      // 1. Upload resume to Cloudinary
      setLoadingMsg("⏳ Uploading resume...");
      const resumeUrl = await uploadResume(file);

      // 2. Create Razorpay order on our backend
      setLoadingMsg("⏳ Creating order...");
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 9900, currency: "INR", receipt: orderId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      setLoading(false);
      setLoadingMsg("");

      // 3. Open Razorpay checkout popup
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ScoreMyCV",
        description: "CV Rewriting + ATS Report + 100+ Interview Q&A",
        order_id: orderData.order_id,
        prefill: { email },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            // User closed popup — do nothing, stay on step 1
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setLoading(true);
          setLoadingMsg("⏳ Verifying payment...");

          // 4. Verify payment signature on backend
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) {
            setLoading(false);
            setError("Payment verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id);
            return;
          }

          setPaymentId(response.razorpay_payment_id);

          // 5. Send confirmation emails
          setLoadingMsg("⏳ Sending confirmation...");
          try {
            await emailjs.send(EJS_SERVICE, EJS_OWNER_TPL, {
              to_email: OWNER_EMAIL,
              order_id: orderId,
              customer_email: email,
              job_description: `Job Role: ${jobRole} | Experience: ${experience}`,
              resume_url: resumeUrl,
            }, EJS_PUBLIC_KEY);
            await emailjs.send(EJS_SERVICE, EJS_CUSTOMER_TPL, {
              to_email: email,
              order_id: orderId,
            }, EJS_PUBLIC_KEY);
          } catch (_) {
            // Email failure is non-critical — order is confirmed
          }

          setLoading(false);
          setLoadingMsg("");
          setStep(2);
        },
      });

      rzp.on("payment.failed", (response: any) => {
        setError("Payment failed: " + (response.error?.description || "Please try again."));
      });

      rzp.open();

    } catch (err: any) {
      setLoading(false);
      setLoadingMsg("");
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-3 sm:pt-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
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
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-white text-blue-700" : "bg-white/20 text-white/60"}`}>{s}</div>
                {s < 2 && <div className={`h-0.5 w-12 rounded ${step > s ? "bg-white" : "bg-white/20"}`} />}
              </div>
            ))}
            <span className="text-white/80 text-xs ml-2">
              {step === 1 ? "Your Details" : "Order Confirmed!"}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">

          {/* ── STEP 1: Details + Pay ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-800">Upload Your Resume & Details</h3>

              {/* File upload */}
              <label className="block border-2 border-dashed border-blue-200 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file
                  ? <p className="text-blue-600 font-semibold text-sm">✅ {file.name}</p>
                  : <><p className="text-slate-500 text-sm">📎 Click to upload your resume</p><p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX</p></>
                }
              </label>

              {/* Job Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Job Role</label>
                <select
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                >
                  <option value="">— Select Job Role —</option>
                  {IT_JOB_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Years of Experience</label>
                <select
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="">— Select Experience —</option>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <input
                type="email"
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Your email address (we'll send your CV here)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* What you get */}
              <div className="bg-blue-50 rounded-2xl p-4 space-y-1.5">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">What you'll receive within 3 hours</p>
                {["✅ ATS Score Report", "✅ Fully Rewritten CV (PDF)", "✅ 100+ Interview Q&A", "🎁 Python, SQL, Excel & Power BI Guide (FREE)"].map((i) => (
                  <p key={i} className="text-xs text-slate-600">{i}</p>
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={!canProceed || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition text-base"
              >
                {loading ? loadingMsg : "🔒 Pay ₹99 Securely →"}
              </button>
              <p className="text-center text-slate-400 text-xs">Secured by Razorpay · GPay, PhonePe, UPI, Cards accepted</p>
            </div>
          )}

          {/* ── STEP 2: Confirmed ── */}
          {step === 2 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h3 className="text-2xl font-extrabold text-slate-800">Order Confirmed!</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Thank you! Your rewritten CV, ATS report, and free interview guide will be delivered to
              </p>
              <div className="bg-blue-50 rounded-2xl px-4 py-3">
                <p className="font-bold text-blue-700 text-sm break-all">{email}</p>
              </div>
              <p className="text-slate-500 text-sm">within <strong>3 hours</strong>.</p>
              <div className="bg-slate-50 rounded-2xl px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Order ID</span>
                  <span className="font-bold text-slate-700 text-sm">{orderId}</span>
                </div>
                {paymentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Payment ID</span>
                    <span className="font-bold text-slate-700 text-xs">{paymentId}</span>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-2xl transition text-sm">
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
    { href: "#features", label: "What You Get" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <span className="font-bold text-blue-700 text-lg">ScoreMyCV</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-blue-600 transition">{l.label}</a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* SQL Practice CTA — full text on md+, short on mobile */}
          <a
            href="/sql-practice"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-full transition text-sm whitespace-nowrap"
          >
            <span className="hidden sm:inline">⚡ Practice SQL · Get Hired</span>
            <span className="sm:hidden">⚡ SQL Practice</span>
          </a>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-slate-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-blue-100 px-4 py-3 flex flex-col gap-1 shadow-lg">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-slate-700 hover:text-blue-600 font-medium text-sm py-2.5 px-2 rounded-lg hover:bg-blue-50 transition"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-2">
            <button
              onClick={() => { setMenuOpen(false); onUpload(); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition text-sm"
            >
              📄 Get My CV Reviewed – ₹99
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero({ onUpload }: { onUpload: () => void }) {
  return (
    <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-900/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          CV Rewritten & Delivered to Your Inbox • 3 Hours • ₹99 Only
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Stop Getting Rejected.{" "}
          <span className="text-blue-200">Get Your CV Rewritten & Interview-Ready.</span>
        </h1>
        <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto mb-4 leading-relaxed">
          Upload your resume. Select your target job role. We rewrite your CV professionally and send it straight to your email — along with a <strong>FREE bonus of 100+ Interview Q&A</strong> on Python, SQL, Advanced Excel & Power BI.
        </p>
        <p className="text-blue-200 text-sm mb-8 sm:mb-10">Everything delivered to your inbox within 3 hours. No fluff, just results.</p>
        <div className="flex justify-center">
          <button onClick={onUpload} className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 sm:px-10 py-4 rounded-2xl shadow-lg hover:bg-blue-50 transition text-base sm:text-lg w-full sm:w-auto max-w-xs">
            📄 Upload My Resume
          </button>
        </div>
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-blue-100 text-sm">
          <div className="flex items-center gap-2"><span className="text-yellow-300">★★★★★</span> 4.9/5 from 2,400+ users</div>
          <span className="hidden sm:block text-blue-400">|</span>
          <div>✅ 78% got more interview calls</div>
          <span className="hidden sm:block text-blue-400">|</span>
          <div>⚡ Rewritten CV within 3 hours</div>
          <span className="hidden sm:block text-blue-400">|</span>
          <div>🎁 FREE 100+ Interview Q&A included</div>
        </div>
      </div>
    </section>
  );
}
function Bonus() {
  return (
    <section className="py-12 sm:py-14 px-4 sm:px-6 bg-yellow-50 border-y border-yellow-200">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">🎁 Free Bonus Included with Every Order</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">100+ Interview Questions & Answers — Worth ₹499, Yours Free</h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-6 text-sm sm:text-base">Every order comes with a comprehensive interview preparation guide covering the four most in-demand technical skills.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: "💻", label: "Python", desc: "100+ Q&A" },
            { icon: "🗄️", label: "SQL", desc: "100+ Q&A" },
            { icon: "📊", label: "Advanced Excel", desc: "100+ Q&A" },
            { icon: "📈", label: "Power BI", desc: "100+ Q&A" },
          ].map((b) => (
            <div key={b.label} className="bg-white rounded-2xl p-4 border border-yellow-200 shadow-sm">
              <div className="text-3xl mb-2">{b.icon}</div>
              <div className="font-bold text-slate-800 text-sm sm:text-base">{b.label}</div>
              <div className="text-xs text-blue-600 font-semibold">{b.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-sm mt-6">Delivered as a PDF directly to your email alongside your rewritten CV.</p>
      </div>
    </section>
  );
}
function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">What You Get</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800">Everything Delivered to Your Inbox within 3 Hours</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((f) => (
            <div key={f.title} className="group p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
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
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800">4 Steps. 3 Hours. Rewritten CV in Your Inbox.</h2>
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
function Pricing({ onUpload }: { onUpload: () => void }) {
  return (
    <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 mb-10 sm:mb-12">One Simple Plan. Everything Included.</h2>
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-7 sm:p-10 shadow-2xl text-white overflow-hidden">
          <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">Best Value</div>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl sm:text-6xl font-extrabold">₹99</span>
            <span className="text-blue-200 text-lg">one-time</span>
          </div>
          <p className="text-blue-200 text-sm mb-8">No subscription. Pay once, get everything delivered within 3 hours.</p>
          <ul className="space-y-3 text-left mb-10">
            {[
              "✅  Full ATS Score with detailed breakdown",
              "✅  List of missing keywords to add",
              "✅  Your CV fully rewritten as a professional PDF",
              "✅  Rewritten CV sent directly to your email",
              "✅  100+ tailored interview questions & answers",
              "✅  Works for any job / any industry",
              "🎁  FREE: Python, SQL, Advanced Excel & Power BI Q&A (worth ₹499)",
            ].map((item) => (
              <li key={item} className="text-sm text-blue-50">{item}</li>
            ))}
          </ul>
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-2 mb-6 text-yellow-100 text-xs text-center">
            🎁 Free bonus worth ₹499 included
          </div>
          <button onClick={onUpload} className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl hover:bg-blue-50 transition text-lg shadow-lg">
            Get My Rewritten CV
          </button>
          <p className="text-blue-300 text-xs mt-4">🔒 Click above · Pay ₹99 · Get your rewritten CV within 3 hours</p>
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
              <button className="w-full text-left flex items-center justify-between p-4 sm:p-6 font-semibold text-slate-800 hover:text-blue-600 transition" onClick={() => setOpen(open === i ? null : i)}>
                <span className="pr-4 text-sm sm:text-base">{faq.q}</span>
                <span className="text-blue-500 text-xl flex-shrink-0">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{faq.a}</div>
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
        <p className="text-sm">© {new Date().getFullYear()} ScoreMyCV · Your rewritten CV, delivered within 3 hours</p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href={`mailto:${OWNER_EMAIL}`} className="hover:text-white transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}
export default function Home() {
  const [showModal, setShowModal] = useState(false);
  return (
    <main className="min-h-screen bg-white">
      <Navbar onUpload={() => setShowModal(true)} />
      <Hero onUpload={() => setShowModal(true)} />
      <Bonus />
      <Features />
      <HowItWorks />
      <Pricing onUpload={() => setShowModal(true)} />
      <FAQ />
      <Footer />
      {showModal && <PaymentModal onClose={() => setShowModal(false)} />}
    </main>
  );
}
