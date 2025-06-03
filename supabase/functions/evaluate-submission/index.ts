/// <reference types="https://deno.land/x/deno@v1.37.1/mod.d.ts" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { repository, challenge } = await req.json()
    
    // Get Gemini API key from environment variable
    const geminiApiKey = 'AIzaSyAs248LRx5vA5NKfEkih9HolO7ydHOQWUI'
    if (!geminiApiKey) {
      throw new Error('Gemini API key is not configured in the Edge Function environment')
    }

    // Create Supabase client
    const supabaseClient = createClient('', '');

    // List all files in the repository folder
    const { data: files, error: listError } = await supabaseClient.storage
      .from('repositories')
      .list(repository.folderName)

    if (listError) {
      console.error('Error listing files:', listError)
      throw new Error('Failed to list repository files')
    }

    // Read all files
    const repositoryContents = []
    for (const file of files) {
      const { data: content, error: readError } = await supabaseClient.storage
        .from('repositories')
        .download(`${repository.folderName}/${file.name}`)

      if (readError) {
        console.error(`Error reading file ${file.name}:`, readError)
        continue
      }

      const text = new TextDecoder().decode(await content.arrayBuffer())
      repositoryContents.push({
        path: file.metadata?.originalPath || file.name,
        content: text
      })
    }

    // Send to Gemini for evaluation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert code reviewer. Please evaluate this project against the following requirements and criteria:

Repository: ${repository.name} by ${repository.owner}

Requirements:
${challenge.requirements.map((req: string, i: number) => `${i + 1}. ${req}`).join('\n')}

Evaluation Criteria:
${challenge.evaluationCriteria.map((c: any) => `- ${c.name} (${c.weight}%): ${c.description}`).join('\n')}

Repository Contents:
${JSON.stringify(repositoryContents, null, 2)}

Please provide a concise evaluation in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary of the project",
  "scores": {
    "SoloChallengesCatalogue": number,
    "UserOnboarding": number,
    "SubmissionPipeline": number,
    "HybridLeaderboard": number,
    "BadgingRecognition": number
  },
  "overallScore": number,
  "keyStrengths": ["List 2-3 main strengths"],
  "keyImprovements": ["List 2-3 main areas for improvement"]
}

Keep the evaluation concise and focus on the most important points.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10000,
        }
      }),
    })

    const data = await response.json()
    console.log('Gemini API Response:', data)

    if (!response.ok) {
      console.error('Gemini API Error Details:', data)
      throw new Error(`Gemini API error: ${data.error?.message || JSON.stringify(data)}`)
    }

    if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
      throw new Error('The repository content is too large for evaluation. Please try with a smaller repository or fewer files.')
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API Response:', data)
      throw new Error('Invalid response from Gemini API')
    }

    // Parse the JSON response
    try {
      let responseText = data.candidates[0].content.parts[0].text;
      
      // Clean up markdown formatting if present
      responseText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      const evaluation = JSON.parse(responseText);
      return new Response(
        JSON.stringify({ 
          success: true,
          evaluation: evaluation
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (error) {
      console.error('Failed to parse evaluation JSON:', error)
      console.error('Raw response:', data.candidates[0].content.parts[0].text)
      throw new Error('Invalid evaluation format from Gemini API')
    }
  } catch (error) {
    console.error('Error in evaluate-submission function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 