import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Settings, Layout, Save, X } from 'lucide-react';
import { UnifiedMediaUpload } from './UnifiedMediaUpload';
import { EnhancedContentBuilder, type EnhancedContentItem } from './EnhancedContentBuilder';
import { MediaDisplay } from './MediaDisplay';

interface LearningPlanFormData {
  name: string;
  description: string;
  level: "1" | "2" | "3" | "RED";
  status: "draft" | "review" | "published" | "archived";
  language: string;
  duration: string;
  learning_outcomes: string;
  steps: string;
  image_url: string;
  video_url: string;
  content_items: EnhancedContentItem[];
}

interface TabbedLearningPlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LearningPlanFormData) => void;
  initialData?: Partial<LearningPlanFormData>;
  isEditing?: boolean;
}

export function TabbedLearningPlanBuilder({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  isEditing = false 
}: TabbedLearningPlanBuilderProps) {
  const [formData, setFormData] = useState<LearningPlanFormData>({
    name: "",
    description: "",
    level: "1",
    status: "draft",
    language: "English",
    duration: "",
    learning_outcomes: "",
    steps: "",
    image_url: "",
    video_url: "",
    content_items: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSave(formData);
  };

  const handleClose = () => {
    if (!isEditing) {
      setFormData({
        name: "",
        description: "",
        level: "1",
        status: "draft",
        language: "English",
        duration: "",
        learning_outcomes: "",
        steps: "",
        image_url: "",
        video_url: "",
        content_items: [],
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {isEditing ? "Edit Learning Plan" : "Create Learning Plan"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic Details
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Content Builder
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Structure & Steps
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="basic" className="space-y-4 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Plan Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter learning plan name..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Input
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        placeholder="English"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what this learning plan covers..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => setFormData({ ...formData, level: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1 - Beginner</SelectItem>
                          <SelectItem value="2">Level 2 - Intermediate</SelectItem>
                          <SelectItem value="3">Level 3 - Advanced</SelectItem>
                          <SelectItem value="RED">RED - Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="review">Under Review</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Duration</Label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 2 weeks, 40 hours"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Outcomes</Label>
                    <Textarea
                      value={formData.learning_outcomes}
                      onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
                      placeholder="What will learners achieve? (comma-separated)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <UnifiedMediaUpload
                    onMediaUpload={(url, type) => {
                      if (type === 'image') {
                        setFormData({ ...formData, image_url: url, video_url: url ? '' : formData.video_url });
                      } else {
                        setFormData({ ...formData, video_url: url, image_url: url ? '' : formData.image_url });
                      }
                    }}
                    currentImageUrl={formData.image_url}
                    currentVideoUrl={formData.video_url}
                    bucketName="learning-plan-assets"
                    allowAiGeneration={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 p-1">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Learning Plan Content</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Build your learning path by adding modules, news, tools, and prompts in sequence
                      </p>
                    </div>
                    <Badge className="text-xs">
                      {formData.content_items.length} items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <EnhancedContentBuilder
                    title="Learning Path Items"
                    contentItems={formData.content_items}
                    onUpdateContent={(items) => setFormData({ ...formData, content_items: items })}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="structure" className="space-y-4 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Steps & Structure</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Define the step-by-step progression through this learning plan
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Learning Steps</Label>
                    <Textarea
                      value={formData.steps}
                      onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                      placeholder="Define the learning steps (one per line):

1. Introduction and overview
2. Core concepts and theory  
3. Hands-on practice exercises
4. Apply knowledge to real scenarios
5. Assessment and validation"
                      rows={8}
                    />
                  </div>

                  {formData.content_items.length > 0 && (
                    <div className="space-y-3">
                      <Label>Content Overview</Label>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">
                          Your learning plan includes:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.content_items.map((item, index) => (
                            <Badge key={item.id} variant="outline" className="text-xs">
                              {index + 1}. {item.custom_title || item.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(formData.image_url || formData.video_url) && (
                    <div className="space-y-2">
                      <Label>Plan Media Preview</Label>
                      <MediaDisplay
                        imageUrl={formData.image_url}
                        videoUrl={formData.video_url}
                        title={formData.name}
                        className="w-48 h-32 rounded-md overflow-hidden"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          
          <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.description}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}