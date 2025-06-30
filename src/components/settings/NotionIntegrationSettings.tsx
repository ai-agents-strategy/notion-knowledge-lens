import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, CheckCircle, Database, HardDrive } from "lucide-react";
import { NotionSaveButton } from "./NotionSaveButton";
import { NotionSyncButton } from "./NotionSyncButton";
import { NotionClearButton } from "./NotionClearButton";
import { useIntegrations } from "@/hooks/useIntegrations";

interface SyncedDatabase {
  title?: Array<{ plain_text: string }>;
}

interface SyncData {
  results?: SyncedDatabase[];
  nodes?: Record<string, unknown>[];
  connections?: Record<string, unknown>[];
}

interface NotionIntegrationSettingsProps {
  notionApiKey: string;
  setNotionApiKey: (key: string) => void;
  databaseId: string;
  setDatabaseId: (id: string) => void;
  syncStatus: 'idle' | 'success' | 'error';
  syncedDatabases: SyncedDatabase[];
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
  onSyncSuccess?: (data: SyncData) => void;
  onSyncError?: (error: string) => void;
  onClearSuccess?: () => void;
  onClearError?: (error: string) => void;
}

export const NotionIntegrationSettings = ({
  notionApiKey,
  setNotionApiKey,
  databaseId,
  setDatabaseId,
  syncStatus,
  syncedDatabases,
  onSaveSuccess,
  onSaveError,
  onSyncSuccess,
  onSyncError,
  onClearSuccess,
  onClearError,
}: NotionIntegrationSettingsProps) => {
  const { supabaseAvailable } = useIntegrations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Notion Integration
        </CardTitle>
        <CardDescription>
          Connect your Notion workspace to visualize your actual database relationships.
          <span className="flex items-center gap-1 mt-1 text-blue-600">
            <Database className="w-3 h-3" />
            Stored in secure database
          </span>
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
            Your API key is stored securely in the database
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
          <NotionSaveButton
            notionApiKey={notionApiKey}
            databaseId={databaseId}
            onSaveSuccess={onSaveSuccess}
            onSaveError={onSaveError}
          />

          <NotionSyncButton
            notionApiKey={notionApiKey}
            onSyncSuccess={onSyncSuccess}
            onSyncError={onSyncError}
          />
          
          <NotionClearButton
            onClearSuccess={onClearSuccess}
            onClearError={onClearError}
          />
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

        {/* Database Status Indicator */}
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-200">
            <Database className="w-4 h-4 inline mr-1" />
            Connected to database - your API keys are stored securely and will sync across devices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
