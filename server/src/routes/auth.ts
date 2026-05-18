import express from "express";
import { register, login, logout, userList } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/users", userList);

export default authRouter;