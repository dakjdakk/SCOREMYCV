import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Check Your Resume Score Free Online (India 2026) | ScoreMyCV",
  description:
    "Check your resume score free in 30 seconds. See your ATS score, missing keywords, and exactly why recruiters are ignoring your CV — no sign-up required.",
  keywords:
    "how to check resume score, check my resume score free, resume score online India, check cv score free, resume score checker India, how to check my cv score, resume scoring tool India 2026",
  alternates: {
    canonical: "https://scoremycv.in/blog/how-to-check-resume-score",
  },
  openGraph: {
    type: "article",
    url: "https://scoremycv.in/blog/how-to-check-resume-score",
    title: "How to Check Your Resume Score Free Online (India 2026)",
    description:
      "Check your resume score free in 30 seconds. See your ATS score, missing keywords, and exactly why recruiters are ignoring your CV.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Check Your Resume Score Free Online (India 2026)",
  description:
    "Check your resume score free in 30 seconds. See your ATS score, missing keywords, and exactly why recruiters are ignoring your CV — no sign-up required.",
  url: "https://scoremycv.in/blog/how-to-check-resume-score",
  datePublished: "2026-07-15",
  dateModified: "2026-07-15",
  author: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  publisher: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  image: "https://scoremycv.in/og-image.png",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://scoremycv.in/blog/how-to-check-resume-score" },
};

const scoreRanges = [
  { range: "0 – 49", label: "Auto-Rejected", color: "bg-red-100 text-red-700 border-red-200", meaning: "Your CV is being automatically filtered out by ATS before any human sees it. Immediate rewrite needed.", icon: "🚫" },
  { range: "50 – 69", label: "High Risk", color: "bg-orange-100 text-orange-700 border-orange-200", meaning: "You might get through at some companies, but you're missing significant keywords and structure. Improvement needed.", icon: "⚠️" },
  { range: "70 – 84", label: "Below Shortlist", color: "bg-yellow-100 text-yellow-700 border-yellow-200", meaning: "Decent but not competitive. You'll pass basic ATS filters but lose to better-optimised CVs at the ranking stage.", icon: "📊" },
  { range: "85 – 100", label: "Shortlist Zone", color: "bg-green-100 text-green-700 border-green-200", meaning: "Your CV is well-optimised and likely to be seen by human recruiters. You're in the competitive shortlist pool.", icon: "✅" },
];

const steps = [
  { n: "01", title: "Go to scoremycv.in", desc: "Open scoremycv.in on any device — mobile, tablet, or desktop. No app download needed. No account required." },
  { n: "02", title: "Upload your CV", desc: "Click 'Upload your CV' and select your resume file. Supported formats: PDF, DOC, DOCX. Your file is processed securely and never stored." },
  { n: "03", title: "Select your target job role", desc: "Choose the job role you're applying for from the dropdown. This is important — your resume score is calculated against that specific role's keyword requirements." },
  { n: "04", title: "Click 'Check My ATS Score'", desc: "Hit the button and wait about 10-15 seconds. The system analyses your CV against 50+ ATS criteria including keywords, formatting, structure, and content quality." },
  { n: "05", title: "Read your full score report", desc: "You'll see your overall score out of 100, a breakdown by category (keywords, format, experience, education, skills), and the exact missing keywords you need to add." },
];

export default function BlogPost() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="font-bold text-blue-700 text-lg">ScoreMyCV</span>
            </Link>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap"
            >
              <span className="hidden sm:inline">Check My Resume Score — Free →</span>
              <span className="sm:hidden">Check Score →</span>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 pt-28 pb-14 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              📖 Resume Guide · India 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              How to Check Your Resume Score<br />
              <span className="text-blue-200">Free Online — India 2026</span>
            </h1>
            <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">
              Your resume score tells you exactly how well your CV will perform against ATS software used by Indian companies. Check it free in 30 seconds — no sign-up needed.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-blue-300 text-sm">
              <span>📅 July 2026</span>
              <span>·</span>
              <span>⏱ 5 min read</span>
              <span>·</span>
              <span>✅ Free tool inside</span>
            </div>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

          {/* Quick CTA */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-10 text-center">
            <p className="font-bold text-slate-800 text-lg mb-2">Want to skip straight to checking your score?</p>
            <p className="text-slate-500 text-sm mb-4">Upload your CV and get your free resume score in 30 seconds.</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl transition text-sm"
            >
              🔍 Check My Resume Score — Free →
            </Link>
            <p className="text-slate-400 text-xs mt-3">No sign-up · No email required · 100% free</p>
          </div>

          {/* TOC */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-10">
            <p className="font-bold text-slate-800 mb-3">📋 In this guide:</p>
            <ol className="space-y-1.5 text-sm text-blue-700 font-medium list-decimal list-inside">
              <li><a href="#what-is-resume-score" className="hover:underline">What is a resume score?</a></li>
              <li><a href="#why-it-matters" className="hover:underline">Why your resume score matters in India</a></li>
              <li><a href="#how-to-check" className="hover:underline">How to check your resume score free — step by step</a></li>
              <li><a href="#score-ranges" className="hover:underline">What your score means</a></li>
              <li><a href="#how-to-improve" className="hover:underline">How to improve your resume score</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <section id="what-is-resume-score" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">1. What Is a Resume Score?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              A resume score is a numerical rating — typically out of 100 — that measures how well your CV is optimised for <strong>Applicant Tracking Systems (ATS)</strong>. ATS is the software companies use to automatically scan and rank resumes before any human recruiter sees them.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Your resume score is calculated based on several factors:
            </p>
            <div className="space-y-3 mb-4">
              {[
                { icon: "🔑", label: "Keyword match", desc: "How many of the required keywords from your target job role appear in your CV" },
                { icon: "📋", label: "Structure & sections", desc: "Whether your CV has the standard sections ATS looks for (Summary, Experience, Education, Skills)" },
                { icon: "📄", label: "Format compatibility", desc: "Whether your CV layout can be read by ATS parsers — tables and columns often can't" },
                { icon: "✏️", label: "Content quality", desc: "Whether your work experience uses strong action verbs and measurable achievements" },
                { icon: "📏", label: "Length & density", desc: "Whether your CV has enough content to be scored meaningfully" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 items-start bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section id="why-it-matters" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">2. Why Your Resume Score Matters in India</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              In India, the job market is intensely competitive. For every opening at TCS, Infosys, Wipro, Accenture, or any mid-sized IT company, hundreds of resumes are submitted. No recruiter can manually read every CV — so companies use ATS to automatically filter and rank candidates.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
              <p className="font-bold text-red-700 mb-1">⚠️ The number that should alarm every Indian job seeker:</p>
              <p className="text-red-700 text-sm leading-relaxed">
                Over 75% of resumes submitted online are rejected by ATS before any human reads them. If your resume score is below 70, you are almost certainly in this 75%.
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              This is why you can be genuinely qualified for a role — right experience, right skills, right education — and still hear nothing back. Your CV never reached a human. The ATS filtered you out automatically.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Checking your resume score is the first step to understanding exactly where you stand — and what needs to change to get into the shortlist zone.
            </p>
          </section>

          {/* Section 3 — Steps */}
          <section id="how-to-check" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">3. How to Check Your Resume Score Free — Step by Step</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              You can check your resume score completely free at <strong>scoremycv.in</strong>. Here is exactly how to do it:
            </p>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.n} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="font-bold text-slate-800 mb-1">{step.title}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition text-sm"
              >
                🔍 Check My Resume Score Now — Free
              </Link>
            </div>
          </section>

          {/* Section 4 — Score ranges */}
          <section id="score-ranges" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">4. What Your Resume Score Means</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Once you have your score, here is how to interpret it:
            </p>
            <div className="space-y-4">
              {scoreRanges.map((s) => (
                <div key={s.range} className={`border rounded-2xl p-5 ${s.color}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <span className="font-extrabold text-lg">{s.range}</span>
                      <span className="ml-2 font-semibold text-sm">— {s.label}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{s.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 — Improve */}
          <section id="how-to-improve" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">5. How to Improve Your Resume Score</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Once you know your score and the specific issues, there are two ways to fix them:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-slate-200 rounded-2xl p-5">
                <p className="font-bold text-slate-800 mb-3">🛠️ Fix it yourself</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Add missing keywords from the score report</li>
                  <li>• Remove tables and multi-column layout</li>
                  <li>• Rewrite bullets with action verbs + numbers</li>
                  <li>• Add a strong professional summary</li>
                  <li>• Tailor for the specific job role</li>
                </ul>
                <p className="text-slate-400 text-xs mt-3">Time required: 2–4 hours per CV</p>
              </div>
              <div className="border border-blue-200 bg-blue-50 rounded-2xl p-5">
                <p className="font-bold text-slate-800 mb-3">⚡ Get it rewritten for ₹19</p>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• All missing keywords added automatically</li>
                  <li>• Format fixed for ATS compatibility</li>
                  <li>• Every section professionally rewritten</li>
                  <li>• Strong action verbs and impact statements</li>
                  <li>• Clean PDF downloads instantly</li>
                </ul>
                <p className="text-blue-400 text-xs mt-3">Time required: 30 seconds after payment</p>
              </div>
            </div>
            <div className="text-center">
              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition text-sm"
              >
                🚀 Get My CV Rewritten for ₹19 — Instant Download
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "Is the resume score check really free?", a: "Yes, 100% free. Upload your resume, select your target job role, and your score appears instantly. No payment, no sign-up, no email required." },
                { q: "What is a good resume score in India?", a: "A score of 75 or above is competitive. Scores of 85+ are excellent and put you firmly in the shortlist zone. The average CV we analyse scores around 55, which is in the rejection zone." },
                { q: "How is my resume score calculated?", a: "Your score is calculated against 50+ criteria including keyword match for your target job role, formatting compatibility with ATS parsers, section completeness, content quality (action verbs, measurable achievements), and length and detail." },
                { q: "Can I check my resume score on mobile?", a: "Yes. scoremycv.in works on all devices — Android, iPhone, tablet, and desktop. No app download required." },
                { q: "How often should I check my resume score?", a: "Check it every time you update your CV or apply for a new type of role. Since ATS scores vary by job role (a Data Analyst CV scores differently for a Software Engineer role), you should check your score for each major role category you're applying to." },
                { q: "Will improving my resume score actually get me more interviews?", a: "Yes — if your score was below 70. Studies consistently show that ATS-optimised resumes get 2-3x more interview callbacks. The improvement is most dramatic for candidates who were previously below 60." },
              ].map((item, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl p-5">
                  <p className="font-bold text-slate-800 mb-2">Q: {item.q}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">A: {item.a}</p>
                </div>
              ))}
            </div>
          </section>


          {/* Related Articles */}
          <section className="mb-12">
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">Related Guides</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { href: "/blog/why-cv-gets-rejected", icon: "❌", title: "Why Is My CV Getting Rejected?", desc: "7 real reasons your CV is being auto-rejected before any human reads it." },
                { href: "/blog/how-to-write-ats-friendly-resume", icon: "✏️", title: "How to Write an ATS-Friendly Resume", desc: "The exact format and structure you need to pass ATS filters at top Indian companies." },
                { href: "/blog/free-ats-checker-india", icon: "🛠️", title: "Free ATS Checker India 2026", desc: "The only free ATS checker built specifically for Indian job seekers." },
                { href: "/blog/ats-resume-tips-freshers-india", icon: "🎓", title: "ATS Resume Tips for Freshers India", desc: "No experience? Here&#39;s how freshers can still get shortlisted by ATS systems." },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition-all block group">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 mb-1">{a.icon} {a.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{a.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          <div className="bg-blue-600 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Check Your Resume Score Right Now</h2>
            <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Free. Instant. No sign-up. See exactly what&#39;s holding your CV back and what needs to change to get into the shortlist zone.
            </p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg">
              🔍 Check My Resume Score — Free
            </Link>
            <p className="text-blue-300 text-xs mt-4">No sign-up · Results in seconds · CV rewrite for ₹19</p>
          </div>

        </article>

        <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="font-bold text-white text-lg">ScoreMyCV</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/blog/how-to-check-ats-score" className="hover:text-white transition">Check ATS Score</Link>
              <Link href="/blog/why-cv-gets-rejected" className="hover:text-white transition">Why CV Gets Rejected</Link>
              <Link href="/blog/how-to-write-ats-friendly-resume" className="hover:text-white transition">Write ATS Resume</Link>
              <Link href="/blog/ats-resume-tips-freshers-india" className="hover:text-white transition">Tips for Freshers</Link>
            </div>
            <p className="text-xs">© 2026 ScoreMyCV. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
