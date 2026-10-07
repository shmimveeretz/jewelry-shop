/**
 * Props that make a non-button element (a whole product card) behave like a
 * button for keyboard and screen-reader users: focusable, announced as a
 * button, activated by Enter or Space.
 *
 * Inner real buttons (quick add) keep working because their events are
 * handled before they reach the card.
 */
export function clickableProps(onActivate, label) {
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onClick: onActivate,
    onKeyDown: (event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate(event);
      }
    },
  };
}
