
import { useGraphData } from "@/hooks/useGraphData";
import { GraphHeader } from "@/components/GraphHeader";
import { GraphPageLayout } from "@/components/GraphPageLayout";
import { Loader2 } from "lucide-react";

const Index = () => {
  const {
    showConnectionLabels, setShowConnectionLabels,
    connectionStrengthFilter, setConnectionStrengthFilter,
    isRealData,
    realNodes,
    isSyncing,
    isLoading,
    handleSync,
    toggleDataSource,
    usingRealData,
    publicId,
    generatePublicLink,
    revokePublicLink,
    filteredNodes,
    eligibleConnections,
    finalFilteredConnections,
    isolatedNodeCount,
  } = useGraphData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <GraphHeader
        usingRealData={usingRealData}
        isSyncing={isSyncing}
        onSync={handleSync}
        realDataExists={realNodes.length > 0}
        onToggleDataSource={toggleDataSource}
        isRealData={isRealData}
        publicId={publicId}
        onGenerateLink={generatePublicLink}
        onRevokeLink={revokePublicLink}
      />

      <GraphPageLayout
        showConnectionLabels={showConnectionLabels}
        onShowLabelsChange={setShowConnectionLabels}
        connectionStrengthFilter={connectionStrengthFilter}
        onConnectionStrengthChange={setConnectionStrengthFilter}
        nodeCount={filteredNodes.length}
        connectionCount={eligibleConnections.length}
        isolatedNodeCount={isolatedNodeCount}
        graphNodes={filteredNodes}
        graphConnections={finalFilteredConnections}
        graphShowConnectionLabels={showConnectionLabels}
      />
    </div>
  );
};

export default Index;
