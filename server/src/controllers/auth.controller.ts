import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";
import { AuthRequest } from "../middleware/auth.middleware";

const createToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
    });
};

export const register = async (req: Request, res: Response) => {
    const { name, password, email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        passwordHash,
    });

    const token = createToken(user._id.toString());

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });

    res.status(201).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id.toString());

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });

    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};

export const currentProfile = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?.userId).select("-passwordHash");

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    res.json({ user });
};