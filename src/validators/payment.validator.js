import { body, param } from "express-validator";

/**
 * Validate Create Razorpay Order
 */
export const validateCreateRazorpayOrder = [
  param("orderId")
    .notEmpty()
    .withMessage("Order ID is required.")
    .isMongoId()
    .withMessage("Invalid Order ID."),
];

/**
 * Validate Verify Payment
 */
export const validateVerifyPayment = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required.")
    .isMongoId()
    .withMessage("Invalid Order ID."),

  body("razorpay_order_id")
    .notEmpty()
    .withMessage("Razorpay Order ID is required.")
    .isString()
    .withMessage("Invalid Razorpay Order ID."),

  body("razorpay_payment_id")
    .notEmpty()
    .withMessage("Razorpay Payment ID is required.")
    .isString()
    .withMessage("Invalid Razorpay Payment ID."),

  body("razorpay_signature")
    .notEmpty()
    .withMessage("Razorpay Signature is required.")
    .isString()
    .withMessage("Invalid Razorpay Signature."),
];

/**
 * Validate Payment Failed
 */
export const validatePaymentFailed = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required.")
    .isMongoId()
    .withMessage("Invalid Order ID."),
];
