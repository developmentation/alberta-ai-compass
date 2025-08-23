import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ContentRatingData {
  contentId: string;
  averageRating: number;
  totalVotes: number;
  isBookmarked: boolean;
}

export function useContentRatings(contentItems: Array<{id: string, type: string}>) {
  const { user } = useAuth();
  const [ratingsData, setRatingsData] = useState<Record<string, ContentRatingData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && contentItems.length > 0) {
      fetchRatingsAndBookmarks();
    }
  }, [user, contentItems]);

  const fetchRatingsAndBookmarks = async () => {
    if (!user || contentItems.length === 0) return;

    setLoading(true);
    try {
      const contentIds = contentItems.map(item => item.id);
      
      // Fetch star ratings
      const { data: starRatings } = await supabase
        .from('star_ratings')
        .select('content_id, average_rating, total_votes')
        .in('content_id', contentIds);

      // Fetch user bookmarks
      const { data: bookmarks } = await supabase
        .from('user_bookmarks')
        .select('content_id')
        .eq('user_id', user.id)
        .in('content_id', contentIds);

      const bookmarkSet = new Set(bookmarks?.map(b => b.content_id) || []);
      
      const ratingsMap: Record<string, ContentRatingData> = {};
      
      contentItems.forEach(item => {
        const rating = starRatings?.find(r => r.content_id === item.id);
        ratingsMap[item.id] = {
          contentId: item.id,
          averageRating: rating?.average_rating || 0,
          totalVotes: rating?.total_votes || 0,
          isBookmarked: bookmarkSet.has(item.id)
        };
      });
      
      setRatingsData(ratingsMap);
    } catch (error) {
      console.error('Error fetching ratings and bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  return { ratingsData, loading, refetch: fetchRatingsAndBookmarks };
}