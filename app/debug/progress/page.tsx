"use client";

import { useState } from "react";
import { ProgressScreen } from "../../report/[sessionId]/ProgressScreen";

export default function DebugProgressPage() {
  const [isDone, setIsDone] = useState(false);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        <ProgressScreen isDone={isDone} />
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setIsDone(false)}
          >
            Reset
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            onClick={() => setIsDone(true)}
          >
            Mark Done
          </button>
        </div>
      </div>
    </main>
  );
}

