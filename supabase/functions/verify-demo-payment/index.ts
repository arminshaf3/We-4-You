import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.2';
import { corsHeaders, requireStaff } from '../_shared/requireStaff.ts';

serve(async (req) => {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const staff = await requireStaff(req, supabase, ['admin']);
    if (!staff.ok) return staff.response;

    const { paymentId, adminActor } = await req.json();

    if (!paymentId) {
      return new Response(JSON.stringify({ error: 'paymentId is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase.rpc('verify_demo_payment_atomic', {
      p_payment_id: paymentId,
      p_admin_actor: adminActor || 'Admin Coordinator',
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
