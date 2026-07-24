import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/product.controller.js";

import {
  createProductValidator,
  updateProductValidator,
} from "../../validators/product.validator.js";

import validate from "../../middlewares/validate.middleware.js";

import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

import { ROLES } from "../../constants/roles.js";

import { uploadProductImages } from "../../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products
 * @access  Public
 */
router.get("/", getProducts);

/**
 * @route   GET /api/v1/products/:productId
 * @desc    Get product by ID
 * @access  Public
 */
router.get("/:productId", getProductById);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Private (Admin)
 */
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  uploadProductImages,
  createProductValidator,
  validate,
  createProduct,
);

/**
 * @route   PUT /api/v1/products/:productId
 * @desc    Update product
 * @access  Private (Admin)
 */
router.put(
  "/:productId",
  authenticate,
  authorize(ROLES.ADMIN),
  uploadProductImages,
  updateProductValidator,
  validate,
  updateProduct,
);

/**
 * @route   DELETE /api/v1/products/:productId
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete(
  "/:productId",
  authenticate,
  authorize(ROLES.ADMIN),
  deleteProduct,
);

export default router;
