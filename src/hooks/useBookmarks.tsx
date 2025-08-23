import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useBookmarks(contentId?: string, contentType?: string) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  useEffect(() => {
    if (contentId && contentType && bookmarks.length > 0) {
      setIsBookmarked(bookmarks.includes(`${contentType}_${contentId}`));
    }
  }, [contentId, contentType, bookmarks]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('content_id, content_type')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const bookmarkKeys = data?.map(b => `${b.content_type}_${b.content_id}`) || [];
      setBookmarks(bookmarkKeys);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (targetContentId: string, targetContentType: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const bookmarkKey = `${targetContentType}_${targetContentId}`;
      const currentlyBookmarked = bookmarks.includes(bookmarkKey);

      if (currentlyBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', targetContentId)
          .eq('content_type', targetContentType);

        if (error) throw error;
        setBookmarks(prev => prev.filter(b => b !== bookmarkKey));
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            content_id: targetContentId,
            content_type: targetContentType
          });

        if (error) throw error;
        setBookmarks(prev => [...prev, bookmarkKey]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    isBookmarked: contentId && contentType ? isBookmarked : false,
    toggleBookmark,
    loading,
    refetch: fetchBookmarks
  };
}