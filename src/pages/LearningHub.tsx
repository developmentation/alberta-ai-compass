import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LearningPlanCard } from "@/components/LearningPlanCard";
import { ModuleCard } from "@/components/ModuleCard";
import { ArticleCard } from "@/components/ArticleCard";
import { ResourceCard } from "@/components/ResourceCard";
import { ArticleViewer } from "@/components/ArticleViewer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Filter, Loader2, Star, Bookmark } from "lucide-react";
import { useLearningPlans } from "@/hooks/useLearningPlans";
import { useModules } from "@/hooks/useModules";
import { useArticles } from "@/hooks/useArticles";
import { useResources } from "@/hooks/useResources";
import { useAuth } from "@/hooks/useAuth";
import { useContentRatings } from "@/hooks/useContentRatings";
import { useNavigate } from "react-router-dom";

const LearningHub = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minStarRating, setMinStarRating] = useState(0);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { learningPlans, loading: plansLoading, error: plansError } = useLearningPlans();
  const { modules, loading: modulesLoading, error: modulesError } = useModules();
  const { articles, loading: articlesLoading, error: articlesError } = useArticles();
  const { resources, loading: resourcesLoading, error: resourcesError } = useResources(null);
  
  // Prepare content items for ratings - include plans, modules, articles, and resources
  const contentItems = [
    ...learningPlans.map(item => ({ id: item.id, type: 'learning_plan' })),
    ...modules.map(item => ({ id: item.id, type: 'module' })),
    ...articles.map(item => ({ id: item.id, type: 'article' })),
    ...resources.map(item => ({ id: item.id, type: 'resource' }))
  ];
  const { ratingsData } = useContentRatings(contentItems);

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    setIsArticleViewerOpen(true);
  };

  const handleCloseArticleViewer = () => {
    setIsArticleViewerOpen(false);
    setSelectedArticle(null);
  };

  // Loading state
  const loading = plansLoading || modulesLoading || articlesLoading || resourcesLoading;
  const error = plansError || modulesError || articlesError || resourcesError;

  // Transform and filter articles from database
  const filteredArticles = articles
    .filter(article => {
      const articleLevel = article.level?.toLowerCase();
      const matchesFilter = activeFilter === "all" || 
        (activeFilter === "1" && articleLevel === "1") ||
        (activeFilter === "2" && articleLevel === "2") ||
        (activeFilter === "3" && articleLevel === "3") ||
        (activeFilter === "red" && articleLevel === "red");
        
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const ratingData = ratingsData[article.id];
      const matchesRating = minStarRating === 0 || (ratingData?.averageRating || 0) >= minStarRating;
      const matchesBookmark = !showBookmarkedOnly || (ratingData?.isBookmarked || false);
      
      return matchesFilter && matchesSearch && matchesRating && matchesBookmark;
    })
    .map(article => {
      const ratingData = ratingsData[article.id];
      return {
        id: article.id,
        title: article.title,
        description: article.description,
        readTime: `${Math.max(1, Math.ceil(article.description.length / 200))} min read`,
        level: article.level?.charAt(0).toUpperCase() + article.level?.slice(1) || 'Beginner',
        image: article.image_url || "https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1400&auto=format&fit=crop",
        video: article.video_url,
        averageRating: ratingData?.averageRating || 0,
        totalVotes: ratingData?.totalVotes || 0,
        isBookmarked: ratingData?.isBookmarked || false,
        onClick: () => handleArticleClick(article)
      };
    });

  // Transform and filter resources from database
  const filteredResources = resources
    .filter(resource => {
      const resourceLevel = resource.level?.toLowerCase();
      const matchesFilter = activeFilter === "all" || 
        (activeFilter === "1" && resourceLevel === "1") ||
        (activeFilter === "2" && resourceLevel === "2") ||
        (activeFilter === "3" && resourceLevel === "3") ||
        (activeFilter === "red" && resourceLevel === "red");
        
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const ratingData = ratingsData[resource.id];
      const matchesRating = minStarRating === 0 || (ratingData?.averageRating || 0) >= minStarRating;
      const matchesBookmark = !showBookmarkedOnly || (ratingData?.isBookmarked || false);
      
      return matchesFilter && matchesSearch && matchesRating && matchesBookmark;
    })
    .map(resource => {
      const ratingData = ratingsData[resource.id];
      return {
        ...resource,
        averageRating: ratingData?.averageRating || 0,
        totalVotes: ratingData?.totalVotes || 0,
        isBookmarked: ratingData?.isBookmarked || false
      };
    });

  const filters = [
    { key: "all", label: "All" },
    { key: "1", label: "Level 1" },
    { key: "2", label: "Level 2" }, 
    { key: "3", label: "Level 3" },
    { key: "red", label: "RED" }
  ];

  const starFilters = [0, 1, 2, 3, 4, 5];

  const filteredPlans = learningPlans.filter(plan => {
    const matchesFilter = activeFilter === "all" || plan.level?.toLowerCase() === activeFilter;
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const ratingData = ratingsData[plan.id];
    const matchesRating = minStarRating === 0 || (ratingData?.averageRating || 0) >= minStarRating;
    const matchesBookmark = !showBookmarkedOnly || (ratingData?.isBookmarked || false);
    
    return matchesFilter && matchesSearch && matchesRating && matchesBookmark;
  }).map(plan => {
    const ratingData = ratingsData[plan.id];
    return {
      id: plan.id,
      title: plan.name,
      description: plan.description,
      duration: typeof plan.duration === 'string' ? plan.duration : 
               plan.duration ? String(plan.duration) : '4 weeks',
      level: plan.level === '1' ? 'Beginner' : 
             plan.level === '2' ? 'Intermediate' : 
             plan.level === '3' ? 'Advanced' : 
             plan.level === 'red' ? 'RED' : 
             plan.level,
      image: plan.image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
      video: plan.video_url,
      tags: plan.learning_outcomes?.slice(0, 2) || ["AI Training", "Hands-on"],
      averageRating: ratingData?.averageRating || 0,
      totalVotes: ratingData?.totalVotes || 0,
      isBookmarked: ratingData?.isBookmarked || false
    };
  });

  // Transform and filter modules from database  
  const filteredModules = modules
    .filter(module => {
      const moduleLevel = module.level?.toLowerCase();
      const matchesFilter = activeFilter === "all" || 
        (activeFilter === "1" && moduleLevel === "1") ||
        (activeFilter === "2" && moduleLevel === "2") ||
        (activeFilter === "3" && moduleLevel === "3") ||
        (activeFilter === "red" && moduleLevel === "red");
        
      const matchesSearch = (module.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const ratingData = ratingsData[module.id];
      const matchesRating = minStarRating === 0 || (ratingData?.averageRating || 0) >= minStarRating;
      const matchesBookmark = !showBookmarkedOnly || (ratingData?.isBookmarked || false);
      
      return matchesFilter && matchesSearch && matchesRating && matchesBookmark;
    })
    .map(module => {
      const ratingData = ratingsData[module.id];
      // Try to parse json_data to get learning outcomes for tags
      let learningOutcomes: string[] = [];
      try {
        const jsonData = typeof module.json_data === 'string' ? JSON.parse(module.json_data) : module.json_data;
        learningOutcomes = jsonData?.learningOutcomes || jsonData?.learning_outcomes || [];
      } catch (e) {
        // If parsing fails, use empty array
      }
      
      return {
        id: module.id,
        title: module.name || 'Untitled Module',
        description: module.description,
        level: module.level === '1' ? 'Beginner' : 
               module.level === '2' ? 'Intermediate' : 
               module.level === '3' ? 'Advanced' : 
               module.level === 'red' ? 'RED' : 
               module.level || 'Beginner',
        image_url: module.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop",
        video_url: module.video_url,
        tags: learningOutcomes.slice(0, 2).length > 0 ? learningOutcomes.slice(0, 2) : ["AI Learning", "Module"],
        averageRating: ratingData?.averageRating || 0,
        totalVotes: ratingData?.totalVotes || 0,
        isBookmarked: ratingData?.isBookmarked || false,
        estimatedTime: "30 min" // Default estimate, could be derived from json_data if available
      };
    });


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => {}} />
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-primary-glow/20 blur-3xl rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4 animate-fade-in-up">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mb-6">
                COMPREHENSIVE LEARNING
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                Learning <span className="bg-gradient-primary bg-clip-text text-transparent">Hub</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Curated learning paths, in-depth articles, and hands-on tutorials to master AI and machine learning.
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
                    placeholder="Search learning materials..."
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
                {/* Level filters */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {filters.map((filter) => (
                    <Badge
                      key={filter.key}
                      variant={activeFilter === filter.key ? "default" : "secondary"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setActiveFilter(filter.key)}
                    >
                      {filter.label}
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

        {/* Learning Plans */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Learning Plans</h2>
              <p className="text-muted-foreground">Structured pathways with timelines, milestones, and outcomes.</p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading learning plans...</span>
              </div>
            )}
            
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg">
                  Error loading learning plans: {error}
                </p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPlans.map((plan, index) => (
                    <div key={plan.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                      <LearningPlanCard {...plan} />
                    </div>
                  ))}
                </div>

                {filteredPlans.length === 0 && learningPlans.length > 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No learning plans found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
                
                {learningPlans.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No learning plans available at this time.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Learning Modules */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Learning Modules</h2>
              <p className="text-muted-foreground">Interactive modules with hands-on exercises and assessments.</p>
            </div>

            {modulesLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading modules...</span>
              </div>
            )}
            
            {modulesError && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg">
                  Error loading modules: {modulesError}
                </p>
              </div>
            )}

            {!modulesLoading && !modulesError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredModules.map((module, index) => (
                    <div key={module.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                      <ModuleCard {...module} />
                    </div>
                  ))}
                </div>

                {filteredModules.length === 0 && modules.length > 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No modules found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
                
                {modules.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No modules available at this time.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Articles */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Learning Articles</h2>
              <p className="text-muted-foreground">In-depth tutorials and guides with practical examples.</p>
            </div>

            {articlesLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading articles...</span>
              </div>
            )}
            
            {articlesError && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg">
                  Error loading articles: {articlesError}
                </p>
              </div>
            )}

            {!articlesLoading && !articlesError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article, index) => (
                    <div key={article.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                      <ArticleCard {...article} />
                    </div>
                  ))}
                </div>

                {filteredArticles.length === 0 && articles.length > 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No articles found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
                
                {articles.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No articles available at this time.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        {/* Resources */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Resources</h2>
              <p className="text-muted-foreground">Third-party resources and external tools for enhanced learning.</p>
            </div>

            {resourcesLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading resources...</span>
              </div>
            )}
            
            {resourcesError && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg">
                  Error loading resources: {resourcesError}
                </p>
              </div>
            )}

            {!resourcesLoading && !resourcesError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredResources.map((resource, index) => (
                    <div key={resource.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                      <ResourceCard
                        id={resource.id}
                        title={resource.title}
                        description={resource.description}
                        url={resource.url}
                        level={resource.level}
                        image_url={resource.image_url}
                        video_url={resource.video_url}
                        stars_rating={resource.stars_rating}
                        onClick={() => navigate(`/resource/${resource.id}`)}
                      />
                    </div>
                  ))}
                </div>

                {filteredResources.length === 0 && resources.length > 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No resources found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
                
                {resources.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No resources available at this time.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
      <Footer />

      {/* Article Viewer Modal */}
      <Dialog open={isArticleViewerOpen} onOpenChange={handleCloseArticleViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <ArticleViewer 
              article={selectedArticle}
              onClose={handleCloseArticleViewer}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearningHub;