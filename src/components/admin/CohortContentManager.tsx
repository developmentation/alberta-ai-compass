import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, BookOpen, Wrench, Newspaper, MessageSquare, Users, Trash2, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CohortContentManagerProps {
  cohortId: string;
  cohortName: string;
}

interface CohortContent {
  id: string;
  content_type: 'learning_plan' | 'module' | 'tool' | 'news' | 'prompt' | 'article';
  content_id: string;
  day_number: number;
  order_index: number;
  content_title?: string;
}

interface ContentOption {
  id: string;
  title: string;
  type: 'learning_plan' | 'module' | 'tool' | 'news' | 'prompt' | 'article';
}

export function CohortContentManager({ cohortId, cohortName }: CohortContentManagerProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<CohortContent[]>([]);
  const [availableContent, setAvailableContent] = useState<ContentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [selectedContentId, setSelectedContentId] = useState<string>('');

  const contentTypeIcons = {
    learning_plan: BookOpen,
    module: BookOpen,
    tool: Wrench,
    news: Newspaper,
    prompt: MessageSquare,
    article: Newspaper
  };

  const contentTypeLabels = {
    learning_plan: 'Learning Plan',
    module: 'Module',
    tool: 'Tool',
    news: 'News',
    prompt: 'Prompt',
    article: 'Article'
  };

  useEffect(() => {
    fetchCohortContent();
    fetchAvailableContent();
  }, [cohortId]);

  const fetchCohortContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cohort_content')
        .select('*')
        .eq('cohort_id', cohortId)
        .order('day_number')
        .order('order_index');

      if (error) throw error;

      // Enrich with content titles
      const enrichedContent = await Promise.all(
        (data || []).map(async (item) => {
          let title = 'Unknown Content';
          
          try {
            if (item.content_type === 'learning_plan') {
              const { data: contentData } = await supabase
                .from('learning_plans')
                .select('name')
                .eq('id', item.content_id)
                .single();
              title = contentData?.name || title;
            } else if (item.content_type === 'module') {
              const { data: contentData } = await supabase
                .from('modules')
                .select('description')
                .eq('id', item.content_id)
                .single();
              title = contentData?.description || title;
            } else if (item.content_type === 'tool') {
              const { data: contentData } = await supabase
                .from('tools')
                .select('name')
                .eq('id', item.content_id)
                .single();
              title = contentData?.name || title;
            } else if (item.content_type === 'news') {
              const { data: contentData } = await supabase
                .from('news')
                .select('title')
                .eq('id', item.content_id)
                .single();
              title = contentData?.title || title;
            } else if (item.content_type === 'prompt') {
              const { data: contentData } = await supabase
                .from('prompt_library')
                .select('name')
                .eq('id', item.content_id)
                .single();
              title = contentData?.name || title;
            } else if (item.content_type === 'article') {
              const { data: contentData } = await supabase
                .from('articles')
                .select('title')
                .eq('id', item.content_id)
                .single();
              title = contentData?.title || title;
            }
          } catch (error) {
            console.error('Error fetching content title:', error);
          }

          return {
            ...item,
            content_type: item.content_type as 'learning_plan' | 'module' | 'tool' | 'news' | 'prompt' | 'article',
            content_title: title
          };
        })
      );

      setContent(enrichedContent);
    } catch (error: any) {
      console.error('Error fetching cohort content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch cohort content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableContent = async () => {
    try {
      const [plans, modules, tools, news, prompts, articles] = await Promise.all([
        supabase.from('learning_plans').select('id, name').eq('status', 'published').is('deleted_at', null),
        supabase.from('modules').select('id, description').eq('status', 'published').is('deleted_at', null),
        supabase.from('tools').select('id, name').eq('status', 'published').is('deleted_at', null),
        supabase.from('news').select('id, title').eq('status', 'published').is('deleted_at', null),
        supabase.from('prompt_library').select('id, name').eq('status', 'published').is('deleted_at', null),
        supabase.from('articles').select('id, title').eq('status', 'published').is('deleted_at', null)
      ]);

      const allContent: ContentOption[] = [
        ...(plans.data || []).map(item => ({ id: item.id, title: item.name, type: 'learning_plan' as const })),
        ...(modules.data || []).map(item => ({ id: item.id, title: item.description, type: 'module' as const })),
        ...(tools.data || []).map(item => ({ id: item.id, title: item.name, type: 'tool' as const })),
        ...(news.data || []).map(item => ({ id: item.id, title: item.title, type: 'news' as const })),
        ...(prompts.data || []).map(item => ({ id: item.id, title: item.name, type: 'prompt' as const })),
        ...(articles.data || []).map(item => ({ id: item.id, title: item.title, type: 'article' as const }))
      ];

      setAvailableContent(allContent);
    } catch (error: any) {
      console.error('Error fetching available content:', error);
    }
  };

  const handleAddContent = async () => {
    if (!selectedContentType || !selectedContentId) {
      toast({
        title: "Error",
        description: "Please select content type and item",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cohort_content')
        .insert({
          cohort_id: cohortId,
          content_type: selectedContentType,
          content_id: selectedContentId,
          day_number: selectedDay,
          order_index: 0,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content added to cohort successfully",
      });

      resetAddForm();
      setIsAddDialogOpen(false);
      fetchCohortContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add content",
        variant: "destructive",
      });
    }
  };

  const handleRemoveContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('cohort_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content removed from cohort",
      });

      fetchCohortContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove content",
        variant: "destructive",
      });
    }
  };

  const resetAddForm = () => {
    setSelectedContentType('');
    setSelectedContentId('');
    setSelectedDay(1);
  };

  const getContentByDay = (day: number) => {
    return content.filter(item => item.day_number === day);
  };

  const getMaxDay = () => {
    return Math.max(1, ...content.map(item => item.day_number));
  };

  const getFilteredContentOptions = () => {
    if (!selectedContentType) return [];
    return availableContent.filter(item => item.type === selectedContentType);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {cohortName} - Content Schedule
          </h2>
          <p className="text-muted-foreground">Organize learning content by day</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetAddForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Content to Cohort</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="day">Day</Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="learning_plan">Learning Plan</SelectItem>
                    <SelectItem value="module">Module</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="prompt">Prompt</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="content-item">Content Item</Label>
                <Select 
                  value={selectedContentId} 
                  onValueChange={setSelectedContentId}
                  disabled={!selectedContentType}
                >
                  <SelectTrigger id="content-item">
                    <SelectValue placeholder="Select content item" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {getFilteredContentOptions().map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContent}>
                  Add Content
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content organized by day */}
      <div className="space-y-6">
        {Array.from({ length: getMaxDay() }, (_, i) => i + 1).map((day) => {
          const dayContent = getContentByDay(day);
          
          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Day {day}
                  <Badge variant="secondary">{dayContent.length} items</Badge>
                </CardTitle>
                <CardDescription>
                  Content scheduled for day {day}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dayContent.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No content scheduled for this day
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {dayContent.map((item) => {
                      const IconComponent = contentTypeIcons[item.content_type];
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {item.content_title}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {contentTypeLabels[item.content_type]}
                              </Badge>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveContent(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {content.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content scheduled yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start building your cohort by adding learning content, tools, and resources organized by day.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}