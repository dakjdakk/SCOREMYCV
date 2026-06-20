import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const maxDuration = 60;

const NAVY  = rgb(0.06, 0.18, 0.43);
const GOLD  = rgb(0.83, 0.69, 0.22);
const WHITE = rgb(1, 1, 1);
const DARK  = rgb(0.10, 0.10, 0.10);
const MID   = rgb(0.28, 0.28, 0.28);
const LIGHT = rgb(0.50, 0.50, 0.50);
const BLUE  = rgb(0.09, 0.37, 0.85);
const SIDEBAR_HL = rgb(0.10, 0.25, 0.52); // slightly lighter navy for section headers

function san(t: string): string {
  return t
    .replace(/\*\*/g, "").replace(/\*/g, "")
    .replace(/[–—–—]/g, "-")
    .replace(/[''ʼ‘’]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[•‣▪●▸►]/g, "")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "")
    .trim();
}

// ── Parse Gemini output into sections ──────────────────────────────────────
function parseSections(text: string) {
  const lines = text.split("\n");
  const name    = san(lines[0] || "");
  const contact = san(lines[1] || "");

  const KNOWN = [
    "SUMMARY","EXPERIENCE","SKILLS","EDUCATION","PROJECTS",
    "CERTIFICATIONS","LANGUAGES","PERSONAL SKILLS","CORE COMPETENCIES",
    "ACHIEVEMENTS","AWARDS","VOLUNTEER","INTERNSHIP",
  ];
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (let i = 2; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    const up = l.toUpperCase().replace(/[^A-Z\s]/g, "").trim();
    const isHeader = KNOWN.some(k => up === k || up.startsWith(k));
    if (isHeader) {
      if (current) sections.push(current);
      current = { title: l.toUpperCase(), lines: [] };
    } else if (current) {
      current.lines.push(l);
    }
  }
  if (current) sections.push(current);
  return { name, contact, sections };
}

// ── Two-column PDF builder ──────────────────────────────────────────────────
async function buildTwoColPDF(rewrittenText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const reg    = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PW = 612, PH = 792;
  const HEADER_H  = 80;             // top header height
  const SB_W      = 182;            // sidebar width
  const SB_X      = 12;             // sidebar text left margin
  const SB_TEXT_W = SB_W - SB_X - 10; // usable text width in sidebar
  const MAIN_X    = SB_W + 20;      // main column start
  const MAIN_W    = PW - MAIN_X - 18; // main column text width
  const TOP_Y     = PH - HEADER_H - 18; // content start Y
  const BOT_Y     = 32;

  const pages: ReturnType<typeof pdfDoc.addPage>[] = [];
  let lY = TOP_Y;
  let rY = TOP_Y;

  function addPage() {
    const p = pdfDoc.addPage([PW, PH]);
    pages.push(p);
    // Full-height navy sidebar
    p.drawRectangle({ x: 0, y: 0, width: SB_W, height: PH, color: NAVY });
    // Gold vertical rule
    p.drawRectangle({ x: SB_W, y: 0, width: 1.5, height: PH, color: GOLD });
    return p;
  }

  function cur() { return pages[pages.length - 1]; }

  // ── Text helpers ───────────────────────────────────────────────────────────

  /** Wrap text into the LEFT (sidebar) column */
  function drawLeft(
    text: string,
    font: typeof reg,
    size: number,
    color: typeof WHITE,
    indent = 0,
    lineH = 1.35,
  ) {
    const maxW  = SB_TEXT_W - indent;
    const words = san(text).split(/\s+/).filter(Boolean);
    let line    = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        if (lY - size < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
        cur().drawText(line, { x: SB_X + indent, y: lY, font, size, color });
        lY -= size * lineH;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) {
      if (lY - size < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
      cur().drawText(line, { x: SB_X + indent, y: lY, font, size, color });
      lY -= size * lineH;
    }
  }

  /** Wrap text into the RIGHT (main) column */
  function drawRight(
    text: string,
    font: typeof reg,
    size: number,
    color: typeof DARK,
    indent = 0,
    lineH = 1.35,
  ) {
    const maxW  = MAIN_W - indent;
    const words = san(text).split(/\s+/).filter(Boolean);
    let line    = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        if (rY - size < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
        cur().drawText(line, { x: MAIN_X + indent, y: rY, font, size, color });
        rY -= size * lineH;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) {
      if (rY - size < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
      cur().drawText(line, { x: MAIN_X + indent, y: rY, font, size, color });
      rY -= size * lineH;
    }
  }

  // ── Section headers ────────────────────────────────────────────────────────

  function leftHeader(title: string) {
    lY -= 10;
    if (lY - 20 < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
    // Background bar
    cur().drawRectangle({ x: SB_X - 2, y: lY - 3, width: SB_W - SB_X + 2, height: 15, color: SIDEBAR_HL });
    cur().drawText(san(title), { x: SB_X + 2, y: lY, font: bold, size: 7.5, color: GOLD });
    lY -= 18;
    // Underline
    cur().drawRectangle({ x: SB_X, y: lY + 5, width: SB_W - SB_X - 8, height: 0.5, color: GOLD });
    lY -= 4;
  }

  function rightHeader(title: string) {
    rY -= 12;
    if (rY - 20 < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
    cur().drawText(san(title), { x: MAIN_X, y: rY, font: bold, size: 9.5, color: NAVY });
    rY -= 4;
    cur().drawRectangle({ x: MAIN_X, y: rY, width: MAIN_W, height: 1.5, color: BLUE });
    rY -= 10;
  }

  // ── Skills section renderer ────────────────────────────────────────────────
  // Handles lines like "Category: skill1, skill2, skill3"

  function renderSidebarSkills(lines: string[]) {
    for (const rawLine of lines) {
      const l = san(rawLine);
      if (!l) continue;

      const colonIdx = l.indexOf(":");
      if (colonIdx > 0 && colonIdx < 30) {
        // "Category: skills" format
        const cat    = l.slice(0, colonIdx).trim();
        const skills = l.slice(colonIdx + 1).trim();

        lY -= 2;
        if (lY - 9 < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
        // Category label in gold bold
        drawLeft(cat.toUpperCase(), bold, 7, GOLD, 0, 1.2);
        // Skills as wrapped text
        if (skills) drawLeft(skills, reg, 7, WHITE, 4, 1.25);
        lY -= 2;
      } else {
        // Plain skill — show as bullet
        const isBullet = /^[-*]/.test(l);
        const txt = isBullet ? l.replace(/^[-*]\s*/, "") : l;
        if (lY - 9 < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
        cur().drawText("-", { x: SB_X, y: lY, font: bold, size: 7, color: GOLD });
        drawLeft(txt, reg, 7, WHITE, 8, 1.25);
      }
    }
  }

  // ── Build first page ───────────────────────────────────────────────────────
  addPage();

  // Header banner (spans full width, on top of sidebar)
  cur().drawRectangle({ x: 0, y: PH - HEADER_H, width: PW, height: HEADER_H, color: NAVY });
  cur().drawRectangle({ x: 0, y: PH - HEADER_H - 2, width: PW, height: 2, color: GOLD });

  const { name, contact, sections } = parseSections(rewrittenText);

  // Name
  const nameSz   = name.length > 26 ? 20 : name.length > 20 ? 22 : 24;
  const nameClean = san(name).toUpperCase();
  cur().drawText(nameClean, { x: 16, y: PH - 36, font: bold, size: nameSz, color: WHITE });

  // Contact line — split on "|" and lay out
  const contactParts = san(contact).split("|").map(s => s.trim()).filter(Boolean);
  let cx = 16;
  const contactY = PH - 56;
  for (let i = 0; i < contactParts.length; i++) {
    const part = contactParts[i];
    const pw   = reg.widthOfTextAtSize(part, 7.5);
    if (cx + pw > PW - 16) break;
    cur().drawText(part, { x: cx, y: contactY, font: reg, size: 7.5, color: rgb(0.78, 0.85, 1) });
    cx += pw;
    if (i < contactParts.length - 1) {
      const sep = "  |  ";
      cur().drawText(sep, { x: cx, y: contactY, font: reg, size: 7.5, color: GOLD });
      cx += reg.widthOfTextAtSize(sep, 7.5);
    }
  }

  // Tagline / scoremycv branding
  const tag = "ATS-Optimised by scoremycv.in";
  cur().drawText(tag, {
    x: PW - reg.widthOfTextAtSize(tag, 6.5) - 14,
    y: PH - 72,
    font: italic, size: 6.5, color: rgb(0.5, 0.6, 0.8),
  });

  lY = TOP_Y;
  rY = TOP_Y;

  // ── Sort sections into columns ─────────────────────────────────────────────
  const LEFT_KEYS  = ["SKILL","EDUCATION","CERTIFICATION","LANGUAGE","PERSONAL","COMPETENC","AWARD","ACHIEVEMENT"];
  const RIGHT_KEYS = ["SUMMARY","EXPERIENCE","PROJECT","INTERNSHIP","VOLUNTEER"];

  const leftSections  = sections.filter(s => LEFT_KEYS.some(k  => s.title.includes(k)));
  const rightSections = sections.filter(s => RIGHT_KEYS.some(k => s.title.includes(k)));
  const otherSections = sections.filter(s =>
    !LEFT_KEYS.some(k  => s.title.includes(k)) &&
    !RIGHT_KEYS.some(k => s.title.includes(k))
  );

  // ── Render RIGHT column ────────────────────────────────────────────────────
  for (const sec of [...rightSections, ...otherSections]) {
    rightHeader(sec.title);
    for (const rawLine of sec.lines) {
      const l = san(rawLine);
      if (!l) continue;

      const isBullet  = /^[-*]/.test(l);
      // Sub-header: has "|" or year range, and short enough to be a job/project title
      const isSubHdr  = !isBullet && l.length < 110 &&
        (l.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(l));

      if (isSubHdr) {
        rY -= 5;
        drawRight(l, bold, 9, DARK, 0, 1.35);
      } else if (isBullet) {
        const txt = l.replace(/^[-*]\s*/, "");
        if (rY - 10 < BOT_Y) { addPage(); lY = TOP_Y; rY = TOP_Y; }
        cur().drawText("*", { x: MAIN_X + 4, y: rY, font: bold, size: 8, color: BLUE });
        drawRight(txt, reg, 8.5, MID, 16, 1.32);
      } else {
        drawRight(l, reg, 8.5, DARK, 0, 1.35);
      }
    }
    rY -= 5;
  }

  // ── Render LEFT column ─────────────────────────────────────────────────────
  for (const sec of leftSections) {
    leftHeader(sec.title);
    const isSkills = LEFT_KEYS.slice(0, 3).some(k => sec.title.includes(k));
    if (isSkills) {
      renderSidebarSkills(sec.lines);
    } else {
      for (const rawLine of sec.lines) {
        const l = san(rawLine);
        if (!l) continue;
        drawLeft(l, reg, 7.5, WHITE, 0, 1.32);
      }
    }
    lY -= 6;
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];
    pg.drawText(`Page ${i + 1} of ${pages.length}  |  scoremycv.in`, {
      x: MAIN_X, y: 16, font: italic, size: 6.5, color: LIGHT,
    });
  }

  return pdfDoc.save();
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData   = await request.formData();
    const file       = formData.get("file")        as File | null;
    const jobRole    = (formData.get("jobRole")    as string) || "Software Engineer";
    const experience = (formData.get("experience") as string) || "0-2 years";
    const userEmail  = (formData.get("email")      as string) || "";
    const userPhone  = (formData.get("phone")      as string) || "";
    const userLinkedin = (formData.get("linkedin") as string) || "";
    const userGithub   = (formData.get("github")   as string) || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

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
      return NextResponse.json({ error: "Could not extract text. Make sure it is not a scanned image." }, { status: 422 });
    }

    const cvText = text.trim().slice(0, 8000);

    const contactItems = [
      userEmail,
      userPhone,
      userLinkedin ? `LinkedIn: ${userLinkedin.replace(/^https?:\/\//, "")}` : "",
      userGithub   ? `GitHub: ${userGithub.replace(/^https?:\/\//, "")}`     : "",
    ].filter(Boolean);

    const contactOverrideBlock = contactItems.length
      ? `\nCONTACT LINE INSTRUCTION — CRITICAL:\nThe contact line (line 2) must contain EXACTLY these items separated by " | ":\n${contactItems.join(" | ")}\n`
      : "";

    const prompt = `You are an expert ATS resume writer. Rewrite the CV below for a "${jobRole}" role with ${experience} of experience.

RULES:
1. Never invent companies, degrees, dates, or roles not in the original.
2. Preserve every real fact — only improve wording, structure, and ATS keywords.
3. Start every bullet with a strong action verb.
4. Add quantification where plausible from context.
5. Insert relevant ATS keywords naturally for ${jobRole}.
6. If ANY field is unknown — omit it entirely. NEVER write "Not specified" or "N/A".
7. Preserve the ENTIRE contact line — do not drop any item.
8. Include ALL sections present in the original.
9. Preserve ALL academic scores, percentages, GPAs exactly.
10. If the name has spaces between letters (e.g. "K U M A R"), write it normally (e.g. "KUMAR").

SKILLS FORMAT INSTRUCTION — IMPORTANT:
In the SKILLS section, group skills by category using this exact format:
Category Name: skill1, skill2, skill3
Example:
Programming: Python, SQL, R
Visualisation: Power BI, Tableau, Excel
Do NOT use bullet points in skills. Use the "Category: skills" format ONLY.

OUTPUT FORMAT:
[Full Name on line 1]
[email | phone | location | LinkedIn | GitHub — all on one line separated by |]
SUMMARY
[2-3 sentence professional summary]
EXPERIENCE
[Job Title | Company | Month Year - Month Year]
- bullet
SKILLS
Category: skill1, skill2
EDUCATION
[Degree | University | Year]
PROJECTS
[only if present]
CERTIFICATIONS
[only if present]
LANGUAGES
[only if present]
PERSONAL SKILLS
[only if present]

${contactOverrideBlock}
ORIGINAL CV:
${cvText}

REWRITTEN CV:`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);
      return NextResponse.json({ error: "CV rewrite failed. Please try again." }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const parts      = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const rewritten  = parts.find((p: any) => !p.thought && p.text)?.text ?? parts[0]?.text ?? "";

    if (!rewritten) return NextResponse.json({ error: "AI returned empty response." }, { status: 500 });

    const cleanRewritten = rewritten
      .split("\n")
      .map((line: string) =>
        line
          .replace(/\|\s*Not specified\s*\|\s*Not specified\s*-\s*Not specified/gi, "")
          .replace(/\|\s*Not specified\s*-\s*Not specified/gi, "")
          .replace(/\|\s*Not specified/gi, "")
          .replace(/Not specified\s*\|/gi, "")
          .replace(/Not specified/gi, "")
          .replace(/\|\s*\|/g, "|").replace(/\|\s*$/g, "").replace(/^\s*\|\s*/g, "")
          .trimEnd()
      )
      .join("\n");

    const pdfBytes   = await buildTwoColPDF(cleanRewritten);
    const cvName     = (cleanRewritten.split("\n").find((l: string) => l.trim()) || "CV")
      .trim().replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    const roleSlug   = jobRole.split("/")[0].trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cvName}-${roleSlug}-CV-v2.pdf"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    console.error("test-rewrite error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
