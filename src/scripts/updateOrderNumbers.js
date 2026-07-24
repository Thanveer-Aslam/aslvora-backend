import mongoose from "mongoose";

import Order from "../models/Order.js";
import Counter from "../models/Counter.js";
import { env } from "../config/env.js";

const updateOrderNumbers = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    // Reset Counter
    await Counter.findOneAndUpdate(
      { name: "order" },
      { sequence: 0 },
      { upsert: true, new: true },
    );

    // Get all orders (oldest first)
    const orders = await Order.find().sort({ createdAt: 1 });

    let sequence = 1;

    for (const order of orders) {
      order.orderNumber = `ORD-${String(sequence).padStart(6, "0")}`;
      await order.save();

      sequence++;
    }

    // Update counter to the latest sequence
    await Counter.findOneAndUpdate(
      { name: "order" },
      { sequence: sequence - 1 },
      { new: true },
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed");
    console.error(error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

updateOrderNumbers();
