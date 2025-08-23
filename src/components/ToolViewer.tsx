import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Star, X, DollarSign } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  url?: string;
  cost_indicator?: string;
  stars?: number;
  image_url?: string;
  video_url?: string;
  status: string;
}

interface ToolViewerProps {
  tool: Tool;
  onClose?: () => void;
  className?: string;
}

export function ToolViewer({ tool, onClose, className = "" }: ToolViewerProps) {
  const handleOpenTool = () => {
    if (tool.url) {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
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

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <Badge variant="outline">{tool.type}</Badge>
          </div>
          {tool.stars && (
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(tool.stars)}</div>
              <span className="text-sm text-muted-foreground">
                {tool.stars}/5 stars
              </span>
            </div>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Media */}
      {(tool.image_url || tool.video_url) && (
        <Card>
          <CardContent className="p-6">
            {tool.video_url ? (
              <div className="aspect-video">
                <video
                  src={tool.video_url}
                  controls
                  className="w-full h-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : tool.image_url ? (
              <div className="aspect-video">
                <img
                  src={tool.image_url}
                  alt={tool.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About this Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground whitespace-pre-wrap">{tool.description}</p>
        </CardContent>
      </Card>

      {/* Tool Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cost Information */}
        {tool.cost_indicator && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{tool.cost_indicator}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Access Tool */}
        <Card>
          <CardHeader>
            <CardTitle>Access Tool</CardTitle>
          </CardHeader>
          <CardContent>
            {tool.url ? (
              <Button onClick={handleOpenTool} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Tool
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">
                No URL available for this tool
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}