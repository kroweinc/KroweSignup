import { NextResponse } from "next/server";
import { getFirstStepKey } from "@/lib/signupSteps";
import { createServerSupabaseClient } from "@/lib/supabaseServer"; // assumes you export a server client

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();

    // Environment variables are validated at module load time via lib/env.ts
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
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No data returned from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: data.id,
      currentStepKey: data.current_step_key,
      status: data.status,
    });
  } catch (err) {
    console.error('Unexpected error in session/start:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
