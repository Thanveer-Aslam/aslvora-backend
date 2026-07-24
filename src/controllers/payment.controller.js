import PaymentService from "../services/payment.service.js";

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/v1/payments/create-order/:orderId
 * @access  Private
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    console.log("=== CREATE ORDER CONTROLLER ===");
    console.log("User:", req.user);
    console.log("Order:", req.params.orderId);
    const { orderId } = req.params;

    const paymentOrder = await PaymentService.createRazorpayOrder(
      orderId,
      req.user.userId,
    );

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully.",
      data: paymentOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    await PaymentService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    const order = await PaymentService.markPaymentSuccess({
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark Payment Failed
 * @route   POST /api/v1/payments/failure
 * @access  Private
 */
export const paymentFailed = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await PaymentService.markPaymentFailed(orderId);

    return res.status(200).json({
      success: true,
      message: "Payment marked as failed.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
