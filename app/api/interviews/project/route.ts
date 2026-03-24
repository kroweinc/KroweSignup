import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient();
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const sessionId = (body.sessionId ?? "").trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Missing project name" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("interview_projects")
    .insert({ name, session_id: sessionId })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projectId: data.id, status: data.status });
}

export async function GET(req: Request) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  let query = supabase
    .from("interview_projects")
    .select("id, name, status, interview_count, created_at, updated_at, session_id")
    .order("created_at", { ascending: false });

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}
