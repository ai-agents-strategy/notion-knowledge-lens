
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20 text-white bg-slate-800/50 backdrop-blur-sm p-2 rounded-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Public Knowledge Graph
        </h1>
        <p className="text-slate-300 text-sm">A shared visualization from a Notion workspace.</p>
      </div>

      <div className="w-full h-screen">
        {isLoading && (
          <div className="flex flex-col gap-4 items-center justify-center h-full text-white">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p>Loading graph...</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col gap-4 items-center justify-center h-full text-red-400">
            <ServerCrash className="w-12 h-12" />
            <p>Could not load graph.</p>
            <p className="text-sm text-slate-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
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
