import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { protect, ownerOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: { workspaceId: req.user.workspaceId, id: { not: req.user.id } },
            select: { id: true, name: true, email: true, role: true, permissions: true, avatar: true, lastLogin: true, createdAt: true }
        });
        res.json({ staff });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/invite", protect, ownerOnly, async (req, res) => {
    try {
        const { name, email, password, permissions } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
        const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (exists) return res.status(400).json({ message: "Email already registered" });
        const hashed = await bcrypt.hash(password, 12);
        const staff = await prisma.user.create({
            data: {
                name, email: email.toLowerCase(), password: hashed, role: "staff",
                workspaceId: req.user.workspaceId,
                permissions: permissions || { inbox: true, bookings: true, forms: true, inventory: false, contacts: true }
            }
        });
        const { password: _, ...safeStaff } = staff;
        res.status(201).json({ staff: safeStaff });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/permissions", protect, ownerOnly, async (req, res) => {
    try {
        const staff = await prisma.user.update({ where: { id: req.params.id }, data: { permissions: req.body.permissions } });
        const { password: _, ...safeStaff } = staff;
        res.json({ staff: safeStaff });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, ownerOnly, async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: "Staff removed" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
