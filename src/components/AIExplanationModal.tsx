import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  currentSection?: string;
  context?: string;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
}

export function AIExplanationModal({ 
  isOpen, 
  onClose, 
  moduleTitle, 
  currentSection,
  context 
}: AIExplanationModalProps) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  // Auto-initialize conversation when modal opens
  useEffect(() => {
    if (isOpen && !hasInitialized && currentSection) {
      setHasInitialized(true);
      handleAutoInitialize();
    }
  }, [isOpen, hasInitialized, currentSection]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
      setConversation([]);
      setQuestion('');
    }
  }, [isOpen]);

  const handleAutoInitialize = async () => {
    if (!user || !currentSection) return;

    const initialPrompt = `Please explain and expand on the concept covered in "${currentSection}" from the module "${moduleTitle}". Help me understand this topic better and provide additional insights.`;
    
    await sendMessageToAI(initialPrompt, true);
  };

  const sendMessageToAI = async (message: string, isAutoPrompt: boolean = false) => {
    if (!user) return;

    // Add user message to conversation (unless it's auto prompt)
    if (!isAutoPrompt) {
      const userMessage: Message = { type: 'user', content: message };
      setConversation(prev => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      // Build context for the AI
      const conversationHistory = conversation.map(msg => 
        `${msg.type === 'user' ? 'Student' : 'AI Tutor'}: ${msg.content}`
      ).join('\n\n');

      const fullContext = `
Module: ${moduleTitle}
Current Section: ${currentSection || 'Unknown'}
Section Content: ${context || 'No content available'}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}

Current message: ${message}
`;

      // Call the gemini-stream function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: fullContext,
          userEmail: user.email,
          stepType: 'general_chat'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let aiResponseText = '';
      const aiMessage: Message = { type: 'ai', content: '' };
      
      // Add AI message placeholder to conversation
      setConversation(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                aiResponseText += data.text;
                // Update the AI message in conversation
                setConversation(prev => {
                  const newConv = [...prev];
                  const lastMessage = newConv[newConv.length - 1];
                  if (lastMessage && lastMessage.type === 'ai') {
                    lastMessage.content = aiResponseText;
                  }
                  return newConv;
                });
              }
            } catch (e) {
              // Ignore parsing errors for stream data
              console.log('Parse error:', e);
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Error getting AI explanation:', error);
      const errorResponse: Message = {
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your question. Please try again.'
      };
      setConversation(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = question.trim();
    setQuestion('');
    
    await sendMessageToAI(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Learning Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="text-sm text-muted-foreground flex-shrink-0">
            Learning about "{moduleTitle}" {currentSection && `- ${currentSection}`}
          </div>

          <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
            <div className="p-4">
              {conversation.length === 0 && !isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Hi! I'm analyzing the current section and will provide insights shortly.</p>
                  <p>Feel free to ask me any questions about this module!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.type === 'ai' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything about this module..."
              className="flex-1"
              rows={2}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!question.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

