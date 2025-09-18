import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CohortAssignment {
  id: string;
  cohort_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AssignmentSubmission {
  user_id: string;
  user_name?: string;
  user_email?: string;
  assignment_count: number;
  assignments: CohortAssignment[];
}

export const useCohortAssignments = (cohortId: string) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<CohortAssignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'facilitator';

  // Fetch user's own assignments
  const fetchUserAssignments = async () => {
    if (!user || !cohortId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cohort_assignments')
        .select('*')
        .eq('cohort_id', cohortId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all submissions (admin/facilitator only)
  const fetchAllSubmissions = async () => {
    if (!user || !cohortId || !isAdmin) return;

    setLoading(true);
    try {
      // Get all assignments for this cohort
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('cohort_assignments')
        .select('*')
        .eq('cohort_id', cohortId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Get unique user IDs
      const userIds = [...new Set((assignmentsData || []).map(a => a.user_id))];
      
      // Get user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by user_id
      const profileMap = new Map();
      (profilesData || []).forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Group by user
      const submissionMap = new Map<string, AssignmentSubmission>();
      
      (assignmentsData || []).forEach((assignment: any) => {
        const userId = assignment.user_id;
        const profile = profileMap.get(userId);
        
        if (!submissionMap.has(userId)) {
          submissionMap.set(userId, {
            user_id: userId,
            user_name: profile?.full_name || 'Unknown User',
            user_email: profile?.email || '',
            assignment_count: 0,
            assignments: []
          });
        }
        
        const submission = submissionMap.get(userId)!;
        submission.assignment_count++;
        submission.assignments.push(assignment);
      });

      setAllSubmissions(Array.from(submissionMap.values()));
    } catch (error) {
      console.error('Error fetching all submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload file and create assignment
  const uploadAssignment = async (
    file: File,
    name: string,
    description?: string
  ): Promise<boolean> => {
    if (!user || !cohortId) return false;

    setUploading(true);
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('cohort-assignments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create assignment record via edge function
      const { data, error } = await supabase.functions.invoke('cohort-assignments', {
        body: {
          cohort_id: cohortId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
          name,
          description
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment uploaded successfully',
      });

      // Refresh assignments
      await fetchUserAssignments();
      if (isAdmin) {
        await fetchAllSubmissions();
      }

      return true;
    } catch (error: any) {
      console.error('Error uploading assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload assignment',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('cohort-assignments', {
        body: { assignment_id: assignmentId }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment deleted successfully',
      });

      // Refresh assignments
      await fetchUserAssignments();
      if (isAdmin) {
        await fetchAllSubmissions();
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete assignment',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get download URL for file
  const getDownloadUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('cohort-assignments')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user && cohortId) {
      fetchUserAssignments();
      if (isAdmin) {
        fetchAllSubmissions();
      }
    }
  }, [user, cohortId, isAdmin]);

  return {
    assignments,
    allSubmissions,
    loading,
    uploading,
    isAdmin,
    uploadAssignment,
    deleteAssignment,
    getDownloadUrl,
    refreshAssignments: fetchUserAssignments,
    refreshAllSubmissions: fetchAllSubmissions
  };
};