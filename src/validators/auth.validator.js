import { body } from "express-validator";

export const registerValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),

  body("phoneNumber")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid phone number."),

  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),

  body("password").trim().notEmpty().withMessage("Password is required."),
];
