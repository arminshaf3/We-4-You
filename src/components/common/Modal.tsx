import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const TEXT_FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
].join(', ');

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isOpenRef = useRef(isOpen);

  onCloseRef.current = onClose;
  isOpenRef.current = isOpen;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the first text field once, when the dialog opens.
    // Skip if the user has already clicked a field inside the dialog.
    const focusTimer = window.setTimeout(() => {
      const root = modalRef.current;
      if (!root) return;
      const active = document.activeElement;
      if (active instanceof HTMLElement && root.contains(active) && active !== root) {
        return;
      }
      const field = root.querySelector<HTMLElement>(TEXT_FIELD_SELECTOR);
      if (field) {
        field.focus();
      } else {
        root.focus();
      }
    }, 0);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusables = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;

      // Restore the opener only when the dialog is actually closing.
      // Re-running this while it is still open pulls the caret out of the field.
      if (!isOpenRef.current && previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col bg-white rounded-brand-lg shadow-floating border border-border-subtle p-5 sm:p-7 z-10 my-auto`}
      >
        <div className="flex items-start justify-between gap-4 pb-3 sm:pb-4 border-b border-border-subtle flex-shrink-0">
          <div>
            <h3 id="modal-title" className="text-lg sm:text-xl font-heading font-bold text-navy">
              {title}
            </h3>
            {description && (
              <p className="text-xs sm:text-sm text-content-muted mt-0.5 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 -mr-1.5 text-content-muted hover:text-navy hover:bg-neutral-soft rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
