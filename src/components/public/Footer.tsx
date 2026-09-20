import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useApp } from '../../context/AppContext';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-navy text-white pt-16 pb-12 border-t-4 border-mint">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/15">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-base text-slate-300 font-medium max-w-sm">
              Helping people and families stay connected.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              We 4 You provides simple safety identification wristbands paired with a dedicated 24/7 central office contact service so caring people and responders can reach emergency contacts quickly and calmly.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <img
                src="/logo-we4u-dark-transparent.png"
                alt="WE4U - Connect Verify Empower"
                className="h-10 w-auto object-contain opacity-95"
              />
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-mint">
              <ShieldCheck className="w-4 h-4 text-mint flex-shrink-0" />
              <span>Physical ID Band &bull; No GPS &bull; Private Office Intermediary</span>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-sm font-heading font-semibold uppercase tracking-wider text-mint mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/" className="hover:text-mint transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-mint transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-mint transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/subscriptions" className="hover:text-mint transition-colors">Subscriptions</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-mint transition-colors font-medium">Register a Band</Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-sm font-heading font-semibold uppercase tracking-wider text-mint mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/found-band" className="hover:text-mint transition-colors font-medium text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  Found a Band?
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-mint transition-colors">Contact Our Office</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-mint transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-mint transition-colors">Privacy Notice (Draft)</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-mint transition-colors">Service Terms (Draft)</Link>
              </li>
            </ul>
          </div>

          {/* Office Contact Info */}
          <div>
            <h4 className="text-sm font-heading font-semibold uppercase tracking-wider text-mint mb-4">
              Our Office
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">{settings.officePhone}</span>
                  <span className="text-slate-400">Assistance & Registration</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{settings.officeEmail}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{settings.officeAddress}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{settings.officeHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Copyright & Discreet Admin Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} We 4 You. All rights reserved. Helping families stay connected.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-slate-500">Frontend Preview Demonstration</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-mint transition-colors border border-white/10 px-2.5 py-1 rounded bg-white/5"
              title="Demonstration Administrative Dashboard"
            >
              <Lock className="w-3 h-3 text-mint" />
              <span>Staff Demo Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
