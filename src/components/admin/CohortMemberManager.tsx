import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, UserPlus, Mail, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CohortMemberManagerProps {
  cohortId?: string;
  onMembersChange?: () => void;
}

export function CohortMemberManager({ cohortId, onMembersChange }: CohortMemberManagerProps) {
  const { user, isFacilitator, isAdmin } = useAuth();
  const [bulkEmails, setBulkEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [members, setMembers] = useState<Array<{
    id: string;
    email: string;
    status: string;
    user_id?: string;
    enrolled_at: string;
  }>>([]);

  useEffect(() => {
    if (cohortId) {
      fetchMembers();
    }
  }, [cohortId]);

  const fetchMembers = async () => {
    if (!cohortId) return;
    
    try {
      const { data, error } = await supabase
        .from('cohort_members')
        .select('*')
        .eq('cohort_id', cohortId)
        .order('enrolled_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members');
        return;
      }
      console.log('Fetched members:', data);
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    }
  };

  const addMembers = async () => {
    if (!user || !cohortId || !bulkEmails.trim()) return;
    
    setLoading(true);
    try {
      const emails = bulkEmails
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(email => email && email.includes('@'));
      
      if (emails.length === 0) {
        toast.error('Please enter valid email addresses');
        setLoading(false);
        return;
      }

      console.log('Adding members:', emails);

      const membersToInsert = emails.map(email => ({
        cohort_id: cohortId,
        email,
        enrolled_by: user.id,
        status: 'enrolled'
      }));

      const { data, error } = await supabase
        .from('cohort_members')
        .insert(membersToInsert)
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      console.log('Insert result:', data);
      setBulkEmails('');
      await fetchMembers();
      onMembersChange?.();
      toast.success(`Added ${emails.length} member(s) to cohort`);
    } catch (error: any) {
      console.error('Error adding members:', error);
      toast.error(error.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const searchProfiles = async () => {
    if (!searchQuery.trim() || !isFacilitator) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .is('deleted_at', null)
        .limit(20);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching profiles:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const addProfileToChort = async (profileEmail: string) => {
    if (!user || !cohortId) return;
    
    try {
      // Check if already a member
      const { data: existing } = await supabase
        .from('cohort_members')
        .select('id')
        .eq('cohort_id', cohortId)
        .eq('email', profileEmail)
        .maybeSingle();
      
      if (existing) {
        toast.error('User is already a member of this cohort');
        return;
      }

      const { error } = await supabase
        .from('cohort_members')
        .insert({
          cohort_id: cohortId,
          email: profileEmail,
          enrolled_by: user.id,
          status: 'enrolled'
        });

      if (error) throw error;
      
      await fetchMembers();
      onMembersChange?.();
      toast.success('User added to cohort');
    } catch (error: any) {
      console.error('Error adding profile to cohort:', error);
      toast.error('Failed to add user to cohort');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('cohort_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchMembers();
      onMembersChange?.();
      toast.success('Member removed from cohort');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bulk-add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bulk-add">Bulk Add by Email</TabsTrigger>
          <TabsTrigger value="search-users">Search Existing Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bulk-add" className="space-y-4">
          <div>
            <Label htmlFor="bulk-emails">Add Members by Email</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Enter comma-separated email addresses to add multiple users at once
            </p>
            <Textarea
              id="bulk-emails"
              placeholder="user1@example.com, user2@example.com, user3@example.com"
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={addMembers} 
              disabled={loading || !bulkEmails.trim()}
              className="mt-2"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Adding...' : 'Add Members'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="search-users" className="space-y-4">
          {(isFacilitator || isAdmin) ? (
            <div>
              <Label htmlFor="search">Search Existing Users</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Search by name or email to find registered users
              </p>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchProfiles()}
                />
                <Button 
                  onClick={searchProfiles}
                  disabled={searchLoading || !searchQuery.trim()}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Search Results</h4>
                  {searchResults.map((profile) => (
                    <Card key={profile.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="w-8 h-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{profile.full_name || 'No name set'}</p>
                              <p className="text-sm text-muted-foreground">{profile.email}</p>
                              <Badge variant="outline" className="text-xs">
                                {profile.role}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addProfileToChort(profile.email)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add to Cohort
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Only facilitators and admins can search for existing users</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Current Members ({members.length})</h3>
        {members.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No members enrolled yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{member.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled {new Date(member.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={member.status === 'enrolled' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}