
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface ControlPanelProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  showConnectionLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  connectionStrengthFilter: number;
  onConnectionStrengthChange: (strength: number) => void;
  nodeCount: number;
  connectionCount: number;
  isolatedNodeCount: number;
}

export const ControlPanel = ({
  categories,
  selectedCategories,
  onCategoryChange,
  showConnectionLabels,
  onShowLabelsChange,
  connectionStrengthFilter,
  onConnectionStrengthChange,
  nodeCount,
  connectionCount,
  isolatedNodeCount,
}: ControlPanelProps) => {
  const categoryColors: Record<string, string> = {
    seo: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    content: "bg-green-500/20 text-green-300 border-green-500/30",
    technical: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    offpage: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    local: "bg-red-500/20 text-red-300 border-red-500/30",
    ecommerce: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    mobile: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    analytics: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    research: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    // Legacy categories for backward compatibility
    work: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    contacts: "bg-green-500/20 text-green-300 border-green-500/30",
    knowledge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    planning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    finance: "bg-red-500/20 text-red-300 border-red-500/30",
    creativity: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (category: string) => {
    onCategoryChange(selectedCategories.filter(c => c !== category));
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white h-fit">
      <CardHeader>
        <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          SEO Graph Controls
        </CardTitle>
        <CardDescription className="text-slate-300">
          Filter and customize your knowledge graph
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{nodeCount}</div>
            <div className="text-xs text-slate-300">Pages</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{connectionCount}</div>
            <div className="text-xs text-slate-300">Relations</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">{isolatedNodeCount}</div>
            <div className="text-xs text-slate-300">Isolated</div>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-200">Filter by Categories</h3>
          
          {/* Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={`capitalize ${
                    categoryColors[category] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
                  }`}
                >
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Category Selector */}
          <Select onValueChange={handleCategoryToggle}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select categories to filter..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-white z-50">
              {categories.map((category) => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="capitalize hover:bg-slate-600 focus:bg-slate-600"
                  disabled={selectedCategories.includes(category)}
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCategoryChange([])}
              className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCategoryChange(categories)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
            >
              Select All
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Connection Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Relationship Options</h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">Show Labels</label>
            <Switch
              checked={showConnectionLabels}
              onCheckedChange={onShowLabelsChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-slate-300">Min Strength</label>
              <span className="text-xs text-slate-400">{connectionStrengthFilter.toFixed(1)}</span>
            </div>
            <Slider
              value={[connectionStrengthFilter]}
              onValueChange={(value) => onConnectionStrengthChange(value[0])}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
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

        {/* Reset Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            onCategoryChange([]);
            onConnectionStrengthChange(0);
            onShowLabelsChange(true);
          }}
          className="w-full bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
        >
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
};
