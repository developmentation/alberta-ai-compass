import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageVideoViewerProps {
  imageUrl?: string;
  videoUrl?: string;
  alt?: string;
  title?: string;
  className?: string;
  showControls?: boolean;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export function ImageVideoViewer({
  imageUrl,
  videoUrl,
  alt = "Content media",
  title,
  className = "",
  showControls = true,
  aspectRatio = 'auto'
}: ImageVideoViewerProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper function to check if a URL is valid (not empty/null/placeholder)
  const isValidUrl = (url?: string): boolean => {
    if (!url || !url.trim()) return false;
    if (url === "/placeholder.svg") return false;
    return true;
  };

  // Helper function to check if URL is a video file
  const isVideoFile = (url: string): boolean => {
    return url.includes('/videos/') || url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i) !== null;
  };

  // Helper function to extract YouTube video ID from various URL formats
  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/user\/[^\/]+#p\/[^\/]+\/[^\/]+\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Helper function to convert any YouTube URL to embed format
  const convertToEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Helper function to check if URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    return extractYouTubeVideoId(url) !== null;
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      default:
        return '';
    }
  };

  const baseClasses = `w-full object-cover rounded-lg ${getAspectRatioClass()} ${className}`;

  // Determine what media to show - prioritize real images, then videos
  const validImageUrl = isValidUrl(imageUrl) && !isVideoFile(imageUrl!) && !isYouTubeUrl(imageUrl!) ? imageUrl : undefined;
  const validVideoUrl = isValidUrl(videoUrl) ? videoUrl : (isValidUrl(imageUrl) && (isVideoFile(imageUrl!) || isYouTubeUrl(imageUrl!)) ? imageUrl : undefined);

  // Render video (YouTube or regular) if we have a valid video URL
  if (validVideoUrl) {
    if (isYouTubeUrl(validVideoUrl)) {
      return (
        <div 
          className={`relative ${baseClasses}`}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{ 
            pointerEvents: 'auto',
            isolation: 'isolate',
            zIndex: 10
          }}
        >
          <iframe
            src={convertToEmbedUrl(validVideoUrl)}
            title={title || "YouTube video player"}
            width="100%"
            height="100%"
            className="absolute inset-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ 
              pointerEvents: 'auto',
              zIndex: 20
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          />
        </div>
      );
    } else {
      return (
        <div 
          className={`relative ${baseClasses}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <video
            ref={videoRef}
            src={validVideoUrl}
            className="w-full h-full object-cover rounded-lg"
            poster={validImageUrl}
            controls={!showControls}
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
            onEnded={() => setVideoPlaying(false)}
            title={title}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          {showControls && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 left-2 bg-black/50 hover:bg-black/70 text-white border-white/20 z-50"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (videoRef.current) {
                  if (videoPlaying) {
                    videoRef.current.pause();
                  } else {
                    videoRef.current.play().catch(console.error);
                  }
                }
              }}
            >
              {videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          )}
        </div>
      );
    }
  }

  // Render image if we have a valid image URL
  if (validImageUrl) {
    return (
      <img
        src={validImageUrl}
        alt={alt}
        title={title}
        className={baseClasses}
      />
    );
  }

  // No media to display
  return null;
}