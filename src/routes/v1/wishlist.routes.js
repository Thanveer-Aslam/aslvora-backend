import express from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../controllers/wishlist.controller.js";

import { productIdValidator } from "../../validators/wishlist.validator.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/wishlist
 * @desc    Get logged-in user's wishlist
 * @access  Private
 */
router.get("/", getWishlist);

/**
 * @route   POST /api/v1/wishlist/:productId
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post("/:productId", productIdValidator, validate, addToWishlist);

/**
 * @route   DELETE /api/v1/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete("/:productId", productIdValidator, validate, removeFromWishlist);

export default router;
