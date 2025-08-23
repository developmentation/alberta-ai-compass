import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StarRating {
  content_id: string;
  content_type: string;
  total_votes: number;
  total_stars: number;
  average_rating: number;
}

export function useRatings(contentId?: string, contentType?: string) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [aggregatedRating, setAggregatedRating] = useState<StarRating | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contentId && contentType) {
      fetchRatings();
    }
  }, [contentId, contentType, user]);

  const fetchRatings = async () => {
    if (!contentId || !contentType) return;

    try {
      // Fetch aggregated rating
      const { data: starData } = await supabase
        .from('star_ratings')
        .select('*')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .single();

      setAggregatedRating(starData);

      // Fetch user's individual rating if logged in
      if (user) {
        const { data: userRatingData } = await supabase
          .from('user_ratings')
          .select('rating')
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .eq('content_type', contentType)
          .single();

        setUserRating(userRatingData?.rating || null);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const submitRating = async (rating: number) => {
    if (!user || !contentId || !contentType) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          rating: rating,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setUserRating(rating);
      // Refetch to get updated aggregated rating
      await fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    userRating,
    aggregatedRating,
    submitRating,
    loading,
    refetch: fetchRatings
  };
}