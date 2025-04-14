import { Request, Response } from "express";
import { Types } from "mongoose";
import SharedCartModel from "../models/sharedCart";
import PersonalCartModel from "../models/personalCart";
import UserModel from "../models/user";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// יצירת עגלה שיתופית מתוך עגלה אישית
export const createSharedCartFromPersonal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.id;
    const { name } = req.body;

    if (!userId || !name) {
      res.status(400).json({ message: "Missing data" });
      return;
    }

    const personalCart = await PersonalCartModel.findOne({ userId });
    if (!personalCart) {
      res.status(404).json({ message: "No personal cart found" });
      return;
    }

    const sharedCart = new SharedCartModel({
      name,
      owner: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
      items: personalCart.items,
    });

    await sharedCart.save();
    res.status(201).json(sharedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// הוספת חבר לעגלה שיתופית לפי אימייל
export const addMemberToSharedCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.id;
    const { cartId, email } = req.body;

    if (!userId || !cartId || !email) {
      res.status(400).json({ message: "Missing data" });
      return;
    }

    const cart = await SharedCartModel.findById(cartId);
    if (!cart) {
      res.status(404).json({ message: "Shared cart not found" });
      return;
    }

    const userIdObj = new Types.ObjectId(userId);
    if (!cart.members.some((id) => id.equals(userIdObj))) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const userToAdd = await UserModel.findOne({ email });
    if (!userToAdd) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userToAddId = new Types.ObjectId(userToAdd._id);
    if (!cart.members.some((id) => id.equals(userToAddId))) {
      cart.members.push(userToAddId);
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// הוספת פריט לעגלה שיתופית
export const addItemToSharedCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = req.params.userId || user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { cartId, itemId, quantity } = req.body;
    const cart = await SharedCartModel.findById(cartId);
    if (!cart) {
      res.status(404).json({ message: "Shared cart not found" });
      return;
    }

    const userIdObj = new Types.ObjectId(userId);
    if (!cart.members.some((id) => id.equals(userIdObj))) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const existingItem = cart.items.find((item) => item.itemId.equals(itemId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ itemId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// הסרת פריט מהרשימה
export const removeItemFromSharedCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = req.params.userId || user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { cartId, itemId } = req.body;
    const cart = await SharedCartModel.findById(cartId);
    if (!cart) {
      res.status(404).json({ message: "Shared cart not found" });
      return;
    }

    const userIdObj = new Types.ObjectId(userId);
    if (!cart.members.some((id) => id.equals(userIdObj))) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    cart.items = cart.items.filter((item) => !item.itemId.equals(itemId));
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
