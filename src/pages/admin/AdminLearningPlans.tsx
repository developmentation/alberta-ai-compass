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
import { Plus, Edit, Trash2, Users, Clock, Star, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UnifiedMediaUpload } from "@/components/admin/UnifiedMediaUpload";
import { MediaDisplay } from "@/components/admin/MediaDisplay";

interface LearningPlan {
  id: string;
  name: string;
  description: string;
  steps: any;
  level: "1" | "2" | "3" | "RED";
  status: "draft" | "review" | "published" | "archived";
  star_rating: number;
  language: string;
  duration: string | null;
  learning_outcomes: string[] | null;
  is_ai_generated: boolean;
  image_url?: string;
  video_url?: string;
  created_at: string;
  created_by: string;
}

export function AdminLearningPlans() {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<LearningPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "1" as "1" | "2" | "3" | "RED",
    status: "draft" as "draft" | "review" | "published" | "archived",
    language: "English",
    duration: "",
    learning_outcomes: "",
    steps: "",
    image_url: "",
    video_url: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_plans")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data?.map(plan => ({
        ...plan,
        duration: plan.duration ? String(plan.duration) : null
      })) || []);
    } catch (error) {
      console.error("Error fetching learning plans:", error);
      toast({
        title: "Error",
        description: "Failed to fetch learning plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const outcomesArray = formData.learning_outcomes
        .split(",")
        .map(outcome => outcome.trim())
        .filter(outcome => outcome.length > 0);

      const stepsArray = formData.steps
        .split("\n")
        .map(step => step.trim())
        .filter(step => step.length > 0);

      const planData = {
        name: formData.name,
        description: formData.description,
        level: formData.level,
        status: formData.status,
        language: formData.language,
        duration: formData.duration || null,
        learning_outcomes: outcomesArray.length > 0 ? outcomesArray : null,
        steps: { steps: stepsArray },
        created_by: user?.id,
        updated_by: user?.id,
      };

      let result;
      if (editingPlan) {
        result = await supabase
          .from("learning_plans")
          .update(planData)
          .eq("id", editingPlan.id);
      } else {
        result = await supabase
          .from("learning_plans")
          .insert(planData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Learning plan ${editingPlan ? "updated" : "created"} successfully`,
      });

      setIsDialogOpen(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error("Error saving learning plan:", error);
      toast({
        title: "Error",
        description: "Failed to save learning plan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan: LearningPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      level: plan.level,
      status: plan.status,
      language: plan.language,
      duration: plan.duration || "",
      learning_outcomes: plan.learning_outcomes ? plan.learning_outcomes.join(", ") : "",
      steps: plan.steps?.steps ? plan.steps.steps.join("\n") : "",
      image_url: plan.image_url || "",
      video_url: plan.video_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this learning plan?")) return;

    try {
      const { error } = await supabase
        .from("learning_plans")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Learning plan deleted successfully",
      });

      fetchPlans();
    } catch (error) {
      console.error("Error deleting learning plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete learning plan",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
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
    });
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
            <h1 className="text-3xl font-bold">Learning Plans</h1>
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
          <h1 className="text-3xl font-bold">Learning Plans</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingPlan(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Learning Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Edit Learning Plan" : "Create Learning Plan"}
                </DialogTitle>
                <DialogDescription>
                  {editingPlan ? "Update the learning plan details" : "Add a new learning plan to the platform"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter plan name..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Input
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      placeholder="English"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter plan description..."
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

                <div className="grid grid-cols-3 gap-4">
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (Optional)</label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 2 weeks"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Outcomes (comma-separated)</label>
                  <Textarea
                    value={formData.learning_outcomes}
                    onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
                    placeholder="Understand AI basics, Apply machine learning, Create neural networks..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Steps (one per line)</label>
                  <Textarea
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                    placeholder="Introduction to AI concepts
Watch video tutorials
Complete hands-on exercises
Take final assessment"
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPlan ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {plan.name}
                      {plan.is_ai_generated && (
                        <Badge variant="outline" className="text-xs">
                          AI Generated
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={`text-white ${getLevelBadge(plan.level)}`}>
                        Level {plan.level}
                      </Badge>
                      <Badge className={`text-white ${getStatusBadge(plan.status)}`}>
                        {plan.status}
                      </Badge>
                      {plan.duration && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {plan.duration}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <MediaDisplay
                      imageUrl={plan.image_url}
                      videoUrl={plan.video_url}
                      title={plan.name}
                      className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0"
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    {plan.description.length > 200 
                      ? `${plan.description.substring(0, 200)}...`
                      : plan.description}
                  </p>
                  
                  {plan.learning_outcomes && plan.learning_outcomes.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Learning Outcomes:</div>
                      <div className="flex flex-wrap gap-1">
                        {plan.learning_outcomes.slice(0, 3).map((outcome, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {outcome}
                          </Badge>
                        ))}
                        {plan.learning_outcomes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.learning_outcomes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(plan.created_at).toLocaleDateString()} • Language: {plan.language}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span>{plan.star_rating}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {plans.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No learning plans found. Create your first learning plan to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}