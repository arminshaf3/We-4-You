import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.2';
import { corsHeaders } from '../_shared/requireStaff.ts';

function safeCard(input: unknown) {
  if (!input || typeof input !== 'object') return null;
  const card = input as Record<string, unknown>;
  const last4 = String(card.last4 ?? '').replace(/\D/g, '').slice(-4);
  return {
    brand: String(card.brand ?? 'Card').slice(0, 32),
    last4,
    cardholderName: String(card.cardholderName ?? '').slice(0, 120),
    expMonth: String(card.expMonth ?? '').replace(/\D/g, '').slice(0, 2),
    expYear: String(card.expYear ?? '').replace(/\D/g, '').slice(0, 4),
  };
}

serve(async (req) => {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    const { guardian, child, bandCode, vendorId, planId } = payload;

    if (!guardian?.fullName || !guardian?.mobile || !child?.name || !bandCode || !planId) {
      return new Response(JSON.stringify({ error: 'Missing required registration parameters' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

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
      payment_status: 'pending',
      card_details: safeCard(payload.cardDetails),
      timeline: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Applicant (Public Portal)',
          action: 'Registration Submitted',
          notes: 'Submitted online and queued for office review. Payment stays pending until staff confirm it.',
        },
      ],
    }).select().single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, referenceNumber: refNumber, registration: data }), {
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
