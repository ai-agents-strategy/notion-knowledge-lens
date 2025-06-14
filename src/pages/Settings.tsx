import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Key, Database, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [notionApiKey, setNotionApiKey] = useState(
    localStorage.getItem('notion_api_key') || ''
  );
  const [databaseId, setDatabaseId] = useState(
    localStorage.getItem('notion_database_id') || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncedDatabases, setSyncedDatabases] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSave = () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (notionApiKey.trim()) {
        localStorage.setItem('notion_api_key', notionApiKey.trim());
      }
      if (databaseId.trim()) {
        localStorage.setItem('notion_database_id', databaseId.trim());
      }
      
      toast({
        title: "Settings saved!",
        description: "Your Notion integration settings have been saved successfully.",
      });
    } catch (error) {
      const errorMsg = "Failed to save settings. Please try again.";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage('');

    try {
      console.log('Starting Notion sync via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('notion-sync');

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to sync with Notion');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Notion sync success:', data);
      
      setSyncedDatabases(data.results || []);
      setSyncStatus('success');
      
      // Save synced data to localStorage
      localStorage.setItem('notion_synced_databases', JSON.stringify(data.results || []));
      localStorage.setItem('notion_last_sync', new Date().toISOString());

      toast({
        title: "Sync successful!",
        description: `Found ${data.results?.length || 0} databases in your Notion workspace.`,
      });

    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      
      let errorMsg = "Unknown error occurred during sync.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: "Sync failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('notion_api_key');
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
      description: "All Notion integration settings have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Graph
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-300 text-lg">
              Configure your Notion integration
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <div className="grid gap-6">
          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-700/50 text-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Notion Integration */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <Key className="w-5 h-5" />
                Notion Integration
              </CardTitle>
              <CardDescription className="text-slate-300">
                Connect your Notion workspace to visualize your actual database relationships
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notion-key" className="text-slate-200">Notion Integration Token</Label>
                <Input
                  id="notion-key"
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  className="bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Your API key is now stored securely in Supabase and used server-side
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="database-id" className="text-slate-200">Database ID (Optional)</Label>
                <Input
                  id="database-id"
                  placeholder="32 character database ID"
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                  className="bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Specific database ID to focus on (leave empty to discover all accessible databases)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>

                <Button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50"
                >
                  Clear All
                </Button>
              </div>

              {/* Sync Status */}
              {syncStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Successfully synced {syncedDatabases.length} databases
                </div>
              )}

              {/* Synced Databases Preview */}
              {syncedDatabases.length > 0 && (
                <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="text-slate-200 font-medium mb-2">Synced Databases:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {syncedDatabases.map((db, index) => (
                      <div key={index} className="text-xs text-slate-400 flex items-center gap-2">
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
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-200">
                <Database className="w-5 h-5" />
                How to Set Up Notion Integration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <p className="font-medium">Create a Notion Integration</p>
                    <p className="text-slate-400">Go to notion.so/my-integrations and create a new integration</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <p className="font-medium">Copy the Integration Token</p>
                    <p className="text-slate-400">Copy the "Internal Integration Token" and paste it above</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="font-medium">Share Databases with Integration</p>
                    <p className="text-slate-400">In Notion, share your databases with the integration you created</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <p className="font-medium">Save Settings and Sync</p>
                    <p className="text-slate-400">Save your API key and click "Sync Databases" to fetch your real data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
