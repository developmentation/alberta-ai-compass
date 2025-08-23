
import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Newspaper, 
  Wrench, 
  BookOpen, 
  Layers, 
  Bot, 
  Users, 
  User, 
  Settings, 
  Menu, 
  X, 
  Search, 
  HelpCircle, 
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  UserPlus
} from "lucide-react";

const Admin = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", active: true },
    { icon: Newspaper, label: "News" },
    { icon: Wrench, label: "Tools" },
    { icon: BookOpen, label: "Learning Hub" },
    { icon: Layers, label: "Learning Plans" },
    { icon: Bot, label: "System Prompts" },
    { icon: Users, label: "User Management" },
    { icon: User, label: "Profile" },
  ];

  const kpiCards = [
    {
      icon: Newspaper,
      label: "News Articles",
      value: "128",
      trend: { direction: "up", value: "4.3%", period: "last 30 days" },
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: BookOpen,
      label: "Learning Modules", 
      value: "342",
      trend: { direction: "up", value: "6.8%", period: "vs. last month" },
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Users,
      label: "Total Users",
      value: "12,721", 
      trend: { direction: "up", value: "12.5%", period: "from last month" },
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      icon: Layers,
      label: "Learning Plans",
      value: "58",
      trend: { direction: "neutral", value: "0.0%", period: "this week" },
      bgColor: "bg-amber-100", 
      iconColor: "text-amber-600"
    },
    {
      icon: Bot,
      label: "System Prompts",
      value: "214",
      trend: { direction: "up", value: "2.1%", period: "last 7 days" },
      bgColor: "bg-fuchsia-100",
      iconColor: "text-fuchsia-600"
    },
    {
      icon: Wrench,
      label: "Active Tools",
      value: "31",
      trend: { direction: "down", value: "1.3%", period: "from last week" },
      bgColor: "bg-cyan-100",
      iconColor: "text-cyan-600"
    }
  ];

  const recentUpdates = [
    {
      type: "News",
      icon: Newspaper,
      title: "AI in Healthcare: Provincial Update",
      subtitle: "Editorial",
      status: "Published",
      statusColor: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
      updated: "5 minutes ago"
    },
    {
      type: "Module", 
      icon: BookOpen,
      title: "Prompt Engineering 101",
      subtitle: "Learning Hub",
      status: "In Review",
      statusColor: "bg-amber-50 text-amber-700 ring-amber-200/70",
      updated: "23 minutes ago"
    },
    {
      type: "Plan",
      icon: Layers,
      title: "Data Science Foundations Path",
      subtitle: "Learning Plans",
      status: "Draft",
      statusColor: "bg-blue-50 text-blue-700 ring-blue-200/70", 
      updated: "1 hour ago"
    },
    {
      type: "Prompt",
      icon: Bot,
      title: "Onboarding Assistant v2",
      subtitle: "System Prompts",
      status: "Active",
      statusColor: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
      updated: "2 hours ago"
    }
  ];

  const quickActions = [
    { icon: Newspaper, label: "New Article" },
    { icon: BookOpen, label: "New Module" },
    { icon: Layers, label: "New Learning Plan" },
    { icon: Bot, label: "New System Prompt" },
    { icon: UserPlus, label: "Add User" }
  ];

  const recentUsers = [
    {
      name: "Jane Cooper",
      email: "jane.cooper@example.com",
      role: "Instructor",
      status: "Active",
      joined: "Today"
    },
    {
      name: "Devon Lane", 
      email: "devon.lane@example.com",
      role: "Learner",
      status: "Active",
      joined: "Yesterday"
    },
    {
      name: "Darlene Robertson",
      email: "darlene@example.com", 
      role: "Admin",
      status: "Pending",
      joined: "2 days ago"
    }
  ];

  const NavLink = ({ icon: Icon, label, active = false }) => (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </a>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 bg-card border-r border-border">
        <div className="px-6 py-5">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-md bg-gradient-primary text-white flex items-center justify-center text-sm font-semibold">
              AA
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Admin</p>
              <p className="text-base font-semibold text-foreground tracking-tight">
                Alberta AI Academy
              </p>
            </div>
          </div>
        </div>
        <div className="px-6">
          <div className="border-t border-border"></div>
        </div>
        <nav className="px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={item.active}
            />
          ))}
        </nav>

        <div className="mt-auto px-6 py-5 border-t border-border">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">Alex Morgan</p>
              <p className="text-xs font-medium text-muted-foreground">Super Admin</p>
            </div>
            <button className="ml-auto inline-flex items-center justify-center rounded-md p-2 hover:bg-muted text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileNavOpen(false)}
          ></div>
          <aside className="absolute inset-y-0 left-0 w-72 bg-card border-r border-border p-4">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-gradient-primary text-white flex items-center justify-center text-xs font-semibold">
                  AA
                </div>
                <span className="ml-3 text-sm font-semibold text-foreground">
                  Alberta AI Academy
                </span>
              </div>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-md p-2 hover:bg-muted text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={item.active}
                />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="px-4 md:px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-2xl tracking-tight font-semibold text-foreground">
              Overview
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                <HelpCircle className="h-4 w-4" />
                Help
              </button>
              <button className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {kpiCards.map((card, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-5">
                <div className="flex items-center">
                  <div className={`p-2.5 rounded-md ${card.bgColor} ${card.iconColor}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className="text-3xl tracking-tight font-semibold text-foreground">
                      {card.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`inline-flex items-center ${
                    card.trend.direction === "up" 
                      ? "text-emerald-600" 
                      : card.trend.direction === "down" 
                      ? "text-rose-600" 
                      : "text-muted-foreground"
                  }`}>
                    {card.trend.direction === "up" && <TrendingUp className="h-4 w-4 mr-1" />}
                    {card.trend.direction === "down" && <TrendingDown className="h-4 w-4 mr-1" />}
                    {card.trend.direction === "neutral" && <Minus className="h-4 w-4 mr-1" />}
                    {card.trend.value}
                  </span>
                  <span className="text-muted-foreground ml-2">{card.trend.period}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Updates */}
            <div className="xl:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Updates</h2>
                <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="border-t border-border"></div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                        Type
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                        Title
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                        Updated
                      </th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {recentUpdates.map((update, index) => (
                      <tr key={index}>
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 text-sm text-foreground">
                            <update.icon className="h-4 w-4 text-muted-foreground" />
                            {update.type}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-foreground">{update.title}</div>
                          <div className="text-xs text-muted-foreground">{update.subtitle}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ${update.statusColor}`}>
                            {update.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{update.updated}</td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-primary hover:text-primary/80 text-sm font-medium">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border border-border">
              <div className="px-5 py-4">
                <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create content and manage your academy faster.
                </p>
              </div>
              <div className="border-t border-border"></div>
              <div className="p-4 space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full inline-flex items-center justify-between rounded-md border border-border px-3.5 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    <span className="inline-flex items-center gap-2 text-foreground">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="mt-8 bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1">
                Manage users
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="border-t border-border"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      User
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      Role
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      Joined
                    </th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {recentUsers.map((user, index) => (
                    <tr key={index}>
                      <td className="px-5 py-4">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-muted"></div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">{user.role}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ${
                          user.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
                            : "bg-amber-50 text-amber-700 ring-amber-200/70"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{user.joined}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 text-sm font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
