import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Wand2, Loader2, Play, Pause, Youtube } from 'lucide-react';

interface UnifiedMediaUploadProps {
  onMediaUpload: (url: string, type: 'image' | 'video') => void;
  currentImageUrl?: string;
  currentVideoUrl?: string;
  bucketName?: string;
  allowAiGeneration?: boolean;
}

export function UnifiedMediaUpload({ 
  onMediaUpload, 
  currentImageUrl, 
  currentVideoUrl,
  bucketName = 'media-assets',
  allowAiGeneration = true
}: UnifiedMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isYouTubeDialogOpen, setIsYouTubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper function to extract YouTube video ID from various URL formats
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

  // Helper function to convert any YouTube URL to embed format
  const convertToEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Helper function to check if URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    return extractYouTubeVideoId(url) !== null;
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Determine if it's an image or video
      const isVideo = file.type.startsWith('video/');
      const type = isVideo ? 'video' : 'image';
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

      onMediaUpload(publicUrl, type);
      
      toast({
        title: "Success",
        description: `${type === 'image' ? 'Image' : 'Video'} uploaded successfully`,
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    if (isVideo && file.size > 100 * 1024 * 1024) { // 100MB limit for videos
      toast({
        title: "File too large",
        description: "Video files must be smaller than 100MB",
        variant: "destructive",
      });
      return;
    }

    if (isImage && file.size > 10 * 1024 * 1024) { // 10MB limit for images
      toast({
        title: "File too large", 
        description: "Image files must be smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    uploadFile(file);
  };

  const generateAiImage = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a prompt for AI image generation",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('gemini-image', {
        body: { 
          prompt: aiPrompt,
          count: 1
        }
      });

      if (error) throw error;

      if (!data.images || data.images.length === 0) {
        throw new Error('No images generated');
      }

      // Convert base64 to blob
      const base64Data = data.images[0].split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create file from blob
      const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
      
      await uploadFile(file);
      setIsAiDialogOpen(false);
      setAiPrompt('');

    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: "AI Generation failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const removeImage = () => {
    onMediaUpload('', 'image');
  };

  const removeVideo = () => {
    onMediaUpload('', 'video');
    setVideoPlaying(false);
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Media Upload</Label>
      
      {/* Current Media Display */}
      {(currentImageUrl || currentVideoUrl) && (
        <div className="space-y-4">
          {currentImageUrl && (
            <div className="relative w-full max-w-md">
              <img
                src={currentImageUrl}
                alt="Uploaded content"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {currentVideoUrl && (
            <div className="relative w-full max-w-md">
              {isYouTubeUrl(currentVideoUrl) ? (
                <iframe
                  src={convertToEmbedUrl(currentVideoUrl)}
                  title="YouTube video player"
                  width="100%"
                  height="192"
                  className="rounded-lg border"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentVideoUrl}
                  className="w-full h-48 object-cover rounded-lg border"
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                  onEnded={() => setVideoPlaying(false)}
                  controls={false}
                />
              )}
              {!isYouTubeUrl(currentVideoUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 left-2"
                  onClick={toggleVideoPlayback}
                >
                  {videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeVideo}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Upload Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Uploading...' : (currentImageUrl || currentVideoUrl ? 'Replace Media' : 'Upload Image or Video')}
        </Button>

        <Dialog open={isYouTubeDialogOpen} onOpenChange={setIsYouTubeDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              Add YouTube Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add YouTube Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (youtubeUrl && extractYouTubeVideoId(youtubeUrl)) {
                    onMediaUpload(youtubeUrl, 'video');
                    setIsYouTubeDialogOpen(false);
                    setYoutubeUrl('');
                    toast({ title: "Success", description: "YouTube video added successfully" });
                  } else {
                    toast({ title: "Error", description: "Please enter a valid YouTube URL", variant: "destructive" });
                  }
                }}>Add Video</Button>
                <Button variant="outline" onClick={() => { setIsYouTubeDialogOpen(false); setYoutubeUrl(''); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {allowAiGeneration && (
          <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={uploading || generating}
                className="flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                AI Generate Image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate AI Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Describe the image you want to generate</Label>
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="A beautiful sunset over mountains..."
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="4:3">Classic (4:3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAiDialogOpen(false)}
                    disabled={generating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={generateAiImage}
                    disabled={generating || !aiPrompt.trim()}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate Image'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}