// Defines API routes for user authentication
import express from "express";
import { register, login, logout, currentProfile } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protect, currentProfile);

export default authRouter;