import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { dbInsert } from "@/lib/supabase";

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
  "React Developer": ["react","javascript","typescript","hooks","redux","context api","next.js","rest api","graphql","html","css","tailwind","jest","react testing library","webpack","vite","git","responsive","component","state management","ui","figma","npm"],
  "Angular Developer": ["angular","typescript","javascript","rxjs","ngrx","angular material","rest api","html","css","unit test","jasmine","karma","webpack","git","component","service","module","routing","dependency injection","cli","agile","figma"],
  "Vue.js Developer": ["vue","vuex","pinia","javascript","typescript","nuxt.js","rest api","html","css","webpack","vite","git","component","composables","router","jest","tailwind","responsive","ui","figma","npm","agile"],
  "Node.js Developer": ["node.js","javascript","typescript","express","rest api","graphql","mongodb","postgresql","redis","kafka","docker","aws","jwt","authentication","microservices","jest","git","npm","async","event loop","ci/cd","linux"],
  "Python Developer": ["python","django","flask","fastapi","rest api","sql","postgresql","mongodb","redis","celery","docker","aws","git","pytest","pandas","numpy","asyncio","microservices","ci/cd","linux","oop","api"],
  "Java Developer": ["java","spring boot","spring mvc","hibernate","jpa","rest api","microservices","maven","gradle","sql","postgresql","mysql","docker","kubernetes","aws","junit","git","oop","design pattern","kafka","ci/cd","agile"],
  ".NET Developer": ["c#",".net","asp.net","entity framework","rest api","microservices","sql server","azure","docker","git","visual studio","linq","mvc","web api","dependency injection","unit test","nunit","xunit","blazor","ci/cd","agile","oop"],
  "PHP Developer": ["php","laravel","symfony","mysql","postgresql","rest api","javascript","html","css","composer","git","docker","aws","redis","unit test","phpunit","mvc","oop","api","agile","linux","nginx"],
  "Mobile Developer (Android)": ["android","kotlin","java","jetpack compose","android studio","rest api","sqlite","firebase","mvvm","coroutines","retrofit","git","play store","ui","unit test","gradle","material design","notification","bluetooth","gps","agile"],
  "Mobile Developer (iOS)": ["swift","objective-c","xcode","swiftui","uikit","rest api","core data","firebase","mvvm","combine","cocoapods","spm","git","app store","unit test","ble","push notification","ui","agile","instruments","cloudkit"],
  "React Native Developer": ["react native","javascript","typescript","expo","redux","rest api","firebase","android","ios","git","navigation","ui","jest","native modules","push notification","app store","play store","agile","hooks","context api","debugging"],
  "AI / Generative AI Engineer": ["python","llm","generative ai","langchain","openai","gpt","prompt engineering","rag","vector database","fine-tuning","hugging face","pytorch","tensorflow","api","docker","aws","git","nlp","embedding","agent","transformer","fastapi"],
  "Computer Vision Engineer": ["python","opencv","pytorch","tensorflow","yolo","image classification","object detection","cnn","deep learning","data augmentation","model training","inference","onnx","gpu","cuda","numpy","scikit-learn","git","docker","aws","annotation"],
  "NLP Engineer": ["python","nlp","spacy","nltk","transformers","hugging face","bert","gpt","text classification","named entity recognition","sentiment analysis","pytorch","tensorflow","pandas","numpy","rest api","git","docker","aws","fine-tuning","rag","embedding"],
  "Business Intelligence Developer": ["sql","power bi","tableau","ssis","ssrs","etl","data warehouse","data modeling","star schema","snowflake schema","kpi","dashboard","reporting","excel","dax","power query","olap","business intelligence","analytics","postgresql","mysql","azure"],
  "Tableau Developer": ["tableau","sql","data visualization","dashboard","calculated fields","lod expressions","tableau server","tableau prep","data blending","extract","joins","parameters","sets","filters","excel","analytics","kpi","reporting","etl","data source","postgresql","storytelling"],
  "Database Administrator (DBA)": ["sql","oracle","sql server","postgresql","mysql","performance tuning","backup","recovery","replication","high availability","indexing","query optimization","stored procedures","monitoring","security","partitioning","rman","dataguard","aws rds","azure sql","linux","shell scripting"],
  "Site Reliability Engineer (SRE)": ["kubernetes","docker","terraform","ansible","aws","gcp","azure","prometheus","grafana","ci/cd","linux","python","bash","incident management","slo","sla","error budget","on-call","git","helm","monitoring","alerting","automation"],
  "Cloud Engineer (AWS)": ["aws","ec2","s3","rds","lambda","cloudformation","terraform","iam","vpc","ecs","eks","cloudwatch","route53","sns","sqs","python","linux","bash","ci/cd","git","docker","kubernetes","security","networking"],
  "Cloud Engineer (Azure)": ["azure","azure devops","azure kubernetes service","azure functions","azure sql","azure blob storage","arm templates","terraform","bicep","active directory","iam","vnet","logic apps","python","linux","powershell","ci/cd","git","docker","monitoring","security"],
  "Cloud Engineer (GCP)": ["gcp","google cloud","bigquery","gke","cloud run","cloud functions","terraform","iam","pubsub","cloud storage","cloud sql","dataflow","python","linux","bash","ci/cd","git","docker","kubernetes","networking","monitoring","security"],
  "Platform Engineer": ["kubernetes","terraform","helm","docker","ci/cd","aws","gcp","azure","linux","python","bash","git","prometheus","grafana","service mesh","istio","vault","developer experience","platform","automation","infrastructure as code","argocd"],
  "Kubernetes / Docker Engineer": ["kubernetes","docker","helm","kubectl","docker compose","container","pod","deployment","service","ingress","rbac","namespace","persistent volume","prometheus","grafana","ci/cd","terraform","aws","gcp","linux","bash","git","monitoring"],
  "QA Engineer / Test Engineer": ["manual testing","automation testing","selenium","test cases","test plan","bug reporting","jira","sql","api testing","postman","regression","functional testing","agile","scrum","git","test management","defect","exploratory testing","mobile testing","excel","documentation"],
  "Automation Test Engineer": ["selenium","python","java","testng","junit","cucumber","bdd","rest assured","api testing","postman","ci/cd","git","jenkins","docker","allure","extent reports","page object model","agile","jira","sql","appium","performance testing"],
  "Performance Test Engineer": ["jmeter","gatling","locust","k6","load testing","stress testing","performance tuning","apm","dynatrace","new relic","grafana","prometheus","sql","java","python","ci/cd","git","bottleneck","throughput","response time","tps","api testing"],
  "Cybersecurity Analyst": ["siem","soc","threat detection","incident response","vulnerability assessment","penetration testing","firewall","ids","ips","splunk","log analysis","malware analysis","phishing","network security","iso 27001","nist","owasp","python","linux","wireshark","security operations","compliance"],
  "Information Security Engineer": ["iso 27001","nist","gdpr","risk assessment","vulnerability management","penetration testing","siem","dlp","encryption","pki","iam","firewall","python","linux","security architecture","compliance","incident response","cloud security","zero trust","endpoint security","audit","soc"],
  "Penetration Tester / Ethical Hacker": ["penetration testing","ethical hacking","kali linux","metasploit","burp suite","nmap","owasp","web application security","network security","exploit","vulnerability","python","bash","ctf","report writing","social engineering","privilege escalation","post exploitation","red team","ceh","oscp"],
  "Network Engineer": ["cisco","routing","switching","bgp","ospf","mpls","vlan","tcp/ip","firewall","vpn","network security","troubleshooting","linux","python","automation","netconf","yang","sdn","wireless","monitoring","documentation","ccna","ccnp"],
  "System Administrator": ["linux","windows server","active directory","dns","dhcp","vmware","hyper-v","backup","powershell","bash","monitoring","networking","firewall","group policy","patch management","storage","troubleshooting","ticketing","documentation","aws","azure","automation"],
  "IT Support Engineer / Help Desk": ["windows","active directory","ticketing","troubleshooting","networking","hardware","software installation","o365","exchange","vpn","remote support","documentation","customer service","sla","escalation","linux","powershell","mdm","communication","helpdesk","itsm","itil"],
  "Technical Lead": ["architecture","technical leadership","code review","mentoring","agile","scrum","system design","java","python","javascript","microservices","docker","kubernetes","aws","ci/cd","git","stakeholder","delivery","performance","scalability","team management","roadmap"],
  "Solution Architect": ["solution architecture","system design","microservices","aws","azure","gcp","api","integration","enterprise architecture","cloud","security","scalability","high availability","documentation","stakeholder","java","python","rest api","docker","kubernetes","togaf","roadmap"],
  "Enterprise Architect": ["enterprise architecture","togaf","zachman","business architecture","application architecture","data architecture","infrastructure","strategy","roadmap","stakeholder","governance","cloud","digital transformation","integration","risk","compliance","itil","agile","erp","api","documentation"],
  "Cloud Architect": ["cloud architecture","aws","azure","gcp","solution design","microservices","serverless","iac","terraform","security","networking","high availability","disaster recovery","cost optimization","migration","kubernetes","docker","ci/cd","stakeholder","documentation","well-architected","scalability"],
  "Product Manager (Technical)": ["product roadmap","agile","scrum","user stories","backlog","stakeholder","kpi","metrics","market research","competitive analysis","product strategy","wireframe","jira","confluence","api","sql","data analysis","go-to-market","mvp","prioritization","cross-functional","customer feedback"],
  "Scrum Master": ["scrum","agile","sprint","backlog refinement","retrospective","daily standup","velocity","kanban","jira","confluence","impediment","facilitation","coaching","stakeholder","release planning","burndown","team collaboration","continuous improvement","safe","psm","csm","scaled agile"],
  "Agile Coach": ["agile","scrum","kanban","safe","lean","coaching","transformation","facilitation","retrospective","continuous improvement","team dynamics","stakeholder","metrics","okr","value stream","training","workshop","enterprise agile","change management","jira","confluence","leadership"],
  "IT Project Manager": ["project management","agile","waterfall","pmp","prince2","risk management","stakeholder","budget","timeline","resource planning","jira","ms project","confluence","scope","change management","status reporting","vendor management","it delivery","escalation","milestones","documentation","team leadership"],
  "Salesforce Developer": ["salesforce","apex","visualforce","lightning web components","soql","sosl","rest api","integration","salesforce admin","flow","process builder","triggers","batch apex","salesforce crm","git","deployment","metadata","sandbox","salesforce platform","agile","jira","documentation"],
  "SAP Consultant": ["sap","sap s/4hana","abap","sap fi","sap co","sap mm","sap sd","sap pp","bapi","bdc","smartforms","sap basis","sap hana","sap fiori","integration","customization","configuration","business process","testing","documentation","agile","stakeholder"],
  "ERP Consultant": ["erp","sap","oracle","microsoft dynamics","implementation","configuration","business process","requirement gathering","gap analysis","testing","data migration","training","documentation","stakeholder","integration","project management","go-live","support","finance","supply chain","agile","reporting"],
  "Blockchain Developer": ["blockchain","solidity","ethereum","smart contracts","web3.js","ethers.js","defi","nft","hardhat","truffle","ipfs","metamask","consensus","cryptography","rest api","javascript","python","git","testing","security","layer 2","hyperledger"],
  "Embedded Systems Engineer": ["c","c++","embedded c","rtos","microcontroller","arm","stm32","arduino","raspberry pi","uart","spi","i2c","can","gpio","firmware","debugging","jtag","oscilloscope","pcb","real-time","linux","assembly","hardware"],
  "Game Developer": ["unity","unreal engine","c#","c++","game physics","3d","2d","shader","animation","game design","scripting","optimization","multiplayer","networking","mobile game","git","debugging","ui","assets","performance","agile","documentation"],
  "UI/UX Designer": ["figma","sketch","adobe xd","wireframe","prototype","user research","usability testing","user journey","information architecture","interaction design","visual design","responsive","accessibility","design system","html","css","collaboration","stakeholder","a/b testing","user flow","typography","branding"],
  "Technical Writer": ["technical writing","documentation","api documentation","user manual","release notes","style guide","markdown","confluence","jira","git","dita","xml","html","content strategy","editing","proofreading","developer documentation","product documentation","collaboration","simplification","diagrams","knowledge base"],
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
  const keywordIssues = missing.slice(0, 8).map(k => `Missing "${k}" — recruiters filtering for this keyword won't see you`);
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
      try {
        // Primary: pdf-parse (fast, works for most PDFs)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");
        const data = await pdfParse(buffer, { stopAtErrors: false });
        text = data.text;
      } catch {
        // Fallback: pdfjs-dist v6 (better XRef repair for malformed PDFs)
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as string);
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = "";
        const loadingTask = (pdfjsLib as any).getDocument({
          data: new Uint8Array(buffer),
          stopAtErrors: false,
          isEvalSupported: false,
        });
        const pdfDoc = await loadingTask.promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          pages.push(
            (content.items as any[]).map((item) => item.str ?? "").join(" ")
          );
        }
        text = pages.join("\n");
      }
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

    const result = scoreResume(text, jobRole);

    // Auto-extract email from CV text
    const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    const extractedEmail = emailMatch ? emailMatch[0].toLowerCase() : null;

    // Track ATS check synchronously so email is never lost
    try {
      await dbInsert("ats_checks", { job_role: jobRole, score: result.score, ...(extractedEmail ? { email: extractedEmail } : {}) });
    } catch (dbErr) {
      console.error("DB insert error:", dbErr);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ATS score error:", err);
    return NextResponse.json({ error: `Failed to process file: ${err?.message || err}` }, { status: 500 });
  }
}
