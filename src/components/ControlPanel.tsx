
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Settings, LogIn } from "lucide-react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  onAuthAction: () => void;
  // Appearance props
  categoryColors: Record<string, string>;
  onCategoryColorsChange: (colors: Record<string, string>) => void;
  connectionColors: Record<string, string>;
  onConnectionColorsChange: (colors: Record<string, string>) => void;
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
  onAuthAction,
  categoryColors,
  onCategoryColorsChange,
  connectionColors,
  onConnectionColorsChange,
}: ControlPanelProps) => {
  const {
    subscription
  } = useSubscriptions();
  const navigate = useNavigate();
  const hasAccess = subscription && subscription.plan;

  const handleCategoryColorChange = (category: string, color: string) => {
    onCategoryColorsChange({ ...categoryColors, [category]: color });
  };

  const handleConnectionColorChange = (type: string, color: string) => {
    onConnectionColorsChange({ ...connectionColors, [type]: color });
  };

  return <div className="flex flex-col h-full">
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
            <Button onClick={onSync} disabled={isSyncing || !isSignedIn || authIsLoading || !hasAccess} variant="outline" size="sm" className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50" title={!hasAccess ? "Sign up for free trial to use Notion sync" : ""}>
              {isSyncing ? <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </> : <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Notion
                </>}
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

          {/* Settings Button */}
          <div className="space-y-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')} disabled={!isSignedIn || authIsLoading} className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
              <Switch id="show-labels-switch" checked={showConnectionLabels} onCheckedChange={onShowLabelsChange} disabled={connectionCount === 0} />
            </div>
          </div>

          <Separator />

          {/* Appearance Customization */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="appearance">
              <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline">Graph Appearance</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Node Category Colors</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {Object.entries(categoryColors).map(([category, color]) => (
                      <div key={category} className="flex items-center justify-between gap-2">
                        <Label htmlFor={`color-${category}`} className="text-sm text-slate-600 capitalize flex-1 truncate">{category.replace(/_/g, ' ')}</Label>
                        <Input
                          id={`color-${category}`}
                          type="color"
                          value={color}
                          onChange={(e) => handleCategoryColorChange(category, e.target.value)}
                          className="p-1 h-8 w-14 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Separator />

                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Connection Type Colors</h4>
                  <div className="space-y-2">
                    {Object.entries(connectionColors).map(([type, color]) => (
                      <div key={type} className="flex items-center justify-between gap-2">
                        <Label htmlFor={`color-${type}`} className="text-sm text-slate-600 capitalize">{type}</Label>
                         <Input
                          id={`color-${type}`}
                          type="color"
                          value={color}
                          onChange={(e) => handleConnectionColorChange(type, e.target.value)}
                          className="p-1 h-8 w-14 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
      
      {/* Auth section at bottom */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        {authIsLoading ? (
          <div className="w-full h-8 bg-muted rounded animate-pulse" />
        ) : isSignedIn ? (
          <div className="flex justify-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-primary text-primary hover:bg-primary/10" 
            onClick={onAuthAction}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login / Sign Up
          </Button>
        )}
      </div>
    </div>;
};
