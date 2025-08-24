import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CohortDiscussion {
  id: string;
  cohort_id: string;
  user_id: string;
  message: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user?: {
    full_name?: string;
    email: string;
  };
  replies?: CohortDiscussion[];
}

export function useCohortDiscussions(cohortId?: string, isActive: boolean = false) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<CohortDiscussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    if (!cohortId) return;
    
    setLoading(true);
    try {
      // Fetch discussions with user profiles
      const { data, error } = await supabase
        .from('cohort_discussions')
        .select(`
          id,
          cohort_id,
          user_id,
          message,
          parent_id,
          created_at,
          updated_at,
          deleted_at,
          profiles!user_id (
            full_name,
            email
          )
        `)
        .eq('cohort_id', cohortId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize discussions in threaded format
      const discussionsMap = new Map<string, CohortDiscussion>();
      const topLevel: CohortDiscussion[] = [];

      (data || []).forEach((item: any) => {
        const discussion: CohortDiscussion = {
          id: item.id,
          cohort_id: item.cohort_id,
          user_id: item.user_id,
          message: item.message,
          parent_id: item.parent_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at,
          user: item.profiles ? {
            full_name: item.profiles.full_name,
            email: item.profiles.email
          } : undefined,
          replies: []
        };

        discussionsMap.set(item.id, discussion);

        if (!item.parent_id) {
          topLevel.push(discussion);
        }
      });

      // Link replies to parent discussions
      discussionsMap.forEach((discussion) => {
        if (discussion.parent_id) {
          const parent = discussionsMap.get(discussion.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(discussion);
          }
        }
      });

      setDiscussions(topLevel);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  }, [cohortId]);

  useEffect(() => {
    if (cohortId) {
      fetchDiscussions();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('cohort-discussions-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'cohort_discussions',
            filter: `cohort_id=eq.${cohortId}`
          },
          (payload) => {
            console.log('New discussion message:', payload);
            fetchDiscussions(); // Refetch to get complete data with user profiles
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'cohort_discussions',
            filter: `cohort_id=eq.${cohortId}`
          },
          (payload) => {
            console.log('Updated discussion message:', payload);
            fetchDiscussions(); // Refetch to get updated data
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'cohort_discussions',
            filter: `cohort_id=eq.${cohortId}`
          },
          (payload) => {
            console.log('Deleted discussion message:', payload);
            fetchDiscussions(); // Refetch to remove deleted items
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [cohortId]);

  // Add polling when discussion tab is active
  useEffect(() => {
    if (!cohortId || !isActive) return;

    const interval = setInterval(() => {
      console.log('Polling for new discussions...');
      fetchDiscussions();
    }, 5000);

    return () => clearInterval(interval);
  }, [cohortId, isActive, fetchDiscussions]);

  const createDiscussion = async (message: string, parentId?: string) => {
    if (!user || !cohortId || !message.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('cohort_discussions')
        .insert({
          cohort_id: cohortId,
          user_id: user.id,
          message: message.trim(),
          parent_id: parentId || null
        });

      if (error) throw error;
      
      await fetchDiscussions();
      return true;
    } catch (error) {
      console.error('Error creating discussion:', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateDiscussion = async (discussionId: string, message: string) => {
    if (!user || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('cohort_discussions')
        .update({ 
          message: message.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', discussionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchDiscussions();
      return true;
    } catch (error) {
      console.error('Error updating discussion:', error);
      return false;
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cohort_discussions')
        .update({ 
          deleted_at: new Date().toISOString()
        })
        .eq('id', discussionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchDiscussions();
      return true;
    } catch (error) {
      console.error('Error deleting discussion:', error);
      return false;
    }
  };

  return {
    discussions,
    loading,
    submitting,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    refetch: fetchDiscussions
  };
}