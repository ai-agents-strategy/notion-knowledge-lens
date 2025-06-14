
import { ControlPanel } from "@/components/ControlPanel";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";

interface GraphPageLayoutProps {
  // Control Panel Props
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  showConnectionLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  showConnections: boolean;
  onShowConnectionsChange: (show: boolean) => void;
  connectionStrengthFilter: number;
  onConnectionStrengthChange: (strength: number) => void;
  nodeCount: number;
  connectionCount: number;
  isolatedNodeCount: number;
  // Knowledge Graph Props
  graphNodes: DatabaseNode[];
  graphConnections: DatabaseConnection[];
  graphShowConnectionLabels: boolean; // Combined state for KG
}

export const GraphPageLayout = ({
  categories,
  selectedCategories,
  onCategoryChange,
  showConnectionLabels,
  onShowLabelsChange,
  showConnections,
  onShowConnectionsChange,
  connectionStrengthFilter,
  onConnectionStrengthChange,
  nodeCount,
  connectionCount,
  isolatedNodeCount,
  graphNodes,
  graphConnections,
  graphShowConnectionLabels,
}: GraphPageLayoutProps) => {
  return (
    <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-120px)]">
      {/* Control Panel */}
      <div className="lg:w-80 p-6">
        <ControlPanel
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={onCategoryChange}
          showConnectionLabels={showConnectionLabels}
          onShowLabelsChange={onShowLabelsChange}
          showConnections={showConnections}
          onShowConnectionsChange={onShowConnectionsChange}
          connectionStrengthFilter={connectionStrengthFilter}
          onConnectionStrengthChange={onConnectionStrengthChange}
          nodeCount={nodeCount}
          connectionCount={connectionCount}
          isolatedNodeCount={isolatedNodeCount}
        />
      </div>

      {/* Knowledge Graph */}
      <div className="flex-1 p-6">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 h-full overflow-hidden">
          <KnowledgeGraph
            nodes={graphNodes}
            connections={graphConnections}
            showConnectionLabels={graphShowConnectionLabels}
          />
        </div>
      </div>
    </div>
  );
};

