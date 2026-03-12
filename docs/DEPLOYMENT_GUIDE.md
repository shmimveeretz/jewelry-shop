# 🚀 מדריך התקנה והפעלה - אתר חנות תכשיטים

## 📋 דרישות מערכת

לפני שמתחילים, ודא שיש לך:

- **Node.js** גרסה 18 ומעלה ([הורד כאן](https://nodejs.org/))
- **npm** או **yarn**
- עורך קוד (מומלץ: VS Code)
- דפדפן מודרני (Chrome, Firefox, Edge)

---

## ⚡ התקנה מהירה

### שלב 1: התקנת התלויות

פתח טרמינל בתיקיית הפרויקט והרץ:

```bash
npm install
```

או אם אתה משתמש ב-yarn:

```bash
yarn install
```

### שלב 2: הפעלת שרת הפיתוח

```bash
npm run dev
```

או:

```bash
yarn dev
```

האתר יהיה זמין בכתובת: **http://localhost:5173**

---

## 🏗️ בניה לפרודקשן

### בניית הפרויקט:

```bash
npm run build
```

הפלט ייווצר בתיקייה `dist/`

### תצוגה מקדימה של גרסת פרודקשן:

```bash
npm run preview
```

---

## 🌐 פריסה (Deployment)

### אפשרות 1: Vercel (מומלץ) ⭐

1. **צור חשבון ב-Vercel:**
   - גש ל-[vercel.com](https://vercel.com)
   - התחבר עם GitHub

2. **חבר את הפרויקט:**

   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **עקוב אחרי ההנחיות באינטראקציה**

4. **הפרויקט יפורסם אוטומטית!** 🎉

**יתרונות Vercel:**

- פריסה אוטומטית מ-Git
- SSL חינמי
- CDN עולמי
- תכנית חינמית נדיבה

---

### אפשרות 2: Netlify

1. **צור חשבון ב-Netlify:**
   - גש ל-[netlify.com](https://netlify.com)

2. **התקן Netlify CLI:**

   ```bash
   npm install -g netlify-cli
   netlify login
   ```

3. **פרוס את האתר:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

---

### אפשרות 3: GitHub Pages

1. **התקן gh-pages:**

   ```bash
   npm install --save-dev gh-pages
   ```

2. **הוסף ל-package.json:**

   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     },
     "homepage": "https://[user"name"].github.io/[repo-"name"]"
   }
   ```

3. **פרוס:**
   ```bash
   npm run deploy
   ```

---

### אפשרות 4: הוסטינג משלך (cPanel/FTP)

1. **בנה את הפרויקט:**

   ```bash
   npm run build
   ```

2. **העלה את תיקיית `dist/` לשרת:**
   - דרך FTP (FileZilla)
   - או דרך File Manager ב-cPanel

3. **הצב את הקבצים בתיקיית public_html**

---

## 🔧 הגדרות נוספות

### משתני סביבה (Environment Variables)

צור קובץ `.env` בשורש הפרויקט:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_KEY=your_stripe_publishable_key
VITE_ADMIN_PASSWORD=your_secret_password
```

**חשוב:** אל תעלה את קובץ `.env` ל-Git!

הוסף ל-`.gitignore`:

```
.env
.env.local
.env.production
```

---

### הגדרת SSL (HTTPS)

**Vercel/Netlify:** SSL אוטומטי ✅

**שרת משלך:**

1. השתמש ב-**Let's Encrypt** (חינמי)
2. התקן דרך cPanel או:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 🎨 התאמה אישית

### שינוי צבעים ולוגו

1. **ערוך את `src/index.css`:**

   ```css
   :root {
     --color-primary: #2c2c2c;
     --color-secondary: #8b7355;
     --color-accent: #b8976d;
   }
   ```

2. **החלף את הלוגו ב-`public/`**

3. **עדכן את `index.html`:**
   ```html
   <title>שם החנות שלך</title> <link rel="icon" href="/your-logo.png" />
   ```

---

### הוספת Google Analytics

1. **הוסף ל-`index.html` לפני סגירת `</head>`:**
   ```html
   <!-- Google Analytics -->
   <script
     async
     src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
   ></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag() {
       dataLayer.push(arguments);
     }
     gtag("js", new Date());
     gtag("config", "G-XXXXXXXXXX");
   </script>
   ```

---

### שילוב מערכת סליקה

#### Stripe:

1. **התקן את Stripe:**

   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **הוסף ל-App.jsx:**

   ```jsx
   import { loadStripe } from "@stripe/stripe-js";
   import { Elements } from "@stripe/react-stripe-js";

   const stripePromise = loadStripe(process.env.VITE_STRIPE_KEY);

   // Wrap your cart/checkout component
   <Elements stripe={stripePromise}>
     <YourCheckoutComponent />
   </Elements>;
   ```

---

## 🗄️ חיבור לבסיס נתונים

### Firebase (מומלץ למתחילים):

1. **התקן Firebase:**

   ```bash
   npm install firebase
   ```

2. **צור קובץ `src/firebase.js`:**

   ```javascript
   import { initializeApp } from "firebase/app";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     // ...
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   ```

3. **השתמש בו בקומפוננטות:**

   ```javascript
   import { collection, getDocs } from "firebase/firestore";
   import { db } from "./firebase";

   const products = await getDocs(collection(db, "products"));
   ```

---

## 🔒 אבטחת דף ניהול

### הוספת אימות בסיסי:

1. **צור Context לאימות:**

   ```javascript
   // src/context/AuthContext.jsx
   import { createContext, useState } from "react";

   export const AuthContext = createContext();

   export function AuthProvider({ children }) {
     const [isAdmin, setIsAdmin] = useState(false);

     const login = (password) => {
       if (password === process.env.VITE_ADMIN_PASSWORD) {
         setIsAdmin(true);
         return true;
       }
       return false;
     };

     return (
       <AuthContext.Provider value={{ isAdmin, login }}>
         {children}
       </AuthContext.Provider>
     );
   }
   ```

2. **הגן על דף Admin:**
   ```jsx
   function Admin() {
     const { isAdmin } = useContext(AuthContext);

     if (!isAdmin) {
       return <LoginForm />;
     }

     return <AdminPanel />;
   }
   ```

---

## 📱 אופטימיזציה למובייל

האתר כבר responsive, אבל תוכל לשפר:

1. **הוסף PWA (Progressive Web App):**

   ```bash
   npm install vite-plugin-pwa -D
   ```

2. **ערוך `vite.config.js`:**

   ```javascript
   import { VitePWA } from 'vite-plugin-pwa';

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           "name": 'חנות תכשיטים',
           short_"name": 'תכשיטים',
           theme_color: '#2c2c2c'
         }
       })
     ]
   });
   ```

---

## 🐛 פתרון בעיות נפוצות

### בעיה: "Module not found"

**פתרון:**

```bash
rm -rf node_modules package-lock.json
npm install
```

### בעיה: "Port 5173 is already in use"

**פתרון:**

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:5173 | xargs kill
```

### בעיה: תמונות לא נטענות

**פתרון:**

- ודא שכל התמונות נמצאות בתיקייה `public/`
- או השתמש ב-URL מלא לתמונות חיצוניות

---

## 📚 משאבים נוספים

- [תיעוד Vite](https://vitejs.dev/)
- [תיעוד React Router](https://reactrouter.com/)
- [תיעוד Stripe](https://stripe.com/docs)
- [תיעוד Firebase](https://firebase.google.com/docs)

---

## 🎯 צ'קליסט לפני השקה

- [ ] בדיקה בכל הדפדפנים (Chrome, Firefox, Safari, Edge)
- [ ] בדיקה במכשירי מובייל
- [ ] בדיקת תפריט ניווט
- [ ] בדיקת טפסים
- [ ] בדיקת תכונת שומר שבת
- [ ] SSL פעיל
- [ ] Google Analytics מותקן
- [ ] מערכת סליקה מחוברת
- [ ] גיבוי של בסיס הנתונים
- [ ] תיעוד להנהלה

---

**בהצלחה! 🎉**

לשאלות או בעיות, פנה לצוות הפיתוח.
