import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  cashier_id: mongoose.Types.ObjectId;
  total_items: number;
  total_price: number;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    cashier_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_items: {
      type: Number,
      required: true,
      min: 1,
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;