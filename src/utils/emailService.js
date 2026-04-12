// Email Service - Send order confirmation emails
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const emailService = {
  // Send order confirmation to customer and admin
  sendOrderConfirmation: async (orderData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/email/order-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        },
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending order confirmation:", error);
      throw error;
    }
  },

  // Send welcome email after registration
  sendWelcomeEmail: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/welcome`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't throw — welcome email failure shouldn't block login
    }
  },

  // Send contact form email
  sendContactForm: async (contactData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending contact form:", error);
      throw error;
    }
  },
};
