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
import { Plus, Edit, Trash2, Eye, Move3D, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UnifiedMediaUpload } from "@/components/admin/UnifiedMediaUpload";
import { MediaDisplay } from "@/components/admin/MediaDisplay";

interface ArticleSection {
  type: 'header' | 'text' | 'video' | 'image' | 'hyperlink';
  content: string;
  title?: string;
}

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  level: string;
  status: string;
  is_active: boolean;
  language: string;
  image_url?: string;
  video_url?: string;
  json_data: any;
  created_at: string;
  created_by: string;
}

export function AdminArticles() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ArticleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "1" as "1" | "2" | "3" | "RED",
    status: "draft" as "draft" | "review" | "published" | "archived",
    language: "English",
    image_url: "",
    video_url: "",
    json_data: [] as ArticleSection[],
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles((data || []).map(article => ({
        ...article,
        json_data: Array.isArray(article.json_data) ? article.json_data : []
      })));
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const articleData = {
        ...formData,
        json_data: formData.json_data as any,
        created_by: user?.id,
        updated_by: user?.id,
      };

      let result;
      if (editingItem) {
        result = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", editingItem.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("articles")
          .insert([articleData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Article ${editingItem ? 'updated' : 'created'} successfully`,
      });

      fetchArticles();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'create'} article`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: ArticleItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      level: item.level as "1" | "2" | "3" | "RED",
      status: item.status as "draft" | "review" | "published" | "archived",
      language: item.language,
      image_url: item.image_url || "",
      video_url: item.video_url || "",
      json_data: Array.isArray(item.json_data) ? item.json_data : [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully",
      });

      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchArticles();
    } catch (error) {
      console.error("Error updating article status:", error);
      toast({
        title: "Error",
        description: "Failed to update article status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      level: "1",
      status: "draft",
      language: "English",
      image_url: "",
      video_url: "",
      json_data: [],
    });
    setEditingItem(null);
  };

  const addSection = (type: ArticleSection['type']) => {
    const newSection: ArticleSection = {
      type,
      content: "",
      title: type === 'image' || type === 'video' || type === 'hyperlink' ? "" : undefined,
    };
    setFormData(prev => ({
      ...prev,
      json_data: [...prev.json_data, newSection]
    }));
  };

  const updateSection = (index: number, field: keyof ArticleSection, value: string) => {
    setFormData(prev => ({
      ...prev,
      json_data: prev.json_data.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      json_data: prev.json_data.filter((_, i) => i !== index)
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.json_data.length) return;

    setFormData(prev => {
      const newSections = [...prev.json_data];
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      return { ...prev, json_data: newSections };
    });
  };

  const getStatusBadge = (status: string): "secondary" | "outline" | "default" | "destructive" => {
    const colors = {
      draft: "secondary" as const,
      review: "outline" as const,
      published: "default" as const,
      archived: "destructive" as const,
    };
    return colors[status as keyof typeof colors] || "secondary";
  };

  const getLevelBadge = (level: string): "secondary" | "outline" | "default" | "destructive" => {
    const colors = {
      "1": "secondary" as const,
      "2": "outline" as const, 
      "3": "default" as const,
      "RED": "destructive" as const,
    };
    return colors[level as keyof typeof colors] || "secondary";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Articles Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Article
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] h-[90vh] max-w-none overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Article" : "Create Article"}
                </DialogTitle>
                <DialogDescription>
                  Create comprehensive articles with multiple content sections
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Article title"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Article description"
                    rows={4}
                    required
                  />
                </div>

                {/* Header Media */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Header Media (Optional)</label>
                  <UnifiedMediaUpload
                    onMediaUpload={(url, type) => {
                      if (type === 'image') {
                        setFormData(prev => ({ ...prev, image_url: url }));
                      } else {
                        setFormData(prev => ({ ...prev, video_url: url }));
                      }
                    }}
                    currentImageUrl={formData.image_url}
                    currentVideoUrl={formData.video_url}
                  />
                </div>

                {/* Article Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Article Sections</h3>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => addSection('header')}>
                        + Header
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addSection('text')}>
                        + Text
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addSection('image')}>
                        + Image
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addSection('video')}>
                        + Video
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addSection('hyperlink')}>
                        + Link
                      </Button>
                    </div>
                  </div>

                  {formData.json_data.map((section, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(index, 'down')}
                            disabled={index === formData.json_data.length - 1}
                          >
                            ↓
                          </Button>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{section.type}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSection(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {(section.type === 'image' || section.type === 'video' || section.type === 'hyperlink') && (
                            <Input
                              placeholder="Title/Caption (optional)"
                              value={section.title || ''}
                              onChange={(e) => updateSection(index, 'title', e.target.value)}
                            />
                          )}

                          {section.type === 'header' && (
                            <Input
                              placeholder="Header text"
                              value={section.content}
                              onChange={(e) => updateSection(index, 'content', e.target.value)}
                              required
                            />
                          )}

                          {section.type === 'text' && (
                            <Textarea
                              placeholder="Text content (supports Markdown)"
                              value={section.content}
                              onChange={(e) => updateSection(index, 'content', e.target.value)}
                              rows={4}
                              required
                            />
                          )}

                          {section.type === 'hyperlink' && (
                            <Input
                              placeholder="URL"
                              type="url"
                              value={section.content}
                              onChange={(e) => updateSection(index, 'content', e.target.value)}
                              required
                            />
                          )}

                          {(section.type === 'image' || section.type === 'video') && (
                            <div className="border-2 border-dashed border-border rounded-lg p-4">
                              <UnifiedMediaUpload
                                onMediaUpload={(url, type) => {
                                  updateSection(index, 'content', url);
                                }}
                                currentImageUrl={section.type === 'image' ? section.content : ''}
                                currentVideoUrl={section.type === 'video' ? section.content : ''}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Level</label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, level: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="RED">RED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
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

                <Button type="submit" className="w-full">
                  {editingItem ? "Update Article" : "Create Article"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Articles List */}
        <div className="grid gap-6">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">No articles found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create your first article to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getStatusBadge(article.status)}>
                          {article.status}
                        </Badge>
                        <Badge variant={getLevelBadge(article.level)}>
                          Level {article.level}
                        </Badge>
                        {!article.is_active && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{article.description}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        Sections: {article.json_data?.length || 0}
                      </div>
                    </div>
                    {(article.image_url || article.video_url) && (
                      <MediaDisplay
                        imageUrl={article.image_url}
                        videoUrl={article.video_url}
                        title={article.title}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={article.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleActive(article.id, article.is_active)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {article.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}