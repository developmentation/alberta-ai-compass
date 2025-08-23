import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTools } from "@/hooks/useTools";

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { tools, loading, error } = useTools();

  const categories = ["all", "open_source", "saas", "commercial"];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === "all" || tool.type?.toLowerCase() === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).map(tool => ({
    id: tool.id,
    title: tool.name,
    description: tool.description,
    category: tool.type,
    icon: "wrench",
    url: tool.url,
    costIndicator: tool.cost_indicator,
    stars: tool.stars
  }));

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredTools.map((tool, index) => (
                    <div key={tool.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in-up">
                      <ToolCard {...tool} />
                    </div>
                  ))}
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
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                Request a Tool
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Tools;