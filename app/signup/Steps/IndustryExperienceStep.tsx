'use client'

type IndustryExperienceStepProps = {
  value: string;
  onChange: (v: string) => void;
  onBack?: () => void;
  onContinue: () => void
  progressPercent?: number;
}

export default function IndustryExperienceStep({
  value,
  onChange,
  onBack,
  onContinue,
  progressPercent = 66, //adjust this to change progress bar on this page
}: IndustryExperienceStepProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-center pt-6">
        <img src="/KroweLogo.png" alt="Krowe Logo" className="h-20 w-auto" />
      </div>
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col pt-5 px-4">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-28">
          <div
            className="h-full bg-orange-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 mt-4">
          <div className="text-4xl">🏢</div>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold text-gray-900">
              whats your industry experience, if any?
            </h1>

            <p className="text-gray-500 text-base max-w-2xl leading-relaxed mb-2">
              don't feel pressured to lie or make up experience, knowing where you
              are will help us take you to where you want to be
            </p>
          </div>
        </div>

        <div className="mb-8">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-64 px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder:text-gray-400 text-gray-700"
            placeholder="Ex: Junior in college, VP of Operations (Entrepreneurship Club) — organized pitch nights and led outreach, Business Operations Intern — supported customer research and tracked growth, Personal projects — built landing pages/basic apps, Strengths — coachable, fast learner, consistent"
          />
          <div className="mt-2 text-xs text-gray-400">
            {value.trim().length} characters
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            &lt; Go Back
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={value.trim().length < 3}
            className="px-8 py-3 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}