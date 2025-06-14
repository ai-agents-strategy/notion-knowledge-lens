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

// Sample SEO Knowledge Graph data
const sampleNodes: DatabaseNode[] = [
  { id: "1", name: "Keyword Research", type: "page", category: "seo", description: "Main keyword research page", size: 25 },
  { id: "2", name: "Content Strategy", type: "page", category: "content", description: "Content planning and strategy", size: 30 },
  { id: "3", name: "Technical SEO", type: "page", category: "technical", description: "Technical optimization guide", size: 28 },
  { id: "4", name: "Link Building", type: "page", category: "offpage", description: "Link acquisition strategies", size: 22 },
  { id: "5", name: "Local SEO", type: "page", category: "local", description: "Local search optimization", size: 20 },
  { id: "6", name: "E-commerce SEO", type: "page", category: "ecommerce", description: "Online store optimization", size: 26 },
  { id: "7", name: "Mobile SEO", type: "page", category: "mobile", description: "Mobile search optimization", size: 18 },
  { id: "8", name: "Analytics Setup", type: "page", category: "analytics", description: "Tracking and measurement", size: 16 },
  { id: "9", name: "Competitor Analysis", type: "page", category: "research", description: "Competitive intelligence", size: 24 },
  { id: "10", name: "Content Calendar", type: "page", category: "content", description: "Editorial planning", size: 14 },
];

const sampleConnections: DatabaseConnection[] = [
  { source: "1", target: "2", type: "relation", strength: 0.9, label: "informs strategy" },
  { source: "2", target: "10", type: "dependency", strength: 0.8, label: "requires planning" },
  { source: "1", target: "9", type: "relation", strength: 0.7, label: "competitive analysis" },
  { source: "3", target: "7", type: "relation", strength: 0.85, label: "mobile optimization" },
  { source: "4", target: "5", type: "relation", strength: 0.6, label: "local citations" },
  { source: "6", target: "3", type: "dependency", strength: 0.75, label: "technical foundation" },
  { source: "2", target: "4", type: "reference", strength: 0.65, label: "content for links" },
  { source: "8", target: "1", type: "reference", strength: 0.55, label: "keyword tracking" },
  { source: "9", target: "4", type: "relation", strength: 0.7, label: "competitor links" },
  { source: "5", target: "8", type: "dependency", strength: 0.6, label: "local tracking" },
  { source: "6", target: "1", type: "relation", strength: 0.8, label: "product keywords" },
  { source: "7", target: "8", type: "reference", strength: 0.5, label: "mobile metrics" },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showConnectionLabels, setShowConnectionLabels] = useState(true);
  const [connectionStrengthFilter, setConnectionStrengthFilter] = useState(0);
  const [isRealData, setIsRealData] = useState(false);
  const [realNodes, setRealNodes] = useState<DatabaseNode[]>([]);
  const [realConnections, setRealConnections] = useState<DatabaseConnection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const transformNotionDataToSEOGraph = (pages: any[], databases: any[]) => {
    const nodes: DatabaseNode[] = [];
    const connections: DatabaseConnection[] = [];

    // Create nodes for each page
    pages.forEach((page: any) => {
      const pageTitle = getPageTitle(page);
      const categoryFromDb = page.database_name?.toLowerCase() || 'content';
      
      const pageNode: DatabaseNode = {
        id: page.id,
        name: pageTitle,
        type: "page",
        category: categoryFromDb,
        description: `Page from ${page.database_name}`,
        size: Math.min(Math.max(15, pageTitle.length), 35)
      };
      nodes.push(pageNode);
    });

    // Create connections based on relation properties
    pages.forEach((page: any) => {
      if (page.properties) {
        Object.entries(page.properties).forEach(([propName, propData]: [string, any]) => {
          if (propData.type === 'relation' && propData.relation?.length > 0) {
            propData.relation.forEach((relatedPage: any) => {
              const targetPage = pages.find(p => p.id === relatedPage.id);
              if (targetPage) {
                connections.push({
                  source: page.id,
                  target: relatedPage.id,
                  type: "relation",
                  strength: 0.8,
                  label: propName.toLowerCase()
                });
              }
            });
          }
        });
      }
    });

    return { nodes, connections };
  };

  const getPageTitle = (page: any) => {
    // Try to get title from various possible properties
    if (page.properties) {
      for (const [key, prop] of Object.entries(page.properties)) {
        const propData = prop as any;
        if (propData.type === 'title' && propData.title?.length > 0) {
          return propData.title[0]?.plain_text || 'Untitled';
        }
      }
      
      // Fallback to any text property
      for (const [key, prop] of Object.entries(page.properties)) {
        const propData = prop as any;
        if (propData.type === 'rich_text' && propData.rich_text?.length > 0) {
          return propData.rich_text[0]?.plain_text || 'Untitled';
        }
      }
    }
    
    return `Page ${page.id.slice(0, 8)}`;
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      console.log('Starting SEO Knowledge Graph sync via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('notion-sync');

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to sync with Notion');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('SEO Knowledge Graph sync success:', data);
      
      // Transform the Notion pages data
      const { nodes, connections } = transformNotionDataToSEOGraph(data.pages || [], data.databases || []);

      setRealNodes(nodes);
      setRealConnections(connections);
      setIsRealData(true);

      toast({
        title: "Sync successful!",
        description: `Loaded ${data.total_pages || 0} pages from ${data.total_databases || 0} databases with ${connections.length} semantic relationships.`,
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
        ? "Now showing sample SEO Knowledge Graph data"
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
              SEO Knowledge Graph
            </h1>
            <p className="text-slate-300 text-lg">
              Visualize semantic relationships between pages and content
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm text-slate-400">
                {isRealData ? "Real Notion Pages" : "Sample SEO Data"}
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
