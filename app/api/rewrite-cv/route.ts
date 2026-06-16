import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const maxDuration = 60;

// ── Colours ───────────────────────────────────────────────────────────
const BLUE    = rgb(0.09, 0.37, 0.85);
const DARK    = rgb(0.12, 0.12, 0.12);
const MID     = rgb(0.35, 0.35, 0.35);
const LIGHT   = rgb(0.55, 0.55, 0.55);
const WHITE   = rgb(1, 1, 1);
const BG_BLUE = rgb(0.93, 0.96, 1);
const LINE_C  = rgb(0.85, 0.85, 0.85);

// ── Sanitise text for StandardFonts (Latin-1 only) ───────────────────
function san(t: string): string {
  return t
    .replace(/[–—‒]/g, "-")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[•‣▪●]/g, "*")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "")
    .trim();
}

// ── PDF generator ─────────────────────────────────────────────────────
async function buildPDF(rewrittenText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const reg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const W = 612, H = 792, ML = 50, MR = 50;
  const CW = W - ML - MR;

  const pageList: ReturnType<typeof pdfDoc.addPage>[] = [];
  let pi = 0;
  let y  = 0;

  function cur() { return pageList[pi]; }

  function newPage() {
    pageList.push(pdfDoc.addPage([W, H]));
    pi = pageList.length - 1;
    y  = H - 50;
  }

  function ensure(need: number) {
    if (y - need < 50) newPage();
  }

  function wrapText(
    text: string,
    font: typeof reg,
    size: number,
    color: ReturnType<typeof rgb>,
    indent = 0,
    lh = 1.4
  ) {
    const maxW = CW - indent;
    const words = text.split(" ").filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        ensure(size * lh);
        cur().drawText(line, { x: ML + indent, y, font, size, color });
        y -= size * lh;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) {
      ensure(size * lh);
      cur().drawText(line, { x: ML + indent, y, font, size, color });
      y -= size * lh;
    }
  }

  function sectionHeader(title: string) {
    y -= 10;
    ensure(22);
    cur().drawRectangle({ x: ML, y: y - 3, width: CW, height: 18, color: BG_BLUE });
    cur().drawText(san(title).toUpperCase(), {
      x: ML + 5, y, font: bold, size: 9, color: BLUE,
    });
    y -= 20;
  }

  function divider() {
    ensure(8);
    cur().drawLine({
      start: { x: ML, y: y + 4 },
      end:   { x: W - MR, y: y + 4 },
      thickness: 0.4,
      color: LINE_C,
    });
    y -= 8;
  }

  // ── Parse the Gemini output ───────────────────────────────────────
  const rawLines  = rewrittenText.split("\n");
  let nameStr     = "";
  let contactStr  = "";

  const SECTION_RE = /^(CONTACT( INFORMATION| INFO)?|SUMMARY|PROFESSIONAL SUMMARY|CAREER OBJECTIVE|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|EDUCATION|ACADEMIC|PROJECTS?|CERTIFICATIONS?|ACHIEVEMENTS?|ACCOMPLISHMENTS?|LANGUAGES?|INTERESTS?|REFERENCES?|PROFILE|ABOUT)$/i;

  const sections: { header: string; lines: string[] }[] = [];
  let cur_section: { header: string; lines: string[] } | null = null;
  let headerParsed = false;

  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line) continue;

    // First non-section line = name
    if (!nameStr && !SECTION_RE.test(line)) {
      if (line.length < 70 && !line.includes("@") && !line.match(/^\d/) && !line.startsWith("-")) {
        nameStr = line;
        continue;
      }
    }

    // Second distinct line = contact (has @ or | or phone digits)
    if (nameStr && !contactStr && !SECTION_RE.test(line)) {
      if (line.includes("@") || line.includes("|") || /\+?\d[\d\s\-]{8,}/.test(line)) {
        contactStr = line;
        headerParsed = true;
        continue;
      }
      if (!headerParsed && line.length < 80) {
        contactStr = line;
        headerParsed = true;
        continue;
      }
    }

    if (SECTION_RE.test(line) && line.split(" ").length <= 4) {
      if (cur_section) sections.push(cur_section);
      cur_section = { header: line, lines: [] };
    } else {
      if (cur_section) cur_section.lines.push(line);
    }
  }
  if (cur_section) sections.push(cur_section);

  // ── Page 1 header bar ─────────────────────────────────────────────
  newPage();
  cur().drawRectangle({ x: 0, y: H - 88, width: W, height: 88, color: BLUE });

  const displayName = san(nameStr || "Candidate");
  const nameSize    = displayName.length > 28 ? 20 : 24;
  cur().drawText(displayName, { x: ML, y: H - 42, font: bold, size: nameSize, color: WHITE });

  if (contactStr) {
    cur().drawText(san(contactStr).slice(0, 90), { x: ML, y: H - 64, font: reg, size: 8.5, color: rgb(0.85, 0.9, 1) });
  }
  cur().drawText("ATS-Optimised Resume", { x: ML, y: H - 80, font: reg, size: 7.5, color: rgb(0.7, 0.8, 1) });

  y = H - 105;

  // ── Sections ──────────────────────────────────────────────────────
  for (const sec of sections) {
    if (!sec.lines.length) continue;

    sectionHeader(sec.header);

    for (const raw of sec.lines) {
      if (!raw.trim()) { y -= 3; continue; }
      const line = san(raw);
      if (!line) continue;

      const isBullet = /^[-*••]/.test(line);
      const isSubHdr =
        !isBullet &&
        (line.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(line)) &&
        line.length < 120;

      if (isSubHdr) {
        y -= 4;
        wrapText(line, bold, 9.5, DARK, 0, 1.45);
      } else if (isBullet) {
        const txt = line.replace(/^[-*••]\s*/, "");
        ensure(12);
        cur().drawText("•", { x: ML + 6, y, font: bold, size: 9, color: BLUE });
        wrapText(txt, reg, 9, MID, 18, 1.38);
      } else {
        wrapText(line, reg, 9, DARK, 0, 1.38);
      }
    }
    divider();
  }

  // Footer on each page
  for (let i = 0; i < pageList.length; i++) {
    pageList[i].drawText(`Page ${i + 1} of ${pageList.length}  |  scoremycv.in`, {
      x: ML, y: 26, font: reg, size: 7, color: LIGHT,
    });
  }

  return pdfDoc.save();
}

// ── Route handler ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData  = await request.formData();
    const file      = formData.get("file") as File | null;
    const jobRole   = (formData.get("jobRole")   as string) || "Software Engineer";
    const experience= (formData.get("experience")as string) || "0-2 years";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // ── Parse CV text ──────────────────────────────────────────────
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require("pdf-parse");
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

    const cvText = text.trim().slice(0, 4000);

    // ── Gemini prompt ──────────────────────────────────────────────
    const prompt = `You are an expert ATS resume writer. Rewrite the CV below for a "${jobRole}" role with ${experience} of experience.

RULES (strictly follow):
1. Never invent companies, degrees, dates, or roles that are not in the original CV.
2. Preserve every real fact — only improve wording, structure, and keywords.
3. Start every bullet with a strong action verb (e.g. Developed, Analysed, Implemented).
4. Add quantification where plausible from context (do not invent specific numbers).
5. Insert relevant ATS keywords naturally for ${jobRole}.
6. Keep it concise and professional.

OUTPUT FORMAT — use these exact section headers:
[Full Name on line 1]
[email | phone | LinkedIn on line 2]
SUMMARY
[2-3 sentence professional summary]
EXPERIENCE
[Job Title | Company Name | Month Year - Month Year]
- bullet
- bullet
SKILLS
[skill1, skill2, skill3 ...]
EDUCATION
[Degree | University | Year]
PROJECTS
[only if present in original]
CERTIFICATIONS
[only if present in original]

ORIGINAL CV:
${cvText}

REWRITTEN CV:`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.25, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "AI service unavailable. Please try again." }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rewritten  = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rewritten) {
      return NextResponse.json({ error: "AI returned empty response. Please try again." }, { status: 500 });
    }

    // ── Build PDF ──────────────────────────────────────────────────
    const pdfBytes = await buildPDF(rewritten);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rewritten-cv.pdf"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    console.error("rewrite-cv error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
