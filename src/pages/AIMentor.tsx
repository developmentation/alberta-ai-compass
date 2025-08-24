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
      <Header />
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

        {/* Features Section */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tight mb-4">What Your AI Mentor Can Do</h2>
              <p className="text-muted-foreground">Personalized assistance to accelerate your learning</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Instant Answers</h3>
                <p className="text-sm text-muted-foreground">Get immediate help with AI concepts, code debugging, and implementation questions.</p>
              </div>

              <div className="text-center p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Custom Plans</h3>
                <p className="text-sm text-muted-foreground">Generate personalized learning paths based on your goals, timeline, and current skill level.</p>
              </div>

              <div className="text-center p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor your learning progress and receive recommendations for next steps.</p>
              </div>

              <div className="text-center p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Resource Curation</h3>
                <p className="text-sm text-muted-foreground">Discover the most relevant articles, tutorials, and tools for your learning objectives.</p>
              </div>

              <div className="text-center p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Code Review</h3>
                <p className="text-sm text-muted-foreground">Get feedback on your AI projects and receive suggestions for improvement.</p>
              </div>

              <div className="text-center p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Career Guidance</h3>
                <p className="text-sm text-muted-foreground">Receive advice on AI career paths, skill development, and industry trends.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AIMentor;