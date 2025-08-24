import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LearningPlan {
  id: string;
  name: string;
  description: string;
  level: string;
  duration?: unknown;
  learning_outcomes?: string[];
  created_at: string;
  image_url?: string;
  video_url?: string;
  steps?: any;
  // Remove star_rating since it's now handled by the star_ratings table
}

export function useLearningPlans() {
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always fetch learning plans - they're now public
    fetchLearningPlans();
  }, []); // Remove user dependency

  const fetchLearningPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLearningPlans(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch learning plans');
    } finally {
      setLoading(false);
    }
  };

  return { learningPlans, loading, error, refetch: fetchLearningPlans };
}