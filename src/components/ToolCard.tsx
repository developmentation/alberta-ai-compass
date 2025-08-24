import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Database, Box, ExternalLink, Star, BookmarkCheck } from "lucide-react";
import { ImageVideoViewer } from '@/components/ImageVideoViewer';

interface ToolCardProps {
  title: string;
  description: string;
  category: string;
  icon: string;
  image?: string;
  video?: string;
  url?: string;
  costIndicator?: string;
  stars?: number;
  onClick?: () => void;
  onOpenTool?: () => void;
  averageRating?: number;
  totalVotes?: number;
  isBookmarked?: boolean;
}

export const ToolCard = ({
  title,
  description,
  category,
  icon,
  image,
  video,
  url,
  costIndicator,
  stars,
  onClick,
  onOpenTool,
  averageRating = 0,
  totalVotes = 0,
  isBookmarked = false
}: ToolCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'wrench':
        return <Wrench className="w-5 h-5 text-primary" />;
      case 'database':
        return <Database className="w-5 h-5 text-primary" />;
      case 'boxes':
        return <Box className="w-5 h-5 text-primary" />;
      default:
        return <Wrench className="w-5 h-5 text-primary" />;
    }
  };

  // Helper function to check if URL is a YouTube URL  
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/,
      /youtube\.com\/v\//,
      /youtube\.com\/user\/.*#p\/.*\/.*\//,
      /youtube\.com\/.*[?&]v=/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  // Determine what to show - prioritize real images, then videos (including YouTube), then fallback
  const hasRealImage = image && image !== "/placeholder.svg" && !image.includes('/videos/') && !isYouTubeUrl(image);
  const hasVideo = video && (video.includes('/videos/') || isYouTubeUrl(video));

  // Truncate description to 100 characters
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;

  const handleOpenTool = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenTool) {
      onOpenTool();
    }
  };

  return (
    <div
      className="group rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.01] cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Image/Video Section */}
      {(image || video) && (
        <div className="relative h-48 overflow-hidden">
          <ImageVideoViewer
            imageUrl={hasRealImage ? image : undefined}
            videoUrl={hasVideo ? video : undefined}
            alt={title}
            title={title}
            className="h-full"
            showControls={true}
          />
          {/* Fallback for when no real media */}
          {!hasRealImage && !hasVideo && image && (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge 
            variant="secondary"
            className="absolute top-4 left-4 bg-glass-bg border-glass-border backdrop-blur-md text-xs"
          >
            {category}
          </Badge>
          
          {/* Bookmark indicator */}
          {isBookmarked && (
            <div className="absolute top-4 right-4">
              <BookmarkCheck className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {!image && !video && (
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                {getIcon()}
              </div>
            )}
            <h3 className="font-bold tracking-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          {image || video ? (
            <Badge 
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-xs"
            >
              {category}
            </Badge>
          ) : null}
        </div>
        
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {truncatedDescription}
        </p>

        {/* Stars and Cost */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {averageRating > 0 ? (
              <>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({totalVotes})
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No ratings yet</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {costIndicator && (
              <Badge variant="outline" className="text-xs">
                {costIndicator}
              </Badge>
            )}
            {isBookmarked && !image && !video && (
              <BookmarkCheck className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost"
          className="w-full border border-border hover:border-primary/50 hover:bg-primary/10 transition-all"
          onClick={handleOpenTool}
          disabled={!url}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Tool
        </Button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500" />
    </div>
  );
};