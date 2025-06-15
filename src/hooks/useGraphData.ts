import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { categoryColors as defaultCategoryColors, connectionColors as defaultConnectionColors } from "@/components/KnowledgeGraph/graphConfig";

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
  const { user } = useUser();
  const [showConnectionLabels, setShowConnectionLabels] = useState(true);
  const [connectionStrengthFilter, setConnectionStrengthFilter] = useState(0);
  const [isRealData, setIsRealData] = useState(false);
  const [realNodes, setRealNodes] = useState<DatabaseNode[]>([]);
  const [realConnections, setRealConnections] = useState<DatabaseConnection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set());

  const [categoryColors, setCategoryColors] = useState(() => {
    try {
      const saved = localStorage.getItem('categoryColors');
      if (saved) {
        return { ...defaultCategoryColors, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Error reading category colors from localStorage:", error);
    }
    return defaultCategoryColors;
  });

  const [connectionColors, setConnectionColors] = useState(() => {
    try {
      const saved = localStorage.getItem('connectionColors');
      if (saved) {
        return { ...defaultConnectionColors, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Error reading connection colors from localStorage:", error);
    }
    return defaultConnectionColors;
  });


  useEffect(() => {
    // Try to load from localStorage first
    try {
      const storedNodes = localStorage.getItem('notion_graph_nodes');
      const storedConnections = localStorage.getItem('notion_graph_connections');

      if (storedNodes && storedConnections) {
        setRealNodes(JSON.parse(storedNodes));
        setRealConnections(JSON.parse(storedConnections));
        setIsRealData(true);
        setIsLoading(false);
        return; // Data loaded from localStorage, don't proceed to DB load
      }
    } catch (e) {
      console.error("Failed to load graph from localStorage", e);
    }

    const loadGraphFromDB = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('graphs')
          .select('nodes, connections, public_id')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // Allow "no rows" error

        if (data) {
          if (data.nodes && data.connections) {
            setRealNodes(data.nodes as unknown as DatabaseNode[]);
            setRealConnections(data.connections as unknown as DatabaseConnection[]);
            setPublicId(data.public_id);
            setIsRealData(true);
          }
        }
      } catch (error) {
        console.error("Error loading graph from DB:", error);
        toast({ title: "Could not load your saved graph", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGraphFromDB();
  }, [user]);

  // Save color settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('categoryColors', JSON.stringify(categoryColors));
      localStorage.setItem('connectionColors', JSON.stringify(connectionColors));
    } catch (error) {
      console.error("Error saving color settings to localStorage:", error);
    }
  }, [categoryColors, connectionColors]);

  // Initialize visible categories when nodes change
  useEffect(() => {
    const currentNodes = usingRealData ? realNodes : sampleNodes;
    const allCategories = new Set<string>();
    const allTypes = new Set<string>();
    
    currentNodes.forEach(node => {
      allCategories.add(node.category);
      allTypes.add(node.type);
    });
    
    // If no categories are selected, select all by default
    if (visibleCategories.size === 0) {
      setVisibleCategories(new Set([...allCategories, ...allTypes]));
    }
  }, [realNodes, isRealData]);

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
      if (error) throw new Error(error.message || 'Failed to sync with Notion');
      if (data.error) throw new Error(data.error);

      const { nodes, connections } = data;
      if (!nodes || !connections) {
        throw new Error('Sync function did not return valid graph data.');
      }
      
      setRealNodes(nodes);
      setRealConnections(connections);
      setIsRealData(true);

      toast({
        title: "Sync successful!",
        description: `Loaded ${nodes.length} pages and ${connections.length} relationships.`,
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

  const generatePublicLink = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      if (publicId) {
        return `${window.location.origin}/public/graph/${publicId}`;
      }

      const newPublicId = crypto.randomUUID();
      const { error: updateError } = await supabase
        .from('graphs')
        .update({ public_id: newPublicId })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      setPublicId(newPublicId);
      toast({ title: "Public link generated!", description: "Anyone with the link can now view your graph." });
      return `${window.location.origin}/public/graph/${newPublicId}`;
    } catch (error) {
      console.error("Error generating public link:", error);
      toast({ title: "Could not generate public link", variant: "destructive" });
      return null;
    }
  };

  const revokePublicLink = async (): Promise<void> => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('graphs')
        .update({ public_id: null })
        .eq('user_id', user.id);
      
      if (error) throw error;

      setPublicId(null);
      toast({ title: "Public access revoked", description: "Your graph is no longer shared publicly." });
    } catch (error) {
      console.error("Error revoking public link:", error);
      toast({ title: "Could not revoke public link", variant: "destructive" });
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
  
  const currentNodes = useMemo(() => 
    usingRealData ? realNodes : sampleNodes,
    [usingRealData, realNodes]
  );

  const currentConnections = useMemo(() =>
    usingRealData ? realConnections : sampleConnections,
    [usingRealData, realConnections]
  );

  const filteredNodes = useMemo(() => {
    return currentNodes.filter(node => 
      visibleCategories.has(node.category) && visibleCategories.has(node.type)
    );
  }, [currentNodes, visibleCategories]);

  const eligibleConnections = useMemo(() => {
    // Create a Set of filtered node IDs for efficient lookup.
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    return currentConnections
      .filter(conn => conn.strength >= connectionStrengthFilter)
      .filter(conn => 
        filteredNodeIds.has(conn.source) && filteredNodeIds.has(conn.target)
      );
  }, [currentConnections, connectionStrengthFilter, filteredNodes]);

  const finalFilteredConnections = eligibleConnections;

  const isolatedNodeCount = useMemo(() => {
    const connectedNodeIds = new Set([
      ...eligibleConnections.map(conn => conn.source),
      ...eligibleConnections.map(conn => conn.target)
    ]);
    return filteredNodes.filter(node => !connectedNodeIds.has(node.id)).length;
  }, [filteredNodes, eligibleConnections]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    currentNodes.forEach(node => categories.add(node.category));
    return Array.from(categories).sort();
  }, [currentNodes]);

  const handleCategoryToggle = (category: string) => {
    const newVisible = new Set(visibleCategories);
    if (newVisible.has(category)) {
      newVisible.delete(category);
    } else {
      newVisible.add(category);
    }
    setVisibleCategories(newVisible);
  };
  
  return {
    showConnectionLabels, setShowConnectionLabels,
    connectionStrengthFilter, setConnectionStrengthFilter,
    isRealData,
    realNodes, realConnections,
    isSyncing,
    isLoading,
    handleSync,
    toggleDataSource,
    usingRealData,
    publicId,
    generatePublicLink,
    revokePublicLink,
    filteredNodes,
    finalFilteredConnections,
    isolatedNodeCount,
    eligibleConnections, // Keep this for connectionCount in Index
    categoryColors,
    setCategoryColors,
    connectionColors,
    setConnectionColors,
    visibleCategories,
    handleCategoryToggle,
    availableCategories,
  };
};
