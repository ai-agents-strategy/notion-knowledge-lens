
import React from 'react';
import { Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({ isFullscreen, onToggleFullscreen }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 text-slate-300 text-xs space-y-1 z-20 flex flex-col items-end">
      <div>🖱️ Drag nodes to reposition</div>
      <div>🔍 Scroll to zoom in/out</div>
      <div>👆 Hover for node details</div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFullscreen}
        className="mt-2 text-slate-300 hover:text-white hover:bg-slate-700/50 p-1"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        <Fullscreen className="w-5 h-5" />
      </Button>
    </div>
  );
};
