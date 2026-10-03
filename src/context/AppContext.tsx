import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Vendor,
  Band,
  BandStatus,
  ChildRecord,
  SubscriptionPlan,
  Subscription,
  Registration,
  Payment,
  Commission,
  Payout,
  Incident,
  IncidentReportType,
  IncidentStatus,
  Enquiry,
  AppActivity,
  AppSettings,
  RegistrationStatus,
  ContactAttempt,
  PaymentMethod,
  CardPaymentDetails,
} from '../types';
import {
  initialVendors,
  initialPlans,
  initialBands,
  initialChildren,
  initialSubscriptions,
  initialRegistrations,
  initialPayments,
  initialCommissions,
  initialPayouts,
  initialIncidents,
  initialEnquiries,
  initialActivity,
  initialSettings,
} from './fixtures';
import { supabaseService } from '../services/supabaseService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  // State
  vendors: Vendor[];
  activeVendors: Vendor[];
  plans: SubscriptionPlan[];
  activePlans: SubscriptionPlan[];
  bands: Band[];
  childrenRecords: ChildRecord[];
  subscriptions: Subscription[];
  registrations: Registration[];
  payments: Payment[];
  commissions: Commission[];
  payouts: Payout[];
  incidents: Incident[];
  enquiries: Enquiry[];
  activity: AppActivity[];
  settings: AppSettings;
  isAdminLoggedIn: boolean;
  adminUser: string;
  toasts: ToastMessage[];

  // Admin Auth
  loginAdmin: (username?: string) => void;
  logoutAdmin: () => void;

  // Toast
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Registration workflows
  submitPublicRegistration: (data: Omit<Registration, 'id' | 'referenceNumber' | 'submissionDate' | 'status' | 'paymentStatus' | 'timeline'> & { paymentMethod?: PaymentMethod; cardDetails?: CardPaymentDetails }) => Registration;
  updateRegistrationStatus: (id: string, status: RegistrationStatus, reason?: string) => void;

  // Vendor workflows
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Vendor;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  toggleVendorActive: (id: string) => void;

  // Band workflows
  assignBandToChild: (bandCode: string, childId: string) => boolean;
  updateBandStatus: (bandCode: string, status: BandStatus, notes?: string) => void;
  markBandLost: (bandCode: string, notes?: string) => void;
  replaceBand: (childId: string, oldBandCode: string, newBandCode: string, reason: string) => boolean;
  addBandToInventory: (code: string) => Band | null;

  // Child and Guardian workflows
  updateChildRecord: (childId: string, updates: Partial<ChildRecord>) => void;

  // Plan & Subscription workflows
  addPlan: (plan: Omit<SubscriptionPlan, 'id'>) => SubscriptionPlan;
  updatePlan: (id: string, updates: Partial<SubscriptionPlan>) => void;
  togglePlanActive: (id: string) => void;
  updateCustomerSubscriptionPrice: (subscriptionId: string, customPrice: number, notes?: string) => void;
  renewSubscription: (subscriptionId: string, monthsToAdd: number, method?: PaymentMethod, cardDetails?: CardPaymentDetails, customPriceOverride?: number) => Payment | undefined;
  sendRenewalReminder: (subscriptionId: string, channel?: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  directSubscribeWithCard: (params: {
    bandCode: string;
    planId: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail?: string;
    cardDetails: CardPaymentDetails;
  }) => { success: boolean; message: string; receipt?: Payment; subscription?: Subscription };

  // Payments workflows
  verifyPayment: (paymentId: string) => void;
  reversePayment: (paymentId: string, reason: string) => void;

  // Commission & Payout workflows
  approveCommission: (commissionId: string) => void;
  createSimulatedPayout: (vendorId: string, commissionIds: string[], notes?: string) => Payout | null;

  // Incident workflows
  logIncident: (data: Omit<Incident, 'id' | 'incidentRef' | 'createdAt' | 'attempts' | 'status'>) => Incident;
  submitPublicFoundReport: (report: {
    bandCode: string;
    callerName?: string;
    callerContact: string;
    voluntaryLocation?: string;
    notes: string;
    reportType?: IncidentReportType;
  }) => Promise<{ success: boolean; incidentRef: string; message: string }>;
  addContactAttempt: (incidentId: string, attempt: Omit<ContactAttempt, 'id' | 'timestamp' | 'staffName'>) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, outcomeSummary?: string, notes?: string) => void;
  resolveIncident: (incidentId: string, outcomeSummary: string) => void;

  // Enquiry workflows
  submitPublicEnquiry: (name: string, email: string, topic: any, message: string) => Enquiry;
  updateEnquiryStatus: (id: string, status: 'new' | 'in_progress' | 'resolved', notes?: string) => void;

  // Settings & Demo Reset
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetDemoData: () => void;

  // Global Lookups
  findBandRecord: (code: string) => {
    band?: Band;
    child?: ChildRecord;
    subscription?: Subscription;
    vendor?: Vendor;
    incidents: Incident[];
  };
}

// Helper to guarantee unique band reference codes across inventory
const deduplicateBands = (bandList: Band[]): Band[] => {
  const map = new Map<string, Band>();
  bandList.forEach((b) => {
    const key = b.referenceCode.replace(/[\s-]/g, '').toUpperCase();
    if (!map.has(key)) {
      map.set(key, b);
    } else {
      const existing = map.get(key)!;
      // If one duplicate has an assigned child or is active, keep the assigned record
      if (existing.status === 'available' && b.status !== 'available') {
        map.set(key, b);
      } else if (!existing.childId && b.childId) {
        map.set(key, b);
      }
    }
  });
  return Array.from(map.values());
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Safe storage persistence helper
const loadPersisted = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
};

const savePersisted = (key: string, value: any) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    sessionStorage.setItem(key, serialized);
  } catch {
    // ignore quota/privacy errors
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In-memory state with robust local storage & cross-tab synchronization
  const [vendors, setVendors] = useState<Vendor[]>(() => loadPersisted('we4u_vendors', initialVendors));
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => loadPersisted('we4u_plans', initialPlans));
  const [bands, setBands] = useState<Band[]>(() => deduplicateBands(loadPersisted('we4u_bands', initialBands)));
  const [childrenRecords, setChildrenRecords] = useState<ChildRecord[]>(() => loadPersisted('we4u_children', initialChildren));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadPersisted('we4u_subscriptions', initialSubscriptions));
  const [registrations, setRegistrations] = useState<Registration[]>(() => loadPersisted('we4u_registrations', initialRegistrations));
  const [payments, setPayments] = useState<Payment[]>(() => loadPersisted('we4u_payments', initialPayments));
  const [commissions, setCommissions] = useState<Commission[]>(() => loadPersisted('we4u_commissions', initialCommissions));
  const [payouts, setPayouts] = useState<Payout[]>(() => loadPersisted('we4u_payouts', initialPayouts));
  const [incidents, setIncidents] = useState<Incident[]>(() => loadPersisted('we4u_incidents', initialIncidents));
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => loadPersisted('we4u_enquiries', initialEnquiries));
  const [activity, setActivity] = useState<AppActivity[]>(() => loadPersisted('we4u_activity', initialActivity));
  const [settings, setSettings] = useState<AppSettings>(() => loadPersisted('we4u_settings', initialSettings));

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return (localStorage.getItem('we4u_admin_auth') ?? sessionStorage.getItem('we4u_admin_auth')) === 'true';
  });

  const [adminUser, setAdminUser] = useState<string>(() => {
    return localStorage.getItem('we4u_admin_user') ?? sessionStorage.getItem('we4u_admin_user') ?? 'we4u@gmail.com';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state changes to localStorage and sessionStorage
  useEffect(() => { savePersisted('we4u_vendors', vendors); }, [vendors]);
  useEffect(() => { savePersisted('we4u_plans', plans); }, [plans]);
  useEffect(() => { savePersisted('we4u_bands', bands); }, [bands]);
  useEffect(() => { savePersisted('we4u_children', childrenRecords); }, [childrenRecords]);
  useEffect(() => { savePersisted('we4u_subscriptions', subscriptions); }, [subscriptions]);
  useEffect(() => { savePersisted('we4u_registrations', registrations); }, [registrations]);
  useEffect(() => { savePersisted('we4u_payments', payments); }, [payments]);
  useEffect(() => { savePersisted('we4u_commissions', commissions); }, [commissions]);
  useEffect(() => { savePersisted('we4u_payouts', payouts); }, [payouts]);
  useEffect(() => { savePersisted('we4u_incidents', incidents); }, [incidents]);
  useEffect(() => { savePersisted('we4u_enquiries', enquiries); }, [enquiries]);
  useEffect(() => { savePersisted('we4u_activity', activity); }, [activity]);
  useEffect(() => { savePersisted('we4u_settings', settings); }, [settings]);

  // Realtime cross-tab synchronization (updates live when edited in another tab/window)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (e.key === 'we4u_settings') setSettings(parsed);
        if (e.key === 'we4u_plans') setPlans(parsed);
        if (e.key === 'we4u_vendors') setVendors(parsed);
        if (e.key === 'we4u_bands') setBands(deduplicateBands(parsed));
        if (e.key === 'we4u_children') setChildrenRecords(parsed);
        if (e.key === 'we4u_subscriptions') setSubscriptions(parsed);
        if (e.key === 'we4u_registrations') setRegistrations(parsed);
        if (e.key === 'we4u_payments') setPayments(parsed);
        if (e.key === 'we4u_commissions') setCommissions(parsed);
        if (e.key === 'we4u_payouts') setPayouts(parsed);
        if (e.key === 'we4u_incidents') setIncidents(parsed);
        if (e.key === 'we4u_enquiries') setEnquiries(parsed);
        if (e.key === 'we4u_activity') setActivity(parsed);
      } catch {
        // ignore JSON errors
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Asynchronously synchronize live data from Supabase & attach Realtime listeners
  useEffect(() => {
    if (!supabaseService.isConfigured) return;

    // 1. Sync automated subscription statuses (expiring_soon / expired)
    supabaseService.syncSubscriptionStatuses().catch(() => {});

    // 2. Fetch live data with smart merge
    const syncRegistrations = () => {
      supabaseService.getRegistrations().then((data) => {
        if (data && data.length > 0) {
          setRegistrations((prev) => {
            const map = new Map<string, Registration>();
            prev.forEach((r) => map.set(r.id, r));
            data.forEach((r) => map.set(r.id, r));
            return Array.from(map.values()).sort((a, b) => (b.submissionDate || '').localeCompare(a.submissionDate || ''));
          });
        }
      });
    };

    const syncIncidents = () => {
      supabaseService.getIncidents().then((data) => {
        if (data && data.length > 0) {
          setIncidents((prev) => {
            const map = new Map<string, Incident>();
            prev.forEach((i) => map.set(i.id, i));
            data.forEach((i) => map.set(i.id, i));
            return Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          });
        }
      });
    };

    supabaseService.getVendors().then((data) => {
      if (data && data.length > 0) setVendors(data);
    });

    supabaseService.getPlans().then((data) => {
      if (data && data.length > 0) {
        const isModified = localStorage.getItem('we4u_plans_modified') === 'true';
        if (!isModified) {
          setPlans(data);
        } else {
          setPlans((prev) => {
            const map = new Map<string, SubscriptionPlan>();
            data.forEach((p) => map.set(p.id, p));
            prev.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
        }
      }
    });

    supabaseService.getBands().then((data) => {
      if (data && data.length > 0) setBands(data);
    });

    supabaseService.getWearers().then((data) => {
      if (data && data.length > 0) setChildrenRecords(data);
    });

    syncRegistrations();
    syncIncidents();

    supabaseService.getPayments().then((data) => {
      if (data && data.length > 0) setPayments(data);
    });

    supabaseService.getCommissions().then((data) => {
      if (data && data.length > 0) setCommissions(data);
    });

    supabaseService.getPayouts().then((data) => {
      if (data && data.length > 0) setPayouts(data);
    });

    supabaseService.getContactMessages().then((data) => {
      if (data && data.length > 0) setEnquiries(data);
    });

    // Set background polling timer every 8 seconds for multi-device cross-sync
    const pollInterval = setInterval(() => {
      syncRegistrations();
      syncIncidents();
    }, 8000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncRegistrations();
        syncIncidents();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Register Supabase Realtime listeners
    const channel = supabaseService.subscribeToRealtime({
      onRegistrationChange: (payload) => {
        syncRegistrations();
        if (payload.eventType === 'INSERT') {
          addToast('info', 'New Registration Received', `Reference: ${payload.new?.reference_number || 'Incoming'}`);
        } else if (payload.eventType === 'UPDATE' && payload.new?.status === 'approved') {
          addToast('success', 'Registration Approved', `Registration ${payload.new?.reference_number} is now active.`);
        }
      },
      onIncidentChange: (payload) => {
        syncIncidents();
        if (payload.eventType === 'INSERT') {
          addToast('warning', 'Incoming Assistance Incident', `Report ID: ${payload.new?.incident_ref || 'Incoming'}`);
        }
      },
      onSubscriptionChange: () => {
        supabaseService.syncSubscriptionStatuses();
      },
      onBandChange: () => {
        supabaseService.getBands().then((data) => data && setBands(data));
      },
      onPaymentChange: () => {
        supabaseService.getPayments().then((data) => data && setPayments(data));
      },
    });

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  // Active getters
  const activeVendors = vendors.filter((v) => v.isActive);
  const activePlans = plans.filter((p) => p.isActive);

  // Helper: Activity logger
  const logAction = (
    actionType: string,
    description: string,
    entityType: AppActivity['entityType'],
    entityId: string,
    actor = adminUser
  ) => {
    const entry: AppActivity = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor,
      actionType,
      description,
      entityType,
      entityId,
    };
    setActivity((prev) => [entry, ...prev]);
  };

  // Toast handlers
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Admin Auth Handlers
  const loginAdmin = (username = 'we4u@gmail.com') => {
    setIsAdminLoggedIn(true);
    setAdminUser(username);
    savePersisted('we4u_admin_auth', 'true');
    savePersisted('we4u_admin_user', username);
    addToast('success', 'Admin Sign In', 'Signed in successfully.');
    logAction('Admin Sign-In', `Signed in as ${username}.`, 'settings', 'AUTH');
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('we4u_admin_auth');
      localStorage.removeItem('we4u_admin_user');
      sessionStorage.removeItem('we4u_admin_auth');
      sessionStorage.removeItem('we4u_admin_user');
    } catch {}
    addToast('info', 'Signed Out', 'Exited admin dashboard.');
  };

  // 1. Submit Public Registration
  const submitPublicRegistration = (
    data: Omit<Registration, 'id' | 'referenceNumber' | 'submissionDate' | 'status' | 'paymentStatus' | 'timeline'> & {
      paymentMethod?: PaymentMethod;
      cardDetails?: CardPaymentDetails;
    }
  ): Registration => {
    // 1. Strict Band Inventory Validation Guard
    const normCode = data.bandCode.toUpperCase().replace(/[\s-]/g, '').trim();
    const inventoryBand = bands.find((b) => b.referenceCode.toUpperCase().replace(/[\s-]/g, '') === normCode);

    if (!inventoryBand) {
      addToast('error', 'Registration Blocked', `Band reference "${data.bandCode}" was not found in system inventory. Only official pre-issued bands in inventory can be registered.`);
      throw new Error(`Band reference "${data.bandCode}" is not present in system inventory.`);
    }

    if (inventoryBand.status === 'assigned' || inventoryBand.childId) {
      addToast('error', 'Registration Blocked', `Band reference "${data.bandCode}" is already registered and assigned to an active wearer. Duplicate registration is not permitted.`);
      throw new Error(`Band reference "${data.bandCode}" is already registered.`);
    }

    if (inventoryBand.status !== 'available') {
      addToast('error', 'Registration Blocked', `Band reference "${data.bandCode}" has status "${inventoryBand.status}" and cannot be registered.`);
      throw new Error(`Band reference "${data.bandCode}" is not available for registration.`);
    }

    const duplicateReg = registrations.find(
      (r) =>
        r.bandCode.replace(/[\s-]/g, '').toUpperCase() === normCode &&
        (r.status === 'pending_verification' || r.status === 'approved')
    );
    if (duplicateReg) {
      addToast('error', 'Registration Blocked', `Band "${data.bandCode}" already has an active registration submission (#${duplicateReg.referenceNumber}).`);
      throw new Error(`Band "${data.bandCode}" already has an active registration submission.`);
    }

    const count = registrations.length + 183;
    const refNumber = `REG-2026-0${count}`;
    const selectedPlan = plans.find((p) => p.id === data.planId);
    const amount = selectedPlan?.priceAmount || 29.0;
    const paymentMethod = data.paymentMethod || (data.cardDetails ? 'card' : 'card');
    const isCard = paymentMethod === 'card';

    // Generate Transaction Reference and Receipt
    const transactionId = data.cardDetails?.transactionId || `TXN-CARD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const payRef = isCard
      ? (data.paymentRef || `CARD-2026-${Math.floor(1000 + Math.random() * 9000)}`)
      : `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const cardDetails: CardPaymentDetails | undefined = isCard
      ? {
          brand: data.cardDetails?.brand || 'Visa',
          last4: data.cardDetails?.last4 || '4242',
          cardholderName: data.cardDetails?.cardholderName || data.guardian.fullName,
          expMonth: data.cardDetails?.expMonth || '12',
          expYear: data.cardDetails?.expYear || '28',
          transactionId,
          authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        }
      : undefined;

    const paymentStatus = isCard ? 'verified' : 'pending';

    const timeline = [
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: 'Applicant',
        action: 'Registration submitted online',
        notes: isCard
          ? 'Guardian and band details submitted with card checkout.'
          : 'Awaiting office document verification and subscription payment confirmation.',
      },
    ];

    if (isCard && cardDetails) {
      timeline.push({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: 'Payment Gateway (Card Processor)',
        action: 'Card Payment Accepted & Confirmed',
        notes: `Authorized $${amount.toFixed(2)} USD via ${cardDetails.brand} ending in ${cardDetails.last4}. Transaction Ref: ${transactionId}.`,
      });
    }

    const newReg: Registration = {
      ...data,
      id: refNumber,
      referenceNumber: refNumber,
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending_verification',
      paymentStatus,
      paymentMethod,
      cardDetails,
      paymentRef: payRef,
      timeline,
    };

    setRegistrations((prev) => [newReg, ...prev]);
    supabaseService.insertRegistration(newReg);

    // Create payment fixture linked to this registration
    const newPay: Payment = {
      id: `PAY-${Date.now()}`,
      receiptRef: payRef,
      type: 'subscription',
      method: paymentMethod,
      cardDetails,
      transactionId: isCard ? transactionId : undefined,
      amount,
      currency: 'USD',
      status: paymentStatus,
      paymentDate: new Date().toISOString().substring(0, 10),
      registrationId: refNumber,
      payerName: data.guardian.fullName,
      notes: isCard
        ? `Card payment accepted & confirmed online (${cardDetails?.brand} ending ${cardDetails?.last4}). Instant verification.`
        : 'Registration submitted; awaiting manual bank/store confirmation.',
    };
    setPayments((prev) => [newPay, ...prev]);

    // Log Activity
    logAction(
      isCard ? 'Card Payment Confirmed' : 'Registration Received',
      isCard
        ? `Registration ${refNumber} received with confirmed card payment of $${amount.toFixed(2)} (${cardDetails?.brand} •••• ${cardDetails?.last4}).`
        : `New registration ${refNumber} received for wearer "${data.child.name}".`,
      'registration',
      refNumber,
      isCard ? 'Payment Gateway / Applicant' : 'Applicant (Public Web)'
    );

    addToast(
      'success',
      isCard ? 'Card Payment Accepted & Confirmed' : 'Registration Submitted',
      isCard
        ? `Receipt ${payRef} confirmed for $${amount.toFixed(2)}. Reference ${refNumber} queued.`
        : `Reference ${refNumber} created for review.`
    );
    return newReg;
  };

  // 2. Update Registration Status (Approve, Reject, Request Info)
  const updateRegistrationStatus = (id: string, status: RegistrationStatus, reason?: string) => {
    const reg = registrations.find((r) => r.id === id || r.referenceNumber === id);
    if (!reg) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let actionDesc = '';
    if (status === 'approved') actionDesc = 'Registration Approved';
    if (status === 'rejected') actionDesc = 'Registration Rejected';
    if (status === 'update_requested') actionDesc = 'Information Update Requested';

    const updatedTimeline = [
      ...reg.timeline,
      {
        timestamp,
        actor: adminUser,
        action: actionDesc,
        notes: reason || (status === 'approved' ? 'All contact and band credentials verified.' : ''),
      },
    ];

    const regId = reg.id;
    const refNum = reg.referenceNumber;

    // 1. Update local registrations state
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === regId || r.referenceNumber === refNum || r.id === id || r.referenceNumber === id
          ? {
              ...r,
              status,
              statusReason: reason,
              paymentStatus: status === 'approved' ? 'verified' : r.paymentStatus,
              verifiedBy: adminUser,
              verifiedAt: timestamp,
              timeline: updatedTimeline,
            }
          : r
      )
    );

    // 2. Direct Supabase Database Update
    supabaseService.updateRegistration(regId, {
      status,
      statusReason: reason,
      paymentStatus: status === 'approved' ? 'verified' : undefined,
      timeline: updatedTimeline,
    }).then((ok) => {
      if (ok) console.log(`Registration ${refNum} status updated to ${status} in Supabase DB`);
    }).catch(() => {});

    // If approved, create records and update band
    if (status === 'approved') {
      supabaseService.approveRegistration(regId, adminUser, reason).catch(() => {});

      const childId = `CHD-00${childrenRecords.length + 1}`;
      const subId = `SUB-00${subscriptions.length + 1}`;
      const selectedPlan = plans.find((p) => p.id === reg.planId);
      const duration = selectedPlan?.durationMonths || 12;

      const startDate = new Date().toISOString().substring(0, 10);
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + duration);
      const expiryDate = expiry.toISOString().substring(0, 10);

      // 1. Create Record
      const newChild: ChildRecord = {
        id: childId,
        name: reg.child.name,
        ageRange: reg.child.ageRange || 'Not specified',
        birthDate: reg.child.birthDate,
        calculatedAge: reg.child.calculatedAge,
        gender: reg.child.gender,
        bloodGroup: reg.child.bloodGroup,
        nationalId: reg.child.nationalId,
        medicalNotes: reg.child.medicalNotes,
        specialNeeds: reg.child.specialNeeds,
        photoUrl: reg.child.photoUrl,
        primaryGuardian: reg.guardian,
        secondaryGuardians: reg.guardian.emergencyContact ? [reg.guardian.emergencyContact] : [],
        currentBandCode: reg.bandCode,
        subscriptionId: subId,
        vendorId: reg.vendorId,
        purchaseDate: startDate,
        receiptRef: `REC-REG-${reg.referenceNumber}`,
        registeredDate: startDate,
        incidentsCount: 0,
      };
      setChildrenRecords((prev) => [...prev, newChild]);

      // 2. Create Subscription
      const newSub: Subscription = {
        id: subId,
        childId,
        planId: reg.planId,
        status: 'active',
        startDate,
        expiryDate,
        paymentRef: `REC-REG-${reg.referenceNumber}`,
        renewalCount: 0,
      };
      setSubscriptions((prev) => [...prev, newSub]);

      // 3. Update Band status to 'assigned' in local inventory state
      const normRegBand = reg.bandCode.replace(/[\s-]/g, '').toUpperCase();
      setBands((prev) => {
        const index = prev.findIndex(
          (b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === normRegBand
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'assigned',
            childId,
            vendorId: reg.vendorId === 'DIRECT' ? undefined : (reg.vendorId || updated[index].vendorId),
            assignedDate: startDate,
          };
          return deduplicateBands(updated);
        } else {
          const newBand: Band = {
            id: `BND-00${prev.length + 1}`,
            referenceCode: reg.bandCode.toUpperCase().trim(),
            status: 'assigned',
            childId,
            vendorId: reg.vendorId === 'DIRECT' ? undefined : reg.vendorId,
            assignedDate: startDate,
          };
          return deduplicateBands([...prev, newBand]);
        }
      });

      // 4. Persist wearer and band assignment to Supabase DB
      supabaseService.insertWearer(newChild).then((inserted) => {
        const finalChildId = inserted?.id || childId;
        supabaseService.updateBand(reg.bandCode, {
          status: 'assigned',
          childId: finalChildId,
          vendorId: reg.vendorId === 'DIRECT' ? undefined : reg.vendorId,
          assignedDate: startDate,
        });
      }).catch(() => {
        supabaseService.updateBand(reg.bandCode, {
          status: 'assigned',
          childId,
          vendorId: reg.vendorId === 'DIRECT' ? undefined : reg.vendorId,
          assignedDate: startDate,
        });
      });

      // Check if commission should be created for the attributed vendor
      const vendor = vendors.find((v) => v.id === reg.vendorId);
      if (vendor && vendor.isActive) {
        const eligibleAmount = selectedPlan?.priceAmount || 29.0;
        const commissionAmount =
          vendor.commissionType === 'percentage'
            ? Number(((vendor.commissionRate / 100) * eligibleAmount).toFixed(2))
            : vendor.commissionRate;

        const newComm: Commission = {
          id: `COM-00${commissions.length + 1}`,
          vendorId: vendor.id,
          saleId: `REG-${reg.referenceNumber}`,
          registrationRef: reg.referenceNumber,
          type: vendor.commissionType,
          rate: vendor.commissionRate,
          eligibleAmount,
          commissionAmount,
          status: 'pending',
          createdAt: startDate,
        };
        setCommissions((prev) => [...prev, newComm]);
        supabaseService.insertCommission(newComm).catch(() => {});
      }

      addToast('success', 'Registration Approved', `Wearer ${reg.child.name} is now protected with band ${reg.bandCode}.`);
      logAction('Registration Approved', `Approved registration ${reg.referenceNumber} for wearer ${reg.child.name}.`, 'registration', reg.referenceNumber);
    } else if (status === 'rejected') {
      supabaseService.rejectRegistration(regId, adminUser, reason || 'Registration rejected by administrator.').catch(() => {});
      addToast('info', 'Registration Rejected', `Registration ${reg.referenceNumber} has been rejected.`);
      logAction('Registration Rejected', `Rejected registration ${reg.referenceNumber}. Reason: ${reason}`, 'registration', reg.referenceNumber);
    } else {
      addToast('info', 'Status Updated', `Registration ${reg.referenceNumber} marked as ${status.replace('_', ' ')}.`);
      logAction('Registration Status Changed', `Set status of ${reg.referenceNumber} to ${status}.`, 'registration', reg.referenceNumber);
    }
  };

  // 3. Vendor Handlers
  const addVendor = (vendorData: Omit<Vendor, 'id' | 'createdAt'>): Vendor => {
    const id = `VND-00${vendors.length + 1}`;
    const newVendor: Vendor = {
      ...vendorData,
      id,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setVendors((prev) => [...prev, newVendor]);
    supabaseService.insertVendor(newVendor);
    logAction('Vendor Created', `Created retail partner profile for "${newVendor.shopName}".`, 'vendor', id);
    addToast('success', 'Shop Added', `${newVendor.shopName} added successfully.`);
    return newVendor;
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    supabaseService.updateVendor(id, updates);
    logAction('Vendor Updated', `Updated profile or terms for shop ID ${id}.`, 'vendor', id);
    addToast('success', 'Shop Updated', 'Shop profile saved.');
  };

  const toggleVendorActive = (id: string) => {
    const vendor = vendors.find((v) => v.id === id);
    if (!vendor) return;
    const newStatus = !vendor.isActive;
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: newStatus } : v))
    );
    supabaseService.updateVendor(id, { isActive: newStatus });
    logAction('Vendor Status Toggled', `Shop ${vendor.shopName} marked as ${newStatus ? 'Active' : 'Inactive'}.`, 'vendor', id);
    addToast(newStatus ? 'success' : 'info', `Shop ${newStatus ? 'Activated' : 'Deactivated'}`, `${vendor.shopName} is now ${newStatus ? 'active' : 'inactive'}.`);
  };

  // 4. Band Handlers
  const assignBandToChild = (bandCode: string, childId: string): boolean => {
    const normCode = bandCode.toUpperCase().replace(/[\s-]/g, '');
    const band = bands.find((b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === normCode);
    if (!band || band.status !== 'available') return false;

    const today = new Date().toISOString().substring(0, 10);
    const targetChild = childrenRecords.find((c) => c.id === childId);
    const prevBandCode = targetChild?.currentBandCode;

    // 1. Update bands: assign new band and retire previous band if one was assigned
    setBands((prev) =>
      prev.map((b) => {
        const bNorm = b.referenceCode.replace(/[\s-]/g, '').toUpperCase();
        if (bNorm === normCode) {
          return {
            ...b,
            status: 'assigned',
            childId,
            assignedDate: today,
          };
        }
        if (prevBandCode && bNorm === prevBandCode.replace(/[\s-]/g, '').toUpperCase()) {
          return {
            ...b,
            status: 'retired',
            retiredDate: today,
            replacedByCode: band.referenceCode,
            replacementNotes: `Replaced by ${band.referenceCode} on ${today}`,
          };
        }
        return b;
      })
    );

    // 2. Update Wearer Record
    setChildrenRecords((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, currentBandCode: band.referenceCode } : c))
    );

    // 3. Update Supabase
    supabaseService.updateBand(band.referenceCode, { status: 'assigned', childId, assignedDate: today });
    if (prevBandCode && prevBandCode.toUpperCase() !== band.referenceCode.toUpperCase()) {
      supabaseService.updateBand(prevBandCode, {
        status: 'retired',
        retiredDate: today,
        replacedByCode: band.referenceCode,
        replacementNotes: `Replaced by ${band.referenceCode} on ${today}`,
      });
    }
    supabaseService.updateWearer(childId, { currentBandCode: band.referenceCode });

    logAction(
      'Band Assigned',
      `Assigned band ${band.referenceCode} to wearer "${targetChild?.name || childId}"${prevBandCode ? ` (superseding ${prevBandCode})` : ''}.`,
      'band',
      band.id
    );
    addToast(
      'success',
      'Band Assigned',
      `Band ${band.referenceCode} is now assigned to ${targetChild?.name || 'wearer'}.`
    );
    return true;
  };

  const updateBandStatus = (bandCode: string, status: BandStatus, notes?: string) => {
    setBands((prev) =>
      prev.map((b) =>
        b.referenceCode.toUpperCase() === bandCode.toUpperCase()
          ? { ...b, status, replacementNotes: notes || b.replacementNotes }
          : b
      )
    );
    supabaseService.updateBand(bandCode, { status, replacementNotes: notes });
    logAction('Band Status Updated', `Updated status of band ${bandCode} to ${status}.`, 'band', bandCode);
    addToast('info', 'Band Updated', `Band ${bandCode} status changed to ${status}.`);
  };

  const markBandLost = (bandCode: string, notes?: string) => {
    updateBandStatus(bandCode, 'lost', notes || 'Reported lost by wearer/guardian');
  };

  const replaceBand = (childId: string, oldBandCode: string, newBandCode: string, reason: string): boolean => {
    const newBand = bands.find((b) => b.referenceCode.toUpperCase() === newBandCode.toUpperCase());
    if (!newBand || newBand.status !== 'available') return false;

    const today = new Date().toISOString().substring(0, 10);

    // 1. Retire old band
    setBands((prev) =>
      prev.map((b) => {
        if (b.referenceCode.toUpperCase() === oldBandCode.toUpperCase()) {
          return {
            ...b,
            status: 'retired',
            retiredDate: today,
            replacementNotes: reason,
            replacedByCode: newBand.referenceCode,
          };
        }
        if (b.id === newBand.id) {
          return {
            ...b,
            status: 'assigned',
            childId,
            assignedDate: today,
          };
        }
        return b;
      })
    );

    // 2. Update Record with new band while preserving subscription and history
    setChildrenRecords((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, currentBandCode: newBand.referenceCode } : c))
    );

    supabaseService.updateBand(oldBandCode, { status: 'retired', replacementNotes: reason, replacedByCode: newBand.referenceCode });
    supabaseService.updateBand(newBandCode, { status: 'assigned', childId, assignedDate: today });
    supabaseService.updateWearer(childId, { currentBandCode: newBand.referenceCode });

    logAction(
      'Band Replaced',
      `Replaced band ${oldBandCode} with ${newBand.referenceCode} for wearer ${childId}. Reason: ${reason}`,
      'band',
      newBand.id
    );
    addToast('success', 'Band Replaced', `Old band ${oldBandCode} retired; new band ${newBand.referenceCode} assigned.`);
    return true;
  };

  const addBandToInventory = (code: string): Band | null => {
    const normCode = code.toUpperCase().replace(/[\s-]/g, '').trim();
    if (!normCode) return null;
    const existing = bands.find((b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === normCode);
    if (existing) {
      addToast(
        'error',
        'Duplicate Band Code',
        `Band reference "${code.toUpperCase()}" already exists in inventory (Status: ${existing.status}). Every band must have a unique reference code.`
      );
      return null;
    }
    const id = `BND-00${bands.length + 1}`;
    const formattedCode = code.toUpperCase().trim();
    const newBand: Band = {
      id,
      referenceCode: formattedCode,
      status: 'available',
    };
    setBands((prev) => deduplicateBands([...prev, newBand]));
    supabaseService.insertBand(formattedCode);
    logAction('Band Added', `Added band ${formattedCode} to available inventory.`, 'band', id);
    addToast('success', 'Band Added', `${formattedCode} is now available in inventory.`);
    return newBand;
  };

  // 5. Profile updates
  const updateChildRecord = (childId: string, updates: Partial<ChildRecord>) => {
    setChildrenRecords((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, ...updates } : c))
    );
    supabaseService.updateWearer(childId, updates);
    logAction('Profile Updated', `Updated record details for wearer ${childId}.`, 'child', childId);
    addToast('success', 'Record Updated', 'Wearer and emergency contact details updated successfully.');
  };

  // 6. Plan & Subscription Handlers
  const addPlan = (planData: Omit<SubscriptionPlan, 'id'>): SubscriptionPlan => {
    const id = `PLAN-${Date.now().toString(36).toUpperCase()}`;
    const newPlan: SubscriptionPlan = {
      ...planData,
      id,
    };
    setPlans((prev) => [...prev, newPlan]);
    supabaseService.insertPlan(newPlan);
    logAction('Plan Created', `Created subscription tier "${newPlan.name}".`, 'plan', id);
    addToast('success', 'Plan Created', `${newPlan.name} created successfully.`);
    return newPlan;
  };

  const updatePlan = (id: string, updates: Partial<SubscriptionPlan>) => {
    try {
      localStorage.setItem('we4u_plans_modified', 'true');
    } catch {}
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    supabaseService.updatePlan(id, updates);
    logAction('Plan Configured', `Updated subscription plan ${id}.`, 'plan', id);
    addToast('success', 'Plan Updated', 'Subscription plan configuration saved.');
  };

  const togglePlanActive = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const newActive = !plan.isActive;
    updatePlan(id, { isActive: newActive });
  };

  const updateCustomerSubscriptionPrice = (subscriptionId: string, customPrice: number, notes?: string) => {
    const numPrice = Number(customPrice);
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId
          ? {
              ...s,
              customPriceAmount: isNaN(numPrice) ? undefined : numPrice,
              customPriceNote: notes?.trim() || 'Admin customized subscription rate',
            }
          : s
      )
    );
    logAction(
      'Customer Subscription Price Updated',
      `Admin set custom price of $${numPrice.toFixed(2)} for subscription ${subscriptionId}.`,
      'subscription',
      subscriptionId
    );
    addToast('success', 'Customer Price Updated', `Custom rate of $${numPrice.toFixed(2)} configured for this customer.`);
  };

  const renewSubscription = (
    subscriptionId: string,
    monthsToAdd: number,
    method: PaymentMethod = 'card',
    cardDetails?: CardPaymentDetails,
    customPriceOverride?: number
  ): Payment | undefined => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return undefined;

    // Early renewal extends from existing expiry; late renewal starts from today
    const currentExpiry = new Date(sub.expiryDate);
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
    const newExpiry = baseDate.toISOString().substring(0, 10);
    const isCard = method === 'card';
    const transactionId = cardDetails?.transactionId || (isCard ? `TXN-CARD-2026-${Math.floor(100000 + Math.random() * 900000)}` : undefined);
    const receiptRef = isCard ? `CARD-REN-${Math.floor(1000 + Math.random() * 9000)}` : `REC-REN-${Math.floor(1000 + Math.random() * 9000)}`;
    const matchingPlan = plans.find((p) => p.durationMonths === monthsToAdd && p.isActive) || plans.find((p) => p.durationMonths === monthsToAdd);
    const standardAmount = matchingPlan ? matchingPlan.priceAmount : (monthsToAdd >= 24 ? 49.0 : 29.0);
    const amount = typeof customPriceOverride === 'number' && !isNaN(customPriceOverride)
      ? Number(customPriceOverride)
      : (typeof sub.customPriceAmount === 'number' ? sub.customPriceAmount : standardAmount);

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId
          ? {
              ...s,
              expiryDate: newExpiry,
              status: 'active',
              paymentRef: receiptRef,
              paymentMethod: method,
              transactionId,
              renewalCount: s.renewalCount + 1,
              customPriceAmount: typeof customPriceOverride === 'number' ? customPriceOverride : s.customPriceAmount,
            }
          : s
      )
    );

    // Create payment receipt for renewal
    const newPay: Payment = {
      id: `PAY-REN-${Date.now()}`,
      receiptRef,
      type: 'subscription',
      method,
      cardDetails: isCard ? cardDetails || {
        brand: 'Visa',
        last4: '4242',
        cardholderName: 'Registered Guardian',
        transactionId: transactionId || `TXN-CARD-${Date.now()}`,
      } : undefined,
      transactionId,
      amount,
      currency: 'USD',
      status: 'verified',
      paymentDate: new Date().toISOString().substring(0, 10),
      childId: sub.childId,
      payerName: cardDetails?.cardholderName || 'Guardian Renewal',
      notes: isCard
        ? `Card payment accepted & confirmed online (${cardDetails?.brand || 'Visa'} ending ${cardDetails?.last4 || '4242'}). Coverage extended by ${monthsToAdd} months.`
        : `Manual subscription renewal extended by ${monthsToAdd} months.${typeof customPriceOverride === 'number' ? ` Custom negotiated customer rate applied: $${customPriceOverride.toFixed(2)}.` : ''}`,
    };
    setPayments((prev) => [newPay, ...prev]);

    logAction('Subscription Renewed', `Renewed subscription ${subscriptionId} until ${newExpiry} via ${method} ($${amount}).`, 'payment', subscriptionId);
    addToast('success', isCard ? 'Card Payment Confirmed' : 'Subscription Renewed', `Coverage extended to ${newExpiry} at $${amount.toFixed(2)}.`);
    return newPay;
  };

  const sendRenewalReminder = async (
    subscriptionId: string,
    channel: string = 'email',
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    const child = childrenRecords.find((c) => c.id === sub?.childId);
    const guardianName = child?.primaryGuardian?.fullName || 'Guardian';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId
          ? {
              ...s,
              reminderCount: (s.reminderCount || 0) + 1,
              lastReminderSentAt: timestamp,
              lastReminderChannel: channel,
            }
          : s
      )
    );

    try {
      await supabaseService.sendRenewalReminder(subscriptionId, channel, notes, adminUser);
    } catch {
      // ignore network errors in simulated / demo environments
    }

    logAction(
      'Renewal Reminder Dispatched',
      `Sent ${channel} renewal reminder for subscription ${subscriptionId} (${child?.name || 'Wearer'}) to ${guardianName}.`,
      'subscription',
      subscriptionId
    );
    addToast('success', 'Reminder Dispatched', `Renewal notice dispatched via ${channel} to ${guardianName}.`);

    return { success: true, message: `Renewal notification sent via ${channel} to ${guardianName}.` };
  };

  const directSubscribeWithCard = (params: {
    bandCode: string;
    planId: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail?: string;
    cardDetails: CardPaymentDetails;
  }): { success: boolean; message: string; receipt?: Payment; subscription?: Subscription } => {
    const normCode = params.bandCode.toUpperCase().replace(/\s+/g, '').trim();
    const band = bands.find((b) => b.referenceCode.replace(/\s+/g, '').toUpperCase() === normCode);
    const selectedPlan = plans.find((p) => p.id === params.planId) || plans[0];
    const durationMonths = selectedPlan?.durationMonths || 12;
    const amount = selectedPlan?.priceAmount || 29.0;
    const txnId = params.cardDetails.transactionId || `TXN-CARD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const receiptRef = `CARD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().substring(0, 10);

    // If band exists and has child/subscription, extend it
    if (band && band.childId) {
      const child = childrenRecords.find((c) => c.id === band.childId);
      const existingSub = subscriptions.find((s) => s.id === child?.subscriptionId);
      if (existingSub) {
        // Renew existing
        const curExp = new Date(existingSub.expiryDate);
        const now = new Date();
        const base = curExp > now ? curExp : now;
        base.setMonth(base.getMonth() + durationMonths);
        const newExpiry = base.toISOString().substring(0, 10);

        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === existingSub.id
              ? {
                  ...s,
                  status: 'active',
                  expiryDate: newExpiry,
                  paymentRef: receiptRef,
                  paymentMethod: 'card',
                  transactionId: txnId,
                  renewalCount: s.renewalCount + 1,
                }
              : s
          )
        );

        const newPay: Payment = {
          id: `PAY-${Date.now()}`,
          receiptRef,
          type: 'subscription',
          method: 'card',
          cardDetails: params.cardDetails,
          transactionId: txnId,
          amount,
          currency: 'USD',
          status: 'verified',
          paymentDate: today,
          childId: child?.id,
          payerName: params.guardianName,
          notes: `Direct card subscription renewal for band ${band.referenceCode} (${params.cardDetails.brand} ending ${params.cardDetails.last4}).`,
        };
        setPayments((prev) => [newPay, ...prev]);

        logAction('Card Subscription Confirmed', `Direct card renewal for band ${band.referenceCode} ($${amount}).`, 'payment', existingSub.id);
        addToast('success', 'Card Payment Accepted & Confirmed', `Coverage for band ${band.referenceCode} is active until ${newExpiry}.`);
        return { success: true, message: `Subscription renewed until ${newExpiry}.`, receipt: newPay, subscription: existingSub };
      }
    }

    // Otherwise record payment receipt
    const newPay: Payment = {
      id: `PAY-${Date.now()}`,
      receiptRef,
      type: 'subscription',
      method: 'card',
      cardDetails: params.cardDetails,
      transactionId: txnId,
      amount,
      currency: 'USD',
      status: 'verified',
      paymentDate: today,
      payerName: params.guardianName,
      notes: `Direct card payment for band ${params.bandCode} (${params.cardDetails.brand} ending ${params.cardDetails.last4}).`,
    };
    setPayments((prev) => [newPay, ...prev]);
    logAction('Card Payment Confirmed', `Direct card payment of $${amount} accepted for band ${params.bandCode}.`, 'payment', newPay.id);
    addToast('success', 'Card Payment Accepted', `Transaction ${txnId} confirmed.`);
    return { success: true, message: `Payment of $${amount.toFixed(2)} accepted & confirmed.`, receipt: newPay };
  };

  // 7. Payment Verification Handlers
  const verifyPayment = (paymentId: string) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay || pay.status === 'verified') return;

    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'verified' } : p))
    );

    // Call atomic verify RPC in Supabase
    supabaseService.verifyDemoPayment(paymentId, adminUser).catch(() => {});

    // If payment was linked to a pending registration, update registration paymentStatus
    if (pay.registrationId) {
      setRegistrations((prev) =>
        prev.map((r) =>
          r.referenceNumber === pay.registrationId || r.id === pay.registrationId
            ? { ...r, paymentStatus: 'verified' }
            : r
        )
      );
    }

    logAction('Payment Verified', `Simulated verification of receipt ${pay.receiptRef} ($${pay.amount}).`, 'payment', paymentId);
    addToast('success', 'Payment Verified', `Receipt ${pay.receiptRef} marked verified.`);
  };

  const reversePayment = (paymentId: string, reason: string) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay) return;

    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'reversed', notes: reason } : p))
    );
    logAction('Payment Reversed', `Reversed payment ${pay.receiptRef}. Reason: ${reason}`, 'payment', paymentId);
    addToast('warning', 'Payment Reversed', `Receipt ${pay.receiptRef} reversed.`);
  };

  // 8. Commissions & Payouts
  const approveCommission = (commissionId: string) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === commissionId ? { ...c, status: 'approved' } : c))
    );
    logAction('Commission Approved', `Approved commission entry ${commissionId}.`, 'commission', commissionId);
    addToast('success', 'Commission Approved', 'Vendor commission is now eligible for payout batching.');
  };

  const createSimulatedPayout = (vendorId: string, commissionIds: string[], notes?: string): Payout | null => {
    const eligibleComms = commissions.filter(
      (c) => commissionIds.includes(c.id) && c.vendorId === vendorId && c.status === 'approved'
    );
    if (eligibleComms.length === 0) {
      addToast('error', 'Payout Error', 'No approved commissions selected.');
      return null;
    }

    const total = eligibleComms.reduce((sum, c) => sum + c.commissionAmount, 0);
    const payoutRef = `PO-2026-00${payouts.length + 1}`;
    const newPayout: Payout = {
      id: `PAYOUT-${Date.now()}`,
      payoutRef,
      vendorId,
      commissionIds: eligibleComms.map((c) => c.id),
      totalAmount: Number(total.toFixed(2)),
      payoutDate: new Date().toISOString().substring(0, 10),
      notes: notes || 'Simulated vendor commission payout release.',
    };

    // Mark commissions as paid and link to payout
    setCommissions((prev) =>
      prev.map((c) =>
        eligibleComms.some((ec) => ec.id === c.id)
          ? { ...c, status: 'paid', payoutId: newPayout.id }
          : c
      )
    );

    setPayouts((prev) => [newPayout, ...prev]);
    logAction('Payout Created', `Simulated payout of $${newPayout.totalAmount} to vendor ${vendorId}.`, 'payout', newPayout.id);
    addToast('success', 'Simulated Payout Complete', `Batch ${payoutRef} for $${newPayout.totalAmount} processed.`);
    return newPayout;
  };

  // 9. Incidents (Assistance Reports)
  const logIncident = (
    data: Omit<Incident, 'id' | 'incidentRef' | 'createdAt' | 'attempts' | 'status'>
  ): Incident => {
    const ref = `INC-2026-00${incidents.length + 1}`;
    const newInc: Incident = {
      ...data,
      id: `INC-${Date.now()}`,
      incidentRef: ref,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'open',
      assignedStaff: adminUser,
      attempts: [],
    };

    setIncidents((prev) => [newInc, ...prev]);
    supabaseService.insertIncident(newInc);

    // Check if child matches and increment incident count
    const matchedBand = bands.find((b) => b.referenceCode.toUpperCase() === data.bandReference.toUpperCase());
    if (matchedBand?.childId) {
      setChildrenRecords((prev) =>
        prev.map((c) => (c.id === matchedBand.childId ? { ...c, incidentsCount: c.incidentsCount + 1 } : c))
      );
    }

    logAction('Assistance Incident Logged', `Office logged report ${ref} for band reference ${data.bandReference}.`, 'incident', newInc.id);
    addToast('info', 'Incident Recorded', `Report ${ref} logged. Check child records for emergency contact details.`);
    return newInc;
  };

  const submitPublicFoundReport = async (report: {
    bandCode: string;
    callerName?: string;
    callerContact: string;
    voluntaryLocation?: string;
    notes: string;
    reportType?: IncidentReportType;
  }): Promise<{ success: boolean; incidentRef: string; message: string }> => {
    const ref = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInc: Incident = {
      id: `INC-${Date.now()}`,
      incidentRef: ref,
      bandReference: report.bandCode.toUpperCase().trim(),
      reportType: report.reportType || 'child_found',
      callerName: report.callerName || 'Anonymous Finder',
      callerContact: report.callerContact,
      voluntaryLocation: report.voluntaryLocation || 'Location not specified',
      notes: report.notes,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      assignedStaff: 'Emergency Support Dispatcher',
      attempts: [],
    };

    setIncidents((prev) => [newInc, ...prev]);

    // Backend atomic submission RPC
    const res = await supabaseService.submitPublicFoundReport(report);
    if (res.success && res.data?.incident_ref) {
      newInc.incidentRef = res.data.incident_ref;
    } else {
      supabaseService.insertIncident(newInc);
    }

    logAction('Public Found Child Reported', `Public reported band ${report.bandCode} at ${report.voluntaryLocation || 'unknown location'}.`, 'incident', newInc.id);

    return {
      success: true,
      incidentRef: newInc.incidentRef,
      message: 'Emergency assistance report received. Our emergency coordinators have been notified and are reaching out to the registered guardian.',
    };
  };

  const addContactAttempt = (
    incidentId: string,
    attempt: Omit<ContactAttempt, 'id' | 'timestamp' | 'staffName'>
  ) => {
    const newAttempt: ContactAttempt = {
      ...attempt,
      id: `ATT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      staffName: adminUser,
    };

    let updatedAttempts: ContactAttempt[] = [];
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId || inc.incidentRef === incidentId) {
          updatedAttempts = [...inc.attempts, newAttempt];
          return {
            ...inc,
            status: 'contacting_guardian',
            attempts: updatedAttempts,
          };
        }
        return inc;
      })
    );

    supabaseService.logGuardianContactAttempt(incidentId, {
      method: attempt.method,
      contactTarget: attempt.contactTarget,
      outcome: attempt.outcome,
      notes: attempt.notes,
      actor: adminUser,
    }).catch(() => {
      supabaseService.updateIncident(incidentId, { status: 'contacting_guardian', attempts: updatedAttempts });
    });

    logAction(
      'Contact Attempt Recorded',
      `Recorded ${attempt.method.replace('_', ' ')} attempt to "${attempt.contactTarget}" for incident ${incidentId}. Outcome: ${attempt.outcome}`,
      'incident',
      incidentId
    );
    addToast('info', 'Attempt Logged', 'Contact attempt saved to incident history.');
  };

  const updateIncidentStatus = (
    incidentId: string,
    status: IncidentStatus,
    outcomeSummary?: string,
    notes?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId || inc.incidentRef === incidentId
          ? {
              ...inc,
              status,
              resolvedAt: (status === 'resolved' || status === 'reunited' || status === 'false_alarm') ? timestamp : inc.resolvedAt,
              outcomeSummary: outcomeSummary || inc.outcomeSummary,
            }
          : inc
      )
    );

    supabaseService.updateIncidentStatusAtomic(incidentId, status, outcomeSummary, notes, adminUser).catch(() => {
      supabaseService.updateIncident(incidentId, {
        status,
        resolvedAt: (status === 'resolved' || status === 'reunited' || status === 'false_alarm') ? timestamp : undefined,
        outcomeSummary,
      });
    });

    logAction('Incident Status Updated', `Incident ${incidentId} marked as ${status.replace('_', ' ')}. ${outcomeSummary ? `Outcome: ${outcomeSummary}` : ''}`, 'incident', incidentId);
    addToast('success', 'Incident Updated', `Status updated to ${status.replace('_', ' ')}.`);
  };

  const resolveIncident = (incidentId: string, outcomeSummary: string) => {
    updateIncidentStatus(incidentId, 'resolved', outcomeSummary);
  };

  // 10. Enquiries
  const submitPublicEnquiry = (name: string, email: string, topic: any, message: string): Enquiry => {
    const newEnq: Enquiry = {
      id: `ENQ-${Date.now()}`,
      name,
      email,
      topic,
      message,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'new',
    };
    setEnquiries((prev) => [newEnq, ...prev]);
    supabaseService.insertContactMessage(newEnq);
    logAction('Public Enquiry Received', `New enquiry from ${name} on topic: ${topic}.`, 'enquiry', newEnq.id, 'Visitor');
    addToast('success', 'Message Sent', 'Thank you! Our office staff will review your message.');
    return newEnq;
  };

  const updateEnquiryStatus = (id: string, status: 'new' | 'in_progress' | 'resolved', notes?: string) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status, notes: notes || e.notes } : e))
    );
    logAction('Enquiry Updated', `Set enquiry ${id} status to ${status}.`, 'enquiry', id);
    addToast('info', 'Enquiry Updated', `Status updated to ${status}.`);
  };

  // 11. Settings & Reset
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAction('Settings Updated', 'Updated office configuration settings.', 'settings', 'GLOBAL');
    addToast('success', 'Settings Saved', 'Office configuration updated.');
  };

  const resetDemoData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    setVendors(initialVendors);
    setPlans(initialPlans);
    setBands(initialBands);
    setChildrenRecords(initialChildren);
    setSubscriptions(initialSubscriptions);
    setRegistrations(initialRegistrations);
    setPayments(initialPayments);
    setCommissions(initialCommissions);
    setPayouts(initialPayouts);
    setIncidents(initialIncidents);
    setEnquiries(initialEnquiries);
    setActivity(initialActivity);
    setSettings(initialSettings);
    addToast('info', 'System Restored', 'Initial system dataset loaded.');
  };

  // 12. Global Search for Band Reference
  const findBandRecord = (code: string) => {
    const normalized = code.toUpperCase().replace(/\s+/g, '').trim();
    const band = bands.find((b) => b.referenceCode.replace(/\s+/g, '').toUpperCase() === normalized);
    const child = band?.childId ? childrenRecords.find((c) => c.id === band.childId) : undefined;
    const subscription = child?.subscriptionId ? subscriptions.find((s) => s.id === child.subscriptionId) : undefined;
    const vendor = band?.vendorId ? vendors.find((v) => v.id === band.vendorId) : undefined;
    const matchedIncidents = incidents.filter((i) => i.bandReference.replace(/\s+/g, '').toUpperCase() === normalized);

    return {
      band,
      child,
      subscription,
      vendor,
      incidents: matchedIncidents,
    };
  };

  return (
    <AppContext.Provider
      value={{
        vendors,
        activeVendors,
        plans,
        activePlans,
        bands,
        childrenRecords,
        subscriptions,
        registrations,
        payments,
        commissions,
        payouts,
        incidents,
        enquiries,
        activity,
        settings,
        isAdminLoggedIn,
        adminUser,
        toasts,
        loginAdmin,
        logoutAdmin,
        addToast,
        removeToast,
        submitPublicRegistration,
        updateRegistrationStatus,
        addVendor,
        updateVendor,
        toggleVendorActive,
        assignBandToChild,
        updateBandStatus,
        markBandLost,
        replaceBand,
        addBandToInventory,
        updateChildRecord,
        addPlan,
        updatePlan,
        togglePlanActive,
        updateCustomerSubscriptionPrice,
        renewSubscription,
        sendRenewalReminder,
        directSubscribeWithCard,
        verifyPayment,
        reversePayment,
        approveCommission,
        createSimulatedPayout,
        logIncident,
        submitPublicFoundReport,
        addContactAttempt,
        updateIncidentStatus,
        resolveIncident,
        submitPublicEnquiry,
        updateEnquiryStatus,
        updateSettings,
        resetDemoData,
        findBandRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
