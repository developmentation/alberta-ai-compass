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
import { TabbedLearningPlanBuilder } from "@/components/admin/TabbedLearningPlanBuilder";
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
  content_items?: any[];
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

  const [isTabbedBuilderOpen, setIsTabbedBuilderOpen] = useState(false);

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
      setPlans(data?.map((plan: any) => ({
        ...plan,
        duration: plan.duration ? String(plan.duration) : null,
        content_items: Array.isArray(plan.content_items) ? plan.content_items : []
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

  const handleSavePlan = async (formData: any) => {
    try {
      const outcomesArray = formData.learning_outcomes
        .split(",")
        .map((outcome: string) => outcome.trim())
        .filter((outcome: string) => outcome.length > 0);

      const stepsArray = formData.steps
        .split("\n")
        .map((step: string) => step.trim())
        .filter((step: string) => step.length > 0);

      const planData = {
        name: formData.name,
        description: formData.description,
        level: formData.level,
        status: formData.status,
        language: formData.language,
        duration: formData.duration || null,
        learning_outcomes: outcomesArray.length > 0 ? outcomesArray : null,
        steps: { steps: stepsArray },
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        content_items: formData.content_items || [],
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

      setIsTabbedBuilderOpen(false);
      setEditingPlan(null);
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
    setIsTabbedBuilderOpen(true);
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

  const getInitialData = (plan?: LearningPlan) => {
    if (!plan) return {};
    
    return {
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
      content_items: plan.content_items || [],
    };
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
          <Button onClick={() => { setEditingPlan(null); setIsTabbedBuilderOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Learning Plan
          </Button>
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
                <p className="text-muted-foreground text-sm">
                  {plan.description.length > 200 
                    ? `${plan.description.substring(0, 200)}...`
                    : plan.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <TabbedLearningPlanBuilder
          isOpen={isTabbedBuilderOpen}
          onClose={() => setIsTabbedBuilderOpen(false)}
          onSave={handleSavePlan}
          initialData={getInitialData(editingPlan)}
          isEditing={!!editingPlan}
        />
      </div>
    </AdminLayout>
  );
}