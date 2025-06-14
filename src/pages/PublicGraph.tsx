
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { DatabaseNode, DatabaseConnection } from '@/types/graph';
import { Loader2, ServerCrash } from 'lucide-react';

const fetchPublicGraph = async (publicId: string) => {
  const { data, error } = await supabase.functions.invoke('get-public-graph', {
    body: { publicId },
  });

  if (error) {
    throw new Error(error.message);
  }
  if (data.error) {
    throw new Error(data.error);
  }

  return data as { nodes: DatabaseNode[]; connections: DatabaseConnection[] };
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
      <div className="absolute top-4 left-4 z-20 text-black dark:text-white bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-notion-blue">
          Public Knowledge Graph
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">A shared visualization from a Notion workspace.</p>
      </div>

      <div className="w-full h-screen">
        {isLoading && (
          <div className="flex flex-col gap-4 items-center justify-center h-full text-black dark:text-white">
            <Loader2 className="w-12 h-12 animate-spin text-notion-blue" />
            <p>Loading graph...</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col gap-4 items-center justify-center h-full text-red-600 dark:text-red-400">
            <ServerCrash className="w-12 h-12" />
            <p>Could not load graph.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        )}
        {data && (
          <KnowledgeGraph nodes={data.nodes} connections={data.connections} showConnectionLabels={true} />
        )}
      </div>
    </div>
  );
};

export default PublicGraph;
