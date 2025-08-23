import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Calendar, X, Edit2, BookOpen, Newspaper, Wrench, MessageSquare, Users, GripVertical } from 'lucide-react';
import { ContentSelector } from './ContentSelector';
import { UnifiedMediaUpload } from './UnifiedMediaUpload';
import { MediaDisplay } from './MediaDisplay';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface ContentItem {
  id: string;
  name: string;
  description?: string;
  type: 'module' | 'news' | 'tool' | 'prompt' | 'learning_plan';
  status: string;
  image_url?: string;
  video_url?: string;
  order_index: number;
}

interface CohortDay {
  day_number: number;
  day_name: string;
  day_description: string;
  day_image_url?: string;
  planned_date?: string;
  content_items: ContentItem[];
}

interface CohortDayManagerProps {
  days: CohortDay[];
  onUpdateDays: (days: CohortDay[]) => void;
}

export function CohortDayManager({ days, onUpdateDays }: CohortDayManagerProps) {
  const [editingDay, setEditingDay] = useState<CohortDay | null>(null);
  const [isContentSelectorOpen, setIsContentSelectorOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return <BookOpen className="h-4 w-4" />;
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'tool': return <Wrench className="h-4 w-4" />;
      case 'prompt': return <MessageSquare className="h-4 w-4" />;
      case 'learning_plan': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'module': return 'bg-blue-500';
      case 'news': return 'bg-green-500';
      case 'tool': return 'bg-purple-500';
      case 'prompt': return 'bg-orange-500';
      case 'learning_plan': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddDay = () => {
    const newDay: CohortDay = {
      day_number: days.length + 1,
      day_name: `Day ${days.length + 1}`,
      day_description: '',
      content_items: []
    };
    onUpdateDays([...days, newDay]);
  };

  const handleEditDay = (day: CohortDay, index: number) => {
    setEditingDay({ ...day });
    setSelectedDayIndex(index);
  };

  const handleSaveDay = () => {
    if (!editingDay || selectedDayIndex === null) return;
    
    const updatedDays = [...days];
    updatedDays[selectedDayIndex] = editingDay;
    onUpdateDays(updatedDays);
    setEditingDay(null);
    setSelectedDayIndex(null);
  };

  const handleDeleteDay = (index: number) => {
    const updatedDays = days.filter((_, i) => i !== index);
    // Renumber days
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      day_number: idx + 1,
      day_name: day.day_name.includes('Day ') ? `Day ${idx + 1}` : day.day_name
    }));
    onUpdateDays(renumberedDays);
  };

  const handleAddContentToDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setIsContentSelectorOpen(true);
  };

  const handleSelectContent = (content: any) => {
    if (selectedDayIndex === null) return;
    
    const updatedDays = [...days];
    const day = updatedDays[selectedDayIndex];
    
    const contentItem: ContentItem = {
      ...content,
      order_index: day.content_items.length
    };
    
    day.content_items = [...day.content_items, contentItem];
    onUpdateDays(updatedDays);
    setIsContentSelectorOpen(false);
    setSelectedDayIndex(null);
  };

  const handleRemoveContentFromDay = (dayIndex: number, contentIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].content_items = updatedDays[dayIndex].content_items.filter((_, i) => i !== contentIndex);
    // Reorder indices
    updatedDays[dayIndex].content_items = updatedDays[dayIndex].content_items.map((item, idx) => ({
      ...item,
      order_index: idx
    }));
    onUpdateDays(updatedDays);
  };

  const handleContentDragEnd = (result: any, dayIndex: number) => {
    if (!result.destination) return;

    const updatedDays = [...days];
    const dayContent = [...updatedDays[dayIndex].content_items];
    const [reorderedItem] = dayContent.splice(result.source.index, 1);
    dayContent.splice(result.destination.index, 0, reorderedItem);

    // Update order indices
    const reorderedContent = dayContent.map((item, index) => ({
      ...item,
      order_index: index
    }));

    updatedDays[dayIndex].content_items = reorderedContent;
    onUpdateDays(updatedDays);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cohort Schedule</h3>
        <Button onClick={handleAddDay} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Day
        </Button>
      </div>

      {days.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No days scheduled for this cohort yet.</p>
            <Button onClick={handleAddDay} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Day
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {days.map((day, dayIndex) => (
            <Card key={day.day_number}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      Day {day.day_number}
                    </Badge>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{day.day_name}</CardTitle>
                      {day.day_description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {day.day_description}
                        </p>
                      )}
                      {day.planned_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Planned: {new Date(day.planned_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {day.day_image_url && (
                      <MediaDisplay
                        imageUrl={day.day_image_url}
                        title={day.day_name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
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
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Content ({day.content_items.length} items)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddContentToDay(dayIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Content
                    </Button>
                  </div>
                  
                  {day.content_items.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No content added for this day yet.
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={(result) => handleContentDragEnd(result, dayIndex)}>
                      <Droppable droppableId={`day-${dayIndex}-content`}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {day.content_items.map((item, itemIndex) => (
                              <Draggable
                                key={`${item.type}-${item.id}-${dayIndex}`}
                                draggableId={`${item.type}-${item.id}-${dayIndex}`}
                                index={itemIndex}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center gap-3 p-3 bg-muted/50 rounded-md ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="cursor-grab hover:cursor-grabbing text-muted-foreground"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    
                                    <span className="text-xs bg-background px-2 py-1 rounded font-mono">
                                      {itemIndex + 1}
                                    </span>

                                    {item.image_url ? (
                                      <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-8 h-8 rounded object-cover"
                                      />
                                    ) : (
                                      <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${getTypeColor(item.type)}`}>
                                        {getTypeIcon(item.type)}
                                      </div>
                                    )}

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{item.name}</span>
                                        <Badge className={`text-white ${getTypeColor(item.type)} text-xs`}>
                                          {item.type}
                                        </Badge>
                                      </div>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveContentFromDay(dayIndex, itemIndex)}
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                  <label className="text-sm font-medium mb-1 block">Day Name</label>
                  <Input
                    value={editingDay.day_name}
                    onChange={(e) => setEditingDay({ ...editingDay, day_name: e.target.value })}
                    placeholder="Enter day name..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Planned Date (Optional)</label>
                  <Input
                    type="date"
                    value={editingDay.planned_date || ''}
                    onChange={(e) => setEditingDay({ ...editingDay, planned_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={editingDay.day_description}
                  onChange={(e) => setEditingDay({ ...editingDay, day_description: e.target.value })}
                  placeholder="Describe what happens on this day..."
                  rows={3}
                />
              </div>

              <UnifiedMediaUpload
                onMediaUpload={(url, type) => {
                  if (type === 'image') {
                    setEditingDay({ ...editingDay, day_image_url: url });
                  }
                }}
                currentImageUrl={editingDay.day_image_url}
                bucketName="cohort-assets"
              />

              <div className="flex justify-end gap-2">
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

      {/* Content Selector */}
      <ContentSelector
        isOpen={isContentSelectorOpen}
        onClose={() => {setIsContentSelectorOpen(false); setSelectedDayIndex(null);}}
        onSelect={handleSelectContent}
        selectedIds={selectedDayIndex !== null ? days[selectedDayIndex]?.content_items.map(item => item.id) : []}
      />
    </div>
  );
}