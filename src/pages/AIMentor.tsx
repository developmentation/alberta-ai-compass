import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AIMentor as AIMentorComponent } from "@/components/AIMentor";

const AIMentor = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginClick = () => {
    // For now, just toggle login state
    setIsLoggedIn(!isLoggedIn);
  };

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
                AI-POWERED GUIDANCE
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                Your AI <span className="bg-gradient-primary bg-clip-text text-transparent">Mentor</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Get personalized learning recommendations, create custom study plans, and receive expert guidance on your AI journey.
              </p>
            </div>
          </div>
        </section>

        {/* AI Mentor Component */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AIMentorComponent onLoginClick={handleLoginClick} />
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AIMentor;