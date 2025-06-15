
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, EyeOff, Save, Key } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ChatSettingsProps {
  onSettingsChange: (settings: { hasOpenAI: boolean; hasMem0: boolean }) => void;
}

export const ChatSettings = ({ onSettingsChange }: ChatSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [mem0Key, setMem0Key] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showMem0Key, setShowMem0Key] = useState(false);

  useEffect(() => {
    // Load keys from localStorage
    const storedOpenaiKey = localStorage.getItem('openai_api_key');
    const storedMem0Key = localStorage.getItem('mem0_api_key');
    
    if (storedOpenaiKey) setOpenaiKey(storedOpenaiKey);
    if (storedMem0Key) setMem0Key(storedMem0Key);

    // Notify parent about current settings
    onSettingsChange({
      hasOpenAI: !!storedOpenaiKey,
      hasMem0: !!storedMem0Key
    });
  }, [onSettingsChange]);

  const handleSave = () => {
    try {
      if (openaiKey.trim()) {
        localStorage.setItem('openai_api_key', openaiKey.trim());
      } else {
        localStorage.removeItem('openai_api_key');
      }

      if (mem0Key.trim()) {
        localStorage.setItem('mem0_api_key', mem0Key.trim());
      } else {
        localStorage.removeItem('mem0_api_key');
      }

      onSettingsChange({
        hasOpenAI: !!openaiKey.trim(),
        hasMem0: !!mem0Key.trim()
      });

      toast({
        title: "Settings saved!",
        description: "Your API keys have been saved securely in your browser."
      });

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('mem0_api_key');
    setOpenaiKey('');
    setMem0Key('');
    onSettingsChange({ hasOpenAI: false, hasMem0: false });
    
    toast({
      title: "Settings cleared",
      description: "All API keys have been removed."
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Settings className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Chat API Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
