import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, LogIn, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header = ({ onLoginClick }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
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

            {/* Desktop Navigation */}
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

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="border border-border hover:border-primary/50"
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

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="border border-border hover:border-primary/50"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg">
            <nav className="px-4 py-6 space-y-4">
              <Link 
                to="/news" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link 
                to="/learning-hub" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Learning Hub
              </Link>
              <Link 
                to="/tools" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link 
                to="/ai-mentor" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Mentor
              </Link>
              <Link 
                to="/privacy" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Privacy
              </Link>
              
              <div className="pt-4 border-t border-border space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start border border-border hover:border-primary/50"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Log in
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
                  onClick={() => {
                    navigate('/ai-mentor');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create plan
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};