import { NextResponse } from "next/server";
import { dbPatch } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { checkId } = await request.json();
    if (!checkId) return NextResponse.json({ ok: false }, { status: 400 });
    await dbPatch("ats_checks", checkId, { upgrade_clicked: true });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
