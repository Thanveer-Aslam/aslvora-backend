import crypto from "crypto";
import Order from "../models/Order.js";
import getRazorpayClient from "../utils/getRazorpayClient.js";

class PaymentService {

   // Create Razorpay Order

  static async createRazorpayOrder(orderId, userId) {
    console.log("=== PAYMENT SERVICE ===");
    console.log("orderId:", orderId);
    console.log("userId:", userId);
    const order = await Order.findById(orderId);
    console.log("Order Found:", !!order);
    if (!order) {
      throw new Error("Order not found.");
    }
    console.log("Order User:", order.user.toString());
    console.log("JWT User:", userId.toString());

    if (order.user.toString() !== userId.toString()) {
      throw new Error("You are not authorized to pay for this order.");
      }
      
    if (["Cancelled", "Delivered"].includes(order.orderStatus)) {
        throw new Error(
          `Cannot create payment for a ${order.orderStatus.toLowerCase()} order.`,
        );
    }

    if (order.paymentStatus === "Paid") {
      throw new Error("Order has already been paid.");
    }
    const { razorpay, keyId } = await getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    order.transactionId = razorpayOrder.id;
    await order.save();

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId,
    };
  }

   // Verify Razorpay Signature
   
  static async verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) {
    const { keySecret } = await getRazorpayClient();

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature.");
    }

    return true;
  }

  
   // Mark Payment Success
   
  static async markPaymentSuccess({
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
  }) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
      }
      
      // Prevent duplicate payment verification
    if (order.paymentStatus === "Paid") {
    throw new Error(
      "Payment has already been verified."
    );
    }
      
    if (order.transactionId !== razorpay_order_id) {
      throw new Error( "Invalid Razorpay order.");
    }  

    order.paymentStatus = "Paid";
    order.paymentMethod = "Razorpay";
    order.paymentId = razorpay_payment_id;
    order.transactionId = razorpay_order_id;

    if (order.orderStatus === "Pending") {
      order.orderStatus = "Confirmed";
    }

    await order.save();

    return order;
  }

  
   // Mark Payment Failed
   
  static async markPaymentFailed(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error( "Order not found.");
    }

    if (order.paymentStatus === "Paid") {
      throw new Error(
        
        "Cannot mark a successful payment as failed.",
      );
    }
      
    order.paymentStatus = "Failed";

    await order.save();

    return order;
  }
}

export default PaymentService;
