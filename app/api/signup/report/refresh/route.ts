import {NextResponse} from "next/server";

export async function POST(req: Request) {

    if (process.env.NODE_ENV === "production") {
        return new NextResponse(null, {status: 404});
    }

    let body;
    try {
        body = await req.json();
    } catch {
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
    
    return NextResponse.json({
        ok: true, 
        sessionId
    });
}