import React, { createContext, useContext, useState, useEffect } from 'react';
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
  AppActivity,
  AppSettings,
  RegistrationStatus,
  ContactAttempt,
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
  submitPublicRegistration: (data: Omit<Registration, 'id' | 'referenceNumber' | 'submissionDate' | 'status' | 'paymentStatus' | 'timeline'>) => Registration;
  updateRegistrationStatus: (id: string, status: RegistrationStatus, reason?: string) => void;

  // Vendor workflows
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Vendor;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  toggleVendorActive: (id: string) => void;

  // Band workflows
  assignBandToChild: (bandCode: string, childId: string) => boolean;
  replaceBand: (childId: string, oldBandCode: string, newBandCode: string, reason: string) => boolean;
  addBandToInventory: (code: string) => Band;

  // Child and Guardian workflows
  updateChildRecord: (childId: string, updates: Partial<ChildRecord>) => void;

  // Plan & Subscription workflows
  updatePlan: (id: string, updates: Partial<SubscriptionPlan>) => void;
  renewSubscription: (subscriptionId: string, monthsToAdd: number) => void;

  // Payments workflows
  verifyPayment: (paymentId: string) => void;
  reversePayment: (paymentId: string, reason: string) => void;

  // Commission & Payout workflows
  approveCommission: (commissionId: string) => void;
  createSimulatedPayout: (vendorId: string, commissionIds: string[], notes?: string) => Payout | null;

  // Incident workflows
  logIncident: (data: Omit<Incident, 'id' | 'incidentRef' | 'createdAt' | 'attempts' | 'status'>) => Incident;
  addContactAttempt: (incidentId: string, attempt: Omit<ContactAttempt, 'id' | 'timestamp' | 'staffName'>) => void;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In-memory state with session recovery
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = sessionStorage.getItem('we4u_vendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = sessionStorage.getItem('we4u_plans');
    return saved ? JSON.parse(saved) : initialPlans;
  });

  const [bands, setBands] = useState<Band[]>(() => {
    const saved = sessionStorage.getItem('we4u_bands');
    return saved ? JSON.parse(saved) : initialBands;
  });

  const [childrenRecords, setChildrenRecords] = useState<ChildRecord[]>(() => {
    const saved = sessionStorage.getItem('we4u_children');
    return saved ? JSON.parse(saved) : initialChildren;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = sessionStorage.getItem('we4u_subscriptions');
    return saved ? JSON.parse(saved) : initialSubscriptions;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = sessionStorage.getItem('we4u_registrations');
    return saved ? JSON.parse(saved) : initialRegistrations;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = sessionStorage.getItem('we4u_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [commissions, setCommissions] = useState<Commission[]>(() => {
    const saved = sessionStorage.getItem('we4u_commissions');
    return saved ? JSON.parse(saved) : initialCommissions;
  });

  const [payouts, setPayouts] = useState<Payout[]>(() => {
    const saved = sessionStorage.getItem('we4u_payouts');
    return saved ? JSON.parse(saved) : initialPayouts;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = sessionStorage.getItem('we4u_incidents');
    return saved ? JSON.parse(saved) : initialIncidents;
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const saved = sessionStorage.getItem('we4u_enquiries');
    return saved ? JSON.parse(saved) : initialEnquiries;
  });

  const [activity, setActivity] = useState<AppActivity[]>(() => {
    const saved = sessionStorage.getItem('we4u_activity');
    return saved ? JSON.parse(saved) : initialActivity;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = sessionStorage.getItem('we4u_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('we4u_admin_auth') === 'true';
  });

  const [adminUser, setAdminUser] = useState<string>('Demo Admin Staff (Coordinator)');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('we4u_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    sessionStorage.setItem('we4u_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    sessionStorage.setItem('we4u_bands', JSON.stringify(bands));
  }, [bands]);

  useEffect(() => {
    sessionStorage.setItem('we4u_children', JSON.stringify(childrenRecords));
  }, [childrenRecords]);

  useEffect(() => {
    sessionStorage.setItem('we4u_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    sessionStorage.setItem('we4u_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    sessionStorage.setItem('we4u_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    sessionStorage.setItem('we4u_commissions', JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    sessionStorage.setItem('we4u_payouts', JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    sessionStorage.setItem('we4u_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    sessionStorage.setItem('we4u_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    sessionStorage.setItem('we4u_activity', JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
    sessionStorage.setItem('we4u_settings', JSON.stringify(settings));
  }, [settings]);

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
  const loginAdmin = (username = 'Demo Coordinator (Staff)') => {
    setIsAdminLoggedIn(true);
    setAdminUser(username);
    sessionStorage.setItem('we4u_admin_auth', 'true');
    addToast('success', 'Admin Demonstration Mode', 'Signed in as demonstration administrator.');
    logAction('Admin Sign-In', `Signed in as ${username}.`, 'settings', 'AUTH');
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('we4u_admin_auth');
    addToast('info', 'Signed Out', 'Exited demonstration admin dashboard.');
  };

  // 1. Submit Public Registration
  const submitPublicRegistration = (
    data: Omit<Registration, 'id' | 'referenceNumber' | 'submissionDate' | 'status' | 'paymentStatus' | 'timeline'>
  ): Registration => {
    const count = registrations.length + 183;
    const refNumber = `REG-2026-0${count}`;
    const newReg: Registration = {
      ...data,
      id: refNumber,
      referenceNumber: refNumber,
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending_verification',
      paymentStatus: 'pending',
      timeline: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Applicant',
          action: 'Registration submitted online',
          notes: 'Awaiting office document verification and subscription payment confirmation.',
        },
      ],
    };

    setRegistrations((prev) => [newReg, ...prev]);

    // Create a pending payment fixture linked to this registration
    const selectedPlan = plans.find((p) => p.id === data.planId);
    const payRef = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPay: Payment = {
      id: `PAY-${Date.now()}`,
      receiptRef: payRef,
      type: 'subscription',
      amount: selectedPlan?.priceAmount || 29.0,
      currency: 'USD',
      status: 'pending',
      paymentDate: new Date().toISOString().substring(0, 10),
      registrationId: refNumber,
      payerName: data.guardian.fullName,
      notes: 'Registration submitted; awaiting manual bank/store confirmation.',
    };
    setPayments((prev) => [newPay, ...prev]);

    // Log Activity
    logAction(
      'Registration Received',
      `New registration ${refNumber} received for child "${data.child.name}".`,
      'registration',
      refNumber,
      'Applicant (Public Web)'
    );

    addToast('success', 'Registration Submitted', `Reference ${refNumber} created for review.`);
    return newReg;
  };

  // 2. Update Registration Status (Approve, Reject, Request Info)
  const updateRegistrationStatus = (id: string, status: RegistrationStatus, reason?: string) => {
    const reg = registrations.find((r) => r.id === id);
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
        notes: reason || (status === 'approved' ? 'All guardian and band credentials verified.' : ''),
      },
    ];

    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, statusReason: reason, verifiedBy: adminUser, verifiedAt: timestamp, timeline: updatedTimeline } : r))
    );

    // If approved, create official Child Record, activate Band, and create Subscription & Commission
    if (status === 'approved') {
      const childId = `CHD-00${childrenRecords.length + 1}`;
      const subId = `SUB-00${subscriptions.length + 1}`;
      const selectedPlan = plans.find((p) => p.id === reg.planId);
      const duration = selectedPlan?.durationMonths || 12;

      const startDate = new Date().toISOString().substring(0, 10);
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + duration);
      const expiryDate = expiry.toISOString().substring(0, 10);

      // Create Child Record
      const newChild: ChildRecord = {
        id: childId,
        name: reg.child.name,
        ageRange: reg.child.ageRange || 'Not specified',
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

      // Create Subscription
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

      // Update Band status to 'assigned'
      setBands((prev) =>
        prev.map((b) =>
          b.referenceCode.toUpperCase() === reg.bandCode.toUpperCase()
            ? { ...b, status: 'assigned', childId, vendorId: reg.vendorId, assignedDate: startDate }
            : b
        )
      );

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
      }

      addToast('success', 'Registration Approved', `Child ${reg.child.name} is now protected with band ${reg.bandCode}.`);
      logAction('Registration Approved', `Approved registration ${reg.referenceNumber} for child ${reg.child.name}.`, 'registration', reg.referenceNumber);
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
    setVendors((prev) => [newVendor, ...prev]);
    logAction('Vendor Created', `Created vendor shop "${newVendor.shopName} - ${newVendor.branch}".`, 'vendor', id);
    addToast('success', 'Vendor Created', `"${newVendor.shopName}" is now available for registration.`);
    return newVendor;
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    logAction('Vendor Updated', `Updated profile for vendor ${id}.`, 'vendor', id);
    addToast('success', 'Vendor Updated', 'Shop details have been updated.');
  };

  const toggleVendorActive = (id: string) => {
    const target = vendors.find((v) => v.id === id);
    if (!target) return;
    const nextState = !target.isActive;
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: nextState } : v))
    );
    const actionText = nextState ? 'Activated' : 'Deactivated';
    logAction('Vendor Status Toggled', `${actionText} vendor "${target.shopName} - ${target.branch}".`, 'vendor', id);
    addToast(
      nextState ? 'success' : 'warning',
      `Vendor ${actionText}`,
      nextState
        ? `"${target.shopName}" now appears in the public registration dropdown.`
        : `"${target.shopName}" is now hidden from new public registrations.`
    );
  };

  // 4. Band Handlers
  const assignBandToChild = (bandCode: string, childId: string): boolean => {
    const band = bands.find((b) => b.referenceCode.toUpperCase() === bandCode.toUpperCase());
    if (!band || band.status !== 'available') return false;

    setBands((prev) =>
      prev.map((b) =>
        b.id === band.id
          ? { ...b, status: 'assigned', childId, assignedDate: new Date().toISOString().substring(0, 10) }
          : b
      )
    );
    setChildrenRecords((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, currentBandCode: band.referenceCode } : c))
    );
    logAction('Band Assigned', `Assigned band ${band.referenceCode} to child ${childId}.`, 'band', band.id);
    return true;
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

    // 2. Update Child Record with new band while preserving subscription and history
    setChildrenRecords((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, currentBandCode: newBand.referenceCode } : c))
    );

    logAction(
      'Band Replaced',
      `Replaced band ${oldBandCode} with ${newBand.referenceCode} for child ${childId}. Reason: ${reason}`,
      'band',
      newBand.id
    );
    addToast('success', 'Band Replaced', `Old band ${oldBandCode} retired; new band ${newBand.referenceCode} assigned.`);
    return true;
  };

  const addBandToInventory = (code: string): Band => {
    const id = `BND-00${bands.length + 1}`;
    const newBand: Band = {
      id,
      referenceCode: code.toUpperCase().trim(),
      status: 'available',
    };
    setBands((prev) => [...prev, newBand]);
    logAction('Band Added', `Added band ${code} to available inventory.`, 'band', id);
    addToast('success', 'Band Added', `${code} is now available in inventory.`);
    return newBand;
  };

  // 5. Child and Guardian Profile updates
  const updateChildRecord = (childId: string, updates: Partial<ChildRecord>) => {
    setChildrenRecords((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, ...updates } : c))
    );
    logAction('Child Profile Updated', `Updated record details for child ${childId}.`, 'child', childId);
    addToast('success', 'Record Updated', 'Child and guardian details updated successfully.');
  };

  // 6. Plan & Subscription Handlers
  const updatePlan = (id: string, updates: Partial<SubscriptionPlan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    logAction('Plan Configured', `Updated subscription plan ${id}.`, 'plan', id);
    addToast('success', 'Plan Updated', 'Subscription plan configuration saved.');
  };

  const renewSubscription = (subscriptionId: string, monthsToAdd: number) => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return;

    // Early renewal extends from existing expiry; late renewal starts from today
    const currentExpiry = new Date(sub.expiryDate);
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
    const newExpiry = baseDate.toISOString().substring(0, 10);

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId
          ? {
              ...s,
              expiryDate: newExpiry,
              status: 'active',
              renewalCount: s.renewalCount + 1,
            }
          : s
      )
    );

    // Create payment receipt for renewal
    const newPay: Payment = {
      id: `PAY-REN-${Date.now()}`,
      receiptRef: `REC-REN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'subscription',
      amount: monthsToAdd === 24 ? 49.0 : 29.0,
      currency: 'USD',
      status: 'verified',
      paymentDate: new Date().toISOString().substring(0, 10),
      childId: sub.childId,
      payerName: 'Guardian Renewal',
      notes: `Simulated subscription renewal extended by ${monthsToAdd} months.`,
    };
    setPayments((prev) => [newPay, ...prev]);

    logAction('Subscription Renewed', `Renewed subscription ${subscriptionId} until ${newExpiry}.`, 'payment', subscriptionId);
    addToast('success', 'Subscription Renewed', `Coverage extended to ${newExpiry}.`);
  };

  // 7. Payment Verification Handlers
  const verifyPayment = (paymentId: string) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay || pay.status === 'verified') return;

    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'verified' } : p))
    );

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

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'contacting_guardian',
              attempts: [...inc.attempts, newAttempt],
            }
          : inc
      )
    );

    logAction(
      'Contact Attempt Recorded',
      `Recorded ${attempt.method.replace('_', ' ')} attempt for incident ${incidentId}.`,
      'incident',
      incidentId
    );
    addToast('info', 'Attempt Logged', 'Contact attempt saved to incident history.');
  };

  const resolveIncident = (incidentId: string, outcomeSummary: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'resolved',
              resolvedAt: timestamp,
              outcomeSummary,
            }
          : inc
      )
    );
    logAction('Incident Resolved', `Incident ${incidentId} resolved: "${outcomeSummary}".`, 'incident', incidentId);
    addToast('success', 'Incident Resolved', 'Incident marked resolved with recorded outcome.');
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
    sessionStorage.clear();
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
    addToast('info', 'Demo Reset', 'All demonstration data restored to initial state.');
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
        replaceBand,
        addBandToInventory,
        updateChildRecord,
        updatePlan,
        renewSubscription,
        verifyPayment,
        reversePayment,
        approveCommission,
        createSimulatedPayout,
        logIncident,
        addContactAttempt,
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
