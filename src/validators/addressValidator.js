import { body, param } from "express-validator";

export const createAddressValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters."),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number."),

  body("label")
    .optional()
    .isIn(["Home", "Office", "Other"])
    .withMessage("Label must be Home, Office or Other."),

  body("addressLine1")
    .trim()
    .notEmpty()
    .withMessage("Address Line 1 is required.")
    .isLength({ max: 200 })
    .withMessage("Address Line 1 cannot exceed 200 characters."),

  body("addressLine2")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address Line 2 cannot exceed 200 characters."),

  body("city").trim().notEmpty().withMessage("City is required."),

  body("state").trim().notEmpty().withMessage("State is required."),

  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters."),

  body("postalCode").trim().notEmpty().withMessage("Postal code is required."),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be true or false."),
];

export const updateAddressValidator = [
  param("id").isMongoId().withMessage("Invalid address ID."),

  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters."),

  body("phoneNumber")
    .optional()
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number."),

  body("label")
    .optional()
    .isIn(["Home", "Office", "Other"])
    .withMessage("Label must be Home, Office or Other."),

  body("addressLine1")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address Line 1 cannot exceed 200 characters."),

  body("addressLine2")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address Line 2 cannot exceed 200 characters."),

  body("city").optional().trim(),

  body("state").optional().trim(),

  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters."),

  body("postalCode").optional().trim(),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be true or false."),
];

export const addressIdValidator = [
  param("id").isMongoId().withMessage("Invalid address ID."),
];
