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
    console.log('useLearningPlans: Starting fetch...');
    fetchLearningPlans();
  }, []); // Remove user dependency

  const fetchLearningPlans = async () => {
    try {
      setLoading(true);
      console.log('useLearningPlans: Fetching from database...');
      const { data, error } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      console.log('useLearningPlans: Database response:', { data: data?.length, error });

      if (error) throw error;
      setLearningPlans(data || []);
      console.log('useLearningPlans: Successfully loaded', data?.length || 0, 'plans');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch learning plans';
      console.error('useLearningPlans: Error fetching plans:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('useLearningPlans: Loading complete');
    }
  };

  return { learningPlans, loading, error, refetch: fetchLearningPlans };
}