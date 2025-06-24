import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Database, Save, RefreshCw, CheckCircle, AlertCircle, Eye, EyeOff, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { SettingsSidebar } from "@/components/SettingsSidebar";

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
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showMem0Key, setShowMem0Key] = useState(false);

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

            {/* Chat API Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Chat API Settings
                </CardTitle>
                <CardDescription>
                  Configure your AI chat experience with enhanced models and memory features.
                  Your API keys are stored securely in your browser's localStorage.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="relative">
                    <Input
                      id="openai-key"
                      type={showOpenaiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    >
                      {showOpenaiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Required for enhanced AI with memory features
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mem0-key">Mem0 API Key</Label>
                  <div className="relative">
                    <Input
                      id="mem0-key"
                      type={showMem0Key ? "text" : "password"}
                      placeholder="m0-..."
                      value={mem0Key}
                      onChange={(e) => setMem0Key(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowMem0Key(!showMem0Key)}
                    >
                      {showMem0Key ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Required for memory-enhanced conversations
                  </p>
                </div>

                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Note:</p>
                  <p>• Keys are stored securely in your browser</p>
                  <p>• Both keys are required for memory features</p>
                  <p>• Without keys, you'll use the free model</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveChatSettings}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Chat Settings
                  </Button>
                  <Button variant="outline" onClick={handleClearChatSettings}>
                    Clear Chat Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notion Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Notion Integration
                </CardTitle>
                <CardDescription>
                  Connect your Notion workspace to visualize your actual database relationships.
                  Your API key is stored securely in your browser's localStorage.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="notion-key">Notion Integration Token</Label>
                  <Input
                    id="notion-key"
                    type="password"
                    placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={notionApiKey}
                    onChange={(e) => setNotionApiKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Your API key is stored securely in your browser's localStorage
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database-id">Database ID (Optional)</Label>
                  <Input
                    id="database-id"
                    placeholder="32 character database ID"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Specific database ID to focus on (leave empty to discover all accessible databases)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !notionApiKey.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>

                  <Button
                    onClick={handleSync}
                    disabled={isSyncing || !notionApiKey.trim()}
                    variant="outline"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Databases
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={handleClear}>
                    Clear All
                  </Button>
                </div>

                {/* Sync Status */}
                {syncStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Successfully synced {syncedDatabases.length} databases
                  </div>
                )}

                {/* Synced Databases Preview */}
                {syncedDatabases.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Synced Databases:</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {syncedDatabases.map((db, index) => (
                        <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Database className="w-3 h-3" />
                          {db.title?.[0]?.plain_text || 'Untitled Database'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  How to Set Up Notion Integration
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <p className="font-medium">Create a Notion Integration</p>
                      <p className="text-gray-600">Go to notion.so/my-integrations and create a new integration</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <p className="font-medium">Copy the Integration Token</p>
                      <p className="text-gray-600">Copy the "Internal Integration Token" and paste it above</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <p className="font-medium">Share Databases with Integration</p>
                      <p className="text-gray-600">In Notion, share your databases with the integration you created</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                    <div>
                      <p className="font-medium">Save Settings and Sync</p>
                      <p className="text-gray-600">Save your API key and click "Sync Databases" to fetch your real data</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
