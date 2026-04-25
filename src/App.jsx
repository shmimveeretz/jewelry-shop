import { lazy, Suspense, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

function MetaPixelPageView() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // First PageView already tracked by index.html
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return null;
}

function DeviceTracker() {
  useEffect(() => {
    if (sessionStorage.getItem("_dtr")) return;

    const ua = navigator.userAgent;

    const getDeviceName = () => {
      if (/iPhone/.test(ua)) return "iPhone";
      if (/iPad/.test(ua)) return "iPad";
      if (/Android/.test(ua)) {
        const match = ua.match(/Android.*?;\s*(.+?)\s*Build/);
        return match ? match[1] : "Android Device";
      }
      if (/Windows/.test(ua)) return "Windows PC";
      if (/Macintosh/.test(ua)) return "Mac";
      if (/Linux/.test(ua)) return "Linux";
      return "Unknown Device";
    };

    const getBrowser = () => {
      if (/Edg\//.test(ua)) return "Edge";
      if (/OPR\//.test(ua)) return "Opera";
      if (/Chrome\//.test(ua)) return "Chrome";
      if (/Firefox\//.test(ua)) return "Firefox";
      if (/Safari\//.test(ua)) return "Safari";
      return "Unknown Browser";
    };

    const getOS = () => {
      if (/Windows NT 10/.test(ua)) return "Windows 10/11";
      if (/Windows NT 6/.test(ua)) return "Windows 7/8";
      if (/Mac OS X ([\d_]+)/.test(ua)) {
        const match = ua.match(/Mac OS X ([\d_]+)/);
        return `macOS ${match ? match[1].replace(/_/g, ".") : ""}`;
      }
      if (/Android ([\d.]+)/.test(ua)) {
        const match = ua.match(/Android ([\d.]+)/);
        return `Android ${match ? match[1] : ""}`;
      }
      if (/iPhone OS ([\d_]+)/.test(ua)) {
        const match = ua.match(/iPhone OS ([\d_]+)/);
        return `iOS ${match ? match[1].replace(/_/g, ".") : ""}`;
      }
      if (/Linux/.test(ua)) return "Linux";
      return "Unknown OS";
    };

    const trackDevice = async () => {
      try {
        const geoRes = await fetch("https://ipapi.co/json/");
        const geo = await geoRes.json();

        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000";

        await fetch(`${API_BASE_URL}/api/admin/devices/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ipAddress: geo.ip,
            location: {
              city: geo.city || "",
              country: geo.country_name || "",
              timezone: geo.timezone || "",
            },
            deviceName: `${getBrowser()} on ${getDeviceName()}`,
            browser: getBrowser(),
            os: getOS(),
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language,
          }),
        });

        sessionStorage.setItem("_dtr", "1");
      } catch {
        // Silent fail — don't affect user experience
      }
    };

    trackDevice();
  }, []);

  return null;
}
import "./styles/App.css";

// Context
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Components (always loaded - part of every page)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ShabbatMode from "./components/ShabbatMode";
import ScrollToTop from "./components/ScrollToTop";
import AccessibilityWidget from "./components/AccessibilityWidget";

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
const Admin = lazy(() => import("./pages/Admin"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const Payment = lazy(() => import("./pages/Payment"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Accessibility = lazy(() => import("./pages/Accessibility"));

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <MetaPixelPageView />
            <DeviceTracker />
            <ScrollToTop />
            <AccessibilityWidget />
            <div className="App">
              {/* <ShabbatMode /> */}
              <Navbar />
              <main className="main-content">
                <Suspense
                  fallback={
                    <div
                      style={{
                        minHeight: "60vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        color: "#888",
                      }}
                    >
                      טוען...
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/zodiac" element={<Zodiac />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    {/* <Route path="/story" element={<Story />} /> */}
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Auth />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="/verify-code" element={<VerifyCode />} />
                    <Route
                      path="/change-password"
                      element={<ChangePassword />}
                    />
                    <Route path="/admin" element={<Admin />} />
                    <Route
                      path="/payment-success"
                      element={<PaymentSuccess />}
                    />
                    <Route
                      path="/payment-failure"
                      element={<PaymentFailure />}
                    />
                    <Route path="/payment" element={<Payment />} />
                    <Route
                      path="/payment-cancelled"
                      element={<PaymentCancelled />}
                    />
                    <Route
                      path="/shipping-policy"
                      element={<ShippingPolicy />}
                    />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    <Route
                      path="/terms-of-service"
                      element={<TermsOfService />}
                    />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/accessibility" element={<Accessibility />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
