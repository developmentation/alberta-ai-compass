import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Shield, Users, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetModal } from "@/components/admin/PasswordResetModal";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  organization: string | null;
  department: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    role: "" as "public" | "government" | "facilitator" | "admin",
    is_active: true,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      role: user.role as "public" | "government" | "facilitator" | "admin",
      is_active: user.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: formData.role,
          is_active: formData.is_active,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-500 text-white",
      facilitator: "bg-blue-500 text-white",
      government: "bg-green-500 text-white",
      public: "bg-gray-500 text-white",
    };
    return colors[role as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only administrators can access user management.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">User Management</h1>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{roleStats.admin || 0}</div>
              <p className="text-sm text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{roleStats.facilitator || 0}</div>
              <p className="text-sm text-muted-foreground">Facilitators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{users.filter(u => u.is_active).length}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || "No name"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadge(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{user.organization || "N/A"}</div>
                      {user.department && (
                        <div className="text-xs text-muted-foreground">
                          {user.department}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString()
                      : "Never"
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResetPasswordUser(user);
                          setIsResetModalOpen(true);
                        }}
                        title="Reset password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              {searchTerm ? "No users match your search." : "No users found."}
            </div>
          )}
        </Card>

        {/* Password Reset Modal */}
        <PasswordResetModal
          isOpen={isResetModalOpen}
          onClose={() => {
            setIsResetModalOpen(false);
            setResetPasswordUser(null);
          }}
          user={resetPasswordUser}
        />

        {/* Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user role and status
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User</label>
                  <div className="p-2 border rounded bg-muted/50">
                    <div className="font-medium">{editingUser.full_name || "No name"}</div>
                    <div className="text-sm text-muted-foreground">{editingUser.email}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as "public" | "government" | "facilitator" | "admin" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="facilitator">Facilitator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.is_active.toString()}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update User
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}