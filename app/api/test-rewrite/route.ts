import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const maxDuration = 60;

// ── Palette ────────────────────────────────────────────────────────────────
const NAVY   = rgb(0.06, 0.18, 0.43);
const BLUE   = rgb(0.09, 0.37, 0.85);
const GOLD   = rgb(0.83, 0.69, 0.22);
const WHITE  = rgb(1, 1, 1);
const DARK   = rgb(0.10, 0.10, 0.10);
const MID    = rgb(0.30, 0.30, 0.30);
const LIGHT  = rgb(0.52, 0.52, 0.52);
const BGBLUE = rgb(0.93, 0.96, 1.00);   // same as production section header bg
const SIDEBG = rgb(0.09, 0.22, 0.48);   // slightly lighter navy for sidebar header rows

function san(t: string): string {
  return t
    .replace(/\*\*/g, "").replace(/\*/g, "")
    .replace(/[–—‒–—]/g, "-")
    .replace(/[''ʼ'']/g, "'").replace(/[""]/g, '"')
    .replace(/[•‣▪●▸►✓]/g, "")
    .replace(/…/g, "...").replace(/[^\x00-\xFF]/g, "").trim();
}

// ── Detect contact field type ──────────────────────────────────────────────
function contactType(s: string): "email" | "phone" | "linkedin" | "github" | "location" | "other" {
  const l = s.toLowerCase();
  if (s.includes("@"))               return "email";
  if (l.includes("linkedin"))        return "linkedin";
  if (l.includes("github"))          return "github";
  if (/^\+?[\d\s\-()]{7,}$/.test(s.trim())) return "phone";
  if (/\+\d|^[\d]{10}/.test(s.trim()))       return "phone";
  return "other";
}

// ── Icon drawing — tiny gold circle + 1-letter label ──────────────────────
function drawIcon(
  page: ReturnType<PDFDocument["addPage"]>,
  x: number, y: number,
  label: string,
  font: ReturnType<PDFDocument["embedFont"]> extends Promise<infer R> ? R : never,
) {
  page.drawCircle({ x: x + 5, y: y + 3, size: 5.5, color: GOLD });
  page.drawText(label, { x: x + 2, y: y + 0, font, size: 5.5, color: NAVY });
}

// ── Parse Gemini output ────────────────────────────────────────────────────
function parseCV(text: string) {
  const lines  = text.split("\n");
  const name   = san(lines.find(l => l.trim()) || "");
  // contact line: find line with @ or | or phone
  const contactLine = lines.find((l, i) => i > 0 && (l.includes("@") || l.includes("|") || /\+?\d[\d\s]{8,}/.test(l))) || "";
  const contactParts = san(contactLine).split("|").map(s => s.trim()).filter(Boolean);

  const KNOWN = [
    "SUMMARY","PROFESSIONAL SUMMARY","CAREER OBJECTIVE","OBJECTIVE","PROFILE",
    "EXPERIENCE","WORK EXPERIENCE","EMPLOYMENT","INTERNSHIP",
    "SKILLS","TECHNICAL SKILLS","CORE COMPETENCIES","KEY SKILLS","PERSONAL SKILLS",
    "EDUCATION","ACADEMIC",
    "PROJECTS","KEY PROJECTS",
    "CERTIFICATIONS","CERTIFICATION","ACHIEVEMENTS","AWARDS","LANGUAGES","VOLUNTEER",
  ];

  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const raw of lines) {
    const l  = raw.trim();
    if (!l || l === name || l === contactLine.trim()) continue;
    const up = l.toUpperCase().replace(/[^A-Z\s]/g, "").trim();
    const isHdr = KNOWN.some(k => up === k || up.startsWith(k)) && l.split(" ").length <= 5;
    if (isHdr) {
      if (current) sections.push(current);
      current = { title: l.toUpperCase(), lines: [] };
    } else if (current) {
      current.lines.push(l);
    }
  }
  if (current) sections.push(current);
  return { name, contactParts, sections };
}

// ── Two-column PDF ─────────────────────────────────────────────────────────
async function buildTwoColPDF(rewrittenText: string): Promise<Uint8Array> {
  const doc    = await PDFDocument.create();
  const reg    = await doc.embedFont(StandardFonts.Helvetica);
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const PW = 612, PH = 792;
  const SB   = 178;          // sidebar width
  const SX   = 14;           // sidebar text x
  const STW  = SB - SX - 10; // sidebar text max width
  const MX   = SB + 18;      // main column x
  const MW   = PW - MX - 16; // main column width
  const HDR  = 82;           // top header height
  const TY   = PH - HDR - 16;
  const BOT  = 34;

  const pages: ReturnType<typeof doc.addPage>[] = [];
  let lY = TY, rY = TY;

  // ── Page factory ──────────────────────────────────────────────────────────
  function addPage() {
    const p = doc.addPage([PW, PH]);
    pages.push(p);
    // Navy sidebar
    p.drawRectangle({ x: 0, y: 0, width: SB, height: PH, color: NAVY });
    // Gold rule between columns
    p.drawRectangle({ x: SB, y: 0, width: 1.5, height: PH, color: GOLD });
    return p;
  }
  function cur() { return pages[pages.length - 1]; }
  function needLeft(h: number)  { if (lY - h < BOT) { addPage(); lY = TY; rY = TY; } }
  function needRight(h: number) { if (rY - h < BOT) { addPage(); lY = TY; rY = TY; } }

  // ── Text helpers ──────────────────────────────────────────────────────────
  function wrapLeft(text: string, font: typeof reg, size: number, color: typeof WHITE, indent = 0, lh = 1.33) {
    const mw = STW - indent;
    let line = "";
    for (const w of san(text).split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > mw && line) {
        needLeft(size * lh); cur().drawText(line, { x: SX + indent, y: lY, font, size, color }); lY -= size * lh; line = w;
      } else line = test;
    }
    if (line) { needLeft(size * lh); cur().drawText(line, { x: SX + indent, y: lY, font, size, color }); lY -= size * lh; }
  }

  function wrapRight(text: string, font: typeof reg, size: number, color: typeof DARK, indent = 0, lh = 1.38) {
    const mw = MW - indent;
    let line = "";
    for (const w of san(text).split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > mw && line) {
        needRight(size * lh); cur().drawText(line, { x: MX + indent, y: rY, font, size, color }); rY -= size * lh; line = w;
      } else line = test;
    }
    if (line) { needRight(size * lh); cur().drawText(line, { x: MX + indent, y: rY, font, size, color }); rY -= size * lh; }
  }

  // ── Section headers ────────────────────────────────────────────────────────
  function leftSectionHdr(title: string) {
    lY -= 10;
    needLeft(20);
    cur().drawRectangle({ x: SX - 2, y: lY - 3, width: SB - SX + 2, height: 15, color: SIDEBG });
    cur().drawText(san(title), { x: SX + 2, y: lY, font: bold, size: 7.5, color: GOLD });
    lY -= 17;
    cur().drawRectangle({ x: SX, y: lY + 5, width: STW, height: 0.5, color: GOLD });
    lY -= 4;
  }

  function rightSectionHdr(title: string) {
    rY -= 12;
    needRight(24);
    // Same style as production: BGBLUE background bar
    cur().drawRectangle({ x: MX - 2, y: rY - 4, width: MW + 4, height: 18, color: BGBLUE });
    cur().drawText(san(title).toUpperCase(), { x: MX + 3, y: rY, font: bold, size: 9, color: BLUE });
    rY -= 22;
  }

  // ── Parse ──────────────────────────────────────────────────────────────────
  const { name, contactParts, sections } = parseCV(rewrittenText);

  // ── Build first page ───────────────────────────────────────────────────────
  addPage();

  // Header bar — full width, navy
  cur().drawRectangle({ x: 0, y: PH - HDR, width: PW, height: HDR, color: NAVY });
  cur().drawRectangle({ x: 0, y: PH - HDR - 2, width: PW, height: 2, color: GOLD });

  // Name
  const nameSz = name.length > 28 ? 20 : name.length > 22 ? 22 : 24;
  cur().drawText(san(name).toUpperCase(), { x: 16, y: PH - 36, font: bold, size: nameSz, color: WHITE });

  // Contact in header — one line, split if needed
  const contactFull = contactParts.join("  |  ");
  const contactY    = PH - 58;
  if (reg.widthOfTextAtSize(contactFull, 8) <= PW - 32) {
    cur().drawText(contactFull, { x: 16, y: contactY, font: reg, size: 8, color: rgb(0.80, 0.87, 1) });
  } else {
    const mid = Math.ceil(contactParts.length / 2);
    cur().drawText(contactParts.slice(0, mid).join("  |  "), { x: 16, y: contactY,     font: reg, size: 7.5, color: rgb(0.80, 0.87, 1) });
    cur().drawText(contactParts.slice(mid).join("  |  "),    { x: 16, y: contactY - 12, font: reg, size: 7.5, color: rgb(0.80, 0.87, 1) });
  }

  // scoremycv branding in header
  const brand = "ATS-Optimised by scoremycv.in";
  cur().drawText(brand, { x: PW - reg.widthOfTextAtSize(brand, 6.5) - 12, y: PH - 74, font: italic, size: 6.5, color: rgb(0.5, 0.6, 0.8) });

  lY = TY; rY = TY;

  // ── Sidebar: Contact with icons ────────────────────────────────────────────
  if (contactParts.length) {
    leftSectionHdr("CONTACT");
    for (const part of contactParts) {
      const type = contactType(part);
      const iconLabel =
        type === "email"    ? "@" :
        type === "phone"    ? "T" :
        type === "linkedin" ? "in" :
        type === "github"   ? "gh" : "i";

      needLeft(16);
      // Icon circle
      cur().drawCircle({ x: SX + 5, y: lY + 3, size: 5.5, color: GOLD });
      cur().drawText(iconLabel === "in" || iconLabel === "gh" ? iconLabel : iconLabel,
        { x: iconLabel.length === 2 ? SX + 1.5 : SX + 3, y: lY, font: bold, size: 5, color: NAVY });
      // Text — strip prefix labels like "LinkedIn:" "GitHub:"
      const display = san(part).replace(/^(LinkedIn|GitHub|linkedin|github)\s*:\s*/i, "");
      wrapLeft(display, reg, 7, WHITE, 14, 1.3);
      lY -= 2;
    }
  }

  // ── Sort sections ──────────────────────────────────────────────────────────
  const LEFT_KEYS  = ["SKILL","EDUCATION","ACADEMIC","CERTIF","LANGUAGE","PERSONAL SKILL","COMPETENC","AWARD","ACHIEVEMENT","VOLUNTEER"];
  const RIGHT_KEYS = ["SUMMARY","PROFESSIONAL SUMMARY","CAREER OBJECTIVE","OBJECTIVE","PROFILE","EXPERIENCE","WORK EXPERIENCE","EMPLOYMENT","PROJECT","INTERNSHIP"];

  const leftSections  = sections.filter(s => LEFT_KEYS.some(k  => s.title.includes(k)));
  const rightSections = sections.filter(s => RIGHT_KEYS.some(k => s.title.includes(k)));
  const otherSections = sections.filter(s =>
    !LEFT_KEYS.some(k  => s.title.includes(k)) &&
    !RIGHT_KEYS.some(k => s.title.includes(k))
  );

  // ── RIGHT COLUMN ───────────────────────────────────────────────────────────
  for (const sec of [...rightSections, ...otherSections]) {
    rightSectionHdr(sec.title);
    for (const raw of sec.lines) {
      const l = san(raw);
      if (!l) continue;
      const isBullet = /^[-*]/.test(l);
      const isSubHdr = !isBullet && l.length < 120 &&
        (l.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(l) || /^(dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov)/i.test(l));

      if (isSubHdr) {
        rY -= 4;
        wrapRight(l, bold, 9.5, DARK, 0, 1.45);
      } else if (isBullet) {
        const txt = l.replace(/^[-*]\s*/, "");
        needRight(12);
        // Blue bullet — same as production
        cur().drawText("\x95", { x: MX + 6, y: rY, font: bold, size: 9, color: BLUE });
        wrapRight(txt, reg, 9, MID, 18, 1.38);
      } else {
        wrapRight(l, reg, 9, DARK, 0, 1.38);
      }
    }
    // Thin divider line — same as production
    rY -= 4;
    needRight(6);
    cur().drawLine({ start: { x: MX, y: rY + 3 }, end: { x: PW - 16, y: rY + 3 }, thickness: 0.4, color: rgb(0.85, 0.85, 0.85) });
    rY -= 8;
  }

  // ── LEFT COLUMN: Skills, Education, Certs, etc. ───────────────────────────
  for (const sec of leftSections) {
    leftSectionHdr(sec.title);
    const isSkills = ["SKILL","COMPETENC"].some(k => sec.title.includes(k));
    const isList   = ["CERTIF","LANGUAGE","AWARD","ACHIEVEMENT"].some(k => sec.title.includes(k));

    for (const raw of sec.lines) {
      const l = san(raw);
      if (!l) continue;

      if (isSkills) {
        // "Category: skills" format
        const colonIdx = l.indexOf(":");
        if (colonIdx > 0 && colonIdx < 35) {
          lY -= 2;
          wrapLeft(l.slice(0, colonIdx).toUpperCase(), bold, 7, GOLD, 0, 1.2);
          const skills = l.slice(colonIdx + 1).trim();
          if (skills) wrapLeft(skills, reg, 7, WHITE, 4, 1.25);
          lY -= 1;
        } else {
          const cleanL = l.replace(/^[-*]\s*/, "");
          needLeft(10);
          cur().drawText("-", { x: SX, y: lY, font: bold, size: 7, color: GOLD });
          wrapLeft(cleanL, reg, 7, WHITE, 8, 1.25);
        }
      } else if (isList) {
        const cleanL = l.replace(/^[-*]\s*/, "");
        needLeft(10);
        cur().drawCircle({ x: SX + 4, y: lY + 3, size: 3, color: GOLD });
        wrapLeft(cleanL, reg, 7.5, WHITE, 10, 1.3);
      } else {
        // Education, etc
        const isBold = l.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(l);
        wrapLeft(l.replace(/^[-*]\s*/, ""), isBold ? bold : reg, 7.5, WHITE, 0, 1.3);
      }
    }
    lY -= 6;
  }

  // ── Footer on every page ───────────────────────────────────────────────────
  for (let i = 0; i < pages.length; i++) {
    pages[i].drawText(`Page ${i + 1} of ${pages.length}  |  scoremycv.in`, {
      x: MX, y: 16, font: italic, size: 6.5, color: LIGHT,
    });
  }

  return doc.save();
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const fd = await request.formData();
    const file       = fd.get("file")       as File | null;
    const jobRole    = (fd.get("jobRole")   as string) || "Software Engineer";
    const experience = (fd.get("experience")as string) || "0-2 years";
    const userEmail  = (fd.get("email")     as string) || "";
    const userPhone  = (fd.get("phone")     as string) || "";
    const userLinkedin = (fd.get("linkedin")as string) || "";
    const userGithub   = (fd.get("github")  as string) || "";

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

    if (!text || text.trim().length < 50)
      return NextResponse.json({ error: "Could not extract text. Make sure it is not a scanned image." }, { status: 422 });

    const cvText = text.trim().slice(0, 8000);

    const contactItems = [
      userEmail,
      userPhone,
      userLinkedin ? `LinkedIn: ${userLinkedin.replace(/^https?:\/\//, "")}` : "",
      userGithub   ? `GitHub: ${userGithub.replace(/^https?:\/\//, "")}`     : "",
    ].filter(Boolean);

    const contactBlock = contactItems.length
      ? `\nCONTACT LINE INSTRUCTION — CRITICAL:\nLine 2 of output must be EXACTLY these items separated by " | ":\n${contactItems.join(" | ")}\n`
      : "";

    const prompt = `You are an expert ATS resume writer. Rewrite the CV below for a "${jobRole}" role with ${experience} of experience.

STRICT RULES:
1. Never invent companies, degrees, dates, or roles not in the original.
2. Preserve every real fact — only improve wording and ATS keywords.
3. Every bullet must start with a strong action verb.
4. Add quantification where plausible from context only.
5. Omit any field that is missing — NEVER write "Not specified" or "N/A".
6. Preserve the ENTIRE contact line. Do not drop any item.
7. Include ALL sections present in the original CV.
8. Preserve academic scores, GPAs, percentages exactly.
9. If name has spaces between letters (e.g. "K U M A R"), fix it to "KUMAR".

SKILLS FORMAT — MANDATORY:
Group skills by category:
  Category Name: skill1, skill2, skill3
Do NOT use bullet points in skills. Use "Category: skills" lines only.

OUTPUT FORMAT (follow exactly):
[Full Name]
[email | phone | location | LinkedIn | GitHub — pipe separated]
SUMMARY
[2-3 sentences]
EXPERIENCE
[Job Title | Company | Month Year - Month Year]
- bullet point
SKILLS
Category: skill1, skill2
EDUCATION
[Degree | University | Year]
PROJECTS
[if present]
CERTIFICATIONS
[if present]
LANGUAGES
[if present]
ACHIEVEMENTS
[if present]

${contactBlock}
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
          generationConfig: { temperature: 0.25, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, err);
      return NextResponse.json({ error: "CV rewrite failed. Please try again." }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const parts      = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const rewritten  = parts.find((p: any) => !p.thought && p.text)?.text ?? parts[0]?.text ?? "";
    if (!rewritten) return NextResponse.json({ error: "AI returned empty response." }, { status: 500 });

    const clean = rewritten
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
      ).join("\n");

    const pdfBytes = await buildTwoColPDF(clean);
    const cvName   = (clean.split("\n").find((l: string) => l.trim()) || "CV")
      .trim().replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    const roleSlug = jobRole.split("/")[0].trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cvName}-${roleSlug}-v2.pdf"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    console.error("test-rewrite error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
