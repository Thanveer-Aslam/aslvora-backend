import express from "express";

import {
  getPaymentSettings,
  updatePaymentSettings,
  testPaymentConnection,
} from "../../controllers/settings.controller.js";

import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import { updatePaymentSettingsValidator } from "../../validators/settings.validator.js";
import { ROLES } from "../../constants/roles.js";


const router = express.Router();

/**
 * @route   GET /api/v1/admin/settings/payment
 * @desc    Get Payment Settings
 * @access  Admin
 */
router.get(
  "/payment",
  authenticate,
  authorize(ROLES.ADMIN),
  getPaymentSettings,
);

/**
 * @route   PATCH /api/v1/admin/settings/payment
 * @desc    Update Payment Settings
 * @access  Admin
 */
router.patch(
  "/payment",
  authenticate,
  authorize(ROLES.ADMIN),
  updatePaymentSettingsValidator,
  validate,
  updatePaymentSettings,
);

/**
 * @route   POST /api/v1/admin/settings/payment/test
 * @desc    Test Razorpay Connection
 * @access  Admin
 */
router.post(
  "/payment/test",
  authenticate,
  authorize(ROLES.ADMIN),
  testPaymentConnection,
);

export default router;
