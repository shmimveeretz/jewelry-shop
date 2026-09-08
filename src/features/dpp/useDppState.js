import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLengthOptions,
  isBraceletJewelryType,
  isHebrewLetterProduct,
  isNecklaceJewelryType,
} from "../../data/productSizes";
import {
  buildCartItem,
  calculateProductPrice,
  getOptionKeys,
} from "../../utils/productPricing";
import { formatPrice, trackPixel } from "./format";

/**
 * All the state a DPP has: which options are selected, what that costs, and
 * what happens on CTA click.
 *
 * Every block reads from the object this returns, which is why a hero picker
 * and a second picker further down the page stay in sync, and why all three
 * CTAs always show the same number.
 *
 * Pricing itself is delegated to utils/productPricing — the same module the
 * storefront modal uses, so a price shown next to a CTA can never disagree
 * with what checkout charges.
 */
export function useDppState({ product, page }) {
  const navigate = useNavigate();

  const [selected, setSelected] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [isStickyCtaVisible, setStickyCtaVisible] = useState(false);

  const heroCtaRef = useRef(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    setSelected({});
    setShowValidation(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    trackPixel("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      content_category: product.category,
      value: product.price,
      currency: "ILS",
      ...(page?.tracking?.customEventParams || {}),
    });
  }, [product, page]);

  // Reveal the sticky CTA only once the hero CTA has scrolled out of view.
  useEffect(() => {
    const target = heroCtaRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStickyCtaVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [product]);

  const optionModel = useMemo(() => {
    if (!product) return null;

    const priceAdditions = product.priceAdditions || {};
    const isHebrewLetters = isHebrewLetterProduct(product);
    const groupOf = (key) => priceAdditions[key] || {};

    const toChoices = (key) =>
      Object.entries(groupOf(key)).map(([value, addition]) => ({
        value,
        label: value,
        note: addition > 0 ? `+${formatPrice(addition)}` : null,
      }));

    const jewelryTypeChoices = toChoices("jewelryType");
    const metalChoices = toChoices("metalType");

    // Length depends on the chosen jewelry type, so it unlocks only after the
    // earlier choices are made — same ordering the storefront modal uses.
    const jewelryTypeReady =
      jewelryTypeChoices.length === 0 || Boolean(selected.jewelryType);
    const metalReady = metalChoices.length === 0 || Boolean(selected.metalType);

    const hasLengthData = Object.keys(groupOf("length")).length > 0;
    const lengthFitsType =
      !selected.jewelryType ||
      isNecklaceJewelryType(selected.jewelryType) ||
      isBraceletJewelryType(selected.jewelryType);

    const lengthChoices =
      hasLengthData && lengthFitsType
        ? getLengthOptions(
            priceAdditions,
            selected.jewelryType,
            isHebrewLetters,
            product.id,
          ).map(({ size, price }) => ({
            value: size,
            label: `${size} ס"מ`,
            note: price > 0 ? `+${formatPrice(price)}` : null,
          }))
        : [];

    const showLength =
      lengthChoices.length > 0 && jewelryTypeReady && metalReady;

    // Any other option group defined on the product (e.g. finish, stone).
    // `chain` is excluded on purpose: every choice costs 0 and buildCartItem
    // never forwards it to the order, so on a campaign page it was pure
    // friction — one more required tap between the visitor and the CTA.
    const extraGroups = getOptionKeys(priceAdditions)
      .filter(
        (key) => !["jewelryType", "metalType", "length", "chain"].includes(key),
      )
      .map((key) => ({ key, choices: toChoices(key) }))
      .filter((group) => group.choices.length > 0);

    const missing = [];
    if (jewelryTypeChoices.length > 0 && !selected.jewelryType) {
      missing.push("jewelryType");
    }
    if (metalChoices.length > 0 && !selected.metalType)
      missing.push("metalType");
    if (showLength && !selected.length) missing.push("length");
    for (const group of extraGroups) {
      if (!selected[group.key]) missing.push(group.key);
    }

    const hasAnyOptions =
      jewelryTypeChoices.length > 0 ||
      metalChoices.length > 0 ||
      showLength ||
      extraGroups.length > 0;

    return {
      jewelryTypeChoices,
      metalChoices,
      lengthChoices,
      showLength,
      extraGroups,
      missing,
      hasAnyOptions,
    };
  }, [product, selected]);

  const handleSelect = useCallback((key, value) => {
    setSelected((prev) => ({
      ...prev,
      [key]: value,
      // Each jewelry type has its own size range.
      ...(key === "jewelryType" ? { length: "" } : {}),
    }));
    setShowValidation(false);
  }, []);

  const totalPrice = product ? calculateProductPrice(product, selected) : 0;

  const handleCheckout = useCallback(() => {
    if (!product || !optionModel) return;

    if (optionModel.missing.length > 0) {
      setShowValidation(true);
      optionsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const item = buildCartItem(product, selected);

    trackPixel("InitiateCheckout", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      num_items: 1,
      value: item.price,
      currency: "ILS",
      ...(page?.tracking?.customEventParams || {}),
    });

    navigate("/checkout", {
      state: { cartItems: [{ ...item, quantity: 1 }], total: item.price },
    });
  }, [product, optionModel, selected, page, navigate]);

  return {
    product,
    page,
    selected,
    handleSelect,
    optionModel,
    totalPrice,
    showValidation,
    isStickyCtaVisible,
    heroCtaRef,
    optionsRef,
    handleCheckout,
    // Blocks read the theme CTA label as their fallback so one setting drives
    // every button on the page.
    defaultCtaLabel: page?.theme?.ctaLabel || "לרכישה מאובטחת",
  };
}
