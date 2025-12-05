import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { sign } from 'crypto'

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
    let reply: string

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
}
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
            current_phase: 'finished', //move to finished
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
