import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookmarkPlus, BookmarkCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageVideoViewer } from "./ImageVideoViewer";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useRatings } from "@/hooks/useRatings";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  video?: string;
  level: string;
  stars_rating: number;
  onClick?: () => void;
  showBookmark?: boolean;
  showRating?: boolean;
}

export const ResourceCard = ({
  id,
  title,
  description,
  url,
  image,
  video,
  level,
  stars_rating,
  onClick,
  showBookmark = true,
  showRating = true
}: ResourceCardProps) => {
  console.log('ResourceCard props:', { id, title, image, video });
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks(id, 'resource');
  const { userRating, aggregatedRating, submitRating, refetch } = useRatings(id, 'resource');

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleBookmark(id, 'resource');
  };

  const handleRating = async (rating: number) => {
    if (!user) return;
    await submitRating(rating);
    refetch(); // Refresh the rating data
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-border hover:border-primary/20 bg-card">
      <div onClick={onClick} className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {level}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">
                {(aggregatedRating?.average_rating || stars_rating || 0).toFixed(1)} ({aggregatedRating?.total_votes || 0})
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExternalLink}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            {showBookmark && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <ImageVideoViewer
          image={image}
          video={video}
          alt={title}
          title={title}
          className="h-full"
          showControls={true}
        />

        <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {description}
        </p>

        {showRating && user && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">Rate:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRating(rating);
                }}
              >
                <Star
                  className={`w-3 h-3 ${
                    (userRating || 0) >= rating
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};