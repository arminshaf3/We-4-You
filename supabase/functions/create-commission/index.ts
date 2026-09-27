import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call atomic commission creation RPC
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
