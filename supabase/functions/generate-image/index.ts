import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generate image function called')
    const { prompt, aspectRatio = '1:1' } = await req.json()
    
    if (!prompt) {
      throw new Error('Prompt is required')
    }

    console.log('Prompt received:', prompt)
    console.log('Aspect ratio:', aspectRatio)

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment')
      throw new Error('GEMINI_API_KEY not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing')
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Creating image description with Gemini...')

    // Use Gemini to enhance the prompt and then generate a placeholder
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a detailed, visual description for an image based on this prompt: "${prompt}". 

Make the description suitable for image generation, including:
- Visual style and composition
- Colors and lighting
- Setting and atmosphere
- Any specific elements or objects

Keep it under 100 words and focused on visual elements only.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 200,
        },
      }),
    })

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text())
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const enhancedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || prompt
    
    console.log('Enhanced prompt:', enhancedPrompt)

    // For now, we'll create a placeholder image since Gemini image generation isn't directly available
    // You can replace this with another image generation service like DALL-E, Midjourney API, or Stable Diffusion
    
    // Determine dimensions based on aspect ratio
    let width = 512
    let height = 512
    
    switch (aspectRatio) {
      case '16:9':
        width = 768
        height = 432
        break
      case '9:16':
        width = 432
        height = 768
        break
      case '4:3':
        width = 640
        height = 480
        break
      case '3:4':
        width = 480
        height = 640
        break
      default: // 1:1
        width = 512
        height = 512
    }

    // Generate a styled placeholder image with the enhanced description
    const placeholderUrl = `https://via.placeholder.com/${width}x${height}/6366f1/ffffff?text=${encodeURIComponent('AI Generated: ' + prompt.substring(0, 30))}`

    // Generate a simple colored image based on prompt content
    let backgroundColor = '6366f1' // Default blue
    let textColor = 'ffffff'
    
    // Simple color logic based on prompt keywords
    if (prompt.toLowerCase().includes('nature') || prompt.toLowerCase().includes('green') || prompt.toLowerCase().includes('forest')) {
      backgroundColor = '10b981' // Green
    } else if (prompt.toLowerCase().includes('sunset') || prompt.toLowerCase().includes('orange') || prompt.toLowerCase().includes('warm')) {
      backgroundColor = 'f59e0b' // Orange
    } else if (prompt.toLowerCase().includes('ocean') || prompt.toLowerCase().includes('blue') || prompt.toLowerCase().includes('water')) {
      backgroundColor = '3b82f6' // Blue
    } else if (prompt.toLowerCase().includes('purple') || prompt.toLowerCase().includes('magic')) {
      backgroundColor = '8b5cf6' // Purple
    }

    const finalImageUrl = `https://via.placeholder.com/${width}x${height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(prompt.substring(0, 50))}`
    
    // Create a simple HTML/CSS generated image using a data URL
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${backgroundColor}AA;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#${textColor}" text-anchor="middle" dominant-baseline="middle">
          ${prompt.length > 40 ? prompt.substring(0, 37) + '...' : prompt}
        </text>
        <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="12" fill="#${textColor}AA" text-anchor="middle">
          AI Generated Image
        </text>
      </svg>
    `
    
    const svgBase64 = btoa(svg)
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

    // Convert SVG to blob for upload
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
    
    // Generate unique filename
    const fileName = `ai-generated-${Date.now()}-${Math.random().toString(36).substring(2)}.svg`
    const filePath = `images/${fileName}`

    console.log('Uploading generated image to Supabase storage...')

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media-assets')
      .upload(filePath, svgBlob, {
        contentType: 'image/svg+xml',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Fallback to external placeholder
      return new Response(
        JSON.stringify({ 
          imageUrl: finalImageUrl,
          fileName: `placeholder-${Date.now()}.png`,
          prompt: prompt,
          enhancedPrompt: enhancedPrompt,
          isPlaceholder: true
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media-assets')
      .getPublicUrl(filePath)

    console.log('Image uploaded successfully:', publicUrl)

    return new Response(
      JSON.stringify({ 
        imageUrl: publicUrl,
        fileName: fileName,
        prompt: prompt,
        enhancedPrompt: enhancedPrompt
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error: any) {
    console.error('Error in generate-image function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate image',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})