import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRatings } from '@/hooks/useRatings';
import { useCompletions } from '@/hooks/useCompletions';
import { LearningPlanViewer } from '@/components/LearningPlanViewer';
import { ModuleViewer } from '@/components/ModuleViewer';
import { ToolViewer } from '@/components/ToolViewer';
import { PromptViewer } from '@/components/PromptViewer';
import { NewsViewer } from '@/components/NewsViewer';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  CheckCircle, 
  PlayCircle, 
  Bookmark, 
  Star, 
  Award,
  ArrowLeft,
  Target,
  TrendingUp,
  ExternalLink,
  FileText,
  Wrench,
  MessageSquare,
  GraduationCap,
  Newspaper
} from "lucide-react";

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

interface LearningPlan {
  id: string;
  name: string;
  description: string;
  level: string;
  duration?: unknown;
  learning_outcomes?: string[];
  star_rating: number;
  created_at: string;
  image_url?: string;
  video_url?: string;
  status: string;
  content_items?: any[];
}

const Plan = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [viewerType, setViewerType] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  // Use new hooks for bookmarks, ratings, and completions
  const { isBookmarked, toggleBookmark } = useBookmarks(plan?.id, 'learning_plan');
  const { userRating, aggregatedRating, submitRating } = useRatings(plan?.id, 'learning_plan');
  const { isCompleted, markAsCompleted } = useCompletions(plan?.id, 'learning_plan');

  useEffect(() => {
    const fetchPlanAndContent = async () => {
      if (!planId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch the learning plan
        const { data: planData, error: planError } = await supabase
          .from('learning_plans')
          .select('*')
          .eq('id', planId)
          .eq('status', 'published')
          .maybeSingle();

        if (planError) throw planError;
        
        if (!planData) {
          setError('Plan not found');
          return;
        }

        setPlan(planData as LearningPlan);

        // Fetch content items if they exist
        if (planData.content_items && Array.isArray(planData.content_items)) {
          const contentPromises = planData.content_items.map(async (item: any) => {
            let contentDetails = null;
            
            try {
              switch (item.type) {
                case 'module':
                  const { data: moduleData } = await supabase
                    .from('modules')
                    .select('id, name, description, image_url, video_url, status, level')
                    .eq('id', item.original_id)
                    .maybeSingle();
                  contentDetails = moduleData;
                  break;
                case 'news':
                  const { data: newsData } = await supabase
                    .from('news')
                    .select('id, title as name, description, image_url, video_url, status, level')
                    .eq('id', item.original_id)
                    .maybeSingle();
                  contentDetails = newsData;
                  break;
                case 'tool':
                  const { data: toolData } = await supabase
                    .from('tools')
                    .select('id, name, description, image_url, video_url, status, url, cost_indicator, stars')
                    .eq('id', item.original_id)
                    .maybeSingle();
                  contentDetails = toolData;
                  break;
                case 'prompt':
                  const { data: promptData } = await supabase
                    .from('prompt_library')
                    .select('id, name, description, image_url, status, purpose, sample_output, stars')
                    .eq('id', item.original_id)
                    .maybeSingle();
                  contentDetails = promptData;
                  break;
                case 'learning_plan':
                  const { data: planLinkData } = await supabase
                    .from('learning_plans')
                    .select('id, name, description, image_url, video_url, status, level, star_rating')
                    .eq('id', item.original_id)
                    .maybeSingle();
                  contentDetails = planLinkData;
                  break;
              }
            } catch (error) {
              console.error(`Error fetching ${item.type} content:`, error);
            }
            
            if (contentDetails) {
              return {
                id: contentDetails.id,
                type: item.type,
                name: item.custom_title || item.name || contentDetails.name || contentDetails.title,
                description: item.custom_description || item.description || contentDetails.description || '',
                image_url: item.image_url || contentDetails.image_url || '',
                video_url: item.video_url || contentDetails.video_url || '',
                status: item.status || contentDetails.status || 'draft',
                order_index: item.order_index || 0,
                url: contentDetails.url || '',
                cost_indicator: contentDetails.cost_indicator || '',
                stars: contentDetails.stars || contentDetails.star_rating || 0,
                purpose: contentDetails.purpose || '',
                sample_output: contentDetails.sample_output || '',
                level: contentDetails.level || '',
                sector_tags: contentDetails.sector_tags || [],
                metadata: contentDetails.metadata || {},
                created_at: contentDetails.created_at || '',
                // Add full content details for viewers
                fullContent: contentDetails,
                originalItem: item
              };
            }
            return null;
          });

          const resolvedContent = await Promise.all(contentPromises);
          const validContent = resolvedContent.filter(item => item !== null) as ContentItem[];
          
          // Sort by order_index
          validContent.sort((a, b) => a.order_index - b.order_index);
          setContentItems(validContent);
        }

        // User bookmarks and ratings are now handled by hooks
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load learning plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanAndContent();
  }, [planId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewContent = async (content: any) => {
    try {
      let viewerData = null;
      let type = content.type;
      
      switch (content.type) {
        case 'module':
          // Fetch full module data including json_data for ModuleViewer
          const { data: moduleData } = await supabase
            .from('modules')
            .select('*')
            .eq('id', content.id)
            .maybeSingle();
          
          if (moduleData) {
            viewerData = {
              moduleData: {
                ...moduleData,
                sections: (moduleData.json_data as any)?.sections || []
              },
              isAdminMode: false,
              isEditable: false
            };
          }
          break;
        case 'news':
          viewerData = {
            ...content.fullContent,
            title: content.name,
            metadata: content.metadata
          };
          break;
        case 'tool':
          viewerData = {
            ...content.fullContent,
            name: content.name
          };
          break;
        case 'prompt':
          viewerData = {
            ...content.fullContent,
            name: content.name
          };
          break;
        default:
          console.warn('Unknown content type:', content.type);
          return;
      }
      
      if (viewerData) {
        setSelectedContent(viewerData);
        setViewerType(type);
        setIsViewerOpen(true);
      }
    } catch (error) {
      console.error('Error loading content for viewer:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading learning plan...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The learning plan you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate('/learning-hub')}>
              Back to Learning Hub
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-primary-glow/20 blur-3xl rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Back Navigation */}
        <section className="py-6 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="hover:bg-card/60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Hub
            </Button>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-card/60 backdrop-blur-xl border border-border shadow-elegant p-8 md:p-14">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-bold mb-6">
                    {plan.name}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl mb-8">
                    {plan.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      {aggregatedRating?.average_rating?.toFixed(1) || '0.0'}/5 ({aggregatedRating?.total_votes || 0} votes)
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      {plan.level} level
                    </div>
                    {contentItems.length > 0 && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        {contentItems.length} items
                      </div>
                    )}
                  </div>

                  {/* Rating Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Rate this plan:</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => submitRating(star)}
                              className="hover:scale-110 transition-transform"
                            >
                              <Star 
                                className={`w-5 h-5 transition-colors ${
                                  star <= (userRating || 0)
                                    ? 'text-amber-500 fill-amber-500' 
                                    : 'text-muted-foreground hover:text-amber-400'
                                }`} 
                              />
                            </button>
                          ))}
                          {userRating && userRating > 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              Your rating: {userRating}/5
                            </span>
                          )}
                        </div>
                      </div>
                      {isCompleted && (
                        <Badge variant="default" className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
                      onClick={() => {
                        const contentSection = document.getElementById('learning-content');
                        if (contentSection) {
                          contentSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="border border-border hover:border-primary/50"
                      onClick={() => toggleBookmark(plan.id, 'learning_plan')}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                    {!isCompleted && (
                      <Button 
                        variant="outline"
                        className="border border-border hover:border-primary/50"
                        onClick={() => markAsCompleted(plan.id, 'learning_plan')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Visual Card */}
                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl h-80 sm:h-[28rem] border border-border bg-gradient-to-br from-card to-card-hover shadow-2xl">
                    {plan.image_url ? (
                      <img src={plan.image_url} alt={plan.name} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-subtle" />

                    <div className="absolute top-4 left-4 right-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-white">
                          <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="text-xs">Learning Plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2 backdrop-blur transition"
                            onClick={() => toggleBookmark(plan.id, 'learning_plan')}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          <button className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2 backdrop-blur transition">
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-white border border-white/20">
                        <div className="flex items-center justify-between text-sm">
                          <span>{contentItems.length > 0 ? `${contentItems.length} learning items` : 'Ready to start'}</span>
                           {plan.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {String(plan.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Stat */}
                  <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Content Items</p>
                        <p className="text-xs text-muted-foreground">{contentItems.length} resources</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Highlights */}
              <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {plan.duration && (
                  <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-lg font-semibold">{String(plan.duration)}</span>
                    <span className="text-xs text-muted-foreground mt-1">Estimated time</span>
                  </div>
                )}
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="text-lg font-semibold">{plan.level}</span>
                  <span className="text-xs text-muted-foreground mt-1">Skill level</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Content</span>
                  <span className="text-lg font-semibold">{contentItems.length}</span>
                  <span className="text-xs text-muted-foreground mt-1">Learning items</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Star className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="text-lg font-semibold">{plan.star_rating}/5</span>
                  <span className="text-xs text-muted-foreground mt-1">User rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Content */}
        {contentItems.length > 0 ? (
          <section id="learning-content" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningPlanViewer 
          contentItems={contentItems} 
          planName={plan.name}
          onViewContent={handleViewContent}
        />
            </div>
          </section>
        ) : (
          <section id="learning-content" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Content Available</h3>
                  <p className="text-muted-foreground mb-6">
                    This learning plan doesn't have any content items yet. Content will appear here once it's added by an administrator.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/learning-hub')}>
                    Browse Other Plans
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Learning Outcomes */}
        {plan.learning_outcomes && plan.learning_outcomes.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-card/60 backdrop-blur-xl border border-border p-8 md:p-14">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    Learning Outcomes
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    What you'll achieve by completing this learning plan
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {plan.learning_outcomes.map((outcome: string, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 hover:shadow-lg transition-shadow">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-base font-medium">{outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Content Viewer Modals */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-y-auto">
          {selectedContent && viewerType === 'module' && (
            <ModuleViewer 
              {...selectedContent}
              onClose={() => setIsViewerOpen(false)}
            />
          )}
          {selectedContent && viewerType === 'tool' && (
            <ToolViewer 
              tool={selectedContent}
              onClose={() => setIsViewerOpen(false)}
            />
          )}
          {selectedContent && viewerType === 'news' && (
            <NewsViewer 
              news={selectedContent}
              onClose={() => setIsViewerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Prompt Viewer Modal - handled separately since it's its own modal */}
      <PromptViewer 
        prompt={selectedContent || { id: '', name: '', description: '', purpose: '', status: '' }}
        open={viewerType === 'prompt' && isViewerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsViewerOpen(false);
            setSelectedContent(null);
            setViewerType(null);
          }
        }}
      />

      <Footer />
    </div>
  );
};

export default Plan;