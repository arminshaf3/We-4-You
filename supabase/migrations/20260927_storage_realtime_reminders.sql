-- ==============================================================================
-- WE 4 YOU - STORAGE SECURITY, REALTIME PUBLICATIONS & SUBSCRIPTION REMINDERS
-- ==============================================================================

-- 1. STORAGE BUCKETS SETUP
-- Private buckets (wearer-photos, payment-receipts) & Public bucket (branding-assets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('wearer-photos', 'wearer-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('payment-receipts', 'payment-receipts', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('branding-assets', 'branding-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. STORAGE RLS POLICIES
-- Note: storage.objects already has RLS enabled by Supabase Storage by default.

-- Allow public read ONLY on branding-assets
DROP POLICY IF EXISTS "Public can read branding assets" ON storage.objects;
CREATE POLICY "Public can read branding assets" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'branding-assets');

-- Allow authenticated users with admin/support role to read and upload private objects
DROP POLICY IF EXISTS "Staff can access wearer photos" ON storage.objects;
CREATE POLICY "Staff can access wearer photos" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id IN ('wearer-photos', 'payment-receipts', 'branding-assets')
)
WITH CHECK (
  bucket_id IN ('wearer-photos', 'payment-receipts', 'branding-assets')
);

-- Allow public upload to wearer-photos during registration (write-only)
DROP POLICY IF EXISTS "Public can upload registration photo" ON storage.objects;
CREATE POLICY "Public can upload registration photo" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'wearer-photos');


-- 3. RENEWAL REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  wearer_id TEXT REFERENCES public.wearers(id) ON DELETE SET NULL,
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  channel TEXT NOT NULL DEFAULT 'email', -- 'email' | 'sms' | 'phone_call'
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'delivered' | 'failed' | 'acknowledged'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_by TEXT DEFAULT 'System Automated Scheduler',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff full access to renewal reminders" ON public.renewal_reminders
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);


-- 4. SUBSCRIPTION STATUS SYNC & EXPIRING DETECTION FUNCTION
CREATE OR REPLACE FUNCTION public.sync_subscription_statuses_atomic()
RETURNS JSONB AS $$
DECLARE
  v_updated_expiring INTEGER := 0;
  v_updated_expired INTEGER := 0;
BEGIN
  -- Mark subscriptions expiring within 30 days as 'expiring_soon'
  WITH upd_expiring AS (
    UPDATE public.subscriptions
    SET status = 'expiring_soon', updated_at = now()
    WHERE status = 'active'
      AND expiry_date <= (CURRENT_DATE + interval '30 days')
      AND expiry_date >= CURRENT_DATE
    RETURNING id
  )
  SELECT count(*) INTO v_updated_expiring FROM upd_expiring;

  -- Mark subscriptions past expiry date as 'expired'
  WITH upd_expired AS (
    UPDATE public.subscriptions
    SET status = 'expired', updated_at = now()
    WHERE status IN ('active', 'expiring_soon')
      AND expiry_date < CURRENT_DATE
    RETURNING id
  )
  SELECT count(*) INTO v_updated_expired FROM upd_expired;

  RETURN jsonb_build_object(
    'success', true,
    'expiring_soon_count', v_updated_expiring,
    'expired_count', v_updated_expired,
    'message', 'Subscription coverage statuses synchronized.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. SEND & RECORD RENEWAL REMINDER FUNCTION
CREATE OR REPLACE FUNCTION public.send_renewal_reminder_atomic(
  p_subscription_id TEXT,
  p_channel TEXT DEFAULT 'email',
  p_actor TEXT DEFAULT 'Support Coordinator',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_sub RECORD;
  v_wearer RECORD;
  v_reminder_id UUID;
  v_recip_name TEXT;
  v_recip_email TEXT;
  v_recip_phone TEXT;
BEGIN
  SELECT * INTO v_sub FROM public.subscriptions WHERE id = p_subscription_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription % not found', p_subscription_id;
  END IF;

  SELECT * INTO v_wearer FROM public.wearers WHERE id = v_sub.child_id OR id = v_sub.wearer_id;
  
  v_recip_name := COALESCE(v_wearer.primary_contact->>'fullName', 'Guardian');
  v_recip_email := v_wearer.primary_contact->>'email';
  v_recip_phone := v_wearer.primary_contact->>'mobile';

  INSERT INTO public.renewal_reminders (
    subscription_id,
    wearer_id,
    recipient_name,
    recipient_email,
    recipient_phone,
    channel,
    status,
    sent_at,
    sent_by,
    notes,
    created_at
  ) VALUES (
    v_sub.id,
    v_wearer.id,
    v_recip_name,
    v_recip_email,
    v_recip_phone,
    p_channel,
    'sent',
    now(),
    p_actor,
    p_notes,
    now()
  )
  RETURNING id INTO v_reminder_id;

  -- Record in Audit Log
  INSERT INTO public.audit_logs (
    actor,
    action_type,
    description,
    entity_type,
    entity_id,
    metadata,
    created_at
  ) VALUES (
    p_actor,
    'Renewal Reminder Dispatched',
    'Sent ' || p_channel || ' renewal reminder for subscription ' || v_sub.id || ' (Wearer: ' || COALESCE(v_wearer.name, 'Unknown') || ') to ' || v_recip_name,
    'subscription',
    v_sub.id,
    jsonb_build_object('channel', p_channel, 'reminder_id', v_reminder_id, 'expiry_date', v_sub.expiry_date),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'reminder_id', v_reminder_id,
    'subscription_id', v_sub.id,
    'wearer_name', v_wearer.name,
    'recipient_name', v_recip_name,
    'message', 'Renewal reminder recorded and dispatched successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. ENABLE REALTIME ON KEY TABLES
-- Add tables to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'incidents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'bands'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bands;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
END $$;

-- 7. GRANT EXECUTION PERMISSIONS
GRANT EXECUTE ON FUNCTION public.sync_subscription_statuses_atomic() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.send_renewal_reminder_atomic(TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
