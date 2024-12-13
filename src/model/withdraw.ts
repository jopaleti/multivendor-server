import mongoose, { Schema, Document, Model } from "mongoose";

// Define an interface representing a document in MongoDB
interface IWithdraw extends Document {
  seller: Record<string, unknown>;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Create a Schema corresponding to the document interface
const withdrawSchema: Schema<IWithdraw> = new Schema({
  seller: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Create a Model
const Withdraw: Model<IWithdraw> = mongoose.model<IWithdraw>(
  "Withdraw",
  withdrawSchema
);

export default Withdraw;
