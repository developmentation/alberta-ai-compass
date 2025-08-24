import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  FileText, 
  Wrench, 
  MessageSquare, 
  GraduationCap, 
  Newspaper,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowUpRight,
  BookOpen,
  Star,
  Eye
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: string;
  name: string;
  description: string;
  image_url?: string;
  video_url?: string;
  status: string;
  order_index: number;
  url?: string;
  cost_indicator?: string;
  stars?: number;
  purpose?: string;
  sample_output?: string;
  level?: string;
}

interface ContentCardProps {
  content: ContentItem;
  className?: string;
  onView?: (content: ContentItem) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'module':
      return GraduationCap;
    case 'news':
      return Newspaper;
    case 'tool':
      return Wrench;
    case 'prompt':
      return MessageSquare;
    case 'learning_plan':
      return BookOpen;
    default:
      return FileText;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'module':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'news':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'tool':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'prompt':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'learning_plan':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function ContentCard({ content, className = "", onView }: ContentCardProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const Icon = getTypeIcon(content.type);

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  const handleCardClick = () => {
    if (onView) {
      onView(content);
    } else if (content.url) {
      window.open(content.url, '_blank');
    }
  };

  return (
    <article 
      className={`relative overflow-hidden group bg-card border border-border rounded-2xl hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Media Content */}
      {content.video_url ? (
        <div className="relative h-48 overflow-hidden">
          <video
            ref={videoRef}
            src={content.video_url}
            className="w-full h-full object-cover"
            muted={videoMuted}
            autoPlay
            loop
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
            onEnded={() => setVideoPlaying(false)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVideoPlayback();
                }}
              >
                {videoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVideoMute();
                }}
              >
                {videoMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>
      ) : content.image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={content.image_url} 
            alt={content.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20" />
        </div>
      ) : (
        <div className="h-48 bg-muted flex items-center justify-center">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className={`text-xs font-medium ${getTypeBadgeColor(content.type)}`}>
            {content.type}
          </Badge>
          {content.url && (
            <Button
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold tracking-tight mb-2 line-clamp-2">
            {content.name}
          </h3>
          
          {content.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {content.description}
            </p>
          )}

          {/* Type-specific metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
            {content.type === 'tool' && content.cost_indicator && (
              <span className="px-2 py-0.5 rounded-full bg-muted border border-border">
                {content.cost_indicator}
              </span>
            )}
            {content.stars && content.stars > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{content.stars}</span>
              </div>
            )}
            {content.level && (
              <span className="px-2 py-0.5 rounded-full bg-muted border border-border">
                {content.level}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}