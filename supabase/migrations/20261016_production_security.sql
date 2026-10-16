-- Production lockdown for the subscription band service.
-- Wearers are any person who buys a band. Privileged work stays with staff.

-- 1. Pin search_path on helpers before other functions call them.
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(auth.role(), '') = 'service_role'
      OR COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
      OR COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role';
$$;

ALTER FUNCTION public.get_auth_role() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_support_or_admin() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Rename privileged functions once, then wrap them with a staff check.
DO $$
BEGIN
  IF to_regprocedure('public.approve_registration_atomic_internal(text,text,text)') IS NULL
     AND to_regprocedure('public.approve_registration_atomic(text,text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.approve_registration_atomic(text, text, text)
      RENAME TO approve_registration_atomic_internal;
  END IF;

  IF to_regprocedure('public.reject_registration_atomic_internal(text,text,text)') IS NULL
     AND to_regprocedure('public.reject_registration_atomic(text,text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.reject_registration_atomic(text, text, text)
      RENAME TO reject_registration_atomic_internal;
  END IF;

  IF to_regprocedure('public.verify_demo_payment_atomic_internal(uuid,text)') IS NULL
     AND to_regprocedure('public.verify_demo_payment_atomic(uuid,text)') IS NOT NULL THEN
    ALTER FUNCTION public.verify_demo_payment_atomic(uuid, text)
      RENAME TO verify_demo_payment_atomic_internal;
  END IF;

  IF to_regprocedure('public.create_commission_atomic_internal(text,text,text,text,numeric,numeric,text,text)') IS NULL
     AND to_regprocedure('public.create_commission_atomic(text,text,text,text,numeric,numeric,text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.create_commission_atomic(text, text, text, text, numeric, numeric, text, text)
      RENAME TO create_commission_atomic_internal;
  END IF;

  IF to_regprocedure('public.lookup_band_guardian_secure_internal(text,text)') IS NULL
     AND to_regprocedure('public.lookup_band_guardian_secure(text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.lookup_band_guardian_secure(text, text)
      RENAME TO lookup_band_guardian_secure_internal;
  END IF;

  IF to_regprocedure('public.log_guardian_contact_attempt_internal(text,text,text,text,text,text)') IS NULL
     AND to_regprocedure('public.log_guardian_contact_attempt(text,text,text,text,text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.log_guardian_contact_attempt(text, text, text, text, text, text)
      RENAME TO log_guardian_contact_attempt_internal;
  END IF;

  IF to_regprocedure('public.update_incident_status_atomic_internal(text,text,text,text,text)') IS NULL
     AND to_regprocedure('public.update_incident_status_atomic(text,text,text,text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.update_incident_status_atomic(text, text, text, text, text)
      RENAME TO update_incident_status_atomic_internal;
  END IF;

  IF to_regprocedure('public.sync_subscription_statuses_atomic_internal()') IS NULL
     AND to_regprocedure('public.sync_subscription_statuses_atomic()') IS NOT NULL THEN
    ALTER FUNCTION public.sync_subscription_statuses_atomic()
      RENAME TO sync_subscription_statuses_atomic_internal;
  END IF;

  IF to_regprocedure('public.send_renewal_reminder_atomic_internal(text,text,text,text)') IS NULL
     AND to_regprocedure('public.send_renewal_reminder_atomic(text,text,text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.send_renewal_reminder_atomic(text, text, text, text)
      RENAME TO send_renewal_reminder_atomic_internal;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regprocedure('public.approve_registration_atomic_internal(text,text,text)') IS NULL
     OR to_regprocedure('public.reject_registration_atomic_internal(text,text,text)') IS NULL
     OR to_regprocedure('public.verify_demo_payment_atomic_internal(uuid,text)') IS NULL
     OR to_regprocedure('public.create_commission_atomic_internal(text,text,text,text,numeric,numeric,text,text)') IS NULL
     OR to_regprocedure('public.lookup_band_guardian_secure_internal(text,text)') IS NULL
     OR to_regprocedure('public.log_guardian_contact_attempt_internal(text,text,text,text,text,text)') IS NULL
     OR to_regprocedure('public.update_incident_status_atomic_internal(text,text,text,text,text)') IS NULL
     OR to_regprocedure('public.sync_subscription_statuses_atomic_internal()') IS NULL
     OR to_regprocedure('public.send_renewal_reminder_atomic_internal(text,text,text,text)') IS NULL
  THEN
    RAISE EXCEPTION 'Privileged function rename did not match the expected signatures. No wrappers were created.';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.approve_registration_atomic(
  p_registration_id TEXT,
  p_admin_actor TEXT,
  p_reason TEXT DEFAULT 'All credentials and band verified.'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_support_or_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.approve_registration_atomic_internal(p_registration_id, p_admin_actor, p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_registration_atomic(
  p_registration_id TEXT,
  p_admin_actor TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_support_or_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.reject_registration_atomic_internal(p_registration_id, p_admin_actor, p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_demo_payment_atomic(
  p_payment_id UUID,
  p_admin_actor TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.verify_demo_payment_atomic_internal(p_payment_id, p_admin_actor);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_commission_atomic(
  p_vendor_id TEXT,
  p_sale_id TEXT,
  p_registration_ref TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'percentage',
  p_rate NUMERIC DEFAULT NULL,
  p_eligible_amount NUMERIC DEFAULT 0,
  p_status TEXT DEFAULT 'pending',
  p_admin_actor TEXT DEFAULT 'Admin Coordinator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.create_commission_atomic_internal(
    p_vendor_id,
    p_sale_id,
    p_registration_ref,
    p_type,
    p_rate,
    p_eligible_amount,
    p_status,
    p_admin_actor
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_band_guardian_secure(
  p_band_code TEXT,
  p_actor TEXT DEFAULT 'Support Staff'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_support_or_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.lookup_band_guardian_secure_internal(p_band_code, p_actor);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_guardian_contact_attempt(
  p_incident_id TEXT,
  p_actor TEXT,
  p_method TEXT,
  p_contact_target TEXT,
  p_outcome TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_support_or_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.log_guardian_contact_attempt_internal(
    p_incident_id, p_actor, p_method, p_contact_target, p_outcome, p_notes
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_incident_status_atomic(
  p_incident_id TEXT,
  p_actor TEXT,
  p_status TEXT,
  p_outcome_summary TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_support_or_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.update_incident_status_atomic_internal(
    p_incident_id, p_actor, p_status, p_outcome_summary, p_notes
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_subscription_statuses_atomic()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_support_or_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.sync_subscription_statuses_atomic_internal();
END;
$$;

CREATE OR REPLACE FUNCTION public.send_renewal_reminder_atomic(
  p_subscription_id TEXT,
  p_channel TEXT DEFAULT 'email',
  p_actor TEXT DEFAULT 'Support Coordinator',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_service_role() OR public.is_support_or_admin()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN public.send_renewal_reminder_atomic_internal(
    p_subscription_id, p_channel, p_actor, p_notes
  );
END;
$$;

-- Public band check: existence and availability only. No wearer id, name, or contacts.
CREATE OR REPLACE FUNCTION public.check_band_availability(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_reference TEXT;
  v_status TEXT;
  v_child_id TEXT;
  v_wearer_id TEXT;
  v_vendor_id TEXT;
  v_taken BOOLEAN;
BEGIN
  v_code := upper(regexp_replace(coalesce(p_code, ''), '[^A-Z0-9]', '', 'g'));
  IF length(v_code) < 3 THEN
    RETURN jsonb_build_object('found', false, 'assignable', false, 'already_registered', false);
  END IF;

  SELECT reference_code, status, child_id, wearer_id, vendor_id
    INTO v_reference, v_status, v_child_id, v_wearer_id, v_vendor_id
  FROM public.bands
  WHERE upper(regexp_replace(reference_code, '[^A-Z0-9]', '', 'g')) = v_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'assignable', false, 'already_registered', false);
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.registrations r
    WHERE upper(regexp_replace(r.band_code, '[^A-Z0-9]', '', 'g')) = v_code
      AND r.status IN ('pending_verification', 'approved', 'update_requested')
  ) INTO v_taken;

  RETURN jsonb_build_object(
    'found', true,
    'status', v_status,
    'reference_code', v_reference,
    'vendor_id', v_vendor_id,
    'already_registered', v_taken,
    'assignable', v_status = 'available'
      AND v_child_id IS NULL
      AND v_wearer_id IS NULL
      AND NOT v_taken
  );
END;
$$;

-- Public emergency lookup no longer returns a person's name, medical data, or phone numbers.
CREATE OR REPLACE FUNCTION public.lookup_band_emergency(lookup_code TEXT)
RETURNS TABLE (
  band_reference TEXT,
  wearer_name TEXT,
  demographic_category TEXT,
  blood_type TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  primary_contact JSONB,
  secondary_contacts JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.reference_code,
    NULL::TEXT,
    NULL::TEXT,
    NULL::TEXT,
    NULL::TEXT,
    NULL::TEXT,
    NULL::JSONB,
    NULL::JSONB
  FROM public.bands b
  WHERE upper(regexp_replace(b.reference_code, '[^A-Z0-9]', '', 'g'))
      = upper(regexp_replace(coalesce(lookup_code, ''), '[^A-Z0-9]', '', 'g'))
  LIMIT 1;
END;
$$;

ALTER FUNCTION public.submit_found_child_report(text, text, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.approve_registration_atomic_internal(text, text, text) SET search_path = public;
ALTER FUNCTION public.reject_registration_atomic_internal(text, text, text) SET search_path = public;
ALTER FUNCTION public.verify_demo_payment_atomic_internal(uuid, text) SET search_path = public;
ALTER FUNCTION public.create_commission_atomic_internal(text, text, text, text, numeric, numeric, text, text) SET search_path = public;
ALTER FUNCTION public.lookup_band_guardian_secure_internal(text, text) SET search_path = public;
ALTER FUNCTION public.log_guardian_contact_attempt_internal(text, text, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.update_incident_status_atomic_internal(text, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.sync_subscription_statuses_atomic_internal() SET search_path = public;
ALTER FUNCTION public.send_renewal_reminder_atomic_internal(text, text, text, text) SET search_path = public;

-- 3. Execute rights
REVOKE ALL ON FUNCTION public.approve_registration_atomic_internal(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_registration_atomic_internal(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_demo_payment_atomic_internal(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_commission_atomic_internal(text, text, text, text, numeric, numeric, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.lookup_band_guardian_secure_internal(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_guardian_contact_attempt_internal(text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_incident_status_atomic_internal(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_subscription_statuses_atomic_internal() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.send_renewal_reminder_atomic_internal(text, text, text, text) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.approve_registration_atomic(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_registration_atomic(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_demo_payment_atomic(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_commission_atomic(text, text, text, text, numeric, numeric, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lookup_band_guardian_secure(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_guardian_contact_attempt(text, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_incident_status_atomic(text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sync_subscription_statuses_atomic() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.send_renewal_reminder_atomic(text, text, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.approve_registration_atomic(text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reject_registration_atomic(text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_demo_payment_atomic(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_commission_atomic(text, text, text, text, numeric, numeric, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lookup_band_guardian_secure(text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_guardian_contact_attempt(text, text, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_incident_status_atomic(text, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_subscription_statuses_atomic() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.send_renewal_reminder_atomic(text, text, text, text) TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.approve_registration_atomic_internal(text, text, text) TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.reject_registration_atomic_internal(text, text, text) TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.verify_demo_payment_atomic_internal(uuid, text) TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.create_commission_atomic_internal(text, text, text, text, numeric, numeric, text, text) TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.lookup_band_guardian_secure_internal(text, text) TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.log_guardian_contact_attempt_internal(text, text, text, text, text, text) TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.update_incident_status_atomic_internal(text, text, text, text, text) TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.sync_subscription_statuses_atomic_internal() TO service_role, CURRENT_USER;
GRANT EXECUTE ON FUNCTION public.send_renewal_reminder_atomic_internal(text, text, text, text) TO service_role, CURRENT_USER;

GRANT EXECUTE ON FUNCTION public.check_band_availability(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_found_child_report(text, text, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lookup_band_emergency(text) TO anon, authenticated, service_role;

-- 4. Profile role cannot be chosen by the account owner.
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  (id = auth.uid() AND role = 'parent')
  OR public.is_admin()
);

-- 5. Public writes are limited to registration and contact messages.
DROP POLICY IF EXISTS "public_insert_guardians" ON public.guardians;
CREATE POLICY "users_insert_own_guardian" ON public.guardians
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid() OR public.is_support_or_admin());

DROP POLICY IF EXISTS "public_insert_wearers" ON public.wearers;
CREATE POLICY "staff_insert_wearers" ON public.wearers
FOR INSERT TO authenticated
WITH CHECK (public.is_support_or_admin());

DROP POLICY IF EXISTS "public_insert_child_guardians" ON public.child_guardians;
CREATE POLICY "staff_insert_child_guardians" ON public.child_guardians
FOR INSERT TO authenticated
WITH CHECK (public.is_support_or_admin());

DROP POLICY IF EXISTS "public_lookup_band" ON public.bands;
DROP POLICY IF EXISTS "staff_read_bands" ON public.bands;
CREATE POLICY "staff_read_bands" ON public.bands
FOR SELECT TO authenticated
USING (public.is_support_or_admin());

DROP POLICY IF EXISTS "public_submit_registration" ON public.registrations;
CREATE POLICY "public_submit_registration" ON public.registrations
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'pending_verification'
  AND payment_status = 'pending'
  AND reference_number IS NOT NULL
  AND band_code IS NOT NULL
  AND (
    card_details IS NULL
    OR (
      jsonb_typeof(card_details) = 'object'
      AND NOT (card_details ? 'cardNumber')
      AND NOT (card_details ? 'card_number')
      AND NOT (card_details ? 'number')
      AND NOT (card_details ? 'cvv')
      AND NOT (card_details ? 'cvc')
      AND NOT (card_details ? 'pan')
    )
  )
);

DROP POLICY IF EXISTS "public_insert_subscriptions" ON public.subscriptions;
CREATE POLICY "staff_insert_subscriptions" ON public.subscriptions
FOR INSERT TO authenticated
WITH CHECK (public.is_support_or_admin());

DROP POLICY IF EXISTS "public_insert_payments" ON public.payments;
CREATE POLICY "staff_insert_payments" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_submit_incidents" ON public.incidents;
CREATE POLICY "staff_insert_incidents" ON public.incidents
FOR INSERT TO authenticated
WITH CHECK (public.is_support_or_admin());

DROP POLICY IF EXISTS "public_submit_contact_messages" ON public.contact_messages;
CREATE POLICY "public_submit_contact_messages" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "staff_insert_audit_logs" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_support_or_admin());

DO $$
BEGIN
  IF to_regclass('public.renewal_reminders') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Staff full access to renewal reminders" ON public.renewal_reminders';
    EXECUTE 'CREATE POLICY "Staff full access to renewal reminders" ON public.renewal_reminders FOR ALL TO authenticated USING (public.is_support_or_admin()) WITH CHECK (public.is_support_or_admin())';
  END IF;
END $$;

-- 6. Anonymous clients keep only the privileges the public site uses.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.plans TO anon;
GRANT SELECT ON public.vendors TO anon;
GRANT INSERT ON public.registrations TO anon;
GRANT INSERT ON public.contact_messages TO anon;

-- 7. Storage: private files are staff-only. Public registration may upload a photo path only.
DROP POLICY IF EXISTS "Staff can access wearer photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can read private files" ON storage.objects;
DROP POLICY IF EXISTS "Staff can insert private files" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update private files" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete private files" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload registration photo" ON storage.objects;

CREATE POLICY "Staff can read private files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id IN ('wearer-photos', 'payment-receipts', 'branding-assets')
  AND public.is_support_or_admin()
);

CREATE POLICY "Staff can insert private files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('wearer-photos', 'payment-receipts', 'branding-assets')
  AND public.is_support_or_admin()
);

CREATE POLICY "Staff can update private files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id IN ('wearer-photos', 'payment-receipts', 'branding-assets')
  AND public.is_support_or_admin()
)
WITH CHECK (
  bucket_id IN ('wearer-photos', 'payment-receipts', 'branding-assets')
  AND public.is_support_or_admin()
);

CREATE POLICY "Staff can delete private files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('wearer-photos', 'payment-receipts', 'branding-assets')
  AND public.is_support_or_admin()
);

CREATE POLICY "Public can upload registration photo" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'wearer-photos'
  AND (storage.foldername(name))[1] = 'photos'
);
