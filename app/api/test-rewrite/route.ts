import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const maxDuration = 60;

const NAVY   = rgb(0.06, 0.18, 0.43);
const BLUE   = rgb(0.09, 0.37, 0.85);
const WHITE  = rgb(1, 1, 1);
const DARK   = rgb(0.12, 0.12, 0.12);
const MID    = rgb(0.3, 0.3, 0.3);
const LIGHT  = rgb(0.55, 0.55, 0.55);
const GOLD   = rgb(0.83, 0.69, 0.22);

function san(t: string): string {
  return t
    .replace(/\*\*/g, "").replace(/\*/g, "")
    .replace(/[–—‒]/g, "-").replace(/[''ʼ]/g, "'")
    .replace(/[""]/g, '"').replace(/[•‣▪●]/g, "")
    .replace(/…/g, "...").replace(/[^\x00-\xFF]/g, "").trim();
}

// ── Parse Gemini output into sections ─────────────────────────────────────
function parseSections(text: string) {
  const lines  = text.split("\n");
  const name   = san(lines[0] || "");
  const contact= san(lines[1] || "");

  const KNOWN = ["SUMMARY","EXPERIENCE","SKILLS","EDUCATION","PROJECTS","CERTIFICATIONS","LANGUAGES","PERSONAL SKILLS","CORE COMPETENCIES"];
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (let i = 2; i < lines.length; i++) {
    const l = lines[i].trim();
    const up = l.toUpperCase();
    if (KNOWN.some(k => up === k || up.startsWith(k))) {
      if (current) sections.push(current);
      current = { title: l, lines: [] };
    } else if (current && l) {
      current.lines.push(l);
    }
  }
  if (current) sections.push(current);
  return { name, contact, sections };
}

// ── Two-column PDF builder ─────────────────────────────────────────────────
async function buildTwoColPDF(rewrittenText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const reg    = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PW = 612, PH = 792;
  const LEFT_W  = 185;   // sidebar width
  const RIGHT_W = 612 - LEFT_W - 40; // main content width
  const LEFT_X  = 14;
  const RIGHT_X = LEFT_W + 24;
  const TOP_Y   = PH - 110;
  const BOT_Y   = 36;

  const pages: ReturnType<typeof pdfDoc.addPage>[] = [];
  let lY = TOP_Y;  // left column cursor
  let rY = TOP_Y;  // right column cursor

  function newPage() {
    const p = pdfDoc.addPage([PW, PH]);
    pages.push(p);

    // Left sidebar background
    p.drawRectangle({ x: 0, y: 0, width: LEFT_W, height: PH, color: NAVY });

    // Vertical gold divider
    p.drawRectangle({ x: LEFT_W, y: 0, width: 2, height: PH, color: GOLD });

    return p;
  }

  function cur() { return pages[pages.length - 1]; }

  function ensureLeft(need: number) {
    if (lY - need < BOT_Y) {
      newPage();
      lY = TOP_Y;
      rY = TOP_Y;
    }
  }

  function ensureRight(need: number) {
    if (rY - need < BOT_Y) {
      newPage();
      lY = TOP_Y;
      rY = TOP_Y;
    }
  }

  function wrapLeft(text: string, font: typeof reg, size: number, color: ReturnType<typeof rgb>, indent = 0) {
    const maxW = LEFT_W - LEFT_X - 10 - indent;
    const words = san(text).split(" ").filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        ensureLeft(size * 1.4);
        cur().drawText(line, { x: LEFT_X + indent, y: lY, font, size, color });
        lY -= size * 1.4;
        line = w;
      } else { line = test; }
    }
    if (line) {
      ensureLeft(size * 1.4);
      cur().drawText(line, { x: LEFT_X + indent, y: lY, font, size, color });
      lY -= size * 1.4;
    }
  }

  function wrapRight(text: string, font: typeof reg, size: number, color: ReturnType<typeof rgb>, indent = 0, lh = 1.4) {
    const maxW = RIGHT_W - indent;
    const words = san(text).split(" ").filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        ensureRight(size * lh);
        cur().drawText(line, { x: RIGHT_X + indent, y: rY, font, size, color });
        rY -= size * lh;
        line = w;
      } else { line = test; }
    }
    if (line) {
      ensureRight(size * lh);
      cur().drawText(line, { x: RIGHT_X + indent, y: rY, font, size, color });
      rY -= size * lh;
    }
  }

  function leftSectionHeader(title: string) {
    lY -= 8;
    ensureLeft(22);
    cur().drawRectangle({ x: LEFT_X, y: lY - 2, width: LEFT_W - LEFT_X - 8, height: 16, color: rgb(1,1,1,0.12) });
    cur().drawText(san(title).toUpperCase(), { x: LEFT_X + 4, y: lY, font: bold, size: 8, color: GOLD });
    lY -= 18;
    cur().drawRectangle({ x: LEFT_X, y: lY + 4, width: LEFT_W - LEFT_X - 8, height: 0.5, color: GOLD });
    lY -= 4;
  }

  function rightSectionHeader(title: string) {
    rY -= 10;
    ensureRight(24);
    cur().drawText(san(title).toUpperCase(), { x: RIGHT_X, y: rY, font: bold, size: 9.5, color: NAVY });
    rY -= 4;
    cur().drawRectangle({ x: RIGHT_X, y: rY, width: RIGHT_W, height: 1.5, color: BLUE });
    rY -= 10;
  }

  // ── First page ─────────────────────────────────────────────────────────
  newPage();

  // ── Header banner ──────────────────────────────────────────────────────
  cur().drawRectangle({ x: 0, y: PH - 90, width: PW, height: 90, color: NAVY });
  cur().drawRectangle({ x: 0, y: PH - 93, width: PW, height: 3, color: GOLD });

  const { name, contact, sections } = parseSections(rewrittenText);

  // Name in header
  const nameSz = name.length > 24 ? 22 : 26;
  cur().drawText(san(name), { x: 18, y: PH - 42, font: bold, size: nameSz, color: WHITE });

  // Contact line in header
  const contactParts = contact.split("|").map(s => san(s.trim())).filter(Boolean);
  let cx = 18;
  for (let i = 0; i < contactParts.length; i++) {
    const part = contactParts[i];
    const w = reg.widthOfTextAtSize(part, 8);
    if (cx + w > PW - 18) break;
    cur().drawText(part, { x: cx, y: PH - 62, font: reg, size: 8, color: rgb(0.8, 0.85, 1) });
    cx += w;
    if (i < contactParts.length - 1) {
      cur().drawText("  |  ", { x: cx, y: PH - 62, font: reg, size: 8, color: GOLD });
      cx += reg.widthOfTextAtSize("  |  ", 8);
    }
  }

  // scoremycv watermark in header
  const wm = "scoremycv.in";
  cur().drawText(wm, {
    x: PW - reg.widthOfTextAtSize(wm, 7) - 12,
    y: PH - 82,
    font: italic, size: 7, color: rgb(0.5, 0.6, 0.8),
  });

  lY = TOP_Y;
  rY = TOP_Y;

  // ── Assign sections to columns ─────────────────────────────────────────
  const LEFT_SECTIONS  = ["SKILLS","EDUCATION","CERTIFICATIONS","LANGUAGES","PERSONAL SKILLS","CORE COMPETENCIES"];
  const RIGHT_SECTIONS = ["SUMMARY","EXPERIENCE","PROJECTS"];

  const leftSections  = sections.filter(s => LEFT_SECTIONS.some(k  => s.title.toUpperCase().includes(k)));
  const rightSections = sections.filter(s => RIGHT_SECTIONS.some(k => s.title.toUpperCase().includes(k)));
  // Any unrecognised section → right column
  const otherSections = sections.filter(s =>
    !LEFT_SECTIONS.some(k => s.title.toUpperCase().includes(k)) &&
    !RIGHT_SECTIONS.some(k => s.title.toUpperCase().includes(k))
  );

  // ── Right column ───────────────────────────────────────────────────────
  for (const sec of [...rightSections, ...otherSections]) {
    rightSectionHeader(sec.title);
    for (const line of sec.lines) {
      const l = san(line);
      if (!l) continue;
      const isBullet = /^[-•*]/.test(l);
      const isSubHdr = !isBullet && (l.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(l)) && l.length < 100;

      if (isSubHdr) {
        rY -= 4;
        wrapRight(l, bold, 9.5, DARK, 0, 1.4);
      } else if (isBullet) {
        const txt = l.replace(/^[-*•]\s*/, "");
        ensureRight(11);
        cur().drawText("•", { x: RIGHT_X + 6, y: rY, font: bold, size: 8.5, color: BLUE });
        wrapRight(txt, reg, 8.5, MID, 16, 1.35);
      } else {
        wrapRight(l, reg, 8.5, DARK, 0, 1.35);
      }
    }
    rY -= 6;
  }

  // ── Left column ────────────────────────────────────────────────────────
  for (const sec of leftSections) {
    leftSectionHeader(sec.title);
    const isSkills = sec.title.toUpperCase().includes("SKILL") || sec.title.toUpperCase().includes("COMPETENC");
    for (const line of sec.lines) {
      const l = san(line);
      if (!l) continue;
      if (isSkills) {
        // Each skill as a pill-style bullet
        const skills = l.split(/[,;]/).map(s => s.trim()).filter(Boolean);
        for (const sk of skills) {
          ensureLeft(14);
          cur().drawText("▸ ", { x: LEFT_X, y: lY, font: bold, size: 7.5, color: GOLD });
          wrapLeft(sk, reg, 7.5, WHITE, 10);
        }
      } else {
        wrapLeft(l, reg, 7.5, WHITE, 0);
      }
    }
    lY -= 8;
  }

  // ── Footer on all pages ────────────────────────────────────────────────
  for (let i = 0; i < pages.length; i++) {
    pages[i].drawText(`Page ${i + 1} of ${pages.length}  |  ATS-Optimised by scoremycv.in`, {
      x: RIGHT_X, y: 22, font: italic, size: 7, color: LIGHT,
    });
  }

  return pdfDoc.save();
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData   = await request.formData();
    const file       = formData.get("file")       as File | null;
    const jobRole    = (formData.get("jobRole")   as string) || "Software Engineer";
    const experience = (formData.get("experience")as string) || "0-2 years";
    const userEmail  = (formData.get("email")     as string) || "";
    const userPhone  = (formData.get("phone")     as string) || "";
    const userLinkedin = (formData.get("linkedin")as string) || "";
    const userGithub   = (formData.get("github")  as string) || "";

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
      return NextResponse.json({ error: "Could not extract text. Make sure it's not a scanned image." }, { status: 422 });
    }

    const cvText = text.trim().slice(0, 8000);

    const contactItems = [
      userEmail,
      userPhone,
      userLinkedin ? `LinkedIn: ${userLinkedin.replace(/^https?:\/\//, "")}` : "",
      userGithub   ? `GitHub: ${userGithub.replace(/^https?:\/\//, "")}`     : "",
    ].filter(Boolean);

    const contactOverrideBlock = contactItems.length
      ? `\nCONTACT LINE INSTRUCTION — CRITICAL:\nThe contact line (line 2 of your output) must contain EXACTLY these items separated by " | ":\n${contactItems.join(" | ")}\n`
      : "";

    const prompt = `You are an expert ATS resume writer. Rewrite the CV below for a "${jobRole}" role with ${experience} of experience.

RULES (strictly follow):
1. Never invent companies, degrees, dates, or roles that are not in the original CV.
2. Preserve every real fact — only improve wording, structure, and keywords.
3. Start every bullet with a strong action verb.
4. Add quantification where plausible from context (do not invent specific numbers).
5. Insert relevant ATS keywords naturally for ${jobRole}.
6. Keep it concise and professional.
7. If ANY field is unknown or missing — omit it entirely. NEVER write "Not specified", "N/A", or any placeholder.
8. Preserve the ENTIRE contact line — do not drop any item.
9. Include ALL sections present in the original.
10. Use the EXACT same section header names as the original CV.
11. Preserve ALL academic scores, percentages, GPAs exactly.
12. If the name has spaces between letters (e.g. "K U M A R"), write it normally (e.g. "KUMAR").

OUTPUT FORMAT:
[Full Name on line 1]
[email | phone | location | LinkedIn | GitHub — all on one line separated by |]
SUMMARY
[2-3 sentence professional summary]
EXPERIENCE
[Job Title | Company | Month Year - Month Year]
- bullet
SKILLS
[all technical skills, comma separated]
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
          generationConfig: { temperature: 0.25, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json({ error: "CV rewrite failed. Please try again." }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const rewritten = parts.find((p: any) => !p.thought && p.text)?.text ?? parts[0]?.text ?? "";

    if (!rewritten) return NextResponse.json({ error: "AI returned empty response." }, { status: 500 });

    const cleanRewritten = rewritten
      .split("\n")
      .map((line: string) => line
        .replace(/\|\s*Not specified\s*\|\s*Not specified\s*-\s*Not specified/gi, "")
        .replace(/\|\s*Not specified\s*-\s*Not specified/gi, "")
        .replace(/\|\s*Not specified/gi, "")
        .replace(/Not specified\s*\|/gi, "")
        .replace(/Not specified/gi, "")
        .replace(/\|\s*\|/g, "|").replace(/\|\s*$/g, "").replace(/^\s*\|\s*/g, "")
        .trimEnd()
      ).join("\n");

    const pdfBytes = await buildTwoColPDF(cleanRewritten);

    const cvNameRaw  = cleanRewritten.split("\n").find((l: string) => l.trim())?.trim() || "CV";
    const cvNameSlug = cvNameRaw.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    const roleSlug   = jobRole.split("/")[0].trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cvNameSlug}-${roleSlug}-CV-v2.pdf"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    console.error("test-rewrite error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
