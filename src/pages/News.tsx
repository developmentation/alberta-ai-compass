import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsCard } from "@/components/NewsCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

const News = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const newsItems = [
    {
      id: 1,
      title: "Open models surge in quality across benchmarks",
      description: "Community-driven models narrow performance gaps with proprietary alternatives. Llama, Mistral, and other open-source models show remarkable improvements in reasoning, code generation, and multilingual capabilities.",
      date: "2 days ago",
      category: "Update",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Emerging AI safety standards gain traction",
      description: "From incident reporting to evaluation frameworks—what changes now. New regulatory frameworks and industry standards are being developed to ensure responsible AI deployment.",
      date: "5 days ago",
      category: "Policy",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "New eval suites simplify model comparisons",
      description: "Lightweight harnesses and standardized reporting tools make it easier for developers to assess model performance across different domains and use cases.",
      date: "1 week ago",
      category: "Tooling",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Breakthrough in AI interpretability research",
      description: "New techniques allow researchers to better understand how large language models make decisions, improving transparency and trust in AI systems.",
      date: "1 week ago",
      category: "Research",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Edge AI deployment reaches new milestones",
      description: "Smaller, more efficient models enable AI capabilities on mobile devices and edge computing platforms, opening new possibilities for real-time applications.",
      date: "2 weeks ago",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1400&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Enterprise AI adoption accelerates",
      description: "Companies across industries are integrating AI tools into their workflows, with particular growth in customer service, content creation, and data analysis.",
      date: "2 weeks ago",
      category: "Business",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=1400&auto=format&fit=crop"
    }
  ];

  const categories = ["all", "update", "policy", "tooling", "research", "technology", "business"];

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category.toLowerCase() === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
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
            <div className="max-w-4xl mx-auto mb-16">
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

        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item, index) => (
                <div key={item.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                  <NewsCard {...item} />
                </div>
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No news articles found matching your criteria. Try adjusting your search or filters.
                </p>
              </div>
            )}

            {/* Load More Button */}
            <div className="text-center mt-12">
              <Button className="px-8 py-3 bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                Load More Articles
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default News;