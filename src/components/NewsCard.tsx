import { Badge } from "@/components/ui/badge";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";

interface NewsCardProps {
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  videoUrl?: string;
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
  videoUrl,
  onClick,
  averageRating = 0,
  totalVotes = 0,
  isBookmarked = false
}: NewsCardProps) => {
  // Truncate description to 100 characters
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;

  // Determine what to show - prioritize actual images over video URLs
  const showImage = image && !image.includes('/videos/');
  const showVideo = !showImage && videoUrl && videoUrl.includes('/videos/');
  const fallbackImage = "/placeholder.svg";

  return (
    <article 
      className="group rounded-2xl border border-border overflow-hidden bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.02] hover:-translate-y-1 cursor-pointer relative"
      onClick={onClick}
    >
      {/* Image/Video Section */}
      <div className="relative h-48 overflow-hidden">
        {showVideo ? (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={showImage ? image : fallbackImage}
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