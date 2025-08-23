import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  const lastUpdated = "January 15, 2024";

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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mb-6">
                YOUR DATA MATTERS
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                Privacy <span className="bg-gradient-primary bg-clip-text text-transparent">Policy</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in transparency and protecting your privacy. Learn how we collect, use, and safeguard your information.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none animate-fade-in-up">
              
              {/* Overview */}
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-gradient-primary">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Our Commitment</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Alberta AI Academy is committed to protecting your privacy and being transparent about how we handle your data. 
                  We believe that privacy is a fundamental right, and we've designed our platform with privacy-by-design principles.
                </p>
              </div>

              {/* Information Collection */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Information We Collect</h2>
                
                <div className="space-y-8">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Account Information</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Email address for account creation and communication
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Profile information you choose to provide (name, learning preferences)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Account settings and preferences
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Learning Data</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Learning plans and progress tracking
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Interactions with our AI mentor and chat features
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Bookmarked articles and saved resources
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Usage patterns to improve recommendations
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Technical Information</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Device and browser information for optimization
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        IP address for security and analytics (anonymized)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Cookies for essential functionality only
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Information */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">How We Use Your Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Personalization</h3>
                    <p className="text-sm text-muted-foreground">
                      Create personalized learning recommendations and track your progress through our platform.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Communication</h3>
                    <p className="text-sm text-muted-foreground">
                      Send important updates about your account, new features, and learning opportunities.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Improvement</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze usage patterns to improve our platform and develop better learning resources.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Protect your account and prevent unauthorized access or fraudulent activity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Sharing */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Data Sharing</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">We Never Sell Your Data</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Your personal information is never sold to third parties. We only share data in the following limited circumstances:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      With your explicit consent
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      To comply with legal requirements
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      With service providers who help operate our platform (under strict confidentiality agreements)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Your Rights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Access & Export</h3>
                    <p className="text-sm text-muted-foreground">
                      Request a copy of all personal data we have about you in a portable format.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Correction</h3>
                    <p className="text-sm text-muted-foreground">
                      Update or correct any inaccurate personal information in your account.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Deletion</h3>
                    <p className="text-sm text-muted-foreground">
                      Request deletion of your account and associated data at any time.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Portability</h3>
                    <p className="text-sm text-muted-foreground">
                      Transfer your learning data to another service if you choose to leave.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">Questions or Concerns?</h2>
                <p className="text-muted-foreground mb-6">
                  If you have any questions about this privacy policy or how we handle your data, please don't hesitate to contact us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="mailto:privacy@albertaai.academy" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-glow"
                  >
                    Contact Privacy Team
                  </a>
                  <a 
                    href="#mentor" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:border-primary/50 hover:bg-card/60 transition-all"
                  >
                    Ask AI Mentor
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;