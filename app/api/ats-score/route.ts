import { NextResponse } from "next/server";

// ── Role keywords map ─────────────────────────────────────────────────
const ROLE_KEYWORDS: Record<string, string[]> = {
  "Data Analyst": ["sql","python","excel","power bi","tableau","pandas","data analysis","dashboard","visualization","reporting","analytics","etl","statistics","kpi","metrics","data cleaning","data modeling","numpy","matplotlib","mysql","postgresql","google analytics","storytelling","pivot","vlookup","power query"],
  "Data Scientist": ["machine learning","python","r","sql","tensorflow","scikit-learn","deep learning","neural network","statistics","pandas","numpy","model","algorithm","prediction","nlp","computer vision","a/b testing","hypothesis","regression","classification","clustering","feature engineering","jupyter"],
  "Data Engineer": ["sql","python","spark","hadoop","kafka","airflow","etl","pipeline","aws","azure","gcp","databricks","redshift","bigquery","snowflake","dbt","data warehouse","data lake","orchestration","postgresql","mongodb","rest api"],
  "Business Analyst": ["requirements","stakeholders","user stories","brd","frd","uml","process improvement","gap analysis","agile","scrum","sql","excel","power bi","jira","confluence","documentation","as-is","to-be","sla","kpi","tableau","wireframe","use case"],
  "Power BI Developer": ["power bi","dax","power query","m language","data model","report","dashboard","sql","excel","azure","service","gateway","row-level security","paginated","measures","calculated columns","relationships","star schema","etl","tabular"],
  "Software Engineer / Developer": ["java","python","javascript","typescript","react","node","api","rest","microservices","docker","kubernetes","git","agile","sql","aws","azure","ci/cd","unit test","design pattern","oop","spring","cloud"],
  "Frontend Developer": ["react","javascript","typescript","html","css","tailwind","redux","next.js","vue","angular","webpack","vite","rest api","git","responsive","accessibility","performance","jest","ui","ux","figma"],
  "Backend Developer": ["node.js","python","java","rest api","graphql","microservices","sql","mongodb","postgresql","docker","kubernetes","aws","redis","kafka","authentication","jwt","ci/cd","git","design pattern","spring boot"],
  "Full Stack Developer": ["react","node.js","javascript","typescript","html","css","sql","mongodb","postgresql","rest api","git","docker","aws","next.js","express","authentication","ci/cd","agile","redis","microservices"],
  "DevOps Engineer": ["docker","kubernetes","aws","azure","gcp","ci/cd","jenkins","terraform","ansible","linux","bash","python","monitoring","prometheus","grafana","helm","git","infrastructure","automation","nginx","cloud"],
  "Machine Learning Engineer": ["python","tensorflow","pytorch","scikit-learn","machine learning","deep learning","mlops","model deployment","docker","kubernetes","aws","feature engineering","training","inference","api","sql","statistics","pandas","numpy","data pipeline"],
  "SQL Developer / Database Developer": ["sql","t-sql","plsql","stored procedures","views","triggers","indexing","query optimization","postgresql","mysql","oracle","sql server","etl","data modeling","normalization","joins","performance tuning","backup","replication"],
};

const DEFAULT_KEYWORDS = ["communication","analytical","problem solving","teamwork","leadership","excel","sql","python","data","reporting","analysis","management","project","agile","documentation"];

const ACTION_VERBS = [
  "achieved","analyzed","automated","built","calculated","collaborated","configured","created","decreased","delivered","deployed","designed","developed","documented","drove","engineered","established","evaluated","executed","generated","implemented","improved","increased","integrated","launched","led","maintained","managed","migrated","monitored","optimized","organized","partnered","performed","planned","presented","produced","reduced","reported","researched","resolved","reviewed","scaled","secured","simplified","solved","spearheaded","streamlined","supported","tested","trained","transformed","utilized","validated","visualized",
];

const SECTION_PATTERNS = {
  experience: /\b(experience|work experience|employment|career|professional background|work history)\b/i,
  education:  /\b(education|academic|qualification|degree|university|college|school)\b/i,
  skills:     /\b(skills|technical skills|core competencies|expertise|technologies|tools|proficiencies)\b/i,
  summary:    /\b(summary|objective|profile|about|overview|professional summary|career objective)\b/i,
  projects:   /\b(projects|personal projects|key projects|portfolio)\b/i,
  achievements:/\b(achievements|accomplishments|awards|honors|recognition)\b/i,
};

function scoreResume(text: string, jobRole: string) {
  const lower = text.toLowerCase();
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const breakdown: Record<string, { score: number; max: number; label: string; issues: string[] }> = {};

  const hasEmail    = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone    = /(\+91|0)?[\s\-]?[6-9]\d{9}|\+?[\d\s\-()]{10,}/.test(text);
  const hasLinkedIn = /linkedin\.com|linkedin/i.test(text);
  const contactScore = (hasEmail ? 5 : 0) + (hasPhone ? 3 : 0) + (hasLinkedIn ? 2 : 0);
  const contactIssues: string[] = [];
  if (!hasEmail)    contactIssues.push("No email address found");
  if (!hasPhone)    contactIssues.push("No phone number found");
  if (!hasLinkedIn) contactIssues.push("LinkedIn profile not mentioned");
  breakdown.contact = { score: contactScore, max: 10, label: "Contact Information", issues: contactIssues };

  const sectionsMissing: string[] = [];
  const sectionPoints: Record<string, number> = { experience: 8, education: 5, skills: 7, summary: 5 };
  let sectionScore = 0;
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(text)) { sectionScore += sectionPoints[key] || 0; }
    else if (sectionPoints[key]) { sectionsMissing.push(key); }
  }
  const sectionIssues = sectionsMissing.map(s => `Missing "${s.charAt(0).toUpperCase() + s.slice(1)}" section`);
  breakdown.sections = { score: Math.min(sectionScore, 25), max: 25, label: "Resume Sections", issues: sectionIssues };

  const keywords = ROLE_KEYWORDS[jobRole] || DEFAULT_KEYWORDS;
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) found.push(kw);
    else missing.push(kw);
  }
  const keywordScore = Math.round((found.length / keywords.length) * 30);
  const keywordIssues = missing.slice(0, 8).map(k => `Missing keyword: "${k}"`);
  breakdown.keywords = { score: keywordScore, max: 30, label: "Role-Specific Keywords", issues: keywordIssues };

  let verbCount = 0;
  for (const line of lines) {
    const firstWord = line.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (ACTION_VERBS.includes(firstWord)) verbCount++;
  }
  const verbScore = Math.min(Math.round((verbCount / 8) * 20), 20);
  const verbIssues: string[] = [];
  if (verbCount < 4) verbIssues.push(`Only ${verbCount} strong action verbs found -- aim for 8+`);
  if (verbCount < 2) verbIssues.push("Most bullet points lack action verbs -- add words like Analyzed, Built, Improved");
  breakdown.verbs = { score: verbScore, max: 20, label: "Action Verbs", issues: verbIssues };

  const quantLines = lines.filter(l => /\d+%|\d+\s*(lakh|crore|k|million|users|clients|projects|days|hours|years|months|\$|rs\.?)|\b\d{2,}\b/i.test(l));
  const quantScore = Math.min(Math.round((quantLines.length / 5) * 15), 15);
  const quantIssues: string[] = [];
  if (quantLines.length < 3) quantIssues.push(`Only ${quantLines.length} bullet points have numbers -- add more (e.g. Improved performance by 30%)`);
  breakdown.quantification = { score: quantScore, max: 15, label: "Quantified Achievements", issues: quantIssues };

  const total = Object.values(breakdown).reduce((sum, b) => sum + b.score, 0);
  const allIssues: string[] = [];
  for (const b of Object.values(breakdown)) allIssues.push(...b.issues);

  return { score: total, wordCount, breakdown, topMissingKeywords: missing.slice(0, 10), foundKeywords: found, allIssues: allIssues.slice(0, 10) };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file     = formData.get("file") as File | null;
    const jobRole  = (formData.get("jobRole") as string) || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer   = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      // Use lib path to bypass pdf-parse's test runner (avoids ENOENT on ./test/data/)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const result  = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: "Only PDF, DOC, DOCX files are supported" }, { status: 400 });
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "Could not extract text from file. Make sure the CV is not a scanned image." }, { status: 422 });
    }

    // ── CV detection ──────────────────────────────────────────────────
    const lower = text.toLowerCase();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    const hasContact =
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text) ||
      /(\+91|0)?[\s\-]?[6-9]\d{9}|\+?[\d\s\-()]{10,}/.test(text);

    const hasCVSection =
      /\b(experience|education|skills|work history|employment|projects|certifications?|summary|objective|profile|achievements?|qualifications?)\b/.test(lower);

    if (wordCount < 80 || (!hasContact && !hasCVSection)) {
      return NextResponse.json({
        error: "This doesn't look like a CV. Please upload your resume and try again.",
      }, { status: 422 });
    }

    return NextResponse.json(scoreResume(text, jobRole));
  } catch (err: any) {
    console.error("ATS score error:", err);
    return NextResponse.json({ error: `Failed to process file: ${err?.message || err}` }, { status: 500 });
  }
}
