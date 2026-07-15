import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free ATS Checker India 2026 — Check Your CV ATS Score Instantly | ScoreMyCV",
  description:
    "Best free ATS checker for India. Upload your resume and check your ATS score instantly — no sign-up, no email, 100% free. Find missing keywords and fix your CV before applying.",
  keywords:
    "free ATS checker India, ATS checker online free, ATS resume checker India, free resume ATS check, ATS score check free India, best ATS checker India 2026, free CV checker India",
  alternates: {
    canonical: "https://scoremycv.in/blog/free-ats-checker-india",
  },
  openGraph: {
    type: "article",
    url: "https://scoremycv.in/blog/free-ats-checker-india",
    title: "Free ATS Checker India 2026 — Check Your CV ATS Score Instantly",
    description:
      "Best free ATS checker for India. Upload your resume and check your ATS score instantly — no sign-up, no email, 100% free.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Free ATS Checker India 2026 — Check Your CV ATS Score Instantly",
  description:
    "Best free ATS checker for India. Upload your resume and check your ATS score instantly — no sign-up, no email, 100% free. Find missing keywords and fix your CV.",
  url: "https://scoremycv.in/blog/free-ats-checker-india",
  datePublished: "2026-07-15",
  dateModified: "2026-07-15",
  author: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  publisher: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  image: "https://scoremycv.in/og-image.png",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://scoremycv.in/blog/free-ats-checker-india" },
};

const features = [
  { icon: "🆓", title: "100% Free", desc: "No payment, no sign-up, no email required. Check your ATS score completely free, as many times as you want." },
  { icon: "⚡", title: "Instant Results", desc: "Your ATS score appears in 10-15 seconds. No waiting for an email or scheduled report." },
  { icon: "🎯", title: "Job Role Specific", desc: "Unlike generic checkers, your score is calculated against the specific job role you're applying for — giving you accurate, actionable results." },
  { icon: "🔑", title: "Missing Keywords Shown", desc: "You see exactly which keywords your CV is missing for your target role — not vague suggestions, specific terms." },
  { icon: "📊", title: "Category Breakdown", desc: "Score broken down by Keywords, Format, Experience, Education, and Skills — so you know exactly what to fix first." },
  { icon: "📱", title: "Works on Mobile", desc: "Check your ATS score from your phone, tablet, or desktop. No app required." },
];

const companies = [
  { name: "TCS", note: "Uses iCIMS & Taleo ATS" },
  { name: "Infosys", note: "Uses Workday ATS" },
  { name: "Wipro", note: "Uses SAP SuccessFactors" },
  { name: "Accenture", note: "Uses Workday ATS" },
  { name: "Deloitte", note: "Uses Workday ATS" },
  { name: "HCL", note: "Uses Taleo ATS" },
  { name: "Capgemini", note: "Uses SAP SuccessFactors" },
  { name: "Tech Mahindra", note: "Uses Oracle Recruiting" },
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
              <span className="hidden sm:inline">Check My ATS Score — Free →</span>
              <span className="sm:hidden">Check Score →</span>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 pt-28 pb-14 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              🛠️ Free Tool · India 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Free ATS Checker India 2026<br />
              <span className="text-blue-200">Check Your CV Score Instantly</span>
            </h1>
            <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">
              The only free ATS checker built specifically for Indian job seekers. Upload your CV, select your target role, and see your ATS score in seconds — no sign-up, no email, no payment.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg"
              >
                🔍 Check My ATS Score — Free →
              </Link>
              <p className="text-blue-300 text-xs mt-3">No sign-up · Results in seconds · 100% free</p>
            </div>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

          {/* TOC */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
            <p className="font-bold text-slate-800 mb-3">📋 In this guide:</p>
            <ol className="space-y-1.5 text-sm text-blue-700 font-medium list-decimal list-inside">
              <li><a href="#what-is-ats-checker" className="hover:underline">What is an ATS checker?</a></li>
              <li><a href="#why-need-one" className="hover:underline">Why every Indian job seeker needs an ATS checker</a></li>
              <li><a href="#how-to-use" className="hover:underline">How to use the free ATS checker</a></li>
              <li><a href="#features" className="hover:underline">What the free ATS checker includes</a></li>
              <li><a href="#companies" className="hover:underline">Which Indian companies use ATS?</a></li>
              <li><a href="#after-score" className="hover:underline">What to do after you get your score</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <section id="what-is-ats-checker" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">1. What Is an ATS Checker?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              An ATS checker is a tool that analyses your resume against the same criteria used by <strong>Applicant Tracking System (ATS)</strong> software — the software companies use to automatically filter CVs before any human reads them.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              When you apply for a job online, your CV goes through ATS first. The system scans for keywords, checks your formatting, evaluates your section structure, and assigns your CV a rank. Only the top-ranked CVs move forward to human recruiters. The rest are automatically rejected — often without any notification.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              An ATS checker simulates this process and gives you your score <em>before</em> you apply — so you can fix the problems before they cost you an opportunity.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="font-bold text-green-700 mb-1">✅ The key difference with scoremycv.in:</p>
              <p className="text-green-700 text-sm leading-relaxed">
                Most ATS checkers give you a generic score. scoremycv.in scores your CV against your <strong>specific target job role</strong> — the same way real ATS software does. A score for a Python Developer role is different from a score for a Data Analyst role, even with the same CV.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="why-need-one" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">2. Why Every Indian Job Seeker Needs an ATS Checker</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The Indian job market has changed dramatically. With lakhs of candidates applying online for every opening, manual CV review is impossible for large employers. ATS software is now standard across the industry.
            </p>
            <div className="space-y-4 mb-4">
              {[
                { stat: "75%", label: "of resumes submitted online in India are rejected by ATS before any human sees them" },
                { stat: "50+", label: "applications the average Indian job seeker sends before getting one interview callback" },
                { stat: "30 sec", label: "is how long a human recruiter spends on a CV that does pass ATS — first impressions matter" },
              ].map((item) => (
                <div key={item.stat} className="flex gap-4 items-center bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="text-3xl font-extrabold text-blue-600 flex-shrink-0 min-w-[70px] text-center">{item.stat}</div>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-600 leading-relaxed">
              Checking your ATS score before applying takes 30 seconds and can be the difference between getting an interview and getting silently rejected. It costs nothing.
            </p>
          </section>

          {/* Section 3 */}
          <section id="how-to-use" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">3. How to Use the Free ATS Checker</h2>
            <div className="space-y-4 mb-6">
              {[
                { n: "1", title: "Visit scoremycv.in", desc: "Open the site on any device. No account needed." },
                { n: "2", title: "Upload your CV", desc: "Select your resume file — PDF, DOC, or DOCX format. Max 10MB." },
                { n: "3", title: "Select your target job role", desc: "Choose from 60+ IT and tech roles — from Software Engineer to Data Scientist, DevOps, Cybersecurity, and more." },
                { n: "4", title: "Click 'Check My ATS Score — Free'", desc: "Your score is calculated in 10-15 seconds." },
                { n: "5", title: "Read your full report", desc: "See your overall score, breakdown by category, missing keywords, and all issues detected." },
              ].map((step) => (
                <div key={step.n} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-bold text-slate-800 mb-0.5">{step.title}</p>
                    <p className="text-slate-500 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition text-sm"
              >
                🔍 Use the Free ATS Checker Now →
              </Link>
            </div>
          </section>

          {/* Section 4 — Features */}
          <section id="features" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">4. What the Free ATS Checker Includes</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.title} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="font-bold text-slate-800 mb-1">{f.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 — Companies */}
          <section id="companies" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">5. Which Indian Companies Use ATS?</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              All large Indian IT companies and MNCs now use ATS software. Here are the major employers and the ATS systems they use:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {companies.map((c) => (
                <div key={c.name} className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    {c.name.substring(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                    <p className="text-slate-400 text-xs">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Beyond these, virtually every funded startup, every BFSI company, and every MNC operating in India uses some form of ATS or keyword-based resume filtering. If you're applying online, assume ATS is in play.
            </p>
          </section>

          {/* Section 6 */}
          <section id="after-score" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">6. What to Do After You Get Your Score</h2>
            <div className="space-y-4">
              {[
                { score: "85+", action: "You're in the shortlist zone. Apply confidently. Consider a minor polish to get closer to 95+.", color: "border-green-200 bg-green-50 text-green-700" },
                { score: "70–84", action: "Add the missing keywords shown in your report. Rewrite 2-3 experience bullets with stronger action verbs and numbers.", color: "border-yellow-200 bg-yellow-50 text-yellow-700" },
                { score: "50–69", action: "Significant rewrite needed. Fix formatting (remove tables/columns), add missing keywords, improve section structure. Or get it rewritten for ₹19.", color: "border-orange-200 bg-orange-50 text-orange-700" },
                { score: "Below 50", action: "Your CV needs a complete rewrite. The formatting, keywords, and content all need work. Getting it professionally rewritten for ₹19 is the fastest path forward.", color: "border-red-200 bg-red-50 text-red-700" },
              ].map((item) => (
                <div key={item.score} className={`border rounded-2xl p-5 ${item.color}`}>
                  <p className="font-extrabold text-lg mb-1">Score {item.score}</p>
                  <p className="text-sm leading-relaxed">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mid CTA */}
          <div className="bg-blue-600 rounded-3xl p-8 text-center text-white mb-12">
            <h2 className="text-2xl font-extrabold mb-2">Score below 80? Get it fixed instantly.</h2>
            <p className="text-blue-200 text-sm mb-5 max-w-sm mx-auto">
              We rewrite your entire CV — missing keywords added, formatting fixed, action verbs throughout — and your polished PDF downloads instantly for ₹19.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-2xl hover:bg-blue-50 transition text-sm shadow-lg"
            >
              🚀 Get My CV Rewritten for ₹19 — Instant Download
            </Link>
          </div>

          {/* FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "Is this ATS checker really free?", a: "Yes, 100% free. Check your ATS score as many times as you want — there is no sign-up, no payment, and no email required. The CV rewrite is a paid feature (₹19), but the score check itself is always free." },
                { q: "Is scoremycv.in the best free ATS checker for India?", a: "It is the only free ATS checker built specifically for the Indian job market and Indian job roles. Most global tools (like Jobscan or Resume Worded) are built for US/UK job markets and don't reflect how Indian companies use ATS." },
                { q: "How accurate is the ATS score?", a: "Very accurate for keyword and structure analysis. The score is calculated using the same criteria ATS software applies — keyword frequency and match, section recognition, format parsing compatibility, and content quality signals." },
                { q: "Can I check multiple CVs or multiple job roles?", a: "Yes. You can upload different CV versions and check them against different job roles. There is no limit. Many candidates check 2-3 versions of their CV to see which scores highest for their target role." },
                { q: "Does the ATS checker store my CV?", a: "No. Your CV is processed in memory to generate the score and is not stored on our servers. Your personal information is not retained after the check is complete." },
                { q: "What file formats does the ATS checker accept?", a: "PDF, DOC, and DOCX. PDF is recommended as it is the standard for job applications. Make sure your PDF is text-based (you can select and copy text from it) — scanned image PDFs cannot be analysed." },
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
                { href: "/blog/why-cv-gets-rejected", icon: "❌", title: "Why Is My CV Getting Rejected?", desc: "7 real reasons your CV is auto-rejected before a human reads it." },
                { href: "/blog/how-to-write-ats-friendly-resume", icon: "✏️", title: "How to Write an ATS-Friendly Resume", desc: "The exact format and keywords to pass ATS at TCS, Infosys, Accenture." },
                { href: "/blog/ats-resume-tips-freshers-india", icon: "🎓", title: "ATS Resume Tips for Freshers India", desc: "No experience? Here&#39;s how freshers still get shortlisted in 2026." },
                { href: "/blog/how-to-check-resume-score", icon: "📊", title: "How to Check Your Resume Score Free", desc: "See your ATS score in 30 seconds — no sign-up needed." },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition-all block group">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 mb-1">{a.icon} {a.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{a.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          <div className="bg-blue-600 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Use the Free ATS Checker Now</h2>
            <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              30 seconds. No sign-up. See your ATS score, your missing keywords, and exactly what&#39;s stopping you from getting interview calls.
            </p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg">
              🔍 Check My ATS Score — Free →
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
