import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";

// Sample SEO Knowledge Graph data (moved here)
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


export const useGraphData = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showConnectionLabels, setShowConnectionLabels] = useState(true);
  const [connectionStrengthFilter, setConnectionStrengthFilter] = useState(0);
  const [isRealData, setIsRealData] = useState(false);
  const [realNodes, setRealNodes] = useState<DatabaseNode[]>([]);
  const [realConnections, setRealConnections] = useState<DatabaseConnection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const getPageTitle = (page: any) => {
    if (page.properties) {
      for (const [, prop] of Object.entries(page.properties)) {
        const propData = prop as any;
        if (propData.type === 'title' && propData.title?.length > 0) {
          return propData.title[0]?.plain_text || 'Untitled';
        }
      }
      for (const [, prop] of Object.entries(page.properties)) {
        const propData = prop as any;
        if (propData.type === 'rich_text' && propData.rich_text?.length > 0) {
          return propData.rich_text[0]?.plain_text || 'Untitled';
        }
      }
    }
    return `Page ${page.id.slice(0, 8)}`;
  };

  const transformNotionDataToSEOGraph = (pages: any[], _databases: any[]) => {
    const nodes: DatabaseNode[] = [];
    const connections: DatabaseConnection[] = [];

    pages.forEach((page: any) => {
      const pageTitle = page.extracted_title || getPageTitle(page);
      const categoryFromDb = page.database_name?.toLowerCase().replace(/\s+/g, '_') || 'content';
      
      const pageNode: DatabaseNode = {
        id: page.id,
        name: pageTitle,
        type: "page",
        category: categoryFromDb,
        description: `${pageTitle} from ${page.database_name}`,
        size: Math.min(Math.max(15, pageTitle.length), 35)
      };
      nodes.push(pageNode);
    });

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
                  label: propName.toLowerCase().replace(/_/g, ' ')
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
      console.log('Starting SEO Knowledge Graph sync via Edge Function...');
      const { data, error } = await supabase.functions.invoke('notion-sync');
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to sync with Notion');
      }
      if (data.error) throw new Error(data.error);
      console.log('SEO Knowledge Graph sync success:', data);
      
      const { nodes, connections } = transformNotionDataToSEOGraph(data.pages || [], data.databases || []);
      setRealNodes(nodes);
      setRealConnections(connections);
      setIsRealData(true);
      // setShowConnections(true); // No longer needed

      toast({
        title: "Sync successful!",
        description: `Loaded ${data.total_pages || 0} pages from ${data.total_databases || 0} databases with ${connections.length} semantic relationships.`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      let errorMsg = "Unknown error occurred during sync.";
      if (error instanceof Error) errorMsg = error.message;
      toast({ title: "Sync failed", description: errorMsg, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDataSource = () => {
    const newIsRealData = !isRealData;
    setIsRealData(newIsRealData);
    toast({
      title: newIsRealData ? "Switched to real data" : "Switched to sample data",
      description: newIsRealData
        ? (realNodes.length > 0 ? "Now showing your real Notion databases" : "No real data available. Please sync first.")
        : "Now showing sample SEO Knowledge Graph data",
    });
  };

  const usingRealData = isRealData && realNodes.length > 0;
  const currentNodes = usingRealData ? realNodes : sampleNodes;
  const currentConnections = usingRealData ? realConnections : sampleConnections;

  const uniqueCategories = Array.from(new Set(currentNodes.map(node => node.category)));

  // When no categories are selected OR when all categories are selected, show all nodes.
  // Otherwise, filter by the selected categories.
  const filteredNodes = (selectedCategories.length === 0 || selectedCategories.length === uniqueCategories.length)
    ? currentNodes
    : currentNodes.filter(node => selectedCategories.includes(node.category));

  const eligibleConnections = currentConnections
    .filter(conn => conn.strength >= connectionStrengthFilter)
    .filter(conn => {
      const sourceExists = filteredNodes.some(node => node.id === conn.source);
      const targetExists = filteredNodes.some(node => node.id === conn.target);
      return sourceExists && targetExists;
    });

  const finalFilteredConnections = eligibleConnections; // Connections are now shown if they are eligible

  const connectedNodeIds = new Set([
    ...eligibleConnections.map(conn => conn.source),
    ...eligibleConnections.map(conn => conn.target)
  ]);
  const isolatedNodeCount = filteredNodes.filter(node => !connectedNodeIds.has(node.id)).length;
  
  return {
    selectedCategories, setSelectedCategories,
    showConnectionLabels, setShowConnectionLabels,
    connectionStrengthFilter, setConnectionStrengthFilter,
    isRealData,
    realNodes, realConnections, // exposed for checks like realNodes.length > 0
    isSyncing,
    handleSync,
    toggleDataSource,
    usingRealData,
    currentNodes, // For categories in ControlPanel
    filteredNodes,
    eligibleConnections, // For connectionCount in ControlPanel
    finalFilteredConnections, // For KnowledgeGraph
    isolatedNodeCount,
    uniqueCategories,
  };
};
