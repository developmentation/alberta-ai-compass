import { useState } from 'react';
import ScrollToTop from '@/components/ScrollToTop';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/LoginModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, BookmarkIcon, CheckCircle, Star, Filter } from 'lucide-react';
import { useMyLearning } from '@/hooks/useMyLearning';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function MyLearning() {
  const { user } = useAuth();
  const { stats, content, loading, error, filter, setFilter, refetch } = useMyLearning();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleLoginClose = () => setIsLoginModalOpen(false);

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
      prompt: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      learning_plan: 'Learning Plan',
      module: 'Module',
      news: 'News',
      tool: 'Tool',
      prompt: 'Prompt'
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
                    <Card key={`${item.type}_${item.id}`} className="hover:shadow-lg transition-shadow">
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
    </div>
  );
}