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
    console.log('🚀 Triggering fetch integrations for user:', user.id);

    try {
      // Fetch integration data from database (including API keys)
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching integrations:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        toast({
          title: "Database Error",
          description: `Failed to fetch integrations: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Fetched integrations:', data);
      setIntegrations(data || []);
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

    console.log('💾 Saving integration for user:', user.id, 'type:', type);

    try {
      const existingIntegration = getIntegration(type);
      
      if (existingIntegration) {
        // Update existing integration in database
        console.log('🔄 Updating existing integration:', existingIntegration.id);
        
        const updateData = {
          api_key: apiKey,
          database_id: databaseId || null,
          updated_at: new Date().toISOString()
        };

        console.log('📝 Update data:', { ...updateData, api_key: '[REDACTED]' });

        const { data, error } = await supabase
          .from('integrations')
          .update(updateData)
          .eq('id', existingIntegration.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating integration:', error);
          console.error('❌ Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          toast({
            title: "Error",
            description: `Failed to update integration: ${error.message}`,
            variant: "destructive",
          });
          return false;
        }

        console.log('✅ Integration updated successfully:', { ...data, api_key: '[REDACTED]' });
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === existingIntegration.id ? data : integration
          )
        );
      } else {
        // Create new integration in database
        console.log('➕ Creating new integration');
        
        const insertData = {
          user_id: user.id,
          integration_type: type,
          api_key: apiKey,
          database_id: databaseId || null
        };

        console.log('📝 Insert data:', { ...insertData, api_key: '[REDACTED]' });

        const { data, error } = await supabase
          .from('integrations')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating integration:', error);
          console.error('❌ Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          toast({
            title: "Error",
            description: `Failed to create integration: ${error.message}`,
            variant: "destructive",
          });
          return false;
        }

        console.log('✅ Integration created successfully:', { ...data, api_key: '[REDACTED]' });
        setIntegrations(prev => [...prev, data]);
      }

      toast({
        title: "Success",
        description: `${type} integration saved successfully`,
      });
      return true;
    } catch (error) {
      console.error('❌ Unexpected error saving integration:', error);
      toast({
        title: "Unexpected Error",
        description: "Failed to save integration. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteIntegration = async (type: string): Promise<boolean> => {
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