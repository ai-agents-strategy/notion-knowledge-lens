
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

/**
 * This component handles syncing the Clerk JWT to Supabase.
 * It runs on every auth state change and ensures that the
 * Supabase client has the correct session information.
 */
const SyncClerkToSupabase = () => {
  const { getToken, isSignedIn, userId } = useAuth();

  useEffect(() => {
    const sync = async () => {
      console.log('🔄 SyncClerkToSupabase: Starting sync process');
      console.log('📊 Auth state:', { isSignedIn, userId });

      if (isSignedIn) {
        try {
          console.log('🎫 Getting Clerk token...');
          const token = await getToken({ template: 'supabase' });
          
          if (!token) {
            console.error('❌ No token received from Clerk');
            return;
          }

          console.log('✅ Received token from Clerk (length:', token.length, ')');
          
          // Let's decode the JWT to see what's in it
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔍 JWT payload:', {
              sub: payload.sub,
              aud: payload.aud,
              iss: payload.iss,
              exp: payload.exp,
              iat: payload.iat
            });
          } catch (decodeError) {
            console.error('❌ Error decoding JWT:', decodeError);
          }

          console.log('🔐 Setting Supabase session...');
          
          // Supabase expects a session object. We use the Clerk token for both
          // access and refresh tokens. Clerk will handle token refreshing.
          const { data, error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: token,
          });
          
          if (error) {
            console.error('❌ Supabase setSession error:', {
              message: error.message,
              status: error.status,
              code: error.code,
              details: error
            });
            throw error;
          }

          console.log('✅ Supabase session set successfully:', {
            user: data.user?.id,
            session: !!data.session
          });

        } catch (e) {
          console.error('❌ Error setting Supabase session:', {
            error: e,
            message: e instanceof Error ? e.message : 'Unknown error',
            stack: e instanceof Error ? e.stack : undefined
          });
        }
      } else {
        console.log('🚪 User not signed in, signing out of Supabase...');
        // Sign out of Supabase when not signed in with Clerk.
        await supabase.auth.signOut().catch((error) => {
          console.error('❌ Error signing out of Supabase:', error);
        });
      }
    };
    
    sync();
  }, [isSignedIn, getToken, userId]);

  return null; // This component does not render anything.
};

export default SyncClerkToSupabase;
