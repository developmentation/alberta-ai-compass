import { useState } from "react";
import { LearningPlanCard } from "@/components/LearningPlanCard";
import { ArticleCard } from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

const LearningHub = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const learningPlans = [
    {
      id: 1,
      title: "Prompt Engineering Foundations",
      description: "Principles, patterns, and evaluation for reliable prompting. Master the art of crafting effective prompts for various AI models and use cases.",
      duration: "4 weeks",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
      tags: ["Structured patterns", "Hands-on labs"]
    },
    {
      id: 2,
      title: "Build Retrieval-Augmented Generation",
      description: "Index, embed, and ground responses with verifiable sources. Learn to build RAG systems that provide accurate, contextual responses.",
      duration: "3 weeks",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80",
      tags: ["Vector DBs", "Guardrails"]
    },
    {
      id: 3,
      title: "Responsible AI & Data Ethics",
      description: "Fairness, privacy, and risk mitigation in real deployments. Understand the ethical implications and best practices for AI development.",
      duration: "2 weeks",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=1080&q=80",
      tags: ["Governance", "Policy"]
    },
    {
      id: 4,
      title: "Machine Learning Fundamentals",
      description: "Core concepts, algorithms, and practical applications. Build a solid foundation in machine learning principles and techniques.",
      duration: "6 weeks",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop",
      tags: ["Algorithms", "Data Science"]
    },
    {
      id: 5,
      title: "Advanced NLP Techniques",
      description: "Deep dive into natural language processing with transformers, BERT, and GPT architectures. Master state-of-the-art NLP methods.",
      duration: "5 weeks",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1400&auto=format&fit=crop",
      tags: ["Transformers", "BERT", "GPT"]
    },
    {
      id: 6,
      title: "AI for Business Applications",
      description: "Practical AI implementation strategies for enterprises. Learn how to integrate AI solutions into business workflows effectively.",
      duration: "4 weeks",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop",
      tags: ["Strategy", "Implementation"]
    }
  ];

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
    },
    {
      id: 4,
      title: "Fine-tuning Large Language Models",
      description: "Best practices for customizing pre-trained models for specific tasks. Learn efficient fine-tuning techniques and strategies.",
      readTime: "15 min read",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Building Conversational AI Systems",
      description: "Design patterns and implementation strategies for chatbots and virtual assistants that provide exceptional user experiences.",
      readTime: "12 min read",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "AI Model Deployment at Scale",
      description: "Infrastructure, monitoring, and optimization strategies for production AI systems. Learn to deploy models efficiently and reliably.",
      readTime: "18 min read",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop"
    }
  ];

  const filters = ["all", "beginner", "intermediate", "advanced"];

  const filteredPlans = learningPlans.filter(plan => {
    const matchesFilter = activeFilter === "all" || plan.level.toLowerCase() === activeFilter;
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredArticles = articles.filter(article => {
    const matchesFilter = activeFilter === "all" || article.level.toLowerCase() === activeFilter;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                <Button variant="ghost" className="border border-border hover:border-primary/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {filters.map((filter) => (
                  <Badge
                    key={filter}
                    variant={activeFilter === filter ? "default" : "secondary"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Badge>
                ))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlans.map((plan, index) => (
                <div key={plan.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                  <LearningPlanCard {...plan} />
                </div>
              ))}
            </div>
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
    </div>
  );
};

export default LearningHub;