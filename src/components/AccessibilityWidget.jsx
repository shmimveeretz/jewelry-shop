import { useEffect } from "react";

/**
 * Vee Accessibility Widget Component
 * Adds the Vee-CRM accessibility toolbar to the site
 */
function AccessibilityWidget() {
  useEffect(() => {
    // Configure Vee accessibility widget
    window.args = {
      sitekey: "d5f1722567412f8b57a42b7247b3abbc",
      position: "Left",
      container: "",
      icon: "",
      access: "https://vee-crm.com",
      styles: {
        primary_color: "#177fab",
        secondary_color: "#b586ff",
        background_color: "#f6f6f6",
        primary_text_color: "#636363",
        headers_text_color: "#105675",
        primary_font_size: 14,
        slider_left_color: "#b586ff",
        slider_right_color: "#177fab",
        icon_vertical_position: "top",
        icon_offset_top: 100,
        icon_offset_bottom: 0,
        highlight_focus_color: "#177fab",
        toggler_icon_color: "#ffffff",
      },
      links: {
        acc_policy: "",
        additional_link: "https://vee.co.il/pricing/",
      },
      options: {
        open: false,
        aaa: false,
        hide_tablet: false,
        hide_mobile: false,
        button_size_tablet: 44,
        button_size_mobile: 34,
        position_tablet: "Right",
        position_mobile: "Right",
        icon_vertical_position_tablet: "top",
        icon_vertical_position_mobile: "top",
        icon_offset_top_tablet: 100,
        icon_offset_bottom_tablet: 0,
        icon_offset_top_mobile: 100,
        icon_offset_bottom_mobile: 0,
        keyboard_shortcut: true,
        hide_purchase_link: false,
        display_checkmark_icon: false,
        active_toggler_color: "#118f38",
      },
      exclude: [],
    };

    // Load Vee accessibility script
    const script = document.createElement("script");
    script.src = window.args.access + "/js/";
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-cfasync", "true");

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

export default AccessibilityWidget;
