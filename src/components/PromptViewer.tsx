import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Star, X, Lightbulb, Target, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  onClose?: () => void;
  className?: string;
}

export function PromptViewer({ prompt, onClose, className = "" }: PromptViewerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: "Copied!",
      description: `${fieldName} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
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
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{prompt.name}</h1>
          {prompt.stars && (
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(prompt.stars)}</div>
              <span className="text-sm text-muted-foreground">
                {prompt.stars}/5 stars
              </span>
            </div>
          )}
          {sectorTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {sectorTags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Image */}
      {prompt.image_url && (
        <Card>
          <CardContent className="p-6">
            <div className="aspect-video">
              <img
                src={prompt.image_url}
                alt={prompt.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description & Purpose */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{prompt.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Purpose & Use Case
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-foreground whitespace-pre-wrap flex-1">{prompt.purpose}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(prompt.purpose, 'Purpose')}
                  className="ml-4"
                >
                  <Copy className="w-4 h-4" />
                  {copiedField === 'Purpose' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Output */}
        {prompt.sample_output && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Sample Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap font-mono text-sm">
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => handleCopy(prompt.description, 'Prompt')}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copiedField === 'Prompt' ? 'Copied!' : 'Copy Prompt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}