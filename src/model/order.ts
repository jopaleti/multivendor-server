import mongoose, { Document, Schema } from "mongoose";

interface PaymentInfo {
  id: string;
  status: string;
  type: string;
}

interface IOrder extends Document {
  cart: any[];
  shippingAddress: Record<string, any>;
  user: Record<string, any>;
  totalPrice: number;
  status: string;
  paymentInfo: PaymentInfo;
  paidAt: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

const orderSchema: Schema = new Schema({
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
