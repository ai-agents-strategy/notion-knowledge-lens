
import { ControlPanel } from "@/components/ControlPanel";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface GraphPageLayoutProps {
  showConnectionLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  connectionStrengthFilter: number;
  onConnectionStrengthChange: (strength: number) => void;
  nodeCount: number;
  connectionCount: number;
  isolatedNodeCount: number;
  isSyncing: boolean;
  onSync: () => void;
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
  isSyncing,
  onSync,
  graphNodes,
  graphConnections,
  graphShowConnectionLabels
}: GraphPageLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="relative z-10 flex h-[calc(100vh-120px)] w-full">
        {/* Collapsible Control Panel Sidebar */}
        <Sidebar side="left" className="border-r">
          <SidebarContent className="p-6 bg-slate-50">
            <ControlPanel 
              showConnectionLabels={showConnectionLabels} 
              onShowLabelsChange={onShowLabelsChange} 
              connectionStrengthFilter={connectionStrengthFilter} 
              onConnectionStrengthChange={onConnectionStrengthChange} 
              nodeCount={nodeCount} 
              connectionCount={connectionCount} 
              isolatedNodeCount={isolatedNodeCount}
              isSyncing={isSyncing}
              onSync={onSync}
            />
          </SidebarContent>
        </Sidebar>

        {/* Main Knowledge Graph Area */}
        <SidebarInset className="flex-1 p-6">
          <div className="mb-4">
            <SidebarTrigger />
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 h-full overflow-hidden shadow-sm">
            <KnowledgeGraph 
              nodes={graphNodes} 
              connections={graphConnections} 
              showConnectionLabels={graphShowConnectionLabels} 
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
