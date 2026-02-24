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
        <section className="about-section founders-section">
          <h2>
            {language === "he"
              ? "נטע וחן - המייסדות"
              : "Neta and Chen - The Founders"}
          </h2>
          <div className="founders-intro">
            <p className="highlight-text">
              <strong>
                {language === "he"
                  ? "נטע, בת 55, וחן, בת 31"
                  : "Neta, 55, and Chen, 31"}
              </strong>{" "}
              {language === "he"
                ? "— שתי נשים משני דורות, אבל עם לב אחד וחזון משותף."
                : "— two women from two generations, but with one heart and a shared vision."}
            </p>
          </div>

          <p>
            {language === "he"
              ? "הסיפור שלנו מתחיל מתוך רצון עמוק ליצור משהו שהוא הרבה מעבר לעסק. חיפשנו דרך לבטא חיבור אישי וערכי ליהדות, לצד מסע רוחני שמלווה אותנו ביום־יום. שתינו האמנו שאפשר להקים מקום שמביא אור, משמעות ונשימה טובה לעולם — וכל אחת מאיתנו הביאה את הניסיון, היצירתיות והלב שלה אל תוך הדרך המשותפת."
              : "Our story begins with a deep desire to create something that goes far beyond business. We sought a way to express a personal and meaningful connection to Judaism, alongside a spiritual journey that accompanies us daily. We both believed it was possible to establish a place that brings light, meaning, and positive energy to the world — and each of us brought her experience, creativity, and heart into this shared path."}
          </p>

          <p>
            {language === "he"
              ? "במסע הזה מצאנו חיבור בין העוצמה של המסורת לבין הרכות של הרוח. בין חכמה של שנים לבין תשוקה צעירה ורעננה. יחד יצרנו מרחב שמזמין אנשים לעצור לרגע, להרגיש, ולחוות משהו פנימי ואמיתי."
              : "On this journey, we found a connection between the power of tradition and the gentleness of the spirit. Between the wisdom of years and youthful, fresh passion. Together, we created a space that invites people to pause for a moment, to feel, and to experience something inner and authentic."}
          </p>

          <p className="closing-text">
            {language === "he"
              ? "העסק שלנו נולד מתוך אהבה, אמונה, וידיים עובדות — והוא ממשיך לגדול בכל יום מחדש בזכות הקשר הזה, שמחבר אותנו זו לזו ומחבר אותנו לאנשים שמגיעים אלינו."
              : "Our business was born out of love, faith, and working hands — and it continues to grow every day thanks to this connection that binds us to each other and connects us to the people who come to us."}
          </p>
        </section>

        <section className="about-section collection-section">
          <h2>
            {language === "he"
              ? "קולקציית שמיים וארץ"
              : "Shamayim VaAretz Collection"}
          </h2>
          <p className="collection-intro">
            {language === "he"
              ? "קולקציית שמיים וארץ נולדה מתוך חיבור בין שתי נשמות, חן ונטע, שהוא הרבה מעבר לזמן ומקום. מסע שכולו אמונה 'שאין עוד מלבדו' וכל יום במסע מעצים את השיבה הביתה..."
              : "The Shamayim VaAretz Collection was born from a connection between two souls, Chen and Neta, that transcends time and place. A journey of pure faith 'there is nothing but Him' and each day on the journey strengthens the return home..."}
          </p>

          <p>
            {language === "he"
              ? "הקולקציה אוצרת בתוכה את גרמי השמים והארץ:"
              : "The collection treasures within it the celestial and earthly bodies:"}
          </p>

          <ul className="collection-items">
            <li>
              {language === "he"
                ? "22 אותיות בכתב עברי קדום"
                : "22 letters in ancient Hebrew script"}
            </li>
            <li>
              {language === "he"
                ? "7 כוכבי לכת"
                : "7 planets"}
            </li>
            <li>
              {language === "he"
                ? "12 סימני המזלות"
                : "12 zodiac signs"}
            </li>
            <li>
              {language === "he"
                ? "12 אבני החושן שהיה עונד הכהן הגדול בבית המקדש כנגד 12 שבטי ישראל"
                : "12 Hoshen stones worn by the High Priest in the Holy Temple, representing the 12 tribes of Israel"}
            </li>
            <li>
              {language === "he"
                ? "ועוד סמלים ואותות של תורתנו הקדושה למען עמנו היקר"
                : "And more symbols and signs of our sacred Torah for our dear people"}
            </li>
          </ul>

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
