import {NextResponse} from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { buildInputsFromAnswers } from "@/lib/report/buildInputsFromAnswers";
import { mapSignupInputsToReportInputs } from "@/lib/report/mapSignupInputsToReportInputs";
import { buildReportFromPayload } from "@/lib/report/buildReport";

export async function POST(req: Request) {
    if (process.env.NODE_ENV === "production") {
        return new NextResponse(null, {status: 404});
    }

    let body;
    try {
        body = await req.json();
    } catch (err: any) {

        console.error("[refresh] error parsing request body", err);


        return NextResponse.json(
            {error: "Invalid JSON"},
            {status: 400}
        );
    }

    const {sessionId} = body;

    if (!sessionId || typeof sessionId !== "string") {
        return NextResponse.json(
            {error: "Missing or invalid sessionId"},
            {status: 400}
        );
    }

    const supabase = createServerSupabaseClient();

    const {data: answers, error} = await supabase
    .from("signup_answers")
    .select("step_key, final_answer")
    .eq("session_id", sessionId);

    if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to load signup answers", supabase: error.message },
          { status: 500 }
        );
      }
      
    if(!answers || answers.length === 0){
        return NextResponse.json(
            {error: "No answers found for session"},
            {status: 404}
        );
    }

    const inputs = buildInputsFromAnswers(answers);

    // Map flat inputs to SignupPayload structure expected by buildReportFromPayload
    const mappedInputs = mapSignupInputsToReportInputs(inputs);

    // Dev-only debug log
    if (process.env.NODE_ENV === "development") {
        console.log("[refresh] mapped keys:", Object.keys(mappedInputs).length);
    }
    
    const report = buildReportFromPayload(mappedInputs);
    const idea = (inputs.idea ?? "").trim() || "⚠ Missing Data";

    const {error: reportError} = await supabase
    .from("signup_reports")
    .upsert({
        session_id: sessionId,
        report,
        status: "ready",
        updated_at: new Date().toISOString(),
    },
    {
        onConflict: "session_id"
    }
    );

    if (reportError) {
        console.error("failed to update signup report", reportError);
        return NextResponse.json(
            {error: "Failed to save refreshed report"},
            {status: 500}
        );
    }


    console.log("[refresh] genrating report for session", sessionId);

    return NextResponse.json({
        ok: true, 
        sessionId,
        report,
        updatedAt: new Date().toISOString(),
    });
}