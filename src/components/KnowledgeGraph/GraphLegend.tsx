
import React from 'react';
import { Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphLegendProps {
  categoryColors: Record<string, string>;
  connectionColors: Record<string, string>;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ 
  categoryColors, 
  connectionColors, 
  isFullscreen, 
  onToggleFullscreen 
}) => {
  return (
    <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border z-20">
      <div className="text-card-foreground text-xs space-y-2">
        {/* Controls Section */}
        <div className="space-y-1 pb-2 border-b border-border/50">
          <div>🖱️ Drag nodes to reposition</div>
          <div>🔍 Scroll to zoom in/out</div>
          <div>👆 Hover for node details</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="mt-2 text-muted-foreground hover:text-foreground hover:bg-accent p-1 w-full"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Fullscreen className="w-4 h-4 mr-1" />
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>

        {/* Legend Section */}
        <div className="font-semibold mb-1">Node Types:</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor: categoryColors.page || categoryColors.database}}></div>
          <span>Page/Database</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1.5 rounded-sm" style={{backgroundColor: categoryColors.property || categoryColors.text}}></div>
          <span>Property</span>
        </div>
        <div className="mt-2 font-semibold">Connections:</div>
        {Object.entries(connectionColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{backgroundColor: color}}></div>
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
