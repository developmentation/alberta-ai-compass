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

    // Create a readable stream for the response - matching gemini-stream pattern
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          console.log('Starting gemini-short-answer stream');
          
          const reader = response.body?.getReader();
          if (!reader) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "Error: No response from AI service" })}\n\n`));
            controller.enqueue(encoder.encode("event: complete\ndata: {}\n\n"));
            controller.close();
            return;
          }

          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Gemini stream complete');
              break;
            }
            
            const chunk = new TextDecoder().decode(value);
            console.log('Raw Gemini chunk:', chunk);
            buffer += chunk;
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;
              
              try {
                const data = JSON.parse(trimmedLine);
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                  let text = data.candidates[0].content.parts[0].text;
                  text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                  console.log('Found Gemini text:', text);
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  console.log('Streamed evaluation chunk');
                }
              } catch (e) {
                if (trimmedLine.includes('"text":')) {
                  const match = trimmedLine.match(/"text":\s*"((?:[^"\\]|\\.)*)"/);
                  if (match) {
                    let text = match[1];
                    text = text
                      .replace(/\\"/g, '"')
                      .replace(/\\n/g, '\n')
                      .replace(/\\r/g, '\r')
                      .replace(/\\t/g, '\t')
                      .replace(/\\\\/g, '\\');
                    
                    console.log('Found text pattern:', text);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                }
              }
            }
          }
          
          controller.enqueue(encoder.encode("event: complete\ndata: {}\n\n"));
          console.log('Stream completed for short answer evaluation');
          
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: `Error: ${error.message}` })}\n\n`));
          controller.enqueue(encoder.encode("event: complete\ndata: {}\n\n"));
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