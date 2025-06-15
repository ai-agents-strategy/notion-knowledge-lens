import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Database, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { SettingsHeader } from "@/components/SettingsHeader";

const Settings = () => {
  const {
    user
  } = useUser();
  const {
    getIntegration,
    saveIntegration,
    deleteIntegration,
    loading: integrationsLoading
  } = useIntegrations();
  const {
    subscription
  } = useSubscriptions();
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState(localStorage.getItem('notion_database_id') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncedDatabases, setSyncedDatabases] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load integration data when available
  useEffect(() => {
    const notionIntegration = getIntegration('notion');
    if (notionIntegration) {
      setNotionApiKey(notionIntegration.api_key || '');
      if (notionIntegration.database_id) {
        setDatabaseId(notionIntegration.database_id);
        localStorage.setItem('notion_database_id', notionIntegration.database_id);
      }
    }
  }, [getIntegration]);

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
      console.log('💾 Attempting to save integration settings...');

      // Save API key and database ID to integrations table
      const success = await saveIntegration('notion', notionApiKey.trim(), databaseId.trim() || undefined);
      if (!success) {
        throw new Error('Failed to save integration to database');
      }

      // Save database ID to localStorage (non-sensitive)
      if (databaseId.trim()) {
        localStorage.setItem('notion_database_id', databaseId.trim());
      } else {
        localStorage.removeItem('notion_database_id');
      }
      console.log('✅ Settings saved successfully');
      toast({
        title: "Settings saved!",
        description: "Your Notion integration settings have been saved securely."
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
      } = await supabase.functions.invoke('notion-sync');
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
      // Clear integrations data
      await deleteIntegration('notion');

      // Clear localStorage data
      localStorage.removeItem('notion_database_id');
      localStorage.removeItem('notion_synced_databases');
      localStorage.removeItem('notion_last_sync');
      setNotionApiKey('');
      setDatabaseId('');
      setSyncedDatabases([]);
      setSyncStatus('idle');
      setErrorMessage('');
      toast({
        title: "Settings cleared",
        description: "All Notion integration settings have been cleared."
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

  if (integrationsLoading) {
    return <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300 text-lg">Loading integrations...</div>
      </div>;
  }
  if (!user) {
    return <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300 text-lg">Please sign in to access settings.</div>
      </div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex w-full">
        {/* Background Pattern - Notion inspired */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(35,131,226,0.05),transparent_50%)]" />
        
        {/* Sidebar */}
        <Sidebar side="left" className="border-r">
          <SidebarContent className="p-6 bg-slate-50">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Settings Navigation</h2>
              <div className="space-y-2">
                <Link to="/settings" className="block">
                  <Button variant="default" size="sm" className="w-full justify-start">
                    <Key className="w-4 h-4 mr-2" />
                    Integrations
                  </Button>
                </Link>
                <Link to="/plan" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Plan
                  </Button>
                </Link>
                <Link to="/organization" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Organization
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <SidebarTrigger />
          
          <div className="relative z-10 p-6 bg-zinc-50 min-h-full">
            <SettingsHeader title="Settings" description="Configure your Notion integration" />

            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {/* Error Alert */}
                {errorMessage && <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>}

                {/* Notion Integration */}
                <SubscriptionGate feature="Notion Integration" description="Connect your Notion workspace to visualize your actual database relationships. This premium feature requires an active subscription.">
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                        <Key className="w-5 h-5" />
                        Notion Integration
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Connect your Notion workspace to visualize your actual database relationships
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="notion-key" className="text-gray-700 dark:text-gray-300">Notion Integration Token</Label>
                        <Input id="notion-key" type="password" placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={notionApiKey} onChange={e => setNotionApiKey(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Your API key is stored securely in your personal account
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="database-id" className="text-gray-700 dark:text-gray-300">Database ID (Optional)</Label>
                        <Input id="database-id" placeholder="32 character database ID" value={databaseId} onChange={e => setDatabaseId(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Specific database ID to focus on (leave empty to discover all accessible databases)
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} disabled={isLoading || !notionApiKey.trim()} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                          <Save className="w-4 h-4 mr-2" />
                          {isLoading ? "Saving..." : "Save Settings"}
                        </Button>

                        <Button onClick={handleSync} disabled={isSyncing || !notionApiKey.trim()} className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50">
                          {isSyncing ? <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </> : <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync Databases
                            </>}
                        </Button>
                        
                        <Button variant="outline" onClick={handleClear} className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                          Clear All
                        </Button>
                      </div>

                      {/* Sync Status */}
                      {syncStatus === 'success' && <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Successfully synced {syncedDatabases.length} databases
                        </div>}

                      {/* Synced Databases Preview */}
                      {syncedDatabases.length > 0 && <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-2">Synced Databases:</h4>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {syncedDatabases.map((db, index) => <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                {db.title?.[0]?.plain_text || 'Untitled Database'}
                              </div>)}
                          </div>
                        </div>}
                    </CardContent>
                  </Card>
                </SubscriptionGate>

                {/* Instructions */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-gray-800 dark:text-gray-200">
                      <Database className="w-5 h-5" />
                      How to Set Up Notion Integration
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Create a Notion Integration</p>
                          <p className="text-gray-600 dark:text-gray-400">Go to notion.so/my-integrations and create a new integration</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Copy the Integration Token</p>
                          <p className="text-gray-600 dark:text-gray-400">Copy the "Internal Integration Token" and paste it above</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Share Databases with Integration</p>
                          <p className="text-gray-600 dark:text-gray-400">In Notion, share your databases with the integration you created</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Save Settings and Sync</p>
                          <p className="text-gray-600 dark:text-gray-400">Save your API key and click "Sync Databases" to fetch your real data</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
export default Settings;
