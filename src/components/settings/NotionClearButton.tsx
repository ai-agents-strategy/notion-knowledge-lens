import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useIntegrations } from "@/hooks/useIntegrations";

interface NotionClearButtonProps {
  onClearSuccess?: () => void;
  onClearError?: (error: string) => void;
}

export const NotionClearButton = ({ 
  onClearSuccess, 
  onClearError 
}: NotionClearButtonProps) => {
  const { deleteIntegration } = useIntegrations();

  const handleClear = async () => {
    console.log('🔴 NotionClearButton: Clear operation started');
    
    try {
      // Clear integration data
      const success = await deleteIntegration('notion');
      
      if (success) {
        // Clear localStorage data
        localStorage.removeItem('notion_synced_databases');
        localStorage.removeItem('notion_last_sync');
        localStorage.removeItem('notion_graph_nodes');
        localStorage.removeItem('notion_graph_connections');
        
        console.log('✅ NotionClearButton: Clear successful');
        
        toast({
          title: "🧹 Settings Cleared",
          description: "All Notion integration settings have been cleared."
        });
        
        onClearSuccess?.();
      } else {
        throw new Error('Clear operation failed');
      }
    } catch (error) {
      console.error('❌ NotionClearButton: Clear failed:', error);
      const errorMsg = error instanceof Error ? error.message : "Failed to clear settings.";
      
      toast({
        title: "❌ Clear Failed",
        description: errorMsg,
        variant: "destructive"
      });
      onClearError?.(errorMsg);
    }
    
    console.log('🔴 NotionClearButton: Clear operation ended');
  };

  return (
    <Button variant="outline" onClick={handleClear}>
      Clear All
    </Button>
  );
};