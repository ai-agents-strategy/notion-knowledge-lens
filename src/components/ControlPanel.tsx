
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";

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
  onSync
}: ControlPanelProps) => {
  const { isSignedIn, isLoaded } = useUser();
  const { subscription } = useSubscriptions();
  
  const authIsLoading = !isLoaded;
  const hasAccess = subscription && subscription.plan;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          SEO Graph Controls
        </CardTitle>
        <CardDescription className="text-slate-600">
          Customize your knowledge graph view
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 px-0">
        {/* Sync Button */}
        <div className="space-y-3">
          <Button
            onClick={onSync}
            disabled={isSyncing || !isSignedIn || authIsLoading || !hasAccess}
            variant="outline"
            size="sm"
            className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50"
            title={!hasAccess ? "Sign up for free trial to use Notion sync" : ""}
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
            <Switch 
              id="show-labels-switch" 
              checked={showConnectionLabels} 
              onCheckedChange={onShowLabelsChange} 
              disabled={connectionCount === 0} 
            />
          </div>
        </div>

        <Separator />

        {/* Legend */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-700">Relationship Types</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-400 rounded"></div>
              <span className="text-slate-600">Direct Relation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-400 rounded"></div>
              <span className="text-slate-600">Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-yellow-400 rounded"></div>
              <span className="text-slate-600">Dependency</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
