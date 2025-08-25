import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  CheckCircle, 
  Circle,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Wand2,
  Bot,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  Globe,
  BookOpen,
  Clock,
  Target,
  Users,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

import { LanguageSelector, SUPPORTED_LANGUAGES } from '@/components/LanguageSelector';
import { AIExplanationModal } from '@/components/AIExplanationModal';
import { UnifiedMediaUpload } from '@/components/admin/UnifiedMediaUpload';

// YouTube helper functions
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/user\/[^\/]+#p\/[^\/]+\/[^\/]+\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

const convertToEmbedUrl = (url: string): string => {
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const isYouTubeUrl = (url: string): boolean => {
  return extractYouTubeVideoId(url) !== null;
};

interface ModuleData {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  learningOutcomes: string[];
  tags: string[];
  sections: Section[];
  imageUrl?: string;
  videoUrl?: string;
}

interface Section {
  id: number;
  title: string;
  content: ContentItem[];
}

interface ContentItem {
  type: 'text' | 'list' | 'image' | 'video' | 'audio' | 'quiz';
  value?: string | string[];
  url?: string;
  alt?: string;
  caption?: string;
  duration?: number;
  quizType?: 'multiple-choice' | 'true-false' | 'short-answer';
  question?: string;
  options?: string[];
  correctAnswer?: string;
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

interface ModuleViewerProps {
  moduleData: ModuleData;
  isAdminMode?: boolean;
  isEditable?: boolean;
  onSave?: (updatedData: ModuleData) => void;
  onClose?: () => void;
  moduleId?: string;
  initialLanguage?: string;
  showCloseButton?: boolean;
}

export function ModuleViewer({ moduleData, isAdminMode = false, isEditable = true, onSave, onClose, moduleId, initialLanguage = 'en', showCloseButton = true }: ModuleViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [shortAnswerEvaluations, setShortAnswerEvaluations] = useState<Record<string, string>>({});
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState<Record<string, boolean>>({});
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false);
  const [editingData, setEditingData] = useState<ModuleData>(moduleData);
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null);
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadContentIndex, setUploadContentIndex] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [translations, setTranslations] = useState<Record<string, ModuleData>>({});
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [hasStartedModule, setHasStartedModule] = useState(false);
  const [hasBegunModule, setHasBegunModule] = useState(false); // New state for tracking if user clicked Begin
  const [activeTab, setActiveTab] = useState("info"); // State for tab management
  
  // Separate state variables for media URLs - exactly like ModuleCreator
  const [imageUrl, setImageUrl] = useState(moduleData.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(moduleData.videoUrl || '');
  
  const { toast } = useToast();
  const { user } = useAuth();

  const currentSection = editingData.sections?.[currentSectionIndex];
  const progress = editingData.sections && editingData.sections.length > 0 
    ? ((currentSectionIndex + 1) / editingData.sections.length) * 100 
    : 0;

  useEffect(() => {
    // Ensure proper data structure with content arrays
    const normalizedData = {
      ...moduleData,
      sections: moduleData.sections?.map(section => ({
        ...section,
        content: Array.isArray(section.content) ? section.content : []
      })) || []
    };
    setEditingData(normalizedData);
    
    // Only update media URLs when switching to a different module (not on re-renders)
    setImageUrl(moduleData.imageUrl || '');
    setVideoUrl(moduleData.videoUrl || '');
  }, [moduleData?.id]); // Only trigger when module ID changes

  // Track module start when component mounts and user is logged in
  useEffect(() => {
    if (user && moduleId && !hasStartedModule && hasBegunModule) {
      trackProgress('started', 0);
      setHasStartedModule(true);
    }
  }, [user, moduleId, hasStartedModule, hasBegunModule]);

  const trackProgress = async (status: 'started' | 'completed', completion: number) => {
    if (!user || !moduleId) return;

    try {
      const { error } = await supabase.functions.invoke('track-progress', {
        body: {
          moduleId,
          completion,
          status
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error tracking progress:', error);
    }
  };

  const handleBeginModule = () => {
    setHasBegunModule(true);
    // Only auto-switch to content tab in view mode, not admin mode
    if (!isAdminMode) {
      setActiveTab("content");
    }
    if (user && moduleId) {
      trackProgress('started', 0);
      setHasStartedModule(true);
    }
  };

  // Module Info Tab Content
  const renderModuleInfo = () => (
    <div className="space-y-8">
      {/* Admin Editing Interface */}
      {isAdminMode && isEditable ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={editingData.title}
                onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                className="text-lg font-bold"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select
                value={editingData.level}
                onValueChange={(value) => setEditingData({ ...editingData, level: value })}
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={editingData.description}
                onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
              <Input
                type="number"
                value={editingData.duration}
                onChange={(e) => setEditingData({ ...editingData, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          {/* Media Upload Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">Module Media</label>
            <UnifiedMediaUpload
              onMediaUpload={(url, type) => {
                console.log('UnifiedMediaUpload callback:', { url, type });
                if (type === 'image') {
                  console.log('Setting imageUrl to:', url);
                  setImageUrl(url);
                  if (url) setVideoUrl('');
                } else {
                  console.log('Setting videoUrl to:', url);
                  setVideoUrl(url);
                  if (url) setImageUrl('');
                }
              }}
              currentImageUrl={imageUrl}
              currentVideoUrl={videoUrl}
              bucketName="module-assets"
              allowAiGeneration={true}
            />
          </div>

          {/* Learning Outcomes Editing */}
          <div>
            <label className="text-sm font-medium mb-2 block">Learning Outcomes</label>
            <div className="space-y-2">
              {editingData.learningOutcomes?.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => {
                      const newOutcomes = [...(editingData.learningOutcomes || [])];
                      newOutcomes[index] = e.target.value;
                      setEditingData({ ...editingData, learningOutcomes: newOutcomes });
                    }}
                    placeholder="Learning outcome"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOutcomes = editingData.learningOutcomes?.filter((_, i) => i !== index) || [];
                      setEditingData({ ...editingData, learningOutcomes: newOutcomes });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOutcomes = [...(editingData.learningOutcomes || []), ''];
                  setEditingData({ ...editingData, learningOutcomes: newOutcomes });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Learning Outcome
              </Button>
            </div>
          </div>

          {/* Tags Editing */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="space-y-2">
              {editingData.tags?.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => {
                      const newTags = [...(editingData.tags || [])];
                      newTags[index] = e.target.value;
                      setEditingData({ ...editingData, tags: newTags });
                    }}
                    placeholder="Tag"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTags = editingData.tags?.filter((_, i) => i !== index) || [];
                      setEditingData({ ...editingData, tags: newTags });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newTags = [...(editingData.tags || []), ''];
                  setEditingData({ ...editingData, tags: newTags });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            </div>
          </div>

          {/* Save Button for Admin */}
          {isAdminMode && isEditable && (
            <div className="pt-6 border-t">
              <Button onClick={handleSaveChanges} size="default">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Section with Media */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-muted border border-border">
            {editingData.videoUrl || editingData.imageUrl || videoUrl || imageUrl ? (
              <div className="relative h-64 sm:h-80">
                {editingData.videoUrl || videoUrl ? (
                  <video
                    src={editingData.videoUrl || videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    poster={editingData.imageUrl || imageUrl}
                  />
                ) : (
                  <img
                    src={editingData.imageUrl || imageUrl}
                    alt={editingData.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Module Title and Description */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{editingData.title}</h1>
            <div className="text-muted-foreground text-lg leading-relaxed">
              <ReactMarkdown>{editingData.description}</ReactMarkdown>
            </div>
          </div>

          {/* Module Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {editingData.level === '1' ? 'Level 1' :
                   editingData.level === '2' ? 'Level 2' :
                   editingData.level === '3' ? 'Level 3' :
                   editingData.level === 'red' ? 'RED' :
                   editingData.level === 'RED' ? 'RED' :
                   editingData.level}
                </div>
                <div className="text-sm text-muted-foreground">Level</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">{editingData.duration}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">{editingData.sections?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.flag || '🌐'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.name || currentLanguage}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Outcomes */}
          {editingData.learningOutcomes && editingData.learningOutcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Learning Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {editingData.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {editingData.tags && editingData.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {editingData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Begin Button - only show in view mode */}
          {!isAdminMode && (
            <div className="flex justify-center pt-8">
              <Button 
                onClick={handleBeginModule} 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Begin Module
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const handleNextSection = () => {
    if (!editingData.sections || editingData.sections.length === 0) return;
    
    if (currentSectionIndex < editingData.sections.length - 1) {
      setCompletedSections(prev => new Set([...prev, currentSectionIndex]));
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // This is the last section, show results
      setCompletedSections(prev => new Set([...prev, currentSectionIndex]));
      setShowResults(true);
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setShowResults(false);
    }
  };

  const handleQuizAnswer = (contentIndex: number, answer: string) => {
    const quizKey = `${currentSectionIndex}-${contentIndex}`;
    setQuizAnswers(prev => ({ ...prev, [quizKey]: answer }));
  };

  const handleQuizSubmit = async (contentIndex: number, correctAnswer: string, quizType?: string) => {
    const quizKey = `${currentSectionIndex}-${contentIndex}`;
    const userAnswer = quizAnswers[quizKey];
    
    if (quizType === 'short-answer') {
      // For short answers, use AI evaluation instead of exact matching
      await handleShortAnswerEvaluation(contentIndex, correctAnswer, userAnswer);
      // Always give credit for attempting short answer
      setQuizResults(prev => ({ ...prev, [quizKey]: true }));
    } else {
      // For multiple choice and true/false, use exact matching
      const isCorrect = userAnswer === correctAnswer;
      setQuizResults(prev => ({ ...prev, [quizKey]: isCorrect }));
    }
  };

  const handleShortAnswerEvaluation = async (contentIndex: number, expectedAnswer: string, userAnswer: string) => {
    const quizKey = `${currentSectionIndex}-${contentIndex}`;
    const currentContent = currentSection?.content[contentIndex];
    
    if (!currentContent) return;

    setIsEvaluatingAnswer(prev => ({ ...prev, [quizKey]: true }));
    setShortAnswerEvaluations(prev => ({ ...prev, [quizKey]: '' }));

    try {
      const languageName = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.name || 'English';

      const response = await supabase.functions.invoke('gemini-short-answer', {
        body: {
          moduleTitle: editingData.title,
          moduleDescription: editingData.description,
          sectionTitle: currentSection?.title,
          question: currentContent.question,
          expectedAnswer,
          userAnswer,
          language: currentLanguage,
          languageName
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to evaluate answer');
      }

      // Handle streaming response
      const responseData = response.data;
      if (!responseData || !responseData.body) {
        throw new Error('No response stream available');
      }

      const reader = responseData.body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setShortAnswerEvaluations(prev => ({
                  ...prev,
                  [quizKey]: (prev[quizKey] || '') + data.text
                }));
              }
            } catch (e) {
              // Ignore parsing errors for stream data
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error evaluating short answer:', error);
      setShortAnswerEvaluations(prev => ({
        ...prev,
        [quizKey]: 'Error evaluating your answer. Please try again.'
      }));
    } finally {
      setIsEvaluatingAnswer(prev => ({ ...prev, [quizKey]: false }));
    }
  };

  const handleQuizReset = (contentIndex: number) => {
    const quizKey = `${currentSectionIndex}-${contentIndex}`;
    setQuizAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[quizKey];
      return newAnswers;
    });
    setQuizResults(prev => {
      const newResults = { ...prev };
      delete newResults[quizKey];
      return newResults;
    });
    setShortAnswerEvaluations(prev => {
      const newEvaluations = { ...prev };
      delete newEvaluations[quizKey];
      return newEvaluations;
    });
    setIsEvaluatingAnswer(prev => {
      const newEvaluating = { ...prev };
      delete newEvaluating[quizKey];
      return newEvaluating;
    });
  };

  const handleSaveChanges = () => {
    if (onSave) {
      // Include ALL editing data changes including sections, plus the separate media URLs
      const updatedData = {
        ...editingData,
        imageUrl,
        videoUrl,
        // Ensure sections array is properly included
        sections: editingData.sections || []
      };
      console.log('Saving module with complete data:', { 
        updatedData, 
        imageUrl, 
        videoUrl, 
        editingData,
        sectionsCount: editingData.sections?.length || 0
      });
      onSave(updatedData);
      toast({
        title: "Success",
        description: "Module updated successfully",
      });
    }
  };

  const handleEditContent = (contentIndex: number, field: string, value: any) => {
    console.log('handleEditContent called:', { contentIndex, field, value, currentSectionIndex });
    
    const updatedSections = [...editingData.sections];
    
    // Ensure content is an array
    if (!Array.isArray(updatedSections[currentSectionIndex].content)) {
      updatedSections[currentSectionIndex].content = [];
      console.log('Content was not an array, returning early');
      return; // Can't edit content that doesn't exist
    }
    
    const updatedContent = [...updatedSections[currentSectionIndex].content];
    console.log('Content before update:', updatedContent[contentIndex]);
    
    updatedContent[contentIndex] = {
      ...updatedContent[contentIndex],
      [field]: value
    };
    
    console.log('Content after update:', updatedContent[contentIndex]);
    
    updatedSections[currentSectionIndex] = {
      ...updatedSections[currentSectionIndex],
      content: updatedContent
    };
    
    const newEditingData = {
      ...editingData,
      sections: updatedSections
    };
    
    console.log('Setting new editing data:', newEditingData);
    setEditingData(newEditingData);
  };

  const handleQuizTypeChange = (contentIndex: number, newQuizType: 'multiple-choice' | 'true-false' | 'short-answer') => {
    const updatedSections = [...editingData.sections];
    
    // Ensure content is an array
    if (!Array.isArray(updatedSections[currentSectionIndex].content)) {
      updatedSections[currentSectionIndex].content = [];
      return; // Can't edit quiz that doesn't exist
    }
    
    const updatedContent = [...updatedSections[currentSectionIndex].content];
    
    // Set default options and correct answer based on quiz type
    let defaultOptions: string[] = [];
    let defaultCorrectAnswer = '';
    
    switch (newQuizType) {
      case 'true-false':
        defaultOptions = ['True', 'False'];
        defaultCorrectAnswer = 'True';
        break;
      case 'multiple-choice':
        defaultOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
        defaultCorrectAnswer = 'Option 1';
        break;
      case 'short-answer':
        defaultOptions = [];
        defaultCorrectAnswer = 'Sample correct answer';
        break;
    }
    
    updatedContent[contentIndex] = {
      ...updatedContent[contentIndex],
      quizType: newQuizType,
      options: defaultOptions,
      correctAnswer: defaultCorrectAnswer
    };
    
    updatedSections[currentSectionIndex] = {
      ...updatedSections[currentSectionIndex],
      content: updatedContent
    };
    
    setEditingData({
      ...editingData,
      sections: updatedSections
    });
  };

  const handleAddContent = () => {
    // Check if current section exists
    if (!editingData.sections || !editingData.sections[currentSectionIndex]) {
      console.error('Current section not found:', currentSectionIndex, editingData.sections);
      return;
    }

    const updatedSections = [...editingData.sections];
    
    // Ensure content is an array
    if (!Array.isArray(updatedSections[currentSectionIndex].content)) {
      updatedSections[currentSectionIndex].content = [];
    }
    
    const newContent: ContentItem = {
      type: 'text',
      value: 'New content item'
    };
    updatedSections[currentSectionIndex].content.push(newContent);
    setEditingData({
      ...editingData,
      sections: updatedSections
    });
  };

  const handleAddContentByType = (type: string) => {
    // Check if current section exists
    if (!editingData.sections || !editingData.sections[currentSectionIndex]) {
      console.error('Current section not found for type:', type, currentSectionIndex, editingData.sections);
      return;
    }

    const updatedSections = [...editingData.sections];
    
    // Ensure content is an array
    if (!Array.isArray(updatedSections[currentSectionIndex].content)) {
      updatedSections[currentSectionIndex].content = [];
    }
    
    const newContent: ContentItem = {
      type: type as any,
      ...(type === 'text' && { value: 'New text content' }),
      ...(type === 'list' && { value: ['Item 1', 'Item 2'] }),
      ...(type === 'quiz' && { 
        question: 'New quiz question',
        quizType: 'multiple-choice' as any,
        options: ['Option 1', 'Option 2', 'Option 3'],
        correctAnswer: 'Option 1',
        feedback: {
          correct: 'Correct!',
          incorrect: 'Try again.'
        }
      }),
      ...(type === 'image' && { 
        url: 'https://via.placeholder.com/400x300',
        alt: 'Placeholder image',
        caption: 'Image caption'
      }),
      ...(type === 'video' && { 
        url: 'https://example.com/video.mp4',
        caption: 'Video caption',
        duration: 60
      }),
      ...(type === 'audio' && { 
        url: 'https://example.com/audio.mp3',
        caption: 'Audio caption',
        duration: 30
      })
    };
    updatedSections[currentSectionIndex].content.push(newContent);
    setEditingData({
      ...editingData,
      sections: updatedSections
    });
  };

  const handleDeleteContent = (contentIndex: number) => {
    const updatedSections = [...editingData.sections];
    
    // Ensure content is an array
    if (!Array.isArray(updatedSections[currentSectionIndex].content)) {
      updatedSections[currentSectionIndex].content = [];
      return; // Nothing to delete if content wasn't an array
    }
    
    updatedSections[currentSectionIndex].content.splice(contentIndex, 1);
    setEditingData({
      ...editingData,
      sections: updatedSections
    });
  };

  const handleAddSection = () => {
    const newSection = {
      id: editingData.sections.length + 1,
      title: `New Section ${editingData.sections.length + 1}`,
      content: []
    };
    setEditingData({
      ...editingData,
      sections: [...editingData.sections, newSection]
    });
  };

  const handleDeleteSection = (sectionIndex: number) => {
    // Prevent deleting if only one section remains
    if (editingData.sections.length <= 1) {
      toast({
        title: "Cannot delete section",
        description: "Module must have at least one section",
        variant: "destructive",
      });
      return;
    }

    const updatedSections = editingData.sections.filter((_, index) => index !== sectionIndex);
    
    // Adjust current section index if needed
    let newCurrentIndex = currentSectionIndex;
    if (currentSectionIndex === sectionIndex) {
      // If we're deleting the current section, move to the previous one or first
      newCurrentIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
    } else if (currentSectionIndex > sectionIndex) {
      // If current section is after the deleted one, shift back
      newCurrentIndex = currentSectionIndex - 1;
    }
    
    setCurrentSectionIndex(Math.min(newCurrentIndex, updatedSections.length - 1));
    setEditingData({
      ...editingData,
      sections: updatedSections
    });

    toast({
      title: "Section deleted",
      description: "Section has been removed from the module",
    });
  };

  const handleEditSectionTitle = (sectionIndex: number, newTitle: string) => {
    const updatedSections = [...editingData.sections];
    updatedSections[sectionIndex].title = newTitle;
    setEditingData({
      ...editingData,
      sections: updatedSections
    });
  };

  const handleMoveSectionUp = (sectionIndex: number) => {
    if (sectionIndex <= 0) return;
    
    const updatedSections = [...editingData.sections];
    const temp = updatedSections[sectionIndex];
    updatedSections[sectionIndex] = updatedSections[sectionIndex - 1];
    updatedSections[sectionIndex - 1] = temp;
    
    setEditingData({
      ...editingData,
      sections: updatedSections
    });
    
    // Adjust current section index if needed
    if (currentSectionIndex === sectionIndex) {
      setCurrentSectionIndex(sectionIndex - 1);
    } else if (currentSectionIndex === sectionIndex - 1) {
      setCurrentSectionIndex(sectionIndex);
    }
  };

  const handleMoveSectionDown = (sectionIndex: number) => {
    if (sectionIndex >= editingData.sections.length - 1) return;
    
    const updatedSections = [...editingData.sections];
    const temp = updatedSections[sectionIndex];
    updatedSections[sectionIndex] = updatedSections[sectionIndex + 1];
    updatedSections[sectionIndex + 1] = temp;
    
    setEditingData({
      ...editingData,
      sections: updatedSections
    });
    
    // Adjust current section index if needed
    if (currentSectionIndex === sectionIndex) {
      setCurrentSectionIndex(sectionIndex + 1);
    } else if (currentSectionIndex === sectionIndex + 1) {
      setCurrentSectionIndex(sectionIndex);
    }
  };

  const handleFileUpload = async (file: File, contentIndex: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      handleEditContent(contentIndex, 'url', publicUrl);
      setIsUploadDialogOpen(false);
      setUploadContentIndex(null);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleMediaUpload = (url: string, type: 'image' | 'video', contentIndex: number) => {
    console.log('handleMediaUpload called with:', { url, type, contentIndex });
    console.log('Current section:', currentSectionIndex);
    
    // Create a complete new state update instead of multiple calls
    setEditingData(prevData => {
      const updatedSections = [...prevData.sections];
      const currentSection = updatedSections[currentSectionIndex];
      
      if (!currentSection || !Array.isArray(currentSection.content)) {
        console.log('Invalid section or content structure');
        return prevData;
      }
      
      const updatedContent = [...currentSection.content];
      const contentItem = updatedContent[contentIndex];
      
      if (!contentItem) {
        console.log('Content item not found at index:', contentIndex);
        return prevData;
      }
      
      // Update the content item with new URL and metadata
      updatedContent[contentIndex] = {
        ...contentItem,
        url: url,
        ...(type === 'image' ? { alt: 'Uploaded image' } : { caption: 'Uploaded video' })
      };
      
      updatedSections[currentSectionIndex] = {
        ...currentSection,
        content: updatedContent
      };
      
      console.log('Updated content item:', updatedContent[contentIndex]);
      
      return {
        ...prevData,
        sections: updatedSections
      };
    });
    
    // Close the dialog
    setIsUploadDialogOpen(false);
    setUploadContentIndex(null);

    toast({
      title: "Success",
      description: `${type === 'image' ? 'Image' : 'Video'} uploaded successfully`,
    });
  };

  const calculateScore = () => {
    const totalQuizzes = Object.keys(quizResults).length;
    if (totalQuizzes === 0) return 0;
    const correctAnswers = Object.values(quizResults).filter(Boolean).length;
    return Math.round((correctAnswers / totalQuizzes) * 100);
  };

  // Track completion when results are shown and score is 70%+
  useEffect(() => {
    if (showResults && user && moduleId) {
      const score = calculateScore();
      if (score >= 70) {
        trackProgress('completed', score);
      }
    }
  }, [showResults, user, moduleId]);

  // Load available translations - simplified for now
  const loadAvailableTranslations = async () => {
    // Since there's no translations table in the current schema, 
    // we'll just set up English as the default language
    setAvailableLanguages(['en']);
    setTranslations({ en: moduleData });
    setCurrentLanguage('en');
    setEditingData(moduleData);
  };

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === currentLanguage) return;

    console.log('Changing language from', currentLanguage, 'to', newLanguage);
    console.log('Available translations:', translations);

    setIsLoadingTranslation(true);
    
    try {
      setCurrentLanguage(newLanguage);
      
      if (newLanguage === 'en') {
        // Use original data for English
        console.log('Loading original English content');
        setEditingData(moduleData);
      } else if (translations[newLanguage]) {
        // Use translation if available
        console.log('Loading translated content for', newLanguage);
        console.log('Translation data:', translations[newLanguage]);
        setEditingData(translations[newLanguage]);
      } else {
        // Fallback to original if translation doesn't exist
        console.log('No translation available for', newLanguage, 'falling back to English');
        setEditingData(moduleData);
        toast({
          title: "Translation not available",
          description: `This module is not available in the selected language. Showing original content.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error switching language:', error);
      toast({
        title: "Error",
        description: "Failed to switch language",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  // Load translations on component mount
  useEffect(() => {
    if (moduleId) {
      loadAvailableTranslations();
    }
  }, [moduleId]);

  const handleRetakeModule = () => {
    setCurrentSectionIndex(0);
    setCompletedSections(new Set());
    setQuizAnswers({});
    setQuizResults({});
    setShowResults(false);
  };

  const renderContent = (content: ContentItem, index: number) => {
    const isEditing = isAdminMode && isEditable && editingContentIndex === index;

    switch (content.type) {
      case 'text':
        return (
          <div key={index} className="space-y-2">
            {isEditing ? (
              <Textarea
                value={content.value as string}
                onChange={(e) => handleEditContent(index, 'value', e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
            <div className="text-foreground leading-relaxed">
              <ReactMarkdown>{content.value as string}</ReactMarkdown>
            </div>
            )}
            {isAdminMode && isEditable && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingContentIndex(isEditing ? null : index)}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteContent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'list':
        return (
          <div key={index} className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                {(content.value as string[]).map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newList = [...(content.value as string[])];
                        newList[itemIndex] = e.target.value;
                        handleEditContent(index, 'value', newList);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newList = (content.value as string[]).filter((_, i) => i !== itemIndex);
                        handleEditContent(index, 'value', newList);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newList = [...(content.value as string[]), 'New item'];
                    handleEditContent(index, 'value', newList);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 ml-4">
                {(content.value as string[]).map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )}
            {isAdminMode && isEditable && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingContentIndex(isEditing ? null : index)}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteContent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'image':
      case 'video':
      case 'audio':
        return (
          <div key={index} className="space-y-2">
             {isEditing ? (
               <div className="space-y-2">
                 <Input
                   value={content.url || ''}
                   onChange={(e) => handleEditContent(index, 'url', e.target.value)}
                   placeholder="Media URL"
                 />
                 <Input
                   value={content.caption || ''}
                   onChange={(e) => handleEditContent(index, 'caption', e.target.value)}
                   placeholder="Caption"
                 />
                 <Input
                   value={content.alt || ''}
                   onChange={(e) => handleEditContent(index, 'alt', e.target.value)}
                   placeholder="Alt text / Description"
                 />
                 
                 {/* Preview in edit mode */}
                 {content.url && (
                   <div className="border rounded p-2">
                     <label className="text-sm font-medium text-muted-foreground mb-2 block">
                       Preview:
                     </label>
                     {content.type === 'image' && (
                       <img 
                         src={content.url} 
                         alt="Preview" 
                         className="max-w-full h-auto max-h-32 rounded"
                       />
                     )}
                     {content.type === 'video' && (
                       <>
                         {isYouTubeUrl(content.url) ? (
                           <div className="relative aspect-video max-w-full max-h-32 rounded overflow-hidden">
                             <iframe
                               src={convertToEmbedUrl(content.url)}
                               title="Video preview"
                               width="100%"
                               height="100%"
                               className="absolute inset-0 w-full h-full"
                               frameBorder="0"
                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                               referrerPolicy="strict-origin-when-cross-origin"
                               allowFullScreen
                             />
                           </div>
                         ) : (
                           <video 
                             src={content.url} 
                             controls 
                             className="max-w-full h-auto max-h-32 rounded"
                           />
                         )}
                       </>
                     )}
                     {content.type === 'audio' && (
                       <audio 
                         src={content.url} 
                         controls 
                         className="w-full"
                       />
                     )}
                   </div>
                 )}
                 
                 <div className="flex gap-2">
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => {
                       setUploadContentIndex(index);
                       setIsUploadDialogOpen(true);
                     }}
                   >
                     <Upload className="h-4 w-4 mr-2" />
                     Upload or Generate
                   </Button>
                 </div>
               </div>
             ) : (
              <div className="space-y-2">
                {content.type === 'image' && content.url && (
                  <img 
                    key={content.url} // Force re-render when URL changes
                    src={content.url} 
                    alt={content.alt || 'Module image'} 
                    className="max-w-full h-auto rounded"
                  />
                )}
                {content.type === 'video' && content.url && (
                  <>
                    {isYouTubeUrl(content.url) ? (
                      <div className="relative aspect-video max-w-full rounded overflow-hidden">
                        <iframe
                          src={convertToEmbedUrl(content.url)}
                          title={content.caption || 'Module video'}
                          width="100%"
                          height="100%"
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video 
                        key={content.url}
                        src={content.url} 
                        controls 
                        className="max-w-full h-auto rounded"
                        aria-label={content.caption || 'Module video'}
                      />
                    )}
                  </>
                )}
                {content.type === 'audio' && content.url && (
                  <audio 
                    src={content.url} 
                    controls 
                    className="w-full"
                    aria-label={content.alt || 'Module audio'}
                  />
                )}
                {content.caption && (
                  <p className="text-sm text-muted-foreground italic">{content.caption}</p>
                )}
              </div>
            )}
            {isAdminMode && isEditable && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingContentIndex(isEditing ? null : index)}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteContent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'quiz':
        const quizKey = `${currentSectionIndex}-${index}`;
        const userAnswer = quizAnswers[quizKey];
        const quizResult = quizResults[quizKey];

        return (
          <Card key={index} className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Quiz
                {quizResult !== undefined && (
                  <Badge variant={quizResult ? "default" : "destructive"}>
                    {quizResult ? "Correct" : "Incorrect"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={content.question || ''}
                    onChange={(e) => handleEditContent(index, 'question', e.target.value)}
                    placeholder="Quiz question"
                  />
                  <Select
                    value={content.quizType}
                    onValueChange={(value) => handleQuizTypeChange(index, value as 'multiple-choice' | 'true-false' | 'short-answer')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Render options based on quiz type */}
                  {content.quizType !== 'short-answer' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Options:</label>
                      {content.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2 items-center">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(content.options || [])];
                              newOptions[optionIndex] = e.target.value;
                              handleEditContent(index, 'options', newOptions);
                            }}
                          />
                          <Button
                            size="sm"
                            variant={content.correctAnswer === option ? "default" : "outline"}
                            onClick={() => handleEditContent(index, 'correctAnswer', option)}
                          >
                            {content.correctAnswer === option ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          </Button>
                          {content.quizType === 'multiple-choice' && content.options && content.options.length > 2 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newOptions = content.options?.filter((_, i) => i !== optionIndex) || [];
                                handleEditContent(index, 'options', newOptions);
                                if (content.correctAnswer === option) {
                                  handleEditContent(index, 'correctAnswer', newOptions[0] || '');
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {content.quizType === 'multiple-choice' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newOptions = [...(content.options || []), `Option ${(content.options?.length || 0) + 1}`];
                            handleEditContent(index, 'options', newOptions);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Short answer field */}
                  {content.quizType === 'short-answer' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expected Answer:</label>
                      <Textarea
                        value={content.correctAnswer || ''}
                        onChange={(e) => handleEditContent(index, 'correctAnswer', e.target.value)}
                        placeholder="Enter the expected/correct answer"
                        rows={2}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback:</label>
                    <Input
                      value={content.feedback?.correct || ''}
                      onChange={(e) => handleEditContent(index, 'feedback', { 
                        ...content.feedback, 
                        correct: e.target.value 
                      })}
                      placeholder="Correct answer feedback"
                    />
                    <Input
                      value={content.feedback?.incorrect || ''}
                      onChange={(e) => handleEditContent(index, 'feedback', { 
                        ...content.feedback, 
                        incorrect: e.target.value 
                      })}
                      placeholder="Incorrect answer feedback"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium">{content.question}</p>
                  
                  {content.quizType === 'short-answer' ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your answer here..."
                        value={userAnswer || ''}
                        onChange={(e) => handleQuizAnswer(index, e.target.value)}
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {content.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                          quizResult !== undefined && option === content.correctAnswer 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : quizResult !== undefined && userAnswer === option && option !== content.correctAnswer
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'hover:bg-muted'
                        }`}>
                          <input
                            type="radio"
                            name={quizKey}
                            value={option}
                            checked={userAnswer === option}
                            onChange={(e) => handleQuizAnswer(index, e.target.value)}
                            className="radio"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {userAnswer && quizResult === undefined && (
                      <Button
                        onClick={() => handleQuizSubmit(index, content.correctAnswer!, content.quizType)}
                        disabled={isEvaluatingAnswer[quizKey]}
                      >
                        {isEvaluatingAnswer[quizKey] ? 'Evaluating...' : 'Submit Answer'}
                      </Button>
                    )}
                    {quizResult !== undefined && (
                      <Button
                        variant="outline"
                        onClick={() => handleQuizReset(index)}
                      >
                        Try Again
                      </Button>
                    )}
                  </div>
                  {quizResult !== undefined && (
                    <div className="p-3 rounded-lg bg-muted">
                      {content.quizType === 'short-answer' ? (
                        <div className="space-y-2">
                          {shortAnswerEvaluations[quizKey] && (
                            <p className="text-sm">
                              {shortAnswerEvaluations[quizKey]}
                            </p>
                          )}
                          {isEvaluatingAnswer[quizKey] && (
                            <p className="text-sm text-muted-foreground">Analyzing your answer...</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">
                          {quizResult ? content.feedback?.correct : content.feedback?.incorrect}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
              {isAdminMode && isEditable && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingContentIndex(isEditing ? null : index)}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteContent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Removed hamburger menu - Table of Contents is now in Structure tab */}
              
              <div className="flex-1">
                <div>
                  <h1 className="text-xl font-bold">{editingData.title}</h1>
                  {!hasBegunModule && (
                    <p className="text-muted-foreground text-sm">Module Overview</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {(hasBegunModule || activeTab === "content") && (
                <div className="text-sm text-muted-foreground">
                  Section {currentSectionIndex + 1} of {editingData.sections.length}
                </div>
              )}
              {moduleId && availableLanguages.length > 1 && !isAdminMode && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Language:</span>
                  <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="gap-2 min-w-[120px]" aria-label="Select language">
                      <Globe className="h-4 w-4" />
                      <span>{SUPPORTED_LANGUAGES.find(sl => sl.code === currentLanguage)?.flag || '🌐'}</span>
                      <span className="hidden sm:inline">
                        {SUPPORTED_LANGUAGES.find(sl => sl.code === currentLanguage)?.name || currentLanguage}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableLanguages.map((langCode) => {
                        const language = SUPPORTED_LANGUAGES.find(sl => sl.code === langCode);
                        return language ? (
                          <SelectItem key={langCode} value={langCode}>
                            <div className="flex items-center gap-2">
                              <span>{language.flag}</span>
                              <span>{language.name}</span>
                            </div>
                          </SelectItem>
                        ) : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {isAdminMode && isEditable && (
                <Button onClick={handleSaveChanges} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
              {onClose && !isAdminMode && showCloseButton && (
                <Button onClick={onClose} variant="outline" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar - show when module has begun or in content tab */}
          {(hasBegunModule || activeTab === "content") && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Module Info</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-6">
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-8">
                  {renderModuleInfo()}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="structure" className="mt-6">
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Module Structure</CardTitle>
                    {isAdminMode && isEditable && (
                      <Button onClick={handleAddSection} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      </div>
                      <span>Current section</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      <span>Not started</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {editingData.sections.map((section, index) => (
                      <div key={section.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            {index + 1}.
                          </span>
                          {index === currentSectionIndex ? (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            </div>
                          ) : completedSections.has(index) ? (
                            <div title="Section completed">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          ) : (
                            <div title="Section not started">
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          {isAdminMode && isEditable ? (
                            <Input
                              value={section.title}
                              onChange={(e) => handleEditSectionTitle(index, e.target.value)}
                              className="font-medium"
                              placeholder="Section title"
                            />
                          ) : (
                            <h3 className="font-medium">{section.title}</h3>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentSectionIndex(index);
                              setActiveTab("content");
                            }}
                            className="text-primary hover:text-primary"
                          >
                            View
                          </Button>
                          
                          {isAdminMode && isEditable && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveSectionUp(index)}
                                disabled={index === 0}
                                title="Move up"
                              >
                                <ChevronLeft className="h-4 w-4 rotate-90" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveSectionDown(index)}
                                disabled={index === editingData.sections.length - 1}
                                title="Move down"
                              >
                                <ChevronRight className="h-4 w-4 rotate-90" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSection(index)}
                                className="text-destructive hover:text-destructive"
                                title="Delete section"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {editingData.sections.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No sections created yet</p>
                        {isAdminMode && isEditable && (
                          <Button onClick={handleAddSection} className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Section
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="mt-6">
              {showResults ? (
                <Card className="max-w-4xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl flex items-center justify-center gap-2">
                      <Trophy className="h-8 w-8 text-yellow-500" />
                      Module Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-center">
                    {Object.keys(quizResults).length > 0 ? (
                      <>
                        <div className="text-6xl font-bold text-primary">
                          {calculateScore()}%
                        </div>
                        <div className="text-xl">
                          {calculateScore() >= 70 ? (
                            <div className="text-green-600">
                              🎉 Congratulations! You've passed the module!
                            </div>
                          ) : (
                            <div className="text-orange-600">
                              Good attempt! Would you like to try again?
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground max-w-md mx-auto">
                          <div>
                            <div className="font-medium">Correct Answers</div>
                            <div>{Object.values(quizResults).filter(Boolean).length}</div>
                          </div>
                          <div>
                            <div className="font-medium">Total Questions</div>
                            <div>{Object.keys(quizResults).length}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xl text-green-600">
                        🎉 Module Complete! You've successfully finished all the content.
                      </div>
                    )}
                    <div className="flex gap-4 justify-center">
                      {Object.keys(quizResults).length > 0 && (
                        <Button onClick={handleRetakeModule} variant="outline">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Retake Module
                        </Button>
                      )}
                      {(Object.keys(quizResults).length === 0 || calculateScore() >= 70) && !isAdminMode && (
                        <Button onClick={onClose || (() => window.location.href = '/modules')}>
                          Continue Learning
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{currentSection?.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAskAIOpen(true)}
                        >
                          <Bot className="mr-2 h-4 w-4" />
                          Ask AI
                        </Button>
                        {isAdminMode && isEditable && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddContent}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Content
                            </Button>
                            <Select onValueChange={handleAddContentByType}>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Content type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="list">List</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Array.isArray(currentSection?.content) && currentSection.content.map((content, index) => renderContent(content, index))}
                  </CardContent>
                </Card>
              )}

              {/* Navigation - only show in content tab */}
              <div className="flex items-center justify-between mt-8 max-w-4xl mx-auto">
                <Button
                  variant="outline"
                  onClick={handlePreviousSection}
                  disabled={currentSectionIndex === 0 && !showResults}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  {showResults ? "Results" : `${currentSectionIndex + 1} / ${editingData.sections.length}`}
                </div>

                {!showResults ? (
                  <Button
                    onClick={handleNextSection}
                    disabled={false}
                  >
                    {currentSectionIndex === editingData.sections.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div></div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Upload/Generate Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload or Generate Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {uploadContentIndex !== null && (
              <UnifiedMediaUpload
                onMediaUpload={(url, type) => handleMediaUpload(url, type, uploadContentIndex)}
                currentImageUrl={editingData.sections?.[currentSectionIndex]?.content[uploadContentIndex]?.type === 'image' ? editingData.sections[currentSectionIndex].content[uploadContentIndex].url : undefined}
                currentVideoUrl={editingData.sections?.[currentSectionIndex]?.content[uploadContentIndex]?.type === 'video' ? editingData.sections[currentSectionIndex].content[uploadContentIndex].url : undefined}
                bucketName="module-assets"
                allowAiGeneration={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Explanation Modal */}
      <AIExplanationModal
        isOpen={isAskAIOpen}
        onClose={() => setIsAskAIOpen(false)}
        moduleTitle={editingData.title}
        currentSection={currentSection?.title || ''}
        context={Array.isArray(currentSection?.content) ? currentSection.content.map(c => {
          if (c.type === 'text') return c.value;
          if (c.type === 'quiz') return `Quiz: ${c.question}`;
          if (c.type === 'list') return `List: ${(c.value as string[]).join(', ')}`;
          return `${c.type} content`;
        }).join('\n') : ''}
      />
      </div>
    </div>
  );
}
