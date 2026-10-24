/**
 * CSV export helpers for the admin.
 *
 * - UTF-8 with a BOM, so Excel opens Hebrew text correctly instead of
 *   showing mojibake.
 * - Values that start with = + - @ (or a tab/CR) are prefixed with an
 *   apostrophe: spreadsheet apps would otherwise run them as formulas
 *   ("CSV injection"), and product text is typed in by people.
 */

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  if (value === null || value === undefined) return "";
  let text = Array.isArray(value) ? value.join(" | ") : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** @param {Array<[string, (row: any) => any]>} columns [header, getter] */
export function toCsv(rows, columns) {
  const header = columns.map(([title]) => csvCell(title)).join(",");
  const lines = rows.map((row) => columns.map(([, get]) => csvCell(get(row))).join(","));
  return `\uFEFF${[header, ...lines].join("\r\n")}\r\n`;
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "metalType: כסף 925 +0, ציפוי זהב +50 | length: שרשרת 45 +10, …" */
export function describePriceAdditions(priceAdditions) {
  if (!priceAdditions || typeof priceAdditions !== "object") return "";
  const describe = (table) =>
    Object.entries(table)
      .map(([key, value]) =>
        value && typeof value === "object"
          ? Object.entries(value).map(([sub, add]) => `${key} ${sub} +${add}`).join(", ")
          : `${key} +${value}`,
      )
      .join(", ");
  return Object.entries(priceAdditions)
    .filter(([, table]) => table !== null && table !== undefined && table !== "")
    .map(([group, table]) =>
      typeof table === "object" ? `${group}: ${describe(table)}` : `${group}: ${table}`,
    )
    .join(" | ");
}

/** Column set for the product catalogue export */
export const PRODUCT_CSV_COLUMNS = [
  ["מזהה (id)", (p) => p.id],
  ["שם", (p) => p.name],
  ["שם באנגלית", (p) => p.nameEn],
  ["קטגוריה", (p) => p.category],
  ["קטגוריה באנגלית", (p) => p.categoryEn],
  ["מחיר בסיס (₪)", (p) => p.price],
  ["תוספות מחיר לפי אפשרות", (p) => describePriceAdditions(p.priceAdditions)],
  ["סטטוס", (p) => (p.status === "inactive" || p.active === false ? "לא פעיל" : "פעיל")],
  ["נמכר ביותר", (p) => (p.featured ? "כן" : "")],
  ["מלאי", (p) => p.stock],
  ["סוגי תכשיט", (p) => p.types],
  ["מתכות", (p) => p.metals],
  ["מזלות", (p) => p.zodiacSigns],
  ["סדר תצוגה", (p) => p.sortOrder],
  ["תמונה ראשית", (p) => (Array.isArray(p.images) ? p.images[0] : p.image)],
  ["כל התמונות", (p) => p.images],
  ["תיאור", (p) => p.description],
  ["תיאור באנגלית", (p) => p.descriptionEn],
  ["עודכן", (p) => (p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : "")],
];

const ORDER_STATUS_HE = {
  pending: "בהמתנה",
  paid: "שולם",
  processing: "בעיבוד",
  shipped: "נשלחה",
  delivered: "נמסרה",
  cancelled: "בוטלה",
};
const PAYMENT_STATUS_HE = { pending: "ממתין", completed: "שולם", failed: "נכשל" };

const orderItemsSummary = (order) =>
  (order.items || [])
    .map((item) => `${item.name || item.productName || item.productId}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`)
    .join(" | ");

/** Column set for the orders export (bookkeeping) */
export const ORDER_CSV_COLUMNS = [
  ["מספר הזמנה", (o) => o.orderId || String(o._id || o.id || "").slice(-8).toUpperCase()],
  ["תאריך", (o) => (o.createdAt ? new Date(o.createdAt).toISOString().replace("T", " ").slice(0, 16) : "")],
  ["שם לקוח", (o) => o.customerName || o.shippingAddress?.fullName],
  ["אימייל", (o) => o.customerEmail || o.email],
  ["טלפון", (o) => o.customerPhone || o.phone],
  ["כתובת", (o) => o.shippingAddress?.address],
  ["עיר", (o) => o.shippingAddress?.city],
  ["מיקוד", (o) => o.shippingAddress?.zipCode],
  ["מדינה", (o) => o.shippingAddress?.country || "IL"],
  ["פריטים", orderItemsSummary],
  ["סכום פריטים (₪)", (o) => o.itemsPrice],
  ["קופון", (o) => o.couponCode],
  ["הנחה (%)", (o) => o.discountPercent || ""],
  ["משלוח (₪)", (o) => o.shippingPrice],
  ["סה״כ (₪)", (o) => o.totalPrice],
  ["סטטוס תשלום", (o) => PAYMENT_STATUS_HE[o.paymentStatus] || o.paymentStatus],
  ["סטטוס הזמנה", (o) => ORDER_STATUS_HE[String(o.status || "").toLowerCase()] || o.status],
  ["מספר מעקב", (o) => o.trackingNumber],
  ["מזהה עסקה", (o) => o.transactionUid],
];
