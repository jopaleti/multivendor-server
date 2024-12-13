import express from "express";
import {
  createWithdrawRequest,
  getAllWithdrawRequest,
  updateWithdraw,
} from "../controller/withdraw";
import { isAdmin, isAuthenticated, isSeller } from "../middleware/auth";

// Initallizing the router
const router = express.Router();
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  getAllWithdrawRequest
);
router.post("/create-withdraw-request", isSeller, createWithdrawRequest);
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  updateWithdraw
);

export default router;
