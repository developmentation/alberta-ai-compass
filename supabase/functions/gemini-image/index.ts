import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, count = 3 } = await req.json()
    console.log('Generating images for prompt:', prompt)

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const images = []

    // Generate the requested number of images
    for (let i = 0; i < count; i++) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            temperature: 0.7,
          }
        })
      })

      if (!response.ok) {
        console.error(`Gemini API error for image ${i + 1}:`, response.status, await response.text())
        continue
      }

      const data = await response.json()
      console.log(`Generated image ${i + 1} response:`, JSON.stringify(data, null, 2))

      // Extract image data from the response
      const parts = data.candidates?.[0]?.content?.parts || []
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png'
          const imageData = `data:${mimeType};base64,${part.inlineData.data}`
          images.push(imageData)
          break // Only take the first image from this generation
        }
      }
    }

    console.log(`Successfully generated ${images.length} images`)

    return new Response(
      JSON.stringify({ images }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating images:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate images', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})