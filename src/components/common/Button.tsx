import React from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'mint' | 'outline' | 'outline-white' | 'ghost' | 'danger' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButtonProps extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  to?: undefined;
  href?: undefined;
}

interface ButtonAsLinkProps extends ButtonBaseProps {
  to: string;
  href?: undefined;
  disabled?: boolean;
}

interface ButtonAsExternalProps extends ButtonBaseProps {
  href: string;
  to?: undefined;
  target?: string;
  rel?: string;
  disabled?: boolean;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps | ButtonAsExternalProps;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-heading font-medium rounded-brand transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer select-none whitespace-nowrap';

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm gap-1.5 min-w-[36px]',
    md: 'h-12 px-5 text-base gap-2 min-h-[48px]', // Meets minimum ~48px touch target
    lg: 'h-14 px-7 text-lg gap-2.5 min-h-[56px]',
  };

  const variantClasses = {
    primary:
      'bg-navy text-white hover:bg-navy-light focus-visible:ring-navy shadow-sm hover:shadow',
    mint:
      'bg-mint text-navy font-semibold hover:brightness-105 focus-visible:ring-mint shadow-sm hover:shadow',
    white:
      'bg-white text-navy font-bold hover:bg-slate-100 focus-visible:ring-white shadow-lg hover:shadow-xl',
    outline:
      'border-2 border-navy text-navy hover:bg-navy/5 focus-visible:ring-navy',
    'outline-white':
      'border-2 border-white text-white font-semibold hover:bg-white/15 focus-visible:ring-white backdrop-blur-sm',
    ghost:
      'text-navy hover:bg-neutral-soft focus-visible:ring-navy',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );

  if ('to' in rest && rest.to) {
    const { to, disabled, ...linkProps } = rest;
    if (disabled) {
      return <span className={`${classes} opacity-50 cursor-not-allowed`}>{content}</span>;
    }
    return (
      <Link to={to} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, target, rel, disabled, ...aProps } = rest;
    if (disabled) {
      return <span className={`${classes} opacity-50 cursor-not-allowed`}>{content}</span>;
    }
    return (
      <a href={href} target={target} rel={rel} className={classes} {...aProps}>
        {content}
      </a>
    );
  }

  const { disabled, ...btnProps } = rest as ButtonAsButtonProps;
  return (
    <button disabled={disabled || isLoading} className={classes} {...btnProps}>
      {content}
    </button>
  );
};
