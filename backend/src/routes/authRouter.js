import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  verifyEmail,
  deleteUser,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/verify-email/:token", verifyEmail);
router.delete("/user/:id", deleteUser);

export default router;
