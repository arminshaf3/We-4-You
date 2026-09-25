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
        isProvisional: false,
        features: p.features || ['Emergency call center routing', 'Confidential emergency contacts', 'Waterproof identification band'],
      }));
    } catch {
      return null;
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
      const { data, error } = await supabase
        .from('bands')
        .insert({ reference_code: code, status: 'available' })
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
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.vendorId !== undefined) payload.vendor_id = updates.vendorId;
      if (updates.childId !== undefined) payload.child_id = updates.childId;
      if (updates.assignedDate !== undefined) payload.assigned_date = updates.assignedDate;
      if (updates.replacementNotes !== undefined) payload.replacement_notes = updates.replacementNotes;
      if (updates.replacedByCode !== undefined) payload.replaced_by_code = updates.replacedByCode;
      if (updates.retiredDate !== undefined) payload.retired_date = updates.retiredDate;

      const { error } = await supabase.from('bands').update(payload).eq('reference_code', code);
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
      const { data, error } = await supabase.from('registrations').select('*').order('submission_date', { ascending: false });
      if (error || !data) return null;
      return data.map((r: any) => ({
        id: r.id,
        referenceNumber: r.reference_number,
        child: r.wearer_data,
        guardian: r.contact_data,
        bandCode: r.band_code,
        vendorId: r.vendor_id || 'central',
        planId: r.plan_id,
        status: r.status,
        statusReason: r.status_reason || undefined,
        paymentStatus: r.payment_status,
        paymentRef: r.payment_ref || undefined,
        cardDetails: r.card_details || undefined,
        timeline: r.timeline || [],
        submissionDate: r.submission_date ? r.submission_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
      }));
    } catch {
      return null;
    }
  },

  async insertRegistration(reg: Registration): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('registrations').insert({
        id: reg.id,
        reference_number: reg.referenceNumber,
        wearer_data: reg.child,
        contact_data: reg.guardian,
        band_code: reg.bandCode,
        vendor_id: reg.vendorId === 'central' ? null : reg.vendorId,
        plan_id: reg.planId,
        status: reg.status,
        status_reason: reg.statusReason || null,
        payment_status: reg.paymentStatus,
        payment_ref: reg.paymentRef || null,
        card_details: reg.cardDetails || null,
        timeline: reg.timeline,
      });
      return !error;
    } catch {
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

      const { error } = await supabase.from('registrations').update(payload).eq('id', id);
      return !error;
    } catch {
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

  // --- PHOTO UPLOAD TO SUPABASE STORAGE ---
  async uploadWearerPhoto(file: File): Promise<string | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wearer-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) return null;

      const { data } = supabase.storage.from('wearer-photos').getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      return null;
    }
  },
};
