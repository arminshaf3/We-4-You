import React from 'react';

interface SectionIntroProps {
  badge?: string;
  heading: string;
  paragraph?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionIntro: React.FC<SectionIntroProps> = ({
  badge,
  heading,
  paragraph,
  align = 'center',
  className = '',
}) => {
  const isCenter = align === 'center';

  return (
    <div className={`max-w-2xl ${isCenter ? 'mx-auto text-center' : 'text-left'} mb-10 sm:mb-14 ${className}`}>
      {badge && (
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-[42px] font-heading font-bold text-navy leading-tight tracking-tight">
        {heading}
      </h2>
      {paragraph && (
        <p className="text-base sm:text-lg text-content-body mt-3 sm:mt-4 leading-relaxed font-body">
          {paragraph}
        </p>
      )}
    </div>
  );
};
