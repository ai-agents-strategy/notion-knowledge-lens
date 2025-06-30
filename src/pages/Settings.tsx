import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIntegrations } from "@/hooks/useIntegrations";
import { SettingsHeader } from "@/components/SettingsHeader";
import { ChatApiSettings } from "@/components/settings/ChatApiSettings";
import { NotionIntegrationSettings } from "@/components/settings/NotionIntegrationSettings";
import { NotionSetupInstructions } from "@/components/settings/NotionSetupInstructions";

const Settings = () => {
  const { user } = useAuth();
  const { getIntegration, saveIntegration, deleteIntegration, loading: integrationsLoading } = useIntegrations();
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncedDatabases, setSyncedDatabases] = useState<Array<{ title?: Array<{ plain_text: string }> }>>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // OpenAI API Key state
  const [openaiKey, setOpenaiKey] = useState('');
  const [chatIsLoading, setChatIsLoading] = useState(false);

  // Load data from integrations (now using local storage)
  useEffect(() => {
    if (!integrationsLoading) {
      // Load Notion integration
      const notionIntegration = getIntegration('notion');
      if (notionIntegration) {
        setNotionApiKey(notionIntegration.api_key || '');
        setDatabaseId(notionIntegration.database_id || '');
      }

      // Load OpenAI integration
      const openaiIntegration = getIntegration('openai');
      if (openaiIntegration) {
        setOpenaiKey(openaiIntegration.api_key || '');
      }

      // Load synced databases from localStorage (this is temporary data)
      const storedSyncedDatabases = localStorage.getItem('notion_synced_databases');
      if (storedSyncedDatabases) {
        try {
          setSyncedDatabases(JSON.parse(storedSyncedDatabases));
        } catch (error) {
          console.error('Error parsing synced databases:', error);
        }
      }
    }
  }, [integrationsLoading, getIntegration]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save settings.",
        variant: "destructive"
      });
      return;
    }
    
    if (!notionApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Notion API key before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('💾 Starting save process to local storage...');
      console.log('👤 User ID:', user.id);
      console.log('🔑 API Key length:', notionApiKey.trim().length);
      console.log('🗄️ Database ID:', databaseId.trim() || 'none');

      // Save to local storage (this should be instant and reliable)
      const success = await saveIntegration('notion', notionApiKey.trim(), databaseId.trim() || undefined);
      
      if (success) {
        console.log('✅ Settings saved successfully to local storage');
        toast({
          title: "Settings saved!",
          description: "Your Notion API key has been saved to local storage.",
        });
      } else {
        throw new Error('Save operation returned false');
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      const errorMsg = error instanceof Error ? error.message : "Failed to save settings. Please try again.";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to sync with Notion.",
        variant: "destructive"
      });
      return;
    }
    if (!notionApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter and save your Notion API key before syncing.",
        variant: "destructive"
      });
      return;
    }
    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage('');
    try {
      console.log('🔄 Starting Notion sync via Edge Function...');
      const {
        data,
        error
      } = await supabase.functions.invoke('notion-sync', {
        body: { apiKey: notionApiKey.trim() }
      });
      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Failed to sync with Notion');
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      console.log('✅ Notion sync success:', data);
      setSyncedDatabases(data.results || []);
      setSyncStatus('success');

      // Save synced data to localStorage (temporary data)
      localStorage.setItem('notion_synced_databases', JSON.stringify(data.results || []));
      localStorage.setItem('notion_last_sync', new Date().toISOString());
      if (data.nodes && data.connections) {
        localStorage.setItem('notion_graph_nodes', JSON.stringify(data.nodes));
        localStorage.setItem('notion_graph_connections', JSON.stringify(data.connections));
      }
      toast({
        title: "Sync successful!",
        description: `Found ${data.results?.length || 0} databases in your Notion workspace.`
      });
    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncStatus('error');
      let errorMsg = "Unknown error occurred during sync.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      toast({
        title: "Sync failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClear = async () => {
    try {
      // Clear local storage data
      await deleteIntegration('notion');
      
      // Clear localStorage data
      localStorage.removeItem('notion_synced_databases');
      localStorage.removeItem('notion_last_sync');
      localStorage.removeItem('notion_graph_nodes');
      localStorage.removeItem('notion_graph_connections');
      
      setNotionApiKey('');
      setDatabaseId('');
      setSyncedDatabases([]);
      setSyncStatus('idle');
      setErrorMessage('');
      toast({
        title: "Settings cleared",
        description: "All Notion integration settings have been cleared from local storage."
      });
    } catch (error) {
      console.error('❌ Error clearing settings:', error);
      toast({
        title: "Error",
        description: "Failed to clear settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveChatSettings = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save settings.",
        variant: "destructive"
      });
      return;
    }

    setChatIsLoading(true);
    try {
      if (openaiKey.trim()) {
        const success = await saveIntegration('openai', openaiKey.trim());
        if (success) {
          toast({
            title: "Chat settings saved!",
            description: "Your OpenAI API key has been saved to local storage."
          });
        }
      } else {
        // If empty, delete the integration
        await deleteIntegration('openai');
        toast({
          title: "Chat settings cleared",
          description: "OpenAI API key has been removed from local storage."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save chat settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChatIsLoading(false);
    }
  };

  const handleClearChatSettings = async () => {
    setChatIsLoading(true);
    try {
      await deleteIntegration('openai');
      setOpenaiKey('');
      
      toast({
        title: "Chat settings cleared",
        description: "OpenAI API key has been removed from local storage."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChatIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsHeader 
        title="Integrations" 
        description="Configure your integrations and API settings" 
      />

      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="space-y-6">
          {/* Temporary Local Storage Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Temporary Mode:</strong> API keys are currently being saved to your browser's local storage 
              while we resolve database connectivity issues. Your keys are secure and only accessible on this device.
            </AlertDescription>
          </Alert>

          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <ChatApiSettings
            openaiKey={openaiKey}
            setOpenaiKey={setOpenaiKey}
            handleSaveChatSettings={handleSaveChatSettings}
            handleClearChatSettings={handleClearChatSettings}
            isLoading={chatIsLoading}
          />

          <NotionIntegrationSettings
            notionApiKey={notionApiKey}
            setNotionApiKey={setNotionApiKey}
            databaseId={databaseId}
            setDatabaseId={setDatabaseId}
            isLoading={isLoading}
            isSyncing={isSyncing}
            syncStatus={syncStatus}
            syncedDatabases={syncedDatabases}
            handleSave={handleSave}
            handleSync={handleSync}
            handleClear={handleClear}
          />

          <NotionSetupInstructions />
        </div>
      </div>
    </div>
  );
};

export default Settings;