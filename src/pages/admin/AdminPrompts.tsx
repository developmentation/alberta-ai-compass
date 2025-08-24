import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, TestTube, Star, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UnifiedMediaUpload } from "@/components/admin/UnifiedMediaUpload";
import { MediaDisplay } from "@/components/admin/MediaDisplay";

interface Prompt {
  id: string;
  name: string;
  description: string;
  purpose: string;
  sample_output: string | null;
  stars: number;
  sector_tags: any;
  status: "draft" | "review" | "published" | "archived";
  image_url?: string;
  video_url?: string;
  created_at: string;
  created_by: string;
}

export function AdminPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testingPrompt, setTestingPrompt] = useState<Prompt | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    purpose: "",
    sample_output: "",
    status: "draft" as "draft" | "review" | "published" | "archived",
    sector_tags: "",
    image_url: "",
    video_url: "",
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from("prompt_library")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch prompts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sectorTagsArray = formData.sector_tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const promptData = {
        name: formData.name,
        description: formData.description,
        purpose: formData.purpose,
        sample_output: formData.sample_output || null,
        status: formData.status,
        sector_tags: { tags: sectorTagsArray },
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        created_by: user?.id,
        updated_by: user?.id,
      };

      let result;
      if (editingPrompt) {
        result = await supabase
          .from("prompt_library")
          .update(promptData)
          .eq("id", editingPrompt.id);
      } else {
        result = await supabase
          .from("prompt_library")
          .insert(promptData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Prompt ${editingPrompt ? "updated" : "created"} successfully`,
      });

      setIsDialogOpen(false);
      setEditingPrompt(null);
      resetForm();
      fetchPrompts();
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      description: prompt.description,
      purpose: prompt.purpose,
      sample_output: prompt.sample_output || "",
      status: prompt.status,
      sector_tags: prompt.sector_tags?.tags ? prompt.sector_tags.tags.join(", ") : "",
      image_url: prompt.image_url || "",
      video_url: prompt.video_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const { error } = await supabase
        .from("prompt_library")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      });

      fetchPrompts();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    }
  };

  const handleCopyPrompt = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.description);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    });
  };

  const handleTestPrompt = (prompt: Prompt) => {
    setTestingPrompt(prompt);
    setIsTestDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      purpose: "",
      sample_output: "",
      status: "draft",
      sector_tags: "",
      image_url: "",
      video_url: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-500",
      review: "bg-yellow-500",
      published: "bg-green-500",
      archived: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Prompt Library</h1>
          </div>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Prompt Library</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingPrompt(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPrompt ? "Edit Prompt" : "Create Prompt"}
                </DialogTitle>
                <DialogDescription>
                  {editingPrompt ? "Update the prompt details" : "Add a new prompt to the library"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter prompt name..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose</label>
                  <Input
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="What is this prompt designed to do?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter the full prompt text..."
                    rows={6}
                    required
                  />
                </div>

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
                  bucketName="media-assets"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample Output (Optional)</label>
                  <Textarea
                    value={formData.sample_output}
                    onChange={(e) => setFormData({ ...formData, sample_output: e.target.value })}
                    placeholder="Example output from this prompt..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sector Tags (comma-separated)</label>
                  <Input
                    value={formData.sector_tags}
                    onChange={(e) => setFormData({ ...formData, sector_tags: e.target.value })}
                    placeholder="education, healthcare, business, etc."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPrompt ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{prompt.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={`text-white ${getStatusBadge(prompt.status)}`}>
                        {prompt.status}
                      </Badge>
                      {prompt.sector_tags?.tags?.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    <MediaDisplay
                      imageUrl={prompt.image_url}
                      videoUrl={prompt.video_url}
                      title={prompt.name}
                      className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0"
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPrompt(prompt)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestPrompt(prompt)}
                    >
                      <TestTube className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Purpose:</div>
                    <p className="text-sm">{prompt.purpose}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Prompt:</div>
                    <p className="text-sm bg-muted/50 p-3 rounded-md font-mono">
                      {prompt.description.length > 300 
                        ? `${prompt.description.substring(0, 300)}...`
                        : prompt.description}
                    </p>
                  </div>
                  
                  {prompt.sample_output && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Sample Output:</div>
                      <p className="text-sm bg-green-50 p-3 rounded-md">
                        {prompt.sample_output.length > 200 
                          ? `${prompt.sample_output.substring(0, 200)}...`
                          : prompt.sample_output}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(prompt.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span>{prompt.stars}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {prompts.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No prompts found. Create your first prompt to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Test Prompt Dialog */}
        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Test Prompt: {testingPrompt?.name}</DialogTitle>
              <DialogDescription>
                Test this prompt with available LLM providers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="text-sm font-medium mb-2">Prompt:</div>
                <p className="text-sm font-mono">{testingPrompt?.description}</p>
              </div>
              
              <div className="text-center text-muted-foreground">
                <p>LLM testing integration will be available when API keys are configured.</p>
                <p className="text-xs mt-1">Go to Admin → Setup to configure LLM providers.</p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setIsTestDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}