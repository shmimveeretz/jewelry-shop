# מבנה תיקיית src

## תיאור תיקיות

### 📁 components
רכיבים React משותפים הנמצאים בשימוש חוזר במספר מקומות באפליקציה.

- **Navbar.jsx** - תפריט ניווט עליון
- **Footer.jsx** - כותרת תחתונה
- **ProductModal.jsx** - חלונית למוצר עם אפשרויות בחירה
- **ShabbatMode.jsx** - מצב שומר שבת

### 📁 pages
דפי האפליקציה - כל דף מייצג route משלו.

- **Home.jsx** - דף הבית עם גלריית קולקציות
- **Shop.jsx** - דף החנות עם כל המוצרים ופילטרים
- **Zodiac.jsx** - גלגל מזלות אינטראקטיבי
- **About.jsx** - דף אודותינו
- **Story.jsx** - הסיפור שלנו
- **Cart.jsx** - עגלת קניות
- **Admin.jsx** - ממשק ניהול למנהלים

### 📁 styles
קבצי CSS מאורגנים לפי היררכיה.

#### styles/components
עיצובים ייעודיים לרכיבים:
- Navbar.css
- Footer.css
- ProductModal.css

#### styles/pages
עיצובים ייעודיים לדפים:
- Home.css
- Shop.css
- Zodiac.css
- About.css
- Story.css
- Cart.css
- Admin.css

#### קבצים כלליים:
- **App.css** - עיצוב כללי לאפליקציה
- **index.css** - עיצוב גלובלי ואיפוסים

### 📁 assets
(עתידי) תמונות, אייקונים, פונטים וקבצי מדיה נוספים.

### 📁 hooks
(עתידי) React hooks מותאמים אישית לשימוש חוזר.

דוגמאות:
- useLocalStorage
- useCart
- useAuth

### 📁 utils
(עתידי) פונקציות עזר ו-utilities.

דוגמאות:
- formatPrice()
- calculateDiscount()
- validateEmail()

### 📁 constants
(עתידי) קבועים ונתונים סטטיים.

דוגמאות:
- ZODIAC_SIGNS
- METAL_TYPES
- CHAIN_OPTIONS

## קבצים ראשיים

### App.jsx
רכיב האפליקציה הראשי. מכיל:
- Router configuration
- Routes definition
- Layout structure (Navbar, Footer, ShabbatMode)

### main.jsx
נקודת הכניסה לאפליקציה. מבצע:
- React DOM rendering
- Global CSS import
- React.StrictMode wrapping
