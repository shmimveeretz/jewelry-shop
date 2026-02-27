import "../styles/pages/About.css";
import { useLanguage } from "../contexts/LanguageContext";

function About() {
  const { t, language } = useLanguage();

  return (
    <div className="about-page">
      <div className="about-hero">
        <div>
          <h1>{t("ourStory")}</h1>
        </div>
      </div>

      <div className="about-content">
        <section className="about-section collection-section">
          <h2>
            {language === "he"
              ? "קולקציית שמיים וארץ"
              : "Shamaim VeEretz Collection"}
          </h2>
          <p className="collection-intro">
            {language === "he"
              ? "קולקציית שמיים וארץ נולדה מתוך חיבור בין שתי נשמות, חן ונטע, שהוא הרבה מעבר לזמן ומקום. מסע שכולו אמונה 'שאין עוד מלבדו' וכל יום במסע מעצים את השיבה הביתה..."
              : "The Shamaim VeEretz Collection was born from a connection between two souls, Chen and Neta, that transcends time and place. A journey of pure faith 'there is nothing but Him' and each day on the journey strengthens the return home..."}
          </p>

          <p className="collection-intro-subtitle">
            {language === "he"
              ? "הקולקציה אוצרת בתוכה את גרמי השמים והארץ:"
              : "The collection treasures within it the celestial and earthly bodies:"}
          </p>

          <div className="collection-items-grid">
            <div className="collection-item" style={{ "--delay": "0s" }}>
              <div className="collection-item-number">22</div>
              <p>
                {language === "he"
                  ? "אותיות בכתב עברי קדום"
                  : "Letters in ancient Hebrew script"}
              </p>
            </div>

            <div className="collection-item" style={{ "--delay": "0.1s" }}>
              <div className="collection-item-number">7</div>
              <p>{language === "he" ? "כוכבי לכת" : "Planets"}</p>
            </div>

            <div className="collection-item" style={{ "--delay": "0.2s" }}>
              <div className="collection-item-number">12</div>
              <p>{language === "he" ? "סימני המזלות" : "Zodiac signs"}</p>
            </div>

            <div className="collection-item" style={{ "--delay": "0.3s" }}>
              <div className="collection-item-number">12</div>
              <p>{language === "he" ? "אבני החושן" : "Hoshen stones"}</p>
              <small>
                {language === "he"
                  ? "מ12 שבטי ישראל"
                  : "From 12 tribes of Israel"}
              </small>
            </div>

            <div
              className="collection-item full-width"
              style={{ "--delay": "0.4s" }}
            >
              <p className="highlight-item">
                {language === "he"
                  ? "ועוד סמלים ואותות של תורתנו הקדושה למען עמנו היקר"
                  : "And more symbols and signs of our sacred Torah for our dear people"}
              </p>
            </div>
          </div>

          <p>
            {language === "he"
              ? "הקולקציה נוצרה בסבלנות ואהבה עם המון חשיבה וירידה לפרטים הקטנים מתוך אומנות, אסטטיקה והרבה עומק."
              : "The collection was created with patience and love, with careful thought and attention to every detail, through craftsmanship, aesthetics, and profound meaning."}
          </p>

          <p>
            {language === "he"
              ? "היא מאוד אישית ולוקחת את האדם למסע אישי, מבראשית דרך שמיים וארץ ומה שביניהם."
              : "It is deeply personal and takes each person on a personal journey, from Genesis through Heaven and Earth and what lies between."}
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
