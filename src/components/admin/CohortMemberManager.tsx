import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, UserPlus, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CohortMemberManagerProps {
  cohortId?: string;
  onMembersChange?: () => void;
}

export function CohortMemberManager({ cohortId, onMembersChange }: CohortMemberManagerProps) {
  const { user } = useAuth();
  const [bulkEmails, setBulkEmails] = useState('');
  const [loading, setLoading] = useState(false);
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
        .eq('cohort_id', cohortId);
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
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
        return;
      }

      const membersToInsert = emails.map(email => ({
        cohort_id: cohortId,
        email,
        enrolled_by: user.id,
        status: 'enrolled'
      }));

      const { error } = await supabase
        .from('cohort_members')
        .insert(membersToInsert);

      if (error) throw error;
      
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