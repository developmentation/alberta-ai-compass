import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, MessageCircle, Send, Compass, Save, Download } from "lucide-react";

interface AIMentorProps {
  onLoginClick: () => void;
}

export const AIMentor = ({ onLoginClick }: AIMentorProps) => {
  const [chatInput, setChatInput] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content: "Hi! Tell me your goal and timeline. I can propose a step-by-step plan with outcomes."
    }
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessages = [
      ...messages,
      { type: "user", content: chatInput },
      { type: "ai", content: "That's a great question! I'd be happy to help you with that. Let me suggest some relevant resources and next steps." }
    ];
    
    setMessages(newMessages);
    setChatInput("");
  };

  const handleGeneratePlan = () => {
    if (!planGoal.trim()) return;
    
    const mockPlan = {
      goal: planGoal,
      duration: "4 weeks",
      level: "Beginner",
      weeks: [
        {
          week: 1,
          title: "Foundations",
          description: "Get familiar with core concepts and terminology",
          tasks: ["Read introductory articles", "Complete basic exercises"]
        },
        {
          week: 2,
          title: "Hands-on Practice",
          description: "Apply concepts through practical exercises",
          tasks: ["Build first project", "Practice with tools"]
        },
        {
          week: 3,
          title: "Advanced Concepts",
          description: "Dive deeper into specialized topics",
          tasks: ["Advanced tutorials", "Case studies"]
        },
        {
          week: 4,
          title: "Real-world Application",
          description: "Create portfolio project and review progress",
          tasks: ["Final project", "Skill assessment"]
        }
      ]
    };
    
    setGeneratedPlan(mockPlan);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Chat */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold tracking-tight">AI Mentor</h3>
                <p className="text-xs text-muted-foreground">Ask for guidance, resources, or plan improvements.</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLoginClick}
              className="border border-border hover:border-primary/50"
            >
              Log in
            </Button>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {message.type === 'ai' ? 'Mentor' : 'You'}
                  </div>
                  <div className="text-sm text-foreground">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about a topic, goal, or resource…"
                className="flex-1 bg-input border-border"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                Send
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Plan Builder */}
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card/60 to-card/40 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">Build your learning plan</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Describe your goal and we'll generate a beautiful plan with timelines and outcomes, referencing our materials.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Goal</label>
              <Input
                value={planGoal}
                onChange={(e) => setPlanGoal(e.target.value)}
                placeholder="e.g., Become confident with LLMs for product work"
                className="bg-input border-border"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Duration</label>
                <Select defaultValue="4-weeks">
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="4-weeks">4 weeks</SelectItem>
                    <SelectItem value="6-weeks">6 weeks</SelectItem>
                    <SelectItem value="8-weeks">8 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Level</label>
                <Select defaultValue="beginner">
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGeneratePlan}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
            >
              Generate plan
              <Send className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Log in to save and track progress.
            </p>
          </div>
        </div>
      </div>

      {/* Generated Plan */}
      {generatedPlan && (
        <div className="mt-12 animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Your Learning Plan</h3>
              <p className="text-muted-foreground">
                {generatedPlan.goal} • {generatedPlan.duration} • {generatedPlan.level}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost"
                className="border border-border hover:border-primary/50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {generatedPlan.weeks.map((week: any, index: number) => (
              <div
                key={week.week}
                className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 hover:bg-card-hover transition-all duration-500 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-sm font-semibold text-primary mb-2">
                  Week {week.week}
                </div>
                <h4 className="font-bold mb-2">{week.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{week.description}</p>
                <ul className="space-y-1">
                  {week.tasks.map((task: string, taskIndex: number) => (
                    <li key={taskIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};