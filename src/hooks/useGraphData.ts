
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleNodes, sampleConnections } from '@/data/sample-data';
import { useIntegrations } from './useIntegrations';

// Define node and connection types
export interface GraphNode {
  id: string;
  name: string;
  category: string;
  description?: string;
  metadata?: any;
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
  metadata?: any;
  color?: string;
}

// Hook definition
export const useGraphData = () => {
  const { user } = useUser();
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
  const [publicId, setPublicId] = useState<string | null>(null);
	const [categoryColors, setCategoryColors] = useState<{ [category: string]: string }>({});
  const [connectionColors, setConnectionColors] = useState<{ [connectionId: string]: string }>({});

  const { integrations, loading: integrationsLoading, getIntegration } = useIntegrations();

  const hasNotionApiKey = !!getIntegration('notion')?.api_key;

  // Load graph data from local storage on mount
  useEffect(() => {
    const storedNodes = localStorage.getItem('graphNodes');
    const storedConnections = localStorage.getItem('graphConnections');
    if (storedNodes && storedConnections) {
      setNodes(JSON.parse(storedNodes));
      setConnections(JSON.parse(storedConnections));
    }
  }, []);

  // Save graph data to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('graphNodes', JSON.stringify(nodes));
    localStorage.setItem('graphConnections', JSON.stringify(connections));
  }, [nodes, connections]);

  // Sync data from Supabase
  const handleSync = useCallback(async () => {
    if (!user) {
      console.error('❌ Cannot sync: no user');
      return;
    }

    setIsSyncing(true);
    console.log('🚀 Syncing data for user:', user.id);

    try {
      const notionIntegration = getIntegration('notion');

      if (!notionIntegration?.api_key || !notionIntegration?.database_id) {
        toast({
          title: "Error",
          description: "Notion API key or database ID not configured",
          variant: "destructive",
        });
        return;
      }

      // Function to fetch data from the Supabase function
      const res = await fetch(`/api/sync-notion?notion_api_key=${notionIntegration.api_key}&database_id=${notionIntegration.database_id}`);
      if (!res.ok) {
        console.error('❌ Error syncing data:', res.statusText);
        toast({
          title: "Sync Error",
          description: `Failed to sync data: ${res.statusText}`,
          variant: "destructive",
        });
        return;
      }

      const { nodes: fetchedNodes, connections: fetchedConnections } = await res.json() as { nodes: GraphNode[], connections: GraphConnection[] };

      if (!fetchedNodes || !fetchedConnections) {
        console.error('❌ Invalid data received from sync');
        toast({
          title: "Sync Error",
          description: "Invalid data received from sync",
          variant: "destructive",
        });
        return;
      }

      // Add a unique ID to each node if it doesn't have one
      const nodesWithIds = fetchedNodes.map(node => ({
        ...node,
        id: node.id || uuidv4(),
      }));

      setRealNodes(nodesWithIds);
      setRealConnections(fetchedConnections);
      setNodes(nodesWithIds);
      setConnections(fetchedConnections);
      setUsingRealData(true);

      toast({
        title: "Success",
        description: "Graph synced successfully",
      });
    } catch (error) {
      console.error('❌ Unexpected error during sync:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred during sync",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, getIntegration]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (!user) {
      console.log('ℹ️ No user, using sample data');
      setNodes(sampleNodes);
      setConnections(sampleConnections);
      setRealNodes(sampleNodes);
      setRealConnections(sampleConnections);
      setIsLoading(false);
      return;
    }

    if (integrationsLoading) {
      console.log('ℹ️ Integrations loading, skipping data fetch');
      return;
    }

    const publicIdParam = searchParams.get('publicId');
    if (publicIdParam) {
      console.log('ℹ️ Public ID found in URL, fetching public graph');
      fetchPublicGraph(publicIdParam);
    } else {
      console.log('🔌 User logged in, fetching graph data');
      fetchGraphData();
    }
  }, [user, integrationsLoading]);

  const fetchGraphData = async () => {
    setIsLoading(true);
    if (realNodes.length > 0 && realConnections.length > 0) {
      console.log('✅ Using cached real data');
      setNodes(realNodes);
      setConnections(realConnections);
      setIsLoading(false);
      return;
    }

    setNodes(sampleNodes);
    setConnections(sampleConnections);
    setIsLoading(false);
  };

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

      setNodes(Array.isArray(graph.nodes) ? graph.nodes as GraphNode[] : []);
      setConnections(Array.isArray(graph.connections) ? graph.connections as GraphConnection[] : []);
      setUsingRealData(false);
      setPublicId(publicId);
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
      console.log('✅ Switching to real data');
      setNodes(realNodes);
      setConnections(realConnections);
      setUsingRealData(true);
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

  const generatePublicLink = async (): Promise<string | null> => {
    if (!user) {
      console.error('❌ Cannot generate public link: no user');
      return null;
    }

    try {
      console.log('🔗 Generating public link for user:', user.id);
      
      // First check if a public graph already exists
      const { data: existingGraph, error: checkError } = await supabase
        .from('graphs')
        .select('public_id')
        .eq('user_id', user.id)
        .not('public_id', 'is', null)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing public graph:', checkError);
        toast({
          title: "Error",
          description: "Failed to check existing public link",
          variant: "destructive",
        });
        return null;
      }

      if (existingGraph?.public_id) {
        // Return existing public link
        const link = `${window.location.origin}/public/graph/${existingGraph.public_id}`;
        console.log('✅ Using existing public link:', link);
        setPublicId(existingGraph.public_id);
        return link;
      }

      // Generate new public ID
      const newPublicId = crypto.randomUUID();
      
      // Create or update graph entry with public ID
      const { data, error } = await supabase
        .from('graphs')
        .upsert({
          user_id: user.id,
          public_id: newPublicId,
          nodes: usingRealData ? realNodes : sampleNodes,
          connections: usingRealData ? realConnections : sampleConnections
        })
        .select('public_id')
        .single();

      if (error) {
        console.error('❌ Error creating public graph:', error);
        toast({
          title: "Error",
          description: "Failed to generate public link",
          variant: "destructive",
        });
        return null;
      }

      const link = `${window.location.origin}/public/graph/${data.public_id}`;
      console.log('✅ Generated new public link:', link);
      setPublicId(data.public_id);
      
      toast({
        title: "Success",
        description: "Public link generated successfully",
      });
      
      return link;
    } catch (error) {
      console.error('❌ Unexpected error generating public link:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const revokePublicLink = async (): Promise<void> => {
    if (!user) {
      console.error('❌ Cannot revoke public link: no user');
      return;
    }

    if (!publicId) {
      console.warn('⚠️ No public ID to revoke');
      return;
    }

    try {
      console.log('🔥 Revoking public link for user:', user.id, 'and public ID:', publicId);

      const { error } = await supabase
        .from('graphs')
        .update({ public_id: null })
        .eq('user_id', user.id)
        .eq('public_id', publicId);

      if (error) {
        console.error('❌ Error revoking public graph:', error);
        toast({
          title: "Error",
          description: "Failed to revoke public link",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Public link revoked successfully');
      setPublicId(null);
      
      toast({
        title: "Success",
        description: "Public link revoked successfully",
      });
    } catch (error) {
      console.error('❌ Unexpected error revoking public link:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
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
    publicId,
    generatePublicLink,
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
