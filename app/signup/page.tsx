'use client'

import { useState } from 'react'
import AgeStep from './Steps/AgeStep'

export default function SignupPage() {
  const [age, setAge] = useState(18)

  async function handleContinue() {
   // for now sned age to your existing API shape
   const res = await fetch ('/api/signup/next', {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({message: String(age)}),
   })

   const data = await res.json()

   // temp: just log what phase comes next

   console.log('API reply:', data.reply)
   console.log('Next Phase:', data.signupState?.current_phase)
  }

  return (
    <AgeStep 
      value ={age}
      onChange={setAge}
      onBack = {() => console.log('Back pressed')}
      onContinue={handleContinue}
    />
  )
}
