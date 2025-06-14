
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

/**
 * This component handles basic Clerk auth state monitoring.
 * We've removed the Supabase auth sync since it was causing compatibility issues
 * between Clerk's user ID format and Supabase's UUID expectations.
 */
const SyncClerkToSupabase = () => {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    console.log('🔄 Clerk Auth State:', { isSignedIn, userId });
    
    if (isSignedIn && userId) {
      console.log('✅ User is signed in with Clerk:', userId);
    } else {
      console.log('🚪 User is not signed in');
    }
  }, [isSignedIn, userId]);

  return null; // This component does not render anything.
};

export default SyncClerkToSupabase;
