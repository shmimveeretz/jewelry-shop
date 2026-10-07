import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Several dialogs can be open at once (product modal over the cart drawer),
// so the page scroll lock is reference counted.
let openDialogs = 0;
let savedOverflow = "";

/**
 * Behaviour every modal/drawer needs for keyboard and screen-reader users:
 * - Escape closes it
 * - focus moves inside on open, stays trapped there, and returns to the
 *   element that opened it on close
 * - the page behind does not scroll
 *
 * Returns a ref to put on the dialog container.
 */
export function useDialog(isOpen, onClose) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;

    const opener = document.activeElement;
    const container = containerRef.current;

    if (openDialogs === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openDialogs += 1;

    // Focus the first control, or the container itself
    const focusables = container?.querySelectorAll(FOCUSABLE);
    if (focusables && focusables.length > 0) {
      focusables[0].focus({ preventScroll: true });
    } else {
      container?.focus({ preventScroll: true });
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !container) return;

      const items = [...container.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container?.addEventListener("keydown", handleKeyDown);

    return () => {
      container?.removeEventListener("keydown", handleKeyDown);
      openDialogs = Math.max(openDialogs - 1, 0);
      if (openDialogs === 0) {
        document.body.style.overflow = savedOverflow;
      }
      if (opener && typeof opener.focus === "function" && document.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return containerRef;
}
