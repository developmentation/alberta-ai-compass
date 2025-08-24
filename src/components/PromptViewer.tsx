import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Star, X, Lightbulb, Target, Eye, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Prompt {
  id: string;
  name: string;
  description: string;
  purpose: string;
  sample_output?: string;
  stars?: number;
  sector_tags?: any;
  image_url?: string;
  status: string;
}

interface PromptViewerProps {
  prompt: Prompt;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PromptViewer({ prompt, children, open, onOpenChange }: PromptViewerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: "Copied!",
      description: `${fieldName} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExecutePrompt = async () => {
    try {
      setIsExecuting(true);
      setExecutionResult(null);

      const combinedPrompt = userInput.trim() 
        ? `${prompt.description}\n\nAdditional context: ${userInput}`
        : prompt.description;

      const { data, error } = await supabase.functions.invoke('execute-prompt', {
        body: { prompt: combinedPrompt }
      });

      if (error) throw error;

      if (data.success) {
        setExecutionResult(data.response);
        toast({
          title: "Prompt executed successfully!",
          description: "The AI response has been generated.",
        });
      } else {
        throw new Error(data.error || 'Failed to execute prompt');
      }
    } catch (error) {
      console.error('Error executing prompt:', error);
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "Failed to execute prompt",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const sectorTags = Array.isArray(prompt.sector_tags) ? prompt.sector_tags : [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">View Prompt</Button>}
      </DialogTrigger>
      <DialogContent className="w-[90vw] h-[90vh] max-w-none max-h-none p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {prompt.name}
              {prompt.stars && (
                <div className="flex items-center gap-1">
                  <div className="flex">{renderStars(prompt.stars)}</div>
                  <span className="text-sm text-muted-foreground">
                    {prompt.stars}/5
                  </span>
                </div>
              )}
            </DialogTitle>
            {sectorTags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {sectorTags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Left Column */}
              <div className="flex flex-col h-full border-r border-border">
                {/* Purpose & Use Case - 50% of left column */}
                <div className="h-1/2 min-h-0 border-b border-border">
                  <div className="h-full overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-4">
                        {/* Image */}
                        {prompt.image_url && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted max-h-32">
                            <img
                              src={prompt.image_url}
                              alt={prompt.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Purpose */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Target className="w-5 h-5" />
                              Purpose & Use Case
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-foreground whitespace-pre-wrap text-sm">{prompt.purpose}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(prompt.purpose, 'Purpose')}
                                className="flex-shrink-0"
                              >
                                <Copy className="w-4 h-4" />
                                {copiedField === 'Purpose' ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {/* Prompt Description - 50% of left column */}
                <div className="h-1/2 min-h-0">
                  <div className="h-full overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-4">
                        {/* Description */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Lightbulb className="w-5 h-5" />
                              Prompt Description
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-muted/50 p-4 rounded-lg mb-4">
                              <p className="text-foreground whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {prompt.description}
                              </p>
                            </div>
                            
                            {/* User Input Textarea */}
                            <div className="space-y-2 mb-4">
                              <label className="text-sm font-medium">Additional Context (Optional)</label>
                              <Textarea
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Add any additional context or instructions here..."
                                className="min-h-[80px] resize-none"
                              />
                            </div>
                            
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(prompt.description, 'Prompt')}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                {copiedField === 'Prompt' ? 'Copied!' : 'Copy Prompt'}
                              </Button>
                              <Button
                                onClick={handleExecutePrompt}
                                disabled={isExecuting}
                                size="sm"
                              >
                                {isExecuting ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2" />
                                )}
                                {isExecuting ? 'Executing...' : 'Execute Prompt'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Sample Output */}
                        {prompt.sample_output && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <Eye className="w-5 h-5" />
                                Sample Output
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <p className="text-foreground whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                    {prompt.sample_output}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopy(prompt.sample_output!, 'Sample Output')}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  {copiedField === 'Sample Output' ? 'Copied!' : 'Copy Sample'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              {/* Right Column - AI Response */}
              <div className="flex flex-col h-full">
                {executionResult ? (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 pb-4 border-b flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">AI Response</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(executionResult, 'AI Response')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copiedField === 'AI Response' ? 'Copied!' : 'Copy Response'}
                      </Button>
                    </div>
                    <div className="flex-1 min-h-0 p-6">
                      <div className="h-full bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border">
                        <ScrollArea className="h-full w-full">
                          <div className="prose prose-sm max-w-none dark:prose-invert pr-4">
                            <ReactMarkdown>{executionResult}</ReactMarkdown>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Execute the prompt to see AI response</p>
                      <p className="text-sm">Click "Execute Prompt" to generate AI content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}