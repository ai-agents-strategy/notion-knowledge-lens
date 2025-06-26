import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Bot, Save } from "lucide-react";

interface ChatApiSettingsProps {
  openaiKey: string;
  setOpenaiKey: (key: string) => void;
  mem0Key: string;
  setMem0Key: (key: string) => void;
  handleSaveChatSettings: () => void;
  handleClearChatSettings: () => void;
}

export const ChatApiSettings = ({
  openaiKey,
  setOpenaiKey,
  mem0Key,
  setMem0Key,
  handleSaveChatSettings,
  handleClearChatSettings,
}: ChatApiSettingsProps) => {
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showMem0Key, setShowMem0Key] = useState(false);

  return (
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
  );
};
