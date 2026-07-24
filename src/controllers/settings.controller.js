import SettingsService from "../services/settings.service.js";


/**
 * @desc    Get Payment Settings
 * @route   GET /api/v1/admin/settings/payment
 * @access  Admin
 */
export const getPaymentSettings = async (req, res, next) => {
  try {
    const settings = await SettingsService.getPaymentSettings();

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Payment Settings
 * @route   PATCH /api/v1/admin/settings/payment
 * @access  Admin
 */
export const updatePaymentSettings = async (req, res, next) => {
  try {

    const settings = await SettingsService.updatePaymentSettings(req.body);

    return res.status(200).json({
      success: true,
      message: "Payment settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @desc    Test Razorpay Connection
 * @route   POST /api/v1/admin/settings/payment/test
 * @access  Admin
 */
export const testPaymentConnection = async (req, res, next) => {
    try {
    const result = await SettingsService.testPaymentConnection();
    return res.status(200).json({
      success: true,
      message: result.message,
    });
    } catch (error) {
    next(error);
  }
};
