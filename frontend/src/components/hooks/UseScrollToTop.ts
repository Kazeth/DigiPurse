import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollStep = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 0) {
        window.scrollTo(0, currentScroll - 20); 
        requestAnimationFrame(scrollStep);
      }
    };
    requestAnimationFrame(scrollStep);
  }, [pathname]);

  return null;
}
