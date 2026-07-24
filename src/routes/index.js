import express from "express";
import authRoutes from "./v1/auth.routes.js";
import categoryRoutes from "./v1/category.routes.js";
import productRoutes from "./v1/product.routes.js";
import cartRoutes from "./v1/cart.routes.js";
import addressRoutes from "./v1/address.routes.js";
import userRoutes from "./v1/user.routes.js";
import adminRoutes from "./v1/admin.routes.js";
import wishlistRoutes from "./v1/wishlist.routes.js";
import orderRoutes from "./v1/order.routes.js";
import paymentRoutes from "./v1/payment.routes.js"
import settingsRoutes from "./v1/settings.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/address", addressRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin/settings", settingsRoutes);

export default router;
