import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ATS Resume & CV Blog — India 2026 | ScoreMyCV",
  description:
    "Free guides for Indian job seekers on ATS scores, CV writing, resume tips for freshers, and how to get shortlisted at top companies. Updated 2026.",
  keywords:
    "ATS resume blog India, CV tips India, resume guide India 2026, ATS score blog, job search tips India",
  alternates: {
    canonical: "https://scoremycv.in/blog",
  },
  openGraph: {
    type: "website",
    url: "https://scoremycv.in/blog",
    title: "ATS Resume & CV Blog — India 2026 | ScoreMyCV",
    description: "Free guides for Indian job seekers on ATS scores, CV writing, and how to get shortlisted.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const posts = [
  {
    slug: "why-cv-gets-rejected",
    title: "Why Is My CV Getting Rejected? 7 Real Reasons (India 2026)",
    desc: "Sending 50 applications and hearing nothing? Here are the 7 real reasons your CV is being rejected — and exactly how to fix each one.",
    tag: "Job Search",
    readTime: "6 min",
    icon: "❌",
  },
  {
    slug: "ats-resume-tips-freshers-india",
    title: "ATS Resume Tips for Freshers in India (2026) — Get Shortlisted",
    desc: "No experience? Here's how freshers can write an ATS-friendly resume that gets past automated filters and into recruiter hands.",
    tag: "Freshers",
    readTime: "6 min",
    icon: "🎓",
  },
  {
    slug: "how-to-write-ats-friendly-resume",
    title: "How to Write an ATS-Friendly Resume in India (2026 Guide)",
    desc: "The exact format, keywords, and structure you need to pass ATS filters at TCS, Infosys, Accenture and other top companies.",
    tag: "Resume Writing",
    readTime: "7 min",
    icon: "✏️",
  },
  {
    slug: "free-ats-checker-india",
    title: "Free ATS Checker India 2026 — Check Your CV Score Instantly",
    desc: "The only free ATS checker built for Indian job seekers. Check your score, find missing keywords, fix your CV — no sign-up needed.",
    tag: "Free Tool",
    readTime: "5 min",
    icon: "🛠️",
  },
  {
    slug: "how-to-check-resume-score",
    title: "How to Check Your Resume Score Free Online (India 2026)",
    desc: "Check your resume score free in 30 seconds. See your ATS score, missing keywords, and exactly why recruiters are ignoring your CV.",
    tag: "Resume Score",
    readTime: "5 min",
    icon: "📊",
  },
  {
    slug: "how-to-check-ats-score",
    title: "How to Check Your CV ATS Score Free in India (2026 Guide)",
    desc: "75% of resumes in India are auto-rejected before a human reads them. Learn what ATS is and how to check and fix your score for free.",
    tag: "ATS Guide",
    readTime: "5 min",
    icon: "🔍",
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <span className="font-bold text-blue-700 text-lg">ScoreMyCV</span>
          </Link>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap">
            <span className="hidden sm:inline">Check My ATS Score — Free →</span>
            <span className="sm:hidden">Check Score →</span>
          </Link>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-blue-700 to-blue-900 pt-28 pb-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            📖 Free Guides for Indian Job Seekers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            ATS Resume & CV Blog
          </h1>
          <p className="text-blue-200 text-base max-w-xl mx-auto">
            Practical guides to help you get past ATS filters, write better CVs, and get more interview calls — written specifically for the Indian job market.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-slate-800 mb-1">Check your CV ATS score free — takes 30 seconds</p>
            <p className="text-slate-500 text-sm">Upload your resume, select your target role, see exactly what's holding you back.</p>
          </div>
          <Link href="/" className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm whitespace-nowrap">
            Check My Score →
          </Link>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <div className="border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{post.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{post.tag}</span>
                      <span className="text-slate-400 text-xs">⏱ {post.readTime} read</span>
                    </div>
                    <h2 className="font-extrabold text-slate-800 text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{post.desc}</p>
                  </div>
                  <div className="text-blue-400 text-xl flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-600 rounded-3xl p-8 text-center text-white mt-12">
          <h2 className="text-2xl font-extrabold mb-2">Stop Getting Rejected. Fix Your CV Today.</h2>
          <p className="text-blue-200 text-sm mb-5 max-w-md mx-auto">
            Free ATS score check. See missing keywords. Get your CV fully rewritten for ₹19.
          </p>
          <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg">
            🔍 Check My ATS Score — Free
          </Link>
          <p className="text-blue-300 text-xs mt-4">No sign-up · Results in seconds · CV rewrite for ₹19</p>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <span className="font-bold text-white text-lg">ScoreMyCV</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/blog/how-to-check-ats-score" className="hover:text-white transition">Check ATS Score</Link>
            <Link href="/blog/why-cv-gets-rejected" className="hover:text-white transition">Why CV Gets Rejected</Link>
            <Link href="/blog/ats-resume-tips-freshers-india" className="hover:text-white transition">Tips for Freshers</Link>
          </div>
          <p className="text-xs">© 2026 ScoreMyCV. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
