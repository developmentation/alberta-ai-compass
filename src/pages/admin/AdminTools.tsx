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
import { Plus, Edit, Trash2, ExternalLink, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UnifiedMediaUpload } from "@/components/admin/UnifiedMediaUpload";
import { MediaDisplay } from "@/components/admin/MediaDisplay";

interface Tool {
  id: string;
  name: string;
  description: string;
  type: "open_source" | "saas" | "commercial";
  cost_indicator: string | null;
  url: string | null;
  stars: number;
  status: "draft" | "review" | "published" | "archived";
  image_url?: string;
  video_url?: string;
  created_at: string;
  created_by: string;
}

export function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "open_source" as "open_source" | "saas" | "commercial",
    cost_indicator: "",
    url: "",
    status: "draft" as "draft" | "review" | "published" | "archived",
    image_url: "",
    video_url: "",
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error("Error fetching tools:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tools",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const toolData = {
        ...formData,
        cost_indicator: formData.cost_indicator || null,
        url: formData.url || null,
        created_by: user?.id,
        updated_by: user?.id,
      };

      let result;
      if (editingTool) {
        result = await supabase
          .from("tools")
          .update(toolData)
          .eq("id", editingTool.id);
      } else {
        result = await supabase
          .from("tools")
          .insert(toolData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Tool ${editingTool ? "updated" : "created"} successfully`,
      });

      setIsDialogOpen(false);
      setEditingTool(null);
      resetForm();
      fetchTools();
    } catch (error) {
      console.error("Error saving tool:", error);
      toast({
        title: "Error",
        description: "Failed to save tool",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      type: tool.type,
      cost_indicator: tool.cost_indicator || "",
      url: tool.url || "",
      status: tool.status,
      image_url: tool.image_url || "",
      video_url: tool.video_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;

    try {
      const { error } = await supabase
        .from("tools")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tool deleted successfully",
      });

      fetchTools();
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast({
        title: "Error",
        description: "Failed to delete tool",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "open_source",
      cost_indicator: "",
      url: "",
      status: "draft",
      image_url: "",
      video_url: "",
    });
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      open_source: "bg-green-500 text-white",
      saas: "bg-blue-500 text-white",
      commercial: "bg-purple-500 text-white",
    };
    const labels = {
      open_source: "Open Source",
      saas: "SaaS",
      commercial: "Commercial",
    };
    return { color: colors[type as keyof typeof colors], label: labels[type as keyof typeof labels] };
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
            <h1 className="text-3xl font-bold">Tools Management</h1>
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
          <h1 className="text-3xl font-bold">Tools Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingTool(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTool ? "Edit Tool" : "Create Tool"}
                </DialogTitle>
                <DialogDescription>
                  {editingTool ? "Update the tool details" : "Add a new tool to the platform"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter tool name..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter tool description..."
                    rows={4}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open_source">Open Source</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL (Optional)</label>
                    <Input
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cost Indicator (Optional)</label>
                    <Input
                      value={formData.cost_indicator}
                      onChange={(e) => setFormData({ ...formData, cost_indicator: e.target.value })}
                      placeholder="Free, $10/month, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTool ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {tools.map((tool) => {
            const typeBadge = getTypeBadge(tool.type);
            return (
              <Card key={tool.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {tool.name}
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={typeBadge.color}>
                          {typeBadge.label}
                        </Badge>
                        <Badge className={`text-white ${getStatusBadge(tool.status)}`}>
                          {tool.status}
                        </Badge>
                        {tool.cost_indicator && (
                          <Badge variant="outline">
                            {tool.cost_indicator}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <MediaDisplay
                        imageUrl={tool.image_url}
                        videoUrl={tool.video_url}
                        title={tool.name}
                        className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0"
                      />
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tool)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tool.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">
                    {tool.description.length > 200 
                      ? `${tool.description.substring(0, 200)}...`
                      : tool.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(tool.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span>{tool.stars}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {tools.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No tools found. Create your first tool to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}