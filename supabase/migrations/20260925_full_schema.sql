-- ==============================================================================
-- WE 4 YOU - COMPLETE SUPABASE POSTGRESQL PRODUCTION SCHEMA MIGRATION
-- Safe & Non-Destructive: Preserves all existing tables and data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for updating updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. PROFILES TABLE (User accounts & roles: admin, parent, vendor, support)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('admin', 'parent', 'vendor', 'support')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. GUARDIANS TABLE (Primary and emergency contacts)
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    preferred_language TEXT DEFAULT 'English',
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_guardians_updated_at ON public.guardians;
CREATE TRIGGER trigger_guardians_updated_at
BEFORE UPDATE ON public.guardians
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. VENDORS TABLE (Retail distribution hubs and partners)
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    shop_name TEXT NOT NULL,
    branch TEXT,
    contact_person TEXT,
    telephone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_rate NUMERIC(6, 2) DEFAULT 15.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trigger_vendors_updated_at ON public.vendors;
CREATE TRIGGER trigger_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. PLANS TABLE (Subscription and protection tiers)
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration_months INTEGER NOT NULL DEFAULT 12,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_formatted TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_provisional BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trigger_plans_updated_at ON public.plans;
CREATE TRIGGER trigger_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. WEARERS TABLE (Reused for Children, Seniors, Medical, Athletes, Travelers)
CREATE TABLE IF NOT EXISTS public.wearers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age_range TEXT,
    demographic_category TEXT DEFAULT 'general',
    date_of_birth DATE,
    blood_type TEXT,
    allergies TEXT,
    medical_conditions TEXT,
    photo_url TEXT,
    primary_contact JSONB,
    secondary_contacts JSONB DEFAULT '[]'::jsonb,
    current_band_code TEXT,
    subscription_id TEXT,
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE SET NULL,
    registered_date DATE DEFAULT CURRENT_DATE,
    purchase_date DATE DEFAULT CURRENT_DATE,
    receipt_ref TEXT,
    incidents_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Safe column additions for wearers if not present
ALTER TABLE public.wearers ADD COLUMN IF NOT EXISTS demographic_category TEXT DEFAULT 'general';
ALTER TABLE public.wearers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.wearers ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.wearers ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE public.wearers ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE public.wearers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trigger_wearers_updated_at ON public.wearers;
CREATE TRIGGER trigger_wearers_updated_at
BEFORE UPDATE ON public.wearers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. CHILD_GUARDIANS (Relationship linking table)
CREATE TABLE IF NOT EXISTS public.child_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wearer_id TEXT NOT NULL REFERENCES public.wearers(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    relationship TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. BANDS TABLE (Wristband inventory & status tracking)
CREATE TABLE IF NOT EXISTS public.bands (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'inventory' CHECK (status IN ('inventory', 'reserved', 'assigned', 'lost', 'replaced', 'inactive', 'available', 'retired')),
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE SET NULL,
    child_id TEXT REFERENCES public.wearers(id) ON DELETE SET NULL,
    wearer_id TEXT REFERENCES public.wearers(id) ON DELETE SET NULL,
    assigned_date DATE,
    replacement_notes TEXT,
    replaced_by_code TEXT,
    retired_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS wearer_id TEXT REFERENCES public.wearers(id) ON DELETE SET NULL;
ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trigger_bands_updated_at ON public.bands;
CREATE TRIGGER trigger_bands_updated_at
BEFORE UPDATE ON public.bands
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    wearer_id TEXT REFERENCES public.wearers(id) ON DELETE SET NULL,
    wearer_data JSONB NOT NULL,
    contact_data JSONB NOT NULL,
    band_code TEXT NOT NULL,
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE SET NULL,
    plan_id TEXT REFERENCES public.plans(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'pending_payment', 'approved', 'rejected', 'cancelled', 'update_requested')),
    status_reason TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'verified', 'reversed')),
    payment_ref TEXT,
    card_details JSONB,
    timeline JSONB DEFAULT '[]'::jsonb,
    submission_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS wearer_id TEXT REFERENCES public.wearers(id) ON DELETE SET NULL;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trigger_registrations_updated_at ON public.registrations;
CREATE TRIGGER trigger_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    child_id TEXT REFERENCES public.wearers(id) ON DELETE CASCADE,
    wearer_id TEXT REFERENCES public.wearers(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES public.plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'expiring_soon', 'ended')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    payment_ref TEXT,
    payment_method TEXT,
    transaction_id TEXT,
    renewal_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS wearer_id TEXT REFERENCES public.wearers(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_ref TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'subscription' CHECK (type IN ('band_purchase', 'subscription', 'replacement')),
    method TEXT DEFAULT 'card' CHECK (method IN ('card', 'offline_voucher', 'bank_transfer', 'store_cash')),
    card_details JSONB,
    transaction_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'verified', 'reversed')),
    payment_date TIMESTAMPTZ DEFAULT now(),
    registration_id TEXT REFERENCES public.registrations(id) ON DELETE SET NULL,
    wearer_id TEXT REFERENCES public.wearers(id) ON DELETE SET NULL,
    payer_name TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON public.payments;
CREATE TRIGGER trigger_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    sale_id TEXT,
    registration_ref TEXT,
    type TEXT DEFAULT 'percentage' CHECK (type IN ('fixed', 'percentage')),
    rate NUMERIC(6, 2) NOT NULL,
    eligible_amount NUMERIC(10, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'reversed')),
    payout_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_commissions_updated_at ON public.commissions;
CREATE TRIGGER trigger_commissions_updated_at
BEFORE UPDATE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_ref TEXT UNIQUE NOT NULL,
    vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    commission_ids JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL,
    payout_date TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key reference from commissions to payouts
ALTER TABLE public.commissions ADD CONSTRAINT fk_commission_payout FOREIGN KEY (payout_id) REFERENCES public.payouts(id) ON DELETE SET NULL;

-- 14. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    incident_ref TEXT UNIQUE NOT NULL,
    band_reference TEXT NOT NULL,
    report_type TEXT NOT NULL DEFAULT 'person_found',
    caller_name TEXT,
    caller_contact TEXT,
    voluntary_location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'guardian_contacted', 'reunited', 'closed', 'invalid', 'contacting_guardian', 'awaiting_confirmation', 'resolved')),
    assigned_staff TEXT DEFAULT 'Staff Coordinator',
    attempts JSONB DEFAULT '[]'::jsonb,
    resolved_at TIMESTAMPTZ,
    outcome_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trigger_incidents_updated_at ON public.incidents;
CREATE TRIGGER trigger_incidents_updated_at
BEFORE UPDATE ON public.incidents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. CONTACT_MESSAGES TABLE (Public enquiries and contact submissions)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT DEFAULT 'general_enquiry',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER trigger_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. AUDIT_LOGS TABLE (Activity history & staff audit logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    actor TEXT NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_bands_reference_code ON public.bands(reference_code);
CREATE INDEX IF NOT EXISTS idx_bands_status ON public.bands(status);
CREATE INDEX IF NOT EXISTS idx_bands_child_id ON public.bands(child_id);
CREATE INDEX IF NOT EXISTS idx_wearers_current_band ON public.wearers(current_band_code);
CREATE INDEX IF NOT EXISTS idx_registrations_ref ON public.registrations(reference_number);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_child_id ON public.subscriptions(child_id);
CREATE INDEX IF NOT EXISTS idx_incidents_band_ref ON public.incidents(band_reference);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_ref ON public.payments(receipt_ref);
CREATE INDEX IF NOT EXISTS idx_commissions_vendor_id ON public.commissions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 18. PERMISSIONS / ROW LEVEL SECURITY (RLS) GRANTS
-- Grant access to authenticated and anon client roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
