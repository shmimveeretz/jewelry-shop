import { useLanguage } from "../contexts/LanguageContext";
import {
  FaRedoAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaWrench,
  FaShield,
  FaClipboardList,
  FaExclamationTriangle,
  FaPhone,
  FaEnvelope,
  FaMobileAlt,
} from "react-icons/fa";
import "../styles/pages/LegalPages.css";

function ReturnPolicy() {
  const { language } = useLanguage();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>
          {language === "he"
            ? "מדיניות החזרות והחלפות"
            : "Return & Exchange Policy"}
        </h1>

        <div className="legal-content">
          {language === "he" ? (
            <>
              <section>
                <h2>
                  <FaRedoAlt /> תקופת ההחזרה
                </h2>
                <p>
                  אנו מאמינים באיכות המוצרים שלנו ובשביעות רצון הלקוחות. ניתן
                  להחזיר או להחליף מוצרים תוך <strong>14 ימים</strong> מיום קבלת
                  המשלוח, בהתאם לתנאים המפורטים להלן.
                </p>
              </section>

              <section>
                <h2>
                  <FaCheckCircle /> תנאי החזרה
                </h2>
                <p>כדי שההחזרה תאושר, יש לעמוד בתנאים הבאים:</p>
                <ul>
                  <li>המוצר לא נעשה בו שימוש ונמצא במצב חדש</li>
                  <li>המוצר באריזה המקורית, כולל תוויות וחומרי אריזה</li>
                  <li>למוצר מצורפים כל האביזרים והמסמכים שהגיעו איתו</li>
                  <li>לא בוצעו התאמות אישיות או שינויים במוצר</li>
                  <li>יש לשמור על קבלה או אישור הזמנה</li>
                </ul>
                <p className="note">
                  <FaExclamationTriangle /> מוצרים שהותאמו אישית (גודל, חריטה,
                  עיצוב מיוחד) לא ניתנים להחזרה, אלא אם כן קיים פגם ייצור.
                </p>
              </section>

              <section>
                <h2>
                  <FaTimesCircle /> מוצרים שלא ניתנים להחזרה
                </h2>
                <ul>
                  <li>
                    מוצרים שהותאמו אישית (חריטות, גדלים מיוחדים, עיצובים אישיים)
                  </li>
                  <li>עגילים (מסיבות היגיינה)</li>
                  <li>מוצרים שנפגמו עקב שימוש לא נכון</li>
                  <li>מוצרים במבצע סופי (יצוין במפורש בעמוד המוצר)</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaExchangeAlt /> החלפת מוצר
                </h2>
                <p>ניתן להחליף מוצר בגודל או בצבע אחר, בכפוף לזמינות במלאי.</p>
                <ul>
                  <li>החלפה ראשונה היא ללא עלות נוספת</li>
                  <li>עלויות משלוח החזרה והמשלוח החוזר על חשבון הלקוח</li>
                  <li>אם המוצר החלופי יקר יותר, תידרש תוספת תשלום</li>
                  <li>אם המוצר החלופי זול יותר, ההפרש יוחזר</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaMoneyBillWave /> החזר כספי
                </h2>
                <p>
                  לאחר קבלת המוצר המוחזר ובדיקתו, נבצע החזר כספי תוך 7-14 ימי
                  עסקים.
                </p>
                <ul>
                  <li>ההחזר יבוצע לאמצעי התשלום המקורי</li>
                  <li>עלויות משלוח לא מוחזרות (אלא במקרה של פגם ייצור)</li>
                  <li>במקרה של פגם ייצור, נחזיר גם עלויות משלוח</li>
                </ul>
                <p className="note">
                  <FaClock /> תהליך ההחזר הכספי עשוי להימשך 5-10 ימי עסקים
                  נוספים, בהתאם לחברת האשראי.
                </p>
              </section>

              <section>
                <h2>
                  <FaWrench /> פגמים וליקויים
                </h2>
                <p>אם קיבלת מוצר פגום או לא תקין:</p>
                <ul>
                  <li>צרו איתנו קשר תוך 48 שעות מרגע קבלת המשלוח</li>
                  <li>שלחו תמונות של הפגם למייל או בוואטסאפ</li>
                  <li>נחזיר את עלות המוצר במלואה כולל משלוח</li>
                  <li>או נשלח מוצר חלופי ללא עלות</li>
                </ul>
                <p className="highlight">
                  <FaShield /> כל המוצרים שלנו מגיעים עם אחריות ל-12 חודשים מפני
                  פגמי ייצור.
                </p>
              </section>

              <section>
                <h2>
                  <FaClipboardList /> איך להחזיר מוצר?
                </h2>
                <div className="steps">
                  <div className="step">
                    <h3>1. צור קשר</h3>
                    <p>שלח לנו אימייל או הודעת וואטסאפ עם:</p>
                    <ul>
                      <li>מספר הזמנה</li>
                      <li>סיבת ההחזרה</li>
                      <li>תמונות של המוצר (אם רלוונטי)</li>
                    </ul>
                  </div>

                  <div className="step">
                    <h3>2. קבל אישור</h3>
                    <p>נאשר את ההחזרה ונספק כתובת למשלוח ומספר מעקב</p>
                  </div>

                  <div className="step">
                    <h3>3. שלח את המוצר</h3>
                    <p>ארוז את המוצר היטב באריזה המקורית ושלח אלינו</p>
                  </div>

                  <div className="step">
                    <h3>4. קבל החזר/החלפה</h3>
                    <p>לאחר בדיקת המוצר, נבצע החזר כספי או נשלח מוצר חלופי</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>🎁 מתנות</h2>
                <p>
                  מוצר שהתקבל במתנה ניתן להחזרה או החלפה באותם תנאים. ההחזר
                  הכספי יבוצע לרוכש המקורי או בתלוש קרדיט לחנות.
                </p>
              </section>

              <section>
                <h2>⚠️ הערות חשובות</h2>
                <ul>
                  <li>עלות משלוח ההחזרה על חשבון הלקוח (אלא אם המוצר פגום)</li>
                  <li>אנו ממליצים לשלוח בדואר רשום עם מעקב</li>
                  <li>שמרו את קבלת המשלוח עד קבלת האישור על ההחזר</li>
                  <li>איננו אחראים לחבילות שאבדו במשלוח החזרה</li>
                </ul>
              </section>

              <section>
                <h2>📞 יצירת קשר</h2>
                <p>שאלות או בעיות? אנחנו כאן לעזור!</p>
                <ul>
                  <li>📧 אימייל: shmimveeretz@gmail.com</li>
                  <li>📱 וואטסאפ: 052-595-5389</li>
                  <li>⏰ שעות פעילות: א׳-ה׳, 9:00-18:00</li>
                </ul>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2>🔄 Return Period</h2>
                <p>
                  We believe in the quality of our products and customer
                  satisfaction. Products can be returned or exchanged within{" "}
                  <strong>14 days</strong> of receiving the shipment, subject to
                  the conditions detailed below.
                </p>
              </section>

              <section>
                <h2>✅ Return Conditions</h2>
                <p>
                  For a return to be approved, the following conditions must be
                  met:
                </p>
                <ul>
                  <li>Product is unused and in new condition</li>
                  <li>
                    Product is in original packaging, including labels and
                    packing materials
                  </li>
                  <li>
                    All accessories and documents that came with the product are
                    included
                  </li>
                  <li>No personal customizations or modifications were made</li>
                  <li>Receipt or order confirmation must be kept</li>
                </ul>
                <p className="note">
                  ⚠️ Personalized products (size, engraving, special design) are
                  not returnable, unless there is a manufacturing defect.
                </p>
              </section>

              <section>
                <h2>❌ Non-Returnable Items</h2>
                <ul>
                  <li>
                    Personalized products (engravings, special sizes, custom
                    designs)
                  </li>
                  <li>Earrings (for hygiene reasons)</li>
                  <li>Products damaged due to misuse</li>
                  <li>Final sale items (explicitly noted on product page)</li>
                </ul>
              </section>

              <section>
                <h2>💱 Product Exchange</h2>
                <p>
                  Products can be exchanged for different size or color, subject
                  to availability.
                </p>
                <ul>
                  <li>First exchange is free of additional charge</li>
                  <li>
                    Return shipping and new shipping costs paid by customer
                  </li>
                  <li>
                    If replacement product is more expensive, additional payment
                    required
                  </li>
                  <li>
                    If replacement product is cheaper, difference will be
                    refunded
                  </li>
                </ul>
              </section>

              <section>
                <h2>💰 Refund</h2>
                <p>
                  After receiving and inspecting the returned product, we will
                  process a refund within 7-14 business days.
                </p>
                <ul>
                  <li>Refund will be made to original payment method</li>
                  <li>
                    Shipping costs are not refunded (except in case of
                    manufacturing defect)
                  </li>
                  <li>
                    In case of manufacturing defect, shipping costs will also be
                    refunded
                  </li>
                </ul>
                <p className="note">
                  💳 The refund process may take an additional 5-10 business
                  days, depending on the credit card company.
                </p>
              </section>

              <section>
                <h2>🔧 Defects and Malfunctions</h2>
                <p>If you received a defective or faulty product:</p>
                <ul>
                  <li>Contact us within 48 hours of receiving the shipment</li>
                  <li>Send photos of the defect via email or WhatsApp</li>
                  <li>
                    We will refund the full product cost including shipping
                  </li>
                  <li>Or send a replacement product at no cost</li>
                </ul>
                <p className="highlight">
                  🛡️ All our products come with a 12-month warranty against
                  manufacturing defects.
                </p>
              </section>

              <section>
                <h2>📝 How to Return a Product?</h2>
                <div className="steps">
                  <div className="step">
                    <h3>1. Contact Us</h3>
                    <p>Send us an email or WhatsApp message with:</p>
                    <ul>
                      <li>Order number</li>
                      <li>Reason for return</li>
                      <li>Photos of product (if relevant)</li>
                    </ul>
                  </div>

                  <div className="step">
                    <h3>2. Get Approval</h3>
                    <p>
                      We'll approve the return and provide shipping address and
                      tracking number
                    </p>
                  </div>

                  <div className="step">
                    <h3>3. Ship the Product</h3>
                    <p>
                      Pack the product securely in original packaging and send
                      to us
                    </p>
                  </div>

                  <div className="step">
                    <h3>4. Receive Refund/Exchange</h3>
                    <p>
                      After inspecting the product, we'll process refund or send
                      replacement
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2>🎁 Gifts</h2>
                <p>
                  Products received as gifts can be returned or exchanged under
                  the same conditions. Refund will be made to original purchaser
                  or as store credit.
                </p>
              </section>

              <section>
                <h2>⚠️ Important Notes</h2>
                <ul>
                  <li>
                    Return shipping cost is customer's responsibility (unless
                    product is defective)
                  </li>
                  <li>
                    We recommend sending via registered mail with tracking
                  </li>
                  <li>
                    Keep shipping receipt until return confirmation is received
                  </li>
                  <li>
                    We are not responsible for packages lost in return shipping
                  </li>
                </ul>
              </section>

              <section>
                <h2>📞 Contact Us</h2>
                <p>Questions or issues? We're here to help!</p>
                <ul>
                  <li>📧 Email: shmimveeretz@gmail.com</li>
                  <li>📱 WhatsApp: 052-595-5389</li>
                  <li>⏰ Hours: Sun-Thu, 9:00-18:00</li>
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReturnPolicy;
