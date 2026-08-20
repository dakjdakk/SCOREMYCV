import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { dbInsert, storageUpload } from "@/lib/supabase";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

// Chromium binary CDN URL — downloaded on cold start, cached in /tmp/chromium for warm calls
const CHROMIUM_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

// ── Route handler ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData  = await request.formData();
    const file      = formData.get("file") as File | null;
    const jobRole   = (formData.get("jobRole")   as string) || "Software Engineer";
    const experience= (formData.get("experience")as string) || "0-2 years";
    const userEmail = (formData.get("email")     as string) || "";
    const userLinkedin  = (formData.get("linkedin")  as string) || "";
    const userGithub    = (formData.get("github")    as string) || "";
    const userPortfolio = (formData.get("portfolio") as string) || "";
    const scoreBefore  = parseInt((formData.get("scoreBefore") as string) || "0", 10);
    const paymentId    = (formData.get("paymentId") as string) || "";
    const option       = (formData.get("option") as string) || "1"; // "1" = standard, "2" = flexible education

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // ── Parse CV text ──────────────────────────────────────────────
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";
    let docxHrefs: string[] = []; // hyperlink URLs extracted from DOCX (lost by extractRawText)

    if (fileName.endsWith(".pdf")) {
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      text = (await pdfParse(buffer)).text;
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      text = (await mammoth.extractRawText({ buffer })).value;
      // convertToHtml retains <a href="..."> so we can recover embedded hyperlinks
      const docxHtml = (await mammoth.convertToHtml({ buffer })).value;
      const hrefRe = /href="([^"]+)"/gi;
      let hm: RegExpExecArray | null;
      while ((hm = hrefRe.exec(docxHtml)) !== null) docxHrefs.push(hm[1]);

      // Collect link-label texts for non-profile hrefs (e.g. "Demo", "Dashboard" pointing to portfolio)
      // These appear in project title lines as orphan words — strip them from the CV text so Gemini
      // doesn't reproduce them as link buttons pointing to the wrong URL.
      const projLinkTexts: string[] = [];
      const anchorRe2 = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let am: RegExpExecArray | null;
      while ((am = anchorRe2.exec(docxHtml)) !== null) {
        const href = am[1];
        const linkText = am[2].replace(/<[^>]+>/g, "").trim();
        if (linkText && linkText.length < 40 &&
            !href.includes("linkedin.com") &&
            !href.includes("github.com") &&
            !href.startsWith("mailto:")) {
          projLinkTexts.push(linkText);
        }
      }
      // Strip each link-label word from the CV text when it appears just before "|" or end-of-line
      projLinkTexts.forEach(label => {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        text = text.replace(new RegExp(`\\s+${escaped}(?=\\s*[|\\n])`, "gi"), "");
        text = text.replace(new RegExp(`\\s+${escaped}\\s*$`, "gim"), "");
      });
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
      const rawUrlsFromBinary: string[] = [];

      // Primary: extract annotation links via pdf-parse's pagerender callback
      // (pdf-parse uses a Node-compatible pdfjs build — no browser APIs needed)
      try {
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");
        await pdfParse(buffer, {
          pagerender: async (pageData: any) => {
            try {
              const annotations = await pageData.getAnnotations();
              for (const annot of annotations) {
                if (annot.url) rawUrlsFromBinary.push(annot.url);
              }
            } catch (_) {}
            return "";
          }
        });
        console.log("[URL] annotation URLs via pdf-parse:", rawUrlsFromBinary);
      } catch (e) {
        console.log("[URL] pdf-parse annotation failed, falling back to binary scan:", e);
        // Fallback: raw binary scan for uncompressed PDFs
        const pdfStr = buffer.toString("latin1");
        (pdfStr.match(/https?:\/\/[^\s)<>"\\]{8,}/gi) || []).forEach(u => rawUrlsFromBinary.push(u));
        const uriRe = /\/URI\s*\(([^)]+)\)/gi;
        let uriM: RegExpExecArray | null;
        while ((uriM = uriRe.exec(pdfStr)) !== null) rawUrlsFromBinary.push(uriM[1]);
      }

      // Classify extracted URLs — strip mailto: and non-http URLs first
      const httpUrls = rawUrlsFromBinary.filter(u => /^https?:\/\//i.test(u));
      const liMatch = httpUrls.find(u => /linkedin\.com\/in\//i.test(u));
      const ghMatch = httpUrls.find(u => /github\.com\//i.test(u) && !u.includes("/commit"));
      extractedLinkedin = liMatch?.replace(/[.,;)]+$/, "").replace(/\/$/, "") || "";
      extractedGithub   = ghMatch?.replace(/[.,;)]+$/, "").replace(/\/$/, "") || "";

      const urlSet = new Set<string>(
        httpUrls
          .map(u => u.replace(/[.,;]+$/, "").trim())
          .filter(u =>
            u.length > 12 &&
            !u.includes("adobe") &&
            !u.includes("w3.org") &&
            !u.includes("pdfium") &&
            !u.includes("linkedin.com") &&
            !/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)(\?.*)?$/i.test(u)
          )
      );
      allExtractedUrls = Array.from(urlSet);
    }

    // ── Process DOCX embedded hyperlinks (href attrs from mammoth HTML conversion) ──
    docxHrefs.forEach(u => {
      u = u.replace(/[.,;)]+$/, "").trim();
      if (!u.startsWith("http")) {
        // Skip non-HTTP schemes (mailto:, ftp:, etc.)
        if (u.includes(":") && !u.startsWith("//")) return;
        u = "https://" + u;
      }
      if (u.includes("linkedin.com/in/") && !extractedLinkedin) extractedLinkedin = u;
      else if (u.includes("github.com/") && !u.includes("/commit") && !extractedGithub) extractedGithub = u;
      else if (!u.includes("linkedin.com") && !u.includes("adobe") && !u.includes("w3.org") && u.length > 12 && !/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)(\?.*)?$/i.test(u)) {
        if (!allExtractedUrls.includes(u)) allExtractedUrls.push(u);
      }
    });

    // ── Bare domain scan: linkedin.com/in/... and github.com/... without https:// prefix ──
    const liBarMatch = text.match(/\blinkedin\.com\/in\/[A-Za-z0-9\-_%]+/i);
    if (liBarMatch && !extractedLinkedin) extractedLinkedin = "https://" + liBarMatch[0].replace(/[.,;)]+$/, "");
    const ghBarMatch = text.match(/\bgithub\.com\/[A-Za-z0-9\-_%]+(?:\/[A-Za-z0-9\-_%]+)*/i);
    if (ghBarMatch && !extractedGithub) extractedGithub = "https://" + ghBarMatch[0].replace(/[.,;)]+$/, "");

    // ── Also scan extracted plain text for URLs (catches DOCX + PDF text-layer links) ──
    const textUrlMatches = text.match(/(?:https?:\/\/|www\.)[^\s,;|•(){}<>"'\\]{8,}/gi) || [];
    textUrlMatches.forEach(u => {
      u = u.replace(/[.,;)]+$/, "").trim();
      if (!u.startsWith("http")) u = "https://" + u;
      if (u.includes("linkedin.com/in/") && !extractedLinkedin) extractedLinkedin = u;
      else if (u.includes("github.com/") && !u.includes("/commit") && !extractedGithub) extractedGithub = u;
      else if (!u.includes("linkedin.com") && !u.includes("adobe") && !u.includes("w3.org") && u.length > 12 && !/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)(\?.*)?$/i.test(u)) {
        if (!allExtractedUrls.includes(u)) allExtractedUrls.push(u);
      }
    });

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
    const linkedinUrl  = normalizeUrl(userLinkedin || extractedLinkedin);
    const githubUrl    = normalizeUrl(userGithub   || extractedGithub);
    // Form field takes priority; fall back to first non-LinkedIn, non-GitHub URL from PDF
    const portfolioUrl = normalizeUrl(
      userPortfolio ||
      allExtractedUrls.find(u =>
        !u.includes("linkedin.com") && !u.includes("github.com")
      ) || ""
    );
    console.log("LinkedIn URL:", linkedinUrl, "| GitHub URL:", githubUrl, "| Portfolio URL:", portfolioUrl);

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

    // ── Option 4: Single-column traditional format ────────────────
    // ARCHITECTURE: Two-step approach.
    // Step 1 — Gemini outputs ONLY structured JSON (content extraction + light rewrite).
    // Step 2 — Our server code builds 100% of the HTML from that JSON.
    // Gemini never touches HTML → eliminates all contact corruption, fabricated links,
    // wrong section names, bullet prefix bugs, and layout issues.
    if (option === "4") {

      // ── Build contact line server-side (before Gemini call) ──────────
      const emailMatch4   = cvText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
      const phoneRaw4     = cvText.match(/(\+?[\d][\d\s\-().]{7,}\d)/)?.[0]?.trim() || "";
      const phoneNorm4 = (() => {
        if (!phoneRaw4) return "";
        const digits = phoneRaw4.replace(/\D/g, "");
        if (phoneRaw4.startsWith("+91")) return phoneRaw4;
        if (digits.startsWith("91") && digits.length === 12) return `+91-${digits.slice(2)}`;
        if (digits.length === 10) return `+91-${digits}`;
        return phoneRaw4;
      })();
      const headerLines4 = cvText.split("\n").slice(1, 4).join("\n");
      const NON_CITY4 = /^(Python|Java|Machine|Learning|Analyst|Engineer|Developer|Data|Science|Software|Web|Full|Stack|Frontend|Backend|Mobile|Cloud|Aws|Azure|Gcp|React|Node|Next|Angular|Vue|Sql|Nosql|Ml|Ai|Deep|Natural|Language|Processing|Computer|Vision|Tableau|Power|Excel|Statistics|Analytics|Business|Intelligence)$/i;
      const locationMatch4 = (() => {
        // Matches "City, ST" (2-3 letter abbrev like AP, TN) OR "City, Statename" OR "City, Statename, India"
        const m = headerLines4.match(/\b([A-Z][a-z]{1,15}(?:\s[A-Z][a-z]{1,15})?,\s*(?:[A-Z]{2,3}|[A-Z][a-z]{1,15}(?:\s[A-Z][a-z]{1,15})?)(?:,\s*India)?)\b/g);
        if (!m) return null;
        const valid = m.find(loc => {
          const parts = loc.split(/[,\s]+/).filter(Boolean);
          return parts.every(w => !NON_CITY4.test(w));
        });
        return valid ? [null, valid] : null;
      })();
      const relocateMatch4 = /open\s+to\s+relocat|willing\s+to\s+relocat|available\s+immediately/i.test(cvText);
      const headerText4   = cvText.split("\n").slice(0, 10).join(" ");
      const mentionsLinkedin4  = /linkedin/i.test(headerText4);
      const mentionsGithub4    = /github/i.test(headerText4);
      const mentionsPortfolio4 = /portfolio/i.test(headerText4);
      const imageExtRe4 = /\.(png|jpg|jpeg|gif|svg|webp|ico|bmp|tiff?)(\?.*)?$/i;
      const getDomainLabel4 = (u: string) => {
        try {
          const hostname = new URL(u).hostname.replace(/^www\./, "");
          const domain = hostname.split(".")[0];
          return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch { return u.replace(/https?:\/\//, "").split("/")[0]; }
      };
      const contactParts: string[] = [];
      if (locationMatch4) contactParts.push(locationMatch4[1].trim());
      if (phoneNorm4)     contactParts.push(phoneNorm4);
      if (emailMatch4)    contactParts.push(`<a href="mailto:${emailMatch4[0]}" style="color:inherit;text-decoration:none;">${emailMatch4[0]}</a>`);
      if (linkedinUrl)         contactParts.push(`<a href="${linkedinUrl}" style="color:inherit;text-decoration:none;">LinkedIn</a>`);
      else if (mentionsLinkedin4) contactParts.push("LinkedIn");
      if (githubUrl)           contactParts.push(`<a href="${githubUrl}" style="color:inherit;text-decoration:none;">GitHub</a>`);
      else if (mentionsGithub4)   contactParts.push("GitHub");
      if (portfolioUrl)        contactParts.push(`<a href="${portfolioUrl}" style="color:inherit;text-decoration:none;">Portfolio</a>`);
      else if (mentionsPortfolio4 && !linkedinUrl && !githubUrl) contactParts.push("Portfolio");
      if (relocateMatch4) contactParts.push("Open to Relocate");
      allExtractedUrls
        .filter(u => u !== portfolioUrl && !u.includes("linkedin.com") && !u.includes("github.com") && !u.includes("github.io") && !imageExtRe4.test(u))
        .slice(0, 2)
        .forEach(u => contactParts.push(`<a href="${u}" style="color:inherit;text-decoration:none;">${getDomainLabel4(u)}</a>`));
      console.log("[OPT4] contactParts:", contactParts);

      // ── STEP 1: Ask Gemini for structured JSON only ───────────────
      const extractPrompt = `You are a CV data extractor. Extract the resume content below into valid JSON matching this exact schema. Output ONLY valid JSON — no markdown, no code fences, no explanation.

Rules:
- Extract ONLY what exists in the CV. Never invent or add information.
- "designation": Best title for a "${jobRole}" candidate (e.g. "Data Analyst & ML Engineer").
- "summary": Lightly improve for "${jobRole}" role but keep the candidate's voice. Do NOT add years of experience not in the original.
- skills[].items: comma-separated string of skills for that category.
- For bullets: extract actual content, lightly improve phrasing for ATS but never fabricate facts.
- "achievements": bullets from ANY section named "Coding Practices", "Achievements", "Awards", "Key Achievements". IMPORTANT: Strip any section-name prefix — if bullet says "Coding Practices: Solved 100+ problems..." just extract "Solved 100+ problems...". Never include the section name as a prefix inside the bullet text.
- "leadership": items from "Leadership", "Extracurricular", "Activities" sections.
- If a section does not exist in the CV, use null or empty array [].
- certifications[].issuer may be empty string if not mentioned.

JSON Schema (output this exact structure):
{
  "name": "string",
  "designation": "string",
  "summary": "string",
  "skills": [{"category": "string", "items": "string"}],
  "experience": [{"company": "string", "location": "string", "role": "string", "dates": "string", "bullets": ["string"]}],
  "projects": [{"title": "string", "tools": "string", "date": "string", "bullets": ["string"]}],
  "education": [{"institution": "string", "location": "string", "degree": "string", "dates": "string", "cgpa": "string"}],
  "certifications": [{"name": "string", "issuer": "string"}],
  "achievements": ["string"],
  "leadership": [{"role": "string", "description": "string"}]
}

CV:
${cvText}`;

      const geminiKey4 = process.env.GEMINI_API_KEY;
      if (!geminiKey4) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

      const geminiRes4 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey4}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: extractPrompt }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 4096, responseMimeType: "application/json" },
          }),
        },
      );

      if (!geminiRes4.ok) {
        const userMsg = geminiRes4.status === 429
          ? "Our servers are busy right now. Please try again in a minute."
          : "CV rewrite failed. Please try again in a moment.";
        return NextResponse.json({ error: userMsg }, { status: 502 });
      }

      const geminiData4 = await geminiRes4.json();
      const parts4 = geminiData4?.candidates?.[0]?.content?.parts ?? [];
      let rawJson4 = parts4.find((p: any) => !p.thought && p.text)?.text ?? parts4[0]?.text ?? "";

      console.log("[OPT4] geminiData4 candidates:", JSON.stringify(geminiData4?.candidates?.[0]?.content?.parts?.map((p:any)=>({thought:p.thought,textLen:p.text?.length})) ?? []));
      console.log("[OPT4] rawJson4 first 300:", rawJson4.slice(0, 300));
      if (!rawJson4) return NextResponse.json({ error: "AI returned empty response. Please try again." }, { status: 500 });

      // Robust JSON extraction: strip fences, then find balanced outer { } block
      rawJson4 = rawJson4
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      // Balanced-brace extractor — handles trailing text/notes after the JSON object
      const extractBalancedJson = (s: string): string => {
        const start = s.indexOf("{");
        if (start === -1) return s;
        let depth = 0;
        let inStr = false;
        let escape = false;
        for (let i = start; i < s.length; i++) {
          const ch = s[i];
          if (escape) { escape = false; continue; }
          if (ch === "\\" && inStr) { escape = true; continue; }
          if (ch === '"') { inStr = !inStr; continue; }
          if (inStr) continue;
          if (ch === "{") depth++;
          else if (ch === "}") { depth--; if (depth === 0) return s.slice(start, i + 1); }
        }
        return s.slice(start);
      };

      let cvData: any;
      try {
        cvData = JSON.parse(rawJson4);
      } catch {
        const extracted = extractBalancedJson(rawJson4);
        try { cvData = JSON.parse(extracted); }
        catch (e2) {
          console.error("[OPT4] JSON parse failed. Raw:", rawJson4.slice(0, 500), "Error:", e2);
          return NextResponse.json({ error: "AI returned invalid data. Please try again." }, { status: 500 });
        }
      }

      // Safety: ensure all expected fields exist and are correct types
      if (!cvData || typeof cvData !== "object") {
        return NextResponse.json({ error: "AI returned invalid data. Please try again." }, { status: 500 });
      }
      cvData.skills        = Array.isArray(cvData.skills)        ? cvData.skills        : [];
      cvData.experience    = Array.isArray(cvData.experience)    ? cvData.experience    : [];
      cvData.projects      = Array.isArray(cvData.projects)      ? cvData.projects      : [];
      cvData.education     = Array.isArray(cvData.education)     ? cvData.education     : [];
      cvData.certifications= Array.isArray(cvData.certifications)? cvData.certifications: [];
      cvData.achievements  = Array.isArray(cvData.achievements)
        ? cvData.achievements.map((a: string) => (typeof a === "string" ? a.replace(/^[A-Za-z][A-Za-z\s&]*:\s*/, "") : a))
        : [];
      cvData.leadership    = Array.isArray(cvData.leadership)    ? cvData.leadership    : [];

      // ── Normalize date casing: "DEC 2024" → "Dec 2024", "JUNE" → "June" etc.
      const normDate = (s: string): string => {
        if (!s) return s;
        return s.replace(
          /\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|JAN|FEB|MAR|APR|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/g,
          (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
        );
      };
      cvData.experience.forEach((job: any) => { if (job.dates) job.dates = normDate(job.dates); });
      cvData.education.forEach((edu: any)  => { if (edu.dates)  edu.dates  = normDate(edu.dates);  });
      cvData.projects.forEach((proj: any)  => { if (proj.date)  proj.date  = normDate(proj.date);  });

      console.log("[OPT4] cvData parsed. name:", cvData.name, "skills:", cvData.skills.length, "exp:", cvData.experience.length);

      // ── STEP 2: Build HTML entirely from JSON — server controls every element ──
      // Helper: escape HTML special chars
      const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      // Helper: wrap content in a section block (returns "" if content is empty)
      const sec = (title: string, content: string) =>
        content?.trim()
          ? `<div class="section"><div class="section-title">${title}</div><hr class="section-rule">${content}</div>`
          : "";

      // Profile Summary
      const summaryHtml4 = sec("Profile Summary",
        cvData.summary
          ? `<p style="font-size:10px;text-align:justify;margin-top:3px;">${esc(cvData.summary)}</p>`
          : ""
      );

      // Technical Skills
      const skillsInner4 = Array.isArray(cvData.skills) && cvData.skills.length
        ? `<div class="skills-block">${cvData.skills.map((s: any) =>
            `<p><strong>${esc(s.category)}:</strong> ${esc(s.items)}</p>`
          ).join("\n")}</div>`
        : "";
      const skillsHtml4 = sec("Technical Skills", skillsInner4);

      // Experience
      const expInner4 = Array.isArray(cvData.experience) && cvData.experience.length
        ? cvData.experience.map((job: any) => `
<div class="exp-block">
  <div class="row">
    <span class="row-left">${esc(job.company)}${job.location ? " — " + esc(job.location) : ""}</span>
    <span class="row-right">${esc(job.dates)}</span>
  </div>
  <div class="role">${esc(job.role)}</div>
  ${Array.isArray(job.bullets) && job.bullets.length
    ? `<ul class="bullets">${job.bullets.map((b: string) => `<li>${esc(b)}</li>`).join("\n")}</ul>`
    : ""}
</div>`).join("\n")
        : "";
      const expHtml4 = sec("Experience", expInner4);

      // Projects — no links (PDF gives us no reliable project URLs)
      const projInner4 = Array.isArray(cvData.projects) && cvData.projects.length
        ? cvData.projects.map((proj: any) => `
<div class="proj-block">
  <div class="proj-row">
    <span class="proj-left">
      <span class="proj-title">${esc(proj.title)}</span>${proj.tools ? ` | <span class="proj-tools">${esc(proj.tools)}</span>` : ""}
    </span>
    ${proj.date ? `<span class="proj-date">${esc(proj.date)}</span>` : ""}
  </div>
  ${Array.isArray(proj.bullets) && proj.bullets.length
    ? `<ul class="bullets">${proj.bullets.map((b: string) => `<li>${esc(b)}</li>`).join("\n")}</ul>`
    : ""}
</div>`).join("\n")
        : "";
      const projHtml4 = sec("Projects", projInner4);

      // Education
      const eduInner4 = Array.isArray(cvData.education) && cvData.education.length
        ? cvData.education.map((edu: any) => `
<div class="exp-block">
  <div class="row">
    <span class="row-left">${esc(edu.institution)}${edu.location ? " — " + esc(edu.location) : ""}</span>
    <span class="row-right">${esc(edu.dates)}</span>
  </div>
  <div class="role">${esc(edu.degree)}${edu.cgpa ? " &nbsp; CGPA: " + esc(edu.cgpa) : ""}</div>
</div>`).join("\n")
        : "";
      const eduHtml4 = sec("Education", eduInner4);

      // Certifications
      const certInner4 = Array.isArray(cvData.certifications) && cvData.certifications.length
        ? `<ul class="cert-list">${cvData.certifications.map((c: any) =>
            `<li>${esc(c.name)}${c.issuer ? " — " + esc(c.issuer) : ""}</li>`
          ).join("\n")}</ul>`
        : "";
      const certHtml4 = sec("Certifications", certInner4);

      // Achievements — rendered as clean bullets, no section-name prefix ever
      const achieveInner4 = Array.isArray(cvData.achievements) && cvData.achievements.length
        ? `<ul class="bullets" style="margin-top:3px;">${cvData.achievements.map((a: string) => `<li>${esc(a)}</li>`).join("\n")}</ul>`
        : "";
      const achieveHtml4 = sec("Achievements", achieveInner4);

      // Leadership — always rendered as bullet list (not plain paragraphs)
      const leaderInner4 = Array.isArray(cvData.leadership) && cvData.leadership.length
        ? `<ul class="bullets" style="margin-top:3px;">${cvData.leadership.map((l: any) =>
            `<li><strong>${esc(l.role)}:</strong> ${esc(l.description)}</li>`
          ).join("\n")}</ul>`
        : "";
      const leaderHtml4 = sec("Leadership & Activities", leaderInner4);

      // Candidate name and designation (from JSON, fallback to CV text scan)
      const candidateName4 = esc(
        cvData.name ||
        cvText.split("\n").map((l: string) => l.trim()).find((l: string) => l.length > 1 && l.length < 60 && /^[A-Za-z]/.test(l)) ||
        "Candidate"
      );
      const designation4 = esc(cvData.designation || jobRole);

      // Assemble final HTML — server owns every byte of this
      const rawHtml4 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { font-family: 'Calibri', Arial, sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
body { background: white; }
.page { width: 750px; margin: 0 auto; padding: 28px 44px; background: white; color: #000; line-height: 1.42; }
.name { font-size: 26px; font-weight: bold; text-align: center; margin-bottom: 3px; letter-spacing: 0.5px; }
.designation { font-size: 11.5px; font-weight: bold; text-align: center; color: #333; margin-bottom: 4px; }
.contact { text-align: center; font-size: 10.5px; color: #333; margin-bottom: 10px; }
.contact a { color: #333; text-decoration: none; }
.section { margin-top: 9px; margin-bottom: 0; }
.section-title { font-size: 13.5px; font-weight: bold; color: #000; margin-bottom: 1px; }
.section-rule { border: none; border-top: 1.2px solid #000; margin: 0 0 5px 0; }
.exp-block { margin-bottom: 5px; }
.row { display: flex; justify-content: space-between; align-items: baseline; }
.row-left { font-weight: bold; font-size: 11px; }
.row-right { font-size: 10.5px; font-style: italic; white-space: nowrap; }
.role { font-style: italic; font-size: 10.5px; margin: 1px 0 3px 0; }
ul.bullets { margin: 3px 0 4px 18px; padding: 0; list-style-type: disc; }
ul.bullets li { font-size: 10.5px; margin-bottom: 2px; text-align: justify; }
.proj-block { margin-bottom: 5px; page-break-inside: avoid; break-inside: avoid; }
.proj-row { display: flex; justify-content: space-between; align-items: baseline; }
.proj-left { font-size: 11px; flex: 1; min-width: 0; }
.proj-title { font-weight: bold; }
.proj-tools { font-style: italic; }
.proj-date { font-size: 10.5px; font-style: italic; white-space: nowrap; margin-left: 8px; }
.skills-block { padding-left: 14px; margin-top: 3px; }
.skills-block p { font-size: 10.5px; margin-bottom: 3px; }
.cert-list { padding-left: 18px; margin-top: 3px; list-style-type: disc; }
.cert-list li { font-size: 10.5px; margin-bottom: 2px; }
@media print {
  .page { width: 100% !important; padding: 0 !important; }
  @page { size: A4 portrait; margin: 28px 44px; }
}
</style>
</head>
<body>
<div class="page">
<div class="name">${candidateName4}</div>
<div class="designation">${designation4}</div>
<div class="contact">${contactParts.join(" &nbsp;|&nbsp; ")}</div>
${summaryHtml4}
${skillsHtml4}
${expHtml4}
${projHtml4}
${eduHtml4}
${certHtml4}
${achieveHtml4}
${leaderHtml4}
</div>
</body>
</html>`;

      // ── STEP 3: Puppeteer → PDF ────────────────────────────────────
      const browser4 = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(CHROMIUM_URL),
        headless: true,
      });

      const browserPage4 = await browser4.newPage();
      await browserPage4.setViewport({ width: 794, height: 1122 });
      await browserPage4.emulateMediaType("print");
      await browserPage4.setContent(rawHtml4, { waitUntil: "load" });

      const pdfBuffer4 = await browserPage4.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: false,
        margin: { top: "28px", bottom: "28px", left: "44px", right: "44px" },
      });

      await browser4.close();

      const cvNameRaw4 = (cvData.name || candidateName4).replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-") || "CV";
      const roleSlug4 = jobRole.split("/")[0].trim().replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
      const downloadFilename4 = `${cvNameRaw4}-${roleSlug4}-CV.pdf`;

      const pdfBytes4 = Buffer.from(pdfBuffer4);

      waitUntil((async () => {
        try {
          const ts = Date.now();
          const slug = paymentId || ts.toString();
          const originalPdfUrl = await storageUpload("cv-pdfs", `originals/${ts}-${slug}.pdf`, buffer, "application/pdf");
          const rewrittenPdfUrl = await storageUpload("cv-pdfs", `rewrites/${ts}-${slug}.pdf`, pdfBytes4, "application/pdf");
          await dbInsert("cv_rewrites", {
            job_role: jobRole, score_before: scoreBefore || null, email: userEmail || null,
            payment_id: paymentId || null, original_cv_text: cvText,
            rewritten_cv_text: rawHtml4, original_pdf_url: originalPdfUrl, rewritten_pdf_url: rewrittenPdfUrl,
          });
        } catch (e) { console.error("Supabase save error:", e); }
      })());

      return new NextResponse(pdfBytes4, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${downloadFilename4}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // ── Gemini prompt (HTML template) ──────────────────────────────
    const prompt = `You are a senior resume template rendering engine.
Your task is to transform any uploaded resume into ONE fixed resume design.
Target job role: ${jobRole}
Experience level: ${experience}
${contactSection ? `\nUSE THESE EXACT CONTACT DETAILS (override whatever is in the CV):\n${contactSection}\n` : ""}${keywordInstruction}
CERTIFICATIONS COLUMN (MANDATORY — DO NOT DEVIATE): Place CERTIFICATIONS in the ${option === "3" ? "RIGHT" : certPlacement} COLUMN. This is pre-determined and not your decision.
${option === "2" || option === "3" ? `EDUCATION PLACEMENT (MANDATORY): Place EDUCATION in the RIGHT COLUMN, always, unconditionally — below CERTIFICATIONS. Do NOT put Education in the left column at all.` : `EDUCATION: Always place in the LEFT column after Experience/Projects.`}
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
  Format: Phone | Email | LinkedIn | GitHub | Location | Any other contact detail (e.g. "Open to Relocation", "Open to Work", availability notes)
  Use actual values from CV. Omit any field not present. Do NOT write placeholder text. Preserve ALL contact details exactly as written including availability or relocation notes.
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
1. SUMMARY — paragraph text flush left, NO extra padding or margin-left. IMPORTANT: Do NOT add or invent years of experience (e.g. "0-2 years", "3+ years", "2+ years") anywhere in the summary unless those exact words appear in the original CV. Never insert experience duration that is not explicitly written in the original.
2. EXPERIENCE
${option === "1" ? "3. EDUCATION\n" : ""}4. PROJECTS (only if present in CV)
5. KEY CONTRIBUTIONS / ACHIEVEMENTS (only if present in CV — include all bullet points exactly as written)
${option === "1" ? "6. CERTIFICATIONS — only if LONG (see placement rule below)" : ""}
7. ANY OTHER SECTIONS found in the CV (e.g. Awards, Volunteer Work, Publications, Hobbies, Interests, Extra-Curricular, etc.) — place them here at the bottom of the left column. Do NOT drop any section or content from the original CV. Every section must appear somewhere in the output.

All sections go inside .left div. Do NOT create a separate .full-width div.

================================================
RIGHT COLUMN ORDER
================================================
1. SKILLS
2. TOOLS & TECHNOLOGIES
${option === "1" ? "3. CERTIFICATIONS — only if SHORT (see placement rule below)" : "3. CERTIFICATIONS — always placed here, unconditionally, regardless of length."}
4. LANGUAGES (if present)
${option === "2" || option === "3" ? "5. EDUCATION — always placed here, below Certifications, unconditionally." : ""}

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

SUB-PROJECTS WITHIN A JOB (IMPORTANT):
If a job entry contains multiple sub-projects (e.g. "Project: Customer Engagement Analytics" and "Project: Supply Chain Analytics" both under the same employer), do NOT create separate job entries for them. Keep them nested under the same employer block as sub-sections:
- Sub-project title: bold 10.5px #111, on its own line
- Sub-project date (if present): italic 10px #666, on the same line as title (right-aligned) or below it — preserve the EXACT date from the CV, do NOT drop it
- Sub-project tech stack: italic 10px #555
- Sub-project bullets: 10.5px, text-align: justify
Never split one employer into multiple job blocks just because it has multiple projects.

================================================
EDUCATION FORMAT
================================================
Wrap each entry in <div class="edu-block">:
- Degree — bold 11px #111. NEVER use h1/h2/h3/h4 for the degree name. Use ONLY <p style="font-weight:bold;font-size:11px;color:#111;margin:0"> or a <span style="font-weight:bold;font-size:11px;color:#111">. Using any heading tag (h1-h4) for degree is FORBIDDEN.
- Institution — 10.5px #2563EB
- Year — italic 10px #666
- CGPA/Percentage/Additional info — plain 10.5px #444, NOT bold, NOT a heading tag. Must use <p style="font-size:10.5px;color:#444;margin:0"> or a <span>. NEVER use h1/h2/h3/h4 for CGPA or any education detail.
Include all education entries.

================================================
PROJECTS FORMAT
================================================
Wrap each project in <div class="proj-block">:
- Line 1: Project Title — bold 11px #111, followed IMMEDIATELY on the same line by the GitHub/Live Demo link (if present). ALWAYS place the project link next to the title, NEVER on the tech stack line.
- Line 2: Tech Stack — italic 10px #555. No links on this line.
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
CERTIFICATIONS FORMAT (RIGHT COLUMN)
================================================
When certifications appear in the right column, render each as:
- Cert name: font-size 10px, font-weight: bold, color: #111, line-height: 1.4
- Issuer/platform: font-size: 9.5px, color: #555, font-weight: 400
- NEVER render cert names larger than 10px in the right column.
- Do NOT use h2, h3, h4, or any heading tag for cert names — use <p> or <div> with explicit font-size: 10px style.

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
- NEVER leave a large blank/empty gap at the bottom of page 1. If the left column finishes before the right column on page 1, immediately continue with the next section (e.g. PROJECTS) in the left column — do NOT jump it to page 2 leaving empty space. Content must flow continuously downward; blank space at the bottom of page 1 is never acceptable.

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
* Shorten summary to maximum 3 lines. Keep the summary close to the original wording — clean it up and tighten it, do NOT completely rewrite it with different facts or a different angle. Preserve the candidate's original voice and key claims. Do NOT add years of experience (e.g. "0-2 years", "3+ years") if not explicitly stated in the original CV — never invent or insert experience duration into the summary.
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
          generationConfig: { temperature: 0, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
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
      const link = `<a href="${url}" style="color:inherit;text-decoration:none;">${word}</a>`;
      // Only touch the contact div — replace word inside it, or append if missing
      return html.replace(
        /class="contact"([^>]*)([\s\S]*?)<\/div>/,
        (match, attrs, content) => {
          if (content.includes(word)) {
            // Strip any existing anchor around the word, then re-wrap
            const cleaned = content.replace(new RegExp(`<a[^>]*>${word}<\\/a>`, "g"), word);
            return `class="contact"${attrs}>${cleaned.replace(new RegExp(`\\b${word}\\b`), link)}</div>`;
          } else {
            // Word not present — append to contact line
            return `class="contact"${attrs}>${content.trimEnd()} | ${link}</div>`;
          }
        }
      );
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
        .full-width { width: 100% !important; max-width: 100% !important; flex: none !important; display: block !important; font-size: 10.5px !important; }
        .full-width .left { flex: none !important; width: 100% !important; max-width: 100% !important; }
        .full-width ul, .full-width ol { font-size: 10.5px !important; }
        .full-width ul li, .full-width ol li { font-size: 10.5px !important; }
        .full-width p, .full-width span, .full-width div { font-size: 10.5px !important; }
        .full-width h2, .full-width h3, .full-width h4 { font-size: 11px !important; letter-spacing: 0.5px !important; }
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
      executablePath: await chromium.executablePath(CHROMIUM_URL),
      headless: true,
    });

    const browserPage = await browser.newPage();
    // Set viewport to A4 width so getBoundingClientRect() matches print dimensions
    await browserPage.setViewport({ width: 794, height: 1122 });
    await browserPage.emulateMediaType("print");
    await browserPage.setContent(rawHtml, { waitUntil: "load" });

    // ── Option 3 only: force break-inside:auto on all .left elements via JS ──
    // CSS alone cannot reliably override Gemini's inline break-inside:avoid.
    // style.setProperty(..., 'important') creates inline !important which beats everything.
    if (option === "3") {
      await browserPage.evaluate(() => {
        const left = document.querySelector(".left");
        const body = document.querySelector(".body");
        if (!left || !body) return;
        // Allow the flex body container itself to break across pages
        (body as HTMLElement).style.setProperty("break-inside", "auto", "important");
        (body as HTMLElement).style.setProperty("page-break-inside", "auto", "important");
        // Allow every element inside .left to break across pages naturally
        left.querySelectorAll("*").forEach((el) => {
          (el as HTMLElement).style.setProperty("break-inside", "auto", "important");
          (el as HTMLElement).style.setProperty("page-break-inside", "auto", "important");
        });
      });
    }

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

      // Fix font sizes — elements lose .left CSS scoping when moved out
      fullSection.querySelectorAll("*").forEach((el) => {
        const tag = el.tagName.toLowerCase();
        const htmlEl = el as HTMLElement;
        if (tag === "h2" || tag === "h3" || tag === "h4") {
          htmlEl.style.setProperty("font-size", "11px", "important");
          htmlEl.style.setProperty("letter-spacing", "0.5px", "important");
        } else {
          htmlEl.style.setProperty("font-size", "10.5px", "important");
        }
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

    // ── No email sent in test route ────────────────────────────────

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
