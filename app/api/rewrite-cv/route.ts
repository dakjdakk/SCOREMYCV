import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { Resend } from "resend";
import { dbInsert, storageUpload } from "@/lib/supabase";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

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
    const scoreBefore   = parseInt((formData.get("scoreBefore") as string) || "0", 10);
    const paymentId    = (formData.get("paymentId") as string) || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // ── Parse CV text ──────────────────────────────────────────────
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      text = (await pdfParse(buffer)).text;
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

    // ── Extract ALL URLs from PDF (annotation-based + binary fallback) ──
    let extractedLinkedin = "";
    let extractedGithub   = "";
    let allExtractedUrls: string[] = [];
    if (fileName.endsWith(".pdf")) {
      const rawUrlsFromBinary: string[] = [];
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
      } catch (_) {
        // Fallback: binary scan
        const pdfStr = buffer.toString("latin1");
        (pdfStr.match(/https?:\/\/[^\s)<>"\\]{8,}/gi) || []).forEach(u => rawUrlsFromBinary.push(u));
      }
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
            !u.includes("purl.org") &&
            !u.includes("linkedin.com") &&
            !/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)(\?.*)?$/i.test(u)
          )
      );
      allExtractedUrls = Array.from(urlSet);
    }

    // ── Bare domain scan: linkedin.com/in/... and github.com/... without https:// prefix ──
    const liBarMatch = text.match(/\blinkedin\.com\/in\/[A-Za-z0-9\-_%]+/i);
    if (liBarMatch && !extractedLinkedin) extractedLinkedin = "https://" + liBarMatch[0].replace(/[.,;)]+$/, "");
    const ghBarMatch = text.match(/\bgithub\.com\/[A-Za-z0-9\-_%]+(?:\/[A-Za-z0-9\-_%]+)*/i);
    if (ghBarMatch && !extractedGithub) extractedGithub = "https://" + ghBarMatch[0].replace(/[.,;)]+$/, "");

    // ── Also scan extracted plain text for URLs (catches PDF text-layer links) ──
    const textUrlMatches = text.match(/(?:https?:\/\/|www\.)[^\s,;|•(){}<>"'\\]{8,}/gi) || [];
    textUrlMatches.forEach(u => {
      u = u.replace(/[.,;)]+$/, "").trim();
      if (!u.startsWith("http")) u = "https://" + u;
      if (u.includes("linkedin.com/in/") && !extractedLinkedin) extractedLinkedin = u;
      else if (u.includes("github.com/") && !u.includes("/commit") && !extractedGithub) extractedGithub = u;
      else if (!u.includes("linkedin.com") && !u.includes("adobe") && !u.includes("w3.org") && !u.includes("purl.org") && u.length > 12 && !/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)(\?.*)?$/i.test(u)) {
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
    const linkedinUrl = normalizeUrl(userLinkedin || extractedLinkedin);
    const githubUrl    = normalizeUrl(userGithub    || extractedGithub);
    const portfolioUrl = normalizeUrl(userPortfolio);
    console.log("LinkedIn URL:", linkedinUrl, "| GitHub URL:", githubUrl, "| Portfolio:", portfolioUrl);

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

    const keywordInstruction = missingKeywords.length > 0
      ? `\nATS KEYWORD INJECTION (summary and skills ONLY — IMPORTANT):
The following keywords are missing from this CV for a ${jobRole} role.
Weave them naturally into the "summary" and "skills[].items" fields ONLY.
Do NOT change experience bullets or project bullets for keyword injection — leave them exactly as they are.
Do NOT invent experience. Only add where truthful and relevant.
Missing keywords: ${missingKeywords.slice(0, 15).join(", ")}\n`
      : "";

      // ── Build contact line server-side (before Gemini call) ──────────
      const emailMatch   = cvText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
      const phoneRaw     = cvText.match(/(\+?[\d][\d\s\-().]{7,}\d)/)?.[0]?.trim() || "";
      const phoneNorm = (() => {
        if (!phoneRaw) return "";
        const digits = phoneRaw.replace(/\D/g, "");
        if (phoneRaw.startsWith("+91")) return phoneRaw;
        if (digits.startsWith("91") && digits.length === 12) return `+91-${digits.slice(2)}`;
        if (digits.length === 10) return `+91-${digits}`;
        return phoneRaw;
      })();
      const headerLines = cvText.split("\n").slice(1, 10).join("\n");
      // Whitelist of real Indian cities — only these can be detected as location.
      // This is permanent: no tech keyword can ever false-match because it's not in this list.
      const INDIAN_CITIES = new Set([
        // Major metros & tier-1
        "Mumbai","Delhi","Bangalore","Bengaluru","Hyderabad","Ahmedabad","Chennai","Kolkata",
        "Surat","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal",
        "Visakhapatnam","Vizag","Pimpri","Patna","Vadodara","Ghaziabad","Ludhiana","Agra",
        "Nashik","Faridabad","Meerut","Rajkot","Varanasi","Srinagar","Aurangabad","Dhanbad",
        "Amritsar","Navi","Allahabad","Prayagraj","Ranchi","Howrah","Coimbatore","Jabalpur",
        "Gwalior","Vijayawada","Jodhpur","Madurai","Raipur","Kota","Guwahati","Chandigarh",
        "Solapur","Hubli","Dharwad","Bareilly","Moradabad","Mysore","Mysuru","Gurgaon","Gurugram",
        "Aligarh","Jalandhar","Tiruchirappalli","Trichy","Bhubaneswar","Salem","Mira","Bhiwandi",
        "Saharanpur","Guntur","Bikaner","Noida","Amravati","Jamshedpur","Bhilai","Cuttack",
        "Firozabad","Kochi","Cochin","Bhavnagar","Dehradun","Durgapur","Asansol","Nanded",
        "Kolhapur","Ajmer","Gulbarga","Kalaburagi","Jamnagar","Ujjain","Loni","Siliguri",
        "Jhansi","Ulhasnagar","Nellore","Jammu","Sangli","Belgaum","Belagavi","Mangalore",
        "Mangaluru","Ambattur","Tirunelveli","Malegaon","Gaya","Jalgaon","Udaipur","Maheshtala",
        "Tiruppur","Davanagere","Kozhikode","Calicut","Akola","Kurnool","Bokaro",
        "Warangal","Thrissur","Murwara","Katni","Bhagalpur","Agartala","Mathura",
        "Panipat","Rohtak","Bilaspur","Muzaffarpur","Patiala","Erode","Kharagpur",
        "Nizamabad","Tumkur","Tumakuru","Hisar","Gorakhpur","Bathinda","Rampur","Shivamogga",
        "Shimoga","Rourkela","Darbhanga","Kakinada","Rajahmundry","Bhimavaram","Ongole",
        "Chittoor","Nalgonda","Karimnagar","Khammam","Secunderabad","Tirupati","Anantapur",
        "Kadapa","Eluru","Hapur","Shimla","Gangtok","Imphal","Aizawl","Itanagar","Kohima",
        "Dispur","Shillong","Panaji","Portblair","Pondicherry","Puducherry","Silvassa",
        "Daman","Diu","Leh","Kavaratti",
        // Tamil Nadu tier-2
        "Vellore","Nagercoil","Thanjavur","Cuddalore","Dindigul","Karur","Namakkal",
        "Krishnagiri","Kanchipuram","Villupuram","Tiruvallur","Tiruvannamalai",
        // Karnataka tier-2
        "Ballari","Bidar","Raichur","Gadag","Mandya","Udupi","Vijayapura","Chitradurga","Chikmagalur",
        // Andhra Pradesh tier-2
        "Machilipatnam","Adoni","Proddatur","Hindupur","Srikakulam","Vizianagaram",
        // Telangana tier-2
        "Mahbubnagar","Adilabad","Medak",
        // Maharashtra tier-2
        "Latur","Parbhani","Chandrapur","Wardha","Jalna","Beed","Osmanabad","Yavatmal","Buldhana",
        // Gujarat tier-2
        "Mehsana","Morbi","Junagadh","Porbandar","Navsari","Gandhinagar","Bharuch","Surendranagar",
        // Rajasthan tier-2
        "Alwar","Bhilwara","Sikar","Barmer","Jaisalmer","Chittorgarh","Dungarpur","Tonk",
        // Uttar Pradesh tier-2
        "Muzaffarnagar","Shahjahanpur","Mirzapur","Azamgarh","Sultanpur","Lakhimpur",
        // Haryana tier-2
        "Karnal","Sonipat","Ambala","Yamunanagar","Sirsa","Bhiwani","Rewari","Palwal",
        // Punjab tier-2
        "Hoshiarpur","Moga","Ferozepur","Sangrur","Barnala","Muktsar",
        // Uttarakhand
        "Haridwar","Roorkee","Rishikesh","Haldwani","Rudrapur","Kashipur",
        // Jharkhand tier-2
        "Hazaribagh","Deoghar","Dumka","Giridih",
        // Chhattisgarh tier-2
        "Korba","Durg","Rajnandgaon",
        // Bihar tier-2
        "Purnia","Begusarai","Munger","Chapra","Samastipur","Katihar","Hajipur","Arrah",
        // Assam tier-2
        "Dibrugarh","Jorhat","Silchar","Tezpur","Tinsukia",
        // Odisha tier-2
        "Sambalpur","Balasore","Baripada","Berhampur","Brahmapur",
        // Goa
        "Vasco","Margao",
        // Work-mode entries (for "Remote, India" style)
        "Remote","Hybrid"
      ]);
      const locationMatch = (() => {
        // Match "Word Word, State" patterns in the header, but only accept if first word is a known city
        const m = headerLines.match(/\b([A-Z][a-z]{1,15}(?:\s[A-Z][a-z]{1,15})?,\s*(?:[A-Z]{2,3}|[A-Z][a-z]{1,15}(?:\s[A-Z][a-z]{1,15})?)(?:,\s*India)?)\b/g);
        if (!m) return null;
        const valid = m.find(loc => {
          const firstWord = loc.split(/[\s,]+/)[0];
          return INDIAN_CITIES.has(firstWord);
        });
        return valid ? [null, valid] : null;
      })();
      const relocateMatch = /open\s+to\s+relocat|willing\s+to\s+relocat|available\s+immediately/i.test(cvText);
      const headerText   = cvText.split("\n").slice(0, 10).join(" ");
      const mentionsLinkedin  = /linkedin/i.test(headerText);
      const mentionsGithub    = /github/i.test(headerText);
      const mentionsPortfolio = /portfolio/i.test(headerText);
      const imageExtRe = /\.(png|jpg|jpeg|gif|svg|webp|ico|bmp|tiff?)(\?.*)?$/i;
      const getDomainLabel = (u: string) => {
        try {
          const hostname = new URL(u).hostname.replace(/^www\./, "");
          const domain = hostname.split(".")[0];
          return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch { return u.replace(/https?:\/\//, "").split("/")[0]; }
      };
      const contactParts: string[] = [];
      if (locationMatch) contactParts.push(locationMatch[1].trim());
      if (phoneNorm)     contactParts.push(phoneNorm);
      if (emailMatch)    contactParts.push(`<a href="mailto:${emailMatch[0]}" style="color:inherit;text-decoration:none;">${emailMatch[0]}</a>`);
      if (linkedinUrl)         contactParts.push(`<a href="${linkedinUrl}" style="color:inherit;text-decoration:none;">LinkedIn</a>`);
      else if (mentionsLinkedin) contactParts.push("LinkedIn");
      if (githubUrl)           contactParts.push(`<a href="${githubUrl}" style="color:inherit;text-decoration:none;">GitHub</a>`);
      else if (mentionsGithub)   contactParts.push("GitHub");
      if (portfolioUrl)        contactParts.push(`<a href="${portfolioUrl}" style="color:inherit;text-decoration:none;">Portfolio</a>`);
      else if (mentionsPortfolio && !linkedinUrl && !githubUrl) contactParts.push("Portfolio");
      if (relocateMatch) contactParts.push("Open to Relocate");
      allExtractedUrls
        .filter(u => u !== portfolioUrl && !u.includes("linkedin.com") && !u.includes("github.com") && !u.includes("github.io") && !imageExtRe.test(u))
        .slice(0, 2)
        .forEach(u => contactParts.push(`<a href="${u}" style="color:inherit;text-decoration:none;">${getDomainLabel(u)}</a>`));
      console.log("[OPT] contactParts:", contactParts);

      // ── STEP 1: Ask Gemini for structured JSON only ───────────────
      const extractPrompt = `You are a CV data extractor. Extract the resume content below into valid JSON matching this exact schema. Output ONLY valid JSON — no markdown, no code fences, no explanation.

Rules:
- Extract ONLY what exists in the CV. Never invent or add information.
- "designation": Best title for a "${jobRole}" candidate (e.g. "Data Analyst & ML Engineer").
- "summary": Copy EXACTLY as written in the CV. Only fix grammar, punctuation, and action verbs — do NOT change the meaning, reorder sentences, or add/remove any facts.
- skills[].items: comma-separated string of skills for that category.
- SKILLS GROUPING: If the CV lists skills without sub-categories (e.g. a flat list under "Core Competencies", "Technical Skills", "Skills"), you MUST intelligently group them into standard categories. Use these category names where applicable: "Programming Languages", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "Machine Learning & AI", "Data & Visualization Tools", "Tools & Platforms". Only use categories that have at least one skill. Do NOT use vague names like "Core Competencies" or "Technical Skills" as category names.
- For bullets: extract actual content, lightly improve phrasing for ATS but never fabricate facts.
- "achievements": bullets from ANY section named "Coding Practices", "Achievements", "Awards", "Key Achievements". IMPORTANT: Strip any section-name prefix — if bullet says "Coding Practices: Solved 100+ problems..." just extract "Solved 100+ problems...". Never include the section name as a prefix inside the bullet text.
- "leadership": items from "Leadership", "Extracurricular", "Activities" sections.
- If a section does not exist in the CV, use null or empty array [].
- certifications[].issuer may be empty string if not mentioned.
- Do NOT extract personal details such as Date of Birth, DOB, Nationality, Religion, Gender, Marital Status, Languages Known, Father's Name, Mother's Name — skip these entirely.

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

${keywordInstruction}
CV:
${cvText}`;

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

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

      const callGemini = async (): Promise<{ ok: boolean; rawJson: string; status?: number }> => {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: extractPrompt }] }],
              generationConfig: {
                temperature: 0,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          },
        );
        if (!res.ok) return { ok: false, rawJson: "", status: res.status };
        const data = await res.json();
        const pts = data?.candidates?.[0]?.content?.parts ?? [];
        const text = pts.find((p: any) => !p.thought && p.text)?.text ?? pts[0]?.text ?? "";
        return { ok: true, rawJson: text };
      };

      const tryParseJson = (raw: string): any | null => {
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
        try { return JSON.parse(cleaned); } catch { /* fall through */ }
        try { return JSON.parse(extractBalancedJson(cleaned)); } catch { /* fall through */ }
        return null;
      };

      // Attempt 1
      let attempt = await callGemini();
      if (!attempt.ok) {
        const userMsg = attempt.status === 429
          ? "Our servers are busy right now. Please try again in a minute."
          : "CV rewrite failed. Please try again in a moment.";
        return NextResponse.json({ error: userMsg }, { status: 502 });
      }
      console.log("[OPT] rawJson first 300:", attempt.rawJson.slice(0, 300));

      let cvData: any = tryParseJson(attempt.rawJson);

      // Attempt 2 — retry once if parsing failed
      if (!cvData) {
        console.warn("[OPT] First attempt JSON parse failed, retrying...");
        attempt = await callGemini();
        if (attempt.ok) cvData = tryParseJson(attempt.rawJson);
      }

      if (!cvData) {
        console.error("[OPT] JSON parse failed after retry. Raw:", attempt.rawJson.slice(0, 500));
        return NextResponse.json({ error: "AI returned invalid data. Please try again." }, { status: 500 });
      }

      // Safety: ensure all expected fields exist and are correct types
      if (!cvData || typeof cvData !== "object") {
        return NextResponse.json({ error: "AI returned invalid data. Please try again." }, { status: 500 });
      }
      cvData.skills        = Array.isArray(cvData.skills)        ? cvData.skills        : [];
      cvData.experience    = Array.isArray(cvData.experience)    ? cvData.experience    : [];
      cvData.projects      = Array.isArray(cvData.projects)      ? cvData.projects      : [];
      cvData.education     = Array.isArray(cvData.education)     ? cvData.education     : [];
      // Drop 10th/12th entries if graduation is present
      const hasGraduation = cvData.education.some((e: any) => {
        const d = (e.degree || "").toLowerCase();
        return /bachelor|master|b\.?e|b\.?tech|b\.?sc|m\.?sc|m\.?tech|b\.?com|m\.?com|bca|mca|b\.?a|m\.?a|phd|degree/.test(d);
      });
      if (hasGraduation) {
        cvData.education = cvData.education.filter((e: any) => {
          const d = (e.degree || "").toLowerCase();
          return !/10th|sslc|secondar|matriculat|hslc|12th|higher secondary|hsc|intermediate|wbchse|wbbse|cbse class|class x|class xii/.test(d);
        });
      }
      cvData.certifications= Array.isArray(cvData.certifications)? cvData.certifications: [];
      cvData.achievements  = Array.isArray(cvData.achievements)
        ? cvData.achievements.map((a: string) => (typeof a === "string" ? a.replace(/^[A-Za-z][A-Za-z\s&]*:\s*/, "") : a))
        : [];
      cvData.leadership    = Array.isArray(cvData.leadership)    ? cvData.leadership    : [];

      // ── Normalize date casing: "DEC 202" → "Dec 202", "JUNE" → "June" etc.
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

      console.log("[OPT] cvData parsed. name:", cvData.name, "skills:", cvData.skills.length, "exp:", cvData.experience.length);

      // ── STEP 2: Build HTML entirely from JSON — server controls every element ──
      // Helper: escape HTML special chars
      const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      // Helper: wrap content in a section block (returns "" if content is empty)
      const sec = (title: string, content: string) =>
        content?.trim()
          ? `<div class="section"><div class="section-title">${title}</div><hr class="section-rule">${content}</div>`
          : "";

      // Profile Summary
      const summaryHtml = sec("Profile Summary",
        cvData.summary
          ? `<p style="font-size:10px;text-align:justify;margin-top:3px;">${esc(cvData.summary)}</p>`
          : ""
      );

      // Technical Skills
      const skillsInner = Array.isArray(cvData.skills) && cvData.skills.length
        ? `<div class="skills-block">${cvData.skills.map((s: any) =>
            `<p><strong>${esc(s.category)}:</strong> ${esc(s.items)}</p>`
          ).join("\n")}</div>`
        : "";
      const skillsHtml = sec("Technical Skills", skillsInner);

      // Experience
      const expInner = Array.isArray(cvData.experience) && cvData.experience.length
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
      const expHtml = sec("Experience", expInner);

      // Projects — no links (PDF gives us no reliable project URLs)
      const projInner = Array.isArray(cvData.projects) && cvData.projects.length
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
      const projHtml = sec("Projects", projInner);

      // Education
      const eduInner = Array.isArray(cvData.education) && cvData.education.length
        ? cvData.education.map((edu: any) => `
<div class="exp-block">
  <div class="row">
    <span class="row-left">${esc(edu.institution)}${edu.location ? " — " + esc(edu.location) : ""}</span>
    <span class="row-right">${esc(edu.dates)}</span>
  </div>
  <div class="role">${esc(edu.degree)}${edu.cgpa ? " &nbsp; CGPA: " + esc(edu.cgpa) : ""}</div>
</div>`).join("\n")
        : "";
      const eduHtml = sec("Education", eduInner);

      // Certifications
      const certInner = Array.isArray(cvData.certifications) && cvData.certifications.length
        ? `<ul class="cert-list">${cvData.certifications.map((c: any) =>
            `<li>${esc(c.name)}${c.issuer ? " — " + esc(c.issuer) : ""}</li>`
          ).join("\n")}</ul>`
        : "";
      const certHtml = sec("Certifications", certInner);

      // Achievements — rendered as clean bullets, no section-name prefix ever
      const achieveInner = Array.isArray(cvData.achievements) && cvData.achievements.length
        ? `<ul class="bullets" style="margin-top:3px;">${cvData.achievements.map((a: string) => `<li>${esc(a)}</li>`).join("\n")}</ul>`
        : "";
      const achieveHtml = sec("Achievements", achieveInner);

      // Leadership — always rendered as bullet list (not plain paragraphs)
      const leaderInner = Array.isArray(cvData.leadership) && cvData.leadership.length
        ? `<ul class="bullets" style="margin-top:3px;">${cvData.leadership.map((l: any) =>
            `<li><strong>${esc(l.role)}:</strong> ${esc(l.description)}</li>`
          ).join("\n")}</ul>`
        : "";
      const leaderHtml = sec("Leadership & Activities", leaderInner);

      // Candidate name and designation (from JSON, fallback to CV text scan)
      const candidateName = esc(
        cvData.name ||
        cvText.split("\n").map((l: string) => l.trim()).find((l: string) => l.length > 1 && l.length < 60 && /^[A-Za-z]/.test(l)) ||
        "Candidate"
      );
      const designation = esc(jobRole);

      // Assemble final HTML — server owns every byte of this
      const rawHtml = `<!DOCTYPE html>
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
.section-title { font-size: 13.5px; font-weight: bold; color: #000; margin-bottom: 1px; page-break-after: avoid; break-after: avoid; }
.section-rule { border: none; border-top: 1.2px solid #000; margin: 0 0 5px 0; page-break-after: avoid; break-after: avoid; }
.exp-block { margin-bottom: 5px; }
.row { display: flex; justify-content: space-between; align-items: baseline; page-break-after: avoid; break-after: avoid; }
.row-left { font-weight: bold; font-size: 11px; }
.row-right { font-size: 10.5px; font-style: italic; white-space: nowrap; }
.role { font-style: italic; font-size: 10.5px; margin: 1px 0 3px 0; page-break-after: avoid; break-after: avoid; }
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
<div class="name">${candidateName}</div>
<div class="designation">${designation}</div>
<div class="contact">${contactParts.join(" &nbsp;|&nbsp; ")}</div>
${summaryHtml}
${skillsHtml}
${expHtml}
${projHtml}
${eduHtml}
${certHtml}
${achieveHtml}
${leaderHtml}
</div>
</body>
</html>`;


    // ── STEP 3: Puppeteer → PDF ──────────────────────────────────────────
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(CHROMIUM_URL),
      headless: true,
    });
    const browserPage = await browser.newPage();
    await browserPage.setViewport({ width: 794, height: 1122 });
    await browserPage.emulateMediaType("print");
    await browserPage.setContent(rawHtml, { waitUntil: "load" });
    const pdfBuffer = await browserPage.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: "40px", bottom: "40px", left: "32px", right: "32px" },
    });
    await browser.close();

    // ── Build download filename ────────────────────────────────────
    const cvNameRaw  = (cvData.name || "").replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-") || "CV";
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
