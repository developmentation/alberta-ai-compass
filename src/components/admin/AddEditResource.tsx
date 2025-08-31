import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { UnifiedMediaUpload } from "./UnifiedMediaUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useResources } from "@/hooks/useResources";
import { Loader2, Link as LinkIcon, Users } from "lucide-react";

interface AddEditResourceProps {
  resource?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddEditResource = ({ resource, onSuccess, onCancel }: AddEditResourceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { resources } = useResources();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    level: "1",
    language: "English",
    status: "draft" as "draft" | "review" | "published" | "archived",
    is_active: true,
    parent_id: "",
    image_url: "",
    video_url: "",
    metadata: {} as any,
  });

  // Parent resources (only top-level resources can be parents)
  const parentResources = resources.filter(r => !r.parent_id && r.id !== resource?.id);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || "",
        description: resource.description || "",
        url: resource.url || "",
        level: resource.level || "1",
        language: resource.language || "English",
        status: resource.status || "draft",
        is_active: resource.is_active !== false,
        parent_id: resource.parent_id || "",
        image_url: resource.image_url || "",
        video_url: resource.video_url || "",
        metadata: resource.metadata || {},
      });
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const resourceData = {
        ...formData,
        parent_id: formData.parent_id === "none" ? null : formData.parent_id || null,
        metadata: formData.metadata,
        json_data: [],
        level: formData.level as "1" | "2" | "3" | "RED",
        status: formData.status as "draft" | "review" | "published" | "archived",
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (resource) {
        // Update existing resource
        const { error } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resource.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
      } else {
        // Create new resource
        const { error } = await supabase
          .from('resources')
          .insert({
            ...resourceData,
            created_by: user.id,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Resource created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error",
        description: resource ? "Failed to update resource" : "Failed to create resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Resource Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter resource title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the resource"
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="RED">RED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Resource (Optional)</Label>
                <Select value={formData.parent_id || "none"} onValueChange={(value) => setFormData({ ...formData, parent_id: value === "none" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent resource (leave empty for top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-level resource)</SelectItem>
                    {parentResources.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.parent_id && formData.parent_id !== "none" && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      Child of: {parentResources.find(p => p.id === formData.parent_id)?.title}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedMediaUpload
                onMediaUpload={(url, type) => {
                  if (type === 'image') {
                    setFormData({ ...formData, image_url: url });
                  } else {
                    setFormData({ ...formData, video_url: url });
                  }
                }}
                currentImageUrl={formData.image_url}
                currentVideoUrl={formData.video_url}
                bucketName="content-assets"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active</Label>
                  <div className="text-sm text-muted-foreground">
                    Whether this resource is active and can be viewed
                  </div>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {resource ? "Update Resource" : "Create Resource"}
        </Button>
      </div>
    </form>
  );
};