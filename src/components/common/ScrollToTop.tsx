import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls the window to the top (0,0)
 * whenever the route (pathname or search parameters) changes.
 * Supports smooth scrolling to specific element IDs when a hash (e.g. #contact) is present.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // Instant reset to the top of the viewport
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      if (document.body) {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    } else {
      // Smooth scroll to targeted anchor element if hash is present
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
