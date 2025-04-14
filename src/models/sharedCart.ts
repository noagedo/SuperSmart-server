import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISharedCart extends Document {
  name: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  items: {
    itemId: Types.ObjectId;
    quantity: number;
  }[];
}

const sharedCartSchema = new Schema<ISharedCart>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "users", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "users" }],
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const SharedCartModel = mongoose.model<ISharedCart>("SharedCart", sharedCartSchema);

export default SharedCartModel;
