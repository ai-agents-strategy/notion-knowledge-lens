import { ControlPanel } from "@/components/ControlPanel";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
interface GraphPageLayoutProps {
  showConnectionLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  connectionStrengthFilter: number;
  onConnectionStrengthChange: (strength: number) => void;
  nodeCount: number;
  connectionCount: number;
  isolatedNodeCount: number;
  // Knowledge Graph Props
  graphNodes: DatabaseNode[];
  graphConnections: DatabaseConnection[];
  graphShowConnectionLabels: boolean;
}
export const GraphPageLayout = ({
  showConnectionLabels,
  onShowLabelsChange,
  connectionStrengthFilter,
  onConnectionStrengthChange,
  nodeCount,
  connectionCount,
  isolatedNodeCount,
  graphNodes,
  graphConnections,
  graphShowConnectionLabels
}: GraphPageLayoutProps) => {
  return <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-120px)]">
      {/* Control Panel */}
      <div className="lg:w-80 p-6 bg-slate-50">
        <ControlPanel showConnectionLabels={showConnectionLabels} onShowLabelsChange={onShowLabelsChange} connectionStrengthFilter={connectionStrengthFilter} onConnectionStrengthChange={onConnectionStrengthChange} nodeCount={nodeCount} connectionCount={connectionCount} isolatedNodeCount={isolatedNodeCount} />
      </div>

      {/* Knowledge Graph */}
      <div className="flex-1 p-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 h-full overflow-hidden shadow-sm">
          <KnowledgeGraph nodes={graphNodes} connections={graphConnections} showConnectionLabels={graphShowConnectionLabels} />
        </div>
      </div>
    </div>;
};