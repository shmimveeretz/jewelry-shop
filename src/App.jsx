import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./styles/App.css";

// Context
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ShabbatMode from "./components/ShabbatMode";
import ScrollToTop from "./components/ScrollToTop";
import AccessibilityWidget from "./components/AccessibilityWidget";
import SplashScreen from "./components/SplashScreen";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Zodiac from "./pages/Zodiac";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ChangePassword from "./pages/ChangePassword";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("siteVisited");
    if (!hasVisited) {
      setShowSplash(true);
    }
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <LanguageProvider>
        <ToastProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <AccessibilityWidget />
              <div className="App">
              {/* <ShabbatMode /> */}
              <Navbar />
              <main className="main-content">
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
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-code" element={<VerifyCode />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-failure" element={<PaymentFailure />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route
                    path="/terms-of-service"
                    element={<TermsOfService />}
                  />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
    </>
  );
}

export default App;
