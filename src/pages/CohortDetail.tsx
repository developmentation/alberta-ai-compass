import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/LoginModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar, Clock, Users, BookOpen, MessageSquare, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCohortMembership } from '@/hooks/useCohortMembership';
import { MediaDisplay } from '@/components/admin/MediaDisplay';
import { CohortDiscussions } from '@/components/CohortDiscussions';
import { NewsViewer } from '@/components/NewsViewer';
import { ToolViewer } from '@/components/ToolViewer';
import { ModuleViewer } from '@/components/ModuleViewer';
import { PromptViewer } from '@/components/PromptViewer';
import { ArticleViewer } from '@/components/ArticleViewer';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface CohortData {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'inactive' | 'completed';
  image_url?: string;
  video_url?: string;
  days: CohortDay[];
}

interface CohortDay {
  day_number: number;
  day_name: string;
  day_description: string;
  day_image_url?: string;
  content_items: ContentItem[];
}

interface ContentItem {
  id: string;
  type: string;
  name: string;
  description: string;
  image_url?: string;
  video_url?: string;
  order_index: number;
  content_data?: any;
}

export default function CohortDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isInAnyCohort } = useCohortMembership();
  const { toast } = useToast();
  
  const [cohort, setCohort] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [selectedViewer, setSelectedViewer] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    if (id) {
      fetchCohortData();
    }
  }, [id]);

  useEffect(() => {
    if (user && cohort) {
      checkMembership();
    }
  }, [user, cohort]);

  const fetchCohortData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch cohort basic info
      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle();

      if (cohortError) throw cohortError;
      if (!cohortData) {
        toast({
          title: 'Error',
          description: 'Cohort not found',
          variant: 'destructive'
        });
        return;
      }

      // Fetch cohort content/days
      const { data: cohortContent, error: contentError } = await supabase
        .from('cohort_content')
        .select('*')
        .eq('cohort_id', id)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true });

      if (contentError) throw contentError;

      // Group content by day and fetch actual content details
      const dayGroups = cohortContent?.reduce((acc: any, content: any) => {
        const dayKey = content.day_number;
        if (!acc[dayKey]) {
          acc[dayKey] = {
            day_number: content.day_number,
            day_name: content.day_name || `Day ${content.day_number}`,
            day_description: content.day_description || '',
            day_image_url: content.day_image_url,
            content_items: []
          };
        }
        if (content.content_id) {
          acc[dayKey].content_items.push({
            content_id: content.content_id,
            content_type: content.content_type,
            order_index: content.order_index || 0
          });
        }
        return acc;
      }, {});

      // Fetch actual content details
      const daysWithContent = await Promise.all(
        Object.values(dayGroups || {}).map(async (day: any) => {
          const contentItemsWithDetails = await Promise.all(
            day.content_items.map(async (item: any) => {
              let contentDetails = null;
              
              try {
                switch (item.content_type) {
                  case 'module':
                  case 'learning_module':
                    const { data: moduleData } = await supabase
                      .from('modules')
                      .select('*')
                      .eq('id', item.content_id)
                      .is('deleted_at', null)
                      .maybeSingle();
                    contentDetails = moduleData;
                    break;
                  case 'news':
                    const { data: newsData } = await supabase
                      .from('news')
                      .select('*')
                      .eq('id', item.content_id)
                      .is('deleted_at', null)
                      .maybeSingle();
                    contentDetails = newsData;
                    break;
                  case 'tool':
                    const { data: toolData } = await supabase
                      .from('tools')
                      .select('*')
                      .eq('id', item.content_id)
                      .is('deleted_at', null)
                      .maybeSingle();
                    contentDetails = toolData;
                    break;
                  case 'prompt':
                    const { data: promptData } = await supabase
                      .from('prompt_library')
                      .select('*')
                      .eq('id', item.content_id)
                      .is('deleted_at', null)
                      .maybeSingle();
                    contentDetails = promptData;
                    break;
                  case 'learning_plan':
                    const { data: planData } = await supabase
                      .from('learning_plans')
                      .select('*')
                      .eq('id', item.content_id)
                      .is('deleted_at', null)
                      .maybeSingle();
                    contentDetails = planData;
                    break;
                  case 'article':
                    const { data: articleData } = await supabase
                      .from('articles')
                      .select('*')
                      .eq('id', item.content_id)
                      .eq('is_active', true)
                      .is('deleted_at', null)
                      .maybeSingle();
                    contentDetails = articleData;
                    break;
                  default:
                    console.warn(`Unknown content type: ${item.content_type}`);
                    break;
                }
              } catch (error) {
                console.error(`Error fetching ${item.content_type} content:`, error);
              }
              
              if (!contentDetails) return null;

              return {
                id: item.content_id,
                type: item.content_type,
                name: contentDetails.title || contentDetails.name || `${item.content_type} item`,
                description: contentDetails.description || contentDetails.purpose || '',
                image_url: contentDetails.image_url || '',
                video_url: contentDetails.video_url || '',
                order_index: item.order_index,
                content_data: contentDetails
              };
            })
          );
          
          return {
            ...day,
            content_items: contentItemsWithDetails.filter(Boolean).sort((a, b) => a.order_index - b.order_index)
          };
        })
      );

      setCohort({
        ...cohortData,
        days: daysWithContent.sort((a, b) => a.day_number - b.day_number)
      });

    } catch (error) {
      console.error('Error fetching cohort:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cohort details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user || !cohort) return;
    
    try {
      const { data, error } = await supabase
        .from('cohort_members')
        .select('id, first_visit, last_visit')
        .eq('cohort_id', cohort.id)
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsMember(true);
        // Update visit tracking
        await updateVisitTracking(data.id, data.first_visit, data.last_visit);
      } else {
        setIsMember(false);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const updateVisitTracking = async (memberId: string, firstVisit: string | null, lastVisit: string | null) => {
    try {
      const now = new Date().toISOString();
      const updates: any = {
        last_visit: now
      };

      // Set first_visit only if it hasn't been set before
      if (!firstVisit) {
        updates.first_visit = now;
      }

      const { error } = await supabase
        .from('cohort_members')
        .update(updates)
        .eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating visit tracking:', error);
    }
  };

  const handleContentClick = async (content: ContentItem) => {
    if (content.type === 'learning_plan') {
      // Navigate to the learning plan
      window.location.href = `/plan/${content.id}`;
    } else if (content.type === 'module' || content.type === 'learning_module') {
      try {
        // Fetch full module data including json_data for ModuleViewer
        const { data: moduleData } = await supabase
          .from('modules')
          .select('*')
          .eq('id', content.id)
          .maybeSingle();
        
        if (moduleData) {
          // Parse json_data if it's a string
          const jsonData = typeof moduleData.json_data === 'string' 
            ? JSON.parse(moduleData.json_data) 
            : moduleData.json_data;
            
          const moduleViewerData = {
            id: moduleData.id,
            title: moduleData.name || jsonData?.title || 'Untitled Module',
            description: moduleData.description || jsonData?.description || '',
            level: moduleData.level || 'beginner',
            duration: jsonData?.duration || 30,
            learningOutcomes: jsonData?.learningOutcomes || jsonData?.learning_outcomes || [],
            tags: jsonData?.tags || [],
            sections: jsonData?.sections || [],
            imageUrl: moduleData.image_url || '',
            videoUrl: moduleData.video_url || ''
          };
          
          setSelectedContent(moduleViewerData);
          setSelectedViewer(content.type);
        }
      } catch (error) {
        console.error('Error loading module data:', error);
      }
    } else if (content.type === 'article') {
      // For articles, use the content_data which contains the full article details
      setSelectedContent(content.content_data || content);
      setSelectedViewer('article');
    } else {
      // For other content types, use the content_data which contains the full details
      setSelectedContent(content.content_data || content);
      setSelectedViewer(content.type);
    }
  };

  const handleCloseViewer = () => {
    setSelectedContent(null);
    setSelectedViewer(null);
  };

  const getDaysRemaining = () => {
    if (!cohort?.end_date) return null;
    const today = new Date();
    const end = new Date(cohort.end_date);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const currentDay = cohort?.days.find(day => day.day_number === selectedDay);
  const daysRemaining = getDaysRemaining();

  if (loading) {
    return (
      <>
        <Header onLoginClick={() => setLoginModalOpen(true)} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!cohort) {
    return <Navigate to="/cohorts" replace />;
  }

  if (!user) {
    return (
      <>
        <Header onLoginClick={() => setLoginModalOpen(true)} />
        <main className="min-h-screen bg-background pt-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
                <p className="text-muted-foreground mb-4">
                  Please sign in to access cohort content and discussions.
                </p>
                <Button onClick={() => setLoginModalOpen(true)}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      </>
    );
  }

  if (!isMember) {
    return (
      <>
        <Header onLoginClick={() => setLoginModalOpen(true)} />
        <main className="min-h-screen bg-background ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground mb-4">
                  You are not a member of this cohort. Contact your facilitator for access.
                </p>
                <Button onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header onLoginClick={() => setLoginModalOpen(true)} />
      <main className="min-h-screen bg-background pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cohort Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{cohort.name}</h1>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`text-white ${getStatusColor(cohort.status)}`}>
                    {cohort.status}
                  </Badge>
                  {cohort.end_date && daysRemaining !== null && (
                    <Badge variant="outline">
                      {daysRemaining > 0 
                        ? `${daysRemaining} days left`
                        : daysRemaining === 0
                        ? "Ends today"
                        : `Ended ${Math.abs(daysRemaining)} days ago`
                      }
                    </Badge>
                  )}
                </div>
                {cohort.description && (
                  <p className="text-muted-foreground mb-4">{cohort.description}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Started {formatDistanceToNow(new Date(cohort.start_date), { addSuffix: true })}</span>
                  </div>
                  {cohort.end_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Ends {new Date(cohort.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              {(cohort.image_url || cohort.video_url) && (
                <div className="ml-6">
                  <MediaDisplay
                    imageUrl={cohort.image_url}
                    videoUrl={cohort.video_url}
                    title={cohort.name}
                    className="w-32 h-24 rounded-lg overflow-hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Learning Content
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Day Navigation */}
              {cohort.days.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Day Navigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                        disabled={selectedDay <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <div className="flex gap-2 flex-wrap justify-center">
                        {cohort.days.map((day) => (
                          <Button
                            key={day.day_number}
                            variant={selectedDay === day.day_number ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDay(day.day_number)}
                          >
                            Day {day.day_number}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDay(Math.min(cohort.days.length, selectedDay + 1))}
                        disabled={selectedDay >= cohort.days.length}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Day Content */}
              {currentDay ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline">Day {currentDay.day_number}</Badge>
                          {currentDay.day_name}
                        </CardTitle>
                        {currentDay.day_description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {currentDay.day_description}
                          </p>
                        )}
                      </div>
                      {currentDay.day_image_url && (
                        <MediaDisplay
                          imageUrl={currentDay.day_image_url}
                          title={currentDay.day_name}
                          className="w-24 h-16 rounded-md overflow-hidden ml-4"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentDay.content_items.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No content scheduled for this day yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentDay.content_items.map((content) => (
                          <Card 
                            key={content.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                            onClick={() => handleContentClick(content)}
                          >
                            {/* Media Preview Section */}
                            {(content.image_url || content.video_url) && (
                              <div className="relative w-full h-32 bg-muted">
                                <MediaDisplay
                                  imageUrl={content.image_url}
                                  videoUrl={content.video_url}
                                  title={content.name}
                                  className="w-full h-full object-cover"
                                />
                                {content.video_url && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="bg-white/90 rounded-full p-2">
                                      <Play className="w-6 h-6 text-gray-800" />
                                    </div>
                                  </div>
                                )}
                                <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                                  {content.type}
                                </Badge>
                              </div>
                            )}
                            
                            <CardHeader className={`pb-3 ${!(content.image_url || content.video_url) ? 'pt-4' : 'pt-3'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {!(content.image_url || content.video_url) && (
                                    <Badge variant="secondary" className="text-xs mb-2">
                                      {content.type}
                                    </Badge>
                                  )}
                                  <CardTitle className="text-sm line-clamp-2">
                                    {content.name}
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                            {content.description && (
                              <CardContent className="pt-0">
                                <p className="text-xs text-muted-foreground line-clamp-3">
                                  {content.description}
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No content available for this cohort yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="discussion">
              <CohortDiscussions cohortId={cohort.id} isActive={activeTab === "discussion"} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Content Viewers */}
      {selectedViewer === 'news' && selectedContent && (
        <NewsViewer 
          news={selectedContent} 
          onClose={handleCloseViewer}
        />
      )}
      {selectedViewer === 'article' && selectedContent && (
        <Dialog open={!!selectedContent && selectedViewer === 'article'} onOpenChange={(open) => {
          if (!open) {
            handleCloseViewer();
          }
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <ArticleViewer 
              article={selectedContent} 
              onClose={handleCloseViewer}
            />
          </DialogContent>
        </Dialog>
      )}
      {selectedViewer === 'tool' && selectedContent && (
        <ToolViewer 
          tool={selectedContent} 
          onClose={handleCloseViewer}
        />
      )}
      {(selectedViewer === 'module' || selectedViewer === 'learning_module') && selectedContent && (
        <Dialog open={!!selectedContent && (selectedViewer === 'module' || selectedViewer === 'learning_module')} onOpenChange={(open) => {
          if (!open) {
            handleCloseViewer();
          }
        }}>
          <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-y-auto">
            <ModuleViewer 
              moduleData={selectedContent}
              onClose={handleCloseViewer}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Prompt Viewer - Uses its own modal system */}
      {selectedViewer === 'prompt' && selectedContent && (
        <PromptViewer 
          prompt={selectedContent}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseViewer();
            }
          }}
        />
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}