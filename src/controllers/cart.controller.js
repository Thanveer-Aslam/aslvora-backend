import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const buildCartResponse = (cart) => {
  const totalItems = cart.items.length;

  const totalQuantity = cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalPrice = cart.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );

  return {
    cartId: cart._id,
    user: cart.user,
    items: cart.items,
    totalItems,
    totalQuantity,
    totalPrice,
  };
};

export const addToCart = async (req, res, next) => {
    try {
      const userId = req.user.userId;

    const { product, size, color, quantity } = req.body;

    const existingProduct = await Product.findById(product);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (!existingProduct.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product is not available.",
      });
      }
      
      if (quantity > existingProduct.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${existingProduct.stockQuantity} item(s) available in stock.`,
        });
      }

      if (!existingProduct.availableSizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: "Selected size is not available for this product.",
        });
      }

      if (!existingProduct.availableColors.includes(color)) {
        return res.status(400).json({
          success: false,
          message: "Selected color is not available for this product.",
        });
      }

      let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    const existingCartItem = cart.items.find(
      (item) =>
        item.product.toString() === product &&
        item.size === size &&
        item.color === color,
    );

    if (existingCartItem) {
      existingCartItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        product,
        size,
        color,
        quantity,
        price: existingProduct.price,
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name",
      },
    });

return res.status(200).json({
  success: true,
  message: "Product added to cart successfully.",
  data: buildCartResponse(cart),
});
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req, res, next) => {
  try {
      
      const userId = req.user.userId;

    const cart = await Cart.findOne({
      user: userId,
    }).populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
        },
      });
    }

      return res.status(200).json({
        success: true,
        data: buildCartResponse(cart),
      });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    
    const userId = req.user.userId;

    const { itemId } = req.params;

    const { quantity } = req.body;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    // Fetch latest product details
    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check stock before updating quantity
    if (quantity > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock.",
      });
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully.",
      data: buildCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
      
      const userId = req.user.userId;

    const { itemId } = req.params;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    cart.items.pull(itemId);

    await cart.save();

    await cart.populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Item removed successfully.",
      data: buildCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
      
      const userId = req.user.userId;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      data: buildCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};