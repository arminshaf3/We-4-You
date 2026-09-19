import React from 'react';

interface FormFieldProps {
  label: string;
  id?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  hint,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-navy flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold" title="Required">*</span>}
      </label>
      
      {children}

      {hint && !error && (
        <p className="text-xs text-content-muted leading-normal">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1" role="alert">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-12 px-4 text-base rounded-brand border bg-white text-content-body transition-colors
          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:bg-slate-100 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-border-subtle hover:border-slate-300 focus:border-navy focus:ring-mint/40'}
          ${className}
        `}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full h-12 px-4 text-base rounded-brand border bg-white text-content-body transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-border-subtle hover:border-slate-300 focus:border-navy focus:ring-mint/40'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full p-4 text-base rounded-brand border bg-white text-content-body transition-colors
          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:bg-slate-100 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-border-subtle hover:border-slate-300 focus:border-navy focus:ring-mint/40'}
          ${className}
        `}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
