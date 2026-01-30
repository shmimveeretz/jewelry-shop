import "../styles/pages/About.css";
import { FaHeart, FaUsers, FaStar, FaHandshake } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

function About() {
  const { t, language } = useLanguage();

  const values = [
    {
      icon: <FaHeart />,
      title: language === "he" ? "אהבה ואמונה" : "Love and Faith",
      description:
        language === "he"
          ? "כל יצירה שלנו נולדת מתוך אהבה עמוקה ליהדות ואמונה במשמעות של כל תכשיט"
          : "Each of our creations is born from deep love for Judaism and belief in the meaning of each piece of jewelry",
    },
    {
      icon: <FaUsers />,
      title:
        language === "he"
          ? "חיבור בין דורות"
          : "Connection Between Generations",
      description:
        language === "he"
          ? "אנחנו משלבות חכמה של שנים עם תשוקה צעירה לחדשנות ויצירתיות"
          : "We combine the wisdom of years with youthful passion for innovation and creativity",
    },
    {
      icon: <FaStar />,
      title: language === "he" ? "רוחניות ומשמעות" : "Spirituality and Meaning",
      description:
        language === "he"
          ? "יצרנו מרחב שמזמין לעצור, להרגיש ולחוות משהו פנימי ואמיתי"
          : "We created a space that invites you to pause, feel, and experience something inner and authentic",
    },
    {
      icon: <FaHandshake />,
      title: language === "he" ? "קשר אישי" : "Personal Connection",
      description:
        language === "he"
          ? "אנחנו מאמינות בכוח של קשר אנושי וביצירת חוויה משמעותית לכל לקוח"
          : "We believe in the power of human connection and creating a meaningful experience for every customer",
    },
  ];

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
              ? "הערכים שמנחים אותנו"
              : "The Values That Guide Us"}
          </h2>
          <div className="about-values">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
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
