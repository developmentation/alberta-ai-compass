import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { NewsViewer } from '@/components/NewsViewer';
import { ToolViewer } from '@/components/ToolViewer';
import { ModuleViewer } from '@/components/ModuleViewer';
import { PromptViewer } from '@/components/PromptViewer';
import { LearningPlanViewer } from '@/components/LearningPlanViewer';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  type: 'modules' | 'news' | 'tools' | 'prompts' | 'learning_plans';
  name?: string;
  title?: string;
}

interface UniversalContentOpenerProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
}

export function UniversalContentOpener({ isOpen, onClose, content }: UniversalContentOpenerProps) {
  const [loading, setLoading] = useState(false);
  const [viewerData, setViewerData] = useState<any>(null);

  const fetchContentData = async (content: ContentItem) => {
    if (!content) return null;

    setLoading(true);
    
    try {
      switch (content.type) {
        case 'modules':
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
              
            return {
              type: 'module',
              data: {
                moduleData: {
                  id: moduleData.id,
                  title: moduleData.name || jsonData?.title || 'Untitled Module',
                  description: moduleData.description || jsonData?.description || '',
                  level: moduleData.level,
                  duration: jsonData?.duration || 30,
                  learningOutcomes: jsonData?.learningOutcomes || [],
                  tags: jsonData?.tags || [],
                  sections: jsonData?.sections || [],
                  imageUrl: moduleData.image_url || '',
                  videoUrl: moduleData.video_url || ''
                },
                isAdminMode: false,
                isEditable: false
              }
            };
          }
          break;
          
        case 'news':
          const { data: newsData } = await supabase
            .from('news')
            .select('*')
            .eq('id', content.id)
            .maybeSingle();
          
          if (newsData) {
            return {
              type: 'news',
              data: {
                ...newsData,
                title: newsData.title
              }
            };
          }
          break;
          
        case 'tools':
          const { data: toolData } = await supabase
            .from('tools')
            .select('*')
            .eq('id', content.id)
            .maybeSingle();
          
          if (toolData) {
            return {
              type: 'tool',
              data: toolData
            };
          }
          break;
          
        case 'prompts':
          const { data: promptData } = await supabase
            .from('prompt_library')
            .select('*')
            .eq('id', content.id)
            .maybeSingle();
          
          if (promptData) {
            return {
              type: 'prompt',
              data: promptData
            };
          }
          break;
          
        case 'learning_plans':
          const { data: planData } = await supabase
            .from('learning_plans')
            .select('*')
            .eq('id', content.id)
            .maybeSingle();
          
          if (planData && planData.content_items && Array.isArray(planData.content_items)) {
            // Fetch content items for the learning plan
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
                      .select('id, title, description, image_url, video_url, status, level')
                      .eq('id', item.original_id)
                      .maybeSingle();
                    contentDetails = newsData ? { ...newsData, name: newsData.title } : null;
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
                };
              }
              return null;
            });

            const resolvedContent = await Promise.all(contentPromises);
            const validContent = resolvedContent.filter(item => item !== null);
            
            // Sort by order_index
            validContent.sort((a, b) => a.order_index - b.order_index);
            
            return {
              type: 'learning_plan',
              data: {
                contentItems: validContent,
                planName: planData.name,
                plan: planData
              }
            };
          }
          break;
          
        default:
          console.warn('Unknown content type:', content.type);
          return null;
      }
    } catch (error) {
      console.error('Error fetching content data:', error);
      toast.error('Failed to load content');
      return null;
    } finally {
      setLoading(false);
    }
    
    return null;
  };

  const handleOpenChange = async (open: boolean) => {
    if (open && content && !viewerData) {
      const data = await fetchContentData(content);
      setViewerData(data);
    } else if (!open) {
      onClose();
      // Reset viewer data after modal closes to prevent stale data
      setTimeout(() => {
        setViewerData(null);
      }, 200);
    }
  };

  const handleContentView = async (contentItem: any) => {
    // For nested content in learning plans, fetch and open the specific item
    const nestedContent = {
      id: contentItem.id,
      type: contentItem.type === 'module' ? 'modules' : 
            contentItem.type === 'news' ? 'news' :
            contentItem.type === 'tool' ? 'tools' :
            contentItem.type === 'prompt' ? 'prompts' : contentItem.type
    };
    
    const data = await fetchContentData(nestedContent);
    if (data) {
      setViewerData(data);
    }
  };

  const renderViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading content...</span>
        </div>
      );
    }

    if (!viewerData) return null;

    switch (viewerData.type) {
      case 'news':
        return <NewsViewer news={viewerData.data} onClose={onClose} />;
      case 'tool':
        return <ToolViewer tool={viewerData.data} onClose={onClose} />;
      case 'module':
        return <ModuleViewer {...viewerData.data} onClose={onClose} />;
      case 'prompt':
        return (
          <PromptViewer 
            prompt={viewerData.data} 
            open={true} 
            onOpenChange={(open) => !open && onClose()}
          >
            <div /> {/* Required children prop */}
          </PromptViewer>
        );
      case 'learning_plan':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{viewerData.data.planName}</h2>
            <LearningPlanViewer 
              contentItems={viewerData.data.contentItems}
              planName={viewerData.data.planName}
              onViewContent={handleContentView}
            />
          </div>
        );
      default:
        return <div className="p-6">Unknown content type</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {renderViewer()}
      </DialogContent>
    </Dialog>
  );
}