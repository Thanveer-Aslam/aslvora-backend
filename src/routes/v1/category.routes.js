import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../controllers/category.controller.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../../validators/category.validator.js";
import validate from "../../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

// Public Routes
router.get("/", getCategories);

router.get("/:categoryId", getCategoryById);

// Admin Routes
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  createCategoryValidator,
  validate,
  createCategory,
);

router.put(
  "/:categoryId",
  authenticate,
  authorize(ROLES.ADMIN),
  updateCategoryValidator,
  validate,
  updateCategory,
);

router.delete(
  "/:categoryId",
  authenticate,
  authorize(ROLES.ADMIN),
  deleteCategory,
);

export default router;
