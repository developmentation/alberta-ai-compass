import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/LoginModal';
import { NewsViewer } from '@/components/NewsViewer';
import { ToolViewer } from '@/components/ToolViewer';
import { ModuleViewer } from '@/components/ModuleViewer';
import { PromptViewer } from '@/components/PromptViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Search, BookmarkIcon, CheckCircle, Star, Filter } from 'lucide-react';
import { useMyLearning } from '@/hooks/useMyLearning';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function MyLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, content, loading, error, filter, setFilter, refetch } = useMyLearning();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [viewerType, setViewerType] = useState<'news' | 'tool' | 'module' | 'prompt_library' | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleLoginClose = () => setIsLoginModalOpen(false);

  const handleContentClick = async (item: typeof content[0]) => {
    if (item.type === 'learning_plan') {
      // Navigate to learning plan page
      navigate(`/plan/${item.id}`);
    } else {
      // Open viewer for other content types
      try {
        let contentData = null;
        
        switch (item.type) {
          case 'news':
            const { data: newsData } = await supabase
              .from('news')
              .select('*')
              .eq('id', item.id)
              .single();
            contentData = newsData;
            break;
          case 'tool':
            const { data: toolData } = await supabase
              .from('tools')
              .select('*')
              .eq('id', item.id)
              .single();
            contentData = toolData;
            break;
          case 'module':
            const { data: moduleData } = await supabase
              .from('modules')
              .select('*')
              .eq('id', item.id)
              .single();
            contentData = moduleData;
            break;
          case 'prompt_library':
            const { data: promptData } = await supabase
              .from('prompt_library')
              .select('*')
              .eq('id', item.id)
              .single();
            contentData = promptData;
            break;
        }
        
        if (contentData) {
          setSelectedContent(contentData);
          setViewerType(item.type as 'news' | 'tool' | 'module' | 'prompt_library');
          setIsViewerOpen(true);
        }
      } catch (error) {
        console.error('Error fetching content details:', error);
      }
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedContent(null);
    setViewerType(null);
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContentTypeColor = (type: string) => {
    const colors = {
      learning_plan: 'bg-primary/10 text-primary',
      module: 'bg-secondary/10 text-secondary',
      news: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      tool: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      prompt_library: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      learning_plan: 'Learning Plan',
      module: 'Module',
      news: 'News',
      tool: 'Tool',
      prompt_library: 'Prompt'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onLoginClick={handleLoginClick} />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to view your learning progress
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleLoginClick}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <ScrollToTop />
        <LoginModal isOpen={isLoginModalOpen} onClose={handleLoginClose} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onLoginClick={handleLoginClick} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                My Learning
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Track your learning progress, bookmarked content, and achievements
              </p>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <BookmarkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.bookmarked}</p>
                      <p className="text-muted-foreground">Bookmarked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.completed}</p>
                      <p className="text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                      <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.rated}</p>
                      <p className="text-muted-foreground">Rated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search your content..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {filter === 'all' ? 'All Content' : 
                     filter === 'bookmarked' ? 'Bookmarked' :
                     filter === 'completed' ? 'Completed' : 'Rated'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Content
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('bookmarked')}>
                    Bookmarked
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('rated')}>
                    Rated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading your content...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg mb-4">{error}</p>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Content Grid */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContent.map((item) => (
                    <Card 
                      key={`${item.type}_${item.id}`} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleContentClick(item)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge className={getContentTypeColor(item.type)}>
                            {getContentTypeLabel(item.type)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">{item.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {item.image_url && (
                          <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {item.completed_at && `Completed ${format(new Date(item.completed_at), 'MMM d, yyyy')}`}
                            {item.bookmarked_at && !item.completed_at && `Bookmarked ${format(new Date(item.bookmarked_at), 'MMM d, yyyy')}`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredContent.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      {searchQuery ? 'No content matches your search' : 'No content found for the selected filter'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleLoginClose} />
      
      {/* Content Viewers */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedContent && viewerType === 'news' && (
            <NewsViewer
              news={selectedContent}
              onClose={handleCloseViewer}
            />
          )}
          {selectedContent && viewerType === 'tool' && (
            <ToolViewer
              tool={selectedContent}
              onClose={handleCloseViewer}
            />
          )}
          {selectedContent && viewerType === 'module' && (
            <ModuleViewer
              moduleData={{
                id: selectedContent.id,
                title: selectedContent.name || '',
                description: selectedContent.description || '',
                level: selectedContent.level || '1',
                duration: 30, // Default duration
                learningOutcomes: [],
                tags: [],
                sections: selectedContent.json_data?.sections || [],
                imageUrl: selectedContent.image_url,
                videoUrl: selectedContent.video_url
              }}
              isAdminMode={false}
              isEditable={false}
              onClose={handleCloseViewer}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Prompt Viewer - Uses its own modal */}
      {selectedContent && viewerType === 'prompt_library' && (
        <PromptViewer
          prompt={{
            id: selectedContent.id,
            name: selectedContent.name,
            description: selectedContent.description,
            purpose: selectedContent.purpose || '',
            sample_output: selectedContent.sample_output,
            stars: selectedContent.stars,
            sector_tags: selectedContent.sector_tags,
            image_url: selectedContent.image_url,
            status: selectedContent.status
          }}
          open={isViewerOpen}
          onOpenChange={(open) => {
            setIsViewerOpen(open);
            if (!open) {
              handleCloseViewer();
            }
          }}
        />
      )}
    </div>
  );
}