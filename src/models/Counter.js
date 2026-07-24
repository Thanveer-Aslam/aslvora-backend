import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    sequence: {
      type: Number,
      default: 1000,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Counter", counterSchema);
