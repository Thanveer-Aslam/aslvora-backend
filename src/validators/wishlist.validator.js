import { param } from "express-validator";

export const productIdValidator = [
  param("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required.")
    .isMongoId()
    .withMessage("Invalid Product ID."),
];
