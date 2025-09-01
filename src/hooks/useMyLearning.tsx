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
  type: 'resource' | 'learning_plan' | 'module' | 'news' | 'tool' | 'prompt_library' | 'article';
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
      // Fetch all user interactions
      const [bookmarksRes, completionsRes, ratingsRes] = await Promise.all([
        supabase
          .from('user_bookmarks')
          .select('content_id, content_type, created_at')
          .eq('user_id', user.id),
        supabase
          .from('user_completions')
          .select('content_id, content_type, completed_at')
          .eq('user_id', user.id),
        supabase
          .from('user_ratings')
          .select('content_id, content_type, rating, created_at')
          .eq('user_id', user.id)
      ]);

      console.log('useMyLearning: Stats results:', {
        bookmarks: bookmarksRes,
        completions: completionsRes,
        ratings: ratingsRes
      });

      // Set stats
      setStats({
        bookmarked: bookmarksRes.data?.length || 0,
        completed: completionsRes.data?.length || 0,
        rated: ratingsRes.data?.length || 0
      });

      // Combine all interactions into a single map
      const interactionsMap = new Map<string, {
        content_id: string;
        content_type: string;
        bookmarked_at?: string;
        completed_at?: string;
        rating?: number;
      }>();

      // Process bookmarks
      if (bookmarksRes.data && (filter === 'all' || filter === 'bookmarked')) {
        bookmarksRes.data.forEach(bookmark => {
          const key = `${bookmark.content_type}_${bookmark.content_id}`;
          interactionsMap.set(key, {
            content_id: bookmark.content_id,
            content_type: bookmark.content_type,
            bookmarked_at: bookmark.created_at
          });
        });
      }

      // Process completions
      if (completionsRes.data && (filter === 'all' || filter === 'completed')) {
        completionsRes.data.forEach(completion => {
          const key = `${completion.content_type}_${completion.content_id}`;
          const existing = interactionsMap.get(key);
          if (existing) {
            existing.completed_at = completion.completed_at;
          } else {
            interactionsMap.set(key, {
              content_id: completion.content_id,
              content_type: completion.content_type,
              completed_at: completion.completed_at
            });
          }
        });
      }

      // Process ratings
      if (ratingsRes.data && (filter === 'all' || filter === 'rated')) {
        ratingsRes.data.forEach(rating => {
          const key = `${rating.content_type}_${rating.content_id}`;
          const existing = interactionsMap.get(key);
          if (existing) {
            existing.rating = rating.rating;
          } else {
            interactionsMap.set(key, {
              content_id: rating.content_id,
              content_type: rating.content_type,
              rating: rating.rating
            });
          }
        });
      }

      // Fetch content details for all interactions
      const contentData = await fetchContentDetails(Array.from(interactionsMap.values()));
      setContent(contentData);

    } catch (error) {
      console.error('Error fetching my learning data:', error);
      setError('Failed to load your learning data');
    } finally {
      setLoading(false);
    }
  };

  const fetchContentDetails = async (
    interactions: Array<{
      content_id: string;
      content_type: string;
      bookmarked_at?: string;
      completed_at?: string;
      rating?: number;
    }>
  ): Promise<ContentItem[]> => {
    console.log('fetchContentDetails: Processing', interactions.length, 'interactions');
    
    const contentPromises = interactions.map(async (interaction) => {
      try {
        let data: any = null;
        
        switch (interaction.content_type) {
          case 'learning_plan':
            const planRes = await supabase
              .from('learning_plans')
              .select('*')
              .eq('id', interaction.content_id)
              .maybeSingle();
            data = planRes.data;
            break;
          case 'module':
            const moduleRes = await supabase
              .from('modules')
              .select('*')
              .eq('id', interaction.content_id)
              .maybeSingle();
            data = moduleRes.data;
            break;
          case 'news':
            const newsRes = await supabase
              .from('news')
              .select('*')
              .eq('id', interaction.content_id)
              .maybeSingle();
            data = newsRes.data;
            break;
          case 'tool':
            const toolRes = await supabase
              .from('tools')
              .select('*')
              .eq('id', interaction.content_id)
              .maybeSingle();
            data = toolRes.data;
            break;
          case 'resource':
            const resourceRes = await supabase
              .from('resources')
              .select('*')
              .eq('id', interaction.content_id)
              .maybeSingle();
            data = resourceRes.data;
            break;

          case 'prompt_library':
            const promptRes = await supabase
              .from('prompt_library')
              .select('*')
              .eq('id', interaction.content_id)
              .maybeSingle();
            data = promptRes.data;
            break;
          case 'article':
            const articleRes = await supabase
              .from('articles')
              .select('*')
              .eq('id', interaction.content_id)
              .maybeSingle();
            data = articleRes.data;
            break;
          default:
            console.warn(`Unknown content type: ${interaction.content_type}`);
            return null;
        }

        if (data) {
          // Skip deleted content only if deleted_at exists and is not null
          if (data.deleted_at) {
            console.log(`Content ${interaction.content_id} is deleted, skipping`);
            return null;
          }

          return {
            id: data.id,
            title: data.title || data.name || '',
            description: data.description || '',
            type: interaction.content_type as ContentItem['type'],
            image_url: data.image_url || undefined,
            video_url: data.video_url || undefined,
            created_at: data.created_at,
            rating: interaction.rating || undefined,
            completed_at: interaction.completed_at || undefined,
            bookmarked_at: interaction.bookmarked_at || undefined
          };
        } else {
          console.log(`No data found for ${interaction.content_type} ${interaction.content_id}`);
        }
      } catch (error) {
        console.error(`Error fetching ${interaction.content_type} with id ${interaction.content_id}:`, error);
      }
      
      return null;
    });

    const results = await Promise.all(contentPromises);
    const validResults = results.filter(Boolean) as ContentItem[];
    
    console.log('fetchContentDetails: Returning', validResults.length, 'valid items');
    return validResults;
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

