/* eslint-disable no-console */
import { supabase } from './SupabaseClient';

export const saveTokenToSupabase = async (userId: string, token: string): Promise<void> => {
  const { error } = await supabase
    .from('tokens')
    .insert([
      { user_id: userId, access_token: token },
    ]);

  if (error) {
    console.error('Error saving token:', error);
  }
};

export const getTokenFromSupabase = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('tokens')
    .select('access_token')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching token:', error);
    // eslint-disable-next-line no-null/no-null
    return null;
  }

  // eslint-disable-next-line no-null/no-null
  return data?.access_token || null;
};
