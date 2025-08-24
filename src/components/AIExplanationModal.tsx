import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send } from 'lucide-react';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  currentSection?: string;
  context?: string;
  language?: string;
}

export function AIExplanationModal({ 
  isOpen, 
  onClose, 
  moduleTitle, 
  currentSection,
  context,
  language 
}: AIExplanationModalProps) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'ai', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { type: 'user' as const, content: question };
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // This would be replaced with actual AI integration
      // For now, providing a placeholder response
      setTimeout(() => {
        const aiResponse = {
          type: 'ai' as const,
          content: `I understand you're asking about "${question}" in the context of "${moduleTitle}"${currentSection ? ` - ${currentSection}` : ''}. This is a placeholder response. In a real implementation, this would connect to an AI service to provide detailed explanations based on the module content.`
        };
        setConversation(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);

      setQuestion('');
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      const errorResponse = {
        type: 'ai' as const,
        content: 'I apologize, but I encountered an error while processing your question. Please try again.'
      };
      setConversation(prev => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Learning Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            Ask me anything about "{moduleTitle}" {currentSection && `- ${currentSection}`}
          </div>

          <ScrollArea className="flex-1 border rounded-md p-4">
            {conversation.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Hi! I'm here to help you understand the module content.</p>
                <p>Ask me any questions you have!</p>
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
                      <div className="whitespace-pre-wrap">{message.content}</div>
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
          </ScrollArea>

          <div className="flex gap-2">
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