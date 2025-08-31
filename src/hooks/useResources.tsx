import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url?: string;
  video_url?: string;
  parent_id?: string;
  level: string;
  language: string;
  status: string;
  is_active: boolean;
  stars_rating: number;
  metadata?: any;
  json_data?: any;
  created_at: string;
}

export function useResources(parentId?: string) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, [parentId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('resources')
        .select('*')
        .eq('status', 'published')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (parentId !== undefined) {
        if (parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', parentId);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  return { resources, loading, error, refetch: fetchResources };
}