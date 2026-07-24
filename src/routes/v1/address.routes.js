import express from "express";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../controllers/address.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createAddressValidator,
  updateAddressValidator,
  addressIdValidator,
} from "../../validators/addressValidator.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createAddressValidator, validate, createAddress);

router.get("/", getAddresses);

router.get("/:id", addressIdValidator, validate, getAddressById);

router.patch("/:id", updateAddressValidator, validate, updateAddress);

router.delete("/:id", addressIdValidator, validate, deleteAddress);

router.patch("/:id/default", addressIdValidator, validate, setDefaultAddress);

export default router;
