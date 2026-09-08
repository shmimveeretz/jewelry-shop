import { useEffect } from "react";

/**
 * Arms the trigger for one popup and calls `onFire` at most once.
 *
 * Every listener is passive and torn down on unmount, so an armed popup that
 * never fires costs nothing measurable — which matters because this runs on
 * every page of the site, not just campaign pages.
 */
export function useTrigger(popup, onFire) {
  useEffect(() => {
    if (!popup) return undefined;

    const { type, delayMs = 5000, scrollPercent = 50 } = popup.trigger || {};

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      onFire();
    };

    const cleanups = [];

    const addListener = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    };

    const addTimer = (handler, ms) => {
      const id = setTimeout(handler, ms);
      cleanups.push(() => clearTimeout(id));
    };

    switch (type) {
      case "immediate":
        fire();
        break;

      case "timeDelay":
        addTimer(fire, delayMs);
        break;

      case "scrollDepth": {
        const check = () => {
          const scrollable =
            document.documentElement.scrollHeight - window.innerHeight;
          if (scrollable <= 0) return;
          const depth = (window.scrollY / scrollable) * 100;
          if (depth >= scrollPercent) fire();
        };
        addListener(window, "scroll", check, { passive: true });
        check();
        break;
      }

      case "exitIntent": {
        // Desktop: the cursor leaving through the top of the viewport.
        const onMouseOut = (event) => {
          if (event.clientY <= 0 && !event.relatedTarget) fire();
        };
        addListener(document, "mouseout", onMouseOut);

        // Mobile has no cursor, so the equivalent signal is a back-navigation
        // attempt. A pushed history entry lets popstate stand in for it.
        const onPopState = () => fire();
        window.history.pushState({ popupGuard: true }, "");
        addListener(window, "popstate", onPopState);
        cleanups.push(() => {
          if (window.history.state?.popupGuard) window.history.back();
        });
        break;
      }

      case "idle": {
        let timer = setTimeout(fire, delayMs);
        const reset = () => {
          clearTimeout(timer);
          timer = setTimeout(fire, delayMs);
        };
        ["mousemove", "keydown", "scroll", "touchstart"].forEach((event) =>
          addListener(window, event, reset, { passive: true }),
        );
        cleanups.push(() => clearTimeout(timer));
        break;
      }

      case "onCtaAbandon": {
        // Fires when the primary CTA has been on screen and then scrolled
        // past without a click — the visitor read the offer and moved on.
        const target = document.querySelector("[data-dpp-cta]");
        if (!target) break;

        let wasVisible = false;
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            wasVisible = true;
          } else if (wasVisible) {
            fire();
          }
        });
        observer.observe(target);
        cleanups.push(() => observer.disconnect());
        break;
      }

      default:
        addTimer(fire, delayMs);
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [popup, onFire]);
}
