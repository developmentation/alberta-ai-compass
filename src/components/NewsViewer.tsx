import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, X, ExternalLink, Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRatings } from '@/hooks/useRatings';
import { ImageVideoViewer } from '@/components/ImageVideoViewer';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  level: string;
  image_url?: string;
  video_url?: string;
  metadata?: any;
  created_at: string;
  status: string;
}

interface NewsViewerProps {
  news: NewsItem;
  onClose?: () => void;
  className?: string;
}

export function NewsViewer({ news, onClose, className = "" }: NewsViewerProps) {
  const socialLinks = news.metadata?.social_links || {};
  const { isBookmarked, toggleBookmark } = useBookmarks(news.id, 'news');
  const { userRating, aggregatedRating, submitRating } = useRatings(news.id, 'news');
  
  const handleSocialLink = (url: string) => {
    if (url && url.trim()) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
      case '1':
        return 'secondary';
      case 'intermediate':
      case '2':
        return 'default';
      case 'advanced':
      case '3':
        return 'destructive';
      case 'red':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-3xl font-bold flex-1 min-w-0">{news.title}</h1>
            <Badge variant={getLevelBadgeVariant(news.level)}>
              {news.level}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span>
              {news.created_at && !isNaN(Date.parse(news.created_at)) 
                ? format(new Date(news.created_at), 'MMMM d, yyyy')
                : 'Date not available'
              }
            </span>
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
              onClick={() => toggleBookmark(news.id, 'news')}
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
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-4">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Media */}
      {(news.image_url || news.video_url) && (
        <Card>
          <CardContent className="p-6">
            <ImageVideoViewer
              imageUrl={news.image_url}
              videoUrl={news.video_url}
              alt={news.title}
              title={news.title}
              aspectRatio="video"
            />
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Article Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {news.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      {socialLinks && Object.values(socialLinks).some(link => typeof link === 'string' && link.trim()) && (
        <Card>
          <CardHeader>
            <CardTitle>Related Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {socialLinks.twitter && typeof socialLinks.twitter === 'string' && socialLinks.twitter.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialLink(socialLinks.twitter)}
                  className="justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  X
                </Button>
              )}
              {socialLinks.linkedin && typeof socialLinks.linkedin === 'string' && socialLinks.linkedin.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialLink(socialLinks.linkedin)}
                  className="justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              )}
              {socialLinks.facebook && typeof socialLinks.facebook === 'string' && socialLinks.facebook.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialLink(socialLinks.facebook)}
                  className="justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
              )}
              {socialLinks.instagram && typeof socialLinks.instagram === 'string' && socialLinks.instagram.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialLink(socialLinks.instagram)}
                  className="justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}