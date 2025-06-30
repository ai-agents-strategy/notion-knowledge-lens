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

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  NOTION_API_KEY: 'notion_api_key',
  NOTION_DATABASE_ID: 'notion_database_id',
  OPENAI_API_KEY: 'openai_api_key',
};

export const useIntegrations = () => {
  const { user, isLoaded } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    if (!user) {
      console.log('❌ No user available for integrations fetch');
      setIntegrations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('🚀 Loading integrations from local storage and database for user:', user.id);

    try {
      // Load from local storage first (temporary solution)
      const localIntegrations: Integration[] = [];
      
      // Check for Notion integration in local storage
      const notionApiKey = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY);
      const notionDatabaseId = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
      
      if (notionApiKey) {
        console.log('📥 Found Notion integration in localStorage:', {
          hasApiKey: true,
          apiKeyLength: notionApiKey.length,
          hasDatabaseId: !!notionDatabaseId
        });
        
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
        console.log('📥 Found OpenAI integration in localStorage:', {
          hasApiKey: true,
          apiKeyLength: openaiApiKey.length
        });
        
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

      // Try to fetch from database as backup (non-blocking)
      try {
        const { data: dbIntegrations, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id);

        if (!error && dbIntegrations) {
          console.log('📥 Found database integrations:', dbIntegrations.length);
          // Merge database integrations with local storage (local storage takes priority)
          const dbIntegrationsFiltered = dbIntegrations.filter(dbInt => 
            !localIntegrations.some(localInt => localInt.integration_type === dbInt.integration_type)
          );
          localIntegrations.push(...dbIntegrationsFiltered);
        }
      } catch (dbError) {
        console.warn('⚠️ Database fetch failed, using local storage only:', dbError);
      }

      console.log('✅ Loaded integrations:', localIntegrations.map(i => ({ 
        type: i.integration_type, 
        source: i.id.startsWith('local-') ? 'localStorage' : 'database',
        hasApiKey: !!i.api_key
      })));
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
    
    if (!user) {
      console.error('❌ Cannot save integration: missing user');
      toast({
        title: "Authentication Required",
        description: "Please sign in to save integrations.",
        variant: "destructive",
      });
      return false;
    }

    console.log('💾 Saving integration to local storage:', type);
    console.log('📊 Save parameters:', {
      type,
      apiKeyLength: apiKey.length,
      hasDatabaseId: !!databaseId,
      userId: user.id
    });

    try {
      // Save to local storage (temporary solution)
      if (type === 'notion') {
        console.log('💾 Storing Notion credentials in localStorage...');
        localStorage.setItem(LOCAL_STORAGE_KEYS.NOTION_API_KEY, apiKey);
        if (databaseId) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID, databaseId);
          console.log('💾 Stored database ID in localStorage');
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTION_DATABASE_ID);
          console.log('💾 Removed database ID from localStorage');
        }
      } else if (type === 'openai') {
        console.log('💾 Storing OpenAI credentials in localStorage...');
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
        const updated = [...filtered, newIntegration];
        console.log('🔄 Updated integrations state:', updated.map(i => ({ 
          type: i.integration_type, 
          source: i.id.startsWith('local-') ? 'localStorage' : 'database' 
        })));
        return updated;
      });

      // Try to save to database in background (non-blocking)
      try {
        const existingIntegration = integrations.find(i => i.integration_type === type && !i.id.startsWith('local-'));
        
        if (existingIntegration) {
          console.log('🔄 Updating existing database integration...');
          await supabase
            .from('integrations')
            .update({
              api_key: apiKey,
              database_id: databaseId || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingIntegration.id);
        } else {
          console.log('➕ Creating new database integration...');
          await supabase
            .from('integrations')
            .insert([{
              user_id: user.id,
              integration_type: type,
              api_key: apiKey,
              database_id: databaseId || null
            }]);
        }
        console.log('✅ Also saved to database as backup');
      } catch (dbError) {
        console.warn('⚠️ Database save failed, but local storage succeeded:', dbError);
      }

      console.log(`✅ === SAVE ${type.toUpperCase()} INTEGRATION SUCCESSFUL ===`);
      console.log('✅ Integration saved successfully to localStorage');
      
      // Note: We don't show a toast here as the calling component will handle it
      return true;
    } catch (error) {
      console.error(`❌ === SAVE ${type.toUpperCase()} INTEGRATION FAILED ===`);
      console.error('❌ Unexpected error saving integration:', error);
      
      // Note: We don't show a toast here as the calling component will handle it
      return false;
    }
  };

  const deleteIntegration = async (type: string): Promise<boolean> => {
    console.log(`🗑️ === DELETE ${type.toUpperCase()} INTEGRATION STARTED ===`);
    
    if (!user) {
      console.error('❌ Cannot delete integration: missing user');
      return false;
    }
    
    console.log('🗑️ Deleting integration from local storage:', type);

    try {
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
        console.log('🔄 Updated integrations state after deletion:', filtered.map(i => ({ 
          type: i.integration_type, 
          source: i.id.startsWith('local-') ? 'localStorage' : 'database' 
        })));
        return filtered;
      });

      // Try to delete from database in background (non-blocking)
      try {
        const integration = integrations.find(i => i.integration_type === type && !i.id.startsWith('local-'));
        if (integration) {
          console.log('🗑️ Deleting from database...');
          await supabase
            .from('integrations')
            .delete()
            .eq('id', integration.id);
          console.log('✅ Also deleted from database');
        }
      } catch (dbError) {
        console.warn('⚠️ Database delete failed, but local storage cleared:', dbError);
      }

      console.log(`✅ === DELETE ${type.toUpperCase()} INTEGRATION SUCCESSFUL ===`);
      console.log('✅ Integration deleted successfully from localStorage');
      
      // Note: We don't show a toast here as the calling component will handle it
      return true;
    } catch (error) {
      console.error(`❌ === DELETE ${type.toUpperCase()} INTEGRATION FAILED ===`);
      console.error('❌ Unexpected error deleting integration:', error);
      return false;
    }
  };

  return {
    integrations,
    loading,
    getIntegration,
    saveIntegration,
    deleteIntegration,
    refetch: fetchIntegrations,
  };
};