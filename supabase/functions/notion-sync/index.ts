
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notionApiKey = Deno.env.get('NOTION_API_KEY');
    
    if (!notionApiKey) {
      throw new Error('Notion API key not configured');
    }

    console.log('Starting Notion API sync...');

    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          property: 'object',
          value: 'database'
        }
      })
    });

    console.log('Notion API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Notion API error:', errorText);
      
      let errorMsg = `API request failed with status ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.code === 'unauthorized') {
          errorMsg = "Invalid API key. Please check your Notion integration token.";
        } else if (errorData.code === 'restricted_resource') {
          errorMsg = "Access denied. Make sure your integration has access to the databases.";
        } else if (errorData.message) {
          errorMsg = `Notion API Error: ${errorData.message}`;
        }
      } catch {
        if (response.status === 401) {
          errorMsg = "Invalid API key. Please check your Notion integration token.";
        } else if (response.status === 403) {
          errorMsg = "Access forbidden. Make sure your integration has proper permissions.";
        } else if (response.status === 404) {
          errorMsg = "Resource not found. Please check your integration setup.";
        }
      }
      
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log('Notion API success, found databases:', data.results?.length || 0);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    
    let errorMsg = "Unknown error occurred during sync.";
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
