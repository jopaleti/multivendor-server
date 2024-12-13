import express from "express";

import {
  createProduct,
  getAllProducts,
  getAllShopProduct,
  deleteShopProduct,
  productReview,
  getAllProductsAdmin,
} from "../controller/product";
import { isAuthenticated, isSeller } from "../middleware/auth";

const router = express.Router();

router.post("/create-product", createProduct);
router.get("/get-all-products-shop/:id", getAllShopProduct);
router.delete("/delete-product/:id", isSeller, deleteShopProduct);
router.get("/get-all-products", getAllProducts);
router.put("/create-new-review", isAuthenticated);
router.get("/admin-all-products", getAllProductsAdmin);

export default router;
