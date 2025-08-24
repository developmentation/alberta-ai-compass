import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LearningPlanCard } from "@/components/LearningPlanCard";
import { ArticleCard } from "@/components/ArticleCard";
import { NewsCard } from "@/components/NewsCard";
import { LoginModal } from "@/components/LoginModal";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const learningPlans = [
    {
      id: "1",
      title: "Prompt Engineering Foundations",
      description: "Principles, patterns, and evaluation for reliable prompting.",
      duration: "4 weeks",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
      tags: ["Structured patterns", "Hands-on labs"]
    },
    {
      id: "2",
      title: "Build Retrieval-Augmented Generation",
      description: "Index, embed, and ground responses with verifiable sources.",
      duration: "3 weeks",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80",
      tags: ["Vector DBs", "Guardrails"]
    },
    {
      id: "3",
      title: "Responsible AI & Data Ethics",
      description: "Fairness, privacy, and risk mitigation in real deployments.",
      duration: "2 weeks",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=1080&q=80",
      tags: ["Governance", "Policy"]
    }
  ];

  const newsItems = [
    {
      id: 1,
      title: "Open models surge in quality across benchmarks",
      description: "Community-driven models narrow performance gaps.",
      date: "2 days ago",
      category: "Update",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Emerging AI safety standards gain traction",
      description: "From incident reporting to evals—what changes now.",
      date: "5 days ago",
      category: "Policy",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "New eval suites simplify model comparisons",
      description: "Lightweight harnesses and standardized reporting.",
      date: "1 week ago",
      category: "Tooling",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1400&auto=format&fit=crop"
    }
  ];

  const articles = [
    {
      id: 1,
      title: "Chain-of-Thought: When to use it and why",
      description: "A compact guide to reasoning strategies and evaluation.",
      readTime: "12 min read",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Evaluation 101: Beyond accuracy",
      description: "Coverage, robustness, and preference-informed evals.",
      readTime: "8 min read",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1635151227785-429f420c6b9d?w=1080&q=80"
    },
    {
      id: 3,
      title: "From zero to first AI project",
      description: "Scoping, data sourcing, and a minimal viable workflow.",
      readTime: "10 min read",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1400&auto=format&fit=crop"
    }
  ];

  // Reduced datasets for homepage preview
  const featuredPlans = learningPlans.slice(0, 3);
  const featuredNews = newsItems.slice(0, 3);
  const featuredArticles = articles.slice(0, 3);

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

          {/* Featured Learning Plans */}
          <section className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
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
    </div>
  );
};

export default Index;