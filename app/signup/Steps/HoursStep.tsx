'use client'

import {Clock} from 'lucide-react'

type HoursCommitmentStepProps = {
    value: number
    onChange: (v:number) => void 
    onBack?: () => void 
    onContinue: () => void
    progressPercent?: number
}

export default function HoursCommitmentStep({
    value,
    onChange,
    onBack,
    onContinue,
    progressPercent = 100,
}: HoursCommitmentStepProps){
    const hours = value
    const max = 168

    return (
        <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 pt-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-3xl font-bold text-orange-500 tracking-wide">KROWE</span>
          <div className="w-10 h-10 bg-gray-800 rounded-lg transform rotate-45"></div>
        </div>

        <div className="w-full max-w-4xl mx-auto mb-20">
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="text-6xl mb-8">
              <Clock className="w-16 h-16 text-gray-600" strokeWidth={1.5} />
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              how many hours can you put in weekly?
            </h1>

            <p className="text-lg text-gray-400">
              keep this number realistic, your only like to yourself bruh
            </p>
          </div>

          <div className="flex flex-col items-center mb-32">
            <div className="text-4xl font-bold text-gray-900 mb-8">
              {hours} {hours === 1 ? 'hour' : 'hours'}
            </div>

            <div className="w-full max-w-2xl px-4">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={max}
                  value={hours}
                  onChange={(e) => onChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${(hours / max) * 100}%, #e5e7eb ${(hours / max) * 100}%, #e5e7eb 100%)`,
                  }}
                />
              </div>

              <div className="flex justify-between mt-3">
                <span className="text-sm text-gray-400">0</span>
                <span className="text-sm text-gray-400">{max}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              &lt; Go Back
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
    )
}

