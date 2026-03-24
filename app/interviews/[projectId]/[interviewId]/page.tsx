import { createServerSupabaseClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; interviewId: string }>;
}) {
  const { projectId, interviewId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: interview, error } = await supabase
    .from("interviews")
    .select("id, raw_text, status, created_at")
    .eq("id", interviewId)
    .eq("project_id", projectId)
    .single();

  if (error || !interview) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href={`/interviews/${projectId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to project
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Interview</h1>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(interview.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              interview.status === "structured"
                ? "bg-green-100 text-green-700"
                : interview.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {interview.status}
          </span>
        </div>

        <div className="border border-border rounded-xl p-6 bg-muted/20">
          <pre className="text-sm whitespace-pre-wrap font-mono text-foreground leading-relaxed">
            {interview.raw_text}
          </pre>
        </div>
      </div>
    </div>
  );
}
