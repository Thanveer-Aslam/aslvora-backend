import { body, param } from "express-validator";

/**
 * Add item to cart
 */
export const addToCartValidator = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required.")
    .isMongoId()
    .withMessage("Invalid product ID."),

  body("size").trim().notEmpty().withMessage("Size is required."),

  body("color").trim().notEmpty().withMessage("Color is required."),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1."),
];

/**
 * Update cart item quantity
 */
export const updateCartItemValidator = [
  param("itemId").isMongoId().withMessage("Invalid cart item ID."),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1."),
];

/**
 * Remove single cart item
 */
export const removeCartItemValidator = [
  param("itemId").isMongoId().withMessage("Invalid cart item ID."),
];
