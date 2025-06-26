import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Save, RefreshCw, CheckCircle, Database } from "lucide-react";

interface NotionIntegrationSettingsProps {
  notionApiKey: string;
  setNotionApiKey: (key: string) => void;
  databaseId: string;
  setDatabaseId: (id: string) => void;
  isLoading: boolean;
  isSyncing: boolean;
  syncStatus: 'idle' | 'success' | 'error';
  syncedDatabases: Array<{ title?: Array<{ plain_text: string }> }>;
  handleSave: () => void;
  handleSync: () => void;
  handleClear: () => void;
}

export const NotionIntegrationSettings = ({
  notionApiKey,
  setNotionApiKey,
  databaseId,
  setDatabaseId,
  isLoading,
  isSyncing,
  syncStatus,
  syncedDatabases,
  handleSave,
  handleSync,
  handleClear,
}: NotionIntegrationSettingsProps) => {
  return (
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
  );
};
