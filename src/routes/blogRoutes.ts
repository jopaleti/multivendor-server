import express from "express";
import {
  createBlog,
  editBlog,
  deleteBlog,
  getAllBlog,
} from "../controller/blog";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/create-blog", isAuthenticated, createBlog);
router.put("/edit-blog/:id", isAuthenticated, editBlog);
router.delete("/delete-blog/:id", isAuthenticated, deleteBlog);
router.get("/get-blogs", getAllBlog);

export default router;
