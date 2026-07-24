import { body } from "express-validator";
import mongoose from "mongoose";

export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters."),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters."),

  body("category")
    .notEmpty()
    .withMessage("Category is required.")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid category ID."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters."),

  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0."),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100."),


  body("availableSizes")
    .notEmpty()
    .withMessage("Available sizes are required.")
    .custom((value) => {
      try {
        const sizes = JSON.parse(value);

        if (!Array.isArray(sizes) || sizes.length === 0) {
          throw new Error();
        }

        return true;
      } catch {
        throw new Error("Available sizes must be a valid JSON array.");
      }
    }),

  body("availableColors")
    .notEmpty()
    .withMessage("Available colors are required.")
    .custom((value) => {
      try {
        const colors = JSON.parse(value);

        if (!Array.isArray(colors) || colors.length === 0) {
          throw new Error();
        }

        return true;
      } catch {
        throw new Error("Available colors must be a valid JSON array.");
      }
    }),

  body("stockQuantity")
    .notEmpty()
    .withMessage("Stock quantity is required.")
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be 0 or greater."),
];

export const updateProductValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters."),

  body("brand")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters."),

  body("category")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid category ID."),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters."),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0."),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100."),

  body("availableSizes")
    .notEmpty()
    .withMessage("Available sizes are required.")
    .custom((value) => {
      try {
        const sizes = JSON.parse(value);

        if (!Array.isArray(sizes) || sizes.length === 0) {
          throw new Error();
        }

        return true;
      } catch {
        throw new Error("Available sizes must be a valid JSON array.");
      }
    }),

  body("availableColors")
    .notEmpty()
    .withMessage("Available colors are required.")
    .custom((value) => {
      try {
        const colors = JSON.parse(value);

        if (!Array.isArray(colors) || colors.length === 0) {
          throw new Error();
        }

        return true;
      } catch {
        throw new Error("Available colors must be a valid JSON array.");
      }
    }),

  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be 0 or greater."),
];
