import express from "express";
import { register, login, logout, userList } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", userList);

export default router;