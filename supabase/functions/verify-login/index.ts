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
    // Use service role key for elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile by email using admin client (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, requires_password_reset, temporary_password_hash, temp_password_expires_at, is_active')
      .eq('email', email)
      .maybeSingle();

    console.log('Profile lookup for:', email);
    console.log('Profile found:', profile ? 'yes' : 'no');
    if (profile) {
      console.log('Profile details:', {
        has_temp_hash: !!profile.temporary_password_hash,
        requires_reset: profile.requires_password_reset,
        expires_at: profile.temp_password_expires_at
      });
    }

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Invalid login credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      // Don't reveal whether user exists - return generic error
      console.log('No profile found for email');
      return new Response(
        JSON.stringify({ error: 'Invalid login credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user account is active
    if (profile.is_active === false) {
      console.log('User account is inactive');
      return new Response(
        JSON.stringify({ error: 'Your account has been deactivated. Please contact an administrator.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user requires password reset with temp password
    console.log('Checking temp password requirement...');
    if (profile.requires_password_reset && profile.temporary_password_hash) {
      console.log('User has temp password requirement');
      // Check if temp password has expired
      if (profile.temp_password_expires_at) {
        const expiresAt = new Date(profile.temp_password_expires_at);
        if (expiresAt < new Date()) {
          // Clear expired temp password using admin client
          await supabaseAdmin
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
      console.log('Temp password match:', isValid);
      
      if (isValid) {
        console.log('Temp password verified, returning requires_reset=true');
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
      
      // Temp password was wrong - return generic error
      return new Response(
        JSON.stringify({ error: 'Invalid login credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User doesn't require password reset - return success indicating normal auth should be used
    // We don't create sessions here, just validate temp passwords
    console.log('No temp password requirement, indicating to try normal auth');
    return new Response(
      JSON.stringify({ try_normal_auth: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-login:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid login credentials' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
