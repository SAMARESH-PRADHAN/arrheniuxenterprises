import { useEffect, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { BrandLoader } from "./BrandLoader";

/**
 * Route transition loader — shows the branded (logo) loader briefly on
 * every navigation, plus a top progress bar for continuity.
 */
export const RouteLoader = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const [active, setActive] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    setActive(true);
    setProgress(15);
    const t1 = setTimeout(() => setProgress(65), 80);
    const t2 = setTimeout(() => setProgress(92), 260);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setActive(false), 260);
    }, 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, navType]);

  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[201] h-[3px] pointer-events-none"
        style={{ opacity: active ? 1 : 0, transition: "opacity 300ms ease" }}
      >
        <div
          className="h-full bg-gradient-to-r from-accent via-primary to-accent shadow-[0_0_12px_hsl(var(--accent))]"
          style={{
            width: `${progress}%`,
            transition: "width 260ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      {active && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md pointer-events-none animate-fade-in"
          aria-hidden={!active}
        >
          <BrandLoader label="Loading" size={88} />
        </div>
      )}
    </>
  );
};

export default RouteLoader;
