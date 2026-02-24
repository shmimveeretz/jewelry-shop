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

        <section className="about-section">
          <h2>
            {language === "he"
              ? "אודות שמים וארץ"
              : "About Heaven and Earth"}
          </h2>
          <div className="about-values">
            <p>
              {language === "he"
                ? "כל קולקציה שלנו נולדת ממצוקה עדינה — להביא ממממלכת השמיים לעולם הגשמי, נקודה לנקודה."
                : "Every collection of ours is born from a gentle quest — to bring from the kingdom of heaven into the physical world, point by point."}
            </p>
            
            <div className="collection-elements">
              <div className="element">
                <h4>{language === "he" ? "22 האותיות" : "The 22 Letters"}</h4>
                <p>
                  {language === "he"
                    ? "כתב עברי קדום — חיבור לשרשים, לזהות, ולצור עמוק של הקשר שלנו לאבות ולמורשת."
                    : "Ancient Hebrew script — a connection to roots, to identity, and to the deep fabric of our bond to our ancestors and heritage."}
                </p>
              </div>

              <div className="element">
                <h4>{language === "he" ? "7 כוכבי הלכת" : "The 7 Planets"}</h4>
                <p>
                  {language === "he"
                    ? "משפיעים קוסמיים המעצבים את ימינו — ת"ל, ימרכורי, זוהרה, שמש, מאדים, צדק וקורנון. כל אחד מהם נושא משמעות, מסר, והשראה."
                    : "Cosmic influences that shape our days — bringing meaning, messages, and inspiration to our lives."}
                </p>
              </div>

              <div className="element">
                <h4>{language === "he" ? "12 שנות המזל" : "The 12 Zodiac Signs"}</h4>
                <p>
                  {language === "he"
                    ? "כל תא"ג מחזיק בתוכו סיפור, רמזים ויצירתיות — קשתנו הם אלו שמדריכים ממעלה, מעבר למה שרואים."
                    : "Each zodiac sign holds within it a story, hints, and creativity — guiding us from above, beyond what we see."}
                </p>
              </div>

              <div className="element">
                <h4>{language === "he" ? "12 אבני החושן" : "The 12 Stones of the Breastplate"}</h4>
                <p>
                  {language === "he"
                    ? "אבנים קדושות שקישרו את כוהן לעמו — כל אחת עם כוח, תרופה, והצעה אחרת להבין את עצמנו ואת העולם סביבנו."
                    : "Sacred stones that connected the priest to his people — each with its own power, healing, and a different way to understand ourselves and the world around us."}
                </p>
              </div>
            </div>

            <p className="collections-closing">
              {language === "he"
                ? "כל יצירה שלנו נעשית בסבלנות, אהבה, בעבודה קולעת ועם מved עמוק של המשמעות מאחורי כל סמל. אנו מאמינות שתכשיט אמיתי אינו יפה בלבד — הוא דובר אמת, מנחה ועוזר אישי בנתיבך."
                : "Each of our creations is made with patience, love, through dedicated work and deep understanding of the meaning behind each symbol. We believe that true jewelry is not just beautiful — it is a truth-teller, a guide, and a personal helper in your path."}
            </p>
          </div>
        </section>

        <section className="about-mission">
          <h2>{t("ourMission")}</h2>
          <p>
            {language === "he"
              ? "אנו מאמינות שתכשיט הוא הרבה מעבר לאביזר יפה. זה סמל של זהות, ביטוי של אמונה, וגשר בין המסורת לבין ההווה. כל יצירה שלנו נולדת מרצון לחבר אנשים לשורשיהם, לתת להם דרך לשאת עמם משהו משמעותי ומיוחד."
              : "We believe that jewelry is much more than a beautiful accessory. It is a symbol of identity, an expression of faith, and a bridge between tradition and the present. Each of our creations is born from a desire to connect people to their roots, to give them a way to carry something meaningful and special with them."}
          </p>
          <p>
            {language === "he"
              ? "אנו כאן כדי ליצור עבורכם לא רק תכשיט יפה, אלא חוויה של חיבור, משמעות והשראה. בואו תהיו חלק מהסיפור שלנו, ובואו ניצור יחד משהו שיישאר איתכם לתמיד."
              : "We are here to create for you not just a beautiful piece of jewelry, but an experience of connection, meaning, and inspiration. Come be part of our story, and let us create together something that will stay with you forever."}
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
