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
import { Plus, Edit, Trash2, Calendar, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EnhancedMediaUpload } from "@/components/admin/EnhancedMediaUpload";

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: "active" | "inactive" | "completed";
  image_url?: string;
  video_url?: string;
  created_at: string;
  created_by: string;
}

export function AdminCohorts() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active" as "active" | "inactive" | "completed",
    image_url: "",
    video_url: "",
  });

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      const { data, error } = await supabase
        .from("cohorts")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCohorts(data || []);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cohorts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cohortData = {
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
        created_by: user?.id,
        updated_by: user?.id,
      };

      let result;
      if (editingCohort) {
        result = await supabase
          .from("cohorts")
          .update(cohortData)
          .eq("id", editingCohort.id);
      } else {
        result = await supabase
          .from("cohorts")
          .insert(cohortData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Cohort ${editingCohort ? "updated" : "created"} successfully`,
      });

      setIsDialogOpen(false);
      setEditingCohort(null);
      resetForm();
      fetchCohorts();
    } catch (error) {
      console.error("Error saving cohort:", error);
      toast({
        title: "Error",
        description: "Failed to save cohort",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description || "",
      start_date: cohort.start_date.split("T")[0], // Format for date input
      end_date: cohort.end_date ? cohort.end_date.split("T")[0] : "",
      status: cohort.status,
      image_url: cohort.image_url || "",
      video_url: cohort.video_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cohort?")) return;

    try {
      const { error } = await supabase
        .from("cohorts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cohort deleted successfully",
      });

      fetchCohorts();
    } catch (error) {
      console.error("Error deleting cohort:", error);
      toast({
        title: "Error",
        description: "Failed to delete cohort",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "active",
      image_url: "",
      video_url: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      completed: "bg-blue-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Cohorts Management</h1>
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
          <h1 className="text-3xl font-bold">Cohorts Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingCohort(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Cohort
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCohort ? "Edit Cohort" : "Create Cohort"}
                </DialogTitle>
                <DialogDescription>
                  {editingCohort ? "Update the cohort details" : "Add a new learning cohort"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter cohort name..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter cohort description..."
                    rows={3}
                  />
                </div>

                <EnhancedMediaUpload
                  onImageUpload={(url) => setFormData({ ...formData, image_url: url })}
                  onVideoUpload={(url) => setFormData({ ...formData, video_url: url })}
                  imageUrl={formData.image_url}
                  videoUrl={formData.video_url}
                  bucketName="cohort-assets"
                  allowAiGeneration={true}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date (Optional)</label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCohort ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => {
            const daysRemaining = getDaysRemaining(cohort.end_date);
            return (
              <Card key={cohort.id}>
                {cohort.image_url && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={cohort.image_url} 
                      alt={cohort.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{cohort.name}</CardTitle>
                      <Badge className={`text-white ${getStatusBadge(cohort.status)}`}>
                        {cohort.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cohort)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cohort.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cohort.description && (
                      <p className="text-sm text-muted-foreground">
                        {cohort.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Starts: {formatDate(cohort.start_date)}</span>
                      </div>
                      
                      {cohort.end_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Ends: {formatDate(cohort.end_date)}</span>
                          {daysRemaining !== null && (
                            <Badge variant="outline" className="ml-2">
                              {daysRemaining > 0 
                                ? `${daysRemaining} days left`
                                : daysRemaining === 0
                                ? "Ends today"
                                : `Ended ${Math.abs(daysRemaining)} days ago`
                              }
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Created: {formatDate(cohort.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {cohorts.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No cohorts found. Create your first cohort to get started.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}