interface HeroSectionProps {
  onSearch: (results: any[]) => void;
  searchResults: any[];
}

export const HeroSection = ({ onSearch, searchResults }: HeroSectionProps) => {

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
        </div>
      </div>
    </section>
  );
};