'use client'

import { Sparkles } from 'lucide-react'

export type FixNeededCardProps = {
  issues: { code: string; message: string; severity?: string }[]
  aiSuggestion: string | null
  aiReason: string | null
  canContinueAnyway: boolean
  saving: boolean
  finishing: boolean
  onUseSuggestion: () => void | Promise<void>
  onEditSuggestion: () => void
  onSaveMyEdit: () => void | Promise<void>
  onContinueAnyway: () => void | Promise<void>
}

export default function FixNeededCard({
  issues,
  aiSuggestion,
  aiReason,
  canContinueAnyway,
  saving,
  finishing,
  onUseSuggestion,
  onEditSuggestion,
  onSaveMyEdit,
  onContinueAnyway,
}: FixNeededCardProps) {
  const problemText = aiReason ?? (issues.length > 0 ? issues[0].message : null)

  return (
    <div className="max-w-3xl mx-auto p-2.5 rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 text-amber-600 min-w-0">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          <span className="font-semibold text-xs text-black truncate">FIX NEEDED</span>
        </div>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-gray-700 flex-shrink-0">
          AI Suggestion
        </span>
      </div>

      {/* Problem description */}
      {problemText && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{problemText}</p>
      )}

      {/* Suggested rewrite (inner recessed box) */}
      {aiSuggestion && (
        <div className="rounded border border-gray-200 bg-gray-50 p-2 mb-2">
          <div className="text-[10px] font-medium tracking-wider text-gray-500 uppercase mb-1">
            Suggested rewrite
          </div>
          <p className="text-xs whitespace-pre-wrap text-amber-700 line-clamp-2">
            {aiSuggestion}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5">
        {aiSuggestion && (
          <>
            <button
              type="button"
              disabled={saving || finishing}
              className="px-2 py-1 rounded bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 disabled:opacity-50"
              onClick={onUseSuggestion}
            >
              Use suggestion
            </button>
            <button
              type="button"
              disabled={saving || finishing}
              className="px-2 py-1 rounded border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={onEditSuggestion}
            >
              Edit suggestion
            </button>
            <button
              type="button"
              disabled={saving || finishing}
              className="px-2 py-1 rounded border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={onSaveMyEdit}
            >
              Save my edit
            </button>
          </>
        )}
      </div>

      {/* Keep original anyway */}
      {canContinueAnyway && (
        <button
          type="button"
          onClick={onContinueAnyway}
          disabled={saving}
          className="mt-2 text-xs underline text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Keep my original anyway (results may be less accurate)
        </button>
      )}
    </div>
  )
}
