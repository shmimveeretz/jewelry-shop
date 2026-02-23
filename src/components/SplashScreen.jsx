import { useState, useEffect } from "react";
import "../styles/components/SplashScreen.css";

function SplashScreen({ onComplete }) {
  useEffect(() => {
    // Show splash screen for at least 2 seconds
    const timer = setTimeout(() => {
      localStorage.setItem("siteVisited", "true");
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <h1>שמיים וארץ</h1>
          <p>Shamayim VaAretz</p>
        </div>
        <div className="splash-loader">
          <div className="loader"></div>
        </div>
        <p className="splash-text">טוען...</p>
      </div>
    </div>
  );
}

export default SplashScreen;
