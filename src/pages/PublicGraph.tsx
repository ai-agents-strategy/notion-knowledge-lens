import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { DatabaseNode, DatabaseConnection } from '@/types/graph';
import { Loader2, ServerCrash, Share2 } from 'lucide-react';
import { categoryColors, connectionColors } from '@/components/KnowledgeGraph/graphConfig';

const fetchPublicGraph = async (publicId: string) => {
  const { data, error } = await supabase
    .from('graphs')
    .select('nodes, connections')
    .eq('public_id', publicId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    nodes: data.nodes as DatabaseNode[],
    connections: data.connections as DatabaseConnection[]
  };
};

const PublicGraph = () => {
  const { publicId } = useParams<{ publicId: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['publicGraph', publicId],
    queryFn: () => fetchPublicGraph(publicId!),
    enabled: !!publicId,
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20 text-black dark:text-white bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Share2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-notion-blue">
            Public Knowledge Graph
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          A shared visualization from a Notion workspace.
        </p>
        {data && (
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>{data.nodes.length} nodes</span>
            <span>{data.connections.length} connections</span>
          </div>
        )}
      </div>

      <div className="w-full h-screen">
        {isLoading && (
          <div className="flex flex-col gap-4 items-center justify-center h-full text-black dark:text-white">
            <Loader2 className="w-12 h-12 animate-spin text-notion-blue" />
            <p>Loading shared graph...</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col gap-4 items-center justify-center h-full text-red-600 dark:text-red-400">
            <ServerCrash className="w-12 h-12" />
            <p>Could not load shared graph.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        )}
        {data && (
          <KnowledgeGraph 
            nodes={data.nodes} 
            connections={data.connections} 
            showConnectionLabels={true}
            categoryColors={categoryColors}
            connectionColors={connectionColors}
          />
        )}
      </div>
    </div>
  );
};

export default PublicGraph;