import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { ToolViewer } from "@/components/ToolViewer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Loader2, Star, Bookmark } from "lucide-react";
import { useTools } from "@/hooks/useTools";
import { useContentRatings } from "@/hooks/useContentRatings";
import { useAuth } from "@/hooks/useAuth";

const Tools = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [minStarRating, setMinStarRating] = useState(0);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { tools, loading, error } = useTools();
  
  const toolItems = tools.map(item => ({ id: item.id, type: 'tool' }));
  const { ratingsData, loading: ratingsLoading } = useContentRatings(toolItems, user?.id);

  const categories = ["all", "open_source", "saas", "commercial"];
  const starFilters = [0, 1, 2, 3, 4, 5];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === "all" || tool.type?.toLowerCase() === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const ratingData = ratingsData[tool.id];
    const matchesRating = minStarRating === 0 || (ratingData?.averageRating || 0) >= minStarRating;
    const matchesBookmark = !showBookmarkedOnly || (ratingData?.isBookmarked || false);
    
    return matchesCategory && matchesSearch && matchesRating && matchesBookmark;
  });

  const handleToolClick = (tool: any) => {
    setSelectedTool(tool);
    setIsViewerOpen(true);
  };

  const handleOpenTool = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedTool(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-primary-glow/20 blur-3xl rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mb-6">
                HANDS-ON PRACTICE
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                AI <span className="bg-gradient-primary bg-clip-text text-transparent">Tools</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Sandboxes, datasets, and interactive environments to practice and refine your AI skills.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools and resources..."
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
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={activeCategory === category ? "default" : "secondary"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setActiveCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
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

        {/* Tools Grid */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading tools...</span>
              </div>
            )}
            
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg">
                  Error loading tools: {error}
                </p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredTools.map((tool, index) => {
                    const ratingData = ratingsData[tool.id];
                    return (
                      <div key={tool.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in-up">
                        <ToolCard
                          title={tool.name}
                          description={tool.description}
                          category={tool.type}
                          icon="wrench"
                          image={tool.image_url}
                          video={tool.video_url}
                          url={tool.url}
                          costIndicator={tool.cost_indicator}
                          stars={tool.stars}
                          averageRating={ratingData?.averageRating}
                          totalVotes={ratingData?.totalVotes}
                          isBookmarked={ratingData?.isBookmarked}
                          onClick={() => handleToolClick(tool)}
                          onOpenTool={() => tool.url && handleOpenTool(tool.url)}
                        />
                      </div>
                    );
                  })}
                </div>

                {filteredTools.length === 0 && tools.length > 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No tools found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
                
                {tools.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No tools available at this time.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tight mb-4">More Tools Coming Soon</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                We're constantly developing new tools and resources to enhance your AI learning experience. 
                Stay tuned for updates!
              </p>
              <button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow px-6 py-3 rounded-lg text-white font-medium">
                Request a Tool
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Tool Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTool && (
            <ToolViewer
              tool={selectedTool}
              onClose={handleCloseViewer}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Tools;