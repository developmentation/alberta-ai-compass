import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageVideoViewerProps {
  image?: string;
  video?: string;
  alt?: string;
  title?: string;
  className?: string;
  showControls?: boolean;
  aspectRatio?: 'square' | 'video' | 'auto';
  displayMode?: 'cover' | 'contain' | 'natural' | 'adaptive';
  maxHeight?: string;
  preserveAspectRatio?: boolean;
  allowFullscreen?: boolean;
  showDisplayModeToggle?: boolean;
}

export function ImageVideoViewer({
  image,
  video,
  alt = "Content media",
  title,
  className = "",
  showControls = true,
  aspectRatio = 'auto',
  displayMode = 'adaptive',
  maxHeight,
  preserveAspectRatio = true,
  allowFullscreen = true,
  showDisplayModeToggle = false
}: ImageVideoViewerProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentDisplayMode, setCurrentDisplayMode] = useState(displayMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  console.log('ImageVideoViewer received:', { image, video, title, displayMode: currentDisplayMode });

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

  // Load image dimensions for adaptive display
  useEffect(() => {
    if (validImageUrl && imageRef.current) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(true);
      };
      img.src = validImageUrl;
    }
  }, [image]);

  // Determine optimal display mode for adaptive mode
  useEffect(() => {
    if (displayMode === 'adaptive' && imageDimensions) {
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      
      // If image is very tall (portrait), use contain to show full image
      if (aspectRatio < 0.75) {
        setCurrentDisplayMode('contain');
      }
      // If image is very wide, use contain to avoid excessive cropping
      else if (aspectRatio > 2.5) {
        setCurrentDisplayMode('contain');
      }
      // For normal aspect ratios, use cover for better visual appeal
      else {
        setCurrentDisplayMode('cover');
      }
    } else if (displayMode !== 'adaptive') {
      setCurrentDisplayMode(displayMode);
    }
  }, [displayMode, imageDimensions]);

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

  const toggleDisplayMode = () => {
    const modes = ['cover', 'contain', 'natural'];
    const currentIndex = modes.indexOf(currentDisplayMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setCurrentDisplayMode(modes[nextIndex] as typeof currentDisplayMode);
  };

  const getContainerClasses = () => {
    let classes = "relative w-full rounded-lg overflow-hidden";
    
    // Add aspect ratio classes if specified and not in natural mode
    if (aspectRatio !== 'auto' && currentDisplayMode !== 'natural') {
      switch (aspectRatio) {
        case 'square':
          classes += ' aspect-square';
          break;
        case 'video':
          classes += ' aspect-video';
          break;
      }
    }
    
    // Add height constraints
    if (maxHeight) {
      classes += ` max-h-[${maxHeight}]`;
    } else if (currentDisplayMode === 'natural') {
      classes += ' max-h-screen';
    } else if (aspectRatio === 'auto') {
      classes += ' max-h-96';
    }
    
    return `${classes} ${className}`;
  };

  const getImageClasses = () => {
    let classes = "w-full h-full rounded-lg transition-all duration-300";
    
    switch (currentDisplayMode) {
      case 'cover':
        classes += ' object-cover';
        break;
      case 'contain':
        classes += ' object-contain bg-muted/20';
        break;
      case 'natural':
        classes += ' object-contain max-w-full h-auto';
        break;
      default:
        classes += ' object-cover';
    }
    
    return classes;
  };

  const getContainerStyle = () => {
    if (currentDisplayMode === 'natural' && imageDimensions) {
      // For natural mode, set height based on image aspect ratio
      const maxWidth = 800; // Max width for natural display
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      const naturalHeight = Math.min(maxWidth / aspectRatio, 600); // Max height of 600px
      
      return {
        height: 'auto',
        minHeight: `${Math.min(naturalHeight, 400)}px`,
        maxHeight: maxHeight || '600px'
      };
    }
    
    return {};
  };

  // Determine what media to show - prioritize real images, then videos
  const validImageUrl = isValidUrl(image) && !isVideoFile(image!) && !isYouTubeUrl(image!) ? image : undefined;
  const validVideoUrl = isValidUrl(video) ? video : (isValidUrl(image) && (isVideoFile(image!) || isYouTubeUrl(image!)) ? image : undefined);

  // Render video (YouTube or regular) if we have a valid video URL
  if (validVideoUrl) {
    if (isYouTubeUrl(validVideoUrl)) {
      return (
        <div className={getContainerClasses()}>
          <div 
            className="relative w-full h-full"
            style={getContainerStyle()}
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
            
            {/* Controls overlay */}
            {(allowFullscreen || showDisplayModeToggle) && (
              <div className="absolute top-2 right-2 flex gap-2 z-30">
                {allowFullscreen && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className={getContainerClasses()}>
          <div 
            className="relative w-full h-full"
            style={getContainerStyle()}
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
            
            {/* Video controls */}
            {showControls && (
              <div className="absolute bottom-2 left-2 flex gap-2 z-50">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
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
              </div>
            )}
            
            {/* Additional controls */}
            {(allowFullscreen || showDisplayModeToggle) && (
              <div className="absolute top-2 right-2 flex gap-2 z-50">
                {allowFullscreen && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Render image if we have a valid image URL
  if (validImageUrl) {
    return (
      <>
        <div className={getContainerClasses()}>
          <div 
            className="relative w-full h-full"
            style={getContainerStyle()}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-muted-foreground text-center">
                  <div className="text-sm">Failed to load image</div>
                  <div className="text-xs mt-1">{alt}</div>
                </div>
              </div>
            )}
            
            <img
              ref={imageRef}
              src={validImageUrl}
              alt={alt}
              title={title}
              className={getImageClasses()}
              style={{
                display: imageError ? 'none' : 'block',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
            
            {/* Image controls */}
            {imageLoaded && !imageError && (allowFullscreen || showDisplayModeToggle) && (
              <div className="absolute top-2 right-2 flex gap-2 z-50">
                {showDisplayModeToggle && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                    onClick={toggleDisplayMode}
                    title={`Current: ${currentDisplayMode}. Click to cycle.`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                {allowFullscreen && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Fullscreen modal - FIXED */}
        {allowFullscreen && (
          <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-4 overflow-hidden">
              <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                <img
                  src={validImageUrl}
                  alt={alt}
                  title={title}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh'
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // No media to display
  return null;
}

