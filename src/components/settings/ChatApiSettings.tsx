import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Bot, Save, Database, HardDrive } from "lucide-react";
import { useIntegrations } from "@/hooks/useIntegrations";

interface ChatApiSettingsProps {
  openaiKey: string;
  setOpenaiKey: (key: string) => void;
  handleSaveChatSettings: () => void;
  handleClearChatSettings: () => void;
  isLoading: boolean;
}

export const ChatApiSettings = ({
  openaiKey,
  setOpenaiKey,
  handleSaveChatSettings,
  handleClearChatSettings,
  isLoading,
}: ChatApiSettingsProps) => {
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const { supabaseAvailable } = useIntegrations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Chat API Settings
        </CardTitle>
        <CardDescription>
          Configure your AI chat experience with enhanced models.
          <span className="flex items-center gap-1 mt-1 text-blue-600">
            {supabaseAvailable ? (
              <>
                <Database className="w-3 h-3" />
                Stored in secure database
              </>
            ) : (
              <>
                <HardDrive className="w-3 h-3" />
                Stored in local storage (temporary)
              </>
            )}
          </span>
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
            Required for enhanced AI chat features
          </p>
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Note:</p>
          <p>• API key is stored {supabaseAvailable ? 'securely in the database' : 'in your browser\'s local storage'}</p>
          <p>• Without an API key, you'll use the free model</p>
          <p>• Enhanced features include better responses and context understanding</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSaveChatSettings} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : `Save to ${supabaseAvailable ? 'Database' : 'Local Storage'}`}
          </Button>
          <Button variant="outline" onClick={handleClearChatSettings} disabled={isLoading}>
            Clear Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};