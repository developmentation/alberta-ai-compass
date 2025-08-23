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

    // Verify user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const method = req.method;
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    switch (method) {
      case 'GET':
        if (id) {
          // Get single news item
          const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all news items
          const { data, error } = await supabase
            .from('news')
            .select('*, profiles!created_by(full_name, email)')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const newsData = await req.json();
        
        const { data: insertData, error: insertError } = await supabase
          .from('news')
          .insert({
            title: newsData.title,
            description: newsData.description,
            level: newsData.level,
            status: newsData.status || 'draft',
            metadata: newsData.metadata,
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
          .from('news')
          .update({
            title: updateData.title,
            description: updateData.description,
            level: updateData.level,
            status: updateData.status,
            metadata: updateData.metadata,
            is_active: updateData.is_active,
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
          .from('news')
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
    console.error('Error in news-crud function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});