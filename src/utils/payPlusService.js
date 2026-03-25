import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * PayPlus Payment Service for Frontend
 */
export const payPlusService = {
  /**
   * Create a payment session
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment page URL
   */
  async createPayment(paymentData) {
    try {
      const response = await axios.post(`${API_URL}/payment/create-payment`, {
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        amount: paymentData.amount,
        currency: paymentData.currency || "ILS",
        items: paymentData.items,
        shippingAddress: paymentData.shippingAddress,
      });

      return response.data;
    } catch (error) {
      console.error("Payment creation failed:", error);
      throw new Error(
        error.response?.data?.error || "שגיאה ביצירת תשלום. אנא נסה שוב.",
      );
    }
  },

  /**
   * Verify payment status
   * @param {string} transactionUid - Transaction UID from PayPlus
   * @returns {Promise<Object>} Payment status
   */
  async verifyPayment(transactionUid, orderData = null) {
    try {
      const url = `${API_URL}/payment/verify/${transactionUid}`;
      const params = orderData ? { orderData: JSON.stringify(orderData) } : {};

      const response = await axios.get(url, { params });

      return response.data;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw new Error(
        error.response?.data?.error ||
          "שגיאה באימות תשלום. אנא פנה לשירות לקוחות.",
      );
    }
  },

  /**
   * Request a refund
   * @param {string} transactionUid - Transaction UID to refund
   * @param {number} amount - Amount to refund (optional)
   * @returns {Promise<Object>} Refund status
   */
  async refundPayment(transactionUid, amount = null) {
    try {
      const response = await axios.post(`${API_URL}/payment/refund`, {
        transactionUid,
        amount,
      });

      return response.data;
    } catch (error) {
      console.error("Refund request failed:", error);
      throw new Error(
        error.response?.data?.error ||
          "שגיאה בביטול תשלום. אנא פנה לשירות לקוחות.",
      );
    }
  },
};
