import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video, Wand2, Loader2, Sparkles } from 'lucide-react';

interface EnhancedMediaUploadProps {
  onImageUpload?: (url: string) => void;
  onVideoUpload?: (url: string) => void;
  imageUrl?: string;
  videoUrl?: string;
  bucketName?: string;
  allowAiGeneration?: boolean;
}

export function EnhancedMediaUpload({ 
  onImageUpload, 
  onVideoUpload, 
  imageUrl, 
  videoUrl,
  bucketName = 'media-assets',
  allowAiGeneration = true
}: EnhancedMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (type === 'image' && onImageUpload) {
        onImageUpload(publicUrl);
      } else if (type === 'video' && onVideoUpload) {
        onVideoUpload(publicUrl);
      }

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
      });
    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to upload ${type}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const generateAiImage = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for image generation",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);

      const response = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: aiPrompt,
          aspectRatio: aspectRatio
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { imageUrl: generatedUrl } = response.data;

      if (onImageUpload) {
        onImageUpload(generatedUrl);
      }

      toast({
        title: "Success",
        description: "AI image generated successfully!",
      });

      // Reset form
      setAiPrompt('');
      setAspectRatio('1:1');
      setIsAiDialogOpen(false);

    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        await uploadFile(file, 'image');
      } else {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        await uploadFile(file, 'video');
      } else {
        toast({
          title: "Error",
          description: "Please select a valid video file",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = () => {
    if (onImageUpload) {
      onImageUpload('');
    }
  };

  const removeVideo = () => {
    if (onVideoUpload) {
      onVideoUpload('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Upload Section */}
      {onImageUpload && (
        <div>
          <Label className="text-sm font-medium">Image</Label>
          <div className="mt-2">
            {imageUrl ? (
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Uploaded image"
                  className="h-32 w-32 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Upload Button */}
                <div>
                  <Input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading || generating}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span className="text-sm">Upload Image</span>
                    </div>
                  </Button>
                </div>
                
                {/* AI Generation Button */}
                {allowAiGeneration && (
                  <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-purple-200 text-purple-700 hover:bg-purple-50"
                        disabled={uploading || generating}
                      >
                        <div className="flex items-center justify-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          <span className="text-sm">Generate with AI</span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Wand2 className="h-5 w-5" />
                          Generate Image with AI
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ai-prompt">Image Description</Label>
                          <Textarea
                            id="ai-prompt"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Describe the image you want to generate..."
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                          <Select value={aspectRatio} onValueChange={setAspectRatio}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              <SelectItem value="1:1">Square (1:1)</SelectItem>
                              <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                              <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                              <SelectItem value="4:3">Standard (4:3)</SelectItem>
                              <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline" 
                            onClick={() => setIsAiDialogOpen(false)}
                            disabled={generating}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={generateAiImage}
                            disabled={generating || !aiPrompt.trim()}
                          >
                            {generating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Upload Section */}
      {onVideoUpload && (
        <div>
          <Label className="text-sm font-medium">Video</Label>
          <div className="mt-2">
            {videoUrl ? (
              <div className="relative inline-block">
                <video
                  src={videoUrl}
                  className="h-32 w-48 object-cover rounded-lg border"
                  controls
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeVideo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading || generating}
                >
                  <div className="flex flex-col items-center">
                    <Video className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm">Upload Video</span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {(uploading || generating) && (
        <p className="text-sm text-muted-foreground">
          {uploading && "Uploading..."}
          {generating && "Generating image with AI..."}
        </p>
      )}
    </div>
  );
}