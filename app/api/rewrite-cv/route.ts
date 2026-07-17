import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { Resend } from "resend";
import { dbInsert, storageUpload } from "@/lib/supabase";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

// ── Route handler ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData  = await request.formData();
    const file      = formData.get("file") as File | null;
    const jobRole   = (formData.get("jobRole")   as string) || "Software Engineer";
    const experience= (formData.get("experience")as string) || "0-2 years";
    const userEmail = (formData.get("email")     as string) || "";
    const userLinkedin = (formData.get("linkedin") as string) || "";
    const userGithub   = (formData.get("github")   as string) || "";
    const scoreBefore  = parseInt((formData.get("scoreBefore") as string) || "0", 10);
    const paymentId    = (formData.get("paymentId") as string) || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // ── Parse CV text ──────────────────────────────────────────────
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      try {
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");
        text = (await pdfParse(buffer, { stopAtErrors: false })).text;
      } catch {
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
          pages.push((content.items as any[]).map((item) => item.str ?? "").join(" "));
        }
        text = pages.join("\n");
      }
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      text = (await mammoth.extractRawText({ buffer })).value;
    } else {
      return NextResponse.json({ error: "Only PDF, DOC, DOCX supported" }, { status: 400 });
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "Could not extract text. Make sure it's not a scanned image." }, { status: 422 });
    }

    const cvText = text.trim().slice(0, 8000);

    // ── Extract ALL URLs from raw PDF binary ─────────────────────────
    let extractedLinkedin = "";
    let extractedGithub   = "";
    let allExtractedUrls: string[] = [];
    if (fileName.endsWith(".pdf")) {
      const pdfStr = buffer.toString("latin1");
      const liMatch = pdfStr.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s)<>"\\]+/i);
      const ghMatch = pdfStr.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)<>"\\]+/i);
      extractedLinkedin = liMatch?.[0]?.replace(/\/$/, "") || "";
      extractedGithub   = ghMatch?.[0]?.replace(/\/$/, "") || "";
      // Extract all URLs for portfolio, project links, credentials etc.
      const allUrlMatches = pdfStr.match(/https?:\/\/[^\s)<>"\\]{8,}/gi) || [];
      const urlSet = new Set<string>(
        allUrlMatches
          .map(u => u.replace(/[.,;]+$/, "").trim())
          .filter(u =>
            u.length > 12 &&
            !u.includes("adobe") &&
            !u.includes("w3.org") &&
            !u.includes("pdfium") &&
            !u.includes("linkedin.com") &&  // already handled separately
            !u.includes("github.com")        // already handled separately
          )
      );
      allExtractedUrls = Array.from(urlSet);
    }

    // Normalize URL — ensure https:// prefix
    const normalizeUrl = (url: string) => {
      if (!url) return "";
      url = url.trim();
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
      }
      return url;
    };

    // Form fields take priority over extracted URLs
    const linkedinUrl = normalizeUrl(userLinkedin || extractedLinkedin);
    const githubUrl   = normalizeUrl(userGithub   || extractedGithub);
    console.log("LinkedIn URL:", linkedinUrl, "| GitHub URL:", githubUrl);

    // ── Validate document looks like a CV ─────────────────────────
    const hasEmail = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(cvText);
    const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(cvText);
    if (!hasEmail || !hasPhone)
      return NextResponse.json(
        { error: "This doesn't look like a valid CV. Please upload a resume that contains your email address and phone number." },
        { status: 422 },
      );

    // ── Contact overrides ──────────────────────────────────────────
    const contactSection = [
      linkedinUrl ? `LinkedIn URL: ${linkedinUrl}` : "",
      githubUrl   ? `GitHub URL: ${githubUrl}`     : "",
      allExtractedUrls.length > 0 ? `ALL OTHER URLS FOUND IN CV (use these for portfolio, project live links, certification credentials etc.):\n${allExtractedUrls.join("\n")}` : "",
    ].filter(Boolean).join("\n");

    // ── Role keywords for ATS optimisation ───────────────────────
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

    const allRoleKeywords = ROLE_KEYWORDS[jobRole] || [];
    const cvLower = cvText.toLowerCase();
    const missingKeywords = allRoleKeywords.filter(kw => !cvLower.includes(kw.toLowerCase()));

    // ── Certifications placement: detect in code, tell AI explicitly ──
    const certIdx = cvLower.indexOf("certif");
    const certSnippet = certIdx >= 0 ? cvText.slice(certIdx, certIdx + 600) : "";
    const certLineCount = certSnippet.split("\n").filter((l: string) => l.trim().length > 0).length;
    const certPlacement = certLineCount > 4 ? "LEFT" : "RIGHT";
    const keywordInstruction = missingKeywords.length > 0
      ? `\nATS KEYWORD OPTIMISATION (IMPORTANT):
The following keywords are commonly expected for a ${jobRole} role but are missing from this CV.
Weave them in naturally where truthful and relevant — in the summary, skills section, or experience bullet points.
Use each keyword at most once. Do NOT repeat. Do NOT invent experience. Only add where it genuinely fits.
Missing keywords: ${missingKeywords.slice(0, 15).join(", ")}\n`
      : "";

    // ── Gemini prompt (HTML template) ──────────────────────────────
    const prompt = `You are a senior resume template rendering engine.
Your task is to transform any uploaded resume into ONE fixed resume design.
Target job role: ${jobRole}
Experience level: ${experience}
${contactSection ? `\nUSE THESE EXACT CONTACT DETAILS (override whatever is in the CV):\n${contactSection}\n` : ""}${keywordInstruction}
CERTIFICATIONS COLUMN (MANDATORY — DO NOT DEVIATE): Place CERTIFICATIONS in the ${certPlacement} COLUMN. This is pre-determined and not your decision.
This is a template replication task. Only candidate content changes. Everything else is fixed.
Never redesign. Never improvise. Never create alternative layouts.

================================================
PAGE STRUCTURE
================================================
A4 Portrait. Width: 794px.
Do NOT set height or min-height on .page — EVER. Do not set height: 297mm, height: 100vh, or any fixed page height.
White background on html, body, and .page — NEVER use gray or colored backgrounds.
Fixed outer padding: Top: 40px, Bottom: 40px, Left: 32px, Right: 32px
Use box-sizing: border-box on all elements.

CRITICAL: All resume content (header + body + skills + education + projects) must be inside ONE single .page div.
Do NOT create multiple .page divs. Do NOT create a separate page div for the header.
The HTML body must contain ONLY ONE .page div.

EXACT HTML SKELETON — follow this structure precisely:
<div class="page">
  <!-- HEADER (full width) -->
  <div class="header">
    <h1>CANDIDATE NAME</h1>
    <div class="job-title">Job Title</div>
    <div class="contact">Phone | Email | LinkedIn | GitHub | Location</div>
  </div>
  <!-- TWO-COLUMN BODY -->
  <div class="body">
    <div class="left">
      <!-- Summary -->
      <!-- Experience -->
      <!-- Education -->
      <!-- Projects (if present) -->
    </div>
    <div class="right">
      <!-- Skills -->
      <!-- Tools & Technologies -->
      <!-- Certifications (if SHORT — see placement rule) -->
      <!-- Languages (if present) -->
    </div>
  </div>
</div>

ABSOLUTELY FORBIDDEN:
* page-break-after: always — on ANY element, including the header div
* break-after: page — on ANY element
* height: 297mm or any fixed page height
* min-height on .page
* Multiple .page divs
* Any explicit forced page breaks in HTML or CSS

================================================
HEADER
================================================
- Candidate Name: Bold, Uppercase, Black, font-size 26px, centered
- Job Title: Blue accent (#2563EB), font-size 13px, centered, directly under name
- Contact Row: Single centered line, font-size 10px, color #555
  Format: Phone | Email | LinkedIn | GitHub | Location
  Use actual values from CV. Omit any field not present. Do NOT write placeholder text.
  LINKEDIN LINK: ${linkedinUrl ? `Use this exact URL: ${linkedinUrl}. Render as <a href="${linkedinUrl}" style="color:#555;text-decoration:none;">LinkedIn</a>` : "If the CV has a LinkedIn URL, render as <a href=\"URL\">LinkedIn</a>. If no URL found, write plain text LinkedIn only if mentioned in CV."}
  GITHUB LINK: ${githubUrl ? `Use this exact URL: ${githubUrl}. Render as <a href="${githubUrl}" style="color:#555;text-decoration:none;">GitHub</a>` : "If the CV has a GitHub URL, render as <a href=\"URL\">GitHub</a>. If no URL found, write plain text GitHub only if mentioned in CV."}
  PORTFOLIO LINK: If the CV mentions a Portfolio or personal website, find its URL from the extracted URLs list and render as <a href="URL" style="color:#555;text-decoration:none;">Portfolio</a> in the contact row.
  PROJECT LINKS: If a project has a live link/demo, find its URL from the extracted URLs list and render it as a clickable <a href="URL" style="color:#2563EB;text-decoration:none;">Live Demo</a> next to the project title.
  CERTIFICATION LINKS: If certifications have "View Credentials" or similar links, find their URLs from the extracted URLs list and render each as <a href="URL" style="color:#2563EB;font-size:10px;">View Credential</a> after the certification name.
- ABSOLUTELY NO horizontal divider line below the contact info. Do NOT generate any hr, border, or divider element after the contact line.

================================================
MAIN LAYOUT
================================================
Two Column Layout inside .body div:
Left Column (.left): 68% width
Right Column (.right): 32% width
CSS: .body { display: flex; align-items: flex-start; gap: 24px; margin-top: 8px; }
.left { flex: 0 0 68%; min-width: 0; }
.right { flex: 0 0 calc(32% - 24px); min-width: 0; border-left: 1px solid #e5e7eb; padding-left: 16px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
Do NOT set background-color on .right.
TEXT ALIGNMENT: Left column paragraphs/bullets use text-align: justify. Right column uses text-align: left. Header uses text-align: center.

================================================
LEFT COLUMN ORDER (inside .body .left)
================================================
1. SUMMARY — paragraph text flush left, NO extra padding or margin-left
2. EXPERIENCE
3. EDUCATION
4. PROJECTS (only if present in CV)
5. KEY CONTRIBUTIONS / ACHIEVEMENTS (only if present in CV — include all bullet points exactly as written)
6. CERTIFICATIONS — only if LONG (see placement rule below)

All sections go inside .left div. Do NOT create a separate .full-width div.

================================================
RIGHT COLUMN ORDER
================================================
1. SKILLS
2. TOOLS & TECHNOLOGIES
3. CERTIFICATIONS — only if SHORT (see placement rule below)
4. LANGUAGES (if present)

================================================
CERTIFICATIONS PLACEMENT RULE — STRICTLY FOLLOW THIS
================================================
Count the total number of lines of certification content (titles + descriptions combined).

IF total certification lines <= 3 (e.g. just 2-3 cert names with no descriptions):
  → Place CERTIFICATIONS in the RIGHT column, after Tools & Technologies
  → Render as a simple list of names

IF total certification lines > 3 (e.g. any cert has a description paragraph):
  → Place CERTIFICATIONS in the LEFT column, after Projects or Key Contributions
  → Do NOT put it in the right column at all
  → Format: Bold title on its own line, then description as a plain paragraph below (NO bullets, NO nested items)

Swapnil's CV example has descriptions → goes in LEFT column.
If no certifications exist, omit the section entirely from both columns.

================================================
SECTION STYLE
================================================
- Uppercase, Bold, Black (#111), font-size 11px, letter-spacing: 0.5px
- Horizontal divider directly underneath: border-top: 1.5px solid #111, margin-bottom: 8px
- margin-top: 14px on each section
- Section titles are BLACK, not blue.

================================================
EXPERIENCE FORMAT
================================================
Wrap each job in <div class="exp-block">:
- Line 1: Job Title alone — bold 11px #111. NEVER combine company and title on same line.
- Line 2: Company Name with location and work type if present in CV (e.g. "Brandsmith360, Paris, France (Remote)") — 10.5px #2563EB. ALWAYS include city, country, and Remote/On-site/Hybrid if mentioned in the CV.
- Line 3: Dates — italic 10px #666. Use the EXACT dates from the CV. NEVER write "MM/YYYY" as a placeholder. If dates are not found, omit this line entirely.
- 3-4 bullet points, font-size 10.5px, text-align: justify
- Technologies: italic 10px #555
Include all experience entries.

================================================
EDUCATION FORMAT
================================================
Wrap each entry in <div class="edu-block">:
- Degree — bold 11px #111
- Institution — 10.5px #2563EB
- Year — italic 10px #666
- CGPA/Percentage/Additional info — plain 10.5px #444, NOT bold, NOT a heading tag. Must use <p style="font-size:10.5px;color:#444;margin:0"> or a <span>. NEVER use h1/h2/h3/h4 for CGPA or any education detail.
Include all education entries.

================================================
PROJECTS FORMAT
================================================
Wrap each project in <div class="proj-block">:
- Project Title — bold 11px #111
- Tech Stack — italic 10px #555
- 2-3 bullet points, font-size 10.5px, text-align: justify
Include all projects if present.

================================================
SKILLS FORMAT
================================================
Right column only. Group skills by category:
- Category title: bold 10.5px, color #2563EB (blue)
- Skills below: 10px #333, text-align: left
Use only categories relevant to the CV.

================================================
CRITICAL PAGE CONTROL
================================================
- Target length: 1 page.
- If content cannot fit professionally on one page, create a second page.
- Never reduce font size below 10px.
- Never distort the layout.
- Never overlap content.
- Never push content outside page boundaries.
- Maintain identical margins and spacing on every page.

================================================
CRITICAL TEMPLATE CONSISTENCY RULES
================================================
This resume must always look visually identical to the reference template.

HEADER RULES:
* Keep exactly the same top spacing.
* Keep exactly the same header height.
* Never move the name position.
* Never move the contact information row.
* Never reduce header spacing.

FOOTER RULES:
* Keep exactly the same bottom spacing.
* Footer position must remain visually identical.
* Never allow content to reach the bottom edge.

CONTENT CONTROL RULES:
When content is TOO LONG:
* Shorten summary to maximum 3 lines.
* Maximum 4 bullet points per job.
* Maximum 3 bullet points per project.
* Remove repetitive information.
* Merge duplicate skills.
* Keep only strongest achievements.
* Prioritize recent experience.

When content is TOO SHORT:
* Expand achievement descriptions slightly.
* Add more detail from existing resume content.
* Distribute spacing evenly between sections.
* Keep footer position unchanged.

LAYOUT RULES:
* Maintain identical top whitespace.
* Maintain identical bottom whitespace.
* Maintain identical section spacing.
* Maintain identical column spacing.
* Maintain identical visual density.

FINAL CHECK BEFORE OUTPUT — Verify:
✓ Header spacing matches template.
✓ Footer spacing matches template.
✓ No large empty gaps.
✓ No content overflow.
✓ Resume visually matches reference template.
✓ Only content changes.
✓ Design never changes.

================================================
CRITICAL PAGE BREAK RULES
================================================
1. NEVER allow a section heading to appear at the bottom of a page without at least 2 lines of content below it.

2. Before rendering any section heading (PROJECTS, EXPERIENCE, EDUCATION, CERTIFICATIONS, SKILLS, etc.):
   - Calculate remaining space on current page.
   - Calculate height required for heading + minimum 2 content lines.
   - If remaining space is insufficient: move the ENTIRE section (heading + content) to the next page.
   - Do NOT print the heading on the current page if content cannot follow it.

3. Apply "Keep With Next" behavior:
   - Section heading must stay attached to its content.
   - No orphan headings. No isolated titles.
   CSS: use break-inside: avoid on a wrapper div containing heading + first content block.

4. Maintain identical top margin on EVERY page.
   - Page 1 and Page 2 must start at exactly the same Y position.
   - Header spacing must be consistent across all pages.

5. Maintain identical bottom margin on EVERY page.
   - Content must never touch the footer area.

6. Before creating a new page:
   - Check if the next section can fit.
   - If not, start the section on the next page.

7. For PROJECTS section specifically:
   - If "PROJECTS" heading appears near the page end and project content cannot fit beneath it,
     move the heading AND all project entries to the next page.

8. No page should end with:
   - A heading only
   - A heading plus one line
   - A project title without its description

9. Use professional pagination rules (like Microsoft Word):
   - Keep headings with content.
   - Keep project titles with at least first paragraph.
   - Prevent widows and orphans.

10. IMPLEMENTATION: Wrap every section's heading + first content item together in a div with:
    style="page-break-inside: avoid; break-inside: avoid;"
    This forces them to move together to the next page if they don't fit.

================================================
PAGE 2 LAYOUT RULE — FULL WIDTH WHEN RIGHT COLUMN IS EMPTY
================================================
When content overflows to a second page AND the right column has no remaining content for Page 2:

MANDATORY IMPLEMENTATION:
- Do NOT use .body flex layout on Page 2.
- Do NOT create a .left div or .right div on Page 2.
- Place ALL Page 2 content (Education, Projects, etc.) inside ONE full-width div like this:

<div style="width:100%;max-width:100%;margin-top:8px;">
  <!-- All page 2 sections here — Education, Projects, etc. -->
</div>

- The text must span the FULL width of the page — from left margin to right margin.
- flex: 0 0 68% must NOT apply to any content on Page 2 when right column is empty.
- No border-left divider on Page 2.
- Sections on Page 2 use the same section heading style (uppercase, bold, black, with divider line) but span full width.
- Bullet points and paragraphs on Page 2 must reach the full right margin — same as a single-column document.

================================================
MULTI-PAGE HEADER & FOOTER RULES
================================================
When a resume requires more than one page:
EVERY PAGE MUST BE TREATED AS A NEW TEMPLATE PAGE.

PAGE 1:
* Header begins at normal template position.
* Footer remains at normal template position.

PAGE 2 AND ALL SUBSEQUENT PAGES:
* Reserve the exact same top margin as Page 1.
* Reserve the exact same header area height as Page 1.
* Reserve the exact same bottom margin as Page 1.
* Reserve the exact same footer area height as Page 1.
* Do not start content at the top edge of Page 2.
* Before any content appears on Page 2, leave the same header spacing used on Page 1.
* Page 2 content must begin only after the reserved header space.
* Maintain identical footer spacing on every page.

IMPLEMENTATION: Use @page margins and padding: 40px 32px on every page so content never starts at the top edge.

VISUAL RULE — If Page 1 and Page 2 are placed side by side:
✓ Header begins at same vertical position.
✓ Content begins at same vertical position.
✓ Footer ends at same vertical position.
✓ Margins are identical.

CONTENT FLOW RULE:
When content moves to Page 2, do not place the next bullet/project immediately at the top.
Start it below the reserved header area.

FINAL VALIDATION:
* Page 1 top spacing = Page 2 top spacing.
* Page 1 footer spacing = Page 2 footer spacing.
* Every page follows the same template grid.

================================================
TYPOGRAPHY
================================================
Font: Inter from Google Fonts (https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)
Base body text: 10.5px, color #222

BOLD / HIGHLIGHT RULES — STRICTLY FOLLOW:
* Do NOT bold any words inside bullet points, paragraphs, or summary text.
* Do NOT use <strong> or <b> tags anywhere in body content.
* The ONLY elements that should be bold are:
  - Candidate name (h1)
  - Section headings (e.g. EXPERIENCE, EDUCATION, SKILLS)
  - Job titles
  - Degree names
  - Project titles
  - Skill category labels in the right column
* Everything else — bullet point text, summary, company names description, technologies line — must be regular weight (font-weight: 400). No exceptions.

================================================
PRINT / PDF RULES
================================================
* <title></title> — empty string.
* html, body: background: white !important; margin: 0; padding: 0;
* Include in <style>:

@media print {
  html, body { background: white !important; margin: 0; padding: 0; }
  .page { width: 100% !important; padding: 0 !important; background: white !important; }
  .right { background: none !important; }
  .body { align-items: flex-start !important; }
  .exp-block { page-break-inside: avoid; break-inside: avoid; }
  .edu-block { page-break-inside: avoid; break-inside: avoid; }
  .edu-block p, .edu-block span, .edu-block div { font-size: 10.5px !important; }
  .exp-block p, .exp-block span, .exp-block div { font-size: 10.5px !important; }
  .proj-block p, .proj-block span, .proj-block div { font-size: 10.5px !important; }
  .proj-block { page-break-inside: avoid; break-inside: avoid; }
  h2, h3, .section-title { page-break-after: avoid !important; break-after: avoid !important; }
  h2 + *, h3 + *, .section-title + * { page-break-before: avoid !important; break-before: avoid !important; }
  @page { size: A4 portrait; margin: 40px 32px; }
}

* The HTML body must contain ONLY the .page div — nothing before it, nothing after it.

OUTPUT: Return ONLY the complete HTML starting with <!DOCTYPE html> and ending with </html>. No markdown. No code fences. No explanations.

CV TO REFORMAT:
${cvText}`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      const userMsg = geminiRes.status === 429
        ? "Our servers are busy right now. Please try again in a minute."
        : "CV rewrite failed. Please try again in a moment.";
      return NextResponse.json({ error: userMsg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    let rawHtml = parts.find((p: any) => !p.thought && p.text)?.text ?? parts[0]?.text ?? "";

    if (!rawHtml) return NextResponse.json({ error: "AI returned empty response. Please try again." }, { status: 500 });

    rawHtml = rawHtml
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!rawHtml.toLowerCase().includes("<!doctype")) {
      return NextResponse.json({ error: "AI returned invalid HTML. Please try again." }, { status: 500 });
    }

    // ── Inject LinkedIn / GitHub links server-side ────────────────
    // Strip any existing anchor around the word, then inject cleanly
    const injectLink = (html: string, word: string, url: string): string => {
      // Step 1: strip any existing <a ...>word</a> → plain word
      html = html.replace(new RegExp(`<a[^>]*>${word}<\\/a>`, "g"), word);
      if (html.includes(word)) {
        // Step 2: word exists — wrap with new link
        html = html.replace(
          new RegExp(`\\b${word}\\b`, "g"),
          `<a href="${url}" style="color:inherit;text-decoration:none;">${word}</a>`
        );
      } else {
        // Step 3: word missing entirely — insert into contact row
        html = html.replace(
          /class="contact"([^>]*)([\s\S]*?)<\/div>/,
          (match, attrs, content) => {
            const link = `<a href="${url}" style="color:inherit;text-decoration:none;">${word}</a>`;
            return `class="contact"${attrs}>${content.trimEnd()} | ${link}</div>`;
          }
        );
      }
      return html;
    };

    if (linkedinUrl) rawHtml = injectLink(rawHtml, "LinkedIn", linkedinUrl);
    if (githubUrl)   rawHtml = injectLink(rawHtml, "GitHub",   githubUrl);

    // ── Strip bold tags from bullet/body content (keep only structural bold) ──
    // Remove <strong> and <b> tags inside bullet points and paragraphs only
    rawHtml = rawHtml.replace(/<(strong|b)>(.*?)<\/(strong|b)>/gi, "$2");

    // ── Replace special unicode characters that don't render in PDF fonts ──
    rawHtml = rawHtml
      .replace(/→/g, "-")
      .replace(/←/g, "-")
      .replace(/↑/g, "-")
      .replace(/↓/g, "-")
      .replace(/•/g, "•")
      .replace(/–/g, "–")
      .replace(/—/g, "—")
      .replace(/’/g, "'")
      .replace(/“/g, '"')
      .replace(/”/g, '"');

    // ── Inject right column overflow fix + page 2 full width fix ──
    rawHtml = rawHtml.replace(
      "</head>",
      `<style>
        .right { overflow: hidden !important; overflow-wrap: break-word !important; word-wrap: break-word !important; word-break: normal !important; box-sizing: border-box !important; max-width: 100% !important; }
        .right * { overflow-wrap: break-word !important; word-wrap: break-word !important; word-break: normal !important; max-width: 100% !important; }
        .page2-body { width: 100% !important; max-width: 100% !important; flex: none !important; display: block !important; }
        .page2-body * { max-width: 100% !important; flex: none !important; }
        .full-width { width: 100% !important; max-width: 100% !important; flex: none !important; display: block !important; }
        .full-width .left { flex: none !important; width: 100% !important; max-width: 100% !important; }
      </style></head>`
    );

    // ── Force full width on page 2 left column if right column is empty on page 2 ──
    // If there's a page2-body or full-width div, ensure .left inside it goes full width
    rawHtml = rawHtml.replace(
      /(<div[^>]*class="[^"]*(?:page2-body|full-width)[^"]*"[^>]*>)([\s\S]*?)(<\/div>\s*$)/,
      (match) => match.replace(/class="left"/g, 'class="left" style="flex:none!important;width:100%!important;max-width:100%!important;"')
    );

    // ── Puppeteer: HTML → PDF ──────────────────────────────────────
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const browserPage = await browser.newPage();
    // Set viewport to A4 width so getBoundingClientRect() matches print dimensions
    await browserPage.setViewport({ width: 794, height: 1122 });
    await browserPage.emulateMediaType("print");
    await browserPage.setContent(rawHtml, { waitUntil: "load" });

    // ── Fix page 2: if right column ends before left column, move overflow to full-width ──
    await browserPage.evaluate(() => {
      const left = document.querySelector(".left");
      const right = document.querySelector(".right");
      const pageDiv = document.querySelector(".page");
      if (!left || !right || !pageDiv) return;

      const rightBottom = right.getBoundingClientRect().bottom;
      const leftBottom  = left.getBoundingClientRect().bottom;

      // Only restructure if left column is significantly taller than right column
      if (leftBottom <= rightBottom + 80) return;

      // Find all direct children of .left that start at or after the right column bottom
      const overflowEls: Element[] = [];
      Array.from(left.children).forEach((child) => {
        const top = child.getBoundingClientRect().top;
        if (top >= rightBottom - 10) {
          overflowEls.push(child);
        }
      });

      if (overflowEls.length === 0) return;

      // Create a full-width container for overflow content
      const fullSection = document.createElement("div");
      fullSection.setAttribute(
        "style",
        "width:100% !important; display:block !important; flex:none !important; " +
        "max-width:100% !important; margin-top:8px; box-sizing:border-box;"
      );

      // Move overflow elements out of .left into the full-width section
      overflowEls.forEach((el) => {
        left.removeChild(el);
        fullSection.appendChild(el);
      });

      // Append after the two-column .body div
      pageDiv.appendChild(fullSection);
    });

    const pdfBuffer = await browserPage.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: "40px", bottom: "40px", left: "32px", right: "32px" },
    });

    await browser.close();

    // ── Build download filename ────────────────────────────────────
    const cvNameRaw  = rawHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]
      ?.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-") || "CV";
    const roleSlug   = jobRole.split("/")[0].trim().replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    const downloadFilename = `${cvNameRaw}-${roleSlug}-CV.pdf`;

    const pdfBytes = Buffer.from(pdfBuffer);

    // ── Save to Supabase ───────────────────────────────────────────
    waitUntil((async () => {
      try {
        const ts   = Date.now();
        const slug = paymentId || ts.toString();

        const originalPdfUrl = await storageUpload(
          "cv-pdfs",
          `originals/${ts}-${slug}.pdf`,
          buffer,
          "application/pdf"
        );

        const rewrittenPdfUrl = await storageUpload(
          "cv-pdfs",
          `rewrites/${ts}-${slug}.pdf`,
          pdfBytes,
          "application/pdf"
        );

        await dbInsert("cv_rewrites", {
          job_role:            jobRole,
          score_before:        scoreBefore || null,
          email:               userEmail   || null,
          payment_id:          paymentId   || null,
          original_cv_text:    cvText,
          rewritten_cv_text:   rawHtml,
          original_pdf_url:    originalPdfUrl,
          rewritten_pdf_url:   rewrittenPdfUrl,
        });
      } catch (e) {
        console.error("Supabase save error:", e);
      }
    })());

    // ── Send email with PDF attachment ─────────────────────────────
    if (userEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from:    "ScoreMyCV <noreply@scoremycv.in>",
          to:      userEmail,
          subject: "Your Rewritten CV is Ready — ScoreMyCV",
          html: `<p>Hi,</p><p>Your ATS-optimised CV is ready. Please find it attached.</p><p>Thanks,<br/>ScoreMyCV Team</p>`,
          attachments: [
            {
              filename: downloadFilename,
              content:  Buffer.from(pdfBytes).toString("base64"),
            },
          ],
        });
      } catch (e) {
        console.error("Email send error:", e);
      }
    }

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        "Cache-Control":       "no-store",
      },
    });

  } catch (err: any) {
    console.error("rewrite-cv error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
