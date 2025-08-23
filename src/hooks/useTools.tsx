import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  url?: string;
  cost_indicator?: string;
  stars: number;
  created_at: string;
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

  return { tools, loading, error, refetch: fetchTools };
}