import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Wrench, BookOpen, Users } from "lucide-react";

interface HeroSectionProps {
  onSearch: (results: any[]) => void;
  searchResults: any[];
}

export const HeroSection = ({ onSearch, searchResults }: HeroSectionProps) => {
  const keyFeatures = [
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
  ];

  return (
    <section className="relative overflow-hidden py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl animate-fade-in-up">
          <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mb-6">
            WELCOME TO THE FUTURE OF LEARNING
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Learn faster
            </span>{" "}
            with the Alberta AI Academy.
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
            Learn, join community, and collaborate to expand your AI skills.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-sm border border-border rounded-lg mb-12">
            <span className="text-sm font-medium text-primary">🍁</span>
            <span className="text-sm text-muted-foreground">
              A free service provided by the Government of Alberta
            </span>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover everything you need to advance your AI knowledge and skills
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};