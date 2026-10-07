import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

/** Shown for any URL that matches no route (previously an empty page). */
function NotFound() {
  const { language } = useLanguage();
  const he = language === "he";

  return (
    <div className="not-found">
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <h1>{he ? "העמוד לא נמצא" : "Page not found"}</h1>
      <p>
        {he
          ? "ייתכן שהקישור שגוי או שהעמוד הועבר. אולי תמצאו כאן משהו יפה:"
          : "The link may be wrong or the page has moved. You might find something beautiful here:"}
      </p>
      <div className="not-found__actions">
        <Link to="/shop" className="btn">
          {he ? "לחנות" : "Shop the collection"}
        </Link>
        <Link to="/" className="btn btn-secondary">
          {he ? "לדף הבית" : "Home page"}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
