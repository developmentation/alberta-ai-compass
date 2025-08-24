import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LearningPlanCard } from "@/components/LearningPlanCard";
import { ArticleCard } from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2, Lock, Star, Bookmark } from "lucide-react";
import { useLearningPlans } from "@/hooks/useLearningPlans";
import { useAuth } from "@/hooks/useAuth";
import { useContentRatings } from "@/hooks/useContentRatings";

const LearningHub = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minStarRating, setMinStarRating] = useState(0);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const { user } = useAuth();
  const { learningPlans, loading, error } = useLearningPlans();
  
  const planItems = learningPlans.map(item => ({ id: item.id, type: 'learning_plan' }));
  const { ratingsData } = useContentRatings(planItems);

  // Mock articles for now - these could come from the resources table or a separate articles table
  const articles = [
    {
      id: 1,
      title: "Chain-of-Thought: When to use it and why",
      description: "A compact guide to reasoning strategies and evaluation. Learn how to implement effective chain-of-thought prompting techniques.",
      readTime: "12 min read",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Evaluation 101: Beyond accuracy",
      description: "Coverage, robustness, and preference-informed evals. Discover comprehensive methods for evaluating AI model performance.",
      readTime: "8 min read",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1635151227785-429f420c6b9d?w=1080&q=80"
    },
    {
      id: 3,
      title: "From zero to first AI project",
      description: "Scoping, data sourcing, and a minimal viable workflow. A step-by-step guide to launching your first AI initiative.",
      readTime: "10 min read",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1400&auto=format&fit=crop"
    }
  ];

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
      tags: plan.learning_outcomes?.slice(0, 2) || ["AI Training", "Hands-on"],
      averageRating: ratingData?.averageRating || 0,
      totalVotes: ratingData?.totalVotes || 0,
      isBookmarked: ratingData?.isBookmarked || false
    };
  });

  const filteredArticles = articles.filter(article => {
    const matchesFilter = activeFilter === "all" || article.level.toLowerCase() === (
      activeFilter === "1" ? "beginner" :
      activeFilter === "2" ? "intermediate" : 
      activeFilter === "3" ? "advanced" :
      activeFilter
    );
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <div className="max-w-4xl mx-auto mb-16">
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
                
                {learningPlans.length === 0 && !loading && (
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

        {/* Articles */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Learning Articles</h2>
              <p className="text-muted-foreground">In-depth tutorials and guides with practical examples.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <div key={article.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                  <ArticleCard {...article} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default LearningHub;