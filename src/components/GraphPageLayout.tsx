
import { ControlPanel } from "@/components/ControlPanel";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

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
  usingRealData
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
            />
          </SidebarContent>
        </Sidebar>

        {/* Main Knowledge Graph Area */}
        <SidebarInset className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <SidebarTrigger />
            {authIsLoading ? (
              <div className="w-24 h-8 bg-muted rounded animate-pulse" />
            ) : isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary/10" 
                onClick={handleAuthAction}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login / Sign Up
              </Button>
            )}
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
