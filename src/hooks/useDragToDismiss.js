import { useEffect, useRef } from "react";

/*
 * Drag-to-dismiss for sheets and drawers, built the way iOS sheets behave:
 * - the panel follows the finger 1:1 once a 10px slop picks the axis
 * - dragging the wrong way rubber-bands instead of hitting a wall
 * - on release, momentum is projected forward (Apple's deceleration formula)
 *   and the panel either dismisses or settles back from wherever it is
 * - the release animation's opening speed matches the finger's speed, so
 *   there is no seam between dragging and animating
 * - grabbing a panel mid-animation picks it up from its on-screen position
 *
 * The scrim follows through the registered --drag-progress custom property
 * (0 = fully open, 1 = fully dismissed).
 */

const DECELERATION = 0.998;
const SLOP = 10;
const VELOCITY_DECIDES = 400; // px/s — a clear flick wins over position
// --ease-drawer. Its first control point is (0.32, 0.72), so the curve leaves
// at 0.72 / 0.32 = 2.25× its average speed.
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const EASE_START_SLOPE = 0.72 / 0.32;

const project = (velocity) =>
  ((velocity / 1000) * DECELERATION) / (1 - DECELERATION);

const rubberband = (overshoot, dimension, constant = 0.55) =>
  (overshoot * dimension * constant) /
  (dimension + constant * Math.abs(overshoot));

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const IGNORE = "input, textarea, select, [data-no-drag]";

/**
 * @param {object} options
 * @param {React.RefObject<HTMLElement>} options.sheetRef  the moving panel
 * @param {React.RefObject<HTMLElement>} [options.scrimRef] receives --drag-progress
 * @param {"x"|"y"} options.axis
 * @param {1|-1} options.direction  sign of the dismiss direction on that axis
 * @param {string} [options.scrollSelector] inner scroller; a drag that starts
 *   inside it only moves the panel when it is scrolled to the top
 * @param {boolean} [options.enabled]
 * @param {() => void} options.onDismiss  unmount immediately (no exit animation)
 */
export function useDragToDismiss({
  sheetRef,
  scrimRef,
  axis,
  direction,
  scrollSelector,
  enabled = true,
  onDismiss,
}) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!enabled || !sheet) return undefined;

    let gesture = null;
    let settleTimer = 0;

    const size = () => (axis === "x" ? sheet.offsetWidth : sheet.offsetHeight);
    const along = (t) => (axis === "x" ? t.clientX : t.clientY);
    const across = (t) => (axis === "x" ? t.clientY : t.clientX);

    const render = (offset) => {
      const px = offset * direction;
      sheet.style.transform =
        axis === "x" ? `translate3d(${px}px, 0, 0)` : `translate3d(0, ${px}px, 0)`;
      const progress = Math.min(Math.max(offset / size(), 0), 1);
      scrimRef?.current?.style.setProperty("--drag-progress", String(progress));
    };

    // The panel's live position along the dismiss direction, even mid-animation
    const presentationOffset = () => {
      const transform = getComputedStyle(sheet).transform;
      if (!transform || transform === "none") return 0;
      const matrix = new DOMMatrixReadOnly(transform);
      return (axis === "x" ? matrix.m41 : matrix.m42) * direction;
    };

    const setTransition = (value) => {
      sheet.style.transition = value;
      if (scrimRef?.current) scrimRef.current.style.transition = value.replace(/transform/g, "--drag-progress");
    };

    const animateTo = (target, from, velocity, done) => {
      clearTimeout(settleTimer);
      if (reducedMotion()) {
        setTransition("none");
        render(target);
        done();
        return;
      }
      const distance = Math.abs(target - from);
      const speed = Math.abs(velocity);
      // Pick the duration whose opening speed equals the finger's speed
      const ms =
        speed > 0
          ? Math.min(Math.max(((EASE_START_SLOPE * distance) / speed) * 1000, 180), 420)
          : 340;
      setTransition(`transform ${ms}ms ${EASE}`);
      render(target);
      settleTimer = window.setTimeout(done, ms + 30);
    };

    const settled = () => {
      setTransition("");
      sheet.style.transform = "";
      scrimRef?.current?.style.removeProperty("--drag-progress");
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 1 || event.target.closest(IGNORE)) {
        gesture = null;
        return;
      }
      const touch = event.touches[0];
      gesture = {
        startAlong: along(touch),
        startAcross: across(touch),
        scroller: scrollSelector ? event.target.closest(scrollSelector) : null,
        claimed: false,
        base: 0,
        offset: 0,
        history: [],
      };
    };

    const onTouchMove = (event) => {
      if (!gesture) return;
      const touch = event.touches[0];
      const delta = (along(touch) - gesture.startAlong) * direction;

      if (!gesture.claimed) {
        const crossDelta = across(touch) - gesture.startAcross;
        if (Math.abs(delta) < SLOP && Math.abs(crossDelta) < SLOP) return;
        const wrongAxis = Math.abs(crossDelta) > Math.abs(delta);
        // Inside the scroller, only a pull toward dismissal from the very
        // top belongs to the panel; everything else is the user scrolling.
        const scrollerOwns =
          gesture.scroller && (delta < 0 || gesture.scroller.scrollTop > 0);
        if (wrongAxis || scrollerOwns) {
          gesture = null;
          return;
        }
        // Pick the panel up from where it is right now
        gesture.claimed = true;
        clearTimeout(settleTimer);
        gesture.base = presentationOffset();
        sheet.style.animation = "none";
        setTransition("none");
        gesture.startAlong = along(touch);
        render(gesture.base);
      }

      event.preventDefault();
      const raw = gesture.base + (along(touch) - gesture.startAlong) * direction;
      gesture.offset = raw < 0 ? rubberband(raw, size()) : raw;
      render(gesture.offset);

      const now = performance.now();
      gesture.history.push({ offset: raw, time: now });
      while (gesture.history.length > 2 && now - gesture.history[0].time > 100) {
        gesture.history.shift();
      }
    };

    const onTouchEnd = () => {
      const g = gesture;
      gesture = null;
      if (!g?.claimed) return;

      const first = g.history[0];
      const last = g.history[g.history.length - 1];
      const elapsed = last && first ? last.time - first.time : 0;
      const velocity = elapsed > 0 ? ((last.offset - first.offset) / elapsed) * 1000 : 0;

      const dimension = size();
      const dismiss =
        Math.abs(velocity) > VELOCITY_DECIDES
          ? velocity > 0
          : g.offset + project(velocity) > dimension / 2;

      if (dismiss) {
        if (navigator.vibrate) navigator.vibrate(8);
        animateTo(dimension, g.offset, velocity, () => onDismissRef.current?.());
      } else {
        animateTo(0, g.offset, velocity, settled);
      }
    };

    sheet.addEventListener("touchstart", onTouchStart, { passive: true });
    sheet.addEventListener("touchmove", onTouchMove, { passive: false });
    sheet.addEventListener("touchend", onTouchEnd);
    sheet.addEventListener("touchcancel", onTouchEnd);

    return () => {
      clearTimeout(settleTimer);
      sheet.removeEventListener("touchstart", onTouchStart);
      sheet.removeEventListener("touchmove", onTouchMove);
      sheet.removeEventListener("touchend", onTouchEnd);
      sheet.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [sheetRef, scrimRef, axis, direction, scrollSelector, enabled]);
}
