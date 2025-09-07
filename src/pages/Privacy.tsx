import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
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
                  The Government of Alberta, Ministry of Technology and Innovation is committed to ensuring your privacy while you visit AI Academy site.
                </p>
              </div>

              {/* Standard Information Collected by Web Server */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Standard Information Collected by Web Server</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When you access this service, our web server automatically collects a limited amount of standard information essential to the operation and evaluation of the service. This includes the page from which you arrived, the date and time of your page request, the IP address your computer is using to receive information, the type and version of your browser, and the name and size of the file you request.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This information is not used to identify individuals who use the service, nor is it disclosed to other public bodies or individuals.
                  </p>
                </div>
              </div>

              {/* Collection of Personal Information */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Collection of Personal Information</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Personal information is collected directly from you when you voluntarily register for an account or interact with the service. For example, when creating an account, you will be asked to provide your name and email address.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      In accordance with Section 5(2) of the Protection of Privacy Act (POPA), we provide the following notice for the collection of your personal information:
                    </p>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-semibold mt-1">(a)</span>
                        <div>
                          <strong>Purpose:</strong> The personal information is collected to process and respond to your requests related to the service, including account creation and management.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-semibold mt-1">(b)</span>
                        <div>
                          <strong>Legal Authority:</strong> This collection is authorized under Section 4(c) of POPA, as the information relates directly to and is necessary for an operating program or activity of the Government of Alberta.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-semibold mt-1">(c)</span>
                        <div>
                          <strong>Contact Information:</strong> If you have questions about the collection of your personal information, please contact us at <a href="mailto:aiacademy@gov.ab.ca" className="text-primary hover:underline">aiacademy@gov.ab.ca</a>.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-semibold mt-1">(d)</span>
                        <div>
                          <strong>Automated System Use:</strong> The personal information, along with any content you create (such as prompts), will be input into an automated system to generate content or provide educational feedback or recommendations.
                        </div>
                      </li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      This personal information is disclosed only to authorized personnel who use it for the specified purposes. While the personal information you send is secure once it reaches the government server, it may not be secure in transit between your computer and ours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cookies */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Cookies</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      When you visit a website it may deposit a piece of data, called a web cookie, with the temporary web browser files on your computer.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      If you wish, you can change the settings on your web browser to deny cookies, or to warn you when a site is about to deposit cookies on your hard drive.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Government of Alberta websites use cookies to collect anonymous statistical information such as browser type, screen size, traffic patterns and pages visited. This information helps us provide you with better service. We do not store personal information in cookies, nor do we collect personal information from you without your knowledge, as you browse the site.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Cookies from Third Party Applications</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      This site uses a number of third party products. Read their privacy statements to find out how they track and use your information:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://www.addthis.com/privacy" className="text-primary hover:underline">AddThis privacy statement</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://www.crazyegg.com/privacy" className="text-primary hover:underline">Crazy Egg privacy statement</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://www.facebook.com/policies/cookies/" className="text-primary hover:underline">Facebook cookie policy</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://policies.google.com/privacy" className="text-primary hover:underline">Google Analytics privacy statement</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://policies.google.com/technologies/cookies" className="text-primary hover:underline">Google Ads cookie usage</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://privacy.microsoft.com/" className="text-primary hover:underline">Microsoft privacy policy</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://www.pattisonmedia.com/privacy-policy/" className="text-primary hover:underline">Pattison Media privacy policy</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://postmedia.com/privacy-statement/" className="text-primary hover:underline">Postmedia cookie policy</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://siteimprove.com/privacy/" className="text-primary hover:underline">SiteImprove privacy policy</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://truconversion.com/privacy-policy/" className="text-primary hover:underline">TruConversion privacy policy</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <a href="https://help.twitter.com/en/rules-and-policies/twitter-cookies" className="text-primary hover:underline">Twitter cookie policy</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Security</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    The Government of Alberta's computer system uses software to monitor unauthorized attempts to upload or change information, or damage the service we provide. No attempt is made to identify users or their usage patterns except during law enforcement investigations.
                  </p>
                </div>
              </div>

              {/* Data Retention and Deletion */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Data Retention and Deletion</h2>
                
                <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    In accordance with Section 6(b) of the Protection of Privacy Act (POPA), we will retain your personal information for the minimum period necessary to fulfill the purposes outlined in this Privacy Statement, and in compliance with the Government of Alberta's established Records Retention and Disposition Schedule. This schedule ensures that personal information is retained and used only to the extent required to meet our legal obligations under POPA and other applicable Alberta laws, after which it will be securely disposed of.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You may request the deletion of your account and associated data by contacting us at <a href="mailto:aiacademy@gov.ab.ca" className="text-primary hover:underline">aiacademy@gov.ab.ca</a>. We will evaluate such requests in alignment with POPA requirements and the Records Retention and Disposition Schedule, taking reasonable steps to delete your personal information from our records where permissible, except where retention is required for legal purposes under Alberta law.
                  </p>
                </div>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Your Rights</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Correction of Personal Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The Protection of Privacy Act provides the right to request correction of your personal information. Please contact us at <a href="mailto:aiacademy@gov.ab.ca" className="text-primary hover:underline">aiacademy@gov.ab.ca</a> and we will redirect your request to the office authorized to receive such a request.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/20 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Access to Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The Access to Information Act provides the right of access to information, including your own personal information. The ATI request form is available through the <a href="https://www.alberta.ca/eservices.aspx" className="text-primary hover:underline">eServices page</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">Contact Information</h2>
                <p className="text-muted-foreground mb-6">
                  If you have any questions about this Privacy Statement or the collection, use, or disclosure of your personal information, please contact us at:
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
                    Contact the Alberta AI Academy
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