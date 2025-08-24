import { useAuth } from '@/hooks/useAuth';
import { useCohortMembership } from '@/hooks/useCohortMembership';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, LogIn, Menu, X, Settings, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header = ({ onLoginClick }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin, isFacilitator } = useAuth();
  const { isInAnyCohort } = useCohortMembership();

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
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                News
              </Link>
              <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tools
              </Link>
              <Link to="/learning-hub" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Plans
              </Link>
              {user && (
                <Link to="/my-learning" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Learning
                </Link>
              )}
              {user && isInAnyCohort && (
                <Link to="/cohorts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cohorts
                </Link>
              )}
              <Link to="/ai-mentor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                AI Mentor
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <>
                  {isFacilitator && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="border border-border hover:border-primary/50"
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="border border-border hover:border-primary/50">
                        <User className="w-4 h-4" />
                        {profile?.full_name || user.email?.split('@')[0] || 'User'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="border border-border hover:border-primary/50"
                  >
                    <LogIn className="w-4 h-4" />
                    Log in
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-3">
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
        <div className="fixed inset-0 z-40 lg:hidden">
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
                to="/tools" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link 
                to="/learning-hub" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Plans
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/my-learning" 
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Learning
                  </Link>
                  {isInAnyCohort && (
                    <Link 
                      to="/cohorts" 
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Cohorts
                    </Link>
                  )}
                </>
              )}
              
              <Link 
                to="/ai-mentor" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Mentor
              </Link>
              
              <div className="pt-4 border-t border-border space-y-3">
                {user ? (
                  <>
                    {isFacilitator && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigate('/admin');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start border border-border hover:border-primary/50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    )}
                    <div className="w-full p-2 border border-border rounded-md flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{profile?.full_name || user.email?.split('@')[0] || 'User'}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start border border-border hover:border-primary/50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start border border-border hover:border-primary/50"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Log in
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};