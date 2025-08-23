import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Prompt {
  id: string;
  name: string;
  description: string;
  purpose: string;
  sample_output?: string;
  stars: number;
  sector_tags?: any;
  created_at: string;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompt_library')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  return { prompts, loading, error, refetch: fetchPrompts };
}