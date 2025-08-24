import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video, Youtube } from 'lucide-react';

interface MediaUploadProps {
  onImageUpload?: (url: string) => void;
  onVideoUpload?: (url: string) => void;
  imageUrl?: string;
  videoUrl?: string;
  bucketName?: string;
}

export function MediaUpload({ 
  onImageUpload, 
  onVideoUpload, 
  imageUrl, 
  videoUrl,
  bucketName = 'media-assets' 
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isYouTubeDialogOpen, setIsYouTubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
    return url; // Return original URL if we can't extract video ID
  };

  // Helper function to check if URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    return extractYouTubeVideoId(url) !== null;
  };

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

  const handleYouTubeUrl = () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!isYouTubeUrl(youtubeUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (onVideoUpload) {
      onVideoUpload(youtubeUrl);
    }

    setYoutubeUrl('');
    setIsYouTubeDialogOpen(false);
    
    toast({
      title: "Success",
      description: "YouTube video added successfully",
    });
  };

  return (
    <div className="space-y-4">
      {/* Image Upload */}
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
                  disabled={uploading}
                >
                  <div className="flex flex-col items-center">
                    <Image className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm">Upload Image</span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Upload */}
      {onVideoUpload && (
        <div>
          <Label className="text-sm font-medium">Video</Label>
          <div className="mt-2">
            {videoUrl ? (
              <div className="relative inline-block">
                {isYouTubeUrl(videoUrl) ? (
                  <iframe
                    src={convertToEmbedUrl(videoUrl)}
                    title="YouTube video player"
                    width="384"
                    height="216"
                    className="rounded-lg border"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    className="h-32 w-48 object-cover rounded-lg border"
                    controls
                  />
                )}
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
              <div className="space-y-2">
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
                  disabled={uploading}
                >
                  <div className="flex flex-col items-center">
                    <Video className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm">Upload Video</span>
                  </div>
                </Button>
                
                <Dialog open={isYouTubeDialogOpen} onOpenChange={setIsYouTubeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      <Youtube className="h-4 w-4 mr-2" />
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
                        <Button onClick={handleYouTubeUrl}>Add Video</Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsYouTubeDialogOpen(false);
                            setYoutubeUrl('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}
    </div>
  );
}