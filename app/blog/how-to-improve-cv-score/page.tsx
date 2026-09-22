import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Improve CV Score — 7 Proven Tips to Boost ATS Score (2026) | ScoreMyCV",
  description:
    "Learn how to improve your CV score and ATS score in India. 7 proven tips to boost your resume score, add missing keywords, fix formatting, and get more interview calls.",
  keywords:
    "how to improve cv score, how to improve ats score, improve resume ats score, boost cv score, cv score improvement tips India, how to increase ats score, how to get higher ats score, cv score checker free",
  alternates: {
    canonical: "https://scoremycv.in/blog/how-to-improve-cv-score",
  },
  openGraph: {
    type: "article",
    url: "https://scoremycv.in/blog/how-to-improve-cv-score",
    title: "How to Improve CV Score — 7 Proven Tips to Boost ATS Score (2026)",
    description: "7 proven tips to improve your CV score and pass ATS filters in India. Add keywords, fix formatting, and get more interview calls.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Improve CV Score — 7 Proven Tips to Boost ATS Score (2026)",
  description: "7 proven tips to improve your CV score and ATS score in India. Add missing keywords, fix formatting, and get more interview calls.",
  url: "https://scoremycv.in/blog/how-to-improve-cv-score",
  datePublished: "2026-09-22",
  dateModified: "2026-09-22",
  author: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  publisher: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  image: "https://scoremycv.in/og-image.png",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://scoremycv.in/blog/how-to-improve-cv-score" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I improve my CV score?",
      acceptedAnswer: { "@type": "Answer", text: "To improve your CV score: add role-specific keywords, write a strong professional summary, use action verbs at the start of every bullet point, add quantified achievements with numbers, include your LinkedIn profile, avoid tables and columns in formatting, and ensure all key sections (Summary, Skills, Experience, Education) are present." },
    },
    {
      "@type": "Question",
      name: "How do I get a higher ATS score?",
      acceptedAnswer: { "@type": "Answer", text: "To get a higher ATS score: match your resume keywords to the job description, add all required resume sections, use simple single-column formatting without tables, start bullet points with strong action verbs, include metrics and numbers in your achievements, and add your LinkedIn and contact information clearly." },
    },
  ],
};

export default function BlogPost() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <div className="text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span className="mx-2">›</span>
            <span>How to Improve CV Score</span>
          </div>

          <div className="mb-10">
            <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Resume Tips</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              How to Improve CV Score — 7 Proven Tips to Boost Your ATS Score (2026)
            </h1>
            <p className="text-slate-500 text-sm">Published September 22, 2026 · 7 min read</p>
          </div>

          <p className="text-lg text-slate-700 mb-6 leading-relaxed">
            Your CV score — also called your <strong>ATS score</strong> — determines whether your resume reaches a recruiter or gets auto-rejected. In India, most companies use ATS software to filter resumes automatically. If your score is below 75, you are likely being filtered out before anyone reads your resume. Here are 7 proven ways to improve your CV score and get more interview calls.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <p className="text-amber-800 font-semibold text-sm">⚡ Before you start: Check your current ATS score for free at ScoreMyCV.in — it shows exactly which of these 7 areas you are failing in, so you know exactly what to fix first.</p>
          </div>

          {/* 7 Tips */}
          {[
            {
              num: "01",
              title: "Add Role-Specific Keywords",
              content: `The single biggest reason for a low CV score is missing keywords. ATS systems search your resume for specific skills and tools that match the job description. If those words are not present, your score drops immediately.

How to fix it: Read the job description carefully and identify the key skills listed. Then make sure those exact words appear naturally in your Skills section, Summary, and experience bullets.

For a Data Analyst role, keywords to include: SQL, Power BI, Python, Excel, Tableau, DAX, Power Query, KPI, Dashboard, Data Cleaning, EDA, Pivot Tables, VLOOKUP.

For a Business Analyst role: Requirement Gathering, Stakeholder Management, Process Improvement, JIRA, Agile, BRD, UAT, Gap Analysis.`,
            },
            {
              num: "02",
              title: "Write a Strong Professional Summary",
              content: `Many freshers skip the Summary section — this is a serious mistake. ATS systems check for a Summary section as part of your score. Without it, you lose points immediately.

Your summary should be 3-4 lines that mention your role, years of experience (or internship), key skills, and what you bring to the table. It should be keyword-rich and start with your target job title.

Example: "Data Analyst with 1 year of internship experience in dashboard development, SQL reporting, and KPI tracking. Proficient in Power BI, Advanced Excel, Python, and Tableau. Immediate joiner, open to relocate."`,
            },
            {
              num: "03",
              title: "Start Every Bullet with an Action Verb",
              content: `ATS systems check whether your bullet points start with strong action verbs. This signals achievement-oriented writing and is a key scoring factor.

Weak: "Responsible for creating dashboards in Power BI"
Strong: "Developed interactive Power BI dashboards tracking 6 KPIs for HR leadership"

Action verbs that improve your ATS score: Developed, Analysed, Built, Implemented, Automated, Designed, Optimized, Improved, Delivered, Streamlined, Generated, Resolved, Validated, Managed, Led.

Aim for at least 8 bullet points starting with unique action verbs across your resume.`,
            },
            {
              num: "04",
              title: "Add Quantified Achievements",
              content: `Resumes with numbers score higher on ATS and are more compelling to recruiters. Numbers make your achievements specific and credible.

Instead of: "Improved reporting process"
Write: "Reduced manual reporting time by 40% through Excel automation"

Instead of: "Worked on SQL queries"
Write: "Wrote optimised SQL queries across 5+ tables, reducing report generation time by 30%"

You do not need exact figures — reasonable estimates based on your actual work are fine. Even small numbers (2 projects, 3 dashboards, 5 KPIs) make a big difference.`,
            },
            {
              num: "05",
              title: "Include All Key Resume Sections",
              content: `ATS systems check for specific sections in your resume. Missing a section means losing points directly. Every resume must have:

✓ Summary / Professional Summary
✓ Technical Skills / Core Skills
✓ Experience / Internship
✓ Projects
✓ Education
✓ Certifications (if applicable)

Each section heading must be clearly labelled. Do not rename them to something creative — stick to standard names that ATS can recognise.`,
            },
            {
              num: "06",
              title: "Fix Your Contact Information",
              content: `ATS systems verify your contact section for completeness. Missing any of these reduces your score:

✓ Email address
✓ Phone number (with country code — +91 for India)
✓ LinkedIn profile URL
✓ City and state (important for location-based filtering)
✓ "Open to Relocate" — add this if you are willing to move cities

Your LinkedIn URL should be a clean, custom URL (linkedin.com/in/yourname) — not the default long URL with random numbers.`,
            },
            {
              num: "07",
              title: "Use Simple, Clean Formatting",
              content: `ATS software cannot read content inside tables, text boxes, headers, footers, or multi-column layouts. Even if your resume looks great visually, the ATS may extract your text in the wrong order or miss sections entirely.

Rules for ATS-friendly formatting:
✓ Single-column layout only
✓ No tables for skills or contact info
✓ No text boxes or headers/footers
✓ Standard fonts: Calibri, Arial, Times New Roman
✓ Font size 10-12pt for body, 14-16pt for name
✓ Use bullet points, not dashes or symbols
✓ Save as .docx (Word) when submitting online — ATS reads Word better than PDF`,
            },
          ].map((tip, i) => (
            <div key={i} className="mb-8">
              <div className="flex items-start gap-4 mb-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center">{tip.num}</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{tip.title}</h2>
              </div>
              <div className="ml-14">
                {tip.content.split("\n\n").map((para, j) => (
                  <p key={j} className="text-slate-700 leading-relaxed mb-3 text-sm sm:text-base">{para}</p>
                ))}
              </div>
              {i < 6 && <div className="border-b border-slate-100 mt-6" />}
            </div>
          ))}

          {/* Summary table */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Quick Summary — What Affects Your CV Score</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Factor</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Max Score</th>
                  <th className="text-left p-3 font-semibold text-slate-700">How to Maximise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Contact Information", "10/10", "Email + Phone + LinkedIn + Location"],
                  ["Resume Sections", "25/25", "Summary, Skills, Experience, Education, Projects"],
                  ["Role-Specific Keywords", "30/30", "Match keywords from job description"],
                  ["Action Verbs", "20/20", "8+ bullets starting with verbs from the ATS list"],
                  ["Quantified Achievements", "15/15", "Add numbers to 8+ bullet points"],
                ].map((row, i) => (
                  <tr key={i} className={`border-t border-slate-100 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                    {row.map((cell, j) => <td key={j} className="p-3 text-slate-600">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white text-center mb-10">
            <h3 className="text-xl font-extrabold mb-2">Check Your CV Score — Free in 30 Seconds</h3>
            <p className="text-blue-100 text-sm mb-5">Upload your resume and get an instant breakdown of exactly what is hurting your score and what to fix.</p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-full text-sm hover:bg-blue-50 transition">
              Check My CV Score Free →
            </Link>
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: "How can I improve my CV score quickly?", a: "The fastest way to improve your CV score is to: (1) add missing role-specific keywords to your Skills section, (2) write a professional summary if you don't have one, (3) change weak bullet points to start with action verbs. These three changes alone can improve your score by 15-20 points." },
              { q: "What is a CV score and how is it calculated?", a: "A CV score (also called ATS score) is a rating out of 100 that measures how well your resume is optimised for Applicant Tracking Systems. It is calculated based on contact information, resume sections, role-specific keywords, action verbs, and quantified achievements." },
              { q: "How many keywords should I add to improve my CV score?", a: "Aim to match at least 80% of the role-specific keywords for your target job. For a Data Analyst role, this means including 15-20 relevant tools and skills. Check your keyword score on ScoreMyCV.in to see exactly which keywords you are missing." },
              { q: "Does CV score matter for freshers?", a: "Yes, CV score matters especially for freshers because you are competing with many other applicants for the same role. A high ATS score ensures a recruiter actually reads your resume. Many freshers have great skills but low scores simply because of missing keywords and formatting issues." },
              { q: "Can I improve my CV score without work experience?", a: "Yes. For freshers without full-time experience, focus on: adding internship projects with strong keywords and metrics, listing all relevant technical skills, adding certifications, and writing a strong summary that highlights your tools and what you can do." },
            ].map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-5">
                <p className="font-semibold text-slate-800 mb-2">{item.q}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Related Articles</h3>
            <div className="space-y-3">
              <Link href="/blog/what-is-ats-score" className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition text-sm font-medium text-blue-700">What is ATS Score? Complete Guide →</Link>
              <Link href="/blog/ats-score-full-form" className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition text-sm font-medium text-blue-700">ATS Full Form — What Does ATS Stand For? →</Link>
              <Link href="/blog/how-to-check-ats-score" className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition text-sm font-medium text-blue-700">How to Check ATS Score of Resume Free →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
