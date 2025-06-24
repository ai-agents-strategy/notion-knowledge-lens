
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * This component ensures that all requests to Supabase are authenticated
 * with the user's Clerk token. It uses `signInWithJwt` to establish a
 * session in the Supabase client.
 */
export const SupabaseAuthProvider = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const setSupabaseSession = async () => {
      if (isSignedIn) {
        try {
          console.log('🔄 Setting Supabase session with Clerk token...');
          const token = await getToken({ template: 'supabase' });
          if (token) {
            // There seems to be a typing issue with signInWithJwt, using unknown cast to bypass TS error.
            const { error } = await (supabase.auth as unknown as { signInWithJwt: (token: string) => Promise<{ error: Error | null }> }).signInWithJwt(token);
            if (error) {
              console.error('❌ Error signing in to Supabase with JWT:', error.message);
            } else {
              console.log('✅ Supabase session set successfully.');
            }
          } else {
            console.error('❌ Could not get Clerk token for Supabase.');
          }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error('❌ Error setting Supabase session:', errorMessage);
        }
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Error signing out from Supabase:', error.message);
        } else {
          console.log('🚪 Cleared Supabase session as user is signed out.');
        }
      }
    };

    setSupabaseSession();
  }, [isSignedIn, getToken]);

  return null; // This component does not render anything.
};

export default SupabaseAuthProvider;
