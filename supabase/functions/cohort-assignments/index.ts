import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignmentUploadRequest {
  cohort_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  name: string;
  description?: string;
}

interface AssignmentDeleteRequest {
  assignment_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify user auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (req.method === 'POST') {
      const body: AssignmentUploadRequest = await req.json();
      
      // Verify user is member of the cohort
      const { data: membership, error: membershipError } = await supabase
        .from('cohort_members')
        .select('id')
        .eq('cohort_id', body.cohort_id)
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .eq('status', 'enrolled')
        .maybeSingle();

      if (membershipError || !membership) {
        return new Response(
          JSON.stringify({ error: 'Access denied: Not a member of this cohort' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Create assignment record
      const { data: assignment, error: insertError } = await supabase
        .from('cohort_assignments')
        .insert({
          cohort_id: body.cohort_id,
          user_id: user.id,
          file_name: body.file_name,
          file_path: body.file_path,
          file_size: body.file_size,
          content_type: body.content_type,
          name: body.name,
          description: body.description || null,
          created_by: user.id
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating assignment record:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create assignment record' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(JSON.stringify(assignment), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (req.method === 'DELETE') {
      const body: AssignmentDeleteRequest = await req.json();
      
      // Get user profile for role checking
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return new Response(
          JSON.stringify({ error: 'Failed to get user profile' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Check if user owns the assignment or is admin/facilitator
      const { data: assignment, error: assignmentError } = await supabase
        .from('cohort_assignments')
        .select('user_id, file_path')
        .eq('id', body.assignment_id)
        .is('deleted_at', null)
        .single();

      if (assignmentError || !assignment) {
        return new Response(
          JSON.stringify({ error: 'Assignment not found' }),
          {
            status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Check permissions: user owns assignment or is admin/facilitator
      const canDelete = assignment.user_id === user.id || 
                       ['admin', 'facilitator'].includes(profile.role);

      if (!canDelete) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Soft delete the assignment
      const { error: deleteError } = await supabase
        .from('cohort_assignments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', body.assignment_id);

      if (deleteError) {
        console.error('Error deleting assignment:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete assignment' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Delete the actual file from storage
      try {
        const { error: storageError } = await supabase.storage
          .from('cohort-assignments')
          .remove([assignment.file_path]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Don't fail the request if file deletion fails
        }
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in cohort-assignments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);