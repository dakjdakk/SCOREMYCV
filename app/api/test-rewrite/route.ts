import { NextResponse } from "next/server";
import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";
import { StandardFonts } from "pdf-lib";

export const maxDuration = 60;

// ── Palette (matches reference: light sidebar, dark text, blue accents) ──
const SIDEBG  = rgb(0.88, 0.90, 0.94);  // FIX5: slightly darker/more blue-gray sidebar
const WHITE   = rgb(1, 1, 1);
const DARK    = rgb(0.08, 0.08, 0.10);  // near-black for name + sub-headers
const MID     = rgb(0.22, 0.22, 0.25);  // body text
const BLUE    = rgb(0.09, 0.30, 0.68);  // section header spaced text + line
const NAVY    = rgb(0.08, 0.15, 0.38);  // bullet outer / badge bg
const SKILLHDR= rgb(0.06, 0.18, 0.50);  // FIX7: darker navy for skill category labels
const GREYLN  = rgb(0.72, 0.72, 0.75);  // thin dividers
const LIGHTGR = rgb(0.52, 0.52, 0.55);  // watermark / footer

// ── Sanitise text ────────────────────────────────────────────────────────
function san(t: string): string {
  return t
    .replace(/\*\*/g, "").replace(/\*/g, "")
    .replace(/[–—]/g, "-")
    .replace(/['']/g, "'").replace(/[""]/g, '"')
    .replace(/[•‣▪●▸►✓]/g, "")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "")
    .trim();
}

// ── Spaced letters: "SUMMARY" → "S U M M A R Y" ────────────────────────
function spaced(s: string): string {
  return s.toUpperCase().split("").join(" ").replace(/\s{3}/g, "   ");
}

// ── Contact type detection ───────────────────────────────────────────────
function contactType(s: string): "email" | "phone" | "linkedin" | "github" | "other" {
  const l = s.toLowerCase();
  if (s.includes("@"))        return "email";
  if (l.includes("linkedin")) return "linkedin";
  if (l.includes("github"))   return "github";
  if (/\+?[\d\s\-()]{7,}/.test(s.trim())) return "phone";
  return "other";
}

// ── Parse CV text into structured sections ───────────────────────────────
function parseCV(text: string) {
  const lines = text.split("\n");
  const name  = san(lines.find(l => l.trim()) || "");
  const contactLine = lines.find((l, i) =>
    i > 0 && (l.includes("@") || l.includes("|") || /\+?\d[\d\s]{7,}/.test(l))
  ) || "";
  const contactParts = san(contactLine).split("|").map(s => s.trim()).filter(Boolean);

  const KNOWN = [
    "SUMMARY","PROFESSIONAL SUMMARY","CAREER OBJECTIVE","OBJECTIVE","PROFILE",
    "EXPERIENCE","WORK EXPERIENCE","EMPLOYMENT","INTERNSHIP",
    "SKILLS","TECHNICAL SKILLS","CORE COMPETENCIES","KEY SKILLS","PERSONAL SKILLS",
    "EDUCATION","ACADEMIC","PROJECTS","KEY PROJECTS",
    "CERTIFICATIONS","CERTIFICATION","ACHIEVEMENTS","AWARDS","LANGUAGES","VOLUNTEER",
  ];
  const sections: { title: string; lines: string[] }[] = [];
  let cur: { title: string; lines: string[] } | null = null;

  for (const raw of lines) {
    const l  = raw.trim();
    if (!l || l === name || l === contactLine.trim()) continue;
    const up = l.toUpperCase().replace(/[^A-Z\s]/g, "").trim();
    const isHdr = KNOWN.some(k => up === k || up.startsWith(k)) && l.split(" ").length <= 5;
    if (isHdr) {
      if (cur) sections.push(cur);
      cur = { title: l.toUpperCase(), lines: [] };
    } else if (cur) {
      cur.lines.push(l);
    }
  }
  if (cur) sections.push(cur);
  return { name, contactParts, sections };
}

// ── Build PDF matching reference design ─────────────────────────────────
async function buildTwoColPDF(rewrittenText: string): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const reg  = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ital = await doc.embedFont(StandardFonts.HelveticaOblique);

  const PW   = 612;
  const PH   = 792;
  const SB   = 188;          // sidebar width
  const SX   = 14;           // sidebar text start X
  const STW  = SB - SX - 12;// sidebar usable text width
  const MX   = SB + 18;     // main column X
  const MW   = PW - MX - 16;// main column width
  const NAMEH= 78;           // FIX1: taller name strip for cleaner contact lines
  const TY   = PH - NAMEH - 16; // top Y for columns
  const BOT  = 30;

  const pages: PDFPage[] = [];
  let lY = TY, rY = TY;

  function addPage(): PDFPage {
    const p = doc.addPage([PW, PH]);
    pages.push(p);
    // White background
    p.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: WHITE });
    // Sidebar
    p.drawRectangle({ x: 0, y: 0, width: SB, height: PH, color: SIDEBG });
    // Thin vertical separator
    p.drawLine({ start: { x: SB, y: 0 }, end: { x: SB, y: PH }, thickness: 0.8, color: GREYLN });
    return p;
  }

  const curP = () => pages[pages.length - 1];

  const chkL = (h: number) => {
    if (lY - h < BOT) { addPage(); lY = TY; rY = TY; }
  };
  const chkR = (h: number) => {
    if (rY - h < BOT) { addPage(); lY = TY; rY = TY; }
  };

  // ── Wrap text: left sidebar ──────────────────────────────────────────
  function wrapLeft(text: string, font: PDFFont, size: number, color: ReturnType<typeof rgb>, indent = 0, lh = 1.35) {
    const mw = STW - indent;
    let line = "";
    for (const w of san(text).split(/\s+/).filter(Boolean)) {
      const t = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) > mw && line) {
        chkL(size * lh);
        curP().drawText(line, { x: SX + indent, y: lY, font, size, color });
        lY -= size * lh; line = w;
      } else line = t;
    }
    if (line) {
      chkL(size * lh);
      curP().drawText(line, { x: SX + indent, y: lY, font, size, color });
      lY -= size * lh;
    }
  }

  // ── Wrap text: right main column ────────────────────────────────────
  function wrapRight(text: string, font: PDFFont, size: number, color: ReturnType<typeof rgb>, indent = 0, lh = 1.38) {
    const mw = MW - indent;
    let line = "";
    for (const w of san(text).split(/\s+/).filter(Boolean)) {
      const t = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) > mw && line) {
        chkR(size * lh);
        curP().drawText(line, { x: MX + indent, y: rY, font, size, color });
        rY -= size * lh; line = w;
      } else line = t;
    }
    if (line) {
      chkR(size * lh);
      curP().drawText(line, { x: MX + indent, y: rY, font, size, color });
      rY -= size * lh;
    }
  }

  // ── Left sidebar section header ──────────────────────────────────────
  function leftHdr(title: string) {
    lY -= 16; // FIX3: more breathing room above header
    chkL(20);
    const sp = spaced(title);
    curP().drawText(sp, { x: SX, y: lY, font: bold, size: 7, color: BLUE });
    lY -= 5;
    curP().drawLine({ start: { x: SX, y: lY }, end: { x: SB - 12, y: lY }, thickness: 0.9, color: BLUE });
    lY -= 10; // FIX3: more space below line
  }

  // ── Right main column section header ────────────────────────────────
  function rightHdr(title: string) {
    rY -= 18; // FIX3: more breathing room above header
    chkR(24);
    const sp = spaced(title);
    curP().drawText(sp, { x: MX, y: rY, font: bold, size: 9, color: BLUE });
    rY -= 5;
    curP().drawLine({ start: { x: MX, y: rY }, end: { x: PW - 16, y: rY }, thickness: 1, color: BLUE });
    rY -= 12; // FIX3: more space below line
  }

  // ── Two-ring bullet for right column ─────────────────────────────────
  // FIX4: larger bullets to match reference
  function bulletR() {
    chkR(13);
    curP().drawCircle({ x: MX + 7, y: rY + 4.5, size: 5.5, color: NAVY });
    curP().drawCircle({ x: MX + 7, y: rY + 4.5, size: 3.0, color: WHITE });
  }

  // ── Two-ring bullet for left sidebar ─────────────────────────────────
  // FIX4: larger bullets
  function bulletL() {
    chkL(11);
    curP().drawCircle({ x: SX + 5, y: lY + 3.5, size: 4.5, color: NAVY });
    curP().drawCircle({ x: SX + 5, y: lY + 3.5, size: 2.5, color: WHITE });
  }

  // ── Contact badge: rounded pill shape (FIX2) ─────────────────────────
  function contactBadge(iconChar: string) {
    chkL(12);
    // Rounded rectangle (pill) using borderRadius
    curP().drawRectangle({ x: SX, y: lY - 1, width: 13, height: 11, color: NAVY, borderRadius: 3 });
    const ox = iconChar.length === 2 ? SX + 0.5 : SX + 3.8;
    curP().drawText(iconChar, { x: ox, y: lY + 1.5, font: bold, size: 5.5, color: WHITE });
  }

  // ══════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ══════════════════════════════════════════════════════════════════════
  addPage();

  const { name, contactParts, sections } = parseCV(rewrittenText);

  // ── Name strip at top (white background, spans full width) ───────────
  curP().drawRectangle({ x: 0, y: PH - NAMEH, width: PW, height: NAMEH, color: WHITE });

  // Name — large, bold, dark, aligned to main column
  const nameSz = name.length > 28 ? 19 : name.length > 22 ? 22 : 25;
  curP().drawText(san(name).toUpperCase(), {
    x: MX, y: PH - 32, font: bold, size: nameSz, color: DARK,
  });

  // FIX1: Smart contact line — split email+phone on line1, linkedin+github on line2
  const emailPhone  = contactParts.filter(p => p.includes("@") || /\d{7,}/.test(p));
  const socialLinks = contactParts.filter(p => !p.includes("@") && !/\d{7,}/.test(p));
  const line1 = emailPhone.map(p => san(p)).join("  |  ");
  const line2 = socialLinks.map(p => san(p)).join("  |  ");

  if (line1) curP().drawText(line1, { x: MX, y: PH - 50, font: reg, size: 8, color: MID });
  if (line2) curP().drawText(line2, { x: MX, y: PH - 62, font: reg, size: 8, color: MID });

  // FIX6: Watermark — neatly at far right, vertically centered in name strip
  const brand = "ATS-Optimised by scoremycv.in";
  curP().drawText(brand, {
    x: PW - reg.widthOfTextAtSize(brand, 6.5) - 12,
    y: PH - 68,
    font: ital, size: 6.5, color: LIGHTGR,
  });

  // Blue underline below name strip
  curP().drawLine({
    start: { x: MX, y: PH - NAMEH + 4 },
    end:   { x: PW - 16, y: PH - NAMEH + 4 },
    thickness: 1.5, color: BLUE,
  });

  lY = TY; rY = TY;

  // ── SIDEBAR: CONTACT ─────────────────────────────────────────────────
  if (contactParts.length) {
    leftHdr("CONTACT");
    for (const part of contactParts) {
      const type = contactType(part);
      const icon =
        type === "email"    ? "@"  :
        type === "phone"    ? "P"  :
        type === "linkedin" ? "in" :
        type === "github"   ? "gh" : "i";
      contactBadge(icon);
      const display = san(part).replace(/^(LinkedIn|GitHub)\s*:\s*/i, "");
      wrapLeft(display, reg, 7, MID, 16, 1.3);
      lY -= 3;
    }
  }

  // ── Sort sections: left vs right column ──────────────────────────────
  const LEFT_KEYS  = ["SKILL","EDUCATION","ACADEMIC","CERTIF","LANGUAGE","COMPETENC","AWARD","ACHIEVEMENT","PERSONAL SKILL","VOLUNTEER"];
  const RIGHT_KEYS = ["SUMMARY","PROFESSIONAL SUMMARY","CAREER OBJECTIVE","OBJECTIVE","PROFILE","EXPERIENCE","WORK EXPERIENCE","EMPLOYMENT","PROJECT","INTERNSHIP"];

  const leftSecs  = sections.filter(s => LEFT_KEYS.some(k  => s.title.includes(k)));
  const rightSecs = sections.filter(s => RIGHT_KEYS.some(k => s.title.includes(k)));
  const otherSecs = sections.filter(s =>
    !LEFT_KEYS.some(k  => s.title.includes(k)) &&
    !RIGHT_KEYS.some(k => s.title.includes(k))
  );

  // ── RIGHT column ─────────────────────────────────────────────────────
  for (const sec of [...rightSecs, ...otherSecs]) {
    rightHdr(sec.title);

    for (const raw of sec.lines) {
      const rawTrimmed = raw.trim();
      if (!rawTrimmed) { rY -= 3; continue; }
      const isBullet = /^[-*•‣▪●]/.test(rawTrimmed);
      const l = san(rawTrimmed);
      if (!l) continue;

      const isSubHdr = !isBullet && l.length < 120 &&
        (l.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(l) ||
         /^(dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov)/i.test(l));

      if (isSubHdr) {
        rY -= 5;
        wrapRight(l, bold, 9.5, DARK, 0, 1.45);
      } else if (isBullet) {
        const txt = l.replace(/^[-*]\s*/, "");
        bulletR();
        wrapRight(txt, reg, 9, MID, 20, 1.38); // FIX4: more indent to clear larger bullet
      } else {
        wrapRight(l, reg, 9, MID, 0, 1.38);
      }
    }
    rY -= 6;
    chkR(6);
    curP().drawLine({ start: { x: MX, y: rY + 3 }, end: { x: PW - 16, y: rY + 3 }, thickness: 0.3, color: GREYLN });
    rY -= 6;
  }

  // ── LEFT column ───────────────────────────────────────────────────────
  for (const sec of leftSecs) {
    leftHdr(sec.title);

    const isSkills = ["SKILL","COMPETENC"].some(k => sec.title.includes(k));
    const isList   = ["CERTIF","LANGUAGE","AWARD","ACHIEVEMENT"].some(k => sec.title.includes(k));

    for (const raw of sec.lines) {
      const l = san(raw.trim());
      if (!l) continue;

      if (isSkills) {
        const colonIdx = l.indexOf(":");
        if (colonIdx > 0 && colonIdx < 35) {
          lY -= 3;
          wrapLeft(l.slice(0, colonIdx).toUpperCase(), bold, 7, SKILLHDR, 0, 1.2); // FIX7
          const skills = l.slice(colonIdx + 1).trim();
          if (skills) wrapLeft(skills, reg, 7, MID, 4, 1.25);
          lY -= 3;
        } else {
          bulletL();
          wrapLeft(l.replace(/^[-*]\s*/, ""), reg, 7, MID, 14, 1.25);
        }
      } else if (isList) {
        bulletL();
        wrapLeft(l.replace(/^[-*]\s*/, ""), reg, 7.5, MID, 12, 1.3);
        lY -= 1;
      } else {
        // Education
        const txt = l.replace(/^[-*]\s*/, "");
        const isBoldL = l.includes("|") || /\b(20\d{2}|19\d{2})\b/.test(l);
        wrapLeft(txt, isBoldL ? bold : reg, 7.5, isBoldL ? DARK : MID, 0, 1.32);
      }
    }
    lY -= 6;
  }

  // ── Footer on every page ─────────────────────────────────────────────
  for (let i = 0; i < pages.length; i++) {
    pages[i].drawText(`Page ${i + 1} of ${pages.length}  |  scoremycv.in`, {
      x: MX, y: 14, font: ital, size: 6.5, color: LIGHTGR,
    });
  }

  return doc.save();
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const fd = await request.formData();
    const file         = fd.get("file")        as File | null;
    const jobRole      = (fd.get("jobRole")    as string) || "Software Engineer";
    const experience   = (fd.get("experience") as string) || "0-2 years";
    const userEmail    = (fd.get("email")      as string) || "";
    const userPhone    = (fd.get("phone")      as string) || "";
    const userLinkedin = (fd.get("linkedin")   as string) || "";
    const userGithub   = (fd.get("github")     as string) || "";

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
      ? `\nCONTACT LINE (line 2 of output) must be EXACTLY:\n${contactItems.join(" | ")}\n`
      : "";

    const prompt = `You are an expert ATS resume writer. Rewrite for "${jobRole}" role, ${experience} experience.

RULES:
1. Never invent facts not in the original CV.
2. Start every bullet with a strong action verb.
3. Omit missing fields — NEVER write "Not specified" or "N/A".
4. Include ALL sections from the original.
5. Preserve academic scores/GPAs exactly.
6. Fix spaced-out names (e.g. "K U M A R" -> "KUMAR").

SKILLS FORMAT — use ONLY this format, no bullets:
Category: skill1, skill2, skill3

OUTPUT (exact format):
[Full Name]
[contact items separated by |]
SUMMARY
[2-3 sentences]
EXPERIENCE
[Title | Company | Date Range]
- bullet
SKILLS
Category: skills
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
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);
      return NextResponse.json({ error: "CV rewrite failed. Please try again." }, { status: 502 });
    }

    const gData    = await geminiRes.json();
    const parts    = gData?.candidates?.[0]?.content?.parts ?? [];
    const rewritten = parts.find((p: any) => !p.thought && p.text)?.text ?? parts[0]?.text ?? "";
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
        "Content-Disposition": `attachment; filename="${cvName}-${roleSlug}-ATS.pdf"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    console.error("test-rewrite error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
