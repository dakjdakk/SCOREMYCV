import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ATS Resume Tips for Freshers in India (2026) — Get Shortlisted | ScoreMyCV",
  description:
    "No experience? Here's how freshers in India can write an ATS-friendly resume and get shortlisted at top IT companies. Practical tips with examples for 2026.",
  keywords:
    "ATS resume tips freshers India, resume tips for freshers India 2026, fresher resume ATS, how to write resume freshers India, first job resume India, fresher CV tips ATS, resume for freshers IT India",
  alternates: {
    canonical: "https://scoremycv.in/blog/ats-resume-tips-freshers-india",
  },
  openGraph: {
    type: "article",
    url: "https://scoremycv.in/blog/ats-resume-tips-freshers-india",
    title: "ATS Resume Tips for Freshers in India (2026) — Get Shortlisted",
    description:
      "No experience? Here's how freshers in India can write an ATS-friendly resume and get shortlisted at top IT companies.",
    images: [{ url: "https://scoremycv.in/og-image.png", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "ATS Resume Tips for Freshers in India (2026) — Get Shortlisted",
  description: "No experience? Here's how freshers in India can write an ATS-friendly resume and get shortlisted at top IT companies.",
  url: "https://scoremycv.in/blog/ats-resume-tips-freshers-india",
  datePublished: "2026-07-15",
  dateModified: "2026-07-15",
  author: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  publisher: { "@type": "Organization", name: "ScoreMyCV", url: "https://scoremycv.in" },
  image: "https://scoremycv.in/og-image.png",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://scoremycv.in/blog/ats-resume-tips-freshers-india" },
};

const tips = [
  {
    n: "1",
    icon: "🎯",
    title: "Write a strong Professional Summary — even as a fresher",
    body: "Most freshers skip the summary or write something useless like 'Seeking a challenging opportunity'. This is a huge mistake. ATS scans your summary for keywords first. Write 4-5 lines that mention your degree, your target role, your key technical skills, and one achievement (project, certification, or internship).",
    good: `"Computer Science graduate with strong foundation in Python, SQL, and machine learning. Completed a 3-month internship at XYZ Tech where I built a sentiment analysis model achieving 87% accuracy. Seeking a Data Science role to apply my skills in NLP and predictive modelling."`,
    bad: `"Fresher with good communication skills seeking a challenging position in a reputed organization to utilize my knowledge."`,
  },
  {
    n: "2",
    icon: "🔑",
    title: "Use keywords from the job description — even in your projects section",
    body: "As a fresher, you don't have work experience to load with keywords. Your projects section is your most powerful tool. Describe your college projects, personal projects, and internship projects using the same technical terms the job description uses.",
    good: `"Final Year Project: Built a machine learning classification model using Python and scikit-learn to predict customer churn with 84% accuracy. Used Pandas for data cleaning and Matplotlib for visualization."`,
    bad: `"Made a project on machine learning for final year. Used various tools and technologies."`,
  },
  {
    n: "3",
    icon: "📋",
    title: "Put your Skills section near the top",
    body: "As a fresher, your skills are your strongest selling point — not your experience. Put your Skills section right after your Professional Summary, before your Education and Projects. This ensures ATS picks up your keywords early and weights them higher.",
    good: `"Technical Skills: Python, SQL, Machine Learning, Scikit-learn, Pandas, NumPy, Matplotlib, MySQL, Git, Jupyter Notebook, Excel"`,
    bad: `"Skills: Hardworking, team player, good communication, Python, interested in data"`,
  },
  {
    n: "4",
    icon: "🏆",
    title: "Make your projects look like work experience",
    body: "Most fresher resumes list projects as an afterthought. Treat each significant project like a job entry. Give it a project title, the tech stack used, your role, and measurable outcomes. This dramatically increases how much ATS-relevant content your resume has.",
    good: `"E-commerce Recommendation System | Python, Collaborative Filtering, MySQL | Jan 2026\n• Built a product recommendation engine using collaborative filtering for a mock e-commerce dataset of 50,000 users\n• Achieved 78% precision score; deployed as a REST API using Flask"`,
    bad: `"Project: Recommendation system using Python"`,
  },
  {
    n: "5",
    icon: "📜",
    title: "List every relevant certification",
    body: "Certifications are gold for freshers because they prove skill without needing job experience. ATS specifically scans for certification names in IT roles. If you have any — Google, AWS, Microsoft, Coursera, NPTEL, Udemy — list them all with the full name and year.",
    good: `"Google Data Analytics Professional Certificate | Coursera | 2025\nPython for Data Science | NPTEL | 2024\nAWS Cloud Practitioner Essentials | AWS | 2025"`,
    bad: `"Done some online courses on data and cloud"`,
  },
  {
    n: "6",
    icon: "🎓",
    title: "Include your CGPA only if it's above 7.0",
    body: "Many Indian fresher resumes either hide low CGPAs or unnecessarily include them when they're average. Include your CGPA if it's 7.0 or above — it's a positive signal. If it's below 7.0, simply omit it. Also mention relevant academic achievements, department ranks, or awards if any.",
    good: `"B.Tech Computer Science | XYZ University, Pune | 2026 | CGPA: 8.4/10\nDepartment Rank: 3rd | Dean's List 2024-25"`,
    bad: `"B.Tech — XYZ University | Pass"`,
  },
  {
    n: "7",
    icon: "📄",
    title: "Use a simple single-column format — not a Canva template",
    body: "Canva resumes and downloaded fancy templates look impressive to human eyes but score zero on ATS because they use text boxes and graphics that ATS parsers cannot read. As a fresher, this mistake is extremely common and kills your chances immediately.",
    good: "A plain Word document or Google Doc with a single column, standard headings, and bullet points. Clean and simple.",
    bad: "Any Canva template, any template with a sidebar, any template with your photo in a decorative frame, any template with coloured text boxes.",
  },
  {
    n: "8",
    icon: "🔄",
    title: "Tailor your resume for each job role you apply for",
    body: "If you're applying for both Software Engineer and Python Developer roles, maintain two slightly different CV versions. The keywords differ enough to affect your ATS score significantly. At minimum, adjust your Professional Summary and Skills section for each target role.",
    good: "Software Engineer version emphasises Java, OOP, system design. Python Developer version emphasises Python, scripting, automation, Flask/Django.",
    bad: "One generic CV sent to every job regardless of role.",
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
              🎓 Fresher Guide · India 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              ATS Resume Tips for Freshers<br />
              <span className="text-blue-200">Get Shortlisted in India (2026)</span>
            </h1>
            <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">
              No work experience doesn't mean no chance. Here's exactly how freshers in India can write an ATS-friendly resume that gets past automated filters and into recruiter hands.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-blue-300 text-sm">
              <span>📅 July 2026</span><span>·</span>
              <span>⏱ 6 min read</span><span>·</span>
              <span>✅ Free score checker included</span>
            </div>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-10">
            <p className="font-bold text-orange-700 mb-2">⚠️ The problem most freshers don't know about:</p>
            <p className="text-orange-700 text-sm leading-relaxed">
              When you apply on Naukri, LinkedIn, or a company careers page, your CV goes through ATS software before any human reads it. Most fresher resumes score below 50/100 — and get filtered out automatically. The recruiter never even sees your application.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
            <p className="font-bold text-slate-800 mb-3">📋 8 ATS tips for freshers:</p>
            <ol className="space-y-1.5 text-sm text-blue-700 font-medium list-decimal list-inside">
              {tips.map((t) => (
                <li key={t.n}><a href={`#tip-${t.n}`} className="hover:underline">{t.title}</a></li>
              ))}
            </ol>
          </div>

          {tips.map((tip) => (
            <section key={tip.n} id={`tip-${tip.n}`} className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4 flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{tip.icon}</span>
                <span>Tip {tip.n}: {tip.title}</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">{tip.body}</p>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-semibold text-xs mb-1">✅ GOOD:</p>
                  <p className="text-green-700 text-sm leading-relaxed whitespace-pre-line">{tip.good}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-semibold text-xs mb-1">❌ BAD:</p>
                  <p className="text-red-600 text-sm leading-relaxed">{tip.bad}</p>
                </div>
              </div>
            </section>
          ))}

          <div className="bg-blue-600 rounded-3xl p-8 text-center text-white mb-12">
            <h2 className="text-2xl font-extrabold mb-2">Check Your Fresher Resume Score — Free</h2>
            <p className="text-blue-200 text-sm mb-5 max-w-sm mx-auto">
              Upload your CV, select your target job role, and see your ATS score in 30 seconds. Find exactly what's missing.
            </p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-2xl hover:bg-blue-50 transition text-sm shadow-lg">
              🔍 Check My Resume Score — Free →
            </Link>
            <p className="text-blue-300 text-xs mt-3">No sign-up · 100% free · Results in 30 seconds</p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">What a Good Fresher Resume Structure Looks Like</h2>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              {[
                { section: "Professional Summary", priority: "High", note: "4-5 lines. Target role + key skills + one achievement" },
                { section: "Technical Skills", priority: "High", note: "All tools, languages, frameworks relevant to target role" },
                { section: "Projects", priority: "High", note: "2-3 significant projects with tech stack + measurable outcome" },
                { section: "Education", priority: "Medium", note: "Degree, institution, year, CGPA (if 7.0+)" },
                { section: "Internships / Training", priority: "Medium", note: "Include if relevant — company, role, tech used, outcome" },
                { section: "Certifications", priority: "Medium", note: "Full name + issuing org + year" },
                { section: "Achievements / Awards", priority: "Low", note: "Hackathons, academic awards, open source contributions" },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-3 text-sm border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                  <div className="p-3 font-semibold text-slate-800">{row.section}</div>
                  <div className={`p-3 font-bold ${row.priority === "High" ? "text-green-600" : row.priority === "Medium" ? "text-blue-600" : "text-slate-400"}`}>{row.priority}</div>
                  <div className="p-3 text-slate-500 text-xs">{row.note}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "Can a fresher with no experience get past ATS?", a: "Yes — but your resume needs to work harder. Focus on projects, certifications, internships, and skills. ATS doesn't know you have 0 years experience if your CV is well-optimised with the right keywords." },
                { q: "What ATS score should a fresher aim for?", a: "Target 75+. Freshers typically score lower because they have less experience content to load with keywords. A well-optimised fresher resume with strong projects and skills can absolutely hit 80+." },
                { q: "Should freshers include their 10th and 12th marks?", a: "Include 12th (HSC/Intermediate) marks only if they're above 75%. 10th marks are generally not needed for IT roles. Once you have any work experience at all, remove school marks entirely." },
                { q: "Does the college name affect ATS score?", a: "ATS itself doesn't filter by college reputation — it filters by keywords and structure. The college name matters to the human recruiter who reads your CV after it passes ATS. Focus on your ATS score first." },
                { q: "How many pages should a fresher resume be?", a: "One page only. You don't have enough experience to justify two pages, and a one-page resume forces you to be concise and relevant." },
                { q: "Is it okay to include personal projects on a fresher resume?", a: "Absolutely — personal projects are as valuable as academic projects in IT. A personal project shows initiative and passion. Describe it with the same structure as your academic projects: what you built, what tech you used, what the outcome was." },
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
                { href: "/blog/how-to-write-ats-friendly-resume", icon: "✏️", title: "How to Write an ATS-Friendly Resume", desc: "The exact format, keywords, and structure to pass ATS filters at top Indian companies." },
                { href: "/blog/why-cv-gets-rejected", icon: "❌", title: "Why Is My CV Getting Rejected?", desc: "7 reasons your CV is auto-rejected — and how to fix each one." },
                { href: "/blog/free-ats-checker-india", icon: "🛠️", title: "Free ATS Checker India 2026", desc: "Check your CV score instantly — built for Indian job seekers." },
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
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to Get Shortlisted?</h2>
            <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Check your fresher resume score free. See your missing keywords, what&#39;s holding you back, and get a fully rewritten ATS-optimised CV for just ₹19.
            </p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-base shadow-lg">
              🚀 Check My Resume Score — Free
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
