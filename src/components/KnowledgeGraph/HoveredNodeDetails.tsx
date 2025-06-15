
import React from 'react';
import { DatabaseNode } from '@/types/graph';

interface HoveredNodeDetailsProps {
  nodeId: string | null;
  nodes: DatabaseNode[];
  categoryColors: Record<string, string>;
}

export const HoveredNodeDetails: React.FC<HoveredNodeDetailsProps> = ({ nodeId, nodes, categoryColors }) => {
  if (!nodeId) return null;

  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;

  return (
    <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 max-w-sm z-20">
      <div>
        <h3 className="text-white font-bold text-lg mb-2">{node.name}</h3>
        <p className="text-slate-300 text-sm mb-2">{node.description}</p>
        <div className="flex gap-2 text-xs flex-wrap">
          <span 
            className={`px-2 py-1 rounded ${categoryColors[node.type] ? 'bg-opacity-20' : 'bg-gray-500/20 text-gray-300'}`} 
            style={{backgroundColor: categoryColors[node.type] ? `${categoryColors[node.type]}33` : undefined, color: categoryColors[node.type] || undefined}}
          >
            {node.type}
          </span>
          <span 
            className={`px-2 py-1 rounded ${categoryColors[node.category.toLowerCase()] ? 'bg-opacity-20' : 'bg-gray-500/20 text-gray-300'}`} 
            style={{backgroundColor: categoryColors[node.category.toLowerCase()] ? `${categoryColors[node.category.toLowerCase()]}33` : undefined, color: categoryColors[node.category.toLowerCase()] || undefined}}
          >
            {node.category}
          </span>
          {node.propertyType && (
             <span 
               className={`px-2 py-1 rounded ${categoryColors[node.propertyType.toLowerCase()] ? 'bg-opacity-20' : 'bg-gray-500/20 text-gray-300'}`} 
               style={{backgroundColor: categoryColors[node.propertyType.toLowerCase()] ? `${categoryColors[node.propertyType.toLowerCase()]}33` : undefined, color: categoryColors[node.propertyType.toLowerCase()] || undefined}}
             >
              {node.propertyType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
