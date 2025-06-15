import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
interface ControlPanelProps {
  showConnectionLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  connectionStrengthFilter: number;
  onConnectionStrengthChange: (strength: number) => void;
  nodeCount: number;
  connectionCount: number;
  isolatedNodeCount: number;
}
export const ControlPanel = ({
  showConnectionLabels,
  onShowLabelsChange,
  connectionStrengthFilter,
  onConnectionStrengthChange,
  nodeCount,
  connectionCount,
  isolatedNodeCount
}: ControlPanelProps) => {
  return <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white h-fit">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          SEO Graph Controls
        </CardTitle>
        <CardDescription className="text-slate-300">
          Customize your knowledge graph view
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 bg-slate-50">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-black-400">{nodeCount}</div>
            <div className="text-xs text-slate-300">Pages</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400 ">{connectionCount}</div>
            <div className="text-xs text-slate-300">Relations</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">{isolatedNodeCount}</div>
            <div className="text-xs text-slate-300">Isolated</div>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Connection Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Relationship Options</h3>
          
          <div className="flex items-center justify-between">
            <label htmlFor="show-labels-switch" className="text-sm text-slate-300">Show Labels</label>
            <Switch id="show-labels-switch" checked={showConnectionLabels} onCheckedChange={onShowLabelsChange} disabled={connectionCount === 0} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-slate-300">Min Strength</label>
              <span className="text-xs text-slate-400">{connectionStrengthFilter.toFixed(1)}</span>
            </div>
            <Slider value={[connectionStrengthFilter]} onValueChange={value => onConnectionStrengthChange(value[0])} max={1} min={0} step={0.1} className="w-full" disabled={connectionCount === 0} />
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Legend */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-200">Relationship Types</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-400 rounded"></div>
              <span className="text-slate-300">Direct Relation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-400 rounded"></div>
              <span className="text-slate-300">Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-yellow-400 rounded"></div>
              <span className="text-slate-300">Dependency</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};