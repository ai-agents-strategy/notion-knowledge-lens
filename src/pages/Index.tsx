
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { ControlPanel } from "@/components/ControlPanel";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface DatabaseNode {
  id: string;
  name: string;
  type: "database" | "page" | "property";
  category: string;
  description?: string;
  size: number;
  propertyType?: string;
  parentDatabase?: string;
}

export interface DatabaseConnection {
  source: string;
  target: string;
  type: "relation" | "reference" | "dependency" | "contains";
  strength: number;
  label?: string;
}

// Sample Notion database structure
const sampleNodes: DatabaseNode[] = [
  { id: "1", name: "Projects", type: "database", category: "work", description: "Main project tracking", size: 25 },
  { id: "2", name: "Tasks", type: "database", category: "work", description: "Individual task items", size: 35 },
  { id: "3", name: "People", type: "database", category: "contacts", description: "Team members and contacts", size: 20 },
  { id: "4", name: "Notes", type: "database", category: "knowledge", description: "Research and meeting notes", size: 30 },
  { id: "5", name: "Resources", type: "database", category: "knowledge", description: "Links and references", size: 15 },
  { id: "6", name: "Goals", type: "database", category: "planning", description: "Objectives and KPIs", size: 18 },
  { id: "7", name: "Timeline", type: "database", category: "planning", description: "Project milestones", size: 22 },
  { id: "8", name: "Budget", type: "database", category: "finance", description: "Cost tracking", size: 12 },
  { id: "9", name: "Meetings", type: "database", category: "work", description: "Meeting records", size: 16 },
  { id: "10", name: "Ideas", type: "database", category: "creativity", description: "Brainstorming space", size: 14 },
];

const sampleConnections: DatabaseConnection[] = [
  { source: "1", target: "2", type: "relation", strength: 0.9, label: "has tasks" },
  { source: "1", target: "3", type: "relation", strength: 0.7, label: "assigned to" },
  { source: "2", target: "3", type: "relation", strength: 0.8, label: "owner" },
  { source: "1", target: "6", type: "dependency", strength: 0.6, label: "supports" },
  { source: "1", target: "7", type: "reference", strength: 0.75, label: "timeline" },
  { source: "1", target: "8", type: "reference", strength: 0.5, label: "budget" },
  { source: "4", target: "9", type: "relation", strength: 0.65, label: "from meetings" },
  { source: "4", target: "5", type: "reference", strength: 0.55, label: "references" },
  { source: "3", target: "9", type: "relation", strength: 0.7, label: "attendees" },
  { source: "6", target: "7", type: "dependency", strength: 0.8, label: "tracked by" },
  { source: "10", target: "1", type: "reference", strength: 0.4, label: "becomes" },
  { source: "2", target: "4", type: "reference", strength: 0.3, label: "documented in" },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showConnectionLabels, setShowConnectionLabels] = useState(true);
  const [connectionStrengthFilter, setConnectionStrengthFilter] = useState(0);
  const [isRealData, setIsRealData] = useState(false);
  const [realNodes, setRealNodes] = useState<DatabaseNode[]>([]);
  const [realConnections, setRealConnections] = useState<DatabaseConnection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const transformNotionDataToGraph = (databases: any[]) => {
    const nodes: DatabaseNode[] = [];
    const connections: DatabaseConnection[] = [];

    databases.forEach((db: any) => {
      const dbName = db.title?.[0]?.plain_text || db.properties?.Name?.title?.[0]?.plain_text || `Database ${db.id.slice(0, 8)}`;
      
      // Add database node
      const dbNode: DatabaseNode = {
        id: db.id,
        name: dbName,
        type: "database",
        category: "database",
        description: `Notion database with ${Object.keys(db.properties || {}).length} properties`,
        size: 30
      };
      nodes.push(dbNode);

      // Add property nodes for each database property
      if (db.properties) {
        Object.entries(db.properties).forEach(([propName, propData]: [string, any]) => {
          const propertyId = `${db.id}-${propName}`;
          const propertyNode: DatabaseNode = {
            id: propertyId,
            name: propName,
            type: "property",
            category: propData.type || "text",
            description: `${propData.type || 'Unknown'} property`,
            size: 15,
            propertyType: propData.type,
            parentDatabase: db.id
          };
          nodes.push(propertyNode);

          // Connect database to its properties
          connections.push({
            source: db.id,
            target: propertyId,
            type: "contains",
            strength: 0.9,
            label: "has property"
          });

          // Add relations between databases based on relation properties
          if (propData.type === 'relation' && propData.relation?.database_id) {
            const targetDbId = propData.relation.database_id;
            const existingDb = databases.find(d => d.id === targetDbId);
            
            if (existingDb) {
              connections.push({
                source: db.id,
                target: targetDbId,
                type: "relation",
                strength: 0.8,
                label: `via ${propName}`
              });
            }
          }

          // Add rollup connections
          if (propData.type === 'rollup' && propData.rollup?.relation_property_name) {
            const relationPropName = propData.rollup.relation_property_name;
            const relationPropId = `${db.id}-${relationPropName}`;
            
            connections.push({
              source: propertyId,
              target: relationPropId,
              type: "reference",
              strength: 0.6,
              label: "rollup from"
            });
          }

          // Add formula dependencies (simplified)
          if (propData.type === 'formula') {
            // Connect to other properties that might be referenced in the formula
            Object.keys(db.properties).forEach(otherPropName => {
              if (otherPropName !== propName && Math.random() > 0.7) { // Simplified logic
                const otherPropId = `${db.id}-${otherPropName}`;
                connections.push({
                  source: propertyId,
                  target: otherPropId,
                  type: "dependency",
                  strength: 0.4,
                  label: "references"
                });
              }
            });
          }
        });
      }
    });

    return { nodes, connections };
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      console.log('Starting detailed Notion sync via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('notion-sync');

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to sync with Notion');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Notion sync success:', data);
      
      // Transform the detailed Notion data
      const { nodes, connections } = transformNotionDataToGraph(data.results || []);

      setRealNodes(nodes);
      setRealConnections(connections);
      setIsRealData(true);

      toast({
        title: "Sync successful!",
        description: `Loaded ${data.total_databases || 0} databases with ${nodes.length} total nodes and ${connections.length} relationships.`,
      });

    } catch (error) {
      console.error('Sync error:', error);
      
      let errorMsg = "Unknown error occurred during sync.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      toast({
        title: "Sync failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDataSource = () => {
    setIsRealData(!isRealData);
    toast({
      title: isRealData ? "Switched to sample data" : "Switched to real data",
      description: isRealData 
        ? "Now showing sample Notion database structure"
        : realNodes.length > 0 
          ? "Now showing your real Notion databases"
          : "No real data available. Please sync first.",
    });
  };

  // Use real data if available and selected, otherwise use sample data
  const currentNodes = isRealData && realNodes.length > 0 ? realNodes : sampleNodes;
  const currentConnections = isRealData && realConnections.length > 0 ? realConnections : sampleConnections;

  const filteredNodes = selectedCategory 
    ? currentNodes.filter(node => node.category === selectedCategory)
    : currentNodes;

  const filteredConnections = currentConnections.filter(conn => {
    const sourceExists = filteredNodes.some(node => node.id === conn.source);
    const targetExists = filteredNodes.some(node => node.id === conn.target);
    return sourceExists && targetExists && conn.strength >= connectionStrengthFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Notion Knowledge Graph
            </h1>
            <p className="text-slate-300 text-lg">
              Visualize relationships between databases, properties, and relations
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm text-slate-400">
                {isRealData ? "Real Notion Data" : "Sample Data"}
              </span>
              <div className={`w-2 h-2 rounded-full ${isRealData ? "bg-green-400" : "bg-blue-400"}`} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              size="sm" 
              className="bg-green-800/50 border-green-700/50 text-green-200 hover:bg-green-700/50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Notion
                </>
              )}
            </Button>
            {realNodes.length > 0 && (
              <Button 
                onClick={toggleDataSource}
                variant="outline"
                size="sm" 
                className="bg-blue-800/50 border-blue-700/50 text-blue-200 hover:bg-blue-700/50"
              >
                {isRealData ? "Show Sample" : "Show Real Data"}
              </Button>
            )}
            <Link to="/settings">
              <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* Control Panel */}
        <div className="lg:w-80 p-6">
          <ControlPanel
            categories={Array.from(new Set(currentNodes.map(node => node.category)))}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showConnectionLabels={showConnectionLabels}
            onShowLabelsChange={setShowConnectionLabels}
            connectionStrengthFilter={connectionStrengthFilter}
            onConnectionStrengthChange={setConnectionStrengthFilter}
            nodeCount={filteredNodes.length}
            connectionCount={filteredConnections.length}
          />
        </div>

        {/* Knowledge Graph */}
        <div className="flex-1 p-6">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 h-full overflow-hidden">
            <KnowledgeGraph 
              nodes={filteredNodes}
              connections={filteredConnections}
              showConnectionLabels={showConnectionLabels}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
