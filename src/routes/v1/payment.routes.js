import express from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  paymentFailed,
} from "../../controllers/payment.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  validateCreateRazorpayOrder,
  validateVerifyPayment,
  validatePaymentFailed,
} from "../../validators/payment.validator.js";

const router = express.Router();

/**
 * @route   POST /api/v1/payments/create-order/:orderId
 * @desc    Create Razorpay Order
 * @access  Private
 */
router.post(
  "/create-order/:orderId",
  authenticate,
  validateCreateRazorpayOrder,
  validate,
  createRazorpayOrder,
);

/**
 * @route   POST /api/v1/payments/verify
 * @desc    Verify Razorpay Payment
 * @access  Private
 */
router.post(
  "/verify",
  authenticate,
  validateVerifyPayment,
  validate,
  verifyPayment,
);

/**
 * @route   POST /api/v1/payments/failure
 * @desc    Mark Payment Failed
 * @access  Private
 */
router.post(
  "/failure",
  authenticate,
  validatePaymentFailed,
  validate,
  paymentFailed,
);

export default router;
