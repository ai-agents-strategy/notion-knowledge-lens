
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const togetherApiKey = 'tgp_v1_xcgrv9gHvmyQSsyv7ona7jCmyarh8AIL1KEORdiF584';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, graphData } = await req.json();

    if (!togetherApiKey) {
      throw new Error('Together AI API key not configured');
    }

    // Prepare context about the knowledge graph
    const graphContext = `
Knowledge Graph Context:
- Total nodes: ${graphData.nodes?.length || 0}
- Total connections: ${graphData.connections?.length || 0}
- Node categories: ${graphData.nodes ? [...new Set(graphData.nodes.map((n: any) => n.category))].join(', ') : 'None'}
- Sample nodes: ${graphData.nodes?.slice(0, 5).map((n: any) => n.name).join(', ') || 'None'}

The user has a knowledge graph representing their Notion workspace with pages and their relationships.
`;

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that helps users understand and analyze their knowledge graph. ${graphContext} 
            
            Provide helpful insights about their knowledge graph structure, suggest connections they might be missing, 
            help them understand patterns in their data, and answer questions about their Notion workspace organization.
            
            Be concise but informative. If they ask about specific nodes or connections, refer to the actual data when possible.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
