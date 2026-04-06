import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Accessibility.css";

const Accessibility = () => {
  const { t, language } = useLanguage();

  return (
    <div className="accessibility-container">
      <div className="accessibility-content">
        <h1>{t("accessibilityStatement")}</h1>

        <section className="accessibility-section">
          <h2>{t("aboutSite")}</h2>
          <p>
            {language === "he" ? (
              <>
                שמים וארץ, אחראית על הקמת והפעלת אתר:{" "}
                <a
                  href="https://shamaimveeretz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://shamaimveeretz.com
                </a>
                . {t("ourValueEqual")}
              </>
            ) : (
              <>
                Shamaim VeEretz is responsible for establishing and operating
                the website:{" "}
                <a
                  href="https://shamaimveeretz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://shamaimveeretz.com
                </a>
                . {t("ourValueEqual")}
              </>
            )}
          </p>
          <p>{t("investingResources")}</p>
          <p>
            {language === "he"
              ? "במדינת ישראל כ-20 אחוזים מקרב האוכלוסייה הינם אנשים עם מוגבלות הזקוקים לנגישות דיגיטלית, על מנת לצרוך מידע ושירותים כללים."
              : "In Israel, approximately 20% of the population are people with disabilities who need digital accessibility to consume information and general services."}
          </p>
        </section>

        <section className="accessibility-section">
          <h2>{t("accessibilityPurpose")}</h2>
          <p>
            {language === "he"
              ? "הנגשת האתר של שמים וארץ, נועדה להפוך אותו לזמין, ידידותי ונוח יותר לשימוש עבור אוכלוסיות עם צרכים מיוחדים, הנובעים בין היתר ממוגבלויות מוטוריות שונות, לקויות קוגניטיביות, קוצר רואי, עיוורון או עיוורון צבעים, לקויות שמיעה וכן אוכלוסייה הנמנית על בני הגיל השלישי."
              : "Making the Shamaim VeEretz website accessible is intended to make it available, user-friendly and more convenient for populations with special needs, arising from various motor disabilities, cognitive impairments, color blindness, blindness or color blindness, hearing impairments and the elderly population."}
          </p>
        </section>

        <section className="accessibility-section">
          <h2>{t("standards")}</h2>
          <p>
            {language === "he"
              ? 'הנגשת אתר זה בוצעה על ידי חברת הנגשת האתרים "Vee הנגשת אתרים".'
              : 'The accessibility of this website was done by the company "Vee Website Accessibility".'}
          </p>
          <p>
            <strong>{t("accessibilityLevel")}</strong>
          </p>
          <p>
            {language === "he"
              ? 'חברת "Vee", התאימה את נגישות האתר לדפדפנים הנפוצים ולשימוש בטלפון הסלולרי ככל הניתן, והשתמשה בבדיקותיה בקוראי מסך מסוג Jaws ו- NVDA.'
              : 'The company "Vee" adapted the website accessibility to popular browsers and mobile phone use as much as possible, and used screen readers such as Jaws and NVDA in their tests.'}
          </p>
          <p>
            {language === "he"
              ? 'מקפידה על עמידה בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות 5568 התשע"ג 2013 ברמת AA. וכן, מיישמת את המלצות מסמך WCAG2.2 מאת ארגון W3C.'
              : "Complies with the requirements of the Equal Rights for Persons with Disabilities Law 5568 (2013) at the AA level. And implements the recommendations of the WCAG2.2 document by the W3C organization."}
          </p>
          <ul>
            <li>
              {language === "he"
                ? "בעברית: הנחיות לנגישות תכנים באינטרנט"
                : "In English: Web Content Accessibility Guidelines"}
            </li>
            <li>
              {language === "he" ? "באנגלית: " : "In English: "}
              <a
                href="https://www.w3.org/WAI/WCAG21/quickref/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("wcagAcronym")}
              </a>
            </li>
          </ul>
          <p>
            {language === "he"
              ? "הנגשת האתר בוצעה בהתאם להנחיות רשות התקשוב להנגשת יישומים בדפדפני אינטרנט."
              : "The website accessibility was done in accordance with the Information Authority guidelines for making applications accessible to Internet browsers."}
          </p>
        </section>

        <section className="accessibility-section">
          <h2>{t("accessibleMode")}</h2>
          <p>
            {language === "he"
              ? 'באתר מוצב אייקון נגישות (בד"כ בדפנות האתר). לחיצה על האייקון מאפשרת פתיחת של תפריט הנגישות. לאחר בחירת הפונקציה המתאימה בתפריט יש להמתין לטעינת הדף ולשינוי הרצוי בתצוגה (במידת הצורך).'
              : "The website has an accessibility icon (usually on the sides of the website). Clicking the icon opens an accessibility menu. After selecting the appropriate function in the menu, you need to wait for the page to load and for the desired display change (if necessary)."}
          </p>
          <p>
            {language === "he"
              ? "במידה ומעוניינים לבטל את הפעולה, יש ללחוץ על הפונקציה בתפריט פעם שניה. בכל מצב, ניתן לאפס הגדרות נגישות."
              : "If you want to cancel the action, click the function in the menu again. You can reset accessibility settings at any time."}
          </p>
          <p>
            {language === "he"
              ? "התוכנה פועלת בדפדפנים הפופולריים: Chrome, Firefox, Safari, Opera בכפוף (תנאי יצרן) הגלישה במצב נגישות מומלצת בדפדפן כרום."
              : "The software works on popular browsers: Chrome, Firefox, Safari, Opera subject to (manufacturer's conditions). Browsing in accessible mode is recommended in Chrome."}
          </p>
          <p>
            {language === "he"
              ? "האתר מספק מבנה סמנטי עבור טכנולוגיות מסייעות ותמיכה בדפוס השימוש המקובל להפעלה עם מקלדת בעזרת מקשי החיצים, Enter ו- Esc ליציאה מתפריטים וחלונות."
              : "The website provides a semantic structure for assistive technologies and support for standard usage patterns for operation with a keyboard using arrow keys, Enter and Esc to exit menus and windows."}
          </p>
          <p>
            {language === "he"
              ? "לצורך קבלת חווית גלישה מיטבית עם תוכנת הקראת מסך, אנו ממליצים לשימוש בתוכנת NVDA העדכנית ביותר."
              : "For the best browsing experience with screen reading software, we recommend using the latest NVDA software."}
          </p>
        </section>

        <section className="accessibility-section">
          <h2>{t("adjustments")}</h2>
          <ul className="accessibility-list">
            <li>{t("screenReaderSupport")}</li>
            <li>{t("simpleNavigation")}</li>
            <li>{t("clearContent")}</li>
            <li>{t("modernBrowsers")}</li>
            <li>{t("responsiveDesign")}</li>
            <li>{t("headerStructure")}</li>
            <li>{t("altText")}</li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2>{t("softwareFunctionality")}</h2>
          <ul className="accessibility-list">
            <li>{t("screenReaderSupport")}</li>
            <li>
              {language === "he"
                ? "עצירת הבהובים - עצירת אלמנטים נעים וחסימת אנימציות"
                : "Stop Blinking - Stop moving elements and block animations"}
            </li>
            <li>
              {language === "he"
                ? "דילוג ישיר לתוכן - דילוג על התפריט הראשי ישירות אל התוכן"
                : "Skip to Main Content - Skip the main menu directly to the content"}
            </li>
            <li>{t("keyboardNavigation")}</li>
            <li>{t("textSize")}</li>
            <li>{t("spacing")}</li>
            <li>
              {language === "he"
                ? "ניגודיות וצבע - גבוהה, הפוכה, שחור לבן"
                : "Contrast and Colors - High, Inverted, Black and White"}
            </li>
            <li>{t("readableFont")}</li>
            <li>{t("linkHighlight")}</li>
            <li>{t("readingGuide")}</li>
            <li>{t("cursorIcon")}</li>
            <li>{t("imageDescription")}</li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2>{t("exceptions")}</h2>
          <p>{t("possibleIssues")}</p>
          <p>{t("continuousImprovement")}</p>
        </section>

        <section className="accessibility-section contact-section">
          <h2>{t("contactAccessibility")}</h2>
          <p>
            {language === "he"
              ? "במידה ונתקלתם בבעיה בנושא נגישות באתר, נשמח לקבל הערות ובקשות באמצעות פנייה לרכז הנגישות שלנו."
              : "If you encounter an accessibility issue on the website, we would be happy to receive comments and requests by contacting our accessibility coordinator."}
          </p>
          <p>{t("getInTouchAccessibility")}</p>
          <ul className="accessibility-list">
            <li>{t("problemDescription")}</li>
            <li>{t("attemptedAction")}</li>
            <li>{t("pageLink")}</li>
            <li>{t("browserType")}</li>
            <li>{t("operatingSystem")}</li>
            <li>{t("assistiveTechnology")}</li>
          </ul>
          <p>{t("improvementEfforts")}</p>

          <div className="contact-info">
            <h3>
              {language === "he"
                ? "פרטי רכז נגישות:"
                : "Accessibility Coordinator Details:"}
            </h3>
            <div className="info-item">
              <span className="info-label">
                {language === "he" ? "שם:" : "Name:"}
              </span>
              <span className="info-value">חן נטע</span>
            </div>
            <div className="info-item">
              <span className="info-label">
                {language === "he" ? "טלפון:" : "Phone:"}
              </span>
              <a href="tel:0523897583">0523897583</a>
            </div>
            <div className="info-item">
              <span className="info-label">{t("email")}:</span>
              <a href="mailto:shmimveeretz@gmail.com">shmimveeretz@gmail.com</a>
            </div>
          </div>

          <p className="update-date">
            <strong>{t("lastUpdate")}:</strong> 01-03-2026
          </p>
        </section>
      </div>
    </div>
  );
};

export default Accessibility;
