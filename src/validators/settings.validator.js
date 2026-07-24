import { body } from "express-validator";

export const updatePaymentSettingsValidator = [
  body("keyId").trim().notEmpty().withMessage("Razorpay Key ID is required."),

  body("keySecret")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Razorpay Key Secret is required."),

  body("enabled").isBoolean().withMessage("Enabled must be a boolean."),
];
