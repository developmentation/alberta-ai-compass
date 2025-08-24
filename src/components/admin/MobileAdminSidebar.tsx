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

interface AdminMenuItem {
  title: string;
  url: string;
  icon: any;
  adminOnly?: boolean;
  children?: AdminMenuItem[];
}

interface MobileAdminSidebarProps {
  onNavigate: () => void;
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

export function MobileAdminSidebar({ onNavigate }: MobileAdminSidebarProps) {
  const location = useLocation();
  const { isAdmin, isFacilitator } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const currentPath = location.pathname;

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
      ? "bg-muted text-primary font-medium" 
      : "hover:bg-muted/50";
  };

  const shouldShowItem = (item: AdminMenuItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (!isFacilitator) return false;
    return true;
  };

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
                          onClick={onNavigate}
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
                  onClick={onNavigate}
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