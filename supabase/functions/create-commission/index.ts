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

    const body = await req.json();
    const {
      vendorId,
      saleId,
      registrationRef,
      type,
      rate,
      eligibleAmount,
      adminActor,
      status = 'pending',
    } = body;

    if (!vendorId || !eligibleAmount) {
      return new Response(
        JSON.stringify({ error: 'vendorId and eligibleAmount are required' }),
        {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data, error } = await supabase.rpc('create_commission_atomic', {
      p_vendor_id: vendorId,
      p_sale_id: saleId || `MAN-${Date.now()}`,
      p_registration_ref: registrationRef || null,
      p_type: type || 'percentage',
      p_rate: rate !== undefined ? Number(rate) : null,
      p_eligible_amount: Number(eligibleAmount),
      p_status: status,
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
