import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  CheckCircle, 
  PlayCircle, 
  Bookmark, 
  Star, 
  Award,
  ArrowLeft,
  Target,
  TrendingUp
} from "lucide-react";

const Plan = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock plan data - in real app this would come from API
  const mockPlans = {
    "1": {
      id: "1",
      title: "Prompt Engineering Foundations",
      description: "Master the art of crafting effective prompts for various AI models and use cases. Build core intuition for LLMs, embeddings, and prompt design with curated readings and hands-on projects.",
      level: "Beginner",
      duration: "4 weeks",
      steps: 10,
      format: "Guided + Self-serve",
      certification: "Verified Certificate",
      satisfaction: "4.9/5",
      learners: "18.2k",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
      instructor: {
        name: "Dr. Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
        title: "AI Research Lead"
      },
      outcomes: [
        "Clear understanding of prompt engineering principles",
        "Ability to craft effective prompts for different use cases",
        "Knowledge of prompt evaluation and optimization techniques",
        "Hands-on experience with popular AI models"
      ],
      weeks: [
        {
          week: 1,
          title: "Fundamentals & Setup",
          description: "Introduction to prompt engineering concepts and environment setup",
          topics: ["What is prompt engineering?", "LLM basics", "Tool setup", "First prompts"],
          hours: "5-6 hours",
          materials: 3
        },
        {
          week: 2,
          title: "Prompt Patterns & Techniques",
          description: "Learn structured patterns and advanced prompting techniques",
          topics: ["Chain-of-thought", "Few-shot learning", "Role-based prompts", "System messages"],
          hours: "6-7 hours",
          materials: 4
        },
        {
          week: 3,
          title: "Evaluation & Optimization",
          description: "Methods for testing and improving prompt performance",
          topics: ["Evaluation metrics", "A/B testing", "Prompt iteration", "Safety considerations"],
          hours: "5-6 hours",
          materials: 3
        },
        {
          week: 4,
          title: "Real-world Applications",
          description: "Apply your skills to practical projects and use cases",
          topics: ["Business applications", "Final project", "Best practices", "Next steps"],
          hours: "7-8 hours",
          materials: 4
        }
      ],
      references: [
        { title: "The Prompt Engineering Guide", type: "article" },
        { title: "Advanced Prompting Techniques", type: "video" },
        { title: "LLM Evaluation Methods", type: "tutorial" },
        { title: "Prompt Safety & Ethics", type: "article" }
      ]
    },
    "2": {
      id: "2",
      title: "Build Retrieval-Augmented Generation",
      description: "Index, embed, and ground responses with verifiable sources. Learn to build RAG systems that provide accurate, contextual responses.",
      level: "Intermediate",
      duration: "3 weeks",
      steps: 8,
      format: "Project-based",
      certification: "Portfolio Project",
      satisfaction: "4.8/5",
      learners: "12.5k",
      image: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80",
      instructor: {
        name: "Alex Rodriguez",
        avatar: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=80&q=80",
        title: "ML Engineering Manager"
      },
      outcomes: [
        "Build a complete RAG system from scratch",
        "Understand vector databases and embeddings",
        "Implement retrieval and ranking strategies",
        "Deploy and monitor RAG applications"
      ],
      weeks: [
        {
          week: 1,
          title: "RAG Architecture & Embeddings",
          description: "Understanding RAG systems and working with embeddings",
          topics: ["RAG overview", "Vector embeddings", "Similarity search", "Embedding models"],
          hours: "8-10 hours",
          materials: 5
        },
        {
          week: 2,
          title: "Vector Databases & Retrieval",
          description: "Implementing storage and retrieval components",
          topics: ["Vector databases", "Indexing strategies", "Retrieval algorithms", "Ranking methods"],
          hours: "10-12 hours",
          materials: 6
        },
        {
          week: 3,
          title: "Integration & Deployment",
          description: "Building complete RAG applications and deployment",
          topics: ["RAG pipeline", "API integration", "Monitoring", "Production considerations"],
          hours: "12-15 hours",
          materials: 7
        }
      ],
      references: [
        { title: "Vector Databases: A Practical Guide", type: "guide" },
        { title: "RAG Implementation Tutorial", type: "tutorial" },
        { title: "Embedding Model Comparison", type: "research" },
        { title: "Production RAG Systems", type: "case-study" }
      ]
    },
    "3": {
      id: "3",
      title: "Responsible AI & Data Ethics",
      description: "Fairness, privacy, and risk mitigation in real deployments. Understand the ethical implications and best practices for AI development.",
      level: "Advanced",
      duration: "2 weeks",
      steps: 6,
      format: "Case Studies",
      certification: "Ethics Certificate",
      satisfaction: "4.9/5",
      learners: "8.7k",
      image: "https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=1080&q=80",
      instructor: {
        name: "Prof. Maria Santos",
        avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&q=80",
        title: "AI Ethics Researcher"
      },
      outcomes: [
        "Understand AI bias and fairness principles",
        "Implement privacy-preserving techniques",
        "Design ethical AI governance frameworks",
        "Navigate regulatory compliance requirements"
      ],
      weeks: [
        {
          week: 1,
          title: "Ethics Foundations & Bias",
          description: "Core principles of AI ethics and bias detection",
          topics: ["AI ethics principles", "Bias types", "Fairness metrics", "Detection methods"],
          hours: "6-8 hours",
          materials: 4
        },
        {
          week: 2,
          title: "Privacy & Governance",
          description: "Privacy techniques and governance frameworks",
          topics: ["Differential privacy", "Federated learning", "Governance models", "Compliance"],
          hours: "8-10 hours",
          materials: 5
        }
      ],
      references: [
        { title: "Fairness in Machine Learning", type: "research" },
        { title: "Privacy-Preserving AI", type: "guide" },
        { title: "AI Governance Framework", type: "whitepaper" },
        { title: "Regulatory Compliance Guide", type: "documentation" }
      ]
    }
  };

  useEffect(() => {
    if (planId && mockPlans[planId as keyof typeof mockPlans]) {
      setPlan(mockPlans[planId as keyof typeof mockPlans]);
      // Mock progress - in real app this would come from user data
      setProgress(Math.floor(Math.random() * 60) + 10);
    }
  }, [planId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header onLoginClick={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
            <p className="text-muted-foreground mb-6">The learning plan you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/learning-hub')}>
              Back to Learning Hub
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => {}} />

      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-primary-glow/20 blur-3xl rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Back Navigation */}
        <section className="py-6 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="hover:bg-card/60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Hub
            </Button>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-card/60 backdrop-blur-xl border border-border shadow-elegant p-8 md:p-14">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex -space-x-2">
                      <img src={plan.instructor.avatar} className="w-8 h-8 rounded-full border-2 border-background object-cover" alt="" />
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold">{plan.learners}</span> learners enrolled
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-bold mb-6">
                    {plan.title}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl mb-8">
                    {plan.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      {plan.satisfaction} satisfaction
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      {plan.certification}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="border border-border hover:border-primary/50"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  </div>
                </div>

                {/* Visual Card */}
                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl h-80 sm:h-[28rem] border border-border bg-gradient-to-br from-card to-card-hover shadow-2xl">
                    <img src={plan.image} alt={plan.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-subtle" />

                    <div className="absolute top-4 left-4 right-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-white">
                          <img src={plan.instructor.avatar} className="w-7 h-7 rounded-full border-2 border-white" alt="" />
                          <span className="text-xs">{plan.instructor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2 backdrop-blur transition">
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2 backdrop-blur transition">
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-white border border-white/20">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress: Week {Math.ceil((progress / 100) * plan.weeks.length)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {plan.duration}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Stat */}
                  <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Completion Rate</p>
                        <p className="text-xs text-muted-foreground">87% finish</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Highlights */}
              <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Timeline</span>
                  <span className="text-lg font-semibold">{plan.duration}</span>
                  <span className="text-xs text-muted-foreground mt-1">Self-paced</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="text-lg font-semibold">{plan.level}</span>
                  <span className="text-xs text-muted-foreground mt-1">Skill level</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Format</span>
                  <span className="text-lg font-semibold">{plan.format}</span>
                  <span className="text-xs text-muted-foreground mt-1">Learning style</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10 px-6 py-8 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Certification</span>
                  <span className="text-lg font-semibold">Verified</span>
                  <span className="text-xs text-muted-foreground mt-1">Credential</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Breakdown */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold tracking-tight mb-8">Weekly Breakdown</h2>
                <div className="space-y-6">
                  {plan.weeks.map((week: any, index: number) => (
                    <div key={week.week} className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 hover:bg-card-hover transition-all duration-500 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            Week {week.week}
                          </Badge>
                          <h3 className="text-xl font-semibold">{week.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {week.hours}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{week.description}</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Topics Covered</h4>
                          <ul className="space-y-1">
                            {week.topics.map((topic: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Materials</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            {week.materials} resources included
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Learning Outcomes */}
                <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Learning Outcomes
                  </h3>
                  <ul className="space-y-3">
                    {plan.outcomes.map((outcome: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* References */}
                <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    References
                  </h3>
                  <ul className="space-y-3">
                    {plan.references.map((ref: any, index: number) => (
                      <li key={index} className="text-sm">
                        <a href="#" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {ref.title}
                          <Badge variant="outline" className="text-xs">{ref.type}</Badge>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructor */}
                <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6">
                  <h3 className="text-xl font-semibold mb-4">Instructor</h3>
                  <div className="flex items-center gap-3">
                    <img src={plan.instructor.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div>
                      <div className="font-medium">{plan.instructor.name}</div>
                      <div className="text-sm text-muted-foreground">{plan.instructor.title}</div>
                    </div>
                  </div>
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

export default Plan;