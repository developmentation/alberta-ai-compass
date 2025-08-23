import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, X, Save, BookOpen, Newspaper, Wrench, MessageSquare, GripVertical } from 'lucide-react';
import { ContentSelector } from './ContentSelector';
import { UnifiedMediaUpload } from './UnifiedMediaUpload';
import { MediaDisplay } from './MediaDisplay';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export interface EnhancedContentItem {
  id: string;
  original_id: string;
  name: string;
  description?: string;
  type: 'module' | 'news' | 'tool' | 'prompt' | 'learning_plan';
  status: string;
  image_url?: string;
  video_url?: string;
  order_index: number;
  
  // Enhanced fields
  custom_title?: string;
  custom_description?: string;
  notes?: string;
  estimated_duration?: string;
  custom_image_url?: string;
  custom_video_url?: string;
}

interface EnhancedContentBuilderProps {
  title: string;
  contentItems: EnhancedContentItem[];
  onUpdateContent: (items: EnhancedContentItem[]) => void;
}

export function EnhancedContentBuilder({ title, contentItems, onUpdateContent }: EnhancedContentBuilderProps) {
  const [isContentSelectorOpen, setIsContentSelectorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EnhancedContentItem | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return <BookOpen className="h-4 w-4" />;
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'tool': return <Wrench className="h-4 w-4" />;
      case 'prompt': return <MessageSquare className="h-4 w-4" />;
      case 'learning_plan': return <BookOpen className="h-4 w-4" />;
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

  const handleAddContent = (newContent: any) => {
    const enhancedItem: EnhancedContentItem = {
      ...newContent,
      original_id: newContent.id,
      id: `enhanced-${newContent.id}-${Date.now()}`,
      order_index: contentItems.length,
      custom_title: newContent.name,
      custom_description: newContent.description || '',
      notes: '',
      estimated_duration: '',
    };
    
    onUpdateContent([...contentItems, enhancedItem]);
    setIsContentSelectorOpen(false);
  };

  const handleEditItem = (item: EnhancedContentItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    
    const updatedItems = contentItems.map(item =>
      item.id === editingItem.id ? editingItem : item
    );
    onUpdateContent(updatedItems);
    setEditingItem(null);
  };

  const handleRemoveContent = (index: number) => {
    const updatedItems = contentItems.filter((_, i) => i !== index);
    // Reorder indices
    const reorderedItems = updatedItems.map((item, idx) => ({
      ...item,
      order_index: idx
    }));
    onUpdateContent(reorderedItems);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(contentItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order indices
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order_index: index
    }));

    onUpdateContent(reorderedItems);
  };

  const selectedIds = contentItems.map(item => item.original_id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button onClick={() => setIsContentSelectorOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {contentItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No content added yet.</p>
            <Button onClick={() => setIsContentSelectorOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Content Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="enhanced-content-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {contentItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-3 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div 
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:cursor-grabbing text-muted-foreground"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-mono bg-muted px-2 py-1 rounded">
                                  {index + 1}
                                </span>
                              </div>

                              <div className="flex-shrink-0">
                                {(item.custom_image_url || item.image_url) ? (
                                  <img
                                    src={item.custom_image_url || item.image_url}
                                    alt={item.custom_title || item.name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className={`w-12 h-12 rounded flex items-center justify-center text-white ${getTypeColor(item.type)}`}>
                                    {getTypeIcon(item.type)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{item.custom_title || item.name}</h4>
                                  <Badge className={`text-white ${getTypeColor(item.type)} text-xs`}>
                                    {item.type}
                                  </Badge>
                                  {item.estimated_duration && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.estimated_duration}
                                    </Badge>
                                  )}
                                </div>
                                {(item.custom_description || item.description) && (
                                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                    {item.custom_description || item.description}
                                  </p>
                                )}
                                {item.notes && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    Notes: {item.notes}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveContent(index)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
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
        </div>
      )}

      {/* Content Selector Dialog */}
      <ContentSelector
        isOpen={isContentSelectorOpen}
        onClose={() => setIsContentSelectorOpen(false)}
        onSelect={handleAddContent}
        selectedIds={selectedIds}
      />

      {/* Edit Content Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Content Item</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details & Text</TabsTrigger>
                  <TabsTrigger value="media">Media & Resources</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Custom Title</Label>
                      <Input
                        value={editingItem.custom_title || ''}
                        onChange={(e) => setEditingItem({ 
                          ...editingItem, 
                          custom_title: e.target.value 
                        })}
                        placeholder="Override the original title..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Estimated Duration</Label>
                      <Input
                        value={editingItem.estimated_duration || ''}
                        onChange={(e) => setEditingItem({ 
                          ...editingItem, 
                          estimated_duration: e.target.value 
                        })}
                        placeholder="e.g., 30 mins, 2 hours..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Description</Label>
                    <Textarea
                      value={editingItem.custom_description || ''}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        custom_description: e.target.value 
                      })}
                      placeholder="Override or enhance the original description..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Internal Notes</Label>
                    <Textarea
                      value={editingItem.notes || ''}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        notes: e.target.value 
                      })}
                      placeholder="Add notes for facilitators or additional context..."
                      rows={3}
                    />
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Original Content</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-white ${getTypeColor(editingItem.type)}`}>
                        {editingItem.type}
                      </Badge>
                      <span className="text-sm font-medium">{editingItem.name}</span>
                    </div>
                    {editingItem.description && (
                      <p className="text-sm text-muted-foreground">
                        {editingItem.description}
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Custom Media</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload custom images or videos to override the original content media
                      </p>
                      
                      <UnifiedMediaUpload
                        onMediaUpload={(url, type) => {
                          if (type === 'image') {
                            setEditingItem({ 
                              ...editingItem, 
                              custom_image_url: url,
                              custom_video_url: url ? '' : editingItem.custom_video_url 
                            });
                          } else {
                            setEditingItem({ 
                              ...editingItem, 
                              custom_video_url: url,
                              custom_image_url: url ? '' : editingItem.custom_image_url 
                            });
                          }
                        }}
                        currentImageUrl={editingItem.custom_image_url}
                        currentVideoUrl={editingItem.custom_video_url}
                        bucketName="content-assets"
                        allowAiGeneration={true}
                      />
                    </div>

                    {(editingItem.image_url || editingItem.video_url) && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Label className="text-base font-medium">Original Media</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          This is the media from the original content item
                        </p>
                        <MediaDisplay
                          imageUrl={editingItem.image_url}
                          videoUrl={editingItem.video_url}
                          title={editingItem.name}
                          className="w-32 h-24 rounded-md overflow-hidden"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveItem}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}