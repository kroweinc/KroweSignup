import { NextResponse } from "next/server";
import { getNextStepKey, isValidStepKey, StepKey } from "@/lib/signupSteps";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

type Body = {
    sessionId: string;
    stepKey: string;
    answerText: string;
};

export async function POST(req: Request){
  const supabase = createServerSupabaseClient();
  const body = (await req.json()) as Body;

  const sessionId = (body.sessionId || "").trim();
  const stepKey = (body.stepKey || "").trim();
  const answerText = (body.answerText ?? "").toString();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  if (!isValidStepKey(stepKey)) {
    return NextResponse.json({ error: "Invalid stepKey" }, { status: 400 });
  }

  //1) upsert answer
  const {error: upErr} = await supabase
  .from("signup_answers")
  .upsert(
    {
        session_id: sessionId,
        step_key: stepKey,
        raw_answer: answerText,
    },
    {onConflict: "session_id,step_key"}
  );

  if(upErr){
    return NextResponse.json({error: upErr.message}, {status: 500})
  }

  //2) advance session to next step
  const next = getNextStepKey(stepKey as StepKey);

  if (next){
    const {error: sessErr} = await supabase
    .from("signup_sessions")
    .update({current_step_key: next})
    .eq("id", sessionId);

    if(sessErr){
        return NextResponse.json({error: sessErr.message}, {status: 500});
    }
  }

  return NextResponse.json({
    ok: true,
    savedStepKey: stepKey,
    nextStepKey: next,
  })

}