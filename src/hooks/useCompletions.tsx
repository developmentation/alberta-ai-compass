import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserCompletion {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  completed_at: string;
  score?: number;
  metadata?: any;
}

export function useCompletions(contentId?: string, contentType?: string) {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<UserCompletion[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Add ref to prevent refreshes during completion processing
  const isProcessingCompletion = useRef(false);

  const fetchCompletions = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    console.log('fetchCompletions called, forceRefresh:', forceRefresh, 'isProcessingCompletion:', isProcessingCompletion.current);
    
    // Don't refresh if we're in the middle of processing a completion
    if (isProcessingCompletion.current && forceRefresh) {
      console.log('Skipping refresh during completion processing');
      return;
    }
    
    try {
      // Clear local state first if forcing refresh
      if (forceRefresh) {
        console.log('Clearing local completion state');
        setCompletions([]);
        setIsCompleted(false);
      }
      
      const { data, error } = await supabase
        .from('user_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false }); // Get most recent first

      console.log('Fetched completions:', data);
      console.log('Fetch error:', error);

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCompletions(false);
    }
  }, [user, fetchCompletions]);

  // Only fetch when contentId changes if we're not processing a completion
  useEffect(() => {
    if (user && contentId && !loading && !isProcessingCompletion.current) {
      console.log('ContentId changed, fetching completions for:', contentId);
      fetchCompletions(false);
    }
  }, [user, contentId, fetchCompletions, loading]);

  useEffect(() => {
    if (contentId && contentType && completions.length > 0 && !loading) {
      const completion = completions.find(c => c.content_id === contentId && c.content_type === contentType);
      setIsCompleted(!!completion);
    }
  }, [contentId, contentType, completions, loading]);

  const markAsCompleted = useCallback(async (
    targetContentId: string, 
    targetContentType: string, 
    score?: number, 
    metadata?: any
  ) => {
    if (!user) {
      console.log('markAsCompleted: No user found');
      return;
    }
    
    console.log('markAsCompleted called:', { targetContentId, targetContentType, score, metadata });
    
    // Set processing flag to prevent interference from other useEffects
    isProcessingCompletion.current = true;
    setLoading(true);
    
    try {
      // Fetch existing completion for this specific content
      console.log('=== FETCHING EXISTING COMPLETION ===');
      console.log('Search parameters:', { user_id: user.id, targetContentId, targetContentType });
      
      const { data: existingCompletions, error: fetchError } = await supabase
        .from('user_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', targetContentId)
        .eq('content_type', targetContentType)
        .order('completed_at', { ascending: false })
        .limit(1);

      console.log('Existing completions:', existingCompletions);
      console.log('Fetch error:', fetchError);

      if (fetchError) {
        console.error('Error fetching existing completion:', fetchError);
        throw fetchError;
      }

      const existingCompletion = existingCompletions && existingCompletions.length > 0 ? existingCompletions[0] : null;
      console.log('Processed existing completion:', existingCompletion);

      // Calculate completion count and metadata
      let completionCount = 1;
      let updatedMetadata = { ...metadata };

      if (existingCompletion) {
        // Get the current completion count and increment it
        const currentMetadata = existingCompletion.metadata as any;
        const currentCount = currentMetadata?.completionCount || 1;
        completionCount = currentCount + 1;
        console.log('Incrementing completion count from', currentCount, 'to', completionCount);
        
        // Get previous scores, ensuring we have an array
        const previousScores = Array.isArray(currentMetadata?.previousScores) 
          ? currentMetadata.previousScores 
          : [existingCompletion.score].filter(score => score !== null);
        
        console.log('Previous scores:', previousScores);

        updatedMetadata = {
          ...metadata,
          completionCount: completionCount,
          previousScores: [...previousScores, score],
          firstCompletedAt: (currentMetadata?.firstCompletedAt as string) || existingCompletion.completed_at,
          lastCompletedAt: new Date().toISOString()
        };
      } else {
        // First completion
        completionCount = 1;
        console.log('First completion, setting count to 1');
        
        updatedMetadata = {
          ...metadata,
          completionCount: 1,
          previousScores: [score],
          firstCompletedAt: new Date().toISOString(),
          lastCompletedAt: new Date().toISOString()
        };
      }

      console.log('Updated metadata:', updatedMetadata);

      // Prepare upsert data
      const upsertData = {
        user_id: user.id,
        content_id: targetContentId,
        content_type: targetContentType,
        score: score,
        metadata: updatedMetadata,
        completed_at: new Date().toISOString()
      };
      
      console.log('=== USING SUPABASE UPSERT ===');
      console.log('Upsert data:', upsertData);
      
      // Use Supabase's built-in upsert functionality
      const { data: upsertResult, error } = await supabase
        .from('user_completions')
        .upsert(upsertData, {
          onConflict: 'user_id,content_id,content_type',
          ignoreDuplicates: false
        })
        .select('*');

      console.log('Upsert result:', upsertResult);
      console.log('Upsert error:', error);

      if (error) {
        console.error('Error upserting completion:', error);
        throw error;
      }
      
      // Update local state with the new completion data
      if (upsertResult && upsertResult.length > 0) {
        const updatedCompletion = upsertResult[0];
        console.log('=== UPDATING LOCAL STATE ===');
        console.log('Updated completion from database:', updatedCompletion);
        
        // Update the completions array with the new/updated completion
        setCompletions(prevCompletions => {
          const filtered = prevCompletions.filter(c => 
            !(c.content_id === targetContentId && c.content_type === targetContentType)
          );
          return [updatedCompletion, ...filtered];
        });
        
        // Update isCompleted if this is for the current content
        if (targetContentId === contentId && targetContentType === contentType) {
          console.log('=== SETTING IS COMPLETED TO TRUE ===');
          setIsCompleted(true);
        }
        
        console.log('=== LOCAL STATE UPDATE COMPLETED ===');
      } else {
        console.warn('=== NO UPSERT RESULT TO UPDATE LOCAL STATE ===');
      }
      
      console.log('Completion marked successfully');
    } catch (error) {
      console.error('Error marking as completed:', error);
      throw error; // Re-throw so caller can handle
    } finally {
      setLoading(false);
      // Clear processing flag after delay to ensure all state updates are complete
      setTimeout(() => {
        isProcessingCompletion.current = false;
        console.log('=== COMPLETION PROCESSING FLAG CLEARED ===');
      }, 500);
    }
  }, [user, contentId, contentType]);

  const removeCompletion = useCallback(async (targetContentId: string, targetContentType: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', targetContentId)
        .eq('content_type', targetContentType);

      if (error) throw error;
      await fetchCompletions(true);
    } catch (error) {
      console.error('Error removing completion:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchCompletions]);

  // Stable references for return values
  const refetch = useCallback(() => fetchCompletions(false), [fetchCompletions]);
  const forceRefresh = useCallback(() => {
    // Don't force refresh if we're processing a completion
    if (!isProcessingCompletion.current) {
      return fetchCompletions(true);
    } else {
      console.log('Skipping force refresh during completion processing');
      return Promise.resolve();
    }
  }, [fetchCompletions]);

  // Memoized derived values to prevent unnecessary re-renders
  const currentCompletion = useMemo(() => {
    if (!contentId || !contentType) return null;
    return completions.find(c => c.content_id === contentId && c.content_type === contentType);
  }, [completions, contentId, contentType]);

  const completionCount = useMemo(() => {
    if (!currentCompletion) return 0;
    return currentCompletion.metadata?.completionCount || 1;
  }, [currentCompletion]);

  const latestScore = useMemo(() => {
    return currentCompletion?.score || null;
  }, [currentCompletion]);

  const completionHistory = useMemo(() => {
    return currentCompletion?.metadata || null;
  }, [currentCompletion]);

  return {
    completions,
    isCompleted: contentId && contentType ? isCompleted : false,
    completionCount,
    latestScore,
    completionHistory,
    markAsCompleted,
    removeCompletion,
    loading,
    refetch,
    forceRefresh
  };
}

