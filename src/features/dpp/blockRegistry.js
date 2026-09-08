import HeroBlock from "./blocks/HeroBlock";
import OptionSelectorBlock from "./blocks/OptionSelectorBlock";
import TrustSignalsBlock from "./blocks/TrustSignalsBlock";
import FeaturesBlock from "./blocks/FeaturesBlock";
import StoryBlock from "./blocks/StoryBlock";
import SocialProofBlock from "./blocks/SocialProofBlock";
import PricingBlock from "./blocks/PricingBlock";
import FaqBlock from "./blocks/FaqBlock";
import FinalCtaBlock from "./blocks/FinalCtaBlock";
import StickyCtaBlock from "./blocks/StickyCtaBlock";
import RichTextBlock from "./blocks/RichTextBlock";
import ImageBannerBlock from "./blocks/ImageBannerBlock";
import CountdownBlock from "./blocks/CountdownBlock";
import VideoEmbedBlock from "./blocks/VideoEmbedBlock";
import SpacerBlock from "./blocks/SpacerBlock";

/**
 * type -> component. A lookup rather than a switch, so adding a block is one
 * entry here plus one allowlist entry on the server.
 */
export const BLOCK_REGISTRY = {
  hero: HeroBlock,
  optionSelector: OptionSelectorBlock,
  trustSignals: TrustSignalsBlock,
  features: FeaturesBlock,
  story: StoryBlock,
  socialProof: SocialProofBlock,
  pricing: PricingBlock,
  faq: FaqBlock,
  finalCta: FinalCtaBlock,
  stickyCta: StickyCtaBlock,
  richText: RichTextBlock,
  imageBanner: ImageBannerBlock,
  countdown: CountdownBlock,
  videoEmbed: VideoEmbedBlock,
  spacer: SpacerBlock,
};

// Labels live in blockMeta.js so the admin can import them without pulling in
// every block component. Re-exported here for callers that need both.
export { BLOCK_META, BLOCK_TYPES } from "./blockMeta";
