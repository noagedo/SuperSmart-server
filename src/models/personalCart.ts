import mongoose, { Schema, Document, Types } from "mongoose";

// טיפוס TypeScript
export interface IPersonalCart extends Document {
  userId: Types.ObjectId;
  items: {
    itemId: Types.ObjectId;
    quantity: number;
  }[];
}

// סכימת Mongoose
const personalCartSchema = new Schema<IPersonalCart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

// מודל
const PersonalCartModel = mongoose.model<IPersonalCart>("PersonalCart", personalCartSchema);

export default PersonalCartModel;
