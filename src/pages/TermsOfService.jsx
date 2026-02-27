import { useLanguage } from "../contexts/LanguageContext";
import {
  FaWhatsapp,
  FaGlobe,
  FaClock,
  FaEnvelope,
  FaRegCopyright,
  FaUser,
  FaShieldAlt,
  FaExclamationTriangle,
  FaClipboard,
  FaShoppingCart,
  FaBox,
  FaRedoAlt,
  FaPalette,
} from "react-icons/fa";
import "../styles/pages/LegalPages.css";

function TermsOfService() {
  const { language } = useLanguage();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{language === "he" ? "תנאי שימוש" : "Terms of Service"}</h1>

        <div className="legal-content">
          {language === "he" ? (
            <>
              <section>
                <h2>
                  <FaClipboard /> כללי
                </h2>
                <p>
                  ברוכים הבאים לאתר "שמיים וארץ" (להלן: "האתר"). השימוש באתר
                  מהווה הסכמה לתנאי השימוש המפורטים להלן. אנא קרא בעיון את
                  התנאים לפני ביצוע הזמנה.
                </p>
                <p>
                  האתר מופעל על ידי "שמיים וארץ" - חנות תכשיטים יהודיים (להלן:
                  "החנות" או "אנו").
                </p>
              </section>

              <section>
                <h2>
                  <FaShoppingCart /> תהליך הרכישה
                </h2>

                <h3>הזמנת מוצרים</h3>
                <ul>
                  <li>כל הזמנה באתר מהווה הצעה לרכישה</li>
                  <li>החנות שומרת לעצמה את הזכות לאשר או לסרב להזמנה</li>
                  <li>אישור הזמנה יישלח לאימייל שסופק בעת הרכישה</li>
                  <li>
                    מחירים באתר נכונים לזמן הרכישה ועשויים להשתנות ללא הודעה
                    מוקדמת
                  </li>
                </ul>

                <h3>תשלום</h3>
                <ul>
                  <li>התשלום מתבצע באמצעות מערכת PayPlus מאובטחת</li>
                  <li>החיוב יבוצע רק לאחר אישור ההזמנה</li>
                  <li>כל המחירים באתר בשקלים חדשים (&8362;) וכוללים מע"מ</li>
                  <li>
                    עלויות משלוח מתווספות למחיר המוצר ומצוינות בעת ביצוע ההזמנה
                  </li>
                </ul>

                <h3>ביטול הזמנה</h3>
                <ul>
                  <li>ניתן לבטל הזמנה עד 24 שעות מרגע ביצועה</li>
                  <li>לאחר תחילת תהליך הייצור, ההזמנה לא ניתנת לביטול</li>
                  <li>בביטול הזמנה יוחזר מלוא הסכום ששולם</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaBox /> משלוחים ואספקה
                </h2>
                <ul>
                  <li>זמני המשלוח המוצהרים הם משוערים ועשויים להשתנות</li>
                  <li>האחריות על המוצר עוברת ללקוח עם קבלת המשלוח</li>
                  <li>
                    יש לבדוק את המוצר מיד עם קבלתו ולדווח על כל פגם תוך 48 שעות
                  </li>
                  <li>
                    למידע מפורט, ראה את{" "}
                    <a href="/shipping-policy">מדיניות המשלוחים</a>
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaRedoAlt /> החזרות והחלפות
                </h2>
                <ul>
                  <li>ניתן להחזיר מוצרים תוך 14 ימים מקבלת המשלוח</li>
                  <li>מוצרים מותאמים אישית לא ניתנים להחזרה</li>
                  <li>המוצר המוחזר חייב להיות במצב חדש ובאריזה מקורית</li>
                  <li>
                    למידע מפורט, ראה את{" "}
                    <a href="/return-policy">מדיניות ההחזרות</a>
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaPalette /> התאמות אישיות
                </h2>
                <p>
                  עבור מוצרים מותאמים אישית (חריטות, גדלים מיוחדים, עיצובים
                  מיוחדים):
                </p>
                <ul>
                  <li>זמן הייצור עשוי להימשך עד 14 ימי עסקים</li>
                  <li>התאמות אישיות אינן ניתנות לביטול לאחר תחילת הייצור</li>
                  <li>
                    מוצרים מותאמים אישית אינם ניתנים להחזרה (אלא במקרה של פגם
                    ייצור)
                  </li>
                  <li>יש לבדוק היטב את הפרטים לפני אישור ההזמנה</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaShieldAlt /> אחריות
                </h2>
                <ul>
                  <li>
                    כל המוצרים מגיעים עם אחריות ל-12 חודשים מפני פגמי ייצור
                  </li>
                  <li>
                    האחריות אינה כוללת נזקים הנגרמים משימוש לא נכון או שחיקה
                    טבעית
                  </li>
                  <li>תיקון או החלפה במסגרת האחריות יבוצעו לפי שיקול דעתנו</li>
                  <li>יש לשמור את קבלת הרכישה לצורך מימוש האחריות</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaRegCopyright /> זכויות יוצרים וקניין רוחני
                </h2>
                <ul>
                  <li>
                    כל התכנים באתר (תמונות, טקסטים, עיצובים) הם רכוש החנות
                  </li>
                  <li>
                    אסור להעתיק, לשכפל או להפיץ תכנים מהאתר ללא אישור בכתב
                  </li>
                  <li>העיצובים והתכשיטים הם קניין רוחני של החנות</li>
                  <li>כל העתקה או שימוש בלתי מורשה יטופלו על פי חוק</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaUser /> חשבון משתמש
                </h2>
                <ul>
                  <li>אתה אחראי לשמירה על סודיות פרטי החשבון שלך</li>
                  <li>אתה אחראי לכל פעילות שתתבצע תחת חשבונך</li>
                  <li>יש להודיע מיד על כל שימוש לא מורשה בחשבון</li>
                  <li>החנות רשאית לסגור חשבון במקרה של הפרת תנאי השימוש</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaExclamationTriangle /> הגבלת אחריות
                </h2>
                <ul>
                  <li>החנות אינה אחראית לנזקים עקיפים או תוצאתיים</li>
                  <li>האחריות מוגבלת לסכום ששולם עבור המוצר</li>
                  <li>
                    החנות אינה אחראית לעיכובים במשלוח הנגרמים מגורמים שאינם
                    בשליטתה
                  </li>
                  <li>השימוש באתר הוא על אחריות המשתמש בלבד</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaCamera /> שימוש בתמונות
                </h2>
                <ul>
                  <li>תמונות המוצרים הן להמחשה בלבד</li>
                  <li>צבעים עשויים להשתנות מעט בהתאם למסך המחשב</li>
                  <li>
                    כל התכשיטים עשויים בעבודת יד ועשויים להשתנות מעט מהתמונה
                  </li>
                  <li>במקרה של שוני משמעותי, ניתן להחזיר את המוצר</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaGlobe /> שינויים בתנאי השימוש
                </h2>
                <p>
                  החנות שומרת לעצמה את הזכות לעדכן ולשנות את תנאי השימוש מעת
                  לעת. שינויים יכנסו לתוקף מיד עם פרסומם באתר. המשך השימוש באתר
                  לאחר השינויים מהווה הסכמה לתנאים המעודכנים.
                </p>
              </section>

              <section>
                <h2>
                  <FaBalanceScale /> דין ושיפוט
                </h2>
                <ul>
                  <li>תנאי שימוש אלה כפופים לדיני מדינת ישראל</li>
                  <li>סמכות השיפוט הבלעדית נתונה לבתי המשפט בתל אביב</li>
                  <li>בכל מחלוקת, תינתן עדיפות לפתרון בדרכי שלום</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaEnvelope /> יצירת קשר
                </h2>
                <p>לשאלות או הבהרות בנוגע לתנאי השימוש:</p>
                <ul>
                  <li>
                    <FaEnvelope /> אימייל: shmimveeretz@gmail.com
                  </li>
                  <li>
                    <FaWhatsapp /> וואטסאפ: 052-595-5389
                  </li>
                  <li>
                    <FaClock /> שעות פעילות: א׳-ה׳, 9:00-18:00
                  </li>
                </ul>
              </section>

              <section className="update-info">
                <p>
                  <strong>תאריך עדכון אחרון:</strong> ינואר 2026
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2>
                  <FaClipboard /> General
                </h2>
                <p>
                  Welcome to "Shamaim VeEretz" website (hereinafter: "the
                  Site"). Using the site constitutes agreement to the terms of
                  use detailed below. Please read the terms carefully before
                  placing an order.
                </p>
                <p>
                  The site is operated by "Shamaim VeEretz" - Jewish Jewelry
                  Store (hereinafter: "the Store" or "we").
                </p>
              </section>

              <section>
                <h2>
                  <FaShoppingCart /> Purchase Process
                </h2>

                <h3>Ordering Products</h3>
                <ul>
                  <li>
                    Every order on the site constitutes an offer to purchase
                  </li>
                  <li>
                    The Store reserves the right to approve or refuse an order
                  </li>
                  <li>
                    Order confirmation will be sent to the email provided at
                    purchase
                  </li>
                  <li>
                    Prices on the site are correct at time of purchase and may
                    change without prior notice
                  </li>
                </ul>

                <h3>Payment</h3>
                <ul>
                  <li>Payment is processed through secure PayPlus system</li>
                  <li>Charge will be made only after order confirmation</li>
                  <li>
                    All prices on site are in New Israeli Shekels (₪) and
                    include VAT
                  </li>
                  <li>
                    Shipping costs are added to product price and indicated when
                    placing order
                  </li>
                </ul>

                <h3>Order Cancellation</h3>
                <ul>
                  <li>Order can be cancelled up to 24 hours from placement</li>
                  <li>
                    After production process begins, order cannot be cancelled
                  </li>
                  <li>Upon cancellation, full amount paid will be refunded</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaBox /> Shipping and Delivery
                </h2>
                <ul>
                  <li>Stated delivery times are estimates and may vary</li>
                  <li>
                    Responsibility for product transfers to customer upon
                    receipt
                  </li>
                  <li>
                    Product must be inspected immediately upon receipt and any
                    defect reported within 48 hours
                  </li>
                  <li>
                    For detailed information, see our{" "}
                    <a href="/shipping-policy">Shipping Policy</a>
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaRedo /> Returns and Exchanges
                </h2>
                <ul>
                  <li>Products can be returned within 14 days of receipt</li>
                  <li>Customized products are not returnable</li>
                  <li>
                    Returned product must be in new condition and original
                    packaging
                  </li>
                  <li>
                    For detailed information, see our{" "}
                    <a href="/return-policy">Return Policy</a>
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaPalette /> Customizations
                </h2>
                <p>
                  For customized products (engravings, special sizes, custom
                  designs):
                </p>
                <ul>
                  <li>Production time may take up to 14 business days</li>
                  <li>
                    Customizations cannot be cancelled after production begins
                  </li>
                  <li>
                    Customized products are not returnable (except in case of
                    manufacturing defect)
                  </li>
                  <li>
                    Details must be carefully checked before confirming order
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaShieldAlt /> Warranty
                </h2>
                <ul>
                  <li>
                    All products come with 12-month warranty against
                    manufacturing defects
                  </li>
                  <li>
                    Warranty does not include damage from misuse or natural wear
                  </li>
                  <li>
                    Repair or replacement under warranty will be at our
                    discretion
                  </li>
                  <li>Purchase receipt must be kept for warranty purposes</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaRegCopyright /> Copyright and Intellectual Property
                </h2>
                <ul>
                  <li>
                    All site content (images, texts, designs) is property of the
                    Store
                  </li>
                  <li>
                    Copying, reproducing, or distributing site content without
                    written permission is prohibited
                  </li>
                  <li>
                    Designs and jewelry are intellectual property of the Store
                  </li>
                  <li>
                    Any copying or unauthorized use will be dealt with according
                    to law
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaUser /> User Account
                </h2>
                <ul>
                  <li>
                    You are responsible for maintaining confidentiality of your
                    account details
                  </li>
                  <li>
                    You are responsible for all activity under your account
                  </li>
                  <li>
                    Any unauthorized use of account must be reported immediately
                  </li>
                  <li>
                    Store may close account in case of terms of use violation
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaExclamationTriangle /> Limitation of Liability
                </h2>
                <ul>
                  <li>
                    Store is not responsible for indirect or consequential
                    damages
                  </li>
                  <li>Liability is limited to amount paid for product</li>
                  <li>
                    Store is not responsible for shipping delays caused by
                    factors beyond its control
                  </li>
                  <li>Use of site is at user's own risk</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaCamera /> Use of Images
                </h2>
                <ul>
                  <li>Product images are for illustration only</li>
                  <li>Colors may vary slightly depending on computer screen</li>
                  <li>
                    All jewelry is handmade and may vary slightly from image
                  </li>
                  <li>
                    In case of significant difference, product may be returned
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaGlobe /> Changes to Terms of Use
                </h2>
                <p>
                  Store reserves the right to update and change terms of use
                  from time to time. Changes will take effect immediately upon
                  posting on site. Continued use of site after changes
                  constitutes agreement to updated terms.
                </p>
              </section>

              <section>
                <h2>
                  <FaBalanceScale /> Law and Jurisdiction
                </h2>
                <ul>
                  <li>
                    These terms of use are subject to laws of State of Israel
                  </li>
                  <li>Exclusive jurisdiction is given to courts in Tel Aviv</li>
                  <li>
                    In any dispute, preference will be given to peaceful
                    resolution
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaEnvelope /> Contact Us
                </h2>
                <p>For questions or clarifications regarding terms of use:</p>
                <ul>
                  <li>
                    <FaEnvelope /> Email: shmimveeretz@gmail.com
                  </li>
                  <li>
                    <FaWhatsapp /> WhatsApp: 052-595-5389
                  </li>
                  <li>
                    <FaClock /> Hours: Sun-Thu, 9:00-18:00
                  </li>
                </ul>
              </section>

              <section className="update-info">
                <p>
                  <strong>Last Updated:</strong> January 2026
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
