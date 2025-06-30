import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  const { user, isLoaded } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseAvailable, setSupabaseAvailable] = useState(false);

  // Enhanced Supabase connection test with better timeout handling
  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test 1: Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Missing Supabase environment variables');
        return false;
      }
      
      console.log('✅ Environment variables present');

      // Test 2: Check auth session with increased timeout
      console.log('🔍 Testing auth session...');
      const sessionPromise = supabase.auth.getSession();
      const sessionTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth session timeout')), 10000) // Increased from 5000 to 10000
      );

      const { error: sessionError } = await Promise.race([sessionPromise, sessionTimeout]) as any;
      if (sessionError) {
        console.error('❌ Supabase session test failed:', sessionError);
        return false;
      }
      console.log('✅ Supabase session test passed');

      // Test 3: Simple database query with increased timeout
      console.log('🔍 Testing database query...');
      
      const queryPromise = supabase
        .from('integrations')
        .select('count')
        .limit(1);

      const queryTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 15000) // Increased from 8000 to 15000
      );

      const { error: queryError } = await Promise.race([queryPromise, queryTimeout]) as any;
      
      if (queryError) {
        console.error('❌ Database query failed:', queryError);
        return false;
      }
      
      console.log('✅ Database query successful');
      return true;
      
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
  };

  // Load integrations from Supabase (primary) with localStorage fallback
  const fetchIntegrations = useCallback(async () => {
    if (!user) {
      console.log('❌ No user available for integrations fetch');
      setIntegrations([]);
      setLoading(false);
      setSupabaseAvailable(false);
      return;
    }

    setLoading(true);
    console.log('🚀 Loading integrations for user:', user.id);

    try {
      // Test Supabase connection first
      const isSupabaseConnected = await testSupabaseConnection();
      setSupabaseAvailable(isSupabaseConnected);

      if (isSupabaseConnected) {
        console.log('📥 Loading integrations from Supabase database...');
        
        try {
          // Add increased timeout to the database query
          const dbPromise = supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id);

          const dbTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database fetch timeout')), 15000) // Increased from 10000 to 15000
          );

          const { data: dbIntegrations, error } = await Promise.race([dbPromise, dbTimeout]) as any;

          if (!error && dbIntegrations) {
            console.log('✅ Successfully loaded integrations from database:', dbIntegrations.length);
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
            console.warn('⚠️ Database fetch error, falling back to localStorage:', error);
            setSupabaseAvailable(false);
          }
        } catch (dbError) {
          console.warn('⚠️ Database query failed, falling back to localStorage:', dbError);
          setSupabaseAvailable(false);
        }
      } else {
        console.warn('⚠️ Supabase connection failed, using localStorage only');
      }

      // Fallback to localStorage
      console.log('📥 Loading integrations from localStorage...');
      const localIntegrations: Integration[] = [];
      
      // Check for Notion integration in local storage
      const notionApiKey = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY);
      const notionDatabaseId = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
      
      if (notionApiKey) {
        console.log('📥 Found Notion integration in localStorage');
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
        console.log('📥 Found OpenAI integration in localStorage');
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

      console.log('✅ Loaded integrations from localStorage:', localIntegrations.length);
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
      console.log('🔌 User loaded, fetching integrations.');
      fetchIntegrations();
    } else if (isLoaded && !user) {
      console.log('🔌 No user, clearing integrations.');
      setIntegrations([]);
      setSupabaseAvailable(false);
      setLoading(false);
    }
  }, [user, isLoaded, fetchIntegrations]);

  const getIntegration = (type: string): Integration | null => {
    const integration = integrations.find(integration => integration.integration_type === type) || null;
    if (integration) {
      console.log(`🔍 Retrieved ${type} integration:`, {
        found: true,
        source: integration.id.startsWith('local-') ? 'localStorage' : 'database',
        hasApiKey: !!integration.api_key,
        apiKeyLength: integration.api_key?.length || 0
      });
    } else {
      console.log(`🔍 No ${type} integration found`);
    }
    return integration;
  };

  const saveIntegration = async (type: string, apiKey: string, databaseId?: string): Promise<boolean> => {
    console.log(`💾 === SAVE ${type.toUpperCase()} INTEGRATION STARTED ===`);
    const startTime = Date.now();
    
    if (!user) {
      console.error('❌ Cannot save integration: missing user');
      toast({
        title: "Authentication Required",
        description: "Please sign in to save integrations.",
        variant: "destructive",
      });
      return false;
    }

    console.log('💾 Save parameters:', {
      type,
      apiKeyLength: apiKey.length,
      hasDatabaseId: !!databaseId,
      userId: user.id,
      supabaseAvailable
    });

    try {
      // Always save to localStorage first for immediate availability
      console.log('💾 Step 1: Saving to localStorage...');
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
      console.log('✅ Step 1 completed: localStorage save successful');

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
        console.log('💾 Step 2: Saving to Supabase database...');
        
        try {
          // Add increased timeout to database operations
          const checkPromise = supabase
            .from('integrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('integration_type', type);

          const checkTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database check timeout')), 10000) // Increased from 5000 to 10000
          );

          const { data: existingIntegrations, error: fetchError } = await Promise.race([checkPromise, checkTimeout]) as any;

          if (fetchError) {
            console.error('❌ Error checking existing integration:', fetchError);
            throw fetchError;
          }

          let result;
          if (existingIntegrations && existingIntegrations.length > 0) {
            // UPDATE existing integration
            console.log('🔄 Updating existing integration...');
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
              setTimeout(() => reject(new Error('Database update timeout')), 10000) // Increased from 5000 to 10000
            );

            result = await Promise.race([updatePromise, updateTimeout]);
          } else {
            // INSERT new integration
            console.log('➕ Creating new integration...');
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
              setTimeout(() => reject(new Error('Database insert timeout')), 10000) // Increased from 5000 to 10000
            );

            result = await Promise.race([insertPromise, insertTimeout]);
          }

          if ((result as any).error) {
            console.error('❌ Supabase save error:', (result as any).error);
            throw (result as any).error;
          }

          console.log('✅ Step 2 completed: Supabase save successful');
          
          // Update local state with the database integration
          const savedIntegration = (result as any).data;
          setIntegrations(prev => {
            const filtered = prev.filter(i => i.integration_type !== type);
            const updated = [...filtered, savedIntegration];
            console.log('🔄 Updated integrations state with database integration');
            return updated;
          });

        } catch (dbError) {
          console.warn('⚠️ Step 2 warning: Database save failed, but localStorage succeeded:', dbError);
          // Continue with localStorage-only integration
          setIntegrations(prev => {
            const filtered = prev.filter(i => i.integration_type !== type);
            const updated = [...filtered, newIntegration];
            console.log('🔄 Updated integrations state with localStorage integration');
            return updated;
          });
        }
      } else {
        console.log('💾 Supabase unavailable, using localStorage only...');
        
        // Update local state with localStorage integration
        setIntegrations(prev => {
          const filtered = prev.filter(i => i.integration_type !== type);
          const updated = [...filtered, newIntegration];
          console.log('🔄 Updated integrations state with localStorage integration');
          return updated;
        });
      }

      const endTime = Date.now();
      console.log(`✅ === SAVE ${type.toUpperCase()} INTEGRATION SUCCESSFUL ===`);
      console.log(`⏱️ Total save time: ${endTime - startTime}ms`);
      
      toast({
        title: "✅ Settings Saved!",
        description: `Your ${type} API key has been saved ${supabaseAvailable ? 'to the database' : 'to local storage'}.`,
      });
      
      return true;
    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ === SAVE ${type.toUpperCase()} INTEGRATION FAILED ===`);
      console.error(`⏱️ Failed after: ${endTime - startTime}ms`);
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
    console.log(`🗑️ === DELETE ${type.toUpperCase()} INTEGRATION STARTED ===`);
    
    if (!user) {
      console.error('❌ Cannot delete integration: missing user');
      return false;
    }
    
    try {
      // Remove from local storage first
      if (type === 'notion') {
        console.log('🗑️ Removing Notion credentials from localStorage...');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
      } else if (type === 'openai') {
        console.log('🗑️ Removing OpenAI credentials from localStorage...');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.OPENAI_API_KEY);
      }

      if (supabaseAvailable) {
        console.log('🗑️ Deleting from Supabase database...');
        
        try {
          const deletePromise = supabase
            .from('integrations')
            .delete()
            .eq('user_id', user.id)
            .eq('integration_type', type);

          const deleteTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database delete timeout')), 10000) // Increased from 5000 to 10000
          );

          const { error } = await Promise.race([deletePromise, deleteTimeout]) as any;
            
          if (error) {
            console.error('❌ Supabase delete error:', error);
            throw error;
          }
          console.log('✅ Deleted from database');
        } catch (dbError) {
          console.warn('⚠️ Database delete failed, but local storage cleared:', dbError);
        }
      }

      // Update local state
      setIntegrations(prev => {
        const filtered = prev.filter(i => i.integration_type !== type);
        console.log('🔄 Updated integrations state after deletion:', filtered.length);
        return filtered;
      });

      console.log(`✅ === DELETE ${type.toUpperCase()} INTEGRATION SUCCESSFUL ===`);
      
      toast({
        title: "🧹 Settings Cleared",
        description: `All ${type} integration settings have been cleared.`
      });
      
      return true;
    } catch (error) {
      console.error(`❌ === DELETE ${type.toUpperCase()} INTEGRATION FAILED ===`);
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