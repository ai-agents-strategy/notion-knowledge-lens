import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  created_at: string;
  user_name?: string;
  user_bio?: string;
  user_website?: string;
  user_twitter?: string;
  user_linkedin?: string;
  user_github?: string;
  user_email?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'user_name' | 'user_bio' | 'user_website' | 'user_twitter' | 'user_linkedin' | 'user_github' | 'user_email'>>) => {
    if (!user?.id || !profile) return false;

    try {
      setError(null);

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(updatedProfile);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id, fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetchProfile: fetchProfile
  };
};