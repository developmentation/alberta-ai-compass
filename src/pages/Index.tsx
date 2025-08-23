import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LearningPlanCard } from "@/components/LearningPlanCard";
import { ArticleCard } from "@/components/ArticleCard";
import { NewsCard } from "@/components/NewsCard";
import { ToolCard } from "@/components/ToolCard";
import { AIMentor } from "@/components/AIMentor";
import { LoginModal } from "@/components/LoginModal";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const learningPlans = [
    {
      id: 1,
      title: "Prompt Engineering Foundations",
      description: "Principles, patterns, and evaluation for reliable prompting.",
      duration: "4 weeks",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
      tags: ["Structured patterns", "Hands-on labs"]
    },
    {
      id: 2,
      title: "Build Retrieval-Augmented Generation",
      description: "Index, embed, and ground responses with verifiable sources.",
      duration: "3 weeks",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80",
      tags: ["Vector DBs", "Guardrails"]
    },
    {
      id: 3,
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

  const tools = [
    {
      id: 1,
      title: "Prompt Lab",
      description: "Experiment with patterns, system prompts, and evals.",
      category: "Playground",
      icon: "wrench"
    },
    {
      id: 2,
      title: "Eval Datasets",
      description: "Ready-to-use corpora for reasoning and safety evals.",
      category: "Data",
      icon: "database"
    },
    {
      id: 3,
      title: "RAG Kit",
      description: "Embeddings, retrievers, and a minimal pipeline.",
      category: "Starter",
      icon: "boxes"
    }
  ];

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
          <section id="hub" className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                    Featured Learning Plans
                  </h2>
                  <p className="text-muted-foreground mt-2">Curated paths with timelines, milestones, and outcomes.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {learningPlans.map((plan, index) => (
                  <div key={plan.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                    <LearningPlanCard {...plan} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* News Section */}
          <section id="news" className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">News</h2>
                  <p className="text-muted-foreground mt-2">Stay current with curated updates in AI.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsItems.map((item, index) => (
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
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Latest Learning Articles</h2>
                  <p className="text-muted-foreground mt-2">Short reads with references and practice prompts.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                  <div key={article.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                    <ArticleCard {...article} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* Tools Section */}
          <section id="tools" className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tools</h2>
                  <p className="text-muted-foreground mt-2">Sandboxes, datasets, and notebooks to practice skills.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map((tool, index) => (
                  <div key={tool.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                    <ToolCard {...tool} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* AI Mentor Section */}
          <section id="mentor" className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AIMentor onLoginClick={() => setIsLoginOpen(true)} />
            </div>
            <div className="border-t border-border/50 mt-16" />
          </section>

          {/* Privacy Section */}
          <section id="privacy" className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-primary">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Privacy Policy</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We value your privacy. Content you create is private by default and never sold. 
                  Aggregated analytics help us improve learning outcomes. You can request deletion anytime.
                </p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    We store account basics and your saved plans.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Uploads are processed securely and can be deleted.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    We use cookies for essential functionality only.
                  </li>
                </ul>
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