import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/address.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { shippingAddress, paymentMethod } = req.body;

    const address = await Address.findOne({
      _id: shippingAddress,
      user: userId,
    });

    if (!address) {
     

      return res.status(404).json({
        success: false,
        message: "Shipping address not found.",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) {
      

        return res.status(404).json({
          success: false,
          message: "One or more products no longer exist.",
        });
      }

      if (!product.isActive) {
       

        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable.`,
        });
      }

      if (product.stockQuantity < cartItem.quantity) {
       

        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} item(s) available for ${product.name}.`,
        });
      }

      const itemPrice = product.price;

      const totalPrice = itemPrice * cartItem.quantity;

      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        name: product.name,
        image:
          product.images.find((img) => img.isPrimary)?.url ||
          product.images[0]?.url ||
          "",
        size: cartItem.size,
        color: cartItem.color,
        quantity: cartItem.quantity,
        price: itemPrice,
        totalPrice,
      });
    }


    // Calculate Charges


    const shippingCharge = subtotal >= 1000 ? 0 : 100;

    const tax = Number((subtotal * 0.18).toFixed(2));

    const discount = 0;

    const totalAmount = subtotal + shippingCharge + tax - discount;


    // Generate Order Number

    const counter = await Counter.findOneAndUpdate(
      {
        name: "order",
      },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    const orderNumber = `ORD-${String(counter.sequence).padStart(6, "0")}`;

    // Create Order


    const createdOrder = await Order.create({
      orderNumber,
      user: userId,

      items: orderItems,

      shippingAddress,

      subtotal,
      discount,
      shippingCharge,
      tax,
      totalAmount,

      paymentMethod,

      paymentStatus: "Pending",

      orderStatus: "Pending",
    });

    // const createdOrder = order[0];


    // Update Product Stock

    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        {
          $inc: {
            stockQuantity: -cartItem.quantity,
          },
        },
        {
          new: true,
        },
      );
    }

    // Clear User Cart


    cart.items = [];

    await cart.save();



    // Populate Order Details
    await createdOrder.populate([
      {
        path: "shippingAddress",
      },
      {
        path: "items.product",
        populate: {
          path: "category",
          select: "name",
        },
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: createdOrder,
    });
  } catch (error) {

    next(error);
  } finally {
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({
      user: userId,
    })
      .populate("shippingAddress")
      .populate({
        path: "items.product",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: userId,
    })
      .populate("shippingAddress")
      .populate({
        path: "items.product",
        select: "name brand price images category",
        populate: {
          path: "category",
          select: "name",
        },
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order has already been cancelled.",
      });
    }

    if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Only Pending or Confirmed orders can be cancelled.",
      });
    }

    // Restore Stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stockQuantity: item.quantity,
          },
        },
        {
          new: true,
        },
      );
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    await order.save();

    await order.populate([
      {
        path: "shippingAddress",
      },
      {
        path: "items.product",
        select: "name brand price images category",
        populate: {
          path: "category",
          select: "name",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      orderStatus,
      paymentStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    const filter = {};

    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Search Users
    let userIds = [];

    if (search) {
      const users = await User.find({
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      }).select("_id");

      userIds = users.map((user) => user._id);

      filter.$or = [
        {
          orderNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          user: {
            $in: userIds,
          },
        },
      ];
    }

    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate({
        path: "user",
        select: "name email phone",
      })
      .populate("shippingAddress")
      .populate({
        path: "items.product",
        select: "name brand images",
      })
      .sort(sort)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalOrders / pageSize),
      totalOrders,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate({
        path: "user",
        select: "firstName lastName email phoneNumber",
      })
      .populate({
        path: "shippingAddress",
        select:
          "fullName phoneNumber addressLine1 addressLine2 city state country postalCode",
      })
      .populate({
        path: "items.product",
        select: "name brand images category",
        populate: {
          path: "category",
          select: "name",
        },
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const transitions = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["Processing", "Cancelled"],
      Processing: ["Shipped"],
      Shipped: ["Delivered"],
      Delivered: [],
      Cancelled: [],
    };

    const allowedTransitions = transitions[order.orderStatus] || [];

    if (!allowedTransitions.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}.`,
      });
    }

    if (orderStatus === "Cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stockQuantity: item.quantity,
          },
        });
      }

      order.cancelledAt = new Date();
    }

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();

      // Mark COD orders as paid when delivered
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
      }
    }

    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const adminCancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order has already been cancelled.",
      });
    }

    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled.",
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stockQuantity: item.quantity,
        },
      });
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};