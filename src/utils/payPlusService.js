import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const API_URL = `${API_BASE_URL}/api`;

/**
 * PayPlus Payment Service for Frontend
 */
export const payPlusService = {
  /**
   * Create a payment page for the cart.
   *
   * The server re-prices every item from the database and validates the
   * coupon itself, so only product ids, options and quantities matter here.
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} { paymentPageUrl, transactionUid, orderId, totalPrice }
   */
  async createPayment(paymentData) {
    try {
      const body = {
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        orderItems: (paymentData.orderItems || paymentData.items || []).map(
          (item) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            selectedOptions: item.selectedOptions || {},
            selections: item.selections || {},
          }),
        ),
        shippingAddress: paymentData.shippingAddress,
        couponCode: paymentData.couponCode ?? null,
      };

      // Logged-in customers get the order linked to their account
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(`${API_URL}/payment/create-intent`, body, {
        headers,
      });

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
};
