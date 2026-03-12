import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const translations = {
  he: {
    // Navbar
    home: "בית",
    shop: "חנות",
    zodiac: "גלגל המזלות",
    story: "הסיפור שלנו",
    about: "אודות",
    cart: "עגלה",
    login: "התחברות",
    logout: "התנתקות",
    admin: "ניהול",

    // Home Page
    heroTitle: "שמיים וארץ",
    heroSubtitle: "תכשיטים בעבודת יד עם אבני חן אמיתיות",
    heroDescription:
      "גלו את הקולקציה הייחודית שלנו של תכשיטים מעוצבים בקפידה, המשלבים יופי טבעי עם אומנות מסורתית",
    shopNow: "לחנות",
    featuredProducts: "מוצרים מומלצים",
    whyChooseUs: "למה לבחור בנו?",
    handcrafted: "עבודת יד",
    handcraftedDesc: "כל תכשיט נוצר בקפידה בעבודת יד",
    gemstones: "אבני חן אמיתיות",
    gemstonesDesc: "רק אבני חן טבעיות ואיכותיות",
    unique: "עיצובים ייחודיים",
    uniqueDesc: "כל פריט הוא יצירת אומנות מיוחדת",

    // Shop Page
    shopTitle: "החנות שלנו",
    shopSubtitle: "עיין בקולקציה המלאה של התכשיטים שלנו",
    allCategories: "כל הקטגוריות",
    necklaces: "שרשראות",
    bracelets: "צמידים",
    rings: "טבעות",
    earrings: "עגילים",
    sortBy: "מיין לפי",
    featured: "מומלצים",
    priceLowToHigh: "מחיר: נמוך לגבוה",
    priceHighToLow: "מחיר: גבוה לנמוך",
    newest: "חדשים ביותר",
    noProducts: "לא נמצאו מוצרים",
    loading: "טוען...",

    // Product Modal
    quickView: "צפייה מהירה",
    addToCart: "הוסף לעגלה",
    quantity: "כמות",
    description: "תיאור",
    materials: "חומרים",
    dimensions: "מידות",
    close: "סגור",

    // Cart Page
    shoppingCart: "עגלת קניות",
    yourCart: "העגלה שלך",
    emptyCart: "העגלה ריקה",
    startShopping: "התחל לקנות",
    product: "מוצר",
    price: "מחיר",
    total: 'סה"כ',
    remove: "הסר",
    orderSummary: "סיכום הזמנה",
    subtotal: "סכום ביניים",
    shipping: "משלוח",
    free: "חינם",
    proceedToCheckout: "המשך לתשלום",

    // Auth Page
    welcomeBack: "ברוכים השבים",
    loginToContinue: "התחבר כדי להמשיך",
    createAccount: "צור חשבון",
    joinUs: "הצטרף אלינו היום",
    "name": "שם מלא",
    email: "אימייל",
    password: "סיסמה",
    confirmPassword: "אימות סיסמה",
    rememberMe: "זכור אותי",
    forgotPassword: "שכחת סיסמה?",
    signIn: "התחבר",
    signUp: "הרשם",
    dontHaveAccount: "אין לך חשבון?",
    alreadyHaveAccount: "כבר יש לך חשבון?",

    // Checkout Page
    checkout: "תשלום",
    shippingInfo: "פרטי משלוח",
    paymentMethod: "אמצעי תשלום",
    creditCard: "כרטיס אשראי",
    paypal: "PayPal",
    bankTransfer: "העברה בנקאית",
    cardNumber: "מספר כרטיס",
    expiryDate: "תוקף",
    cvv: "CVV",
    placeOrder: "בצע הזמנה",

    // About Page
    aboutUs: "אודותינו",
    ourStory: "הסיפור שלנו",
    ourMission: "המשימה שלנו",
    ourVision: "החזון שלנו",

    // Story Page
    journeyTitle: "המסע שלנו",
    journeySubtitle: "מאהבה לתכשיטים לעסק משגשג",

    // Zodiac Page
    zodiacTitle: "קולקציית הזודיאק",
    zodiacSubtitle: "מצא את התכשיט המושלם לפי המזל שלך",
    findYourSign: "מצא את המזל שלך",

    // Contact
    contactUs: "צור קשר",
    getInTouch: "צור איתנו קשר",
    message: "הודעה",
    send: "שלח",
    phone: "טלפון",
    address: "כתובת",
    followUs: "עקוב אחרינו",

    // Toast Messages
    loginSuccess: "התחברת בהצלחה",
    logoutSuccess: "התנתקת בהצלחה",
    registerSuccess: "נרשמת בהצלחה",
    addedToCart: "נוסף לעגלה",
    removedFromCart: "הוסר מהעגלה",
    error: "שגיאה",

    // Admin
    dashboard: "לוח בקרה",
    products: "מוצרים",
    orders: "הזמנות",
    customers: "לקוחות",
    addProduct: "הוסף מוצר",
    editProduct: "ערוך מוצר",
    deleteProduct: "מחק מוצר",

    // Footer
    quickLinks: "קישורים מהירים",
    customerService: "שירות לקוחות",
    returnPolicy: "מדיניות החזרות",
    privacyPolicy: "מדיניות פרטיות",
    termsOfService: "תנאי שימוש",
    allRightsReserved: "כל הזכויות שמורות",

    // Additional Shop/Product translations
    all: "הכל",
    filters: "מסננים",
    showFilters: "הצג מסננים",
    hideFilters: "הסתר מסננים",
    category: "קטגוריה",
    priceRange: "טווח מחירים",
    metalType: "סוג מתכת",
    lowPrice: "עד 500 ₪",
    mediumPrice: "500-1000 ₪",
    highPrice: "מעל 1000 ₪",

    // Contact Form
    full"name": "שם מלא",
    phoneNumber: "טלפון",
    subject: "נושא",
    yourMessage: "ההודעה שלך",
    sendMessage: "שלח הודעה",
    required: "שדה חובה",
    messageSent: "ההודעה נשלחה בהצלחה",
    messageFailed: "שליחת ההודעה נכשלה",

    // Product Options
    length: "אורך",
    metal: "מתכת",
    chainType: "סוג שרשרת",
    waxColor: "צבע שעווה",
    selectOption: "בחר אפשרות",
    requiredField: "שדה נדרש",

    // Auth Messages
    passwordMismatch: "הסיסמאות אינן תואמות",
    loginError: "שגיאה בהתחברות",
    registerError: "שגיאה ברישום",
    hello: "שלום",
    goodbye: "להתראות",
    user: "משתמש",

    // Accessibility Statement
    accessibility: "הצהרת נגישות",
    accessibilityStatement: "הצהרת נגישות",
    aboutSite: "על אתר שמיים וארץ",
    siteUrl: "https://shamaimveeretz.com",
    accessibilityPurpose: "מטרת הנגישות",
    standards: "תקנים וקובעי תקנים",
    accessibilityLevel: "רמת הנגישות באתר: AA",
    company: "Vee הנגשת אתרים",
    regulationText: 'תקנות שוויון זכויות לאנשים עם מוגבלות 5568 התשע"ג 2013',
    wcagGuidelines: "הנחיות לנגישות תכנים באינטרנט",
    wcagAcronym: "Web Content Accessibility Guidelines (WCAG) 2.0",
    authorityGuidelines: "הנחיות רשות התקשוב להנגשת יישומים בדפדפני אינטרנט",
    accessibleMode: "כיצד עוברים למצב נגיש?",
    screenReaders: "קוראי מסך",
    stopBlinking: "עצירת הבהובים",
    skipToContent: "דילוג ישיר לתוכן",
    keyboardNavigation: "התאמה לניווט מקלדת",
    textSize: "הגדלה / הקטנה של טקסט",
    spacing: "ריווח בין אותיות / מילים / שורות",
    contrast: "ניגודיות וצבע",
    readableFont: "גופן קריא",
    linkHighlight: "הדגשת קישורים",
    readingGuide: "מדריך קריאה",
    cursorIcon: "שינוי אייקון סמן עכבר",
    imageDescription: "תיאור לתמונות",
    adjustments: "תיקונים והתאמות שבוצעו באתר",
    screenReaderSupport:
      "התאמה לקורא מסך - התאמת האתר עבור טכנולוגיות מסייעות כגון NVDA, JAWS",
    simpleNavigation: "אמצעי הניווט באתר פשוטים וברורים",
    clearContent: "תכני האתר כתובים באופן ברור, מסודר והיררכי",
    modernBrowsers: "האתר מותאם לצפייה בדפדפנים מודרניים",
    responsiveDesign: "התאמת האתר לתצוגה תואמת מגוון מסכים ורזולוציות",
    headerStructure: "כל הדפים באתר בעלי מבנה קבוע (1H/2H/3H וכו')",
    altText: "לכל התמונות באתר יש הסבר טקסטואלי חלופי (alt)",
    softwareFunctionality: "פונקציונליות תוכנת נגישות",
    highContrast: "גבוהה",
    inverted: "הפוכה",
    blackAndWhite: "שחור לבן",
    exceptions: "החרגות",
    contactAccessibility: "יצירת קשר בנושא נגישות",
    problemDescription: "תיאור הבעיה",
    attemptedAction: "מהי הפעולה שניסיתם לבצע",
    pageLink: "קישור לדף שבו גלשתם",
    browserType: "סוג הדפדפן וגרסתו",
    operatingSystem: "מערכת הפעלה",
    assistiveTechnology: "סוג הטכנולוגיה המסייעת (במידה והשתמשתם)",
    improvementEfforts:
      "שמיים וארץ תעשה ככל יכולה על מנת להנגיש את האתר בצורה המיטבית ולענות לפניות בצורה המקצועית והמהירה ביותר",
    accessibilityChampion: "רכז נגישות",
    phone: "טלפון",
    lastUpdate: "תאריך עדכון הצהרת נגישות",
    percentageDisability:
      "במדינת ישראל כ-20 אחוזים מקרב האוכלוסייה הינם אנשים עם מוגבלות",
    makeAvailable: "להפוך את שירותי החברה לזמינים יותר עבור אנשים עם מוגבלות",
    motorDisabilities: "מוגבלויות מוטוריות שונות",
    cognitiveImpairments: "לקויות קוגניטיביות",
    colorBlindness: "קוצר רואי, עיוורון או עיוורון צבעים",
    hearingImpairments: "לקויות שמיעה",
    elderly: "אוכלוסייה הנמנית על בני הגיל השלישי",
    veeCompany: "Vee",
    browsers: "Chrome, Firefox, Safari, Opera",
    chromeRecommendation: "הגלישה במצב נגישות מומלצת בדפדפן כרום",
    semanticStructure: "מבנה סמנטי",
    keyboardSupport: "תמיכה בדפוס השימוש המקובל להפעלה עם מקלדת",
    arrowKeys: "מקשי החיצים",
    nvidaScreen: "תוכנת NVDA",
    latestVersion: "העדכנית ביותר",
    bestBrowsingExperience: "חווית גלישה מיטבית עם תוכנת הקראת מסך",
    recommendNvda: "אנו ממליצים לשימוש בתוכנת NVDA העדכנית ביותר",
    ourValueEqual:
      "אנו רואים חשיבות רבה במתן שירות שוויוני לכלל האזרחים ובשיפור השירות הניתן לאזרחים עם מוגבלות",
    investingResources:
      "אנו משקיעים משאבים רבים בהנגשת האתר והנכסים הדיגיטליים שלנו",
    accessibilityIcon: 'באתר מוצב אייקון נגישות (בד"כ בדפנות האתר)',
    accessibilityMenu: "לחיצה על האייקון מאפשרת פתיחת של תפריט הנגישות",
    selectFunction: "לאחר בחירת הפונקציה המתאימה בתפריט",
    awaitLoading: "יש להמתין לטעינת הדף ולשינוי הרצוי בתצוגה (במידת הצורך)",
    cancelAction:
      "במידה ומעוניינים לבטל את הפעולה, יש ללחוץ על הפונקציה בתפריט פעם שניה",
    resetSettings: "בכל מצב, ניתן לאפס הגדרות נגישות",
    worksOnBrowsers: "התוכנה פועלת בדפדפנים הפופולריים",
    browserConditions: "בכפוף (תנאי יצרן)",
    getInTouchAccessibility:
      "על מנת שנוכל לטפל בבעיה בדרך הטובה ביותר, אנו ממליצים מאוד לצרף פרטים מלאים ככל שניתן",
    possibleIssues:
      "חשוב לציין, כי למרות מאמצינו להנגיש את כלל הדפים והאלמנטים באתר, ייתכן שיתגלו חלקים או יכולות שלא הונגשו כראוי או שטרם הונגשו",
    continuousImprovement:
      "אנו פועלים לשפר את נגישות האתר שלנו כל העת, כחלק ממחויבותנו לאפשר לכלל האוכלוסייה להשתמש בו, כולל אנשים עם מוגבלות",
  },
  en: {
    // Navbar
    home: "Home",
    shop: "Shop",
    zodiac: "Zodiac",
    story: "Our Story",
    about: "About",
    cart: "Cart",
    login: "Login",
    logout: "Logout",
    admin: "Admin",

    // Home Page
    heroTitle: "Shamaim VeEretz",
    heroSubtitle: "Handcrafted Jewelry with Authentic Gemstones",
    heroDescription:
      "Discover our unique collection of carefully designed jewelry, combining natural beauty with traditional craftsmanship",
    shopNow: "Shop Now",
    featuredProducts: "Featured Products",
    whyChooseUs: "Why Choose Us?",
    handcrafted: "Handcrafted",
    handcraftedDesc: "Each piece is carefully handcrafted",
    gemstones: "Authentic Gemstones",
    gemstonesDesc: "Only natural and quality gemstones",
    unique: "Unique Designs",
    uniqueDesc: "Each item is a special work of art",

    // Shop Page
    shopTitle: "Our Shop",
    shopSubtitle: "Browse our complete jewelry collection",
    allCategories: "All Categories",
    necklaces: "Necklaces",
    bracelets: "Bracelets",
    rings: "Rings",
    earrings: "Earrings",
    sortBy: "Sort By",
    featured: "Featured",
    priceLowToHigh: "Price: Low to High",
    priceHighToLow: "Price: High to Low",
    newest: "Newest",
    noProducts: "No products found",
    loading: "Loading...",

    // Product Modal
    quickView: "Quick View",
    addToCart: "Add to Cart",
    quantity: "Quantity",
    description: "Description",
    materials: "Materials",
    dimensions: "Dimensions",
    close: "Close",

    // Cart Page
    shoppingCart: "Shopping Cart",
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty",
    startShopping: "Start Shopping",
    product: "Product",
    price: "Price",
    total: "Total",
    remove: "Remove",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    proceedToCheckout: "Proceed to Checkout",

    // Auth Page
    welcomeBack: "Welcome Back",
    loginToContinue: "Login to continue",
    createAccount: "Create Account",
    joinUs: "Join us today",
    "name": "Full "name"",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password?",
    signIn: "Sign In",
    signUp: "Sign Up",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",

    // Checkout Page
    checkout: "Checkout",
    shippingInfo: "Shipping Information",
    paymentMethod: "Payment Method",
    creditCard: "Credit Card",
    paypal: "PayPal",
    bankTransfer: "Bank Transfer",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvv: "CVV",
    placeOrder: "Place Order",

    // About Page
    aboutUs: "About Us",
    ourStory: "Our Story",
    ourMission: "Our Mission",
    ourVision: "Our Vision",

    // Story Page
    journeyTitle: "Our Journey",
    journeySubtitle: "From love of jewelry to a thriving business",

    // Zodiac Page
    zodiacTitle: "Zodiac Collection",
    zodiacSubtitle: "Find the perfect jewelry for your zodiac sign",
    findYourSign: "Find Your Sign",

    // Contact
    contactUs: "Contact Us",
    getInTouch: "Get in Touch",
    message: "Message",
    send: "Send",
    phone: "Phone",
    address: "Address",
    followUs: "Follow Us",

    // Toast Messages
    loginSuccess: "Logged in successfully",
    logoutSuccess: "Logged out successfully",
    registerSuccess: "Registered successfully",
    addedToCart: "Added to cart",
    removedFromCart: "Removed from cart",
    error: "Error",

    // Admin
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",

    // Footer
    quickLinks: "Quick Links",
    customerService: "Customer Service",
    returnPolicy: "Return Policy",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All Rights Reserved",

    // Additional Shop/Product translations
    all: "All",
    filters: "Filters",
    showFilters: "Show Filters",
    hideFilters: "Hide Filters",
    category: "Category",
    priceRange: "Price Range",
    metalType: "Metal Type",
    lowPrice: "Under ₪500",
    mediumPrice: "₪500-₪1000",
    highPrice: "Over ₪1000",

    // Contact Form
    full"name": "Full "name"",
    phoneNumber: "Phone Number",
    subject: "Subject",
    yourMessage: "Your Message",
    sendMessage: "Send Message",
    required: "Required field",
    messageSent: "Message sent successfully",
    messageFailed: "Failed to send message",

    // Product Options
    length: "Length",
    metal: "Metal",
    chainType: "Chain Type",
    waxColor: "Wax Color",
    selectOption: "Select Option",
    requiredField: "Required field",

    // Auth Messages
    passwordMismatch: "Passwords do not match",
    loginError: "Login error",
    registerError: "Registration error",
    hello: "Hello",
    goodbye: "Goodbye",
    user: "User",

    // Accessibility Statement
    accessibility: "Accessibility Statement",
    accessibilityStatement: "Accessibility Statement",
    aboutSite: "About Shamaim VeEretz Website",
    siteUrl: "https://shamaimveeretz.com",
    accessibilityPurpose: "Purpose of Accessibility",
    standards: "Standards and Standard-Setting Bodies",
    accessibilityLevel: "Website Accessibility Level: AA",
    company: "Vee Website Accessibility",
    regulationText:
      "Equal Rights for Persons with Disabilities Law 5568 (2013)",
    wcagGuidelines: "Web Content Accessibility Guidelines",
    wcagAcronym: "Web Content Accessibility Guidelines (WCAG) 2.0",
    authorityGuidelines:
      "Authority for the Internet Web Application Accessibility Guidelines",
    accessibleMode: "How to Switch to Accessible Mode?",
    screenReaders: "Screen Readers",
    stopBlinking: "Stop Blinking",
    skipToContent: "Skip to Main Content",
    keyboardNavigation: "Keyboard Navigation Support",
    textSize: "Text Size Adjustment",
    spacing: "Letter / Word / Line Spacing",
    contrast: "Contrast and Colors",
    readableFont: "Readable Font",
    linkHighlight: "Link Highlight",
    readingGuide: "Reading Guide",
    cursorIcon: "Cursor Icon Change",
    imageDescription: "Image Descriptions",
    adjustments: "Adjustments and Accommodations Made to the Website",
    screenReaderSupport:
      "Screen Reader Support - Website adapted for assistive technologies such as NVDA, JAWS",
    simpleNavigation: "Simple and Clear Navigation",
    clearContent:
      "Website content is written clearly, organized, and hierarchically",
    modernBrowsers: "Website is compatible with modern browsers",
    responsiveDesign:
      "Website is responsive to various screen sizes and resolutions",
    headerStructure: "All website pages have fixed structure (H1/H2/H3, etc.)",
    altText: "All images have alternative text descriptions (alt)",
    softwareFunctionality: "Accessibility Software Features",
    highContrast: "High",
    inverted: "Inverted",
    blackAndWhite: "Black and White",
    exceptions: "Exclusions",
    contactAccessibility: "Contact Us About Accessibility",
    problemDescription: "Description of the problem",
    attemptedAction: "What action did you try to perform",
    pageLink: "Link to the page you were viewing",
    browserType: "Browser type and version",
    operatingSystem: "Operating System",
    assistiveTechnology: "Type of assistive technology used (if applicable)",
    improvementEfforts:
      "Shamaim VeEretz will do its best to make the website accessible in the best way possible and respond to inquiries professionally and quickly.",
    accessibilityChampion: "Accessibility Champion",
    phone: "Phone",
    lastUpdate: "Accessibility Statement Last Updated",
    percentageDisability:
      "In Israel, approximately 20% of the population are people with disabilities",
    makeAvailable:
      "To make company services more accessible to people with disabilities",
    motorDisabilities: "Various motor disabilities",
    cognitiveImpairments: "Cognitive impairments",
    colorBlindness: "Color blindness, blindness or color blindness",
    hearingImpairments: "Hearing impairments",
    elderly: "Elderly population",
    veeCompany: "Vee",
    browsers: "Chrome, Firefox, Safari, Opera",
    chromeRecommendation:
      "Browsing in accessible mode is recommended in Chrome",
    semanticStructure: "Semantic structure",
    keyboardSupport:
      "Support for standard usage patterns with keyboard operation",
    arrowKeys: "Arrow keys",
    nvidaScreen: "NVDA software",
    latestVersion: "Latest version",
    bestBrowsingExperience:
      "Best browsing experience with screen reading software",
    recommendNvda: "We recommend using the latest NVDA software",
    ourValueEqual:
      "We value highly providing equal service to all citizens and improving service for citizens with disabilities",
    investingResources:
      "We invest significant resources in making our website and digital assets more accessible",
    accessibilityIcon:
      "The website has an accessibility icon (usually on the sides of the website)",
    accessibilityMenu: "Clicking the icon opens an accessibility menu",
    selectFunction: "After selecting the appropriate function in the menu",
    awaitLoading:
      "You need to wait for the page to load and for the desired display change (if necessary)",
    cancelAction:
      "If you want to cancel the action, click the function in the menu again",
    resetSettings: "You can reset accessibility settings at any time",
    worksOnBrowsers: "The software works on popular browsers",
    browserConditions: "Subject to (manufacturer's conditions)",
    getInTouchAccessibility:
      "To best address the issue, we recommend providing as much detail as possible",
    possibleIssues:
      "It is important to note that despite our efforts to make all pages and elements of the website accessible, there may be parts or features that are not properly accessible or not yet accessible",
    continuousImprovement:
      "We work continuously to improve the accessibility of our website as part of our commitment to enable the entire population, including people with disabilities, to use it",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "he";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    // Update document direction
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "he" ? "en" : "he"));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
