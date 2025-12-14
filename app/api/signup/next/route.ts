import { createServerSupabaseClient } from '@/lib/supabaseServer'

const PHASE = {
  WELCOME: 'welcome',
  IDEA: 'idea',
  PRODUCT_TYPE: 'product_type',
  AGE: 'age',
  PROBLEM: 'problem',
  TARGET_CUSTOMER: 'target_customer',
  INDUSTRY: 'industry',
  INDUSTRY_EXPERIENCE: 'industry_experience',
  SKILLS_START: 'skills_start',
  SKILLS_DEV: 'skills_dev',
  SKILLS_MKT: 'skills_mkt',
  SKILLS_LEAD: 'skills_lead',
  SKILLS_OTHER: 'skills_other',
  TEAM_SIZE: 'team_size',
  HOURS: 'hours_commitment',
  HOURS_CONFIRM: 'hours_confirm',
  FINISHED: 'finished'
} as const 

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userMessage = body.message as string

    const supabase = createServerSupabaseClient()

    // TEMP: fake user id just for dev
    const fakeUserId = '00000000-0000-0000-0000-000000000001'

    // 1. Try to load signup_state for this user
    const { data: existingState, error: selectError } = await supabase
      .from('signup_states')
      .select('*')
      .eq('user_id', fakeUserId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "No rows found"
      console.error('Error selecting signup_state:', selectError)

      return new Response(
        JSON.stringify({
          error: 'Error selecting signup state',
          details: selectError.message ?? selectError,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    let signupState = existingState
    // 2. If none exists, create initial state
    if (!signupState) {
      const { data: newState, error: insertError } = await supabase
        .from('signup_states')
        .insert({
          user_id: fakeUserId,
          current_phase: 'welcome',
          user_profile: {},
          founder_profile: {},
          idea_profile: {},
          constraints: {},
          preferences: {},
          scores: {},
        })
        .select('*')
        .single()

      if (insertError) {
        console.error('Error creating signup state:', insertError)

        return new Response(
          JSON.stringify({
            error: 'Error creating signup state',
            details: insertError.message ?? insertError,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      signupState = newState
    }

    // 3. Decide what to do based on current_phase
    let reply: string //! if there is an error look here

    if (signupState.current_phase === 'welcome') {
      // Treat the userMessage as their name
      const name = userMessage.trim()

      // Update user_profile with name
      const newUserProfile = {
        ...(signupState.user_profile || {}),
        name,
      }

      // Update row: set name + advance phase
      const { data: updated, error: updateError } = await supabase
        .from('signup_states')
        .update({
          user_profile: newUserProfile,
          current_phase: 'idea', //move to q1
          updated_at: new Date().toISOString(),
        })
        .eq('id', signupState.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating signup state:', updateError)
        return new Response('Error updating signup state', { status: 500 })
      }

      const reply = `Nice to meet you, ${name}!`+
      `Now, let's start with your idea.\n\n`+
       `Q1) What is your startup idea?\n` +
    `Please use this structure:\n` +
    `"[Startup Name] is a [short description of what it is] that [what it does] by [how it works in one simple phrase]."`


      return new Response(
        JSON.stringify({
          reply,
          signupState: updated,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } 
    else if (signupState.current_phase === 'idea') {
        //q1: store raw idea pitch
        const ideaAnswer = userMessage.trim()

        const newIdeaProfile = { //!if error look here
            ...(signupState.idea_profile || {}),
            raw_pitch: ideaAnswer,
        }

        const { data: updated, error: updateError } = await supabase
        .from('signup_states')
        .update({
          idea_profile: newIdeaProfile,
          current_phase: 'product_type', //move to q2
          updated_at: new Date().toISOString(),
        })
        .eq('id', signupState.id)
        .select('*')
        .single()

        if (updateError) {
        console.error('Error updating signup state:', updateError)
        return new Response('Error updating signup state', { status: 500 })
        }

        const reply =  "Got it, thanks for sharing your idea.\n\n" +
        "Q2) Is this a web app, mobile app, both, or something else?\n" +
        "You can answer with:\n" +
        '- "web app"\n' +
        '- "mobile app"\n' +
        '- "both"\n' +
        '- or a short description if it doesn’t fit those.'

        return new Response(
        JSON.stringify({
          reply,
          signupState: updated,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } else if (signupState.current_phase === 'product_type') {
  const answer = userMessage.toLowerCase().trim()

  let productType: 'web app' | 'mobile app' | 'both' | 'other' = 'other'

  const hasWeb = answer.includes('web')
  const hasMobile = answer.includes('mobile')

  if (hasWeb && hasMobile) {
    productType = 'both'
  } else if (hasWeb) {
    productType = 'web app'
  } else if (hasMobile) {
    productType = 'mobile app'
  } else {
    productType = 'other'
  }

  const newIdeaProfile = {
    ...(signupState.idea_profile || {}),
    product_type: productType,
    product_type_raw: userMessage.trim(), // keep raw answer too
  }

  const { data: updated, error: updateError } = await supabase
    .from('signup_states')
    .update({
      idea_profile: newIdeaProfile,
      current_phase: 'age', // go to Q3
      updated_at: new Date().toISOString(),
    })
    .eq('id', signupState.id)
    .select('*')
    .single()

  if (updateError) {
    console.error('Error updating signup state:', updateError)
    return new Response('Error updating signup state', { status: 500 })
  }

  const reply =
    "Thanks, that helps.\n\n" +
    "Q3) How old are you (in years)? Please answer with a number like 17 or 22."

  return new Response(
    JSON.stringify({
      reply,
      signupState: updated,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
} //Start of age question
 else if (signupState.current_phase === 'age') {
        const trimmed = userMessage.trim()
        const ageNumber = parseInt(trimmed, 10)

        // Basic validation must be a number between 10 and 100 
        if (Number.isNaN(ageNumber) || ageNumber < 10 || ageNumber > 100) {
           const  reply = "Hmm, that doesn't seem like a valid age. Please answer with a number between 10 and 100."

            return new Response(
            JSON.stringify({
              reply,
              signupState,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        const newUserProfile = {
            ...(signupState.user_profile || {}),
            age: ageNumber,
        }

        const { data: updated, error: updateError } = await supabase
        .from('signup_states')
        .update({
            user_profile: newUserProfile,
            current_phase: PHASE.PROBLEM, //move to finished
            updated_at: new Date().toISOString(),
        })
        .eq('id', signupState.id)
        .select('*')
        .single()

        if (updateError) {
        console.error('Error updating signup state:', updateError)
        return new Response('Error updating signup state', { status: 500 })
        }

        const reply = 
        "Thanks.\n\n" +
    "Q4) What is the problem your startup solves? Please describe the problem your target customer experiences, not just your features."

        return new Response(
        JSON.stringify({
          reply,
          signupState: updated,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
      // Start of quetsion 4
    } else if (signupState.current_phase === PHASE.PROBLEM) {
        const problem = userMessage.trim()

        //tiny validation: must be a little detailed 
        if (problem.length < 20) {
          const reply = 'could you please provide more details about the problem your startup aims to solve?.\n' +
          'Ex: "college studentrs srtuggle to ____ because ___.'
          return Response.json({ reply, signupState})
        }

        const newIdeaProfile = {
          ...(signupState.idea_profile || {}),
          problem,
        }

        const { data: updated, error: updateError } = await supabase
        .from('signup_states')
        .update({
          idea_profile: newIdeaProfile,
          current_phase: PHASE.TARGET_CUSTOMER, //move to q5
          updated_at: new Date().toISOString(),
        })
        .eq('id', signupState.id)
        .select('*')
        .single()

        if (updateError){
          console.error('Error updating problem', updateError)
          return new Response ('Error updating problem', { status: 500})
        }

        const reply = 
        "Got it. \n\n" +
        "Q5) Who is your target customer?\n"+
        "Please use this exact structure:\n"+
        "Our target customer is a [age range] [type of person], currently [specific situation], who cares about [their priority], and is looking for [specific outcome]."

        return Response.json({ reply, signupState: updated})
      
        //start of Q5    
  } else if (signupState.current_phase === PHASE.TARGET_CUSTOMER) {
    const tc = userMessage.trim()

    // tine validation 
    const mustHave = [
      'our target customer is',
      'currently',
      'who cares about',
      'looking for',
    ]

    const lower = tc.toLowerCase()
    const missing = mustHave.filter((phrase) => !lower.includes(phrase))

    if (missing.length > 0){
      const reply = 
       "Almost — please rewrite using the exact structure (it improves the accuracy a lot):\n\n" +
      "Our target customer is a [age range] [type of person], currently [specific situation], who cares about [their priority], and is looking for [specific outcome]."
      return Response.json({ reply, signupState})
    }

    const newIdeaProfile = {
      ...(signupState.idea_profile || {}),
      target_customer: tc, 
    }

    const { data: updated, error: updateError } = await supabase
      .from('signup_states')
      .update({
        idea_profile: newIdeaProfile,
        current_phase: PHASE.INDUSTRY, //move to q6
        updated_at: new Date().toISOString(),
      })
      .eq('id', signupState.id)
      .select('*')
      .single()

      if (updateError){
        console.error('Error updating target customer', updateError)
        return new Response ('Error updating target customer', { status: 500} )
      }

      // in the future this reply will be Ai generated based on response 
      const reply = 
        "Perfect.\n\n" +
       "Q6) What industry does this fall under?\n" +
        "You can answer with one of these options:\n" +
        "1) Health Tech\n" +
        "2) Fin Tech\n" +
        "3) Ed Tech\n" +
        "4) E-commerce\n" +
        "5) SaaS\n" +
        "6) Other (please specify)"

        return Response.json({ reply, signupState: updated})
      
        //start of q6
  } else if (signupState.current_phase === PHASE.INDUSTRY) {
    const answer = userMessage.trim().toLowerCase()

    const map: Record<string, string> = {
      '1': 'Health Tech',
      '2': 'Fin Tech',
      '3': 'Ed Tech',
      '4': 'E-commerce',
      '5': 'SaaS',
      '6': 'Other',
    }

    const industry = map[answer] ?? (userMessage.trim().length > 0 ? userMessage.trim() : null)

    if (!industry) {
      const reply = "PLease reply with a number (1-8) or type the industry in your own words"
      return Response.json({ reply, signupState })
    }

    const newIdeaProfile = {
      ...(signupState.idea_profile || {}),
      industry,
    }

    const {data: updated, error: updateError } = await supabase
    .from('signup_states')
    .update({
      idea_profile: newIdeaProfile,
      current_phase: PHASE.INDUSTRY_EXPERIENCE, //move to q7
      updated_at: new Date().toISOString(),
    })
    .eq('id', signupState.id)
    .select('*')
    .single()

    if (updateError) {
      console.error(updateError)
      return new Response('Error updating industry', { status: 500})
    }

    const reply = 
    "got it. \n\n" +
    "Q7) Do you have any prior experience in this industry? If so, please briefly describe."
    "You can mention: work experience, projects, startups (success or failure), field of study, certificates, or awards."

    return Response.json({ reply, signupState: updated })
  

    //start of q7
  } else if (signupState.current_phase === PHASE.INDUSTRY_EXPERIENCE) {
    const exp = userMessage.trim()

    const newFounderProfile = {
      ...(signupState.founder_profile || {}),
      industry_experince: exp,
    }

    const { data: updated, error: updateError } = await supabase
      .from('signup_states')
      .update({
        founder_profile: newFounderProfile,
        current_phase: PHASE.SKILLS_START, //move to q8
        updated_at: new Date().toISOString(),
      })
      .eq('id', signupState.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating indsutry experince', updateError)
      return new Response('Error updating industry experience', { status: 500 })
    }

    const reply = 
      "Thanks.\n\n" +
    "Q8) What are your current skills?\n" +
    "Pick one or more (reply with letters like: A,C):\n" +
    "A) Development (coding/product)\n" +
    "B) Marketing (growth/content)\n" +
    "C) Leadership (teams/ops)\n" +
    "D) Other / Not sure"

    return Response.json({ reply, signupState: updated })

    //Start of determing skills aka Q8
  } else if (signupState.current_phase === PHASE.SKILLS_START) {
    const raw = userMessage.trim()
    const upper = raw.toUpperCase()

    const selected = {
      dev: upper.includes('A'),
      mkt: upper.includes('B'),
      lead: upper.includes('C'),
      other: upper.includes('D'),
    }

    //If they typed a free response instead of letters, treat it as "other"
    const pickedAny = selected.dev || selected.mkt || selected.lead || selected.other

    const newFounderProfile = {
      ...(signupState.founder_profile || {}),
      skills_path_selection: pickedAny ? selected : {other: true},
      skills_freeform_if_any: pickedAny ? null : raw,
    }

    //Decide next phase; dev first, then mkt, then lead, then else other 
    type PhaseValue = (typeof PHASE)[keyof typeof PHASE]

    let nextPhase: PhaseValue = PHASE.SKILLS_OTHER
    if (selected.dev) nextPhase = PHASE.SKILLS_DEV
    else if (selected.mkt) nextPhase = PHASE.SKILLS_MKT
    else if (selected.lead) nextPhase = PHASE.SKILLS_LEAD
    else nextPhase = PHASE.SKILLS_OTHER

    const { data: updated, error: updateError } = await supabase
      .from('signup_states')
      .update({
        founder_profile: newFounderProfile,
        current_phase: nextPhase,
        updated_at: new Date().toISOString(),
      })
      .eq('id', signupState.id)
      .select('*')
      .single()

      if (updateError){
        console.error(updateError)
        return new Response ('Error updating skills', { status: 500} )
      }

      const reply = 
      nextPhase === PHASE.SKILLS_DEV
      ? 'Dev skills: What languages/tools do you know, and do you have any project links?'
     : nextPhase === PHASE.SKILLS_MKT
    ? 'Marketing skills: What channels/tools have you used, and any results/links?'
     : nextPhase === PHASE.SKILLS_LEAD
    ? 'Leadership skills: What roles have you had, team size, and what did you ship/achieve?'
    : 'Tell me what you’re good at with specific examples (projects, jobs, tools).'

    return Response.json({ reply, signupState: updated })
  }
  
    
    else {
      // For now, other phases just echo
      reply = `Got your message: "${userMessage}". Current phase: ${signupState.current_phase}`

      return new Response(
        JSON.stringify({
          reply,
          signupState,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Unexpected error handling signup:', error)

    return new Response(
      JSON.stringify({
        error: 'Unexpected error processing signup',
        details:
          error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
