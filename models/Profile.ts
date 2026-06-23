import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfile extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Profile: Model<IProfile> = 
    mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;