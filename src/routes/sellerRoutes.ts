import express from "express";

import {
  createSeller,
  sellerActivation,
  loginShop,
  getSeller,
  logOutShop,
  getShopInfo,
  updateSellerProfilePicture,
  updateSellerInfo,
  getAllSellers,
  deleteSeller,
  updateSellerWithdraw,
  deleteSellerWithdraw,
} from "../controller/shop";
import { isAdmin, isAuthenticated, isSeller } from "../middleware/auth";

// Initializing the router
const router = express.Router();

router.post("/create-seller", createSeller);
router.post("/activation/:activation_token", sellerActivation);
router.post("/login", loginShop);
router.get("/getSeller", isSeller, getSeller);
router.get("/logout", logOutShop);
router.get("/getshopinfo/:id", getShopInfo);
router.put("/update-shop-avatar", isSeller, updateSellerProfilePicture);
router.put("/update-seller-info", isSeller, updateSellerInfo);
router.get(
  "/get-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  getAllSellers
);
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  deleteSeller
);
router.put("/update-payment-methods", isSeller, updateSellerWithdraw);
router.delete("/delete-withdraw-method", isSeller, deleteSellerWithdraw);

export default router;
