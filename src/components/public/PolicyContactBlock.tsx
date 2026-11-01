import React from 'react';
import { Building2, Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PolicyContactBlock: React.FC = () => {
  const { settings } = useApp();

  const officeEmail = settings.officeEmail || 'support@we4you-contact.org';
  const officePhone = settings.officePhone || '+1 (800) 555-WE4U';
  const officeHours = settings.officeHours || 'Monday – Friday, 8:00 AM – 6:00 PM';

  return (
    <div className="mt-12 pt-10 border-t border-border-subtle">
      <div className="bg-slate-50 border border-slate-200/90 rounded-brand-lg p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-brand bg-navy text-white flex items-center justify-center">
                <Building2 className="w-4 h-4 text-mint" />
              </span>
              <div>
                <h3 className="text-lg font-heading font-bold text-navy">
                  WE 4 U (PVT) LTD
                </h3>
                <p className="text-xs font-mono text-content-muted">
                  Company Registration No. PV 00379002
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-content-body max-w-xl leading-relaxed pt-1">
              Have questions regarding our policies, your order, or the guardian contact registry? Our support desk is here to assist you.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-mint-darker bg-mint-pale border border-emerald-300/40 px-3 py-1.5 rounded-full font-medium flex-shrink-0 self-start">
            <ShieldCheck className="w-4 h-4 text-[#088F5B]" />
            <span>Sri Lanka Registered Company</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 text-xs sm:text-sm">
          {/* Registered Address */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block">
                Registered Address
              </span>
              <p className="text-navy font-medium mt-0.5 leading-snug">
                No 21, Somasundram Avenue, Chundikuli, Jaffna, Sri Lanka
              </p>
            </div>
          </div>

          {/* Email Address */}
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block">
                Customer &amp; Legal Inquiries
              </span>
              <a
                href={`mailto:${officeEmail}`}
                className="text-navy font-semibold hover:text-[#088F5B] hover:underline mt-0.5 block break-all"
              >
                {officeEmail}
              </a>
              <span className="text-[11px] text-content-muted">Direct office inbox</span>
            </div>
          </div>

          {/* Phone Contact */}
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block">
                Assistance &amp; Orders
              </span>
              <a
                href={`tel:${officePhone.replace(/[^0-9+]/g, '')}`}
                className="text-navy font-semibold hover:text-[#088F5B] hover:underline mt-0.5 block"
              >
                {officePhone}
              </a>
              <span className="text-[11px] text-content-muted">Central telephone hotline</span>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block">
                Operating Hours
              </span>
              <p className="text-navy font-medium mt-0.5 leading-snug">
                {officeHours}
              </p>
              <span className="text-[11px] text-content-muted">Standard business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
