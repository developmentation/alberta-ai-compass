import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MediaDisplayProps {
  imageUrl?: string;
  videoUrl?: string;
  title: string;
  className?: string;
  imageClassName?: string;
  videoClassName?: string;
}

export function MediaDisplay({ 
  imageUrl, 
  videoUrl, 
  title, 
  className = "w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg",
  imageClassName = "w-full h-full object-cover",
  videoClassName = "w-full h-full object-cover"
}: MediaDisplayProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  if (videoUrl) {
    return (
      <div className={`relative ${className}`}>
        <video
          ref={videoRef}
          src={videoUrl}
          className={videoClassName}
          muted={videoMuted}
          onPlay={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
          onEnded={() => setVideoPlaying(false)}
          controls={false}
          loop
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0"
              onClick={toggleVideoPlayback}
            >
              {videoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0"
              onClick={toggleVideoMute}
            >
              {videoMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className={className}>
        <img 
          src={imageUrl} 
          alt={title}
          className={imageClassName}
        />
      </div>
    );
  }

  return null;
}