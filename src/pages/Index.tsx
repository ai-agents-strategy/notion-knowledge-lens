
import { useGraphData } from "@/hooks/useGraphData";
import { GraphHeader } from "@/components/GraphHeader";
import { GraphPageLayout } from "@/components/GraphPageLayout";

const Index = () => {
  const {
    // Category state hooks removed
    showConnectionLabels, setShowConnectionLabels,
    connectionStrengthFilter, setConnectionStrengthFilter,
    isRealData,
    realNodes, // Used for realDataExists check
    isSyncing,
    handleSync,
    toggleDataSource,
    usingRealData,
    filteredNodes,
    eligibleConnections, // For connectionCount
    finalFilteredConnections, // For KnowledgeGraph connections
    isolatedNodeCount,
    // uniqueCategories removed
  } = useGraphData();

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
      />

      <GraphPageLayout
        // Category props removed
        showConnectionLabels={showConnectionLabels}
        onShowLabelsChange={setShowConnectionLabels}
        connectionStrengthFilter={connectionStrengthFilter}
        onConnectionStrengthChange={setConnectionStrengthFilter}
        nodeCount={filteredNodes.length}
        connectionCount={eligibleConnections.length} // Use eligible for count
        isolatedNodeCount={isolatedNodeCount}
        graphNodes={filteredNodes}
        graphConnections={finalFilteredConnections}
        graphShowConnectionLabels={showConnectionLabels}
      />
    </div>
  );
};

export default Index;
