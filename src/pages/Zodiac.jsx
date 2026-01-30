import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GiRam,
  GiBull,
  GiGemini,
  GiCrab,
  GiLion,
  GiWheat,
  GiScales,
  GiScorpion,
  GiBowArrow,
  GiGoat,
  GiWaterDrop,
  GiSeahorse,
} from "react-icons/gi";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Zodiac.css";

function Zodiac() {
  const { t, language } = useLanguage();
  const [selectedZodiac, setSelectedZodiac] = useState(null);
  const navigate = useNavigate();

  // Define zodiac data structure
  const getZodiacSigns = () => [
    {
      name: "טלה",
      nameEn: "Aries",
      icon: <GiRam />,
      month: language === "he" ? "ניסן" : "Nisan",
      dates: language === "he" ? "20.3-19.4" : "March 20 - April 19",
      tribe: language === "he" ? "ראובן" : "Reuben",
      planet: language === "he" ? "מאדים" : "Mars",
      stone: language === "he" ? "רובי / אודם" : "Ruby",
      element: language === "he" ? "אש" : "Fire",
      description:
        language === "he"
          ? "יוזם, מנהיג, יצירתי, חכם, נוטה לחסד, בעל מחשבה מופשטת, יודע להניע דברים, בעל נדיבות, רחב לב, עקשן, גאה, יהיר קיצוני, עז, פורץ דרך, פורץ מסגרות, הרפתקני, פעיל חברתי, בעל יכולת התאוששות מהירה."
          : "Initiator, leader, creative, wise, tends to kindness, abstract thinker, knows how to motivate, generous, broad-hearted, stubborn, proud, extreme, strong, groundbreaking, adventurous, socially active, with quick recovery ability.",
      stoneDescription:
        language === "he"
          ? "מקושרת לפריון במובן הרחב של המילה - פריחה, צמיחה, יישום רעיונות ומטרות, שגשוג אישי. מעניקה יציבות ועמידות, תחושה של 'כאן ועכשיו'. מחזקת עוצמה אישית, כריזמה וזוהר פנימי."
          : "Associated with fertility in the broad sense - blooming, growth, implementation of ideas and goals, personal prosperity. Provides stability and resilience, a sense of 'here and now'. Strengthens personal power, charisma and inner radiance.",
    },
    {
      name: "שור",
      nameEn: "Taurus",
      icon: <GiBull />,
      month: language === "he" ? "אייר" : "Iyar",
      dates: language === "he" ? "20.4-20.5" : "April 20 - May 20",
      tribe: language === "he" ? "שמעון" : "Simeon",
      planet: language === "he" ? "נוגה" : "Venus",
      stone: language === "he" ? "פטדה / טופז" : "Topaz",
      element: language === "he" ? "אדמה" : "Earth",
      description:
        language === "he"
          ? "בעל רצון חזק לתועלתו, מחפש ביטחון ומסגרת יציבה, פשוט, שגרתי, מאופיין במזג נוח ובחמימות, ההמון חשוב בעיניו, בעל צד חומרי וחפץ בתענוגות, רגוע, דיסקרטי, אוהב נוחות, אוהב טבע, חושני ועקשן."
          : "Strong-willed for their benefit, seeks security and stable framework, simple, routine, characterized by pleasant temperament and warmth, the crowd is important to them, materialistic and desires pleasures, calm, discreet, loves comfort, loves nature, sensual and stubborn.",
      stoneDescription:
        language === "he"
          ? "אבן חזקה, מחזקת כוח רצון, אינטלקט ומוטיבציה. מקלה על האוחז בה את ההתאמה למצבים ואת מציאת היופי הנכון. מעניקה תחושה של יופי פנימי מוביל לחיזוק ביטחון עצמי בעשייה."
          : "Strong stone, strengthens willpower, intellect and motivation. Helps the bearer adapt to situations and find the right beauty. Provides a sense of inner beauty leading to strengthening self-confidence in action.",
    },
    {
      name: "תאומים",
      nameEn: "Gemini",
      icon: <GiGemini />,
      month: language === "he" ? "סיוון" : "Sivan",
      dates: language === "he" ? "21.5-21.6" : "May 21 - June 21",
      tribe: language === "he" ? "לוי" : "Levi",
      planet: language === "he" ? "חמה" : "Mercury",
      stone: language === "he" ? "אמרלד / ברקת" : "Emerald",
      element: language === "he" ? "אוויר" : "Air",
      description:
        language === "he"
          ? "חברותי, מעניין וקליל. נעים ומקרין שמחת חיים. בעל אינטליגנציה שכלית, מבין ומעכל מצבים ויודע להגיב באופן מיידי למתרחש. בעל כושר שכנוע, חסר מנוחה ונמצא בתנועה. דברן, בעל שתי דמויות."
          : "Social, interesting and light. Pleasant and radiates joy of life. Has intellectual intelligence, understands and processes situations and knows how to respond immediately. Persuasive, restless and in motion. Talkative, has two personalities.",
      stoneDescription:
        language === "he"
          ? "מקושרת לאופטימיות ועוצמה. מחזקת יכולת של הבעה עצמית וזיכרון. מעניקה חוזק וחוסן רגשי ומנטלי. מקלה על הלחץ בזמן עבודה מול אחרים או עמם. מעודדת נאמנות ונתינה."
          : "Associated with optimism and power. Strengthens self-expression and memory. Provides emotional and mental strength. Relieves pressure when working with or opposite others. Encourages loyalty and giving.",
    },
    {
      name: "סרטן",
      nameEn: "Cancer",
      icon: <GiCrab />,
      month: language === "he" ? "תמוז" : "Tammuz",
      dates: language === "he" ? "22.6-22.7" : "June 22 - July 22",
      tribe: language === "he" ? "יהודה" : "Judah",
      planet: language === "he" ? "לבנה" : "Moon",
      stone: language === "he" ? "נפך / גראנט" : "Garnet",
      element: language === "he" ? "מים" : "Water",
      description:
        language === "he"
          ? "טיפוס ביתי, השואף לביטחון, שואף למסגרת יציבה, בעל עוצמה רגשית גבוהה, נוטה לרגשות יתר, נוטה למצבי רוח משתנים, אינו סובל ביקורת, עשוי להיות פזיז, חסר יציבות, עצבני, פחדן, פגיע, בעל שריון רגשי, בעל יכולת חמימות."
          : "Homebody type, striving for security, aspires to stable framework, has high emotional power, tends to over-emotion, prone to mood swings, doesn't tolerate criticism, may be impulsive, unstable, nervous, fearful, vulnerable, has emotional armor, capable of warmth.",
      stoneDescription:
        language === "he"
          ? "מחזקת ביטחון עצמי וכוח רצון. טובה לעמידה בלחצים ואתגרים חדשים. מחברת את האדם לאמת גבוהה. מחזקת גוף חלש ומאזנת את מערכת הדם. מחזקת יכולת של קבלת החלטות ושל שמירה על עמדה אישית."
          : "Strengthens self-confidence and willpower. Good for withstanding pressures and new challenges. Connects person to higher truth. Strengthens weak body and balances blood system. Strengthens decision-making ability and maintaining personal stance.",
    },
    {
      name: "אריה",
      nameEn: "Leo",
      icon: <GiLion />,
      month: language === "he" ? "אב" : "Av",
      dates: language === "he" ? "23.7-23.8" : "July 23 - August 23",
      tribe: language === "he" ? "יששכר" : "Issachar",
      planet: language === "he" ? "שמש" : "Sun",
      stone: language === "he" ? "ספיר" : "Sapphire",
      element: language === "he" ? "אש" : "Fire",
      description:
        language === "he"
          ? "אוהב שליטה, עוצמה, אגו ופאר, טיפוס מלכות השואף להרשים את הסביבה, ראוותן, אוהב מותרות, כריזמטי, אופטימי, מנהיג, יצירתי ומוחצן, נאמן לאמונותיו."
          : "Loves control, power, ego and glory, royal type striving to impress surroundings, showy, loves luxury, charismatic, optimistic, leader, creative and outgoing, loyal to their beliefs.",
      stoneDescription:
        language === "he"
          ? "מחזקת חוכמה, אינטלקט, יכולת חשיבה ומיקוד. מסייעת בחשיבה על פתרונות ויישומם. מחזקת החלטיות, יכולת הישרדות, אומץ והתמודדות תוך שמירה על מיקוד ואיזון. מעודדת הבעה עצמית ומשמעת עצמית."
          : "Strengthens wisdom, intellect, thinking ability and focus. Helps thinking about solutions and implementing them. Strengthens decisiveness, survival ability, courage and coping while maintaining focus and balance. Encourages self-expression and self-discipline.",
    },
    {
      name: "בתולה",
      nameEn: "Virgo",
      icon: <GiWheat />,
      month: language === "he" ? "אלול" : "Elul",
      dates: language === "he" ? "24.8-22.9" : "August 24 - September 22",
      tribe: language === "he" ? "זבולון" : "Zebulun",
      planet: language === "he" ? "חמה" : "Mercury",
      stone: language === "he" ? "יהלום" : "Diamond",
      element: language === "he" ? "אדמה" : "Earth",
      description:
        language === "he"
          ? "שיפוטי, ביקרותי, דקדקן, יעיל, יצירתי, שואף לשלמות, מחפש ליצור סדר וצדק, בעל ביקורת נוקבת, אף בתמימות, דאגן ומטבעו, בעל נפש לא רגועה, נוטה להיקשר לחומר, אדיב, נאמן, יורד לפרטים, חרוץ, צנוע ועוזר לזולת."
          : "Judgmental, critical, meticulous, efficient, creative, striving for perfection, seeks to create order and justice, has sharp criticism even naively, worrier by nature, has restless soul, tends to connect to matter, kind, loyal, goes into details, diligent, modest and helps others.",
      stoneDescription:
        language === "he"
          ? "משדר עוצמה. התדר שלה משדר בו זמנית עוצמה, רוך ועידון. מסמלת נאמנות זוגית ונאמנות באהבה בכלל. מחזקת את ההילה. אבן היהלום נחשבת באופן כללי כאבן שפע. מעודדת איזון, חילוף החומרים בגוף."
          : "Radiates power. Its frequency simultaneously radiates power, softness and refinement. Symbolizes marital fidelity and faithfulness in love in general. Strengthens the aura. The diamond stone is generally considered an abundance stone. Encourages balance, metabolism in the body.",
    },
    {
      name: "מאזניים",
      nameEn: "Libra",
      icon: <GiScales />,
      month: language === "he" ? "תשרי" : "Tishrei",
      dates: language === "he" ? "23.9-23.10" : "September 23 - October 23",
      tribe: language === "he" ? "בנימין" : "Benjamin",
      planet: language === "he" ? "נוגה" : "Venus",
      stone: language === "he" ? "ישפה / לאפיס" : "Jasper / Lapis",
      element: language === "he" ? "אוויר" : "Air",
      description:
        language === "he"
          ? "הססנות, פשרנות, איזון, גמישות, התחשבות, חברותיות, אמינות, נעימות, אהוב על הבריות, אוהב ליצור קשרים חברתיים קרובים, נוח להשפעה, חודד לטעות, אינטליגנט, תרבותי, אוהב הרמוניה ושואף לאיזון."
          : "Hesitant, compromising, balanced, flexible, considerate, sociable, reliable, pleasant, loved by people, likes to create close social connections, easily influenced, sharp to mistakes, intelligent, cultured, loves harmony and strives for balance.",
      stoneDescription:
        language === "he"
          ? "קשורה לאיזון, מקרקעת. מסמלת חיבור לאדמה, כוח חיים בסיסי והגנה מפני אנרגיות שליליות. מצוינת למצבי דלדול אנרגטי וטובה ללוות מדיטציה ומגבירה חושניות ומאזנת את החשק המיני. מגבירה את המוטיבציה והחשק ליצור בהיבט המקצועי."
          : "Related to balance, grounding. Symbolizes connection to earth, basic life force and protection from negative energies. Excellent for energy depletion states and good to accompany meditation and increases sensuality and balances sexual desire.",
    },
    {
      name: "עקרב",
      nameEn: "Scorpio",
      icon: <GiScorpion />,
      month: language === "he" ? "חשוון" : "Cheshvan",
      dates: language === "he" ? "24.10-22.11" : "October 24 - November 22",
      tribe: language === "he" ? "דן" : "Dan",
      planet: language === "he" ? "מאדים" : "Mars",
      stone: language === "he" ? "לשם / אופל" : "Opal",
      element: language === "he" ? "מים" : "Water",
      description:
        language === "he"
          ? "רגש עז סוער, קיצוני, חי במתח פנימי, מאופק, נע על ידי אינטואיציה, בעל רגשות קוטביים, בעל כוח אנרגטי חודר לעומקים, בעל שאיפות, נמשך לנסתר, מתמודד טוב עם משברים, בעל תשוקה."
          : "Intense stormy emotion, extreme, lives in internal tension, reserved, moved by intuition, has polar emotions, has energetic power penetrating depths, ambitious, drawn to hidden, copes well with crises, passionate.",
      stoneDescription:
        language === "he"
          ? "אחוז גבוה מאבן האופל הוא מים המייצגים רגש ונשיות. נחשבת לאבן מעוררת ומתגברת המעצימה כל תכונה ומצב אנרגטי אצל הנושא אותה. מגבירה יצירתיות ודמיון, עוזרת להתגבר על הצדדים האפלים ביותר בנפש."
          : "High percentage of opal stone is water representing emotion and femininity. Considered an awakening and increasing stone that amplifies every trait and energetic state in its wearer. Increases creativity and imagination, helps overcome the darkest sides of the soul.",
    },
    {
      name: "קשת",
      nameEn: "Sagittarius",
      icon: <GiBowArrow />,
      month: language === "he" ? "כסלו" : "Kislev",
      dates: language === "he" ? "23.11-21.12" : "November 23 - December 21",
      tribe: language === "he" ? "נפתלי" : "Naphtali",
      planet: language === "he" ? "צדק" : "Jupiter",
      stone: language === "he" ? "שבו / אגט" : "Agate",
      element: language === "he" ? "אש" : "Fire",
      description:
        language === "he"
          ? "בעל ביטחון עצמי ואנרגיה, תמיד שואף קדימה, הרפתקן, אוהב להתחדש, לא אוהב גבולות, מעוניין בחופש ודואג להציב חוקים ולמצוא חופש פעולה במסגרת חייו, אופטימי, שוחר צדק, נלהב ושמח."
          : "Has self-confidence and energy, always striving forward, adventurer, loves to renew, doesn't like boundaries, interested in freedom and cares to set laws and find freedom of action within their life framework, optimistic, justice-loving, enthusiastic and happy.",
      stoneDescription:
        language === "he"
          ? "קשורה לשחרור מהלוגיקה, מסייעת בשינוי בפתיחות. משדרת מעין מעבר מחשיבה לוגית לחשיבה משוחררת יותר המאפשרת קבלה של האחר והחדש ובכך להגיע לכוחות אנרגטיים גבוהים יותר. טובה לבריאות ולאיזון כללי."
          : "Related to liberation from logic, helps in change with openness. Radiates a kind of transition from logical thinking to more liberated thinking that allows acceptance of the other and new and thus reaching higher energetic powers. Good for health and general balance.",
    },
    {
      name: "גדי",
      nameEn: "Capricorn",
      icon: <GiGoat />,
      month: language === "he" ? "טבת" : "Tevet",
      dates: language === "he" ? "22.12-20.1" : "December 22 - January 20",
      tribe: language === "he" ? "גד" : "Gad",
      planet: language === "he" ? "שבתאי" : "Saturn",
      stone: language === "he" ? "אחלמה / אמטיסט" : "Amethyst",
      element: language === "he" ? "אדמה" : "Earth",
      description:
        language === "he"
          ? "רצון עז להישגים, לממון ולעשירות, ביקורתי, שיפוטי ומחמיר, נוטה להעצב ולכעוס על שהתאכזב מעצמו, אחראי, מציאותי, יציב, בוגר, חסר ביטחון, מחפש יציבות, חומרי במידה רבה ובעל יכולת לעבוד לטווח ארוך."
          : "Strong desire for achievements, wealth and riches, critical, judgmental and strict, tends to be sad and angry for disappointing themselves, responsible, realistic, stable, mature, insecure, seeks stability, very material and capable of working long-term.",
      stoneDescription:
        language === "he"
          ? "מחזקת כוח רצון, שליטה עצמית, אומץ ואינטואיציה. מעודדת חלומות טובים ושינה רגועה. מעניקה הגנה כללית. טובה לאיזון כללי ולבריאות כללית. מקלה כאבי ראש. מאזנת את המערכת המטבולית ואת מערכת השמיעה."
          : "Strengthens willpower, self-control, courage and intuition. Encourages good dreams and peaceful sleep. Provides general protection. Good for general balance and general health. Relieves headaches. Balances the metabolic system and hearing system.",
    },
    {
      name: "דלי",
      nameEn: "Aquarius",
      icon: <GiWaterDrop />,
      month: language === "he" ? "שבט" : "Shevat",
      dates: language === "he" ? "21.1-18.2" : "January 21 - February 18",
      tribe: language === "he" ? "אשר" : "Asher",
      planet: language === "he" ? "שבתאי" : "Saturn",
      stone: language === "he" ? "תרשיש / אקווה מרין" : "Aquamarine",
      element: language === "he" ? "אוויר" : "Air",
      description:
        language === "he"
          ? "מפתיע ולא שגרתי, פורץ מסגרות, פורץ גבולות, בעל סקרנות, בעל חשיבה אנליטית מפותחת, אוהב חופש ועצמאות, אוהב אנשים אך נבדל, חביב על הסביבה אך חסר מעט רגישות לזולת, ייחודי וקיצוני, אוהב להיות במרכז."
          : "Surprising and non-routine, breaks frameworks, breaks boundaries, curious, has developed analytical thinking, loves freedom and independence, loves people but separated, liked by surroundings but lacks some sensitivity to others, unique and extreme, loves being center.",
      stoneDescription:
        language === "he"
          ? "מרגיעה, מעניקה שלווה פנימית עמוקה המלווה בתחושת נוחות וביטחון. מעודדת זרימה בחיים, גם במצבים מאתגרים תוך כדי הענקת יכולת להתמודד בשלווה. מצמצמת תחושת מבוכה. מחזקת אינטלקט."
          : "Calming, provides deep inner peace accompanied by feeling of comfort and security. Encourages flow in life, even in challenging situations while providing ability to cope peacefully. Reduces feeling of confusion. Strengthens intellect.",
    },
    {
      name: "דגים",
      nameEn: "Pisces",
      icon: <GiSeahorse />,
      month: language === "he" ? "אדר" : "Adar",
      dates: language === "he" ? "19.2-19.3" : "February 19 - March 19",
      tribe: language === "he" ? "יוסף" : "Joseph",
      planet: language === "he" ? "צדק" : "Jupiter",
      stone: language === "he" ? "אונקס / שוהם" : "Onyx",
      element: language === "he" ? "מים" : "Water",
      description:
        language === "he"
          ? "רגיש ומבין את הנפש, יכולת הסתגלות למצבים ולנסיבות, סבלני ומזדהה עם מצוקת הזולת, סלחן, ותרן, גמיש, נוטה לדואליות רגשית ולסתירות, אהבה ודחייה מסובבים סביבו, נשמתו גבוהה מאוד ונמשך לרוחניות."
          : "Sensitive and understands soul, ability to adapt to situations and circumstances, patient and identifies with others' distress, forgiving, compromising, flexible, tends to emotional duality and contradictions, love and rejection revolve around them, their soul is very high and drawn to spirituality.",
      stoneDescription:
        language === "he"
          ? "מקרקעת ומעניקה יציבות פיזית, רגשית ומנטלית. שומרת על איזון ומעניקה הגנה מפני אנרגיות שבסביבה. מעניקה תחושות של אומץ, של ביטחון ושל קשר למציאות. מקלה שליטה עצמית וקבלת החלטות תוך תחושת ביטחון."
          : "Grounding and provides physical, emotional and mental stability. Maintains balance and provides protection from energies in environment. Provides feelings of courage, security and connection to reality. Facilitates self-control and decision-making with feeling of confidence.",
    },
  ];

  // Get zodiac signs with current language
  const zodiacSigns = getZodiacSigns();

  const handleZodiacSelect = (zodiac) => {
    setSelectedZodiac(zodiac);
  };

  const handleViewProducts = () => {
    navigate("/shop", { state: { zodiacFilter: selectedZodiac.name } });
  };

  return (
    <div className="zodiac-page">
      <div className="container">
        <div className="zodiac-header">
          <h1>
            {language === "he"
              ? "מזלות וחודשים עבריים"
              : "Zodiac Signs & Hebrew Months"}
          </h1>
          <p>
            {language === "he"
              ? "גלה את המזל שלך ואת אבן החושן המיוחדת לחודש הלידה העברי שלך"
              : "Discover your zodiac sign and the special Hoshen stone for your Hebrew birth month"}
          </p>
        </div>

        <div className="zodiac-container">
          {selectedZodiac && (
            <div className="selected-zodiac-info">
              <div className="zodiac-icon-large">{selectedZodiac.icon}</div>
              <h2>
                {language === "he"
                  ? `מזל ${selectedZodiac.name}`
                  : `${selectedZodiac.nameEn}`}
              </h2>
              <div className="zodiac-details">
                <p className="zodiac-dates">{selectedZodiac.dates}</p>
                <p>
                  <strong>{language === "he" ? "חודש:" : "Month:"}</strong>{" "}
                  {selectedZodiac.month}
                </p>
                <p>
                  <strong>{language === "he" ? "שבט:" : "Tribe:"}</strong>{" "}
                  {selectedZodiac.tribe}
                </p>
                <p>
                  <strong>{language === "he" ? "כוכב:" : "Planet:"}</strong>{" "}
                  {selectedZodiac.planet}
                </p>
                <p>
                  <strong>
                    {language === "he" ? "אבן חושן:" : "Hoshen Stone:"}
                  </strong>{" "}
                  {selectedZodiac.stone}
                </p>
                <p>
                  <strong>{language === "he" ? "יסוד:" : "Element:"}</strong>{" "}
                  {selectedZodiac.element}
                </p>
              </div>

              <div className="zodiac-description">
                <h3>{language === "he" ? "תכונות המזל:" : "Zodiac Traits:"}</h3>
                <p>{selectedZodiac.description}</p>
              </div>

              <div className="stone-description">
                <h3>
                  {language === "he"
                    ? `אבן החושן - ${selectedZodiac.stone}:`
                    : `Hoshen Stone - ${selectedZodiac.stone}:`}
                </h3>
                <p>{selectedZodiac.stoneDescription}</p>
              </div>

              <button
                className="view-products-btn"
                onClick={handleViewProducts}
              >
                {language === "he"
                  ? `צפה בתכשיטים למזל ${selectedZodiac.name}`
                  : `View ${selectedZodiac.nameEn} Jewelry`}
              </button>
            </div>
          )}

          <div className="zodiac-wheel">
            {zodiacSigns.map((sign) => (
              <div
                key={sign.name}
                className={`zodiac-sign ${
                  selectedZodiac?.name === sign.name ? "selected" : ""
                }`}
                onClick={() => handleZodiacSelect(sign)}
              >
                <div className="zodiac-icon">{sign.icon}</div>
                <div className="zodiac-name">
                  {language === "he" ? sign.name : sign.nameEn}
                </div>
                <div className="zodiac-month">{sign.month}</div>
                <div className="zodiac-dates">{sign.dates}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Zodiac;
