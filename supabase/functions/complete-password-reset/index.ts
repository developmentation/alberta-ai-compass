import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, email, new_password } = await req.json();

    if (!user_id || !email || !new_password) {
      return new Response(
        JSON.stringify({ error: 'user_id, email, and new_password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(new_password, email);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user password in auth.users using admin client
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    );

    if (updateAuthError) {
      console.error('Error updating auth password:', updateAuthError);
      return new Response(
        JSON.stringify({ error: 'Failed to update password' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear temporary password fields in profiles
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        temporary_password_hash: null,
        requires_password_reset: false,
        temp_password_expires_at: null,
      })
      .eq('id', user_id);

    if (updateProfileError) {
      console.error('Error clearing temp password:', updateProfileError);
      return new Response(
        JSON.stringify({ error: 'Failed to complete password reset' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in complete-password-reset:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function validatePassword(password: string, email: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  if (password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
    return { valid: false, error: 'Password cannot contain your email address' };
  }

  return { valid: true };
}
