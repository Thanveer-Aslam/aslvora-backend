import Razorpay from "razorpay";
import Settings from "../models/settings.js";
import getRazorpayClient from "../utils/getRazorpayClient.js";

class SettingsService {
  //Get Payment Settings
  static async getPaymentSettings() {
    let settings = await Settings.findOne().select(
      "+payment.keySecret +payment.webhookSecret",
    );

    if (!settings) {
      settings = await Settings.create({});
    }

    return {
      provider: settings.payment.provider,
      keyId: settings.payment.keyId,
      mode: settings.payment.mode,
      enabled: settings.payment.enabled,
      keySecret: settings.payment.keySecret ? "****************" : "",
      webhookSecret: settings.payment.webhookSecret ? "****************" : "",
      keySecretConfigured: Boolean(settings.payment.keySecret),
      webhookConfigured: Boolean(settings.payment.webhookSecret),
    };
  }

  //Update Payment Setting
  static async updatePaymentSettings(payload) {
    const { provider, keyId, keySecret, webhookSecret, mode, enabled } =
      payload;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }
    if (provider !== undefined) settings.payment.provider = provider;
    if (keyId !== undefined) settings.payment.keyId = keyId;
    if (keySecret !== undefined && keySecret !== "****************") {
      settings.payment.keySecret = keySecret;
    }
    if (webhookSecret !== undefined)
      settings.payment.webhookSecret = webhookSecret;
    if (mode !== undefined) settings.payment.mode = mode;
    if (enabled !== undefined) settings.payment.enabled = enabled;
    await settings.save();
    const saved = await Settings.findById(settings._id).select(
      "+payment.keySecret +payment.webhookSecret",
    );
    return {
      provider: saved.payment.provider,
      keyId: saved.payment.keyId,
      mode: saved.payment.mode,
      enabled: saved.payment.enabled,
      keySecretConfigured: Boolean(saved.payment.keySecret),
      webhookConfigured: Boolean(saved.payment.webhookSecret),
    };
  }

  // Test Razorpay Connection

  static async testPaymentConnection() {


    const settings = await Settings.findOne().select(
      "+payment.keySecret +payment.webhookSecret",
    );
    const { razorpay } = await getRazorpayClient();

    const orders = await razorpay.orders.all({ count: 1 });
    return {
      success: true,
      message: "Razorpay connection successful.",
    };
  }
  static async getPaymentStatus() {
    const settings = await Settings.findOne().select("+payment.keySecret");

    if (!settings) {
      return {
        configured: false,
        enabled: false,
      };
    }

    const configured = !!settings.payment.keyId && !!settings.payment.keySecret;

    return {
      configured,
      enabled: settings.payment.enabled,
    };
  }
}



export default SettingsService;
