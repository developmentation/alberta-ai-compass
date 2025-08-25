import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const {
      moduleTitle,
      moduleDescription,
      sectionTitle,
      question,
      expectedAnswer,
      userAnswer,
      language = 'en',
      languageName = 'English'
    } = await req.json();

    console.log('Evaluating short answer:', {
      question,
      expectedAnswer: expectedAnswer?.substring(0, 100) + '...',
      userAnswer: userAnswer?.substring(0, 100) + '...',
      language
    });

    // Construct prompt for Gemini to evaluate the answer
    const prompt = `You are an AI tutor evaluating a student's answer in a learning module. Your role is to provide encouraging, constructive feedback.

Module Context:
- Title: ${moduleTitle}
- Description: ${moduleDescription}
- Section: ${sectionTitle}
- Language: ${languageName}

Question: ${question}

Expected Answer: ${expectedAnswer}

Student's Answer: ${userAnswer}

Instructions:
1. Evaluate whether the student's answer demonstrates understanding of the key concepts
2. Provide encouraging feedback regardless of correctness
3. If the answer is correct or shows good understanding, congratulate them and highlight what they did well
4. If the answer needs improvement, gently point out what could be better while acknowledging any correct elements
5. Provide brief educational insights or tips to help them learn
6. Keep your response conversational and supportive (2-4 sentences)
7. Respond in ${languageName}

Your evaluation:`;

    // Call Gemini API with streaming
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${geminiApiKey}`, {
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
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('[') || line.startsWith(',')) {
                try {
                  // Remove leading comma and parse JSON
                  const cleanLine = line.startsWith(',') ? line.slice(1) : line;
                  const data = JSON.parse(cleanLine);
                  
                  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = data.candidates[0].content.parts[0].text;
                    console.log('Streaming text:', text);
                    
                    // Send the text chunk as server-sent event
                    const sseData = `data: ${JSON.stringify({ text })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(sseData));
                  }
                } catch (parseError) {
                  // Ignore parsing errors for malformed chunks
                  console.log('Parse error (ignored):', parseError);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream reading error:', error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in gemini-short-answer function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});