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
      setError(null);
      console.log('useNews: Fetching from database...');
      
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      console.log('useNews: Database response:', { data: data?.length, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      setNews(data || []);
      console.log('useNews: Successfully loaded', data?.length || 0, 'news items');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news';
      console.error('useNews: Error fetching news:', errorMessage);
      setError(errorMessage);
      setNews([]); // Set empty array on error
    } finally {
      setLoading(false);
      console.log('useNews: Loading complete');
    }
  };

  return { news, loading, error, refetch: fetchNews };
}