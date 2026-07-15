import { NextResponse } from "next/server";
import { dbInsert } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { payment_id, stars, comment, email } = await request.json();

    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    await dbInsert("cv_reviews", {
      payment_id: payment_id || null,
      stars:      Number(stars),
      comment:    comment?.trim() || null,
      email:      email || null,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("submit-review error:", e);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
