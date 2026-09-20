import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { Menu, X, PhoneCall } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useApp();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/subscriptions', label: 'Subscriptions' },
    { to: '/contact', label: 'Contact Us' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-subtle transition-all">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Logo variant="dark" size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-heading font-medium" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative py-2 text-content-body hover:text-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy rounded-sm ${
                  isActive ? 'text-navy font-semibold' : ''
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-mint rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/found-band"
            className="text-xs font-semibold text-navy bg-mint-pale hover:bg-mint/30 px-3.5 py-2 rounded-brand border border-emerald-300/40 transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            title="Found a child wearing our band?"
          >
            <PhoneCall className="w-3.5 h-3.5 text-navy" />
            <span>Found a Band?</span>
          </Link>

          <Button to="/register" variant="primary" size="md">
            Register a Band
          </Button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/found-band"
            className="text-xs font-semibold text-navy bg-mint-pale px-3 py-1.5 rounded-brand border border-emerald-300/40"
          >
            Found Band?
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2.5 text-navy hover:bg-neutral-soft rounded-brand border border-border-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-navy/40 backdrop-blur-sm z-50 flex flex-col justify-start">
          <div className="bg-white border-b border-border-subtle shadow-card p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col divide-y divide-border-subtle text-base font-heading font-medium">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `py-3.5 flex items-center justify-between text-content-body hover:text-navy ${
                      isActive ? 'text-navy font-semibold text-mint-darker' : ''
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-mint font-bold">→</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-3 flex flex-col gap-3">
              <Button to="/register" variant="primary" size="lg" className="w-full">
                Register a Band
              </Button>
              <Button to="/found-band" variant="mint" size="md" className="w-full">
                Found Band Assistance
              </Button>
            </div>

            <div className="pt-2 text-center text-xs text-content-muted">
              Office Phone: <span className="font-semibold text-navy">{settings.officePhone}</span>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
