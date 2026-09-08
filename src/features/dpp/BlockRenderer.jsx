import { BLOCK_REGISTRY } from "./blockRegistry";

/**
 * Visibility is CSS, not JS: no resize listener, no layout shift, and the
 * right variant is correct in the very first painted frame.
 */
const visibilityClass = ({ mobile = true, desktop = true }) => {
  if (mobile && desktop) return "";
  if (mobile && !desktop) return "lg:hidden";
  if (!mobile && desktop) return "hidden lg:block";
  return null; // hidden everywhere
};

function BlockRenderer({ block, ctx }) {
  const Component = BLOCK_REGISTRY[block.type];

  // An unknown type renders nothing rather than throwing. That is what keeps a
  // cached older client from white-screening on a live campaign after a new
  // block type is published.
  if (!Component || block.enabled === false) return null;

  const className = visibilityClass(block.visibility || {});
  if (className === null) return null;

  const content = <Component ctx={ctx} {...(block.props || {})} />;

  return className ? <div className={className}>{content}</div> : content;
}

export default BlockRenderer;
