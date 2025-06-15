import { ControlPanel } from "@/components/ControlPanel";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { GraphFilterControls } from "./GraphFilterControls";
import { DetailedNodeView } from "./DetailedNodeView";
import { GraphChat } from "./GraphChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  usingRealData: boolean;
  // Search Props
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  // Selected Node Props
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  // Appearance props
  categoryColors: Record<string, string>;
  onCategoryColorsChange: (colors: Record<string, string>) => void;
  connectionColors: Record<string, string>;
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
  graphShowConnectionLabels,
  usingRealData,
  searchTerm,
  onSearchTermChange,
  selectedNodeId,
  onNodeSelect,
  categoryColors,
  onCategoryColorsChange,
  connectionColors,
}: GraphPageLayoutProps) => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const authIsLoading = !isLoaded;

  const handleAuthAction = () => {
    navigate('/auth/sign-in');
  };

  return (
    <SidebarProvider>
      <div className="relative z-10 flex h-[calc(100vh-120px)] w-full">
        {/* Collapsible Control Panel Sidebar */}
        <Sidebar side="left" className="border-r">
          <SidebarContent className="p-6 bg-slate-50">
            <Tabs defaultValue="controls" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="controls">Controls</TabsTrigger>
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="controls" className="flex-1 mt-4">
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
                  usingRealData={usingRealData}
                  isSignedIn={isSignedIn}
                  authIsLoading={authIsLoading}
                  onAuthAction={handleAuthAction}
                />
              </TabsContent>
              
              <TabsContent value="chat" className="flex-1 mt-4">
                <GraphChat nodes={graphNodes} connections={graphConnections} />
              </TabsContent>
            </Tabs>
          </SidebarContent>
        </Sidebar>

        {/* Main Knowledge Graph Area */}
        <SidebarInset className="flex-1 flex flex-col">
          <div className="flex items-center gap-4 p-2 border-b">
            <SidebarTrigger />
            <div className="flex-1 max-w-xs">
              <GraphFilterControls searchTerm={searchTerm} onSearchTermChange={onSearchTermChange} />
            </div>
          </div>
          <div className="flex-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 m-2 overflow-hidden shadow-sm">
            <KnowledgeGraph 
              nodes={graphNodes} 
              connections={graphConnections} 
              showConnectionLabels={graphShowConnectionLabels} 
              onNodeClick={onNodeSelect}
              categoryColors={categoryColors}
              connectionColors={connectionColors}
            />
          </div>
        </SidebarInset>

        <DetailedNodeView
          nodeId={selectedNodeId}
          nodes={graphNodes}
          connections={graphConnections}
          onClose={() => onNodeSelect(null)}
          categoryColors={categoryColors}
          onCategoryColorsChange={onCategoryColorsChange}
        />
      </div>
    </SidebarProvider>
  );
};
