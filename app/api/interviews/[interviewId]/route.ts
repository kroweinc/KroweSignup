import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  const { interviewId } = await params;
  const supabase = createServerSupabaseClient();
  const body = await req.json();
  const rawText = (body.rawText ?? "").trim();

  if (rawText.length < 100) {
    return NextResponse.json(
      { error: "Interview text must be at least 100 characters" },
      { status: 400 }
    );
  }

  const { error: deleteErr } = await supabase
    .from("extracted_problems")
    .delete()
    .eq("interview_id", interviewId);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  const { error: updateErr } = await supabase
    .from("interviews")
    .update({ raw_text: rawText, status: "pending", structured_segments: null })
    .eq("id", interviewId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
