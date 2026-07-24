import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getProfile,
} from "../../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../../validators/auth.validator.js";
import validate from "../../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.post("/register", registerValidator, validate, register);

router.post("/login", loginValidator, validate, login);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", authenticate, logout);

router.get("/me", authenticate, getProfile);

export default router;
