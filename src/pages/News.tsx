import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsCard } from "@/components/NewsCard";
import { NewsViewer } from "@/components/NewsViewer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Loader2, Star, Bookmark, Filter } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { useContentRatings } from "@/hooks/useContentRatings";

const News = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [minStarRating, setMinStarRating] = useState(0);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { news, loading, error } = useNews();
  
  const newsItems = news.map(item => ({ id: item.id, type: 'news' }));
  const { ratingsData } = useContentRatings(newsItems);

  const categories = ["all", "1", "2", "3", "red"];
  
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case "all": return "All";
      case "1": return "Level 1";
      case "2": return "Level 2"; 
      case "3": return "Level 3";
      case "red": return "RED";
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };
  const starFilters = [0, 1, 2, 3, 4, 5];

  const filteredNews = news.filter(item => {
    const matchesCategory = activeCategory === "all" || item.level?.toLowerCase() === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const ratingData = ratingsData[item.id];
    const matchesRating = minStarRating === 0 || (ratingData?.averageRating || 0) >= minStarRating;
    const matchesBookmark = !showBookmarkedOnly || (ratingData?.isBookmarked || false);
    
    return matchesCategory && matchesSearch && matchesRating && matchesBookmark;
  });

  const handleNewsClick = (newsItem: any) => {
    setSelectedNews(newsItem);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => {}} />
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-primary-glow/20 blur-3xl rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <section className="pt-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4 animate-fade-in-up">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mb-6">
                LATEST UPDATES
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                AI <span className="bg-gradient-primary bg-clip-text text-transparent">News</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Stay current with the latest developments in artificial intelligence, machine learning, and emerging technologies.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search news articles..."
                    className="pl-10 bg-card/60 backdrop-blur-sm border-border"
                  />
                </div>
                <Button 
                  variant={showBookmarkedOnly ? "default" : "ghost"}
                  className="border border-border hover:border-primary/50"
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Bookmarked
                </Button>
              </div>

              <div className="space-y-4">
                {/* Category filters */}
                <div className="flex flex-wrap gap-3 justify-center items-center">
                  <span className="text-sm text-muted-foreground">Learning Level:</span>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={activeCategory === category ? "default" : "secondary"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setActiveCategory(category)}
                    >
                      {getCategoryLabel(category)}
                    </Badge>
                  ))}
                </div>
                
                {/* Star rating filter */}
                <div className="flex flex-wrap gap-3 justify-center items-center">
                  <span className="text-sm text-muted-foreground">Minimum rating:</span>
                  {starFilters.map((rating) => (
                    <Badge
                      key={rating}
                      variant={minStarRating === rating ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform flex items-center gap-1"
                      onClick={() => setMinStarRating(rating)}
                    >
                      {rating === 0 ? (
                        "Any"
                      ) : (
                        <>
                          {rating}
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          +
                        </>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading news...</span>
              </div>
            )}
            
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg">
                  Error loading news: {error}
                </p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNews.map((item, index) => {
                    const ratingData = ratingsData[item.id];
                    return (
                      <div key={item.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                        <NewsCard
                          title={item.title}
                          description={item.description}
                          date={new Date(item.created_at).toLocaleDateString()}
                          category={`Level ${item.level}`}
                          image={item.image_url || ""}
                          video={item.video_url}
                          averageRating={ratingData?.averageRating}
                          totalVotes={ratingData?.totalVotes}
                          isBookmarked={ratingData?.isBookmarked}
                          onClick={() => handleNewsClick(item)}
                        />
                      </div>
                    );
                  })}
                </div>

                {filteredNews.length === 0 && news.length > 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No news articles found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
                
                {news.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No news articles available at this time.
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </section>
      </div>

      {/* News Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <NewsViewer
              news={selectedNews}
              onClose={handleCloseViewer}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default News;