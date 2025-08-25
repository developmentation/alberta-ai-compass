import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LearningPlanCard } from "@/components/LearningPlanCard";
import { ArticleCard } from "@/components/ArticleCard";
import { NewsCard } from "@/components/NewsCard";
import { NewsViewer } from "@/components/NewsViewer";
import { ArticleViewer } from "@/components/ArticleViewer";
import { LoginModal } from "@/components/LoginModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useNews } from "@/hooks/useNews";
import { useArticles } from "@/hooks/useArticles";
import { useLearningPlans } from "@/hooks/useLearningPlans";
import { useContentRatings } from "@/hooks/useContentRatings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Wrench, BookOpen, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isNewsViewerOpen, setIsNewsViewerOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);

  // Fetch data from database
  const { news, loading: newsLoading } = useNews();
  const { articles, loading: articlesLoading } = useArticles();
  const { learningPlans, loading: plansLoading } = useLearningPlans();

  // Prepare content items for ratings
  const contentItems = useMemo(() => [
    ...learningPlans.map(plan => ({ id: plan.id, type: 'learning_plan' })),
    ...news.map(item => ({ id: item.id, type: 'news' })),
    ...articles.map(item => ({ id: item.id, type: 'article' }))
  ], [learningPlans, news, articles]);

  const { ratingsData } = useContentRatings(contentItems);

  // Featured Learning Plans - highest rated (or 3 newest if no ratings)
  const featuredPlans = useMemo(() => {
    // Sort original plans first by rating (if available) then by created_at
    const sortedOriginalPlans = [...learningPlans].sort((a, b) => {
      const ratingA = ratingsData[a.id];
      const ratingB = ratingsData[b.id];
      
      // If both have ratings, sort by average rating
      if (ratingA?.averageRating && ratingB?.averageRating) {
        return ratingB.averageRating - ratingA.averageRating;
      }
      
      // If one has rating and other doesn't, prioritize the one with rating
      if (ratingA?.averageRating && !ratingB?.averageRating) return -1;
      if (!ratingA?.averageRating && ratingB?.averageRating) return 1;
      
      // Otherwise sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Transform top 3 plans
    return sortedOriginalPlans.slice(0, 3).map(plan => {
      const rating = ratingsData[plan.id];
      return {
        id: plan.id,
        title: plan.name,
        description: plan.description,
        duration: 'Self-paced', // Simplified for now
        level: plan.level?.charAt(0).toUpperCase() + plan.level?.slice(1) || 'Beginner',
        image: plan.image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
        video: plan.video_url,
        tags: plan.learning_outcomes?.slice(0, 2) || ['AI Learning'],
        averageRating: rating?.averageRating || 0,
        totalVotes: rating?.totalVotes || 0,
        isBookmarked: rating?.isBookmarked || false
      };
    });
  }, [learningPlans, ratingsData]);

  // Featured News - 3 most recent
  const featuredNews = useMemo(() => {
    // Sort original news by created_at (newest first)
    const sortedOriginalNews = [...news].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Transform top 3 news items
    return sortedOriginalNews.slice(0, 3).map(item => {
      const rating = ratingsData[item.id];
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        date: format(parseISO(item.created_at), 'MMM dd, yyyy'),
        category: item.level?.charAt(0).toUpperCase() + item.level?.slice(1) || 'Update',
        image: item.image_url || "",
        videoUrl: item.video_url,
        averageRating: rating?.averageRating || 0,
        totalVotes: rating?.totalVotes || 0,
        isBookmarked: rating?.isBookmarked || false,
        onClick: () => handleNewsClick(item)
      };
    });
  }, [news, ratingsData]);

  const handleNewsClick = (newsItem: any) => {
    setSelectedNews(newsItem);
    setIsNewsViewerOpen(true);
  };

  const handleCloseNewsViewer = () => {
    setIsNewsViewerOpen(false);
    setSelectedNews(null);
  };

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    setIsArticleViewerOpen(true);
  };

  const handleCloseArticleViewer = () => {
    setIsArticleViewerOpen(false);
    setSelectedArticle(null);
  };

  // Featured Articles - 3 most recent from database
  const featuredArticles = useMemo(() => {
    const sortedArticles = [...articles].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sortedArticles.slice(0, 3).map(article => {
      const rating = ratingsData[article.id];
      return {
        id: article.id,
        title: article.title,
        description: article.description,
        readTime: `${Math.max(1, Math.ceil(article.description.length / 200))} min read`,
        level: article.level?.charAt(0).toUpperCase() + article.level?.slice(1) || 'Beginner',
        image: article.image_url || "https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1400&auto=format&fit=crop",
        video: article.video_url,
        averageRating: rating?.averageRating || 0,
        totalVotes: rating?.totalVotes || 0,
        isBookmarked: rating?.isBookmarked || false,
        onClick: () => handleArticleClick(article)
      };
    });
  }, [articles, ratingsData]);

  // Show loading state
  if (plansLoading || newsLoading || articlesLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-['Inter'] antialiased flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter'] antialiased selection:bg-primary/30 selection:text-primary-foreground">
      <div className="flex flex-col min-h-screen">
        {/* Background gradient effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
          <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-primary-glow/20 blur-3xl rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Header onLoginClick={() => setIsLoginOpen(true)} />
        
        <main className="flex-1 relative z-10">
          <HeroSection 
            onSearch={setSearchResults}
            searchResults={searchResults}
          />

          {/* Key Features */}
          <section className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-fade-in-up text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                  Key Features
                </h2>
                <p className="text-muted-foreground mt-2">Discover everything you need to advance your AI knowledge and skills</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Newspaper,
                    title: "News",
                    description: "Stay updated with the latest AI developments, industry insights, and breakthrough technologies."
                  },
                  {
                    icon: Wrench,
                    title: "Tools", 
                    description: "Access curated AI tools and platforms to enhance your productivity and learning experience."
                  },
                  {
                    icon: BookOpen,
                    title: "Learning Plans",
                    description: "Follow structured learning paths designed to take you from beginner to advanced AI practitioner."
                  },
                  {
                    icon: Users,
                    title: "Cohorts",
                    description: "Join collaborative learning groups and connect with peers on your AI learning journey."
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                      <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:border-primary/50 hover:bg-card-hover">
                        <CardHeader className="text-center pb-4">
                          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-center text-sm leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* Featured Learning Plans */}
          <section className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    Featured Learning Plans
                  </h2>
                  <p className="text-muted-foreground mt-2">Curated paths with timelines, milestones, and outcomes.</p>
                </div>
                <Link to="/learning-hub">
                  <Button variant="ghost" className="border border-border hover:border-primary/50">
                    View All Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPlans.map((plan, index) => (
                  <div key={plan.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                    <LearningPlanCard {...plan} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* News Section */}
          <section className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Latest News</h2>
                  <p className="text-muted-foreground mt-2">Stay current with curated updates in AI.</p>
                </div>
                <Link to="/news">
                  <Button variant="ghost" className="border border-border hover:border-primary/50">
                    View All News
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredNews.map((item, index) => (
                  <div key={item.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                    <NewsCard {...item} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* Learning Articles */}
          <section className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Latest Articles</h2>
                  <p className="text-muted-foreground mt-2">Short reads with references and practice prompts.</p>
                </div>
                <Link to="/learning-hub">
                  <Button variant="ghost" className="border border-border hover:border-primary/50">
                    View All Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredArticles.map((article, index) => (
                  <div key={article.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                    <ArticleCard {...article} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* CTA Sections */}
          <section className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tools CTA */}
                <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-primary">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Hands-on Tools</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Practice with interactive sandboxes, datasets, and development environments designed for AI learning.
                  </p>
                  <Link to="/tools">
                    <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                      Explore Tools
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* AI Mentor CTA */}
                <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-primary">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">AI Mentor</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Get personalized guidance, create custom learning plans, and receive expert advice on your AI journey.
                  </p>
                  <Link to="/ai-mentor">
                    <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                      Meet Your Mentor
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      {/* News Viewer Dialog */}
      <Dialog open={isNewsViewerOpen} onOpenChange={setIsNewsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <NewsViewer
              news={selectedNews}
              onClose={handleCloseNewsViewer}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Article Viewer Dialog */}
      <Dialog open={isArticleViewerOpen} onOpenChange={setIsArticleViewerOpen}>
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

export default Index;