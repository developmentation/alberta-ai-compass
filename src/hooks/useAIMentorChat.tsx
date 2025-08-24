import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendedContent?: any[];
}

export function useAIMentorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { user } = useAuth();

  // Load chat history on mount
  useEffect(() => {
    if (user?.email) {
      loadChatHistory();
    }
  }, [user?.email]);

  const loadChatHistory = async () => {
    if (!user?.email) return;
    
    try {
      console.log('📚 Loading chat history for:', user.email);
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from('ai_mentor')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: true });

      console.log('📚 Chat history response:', { data, error });
      
      if (error) {
        console.error('❌ Database error loading chat history:', error);
        throw error;
      }

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.created_at,
      })) || [];

      console.log('✅ Formatted messages:', formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('💥 Error loading chat history:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      // Don't show error to user for chat history - just start with empty chat
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const resetChat = async () => {
    if (!user?.email) return;
    
    try {
      await supabase
        .from('ai_mentor')
        .delete()
        .eq('user_email', user.email);
      
      setMessages([]);
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!user?.email || loading) return;

    console.log('🚀 Starting sendMessage with:', { message, userEmail: user.email });
    setLoading(true);
    
    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('📡 Making request to gemini-stream for recommendation check...');
      // Step 1: Check if this is a learning recommendation request
      const recommendationResponse = await fetch('https://hzttqloyamcivctsfxkk.supabase.co/functions/v1/gemini-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dHRxbG95YW1jaXZjdHNmeGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NzE5MDIsImV4cCI6MjA3MTU0NzkwMn0.kOaKsCgwsWYLWbloN1haekp5aJ0Fn2pfaYIgOyv3ENQ`,
        },
        body: JSON.stringify({
          message,
          userEmail: user.email,
          stepType: 'recommendation_check'
        }),
      });

      console.log('📡 Recommendation response status:', recommendationResponse.status);
      if (!recommendationResponse.ok) {
        console.error('❌ Recommendation response failed:', recommendationResponse.status, recommendationResponse.statusText);
        throw new Error(`Failed to check for recommendations: ${recommendationResponse.status}`);
      }

      let recommendationResult = '';
      const reader = recommendationResponse.body?.getReader();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.text) {
                  recommendationResult += data.text;
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      const isRecommendationRequest = recommendationResult.trim().toLowerCase() === 'true';
      console.log('✅ Recommendation check result:', { recommendationResult, isRecommendationRequest });

      if (isRecommendationRequest) {
        // Step 2: Get all learning content and analyze
        const contentData = await fetchAllLearningContent();
        
        const analysisResponse = await fetch('https://hzttqloyamcivctsfxkk.supabase.co/functions/v1/gemini-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dHRxbG95YW1jaXZjdHNmeGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NzE5MDIsImV4cCI6MjA3MTU0NzkwMn0.kOaKsCgwsWYLWbloN1haekp5aJ0Fn2pfaYIgOyv3ENQ`,
          },
          body: JSON.stringify({
            message,
            userEmail: user.email,
            stepType: 'content_analysis',
            contentData
          }),
        });

        let analysisResult = '';
        const analysisReader = analysisResponse.body?.getReader();
        if (analysisReader) {
          while (true) {
            const { done, value } = await analysisReader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  if (data.text) {
                    analysisResult += data.text;
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        }

        // Parse recommended content IDs
        let recommendedIds: any[] = [];
        try {
          recommendedIds = JSON.parse(analysisResult.trim());
        } catch (e) {
          console.error('Failed to parse recommended content:', e);
        }

        // Fetch full details of recommended content
        const recommendedContent = await fetchRecommendedContent(recommendedIds);

        // Step 3: Generate final response with recommendations
        await streamFinalResponse(message, recommendedContent);
        
      } else {
        // Regular chat
        await streamGeneralResponse(message);
      }
    } catch (error) {
      console.error('💥 Error sending message:', error);
      console.error('💥 Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLearningContent = async () => {
    const [modules, news, tools, prompts, learningPlans] = await Promise.all([
      supabase.from('modules').select('id, name, description').eq('status', 'published'),
      supabase.from('news').select('id, title, description').eq('status', 'published').eq('is_active', true),
      supabase.from('tools').select('id, name, description').eq('status', 'published'),
      supabase.from('prompt_library').select('id, name, description').eq('status', 'published'),
      supabase.from('learning_plans').select('id, name, description').eq('status', 'published'),
    ]);

    return [
      ...(modules.data?.map(item => ({ ...item, type: 'modules' })) || []),
      ...(news.data?.map(item => ({ ...item, name: item.title, type: 'news' })) || []),
      ...(tools.data?.map(item => ({ ...item, type: 'tools' })) || []),
      ...(prompts.data?.map(item => ({ ...item, type: 'prompts' })) || []),
      ...(learningPlans.data?.map(item => ({ ...item, type: 'learning_plans' })) || []),
    ];
  };

  const fetchRecommendedContent = async (recommendedIds: any[]) => {
    const fetchedContent = [];

    // Fetch content for each type separately with proper typing
    for (const item of recommendedIds) {
      try {
        let data = null;
        
        switch (item.type) {
          case 'modules':
            const modulesResult = await supabase
              .from('modules')
              .select('*')
              .eq('id', item.id)
              .single();
            data = modulesResult.data;
            break;
            
          case 'news':
            const newsResult = await supabase
              .from('news')
              .select('*')
              .eq('id', item.id)
              .single();
            data = newsResult.data;
            break;
            
          case 'tools':
            const toolsResult = await supabase
              .from('tools')
              .select('*')
              .eq('id', item.id)
              .single();
            data = toolsResult.data;
            break;
            
          case 'prompts':
            const promptsResult = await supabase
              .from('prompt_library')
              .select('*')
              .eq('id', item.id)
              .single();
            data = promptsResult.data;
            break;
            
          case 'learning_plans':
            const plansResult = await supabase
              .from('learning_plans')
              .select('*')
              .eq('id', item.id)
              .single();
            data = plansResult.data;
            break;
        }
        
        if (data) {
          fetchedContent.push({ ...data, type: item.type });
        }
      } catch (error) {
        console.error(`Error fetching ${item.type} content:`, error);
      }
    }

    return fetchedContent;
  };

  const streamGeneralResponse = async (message: string) => {
    const response = await fetch('https://hzttqloyamcivctsfxkk.supabase.co/functions/v1/gemini-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dHRxbG95YW1jaXZjdHNmeGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NzE5MDIsImV4cCI6MjA3MTU0NzkwMn0.kOaKsCgwsWYLWbloN1haekp5aJ0Fn2pfaYIgOyv3ENQ`,
      },
      body: JSON.stringify({
        message,
        userEmail: user!.email,
        stepType: 'general_chat'
      }),
    });

    await processStreamResponse(response);
  };

  const streamFinalResponse = async (message: string, recommendedContent: any[]) => {
    const response = await fetch('https://hzttqloyamcivctsfxkk.supabase.co/functions/v1/gemini-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dHRxbG95YW1jaXZjdHNmeGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NzE5MDIsImV4cCI6MjA3MTU0NzkwMn0.kOaKsCgwsWYLWbloN1haekp5aJ0Fn2pfaYIgOyv3ENQ`,
      },
      body: JSON.stringify({
        message,
        userEmail: user!.email,
        stepType: 'final_response',
        selectedContent: recommendedContent
      }),
    });

    await processStreamResponse(response, recommendedContent);
  };

  const processStreamResponse = async (response: Response, recommendedContent?: any[]) => {
    if (!response.body) return;

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      recommendedContent,
    };

    setMessages(prev => [...prev, assistantMessage]);

    const reader = response.body.getReader();
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.text) {
              accumulatedContent += data.text;
              
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessage.id 
                  ? { ...msg, content: accumulatedContent }
                  : msg
              ));
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  };

  return {
    messages,
    loading,
    isLoadingHistory,
    sendMessage,
    resetChat,
  };
}