import express from "express";

import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import { ROLES } from "../../constants/roles.js";

import {
  getDashboard,
  getCustomers,
  getCustomerById,
  blockCustomer,
  unblockCustomer,
} from "../../controllers/adminController.js";

import { customerIdValidator } from "../../validators/admin.validator.js";

import {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  adminCancelOrder,
} from "../../controllers/order.controller.js";

import {
  orderIdValidator,
  updateOrderStatusValidator,
} from "../../validators/order.validator.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

/**
 * Dashboard
 */
router.get("/dashboard", getDashboard);

router.get("/orders", getAllOrders);

router.get("/orders/:id", orderIdValidator, validate, getAdminOrderById);

router.patch(
  "/orders/:id/status",
  orderIdValidator,
  updateOrderStatusValidator,
  validate,
  updateOrderStatus,
);

router.patch(
  "/orders/:id/cancel",
  orderIdValidator,
  validate,
  adminCancelOrder,
);

/**
 * Customer Management
 */
router.get("/customers", getCustomers);

router.get("/customers/:id", customerIdValidator, validate, getCustomerById);

router.patch(
  "/customers/:id/block",
  customerIdValidator,
  validate,
  blockCustomer,
);

router.patch(
  "/customers/:id/unblock",
  customerIdValidator,
  validate,
  unblockCustomer,
);

export default router;
