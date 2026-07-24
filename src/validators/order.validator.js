import { body, param } from "express-validator";

export const createOrderValidator = [
  body("shippingAddress")
    .trim()
    .notEmpty()
    .withMessage("Shipping address is required.")
    .isMongoId()
    .withMessage("Invalid shipping address ID."),

  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required.")
    .isIn(["COD", "Stripe", "Razorpay"])
    .withMessage("Invalid payment method."),
];

export const orderIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Order ID is required.")
    .isMongoId()
    .withMessage("Invalid Order ID."),
];

export const updateOrderStatusValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Order ID is required.")
    .isMongoId()
    .withMessage("Invalid Order ID."),

  body("orderStatus")
    .trim()
    .notEmpty()
    .withMessage("Order status is required.")
    .isIn([
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ])
    .withMessage("Invalid order status."),
];
