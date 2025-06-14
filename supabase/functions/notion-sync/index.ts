
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('api_key, database_id')
      .eq('user_id', user.id)
      .eq('integration_type', 'notion')
      .single()

    if (integrationError || !integration?.api_key) {
      return new Response(
        JSON.stringify({ error: 'Notion API key not found. Please configure it in Settings.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const notionApiKey = integration.api_key
    
    console.log('Starting Notion sync for user:', user.id)

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

    return new Response(
      JSON.stringify({
        success: true,
        total_databases: databasesData.results?.length || 0,
        total_pages: allPages.length,
        databases: databasesData.results || [],
        pages: allPages,
        results: databasesData.results || []
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

function extractPageTitle(page: any): string {
  if (page.properties) {
    // Look for title property first
    for (const [, prop] of Object.entries(page.properties)) {
      const propData = prop as any
      if (propData.type === 'title' && propData.title?.length > 0) {
        return propData.title[0]?.plain_text || 'Untitled'
      }
    }
    
    // Fall back to rich_text properties
    for (const [, prop] of Object.entries(page.properties)) {
      const propData = prop as any
      if (propData.type === 'rich_text' && propData.rich_text?.length > 0) {
        return propData.rich_text[0]?.plain_text || 'Untitled'
      }
    }
  }
  
  return `Page ${page.id.slice(0, 8)}`
}
