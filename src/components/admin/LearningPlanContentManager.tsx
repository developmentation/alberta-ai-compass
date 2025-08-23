import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, X, BookOpen, Newspaper, Wrench, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { ContentSelector } from './ContentSelector';

interface ContentItem {
  id: string;
  name: string;
  description?: string;
  type: 'module' | 'news' | 'tool' | 'prompt';
  status: string;
  image_url?: string;
  video_url?: string;
  order_index: number;
}

interface LearningPlanContentManagerProps {
  contentItems: ContentItem[];
  onUpdateContent: (items: ContentItem[]) => void;
}

export function LearningPlanContentManager({ contentItems, onUpdateContent }: LearningPlanContentManagerProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return <BookOpen className="h-4 w-4" />;
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'tool': return <Wrench className="h-4 w-4" />;
      case 'prompt': return <MessageSquare className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'module': return 'bg-blue-500';
      case 'news': return 'bg-green-500';
      case 'tool': return 'bg-purple-500';
      case 'prompt': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddContent = (newContent: any) => {
    const contentItem: ContentItem = {
      ...newContent,
      order_index: contentItems.length
    };
    
    onUpdateContent([...contentItems, contentItem]);
    setIsSelectorOpen(false);
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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newItems = [...contentItems];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    
    // Update order indices
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order_index: idx
    }));
    onUpdateContent(reorderedItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === contentItems.length - 1) return;
    
    const newItems = [...contentItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    
    // Update order indices
    const reorderedItems = newItems.map((item, idx) => ({
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

  const selectedIds = contentItems.map(item => item.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Learning Plan Content</h3>
        <Button onClick={() => setIsSelectorOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {contentItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No content added to this learning plan yet.</p>
            <Button onClick={() => setIsSelectorOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Content Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="content-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {contentItems.map((item, index) => (
                    <Draggable key={`${item.type}-${item.id}`} draggableId={`${item.type}-${item.id}`} index={index}>
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

                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded flex items-center justify-center text-white ${getTypeColor(item.type)} flex-shrink-0`}>
                                  {getTypeIcon(item.type)}
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <Badge className={`text-white ${getTypeColor(item.type)} text-xs`}>
                                    {item.type}
                                  </Badge>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={index === 0}
                                  className="h-8 w-8 p-0"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={index === contentItems.length - 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <ArrowDown className="h-3 w-3" />
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

      <ContentSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleAddContent}
        selectedIds={selectedIds}
      />
    </div>
  );
}