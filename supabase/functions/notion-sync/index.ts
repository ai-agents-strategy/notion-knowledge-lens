
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

    console.log('Starting SEO Knowledge Graph sync...');

    // First, get all databases
    const databasesResponse = await fetch('https://api.notion.com/v1/search', {
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

    if (!databasesResponse.ok) {
      const errorText = await databasesResponse.text();
      console.log('Notion API error:', errorText);
      
      let errorMsg = `API request failed with status ${databasesResponse.status}`;
      
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
        if (databasesResponse.status === 401) {
          errorMsg = "Invalid API key. Please check your Notion integration token.";
        } else if (databasesResponse.status === 403) {
          errorMsg = "Access forbidden. Make sure your integration has proper permissions.";
        }
      }
      
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: databasesResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const databasesData = await databasesResponse.json();
    const databases = databasesData.results || [];
    
    console.log('Found databases:', databases.length);

    // Now fetch pages from each database
    const allPages = [];
    
    for (const db of databases) {
      try {
        console.log(`Fetching pages from database: ${db.id}`);
        
        const pagesResponse = await fetch(`https://api.notion.com/v1/databases/${db.id}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notionApiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            page_size: 100
          })
        });

        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json();
          const dbName = db.title?.[0]?.plain_text || `Database ${db.id.slice(0, 8)}`;
          
          // Add database info to each page
          const pagesWithDb = (pagesData.results || []).map(page => ({
            ...page,
            database_name: dbName,
            database_id: db.id
          }));
          
          allPages.push(...pagesWithDb);
          console.log(`Found ${pagesWithDb.length} pages in ${dbName}`);
        } else {
          console.log(`Failed to fetch pages from ${db.id}:`, pagesResponse.status);
        }
      } catch (error) {
        console.log(`Error fetching pages from ${db.id}:`, error);
      }
    }

    console.log('SEO Knowledge Graph sync complete, processed pages:', allPages.length);

    return new Response(JSON.stringify({
      pages: allPages,
      databases: databases,
      total_pages: allPages.length,
      total_databases: databases.length
    }), {
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
