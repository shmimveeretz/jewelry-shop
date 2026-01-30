// Email Service - Send order confirmation emails
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const emailService = {
  // Send order confirmation to customer and admin
  sendOrderConfirmation: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/email/order-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending order confirmation:", error);
      throw error;
    }
  },

  // Send contact form email
  sendContactForm: async (contactData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/email/contact`, {
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
