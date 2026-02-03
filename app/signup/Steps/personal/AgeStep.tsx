'use client'

import type { ChangeEvent } from 'react';
import { ArrowRight, Lock, User } from 'lucide-react';

type AgeStepProps = {
  value: number;
  onChange: (age: number) => void;
  onBack: () => void;
  onContinue: () => void;
  progressPercent?: number
}

export default function AgeStep({ value, onChange, onBack, onContinue, progressPercent = 0 }: AgeStepProps) {
  const age = value;

  const handleAgeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D/g, '');

    if (!numericValue) {
      onChange(0);
      return;
    }

    const parsedValue = Math.min(120, parseInt(numericValue, 10));
    onChange(parsedValue);
  };

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 md:py-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img src="/KroweLogo.png" alt="Krowe Logo" className="h-6 w-auto md:h-8" />
            </div>
            <div className="flex-1 flex justify-center min-w-0 px-2">
              <div className="w-full max-w-xs h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-[width]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex-shrink-0 w-6 md:w-8" aria-hidden />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 md:gap-16 items-stretch">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-orange-500" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black">How old</h1>
              <h1 className="text-3xl md:text-4xl font-bold text-orange-500">are you?</h1>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-sm">
              We tailor the Krowe incubator experience to different life stages. Your age helps us match you with the right peer cohort.
            </p>

            <div className="bg-gray-100 rounded-xl p-5 max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Privacy Note
                </span>
              </div>
              <p className="text-sm text-black leading-relaxed">
                This information is kept private and is only used for internal matching algorithms and cohort assignment.
              </p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Your personal data is encrypted and secure.</span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                Enter Your Age
              </label>

              <input
                type="text"
                inputMode="numeric"
                value={age === 0 ? '' : age.toString()}
                onChange={handleAgeChange}
                className="text-7xl md:text-8xl font-light text-center text-black bg-transparent border-none outline-none w-full max-w-[200px] placeholder:text-muted-foreground/60 transition-colors"
                placeholder="18"
              />

              <div className="w-32 h-px bg-border mt-2" />
            </div>

            <div className="flex items-center justify-between mt-16 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Auto-saved</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onContinue}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground tracking-wide">© 2023 KROWE INCUBATOR</p>
      </footer>
    </div>
  )
}


