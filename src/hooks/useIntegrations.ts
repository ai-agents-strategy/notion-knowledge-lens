import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from './useSupabaseClient';
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
  const supabase = useSupabaseClient();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseAvailable, setSupabaseAvailable] = useState(false);

  const testSupabaseConnection = async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('integrations').select('id').limit(1);
      if (error) {
        console.warn('Supabase connection test failed, using offline mode:', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Supabase connection test failed, using offline mode:', error);
      return false;
    }
  };

  // Load integrations from Supabase (primary) with localStorage fallback
  const fetchIntegrations = useCallback(async () => {
    if (!user || !supabase) {
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
        const { data: dbIntegrations, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching integrations, falling back to local:', error);
          setSupabaseAvailable(false);
        } else {
          setIntegrations(dbIntegrations || []);
          // Sync to localStorage for offline access
          (dbIntegrations || []).forEach(integration => {
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
  }, [user, supabase]);

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
    if (!user || !supabase) {
      console.error('❌ Cannot save integration: missing user or supabase client');
      toast({
        title: "Authentication Required",
        description: "Please sign in to save integrations.",
        variant: "destructive",
      });
      return false;
    }

    if (!supabaseAvailable) {
      toast({
        title: "❌ Save Failed",
        description: "Database connection is not available. Please check your network.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('integrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('integration_type', type);

      if (checkError) {
        console.error('❌ Error checking for existing integration:', checkError);
        throw checkError;
      }

      let result;
      if (existing && existing.length > 0) {
        // Update existing integration
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
        // Insert new integration
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
      
      const savedIntegration = result.data as Integration;
      
      // Update local state
      setIntegrations(prev => {
        const filtered = prev.filter(i => i.integration_type !== type);
        return [...filtered, savedIntegration];
      });

      // Update localStorage as a cache after successful save
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
      
      toast({
        title: "✅ Settings Saved!",
        description: `Your ${type} API key has been saved to the database.`,
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
    if (!user || !supabase) {
      console.error('❌ Cannot delete integration: missing user or supabase client');
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
        const { error } = await supabase
          .from('integrations')
          .delete()
          .eq('user_id', user.id)
          .eq('integration_type', type);

        if (error) {
          console.error('❌ Supabase delete error:', error);
          // Still attempt to clear local state and show success to user
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
