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
    name: "שם מלא",
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
    fullName: "שם מלא",
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
    heroTitle: "Shamayim VaAretz",
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
    name: "Full Name",
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
    fullName: "Full Name",
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
