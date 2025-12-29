'use client'

import { useState } from 'react'
import AgeStep from './Steps/AgeStep'
import IdeaStep from './Steps/IdeaStep'
import ProductTypeStep from './Steps/ProductTypeStep'
import ProblemStep from './Steps/ProblemStep'
import TargetCustomerStep from './Steps/TargetCustomerStep'
import IndustryStep, { IndustryId } from './Steps/IndustryStep'
import IndustryExperienceStep from './Steps/IndustryExperienceStep'
import SkillsStep from './Steps/SkillsStep'
import TeamSizeStep from './Steps/TeamSizeStep'
import HoursCommitmentStep from './Steps/HoursStep'

import { useSignupSession } from '@/lib/useSignupSession'
import {StepKey, getProgressPercent, getPrevStepKey} from '@/lib/signupSteps'

type ProductType = 'mobile' | 'web' | 'both' | 'other' | null

function safeJson<T = any>(s: string): T | null {
  try{
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

export default function SignupPage() {
  const {loading, error, currentStepKey, answersByStepKey, setAnswerLocal, submitAnswer } = useSignupSession();

//Slice 1: Optional client only back nav (NOT persisted if user refreshes)
const [overrideStepKey, setOverrideStepKey] = useState<StepKey | null>(null)

  if (loading) return <div className='p-6'>Loading...</div>;
  if (error) return <div className='p-6 text-red-600'>{error}</div>
    
  const progressPercent = getProgressPercent(currentStepKey);
  const raw = answersByStepKey[currentStepKey] ?? "";
  const stepKey = (overrideStepKey ?? currentStepKey) as StepKey

  function setLocal(step: StepKey, v: unknown) {
    const serialized = typeof v === 'string' ? v : JSON.stringify(v)
    setAnswerLocal(step, serialized)
  }

  async function saveAndNext(step: StepKey, v:unknown){
    const serialized = typeof v === 'string' ? v : JSON.stringify(v)
    await submitAnswer(step, serialized)
    //once we succesfully save/advance, clear any client only back override
    setOverrideStepKey(null)
  }

  function goBack(){
    const prev = getPrevStepKey(stepKey)
    if (!prev) return
    setOverrideStepKey(prev)
  }

  //render the current step

  if (stepKey === 'age'){
    const ageValue = raw? Number(raw) : 18
    return(
      <AgeStep
      value={ageValue}
      onChange={(v: number) => setLocal('age', String(v))}
      onBack={goBack}
      onContinue={() => saveAndNext('age', String(ageValue))}
      progressPercent={progressPercent}
      />
    )
  }
  
  if (stepKey === 'idea') {
    const ideaValue = raw || ''

    return (
      <IdeaStep
        value={ideaValue}
        onChange={(v: string) => setLocal('idea', v)}
        onBack={goBack}
        onContinue={() => saveAndNext('idea', ideaValue)}
        progressPercent={progressPercent}
      />
    )
  }

  if (stepKey === 'product_type') {
  const productTypeValue = (raw || null) as ProductType
    return (
    <ProductTypeStep
      value={productTypeValue}
      onChange={(v: ProductType) => setLocal('product_type', v ?? '')}
      onBack={goBack}
      onContinue={() => {
        // allow null selection to be blocked by UI (same as your old code)
      if (!productTypeValue) return
      return saveAndNext('product_type', productTypeValue)
    }}
    progressPercent={progressPercent}
  />
    )
  }
if (stepKey === 'problem') {
const problemValue = raw || ''


return (
  <ProblemStep
    value={problemValue}
    onChange={(v: string) => setLocal('problem', v)}
    onBack={goBack}
    onContinue={() => saveAndNext('problem', problemValue)}
    progressPercent={progressPercent}
  />
)



}

if (stepKey === 'target_customer') {
const targetCustomerValue = raw || ''


return (
  <TargetCustomerStep
    value={targetCustomerValue}
    onChange={(v: string) => setLocal('target_customer', v)}
    onBack={goBack}
    onContinue={() => saveAndNext('target_customer', targetCustomerValue)}
    progressPercent={progressPercent}
  />
)



}

if (stepKey === 'industry') {
// Stored as JSON: { industry: IndustryId|null, other: string }
const parsed = safeJson<{ industry: IndustryId | null; other: string }>(raw) ?? {
industry: null,
other: '',
}


const industryValue = parsed.industry
const industryOtherValue = parsed.other ?? ''

return (
  <IndustryStep
    value={industryValue}
    otherValue={industryOtherValue}
    onChange={(v: IndustryId | null) => {
      // mimic your old behavior: clear OTHER text when not "other"
      const nextOther = v !== 'other' ? '' : industryOtherValue
      setLocal('industry', { industry: v, other: nextOther })
    }}
    onOtherChange={(t: string) => {
      setLocal('industry', { industry: industryValue, other: t })
    }}
    onBack={goBack}
    onContinue={() => {
      if (!industryValue) return
      return saveAndNext('industry', { industry: industryValue, other: industryOtherValue })
    }}
    progressPercent={progressPercent}
  />
)



}

if (stepKey === 'industry_experience') {
const industryExperienceValue = raw || ''


return (
  <IndustryExperienceStep
    value={industryExperienceValue}
    onChange={(v: string) => setLocal('industry_experience', v)}
    onBack={goBack}
    onContinue={() => saveAndNext('industry_experience', industryExperienceValue)}
    progressPercent={progressPercent}
  />
)



}

  if (stepKey === 'skills'){
  // Stored as JSON array: ["dev","marketing",...]
  const skillsValue = safeJson<Array<'dev' | 'marketing' | 'leadership' | 'other' | 'none'>>(raw) ?? []

  return (
    <SkillsStep
      value={skillsValue}
      onChange={(v: Array<'dev' | 'marketing' | 'leadership' | 'other' | 'none'>) =>
      setLocal('skills', v)
      }
      onBack={goBack}
      onContinue={() => saveAndNext('skills', skillsValue)}
      progressPercent={progressPercent}
    />
  )
}

if (stepKey === 'team_size') {
const teamSizeValue = raw ? Number(raw) : 1


return (
  <TeamSizeStep
    value={teamSizeValue}
    onChange={(v: number) => setLocal('team_size', String(v))}
    onBack={goBack}
    onContinue={() => saveAndNext('team_size', String(teamSizeValue))}
    progressPercent={progressPercent}
  />
)

}

if (stepKey === 'hours') {
const hoursValue = raw ? Number(raw) : 6
return (
  <HoursCommitmentStep
    value={hoursValue}
    onChange={(v: number) => setLocal('hours', String(v))}
    onBack={goBack}
    onContinue={() => saveAndNext('hours', String(hoursValue))}
    progressPercent={progressPercent}
  />
)
}

//fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 border rounded-lg bg-white">
        <p className="font-medium text-gray-800">Unknown step: {String(stepKey)}</p>
        <p className="text-sm text-gray-500 mt-2">
          Check your StepKey list in <code>lib/signupSteps.ts</code>.
        </p>
      </div>
    </div>
  )
}
