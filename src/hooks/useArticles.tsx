import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  level: string;
  image_url?: string;
  video_url?: string;
  json_data: any;
  status: string;
  is_active: boolean;
  language: string;
}

export function useArticles() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles((data || []).map(article => ({
        ...article,
        json_data: Array.isArray(article.json_data) ? article.json_data : []
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  return { articles, loading, error, refetch: fetchArticles };
}