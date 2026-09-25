-- ==============================================================================
-- WE 4 YOU - COMPLETE SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- High-Security Multi-Role Authorization: Public, Parent, Vendor, Support, Admin
-- ==============================================================================

-- 1. HELPER FUNCTIONS (Security Definer to prevent policy recursion)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'anon'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_support_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'support')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL TABLES (Removes UNRESTRICTED state)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Clean existing policies safely before recreating
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ==============================================================================
-- 3. PROFILES POLICIES
-- ==============================================================================
-- Admin full access
CREATE POLICY "admin_all_profiles" ON public.profiles
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view and update their own profile
CREATE POLICY "users_view_own_profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "users_insert_own_profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- ==============================================================================
-- 4. PLANS POLICIES
-- ==============================================================================
-- Public: Read only active plans
CREATE POLICY "public_read_active_plans" ON public.plans
FOR SELECT TO anon, authenticated
USING (is_active = true OR public.is_support_or_admin());

-- Admin: Full control over plans (Support cannot modify)
CREATE POLICY "admin_manage_plans" ON public.plans
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. VENDORS POLICIES
-- ==============================================================================
-- Public: Read active vendors only
CREATE POLICY "public_read_active_vendors" ON public.vendors
FOR SELECT TO anon, authenticated
USING (is_active = true OR public.is_support_or_admin());

-- Admin: Full access
CREATE POLICY "admin_manage_vendors" ON public.vendors
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Support: Read all vendors
CREATE POLICY "support_read_vendors" ON public.vendors
FOR SELECT TO authenticated
USING (public.is_support_or_admin());

-- ==============================================================================
-- 6. CONTACT MESSAGES (ENQUIRIES) POLICIES
-- ==============================================================================
-- Public & Any User: Submit contact messages
CREATE POLICY "public_submit_contact_messages" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Support & Admin: View and manage contact messages
CREATE POLICY "support_admin_read_contact_messages" ON public.contact_messages
FOR SELECT TO authenticated
USING (public.is_support_or_admin());

CREATE POLICY "support_admin_update_contact_messages" ON public.contact_messages
FOR UPDATE TO authenticated
USING (public.is_support_or_admin())
WITH CHECK (public.is_support_or_admin());

CREATE POLICY "admin_delete_contact_messages" ON public.contact_messages
FOR DELETE TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 7. GUARDIANS POLICIES
-- ==============================================================================
-- Public: Can insert during registration
CREATE POLICY "public_insert_guardians" ON public.guardians
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Parents: Read & update only their own guardian records
CREATE POLICY "parents_read_own_guardian" ON public.guardians
FOR SELECT TO authenticated
USING (profile_id = auth.uid() OR public.is_support_or_admin());

CREATE POLICY "parents_update_own_guardian" ON public.guardians
FOR UPDATE TO authenticated
USING (profile_id = auth.uid() OR public.is_admin())
WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_delete_guardians" ON public.guardians
FOR DELETE TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 8. WEARERS (CHILDREN) POLICIES
-- ==============================================================================
-- Public: Insert during registration wizard
CREATE POLICY "public_insert_wearers" ON public.wearers
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Parents: View & update only their own linked children
CREATE POLICY "parents_read_own_wearers" ON public.wearers
FOR SELECT TO authenticated
USING (
  public.is_support_or_admin()
  OR id IN (
    SELECT cg.wearer_id 
    FROM public.child_guardians cg 
    JOIN public.guardians g ON cg.guardian_id = g.id 
    WHERE g.profile_id = auth.uid()
  )
);

CREATE POLICY "parents_update_own_wearers" ON public.wearers
FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR id IN (
    SELECT cg.wearer_id 
    FROM public.child_guardians cg 
    JOIN public.guardians g ON cg.guardian_id = g.id 
    WHERE g.profile_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR id IN (
    SELECT cg.wearer_id 
    FROM public.child_guardians cg 
    JOIN public.guardians g ON cg.guardian_id = g.id 
    WHERE g.profile_id = auth.uid()
  )
);

CREATE POLICY "admin_delete_wearers" ON public.wearers
FOR DELETE TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 9. CHILD_GUARDIANS POLICIES
-- ==============================================================================
CREATE POLICY "public_insert_child_guardians" ON public.child_guardians
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "parents_read_child_guardians" ON public.child_guardians
FOR SELECT TO authenticated
USING (
  public.is_support_or_admin()
  OR guardian_id IN (SELECT id FROM public.guardians WHERE profile_id = auth.uid())
);

CREATE POLICY "admin_manage_child_guardians" ON public.child_guardians
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 10. BANDS POLICIES
-- ==============================================================================
-- Public: Authorized lookup by band reference code
CREATE POLICY "public_lookup_band" ON public.bands
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "support_admin_update_bands" ON public.bands
FOR UPDATE TO authenticated
USING (public.is_support_or_admin())
WITH CHECK (public.is_support_or_admin());

CREATE POLICY "admin_manage_bands" ON public.bands
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 11. REGISTRATIONS POLICIES
-- ==============================================================================
-- Public: Submit registration requests securely
CREATE POLICY "public_submit_registration" ON public.registrations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Parents: Read their own registrations
CREATE POLICY "parents_read_registrations" ON public.registrations
FOR SELECT TO authenticated
USING (
  public.is_support_or_admin()
  OR guardian_id IN (SELECT id FROM public.guardians WHERE profile_id = auth.uid())
);

-- Support & Admin: Review and update registrations
CREATE POLICY "support_admin_manage_registrations" ON public.registrations
FOR UPDATE TO authenticated
USING (public.is_support_or_admin())
WITH CHECK (public.is_support_or_admin());

CREATE POLICY "admin_delete_registrations" ON public.registrations
FOR DELETE TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 12. SUBSCRIPTIONS POLICIES
-- ==============================================================================
CREATE POLICY "public_insert_subscriptions" ON public.subscriptions
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "parents_read_subscriptions" ON public.subscriptions
FOR SELECT TO authenticated
USING (
  public.is_support_or_admin()
  OR child_id IN (
    SELECT cg.wearer_id 
    FROM public.child_guardians cg 
    JOIN public.guardians g ON cg.guardian_id = g.id 
    WHERE g.profile_id = auth.uid()
  )
);

CREATE POLICY "admin_manage_subscriptions" ON public.subscriptions
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 13. PAYMENTS POLICIES
-- ==============================================================================
CREATE POLICY "public_insert_payments" ON public.payments
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Parents: Read only own payments (cannot modify)
CREATE POLICY "parents_read_payments" ON public.payments
FOR SELECT TO authenticated
USING (
  public.is_support_or_admin()
  OR wearer_id IN (
    SELECT cg.wearer_id 
    FROM public.child_guardians cg 
    JOIN public.guardians g ON cg.guardian_id = g.id 
    WHERE g.profile_id = auth.uid()
  )
);

-- Support: Read-only payments access (cannot modify amount/status)
CREATE POLICY "support_read_payments" ON public.payments
FOR SELECT TO authenticated
USING (public.is_support_or_admin());

-- Admin: Full payment management & verification
CREATE POLICY "admin_manage_payments" ON public.payments
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 14. COMMISSIONS & PAYOUTS POLICIES (Vendors)
-- ==============================================================================
CREATE POLICY "support_admin_read_commissions" ON public.commissions
FOR SELECT TO authenticated
USING (public.is_support_or_admin());

CREATE POLICY "admin_manage_commissions" ON public.commissions
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "support_admin_read_payouts" ON public.payouts
FOR SELECT TO authenticated
USING (public.is_support_or_admin());

CREATE POLICY "admin_manage_payouts" ON public.payouts
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 15. INCIDENTS POLICIES
-- ==============================================================================
-- Public: Anyone finding a band can submit an incident report
CREATE POLICY "public_submit_incidents" ON public.incidents
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Support & Admin: Full access to track and coordinate incidents
CREATE POLICY "support_admin_manage_incidents" ON public.incidents
FOR ALL TO authenticated
USING (public.is_support_or_admin())
WITH CHECK (public.is_support_or_admin());

-- ==============================================================================
-- 16. AUDIT_LOGS POLICIES
-- ==============================================================================
CREATE POLICY "support_admin_read_audit_logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_support_or_admin());

CREATE POLICY "authenticated_insert_audit_logs" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "admin_manage_audit_logs" ON public.audit_logs
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 17. SECURE BAND EMERGENCY LOOKUP FUNCTION (Security Definer)
-- Allows public visitors to retrieve emergency contacts when scanning a band
-- without exposing the rest of the wearers database
-- ==============================================================================
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.reference_code AS band_reference,
    w.name AS wearer_name,
    w.demographic_category,
    w.blood_type,
    w.allergies,
    w.medical_conditions,
    w.primary_contact,
    w.secondary_contacts
  FROM public.bands b
  JOIN public.wearers w ON (b.child_id = w.id OR b.wearer_id = w.id OR w.current_band_code = b.reference_code)
  WHERE UPPER(REPLACE(b.reference_code, ' ', '')) = UPPER(REPLACE(lookup_code, ' ', ''))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.lookup_band_emergency(TEXT) TO anon, authenticated;
