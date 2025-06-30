import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIntegrations } from "@/hooks/useIntegrations";
import { SettingsHeader } from "@/components/SettingsHeader";
import { ChatApiSettings } from "@/components/settings/ChatApiSettings";
import { NotionIntegrationSettings } from "@/components/settings/NotionIntegrationSettings";
import { NotionSetupInstructions } from "@/components/settings/NotionSetupInstructions";
import { SupabaseConnectionTest } from "@/components/settings/SupabaseConnectionTest";

const Settings = () => {
  const { user } = useAuth();
  const { getIntegration, saveIntegration, deleteIntegration, loading: integrationsLoading } = useIntegrations();
  
  // Notion state
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncedDatabases, setSyncedDatabases] = useState<Array<{ title?: Array<{ plain_text: string }> }>>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // OpenAI state
  const [openaiKey, setOpenaiKey] = useState('');
  const [chatIsLoading, setChatIsLoading] = useState(false);

  // Load data from integrations
  useEffect(() => {
    console.log('⚙️ Settings: Loading integrations data...');
    console.log('⚙️ Settings: Integrations loading:', integrationsLoading);
    
    if (!integrationsLoading) {
      // Load Notion integration
      const notionIntegration = getIntegration('notion');
      if (notionIntegration) {
        console.log('⚙️ Settings: Loading Notion integration');
        setNotionApiKey(notionIntegration.api_key || '');
        setDatabaseId(notionIntegration.database_id || '');
      }

      // Load OpenAI integration
      const openaiIntegration = getIntegration('openai');
      if (openaiIntegration) {
        console.log('⚙️ Settings: Loading OpenAI integration');
        setOpenaiKey(openaiIntegration.api_key || '');
      }

      // Load synced databases from localStorage
      const storedSyncedDatabases = localStorage.getItem('notion_synced_databases');
      if (storedSyncedDatabases) {
        try {
          const parsed = JSON.parse(storedSyncedDatabases);
          console.log('⚙️ Settings: Loading synced databases:', parsed.length);
          setSyncedDatabases(parsed);
        } catch (error) {
          console.error('❌ Settings: Error parsing synced databases:', error);
        }
      }
    }
  }, [integrationsLoading, getIntegration]);

  // Notion event handlers
  const handleNotionSaveSuccess = () => {
    console.log('✅ Settings: Notion save successful');
    setErrorMessage('');
  };

  const handleNotionSaveError = (error: string) => {
    console.error('❌ Settings: Notion save error:', error);
    setErrorMessage(error);
  };

  const handleNotionSyncSuccess = (data: any) => {
    console.log('✅ Settings: Notion sync successful');
    setSyncedDatabases(data.results || []);
    setSyncStatus('success');
    setErrorMessage('');
  };

  const handleNotionSyncError = (error: string) => {
    console.error('❌ Settings: Notion sync error:', error);
    setSyncStatus('error');
    setErrorMessage(error);
  };

  const handleNotionClearSuccess = () => {
    console.log('✅ Settings: Notion clear successful');
    setNotionApiKey('');
    setDatabaseId('');
    setSyncedDatabases([]);
    setSyncStatus('idle');
    setErrorMessage('');
  };

  const handleNotionClearError = (error: string) => {
    console.error('❌ Settings: Notion clear error:', error);
    setErrorMessage(error);
  };

  // OpenAI event handlers
  const handleSaveChatSettings = async () => {
    console.log('⚙️ Settings: Saving OpenAI settings...');
    
    if (!user) {
      console.error('❌ Settings: No user for OpenAI save');
      return;
    }

    setChatIsLoading(true);
    try {
      if (openaiKey.trim()) {
        const success = await saveIntegration('openai', openaiKey.trim());
        if (success) {
          console.log('✅ Settings: OpenAI save successful');
        }
      } else {
        await deleteIntegration('openai');
        console.log('✅ Settings: OpenAI clear successful');
      }
    } catch (error) {
      console.error('❌ Settings: OpenAI save error:', error);
    } finally {
      setChatIsLoading(false);
    }
  };

  const handleClearChatSettings = async () => {
    console.log('⚙️ Settings: Clearing OpenAI settings...');
    
    setChatIsLoading(true);
    try {
      await deleteIntegration('openai');
      setOpenaiKey('');
      console.log('✅ Settings: OpenAI clear successful');
    } catch (error) {
      console.error('❌ Settings: OpenAI clear error:', error);
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

          {/* Supabase Connection Test */}
          <SupabaseConnectionTest />

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
            syncStatus={syncStatus}
            syncedDatabases={syncedDatabases}
            onSaveSuccess={handleNotionSaveSuccess}
            onSaveError={handleNotionSaveError}
            onSyncSuccess={handleNotionSyncSuccess}
            onSyncError={handleNotionSyncError}
            onClearSuccess={handleNotionClearSuccess}
            onClearError={handleNotionClearError}
          />

          <NotionSetupInstructions />
        </div>
      </div>
    </div>
  );
};

export default Settings;