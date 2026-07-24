import express from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import { getProfile, updateProfile } from "../../controllers/user.controller.js";

import { updateProfileValidator } from "../../validators/user.validator.js";

const router = express.Router();


router.use(authenticate);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/profile", getProfile);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update logged-in user profile
 * @access  Private
 */
router.patch("/profile", updateProfileValidator, validate, updateProfile);

export default router;
