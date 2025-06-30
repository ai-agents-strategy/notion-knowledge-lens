import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle, XCircle, Database, HardDrive } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIntegrations } from "@/hooks/useIntegrations";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { ChatApiSettings } from "@/components/settings/ChatApiSettings";
import { NotionIntegrationSettings } from "@/components/settings/NotionIntegrationSettings";
import { NotionSetupInstructions } from "@/components/settings/NotionSetupInstructions";

const Settings = () => {
  const { user } = useAuth();
  const { getIntegration, saveIntegration, deleteIntegration, loading: integrationsLoading, supabaseAvailable } = useIntegrations();
  
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

      // Load synced databases from localStorage
      const storedSyncedDatabases = localStorage.getItem('notion_synced_databases');
      if (storedSyncedDatabases) {
        try {
          const parsed = JSON.parse(storedSyncedDatabases);
          setSyncedDatabases(parsed);
        } catch (error) {
          console.error('❌ Settings: Error parsing synced databases:', error);
        }
      }
    }
  }, [integrationsLoading, getIntegration, supabaseAvailable]);

  // Notion event handlers
  const handleNotionSaveSuccess = () => {
    setErrorMessage('');
  };

  const handleNotionSaveError = (error: string) => {
    console.error('❌ Settings: Notion save error:', error);
    setErrorMessage(error);
  };

  const handleNotionSyncSuccess = (data: { results?: Array<{ title?: Array<{ plain_text: string }> }> }) => {
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
    if (!user) {
      console.error('❌ Settings: No user for OpenAI save');
      return;
    }

    setChatIsLoading(true);
    try {
      if (openaiKey.trim()) {
        await saveIntegration('openai', openaiKey.trim());
      } else {
        await deleteIntegration('openai');
      }
    } catch (error) {
      console.error('❌ Settings: OpenAI save error:', error);
    } finally {
      setChatIsLoading(false);
    }
  };

  const handleClearChatSettings = async () => {
    setChatIsLoading(true);
    try {
      await deleteIntegration('openai');
      setOpenaiKey('');
    } catch (error) {
      console.error('❌ Settings: OpenAI clear error:', error);
    } finally {
      setChatIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsSidebar />
      <main className="flex-1">
        <SettingsHeader 
          title="Integrations" 
          description="Configure your integrations and API settings" 
        />

        <div className="mx-auto px-6 pb-8">
          <div className="space-y-6">
            {/* Storage Status Alert */}
            <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-600" />
                <strong>Database Connected:</strong> API keys are being saved to the secure database.
              </div>
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

          <ChatApiSettings
            openaiKey={openaiKey}
            setOpenaiKey={setOpenaiKey}
            handleSaveChatSettings={handleSaveChatSettings}
            handleClearChatSettings={handleClearChatSettings}
            isLoading={chatIsLoading}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="space-y-6">
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
      </main>
    </div>
  );
};

export default Settings;
