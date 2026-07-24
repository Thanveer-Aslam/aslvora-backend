import User from "../models/User.js";

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/v1/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in user profile
 * @route   PATCH /api/v1/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { fullName, email, phoneNumber, profileImage } = req.body;

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check email uniqueness
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }

      user.email = email;
    }

    // Check phone uniqueness
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingPhone = await User.findOne({
        phoneNumber,
        _id: { $ne: userId },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists.",
        });
      }

      user.phoneNumber = phoneNumber;
    }

    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};
