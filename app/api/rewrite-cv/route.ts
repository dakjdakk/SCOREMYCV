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

    // ── Extract LinkedIn / GitHub URLs from raw PDF binary ─────────
    let extractedLinkedin = "";
    let extractedGithub   = "";
    if (fileName.endsWith(".pdf")) {
      const pdfStr = buffer.toString("latin1");
      const liMatch = pdfStr.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s)<>"\\]+/i);
      const ghMatch = pdfStr.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)<>"\\]+/i);
      extractedLinkedin = liMatch?.[0]?.replace(/\/$/, "") || "";
      extractedGithub   = ghMatch?.[0]?.replace(/\/$/, "") || "";
    }

    // Form fields take priority over extracted URLs
    const linkedinUrl = userLinkedin || extractedLinkedin;
    const githubUrl   = userGithub   || extractedGithub;

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
    ].filter(Boolean).join("\n");

    // ── Gemini prompt (HTML template) ──────────────────────────────
    const prompt = `You are a senior resume template rendering engine.
Your task is to transform any uploaded resume into ONE fixed resume design.
Target job role: ${jobRole}
Experience level: ${experience}
${contactSection ? `\nUSE THESE EXACT CONTACT DETAILS (override whatever is in the CV):\n${contactSection}\n` : ""}
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
      <!-- Certifications (if present) -->
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

All four sections go inside .left div. Do NOT create a separate .full-width div.

================================================
RIGHT COLUMN ORDER
================================================
1. SKILLS
2. TOOLS & TECHNOLOGIES
3. CERTIFICATIONS (if present)
4. LANGUAGES (if present)

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

    // ── Inject right column overflow fix ──────────────────────────
    rawHtml = rawHtml.replace(
      "</head>",
      `<style>.right { overflow: hidden !important; overflow-wrap: break-word !important; word-wrap: break-word !important; word-break: normal !important; box-sizing: border-box !important; max-width: 100% !important; } .right * { overflow-wrap: break-word !important; word-wrap: break-word !important; word-break: normal !important; max-width: 100% !important; }</style></head>`
    );

    // ── Puppeteer: HTML → PDF ──────────────────────────────────────
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const browserPage = await browser.newPage();
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
          from: "ScoreMyCV <noreply@scoremycv.in>",
          to:   userEmail,
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
            filename: downloadFilename,
            content:  pdfBytes.toString("base64"),
          }],
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
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
