
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  user_id: string;
  integration_type: string;
  api_key: string; // This will now come from localStorage
  database_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useIntegrations = () => {
  const { user, isLoaded } = useUser();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    if (!user) {
      console.error('❌ No user available for integrations fetch');
      return;
    }

    setLoading(true);
    console.log('🚀 Triggering fetch integrations for user:', user.id);

    try {
      // Fetch integration metadata from database (without API keys)
      const { data, error } = await supabase
        .from('integrations')
        .select('id, user_id, integration_type, database_id, created_at, updated_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching integrations:', error);
        toast({
          title: "Database Error",
          description: `Failed to fetch integrations: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Merge database data with localStorage API keys
      const integrationsWithKeys = (data || []).map(integration => ({
        ...integration,
        api_key: localStorage.getItem(`${integration.integration_type}_api_key`) || ''
      }));

      console.log('✅ Fetched integrations:', integrationsWithKeys);
      setIntegrations(integrationsWithKeys);
    } catch (error) {
      console.error('❌ Unexpected error in fetchIntegrations:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try refreshing the page.",
        variant: "destructive",
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
    return integrations.find(integration => integration.integration_type === type) || null;
  };

  const saveIntegration = async (type: string, apiKey: string, databaseId?: string) => {
    if (!user) {
      console.error('❌ Cannot save integration: missing user');
      return false;
    }

    console.log('💾 Saving integration for user:', user.id, 'type:', type);

    try {
      const existingIntegration = getIntegration(type);
      
      // Save API key to localStorage
      localStorage.setItem(`${type}_api_key`, apiKey);
      
      if (existingIntegration) {
        // Update existing integration metadata in database (without API key)
        const { data, error } = await supabase
          .from('integrations')
          .update({
            database_id: databaseId || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingIntegration.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating integration:', error);
          toast({
            title: "Error",
            description: `Failed to update integration: ${error.message}`,
            variant: "destructive",
          });
          return false;
        }

        console.log('✅ Integration updated successfully');
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === existingIntegration.id 
              ? { ...data, api_key: apiKey } 
              : integration
          )
        );
      } else {
        // Create new integration metadata in database (without API key)
        const { data, error } = await supabase
          .from('integrations')
          .insert([{
            user_id: user.id,
            integration_type: type,
            database_id: databaseId || null
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating integration:', error);
          toast({
            title: "Error",
            description: `Failed to create integration: ${error.message}`,
            variant: "destructive",
          });
          return false;
        }

        console.log('✅ Integration created successfully');
        setIntegrations(prev => [...prev, { ...data, api_key: apiKey }]);
      }

      toast({
        title: "Success",
        description: `${type} integration saved successfully`,
      });
      return true;
    } catch (error) {
      console.error('❌ Unexpected error saving integration:', error);
      return false;
    }
  };

  const deleteIntegration = async (type: string) => {
    if (!user) {
      console.error('❌ Cannot delete integration: missing user');
      return false;
    }
    
    const integration = getIntegration(type);
    if (!integration) {
      console.log('ℹ️ No integration found to delete');
      return true;
    }

    console.log('🗑️ Deleting integration:', integration.id);

    try {
      // Remove from database
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integration.id);

      if (error) {
        console.error('❌ Error deleting integration:', error);
        toast({
          title: "Error",
          description: `Failed to delete integration: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Remove API key from localStorage
      localStorage.removeItem(`${type}_api_key`);

      console.log('✅ Integration deleted successfully');
      setIntegrations(prev => prev.filter(i => i.id !== integration.id));
      toast({
        title: "Success",
        description: `${type} integration deleted successfully`,
      });
      return true;
    } catch (error) {
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
