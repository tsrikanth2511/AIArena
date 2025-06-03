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
    
    // Get API keys from environment variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the Edge Function environment')
    }

    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('PROJECT_ANON_KEY') ?? ''
    )

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
            text: `You are an expert code reviewer. Please evaluate this project against the following requirements and criteria. You MUST respond with ONLY a valid JSON object, no other text or markdown formatting.

Repository: ${repository.name} by ${repository.owner}

Requirements:
${challenge.requirements.map((req: string, i: number) => `${i + 1}. ${req}`).join('\n')}

Evaluation Criteria:
${challenge.evaluationCriteria.map((c: any) => `- ${c.name} (${c.weight}%): ${c.description}`).join('\n')}

Repository Contents:
${JSON.stringify(repositoryContents, null, 2)}

IMPORTANT: Respond with ONLY a JSON object in this exact format:
{
  "summary": "Brief 2-3 sentence summary of the project",
  "scores": {
    ${challenge.evaluationCriteria.map((c: any) => `"${c.name}": number`).join(',\n    ')}
  },
  "overallScore": number,
  "keyStrengths": ["List 2-3 main strengths"],
  "keyImprovements": ["List 2-3 main areas for improvement"]
}

Scoring guidelines:
1. Each criterion should be scored based on its weight percentage (e.g., if a criterion has 30% weight, score it out of 30)
2. The overallScore should be the sum of all individual criterion scores
3. Keep the evaluation concise and focus on the most important points.`
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
      
      // Clean up any potential markdown or extra text
      responseText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      // Find the first { and last } to extract just the JSON object
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON object found in response');
      }
      
      responseText = responseText.slice(firstBrace, lastBrace + 1);
      
      const evaluation = JSON.parse(responseText);
      
      // Validate the evaluation object structure
      if (!evaluation.summary || !evaluation.scores || !evaluation.overallScore || 
          !evaluation.keyStrengths || !evaluation.keyImprovements) {
        throw new Error('Invalid evaluation object structure');
      }
      
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
      throw new Error(`Invalid evaluation format from Gemini API: ${error.message}`)
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