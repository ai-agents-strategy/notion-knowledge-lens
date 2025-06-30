import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIntegrations } from "@/hooks/useIntegrations";

interface NotionSaveButtonProps {
  notionApiKey: string;
  databaseId: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export const NotionSaveButton = ({ 
  notionApiKey, 
  databaseId, 
  onSaveSuccess, 
  onSaveError 
}: NotionSaveButtonProps) => {
  const { user } = useAuth();
  const { saveIntegration, supabaseAvailable } = useIntegrations();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    console.log('🔵 NotionSaveButton: Save operation started');
    console.log('🔵 NotionSaveButton: API Key length:', notionApiKey.trim().length);
    console.log('🔵 NotionSaveButton: Database ID:', databaseId.trim() || 'none');
    console.log('🔵 NotionSaveButton: User present:', !!user);
    console.log('🔵 NotionSaveButton: Supabase available:', supabaseAvailable);
    
    if (!user) {
      const errorMsg = "Please sign in to save settings.";
      console.error('❌ NotionSaveButton: No user authenticated');
      toast({
        title: "Authentication Required",
        description: errorMsg,
        variant: "destructive"
      });
      onSaveError?.(errorMsg);
      return;
    }
    
    if (!notionApiKey.trim()) {
      const errorMsg = "Please enter your Notion API key before saving.";
      console.error('❌ NotionSaveButton: No API key provided');
      toast({
        title: "API Key Required",
        description: errorMsg,
        variant: "destructive"
      });
      onSaveError?.(errorMsg);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔵 NotionSaveButton: Calling saveIntegration...');
      const startTime = Date.now();
      
      const success = await saveIntegration('notion', notionApiKey.trim(), databaseId.trim() || undefined);
      
      const endTime = Date.now();
      console.log('🔵 NotionSaveButton: saveIntegration completed in', endTime - startTime, 'ms');
      console.log('🔵 NotionSaveButton: saveIntegration result:', success);
      
      if (success) {
        console.log('✅ NotionSaveButton: Save successful');
        onSaveSuccess?.();
      } else {
        throw new Error('Save operation returned false');
      }
    } catch (error) {
      console.error('❌ NotionSaveButton: Save failed:', error);
      const errorMsg = error instanceof Error ? error.message : "Failed to save settings. Please try again.";
      onSaveError?.(errorMsg);
    } finally {
      setIsLoading(false);
      console.log('🔵 NotionSaveButton: Save operation ended');
    }
  };

  return (
    <Button 
      onClick={handleSave} 
      disabled={isLoading || !notionApiKey.trim()}
    >
      <Save className="w-4 h-4 mr-2" />
      {isLoading ? "Saving..." : `Save to ${supabaseAvailable ? 'Database' : 'Local Storage'}`}
    </Button>
  );
};