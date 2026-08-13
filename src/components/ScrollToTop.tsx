import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    const forceTop = () => {
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceTop();
    const frame = window.requestAnimationFrame(forceTop);
    const timeout = window.setTimeout(forceTop, 120);
    const restoreTimeout = window.setTimeout(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    }, 160);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.clearTimeout(restoreTimeout);
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
