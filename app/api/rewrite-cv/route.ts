import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Resend } from "resend";

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
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[–—‒]/g, "-")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[•‣▪●]/g, "")
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
    ensure(52); // header (22) + at least one content line (30) — prevents orphan headers
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

  const SECTION_RE = /^(CONTACT( INFORMATION| INFO)?|SUMMARY|PROFESSIONAL SUMMARY|CAREER OBJECTIVE|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|INTERNSHIP.*|SKILLS|TECHNICAL SKILLS|KEY SKILLS|CORE COMPETENCIES|PERSONAL SKILLS|SOFT SKILLS|EDUCATION|ACADEMIC|KEY PROJECTS?|PROJECTS?|CERTIFICATIONS?|ACHIEVEMENTS?|ACCOMPLISHMENTS?|LANGUAGES?|INTERESTS?|REFERENCES?|PROFILE|ABOUT|LEADERSHIP.*|EXTRACURRICULAR.*|AWARDS?|VOLUNTEER.*|ACTIVITIES|HOBBIES?)$/i;

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

  const contactSan = contactStr ? san(contactStr) : "";
  const contactParts = contactSan ? contactSan.split(" | ") : [];
  // Check if full contact fits on one line
  const contactNeedsWrap = contactSan && reg.widthOfTextAtSize(contactSan, 8.5) > CW;
  const headerH = contactNeedsWrap ? 102 : 88;

  cur().drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: BLUE });

  const displayName = san(nameStr || "Candidate");
  const nameSize    = displayName.length > 28 ? 20 : 24;
  cur().drawText(displayName, { x: ML, y: H - (contactNeedsWrap ? 38 : 42), font: bold, size: nameSize, color: WHITE });

  if (contactSan) {
    const contactColor = rgb(0.85, 0.9, 1);
    if (!contactNeedsWrap) {
      cur().drawText(contactSan, { x: ML, y: H - 64, font: reg, size: 8.5, color: contactColor });
    } else {
      // Split roughly in half at a "|" boundary
      const mid = Math.ceil(contactParts.length / 2);
      const line1 = contactParts.slice(0, mid).join(" | ");
      const line2 = contactParts.slice(mid).join(" | ");
      cur().drawText(line1, { x: ML, y: H - 62, font: reg, size: 8, color: contactColor });
      if (line2) cur().drawText(line2, { x: ML, y: H - 76, font: reg, size: 8, color: contactColor });
    }
  }

  y = H - headerH - 14;

  // ── Sections ──────────────────────────────────────────────────────
  for (const sec of sections) {
    if (!sec.lines.length) continue;

    sectionHeader(sec.header);
    const isEduSection     = /EDUCATION|ACADEMIC/i.test(sec.header);
    const isProjectSection = /KEY PROJECTS?|PROJECTS?/i.test(sec.header);

    for (const raw of sec.lines) {
      const rawTrimmed = raw.trim();
      if (!rawTrimmed) { y -= 3; continue; }
      const isBullet = /^[-*•‣▪●]/.test(rawTrimmed);
      const line = san(rawTrimmed);
      if (!line) continue;

      // Bold sub-headers: job/project titles, consistently across all project-type sections
      const isSubHdr =
        !isBullet &&
        !isEduSection &&
        (isProjectSection || line.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(line)) &&
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
    const userEmail = (formData.get("email")     as string) || "";
    const userPhone = (formData.get("phone")     as string) || "";
    const userLinkedin = (formData.get("linkedin") as string) || "";
    const userGithub   = (formData.get("github")   as string) || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // ── Parse CV text ──────────────────────────────────────────────
    const buffer   = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      // Use lib path to bypass pdf-parse's test runner (avoids ENOENT on ./test/data/)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
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

    // ── Build contact override block ───────────────────────────────
    const contactItems = [
      userEmail,
      userPhone,
      userLinkedin ? `LinkedIn: ${userLinkedin.replace(/^https?:\/\//, "")}` : "",
      userGithub   ? `GitHub: ${userGithub.replace(/^https?:\/\//, "")}`     : "",
    ].filter(Boolean);
    const contactOverrideBlock = contactItems.length
      ? `\nCONTACT LINE INSTRUCTION — CRITICAL:\nSingle-word labels in the original CV like "LinkedIn", "GITHUB", "Contact", "Gmail", "Portfolio" are hyperlink placeholders — NOT real values. Ignore them completely.\nThe contact line (line 2 of your output) must contain EXACTLY these items separated by " | ":\n${contactItems.join(" | ")}\nYou may also append the city/location from the original CV if it appears as real text.\nDo NOT include "LinkedIn", "GITHUB", "Portfolio", "Contact", or "Gmail" as standalone labels — only real URLs or real values.\n`
      : "";

    // ── Gemini prompt ──────────────────────────────────────────────
    const prompt = `You are an expert ATS resume writer. Rewrite the CV below for a "${jobRole}" role with ${experience} of experience.

RULES (strictly follow):
1. Never invent companies, degrees, dates, or roles that are not in the original CV.
2. Preserve every real fact — only improve wording, structure, and keywords.
3. Start every bullet with a strong action verb (e.g. Developed, Analysed, Implemented).
4. Add quantification where plausible from context (do not invent specific numbers).
5. Insert relevant ATS keywords naturally for ${jobRole}.
6. Keep it concise and professional.
7. If ANY field is unknown or missing (company name, date, location, etc.) — omit it and its pipe separator entirely. NEVER write "Not specified", "N/A", "Unknown", or any placeholder. Example: if company is unknown write "Data Analyst Intern | Jun 2024 - Dec 2024"; if dates are also unknown write just "Data Analyst Intern".
8. Preserve the ENTIRE contact line exactly as it appears in original — do not drop any item (LinkedIn, GitHub, Tableau, Portfolio, or any other link/label). Copy every element verbatim.
9. Include ALL sections present in the original — do not drop any section.
10. Use the EXACT same section header names as the original CV. Do not rename sections (e.g. if original says "Leadership & Extracurriculars", keep that — do not rename it "Personal Skills" or merge it with another section).
11. Preserve ALL academic scores, percentages, GPAs, and grades exactly as they appear in the original (e.g. 90.33%, 92.64%, 8.5 CGPA). Never drop them.
12. If the name appears with spaces between individual letters (e.g. "K U M A R I  M A N U"), remove the spaces and write it as a normal name (e.g. "KUMARI MANU").

OUTPUT FORMAT — use these exact section headers (no extra labels, no "ATS Optimised Resume"):
[Full Name on line 1]
[Copy line 2 of original CV exactly — email | phone | location | all profile links (LinkedIn, GitHub, Tableau, Portfolio, etc.)]
SUMMARY
[2-3 sentence professional summary tailored to ${jobRole}]
EXPERIENCE
[Job Title | Company Name | Month Year - Month Year] — omit any field that is unknown, never write "Not specified"
- bullet point starting with action verb
- bullet point starting with action verb
SKILLS
[List all technical skills grouped naturally, comma separated]
EDUCATION
[Degree | University | Year]
PROJECTS
[only if present in original]
CERTIFICATIONS
[only if present in original]
LANGUAGES
[only if present in original — list languages]
PERSONAL SKILLS
[only if present in original — soft skills like communication, problem solving etc]

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
      const userMsg = geminiRes.status === 429
        ? "Our servers are busy right now. Please try again in a minute."
        : "CV rewrite failed. Please try again in a moment.";
      return NextResponse.json({ error: userMsg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    // Gemini 2.5 Flash returns thinking tokens in parts — find the actual text part
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const rewritten = parts.find((p: any) => !p.thought && p.text)?.text ?? parts[0]?.text ?? "";

    if (!rewritten) {
      return NextResponse.json({ error: "AI returned empty response. Please try again." }, { status: 500 });
    }

    // ── Post-process: strip "Not specified" placeholders Gemini sometimes outputs
    const cleanRewritten = rewritten
      .split("\n")
      .map(line => {
        // Remove "| Not specified" or "Not specified |" or standalone "Not specified"
        return line
          .replace(/\|\s*Not specified\s*\|\s*Not specified\s*-\s*Not specified/gi, "")
          .replace(/\|\s*Not specified\s*-\s*Not specified/gi, "")
          .replace(/\|\s*Not specified/gi, "")
          .replace(/Not specified\s*\|/gi, "")
          .replace(/Not specified\s*-\s*Not specified/gi, "")
          .replace(/Not specified/gi, "")
          .replace(/\|\s*\|/g, "|")   // collapse double pipes left by removal
          .replace(/\|\s*$/g, "")     // trailing pipe
          .replace(/^\s*\|\s*/g, "")  // leading pipe
          .trimEnd();
      })
      .join("\n");

    // ── Build PDF ──────────────────────────────────────────────────
    const cvNameRaw = cleanRewritten.split("\n").find(l => l.trim())?.trim() || "CV";
    const cvNameSlug = cvNameRaw.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    const roleSlug = jobRole.split("/")[0].trim().replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    const downloadFilename = `${cvNameSlug}-${roleSlug}-CV.pdf`;

    const pdfBytes = await buildPDF(cleanRewritten);

    // ── Send email with PDF attachment ─────────────────────────────
    if (userEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "ScoreMyCV <noreply@scoremycv.in>",
          to: userEmail,
          subject: "Your Rewritten CV is Ready — ScoreMyCV",
          html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2 style="color:#1d4ed8">Your ATS-Optimised CV is Ready!</h2>
            <p>Hi there,</p>
            <p>Your rewritten CV for <strong>${jobRole}</strong> is attached to this email as a PDF.</p>
            <p>Open the attachment and save it to your device. Good luck with your job search!</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
            <p style="color:#6b7280;font-size:13px">ScoreMyCV - scoremycv.in</p>
          </div>`,
          attachments: [{
            filename: "rewritten-cv.pdf",
            content: Buffer.from(pdfBytes).toString("base64"),
          }],
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        "Cache-Control": "no-store",
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
