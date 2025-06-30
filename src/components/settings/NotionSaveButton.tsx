import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
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
  const { user } = useUser();
  const { saveIntegration, supabaseAvailable } = useIntegrations();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
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
    
    if (!supabaseAvailable) {
      toast({
        title: "Database Not Connected",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const success = await saveIntegration('notion', notionApiKey.trim(), databaseId.trim() || undefined);
      if (success) {
        toast({
          title: "✅ Settings Saved",
          description: "Your Notion integration has been successfully saved.",
        });
        onSaveSuccess?.();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error('❌ NotionSaveButton: Save failed:', errorMsg);
      toast({
        title: "❌ Save Failed",
        description: "Could not save settings to the database. Please try again.",
        variant: "destructive",
      });
      onSaveError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSave} 
      disabled={isLoading || !notionApiKey.trim()}
    >
      <Save className="w-4 h-4 mr-2" />
      {isLoading ? "Saving..." : "Save to Database"}
    </Button>
  );
};
