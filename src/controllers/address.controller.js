import Address from "../models/Address.js";

/**
 * @desc    Create a new address
 * @route   POST /api/v1/address
 * @access  Private (Customer)
 */
export const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const {
      fullName,
      phoneNumber,
      label,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: userId },
        { $set: { isDefault: false } },
      );
    }

    const address = await Address.create({
      user: userId,
      fullName,
      phoneNumber,
      label,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully.",
      address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all addresses
 * @route   GET /api/v1/address
 * @access  Private (Customer)
 */
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const addresses = await Address.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single address
 * @route   GET /api/v1/address/:id
 * @access  Private (Customer)
 */
export const getAddressById = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update address
 * @route   PATCH /api/v1/address/:id
 * @access  Private (Customer)
 */
export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    if (req.body.isDefault) {
      await Address.updateMany(
        { user: userId },
        { $set: { isDefault: false } },
      );
    }

    Object.assign(address, req.body);

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/address/:id
 * @access  Private (Customer)
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set default address
 * @route   PATCH /api/v1/address/:id/default
 * @access  Private (Customer)
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

    address.isDefault = true;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully.",
      address,
    });
  } catch (error) {
    next(error);
  }
};
