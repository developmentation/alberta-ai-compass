interface HeroSectionProps {
  onSearch: (results: any[]) => void;
  searchResults: any[];
}

export const HeroSection = ({ onSearch, searchResults }: HeroSectionProps) => {

  return (
    <section className="relative overflow-hidden pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="animate-fade-in-up">
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

          {/* Right Column - Video Player (Desktop only) */}
          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-3/4 mx-auto">
              <div className="aspect-square bg-card/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
                <video 
                  className="w-full h-full object-cover rounded-2xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/hero.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};