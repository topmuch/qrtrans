'use client';

import { useEffect, useState } from 'react';

/**
 * Hook that observes elements with `.reveal-up` / `.reveal-scale` classes
 * and toggles `.is-visible` when they enter the viewport.
 * Plug once per page that needs scroll-reveal animations.
 */
export default function useScrollReveal() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = document.querySelectorAll('.reveal-up, .reveal-scale');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ready;
}
