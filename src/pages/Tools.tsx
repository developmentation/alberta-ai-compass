import { ToolCard } from "@/components/ToolCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const tools = [
    {
      id: 1,
      title: "Prompt Lab",
      description: "Experiment with patterns, system prompts, and evaluations. Test different prompt strategies with real-time feedback and optimization suggestions.",
      category: "Playground",
      icon: "wrench"
    },
    {
      id: 2,
      title: "Eval Datasets",
      description: "Ready-to-use corpora for reasoning and safety evaluations. Comprehensive datasets for testing model performance across various domains.",
      category: "Data",
      icon: "database"
    },
    {
      id: 3,
      title: "RAG Kit",
      description: "Embeddings, retrievers, and a minimal pipeline. Complete toolkit for building retrieval-augmented generation systems from scratch.",
      category: "Starter",
      icon: "boxes"
    },
    {
      id: 4,
      title: "Model Comparison Studio",
      description: "Side-by-side testing of different AI models with standardized benchmarks and custom evaluation metrics.",
      category: "Analysis",
      icon: "wrench"
    },
    {
      id: 5,
      title: "Fine-tuning Workspace",
      description: "Complete environment for customizing pre-trained models with your own data. Includes training monitoring and validation tools.",
      category: "Training",
      icon: "wrench"
    },
    {
      id: 6,
      title: "AI Safety Toolkit",
      description: "Tools for detecting bias, measuring fairness, and ensuring responsible AI deployment in production environments.",
      category: "Safety",
      icon: "database"
    },
    {
      id: 7,
      title: "Vector Database Explorer",
      description: "Interactive interface for managing embeddings, similarity search, and vector operations with popular vector databases.",
      category: "Data",
      icon: "database"
    },
    {
      id: 8,
      title: "Deployment Pipeline",
      description: "End-to-end MLOps toolkit for deploying, monitoring, and scaling AI models in production environments.",
      category: "Production",
      icon: "boxes"
    },
    {
      id: 9,
      title: "Conversation Designer",
      description: "Visual editor for building complex conversational AI flows with branching logic and context management.",
      category: "Playground",
      icon: "wrench"
    },
    {
      id: 10,
      title: "Synthetic Data Generator",
      description: "Create realistic training data for your AI models while maintaining privacy and complying with data regulations.",
      category: "Data",
      icon: "database"
    },
    {
      id: 11,
      title: "API Integration Hub",
      description: "Pre-built connectors and templates for integrating AI capabilities into existing applications and workflows.",
      category: "Integration",
      icon: "boxes"
    },
    {
      id: 12,
      title: "Performance Monitor",
      description: "Real-time monitoring dashboard for tracking model performance, latency, and resource utilization in production.",
      category: "Production",
      icon: "wrench"
    }
  ];

  const categories = ["all", "playground", "data", "starter", "analysis", "training", "safety", "production", "integration"];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === "all" || tool.category.toLowerCase() === activeCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
                <Button variant="ghost" className="border border-border hover:border-primary/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Categories
                </Button>
              </div>

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
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTools.map((tool, index) => (
                <div key={tool.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in-up">
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No tools found matching your criteria. Try adjusting your search or filters.
                </p>
              </div>
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
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                Request a Tool
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tools;