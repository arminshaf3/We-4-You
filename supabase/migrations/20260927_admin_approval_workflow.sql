-- ==============================================================================
-- WE 4 YOU - SECURE ATOMIC ADMIN APPROVAL WORKFLOW & EDGE FUNCTIONS SUPPORT
-- Complete PostgreSQL Stored Procedures with Strict Concurrency & Validation
-- ==============================================================================

-- 1. ATOMIC REGISTRATION APPROVAL FUNCTION
CREATE OR REPLACE FUNCTION public.approve_registration_atomic(
  p_registration_id TEXT,
  p_admin_actor TEXT,
  p_reason TEXT DEFAULT 'All credentials and band verified.'
)
RETURNS JSONB AS $$
DECLARE
  v_reg RECORD;
  v_band RECORD;
  v_plan RECORD;
  v_vendor RECORD;
  v_wearer_id TEXT;
  v_sub_id TEXT;
  v_payment_id UUID;
  v_comm_id UUID;
  v_audit_id UUID;
  v_duration_months INTEGER;
  v_plan_price NUMERIC(10, 2);
  v_expiry_date DATE;
  v_comm_amount NUMERIC(10, 2);
  v_timeline JSONB;
BEGIN
  -- 1. Fetch and Lock Registration Record
  SELECT * INTO v_reg 
  FROM public.registrations 
  WHERE id = p_registration_id OR reference_number = p_registration_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration record % not found', p_registration_id;
  END IF;

  -- 2. Prevent Approving Twice
  IF v_reg.status = 'approved' THEN
    RAISE EXCEPTION 'Registration % is already approved', v_reg.reference_number;
  END IF;

  -- 3. Fetch & Validate Plan
  SELECT * INTO v_plan FROM public.plans WHERE id = v_reg.plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan % does not exist', v_reg.plan_id;
  END IF;
  IF v_plan.is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Cannot activate registration with inactive plan %', v_plan.name;
  END IF;

  v_duration_months := COALESCE(v_plan.duration_months, 12);
  v_plan_price := COALESCE(v_plan.price, 29.00);
  v_expiry_date := CURRENT_DATE + (v_duration_months || ' months')::interval;

  -- 4. Fetch & Validate Band (Prevent assigning one band to multiple wearers)
  SELECT * INTO v_band FROM public.bands WHERE reference_code = v_reg.band_code FOR UPDATE;
  IF FOUND THEN
    IF v_band.status = 'assigned' AND v_band.child_id IS NOT NULL AND v_band.child_id != v_reg.id THEN
      RAISE EXCEPTION 'Band % is already assigned to another wearer profile', v_reg.band_code;
    END IF;
    IF v_band.status IN ('lost', 'retired') THEN
      RAISE EXCEPTION 'Cannot assign band % with status %', v_reg.band_code, v_band.status;
    END IF;
  END IF;

  -- 5. Fetch & Validate Vendor (if applicable)
  IF v_reg.vendor_id IS NOT NULL AND v_reg.vendor_id != 'DIRECT' AND v_reg.vendor_id != 'central' THEN
    SELECT * INTO v_vendor FROM public.vendors WHERE id = v_reg.vendor_id;
    IF FOUND AND v_vendor.is_active IS NOT TRUE THEN
      RAISE EXCEPTION 'Attributed vendor % is currently inactive', v_vendor.shop_name;
    END IF;
  END IF;

  -- 6. Generate IDs
  v_wearer_id := 'CHD-' || floor(random() * 900000 + 100000)::text;
  v_sub_id := 'SUB-' || floor(random() * 900000 + 100000)::text;

  -- 7. Upsert Wearer Profile
  INSERT INTO public.wearers (
    id,
    name,
    age_range,
    demographic_category,
    primary_contact,
    secondary_contacts,
    current_band_code,
    subscription_id,
    vendor_id,
    registered_date,
    purchase_date,
    receipt_ref,
    incidents_count,
    created_at,
    updated_at
  ) VALUES (
    v_wearer_id,
    COALESCE(v_reg.wearer_data->>'name', 'Protected Wearer'),
    COALESCE(v_reg.wearer_data->>'ageRange', 'General'),
    COALESCE(v_reg.wearer_data->>'demographicCategory', 'general'),
    v_reg.contact_data,
    CASE 
      WHEN v_reg.contact_data->'emergencyContact' IS NOT NULL 
      THEN jsonb_build_array(v_reg.contact_data->'emergencyContact') 
      ELSE '[]'::jsonb 
    END,
    v_reg.band_code,
    v_sub_id,
    v_reg.vendor_id,
    CURRENT_DATE,
    CURRENT_DATE,
    'REC-REG-' || v_reg.reference_number,
    0,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    current_band_code = EXCLUDED.current_band_code,
    subscription_id = EXCLUDED.subscription_id,
    updated_at = now();

  -- 8. Assign Band
  INSERT INTO public.bands (
    id,
    reference_code,
    status,
    vendor_id,
    child_id,
    wearer_id,
    assigned_date,
    created_at,
    updated_at
  ) VALUES (
    'BND-' || floor(random() * 900000 + 100000)::text,
    v_reg.band_code,
    'assigned',
    v_reg.vendor_id,
    v_wearer_id,
    v_wearer_id,
    CURRENT_DATE,
    now(),
    now()
  )
  ON CONFLICT (reference_code) DO UPDATE SET
    status = 'assigned',
    child_id = v_wearer_id,
    wearer_id = v_wearer_id,
    assigned_date = CURRENT_DATE,
    updated_at = now();

  -- 9. Create Active Subscription
  INSERT INTO public.subscriptions (
    id,
    child_id,
    wearer_id,
    plan_id,
    status,
    start_date,
    expiry_date,
    payment_ref,
    payment_method,
    transaction_id,
    renewal_count,
    created_at,
    updated_at
  ) VALUES (
    v_sub_id,
    v_wearer_id,
    v_wearer_id,
    v_reg.plan_id,
    'active',
    CURRENT_DATE,
    v_expiry_date,
    COALESCE(v_reg.payment_ref, 'REC-REG-' || v_reg.reference_number),
    COALESCE(v_reg.card_details->>'brand', 'card'),
    v_reg.card_details->>'transactionId',
    0,
    now(),
    now()
  );

  -- 10. Store Payment Record
  INSERT INTO public.payments (
    receipt_ref,
    type,
    method,
    card_details,
    transaction_id,
    amount,
    currency,
    status,
    payment_date,
    registration_id,
    wearer_id,
    payer_name,
    notes,
    created_at,
    updated_at
  ) VALUES (
    'CARD-' || floor(random() * 9000 + 1000)::text,
    'subscription',
    'card',
    v_reg.card_details,
    v_reg.card_details->>'transactionId',
    v_plan_price,
    'USD',
    'paid',
    now(),
    v_reg.id,
    v_wearer_id,
    COALESCE(v_reg.contact_data->>'fullName', 'Guardian'),
    'Payment confirmed during administrative verification.',
    now(),
    now()
  )
  ON CONFLICT (receipt_ref) DO NOTHING
  RETURNING id INTO v_payment_id;

  -- 11. Create Vendor Commission (if applicable, without duplication)
  IF v_vendor.id IS NOT NULL AND v_vendor.is_active IS TRUE THEN
    IF NOT EXISTS (SELECT 1 FROM public.commissions WHERE registration_ref = v_reg.reference_number) THEN
      IF v_vendor.commission_type = 'percentage' THEN
        v_comm_amount := round(((v_vendor.commission_rate / 100.0) * v_plan_price), 2);
      ELSE
        v_comm_amount := v_vendor.commission_rate;
      END IF;

      INSERT INTO public.commissions (
        vendor_id,
        sale_id,
        registration_ref,
        type,
        rate,
        eligible_amount,
        commission_amount,
        status,
        created_at,
        updated_at
      ) VALUES (
        v_vendor.id,
        'REG-' || v_reg.reference_number,
        v_reg.reference_number,
        v_vendor.commission_type,
        v_vendor.commission_rate,
        v_plan_price,
        v_comm_amount,
        'approved',
        now(),
        now()
      )
      RETURNING id INTO v_comm_id;
    END IF;
  END IF;

  -- 12. Update Registration Status & Timeline
  v_timeline := COALESCE(v_reg.timeline, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'timestamp', to_char(now(), 'YYYY-MM-DD HH24:MI'),
      'actor', p_admin_actor,
      'action', 'Registration Approved',
      'notes', p_reason
    )
  );

  UPDATE public.registrations SET
    status = 'approved',
    payment_status = 'paid',
    status_reason = p_reason,
    timeline = v_timeline,
    updated_at = now()
  WHERE id = v_reg.id;

  -- 13. Write to Audit Log
  INSERT INTO public.audit_logs (
    actor,
    action_type,
    description,
    entity_type,
    entity_id,
    metadata,
    created_at
  ) VALUES (
    p_admin_actor,
    'Registration Approved',
    'Approved registration ' || v_reg.reference_number || ' for wearer ' || (v_reg.wearer_data->>'name') || ' with band ' || v_reg.band_code,
    'registration',
    v_reg.id,
    jsonb_build_object('wearer_id', v_wearer_id, 'subscription_id', v_sub_id, 'expiry_date', v_expiry_date),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg.id,
    'reference_number', v_reg.reference_number,
    'wearer_id', v_wearer_id,
    'subscription_id', v_sub_id,
    'band_code', v_reg.band_code,
    'expiry_date', v_expiry_date,
    'message', 'Registration approved successfully. Wearer is now protected.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. REJECT REGISTRATION FUNCTION
CREATE OR REPLACE FUNCTION public.reject_registration_atomic(
  p_registration_id TEXT,
  p_admin_actor TEXT,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_reg RECORD;
  v_timeline JSONB;
BEGIN
  SELECT * INTO v_reg FROM public.registrations WHERE id = p_registration_id OR reference_number = p_registration_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration % not found', p_registration_id;
  END IF;

  v_timeline := COALESCE(v_reg.timeline, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'timestamp', to_char(now(), 'YYYY-MM-DD HH24:MI'),
      'actor', p_admin_actor,
      'action', 'Registration Rejected',
      'notes', p_reason
    )
  );

  UPDATE public.registrations SET
    status = 'rejected',
    status_reason = p_reason,
    timeline = v_timeline,
    updated_at = now()
  WHERE id = v_reg.id;

  INSERT INTO public.audit_logs (
    actor,
    action_type,
    description,
    entity_type,
    entity_id,
    metadata,
    created_at
  ) VALUES (
    p_admin_actor,
    'Registration Rejected',
    'Rejected registration ' || v_reg.reference_number || '. Reason: ' || p_reason,
    'registration',
    v_reg.id,
    jsonb_build_object('reason', p_reason),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'reference_number', v_reg.reference_number,
    'message', 'Registration rejected successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. VERIFY DEMO PAYMENT FUNCTION
CREATE OR REPLACE FUNCTION public.verify_demo_payment_atomic(
  p_payment_id UUID,
  p_admin_actor TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_pay RECORD;
BEGIN
  SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment % not found', p_payment_id;
  END IF;

  UPDATE public.payments SET status = 'paid', updated_at = now() WHERE id = p_payment_id;

  IF v_pay.registration_id IS NOT NULL THEN
    UPDATE public.registrations SET payment_status = 'paid', updated_at = now() 
    WHERE id = v_pay.registration_id OR reference_number = v_pay.registration_id;
  END IF;

  INSERT INTO public.audit_logs (
    actor,
    action_type,
    description,
    entity_type,
    entity_id,
    created_at
  ) VALUES (
    p_admin_actor,
    'Payment Verified',
    'Manually verified payment receipt ' || v_pay.receipt_ref || ' ($' || v_pay.amount || ')',
    'payment',
    p_payment_id::text,
    now()
  );

  RETURN jsonb_build_object('success', true, 'message', 'Payment marked verified.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE COMMISSION ATOMIC FUNCTION
CREATE OR REPLACE FUNCTION public.create_commission_atomic(
  p_vendor_id TEXT,
  p_sale_id TEXT,
  p_registration_ref TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'percentage',
  p_rate NUMERIC(5, 2) DEFAULT NULL,
  p_eligible_amount NUMERIC(10, 2) DEFAULT 0.00,
  p_status TEXT DEFAULT 'pending',
  p_admin_actor TEXT DEFAULT 'Admin Coordinator'
)
RETURNS JSONB AS $$
DECLARE
  v_vendor RECORD;
  v_rate NUMERIC(5, 2);
  v_type TEXT;
  v_comm_amount NUMERIC(10, 2);
  v_comm_id UUID;
BEGIN
  -- 1. Fetch vendor
  SELECT * INTO v_vendor FROM public.vendors WHERE id = p_vendor_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendor % not found', p_vendor_id;
  END IF;

  IF v_vendor.is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Cannot generate commission for inactive vendor %', v_vendor.shop_name;
  END IF;

  -- 2. Check for duplicate commission if registration_ref is provided
  IF p_registration_ref IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.commissions WHERE registration_ref = p_registration_ref) THEN
      RAISE EXCEPTION 'Commission already exists for registration %', p_registration_ref;
    END IF;
  END IF;

  -- 3. Calculate rate and amount snapshots
  v_type := COALESCE(p_type, v_vendor.commission_type, 'percentage');
  v_rate := COALESCE(p_rate, v_vendor.commission_rate, 10.00);

  IF v_type = 'percentage' THEN
    v_comm_amount := round(((v_rate / 100.0) * p_eligible_amount), 2);
  ELSE
    v_comm_amount := v_rate;
  END IF;

  -- 4. Insert Commission
  INSERT INTO public.commissions (
    vendor_id,
    sale_id,
    registration_ref,
    type,
    rate,
    eligible_amount,
    commission_amount,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_vendor.id,
    p_sale_id,
    p_registration_ref,
    v_type,
    v_rate,
    p_eligible_amount,
    v_comm_amount,
    p_status,
    now(),
    now()
  )
  RETURNING id INTO v_comm_id;

  -- 5. Audit Log
  INSERT INTO public.audit_logs (
    actor,
    action_type,
    description,
    entity_type,
    entity_id,
    metadata,
    created_at
  ) VALUES (
    p_admin_actor,
    'Commission Created',
    'Created ' || v_type || ' commission of $' || v_comm_amount || ' for vendor ' || v_vendor.shop_name,
    'commission',
    v_comm_id::text,
    jsonb_build_object('vendor_id', v_vendor.id, 'sale_id', p_sale_id, 'amount', v_comm_amount, 'rate', v_rate),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'commission_id', v_comm_id,
    'vendor_id', v_vendor.id,
    'commission_amount', v_comm_amount,
    'rate', v_rate,
    'type', v_type,
    'status', p_status,
    'message', 'Commission recorded successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.approve_registration_atomic(TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reject_registration_atomic(TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.verify_demo_payment_atomic(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_commission_atomic(TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT) TO authenticated, anon;

