import { NextResponse } from "next/server";

const ADMIN_PASSWORD = "25227";
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sbHeaders = {
  "apikey": SUPABASE_SERVICE_KEY,
  "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [atsRes, rewritesRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/ats_checks?select=*&order=created_at.desc&limit=500`, { headers: sbHeaders }),
      fetch(`${SUPABASE_URL}/rest/v1/cv_rewrites?select=id,created_at,job_role,score_before,email,payment_id,original_pdf_url,rewritten_pdf_url&order=created_at.desc&limit=100`, { headers: sbHeaders }),
    ]);

    const atsChecks = await atsRes.json();
    const rewrites  = await rewritesRes.json();

    return NextResponse.json({ atsChecks, rewrites });
  } catch (e) {
    console.error("Admin data fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
