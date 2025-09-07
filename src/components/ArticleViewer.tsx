import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageVideoViewer } from '@/components/ImageVideoViewer';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRatings } from '@/hooks/useRatings';
import { format, parseISO } from 'date-fns';
import { Bookmark, BookmarkCheck, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/hooks/useAuth';

interface ArticleSection {
  type: 'header' | 'text' | 'video' | 'image' | 'hyperlink';
  content: string;
  title?: string;
}

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  level: string;
  created_at: string;
  image_url?: string;
  video_url?: string;
  json_data: ArticleSection[];
}

interface ArticleViewerProps {
  article: ArticleItem;
  onClose?: () => void;
  className?: string;
}

export const ArticleViewer = ({ article, onClose, className = "" }: ArticleViewerProps) => {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks(article.id, 'articles');
  const { userRating, aggregatedRating, submitRating, loading: ratingLoading } = useRatings(article.id, 'articles');

  const getLevelBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case '1':
      case 'beginner':
        return 'secondary';
      case '2':
      case 'intermediate':
        return 'outline';
      case '3':
      case 'advanced':
        return 'default';
      case 'red':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => user && submitRating(star)}
            disabled={!user || ratingLoading}
            className="transition-colors hover:scale-110 transform duration-200 disabled:cursor-not-allowed"
          >
            <Star
              className={`w-4 h-4 ${
                star <= (userRating || 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
        {aggregatedRating && (
          <span className="text-sm text-muted-foreground ml-2">
            {aggregatedRating.average_rating.toFixed(1)} ({aggregatedRating.total_votes} {aggregatedRating.total_votes === 1 ? 'vote' : 'votes'})
          </span>
        )}
      </div>
    );
  };

  // Enhanced helper function to clean and validate URLs
  const cleanUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const cleaned = url.trim();
    if (!cleaned || cleaned === "/placeholder.svg") return undefined;
    return cleaned;
  };

  const renderSection = (section: ArticleSection, index: number) => {
    // Enhanced logging for debugging video sections
    if (section.type === 'video') {
      console.log(`Rendering video section ${index}:`, {
        title: section.title,
        content: section.content,
        contentLength: section.content?.length,
        hasWhitespace: section.content !== section.content?.trim(),
        trimmedContent: section.content?.trim()
      });
    }

    switch (section.type) {
      case 'header':
        return (
          <h2 key={index} className="text-2xl font-bold mb-4 mt-8 first:mt-0">
            {section.content}
          </h2>
        );
      
      case 'text':
        return (
          <div key={index} className="prose prose-neutral dark:prose-invert max-w-none mb-6">
            <ReactMarkdown>{section.content}</ReactMarkdown>
          </div>
        );
      
      case 'image':
        const cleanImageUrl = cleanUrl(section.content);
        return (
          <div key={index} className="mb-6">
            <ImageVideoViewer
              image={cleanImageUrl}
              alt={section.title || 'Article image'}
              title={section.title || 'Article image'}
              className="w-full max-h-96 object-cover rounded-lg"
            />
            {section.title && (
              <p className="text-sm text-muted-foreground text-center mt-2 italic">
                {section.title}
              </p>
            )}
          </div>
        );
      
      case 'video':
        const cleanVideoUrl = cleanUrl(section.content);
        
        // Additional validation and logging for video URLs
        if (!cleanVideoUrl) {
          console.warn(`Video section ${index} has invalid URL:`, section.content);
          return (
            <div key={index} className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-red-600 text-sm">
                Invalid video URL: {section.content}
              </p>
            </div>
          );
        }

        console.log(`Passing to ImageVideoViewer:`, {
          video: cleanVideoUrl,
          title: section.title || 'Article video'
        });

        return (
          <div key={index} className="mb-6">
            <div className="relative">
              <ImageVideoViewer
                video={cleanVideoUrl}
                title={section.title || 'Article video'}
                className="w-full rounded-lg"
                showControls={true}
                aspectRatio="video" // Force video aspect ratio for consistency
              />
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  Debug: {cleanVideoUrl}
                </div>
              )}
            </div>
            {section.title && (
              <p className="text-sm text-muted-foreground text-center mt-2 italic">
                {section.title}
              </p>
            )}
          </div>
        );
      
      case 'hyperlink':
        const cleanLinkUrl = cleanUrl(section.content);
        if (!cleanLinkUrl) return null;
        
        return (
          <div key={index} className="mb-4">
            <a
              href={cleanLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:text-primary/80 underline font-medium"
            >
              {section.title || cleanLinkUrl}
            </a>
          </div>
        );
      
      default:
        console.warn(`Unknown section type: ${section.type}`);
        return null;
    }
  };

  // Enhanced logging for article data
  console.log('ArticleViewer rendering article:', {
    id: article.id,
    title: article.title,
    hasVideoUrl: !!article.video_url,
    videoUrl: article.video_url,
    hasImageUrl: !!article.image_url,
    imageUrl: article.image_url,
    jsonDataSections: article.json_data?.length || 0,
    videoSections: article.json_data?.filter(s => s.type === 'video').length || 0
  });

  return (
    <div className={className}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{article.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={getLevelBadgeVariant(article.level)}>
              {article.level.charAt(0).toUpperCase() + article.level.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(parseISO(article.created_at), 'MMMM dd, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            {renderStars()}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleBookmark(article.id, 'articles')}
                className="p-1"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Header Media - Enhanced with better URL cleaning */}
      {(article.image_url || article.video_url) && (
        <div className="mb-8">
          <ImageVideoViewer
            image={cleanUrl(article.image_url)}
            video={cleanUrl(article.video_url)}
            alt={article.title}
            title={article.title}
            className="w-full max-h-96 object-cover rounded-lg"
            showControls={true}
            aspectRatio="video"
          />
          {/* Debug info for header media */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500">
              Header - Image: {cleanUrl(article.image_url) || 'none'}, Video: {cleanUrl(article.video_url) || 'none'}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{article.description}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Article Content Sections - Enhanced error handling */}
      {article.json_data && article.json_data.length > 0 ? (
        <div className="space-y-4">
          {article.json_data.map((section, index) => {
            try {
              return renderSection(section, index);
            } catch (error) {
              console.error(`Error rendering section ${index}:`, error, section);
              return (
                <div key={index} className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
                  <p className="text-red-600 text-sm">
                    Error rendering section {index + 1} ({section.type})
                  </p>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No additional content sections available.
        </div>
      )}
    </div>
  );
};

