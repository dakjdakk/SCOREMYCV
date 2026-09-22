import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is ATS Score? Complete Guide for Indian Job Seekers (2026) | ScoreMyCV",
  description:
    "What is ATS score and why does it matter? Learn how ATS scoring works, what a good ATS score is, and how to check your ATS score free in India. Full 2026 guide.",
  keywords:
    "what is ats score, ats score meaning, ats score for resume, what is ats score in resume, ats score checker free India, ats resume score, what is a good ats score, ats score online free",
  alternates: {
    canonical: "https://scoremycv.in/blog/what-is-ats-score",
  },
  openGraph: {
    type: "article",
    url: "https://scoremycv.in/blog/what-is-ats-score",
    title: "What is ATS Score? Complete Guide for Indian Job Seekers (2026)",
    description:
      "What is ATS score and why does it matter for your job search? Learn how it works and how to check yours for free.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "What is ATS Score? Complete Guide for Indian Job Seekers (2026)",
  description:
    "What is ATS score and why does it matter? Learn how ATS scoring works, what a good ATS score is, and how to check your ATS score free in India.",
  url: "https://scoremycv.in/blog/what-is-ats-score",
  datePublished: "2026-09-22",
  dateModified: "2026-09-22",
  author: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  publisher: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  image: "https://scoremycv.in/og-image.png",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://scoremycv.in/blog/what-is-ats-score" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ATS score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ATS score is a numerical rating given to your resume by an Applicant Tracking System (ATS). It measures how well your resume matches the job requirements based on keywords, formatting, and content. A higher ATS score means your resume is more likely to be seen by a human recruiter.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good ATS score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A good ATS score is generally 75 or above out of 100. Scores above 80 are considered strong. Scores below 60 typically mean your resume will be filtered out before a recruiter ever sees it.",
      },
    },
    {
      "@type": "Question",
      name: "How do I check my ATS score for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can check your ATS score for free at ScoreMyCV.in. Simply upload your resume (PDF or Word), select your target job role, and get your ATS score instantly with a detailed breakdown.",
      },
    },
    {
      "@type": "Question",
      name: "Why is my ATS score low?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Common reasons for a low ATS score include: missing role-specific keywords, no professional summary, using tables or columns that ATS cannot read, missing contact information like LinkedIn, and bullet points that don't start with strong action verbs.",
      },
    },
  ],
};

export default function BlogPost() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-white">
        {/* Navbar */}
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
          {/* Breadcrumb */}
          <div className="text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span className="mx-2">›</span>
            <span>What is ATS Score?</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">ATS Guide</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              What is ATS Score? Complete Guide for Indian Job Seekers (2026)
            </h1>
            <p className="text-slate-500 text-sm">Published September 22, 2026 · 6 min read</p>
          </div>

          {/* Intro */}
          <p className="text-lg text-slate-700 mb-6 leading-relaxed">
            If you have been applying to jobs on Naukri, LinkedIn, or company portals and not hearing back — your <strong>ATS score</strong> could be the reason. In this guide, we explain exactly what ATS score means, how it works, what a good score looks like, and how to check yours for free in India.
          </p>

          {/* Section 1 */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">What is ATS Score?</h2>
          <p className="text-slate-700 mb-4 leading-relaxed">
            <strong>ATS score</strong> is a numerical rating — typically out of 100 — that an Applicant Tracking System (ATS) gives your resume. It measures how well your resume matches the job you are applying for, based on keywords, formatting, sections, and content quality.
          </p>
          <p className="text-slate-700 mb-4 leading-relaxed">
            A higher ATS score means your resume is more likely to reach a human recruiter. A low score means your resume gets automatically filtered out — often without a single person reading it.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
            <p className="text-blue-800 font-semibold text-sm">📊 Key fact: Over 75% of resumes are rejected by ATS before a recruiter ever sees them. Most candidates never find out why.</p>
          </div>

          {/* Section 2 */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">What is ATS? (Applicant Tracking System)</h2>
          <p className="text-slate-700 mb-4 leading-relaxed">
            ATS stands for <strong>Applicant Tracking System</strong>. It is software used by companies and recruiters to manage job applications at scale. When you apply for a job on Naukri, LinkedIn, Indeed, or a company&apos;s own careers page, your resume almost certainly passes through an ATS first.
          </p>
          <p className="text-slate-700 mb-4 leading-relaxed">
            The ATS reads your resume, extracts information, and assigns it a score or rank based on how well it matches the job description. Only resumes above a certain threshold are forwarded to the recruiter.
          </p>
          <p className="text-slate-700 mb-6 leading-relaxed">
            Companies like Infosys, TCS, Wipro, Deloitte, Amazon, and most MNCs in India use ATS systems to filter thousands of applications efficiently.
          </p>

          {/* Section 3 */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">How is ATS Score Calculated?</h2>
          <p className="text-slate-700 mb-4 leading-relaxed">ATS systems typically score resumes based on these factors:</p>
          <div className="space-y-4 mb-6">
            {[
              { title: "Keywords Match", desc: "Does your resume contain the specific skills and keywords from the job description? This is the single biggest factor. Missing keywords = low score." },
              { title: "Resume Sections", desc: "Does your resume have a Summary, Skills, Experience, Education, and Projects section? Missing sections reduce your score significantly." },
              { title: "Contact Information", desc: "Is your email, phone, and LinkedIn profile clearly listed? ATS needs this to process your application." },
              { title: "Action Verbs", desc: "Do your bullet points start with strong action verbs like Developed, Analysed, Built, Implemented? This signals achievement-oriented writing." },
              { title: "Quantified Achievements", desc: "Do your bullets include numbers and results? e.g. 'Improved report accuracy by 30%'. Metrics make your resume stand out." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-blue-600 font-bold text-lg mt-0.5">✓</span>
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section 4 */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">What is a Good ATS Score?</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700 rounded-tl-lg">ATS Score Range</th>
                  <th className="text-left p-3 font-semibold text-slate-700">What It Means</th>
                  <th className="text-left p-3 font-semibold text-slate-700 rounded-tr-lg">Action Needed</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="p-3 font-bold text-green-700">85 – 100</td>
                  <td className="p-3 text-slate-600">Excellent — very likely to reach recruiter</td>
                  <td className="p-3 text-slate-600">Minor tweaks only</td>
                </tr>
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td className="p-3 font-bold text-blue-700">70 – 84</td>
                  <td className="p-3 text-slate-600">Good — has a strong chance</td>
                  <td className="p-3 text-slate-600">Add missing keywords</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="p-3 font-bold text-yellow-700">50 – 69</td>
                  <td className="p-3 text-slate-600">Average — borderline</td>
                  <td className="p-3 text-slate-600">Rewrite skills & summary</td>
                </tr>
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td className="p-3 font-bold text-red-700">Below 50</td>
                  <td className="p-3 text-slate-600">Poor — likely filtered out</td>
                  <td className="p-3 text-slate-600">Full resume rewrite needed</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 5 */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Why Your ATS Score Might Be Low</h2>
          <p className="text-slate-700 mb-4 leading-relaxed">These are the most common reasons resumes score poorly in ATS:</p>
          <ul className="space-y-2 mb-6 text-slate-700">
            {[
              "Missing role-specific keywords the recruiter is filtering for",
              "No professional summary at the top of the resume",
              "Using tables, columns, or text boxes that ATS cannot parse",
              "Missing LinkedIn profile or contact details",
              "Bullet points that don't start with action verbs",
              "No quantified achievements (numbers, percentages, metrics)",
              "Wrong or generic job title that doesn't match the role applied for",
              "Uploading as PDF when the portal reads Word better",
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-red-500 mt-1">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Section 6 */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">How to Check Your ATS Score for Free in India</h2>
          <p className="text-slate-700 mb-4 leading-relaxed">
            You can check your ATS score for free at <strong>ScoreMyCV.in</strong> — no login, no signup required. Here is how:
          </p>
          <ol className="space-y-3 mb-6 text-slate-700">
            {[
              "Go to scoremycv.in",
              "Upload your resume (PDF or Word — both supported)",
              "Select your target job role from the dropdown",
              "Click 'Check My ATS Score'",
              "Get your score instantly with a full breakdown — contact info, sections, keywords, action verbs, and quantified achievements",
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">{i + 1}</span>
                <span className="mt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-slate-700 mb-6 leading-relaxed">
            The free ATS check shows your total score, which sections are missing, which keywords are absent, and exactly what to fix. If your score is below 75, you can get your full resume rewritten and download the polished ATS-optimised PDF for just ₹49.
          </p>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white text-center mb-10">
            <h3 className="text-xl font-extrabold mb-2">Check Your ATS Score — It&apos;s Free</h3>
            <p className="text-blue-100 text-sm mb-5">Upload your resume and see exactly why recruiters might be ignoring it. Takes 30 seconds.</p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-full text-sm hover:bg-blue-50 transition">
              Check My ATS Score Free →
            </Link>
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "What is ATS score in a resume?",
                a: "ATS score in a resume is a rating given by an Applicant Tracking System that measures how well your resume matches a job description. It is based on keywords, resume sections, formatting, action verbs, and quantified achievements. A higher score means better chances of reaching a recruiter.",
              },
              {
                q: "What is a good ATS score for a resume?",
                a: "A good ATS score is 75 or above. Scores of 85+ are excellent and give you a strong chance of getting shortlisted. Scores below 60 usually mean your resume gets filtered out automatically.",
              },
              {
                q: "Is ATS score the same as CV score?",
                a: "Yes — ATS score and CV score refer to the same thing. Both describe how well your resume is rated by an Applicant Tracking System. Some tools call it an ATS score, others call it a CV score or resume score.",
              },
              {
                q: "Can I check my ATS score for free?",
                a: "Yes. ScoreMyCV.in offers a completely free ATS score check. Upload your resume, select your job role, and get your score with a full breakdown instantly — no login needed.",
              },
              {
                q: "Does ATS score matter for freshers?",
                a: "Yes — ATS score matters even more for freshers because you are competing with hundreds of applicants for the same role. A high ATS score ensures your resume reaches the recruiter instead of being auto-rejected.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-5">
                <p className="font-semibold text-slate-800 mb-2">{item.q}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Related */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Related Articles</h3>
            <div className="space-y-3">
              <Link href="/blog/ats-score-full-form" className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition text-sm font-medium text-blue-700">ATS Full Form — What Does ATS Stand For? →</Link>
              <Link href="/blog/how-to-check-ats-score" className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition text-sm font-medium text-blue-700">How to Check ATS Score of Resume — Step by Step →</Link>
              <Link href="/blog/how-to-improve-cv-score" className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition text-sm font-medium text-blue-700">How to Improve Your CV Score — 7 Proven Tips →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
