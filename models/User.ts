import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "admin" | "kasir";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true,
      unique: true,
      lowercase: true
    },
    password: { 
      type: String, 
      required: true
    },
    role: { 
      type: String, 
      enum: ["admin", "kasir"],
      default: "kasir"
    },
  },
  { 
    timestamps: true
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;