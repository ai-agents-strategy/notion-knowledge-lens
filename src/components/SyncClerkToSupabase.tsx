
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

/**
 * This component handles syncing the Clerk JWT to Supabase.
 * It runs on every auth state change and ensures that the
 * Supabase client has the correct session information.
 */
const SyncClerkToSupabase = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const sync = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken({ template: 'supabase' });
          if (token) {
            await supabase.auth.signInWithJwt(token);
          }
        } catch (e) {
          console.error('Error signing in with JWT', e);
        }
      } else {
        // Sign out of Supabase when not signed in with Clerk.
        await supabase.auth.signOut().catch(console.error);
      }
    };
    
    sync();
  }, [isSignedIn, getToken]);

  return null; // This component does not render anything.
};

export default SyncClerkToSupabase;
