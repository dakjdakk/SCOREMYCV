"use client";

import { useState } from "react";

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
  "Automation Test Engineer (Selenium / Cypress)",
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

const features = [
  { icon: "📊", title: "ATS Score", desc: "See exactly how well your resume matches the job role with a clear percentage score." },
  { icon: "🔑", title: "Missing Keywords", desc: "Discover the critical keywords recruiters are searching for that are missing from your resume." },
  { icon: "✏️", title: "Resume Rewrite", desc: "Get a professionally rewritten resume optimised for both ATS systems and human recruiters." },
  { icon: "🎯", title: "Interview Questions", desc: "Receive likely interview questions for the role so you walk in fully prepared." },
];

const steps = [
  { step: "01", title: "Upload Resume", desc: "Upload your resume in PDF or Word format." },
  { step: "02", title: "Select Job Role", desc: "Choose your target job role and experience level from the dropdown." },
  { step: "03", title: "Pay ₹99", desc: "One-time payment via UPI — no subscription, no hidden charges." },
  { step: "04", title: "Get Your Report", desc: "Receive your full ATS report, rewritten resume, interview questions, and FREE SQL & Python bonus guide — all within 3 hours." },
];

const faqs = [
  { q: "What is an ATS score?", a: "ATS (Applicant Tracking System) is software used by companies to filter resumes before a human reads them. Your ATS score shows how well your resume matches the job role. A score below 60% means your resume is likely being rejected automatically." },
  { q: "What do I get for ₹99?", a: "You get a complete ATS score with detailed breakdown, a list of missing keywords, a fully rewritten resume optimised for the job, 10–15 tailored interview questions, and as a FREE bonus — 100 SQL & Python Interview Questions and Answers worth ₹499." },
  { q: "How long does it take?", a: "Your report is delivered within 3 hours of payment confirmation." },
  { q: "What is the free bonus I get?", a: "Every purchase includes a FREE copy of '100 SQL & Python Interview Questions and Answers' — a premium guide worth ₹499. It covers the most commonly asked technical interview questions with detailed answers, perfect for IT and software job seekers." },
  { q: "In what format will I receive the report?", a: "You will receive the ATS score report, rewritten resume, and the bonus SQL & Python guide as downloadable PDFs sent to your email." },
  { q: "Is my data safe?", a: "Yes. Your resume and job role details are used only for generating your report and are not stored or shared with any third party." },
  { q: "Can I use this for any job or industry?", a: "Absolutely. Our service works for any industry — IT, finance, marketing, healthcare, engineering, and more." },
];

function Navbar({ onUpload }: { onUpload: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-blue-700 text-lg">ScoreMyCV</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
        </div>
        <button onClick={onUpload} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition">
          Get Report — ₹99
        </button>
      </div>
    </nav>
  );
}

function Hero({ onUpload }: { onUpload: () => void }) {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-900/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Expert-Reviewed • Results in 3 Hours • ₹99 Only
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Increase Your Interview Calls{" "}
          <span className="text-blue-200">with Expert Resume Analysis</span>
        </h1>
        <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your resume and select your target job role. Get ATS score, missing keywords, resume improvements, and interview questions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onUpload} className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-blue-50 transition text-lg">
            📄 Upload Resume
          </button>
          <a href="#pricing" className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition text-lg">
            💳 Pay with UPI — ₹99
          </a>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100 text-sm">
          <div className="flex items-center gap-2"><span className="text-yellow-300">★★★★★</span> 4.9/5 from 2,400+ users</div>
          <span className="hidden sm:block text-blue-400">|</span>
          <div>✅ 78% saw interview calls increase</div>
          <span className="hidden sm:block text-blue-400">|</span>
          <div>⚡ Report delivered within 3 hours</div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">What You Get</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Everything You Need to Land the Interview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-white mb-2">{f.title}</h3>
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
    <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Get Your Report in 4 Easy Steps</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
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
    <section id="pricing" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-12">One Simple Plan. Everything Included.</h2>
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-white overflow-hidden">
          <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">Most Popular</div>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-6xl font-extrabold">₹99</span>
            <span className="text-blue-200 text-lg">one-time</span>
          </div>
          <p className="text-blue-200 text-sm mb-8">No subscription. Pay once, get everything.</p>
          <ul className="space-y-3 text-left mb-10">
            {[
              "✅  Full ATS Score with detailed breakdown",
              "✅  List of missing keywords",
              "✅  Professionally rewritten resume (PDF)",
              "✅  10–15 tailored interview questions",
              "✅  Delivered to your email within 3 hours",
              "✅  Works for any job / any industry",
              "🎁  FREE: 100 SQL & Python Interview Q&A (worth ₹499)",
            ].map((item) => (
              <li key={item} className="text-sm text-blue-50">{item}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            <button onClick={onUpload} className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl hover:bg-blue-50 transition text-lg shadow-lg">
              📄 Upload Resume
            </button>
            <button className="w-full bg-blue-500 hover:bg-blue-400 border-2 border-white/20 text-white font-bold py-4 rounded-2xl transition text-lg">
              💳 Pay with UPI — ₹99
            </button>
          </div>
          <p className="text-blue-300 text-xs mt-4">🔒 Secure payment · Your data is never shared</p>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-blue-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button className="w-full text-left flex items-center justify-between p-5 sm:p-6 font-semibold text-slate-800 hover:text-blue-600 transition" onClick={() => setOpen(open === i ? null : i)}>
                <span className="pr-4">{faq.q}</span>
                <span className="text-blue-500 text-xl flex-shrink-0">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-5 sm:px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl">×</button>
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📄</div>
          <h3 className="text-2xl font-extrabold text-slate-800">Upload Your Resume</h3>
          <p className="text-slate-500 text-sm mt-1">PDF or Word · Max 5MB</p>
        </div>

        {/* File Upload */}
        <label className="block border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition mb-4">
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {file ? <p className="text-blue-600 font-semibold">✅ {file.name}</p> : (
            <><p className="text-slate-500 text-sm">Drag & drop or <span className="text-blue-600 font-semibold">browse file</span></p><p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX</p></>
          )}
        </label>

        {/* Job Role Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Job Role</label>
          <select
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none cursor-pointer"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
          >
            <option value="">— Select Job Role —</option>
            {IT_JOB_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Experience Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Years of Experience</label>
          <select
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none cursor-pointer"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">— Select Experience —</option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition text-lg mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!file || !jobRole || !experience}
        >
          💳 Continue to Pay — ₹99
        </button>
        <p className="text-center text-slate-400 text-xs">🔒 Secure · Your data is never shared</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-white text-lg">ScoreMyCV</span>
        </div>
        <p className="text-sm text-center">© {new Date().getFullYear()} ScoreMyCV · Built to help you land your dream job</p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="mailto:support@scoremycv.in" className="hover:text-white transition">Contact</a>
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
      <Features />
      <HowItWorks />
      <Pricing onUpload={() => setShowModal(true)} />
      <FAQ />
      <Footer />
      {showModal && <UploadModal onClose={() => setShowModal(false)} />}
    </main>
  );
}
