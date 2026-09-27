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

    const payload = await req.json();
    const { guardian, child, bandCode, vendorId, planId, cardDetails, paymentMethod } = payload;

    if (!guardian?.fullName || !guardian?.mobile || !child?.name || !bandCode || !planId) {
      return new Response(JSON.stringify({ error: 'Missing required registration parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique reference
    const refNumber = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase.from('registrations').insert({
      id: refNumber,
      reference_number: refNumber,
      wearer_data: child,
      contact_data: guardian,
      band_code: bandCode.toUpperCase().trim(),
      vendor_id: vendorId === 'DIRECT' ? null : vendorId,
      plan_id: planId,
      status: 'pending_verification',
      payment_status: paymentMethod === 'card' ? 'paid' : 'pending',
      card_details: cardDetails || null,
      timeline: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Applicant (Public Portal)',
          action: 'Registration Submitted',
          notes: 'Submitted online; queued for administrative verification.',
        },
      ],
    }).select().single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, referenceNumber: refNumber, registration: data }), {
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
