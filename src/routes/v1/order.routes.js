import express from "express";

import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../../controllers/order.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createOrderValidator,
  orderIdValidator,
  updateOrderStatusValidator,
} from "../../validators/order.validator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  createOrderValidator,
  validate,
  placeOrder,
);

router.get("/", authenticate, getMyOrders);

router.get("/:id", authenticate, orderIdValidator, validate, getOrderById);

router.patch(
  "/:id/cancel",
  authenticate,
  orderIdValidator,
  validate,
  cancelOrder,
);


export default router;
