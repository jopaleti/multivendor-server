import express from "express";
import {
  createUser,
  deleteUserAddress,
  login,
  logout,
  updateAvatar,
  updateUserAddress,
  updateUserInfo,
  updateUserPassword,
  resetActivation,
  resetPassword,
  deleteUser,
  getAllUsers,
} from "../controller/user";
import { isAdmin, isAuthenticated } from "../middleware/auth";

// Initallizing the router
const router = express.Router();

router.get("/admin-all-users", isAuthenticated, isAdmin, getAllUsers);
router.post("/create-user", createUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);
router.put("/reset-activation/:otpToken", resetActivation);
router.put("/update-info", isAuthenticated, updateUserInfo);
router.put("/update-password", isAuthenticated, updateUserPassword);
router.put("/update-address", isAuthenticated, updateUserAddress);
router.delete("/delete-address/:id", isAuthenticated, deleteUserAddress);
router.put("/update-avatar", isAuthenticated, updateAvatar);
router.delete("/delete-user/:id", isAuthenticated, isAdmin, deleteUser);

export default router;
