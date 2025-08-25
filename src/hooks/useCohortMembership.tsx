import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CohortMember {
  id: string;
  cohort_id: string;
  user_id?: string;
  email: string;
  status: 'enrolled' | 'pending' | 'completed' | 'dropped';
  enrolled_at: string;
  enrolled_by: string;
  cohort?: {
    id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    status: string;
    image_url?: string;
    video_url?: string;
  };
}

export function useCohortMembership() {
  const { user, profile } = useAuth();
  const [userCohorts, setUserCohorts] = useState<CohortMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchUserCohorts();
    }
  }, [user, profile]);

  const fetchUserCohorts = async () => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('cohort_members')
        .select(`
          *,
          cohort:cohorts!inner (
            id,
            name,
            description,
            start_date,
            end_date,
            status,
            image_url,
            video_url
          )
        `)
        .or(`user_id.eq.${user.id},email.eq.${profile.email}`)
        .eq('status', 'enrolled')
        .is('cohort.deleted_at', null);

      if (error) throw error;
      
      setUserCohorts((data || []) as CohortMember[]);
    } catch (error) {
      console.error('Error fetching user cohorts:', error);
      setError('Failed to load cohorts');
    } finally {
      setLoading(false);
    }
  };

  const addCohortMembers = async (cohortId: string, emails: string[]) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const membersToInsert = emails.map(email => ({
        cohort_id: cohortId,
        email: email.trim().toLowerCase(),
        enrolled_by: user.id,
        status: 'enrolled' as const
      }));

      const { error } = await supabase
        .from('cohort_members')
        .insert(membersToInsert);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error adding cohort members:', error);
      return { success: false, error: 'Failed to add members' };
    }
  };

  const removeCohortMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('cohort_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchUserCohorts(); // Refresh the list
      return { success: true, error: null };
    } catch (error) {
      console.error('Error removing cohort member:', error);
      return { success: false, error: 'Failed to remove member' };
    }
  };

  return {
    userCohorts,
    loading,
    error,
    refetch: fetchUserCohorts,
    addCohortMembers,
    removeCohortMember,
    isInAnyCohort: userCohorts.length > 0
  };
}