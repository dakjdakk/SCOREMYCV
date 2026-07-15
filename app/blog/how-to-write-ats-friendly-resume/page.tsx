import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Write an ATS-Friendly Resume in India (2026 Guide) | ScoreMyCV",
  description:
    "Step-by-step guide to writing an ATS-friendly resume for Indian job seekers. Learn the exact format, keywords, and structure that passes ATS filters at TCS, Infosys, Accenture and more.",
  keywords:
    "how to write ATS friendly resume India, ATS resume format India, ATS optimized resume India, ATS resume tips India 2026, how to make resume ATS friendly, ATS resume writing guide India",
  alternates: {
    canonical: "https://scoremycv.in/blog/how-to-write-ats-friendly-resume",
  },
  openGraph: {
    type: "article",
    url: "https://scoremycv.in/blog/how-to-write-ats-friendly-resume",
    title: "How to Write an ATS-Friendly Resume in India (2026 Guide)",
    description:
      "Step-by-step guide to writing an ATS-friendly resume for Indian job seekers. Learn the exact format, keywords, and structure that passes ATS filters.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Write an ATS-Friendly Resume in India (2026 Guide)",
  description:
    "Step-by-step guide to writing an ATS-friendly resume for Indian job seekers in 2026.",
  url: "https://scoremycv.in/blog/how-to-write-ats-friendly-resume",
  datePublished: "2026-07-15",
  dateModified: "2026-07-15",
  author: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  publisher: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  image: "https://scoremycv.in/og-image.png",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://scoremycv.in/blog/how-to-write-ats-friendly-resume" },
};

const dosDonts = [
  { do: "Use a single-column layout", dont: "Use tables, columns, or text boxes" },
  { do: "Use standard section headings (Work Experience, Education, Skills)", dont: "Use creative headings like 'My Journey' or 'What I've Done'" },
  { do: "Save as text-based PDF or DOCX", dont: "Save as image PDF, JPG, or PNG" },
  { do: "Use standard fonts (Arial, Calibri, Times New Roman)", dont: "Use decorative or uncommon fonts" },
  { do: "Include keywords from the job description", dont: "Use vague, generic language" },
  { do: "Use bullet points for experience", dont: "Write paragraphs in your work experience" },
  { do: "Include dates for every job and degree", dont: "Leave dates vague or missing" },
  { do: "Tailor your resume for each role", dont: "Send the same generic resume everywhere" },
];

const sections = [
  {
    title: "1. Professional Summary (5-6 lines)",
    content: "This is the first section ATS scans. Write a focused summary that includes your job title, years of experience, key skills, and what you bring to the role. Include 3-4 keywords from the job description naturally.",
    example: `"Results-driven Data Analyst with 4 years of experience in SQL, Python, and Power BI. Proven track record of building dashboards and reporting systems that improved business decision-making. Experienced in ETL pipelines, data modeling, and stakeholder reporting across BFSI and e-commerce domains."`,
    bad: `"Seeking a challenging role in a dynamic organization where I can utilize my skills and grow professionally."`,
  },
  {
    title: "2. Work Experience (most important section)",
    content: "List your jobs in reverse chronological order. For each role, include: Company name, Job title, Dates (Month Year – Month Year), and 4-6 bullet points using action verbs + measurable results.",
    example: `"• Developed and maintained 15+ Power BI dashboards tracking sales KPIs for 3 business units, reducing manual reporting time by 60%\n• Wrote complex SQL queries to extract and transform data from PostgreSQL databases for monthly executive reports"`,
    bad: `"• Responsible for creating reports\n• Worked with the data team\n• Handled various tasks as assigned"`,
  },
  {
    title: "3. Skills Section",
    content: "List your technical skills clearly. ATS scans this section heavily. Use the exact terms from job descriptions — not abbreviations or informal names.",
    example: `"Technical Skills: Python, SQL, Power BI, Tableau, Excel (Advanced), Pandas, NumPy, MySQL, PostgreSQL, ETL, Data Modeling, DAX, Power Query"`,
    bad: `"Good with computers, Excel, some Python, data tools"`,
  },
  {
    title: "4. Education",
    content: "Include your degree name, institution, year of passing, and percentage/CGPA. ATS looks for specific degree keywords. Write the full degree name — B.Tech, B.E., MBA, MCA — not abbreviations alone.",
    example: `"Bachelor of Technology (B.Tech) — Computer Science Engineering\nABC Institute of Technology, Pune | 2022 | CGPA: 8.2/10"`,
    bad: `"B.Tech CSE — ABC College, 2022"`,
  },
  {
    title: "5. Certifications (if any)",
    content: "Include relevant certifications with the full name, issuing organization, and year. ATS specifically scans for certification keywords in IT roles.",
    example: `"AWS Certified Solutions Architect – Associate | Amazon Web Services | 2025\nGoogle Data Analytics Professional Certificate | Google | 2024"`,
    bad: `"AWS cert, few online courses"`,
  },
];

export default function BlogPost() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
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
              📖 Resume Writing Guide · India 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              How to Write an ATS-Friendly Resume<br />
              <span className="text-blue-200">India 2026 — Complete Guide</span>
            </h1>
            <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">
              Most Indian resumes fail ATS filters not because of poor experience — but because of avoidable formatting and keyword mistakes. Here's exactly how to fix that.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-blue-300 text-sm">
              <span>📅 July 2026</span><span>·</span>
              <span>⏱ 7 min read</span><span>·</span>
              <span>✅ Free checker included</span>
            </div>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
            <p className="font-bold text-slate-800 mb-3">📋 In this guide:</p>
            <ol className="space-y-1.5 text-sm text-blue-700 font-medium list-decimal list-inside">
              <li><a href="#what-ats-wants" className="hover:underline">What ATS software actually looks for</a></li>
              <li><a href="#dos-donts" className="hover:underline">ATS resume dos and don'ts</a></li>
              <li><a href="#format" className="hover:underline">The right ATS-friendly format</a></li>
              <li><a href="#sections" className="hover:underline">How to write each section</a></li>
              <li><a href="#keywords" className="hover:underline">How to find and use the right keywords</a></li>
              <li><a href="#check-score" className="hover:underline">How to check if your resume is ATS-friendly</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
            </ol>
          </div>

          <section id="what-ats-wants" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">1. What ATS Software Actually Looks For</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              ATS doesn't read your resume like a human. It parses your CV as raw text and then scores it against a checklist. Understanding this is the key to writing an ATS-friendly resume.
            </p>
            <div className="space-y-3">
              {[
                { icon: "🔑", label: "Keyword match", desc: "Does your resume contain the specific words and phrases from the job description? This is weighted most heavily." },
                { icon: "📋", label: "Section recognition", desc: "Can the ATS identify your Work Experience, Education, and Skills sections? Non-standard headings confuse parsers." },
                { icon: "📄", label: "Parsability", desc: "Can the ATS extract your text cleanly? Tables, columns, and graphics often prevent text from being read." },
                { icon: "📅", label: "Chronology", desc: "Are your jobs and degrees listed with clear dates? ATS checks for career gaps and experience length." },
                { icon: "✏️", label: "Content quality signals", desc: "Does your experience section use action verbs? Are there measurable achievements? These affect ranking score." },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="dos-donts" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">2. ATS Resume Dos and Don'ts</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 bg-slate-800 text-white text-sm font-bold">
                <div className="p-3 border-r border-slate-600">✅ DO</div>
                <div className="p-3">❌ DON'T</div>
              </div>
              {dosDonts.map((item, i) => (
                <div key={i} className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                  <div className="p-3 border-r border-slate-100 text-green-700">{item.do}</div>
                  <div className="p-3 text-red-600">{item.dont}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="format" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">3. The Right ATS-Friendly Format</h2>
            <div className="space-y-4">
              {[
                { title: "Layout", detail: "Single column only. No sidebars, no two-column layouts, no headers/footers with important content. Everything in one straight column from top to bottom." },
                { title: "Font", detail: "Arial, Calibri, Times New Roman, or Helvetica. Size 10-12pt for body, 14-16pt for your name. No icons or symbols in critical sections." },
                { title: "File format", detail: "PDF is standard and preferred. Make sure it is text-based (you can select and copy text from it). DOCX also works. Never use JPG, PNG, or scanned PDFs." },
                { title: "Length", detail: "1 page for 0-3 years experience. 2 pages for 3-10 years. Never more than 2 pages for most roles. ATS does not penalise length, but human reviewers do." },
                { title: "Margins & spacing", detail: "1 inch margins all around. Standard line spacing (1.15 or 1.5). Consistent formatting throughout — same bullet style, same date format, same heading style." },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="font-bold text-slate-800 mb-1">{item.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="sections" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">4. How to Write Each Section</h2>
            <div className="space-y-8">
              {sections.map((s) => (
                <div key={s.title} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-blue-600 text-white font-bold px-5 py-3 text-sm">{s.title}</div>
                  <div className="p-5">
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{s.content}</p>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-green-700 font-semibold text-xs mb-1">✅ GOOD EXAMPLE:</p>
                        <p className="text-green-700 text-xs leading-relaxed whitespace-pre-line">{s.example}</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-600 font-semibold text-xs mb-1">❌ BAD EXAMPLE:</p>
                        <p className="text-red-600 text-xs leading-relaxed">{s.bad}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="keywords" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">5. How to Find and Use the Right Keywords</h2>
            <p className="text-slate-600 leading-relaxed mb-6">Keywords are the single biggest factor in your ATS score. Here's the exact process:</p>
            <div className="space-y-4">
              {[
                { n: "1", title: "Copy the job description", desc: "Take the full job description of the role you're applying for and paste it into a document." },
                { n: "2", title: "Identify required skills and tools", desc: "Look for technical skills, tools, methodologies, and qualifications mentioned. These are your target keywords." },
                { n: "3", title: "Check what's in your CV", desc: "Compare those keywords against your current CV. Make a list of what's missing." },
                { n: "4", title: "Add keywords naturally", desc: "Add missing keywords to your Skills section and weave them into your Work Experience bullets where they genuinely apply. Never keyword-stuff or lie." },
                { n: "5", title: "Use exact terms", desc: "If the JD says 'Power BI', write 'Power BI' — not 'PowerBI' or 'MS Power BI'. ATS often does exact string matching." },
              ].map((step) => (
                <div key={step.n} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">{step.n}</div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-1">
                    <p className="font-bold text-slate-800 mb-1">{step.title}</p>
                    <p className="text-slate-500 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="check-score" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">6. How to Check If Your Resume Is ATS-Friendly</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              After writing or updating your resume, check your ATS score before submitting to any job. This takes 30 seconds and tells you exactly where you stand.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
              <p className="font-bold text-slate-800 text-lg mb-2">Check your ATS score free at scoremycv.in</p>
              <p className="text-slate-500 text-sm mb-4">Upload your updated CV → Select your target role → Get your score and missing keywords instantly</p>
              <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl transition text-sm">
                🔍 Check My ATS Score — Free →
              </Link>
              <p className="text-slate-400 text-xs mt-3">No sign-up · No email required · 100% free</p>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mt-4">
              Target a score of <strong>80+</strong> before submitting. If your score is below 80, use the missing keywords list in your report to make targeted improvements. If you score below 60, consider getting your CV professionally rewritten — it's faster and more reliable than trying to fix a low-scoring CV manually.
            </p>
          </section>

          <section id="faq" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "Does ATS work differently for different companies in India?", a: "The specific ATS software varies (TCS uses iCIMS, Infosys uses Workday, etc.) but the core principles are the same across all systems: keyword match, parsable format, complete sections, and standard structure. An ATS-optimised resume works across all platforms." },
                { q: "Can I use a Naukri or LinkedIn resume template?", a: "Naukri's own resume templates are designed for Naukri's internal ATS but may not work well with other ATS systems. LinkedIn's PDF export is generally ATS-friendly. Canva templates are almost always ATS-unfriendly due to their graphic-heavy format." },
                { q: "Should I include a photo on my Indian resume?", a: "Avoid photos on resumes for most IT and MNC roles — ATS cannot process images, and photos can actually trigger bias-related filtering at some international companies. A photo takes up space that should have keywords." },
                { q: "Is it okay to use the same resume for all IT companies?", a: "Only if you're applying for the exact same role everywhere. If you're applying for both Data Analyst and Business Analyst roles, maintain separate CVs. The keyword sets are different enough to significantly impact your score." },
                { q: "How often should I update my resume?", a: "Update it every time you complete a significant project, learn a new tool, get a certification, or change jobs. Don't wait until you're actively job hunting — keeping your resume current means you're always ready." },
              ].map((item, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl p-5">
                  <p className="font-bold text-slate-800 mb-2">Q: {item.q}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">A: {item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-blue-600 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Check If Your Resume Is ATS-Ready</h2>
            <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Upload your CV and get your free ATS score in 30 seconds. See exactly what's holding you back — then get it rewritten for ₹19.
            </p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg">
              🔍 Check My ATS Score — Free
            </Link>
            <p className="text-blue-300 text-xs mt-4">No sign-up · Results in seconds · CV rewrite for ₹19</p>
          </div>


          {/* Related Articles */}
          <section className="mb-12">
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">Related Guides</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { href: "/blog/why-cv-gets-rejected", icon: "❌", title: "Why Is My CV Getting Rejected?", desc: "7 real reasons your CV is being auto-rejected before any human reads it." },
                { href: "/blog/how-to-check-resume-score", icon: "📊", title: "How to Check Your Resume Score Free", desc: "See your ATS score in 30 seconds — no sign-up needed." },
                { href: "/blog/ats-resume-tips-freshers-india", icon: "🎓", title: "ATS Resume Tips for Freshers India", desc: "No experience? Here&#39;s how to still get shortlisted by ATS in 2026." },
                { href: "/blog/free-ats-checker-india", icon: "🛠️", title: "Free ATS Checker India 2026", desc: "The only free ATS checker built specifically for Indian job seekers." },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition-all block group">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 mb-1">{a.icon} {a.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{a.desc}</p>
                </Link>
              ))}
            </div>
          </section>

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
