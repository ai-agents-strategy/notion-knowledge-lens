import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";

interface ControlPanelProps {
  showConnectionLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  connectionStrengthFilter: number;
  onConnectionStrengthChange: (strength: number) => void;
  nodeCount: number;
  connectionCount: number;
  isolatedNodeCount: number;
  isSyncing: boolean;
  onSync: () => void;
  usingRealData: boolean;
  // Auth props
  isSignedIn: boolean;
  authIsLoading: boolean;
}

export const ControlPanel = ({
  showConnectionLabels,
  onShowLabelsChange,
  connectionStrengthFilter,
  onConnectionStrengthChange,
  nodeCount,
  connectionCount,
  isolatedNodeCount,
  isSyncing,
  onSync,
  usingRealData,
  isSignedIn,
  authIsLoading,
}: ControlPanelProps) => {
  const hasNotionApiKey = !!localStorage.getItem('notion_api_key');

  return (
    <div className="flex flex-col h-full">
      <Card className="border-0 shadow-none bg-transparent flex-1">
        <CardHeader className="px-0">
          <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-slate-950">Knowledge Graph</CardTitle>
          <CardDescription className="text-slate-600">
            Customize your knowledge graph view
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-0">
          {/* Sync Button */}
          <div className="space-y-3">
            <Button 
              onClick={onSync} 
              disabled={isSyncing || !isSignedIn || authIsLoading || !hasNotionApiKey} 
              variant="outline" 
              size="sm" 
              className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50" 
              title={!hasNotionApiKey ? "Configure your Notion API key in Settings first" : ""}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Notion
                </>
              )}
            </Button>
          </div>

          {/* Data Source Indicator */}
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {usingRealData ? "Real Notion Pages" : "Sample SEO Data"}
            </span>
            <div className={`w-2 h-2 rounded-full ${usingRealData ? "bg-green-500" : "bg-primary"}`} />
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-slate-700">{nodeCount}</div>
              <div className="text-xs text-slate-500">Pages</div>
            </div>
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{connectionCount}</div>
              <div className="text-xs text-slate-500">Relations</div>
            </div>
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-red-500">{isolatedNodeCount}</div>
              <div className="text-xs text-slate-500">Isolated</div>
            </div>
          </div>

          <Separator />

          {/* Connection Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Relationship Options</h3>
            
            <div className="flex items-center justify-between">
              <label htmlFor="show-labels-switch" className="text-sm text-slate-600">Show Labels</label>
              <Switch id="show-labels-switch" checked={showConnectionLabels} onCheckedChange={onShowLabelsChange} disabled={connectionCount === 0} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* SAAS CTA */}
      <div className="mt-auto p-4 border-t border-slate-200">
        <a 
          href="https://idb2b.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 group text-center"
        >
          {/* Logo Row */}
          <div className="flex justify-center">
            <img 
              src="/Icon.png" 
              alt="IDB2B Logo" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // Fallback to a simple colored circle if logo doesn't exist
                const img = e.currentTarget as HTMLImageElement;
                const fallback = img.nextElementSibling as HTMLElement;
                img.style.display = 'none';
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            <div 
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full items-center justify-center text-white text-sm font-bold hidden"
            >
              IDB2B
            </div>
          </div>
          
          {/* Title Row */}
          <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
            WhatsApp for B2B?
          </p>
          
          {/* Subtitle Row */}
          <p className="text-xs text-slate-500 group-hover:text-slate-600">
            Discover IDB2B solutions
          </p>
        </a>
      </div>
    </div>
  );
};