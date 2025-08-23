import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserCompletion {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  completed_at: string;
  score?: number;
  metadata?: any;
}

export function useCompletions(contentId?: string, contentType?: string) {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<UserCompletion[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompletions();
    }
  }, [user]);

  useEffect(() => {
    if (contentId && contentType && completions.length > 0) {
      const completion = completions.find(
        c => c.content_id === contentId && c.content_type === contentType
      );
      setIsCompleted(!!completion);
    }
  }, [contentId, contentType, completions]);

  const fetchCompletions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_completions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  const markAsCompleted = async (
    targetContentId: string, 
    targetContentType: string, 
    score?: number, 
    metadata?: any
  ) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_completions')
        .upsert({
          user_id: user.id,
          content_id: targetContentId,
          content_type: targetContentType,
          score: score,
          metadata: metadata,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchCompletions();
    } catch (error) {
      console.error('Error marking as completed:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeCompletion = async (targetContentId: string, targetContentType: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', targetContentId)
        .eq('content_type', targetContentType);

      if (error) throw error;
      await fetchCompletions();
    } catch (error) {
      console.error('Error removing completion:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    completions,
    isCompleted: contentId && contentType ? isCompleted : false,
    markAsCompleted,
    removeCompletion,
    loading,
    refetch: fetchCompletions
  };
}