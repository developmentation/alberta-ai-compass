import { ImageVideoViewer } from '@/components/ImageVideoViewer';

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
  return (
    <div className={className}>
      <ImageVideoViewer
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        alt={title}
        title={title}
        className="w-full h-full object-cover"
        aspectRatio="auto"
        showControls={true}
      />
    </div>
  );
}