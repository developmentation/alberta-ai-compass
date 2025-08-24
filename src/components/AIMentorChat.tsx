import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Send, RotateCcw, Download, Loader2, BookOpen, Newspaper, Wrench, FileText, GraduationCap, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAIMentorChat } from '@/hooks/useAIMentorChat';
import { useAuth } from '@/hooks/useAuth';
import { UniversalContentOpener } from '@/components/UniversalContentOpener';
import { toast } from 'sonner';

interface ContentCardProps {
  content: any;
  onOpen: (content: any) => void;
}

const ContentCard = ({ content, onOpen }: ContentCardProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'modules': return <BookOpen className="w-4 h-4" />;
      case 'news': return <Newspaper className="w-4 h-4" />;
      case 'tools': return <Wrench className="w-4 h-4" />;
      case 'prompts': return <FileText className="w-4 h-4" />;
      case 'learning_plans': return <GraduationCap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'modules': return 'Module';
      case 'news': return 'News';
      case 'tools': return 'Tool';
      case 'prompts': return 'Prompt';
      case 'learning_plans': return 'Learning Plan';
      default: return 'Content';
    }
  };

  return (
    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpen(content)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon(content.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {getTypeName(content.type)}
            </Badge>
          </div>
          <h4 className="font-medium text-sm mb-1 line-clamp-2">
            {content.name || content.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {content.description}
          </p>
        </div>
        <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
};

interface AIMentorChatProps {
  onContentOpen?: (content: any) => void;
}

export function AIMentorChat({ onContentOpen }: AIMentorChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { messages, loading, isLoadingHistory, sendMessage, resetChat } = useAIMentorChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Removed auto-scroll to prevent main window scrolling issues
  // Users can manually scroll if needed

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    if (!user) {
      toast.error('Please sign in to use the AI Mentor');
      return;
    }

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleReset = async () => {
    await resetChat();
    toast.success('Chat history cleared');
  };

  const handleDownload = () => {
    const chatContent = messages
      .map(msg => `**${msg.role.toUpperCase()}** (${new Date(msg.timestamp).toLocaleString()})\n${msg.content}\n\n`)
      .join('');

    const blob = new Blob([chatContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-mentor-chat-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContentOpen = (content: any) => {
    if (onContentOpen) {
      onContentOpen(content);
    } else {
      // Use the universal content opener
      setSelectedContent(content);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to use the AI Mentor chat feature.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">AI Learning Mentor</h2>
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={loading || messages.length === 0}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={messages.length === 0}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading chat history...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="max-w-sm mx-auto">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Welcome to AI Learning Mentor</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me anything about learning topics, and I'll recommend relevant courses, tools, and resources from our library.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Try asking: "How can I learn about AI prompting?" or "What tools are available for data analysis?"
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={msg.id || index}>
                    <Card className={`p-4 ${msg.role === 'user' ? 'bg-muted ml-12' : 'bg-primary/5 mr-12'}`}>
                      <div className="flex items-start gap-3">
                        <Badge variant={msg.role === 'user' ? 'default' : 'secondary'} className="mt-1">
                          {msg.role === 'user' ? 'You' : 'AI Mentor'}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                          
                          {/* Recommended content cards */}
                          {msg.recommendedContent && msg.recommendedContent.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Recommended Learning Resources:</h4>
                              <div className="grid gap-2">
                                {msg.recommendedContent.map((content, contentIndex) => (
                                  <ContentCard
                                    key={`${content.id}-${contentIndex}`}
                                    content={content}
                                    onOpen={handleContentOpen}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <Card className="p-4 bg-primary/5 mr-12">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">AI Mentor</Badge>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </Card>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about learning topics, tools, or resources..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Universal Content Modal */}
      <UniversalContentOpener
        isOpen={isModalOpen}
        onClose={handleModalClose}
        content={selectedContent}
      />
    </>
  );
}