import { useLanguage } from "../contexts/LanguageContext";
import {
  FaWhatsapp,
  FaPhone,
  FaGlobe,
  FaShippingFast,
  FaClock,
  FaEnvelope,
  FaQuestionCircle,
  FaGift,
  FaExclamationTriangle,
  FaBox,
} from "react-icons/fa";
import "../styles/pages/LegalPages.css";

function ShippingPolicy() {
  const { language } = useLanguage();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{language === "he" ? "מדיניות משלוחים" : "Shipping Policy"}</h1>

        <div className="legal-content">
          {language === "he" ? (
            <>
              <section>
                <h2>
                  <FaClock /> זמני אספקה
                </h2>
                <p>
                  אנו עושים כל מאמץ לספק את המוצרים במהירות האפשרית. זמני האספקה
                  המשוערים הם:
                </p>
                <ul>
                  <li>
                    <strong>משלוח רגיל:</strong> 5-7 ימי עסקים מיום ביצוע ההזמנה
                  </li>
                  <li>
                    <strong>משלוח מהיר:</strong> 2-3 ימי עסקים מיום ביצוע ההזמנה
                  </li>
                  <li>
                    <strong>איסוף עצמי:</strong> ניתן לתאם איסוף תוך 1-2 ימי
                    עסקים
                  </li>
                </ul>
                <p className="note">
                  <FaExclamationTriangle /> שימו לב: זמני המשלוח אינם כוללים את
                  זמן הייצור של תכשיטים מותאמים אישית, שעשוי להימשך עד 14 ימי
                  עסקים נוספים.
                </p>
              </section>

              <section>
                <h2>
                  <FaShippingFast /> אפשרויות משלוח
                </h2>

                <div className="shipping-option">
                  <h3>משלוח רגיל - ₪30</h3>
                  <p>משלוח באמצעות דואר רשום או שליח עד הבית</p>
                  <ul>
                    <li>משלוח לכל רחבי הארץ</li>
                    <li>מעקב אחר משלוח</li>
                    <li>5-7 ימי עסקים</li>
                  </ul>
                </div>

                <div className="shipping-option">
                  <h3>משלוח מהיר - ₪60</h3>
                  <p>משלוח באמצעות שליח מהיר</p>
                  <ul>
                    <li>משלוח לכל רחבי הארץ</li>
                    <li>מעקב אחר משלוח בזמן אמת</li>
                    <li>2-3 ימי עסקים</li>
                  </ul>
                </div>

                <div className="shipping-option">
                  <h3>איסוף עצמי - חינם</h3>
                  <p>ניתן לאסוף את המוצרים בתיאום מראש</p>
                  <ul>
                    <li>תיאום מראש דרך וואטסאפ או טלפון</li>
                    <li>איסוף מתל אביב</li>
                    <li>ללא עלות</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2>
                  <FaGlobe /> משלוח לחו"ל
                </h2>
                <p>
                  אנו שולחים מוצרים לכל רחבי העולם באמצעות דואר רשום בינלאומי.
                </p>
                <ul>
                  <li>
                    <strong>אירופה:</strong> 10-14 ימי עסקים | עלות: ₪150
                  </li>
                  <li>
                    <strong>ארה"ב וקנדה:</strong> 14-21 ימי עסקים | עלות: ₪180
                  </li>
                  <li>
                    <strong>יתר העולם:</strong> 14-28 ימי עסקים | עלות: ₪200
                  </li>
                </ul>
                <p className="note">
                  <FaExclamationTriangle /> הלקוח אחראי לתשלום מכס ומיסים בארץ
                  היעד, ככל שיחולו.
                </p>
              </section>

              <section>
                <h2>
                  <FaBox /> אריזה ומעקב
                </h2>
                <ul>
                  <li>כל המוצרים נארזים בקפידה באריזה מעוצבת ומאובטחת</li>
                  <li>התכשיטים נשלחים בקופסת מתנה יפה</li>
                  <li>מעקב אחר משלוח באמצעות מספר מעקב שנשלח באימייל</li>
                  <li>ביטוח משלוח כלול במחיר</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaGift /> משלוח חינם
                </h2>
                <p>
                  הזמנות מעל <strong>₪500</strong> זכאיות למשלוח רגיל חינם!
                </p>
                <p className="note">* ההטבה תקפה למשלוחים בתוך ישראל בלבד</p>
              </section>

              <section>
                <h2>
                  <FaQuestionCircle /> שאלות נפוצות
                </h2>

                <div className="faq-item">
                  <h4>מתי אקבל את מספר המעקב?</h4>
                  <p>
                    מספר המעקב נשלח באימייל תוך 24 שעות מרגע שהמוצר יוצא למשלוח.
                  </p>
                </div>

                <div className="faq-item">
                  <h4>מה קורה אם לא הייתי בבית בזמן המשלוח?</h4>
                  <p>
                    השליח ישאיר הודעה ותוכל לתאם משלוח מחדש או לאסוף מסניף הדואר
                    הקרוב.
                  </p>
                </div>

                <div className="faq-item">
                  <h4>האם ניתן לשלוח לכתובת שונה מכתובת החיוב?</h4>
                  <p>כן, ניתן להזין כתובת משלוח שונה בעת ביצוע ההזמנה.</p>
                </div>

                <div className="faq-item">
                  <h4>האם המשלוח מבוטח?</h4>
                  <p>כן, כל המשלוחים מבוטחים מפני אובדן או נזק במהלך המשלוח.</p>
                </div>
              </section>

              <section>
                <h2>
                  <FaPhone /> יצירת קשר
                </h2>
                <p>יש לכם שאלות לגבי המשלוח? צרו איתנו קשר:</p>
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
            </>
          ) : (
            <>
              <section>
                <h2>
                  <FaClock /> Delivery Times
                </h2>
                <p>
                  We make every effort to deliver products as quickly as
                  possible. Estimated delivery times:
                </p>
                <ul>
                  <li>
                    <strong>Standard Shipping:</strong> 5-7 business days from
                    order date
                  </li>
                  <li>
                    <strong>Express Shipping:</strong> 2-3 business days from
                    order date
                  </li>
                  <li>
                    <strong>Self Pickup:</strong> Available within 1-2 business
                    days
                  </li>
                </ul>
                <p className="note">
                  <FaExclamationTriangle /> Note: Delivery times do not include
                  production time for custom jewelry, which may take up to an
                  additional 14 business days.
                </p>
              </section>

              <section>
                <h2>
                  <FaShippingFast /> Shipping Options
                </h2>

                <div className="shipping-option">
                  <h3>Standard Shipping - ₪30</h3>
                  <p>
                    Delivery via registered mail or courier to your doorstep
                  </p>
                  <ul>
                    <li>Nationwide delivery</li>
                    <li>Package tracking</li>
                    <li>5-7 business days</li>
                  </ul>
                </div>

                <div className="shipping-option">
                  <h3>Express Shipping - ₪60</h3>
                  <p>Delivery via express courier</p>
                  <ul>
                    <li>Nationwide delivery</li>
                    <li>Real-time package tracking</li>
                    <li>2-3 business days</li>
                  </ul>
                </div>

                <div className="shipping-option">
                  <h3>Self Pickup - Free</h3>
                  <p>Pick up products by appointment</p>
                  <ul>
                    <li>Schedule via WhatsApp or phone</li>
                    <li>Pickup from Tel Aviv</li>
                    <li>No cost</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2>
                  <FaGlobe /> International Shipping
                </h2>
                <p>We ship worldwide via international registered mail.</p>
                <ul>
                  <li>
                    <strong>Europe:</strong> 10-14 business days | Cost: ₪150
                  </li>
                  <li>
                    <strong>USA & Canada:</strong> 14-21 business days | Cost:
                    ₪180
                  </li>
                  <li>
                    <strong>Rest of World:</strong> 14-28 business days | Cost:
                    ₪200
                  </li>
                </ul>
                <p className="note">
                  <FaExclamationTriangle /> Customer is responsible for customs
                  duties and taxes in destination country, if applicable.
                </p>
              </section>

              <section>
                <h2>
                  <FaBox /> Packaging & Tracking
                </h2>
                <ul>
                  <li>
                    All products are carefully packed in designed and secure
                    packaging
                  </li>
                  <li>Jewelry is shipped in a beautiful gift box</li>
                  <li>Track your package via tracking number sent by email</li>
                  <li>Shipping insurance included in price</li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaGift /> Free Shipping
                </h2>
                <p>
                  Orders over <strong>₪500</strong> qualify for free standard
                  shipping!
                </p>
                <p className="note">
                  * Offer valid for shipments within Israel only
                </p>
              </section>

              <section>
                <h2>
                  <FaQuestionCircle /> FAQ
                </h2>

                <div className="faq-item">
                  <h4>When will I receive my tracking number?</h4>
                  <p>
                    Tracking number is sent via email within 24 hours of
                    shipment.
                  </p>
                </div>

                <div className="faq-item">
                  <h4>What happens if I'm not home during delivery?</h4>
                  <p>
                    The courier will leave a notice and you can reschedule
                    delivery or pick up from the nearest post office.
                  </p>
                </div>

                <div className="faq-item">
                  <h4>Can I ship to a different address than billing?</h4>
                  <p>
                    Yes, you can enter a different shipping address when placing
                    your order.
                  </p>
                </div>

                <div className="faq-item">
                  <h4>Is shipping insured?</h4>
                  <p>
                    Yes, all shipments are insured against loss or damage during
                    transit.
                  </p>
                </div>
              </section>

              <section>
                <h2>
                  <FaPhone /> Contact Us
                </h2>
                <p>Have questions about shipping? Contact us:</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShippingPolicy;
