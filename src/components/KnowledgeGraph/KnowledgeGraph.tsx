
import { useEffect, useRef, useState } from "react";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { GraphLegend } from "./GraphLegend";
import { HoveredNodeDetails } from "./HoveredNodeDetails";
import { GraphControls } from "./GraphControls";
import { useKnowledgeGraph } from "./useKnowledgeGraph";

interface KnowledgeGraphProps {
  nodes: DatabaseNode[];
  connections: DatabaseConnection[];
  showConnectionLabels: boolean;
  onNodeClick?: (nodeId: string) => void;
  categoryColors: Record<string, string>;
  connectionColors: Record<string, string>;
}

export const KnowledgeGraph = ({ nodes, connections, showConnectionLabels, onNodeClick, categoryColors, connectionColors }: KnowledgeGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { hoveredNode } = useKnowledgeGraph({
    svgRef,
    nodes,
    connections,
    showConnectionLabels,
    onNodeClick,
    categoryColors,
    connectionColors,
  });

  const toggleFullscreen = () => {
    if (!graphContainerRef.current) return;

    if (!document.fullscreenElement) {
      graphContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={graphContainerRef} className="relative w-full h-full bg-white dark:bg-gray-900">
      <svg ref={svgRef} className="w-full h-full" />
      
      <HoveredNodeDetails 
        nodeId={hoveredNode}
        nodes={nodes}
        categoryColors={categoryColors}
      />
      
      <GraphLegend 
        categoryColors={categoryColors}
        connectionColors={connectionColors}
      >
        <GraphControls 
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </GraphLegend>
    </div>
  );
};
