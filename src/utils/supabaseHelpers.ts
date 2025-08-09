import { supabase, withRetry, handleSupabaseError } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type aliases for better readability
type Tables = Database['public']['Tables'];
type Survey = Tables['surveys']['Row'];
type Response = Tables['responses']['Row'];
type Profile = Tables['profiles']['Row'];

// Enhanced data fetching with error handling and retry logic
export const fetchSurveys = async (orgId: string): Promise<Survey[]> => {
  try {
    const { data, error } = await withRetry(() =>
      supabase
        .from('surveys')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
    );

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching surveys:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await withRetry(() =>
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    );

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const createResponse = async (responseData: Partial<Response>): Promise<Response> => {
  try {
    const { data, error } = await withRetry(() =>
      supabase
        .from('responses')
        .insert(responseData)
        .select()
        .single()
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating response:', error);
    throw new Error(handleSupabaseError(error));
  }
};

// Real-time subscription helpers
export const subscribeToSurveyUpdates = (
  surveyId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`survey-${surveyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'responses',
        filter: `survey_id=eq.${surveyId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToProfileUpdates = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`profile-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// Batch operations for better performance
export const batchCreateAnswers = async (answers: any[]): Promise<void> => {
  try {
    const { error } = await withRetry(() =>
      supabase
        .from('answers')
        .insert(answers)
    );

    if (error) throw error;
  } catch (error) {
    console.error('Error batch creating answers:', error);
    throw new Error(handleSupabaseError(error));
  }
};

// Connection validation
export const validateConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Connection validation failed:', error);
    return false;
  }
};

// Enhanced error logging
export const logError = async (
  error: any,
  context: string,
  userId?: string
): Promise<void> => {
  try {
    console.error(`[${context}]`, error);
    
    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external logging service
      // await sendToLoggingService({ error, context, userId });
    }
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
};