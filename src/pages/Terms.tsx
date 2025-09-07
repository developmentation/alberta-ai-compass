import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  const lastUpdated = "September 7, 2025";

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
        <section className="pt-5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4 animate-fade-in-up">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mb-6">
                TERMS & CONDITIONS
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                Terms of <span className="bg-gradient-primary bg-clip-text text-transparent">Use</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Please read these terms carefully before using the Alberta AI Academy platform and services.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
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
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Agreement to Terms</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using the Alberta AI Academy platform, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
                </p>
              </div>

              {/* Educational Purpose */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Educational Purpose and AI Capabilities</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    This site is provided for learning purposes. Alberta makes available some AI capabilities, but does not guarantee the accuracy of these statements or outputs. All AI-generated content should be reviewed and verified independently before use.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Users are responsible for evaluating the accuracy, completeness, and usefulness of any information, opinions, advice, or other content available through the service.
                  </p>
                </div>
              </div>

              {/* Acceptable Use */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Acceptable Use Policy</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Prohibited Activities</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Any abuse of this system, including offensive behavior or materials is strictly prohibited and may result in the suspension or removal of accounts. Prohibited activities include but are not limited to:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Harassment, bullying, or threatening behavior toward other users
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Posting or sharing offensive, discriminatory, or inappropriate content
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Attempting to hack, disrupt, or compromise the security of the platform
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Using the service for illegal activities or violating applicable laws
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Impersonating others or providing false information
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Service Availability */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Service Availability</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We do not guarantee the access of this system. At some future point, Alberta may remove parts or all of this service due to operational needs, budget constraints, or other factors beyond our control.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify, suspend, or discontinue the service at any time without prior notice. We are not liable for any inconvenience or loss resulting from service interruptions or discontinuation.
                  </p>
                </div>
              </div>

              {/* Third-Party Resources */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Third-Party Resources</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    This site links to third-party resources. We do not claim these resources as our own, or necessarily support the viewpoints or opinions of those individuals shared. External links are provided for convenience and informational purposes only.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We are not responsible for the content, accuracy, or availability of external websites or resources. Your use of third-party websites is at your own risk and subject to their respective terms and conditions.
                  </p>
                </div>
              </div>

              {/* Intellectual Property */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Intellectual Property</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Platform Content</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The content, features, and functionality of the Alberta AI Academy platform are owned by the Government of Alberta and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">User-Generated Content</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You retain ownership of content you create using the platform, but grant Alberta AI Academy a non-exclusive license to use, modify, and display such content for educational and operational purposes. You are responsible for ensuring your content does not infringe on others' intellectual property rights.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Accounts */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">User Accounts and Responsibilities</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Account Security</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other security breach.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Accurate Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You agree to provide accurate, current, and complete information during registration and to update such information as necessary to maintain its accuracy and completeness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimers and Limitations */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Disclaimers and Limitations of Liability</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Service Disclaimer</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure. Use of the service is at your own risk.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Limitation of Liability</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To the maximum extent permitted by law, Alberta AI Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, even if we have been advised of the possibility of such damages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Usage and Learning Analytics */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Data Usage and Learning Analytics</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may collect and analyze usage data to improve the educational experience and platform functionality. This includes learning progress, interaction patterns, and performance metrics, all handled in accordance with our Privacy Policy.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Aggregated and anonymized data may be used for research purposes to advance AI education and improve learning outcomes in the public sector.
                  </p>
                </div>
              </div>

              {/* Modifications to Terms */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Modifications to Terms</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    These terms of service are subject to change by Alberta at our discretion. We will notify users of significant changes through the platform or via email when possible.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Continued use of the service after changes have been made constitutes acceptance of the revised terms. It is your responsibility to review these terms periodically for updates.
                  </p>
                </div>
              </div>

              {/* Governing Law */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Governing Law and Jurisdiction</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms of Use are governed by and construed in accordance with the laws of the Province of Alberta and the laws of Canada applicable therein. Any disputes arising from these terms or your use of the service shall be subject to the exclusive jurisdiction of the courts of Alberta.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">Questions About These Terms?</h2>
                <p className="text-muted-foreground mb-6">
                  If you have any questions about these Terms of Use or need clarification on any provisions, please contact us:
                </p>
                <div className="space-y-3 mb-6">
                  <p className="text-muted-foreground">
                    <strong>Email:</strong> <a href="mailto:aiacademy@gov.ab.ca" className="text-primary hover:underline">aiacademy@gov.ab.ca</a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Organization:</strong> Government of Alberta, Ministry of Technology and Innovation
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="mailto:aiacademy@gov.ab.ca" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-glow"
                  >
                    Contact Alberta AI Academy
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

export default Terms;