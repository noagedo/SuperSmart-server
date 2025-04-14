import { Request, Response } from "express";
import PersonalCartModel from "../models/personalCart";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// מחזיר את העגלה האישית של המשתמש או יוצר אחת אם לא קיימת
export const getOrCreatePersonalCart = async (
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

    let cart = await PersonalCartModel.findOne({ userId });

    if (!cart) {
      cart = new PersonalCartModel({ userId, items: [] });
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching or creating personal cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// הוספת פריט לעגלה
export const addItemToPersonalCart = async (
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

    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const cart = await PersonalCartModel.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
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
    console.error("Error adding item to personal cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// הסרת פריט מהעגלה
export const removeItemFromPersonalCart = async (
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

    const { itemId } = req.body;

    if (!itemId) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const cart = await PersonalCartModel.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    cart.items = cart.items.filter((item) => !item.itemId.equals(itemId));
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing item from personal cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
