import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./styles/App.css";

// Context
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { PopupProvider } from "./features/popups/PopupProvider";

// Components (always loaded - part of every page)
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import ShabbatMode from "./components/ShabbatMode";
import ScrollToTop from "./components/ScrollToTop";
import ScrollReveal from "./components/ScrollReveal";
import AccessibilityWidget from "./components/AccessibilityWidget";
import CookieBanner from "./components/CookieBanner";
import TopBanner from "./components/TopBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteMeta from "./components/RouteMeta";
import Analytics from "./components/Analytics";

// Pages (lazy loaded - only when route is visited)
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Zodiac = lazy(() => import("./pages/Zodiac"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyCode = lazy(() => import("./pages/VerifyCode"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const AdminLayout = lazy(() => import("./features/admin/AdminLayout"));
const DashboardHome = lazy(() => import("./features/admin/DashboardHome"));
const LegacyAdminView = lazy(
  () => import("./features/admin/legacy/LegacyAdminView"),
);
const ProductPageList = lazy(
  () => import("./features/admin/dppBuilder/ProductPageList"),
);
const ProductPageEditor = lazy(
  () => import("./features/admin/dppBuilder/ProductPageEditor"),
);
const PopupList = lazy(() => import("./features/admin/popupManager/PopupList"));
const PopupEditor = lazy(
  () => import("./features/admin/popupManager/PopupEditor"),
);
const MarketingHub = lazy(
  () => import("./features/admin/marketing/MarketingHub"),
);
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const DppPage = lazy(() => import("./pages/DppPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** PayPlus sometimes redirects to //payment-success when FRONTEND_URL has a trailing slash */
function NormalizeDoubleSlashPath() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes("//")) {
      const cleanPath = location.pathname.replace(/\/{2,}/g, "/");
      navigate(`${cleanPath}${location.search}${location.hash}`, {
        replace: true,
      });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}

function PageLoader() {
  const { language } = useLanguage();
  return (
    <div className="page-loader" role="status">
      <span className="page-loader__spinner" aria-hidden="true" />
      <span className="visually-hidden">
        {language === "he" ? "טוען…" : "Loading…"}
      </span>
    </div>
  );
}

/**
 * Campaign landing pages render without navbar, footer or cart drawer: paid
 * traffic gets one path forward (the CTA) and no links to leak out through.
 *
 * The admin brings its own shell chrome, so the storefront's is stripped there
 * too.
 */
const CHROME_FREE_ROUTE_PREFIXES = ["/lp/", "/admin"];

function AppShell() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const showChrome = !CHROME_FREE_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  return (
    <div className="App">
      {showChrome && (
        <>
          <a className="skip-link" href="#main-content">
            {language === "he" ? "דילוג לתוכן הראשי" : "Skip to main content"}
          </a>
          <TopBanner />
          <Navbar />
          <CartDrawer />
        </>
      )}
      <main className="main-content" id="main-content" tabIndex={-1}>
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoader />}>
            {/* Re-keyed per page so each new page eases in. The admin shares
                one key so its nested screens keep their state. */}
            <div
              className="page-transition"
              key={pathname.startsWith("/admin") ? "admin" : pathname}
            >
              <Routes>
                {/* Slug resolves to a built page, or falls back to a
                  product id rendered with the default template — which
                  is what keeps existing /lp/<productId> ad links alive. */}
                <Route path="/lp/:slug" element={<DppPage />} />
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/zodiac" element={<Zodiac />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/change-password" element={<ChangePassword />} />
                {/* Strangler fig: the shell owns /admin, new modules get
                  real routes, and everything not yet extracted falls
                  through to the original panel at /admin/store. */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="pages" element={<ProductPageList />} />
                  <Route path="pages/:id" element={<ProductPageEditor />} />
                  <Route path="popups" element={<PopupList />} />
                  <Route path="popups/:id" element={<PopupEditor />} />
                  <Route path="marketing" element={<MarketingHub />} />
                  <Route path="store" element={<LegacyAdminView />} />
                  <Route path="*" element={<LegacyAdminView />} />
                </Route>
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failure" element={<PaymentFailure />} />
                <Route
                  path="/payment-cancelled"
                  element={<PaymentCancelled />}
                />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      {showChrome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            {/* Inside the Router so it can react to route changes, but above
                AppShell so an open popup survives a client-side navigation. */}
            <PopupProvider>
              <NormalizeDoubleSlashPath />
              <RouteMeta />
              <Analytics />
              <CookieBanner />
              <ScrollToTop />
              <ScrollReveal />
              <AccessibilityWidget />
              <ShabbatMode />
              <AppShell />
            </PopupProvider>
          </Router>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
