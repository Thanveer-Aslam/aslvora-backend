import { body } from "express-validator";

export const updateProfileValidator = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters."),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters."),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit phone number."),
];

