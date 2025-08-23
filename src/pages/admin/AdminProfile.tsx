import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Building, Users, Save } from "lucide-react";

export function AdminProfile() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    organization: profile?.organization || "",
    department: profile?.department || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          organization: formData.organization || null,
          department: formData.department || null,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // The profile will be automatically updated through the auth context
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-500 text-white",
      facilitator: "bg-blue-500 text-white",
      government: "bg-green-500 text-white",
      public: "bg-gray-500 text-white",
    };
    const labels = {
      admin: "Administrator",
      facilitator: "Facilitator",
      government: "Government",
      public: "Public User",
    };
    return { 
      color: colors[role as keyof typeof colors] || "bg-gray-500 text-white",
      label: labels[role as keyof typeof labels] || role 
    };
  };

  const roleBadge = getRoleBadge(profile?.role || "");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account details
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <h3 className="font-semibold text-lg">
                  {profile?.full_name || "No name set"}
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className={`mt-2 ${roleBadge.color}`}>
                  {roleBadge.label}
                </Badge>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                
                {profile?.organization && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-medium">{profile.organization}</span>
                  </div>
                )}
                
                {profile?.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{profile.department}</span>
                  </div>
                )}

              <div className="text-xs text-muted-foreground pt-2">
                Account created: {new Date().toLocaleDateString()}
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization</label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Enter your organization"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter your department"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Account Status</div>
                <Badge variant={profile?.is_active ? "default" : "secondary"}>
                  {profile?.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">User Role</div>
                <Badge className={roleBadge.color}>
                  {roleBadge.label}
                </Badge>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">User ID</div>
                <code className="text-xs bg-muted px-2 py-1 rounded">{user?.id}</code>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email Verified</div>
                <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                  {user?.email_confirmed_at ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions & Access */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions & Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Current permissions:</span>
                <div className="mt-2 space-y-1">
                  {profile?.role === "admin" && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Full administrative access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>User management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>System configuration</span>
                      </div>
                    </>
                  )}
                  
                  {(profile?.role === "facilitator" || profile?.role === "admin") && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Content management (News, Tools, Learning Plans)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Prompt library access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Cohort management</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>Platform access and learning</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}