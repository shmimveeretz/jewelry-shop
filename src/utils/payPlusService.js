import axios from "axios";

const API_URL = "https://jewelry-shop-udr7.onrender.com/api";

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
      const body = {
        // PayPlus-compatible fields
        amount: paymentData.amount,
        currency_code: paymentData.currency || "ILS",
        charge_method: 1,
        sendEmailApproval: true,
        sendEmailFailure: false,
        initial_invoice: true,
        hide_identification_id: false,
        more_info: `order-${Date.now()}`,

        // Customer info (used by backend to build the PayPlus customer object)
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,

        // Order items & shipping (used by backend to build the order in DB)
        orderItems: paymentData.items,
        shippingAddress: paymentData.shippingAddress,
      };

      const response = await axios.post(
        `${API_URL}/payment/create-intent`,
        body,
      );

      return response.data;
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data;
      console.error(
        "Payment creation failed:",
        error.response?.status,
        serverMsg,
      );
      throw new Error(
        typeof serverMsg === "string"
          ? serverMsg
          : "שגיאה ביצירת תשלום. אנא נסה שוב.",
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
