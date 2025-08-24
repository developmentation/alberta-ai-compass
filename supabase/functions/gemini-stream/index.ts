import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RequestBody {
  message: string;
  userEmail: string;
  stepType: 'recommendation_check' | 'content_analysis' | 'final_response' | 'general_chat';
  contentData?: any[];
  selectedContent?: any[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, accept',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { message, userEmail, stepType, contentData, selectedContent } = body;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Gemini API key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the prompt based on step type
    let fullPrompt: string;
    
    switch (stepType) {
      case 'recommendation_check':
        fullPrompt = `Analyze this user message and determine if they are asking for learning recommendations or if their question would benefit from learning content recommendations. 

User message: "${message}"

Return ONLY "true" or "false" - nothing else. Return "true" if:
- They explicitly ask for learning recommendations
- They ask how to learn something
- They ask about tools, resources, or materials for a topic
- Their question would be best answered by recommending learning content
- They mention wanting to understand or get better at something

Return "false" if:
- They're asking a direct factual question
- They want definitions or explanations
- They're having a general conversation
- They're asking about something unrelated to learning`;
        break;

      case 'content_analysis':
        fullPrompt = `You are a learning recommendation engine. Analyze the user's request and the available learning content to recommend the most relevant items.

User request: "${message}"

Available learning content:
${JSON.stringify(contentData, null, 2)}

CRITICAL: You MUST return ONLY a valid JSON array. Do not include any explanatory text, markdown formatting, or additional content before or after the JSON. Your response must be pure JSON that can be parsed directly.

Return a JSON array of objects with "type" and "id" fields for the most relevant learning content (maximum 5 items). Only include content that directly relates to the user's learning goals.

Required format (return ONLY this, nothing else):
[
  {"type": "modules", "id": "uuid-here"},
  {"type": "tools", "id": "uuid-here"},
  {"type": "learning_plans", "id": "uuid-here"}
]

Be selective - only recommend highly relevant content. RETURN ONLY THE JSON ARRAY, NO OTHER TEXT.`;
        break;

      case 'final_response':
        fullPrompt = `You are a helpful AI learning mentor. The user asked: "${message}"

Based on their request, I've identified these relevant learning resources:
${JSON.stringify(selectedContent, null, 2)}

Provide a friendly, helpful response that:
1. Acknowledges their learning request
2. Explains why these specific resources will help them
3. Gives brief descriptions of each recommended resource
4. Encourages them to explore the content

Keep the response conversational and motivating. The resources will be displayed as clickable cards below your message.`;
        break;

      case 'general_chat':
      default:
        const includeHistory = stepType === 'general_chat' && message.includes('Previous conversation:');
        
        if (includeHistory) {
          fullPrompt = `You are a helpful AI learning mentor. The user is having an ongoing conversation with you. Consider the conversation history when providing your response.

${message}

Provide a helpful response that addresses their question directly. Keep responses conversational and acknowledge the context from previous messages when relevant.`;
        } else {
          fullPrompt = `You are a helpful AI learning mentor. Provide helpful, accurate information in response to the user's question. Keep responses concise but informative.

User message: "${message}"

Provide a helpful response that addresses their question directly.`;
        }
        break;
    }

    console.log(`Processing Gemini request for step: ${stepType}`);
    console.log(`User email: ${userEmail}`);

    // Save user message to database
    if ((stepType === 'general_chat' || stepType === 'recommendation_check') && !message.includes('Previous conversation:')) {
      await supabase
        .from('ai_mentor')
        .insert({
          user_email: userEmail,
          role: 'user',
          content: stepType === 'general_chat' && message.includes('Current message:') 
            ? message.split('Current message: ')[1] 
            : message
        });
    }

    // Call Gemini API for streaming response
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: "Failed to generate content" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let fullResponseText = '';

    // Create a direct stream from Gemini response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          console.log('Starting Gemini stream for step:', stepType);
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ stepType, finalPrompt: fullPrompt })}\n\n`));
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
                  
                  fullResponseText += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  console.log('Streamed chunk for step:', stepType);
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
                    fullResponseText += text;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                }
              }
            }
          }
          
          // Save assistant response to database (for general chat and final response)
          if ((stepType === 'general_chat' || stepType === 'final_response') && fullResponseText.trim()) {
            await supabase
              .from('ai_mentor')
              .insert({
                user_email: userEmail,
                role: 'assistant',
                content: fullResponseText.trim()
              });
          }
          
          controller.enqueue(encoder.encode("event: complete\ndata: {}\n\n"));
          console.log('Stream completed for step:', stepType);
          
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: `Error: ${error.message}` })}\n\n`));
          controller.enqueue(encoder.encode("event: complete\ndata: {}\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Request error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});