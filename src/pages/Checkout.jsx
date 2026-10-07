import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaRuler,
  FaStar,
  FaLink,
  FaPalette,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { payPlusService } from "../utils/payPlusService";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { formatItemNameWithExtraLetters } from "../utils/extraHebrewLetters";
import {
  formatPrice,
  productName,
  productImage,
  handleImageError,
} from "../utils/format";
import {
  computeOrderTotals,
  GIFT_WRAP_PRODUCT_ID,
  GIFT_WRAP_PRICE,
} from "../utils/orderTotals";
import { API_BASE_URL } from "../constants/api";
import { trackEvent } from "../utils/tracking";
import { countryOptions } from "../utils/shipping";
import "../styles/pages/Checkout.css";

const GIFT_WRAP_NAME = "אריזת מתנה יוקרתית";
const GIFT_WRAP_NAME_EN = "Luxury gift wrapping";

const FIELDS = [
  {
    name: "fullname",
    he: "שם מלא",
    en: "Full name",
    type: "text",
    autoComplete: "name",
  },
  {
    name: "email",
    he: "אימייל",
    en: "Email",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
  },
  {
    name: "phone",
    he: "טלפון נייד",
    en: "Mobile phone",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
  },
  {
    name: "address",
    he: "כתובת (רחוב ומספר)",
    en: "Street address",
    type: "text",
    autoComplete: "street-address",
  },
  {
    name: "city",
    he: "עיר",
    en: "City",
    type: "text",
    autoComplete: "address-level2",
  },
  {
    name: "zipCode",
    he: "מיקוד",
    en: "Zip / postal code",
    type: "text",
    autoComplete: "postal-code",
  },
];

// Fields that may stay empty for an address abroad (many countries have no
// postal codes, or customers don't know them)
const OPTIONAL_ABROAD = new Set(["zipCode"]);

const EMPTY_FORM = {
  ...Object.fromEntries(FIELDS.map((f) => [f.name, ""])),
  country: "IL",
};

function loadSavedDetails() {
  try {
    const details = JSON.parse(
      localStorage.getItem("shippingDetails") || "null",
    );
    if (!details) return EMPTY_FORM;
    return {
      fullname: details.fullname || details.fullName || "",
      email: details.email || "",
      phone: details.phone || "",
      address: details.address || "",
      city: details.city || "",
      zipCode: details.zipCode || "",
      country: details.country || "IL",
    };
  } catch {
    return EMPTY_FORM;
  }
}

function validate(form, language) {
  const he = language === "he";
  const errors = {};
  const isIsrael = form.country === "IL";
  for (const field of FIELDS) {
    if (!isIsrael && OPTIONAL_ABROAD.has(field.name)) continue;
    if (!form[field.name].trim()) {
      errors[field.name] = he
        ? `נא למלא ${field.he}`
        : `Please enter your ${field.en.toLowerCase()}`;
    }
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = he ? "כתובת אימייל לא תקינה" : "Invalid email address";
  }

  const phone = form.phone.replace(/[-\s().]/g, "");
  if (phone) {
    if (isIsrael && !/^(05\d{8}|\+9725\d{8})$/.test(phone)) {
      errors.phone = he
        ? "מספר נייד לא תקין (05XXXXXXXX)"
        : "Invalid mobile number (05XXXXXXXX)";
    } else if (!isIsrael && !/^\+?\d{7,15}$/.test(phone)) {
      errors.phone = he
        ? "מספר טלפון לא תקין (כולל קידומת מדינה, למשל +1...)"
        : "Invalid phone number (include the country code, e.g. +1…)";
    }
  }

  const zip = form.zipCode.trim();
  if (zip) {
    if (isIsrael && !/^\d{5}(\d{2})?$/.test(zip)) {
      errors.zipCode = he
        ? "מיקוד צריך להכיל 5 או 7 ספרות"
        : "Zip code must be 5 or 7 digits";
    } else if (!isIsrael && !/^[A-Za-z0-9 -]{2,12}$/.test(zip)) {
      errors.zipCode = he ? "מיקוד לא תקין" : "Invalid postal code";
    }
  }
  return errors;
}

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { showError } = useToast();
  const { cartItems: cartContextItems } = useCart();
  const he = language === "he";

  // "Buy now" passes a single item in navigation state; everything else
  // checks out the cart. Falling back to the cart means a refresh on this
  // page no longer throws the customer back to /cart.
  const cartItems = useMemo(
    () =>
      location.state?.cartItems?.length
        ? location.state.cartItems
        : cartContextItems,
    [location.state, cartContextItems],
  );

  const [formData, setFormData] = useState(loadSavedDetails);
  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPercent }
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0)
      navigate("/cart", { replace: true });
  }, [cartItems, navigate]);

  // Funnel: checkout started (store and campaign pages both land here)
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || !cartItems?.length) return;
    checkoutTracked.current = true;
    trackEvent("InitiateCheckout", {
      value: cartItems.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0),
      content_ids: cartItems.map((i) => i.id),
      content_type: "product",
      num_items: cartItems.reduce((n, i) => n + (i.quantity || 1), 0),
    });
  }, [cartItems]);

  const totals = computeOrderTotals(cartItems, {
    discountPercent: appliedCoupon?.discountPercent,
    giftWrap: includeGiftWrap,
    country: formData.country,
  });
  const isIsrael = formData.country === "IL";
  const countries = useMemo(() => countryOptions(language), [language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (data.success) {
        setAppliedCoupon({ code, discountPercent: data.discountPercent });
      } else {
        setAppliedCoupon(null);
        setCouponError(
          data.message || (he ? "קוד קופון לא תקין" : "Invalid coupon code"),
        );
      }
    } catch {
      setCouponError(he ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validate(formData, language);
    if (!acceptedTerms) {
      found.terms = he
        ? "יש לאשר את תקנון האתר ומדיניות הפרטיות"
        : "Please accept the terms and privacy policy";
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so screen-reader and mobile users see it
      const first =
        FIELDS.find((f) => found[f.name])?.name ||
        (found.terms ? "accept-terms" : null);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    const customerName = formData.fullname.trim();
    const customerEmail = formData.email.trim();
    const customerPhone = formData.phone.replace(/[-\s().]/g, "");

    const mappedItems = cartItems.map((item) => {
      const selections = item.selections || item.selectedOptions || {};
      const extraLetters = Array.isArray(selections.extraLetters)
        ? selections.extraLetters
        : [];
      return {
        productId: item.id,
        name: formatItemNameWithExtraLetters(item.name, extraLetters),
        price: item.price,
        quantity: item.quantity || 1,
        selections,
        selectedOptions: item.selectedOptions || {},
      };
    });

    if (includeGiftWrap) {
      mappedItems.push({
        productId: GIFT_WRAP_PRODUCT_ID,
        name: GIFT_WRAP_NAME,
        price: GIFT_WRAP_PRICE,
        quantity: 1,
        selections: {},
        selectedOptions: {},
      });
    }

    const shippingDetails = {
      fullName: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: formData.address.trim(),
      city: formData.city.trim(),
      zipCode: formData.zipCode.trim(),
      country: formData.country,
    };
    try {
      localStorage.setItem("shippingDetails", JSON.stringify(shippingDetails));
    } catch {
      // Storage unavailable: the order still goes through
    }

    setPaymentLoading(true);
    try {
      const result = await payPlusService.createPayment({
        customerName,
        customerEmail,
        customerPhone,
        orderItems: mappedItems,
        shippingAddress: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          street: shippingDetails.address,
          city: shippingDetails.city,
          zipCode: shippingDetails.zipCode,
          country: shippingDetails.country,
        },
        couponCode: appliedCoupon?.code || null,
      });

      const redirectUrl =
        result.paymentPageUrl || result.payment_page_link || result.url;
      if (!redirectUrl)
        throw new Error(
          he ? "לא התקבל קישור לתשלום" : "No payment link received",
        );

      // Shown on the success page if the customer lands there before the
      // server confirms the order.
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          orderId: result.orderId,
          customerName,
          customerEmail,
          customerPhone,
          items: mappedItems,
          shippingAddress: shippingDetails,
          totalPrice: result.totalPrice ?? totals.total,
          shippingPrice: result.shippingPrice ?? totals.shipping.price,
          couponCode: appliedCoupon?.code || null,
        }),
      );

      window.location.assign(redirectUrl);
    } catch (err) {
      console.error("Checkout error:", err);
      showError(err.message || (he ? "שגיאה בחיבור לשרת" : "Connection error"));
      setPaymentLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) return null;

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>{he ? "השלמת הזמנה" : "Complete Order"}</h1>

        {!isLoggedIn && (
          <div className="guest-checkout-notice">
            <p>
              <strong>{he ? "הזמנה כאורח:" : "Guest checkout:"}</strong>{" "}
              {he
                ? "אפשר להשלים את ההזמנה ללא הרשמה. פרטי ההזמנה יישלחו לאימייל שתזינו."
                : "You can complete your order without registering. Order details will be sent to your email."}
            </p>
            <p className="login-option">
              {he ? "יש לך חשבון?" : "Have an account?"}{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() =>
                  navigate("/login", {
                    state: {
                      returnTo: "/checkout",
                      cartItems: location.state?.cartItems,
                    },
                  })
                }
              >
                {he ? "התחבר כאן" : "Login here"}
              </button>
            </p>
          </div>
        )}

        <div className="checkout-content">
          <section
            className="order-summary-section"
            aria-labelledby="order-summary-title"
          >
            <h2 id="order-summary-title">
              {he ? "סיכום הזמנה" : "Order Summary"}
            </h2>
            <ul className="order-items">
              {cartItems.map((item) => {
                const options = item.selectedOptions || {};
                return (
                  <li key={item.cartItemId || item.id} className="order-item">
                    <img
                      src={productImage(item)}
                      alt=""
                      onError={handleImageError}
                    />
                    <div className="order-item-details">
                      <h3>
                        {formatItemNameWithExtraLetters(
                          productName(item, language),
                          item.selections?.extraLetters,
                        )}
                      </h3>

                      <div className="order-item-options">
                        {options.length && (
                          <span>
                            <FaRuler aria-hidden="true" /> {options.length}{" "}
                            {he ? 'ס"מ' : "cm"}
                          </span>
                        )}
                        {options.metalType && (
                          <span>
                            <FaStar aria-hidden="true" /> {options.metalType}
                          </span>
                        )}
                        {options.jewelryType && (
                          <span>
                            <FaStar aria-hidden="true" /> {options.jewelryType}
                          </span>
                        )}
                        {options.chainType && (
                          <span>
                            <FaLink aria-hidden="true" /> {options.chainType}
                          </span>
                        )}
                        {options.waxColor && (
                          <span>
                            <FaPalette aria-hidden="true" /> {options.waxColor}
                          </span>
                        )}
                        {item.selections?.extraLetters?.length > 0 && (
                          <span>
                            {he ? "צירוף: " : "Extra: "}
                            {item.selections.extraLetters.join(", ")}
                          </span>
                        )}
                      </div>

                      <p className="order-item-price">
                        {(item.quantity || 1) > 1 && (
                          <span className="order-item-qty">
                            {item.quantity} ×{" "}
                            {formatPrice(item.price, language)} ={" "}
                          </span>
                        )}
                        {formatPrice(
                          item.price * (item.quantity || 1),
                          language,
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="order-total">
              <div className="order-total-row">
                <span>{he ? "סכום ביניים:" : "Subtotal:"}</span>
                <span>
                  {formatPrice(
                    totals.subtotal - (includeGiftWrap ? GIFT_WRAP_PRICE : 0),
                    language,
                  )}
                </span>
              </div>
              {includeGiftWrap && (
                <div className="order-total-row">
                  <span>{he ? GIFT_WRAP_NAME : GIFT_WRAP_NAME_EN}:</span>
                  <span>{formatPrice(GIFT_WRAP_PRICE, language)}</span>
                </div>
              )}
              {appliedCoupon && totals.discount > 0 && (
                <div className="order-total-row order-total-discount">
                  <span>
                    {he ? "הנחת קופון" : "Coupon discount"} (
                    {appliedCoupon.discountPercent}%):
                  </span>
                  <span>−{formatPrice(totals.discount, language)}</span>
                </div>
              )}
              <div className="order-total-row">
                <span>
                  {he ? "משלוח" : "Shipping"}
                  {!isIsrael && (
                    <span className="order-total-note">
                      {" "}
                      (
                      {countries.find((c) => c.code === formData.country)?.name}
                      )
                    </span>
                  )}
                  :
                </span>
                {totals.shipping.price === 0 ? (
                  <span className="shipping-free">{he ? "חינם" : "Free"}</span>
                ) : (
                  <span>{formatPrice(totals.shipping.price, language)}</span>
                )}
              </div>
              {totals.shipping.remainingForFree > 0 && (
                <p className="free-shipping-hint">
                  {he
                    ? `עוד ${formatPrice(totals.shipping.remainingForFree, language)} ומשלוח חינם`
                    : `${formatPrice(totals.shipping.remainingForFree, language)} more for free shipping`}
                </p>
              )}
              <div className="order-total-row order-total-final">
                <span>{he ? 'סה"כ לתשלום:' : "Total:"}</span>
                <span className="total-amount">
                  {formatPrice(totals.total, language)}
                </span>
              </div>
            </div>

            <div className="coupon-section">
              <label className="coupon-label" htmlFor="coupon-code">
                {he ? "קוד קופון" : "Coupon Code"}
              </label>
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <span>
                    <FaCheckCircle
                      aria-hidden="true"
                      className="coupon-applied__icon"
                    />{" "}
                    {appliedCoupon.code} &mdash; {appliedCoupon.discountPercent}
                    % {he ? "הנחה" : "off"}
                  </span>
                  <button
                    type="button"
                    className="coupon-remove-btn"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                    }}
                  >
                    {he ? "הסר" : "Remove"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="coupon-input-row">
                    <input
                      id="coupon-code"
                      type="text"
                      value={couponCode}
                      autoComplete="off"
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder={he ? "הזן קוד קופון" : "Enter coupon code"}
                      aria-invalid={Boolean(couponError)}
                      aria-describedby={
                        couponError ? "coupon-error" : undefined
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="coupon-apply-btn"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? "…" : he ? "הפעל" : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p id="coupon-error" className="field-error" role="alert">
                      {couponError}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h2>{he ? "פרטי משלוח" : "Shipping Details"}</h2>

              {FIELDS.map((field) => {
                const optional = !isIsrael && OPTIONAL_ABROAD.has(field.name);
                return (
                  <Fragment key={field.name}>
                    {/* Destination first among the address fields: it decides
                        shipping and which phone/zip formats are valid */}
                    {field.name === "address" && (
                      <div className="form-group">
                        <label htmlFor="country">
                          {he ? "מדינה" : "Country"}{" "}
                          <span aria-hidden="true">*</span>
                        </label>
                        <select
                          id="country"
                          name="country"
                          autoComplete="country"
                          value={formData.country}
                          onChange={handleChange}
                        >
                          {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {!isIsrael && (
                          <p className="field-hint">
                            {he
                              ? `משלוח בינלאומי: ${formatPrice(totals.shipping.price, language)}. מכס ומיסים במדינת היעד על חשבון הלקוח.`
                              : `International shipping: ${formatPrice(totals.shipping.price, language)}. Customs and import taxes are paid by the customer.`}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="form-group">
                      <label htmlFor={field.name}>
                        {he ? field.he : field.en}{" "}
                        {optional ? (
                          <span className="field-optional">
                            {he ? "(לא חובה)" : "(optional)"}
                          </span>
                        ) : (
                          <span aria-hidden="true">*</span>
                        )}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        inputMode={field.inputMode}
                        autoComplete={field.autoComplete}
                        dir={
                          ["email", "phone", "zipCode"].includes(field.name)
                            ? "ltr"
                            : undefined
                        }
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={!optional}
                        aria-required={!optional}
                        placeholder={
                          field.name === "phone" && !isIsrael
                            ? "+1 555 123 4567"
                            : undefined
                        }
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                          errors[field.name] ? `${field.name}-error` : undefined
                        }
                      />
                      {errors[field.name] && (
                        <p id={`${field.name}-error`} className="field-error">
                          {errors[field.name]}
                        </p>
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </div>

            <label className="order-bump">
              <input
                type="checkbox"
                checked={includeGiftWrap}
                onChange={(e) => setIncludeGiftWrap(e.target.checked)}
              />
              <span>
                {he
                  ? `הוסיפו אריזת מתנה יוקרתית (+${formatPrice(GIFT_WRAP_PRICE, language)})`
                  : `Add luxury gift wrapping (+${formatPrice(GIFT_WRAP_PRICE, language)})`}
              </span>
            </label>

            <div className="terms-consent">
              <label>
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (errors.terms)
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  aria-invalid={Boolean(errors.terms)}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                />
                <span>
                  {he
                    ? "קראתי ואני מסכים/ה ל"
                    : "I have read and agree to the "}
                  <Link
                    to="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {he ? "תקנון האתר" : "Terms of Service"}
                  </Link>
                  {he ? ", ל" : ", "}
                  <Link
                    to="/return-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {he ? "מדיניות ההחזרות" : "Return Policy"}
                  </Link>
                  {he ? " ול" : " and "}
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {he ? "מדיניות הפרטיות" : "Privacy Policy"}
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p id="terms-error" className="field-error">
                  {errors.terms}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn submit-order-btn"
              disabled={paymentLoading}
            >
              {paymentLoading
                ? he
                  ? "מעביר לדף תשלום…"
                  : "Redirecting to payment…"
                : he
                  ? `מעבר לתשלום מאובטח — ${formatPrice(totals.total, language)}`
                  : `Proceed to secure payment — ${formatPrice(totals.total, language)}`}
            </button>

            <p className="secure-payment-note">
              <FaLock aria-hidden="true" />{" "}
              {he
                ? "התשלום מתבצע בדף מאובטח ומוצפן של PayPlus. פרטי האשראי אינם נשמרים אצלנו."
                : "Payment happens on PayPlus's secure, encrypted page. We never store card details."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
