import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onSearch: (results: any[]) => void;
  searchResults: any[];
}

export const HeroSection = ({ onSearch, searchResults }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const suggestions = [
    "Prompt engineering",
    "LLMs for beginners", 
    "AI ethics",
    "RAG systems"
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Mock search results
    const mockResults = [
      {
        id: 1,
        type: "article",
        title: `Understanding ${searchQuery}`,
        description: "Comprehensive guide to getting started",
        readTime: "8 min read"
      },
      {
        id: 2,
        type: "course",
        title: `${searchQuery} Fundamentals`,
        description: "Step-by-step learning path",
        duration: "3 weeks"
      }
    ];
    
    onSearch(mockResults);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    // Auto-search when suggestion is clicked
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <section className="relative overflow-hidden py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl animate-fade-in-up">
          <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mb-6">
            WELCOME TO THE FUTURE OF LEARNING
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Search anything.{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Learn faster
            </span>{" "}
            with Alberta AI Academy.
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            Type a goal, topic, or tool. We surface curated articles, learning plans, and hands-on tools—then help you create a step-by-step plan with outcomes.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mb-8">
            <div className="group flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-3 focus-within:border-primary/50 focus-within:shadow-glow transition-all">
              <div className="px-3 py-2">
                <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search topics, goals, or tools…"
                className="flex-1 bg-transparent border-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none"
              />
              <Button 
                onClick={handleSearch}
                className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
              >
                Find materials
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Suggestions */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">Try:</span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm px-4 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-card/60 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Search Results</h3>
                <button 
                  onClick={() => onSearch([])}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 rounded-lg border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {result.type}
                      </span>
                      {result.readTime && (
                        <span className="text-xs text-muted-foreground">{result.readTime}</span>
                      )}
                      {result.duration && (
                        <span className="text-xs text-muted-foreground">{result.duration}</span>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">{result.title}</h4>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};