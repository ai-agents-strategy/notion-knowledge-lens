import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const useSupabaseClient = (): SupabaseClient | null => {
  const { getToken } = useAuth();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const createSupabaseClient = async () => {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase URL and Anon Key are required.");
        return;
      }
      
      const token = await getToken({ template: 'supabase' });

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      setSupabaseClient(client);
    };

    createSupabaseClient();
  }, [getToken]);

  return supabaseClient;
};
