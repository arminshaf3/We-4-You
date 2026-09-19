import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'dark' | 'light' | 'crest' | 'mint';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showWordmark = true,
  className = '',
  to = '/',
}) => {
  const [imgError, setImgError] = useState(false);

  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const getLogoSrc = () => {
    switch (variant) {
      case 'light':
        return '/logo-we4you-light-transparent.png';
      case 'crest':
        return '/logo-we4u-dark-transparent.png';
      case 'mint':
        return '/logo-we4you-mint-tight.png';
      case 'dark':
      default:
        return '/logo-we4you-transparent.png';
    }
  };

  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imgError ? (
        <img
          src={getLogoSrc()}
          alt="We 4 You"
          onError={() => setImgError(true)}
          className={`${heightClasses[size]} w-auto object-contain transition-transform hover:scale-[1.02]`}
          loading="eager"
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-mint font-bold font-mono text-sm border border-mint/30">
            W4
          </div>
          {showWordmark && (
            <span
              className={`font-heading font-bold tracking-tight ${
                variant === 'light' || variant === 'crest' ? 'text-white' : 'text-navy'
              }`}
            >
              We <span className="text-mint font-extrabold">4</span> You
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-mint rounded-brand-sm inline-block"
      >
        {content}
      </Link>
    );
  }

  return content;
};
