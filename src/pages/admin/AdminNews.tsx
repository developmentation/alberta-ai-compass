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
import { Plus, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UnifiedMediaUpload } from "@/components/admin/UnifiedMediaUpload";
import { MediaDisplay } from "@/components/admin/MediaDisplay";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  level: string;
  status: string;
  is_active: boolean;
  language: string;
  stars_rating: number;
  image_url?: string;
  video_url?: string;
  metadata?: any;
  created_at: string;
  created_by: string;
}

export function AdminNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
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
    metadata: {
      social_links: {
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
      }
    },
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .is('deleted_at', null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsItems(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Error",
        description: "Failed to fetch news items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newsData = {
        ...formData,
        created_by: user?.id,
        updated_by: user?.id,
      };

      let result;
      if (editingItem) {
        result = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingItem.id);
      } else {
        result = await supabase
          .from("news")
          .insert(newsData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `News item ${editingItem ? "updated" : "created"} successfully`,
      });

      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      fetchNews();
    } catch (error) {
      console.error("Error saving news:", error);
      toast({
        title: "Error",
        description: "Failed to save news item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      level: item.level as "1" | "2" | "3" | "RED",
      status: item.status as "draft" | "review" | "published" | "archived",
      language: item.language,
      image_url: item.image_url || "",
      video_url: item.video_url || "",
      metadata: {
        social_links: {
          facebook: item.metadata?.social_links?.facebook || "",
          twitter: item.metadata?.social_links?.twitter || "",
          linkedin: item.metadata?.social_links?.linkedin || "",
          instagram: item.metadata?.social_links?.instagram || "",
        }
      },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const { error } = await supabase
        .from("news")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "News item deleted successfully",
      });

      fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
      toast({
        title: "Error",
        description: "Failed to delete news item",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("news")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `News item ${!currentStatus ? "activated" : "deactivated"}`,
      });

      fetchNews();
    } catch (error) {
      console.error("Error updating news:", error);
      toast({
        title: "Error",
        description: "Failed to update news item",
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
      metadata: {
        social_links: {
          facebook: "",
          twitter: "",
          linkedin: "",
          instagram: "",
        }
      },
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

  const getLevelBadge = (level: string) => {
    const colors = {
      "1": "bg-green-500",
      "2": "bg-yellow-500", 
      "3": "bg-orange-500",
      "RED": "bg-red-500",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">News Management</h1>
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
          <h1 className="text-3xl font-bold">News Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingItem(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add News Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit News Item" : "Create News Item"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the news item details" : "Add a new news item to the platform"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter news title..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter news description..."
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
                    <label className="text-sm font-medium">Level</label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Level 1</SelectItem>
                        <SelectItem value="2">Level 2</SelectItem>
                        <SelectItem value="3">Level 3</SelectItem>
                        <SelectItem value="RED">RED</SelectItem>
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

                <div className="space-y-4">
                  <label className="text-sm font-medium">Social Media Links</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Facebook</label>
                      <Input
                        value={formData.metadata.social_links.facebook}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            social_links: {
                              ...formData.metadata.social_links,
                              facebook: e.target.value
                            }
                          }
                        })}
                        placeholder="Facebook URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">X</label>
                      <Input
                        value={formData.metadata.social_links.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            social_links: {
                              ...formData.metadata.social_links,
                              twitter: e.target.value
                            }
                          }
                        })}
                        placeholder="X URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">LinkedIn</label>
                      <Input
                        value={formData.metadata.social_links.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            social_links: {
                              ...formData.metadata.social_links,
                              linkedin: e.target.value
                            }
                          }
                        })}
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Instagram</label>
                      <Input
                        value={formData.metadata.social_links.instagram}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            social_links: {
                              ...formData.metadata.social_links,
                              instagram: e.target.value
                            }
                          }
                        })}
                        placeholder="Instagram URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {newsItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={`text-white ${getLevelBadge(item.level)}`}>
                        Level {item.level}
                      </Badge>
                      <Badge className={`text-white ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </Badge>
                      {!item.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <MediaDisplay
                      imageUrl={item.image_url}
                      videoUrl={item.video_url}
                      title={item.title}
                      className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0"
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(item.id, item.is_active)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-2">
                  {item.description.length > 200 
                    ? `${item.description.substring(0, 200)}...`
                    : item.description}
                </p>
                {item.metadata?.social_links && (
                  <div className="flex gap-2 mb-2">
                    {item.metadata.social_links.facebook && (
                      <a href={item.metadata.social_links.facebook} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </a>
                    )}
                    {item.metadata.social_links.twitter && (
                      <a href={item.metadata.social_links.twitter} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                      </a>
                    )}
                    {item.metadata.social_links.linkedin && (
                      <a href={item.metadata.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-blue-700" />
                      </a>
                    )}
                    {item.metadata.social_links.instagram && (
                      <a href={item.metadata.social_links.instagram} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-pink-500" />
                      </a>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(item.created_at).toLocaleDateString()} • 
                  Language: {item.language} • 
                  Rating: {item.stars_rating}/5
                </div>
              </CardContent>
            </Card>
          ))}
          
          {newsItems.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No news items found. Create your first news item to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}