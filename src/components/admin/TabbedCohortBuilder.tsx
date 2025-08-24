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
import { Calendar, Settings, Layout, Save, X, Plus, Edit2, Trash2, GripVertical, Users } from 'lucide-react';
import { UnifiedMediaUpload } from './UnifiedMediaUpload';
import { EnhancedContentBuilder, type EnhancedContentItem } from './EnhancedContentBuilder';
import { MediaDisplay } from './MediaDisplay';
import { CohortMemberManager } from './CohortMemberManager';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface CohortDay {
  day_number: number;
  day_name: string;
  day_description: string;
  day_image_url?: string;
  planned_date?: string;
  content_items: EnhancedContentItem[];
}

interface CohortFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "completed";
  image_url: string;
  video_url: string;
  days: CohortDay[];
}

interface TabbedCohortBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CohortFormData) => void;
  initialData?: Partial<CohortFormData>;
  isEditing?: boolean;
  cohortId?: string;
}

export function TabbedCohortBuilder({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  isEditing = false,
  cohortId 
}: TabbedCohortBuilderProps) {
  const [formData, setFormData] = useState<CohortFormData>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active",
    image_url: "",
    video_url: "",
    days: [],
  });

  const [editingDay, setEditingDay] = useState<CohortDay | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialData) {
      console.log('TabbedCohortBuilder - Initial Data:', initialData);
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = () => {
    console.log('TabbedCohortBuilder - handleSubmit formData:', formData);
    onSave(formData);
  };

  const handleClose = () => {
    // Always reset form when closing, except during editing
    if (!isEditing) {
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "active",
        image_url: "",
        video_url: "",
        days: [],
      });
    }
    onClose();
  };

  const handleAddDay = () => {
    const newDay: CohortDay = {
      day_number: formData.days.length + 1,
      day_name: `Day ${formData.days.length + 1}`,
      day_description: '',
      content_items: []
    };
    setFormData({ ...formData, days: [...formData.days, newDay] });
  };

  const handleEditDay = (day: CohortDay, index: number) => {
    setEditingDay({ ...day });
    setSelectedDayIndex(index);
  };

  const handleSaveDay = () => {
    if (!editingDay || selectedDayIndex === null) return;
    
    const updatedDays = [...formData.days];
    updatedDays[selectedDayIndex] = editingDay;
    setFormData({ ...formData, days: updatedDays });
    setEditingDay(null);
    setSelectedDayIndex(null);
  };

  const handleDeleteDay = (index: number) => {
    const updatedDays = formData.days.filter((_, i) => i !== index);
    // Renumber days
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      day_number: idx + 1,
      day_name: day.day_name.includes('Day ') ? `Day ${idx + 1}` : day.day_name
    }));
    setFormData({ ...formData, days: renumberedDays });
  };

  const handleUpdateDayContent = (dayIndex: number, items: EnhancedContentItem[]) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].content_items = items;
    setFormData({ ...formData, days: updatedDays });
  };

  const onDragEndDays = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formData.days);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Renumber days
    const renumberedDays = items.map((day, idx) => ({
      ...day,
      day_number: idx + 1
    }));

    setFormData({ ...formData, days: renumberedDays });
  };

  const totalContentItems = formData.days.reduce((acc, day) => acc + day.content_items.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? "Edit Cohort" : "Create Cohort"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic Details
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Schedule Builder
              <Badge className="ml-1 text-xs">{formData.days.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2" disabled={!isEditing}>
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="basic" className="space-y-4 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cohort Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter cohort name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this cohort and its objectives..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cohort Media</CardTitle>
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
                    bucketName="cohort-assets"
                    allowAiGeneration={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4 p-1">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Cohort Schedule</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Plan each day of your cohort with content, activities, and resources
                      </p>
                    </div>
                    <Button onClick={handleAddDay} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Day
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.days.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No days scheduled yet</p>
                      <Button onClick={handleAddDay} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Day
                      </Button>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={onDragEndDays}>
                      <Droppable droppableId="cohort-days">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {formData.days.map((day, dayIndex) => (
                              <Draggable key={`day-${day.day_number}`} draggableId={`day-${day.day_number}`} index={dayIndex}>
                                {(provided, snapshot) => (
                                  <Card 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={snapshot.isDragging ? 'shadow-lg' : ''}
                                  >
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center gap-3">
                                        <div 
                                          {...provided.dragHandleProps}
                                          className="cursor-grab hover:cursor-grabbing text-muted-foreground"
                                        >
                                          <GripVertical className="h-4 w-4" />
                                        </div>
                                        <Badge variant="outline" className="font-mono">
                                          Day {day.day_number}
                                        </Badge>
                                        <div className="flex-1">
                                          <h3 className="font-medium">{day.day_name}</h3>
                                          {day.day_description && (
                                            <p className="text-sm text-muted-foreground">{day.day_description}</p>
                                          )}
                                          {day.planned_date && (
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(day.planned_date).toLocaleDateString()}
                                            </p>
                                          )}
                                        </div>
                                        {day.day_image_url && (
                                          <MediaDisplay
                                            imageUrl={day.day_image_url}
                                            title={day.day_name}
                                            className="w-12 h-12 rounded object-cover"
                                          />
                                        )}
                                        <Badge variant="secondary" className="text-xs">
                                          {day.content_items.length} items
                                        </Badge>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditDay(day, dayIndex)}
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteDay(dayIndex)}
                                            className="text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <EnhancedContentBuilder
                                        title={`Day ${day.day_number} Content`}
                                        contentItems={day.content_items}
                                        onUpdateContent={(items) => handleUpdateDayContent(dayIndex, items)}
                                      />
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="members" className="space-y-4 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Members</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage who can access this cohort
                  </p>
                </CardHeader>
                <CardContent>
                  {isEditing && cohortId ? (
                    <CohortMemberManager cohortId={cohortId} />
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Save the cohort first to manage members</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="overview" className="space-y-4 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Cohort Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {formData.name || "Not set"}</div>
                        <div><strong>Duration:</strong> {formData.start_date && formData.end_date 
                          ? `${new Date(formData.start_date).toLocaleDateString()} - ${new Date(formData.end_date).toLocaleDateString()}`
                          : formData.start_date ? `Starts ${new Date(formData.start_date).toLocaleDateString()}` : "Not set"
                        }</div>
                        <div><strong>Status:</strong> {formData.status}</div>
                        <div><strong>Total Days:</strong> {formData.days.length}</div>
                        <div><strong>Total Content Items:</strong> {totalContentItems}</div>
                      </div>
                    </div>
                    
                    {(formData.image_url || formData.video_url) && (
                      <div>
                        <h4 className="font-medium mb-3">Cohort Media</h4>
                        <MediaDisplay
                          imageUrl={formData.image_url}
                          videoUrl={formData.video_url}
                          title={formData.name}
                          className="w-48 h-32 rounded-md overflow-hidden"
                        />
                      </div>
                    )}
                  </div>

                  {formData.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                    </div>
                  )}

                  {formData.days.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Schedule Summary</h4>
                      <div className="space-y-2">
                        {formData.days.map((day) => (
                          <div key={day.day_number} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Day {day.day_number}</Badge>
                              <span className="text-sm">{day.day_name}</span>
                              {day.planned_date && (
                                <span className="text-xs text-muted-foreground">
                                  ({new Date(day.planned_date).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {day.content_items.length} items
                            </Badge>
                          </div>
                        ))}
                      </div>
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
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.start_date}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Cohort" : "Create Cohort"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>

      {/* Day Edit Dialog */}
      <Dialog open={!!editingDay} onOpenChange={() => {setEditingDay(null); setSelectedDayIndex(null);}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Day {editingDay?.day_number}</DialogTitle>
          </DialogHeader>
          
          {editingDay && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Day Name</Label>
                  <Input
                    value={editingDay.day_name}
                    onChange={(e) => setEditingDay({ ...editingDay, day_name: e.target.value })}
                    placeholder="Enter day name..."
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Planned Date (Optional)</Label>
                  <Input
                    type="date"
                    value={editingDay.planned_date || ''}
                    onChange={(e) => setEditingDay({ ...editingDay, planned_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">Description</Label>
                <Textarea
                  value={editingDay.day_description}
                  onChange={(e) => setEditingDay({ ...editingDay, day_description: e.target.value })}
                  placeholder="Describe what happens on this day..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">Day Image</Label>
                <UnifiedMediaUpload
                  onMediaUpload={(url, type) => {
                    if (type === 'image') {
                      setEditingDay({ ...editingDay, day_image_url: url });
                    }
                  }}
                  currentImageUrl={editingDay.day_image_url}
                  bucketName="cohort-day-assets"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => {setEditingDay(null); setSelectedDayIndex(null);}}>
                  Cancel
                </Button>
                <Button onClick={handleSaveDay}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}