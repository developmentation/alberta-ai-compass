import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Star, X, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRatings } from '@/hooks/useRatings';
import { ImageVideoViewer } from '@/components/ImageVideoViewer';

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
  showCloseButton?: boolean;
}

export function ToolViewer({ tool, onClose, className = "", showCloseButton = true }: ToolViewerProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks(tool.id, 'tool');
  const { userRating, aggregatedRating, submitRating } = useRatings(tool.id, 'tool');

  const handleOpenTool = () => {
    if (tool.url) {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <Badge variant="outline">{tool.type}</Badge>
          </div>
          
          {/* Rating and bookmark section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => submitRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-4 h-4 ${
                        star <= (userRating || 0)
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {aggregatedRating?.average_rating?.toFixed(1) || '0.0'} 
                ({aggregatedRating?.total_votes || 0} votes)
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBookmark(tool.id, 'tool')}
              className="flex items-center gap-2"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-primary text-primary" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>
        </div>
        {onClose && showCloseButton && (
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-4">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Media */}
      {(tool.image_url || tool.video_url) && (
        <Card>
          <CardContent className="p-6">
            <ImageVideoViewer
              imageUrl={tool.image_url}
              videoUrl={tool.video_url}
              alt={tool.name}
              title={tool.name}
              aspectRatio="video"
            />
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