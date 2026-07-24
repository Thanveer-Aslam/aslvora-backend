import Razorpay from "razorpay";
import Settings from "../models/settings.js";

const getRazorpayClient = async () => {
  const settings = await Settings.findOne().select("+payment.keySecret");

  if (!settings) {
    throw new Error("Payment settings not found.");
  }

  if (!settings.payment.enabled) {
    throw new Error("Online payments are disabled.");
  }

  if (!settings.payment.keyId || !settings.payment.keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return {
    razorpay: new Razorpay({
      key_id: settings.payment.keyId,
      key_secret: settings.payment.keySecret,
    }),
    keyId: settings.payment.keyId,
    keySecret: settings.payment.keySecret,
  };
};

export default getRazorpayClient;
