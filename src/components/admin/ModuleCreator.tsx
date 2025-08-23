import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Wand2 } from 'lucide-react';
import { UnifiedMediaUpload } from './UnifiedMediaUpload';

interface ModuleCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleCreated: () => void;
}

export function ModuleCreator({ isOpen, onClose, onModuleCreated }: ModuleCreatorProps) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [language, setLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for module generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call the Gemini edge function
      const response = await supabase.functions.invoke('generate-module', {
        body: { 
          prompt: `Create a module about: ${prompt}. 
                   Title: ${title || 'Generated from prompt'}
                   Difficulty: ${difficulty}
                   Language: ${language}
                   
                   Make sure to include comprehensive content with multiple sections, quizzes, and learning outcomes.` 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { moduleData } = response.data;

      // Save the generated module to the database
      const { error: saveError } = await supabase
        .from('modules')
        .insert({
          description: moduleData?.description || 'AI generated learning module',
          json_data: moduleData,
          language: language,
          level: difficulty as '1' | '2' | '3' | 'RED',
          status: 'draft',
          image_url: imageUrl || null,
          video_url: videoUrl || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (saveError) {
        throw saveError;
      }

      toast({
        title: "Success",
        description: "Module generated and saved successfully!",
      });

      // Reset form
      setPrompt('');
      setTitle('');
      setDifficulty('1');
      setLanguage('en');
      setImageUrl('');
      setVideoUrl('');
      
      onModuleCreated();
      onClose();

    } catch (error: any) {
      console.error('Error generating module:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate module",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Module with AI
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Details</CardTitle>
              <CardDescription>
                Provide basic information and let AI generate comprehensive content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Module Title (Optional)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to Email Security"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Level</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="RED">RED Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Content Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want the module to teach. For example: 'Teach elderly users how to identify and avoid email phishing scams, including practical examples and interactive quizzes.'"
                  rows={4}
                />
              </div>

              <UnifiedMediaUpload
                onMediaUpload={(url, type) => {
                  if (type === 'image') {
                    setImageUrl(url);
                    if (url) setVideoUrl('');
                  } else {
                    setVideoUrl(url);
                    if (url) setImageUrl('');
                  }
                }}
                currentImageUrl={imageUrl}
                currentVideoUrl={videoUrl}
                bucketName="module-assets"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Module
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}