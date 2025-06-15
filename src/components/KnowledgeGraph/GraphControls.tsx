
import React from 'react';
import { Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({ isFullscreen, onToggleFullscreen }) => {
  return (
    <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border text-card-foreground text-xs space-y-1 z-20 flex flex-col items-end">
      <div>🖱️ Drag nodes to reposition</div>
      <div>🔍 Scroll to zoom in/out</div>
      <div>👆 Hover for node details</div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFullscreen}
        className="mt-2 text-muted-foreground hover:text-foreground hover:bg-accent p-1"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        <Fullscreen className="w-5 h-5" />
      </Button>
    </div>
  );
};
