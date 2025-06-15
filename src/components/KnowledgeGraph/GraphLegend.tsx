
import React from 'react';

interface GraphLegendProps {
  categoryColors: Record<string, string>;
  connectionColors: Record<string, string>;
  children: React.ReactNode;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ categoryColors, connectionColors, children }) => {
  return (
    <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border z-20 flex flex-col gap-3">
      {children}
      <div className="w-full h-[1px] bg-border" />
      <div className="text-card-foreground text-xs space-y-2">
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
