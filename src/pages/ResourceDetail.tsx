import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, BookmarkPlus, BookmarkCheck, Star } from "lucide-react";
import { ImageVideoViewer } from "@/components/ImageVideoViewer";
import { ResourceCard } from "@/components/ResourceCard";
import { useResources } from "@/hooks/useResources";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useRatings } from "@/hooks/useRatings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const ResourceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks(id, 'resource');
  const { userRating, submitRating } = useRatings(id, 'resource');
  
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { resources: subResources, loading: subResourcesLoading } = useResources(id);

  useEffect(() => {
    if (id) {
      fetchResource();
    }
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      setResource(data);
    } catch (error) {
      console.error('Error fetching resource:', error);
      navigate('/learning-hub');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    if (!user || !id) return;
    toggleBookmark(id, 'resource');
  };

  const handleRating = (rating: number) => {
    if (!user || !id) return;
    submitRating(rating);
  };

  const handleExternalLink = () => {
    if (resource?.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-64 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Resource not found</h1>
            <Button onClick={() => navigate('/learning-hub')}>
              Back to Learning Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/learning-hub')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning Hub
        </Button>

        {/* Main Resource Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{resource.level}</Badge>
                  <Badge variant="outline">{resource.language}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">
                      {resource.stars_rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {resource.title}
                </CardTitle>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button onClick={handleExternalLink} size="lg">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Resource
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBookmark}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                    ) : (
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                    )}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {(resource.image_url || resource.video_url) && (
              <div className="rounded-lg overflow-hidden">
                <ImageVideoViewer 
                  imageUrl={resource.image_url}
                  videoUrl={resource.video_url}
                  alt={resource.title}
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {resource.description}
              </p>
            </div>

            {user && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Rate this Resource</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="ghost"
                      size="sm"
                      className="p-2"
                      onClick={() => handleRating(rating)}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (userRating || 0) >= rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                  ))}
                  {userRating && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      You rated this {userRating} star{userRating !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sub Resources */}
        {subResources.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Related Resources</h2>
              <p className="text-muted-foreground">
                Additional resources related to {resource.title}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subResourcesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))
              ) : (
                subResources.map((subResource) => (
                  <ResourceCard
                    key={subResource.id}
                    id={subResource.id}
                    title={subResource.title}
                    description={subResource.description}
                    url={subResource.url}
                    level={subResource.level}
                    image_url={subResource.image_url}
                    video_url={subResource.video_url}
                    stars_rating={subResource.stars_rating}
                    onClick={() => navigate(`/resource/${subResource.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};