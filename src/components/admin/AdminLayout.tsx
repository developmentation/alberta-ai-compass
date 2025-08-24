import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Admin Header with Mobile Trigger */}
          <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Sidebar Trigger - Only visible on mobile */}
                  <SidebarTrigger className="lg:hidden border border-border hover:border-primary/50 rounded-md p-2">
                    <Menu className="h-4 w-4" />
                  </SidebarTrigger>
                  
                  {/* Brand */}
                  <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-[11px] font-bold tracking-tight text-white shadow-glow">
                      AAA
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                        Alberta AI Academy
                      </span>
                      <span className="text-[11px] text-muted-foreground">Admin Panel</span>
                    </div>
                  </Link>
                </div>

                {/* Admin Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  Admin Mode
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}