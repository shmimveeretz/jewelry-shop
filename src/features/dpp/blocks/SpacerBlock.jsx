const SIZES = {
  sm: "h-6",
  md: "h-12",
  lg: "h-20",
  xl: "h-32",
};

function SpacerBlock({ size = "md" }) {
  return <div className={SIZES[size] || SIZES.md} aria-hidden="true" />;
}

export default SpacerBlock;
