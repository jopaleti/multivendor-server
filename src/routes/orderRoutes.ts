import express from "express";

import {
  createOrder,
  getAllOrder,
  getSellerOrder,
  orderRefundRequest,
  orderRefundSuccess,
  adminGetAllOrders,
} from "../controller/order";

import { isAdmin, isAuthenticated, isSeller } from "../middleware/auth";

const router = express.Router();

router.post("/create-order", createOrder);
router.get("/get-all-orders/:userId", getAllOrder);
router.get("/get-seller-orders/:shopId", getSellerOrder);
router.put("/order-refund/:id", orderRefundRequest);
router.put("/order-refund-success/:id", isSeller, orderRefundSuccess);
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllOrders
);

export default router;
