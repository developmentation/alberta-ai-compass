import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRatings } from '@/hooks/useRatings';
import { useCompletions } from '@/hooks/useCompletions';

export interface MyLearningStats {
  bookmarked: number;
  completed: number;
  rated: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'learning_plan' | 'module' | 'news' | 'tool' | 'prompt_library' | 'article';
  image_url?: string;
  video_url?: string;
  created_at: string;
  rating?: number;
  completed_at?: string;
  bookmarked_at?: string;
}

export function useMyLearning() {
  const { user } = useAuth();
  const { refetch: refetchBookmarks } = useBookmarks();
  const { refetch: refetchCompletions } = useCompletions();
  
  const [stats, setStats] = useState<MyLearningStats>({
    bookmarked: 0,
    completed: 0,
    rated: 0
  });
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bookmarked' | 'completed' | 'rated'>('all');

  useEffect(() => {
    if (user) {
      fetchMyLearningData();
    }
  }, [user, filter]);

  const fetchMyLearningData = async () => {
    if (!user) {
      console.log('useMyLearning: No user found');
      return;
    }

    console.log('useMyLearning: Fetching data for user:', user.id, 'filter:', filter);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch stats
      console.log('useMyLearning: Fetching stats...');
      const [bookmarksRes, completionsRes, ratingsRes] = await Promise.all([
        supabase
          .from('user_bookmarks')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('user_completions')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('user_ratings')
          .select('id')
          .eq('user_id', user.id)
      ]);

      console.log('useMyLearning: Stats results:', {
        bookmarks: bookmarksRes,
        completions: completionsRes,
        ratings: ratingsRes
      });

      setStats({
        bookmarked: bookmarksRes.data?.length || 0,
        completed: completionsRes.data?.length || 0,
        rated: ratingsRes.data?.length || 0
      });

      // Fetch content based on filter
      let contentData: ContentItem[] = [];
      
      if (filter === 'all' || filter === 'bookmarked') {
        const { data: bookmarks } = await supabase
          .from('user_bookmarks')
          .select('content_id, content_type, created_at')
          .eq('user_id', user.id);

        if (bookmarks) {
          const bookmarkedContent = await fetchContentDetails(bookmarks);
          contentData = [...contentData, ...bookmarkedContent];
        }
      }

      if (filter === 'all' || filter === 'completed') {
        const { data: completions } = await supabase
          .from('user_completions')
          .select('content_id, content_type, completed_at')
          .eq('user_id', user.id);

        if (completions) {
          const completedContent = await fetchContentDetails(completions);
          contentData = [...contentData, ...completedContent];
        }
      }

      if (filter === 'all' || filter === 'rated') {
        const { data: ratings } = await supabase
          .from('user_ratings')
          .select('content_id, content_type, rating, created_at')
          .eq('user_id', user.id);

        if (ratings) {
          const ratedContent = await fetchContentDetails(ratings);
          contentData = [...contentData, ...ratedContent];
        }
      }

      // Remove duplicates based on content_id and type
      const uniqueContent = contentData.filter((item, index, arr) => 
        arr.findIndex(i => i.id === item.id && i.type === item.type) === index
      );

      setContent(uniqueContent);
    } catch (error) {
      console.error('Error fetching my learning data:', error);
      setError('Failed to load your learning data');
    } finally {
      setLoading(false);
    }
  };

  const fetchContentDetails = async (items: Array<{
    content_id: string;
    content_type: string;
    created_at?: string;
    completed_at?: string;
    rating?: number;
  }>): Promise<ContentItem[]> => {
    const contentPromises = items.map(async (item) => {
      try {
        let data: any = null;
        
        switch (item.content_type) {
          case 'learning_plan':
            const planRes = await supabase
              .from('learning_plans')
              .select('id, name, description, image_url, video_url, created_at')
              .eq('id', item.content_id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .maybeSingle();
            data = planRes.data;
            break;
          case 'module':
            const moduleRes = await supabase
              .from('modules')
              .select('id, name, description, image_url, video_url, created_at')
              .eq('id', item.content_id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .maybeSingle();
            data = moduleRes.data;
            break;
          case 'news':
            const newsRes = await supabase
              .from('news')
              .select('id, title, description, image_url, video_url, created_at')
              .eq('id', item.content_id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .maybeSingle();
            data = newsRes.data;
            break;
          case 'tool':
            const toolRes = await supabase
              .from('tools')
              .select('id, name, description, image_url, video_url, created_at')
              .eq('id', item.content_id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .maybeSingle();
            data = toolRes.data;
            break;
          case 'prompt_library':
            const promptRes = await supabase
              .from('prompt_library')
              .select('id, name, description, image_url, video_url, created_at')
              .eq('id', item.content_id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .maybeSingle();
            data = promptRes.data;
            break;
          case 'article':
            const articleRes = await supabase
              .from('articles')
              .select('id, title, description, image_url, video_url, created_at')
              .eq('id', item.content_id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .maybeSingle();
            data = articleRes.data;
            break;
          default:
            return null;
        }

        if (data) {
            return {
              id: data.id,
              title: data.title || data.name || '',
              description: data.description || '',
              type: item.content_type as ContentItem['type'],
              image_url: data.image_url || undefined,
              video_url: data.video_url || undefined,
              created_at: data.created_at,
              rating: item.rating || undefined,
              completed_at: item.completed_at || undefined,
              bookmarked_at: item.created_at || undefined
            };
        }
      } catch (error) {
        console.error(`Error fetching ${item.content_type}:`, error);
      }
      
      return null;
    });

    const results = await Promise.all(contentPromises);
    return results.filter(Boolean) as ContentItem[];
  };

  return {
    stats,
    content,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchMyLearningData
  };
}