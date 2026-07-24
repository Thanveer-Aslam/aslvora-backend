import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay",
    },

    keyId: {
      type: String,
      trim: true,
      default: "",
    },

    keySecret: {
      type: String,
      default: "",
      select: false, 
    },

    webhookSecret: {
      type: String,
      default: "",
      select: false, 
    },

    mode: {
      type: String,
      enum: ["test", "live"],
      default: "test",
    },

    enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const settingsSchema = new mongoose.Schema(
  {
    payment: {
      type: paymentSettingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Settings", settingsSchema);
