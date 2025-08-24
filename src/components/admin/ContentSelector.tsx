import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, BookOpen, Newspaper, Wrench, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  name: string;
  description?: string;
  type: 'module' | 'news' | 'tool' | 'prompt' | 'learning_plan';
  status: string;
  image_url?: string;
  video_url?: string;
}

interface ContentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: ContentItem) => void;
  selectedIds?: string[];
}

export function ContentSelector({ isOpen, onClose, onSelect, selectedIds = [] }: ContentSelectorProps) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<'all' | 'module' | 'news' | 'tool' | 'prompt' | 'learning_plan'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchContent();
    }
  }, [isOpen, contentType]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const items: ContentItem[] = [];

      // Fetch modules
      if (contentType === 'all' || contentType === 'module') {
        const { data: modules, error: modulesError } = await supabase
          .from('modules')
          .select('id, name, description, status, image_url, video_url')
          .in('status', ['published', 'draft', 'review'])
          .is('deleted_at', null);
        
        console.log('Modules fetch result:', { modules, modulesError });
        
        if (modules) {
          items.push(...modules.map((m: any) => ({ ...m, type: 'module' as const })));
        }
      }

      // Fetch news
      if (contentType === 'all' || contentType === 'news') {
        const { data: news, error: newsError } = await supabase
          .from('news')
          .select('id, title, description, status, image_url, video_url')
          .in('status', ['published', 'draft', 'review'])
          .eq('is_active', true)
          .is('deleted_at', null);
        
        console.log('News fetch result:', { news, newsError });
        
        if (news) {
          items.push(...news.map((n: any) => ({ ...n, name: n.title, type: 'news' as const })));
        }
      }

      // Fetch tools
      if (contentType === 'all' || contentType === 'tool') {
        const { data: tools, error: toolsError } = await supabase
          .from('tools')
          .select('id, name, description, status, image_url, video_url')
          .in('status', ['published', 'draft', 'review'])
          .is('deleted_at', null);
        
        console.log('Tools fetch result:', { tools, toolsError });
        
        if (tools) {
          items.push(...tools.map((t: any) => ({ ...t, type: 'tool' as const })));
        }
      }

      // Fetch prompts
      if (contentType === 'all' || contentType === 'prompt') {
        const { data: prompts, error: promptsError } = await supabase
          .from('prompt_library')
          .select('id, name, description, status, image_url')
          .in('status', ['published', 'draft', 'review'])
          .is('deleted_at', null);
        
        console.log('Prompts fetch result:', { prompts, promptsError });
        
        if (prompts) {
          items.push(...prompts.map((p: any) => ({ ...p, type: 'prompt' as const })));
        }
      }

      // Fetch learning plans
      if (contentType === 'all' || contentType === 'learning_plan') {
        const { data: plans, error: plansError } = await supabase
          .from('learning_plans')
          .select('id, name, description, status, image_url, video_url')
          .in('status', ['published', 'draft', 'review'])
          .is('deleted_at', null);
        
        console.log('Learning plans fetch result:', { plans, plansError });
        
        if (plans) {
          items.push(...plans.map((p: any) => ({ ...p, type: 'learning_plan' as const })));
        }
      }

      console.log('Final items array:', items);
      console.log('Items by type:', items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      setContentItems(items);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return <BookOpen className="h-4 w-4" />;
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'tool': return <Wrench className="h-4 w-4" />;
      case 'prompt': return <MessageSquare className="h-4 w-4" />;
      case 'learning_plan': return <BookOpen className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'module': return 'bg-blue-500';
      case 'news': return 'bg-green-500';
      case 'tool': return 'bg-purple-500';
      case 'prompt': return 'bg-orange-500';
      case 'learning_plan': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredItems = contentItems.filter(item =>
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Content to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 items-center border-b pb-4">
          <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="module">Modules</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="tool">Tools</SelectItem>
              <SelectItem value="prompt">Prompts</SelectItem>
              <SelectItem value="learning_plan">Learning Plans</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4 p-2">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <Card 
                    key={`${item.type}-${item.id}`} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => onSelect(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {(item.image_url || item.video_url) ? (
                            item.video_url && !item.image_url ? (
                              <video
                                src={item.video_url}
                                className="w-12 h-12 rounded object-cover"
                                muted
                                playsInline
                              />
                            ) : (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )
                          ) : (
                            <div className={`w-12 h-12 rounded flex items-center justify-center text-white ${getTypeColor(item.type)}`}>
                              {getTypeIcon(item.type)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              {item.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-white ${getTypeColor(item.type)}`}>
                                {item.type}
                              </Badge>
                              {isSelected && (
                                <Badge variant="outline">Selected</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  No content found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}