
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
      console.log('👤 User loaded, fetching profile for:', user.id);
      fetchOrCreateProfile();
    } else if (isLoaded && !user) {
      console.log('👤 No user, clearing profile');
      setProfile(null);
      setLoading(false);
    }
  }, [user, isLoaded]);

  const fetchOrCreateProfile = async () => {
    if (!user) {
      console.error('❌ No user available for profile fetch');
      return;
    }

    console.log('🔍 Fetching profile for user:', user.id);

    try {
      // First try to fetch existing profile
      console.log('📥 Attempting to fetch existing profile...');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      console.log('📥 Fetch result:', { existingProfile, fetchError });

      if (fetchError) {
        console.error('❌ Error fetching profile:', fetchError);
        toast({
          title: "Database Error",
          description: `Failed to fetch profile: ${fetchError.message}`,
          variant: "destructive",
        });
        return;
      }

      if (existingProfile) {
        console.log('✅ Found existing profile:', existingProfile.id);
        setProfile(existingProfile);
      } else {
        console.log('📝 Profile doesn\'t exist, creating new one...');
        
        const insertData = { clerk_user_id: user.id };
        console.log('📝 Inserting profile with data:', insertData);
        
        // Use the service role for this operation since we can't establish Supabase auth
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([insertData])
          .select()
          .single();

        console.log('📝 Insert result:', { newProfile, insertError });

        if (insertError) {
          console.error('❌ Error creating profile:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
            fullError: insertError
          });
          
          // More specific error handling
          if (insertError.code === '42501') {
            console.error('❌ RLS Policy violation - this means our database policies need to be updated');
            toast({
              title: "Authentication Issue",
              description: "There's a configuration issue with user permissions. Please contact support.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: `Failed to create user profile: ${insertError.message}`,
              variant: "destructive",
            });
          }
        } else {
          console.log('✅ Profile created successfully:', newProfile.id);
          setProfile(newProfile);
          toast({
            title: "Welcome!",
            description: "Your profile has been created successfully.",
          });
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error in fetchOrCreateProfile:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNotionApiKey = async (apiKey: string) => {
    if (!user || !profile) {
      console.error('❌ Cannot update API key: missing user or profile');
      return false;
    }

    console.log('🔑 Updating Notion API key for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ notion_api_key: apiKey })
        .eq('clerk_user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating API key:', {
          message: error.message,
          code: error.code,
          details: error.details,
          fullError: error
        });
        toast({
          title: "Error",
          description: `Failed to save API key: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ API key updated successfully');
      setProfile(data);
      toast({
        title: "Success",
        description: "API key saved securely",
      });
      return true;
    } catch (error) {
      console.error('❌ Unexpected error updating API key:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
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
