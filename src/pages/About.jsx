import "../styles/pages/About.css";
import { useLanguage } from "../contexts/LanguageContext";

const SACRED_NUMBERS = (language) => [
  {
    icon: "auto_stories",
    number: 22,
    label:
      language === "he"
        ? "אותיות בכתב עברי קדום"
        : "Letters in ancient Hebrew script",
    desc:
      language === "he"
        ? "אבני הבניין של היקום, דרכן נברא העולם והן מהוות את ליבת העיצובים שלנו."
        : "The building blocks of the universe, through which the world was created.",
    delay: "0s",
  },
  {
    icon: "nights_stay",
    number: 7,
    label: language === "he" ? "כוכבי לכת" : "Planets",
    desc:
      language === "he"
        ? "שבעת המאורות המייצגים את מחזורי הזמן והשפעת השמיים על חיי האדם."
        : "The seven luminaries representing the cycles of time and the influence of the heavens.",
    delay: "0.1s",
  },
  {
    icon: "stars",
    number: 12,
    label: language === "he" ? "סימני המזלות" : "Zodiac Signs",
    desc:
      language === "he"
        ? "החיבור האישי שבין הגורל לבין הכוכבים, כפי שפורש במסורת הסוד היהודית."
        : "The personal connection between destiny and the stars, as interpreted in Jewish mystical tradition.",
    delay: "0.2s",
  },
  {
    icon: "diamond",
    number: 12,
    label: language === "he" ? "אבני החושן" : "Hoshen Stones",
    desc:
      language === "he"
        ? "אבני הזיכרון של 12 שבטי ישראל, המעניקות הגנה ועוצמה למי שעונד אותן."
        : "The memorial stones of the 12 tribes of Israel, granting protection and strength.",
    delay: "0.3s",
  },
];

function About() {
  const { t, language } = useLanguage();

  return (
    <div className="about-page">
      {/* Hero */}
      <header className="about-hero-new">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <div className="about-hero-eyebrow">
            <div className="about-hero-eyebrow-line" />
            <span>{language === "he" ? "מורשת קדושה" : "Sacred Heritage"}</span>
          </div>
          <h1>{t("ourStory")}</h1>
          <p className="about-hero-quote">
            {language === "he"
              ? '"בין שמיים לארץ, במפגש של קדושה וחומר, נולדת היצירה המאירה את הנשמה."'
              : '"Between heaven and earth, where the sacred meets matter, creation is born to illuminate the soul."'}
          </p>
          <div className="about-hero-scroll">
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </header>

      <main className="about-main">
        {/* Story Section */}
        <section className="about-story-section">
          <div className="about-story-image-col">
            <div className="about-story-glow" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPKD1eSSuWwl5NPYODJviVyandcIiUgXJt5MfAEg8Ljf5DqyoGZtI0jEeyhYRqxPeS5D_dJoIv5NjeNLKaQ8F49CR68WY2_BPm1osP5dAaX8xtyOQGHZ0F2C_VHYzus43izX94G0hsToFmecKGkilegGmWkzQDUB34fgyR1NDpl_ZH9i85iYVN1RyqOcsxvIbJawA9qE3rajUNL2DNhtD381dL2bHCTsr7sVsE2E1l6sLGrfQmYvgEND4Fvg8cGQiqHAhA8utBBi-s"
              alt={
                language === "he"
                  ? "חן ונטע, מייסדות הקולקציה"
                  : "Chen and Neta, collection founders"
              }
              className="about-story-img"
            />
            <blockquote className="about-story-quote-card">
              {language === "he"
                ? '"האמונה היא החוט המקשר בין כל חוליה וחוליה."'
                : '"Faith is the thread that connects every single link."'}
            </blockquote>
          </div>

          <div className="about-story-text-col">
            <h2>
              {language === "he"
                ? "מסע של רוח וחומר"
                : "A Journey of Spirit and Matter"}
            </h2>
            <div className="about-story-divider" />
            <p>
              {language === "he"
                ? "קולקציית שמים וארץ נולדה מתוך חיבור בין שתי נשמות, חן ונטע, שהוא הרבה מעבר לזמן ומקום. מסע שכולו אמונה 'שאין עוד מלבדו' וכל יום במסע מעצים את השיבה הביתה..."
                : "The Shamaim VeEretz Collection was born from a connection between two souls, Chen and Neta, that transcends time and place. A journey of pure faith 'there is nothing but Him' and each day on the journey strengthens the return home..."}
            </p>
            <p>
              {language === "he"
                ? "כל תכשיט בקולקציה אינו רק פריט נוי, אלא קמע של ממש. חן, האמון על העיצוב המדויק, ונטע, המפיחה רוח בכל אבן ואות, יוצרים יחד הרמוניה שמתבטאת בשימוש בזהב טהור, אבני חושן וכתב עברי קדום."
                : "Each piece in the collection is not merely an ornament but a true talisman. Together, Chen and Neta create a harmony expressed through pure gold, Hoshen stones, and ancient Hebrew script."}
            </p>
          </div>
        </section>

        {/* Sacred Numbers */}
        <section className="about-numbers-section">
          <div className="about-numbers-header">
            <h2>{language === "he" ? "מספרים מקודשים" : "Sacred Numbers"}</h2>
            <p>
              {language === "he"
                ? "צפנים של יצירה קוסמית"
                : "Codes of Cosmic Creation"}
            </p>
          </div>
          <div className="about-numbers-grid">
            {SACRED_NUMBERS(language).map((item) => (
              <div
                key={item.label}
                className="about-number-card"
                style={{ "--delay": item.delay }}
              >
                <div className="about-number-icon">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="about-number-value">{item.number}</div>
                <p className="about-number-label">{item.label}</p>
                <p className="about-number-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="about-closing-section">
          <div className="about-closing-inner">
            <div className="about-closing-bg-icon">
              <span className="material-symbols-outlined">flare</span>
            </div>
            <h3>
              {language === "he"
                ? "ועוד סמלים ואותות של תורתנו הקדושה למען עמנו היקר"
                : "And more symbols and signs of our sacred Torah for our dear people"}
            </h3>
            <div className="about-closing-text">
              <p>
                {language === "he"
                  ? "הקולקציה נוצרה בסבלנות ואהבה עם המון חשיבה וירידה לפרטים הקטנים מתוך אומנות, אסטטיקה והרבה עומק."
                  : "The collection was created with patience and love, with careful thought and attention to every detail, through craftsmanship, aesthetics, and profound meaning."}
              </p>
              <p>
                {language === "he"
                  ? "היא מאוד אישית ולוקחת את האדם למסע אישי, מבראשית דרך שמים וארץ ומה שביניהם."
                  : "It is deeply personal and takes each person on a personal journey, from Genesis through Heaven and Earth and what lies between."}
              </p>
            </div>
            <div className="about-closing-rule" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;
