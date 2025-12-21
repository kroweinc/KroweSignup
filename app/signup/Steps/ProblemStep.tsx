'use client'

type ProblemStepProps = {
    value: string;
    onChange: (v:string) => void;
    onBack?: () => void;
    onContinue?: () => void;
    progressPercent?: number;
}

export default function ProblemStep ({
    value,
    onChange,
    onBack,
    onContinue,
    progressPercent = 44, // ex set whatever you want for this step
}: ProblemStepProps) {
    const canContinue = value.trim().length >= 20

    return(
         <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold tracking-wide" style={{ color: '#F97316' }}>
              KROWE
            </span>
            <div className="w-8 h-8 bg-gray-800 rounded-full" />
          </div>

          <div className="w-full max-w-4xl px-8">
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ width: `${progressPercent}%`, backgroundColor: '#F97316' }}
              />
            </div>
          </div>

          <div className="w-full max-w-3xl flex flex-col items-center gap-6 mt-8">
            <div className="text-4xl mb-2">🚩</div>

            <h1 className="text-4xl font-semibold text-gray-900 text-center">
              what&apos;s the problem your startup solves?
            </h1>

            <p className="text-gray-500 text-center max-w-2xl">
              Use this template: We help [target customer] [solve specific problem] by
              <br />
              [simple solution/mechanism]
            </p>

            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full max-w-3xl h-56 px-6 py-4 text-gray-700 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Ex: We help first-time founders turn ideas into launch-ready startups by guiding them step-by-step with AI"
            />

            <div className="w-full max-w-3xl flex items-center justify-between gap-4 mt-2">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                &lt; Go Back
              </button>

              <button
                type="button"
                onClick={onContinue}
                disabled={!canContinue}
                className="px-8 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                style={{ backgroundColor: '#F97316' }}
              >
                Continue
              </button>
            </div>

            <div className="text-xs text-gray-400 w-full max-w-3xl text-right">
              {value.trim().length} characters (aim for 20+)
            </div>
          </div>
        </div>
      </div>
    </div> 
    )
}