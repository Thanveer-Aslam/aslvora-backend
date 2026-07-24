import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

/**
 * @desc    Get all customers
 * @route   GET /api/v1/admin/customers
 * @access  Admin
 */
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.aggregate([
      {
        $match: {
          role: ROLES.CUSTOMER,
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalOrders: {
            $size: "$orders",
          },
          totalSpent: {
            $sum: "$orders.totalAmount",
          },
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          orders: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer by ID
 * @route   GET /api/v1/admin/customers/:id
 * @access  Admin
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
          role: ROLES.CUSTOMER,
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalOrders: {
            $size: "$orders",
          },
          totalSpent: {
            $sum: "$orders.totalAmount",
          },
          lastOrderDate: {
            $max: "$orders.createdAt",
          },
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          orders: 0,
        },
      },
    ]);

    if (!customer.length) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    res.status(200).json({
      success: true,
      customer: customer[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block customer
 * @route   PATCH /api/v1/admin/customers/:id/block
 * @access  Admin
 */
export const blockCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: ROLES.CUSTOMER,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (customer.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "Customer is already blocked.",
      });
    }

    customer.isBlocked = true;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer blocked successfully.",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unblock customer
 * @route   PATCH /api/v1/admin/customers/:id/unblock
 * @access  Admin
 */
export const unblockCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: ROLES.CUSTOMER,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (!customer.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "Customer is already active.",
      });
    }

    customer.isBlocked = false;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer unblocked successfully.",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const [totalProducts, totalCustomers, totalOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({
        role: ROLES.CUSTOMER,
      }),
      Order.countDocuments(),
    ]);

    const [revenueResult, recentOrders, topProducts] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            orderStatus: "Delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.find()
        .populate("user", "fullName email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "orderNumber totalAmount orderStatus paymentStatus createdAt user",
        ),

      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              ),
            },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.product",
            sold: {
              $sum: "$items.quantity",
            },
            revenue: {
              $sum: "$items.totalPrice",
            },
          },
        },
        {
          $sort: {
            sold: -1,
          },
        },
        {
          $limit: 20,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "categories",
            localField: "product.category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            sold: 1,
            revenue: 1,

            name: "$product.name",
            price: "$product.price",
            stock: "$product.stockQuantity",

            image: {
              $arrayElemAt: ["$product.images.url", 0],
            },

            category: "$category.name",
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      dashboard: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};