import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2' // Bypassing DB for testing

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper functions moved from client-side to be used here
function extractPageTitle(page: any): string {
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
}

function transformNotionDataToSEOGraph(pages: any[], _databases: any[]) {
    const nodes: any[] = [];
    const connections: any[] = [];

    pages.forEach((page: any) => {
      const pageTitle = page.extracted_title || extractPageTitle(page);
      const categoryFromDb = page.database_name?.toLowerCase().replace(/\s+/g, '_') || 'content';
      
      const pageNode = {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const notionApiKey = body?.apiKey

    if (!notionApiKey) {
      return new Response(
        JSON.stringify({ error: 'Notion API key not found in request body.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Starting Notion sync using API key provided in request (auth bypassed for testing).')

    // First, get all databases the integration has access to
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
    })

    if (!databasesResponse.ok) {
      const errorText = await databasesResponse.text()
      console.error('Notion databases API error:', errorText)
      return new Response(
        JSON.stringify({ error: `Notion API error: ${databasesResponse.status} - ${errorText}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const databasesData = await databasesResponse.json()
    console.log(`Found ${databasesData.results?.length || 0} databases`)

    const allPages: any[] = []
    const pagePromises: Promise<any>[] = []

    // For each database, get its pages
    for (const database of databasesData.results || []) {
      const pagePromise = fetch(`https://api.notion.com/v1/databases/${database.id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionApiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({})
      }).then(async (pagesResponse) => {
        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json()
          console.log(`Database ${database.id}: Found ${pagesData.results?.length || 0} pages`)
          
          return (pagesData.results || []).map((page: any) => ({
            ...page,
            database_id: database.id,
            database_name: database.title?.[0]?.plain_text || 'Untitled Database',
            extracted_title: extractPageTitle(page)
          }))
        } else {
          console.error(`Failed to fetch pages for database ${database.id}:`, pagesResponse.status)
          return []
        }
      }).catch((error) => {
        console.error(`Error fetching pages for database ${database.id}:`, error)
        return []
      })

      pagePromises.push(pagePromise)
    }

    // Wait for all page requests to complete
    const pageResults = await Promise.all(pagePromises)
    pageResults.forEach(pages => allPages.push(...pages))

    console.log(`Total pages collected: ${allPages.length}`)
    
    // Transform data for graph
    const { nodes, connections } = transformNotionDataToSEOGraph(allPages, databasesData.results || []);

    // NOTE: Bypassing saving graph data to the database for this test run.

    return new Response(
      JSON.stringify({
        success: true,
        nodes: nodes,
        connections: connections,
        results: databasesData.results || [], // For frontend compatibility
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error) {
    console.error('Unexpected error in notion-sync:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
