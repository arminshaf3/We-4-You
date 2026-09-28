import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Vendor,
  Band,
  ChildRecord,
  SubscriptionPlan,
  Subscription,
  Registration,
  Payment,
  Commission,
  Payout,
  Incident,
  Enquiry,
} from '../types';

/**
 * Maps Supabase DB snake_case columns to TypeScript camelCase models and vice-versa
 */

export const supabaseService = {
  isConfigured: isSupabaseConfigured,

  // --- VENDORS ---
  async getVendors(): Promise<Vendor[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((v: any) => ({
        id: v.id,
        shopName: v.shop_name,
        branch: v.branch,
        contactPerson: v.contact_person,
        telephone: v.telephone,
        address: v.address,
        isActive: v.is_active ?? true,
        commissionType: v.commission_type ?? 'percentage',
        commissionRate: Number(v.commission_rate ?? 15),
        createdAt: v.created_at ? v.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
      }));
    } catch {
      return null;
    }
  },

  async insertVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<Vendor | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          shop_name: vendor.shopName,
          branch: vendor.branch,
          contact_person: vendor.contactPerson,
          telephone: vendor.telephone,
          address: vendor.address,
          is_active: vendor.isActive,
          commission_type: vendor.commissionType,
          commission_rate: vendor.commissionRate,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        shopName: data.shop_name,
        branch: data.branch,
        contactPerson: data.contact_person,
        telephone: data.telephone,
        address: data.address,
        isActive: data.is_active,
        commissionType: data.commission_type,
        commissionRate: Number(data.commission_rate),
        createdAt: data.created_at ? data.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
      };
    } catch {
      return null;
    }
  },

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const payload: any = {};
      if (updates.shopName !== undefined) payload.shop_name = updates.shopName;
      if (updates.branch !== undefined) payload.branch = updates.branch;
      if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson;
      if (updates.telephone !== undefined) payload.telephone = updates.telephone;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      if (updates.commissionType !== undefined) payload.commission_type = updates.commissionType;
      if (updates.commissionRate !== undefined) payload.commission_rate = updates.commissionRate;

      const { error } = await supabase.from('vendors').update(payload).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- PLANS ---
  async getPlans(): Promise<SubscriptionPlan[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('plans').select('*').order('duration_months', { ascending: true });
      if (error || !data) return null;
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        durationMonths: p.duration_months,
        priceAmount: Number(p.price || 0),
        priceFormatted: p.price_formatted || `$${p.price || 0}.00 / yr`,
        currency: 'USD',
        isActive: p.is_active ?? true,
        isProvisional: p.is_provisional ?? false,
        features: p.features || ['Emergency call center routing', 'Confidential emergency contacts', 'Waterproof identification band'],
      }));
    } catch {
      return null;
    }
  },

  async insertPlan(plan: SubscriptionPlan): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('plans').insert({
        id: plan.id,
        name: plan.name,
        duration_months: plan.durationMonths,
        price: plan.priceAmount,
        price_formatted: plan.priceFormatted,
        description: plan.description,
        features: plan.features,
        is_active: plan.isActive,
        is_provisional: plan.isProvisional,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.durationMonths !== undefined) payload.duration_months = updates.durationMonths;
      if (updates.priceAmount !== undefined) payload.price = updates.priceAmount;
      if (updates.priceFormatted !== undefined) payload.price_formatted = updates.priceFormatted;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.features !== undefined) payload.features = updates.features;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      if (updates.isProvisional !== undefined) payload.is_provisional = updates.isProvisional;

      const { error } = await supabase.from('plans').update(payload).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- BANDS ---
  async getBands(): Promise<Band[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('bands').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((b: any) => ({
        id: b.id,
        referenceCode: b.reference_code,
        status: b.status,
        vendorId: b.vendor_id || undefined,
        childId: b.child_id || undefined,
        assignedDate: b.assigned_date || undefined,
        replacementNotes: b.replacement_notes || undefined,
        replacedByCode: b.replaced_by_code || undefined,
        retiredDate: b.retired_date || undefined,
      }));
    } catch {
      return null;
    }
  },

  async insertBand(code: string): Promise<Band | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const normCode = code.toUpperCase().trim();
      // Check if band already exists to prevent duplicate insertion
      const { data: existing } = await supabase
        .from('bands')
        .select('*')
        .eq('reference_code', normCode)
        .maybeSingle();

      if (existing) {
        return {
          id: existing.id,
          referenceCode: existing.reference_code,
          status: existing.status,
          childId: existing.child_id || undefined,
          vendorId: existing.vendor_id || undefined,
        };
      }

      const { data, error } = await supabase
        .from('bands')
        .insert({ reference_code: normCode, status: 'available' })
        .select()
        .single();
      if (error || !data) return null;
      return {
        id: data.id,
        referenceCode: data.reference_code,
        status: data.status,
      };
    } catch {
      return null;
    }
  },

  async updateBand(code: string, updates: Partial<Band>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const normCode = code.toUpperCase().trim();
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.vendorId !== undefined) payload.vendor_id = updates.vendorId;
      if (updates.childId !== undefined) payload.child_id = updates.childId;
      if (updates.assignedDate !== undefined) payload.assigned_date = updates.assignedDate;
      if (updates.replacementNotes !== undefined) payload.replacement_notes = updates.replacementNotes;
      if (updates.replacedByCode !== undefined) payload.replaced_by_code = updates.replacedByCode;
      if (updates.retiredDate !== undefined) payload.retired_date = updates.retiredDate;

      const { data, error } = await supabase
        .from('bands')
        .update(payload)
        .or(`reference_code.eq.${normCode},reference_code.ilike.${normCode}`)
        .select();

      // If band did not exist in DB yet, insert it with the updated payload
      if (!error && (!data || data.length === 0)) {
        await supabase.from('bands').insert({
          reference_code: normCode,
          status: updates.status || 'assigned',
          child_id: updates.childId || null,
          vendor_id: updates.vendorId || null,
          assigned_date: updates.assignedDate || new Date().toISOString().substring(0, 10),
          replacement_notes: updates.replacementNotes || null,
        });
      }

      return !error;
    } catch {
      return false;
    }
  },

  // --- WEARERS ---
  async getWearers(): Promise<ChildRecord[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('wearers').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((w: any) => ({
        id: w.id,
        name: w.name,
        ageRange: w.age_range,
        birthDate: w.birth_date || undefined,
        calculatedAge: w.calculated_age || undefined,
        gender: w.gender || undefined,
        bloodGroup: w.blood_group || undefined,
        nationalId: w.national_id || undefined,
        medicalNotes: w.medical_notes || undefined,
        specialNeeds: w.special_needs || undefined,
        photoUrl: w.photo_url || undefined,
        primaryGuardian: w.primary_contact,
        secondaryGuardians: w.secondary_contacts || [],
        currentBandCode: w.current_band_code,
        subscriptionId: w.subscription_id || undefined,
        vendorId: w.vendor_id || 'central',
        registeredDate: w.registered_date || new Date().toISOString().substring(0, 10),
        purchaseDate: w.purchase_date || new Date().toISOString().substring(0, 10),
        receiptRef: w.receipt_ref || 'REC-REG-2026',
        incidentsCount: w.incidents_count || 0,
      }));
    } catch {
      return null;
    }
  },

  async insertWearer(wearer: Omit<ChildRecord, 'id' | 'incidentsCount'>): Promise<ChildRecord | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('wearers')
        .insert({
          name: wearer.name,
          age_range: wearer.ageRange,
          birth_date: wearer.birthDate || null,
          calculated_age: wearer.calculatedAge || null,
          gender: wearer.gender || null,
          blood_group: wearer.bloodGroup || null,
          national_id: wearer.nationalId || null,
          medical_notes: wearer.medicalNotes || null,
          special_needs: wearer.specialNeeds || null,
          photo_url: wearer.photoUrl,
          primary_contact: wearer.primaryGuardian,
          secondary_contacts: wearer.secondaryGuardians,
          current_band_code: wearer.currentBandCode,
          vendor_id: wearer.vendorId,
          registered_date: wearer.registeredDate,
          purchase_date: wearer.purchaseDate,
          receipt_ref: wearer.receiptRef,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        name: data.name,
        ageRange: data.age_range,
        birthDate: data.birth_date || undefined,
        calculatedAge: data.calculated_age || undefined,
        gender: data.gender || undefined,
        bloodGroup: data.blood_group || undefined,
        nationalId: data.national_id || undefined,
        medicalNotes: data.medical_notes || undefined,
        specialNeeds: data.special_needs || undefined,
        photoUrl: data.photo_url,
        primaryGuardian: data.primary_contact,
        secondaryGuardians: data.secondary_contacts || [],
        currentBandCode: data.current_band_code,
        subscriptionId: data.subscription_id,
        vendorId: data.vendor_id,
        registeredDate: data.registered_date,
        purchaseDate: data.purchase_date,
        receiptRef: data.receipt_ref,
        incidentsCount: 0,
      };
    } catch {
      return null;
    }
  },

  async updateWearer(id: string, updates: Partial<ChildRecord>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.ageRange !== undefined) payload.age_range = updates.ageRange;
      if (updates.birthDate !== undefined) payload.birth_date = updates.birthDate;
      if (updates.calculatedAge !== undefined) payload.calculated_age = updates.calculatedAge;
      if (updates.gender !== undefined) payload.gender = updates.gender;
      if (updates.bloodGroup !== undefined) payload.blood_group = updates.bloodGroup;
      if (updates.nationalId !== undefined) payload.national_id = updates.nationalId;
      if (updates.medicalNotes !== undefined) payload.medical_notes = updates.medicalNotes;
      if (updates.specialNeeds !== undefined) payload.special_needs = updates.specialNeeds;
      if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
      if (updates.primaryGuardian !== undefined) payload.primary_contact = updates.primaryGuardian;
      if (updates.secondaryGuardians !== undefined) payload.secondary_contacts = updates.secondaryGuardians;
      if (updates.currentBandCode !== undefined) payload.current_band_code = updates.currentBandCode;
      if (updates.subscriptionId !== undefined) payload.subscription_id = updates.subscriptionId;

      const { error } = await supabase.from('wearers').update(payload).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- REGISTRATIONS ---
  async getRegistrations(): Promise<Registration[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getRegistrations query returned error, falling back:', error.message);
        // Retry ordering by submission_date if created_at is not indexed
        const fallback = await supabase.from('registrations').select('*');
        if (fallback.error || !fallback.data) return null;
        return fallback.data.map((r: any) => ({
          id: r.id,
          referenceNumber: r.reference_number,
          child: r.wearer_data,
          guardian: r.contact_data,
          bandCode: r.band_code,
          vendorId: r.vendor_id || 'DIRECT',
          planId: r.plan_id,
          status: r.status,
          statusReason: r.status_reason || undefined,
          paymentStatus: r.payment_status,
          paymentRef: r.payment_ref || undefined,
          cardDetails: r.card_details || undefined,
          timeline: r.timeline || [],
          submissionDate: r.submission_date ? r.submission_date.substring(0, 16).replace('T', ' ') : new Date().toISOString().substring(0, 16).replace('T', ' '),
        }));
      }

      if (!data) return [];
      return data.map((r: any) => ({
        id: r.id,
        referenceNumber: r.reference_number,
        child: r.wearer_data,
        guardian: r.contact_data,
        bandCode: r.band_code,
        vendorId: r.vendor_id || 'DIRECT',
        planId: r.plan_id,
        status: r.status,
        statusReason: r.status_reason || undefined,
        paymentStatus: r.payment_status,
        paymentRef: r.payment_ref || undefined,
        cardDetails: r.card_details || undefined,
        timeline: r.timeline || [],
        submissionDate: r.submission_date ? r.submission_date.substring(0, 16).replace('T', ' ') : new Date().toISOString().substring(0, 16).replace('T', ' '),
      }));
    } catch (err) {
      console.error('Supabase getRegistrations exception:', err);
      return null;
    }
  },

  async insertRegistration(reg: Registration): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      // Validate vendorId: If vendor is DIRECT, central, or not a valid UUID/id in DB, pass null to prevent foreign key violation
      const validVendorId =
        reg.vendorId &&
        reg.vendorId !== 'DIRECT' &&
        reg.vendorId !== 'central' &&
        reg.vendorId.startsWith('VND-')
          ? reg.vendorId
          : null;

      const { error } = await supabase.from('registrations').insert({
        id: reg.id,
        reference_number: reg.referenceNumber,
        wearer_data: reg.child,
        contact_data: reg.guardian,
        band_code: reg.bandCode.toUpperCase().trim(),
        vendor_id: validVendorId,
        plan_id: reg.planId || null,
        status: reg.status || 'pending_verification',
        status_reason: reg.statusReason || null,
        payment_status: reg.paymentStatus || 'pending',
        payment_ref: reg.paymentRef || null,
        card_details: reg.cardDetails || null,
        timeline: reg.timeline || [],
      });

      if (error) {
        console.error('Supabase insertRegistration error:', error.message, error.details);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase insertRegistration exception:', err);
      return false;
    }
  },

  async updateRegistration(id: string, updates: Partial<Registration>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.statusReason !== undefined) payload.status_reason = updates.statusReason;
      if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
      if (updates.paymentRef !== undefined) payload.payment_ref = updates.paymentRef;
      if (updates.timeline !== undefined) payload.timeline = updates.timeline;
      payload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('registrations')
        .update(payload)
        .or(`id.eq.${id},reference_number.eq.${id}`);

      if (error) {
        console.error('Supabase updateRegistration error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase updateRegistration exception:', err);
      return false;
    }
  },

  // --- INCIDENTS ---
  async getIncidents(): Promise<Incident[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((i: any) => ({
        id: i.id,
        incidentRef: i.incident_ref,
        bandReference: i.band_reference,
        reportType: i.report_type,
        callerName: i.caller_name || undefined,
        callerContact: i.caller_contact || undefined,
        voluntaryLocation: i.voluntary_location || undefined,
        notes: i.notes,
        status: i.status,
        assignedStaff: i.assigned_staff || 'Staff Coordinator',
        attempts: i.attempts || [],
        createdAt: i.created_at ? i.created_at.substring(0, 16).replace('T', ' ') : '',
        resolvedAt: i.resolved_at ? i.resolved_at.substring(0, 16).replace('T', ' ') : undefined,
        outcomeSummary: i.outcome_summary || undefined,
      }));
    } catch {
      return null;
    }
  },

  async insertIncident(inc: Incident): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('incidents').insert({
        id: inc.id,
        incident_ref: inc.incidentRef,
        band_reference: inc.bandReference,
        report_type: inc.reportType,
        caller_name: inc.callerName || null,
        caller_contact: inc.callerContact || null,
        voluntary_location: inc.voluntaryLocation || null,
        notes: inc.notes,
        status: inc.status,
        assigned_staff: inc.assignedStaff,
        attempts: inc.attempts,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async updateIncident(id: string, updates: Partial<Incident>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.attempts !== undefined) payload.attempts = updates.attempts;
      if (updates.resolvedAt !== undefined) payload.resolved_at = updates.resolvedAt;
      if (updates.outcomeSummary !== undefined) payload.outcome_summary = updates.outcomeSummary;

      const { error } = await supabase.from('incidents').update(payload).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<Payment[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
      if (error || !data) return null;
      return data.map((p: any) => ({
        id: p.id,
        receiptRef: p.receipt_ref,
        type: p.type || 'subscription',
        method: p.method || 'card',
        cardDetails: p.card_details || undefined,
        transactionId: p.transaction_id || undefined,
        amount: Number(p.amount),
        currency: p.currency || 'USD',
        status: p.status,
        paymentDate: p.payment_date ? p.payment_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        registrationId: p.registration_id || undefined,
        childId: p.wearer_id || undefined,
        payerName: p.payer_name,
        notes: p.notes || undefined,
      }));
    } catch {
      return null;
    }
  },

  async insertPayment(payment: Payment): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('payments').insert({
        receipt_ref: payment.receiptRef,
        type: payment.type,
        method: payment.method,
        card_details: payment.cardDetails || null,
        transaction_id: payment.transactionId || null,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        payment_date: payment.paymentDate,
        registration_id: payment.registrationId || null,
        wearer_id: payment.childId || null,
        payer_name: payment.payerName,
        notes: payment.notes || null,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // --- COMMISSIONS ---
  async getCommissions(): Promise<Commission[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('commissions').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((c: any) => ({
        id: c.id,
        vendorId: c.vendor_id,
        saleId: c.sale_id || '',
        registrationRef: c.registration_ref || '',
        type: c.type || 'percentage',
        rate: Number(c.rate),
        eligibleAmount: Number(c.eligible_amount),
        commissionAmount: Number(c.commission_amount),
        status: c.status,
        createdAt: c.created_at ? c.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
        payoutId: c.payout_id || undefined,
      }));
    } catch {
      return null;
    }
  },

  async insertCommission(commission: Commission): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('commissions').insert({
        vendor_id: commission.vendorId,
        sale_id: commission.saleId,
        registration_ref: commission.registrationRef,
        type: commission.type,
        rate: commission.rate,
        eligible_amount: commission.eligibleAmount,
        commission_amount: commission.commissionAmount,
        status: commission.status,
        payout_id: commission.payoutId || null,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // --- PAYOUTS ---
  async getPayouts(): Promise<Payout[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('payouts').select('*').order('payout_date', { ascending: false });
      if (error || !data) return null;
      return data.map((po: any) => ({
        id: po.id,
        payoutRef: po.payout_ref,
        vendorId: po.vendor_id,
        commissionIds: po.commission_ids || [],
        totalAmount: Number(po.total_amount),
        payoutDate: po.payout_date ? po.payout_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        notes: po.notes || undefined,
      }));
    } catch {
      return null;
    }
  },

  async insertPayout(payout: Payout): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('payouts').insert({
        payout_ref: payout.payoutRef,
        vendor_id: payout.vendorId,
        commission_ids: payout.commissionIds,
        total_amount: payout.totalAmount,
        payout_date: payout.payoutDate,
        notes: payout.notes || null,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // --- CONTACT MESSAGES / ENQUIRIES ---
  async getContactMessages(): Promise<Enquiry[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        topic: m.topic,
        message: m.message,
        status: m.status,
        notes: m.notes || undefined,
        createdAt: m.created_at ? m.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
      }));
    } catch {
      return null;
    }
  },

  async insertContactMessage(msg: Omit<Enquiry, 'id' | 'createdAt'>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: msg.name,
        email: msg.email,
        topic: msg.topic,
        message: msg.message,
        status: msg.status || 'new',
        notes: msg.notes || null,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // --- SUPABASE STORAGE (PRIVATE BUCKETS & SECURE SIGNED URLS) ---
  async uploadPrivatePhoto(file: File): Promise<{ path: string; signedUrl: string | null } | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wearer-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) return null;

      // Generate secure signed URL with 1-hour expiration
      const { data: signedData } = await supabase.storage
        .from('wearer-photos')
        .createSignedUrl(filePath, 3600);

      return {
        path: filePath,
        signedUrl: signedData?.signedUrl || null,
      };
    } catch {
      return null;
    }
  },

  async uploadWearerPhoto(file: File): Promise<string | null> {
    const res = await this.uploadPrivatePhoto(file);
    return res ? res.signedUrl || res.path : null;
  },

  async getSignedPhotoUrl(filePathOrUrl: string, expiresIn: number = 3600): Promise<string | null> {
    if (!isSupabaseConfigured || !filePathOrUrl) return null;
    // If it's already a full data: or blob: URL, return directly
    if (filePathOrUrl.startsWith('data:') || filePathOrUrl.startsWith('blob:')) {
      return filePathOrUrl;
    }

    try {
      // Extract relative path if a full URL was provided
      let cleanPath = filePathOrUrl;
      if (filePathOrUrl.includes('/wearer-photos/')) {
        cleanPath = filePathOrUrl.split('/wearer-photos/').pop() || filePathOrUrl;
      }

      const { data, error } = await supabase.storage
        .from('wearer-photos')
        .createSignedUrl(cleanPath, expiresIn);

      if (error || !data) return filePathOrUrl;
      return data.signedUrl;
    } catch {
      return filePathOrUrl;
    }
  },

  async uploadPrivateReceipt(file: File): Promise<{ path: string; signedUrl: string | null } | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) return null;

      const { data: signedData } = await supabase.storage
        .from('payment-receipts')
        .createSignedUrl(filePath, 3600);

      return {
        path: filePath,
        signedUrl: signedData?.signedUrl || null,
      };
    } catch {
      return null;
    }
  },

  async getSignedReceiptUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    if (!isSupabaseConfigured || !filePath) return null;
    try {
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .createSignedUrl(filePath, expiresIn);

      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  getBrandingAssetUrl(filePath: string): string {
    if (!isSupabaseConfigured) return '';
    const { data } = supabase.storage.from('branding-assets').getPublicUrl(filePath);
    return data.publicUrl;
  },

  // --- ATOMIC WORKFLOWS & EDGE RPCs ---
  async approveRegistration(
    registrationId: string,
    adminActor: string = 'Admin Coordinator',
    reason: string = 'All credentials and band verified.'
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('approve_registration_atomic', {
        p_registration_id: registrationId,
        p_admin_actor: adminActor,
        p_reason: reason,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Approval RPC failed' };
    }
  },

  async rejectRegistration(
    registrationId: string,
    adminActor: string = 'Admin Coordinator',
    reason: string = 'Verification requirements not met.'
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('reject_registration_atomic', {
        p_registration_id: registrationId,
        p_admin_actor: adminActor,
        p_reason: reason,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Rejection RPC failed' };
    }
  },

  async verifyDemoPayment(
    paymentId: string,
    adminActor: string = 'Admin Coordinator'
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('verify_demo_payment_atomic', {
        p_payment_id: paymentId,
        p_admin_actor: adminActor,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Payment verification RPC failed' };
    }
  },

  async createCommissionRpc(commissionData: {
    vendorId: string;
    saleId?: string;
    registrationRef?: string;
    type?: string;
    rate?: number;
    eligibleAmount: number;
    status?: string;
    adminActor?: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('create_commission_atomic', {
        p_vendor_id: commissionData.vendorId,
        p_sale_id: commissionData.saleId || `MAN-${Date.now()}`,
        p_registration_ref: commissionData.registrationRef || null,
        p_type: commissionData.type || 'percentage',
        p_rate: commissionData.rate !== undefined ? Number(commissionData.rate) : null,
        p_eligible_amount: Number(commissionData.eligibleAmount),
        p_status: commissionData.status || 'pending',
        p_admin_actor: commissionData.adminActor || 'Admin Coordinator',
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Commission RPC failed' };
    }
  },

  // --- SAFETY INCIDENTS & SECURE BAND LOOKUP ---
  async submitPublicFoundReport(report: {
    bandCode: string;
    callerName?: string;
    callerContact: string;
    voluntaryLocation?: string;
    notes: string;
    reportType?: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('submit_found_child_report', {
        p_band_code: report.bandCode,
        p_caller_name: report.callerName || 'Anonymous Finder',
        p_caller_contact: report.callerContact,
        p_location: report.voluntaryLocation || 'Location not specified',
        p_notes: report.notes,
        p_report_type: report.reportType || 'child_found',
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Public report submission failed' };
    }
  },

  async secureBandLookup(
    bandCode: string,
    actor: string = 'Support Staff'
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('lookup_band_guardian_secure', {
        p_band_code: bandCode,
        p_actor: actor,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Secure band lookup failed' };
    }
  },

  async logGuardianContactAttempt(
    incidentId: string,
    attempt: {
      method: string;
      contactTarget: string;
      outcome: string;
      notes?: string;
      actor?: string;
    }
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('log_guardian_contact_attempt', {
        p_incident_id: incidentId,
        p_actor: attempt.actor || 'Support Staff',
        p_method: attempt.method,
        p_contact_target: attempt.contactTarget,
        p_outcome: attempt.outcome,
        p_notes: attempt.notes || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Logging contact attempt failed' };
    }
  },

  async updateIncidentStatusAtomic(
    incidentId: string,
    status: string,
    outcomeSummary?: string,
    notes?: string,
    actor: string = 'Support Staff'
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('update_incident_status_atomic', {
        p_incident_id: incidentId,
        p_actor: actor,
        p_status: status,
        p_outcome_summary: outcomeSummary || null,
        p_notes: notes || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Updating incident status failed' };
    }
  },

  // --- SUBSCRIPTION REMINDERS & AUTOMATED STATUS SYNC ---
  async syncSubscriptionStatuses(): Promise<{
    success: boolean;
    expiringCount?: number;
    expiredCount?: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('sync_subscription_statuses_atomic');
      if (error) return { success: false, error: error.message };
      return {
        success: true,
        expiringCount: data?.expiring_soon_count || 0,
        expiredCount: data?.expired_count || 0,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sync failed' };
    }
  },

  async sendRenewalReminder(
    subscriptionId: string,
    channel: string = 'email',
    notes?: string,
    actor: string = 'Support Coordinator'
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.rpc('send_renewal_reminder_atomic', {
        p_subscription_id: subscriptionId,
        p_channel: channel,
        p_actor: actor,
        p_notes: notes || null,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sending reminder failed' };
    }
  },

  // --- SUPABASE REALTIME SUBSCRIPTIONS ---
  subscribeToRealtime(callbacks: {
    onRegistrationChange?: (payload: any) => void;
    onIncidentChange?: (payload: any) => void;
    onSubscriptionChange?: (payload: any) => void;
    onBandChange?: (payload: any) => void;
    onPaymentChange?: (payload: any) => void;
  }) {
    if (!isSupabaseConfigured) return null;

    try {
      const channel = supabase
        .channel('we4u-realtime-all')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          (payload) => callbacks.onRegistrationChange && callbacks.onRegistrationChange(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'incidents' },
          (payload) => callbacks.onIncidentChange && callbacks.onIncidentChange(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions' },
          (payload) => callbacks.onSubscriptionChange && callbacks.onSubscriptionChange(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bands' },
          (payload) => callbacks.onBandChange && callbacks.onBandChange(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'payments' },
          (payload) => callbacks.onPaymentChange && callbacks.onPaymentChange(payload)
        )
        .subscribe();

      return channel;
    } catch {
      return null;
    }
  },
};

