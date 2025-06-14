
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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Pattern - Notion inspired */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(35,131,226,0.05),transparent_50%)]" />
      
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
