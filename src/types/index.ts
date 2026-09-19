export type RelationshipType = 
  | 'Mother'
  | 'Father'
  | 'Legal Guardian'
  | 'Grandparent'
  | 'Foster Parent'
  | 'Other Authorized Adult';

export interface EmergencyContact {
  fullName: string;
  relationship: string;
  telephone: string;
}

export interface GuardianData {
  fullName: string;
  relationship: RelationshipType | string;
  mobile: string;
  email?: string;
  preferredLanguage: string;
  emergencyContact?: EmergencyContact;
}

export interface ChildData {
  name: string;
  ageRange?: string;
  photoUrl?: string;
}

export interface Vendor {
  id: string;
  shopName: string;
  branch: string;
  contactPerson: string;
  telephone: string;
  address: string;
  isActive: boolean;
  commissionRate: number; // e.g., 10 (for 10%) or 15 (for $15 fixed)
  commissionType: 'fixed' | 'percentage';
  createdAt: string;
}

export type BandStatus = 'available' | 'assigned' | 'lost' | 'replaced' | 'retired';

export interface Band {
  id: string;
  referenceCode: string; // Formatted e.g. W4Y-4891-K2
  status: BandStatus;
  childId?: string;
  vendorId?: string;
  assignedDate?: string;
  replacementNotes?: string;
  replacedByCode?: string;
  retiredDate?: string;
}

export type RegistrationStatus = 'pending_verification' | 'update_requested' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'verified' | 'reversed';

export interface RegistrationTimelineEntry {
  timestamp: string;
  actor: string;
  action: string;
  notes?: string;
}

export interface Registration {
  id: string;
  referenceNumber: string; // e.g. REG-2026-8192
  submissionDate: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  guardian: GuardianData;
  child: ChildData;
  bandCode: string;
  vendorId: string;
  planId: string;
  statusReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  timeline: RegistrationTimelineEntry[];
}

export interface ChildRecord {
  id: string;
  name: string;
  ageRange: string;
  photoUrl?: string;
  primaryGuardian: GuardianData;
  secondaryGuardians: EmergencyContact[];
  currentBandCode: string;
  subscriptionId?: string;
  vendorId: string;
  purchaseDate: string;
  receiptRef: string;
  registeredDate: string;
  incidentsCount: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  durationMonths: number;
  priceFormatted: string; // e.g. "$29.00 / yr" or "Provisional / To Be Confirmed"
  priceAmount: number;
  currency: string;
  description: string;
  isActive: boolean;
  isProvisional: boolean;
  features: string[];
}

export type SubscriptionStatus = 'pending' | 'active' | 'expiring_soon' | 'expired' | 'ended';

export interface Subscription {
  id: string;
  childId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  paymentRef?: string;
  renewalCount: number;
}

export interface Payment {
  id: string;
  receiptRef: string; // e.g. REC-8492
  type: 'band_purchase' | 'subscription' | 'replacement';
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentDate: string;
  registrationId?: string;
  childId?: string;
  payerName: string;
  notes?: string;
}

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'reversed';

export interface Commission {
  id: string;
  vendorId: string;
  saleId: string; // reference to payment or registration
  registrationRef: string;
  type: 'fixed' | 'percentage';
  rate: number;
  eligibleAmount: number;
  commissionAmount: number;
  status: CommissionStatus;
  createdAt: string;
  payoutId?: string;
}

export interface Payout {
  id: string;
  payoutRef: string; // e.g. PAY-2026-004
  vendorId: string;
  commissionIds: string[];
  totalAmount: number;
  payoutDate: string;
  notes?: string;
}

export type IncidentReportType = 'child_found' | 'band_found_alone';
export type IncidentStatus = 'open' | 'contacting_guardian' | 'awaiting_confirmation' | 'resolved';

export interface ContactAttempt {
  id: string;
  timestamp: string;
  staffName: string;
  method: 'phone_call' | 'sms' | 'office_followup';
  contactTarget: string; // e.g. "Primary Guardian (Elena Vance)"
  outcome: string;
  notes: string;
}

export interface Incident {
  id: string;
  incidentRef: string; // e.g. INC-2026-042
  bandReference: string;
  reportType: IncidentReportType;
  callerName?: string;
  callerContact?: string;
  voluntaryLocation?: string;
  notes: string;
  status: IncidentStatus;
  createdAt: string;
  assignedStaff: string;
  attempts: ContactAttempt[];
  resolvedAt?: string;
  outcomeSummary?: string;
}

export type EnquiryTopic = 'registration' | 'subscription' | 'band_replacement' | 'vendor_enquiry' | 'general_enquiry';
export type EnquiryStatus = 'new' | 'in_progress' | 'resolved';

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  topic: EnquiryTopic;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
  notes?: string;
}

export interface AppActivity {
  id: string;
  timestamp: string;
  actor: string;
  actionType: string;
  description: string;
  entityType: 'vendor' | 'registration' | 'child' | 'band' | 'payment' | 'commission' | 'payout' | 'incident' | 'enquiry' | 'plan' | 'settings';
  entityId: string;
}

export interface AppSettings {
  officePhone: string;
  officeEmail: string;
  officeAddress: string;
  officeHours: string;
  availableLanguages: string[];
  directPurchaseEnabled: boolean;
  allowPhotoUpload: boolean;
  defaultCommissionPercentage: number;
  defaultCommissionFixed: number;
  simulationNote: string;
}
