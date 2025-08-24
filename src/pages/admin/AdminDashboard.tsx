import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, Newspaper, Wrench, MessageSquare } from "lucide-react";

interface PlatformStats {
  total_users: number;
  total_plans: number;
  total_news: number;
  total_resources: number;
  total_tools: number;
  total_prompts: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Check if user is admin by trying to call the admin function
        const { data, error } = await supabase.rpc('get_platform_statistics');
        
        if (error) {
          console.error('Error fetching platform statistics:', error);
          setIsAdmin(false);
        } else if (data && data.length > 0) {
          setStats(data[0]);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Total Users",
      description: "Registered users on the platform",
      value: stats?.total_users || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Learning Plans",
      description: "Available learning plans",
      value: stats?.total_plans || 0,
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      title: "News Items",
      description: "Published news articles",
      value: stats?.total_news || 0,
      icon: Newspaper,
      color: "text-purple-600",
    },
    {
      title: "Tools",
      description: "Available tools and resources",
      value: stats?.total_tools || 0,
      icon: Wrench,
      color: "text-orange-600",
    },
    {
      title: "Prompts",
      description: "Prompt library entries",
      value: stats?.total_prompts || 0,
      icon: MessageSquare,
      color: "text-pink-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Alberta AI Academy administration panel.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-muted h-8 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Alberta AI Academy administration panel.
        </p>
      </div>

      {isAdmin && stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              You have facilitator access to manage content and resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the sidebar to navigate to different sections and manage learning content, 
              news, tools, and prompts.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              • Create new learning plans and modules
            </div>
            <div className="text-sm text-muted-foreground">
              • Publish news and updates
            </div>
            <div className="text-sm text-muted-foreground">
              • Manage tools and resources
            </div>
            <div className="text-sm text-muted-foreground">
              • Curate prompt library
            </div>
            {isAdmin && (
              <div className="text-sm text-muted-foreground">
                • Configure system settings and API keys
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity tracking will be implemented here to show recent content updates, 
              user registrations, and system changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}