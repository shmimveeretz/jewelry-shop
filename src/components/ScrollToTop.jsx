import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { path"name" } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path"name"]);

  return null;
}

export default ScrollToTop;
