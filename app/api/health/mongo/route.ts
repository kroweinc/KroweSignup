import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongo/client";
import { ENV } from "@/lib/env";

// Temporary endpoint for live verification during rollout/testing.
// Disabled in production unless explicitly enabled.
const TEMP_MONGO_HEALTHCHECK_ENABLED =
  process.env.ENABLE_TEMP_MONGO_HEALTHCHECK === "true";

export async function GET() {
  if (process.env.NODE_ENV === "production" && !TEMP_MONGO_HEALTHCHECK_ENABLED) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!ENV.MONGODB_URI) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        status: "mongo_not_configured",
      },
      { status: 503 }
    );
  }

  try {
    const db = await getMongoDb();
    await db.command({ ping: 1 });

    return NextResponse.json(
      {
        ok: true,
        configured: true,
        dbName: ENV.MONGODB_DB_NAME,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[mongo-health] ping failed:", error);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        status: "mongo_unreachable",
      },
      { status: 503 }
    );
  }
}
