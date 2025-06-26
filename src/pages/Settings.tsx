import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { ChatApiSettings } from "@/components/settings/ChatApiSettings";
import { NotionIntegrationSettings } from "@/components/settings/NotionIntegrationSettings";
import { NotionSetupInstructions } from "@/components/settings/NotionSetupInstructions";

const Settings = () => {
  const { user } = useUser();
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncedDatabases, setSyncedDatabases] = useState<Array<{ title?: Array<{ plain_text: string }> }>>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Chat API Keys state
  const [openaiKey, setOpenaiKey] = useState('');
  const [mem0Key, setMem0Key] = useState('');

  // Load data from localStorage only
  useEffect(() => {
    const storedApiKey = localStorage.getItem('notion_api_key');
    if (storedApiKey) {
      setNotionApiKey(storedApiKey);
    }

    const storedDatabaseId = localStorage.getItem('notion_database_id');
    if (storedDatabaseId) {
      setDatabaseId(storedDatabaseId);
    }

    // Load synced databases from localStorage
    const storedSyncedDatabases = localStorage.getItem('notion_synced_databases');
    if (storedSyncedDatabases) {
      try {
        setSyncedDatabases(JSON.parse(storedSyncedDatabases));
      } catch (error) {
        console.error('Error parsing synced databases:', error);
      }
    }

    // Load chat API keys from localStorage
    const storedOpenaiKey = localStorage.getItem('openai_api_key');
    const storedMem0Key = localStorage.getItem('mem0_api_key');
    
    if (storedOpenaiKey) setOpenaiKey(storedOpenaiKey);
    if (storedMem0Key) setMem0Key(storedMem0Key);
  }, []);

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
      console.log('💾 Saving integration settings to localStorage...');

      // Save to localStorage only
      localStorage.setItem('notion_api_key', notionApiKey.trim());
      if (databaseId.trim()) {
        localStorage.setItem('notion_database_id', databaseId.trim());
      } else {
        localStorage.removeItem('notion_database_id');
      }

      console.log('✅ Settings saved successfully to localStorage');
      toast({
        title: "Settings saved!",
        description: "Your Notion integration settings have been saved to localStorage."
      });
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

      // Save synced data to localStorage
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
      // Clear localStorage data only
      localStorage.removeItem('notion_api_key');
      localStorage.removeItem('notion_database_id');
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
        description: "All Notion integration settings have been cleared from localStorage."
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

  const handleSaveChatSettings = () => {
    try {
      if (openaiKey.trim()) {
        localStorage.setItem('openai_api_key', openaiKey.trim());
      } else {
        localStorage.removeItem('openai_api_key');
      }

      if (mem0Key.trim()) {
        localStorage.setItem('mem0_api_key', mem0Key.trim());
      } else {
        localStorage.removeItem('mem0_api_key');
      }

      toast({
        title: "Chat settings saved!",
        description: "Your AI chat API keys have been saved securely in your browser."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save chat settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClearChatSettings = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('mem0_api_key');
    setOpenaiKey('');
    setMem0Key('');
    
    toast({
      title: "Chat settings cleared",
      description: "All AI chat API keys have been removed."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Global Sidebar */}
      <SettingsSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configure your integrations and API settings
            </p>
          </div>

          <div className="space-y-6">
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
              mem0Key={mem0Key}
              setMem0Key={setMem0Key}
              handleSaveChatSettings={handleSaveChatSettings}
              handleClearChatSettings={handleClearChatSettings}
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
    </div>
  );
};

export default Settings;
