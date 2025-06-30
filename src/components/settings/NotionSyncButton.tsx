import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface NotionSyncButtonProps {
  notionApiKey: string;
  onSyncSuccess?: (data: { results?: []; nodes?: []; connections?: [] }) => void;
  onSyncError?: (error: string) => void;
}

export const NotionSyncButton = ({ 
  notionApiKey, 
  onSyncSuccess, 
  onSyncError 
}: NotionSyncButtonProps) => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!user) {
      const errorMsg = "Please sign in to sync with Notion.";
      console.error('❌ NotionSyncButton: No user authenticated');
      toast({
        title: "Authentication Required",
        description: errorMsg,
        variant: "destructive"
      });
      onSyncError?.(errorMsg);
      return;
    }
    
    if (!notionApiKey.trim()) {
      const errorMsg = "Please enter and save your Notion API key before syncing.";
      console.error('❌ NotionSyncButton: No API key available');
      toast({
        title: "API Key Required",
        description: errorMsg,
        variant: "destructive"
      });
      onSyncError?.(errorMsg);
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('notion-sync', {
        body: { apiKey: notionApiKey.trim() }
      });
      
      if (error) {
        console.error('❌ NotionSyncButton: Edge function error:', error);
        throw new Error(error.message || 'Failed to sync with Notion');
      }
      
      if (data?.error) {
        console.error('❌ NotionSyncButton: Notion API error:', data.error);
        throw new Error(data.error);
      }
      
      // Save synced data to localStorage
      localStorage.setItem('notion_synced_databases', JSON.stringify(data.results || []));
      localStorage.setItem('notion_last_sync', new Date().toISOString());
      if (data.nodes && data.connections) {
        localStorage.setItem('notion_graph_nodes', JSON.stringify(data.nodes));
        localStorage.setItem('notion_graph_connections', JSON.stringify(data.connections));
      }
      
      toast({
        title: "🎉 Sync Successful!",
        description: `Successfully synced ${data.results?.length || 0} databases and ${data.nodes?.length || 0} pages.`,
      });
      
      onSyncSuccess?.(data);
    } catch (error) {
      console.error('❌ NotionSyncButton: Sync failed:', error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred during sync.";
      
      toast({
        title: "❌ Sync Failed",
        description: errorMsg,
        variant: "destructive"
      });
      onSyncError?.(errorMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
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
  );
};
