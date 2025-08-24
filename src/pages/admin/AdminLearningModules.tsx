import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Eye, Trash2, Loader2, BookOpen } from 'lucide-react';
import { ModuleCreator } from '@/components/admin/ModuleCreator';
import { ModuleViewer } from '@/components/ModuleViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MediaDisplay } from '@/components/admin/MediaDisplay';

interface Module {
  id: string;
  name?: string;
  description: string;
  json_data: any;
  language: string;
  level: '1' | '2' | '3' | 'RED';
  status: 'draft' | 'review' | 'published' | 'archived';
  image_url?: string;
  video_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AdminLearningModules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchModules();
    }
  }, [user]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module deleted successfully",
      });

      fetchModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const convertModuleToViewerData = (module: Module) => {
    return {
      id: module.id,
      title: module.name || 'Untitled Module',
      description: module.description || '',
      level: module.level, // Keep the original level value
      duration: module.json_data?.duration || 30, // Use actual duration from json_data
      learningOutcomes: module.json_data?.learningOutcomes || [],
      tags: module.json_data?.tags || [],
      sections: module.json_data?.sections || [],
      imageUrl: module.image_url || undefined,
      videoUrl: module.video_url || undefined
    };
  };

  const handleViewModule = (module: Module) => {
    setViewingModule(module);
    setEditingModule(null);
    setIsViewerOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setViewingModule(null);
    setIsViewerOpen(true);
  };

  const handleSaveModule = async (updatedData: any) => {
    if (!editingModule) return;

    try {
      const { error } = await supabase
        .from('modules')
        .update({ 
          name: updatedData.title,
          description: updatedData.description,
          json_data: {
            ...updatedData,
            sections: updatedData.sections,
            duration: updatedData.duration,
            learningOutcomes: updatedData.learningOutcomes,
            tags: updatedData.tags
          },
          image_url: updatedData.imageUrl || null,
          video_url: updatedData.videoUrl || null,
          level: updatedData.level, // Use level directly
          updated_at: new Date().toISOString()
        })
        .eq('id', editingModule.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module updated successfully",
      });

      setIsViewerOpen(false);
      setEditingModule(null);
      fetchModules();
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to update module",
        variant: "destructive",
      });
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setViewingModule(null);
    setEditingModule(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      '1': 'bg-green-100 text-green-800',
      '2': 'bg-blue-100 text-blue-800', 
      '3': 'bg-orange-100 text-orange-800',
      'RED': 'bg-red-100 text-red-800'
    };
    
    const labels = {
      '1': 'Level 1',
      '2': 'Level 2',
      '3': 'Level 3', 
      'RED': 'RED Level'
    };
    
    return (
      <Badge className={colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[level as keyof typeof labels] || level}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Learning Modules</h1>
            <p className="text-muted-foreground">Create and manage AI-generated learning modules</p>
          </div>
          
          <Button onClick={() => setIsCreatorOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Module
          </Button>
        </div>

        {modules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first AI-generated learning module to get started with structured educational content.
              </p>
              <Button onClick={() => setIsCreatorOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {module.name || 'Untitled Module'}
                      </CardTitle>
                      {getStatusBadge(module.status)}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <MediaDisplay
                        imageUrl={module.image_url}
                        videoUrl={module.video_url}
                        title={module.name || 'Module'}
                        className="w-20 h-16 rounded-md overflow-hidden"
                      />
                    </div>
                  </div>
                  
                  <CardDescription className="line-clamp-3">
                    {module.description || 'No description provided'}
                  </CardDescription>
                  
                  <div className="flex gap-2">
                    {getLevelBadge(module.level)}
                    <Badge variant="outline">{module.language}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {new Date(module.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewModule(module)}
                        title="View Module"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditModule(module)}
                        title="Edit Module"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(module.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete Module"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ModuleCreator
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          onModuleCreated={fetchModules}
        />

        {/* Module Viewer Dialog */}
        <Dialog open={isViewerOpen} onOpenChange={handleCloseViewer}>
          <DialogContent className="max-w-7xl h-[90vh] p-0">
            {(viewingModule || editingModule) && (
              <ModuleViewer
                moduleData={convertModuleToViewerData(viewingModule || editingModule!)}
                isAdminMode={true}
                isEditable={!!editingModule}
                onSave={editingModule ? handleSaveModule : undefined}
                onClose={handleCloseViewer}
                moduleId={(viewingModule || editingModule)?.id}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}