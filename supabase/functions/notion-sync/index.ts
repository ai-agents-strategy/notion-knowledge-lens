
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const apiKeyFromRequest = body?.apiKey

    // Create a Supabase client with the Auth context of the user that made the request.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session or user object
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user's Notion integration from the integrations table
    const { data: integration } = await supabaseClient
      .from('integrations')
      .select('api_key, database_id')
      .eq('user_id', user.id)
      .eq('integration_type', 'notion')
      .single()

    const notionApiKey = apiKeyFromRequest || integration?.api_key

    if (!notionApiKey) {
      return new Response(
        JSON.stringify({ error: 'Notion API key not found. Please provide one or configure it in Settings.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Starting Notion sync for user:', user.id)
    if (apiKeyFromRequest) console.log('Using API key provided in request.')
    else console.log('Using saved API key.')

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
    
    // Transform and save graph data to the database
    const { nodes, connections } = transformNotionDataToSEOGraph(allPages, databasesData.results || []);

    if (user && nodes.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from('graphs')
        .upsert({
          user_id: user.id,
          nodes: nodes,
          connections: connections,
        }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error upserting graph data:', upsertError);
        // Don't fail the request, just log it
      } else {
        console.log('Successfully saved graph data for user:', user.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        nodes: nodes,
        connections: connections,
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
