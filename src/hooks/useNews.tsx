import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  level: string;
  image_url?: string;
  video_url?: string;
  status: string;
  is_active: boolean;
  metadata?: any;
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  return { news, loading, error, refetch: fetchNews };
}