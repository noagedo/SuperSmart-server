import express from "express";
import asyncHandler from "express-async-handler";
import {
  getOrCreatePersonalCart,
  addItemToPersonalCart,
  removeItemFromPersonalCart,
} from "../controllers/personalCart";
import { authMiddleware } from "../controllers/auth"; // או הנתיב הנכון

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getOrCreatePersonalCart));
router.post("/add", authMiddleware, asyncHandler(addItemToPersonalCart));
router.delete("/remove", authMiddleware, asyncHandler(removeItemFromPersonalCart));

export default router;
