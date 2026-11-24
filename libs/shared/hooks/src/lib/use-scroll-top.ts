'use client';
import { useState, useEffect } from 'react';

export const useScrollTop = (threshold = 300) => {
  const [stick, setStick] = useState(false);
  const onClickHandler = () => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const scrollHandler = () => setStick(window.scrollY > threshold);
    scrollHandler(); // correct state when the page loads already scrolled
    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [threshold]);

  return { stick, onClickHandler };
};

export default useScrollTop;
