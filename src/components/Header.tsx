import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header = ({ onLoginClick }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-[11px] font-bold tracking-tight text-white shadow-glow">
              AAA
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                Alberta AI Academy
              </span>
              <span className="text-[11px] text-muted-foreground">Learn. Build. Grow.</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              News
            </Link>
            <Link to="/learning-hub" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Learning Hub
            </Link>
            <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tools
            </Link>
            <Link to="/ai-mentor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              AI Mentor
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex border border-border hover:border-primary/50"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </Button>
            <Button
              size="sm"
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
              onClick={() => navigate('/ai-mentor')}
            >
              <Sparkles className="w-4 h-4" />
              Create plan
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};