import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  user_id: string;
  integration_type: string;
  api_key: string;
  database_id: string | null;
  created_at: string;
  updated_at: string;
}

// Local storage keys for fallback
const LOCAL_STORAGE_KEYS = {
  NOTION_API_KEY: 'notion_api_key',
  NOTION_DATABASE_ID: 'notion_database_id',
  OPENAI_API_KEY: 'openai_api_key',
};

export const useIntegrations = () => {
  const { user, isLoaded } = useUser();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseAvailable, setSupabaseAvailable] = useState(false);

  // Enhanced Supabase connection test with better timeout handling
  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      // Test 1: Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Missing Supabase environment variables');
        return false;
      }
      
      // Test 2: Check auth session with increased timeout
      const sessionPromise = supabase.auth.getSession();
      const sessionTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth session timeout')), 30000) // Increased from 20000 to 30000
      );

      const { error: sessionError } = await Promise.race([sessionPromise, sessionTimeout]) as { error: Error | null };
      if (sessionError) {
        console.error('❌ Supabase session test failed:', sessionError);
        return false;
      }

      // Test 3: Simple database query with increased timeout
      const queryPromise = supabase
        .from('integrations')
        .select('count')
        .limit(1);

      const queryTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 35000) // Increased from 25000 to 35000
      );

      const { error: queryError } = await Promise.race([queryPromise, queryTimeout]) as { error: Error | null };
      
      if (queryError) {
        console.error('❌ Database query failed:', queryError);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
  };

  // Load integrations from Supabase (primary) with localStorage fallback
  const fetchIntegrations = useCallback(async () => {
    if (!user) {
      setIntegrations([]);
      setLoading(false);
      setSupabaseAvailable(false);
      return;
    }

    setLoading(true);

    try {
      // Test Supabase connection first
      const isSupabaseConnected = await testSupabaseConnection();
      setSupabaseAvailable(isSupabaseConnected);

      if (isSupabaseConnected) {
        try {
          // Add increased timeout to the database query
          const dbPromise = supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id);

          const dbTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database fetch timeout')), 35000) // Increased from 25000 to 35000
          );

          const { data: dbIntegrations, error } = await Promise.race([dbPromise, dbTimeout]) as { data: Integration[], error: Error | null };

          if (!error && dbIntegrations) {
            setIntegrations(dbIntegrations);
            
            // Sync to localStorage for offline access
            dbIntegrations.forEach((integration: Integration) => {
              if (integration.integration_type === 'notion') {
                localStorage.setItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY, integration.api_key);
                if (integration.database_id) {
                  localStorage.setItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID, integration.database_id);
                }
              } else if (integration.integration_type === 'openai') {
                localStorage.setItem(LOCAL_STORAGE_KEYS.OPENAI_API_KEY, integration.api_key);
              }
            });
            
            setLoading(false);
            return;
          } else {
            setSupabaseAvailable(false);
          }
        } catch (dbError) {
          setSupabaseAvailable(false);
        }
      }

      // Fallback to localStorage
      const localIntegrations: Integration[] = [];
      
      // Check for Notion integration in local storage
      const notionApiKey = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY);
      const notionDatabaseId = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
      
      if (notionApiKey) {
        localIntegrations.push({
          id: 'local-notion',
          user_id: user.id,
          integration_type: 'notion',
          api_key: notionApiKey,
          database_id: notionDatabaseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Check for OpenAI integration in local storage
      const openaiApiKey = localStorage.getItem(LOCAL_STORAGE_KEYS.OPENAI_API_KEY);
      
      if (openaiApiKey) {
        localIntegrations.push({
          id: 'local-openai',
          user_id: user.id,
          integration_type: 'openai',
          api_key: openaiApiKey,
          database_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      setIntegrations(localIntegrations);

    } catch (error) {
      console.error('❌ Unexpected error in fetchIntegrations:', error);
      setSupabaseAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchIntegrations();
    } else if (isLoaded && !user) {
      setIntegrations([]);
      setSupabaseAvailable(false);
      setLoading(false);
    }
  }, [user, isLoaded, fetchIntegrations]);

  const getIntegration = (type: string): Integration | null => {
    const integration = integrations.find(integration => integration.integration_type === type) || null;
    return integration;
  };

  const saveIntegration = async (type: string, apiKey: string, databaseId?: string): Promise<boolean> => {
    if (!user) {
      console.error('❌ Cannot save integration: missing user');
      toast({
        title: "Authentication Required",
        description: "Please sign in to save integrations.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Always save to localStorage first for immediate availability
      if (type === 'notion') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY, apiKey);
        if (databaseId) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID, databaseId);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
        }
      } else if (type === 'openai') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.OPENAI_API_KEY, apiKey);
      }

      // Create local integration object
      const newIntegration: Integration = {
        id: `local-${type}`,
        user_id: user.id,
        integration_type: type,
        api_key: apiKey,
        database_id: databaseId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (supabaseAvailable) {
        try {
          // Add increased timeout to database operations
          const checkPromise = supabase
            .from('integrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('integration_type', type);

          const checkTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database check timeout')), 30000) // Increased from 20000 to 30000
          );

          const { data: existingIntegrations, error: fetchError } = await Promise.race([checkPromise, checkTimeout]) as { data: { id: string }[], error: Error | null };

          if (fetchError) {
            console.error('❌ Error checking existing integration:', fetchError);
            throw fetchError;
          }

          let result;
          if (existingIntegrations && existingIntegrations.length > 0) {
            // UPDATE existing integration
            const updatePromise = supabase
              .from('integrations')
              .update({
                api_key: apiKey,
                database_id: databaseId || null,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .eq('integration_type', type)
              .select()
              .single();

            const updateTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database update timeout')), 30000) // Increased from 20000 to 30000
            );

            result = await Promise.race([updatePromise, updateTimeout]);
          } else {
            // INSERT new integration
            const insertPromise = supabase
              .from('integrations')
              .insert([{
                user_id: user.id,
                integration_type: type,
                api_key: apiKey,
                database_id: databaseId || null
              }])
              .select()
              .single();

            const insertTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database insert timeout')), 30000) // Increased from 20000 to 30000
            );

            result = await Promise.race([insertPromise, insertTimeout]);
          }

          if ((result as { error: Error | null }).error) {
            console.error('❌ Supabase save error:', (result as { error: Error | null }).error);
            throw (result as { error: Error | null }).error;
          }
          
          // Update local state with the database integration
          const savedIntegration = (result as { data: Integration }).data;
          setIntegrations(prev => {
            const filtered = prev.filter(i => i.integration_type !== type);
            const updated = [...filtered, savedIntegration];
            return updated;
          });

        } catch (dbError) {
          // Continue with localStorage-only integration
          setIntegrations(prev => {
            const filtered = prev.filter(i => i.integration_type !== type);
            const updated = [...filtered, newIntegration];
            return updated;
          });
        }
      } else {
        // Update local state with localStorage integration
        setIntegrations(prev => {
          const filtered = prev.filter(i => i.integration_type !== type);
          const updated = [...filtered, newIntegration];
          return updated;
        });
      }
      
      toast({
        title: "✅ Settings Saved!",
        description: `Your ${type} API key has been saved ${supabaseAvailable ? 'to the database' : 'to local storage'}.`,
      });
      
      return true;
    } catch (error) {
      console.error('❌ Save error:', error);
      
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const deleteIntegration = async (type: string): Promise<boolean> => {
    if (!user) {
      console.error('❌ Cannot delete integration: missing user');
      return false;
    }
    
    try {
      // Remove from local storage first
      if (type === 'notion') {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
      } else if (type === 'openai') {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.OPENAI_API_KEY);
      }

      if (supabaseAvailable) {
        try {
          const deletePromise = supabase
            .from('integrations')
            .delete()
            .eq('user_id', user.id)
            .eq('integration_type', type);

          const deleteTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database delete timeout')), 30000) // Increased from 20000 to 30000
          );

          const { error } = await Promise.race([deletePromise, deleteTimeout]) as { error: Error | null };
            
          if (error) {
            console.error('❌ Supabase delete error:', error);
            throw error;
          }
        } catch (dbError) {
          // In case of error, local storage is already cleared.
        }
      }

      // Update local state
      setIntegrations(prev => prev.filter(i => i.integration_type !== type));
      
      toast({
        title: "🧹 Settings Cleared",
        description: `All ${type} integration settings have been cleared.`
      });
      
      return true;
    } catch (error) {
      console.error('❌ Delete error:', error);
      
      toast({
        title: "❌ Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear settings.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    integrations,
    loading,
    supabaseAvailable,
    getIntegration,
    saveIntegration,
    deleteIntegration,
    refetch: fetchIntegrations,
  };
};
