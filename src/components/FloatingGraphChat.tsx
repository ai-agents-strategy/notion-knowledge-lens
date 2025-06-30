import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageCircle, Minimize2, Maximize2, X, Bot } from "lucide-react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { toast } from "@/components/ui/use-toast";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { convertMarkdownToHtml } from "@/utils/markdownToHtml";
import { useIntegrations } from "@/hooks/useIntegrations";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingGraphChatProps {
  nodes: DatabaseNode[];
  connections: DatabaseConnection[];
}

export const FloatingGraphChat = ({ nodes, connections }: FloatingGraphChatProps) => {
  const supabase = useSupabaseClient();
  const { getIntegration } = useIntegrations();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m here to help you understand and analyze your knowledge graph. Ask me about your Notion workspace structure, connections between pages, or any insights you\'d like to discover!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpenAI, setHasOpenAI] = useState(false);

  useEffect(() => {
    // Check for OpenAI API key in database
    const openaiIntegration = getIntegration('openai');
    setHasOpenAI(!!openaiIntegration?.api_key);
  }, [isOpen, getIntegration]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !supabase) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const openaiIntegration = getIntegration('openai');
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: inputMessage,
          graphData: { nodes, connections },
          useEnhancedModel: hasOpenAI,
          apiKeys: hasOpenAI ? {
            openai: openaiIntegration?.api_key
          } : undefined
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Floating icon when minimized
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white relative"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
          {hasOpenAI && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </Button>
      </div>
    );
  }

  // Chat window styles based on full screen state
  const chatWindowClasses = isFullScreen
    ? "fixed inset-4 z-50 bg-white rounded-lg shadow-2xl"
    : "fixed bottom-6 right-6 w-96 h-[500px] z-50 bg-white rounded-lg shadow-2xl";

  return (
    <div className={chatWindowClasses}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4 flex-row items-center justify-between space-y-0 flex-shrink-0 border-b">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg">Graph Insights Chat</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={hasOpenAI ? "default" : "secondary"} className="text-xs">
                  <Bot className="w-3 h-3 mr-1" />
                  {hasOpenAI ? "Enhanced AI" : "Free Model"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="h-8 w-8 p-0"
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 p-6 min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-lg shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 text-gray-900 border'
                    }`}
                  >
                    <div 
                      className="text-sm prose prose-sm max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: convertMarkdownToHtml(message.content) 
                      }}
                    />
                    <p className={`text-xs mt-3 pt-2 border-t ${
                      message.role === 'user' 
                        ? 'opacity-70 border-blue-400' 
                        : 'opacity-50 border-gray-200'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-3 pt-2 border-t flex-shrink-0">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your knowledge graph..."
              disabled={isLoading}
              className="flex-1 h-10"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="h-10 px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
