import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const router = Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

        const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email: email.toLowerCase(), password: hashed, role: "owner" }
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "30d" });
        const { password: _, ...safeUser } = user;
        res.status(201).json({ user: safeUser, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "30d" });
        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/me", async (req, res) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) return res.status(401).json({ message: "Not authorized (no token)" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: { workspace: true } // Include workspace to ensure it exists
        });

        if (!user) return res.status(401).json({ message: "User not found" });

        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (err) {
        console.error("Auth Me Error:", err);
        res.status(401).json({ message: "Not authorized (invalid token)" });
    }
});

export default router;
