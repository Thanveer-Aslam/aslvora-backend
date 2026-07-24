import { param } from "express-validator";

export const customerIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Customer ID is required.")
    .isMongoId()
    .withMessage("Invalid customer ID."),
];
