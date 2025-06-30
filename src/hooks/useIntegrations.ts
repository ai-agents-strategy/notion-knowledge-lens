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

  // Test Supabase connection
  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test 1: Check if we can get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ Supabase session test failed:', sessionError);
        return false;
      }
      console.log('✅ Supabase session test passed');

      // Test 2: Try a simple query (with timeout)
      const queryPromise = supabase
        .from('integrations')
        .select('count')
        .limit(1);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );

      const { error: queryError } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (queryError) {
        console.error('❌ Supabase query test failed:', queryError);
        return false;
      }
      
      console.log('✅ Supabase connection test passed');
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
        
        const { data: dbIntegrations, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id);

        if (!error && dbIntegrations) {
          console.log('✅ Successfully loaded integrations from database:', dbIntegrations.length);
          setIntegrations(dbIntegrations);
          
          // Sync to localStorage for offline access
          dbIntegrations.forEach(integration => {
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
      toast({
        title: "Warning",
        description: "Using local storage for integrations due to database issues.",
        variant: "default",
      });
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
      if (supabaseAvailable) {
        console.log('💾 Step 1: Saving to Supabase database...');
        
        // Check if integration already exists
        const { data: existingIntegrations, error: fetchError } = await supabase
          .from('integrations')
          .select('id')
          .eq('user_id', user.id)
          .eq('integration_type', type);

        if (fetchError) {
          console.error('❌ Error checking existing integration:', fetchError);
          throw fetchError;
        }

        let result;
        if (existingIntegrations && existingIntegrations.length > 0) {
          // UPDATE existing integration
          console.log('🔄 Updating existing integration...');
          result = await supabase
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
        } else {
          // INSERT new integration
          console.log('➕ Creating new integration...');
          result = await supabase
            .from('integrations')
            .insert([{
              user_id: user.id,
              integration_type: type,
              api_key: apiKey,
              database_id: databaseId || null
            }])
            .select()
            .single();
        }

        if (result.error) {
          console.error('❌ Supabase save error:', result.error);
          throw result.error;
        }

        console.log('✅ Step 1 completed: Supabase save successful');
        
        // Update local state with the saved integration
        const savedIntegration = result.data;
        setIntegrations(prev => {
          const filtered = prev.filter(i => i.integration_type !== type);
          return [...filtered, savedIntegration];
        });

        // Also save to localStorage for offline access
        console.log('💾 Step 2: Syncing to localStorage for offline access...');
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
        console.log('✅ Step 2 completed: localStorage sync successful');

      } else {
        // Fallback to localStorage only
        console.log('💾 Supabase unavailable, saving to localStorage only...');
        
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

        // Update local state
        const newIntegration: Integration = {
          id: `local-${type}`,
          user_id: user.id,
          integration_type: type,
          api_key: apiKey,
          database_id: databaseId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setIntegrations(prev => {
          const filtered = prev.filter(i => i.integration_type !== type);
          return [...filtered, newIntegration];
        });
        
        console.log('✅ localStorage save completed');
      }

      const endTime = Date.now();
      console.log(`✅ === SAVE ${type.toUpperCase()} INTEGRATION SUCCESSFUL ===`);
      console.log(`⏱️ Total save time: ${endTime - startTime}ms`);
      
      toast({
        title: "✅ Settings Saved!",
        description: `Your ${type} API key has been saved successfully.`,
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
      if (supabaseAvailable) {
        console.log('🗑️ Deleting from Supabase database...');
        
        const { error } = await supabase
          .from('integrations')
          .delete()
          .eq('user_id', user.id)
          .eq('integration_type', type);
          
        if (error) {
          console.error('❌ Supabase delete error:', error);
          throw error;
        }
        console.log('✅ Deleted from database');
      }

      // Remove from local storage
      if (type === 'notion') {
        console.log('🗑️ Removing Notion credentials from localStorage...');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
      } else if (type === 'openai') {
        console.log('🗑️ Removing OpenAI credentials from localStorage...');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.OPENAI_API_KEY);
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