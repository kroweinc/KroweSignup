import { NextResponse } from "next/server";
import { generateReportForSession } from "@/lib/report/generateReportForSession";
import { generateCurriculumForSession } from "@/lib/curriculum/generateCurriculumForSession";

/**
 * POST /api/signup/report/refresh
 *
 * Dev-only endpoint for testing prompt changes.
 * Regenerates the report and curriculum from stored signup_answers (report includes
 * LLM enrichment: competitors, MVP cost, market size, etc.).
 *
 * This allows you to:
 * 1. Edit prompts in lib/report/*.ts or lib/curriculum/*.ts
 * 2. Call this endpoint to regenerate with updated prompts
 * 3. See the new results without going through the full signup flow
 */
export async function POST(req: Request) {
  // Dev-only guard
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err: unknown) {
    console.error("[refresh] Error parsing request body:", err);
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { sessionId } = body;

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid sessionId" },
      { status: 400 }
    );
  }

  console.log("[refresh] Regenerating report + curriculum for session:", sessionId);

  const [repResult, curResult] = await Promise.allSettled([
    generateReportForSession(sessionId, {
      reason: "refresh",
      forceRegenerate: true,
    }),
    generateCurriculumForSession(sessionId, { reason: "refresh" }),
  ]);

  const reportError =
    repResult.status === "rejected"
      ? repResult.reason instanceof Error
        ? repResult.reason.message
        : String(repResult.reason)
      : null;
  const curriculumError =
    curResult.status === "rejected"
      ? curResult.reason instanceof Error
        ? curResult.reason.message
        : String(curResult.reason)
      : null;

  if (repResult.status === "fulfilled" && repResult.value.enrichmentDebug) {
    console.log("[refresh] Enrichment results:", {
      competitors: repResult.value.enrichmentDebug.competitorCount,
      competitorError: repResult.value.enrichmentDebug.competitorError,
      hasCostEstimate: repResult.value.enrichmentDebug.hasCostEstimate,
      hasMarketSize: repResult.value.enrichmentDebug.hasMarketSize,
    });
  }

  if (reportError && curriculumError) {
    return NextResponse.json(
      {
        error: "Report and curriculum refresh failed",
        reportError,
        curriculumError,
      },
      { status: 500 }
    );
  }

  const report =
    repResult.status === "fulfilled"
      ? {
          updatedAt: repResult.value.updatedAt,
          reportId: repResult.value.reportId,
          enrichmentDebug: repResult.value.enrichmentDebug,
        }
      : null;
  const curriculum =
    curResult.status === "fulfilled"
      ? {
          updatedAt: curResult.value.updatedAt,
          curriculumId: curResult.value.curriculumId,
        }
      : null;

  return NextResponse.json({
    ok: true,
    sessionId,
    report,
    curriculum,
    reportError,
    curriculumError,
  });
}
