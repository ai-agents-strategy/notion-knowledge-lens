import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
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
        console.log('📥 Loading Notion integration from storage:', {
          hasApiKey: !!notionIntegration.api_key,
          apiKeyLength: notionIntegration.api_key?.length || 0,
          hasDatabaseId: !!notionIntegration.database_id
        });
        setNotionApiKey(notionIntegration.api_key || '');
        setDatabaseId(notionIntegration.database_id || '');
      }

      // Load OpenAI integration
      const openaiIntegration = getIntegration('openai');
      if (openaiIntegration) {
        console.log('📥 Loading OpenAI integration from storage:', {
          hasApiKey: !!openaiIntegration.api_key,
          apiKeyLength: openaiIntegration.api_key?.length || 0
        });
        setOpenaiKey(openaiIntegration.api_key || '');
      }

      // Load synced databases from localStorage (this is temporary data)
      const storedSyncedDatabases = localStorage.getItem('notion_synced_databases');
      if (storedSyncedDatabases) {
        try {
          const parsed = JSON.parse(storedSyncedDatabases);
          console.log('📥 Loading synced databases from localStorage:', parsed.length, 'databases');
          setSyncedDatabases(parsed);
        } catch (error) {
          console.error('❌ Error parsing synced databases:', error);
        }
      }
    }
  }, [integrationsLoading, getIntegration]);

  const handleSave = async () => {
    console.log('💾 === NOTION SAVE OPERATION STARTED ===');
    
    if (!user) {
      console.error('❌ Save failed: No user authenticated');
      toast({
        title: "Authentication Required",
        description: "Please sign in to save settings.",
        variant: "destructive"
      });
      return;
    }
    
    if (!notionApiKey.trim()) {
      console.error('❌ Save failed: No API key provided');
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
        console.log('✅ === NOTION SAVE OPERATION SUCCESSFUL ===');
        console.log('✅ Settings saved successfully to local storage');
        
        // Show success notification
        toast({
          title: "✅ Settings Saved Successfully!",
          description: "Your Notion API key has been saved to local storage and is ready to use.",
        });

        // Additional success feedback
        console.log('🎉 Save operation completed successfully');
        console.log('📊 Current integration status:', {
          type: 'notion',
          saved: true,
          apiKeyLength: notionApiKey.trim().length,
          databaseId: databaseId.trim() || null,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Save operation returned false');
      }
    } catch (error) {
      console.error('❌ === NOTION SAVE OPERATION FAILED ===');
      console.error('❌ Error saving settings:', error);
      
      const errorMsg = error instanceof Error ? error.message : "Failed to save settings. Please try again.";
      setErrorMessage(errorMsg);
      
      // Show error notification
      toast({
        title: "❌ Save Failed",
        description: errorMsg,
        variant: "destructive"
      });

      console.log('📊 Save operation failed with details:', {
        error: errorMsg,
        userPresent: !!user,
        apiKeyLength: notionApiKey.trim().length,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
      console.log('💾 === NOTION SAVE OPERATION ENDED ===');
    }
  };

  const handleSync = async () => {
    console.log('🔄 === NOTION SYNC OPERATION STARTED ===');
    
    if (!user) {
      console.error('❌ Sync failed: No user authenticated');
      toast({
        title: "Authentication Required",
        description: "Please sign in to sync with Notion.",
        variant: "destructive"
      });
      return;
    }
    if (!notionApiKey.trim()) {
      console.error('❌ Sync failed: No API key available');
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
      console.log('🔑 Using API key length:', notionApiKey.trim().length);
      console.log('🌐 Calling Supabase Edge Function: notion-sync');
      
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
        console.error('❌ Notion API error:', data.error);
        throw new Error(data.error);
      }
      
      console.log('✅ === NOTION SYNC OPERATION SUCCESSFUL ===');
      console.log('✅ Notion sync success:', data);
      console.log('📊 Sync results:', {
        databases: data.results?.length || 0,
        nodes: data.nodes?.length || 0,
        connections: data.connections?.length || 0
      });
      
      setSyncedDatabases(data.results || []);
      setSyncStatus('success');

      // Save synced data to localStorage (temporary data)
      localStorage.setItem('notion_synced_databases', JSON.stringify(data.results || []));
      localStorage.setItem('notion_last_sync', new Date().toISOString());
      if (data.nodes && data.connections) {
        localStorage.setItem('notion_graph_nodes', JSON.stringify(data.nodes));
        localStorage.setItem('notion_graph_connections', JSON.stringify(data.connections));
        console.log('💾 Saved graph data to localStorage:', {
          nodes: data.nodes.length,
          connections: data.connections.length
        });
      }
      
      // Show success notification
      toast({
        title: "🎉 Sync Successful!",
        description: `Successfully synced ${data.results?.length || 0} databases and ${data.nodes?.length || 0} pages from your Notion workspace.`,
      });

      console.log('🎉 Sync operation completed successfully');
    } catch (error) {
      console.error('❌ === NOTION SYNC OPERATION FAILED ===');
      console.error('❌ Sync error:', error);
      
      setSyncStatus('error');
      let errorMsg = "Unknown error occurred during sync.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      
      // Show error notification
      toast({
        title: "❌ Sync Failed",
        description: errorMsg,
        variant: "destructive"
      });

      console.log('📊 Sync operation failed with details:', {
        error: errorMsg,
        apiKeyLength: notionApiKey.trim().length,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSyncing(false);
      console.log('🔄 === NOTION SYNC OPERATION ENDED ===');
    }
  };

  const handleClear = async () => {
    console.log('🗑️ === NOTION CLEAR OPERATION STARTED ===');
    
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
      
      console.log('✅ === NOTION CLEAR OPERATION SUCCESSFUL ===');
      console.log('✅ All Notion data cleared from local storage');
      
      // Show success notification
      toast({
        title: "🧹 Settings Cleared",
        description: "All Notion integration settings have been cleared from local storage."
      });
    } catch (error) {
      console.error('❌ === NOTION CLEAR OPERATION FAILED ===');
      console.error('❌ Error clearing settings:', error);
      
      // Show error notification
      toast({
        title: "❌ Clear Failed",
        description: "Failed to clear settings. Please try again.",
        variant: "destructive"
      });
    }
    
    console.log('🗑️ === NOTION CLEAR OPERATION ENDED ===');
  };

  const handleSaveChatSettings = async () => {
    console.log('💾 === OPENAI SAVE OPERATION STARTED ===');
    
    if (!user) {
      console.error('❌ OpenAI save failed: No user authenticated');
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
        console.log('💾 Saving OpenAI API key to local storage...');
        console.log('🔑 OpenAI API Key length:', openaiKey.trim().length);
        
        const success = await saveIntegration('openai', openaiKey.trim());
        if (success) {
          console.log('✅ === OPENAI SAVE OPERATION SUCCESSFUL ===');
          
          // Show success notification
          toast({
            title: "✅ Chat Settings Saved!",
            description: "Your OpenAI API key has been saved to local storage and enhanced AI features are now available.",
          });
        }
      } else {
        console.log('🗑️ Clearing OpenAI API key from local storage...');
        
        // If empty, delete the integration
        await deleteIntegration('openai');
        
        console.log('✅ OpenAI API key cleared successfully');
        
        // Show success notification
        toast({
          title: "🧹 Chat Settings Cleared",
          description: "OpenAI API key has been removed from local storage. You'll now use the free model.",
        });
      }
    } catch (error) {
      console.error('❌ === OPENAI SAVE OPERATION FAILED ===');
      console.error('❌ Error saving chat settings:', error);
      
      // Show error notification
      toast({
        title: "❌ Save Failed",
        description: "Failed to save chat settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChatIsLoading(false);
      console.log('💾 === OPENAI SAVE OPERATION ENDED ===');
    }
  };

  const handleClearChatSettings = async () => {
    console.log('🗑️ === OPENAI CLEAR OPERATION STARTED ===');
    
    setChatIsLoading(true);
    try {
      await deleteIntegration('openai');
      setOpenaiKey('');
      
      console.log('✅ === OPENAI CLEAR OPERATION SUCCESSFUL ===');
      
      // Show success notification
      toast({
        title: "🧹 Chat Settings Cleared",
        description: "OpenAI API key has been removed from local storage."
      });
    } catch (error) {
      console.error('❌ === OPENAI CLEAR OPERATION FAILED ===');
      console.error('❌ Error clearing chat settings:', error);
      
      // Show error notification
      toast({
        title: "❌ Clear Failed",
        description: "Failed to clear chat settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChatIsLoading(false);
      console.log('🗑️ === OPENAI CLEAR OPERATION ENDED ===');
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

          {/* Success/Error Status Alerts */}
          {syncStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Sync Successful!</strong> Your Notion workspace has been successfully synced. 
                Found {syncedDatabases.length} databases with graph data ready for visualization.
              </AlertDescription>
            </Alert>
          )}

          {syncStatus === 'error' && errorMessage && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Sync Failed:</strong> {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {errorMessage && syncStatus !== 'error' && (
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