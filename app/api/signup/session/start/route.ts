import { NextResponse } from "next/server";
import { getFirstStepKey } from "@/lib/signupSteps";
import { createServerSupabaseClient } from "@/lib/supabaseServer"; // assumes you export a server client

export async function POST() {
  const supabase = createServerSupabaseClient();

  const firstStep = getFirstStepKey();

  const { data, error } = await supabase
    .from("signup_sessions")
    .insert({
      status: "in_progress",
      current_step_key: firstStep,
    })
    .select("id, current_step_key, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: data.id,
    currentStepKey: data.current_step_key,
    status: data.status,
  });
}
