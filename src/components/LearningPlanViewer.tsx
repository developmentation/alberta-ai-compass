import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentCard } from '@/components/ContentCard';
import { 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: string;
  name: string;
  description: string;
  image_url?: string;
  video_url?: string;
  status: string;
  order_index: number;
  url?: string;
  cost_indicator?: string;
  stars?: number;
  purpose?: string;
  sample_output?: string;
  level?: string;
}

interface LearningPlanViewerProps {
  contentItems: ContentItem[];
  planName: string;
  onViewContent?: (content: ContentItem) => void;
}

export function LearningPlanViewer({ contentItems, planName, onViewContent }: LearningPlanViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (contentItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Content Available</h3>
          <p className="text-muted-foreground mb-6">
            This learning plan doesn't have any content items yet. Content will appear here once it's added by an administrator.
          </p>
          <Badge variant="outline" className="text-xs">
            Learning Plan: {planName}
          </Badge>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : contentItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < contentItems.length - 1 ? prev + 1 : 0));
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const currentItem = contentItems[currentIndex];
  const progress = ((currentIndex + 1) / contentItems.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Learning Content</h2>
          <Badge variant="secondary" className="text-xs">
            {contentItems.length} items
          </Badge>
        </div>
      </div>

      {/* Progress & Navigation */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Bar */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentIndex + 1} of {contentItems.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-semibold mb-2">Navigation</h3>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="flex-1"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>

          {/* Content Overview */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-semibold mb-3">Content Overview</h3>
            <div className="space-y-2">
              {contentItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    index === currentIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                  <Badge 
                    variant={index === currentIndex ? "secondary" : "outline"} 
                    className="text-xs mt-1"
                  >
                    {item.type}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Content Item */}
        <div className="lg:col-span-2">
          <ContentCard
            content={currentItem}
            className="h-[500px]"
            onView={onViewContent}
          />
        </div>
      </div>
    </div>
  );
}