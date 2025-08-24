import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Newspaper, 
  Wrench, 
  MessageSquare, 
  Settings, 
  UserCircle,
  ChevronDown,
  ChevronRight,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminMenuItem {
  title: string;
  url: string;
  icon: any;
  adminOnly?: boolean;
  children?: AdminMenuItem[];
}

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const adminMenuItems: AdminMenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Learning",
    url: "/admin/learning",
    icon: GraduationCap,
    children: [
      { title: "Learning Plans", url: "/admin/learning/plans", icon: GraduationCap },
      { title: "Modules", url: "/admin/learning/modules", icon: GraduationCap },
      { title: "Cohorts", url: "/admin/learning/cohorts", icon: Users },
    ]
  },
  {
    title: "News",
    url: "/admin/news",
    icon: Newspaper,
  },
  {
    title: "Tools",
    url: "/admin/tools",
    icon: Wrench,
  },
  {
    title: "Prompts",
    url: "/admin/prompts",
    icon: MessageSquare,
  },
  {
    title: "Setup",
    url: "/admin/setup",
    icon: Settings,
    adminOnly: true,
  },
  {
    title: "Profile",
    url: "/admin/profile",
    icon: UserCircle,
  },
];

export function AdminSidebar({ onNavigate }: AdminSidebarProps = {}) {
  const sidebarContext = useSidebar();
  const location = useLocation();
  const { isAdmin, isFacilitator } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const currentPath = location.pathname;
  const isCollapsed = sidebarContext?.state === "collapsed";
  const isMobileSheet = !sidebarContext; // No sidebar context means we're in a sheet

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (path: string) => currentPath === path;
  const isParentActive = (item: AdminMenuItem) => {
    if (item.children) {
      return item.children.some(child => currentPath.startsWith(child.url));
    }
    return currentPath === item.url;
  };

  const getNavClasses = (item: AdminMenuItem) => {
    const active = isActive(item.url) || isParentActive(item);
    return active 
      ? "bg-muted text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50";
  };

  const shouldShowItem = (item: AdminMenuItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (!isFacilitator) return false;
    return true;
  };

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  if (isMobileSheet) {
    // Mobile sheet content - simplified layout without Sidebar wrapper
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">Admin Panel</span>
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {adminMenuItems.filter(shouldShowItem).map((item) => (
              <div key={item.title}>
                {item.children ? (
                  // Parent item with children
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${getNavClasses(item)}`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {expandedItems[item.title] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Children items */}
                    {expandedItems[item.title] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.filter(shouldShowItem).map((child) => (
                          <NavLink
                            key={child.title}
                            to={child.url}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                                isActive
                                  ? "bg-muted text-primary font-medium"
                                  : "hover:bg-muted/50"
                              }`
                            }
                          >
                            <child.icon className="w-3 h-3" />
                            <span>{child.title}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular item
                  <NavLink
                    to={item.url}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md ${
                        isActive
                          ? "bg-muted text-primary font-medium"
                          : "hover:bg-muted/50"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {!isCollapsed && "Admin Panel"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.filter(shouldShowItem).map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children ? (
                    // Parent item with children
                    <div>
                      <SidebarMenuButton
                        onClick={() => toggleExpanded(item.title)}
                        className={getNavClasses(item)}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {expandedItems[item.title] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                      
                      {/* Children items */}
                      {!isCollapsed && expandedItems[item.title] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.filter(shouldShowItem).map((child) => (
                            <SidebarMenuButton key={child.title} asChild>
                              <NavLink
                                to={child.url}
                                className={({ isActive }) =>
                                  isActive
                                    ? "bg-muted text-primary font-medium text-sm border-r-2 border-primary"
                                    : "hover:bg-muted/50 text-sm"
                                }
                              >
                                <child.icon className="w-3 h-3" />
                                <span>{child.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular item
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item)}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}