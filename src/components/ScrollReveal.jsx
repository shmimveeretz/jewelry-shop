import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fades storefront sections in as they scroll into view.
 *
 * Works on plain markup: every <section> inside .main-content gets the
 * `reveal` class and is revealed once it enters the viewport, so pages need no
 * changes. Card animations inside a section (fadeInUp with a stagger) are
 * paused by CSS until the section is revealed, so they play when the visitor
 * actually reaches them instead of off-screen on page load.
 *
 * Opt out per element with `data-no-reveal`. Only browsing pages animate;
 * forms and transactional pages (cart, checkout, login, admin…) never hide
 * content behind a scroll.
 * Hidden styles only apply under `html.reveal-ready`, which is never set for
 * visitors who prefer reduced motion — content is never hidden without JS.
 */
const REVEAL_ROUTES = new Set(["/", "/shop", "/about", "/zodiac"]);
const SECTION_SELECTOR = ".main-content section:not(.hero):not([data-no-reveal])";

function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const skip =
      !REVEAL_ROUTES.has(pathname) ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (skip) {
      root.classList.remove("reveal-ready");
      return undefined;
    }

    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      // A fixed margin rather than a ratio threshold: sections can be much
      // taller than the viewport, and a ratio would leave the screen blank.
      { rootMargin: "0px 0px -60px 0px", threshold: 0 },
    );

    const register = () => {
      document.querySelectorAll(SECTION_SELECTOR).forEach((el) => {
        if (el.classList.contains("is-revealed")) return;
        // Re-observing is a no-op, and it also picks up a section that
        // survived a route change after the previous observer was dropped.
        el.classList.add("reveal");
        observer.observe(el);
      });
    };

    register();

    // Pages are lazy-loaded and fetch their data, so sections keep arriving
    // after the route changes.
    const main = document.querySelector(".main-content");
    const mutations = main ? new MutationObserver(register) : null;
    mutations?.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations?.disconnect();
    };
  }, [pathname]);

  return null;
}

export default ScrollReveal;
