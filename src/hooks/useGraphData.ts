import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleNodes, sampleConnections } from '@/data/sample-data';

// Define node and connection types
export interface GraphNode {
  id: string;
  name: string;
  label?: string;
  category: string;
  description?: string;
  metadata?: Record<string, unknown>;
  color?: string;
  x?: number;
  y?: number;
}

export interface GraphConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  strength?: number;
  metadata?: Record<string, unknown>;
  color?: string;
}

// Hook definition
export const useGraphData = () => {
  const { user } = useAuth();
  const { getIntegration } = useIntegrations();
  const [searchParams, setSearchParams] = useSearchParams();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [connections, setConnections] = useState<GraphConnection[]>([]);
  const [realNodes, setRealNodes] = useState<GraphNode[]>([]);
  const [realConnections, setRealConnections] = useState<GraphConnection[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<GraphNode[]>([]);
  const [finalFilteredConnections, setFinalFilteredConnections] = useState<GraphConnection[]>([]);
  const [isolatedNodeCount, setIsolatedNodeCount] = useState<number>(0);
  const [showConnectionLabels, setShowConnectionLabels] = useState<boolean>(false);
  const [connectionStrengthFilter, setConnectionStrengthFilter] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usingRealData, setUsingRealData] = useState<boolean>(false);
  const [categoryColors, setCategoryColors] = useState<{ [category: string]: string }>({});
  const [connectionColors, setConnectionColors] = useState<{ [connectionId: string]: string }>({});
  const [dataInitialized, setDataInitialized] = useState<boolean>(false);

  // Get Notion API key from database
  const notionIntegration = getIntegration('notion');
  const hasNotionApiKey = !!notionIntegration?.api_key;

  // Load stored real data on mount
  useEffect(() => {
    const storedRealNodes = localStorage.getItem('notion_graph_nodes');
    const storedRealConnections = localStorage.getItem('notion_graph_connections');
    
    if (storedRealNodes && storedRealConnections) {
      try {
        const parsedNodes = JSON.parse(storedRealNodes);
        const parsedConnections = JSON.parse(storedRealConnections);
        setRealNodes(parsedNodes);
        setRealConnections(parsedConnections);
        
        // If we have real data, use it by default
        if (parsedNodes.length > 0) {
          console.log('📱 Loading real data from localStorage on refresh');
          setNodes(parsedNodes);
          setConnections(parsedConnections);
          setUsingRealData(true);
        }
      } catch (error) {
        console.error('Error parsing stored real data:', error);
      }
    }
    setDataInitialized(true);
  }, []);

  // Sync data from Notion via Edge Function
  const handleSync = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to sync with Notion.",
        variant: "destructive"
      });
      return;
    }

    if (!notionIntegration?.api_key?.trim()) {
      toast({
        title: "API Key Required",
        description: "Please configure your Notion API key in settings first.",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    console.log('🚀 Starting Notion sync...');

    try {
      const { data, error } = await supabase.functions.invoke('notion-sync', {
        body: { apiKey: notionIntegration.api_key.trim() }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Failed to sync with Notion');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('✅ Notion sync success:', data);
      
      // Transform the data to our GraphNode format
      const fetchedNodes: GraphNode[] = (data.nodes || []).map((node: { id?: string; name?: string; category?: string; description?: string; metadata?: Record<string, unknown> }) => ({
        id: node.id || uuidv4(),
        name: node.name || 'Untitled',
        category: node.category || 'content',
        description: node.description || '',
        metadata: node.metadata || {}
      }));

      const fetchedConnections: GraphConnection[] = (data.connections || []).map((conn: { id?: string; source: string; target: string; label?: string; strength?: number; metadata?: Record<string, unknown> }) => ({
        id: conn.id || uuidv4(),
        source: conn.source,
        target: conn.target,
        label: conn.label || '',
        strength: conn.strength || 0.5,
        metadata: conn.metadata || {}
      }));

      setRealNodes(fetchedNodes);
      setRealConnections(fetchedConnections);
      setNodes(fetchedNodes);
      setConnections(fetchedConnections);
      setUsingRealData(true);

      // Save to localStorage for persistence
      localStorage.setItem('notion_graph_nodes', JSON.stringify(fetchedNodes));
      localStorage.setItem('notion_graph_connections', JSON.stringify(fetchedConnections));
      localStorage.setItem('notion_last_sync', new Date().toISOString());

      toast({
        title: "Sync successful!",
        description: `Synced ${fetchedNodes.length} pages and ${fetchedConnections.length} connections from your Notion workspace.`
      });

    } catch (error) {
      console.error('❌ Sync error:', error);
      let errorMsg = "Unknown error occurred during sync.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      toast({
        title: "Sync failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, notionIntegration]);

  // Fetch data on mount and when user changes - only if data not already initialized
  useEffect(() => {
    if (!dataInitialized) return;

    if (!user) {
      console.log('ℹ️ No user, using sample data');
      if (nodes.length === 0) {
        setNodes(sampleNodes);
        setConnections(sampleConnections);
        setUsingRealData(false);
      }
      setIsLoading(false);
      return;
    }

    const publicIdParam = searchParams.get('publicId');
    if (publicIdParam) {
      console.log('ℹ️ Public ID found in URL, fetching public graph');
      fetchPublicGraph(publicIdParam);
    } else {
      console.log('🔌 User logged in, checking for stored data');
      
      // Only set sample data if we don't have any data at all
      if (nodes.length === 0 && realNodes.length === 0) {
        setNodes(sampleNodes);
        setConnections(sampleConnections);
        setUsingRealData(false);
      }
      setIsLoading(false);
    }
  }, [user, dataInitialized, nodes.length, realNodes.length, searchParams]);

  const fetchPublicGraph = async (publicId: string) => {
    setIsLoading(true);
    console.log('🔗 Fetching public graph with ID:', publicId);

    try {
      const { data: graph, error } = await supabase
        .from('graphs')
        .select('*')
        .eq('public_id', publicId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching public graph:', error);
        toast({
          title: "Error",
          description: "Failed to fetch public graph",
          variant: "destructive",
        });
        return;
      }

      if (!graph) {
        console.error('❌ Public graph not found');
        toast({
          title: "Error",
          description: "Public graph not found",
          variant: "destructive",
        });
        return;
      }

      // Safely convert Json to our types
      const graphNodes = Array.isArray(graph.nodes) 
        ? (graph.nodes as unknown as GraphNode[]) 
        : [];
      const graphConnections = Array.isArray(graph.connections) 
        ? (graph.connections as unknown as GraphConnection[]) 
        : [];

      setNodes(graphNodes);
      setConnections(graphConnections);
      setUsingRealData(false);
    } catch (error) {
      console.error('❌ Unexpected error fetching public graph:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between real and sample data
  const toggleDataSource = () => {
    if (!user) {
      console.error('❌ Cannot toggle data source: no user');
      return;
    }

    if (usingRealData) {
      console.log('🩻 Switching to sample data');
      setNodes(sampleNodes);
      setConnections(sampleConnections);
      setUsingRealData(false);
    } else {
      if (realNodes.length > 0) {
        console.log('✅ Switching to real data');
        setNodes(realNodes);
        setConnections(realConnections);
        setUsingRealData(true);
      } else {
        toast({
          title: "No real data available",
          description: "Please sync with Notion first to get real data.",
          variant: "destructive",
        });
      }
    }
  };

  // Filter nodes based on connection strength
  useEffect(() => {
    const filteredConnections = connections.filter(
      (connection) => (connection.strength || 0) >= connectionStrengthFilter
    );

    // Get IDs of nodes that are part of the filtered connections
    const connectedNodeIds = new Set(
      filteredConnections.flatMap((conn) => [conn.source, conn.target])
    );

    // Filter nodes to include only those that are part of the filtered connections
    const filteredNodes = nodes.filter((node) => connectedNodeIds.has(node.id));
    setFilteredNodes(filteredNodes);

    // Update final filtered connections based on the filtered nodes
    const finalFilteredConnections = filteredConnections.filter(conn => {
      return filteredNodes.some(node => node.id === conn.source) &&
             filteredNodes.some(node => node.id === conn.target);
    });
    setFinalFilteredConnections(finalFilteredConnections);

    // Calculate isolated node count
    const isolatedNodes = nodes.length - filteredNodes.length;
    setIsolatedNodeCount(isolatedNodes);
  }, [nodes, connections, connectionStrengthFilter]);

  const isRealData = nodes !== sampleNodes;

  // Placeholder function for revokePublicLink (no-op)
  const revokePublicLink = async (): Promise<void> => {
    console.log('Public link functionality disabled');
  };

  return {
    showConnectionLabels,
    setShowConnectionLabels,
    connectionStrengthFilter,
    setConnectionStrengthFilter,
    isRealData,
    realNodes,
    realConnections,
    isSyncing,
    isLoading,
    handleSync,
    toggleDataSource,
    usingRealData,
    publicId: null, // Always null since feature is disabled
    revokePublicLink,
    filteredNodes,
    finalFilteredConnections,
    isolatedNodeCount,
    categoryColors,
    setCategoryColors,
    connectionColors,
    setConnectionColors,
    hasNotionApiKey,
  };
};