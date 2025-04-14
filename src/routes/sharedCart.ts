import express from "express";
import asyncHandler from "express-async-handler";
import {
  createSharedCartFromPersonal,
  addMemberToSharedCart,
  addItemToSharedCart,
  removeItemFromSharedCart,
} from "../controllers/sharedCart";
import { authMiddleware } from "../controllers/auth";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  asyncHandler(createSharedCartFromPersonal)
);

router.post(
  "/add-member",
  authMiddleware,
  asyncHandler(addMemberToSharedCart)
);

router.post(
  "/add-item",
  authMiddleware,
  asyncHandler(addItemToSharedCart)
);

router.delete(
  "/remove-item",
  authMiddleware,
  asyncHandler(removeItemFromSharedCart)
);

export default router;
