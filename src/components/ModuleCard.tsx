import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Clock, Bookmark, Eye, Star, BookmarkCheck, GraduationCap } from "lucide-react";
import { ImageVideoViewer } from '@/components/ImageVideoViewer';
import { ModuleViewer } from '@/components/ModuleViewer';
import { supabase } from '@/integrations/supabase/client';

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  image: string;
  video?: string;
  tags: string[];
  averageRating?: number;
  totalVotes?: number;
  isBookmarked?: boolean;
  estimatedTime?: string;
}

export const ModuleCard = ({
  id,
  title,
  description,
  level,
  image,
  video,
  tags,
  averageRating = 0,
  totalVotes = 0,
  isBookmarked = false,
  estimatedTime = "30 min"
}: ModuleCardProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Helper function to check if URL is a YouTube URL  
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/,
      /youtube\.com\/v\//,
      /youtube\.com\/user\/.*#p\/.*\/.*\//,
      /youtube\.com\/.*[?&]v=/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  // Determine what to show - prioritize real images, then videos (including YouTube), then fallback
  const hasRealImage = image && image !== "/placeholder.svg" && !image.includes('/videos/') && !isYouTubeUrl(image);
  const hasVideo = video && (video.includes('/videos/') || isYouTubeUrl(video));

  const handleViewModule = async () => {
    setLoading(true);
    try {
      // Fetch full module data
      const { data: moduleFullData, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (moduleFullData) {
        // Parse json_data if it's a string
        const jsonData = typeof moduleFullData.json_data === 'string' 
          ? JSON.parse(moduleFullData.json_data) 
          : moduleFullData.json_data;
          
        const moduleViewerData = {
          id: moduleFullData.id,
          title: moduleFullData.name || jsonData?.title || title,
          description: moduleFullData.description || jsonData?.description || description,
          level: moduleFullData.level || 'beginner',
          duration: jsonData?.duration || 30,
          learningOutcomes: jsonData?.learningOutcomes || jsonData?.learning_outcomes || [],
          tags: jsonData?.tags || [],
          sections: jsonData?.sections || [],
          imageUrl: moduleFullData.image_url || image || '',
          videoUrl: moduleFullData.video_url || video || ''
        };
        
        setModuleData(moduleViewerData);
        setIsViewerOpen(true);
      }
    } catch (error) {
      console.error('Error loading module data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.02] hover:-translate-y-1">
        {/* Image/Video Section */}
        <div className="relative h-48 overflow-hidden">
          <ImageVideoViewer
            imageUrl={hasRealImage ? image : undefined}
            videoUrl={hasVideo ? video : undefined}
            alt={title}
            title={title}
            className="h-full"
            showControls={true}
          />
          {/* Fallback for when no real media */}
          {!hasRealImage && !hasVideo && image && (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge variant="secondary" className="bg-glass-bg border-glass-border backdrop-blur-md text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {estimatedTime}
            </Badge>
            <Badge variant="outline" className="bg-glass-bg border-glass-border backdrop-blur-md text-xs">
              {level}
            </Badge>
          </div>
          
          {/* Bookmark indicator */}
          {isBookmarked && (
            <div className="absolute top-4 right-4">
              <BookmarkCheck className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>

          {/* Tags and Rating */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-6">
            {averageRating > 0 ? (
              <>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({totalVotes} votes)
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No ratings yet</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
              onClick={handleViewModule}
              disabled={loading}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : "View Module"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={`border border-border hover:border-primary/50 hover:bg-primary/10 ${
                isBookmarked ? 'text-yellow-400' : ''
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-yellow-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500" />
      </article>

      {/* Module Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
          {moduleData && (
            <ModuleViewer 
              moduleData={moduleData}
              isAdminMode={false}
              isEditable={false}
              onClose={() => setIsViewerOpen(false)}
              moduleId={id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};