import {
  BadgeCheck,
  Clock,
  Gem,
  Gift,
  Hammer,
  Heart,
  Lock,
  Package,
  Quote,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

/**
 * Icon names an admin can pick in the builder. Mirrors ALLOWED_ICONS in
 * Backend/src/utils/blockValidation.js — the server rejects anything not on
 * that list, so a name arriving here always resolves.
 */
export const BLOCK_ICONS = {
  lock: Lock,
  truck: Truck,
  hammer: Hammer,
  rotateCcw: RotateCcw,
  shieldCheck: ShieldCheck,
  badgeCheck: BadgeCheck,
  gem: Gem,
  star: Star,
  quote: Quote,
  sparkles: Sparkles,
  heart: Heart,
  gift: Gift,
  clock: Clock,
  package: Package,
};

export const getBlockIcon = (name) => BLOCK_ICONS[name] || Sparkles;

export const ICON_NAMES = Object.keys(BLOCK_ICONS);
