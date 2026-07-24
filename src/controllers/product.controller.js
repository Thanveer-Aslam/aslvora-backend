// import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      price,
      discount,
      availableSizes,
      availableColors,
      stockQuantity,
    } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // ✅ ADD THIS HERE
    const existingProduct = await Product.findOne({
      name: name.trim(),
      brand: brand.trim(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product already exists.",
      });
    }

    // Check if at least one image is uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    // Prepare image data
    const images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0,
    }));

    const sizes =
      typeof availableSizes === "string"
        ? JSON.parse(availableSizes)
        : availableSizes;

    const colors =
      typeof availableColors === "string"
        ? JSON.parse(availableColors)
        : availableColors;

    // Create product
    const product = await Product.create({
      name,
      brand,
      category,
      description,
      price,
      discount: discount || 0,
      availableSizes: sizes,
      availableColors: colors,
      stockQuantity,
      images,
    });

    // Populate category details
    await product.populate("category", "name");

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, brand, size, minPrice, maxPrice, sale, sort } =
      req.query;

    const filter = {};

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Sale filter
    if (sale === "true") {
      filter.discount = { $gt: 0 };
    }

    // Category filter
    // Category filter (by category name)
    if (category) {
      const existingCategory = await Category.findOne({
        name: {
          $regex: `^${category}$`,
          $options: "i",
        },
      });

      if (existingCategory) {
        filter.category = existingCategory._id;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    // Brand filter
    if (brand) {
      filter.brand = {
        $regex: `^${brand}$`,
        $options: "i",
      };
    }

    // Size filter
    if (size) {
      filter.availableSizes = size;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }
    let query = Product.find(filter).populate("category", "name");

    if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else if (sort === "oldest") {
      query = query.sort({ createdAt: 1 });
    } else if (sort === "priceLow") {
      query = query.sort({ price: 1 });
    } else if (sort === "priceHigh") {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate(
      "category",
      "name description",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const {
      name,
      brand,
      category,
      description,
      price,
      discount,
      availableSizes,
      availableColors,
      stockQuantity,
      isActive,
    } = req.body;

    const duplicateProduct = await Product.findOne({
      _id: { $ne: productId },
      name: { $regex: `^${(name ?? product.name).trim()}$`, $options: "i" },
      brand: {
        $regex: `^${(brand ?? product.brand).trim()}$`,
        $options: "i",
      },
    });

    if (duplicateProduct) {
      return res.status(409).json({
        success: false,
        message: "Another product with the same name and brand already exists.",
      });
    }

    // Check category
    if (category) {
      const existingCategory = await Category.findById(category);

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }

      product.category = category;
    }

    // --------------------------------------------
    // Handle Existing + New Images
    // --------------------------------------------

    let existingImages = [];

    if (req.body.existingImages) {
      existingImages =
        typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
    }

    // Images removed by the admin
    const removedImages = product.images.filter(
      (image) =>
        !existingImages.some(
          (existingImage) => existingImage.publicId === image.publicId,
        ),
    );

    // Delete removed images from Cloudinary
    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map((image) =>
          cloudinary.uploader.destroy(image.publicId),
        ),
      );
    }

    // Upload newly selected images
    const newImages =
      req.files?.map((file) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: false,
      })) || [];

    // console.log("Database Images:", product.images);
    // console.log("Existing Images:", existingImages);
    // console.log("New Images:", newImages);
    // Merge Existing + New Images
    product.images = [...existingImages, ...newImages];

    product.name = name ?? product.name;
    product.brand = brand ?? product.brand;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.discount = discount ?? product.discount;

    product.availableSizes =
      availableSizes !== undefined
        ? typeof availableSizes === "string"
          ? JSON.parse(availableSizes)
          : availableSizes
        : product.availableSizes;

    product.availableColors =
      availableColors !== undefined
        ? typeof availableColors === "string"
          ? JSON.parse(availableColors)
          : availableColors
        : product.availableColors;

    product.stockQuantity = stockQuantity ?? product.stockQuantity;
    product.isActive = isActive ?? product.isActive;

    await product.save();

    await product.populate("category", "name");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete all product images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((image) =>
          cloudinary.uploader.destroy(image.publicId),
        ),
      );
    }

    // Delete product from MongoDB
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};