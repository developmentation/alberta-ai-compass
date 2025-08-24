import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContentRatingData {
  contentId: string;
  averageRating: number;
  totalVotes: number;
  isBookmarked: boolean;
}

export function useContentRatings(contentItems: Array<{id: string, type: string}>, userId?: string | null) {
  const [ratingsData, setRatingsData] = useState<Record<string, ContentRatingData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Always fetch ratings, fetch bookmarks only if userId provided
    if (contentItems.length > 0) {
      fetchRatingsAndBookmarks();
    }
  }, [userId, contentItems]);

  const fetchRatingsAndBookmarks = async () => {
    if (contentItems.length === 0) return;

    setLoading(true);
    try {
      const contentIds = contentItems.map(item => item.id);
      
      // Always fetch star ratings (public data)
      const { data: starRatings } = await supabase
        .from('star_ratings')
        .select('content_id, average_rating, total_votes')
        .in('content_id', contentIds);

      // Only fetch user bookmarks if userId provided
      let bookmarks = null;
      if (userId) {
        const { data } = await supabase
          .from('user_bookmarks')
          .select('content_id')
          .eq('user_id', userId)
          .in('content_id', contentIds);
        bookmarks = data;
      }

      const bookmarkSet = new Set(bookmarks?.map(b => b.content_id) || []);
      
      const ratingsMap: Record<string, ContentRatingData> = {};
      
      contentItems.forEach(item => {
        const rating = starRatings?.find(r => r.content_id === item.id);
        ratingsMap[item.id] = {
          contentId: item.id,
          averageRating: rating?.average_rating || 0,
          totalVotes: rating?.total_votes || 0,
          isBookmarked: userId ? bookmarkSet.has(item.id) : false
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