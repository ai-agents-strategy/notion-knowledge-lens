
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * This component ensures that all requests to Supabase are authenticated
 * with the user's Clerk token. It dynamically sets the Authorization header
 * on the global Supabase client.
 */
export const SupabaseAuthProvider = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const setAuthHeader = async () => {
      if (isSignedIn) {
        try {
          console.log('🔄 Setting Supabase auth header with Clerk token...');
          const token = await getToken({ template: 'supabase' });
          if (token) {
            supabase.global.headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ Supabase auth header set successfully.');
          } else {
            console.error('❌ Could not get Clerk token for Supabase.');
          }
        } catch (e) {
            console.error('❌ Error setting Supabase auth header:', e);
        }
      } else if ('Authorization' in supabase.global.headers) {
        delete supabase.global.headers['Authorization'];
        console.log('🚪 Cleared Supabase auth header as user is signed out.');
      }
    };

    setAuthHeader();
  }, [isSignedIn, getToken]);

  return null; // This component does not render anything.
};

export default SupabaseAuthProvider;
