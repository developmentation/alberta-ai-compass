import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');
    
    // Input validation for request size (prevent DoS attacks)
    const contentLength = req.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > 1000000) { // 1MB limit
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authHeader!,
        },
      },
    });

    // Verify user authentication and get profile
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile and verify role for non-GET operations
    if (req.method !== 'GET') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Only facilitators and admins can modify tools
      if (!['facilitator', 'admin'].includes(profile.role)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const method = req.method;
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    switch (method) {
      case 'GET':
        if (id) {
          // Get single tool
          const { data, error } = await supabase
            .from('tools')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all tools
          const { data, error } = await supabase
            .from('tools')
            .select('*, profiles!created_by(full_name, email)')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const toolData = await req.json();
        
        // Input validation
        if (!toolData.name || typeof toolData.name !== 'string' || toolData.name.trim().length === 0) {
          return new Response(JSON.stringify({ error: 'Name is required and must be a non-empty string' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!toolData.description || typeof toolData.description !== 'string' || toolData.description.trim().length === 0) {
          return new Response(JSON.stringify({ error: 'Description is required and must be a non-empty string' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!toolData.type || !['free_tool', 'paid_tool', 'paid_subscription', 'freemium'].includes(toolData.type)) {
          return new Response(JSON.stringify({ error: 'Valid type is required (free_tool, paid_tool, paid_subscription, freemium)' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Sanitize inputs
        const sanitizedName = toolData.name.trim().substring(0, 255);
        const sanitizedDescription = toolData.description.trim().substring(0, 2000);
        
        const { data: insertData, error: insertError } = await supabase
          .from('tools')
          .insert({
            name: sanitizedName,
            description: sanitizedDescription,
            type: toolData.type,
            cost_indicator: toolData.cost_indicator,
            url: toolData.url,
            status: toolData.status || 'draft',
            created_by: user.id,
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        return new Response(JSON.stringify(insertData), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!id) {
          throw new Error('ID is required for update');
        }
        
        const updateData = await req.json();
        
        const { data: updatedData, error: updateError } = await supabase
          .from('tools')
          .update({
            name: updateData.name,
            description: updateData.description,
            type: updateData.type,
            cost_indicator: updateData.cost_indicator,
            url: updateData.url,
            status: updateData.status,
            updated_by: user.id,
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        return new Response(JSON.stringify(updatedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!id) {
          throw new Error('ID is required for delete');
        }
        
        const { error: deleteError } = await supabase
          .from('tools')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
        
        if (deleteError) throw deleteError;
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in tools-crud function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});