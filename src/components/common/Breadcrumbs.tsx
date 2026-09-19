import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const homePath = isAdmin ? '/admin' : '/';

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-content-muted ${className}`}>
      <ol className="flex items-center space-x-1.5 sm:space-x-2">
        <li>
          <Link
            to={homePath}
            className="text-slate-500 hover:text-navy transition-colors flex items-center gap-1 font-medium"
            title={isAdmin ? "Admin Overview" : "Website Home"}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">{isAdmin ? 'Admin Overview' : 'Home'}</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1 sm:space-x-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {item.to && !isLast ? (
                <Link to={item.to} className="text-content-muted hover:text-navy transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-navy truncate max-w-[200px]" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
