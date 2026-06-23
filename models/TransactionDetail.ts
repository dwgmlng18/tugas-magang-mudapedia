import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransactionDetail extends Document {
  transaction_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  subtotal: number;
}

const TransactionDetailSchema = new Schema<ITransactionDetail>(
  {
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: false,
  }
);

const TransactionDetail: Model<ITransactionDetail> =
  mongoose.models.TransactionDetail ||
  mongoose.model<ITransactionDetail>("TransactionDetail", TransactionDetailSchema);

export default TransactionDetail;