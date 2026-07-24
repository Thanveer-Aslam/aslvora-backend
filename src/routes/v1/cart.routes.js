import express from "express";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../controllers/cart.controller.js";

import {
  addToCartValidator,
  updateCartItemValidator,
  removeCartItemValidator,
} from "../../validators/cart.validator.js";

import validate from "../../middlewares/validate.middleware.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/v1/cart
 * @desc    Add product to cart
 * @access  Private
 */
router.post("/", authenticate, addToCartValidator, validate, addToCart);

/**
 * @route   GET /api/v1/cart
 * @desc    Get logged-in user's cart
 * @access  Private
 */
router.get("/", authenticate, getCart);

/**
 * @route   PATCH /api/v1/cart/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.patch(
  "/:itemId",
  authenticate,
  updateCartItemValidator,
  validate,
  updateCartItem,
);

/**
 * @route   DELETE /api/v1/cart/:itemId
 * @desc    Remove a single item from cart
 * @access  Private
 */
router.delete(
  "/:itemId",
  authenticate,
  removeCartItemValidator,
  validate,
  removeCartItem,
);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete("/", authenticate, clearCart);

export default router;
