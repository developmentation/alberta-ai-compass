import { Button } from "@/components/ui/button";
import { Sparkles, LogIn } from "lucide-react";

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header = ({ onLoginClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-[11px] font-bold tracking-tight text-white shadow-glow">
              AAA
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                Alberta AI Academy
              </span>
              <span className="text-[11px] text-muted-foreground">Learn. Build. Grow.</span>
            </div>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              News
            </a>
            <a href="#hub" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Learning Hub
            </a>
            <a href="#tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tools
            </a>
            <a href="#mentor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              AI Mentor
            </a>
            <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick}
              className="hidden sm:inline-flex border border-border hover:border-primary/50"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </Button>
            <Button
              size="sm"
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
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