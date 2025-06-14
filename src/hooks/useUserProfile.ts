
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  clerk_user_id: string;
  notion_api_key: string | null;
  created_at: string;
}

export const useUserProfile = () => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchOrCreateProfile();
    } else if (isLoaded && !user) {
      setProfile(null);
      setLoading(false);
    }
  }, [user, isLoaded]);

  const fetchOrCreateProfile = async () => {
    if (!user) return;

    try {
      // First try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile);
      } else if (fetchError?.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ clerk_user_id: user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast({
            title: "Error",
            description: "Failed to create user profile",
            variant: "destructive",
          });
        } else {
          setProfile(newProfile);
        }
      } else {
        console.error('Error fetching profile:', fetchError);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotionApiKey = async (apiKey: string) => {
    if (!user || !profile) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ notion_api_key: apiKey })
        .eq('clerk_user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating API key:', error);
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive",
        });
        return false;
      }

      setProfile(data);
      toast({
        title: "Success",
        description: "API key saved securely",
      });
      return true;
    } catch (error) {
      console.error('Unexpected error updating API key:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    updateNotionApiKey,
    refetch: fetchOrCreateProfile,
  };
};
