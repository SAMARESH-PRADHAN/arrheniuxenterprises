import { useEffect, useRef } from "react";

type RevealOptions = {
  /** Animation variant applied on scroll-into-view */
  variant?: "up" | "down" | "left" | "right" | "zoom" | "fade";
  /** Delay in ms before the animation starts (good for staggering) */
  delay?: number;
  /** Only trigger once (default true) or every time it enters view */
  once?: boolean;
  /** How much of the element must be visible before triggering (0–1) */
  threshold?: number;
};

/**
 * Attach to any element via `ref` + `className="reveal reveal-{variant}"`.
 * Adds `.is-visible` once the element scrolls into view, which the
 * matching CSS in index.css animates in.
 */
export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const { delay = 0, once = true, threshold = 0.15 } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = window.setTimeout(() => {
            el.classList.add("is-visible");
          }, delay);
          if (once) obs.unobserve(el);
          return () => window.clearTimeout(timer);
        } else if (!once) {
          el.classList.remove("is-visible");
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, once, threshold]);

  return ref;
}

/**
 * Helper for staggering a list of items: returns a delay (ms) per index.
 * Usage: style={{ transitionDelay: `${staggerDelay(i)}ms` }}
 */
export const staggerDelay = (index: number, step = 90, max = 600) =>
  Math.min(index * step, max);