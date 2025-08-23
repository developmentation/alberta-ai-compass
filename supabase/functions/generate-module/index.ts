import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const body = await req.json();
    
    // Handle Ask AI requests
    if (body.askAI) {
      const { content, sectionTitle } = body;
      const aiPrompt = `You are an educational assistant. Explain the following section content in a simple, easy-to-understand way. Focus on making complex topics accessible:

Section: ${sectionTitle}
Content: ${content}

Please provide a clear, friendly explanation that helps learners understand this material better.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: aiPrompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate explanation.';

      return new Response(JSON.stringify({ explanation }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle image generation requests  
    if (body.generateImage) {
      // For now, return a placeholder - you can integrate with an image generation service
      const imageUrl = `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop`;
      
      return new Response(JSON.stringify({ imageUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle module generation (existing code)
    const { prompt, preserveMetadata } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an AI assistant that creates comprehensive educational modules. You must return a valid JSON object following this exact structure:

{
  "id": "unique-module-id",
  "name": "module-slug-name",
  "title": "${preserveMetadata?.title || 'Module Title'}",
  "description": "${preserveMetadata?.description || 'A brief overview of the module content and purpose.'}",
  "difficulty": "${preserveMetadata?.difficulty || 'beginner'}",
  "duration": 15,
  "language": "${preserveMetadata?.language || 'en'}",
  "learningOutcomes": [
    "Understand basic concepts",
    "Apply knowledge practically",
    "Demonstrate proficiency"
  ],
  "tags": ["relevant", "keywords", "here"],
  "sections": [
    {
      "id": 1,
      "title": "Section Title",
      "content": [
        {
          "type": "text",
          "value": "Educational content here"
        },
        {
          "type": "list",
          "value": [
            "Step 1: First instruction",
            "Step 2: Second instruction",
            "Step 3: Third instruction"
          ]
        },
        {
          "type": "quiz",
          "quizType": "multiple-choice",
          "question": "What is the correct answer?",
          "options": [
            "Option A",
            "Option B",
            "Option C"
          ],
          "correctAnswer": "Option A",
          "feedback": {
            "correct": "Great job! That's correct.",
            "incorrect": "Try again: The correct answer is Option A."
          }
        }
      ]
    }
  ],
  "status": "draft",
  "createdAt": "${new Date().toISOString()}",
  "updatedAt": "${new Date().toISOString()}",
  "extensions": {
    "customField": "Any additional metadata"
  }
}

IMPORTANT: Use the preserved metadata (title, description, difficulty, language) provided above. Create a comprehensive module with multiple sections, varied content types (text, lists, quizzes), and ensure all quiz types (multiple-choice, true-false, short-answer) are included. Make the content educational and engaging.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Request: ${prompt}\n\nPlease create a comprehensive educational module based on this request. Return ONLY valid JSON, no additional text or formatting.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedText = data.candidates[0].content.parts[0].text;

    // Clean up the response to ensure it's valid JSON
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to parse as JSON to validate
    let moduleData;
    try {
      moduleData = JSON.parse(generatedText);
      
      // Ensure preserved metadata is maintained
      if (preserveMetadata) {
        moduleData.title = preserveMetadata.title || moduleData.title;
        moduleData.description = preserveMetadata.description || moduleData.description;
        moduleData.difficulty = preserveMetadata.difficulty || moduleData.difficulty;
        moduleData.language = preserveMetadata.language || moduleData.language;
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Generated text:', generatedText);
      
      // Create a fallback with preserved metadata
      moduleData = {
        id: `module-${Date.now()}`,
        name: preserveMetadata?.title?.toLowerCase().replace(/\s+/g, '-') || 'generated-module',
        title: preserveMetadata?.title || 'AI Generated Module',
        description: preserveMetadata?.description || 'Learning module generated by AI',
        difficulty: preserveMetadata?.difficulty || 'beginner',
        duration: 30,
        language: preserveMetadata?.language || 'en',
        learningOutcomes: [
          "Understand key concepts",
          "Apply knowledge practically",
          "Demonstrate proficiency"
        ],
        tags: ["ai-generated", "learning"],
        sections: [
          {
            id: 1,
            title: "Introduction",
            content: [
              {
                type: "text",
                value: "This module will help you learn about the requested topic. Content is being generated based on your prompt."
              }
            ]
          }
        ],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extensions: {}
      };
    }

    return new Response(JSON.stringify({ moduleData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-module function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});