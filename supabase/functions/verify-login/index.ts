import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile by email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, requires_password_reset, temporary_password_hash, temp_password_expires_at')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      // Try normal login
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          requires_reset: false,
          session: authData.session,
          user: authData.user
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user requires password reset
    if (profile.requires_password_reset && profile.temporary_password_hash) {
      // Check if temp password has expired
      if (profile.temp_password_expires_at) {
        const expiresAt = new Date(profile.temp_password_expires_at);
        if (expiresAt < new Date()) {
          // Clear expired temp password
          await supabaseClient
            .from('profiles')
            .update({
              temporary_password_hash: null,
              requires_password_reset: false,
              temp_password_expires_at: null,
            })
            .eq('id', profile.id);

          return new Response(
            JSON.stringify({ error: 'Temporary password has expired. Please contact an administrator.' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Verify temporary password
      const passwordHash = await hashPassword(password);
      const isValid = passwordHash === profile.temporary_password_hash;
      
      if (isValid) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            requires_reset: true,
            user_id: profile.id,
            email: profile.email
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Try normal login
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        requires_reset: false,
        session: authData.session,
        user: authData.user
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-login:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
