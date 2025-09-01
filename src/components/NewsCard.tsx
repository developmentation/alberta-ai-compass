import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bookmark, BookmarkCheck, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import { ImageVideoViewer } from '@/components/ImageVideoViewer';

interface NewsCardProps {
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  video?: string;
  onClick?: () => void;
  averageRating?: number;
  totalVotes?: number;
  isBookmarked?: boolean;
}

export const NewsCard = ({
  title,
  description,
  date,
  category,
  image,
  video,
  onClick,
  averageRating = 0,
  totalVotes = 0,
  isBookmarked = false
}: NewsCardProps) => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Truncate description to 100 characters
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    console.log('Play button clicked'); // Debug log
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    console.log('Mute button clicked'); // Debug log
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  return (
    <article 
      className="group rounded-2xl border border-border overflow-hidden bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.02] hover:-translate-y-1 cursor-pointer relative"
      onClick={onClick}
    >
      {/* Image/Video Section */}
      <div className="relative h-48 overflow-hidden">
        <ImageVideoViewer
          image={image}
          video={video}
          alt={title}
          title={title}
          className="h-full"
          showControls={true}
        />
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

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {truncatedDescription}
        </p>
        
        {/* Rating and Date */}
        <div className="flex items-center justify-between">
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
          <div className="text-xs text-muted-foreground">
            {date}
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500" />
    </article>
  );
};