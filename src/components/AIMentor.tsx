import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AIMentorChat } from './AIMentorChat';
import { 
  MessageCircle, 
  Target, 
  BookOpen, 
  Brain,
  Lightbulb,
  Users,
  Zap
} from 'lucide-react';

interface AIMentorProps {
  onLoginClick: () => void;
}

export function AIMentor({ onLoginClick }: AIMentorProps) {
  const handleContentOpen = (content: any) => {
    // You can customize this to open content in a modal or navigate to a specific page
    console.log('Opening content:', content);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Main Chat Interface */}
      <Card className="h-[600px]">
        <AIMentorChat onContentOpen={handleContentOpen} />
      </Card>

      {/* AI Mentor Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get personalized learning recommendations based on your questions. Our AI analyzes your needs and suggests the most relevant courses, tools, and resources.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-500" />
              Curated Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access our extensive library of learning modules, news articles, AI tools, and prompts, all carefully curated and kept up-to-date.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-purple-500" />
              AI-Powered Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chat with our AI mentor powered by advanced language models. Get instant answers, explanations, and learning path suggestions.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-red-500" />
              Personalized Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive learning recommendations tailored to your specific goals, skill level, and interests. Every suggestion is contextual and relevant.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Instant Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click on recommended content to access it immediately. No need to search through catalogs - everything is at your fingertips.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-indigo-500" />
              Continuous Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your chat history is saved, so you can continue conversations and build on previous learning sessions. Track your progress over time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}