import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Is My CV Getting Rejected? 7 Real Reasons (India 2026) | ScoreMyCV",
  description:
    "Sending 50 job applications and hearing nothing back? Here are the 7 real reasons your CV is getting rejected in India — and exactly how to fix each one.",
  keywords:
    "why is my cv getting rejected, why resume rejected India, cv rejected by ATS, resume not getting shortlisted India, why am I not getting interview calls, ATS rejection India 2026",
  alternates: {
    canonical: "https://scoremycv.in/blog/why-cv-gets-rejected",
  },
  openGraph: {
    type: "article",
    url: "https://scoremycv.in/blog/why-cv-gets-rejected",
    title: "Why Is My CV Getting Rejected? 7 Real Reasons (India 2026)",
    description:
      "Sending 50 job applications and hearing nothing back? Here are the 7 real reasons your CV is getting rejected in India — and exactly how to fix each one.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Why Is My CV Getting Rejected? 7 Real Reasons (India 2026)",
  description:
    "Sending 50 job applications and hearing nothing back? Here are the 7 real reasons your CV is getting rejected in India — and exactly how to fix each one.",
  url: "https://scoremycv.in/blog/why-cv-gets-rejected",
  datePublished: "2026-07-15",
  dateModified: "2026-07-15",
  author: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  publisher: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  image: "https://scoremycv.in/og-image.png",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://scoremycv.in/blog/why-cv-gets-rejected" },
};

const reasons = [
  {
    n: "1",
    icon: "🤖",
    title: "ATS filtered you out before any human saw your CV",
    body: "This is the #1 reason and most people have no idea it's happening. Every major company in India — TCS, Infosys, Wipro, Accenture, Deloitte, HCL, and virtually every funded startup — uses Applicant Tracking System (ATS) software. When you apply on Naukri, LinkedIn, or a company careers page, your CV goes through ATS first. If your ATS score is below the threshold, your CV is rejected automatically. The recruiter never sees it. You never get a rejection email. You just hear nothing.",
    fix: "Check your ATS score for free at scoremycv.in. Upload your CV, select your target job role, and get your score in 30 seconds. Most CVs score below 60 — the shortlist zone starts at 80+.",
  },
  {
    n: "2",
    icon: "🔑",
    title: "Your CV is missing the right keywords",
    body: "ATS systems scan your CV for specific keywords from the job description. If you applied for a 'Data Analyst' role and your CV says 'data handling' instead of 'data analysis', or 'Excel' instead of 'Advanced Excel', those mismatches lower your ATS score significantly. Indian job seekers often write CVs in vague, generic language — 'responsible for', 'worked on', 'handled' — which scores poorly against specific keyword requirements.",
    fix: "Read the job description carefully. Find the exact words used for skills, tools, and responsibilities. Make sure those exact words appear naturally in your CV — especially in your Work Experience section.",
  },
  {
    n: "3",
    icon: "📄",
    title: "Your CV format is breaking the ATS parser",
    body: "Naukri resume templates, Canva CVs, and most downloaded resume formats use tables, columns, text boxes, and graphics. These look professional to human eyes but completely break ATS parsers. ATS software reads your CV as plain text — if your content is inside a table or text box, the ATS often cannot read it at all. Your keywords, your experience, your skills — all invisible to the system.",
    fix: "Use a simple single-column format with no tables, no text boxes, no graphics. Plain headings (Work Experience, Education, Skills), clean bullet points, and standard fonts. Save as PDF.",
  },
  {
    n: "4",
    icon: "📋",
    title: "Your CV has no clear structure or missing sections",
    body: "ATS systems look for specific sections: a professional summary, work experience with dates, education with degree names, and a skills section. If your CV uses non-standard headings like 'My Journey', 'What I've Done', or 'Career History' instead of 'Work Experience', ATS may not recognise those sections and score them as missing. Many Indian freshers also skip the professional summary entirely — which reduces score significantly.",
    fix: "Use standard section headings: Professional Summary, Work Experience, Education, Skills, Certifications. Make sure every section is clearly labelled and in the right order.",
  },
  {
    n: "5",
    icon: "🎯",
    title: "You're sending the same CV to every job",
    body: "This is the most expensive mistake Indian job seekers make. A generic CV is designed for no one in particular, which means it scores poorly for every specific role. ATS software scores your CV against the specific job description. A CV tailored for a Software Engineer role will score 30-40 points lower when submitted for a Data Analyst role — even if you're qualified for both.",
    fix: "Maintain 2-3 CV versions for different role types. At minimum, update your professional summary and skills section for each application to match the target role's language.",
  },
  {
    n: "6",
    icon: "📉",
    title: "Your work experience doesn't show measurable impact",
    body: "Indian CVs are notorious for vague, passive descriptions: 'Responsible for managing the team', 'Was involved in development of features', 'Worked under senior developer'. ATS systems and human recruiters both penalise this. Strong CVs use action verbs and numbers: 'Led a team of 5 engineers to deliver 3 product features, reducing load time by 40%'. Numbers and impact statements make your CV stand out at both the ATS and human review stages.",
    fix: "Rewrite every bullet point in your Work Experience using this formula: Action verb + What you did + Measurable result. Even estimates are better than nothing: 'Improved query performance by approximately 30%'.",
  },
  {
    n: "7",
    icon: "📧",
    title: "Your CV is in the wrong file format",
    body: "Sending your CV as a .jpg, .png, or a scanned image PDF? ATS cannot read images — your entire CV is invisible to the system. Even a well-designed Word CV can sometimes cause issues if it contains embedded images or complex formatting. This is surprisingly common among Indian freshers who scan a handwritten or printed CV.",
    fix: "Always submit your CV as a text-based PDF or .docx file. Open the file and try selecting text — if you can select and copy the text, ATS can read it. If the text is not selectable, it is an image and will score zero.",
  },
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
              📖 Job Search Guide · India 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Why Is My CV Getting Rejected?<br />
              <span className="text-blue-200">7 Real Reasons (India 2026)</span>
            </h1>
            <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">
              Sending 50 job applications and hearing nothing back is not bad luck — there are specific, fixable reasons your CV is being rejected. Here's what's actually happening.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-blue-300 text-sm">
              <span>📅 July 2026</span>
              <span>·</span>
              <span>⏱ 6 min read</span>
              <span>·</span>
              <span>✅ Free fix included</span>
            </div>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

          {/* Intro */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10">
            <p className="font-bold text-red-700 mb-2">⚠️ The uncomfortable truth about job applications in India:</p>
            <p className="text-red-700 text-sm leading-relaxed">
              Over 75% of CVs submitted online in India are rejected before a single human reads them. If you've been applying for weeks with no response, the problem is almost certainly your CV — not your qualifications.
            </p>
          </div>

          {/* TOC */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
            <p className="font-bold text-slate-800 mb-3">📋 7 reasons your CV is being rejected:</p>
            <ol className="space-y-1.5 text-sm text-blue-700 font-medium list-decimal list-inside">
              {reasons.map((r) => (
                <li key={r.n}><a href={`#reason-${r.n}`} className="hover:underline">{r.title}</a></li>
              ))}
            </ol>
          </div>

          {/* Reasons */}
          {reasons.map((r) => (
            <section key={r.n} id={`reason-${r.n}`} className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4 flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{r.icon}</span>
                <span>Reason {r.n}: {r.title}</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">{r.body}</p>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="font-bold text-green-700 mb-1">✅ How to fix it:</p>
                <p className="text-green-700 text-sm leading-relaxed">{r.fix}</p>
              </div>
            </section>
          ))}

          {/* CTA mid */}
          <div className="bg-blue-600 rounded-3xl p-8 text-center text-white mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Find Out Why YOUR CV Is Being Rejected</h2>
            <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Get your free ATS score in 30 seconds. See exactly which of these 7 problems your CV has — and get a fully rewritten version for just ₹19.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg"
            >
              🔍 Check My CV Score — Free
            </Link>
            <p className="text-blue-300 text-xs mt-4">No sign-up · Results in 30 seconds · CV rewrite for ₹19</p>
          </div>

          {/* Summary table */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">Quick Summary: Is Your CV Making These Mistakes?</h2>
            <div className="space-y-3">
              {[
                { check: "My CV passes through ATS before a human reads it", common: true },
                { check: "I use the exact keywords from the job description", common: false },
                { check: "My CV has no tables, columns or graphics", common: false },
                { check: "I have a Professional Summary, Work Experience, Education, Skills sections", common: false },
                { check: "I tailor my CV for each job role", common: false },
                { check: "My bullets use action verbs + numbers", common: false },
                { check: "My CV is saved as a text-based PDF or DOCX", common: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className={`text-lg flex-shrink-0 ${item.common ? "text-green-500" : "text-red-400"}`}>
                    {item.common ? "✅" : "❌"}
                  </span>
                  <p className="text-slate-700 text-sm">{item.check}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-4">If you ticked fewer than 5 of these, your CV is very likely being rejected by ATS before any recruiter sees it.</p>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "How do I know if my CV was rejected by ATS or a human?", a: "If you applied online and received no response at all — not even an automated acknowledgement — it was almost certainly ATS rejection. Human rejection usually comes with a standard 'We regret to inform you' email. ATS rejection is complete silence." },
                { q: "Does ATS rejection happen in India too?", a: "Yes. Every large Indian IT company (TCS, Infosys, Wipro, HCL, Tech Mahindra), every MNC, and most funded startups now use ATS software. Naukri and LinkedIn also have their own ranking algorithms that work similarly." },
                { q: "What is a good ATS score for getting shortlisted?", a: "A score of 75 or above is generally considered competitive. Scores above 85 are excellent. Most CVs we analyse score between 40-65, which puts them in the rejection zone." },
                { q: "Can I fix my CV myself?", a: "Yes — but it takes time. You need to identify your missing keywords, rewrite your work experience bullets, fix your formatting, and tailor your CV for each role. Alternatively, scoremycv.in rewrites your entire CV automatically for ₹19 and downloads the polished PDF instantly." },
                { q: "Will a professionally rewritten CV really make a difference?", a: "Yes — if the rewrite addresses the specific ATS issues your CV has. Generic templates don't help. A rewrite that adds the right keywords, fixes your format, and strengthens your language for your target role makes a measurable difference in your ATS score and interview callback rate." },
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
                { href: "/blog/how-to-check-resume-score", icon: "📊", title: "How to Check Your Resume Score Free", desc: "See your ATS score in 30 seconds and find out exactly what&#39;s holding your CV back." },
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

          {/* Final CTA */}
          <div className="bg-blue-600 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Stop Getting Rejected. Fix Your CV Today.</h2>
            <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Check your ATS score free. See exactly what&#39;s holding your CV back. Get it fully rewritten and download the polished PDF — for just ₹19.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg"
            >
              🚀 Check My CV Score — Free
            </Link>
            <p className="text-blue-300 text-xs mt-4">No sign-up · Results in 30 seconds · CV rewrite for ₹19</p>
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
              <Link href="/blog/how-to-check-resume-score" className="hover:text-white transition">Check Resume Score</Link>
              <Link href="/blog/ats-resume-tips-freshers-india" className="hover:text-white transition">Tips for Freshers</Link>
            </div>
            <p className="text-xs">© 2026 ScoreMyCV. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
