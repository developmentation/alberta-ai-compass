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
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

import { LanguageSelector, SUPPORTED_LANGUAGES } from '@/components/LanguageSelector';
import { AIExplanationModal } from '@/components/AIExplanationModal';
import { UnifiedMediaUpload } from '@/components/admin/UnifiedMediaUpload';

interface ModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
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
}

export function ModuleViewer({ moduleData, isAdminMode = false, isEditable = true, onSave, onClose, moduleId, initialLanguage = 'en' }: ModuleViewerProps) {
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
  const { toast } = useToast();
  const { user } = useAuth();

  const currentSection = editingData.sections?.[currentSectionIndex];
  const progress = editingData.sections ? (completedSections.size / editingData.sections.length) * 100 : 0;

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
  }, [moduleData]);

  // Track module start when component mounts and user is logged in
  useEffect(() => {
    if (user && moduleId && !hasStartedModule) {
      trackProgress('started', 0);
      setHasStartedModule(true);
    }
  }, [user, moduleId, hasStartedModule]);

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

      const response = await fetch(`https://mxgidgtbqmxjebyaprwc.supabase.co/functions/v1/evaluate-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Z2lkZ3RicW14amVieWFwcndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxOTkwNjksImV4cCI6MjA2Nzc3NTA2OX0.YWw5W_6s29DJ9zXyFQaGY6Bftz8Wuf6xirwLMk_uDJY`,
        },
        body: JSON.stringify({
          moduleTitle: editingData.title,
          moduleDescription: editingData.description,
          sectionTitle: currentSection?.title,
          question: currentContent.question,
          expectedAnswer,
          userAnswer,
          language: currentLanguage,
          languageName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

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
      onSave(editingData);
      toast({
        title: "Success",
        description: "Module updated successfully",
      });
    }
  };

  const handleEditContent = (contentIndex: number, field: string, value: any) => {
    const updatedSections = [...editingData.sections];
    
    // Ensure content is an array
    if (!Array.isArray(updatedSections[currentSectionIndex].content)) {
      updatedSections[currentSectionIndex].content = [];
      return; // Can't edit content that doesn't exist
    }
    
    const updatedContent = [...updatedSections[currentSectionIndex].content];
    updatedContent[contentIndex] = {
      ...updatedContent[contentIndex],
      [field]: value
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
    const updatedSections = editingData.sections.filter((_, index) => index !== sectionIndex);
    // Adjust current section if needed
    if (currentSectionIndex >= updatedSections.length && updatedSections.length > 0) {
      setCurrentSectionIndex(updatedSections.length - 1);
    }
    setEditingData({
      ...editingData,
      sections: updatedSections
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
    handleEditContent(contentIndex, 'url', url);
    if (type === 'image') {
      handleEditContent(contentIndex, 'alt', 'Uploaded image');
    } else {
      handleEditContent(contentIndex, 'caption', 'Uploaded video');
    }
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
              <p className="text-foreground leading-relaxed">{content.value}</p>
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
                    src={content.url} 
                    alt={content.alt || 'Module image'} 
                    className="max-w-full h-auto rounded"
                  />
                )}
                {content.type === 'video' && content.url && (
                  <video 
                    src={content.url} 
                    controls 
                    className="max-w-full h-auto rounded"
                    aria-label={content.alt || 'Module video'}
                  />
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
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet open={isTableOfContentsOpen} onOpenChange={setIsTableOfContentsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Table of Contents</SheetTitle>
                    {isAdminMode && isEditable && (
                      <Button onClick={handleAddSection} size="sm" className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                      </Button>
                    )}
                  </SheetHeader>
                  <ScrollArea className="h-full mt-6">
                    <div className="space-y-2">
                      {editingData.sections.map((section, index) => (
                        <div key={section.id} className="space-y-2">
                          <Button
                            variant={index === currentSectionIndex ? "default" : "ghost"}
                            className="w-full justify-start h-auto p-3"
                            onClick={() => {
                              setCurrentSectionIndex(index);
                              setIsTableOfContentsOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {completedSections.has(index) ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                              <span className="text-left">{section.title}</span>
                            </div>
                          </Button>
                          {isAdminMode && isEditable && (
                            <div className="flex gap-1 px-3">
                              <Input
                                value={section.title}
                                onChange={(e) => handleEditSectionTitle(index, e.target.value)}
                                className="h-8 text-xs"
                                placeholder="Section title"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSection(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              
              <div className="flex-1">
                {isAdminMode && isEditable ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Title</label>
                        <Input
                          value={editingData.title}
                          onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                          className="text-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Difficulty</label>
                        <Select
                          value={editingData.difficulty}
                          onValueChange={(value) => setEditingData({ ...editingData, difficulty: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Textarea
                          value={editingData.description}
                          onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={editingData.duration}
                          onChange={(e) => setEditingData({ ...editingData, duration: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <UnifiedMediaUpload
                      onMediaUpload={(url, type) => {
                        if (type === 'image') {
                          setEditingData({ ...editingData, imageUrl: url, videoUrl: url ? undefined : editingData.videoUrl });
                        } else {
                          setEditingData({ ...editingData, videoUrl: url, imageUrl: url ? undefined : editingData.imageUrl });
                        }
                      }}
                      currentImageUrl={editingData.imageUrl}
                      currentVideoUrl={editingData.videoUrl}
                      bucketName="module-assets"
                      allowAiGeneration={true}
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-xl font-bold">{editingData.title}</h1>
                    <p className="text-muted-foreground mt-1">{editingData.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{editingData.difficulty}</Badge>
                      <Badge variant="outline">{editingData.duration} min</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isAdminMode && isEditable && (
                <Button
                  onClick={() => onSave?.(editingData)}
                  variant="default"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                Section {currentSectionIndex + 1} of {editingData.sections.length}
              </div>
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
              {onClose && !isAdminMode && (
                <Button onClick={onClose} variant="outline" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {showResults ? (
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl flex items-center justify-center gap-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  Module Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
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
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleRetakeModule} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake Module
                  </Button>
                  {calculateScore() >= 70 && !isAdminMode && (
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

        {/* Navigation */}
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
  );
}
