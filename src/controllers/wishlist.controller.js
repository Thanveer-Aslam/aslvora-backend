import Wishlist from "../models/wishlist.js";
import Product from "../models/Product.js";

/**
 * @desc    Get User Wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "products.product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        count: 0,
        wishlist: [],
      });
    }

    res.status(200).json({
      success: true,
      count: wishlist.products.length,
      wishlist: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add Product to Wishlist
 * @route   POST /api/v1/wishlist/:productId
 * @access  Private
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [],
      });
    }

    const alreadyExists = wishlist.products.some(
      (item) => item.product.toString() === productId,
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in wishlist.",
      });
    }

    wishlist.products.push({
      product: productId,
    });

    await wishlist.save();

    await wishlist.populate({
      path: "products.product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully.",
      count: wishlist.products.length,
      wishlist: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove Product from Wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found.",
      });
    }

    const productExists = wishlist.products.some(
      (item) => item.product.toString() === productId,
    );

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist.",
      });
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId,
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully.",
      count: wishlist.products.length,
      wishlist: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};
