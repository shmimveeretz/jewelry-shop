import { useLanguage } from "../contexts/LanguageContext";
import {
  FaLock,
  FaShieldAlt,
  FaClipboardList,
  FaBullseye,
  FaHandshake,
} from "react-icons/fa";
import "../styles/pages/LegalPages.css";

function PrivacyPolicy() {
  const { language } = useLanguage();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{language === "he" ? "מדיניות פרטיות" : "Privacy Policy"}</h1>

        <div className="legal-content">
          {language === "he" ? (
            <>
              <section>
                <h2>
                  <FaLock /> מבוא
                </h2>
                <p>
                  "שמיים וארץ" (להלן: "החנות" או "אנו") מכבדת את פרטיותך
                  ומתחייבת להגן על המידע האישי שלך. מדיניות פרטיות זו מסבירה
                  כיצד אנו אוספים, משתמשים, ומגינים על המידע האישי שלך בעת שימוש
                  באתר ורכישת מוצרים.
                </p>
                <p className="highlight">
                  <FaShieldAlt /> אנו מחויבים להגן על המידע שלך ולא נמכור אותו
                  לצדדים שלישיים.
                </p>
              </section>

              <section>
                <h2>
                  <FaClipboardList /> איזה מידע אנו אוספים?
                </h2>

                <h3>מידע אישי שאתה מספק לנו:</h3>
                <ul>
                  <li>
                    <strong>פרטי יצירת קשר:</strong> שם מלא, כתובת אימייל, מספר
                    טלפון
                  </li>
                  <li>
                    <strong>כתובת למשלוח:</strong> רחוב, עיר, מיקוד, מדינה
                  </li>
                  <li>
                    <strong>פרטי חיוב:</strong> אנו לא שומרים פרטי כרטיס אשראי -
                    הם מטופלים דרך PayPlus מאובטח
                  </li>
                  <li>
                    <strong>היסטוריית הזמנות:</strong> מוצרים שרכשת, תאריכים,
                    סכומים
                  </li>
                  <li>
                    <strong>העדפות:</strong> גדלים, עיצובים, סגנונות שבחרת
                  </li>
                </ul>

                <h3>מידע שנאסף אוטומטית:</h3>
                <ul>
                  <li>
                    <strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה
                  </li>
                  <li>
                    <strong>התנהגות באתר:</strong> דפים שביקרת, מוצרים שצפית,
                    זמן שהות
                  </li>
                  <li>
                    <strong>Cookies:</strong> קבצים קטנים שנשמרים במכשיר שלך
                    לשיפור חוויית השימוש
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaBullseye /> כיצד אנו משתמשים במידע?
                </h2>
                <ul>
                  <li>
                    <strong>עיבוד הזמנות:</strong> לטפל בהזמנות, לשלוח מוצרים,
                    ולספק שירות לקוחות
                  </li>
                  <li>
                    <strong>תקשורת:</strong> לשלוח אישורי הזמנה, עדכוני משלוח,
                    ומענה לפניות
                  </li>
                  <li>
                    <strong>שיפור השירות:</strong> לשפר את האתר, המוצרים וחוויית
                    הלקוח
                  </li>
                  <li>
                    <strong>שיווק:</strong> לשלוח מבצעים והטבות (רק אם נתת
                    הסכמה)
                  </li>
                  <li>
                    <strong>אבטחה:</strong> למנוע הונאות ולהגן על האתר
                  </li>
                  <li>
                    <strong>חוקי:</strong> לעמוד בדרישות חוקיות ורגולטוריות
                  </li>
                </ul>
              </section>

              <section>
                <h2>
                  <FaHandshake /> שיתוף מידע עם צדדים שלישיים
                </h2>
                <p>אנו משתפים מידע רק כאשר הדבר הכרחי לצורך מתן השירות:</p>

                <h3>ספקי שירות:</h3>
                <ul>
                  <li>
                    <strong>PayPlus:</strong> לעיבוד תשלומים מאובטח
                  </li>
                  <li>
                    <strong>חברות משלוחים:</strong> לשליחת המוצרים אליך
                  </li>
                  <li>
                    <strong>שירותי אימייל:</strong> לשליחת הודעות אימייל
                  </li>
                  <li>
                    <strong>אחסון ענן:</strong> לשמירת נתונים מאובטחת
                  </li>
                </ul>

                <p className="note">
                  ⚠️ כל ספקי השירות שלנו מחויבים לשמור על סודיות המידע ולא
                  להשתמש בו למטרות אחרות.
                </p>

                <h3>מקרים נוספים:</h3>
                <ul>
                  <li>בהתאם לדרישת חוק או צו שיפוטי</li>
                  <li>להגנה על זכויותינו, רכושנו או בטחוננו</li>
                  <li>במקרה של מיזוג, רכישה או מכירת עסק</li>
                </ul>

                <p className="highlight">
                  ❌ אנו <strong>לעולם לא</strong> נמכור או נשכיר את המידע האישי
                  שלך!
                </p>
              </section>

              <section>
                <h2>🍪 Cookies ומעקב</h2>
                <p>אנו משתמשים ב-Cookies לשיפור חוויית השימוש באתר:</p>

                <h3>סוגי Cookies:</h3>
                <ul>
                  <li>
                    <strong>Cookies הכרחיים:</strong> נדרשים לתפקוד בסיסי של
                    האתר (סל קניות, התחברות)
                  </li>
                  <li>
                    <strong>Cookies תפקודיים:</strong> זוכרים העדפות שלך (שפה,
                    מטבע)
                  </li>
                  <li>
                    <strong>Cookies אנליטיים:</strong> עוזרים לנו להבין כיצד
                    משתמשים באתר
                  </li>
                  <li>
                    <strong>Cookies שיווקיים:</strong> משמשים להצגת פרסומות
                    רלוונטיות (רק עם הסכמתך)
                  </li>
                </ul>

                <p>
                  אתה יכול לנהל את העדפות ה-Cookies בהגדרות הדפדפן שלך. שים לב
                  שחסימת Cookies מסוימים עלולה להשפיע על תפקוד האתר.
                </p>
              </section>

              <section>
                <h2>🔐 אבטחת מידע</h2>
                <p>אנו נוקטים באמצעים טכניים וארגוניים להגנה על המידע שלך:</p>
                <ul>
                  <li>
                    <strong>הצפנה:</strong> כל התקשורת מוצפנת באמצעות SSL/TLS
                  </li>
                  <li>
                    <strong>תשלומים מאובטחים:</strong> פרטי כרטיס אשראי מטופלים
                    רק על ידי PayPlus המאובטח
                  </li>
                  <li>
                    <strong>גישה מוגבלת:</strong> רק עובדים מורשים יכולים לגשת
                    למידע אישי
                  </li>
                  <li>
                    <strong>גיבויים:</strong> נתונים מגובים באופן קבוע למניעת
                    אובדן
                  </li>
                  <li>
                    <strong>עדכוני אבטחה:</strong> המערכות מעודכנות באופן שוטף
                  </li>
                </ul>

                <p className="note">
                  ⚠️ למרות המאמצים שלנו, אף שיטה אינה בטוחה ב-100%. אנא שמור על
                  סיסמתך ופרטי החשבון שלך בסודיות.
                </p>
              </section>

              <section>
                <h2>👤 הזכויות שלך</h2>
                <p>
                  בהתאם לחוק הגנת הפרטיות, יש לך זכויות לגבי המידע האישי שלך:
                </p>
                <ul>
                  <li>
                    <strong>זכות עיון:</strong> לראות איזה מידע אנו שומרים עליך
                  </li>
                  <li>
                    <strong>זכות לתיקון:</strong> לתקן מידע שגוי או לא מדויק
                  </li>
                  <li>
                    <strong>זכות למחיקה:</strong> לבקש מחיקת המידע שלך (בכפוף
                    לחוק)
                  </li>
                  <li>
                    <strong>זכות להגבלה:</strong> להגביל את השימוש במידע שלך
                  </li>
                  <li>
                    <strong>זכות להתנגדות:</strong> להתנגד לשימוש במידע למטרות
                    שיווקיות
                  </li>
                  <li>
                    <strong>זכות לניידות:</strong> לקבל עותק של המידע בפורמט
                    נגיש
                  </li>
                  <li>
                    <strong>זכות לבטל הסכמה:</strong> לבטל הסכמה ששמת בכל עת
                  </li>
                </ul>

                <p>
                  למימוש הזכויות שלך, פנה אלינו בדוא"ל: shmimveeretz@gmail.com
                </p>
              </section>

              <section>
                <h2>📧 תקשורת שיווקית</h2>
                <p>אם נתת הסכמה, אנו עשויים לשלוח לך:</p>
                <ul>
                  <li>ניוזלטרים עם עדכונים על מוצרים חדשים</li>
                  <li>מבצעים והנחות מיוחדות</li>
                  <li>טיפים ומדריכים לטיפול בתכשיטים</li>
                  <li>הזמנות לאירועים מיוחדים</li>
                </ul>

                <p>
                  <strong>תמיד ניתן להסיר את ההרשמה:</strong>
                </p>
                <ul>
                  <li>לחיצה על קישור "הסר הרשמה" בתחתית כל מייל</li>
                  <li>עדכון העדפות בחשבון המשתמש שלך</li>
                  <li>פנייה אלינו בבקשה להסרה</li>
                </ul>

                <p className="note">
                  📬 שים לב: מיילים תפעוליים (אישורי הזמנה, עדכוני משלוח) יישלחו
                  גם אם ביטלת הרשמה לניוזלטר.
                </p>
              </section>

              <section>
                <h2>👶 פרטיות ילדים</h2>
                <p>
                  האתר מיועד למבוגרים מעל גיל 18. אנו לא אוספים ביודעין מידע
                  מילדים מתחת לגיל 18. אם הנך הורה וחושב שילדך מסר לנו מידע
                  אישי, אנא צור איתנו קשר ונמחק את המידע.
                </p>
              </section>

              <section>
                <h2>🌍 העברת מידע בינלאומית</h2>
                <p>
                  המידע שלך מאוחסן בשרתים בישראל. אם אתה ממדינה אחרת, המידע שלך
                  עשוי להיות מועבר ומעובד בישראל. אנו נוקטים בצעדים להבטיח
                  שהמידע מוגן בהתאם לסטנדרטים בינלאומיים.
                </p>
              </section>

              <section>
                <h2>⏱️ כמה זמן אנו שומרים את המידע?</h2>
                <ul>
                  <li>
                    <strong>פרטי לקוח:</strong> כל עוד החשבון פעיל + 7 שנים
                    לצרכי חשבונאות
                  </li>
                  <li>
                    <strong>היסטוריית הזמנות:</strong> 7 שנים לצרכי מס וחשבונאות
                  </li>
                  <li>
                    <strong>כתובת למשלוח:</strong> עד סיום ההזמנה + תקופת
                    האחריות
                  </li>
                  <li>
                    <strong>מידע שיווקי:</strong> עד שתבקש הסרה
                  </li>
                </ul>
              </section>

              <section>
                <h2>🔄 שינויים במדיניות הפרטיות</h2>
                <p>
                  אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים משמעותיים יפורסמו
                  באתר ונשלח אליך הודעה באימייל (אם רשום). אנא בדוק עמוד זה מעת
                  לעת להישאר מעודכן.
                </p>
                <p>
                  <strong>תאריך עדכון אחרון:</strong> ינואר 2026
                </p>
              </section>

              <section>
                <h2>📞 יצירת קשר</h2>
                <p>
                  יש לך שאלות לגבי מדיניות הפרטיות או רוצה לממש את זכויותיך?
                </p>
                <div className="contact-box">
                  <ul>
                    <li>
                      📧 <strong>אימייל:</strong> shmimveeretz@gmail.com
                    </li>
                    <li>
                      📱 <strong>וואטסאפ:</strong> 052-595-5389
                    </li>
                    <li>
                      ⏰ <strong>שעות פעילות:</strong> א׳-ה׳, 9:00-18:00
                    </li>
                    <li>
                      📍 <strong>כתובת:</strong> תל אביב, ישראל
                    </li>
                  </ul>
                </div>
                <p>נשתדל להגיב תוך 48 שעות לכל פנייה.</p>
              </section>

              <section className="update-info">
                <p>
                  <strong>תאריך עדכון אחרון:</strong> ינואר 2026
                </p>
                <p>
                  מדיניות זו עומדת בדרישות חוק הגנת הפרטיות, התשמ"א-1981 ותקנות
                  הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2>🔒 Introduction</h2>
                <p>
                  "Shamayim VaAretz" (hereinafter: "the Store" or "we") respects
                  your privacy and is committed to protecting your personal
                  information. This privacy policy explains how we collect, use,
                  and protect your personal information when using the site and
                  purchasing products.
                </p>
                <p className="highlight">
                  🛡️ We are committed to protecting your information and will
                  not sell it to third parties.
                </p>
              </section>

              <section>
                <h2>📝 What Information Do We Collect?</h2>

                <h3>Personal information you provide:</h3>
                <ul>
                  <li>
                    <strong>Contact details:</strong> Full name, email address,
                    phone number
                  </li>
                  <li>
                    <strong>Shipping address:</strong> Street, city, postal
                    code, country
                  </li>
                  <li>
                    <strong>Billing details:</strong> We don't store credit card
                    details - handled through secure PayPlus
                  </li>
                  <li>
                    <strong>Order history:</strong> Products purchased, dates,
                    amounts
                  </li>
                  <li>
                    <strong>Preferences:</strong> Sizes, designs, styles you
                    selected
                  </li>
                </ul>

                <h3>Automatically collected information:</h3>
                <ul>
                  <li>
                    <strong>Technical info:</strong> IP address, browser type,
                    operating system
                  </li>
                  <li>
                    <strong>Site behavior:</strong> Pages visited, products
                    viewed, time spent
                  </li>
                  <li>
                    <strong>Cookies:</strong> Small files stored on your device
                    to improve user experience
                  </li>
                </ul>
              </section>

              <section>
                <h2>🎯 How Do We Use the Information?</h2>
                <ul>
                  <li>
                    <strong>Order processing:</strong> Process orders, ship
                    products, provide customer service
                  </li>
                  <li>
                    <strong>Communication:</strong> Send order confirmations,
                    shipping updates, respond to inquiries
                  </li>
                  <li>
                    <strong>Service improvement:</strong> Improve site,
                    products, and customer experience
                  </li>
                  <li>
                    <strong>Marketing:</strong> Send promotions and offers (only
                    with consent)
                  </li>
                  <li>
                    <strong>Security:</strong> Prevent fraud and protect the
                    site
                  </li>
                  <li>
                    <strong>Legal:</strong> Comply with legal and regulatory
                    requirements
                  </li>
                </ul>
              </section>

              <section>
                <h2>🤝 Sharing Information with Third Parties</h2>
                <p>
                  We share information only when necessary to provide service:
                </p>

                <h3>Service providers:</h3>
                <ul>
                  <li>
                    <strong>PayPlus:</strong> For secure payment processing
                  </li>
                  <li>
                    <strong>Shipping companies:</strong> To deliver products to
                    you
                  </li>
                  <li>
                    <strong>Email services:</strong> To send email messages
                  </li>
                  <li>
                    <strong>Cloud storage:</strong> For secure data storage
                  </li>
                </ul>

                <p className="note">
                  ⚠️ All our service providers are required to maintain
                  information confidentiality and not use it for other purposes.
                </p>

                <h3>Additional cases:</h3>
                <ul>
                  <li>As required by law or court order</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>In case of merger, acquisition, or business sale</li>
                </ul>

                <p className="highlight">
                  ❌ We will <strong>never</strong> sell or rent your personal
                  information!
                </p>
              </section>

              <section>
                <h2>🍪 Cookies and Tracking</h2>
                <p>We use Cookies to improve site user experience:</p>

                <h3>Types of Cookies:</h3>
                <ul>
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic site
                    function (shopping cart, login)
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> Remember your
                    preferences (language, currency)
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how
                    the site is used
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Used to display relevant
                    ads (only with consent)
                  </li>
                </ul>

                <p>
                  You can manage Cookie preferences in your browser settings.
                  Note that blocking certain Cookies may affect site
                  functionality.
                </p>
              </section>

              <section>
                <h2>🔐 Information Security</h2>
                <p>
                  We take technical and organizational measures to protect your
                  information:
                </p>
                <ul>
                  <li>
                    <strong>Encryption:</strong> All communication encrypted
                    using SSL/TLS
                  </li>
                  <li>
                    <strong>Secure payments:</strong> Credit card details
                    handled only by secure PayPlus
                  </li>
                  <li>
                    <strong>Limited access:</strong> Only authorized employees
                    can access personal information
                  </li>
                  <li>
                    <strong>Backups:</strong> Data backed up regularly to
                    prevent loss
                  </li>
                  <li>
                    <strong>Security updates:</strong> Systems updated regularly
                  </li>
                </ul>

                <p className="note">
                  ⚠️ Despite our efforts, no method is 100% secure. Please keep
                  your password and account details confidential.
                </p>
              </section>

              <section>
                <h2>👤 Your Rights</h2>
                <p>
                  According to privacy law, you have rights regarding your
                  personal information:
                </p>
                <ul>
                  <li>
                    <strong>Right of access:</strong> See what information we
                    keep about you
                  </li>
                  <li>
                    <strong>Right to correction:</strong> Correct incorrect or
                    inaccurate information
                  </li>
                  <li>
                    <strong>Right to deletion:</strong> Request deletion of your
                    information (subject to law)
                  </li>
                  <li>
                    <strong>Right to restriction:</strong> Restrict use of your
                    information
                  </li>
                  <li>
                    <strong>Right to object:</strong> Object to use of
                    information for marketing purposes
                  </li>
                  <li>
                    <strong>Right to portability:</strong> Receive copy of
                    information in accessible format
                  </li>
                  <li>
                    <strong>Right to withdraw consent:</strong> Withdraw consent
                    given at any time
                  </li>
                </ul>

                <p>
                  To exercise your rights, contact us at: shmimveeretz@gmail.com
                </p>
              </section>

              <section>
                <h2>📧 Marketing Communication</h2>
                <p>If you gave consent, we may send you:</p>
                <ul>
                  <li>Newsletters with updates on new products</li>
                  <li>Special promotions and discounts</li>
                  <li>Tips and guides for jewelry care</li>
                  <li>Invitations to special events</li>
                </ul>

                <p>
                  <strong>You can always unsubscribe:</strong>
                </p>
                <ul>
                  <li>Click "Unsubscribe" link at bottom of every email</li>
                  <li>Update preferences in your user account</li>
                  <li>Contact us with removal request</li>
                </ul>

                <p className="note">
                  📬 Note: Operational emails (order confirmations, shipping
                  updates) will be sent even if you unsubscribe from newsletter.
                </p>
              </section>

              <section>
                <h2>👶 Children's Privacy</h2>
                <p>
                  The site is intended for adults over 18. We do not knowingly
                  collect information from children under 18. If you are a
                  parent and believe your child provided us personal
                  information, please contact us and we will delete it.
                </p>
              </section>

              <section>
                <h2>🌍 International Data Transfer</h2>
                <p>
                  Your information is stored on servers in Israel. If you are
                  from another country, your information may be transferred and
                  processed in Israel. We take steps to ensure information is
                  protected according to international standards.
                </p>
              </section>

              <section>
                <h2>⏱️ How Long Do We Keep Information?</h2>
                <ul>
                  <li>
                    <strong>Customer details:</strong> As long as account is
                    active + 7 years for accounting
                  </li>
                  <li>
                    <strong>Order history:</strong> 7 years for tax and
                    accounting purposes
                  </li>
                  <li>
                    <strong>Shipping address:</strong> Until order completion +
                    warranty period
                  </li>
                  <li>
                    <strong>Marketing info:</strong> Until you request removal
                  </li>
                </ul>
              </section>

              <section>
                <h2>🔄 Changes to Privacy Policy</h2>
                <p>
                  We may update this policy from time to time. Significant
                  changes will be posted on site and we'll send you email
                  notification (if registered). Please check this page
                  occasionally to stay updated.
                </p>
                <p>
                  <strong>Last Updated:</strong> January 2026
                </p>
              </section>

              <section>
                <h2>📞 Contact Us</h2>
                <p>
                  Have questions about privacy policy or want to exercise your
                  rights?
                </p>
                <div className="contact-box">
                  <ul>
                    <li>
                      📧 <strong>Email:</strong> shmimveeretz@gmail.com
                    </li>
                    <li>
                      📱 <strong>WhatsApp:</strong> 052-595-5389
                    </li>
                    <li>
                      ⏰ <strong>Hours:</strong> Sun-Thu, 9:00-18:00
                    </li>
                    <li>
                      📍 <strong>Address:</strong> Tel Aviv, Israel
                    </li>
                  </ul>
                </div>
                <p>We'll try to respond within 48 hours to any inquiry.</p>
              </section>

              <section className="update-info">
                <p>
                  <strong>Last Updated:</strong> January 2026
                </p>
                <p>
                  This policy complies with Israeli Privacy Protection Law
                  requirements.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
