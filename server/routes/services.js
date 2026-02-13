import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, ownerOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            where: { workspaceId: req.user.workspaceId }, orderBy: { name: "asc" }
        });
        res.json({ services });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const service = await prisma.service.findUnique({ where: { id: req.params.id } });
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.json({ service });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, ownerOnly, async (req, res) => {
    try {
        const { name, description, duration, price, location, color } = req.body;
        if (!name || !duration) return res.status(400).json({ message: "Name and duration are required" });
        const service = await prisma.service.create({
            data: { name, description: description || "", duration, price: price || 0, location: location || "", color: color || "#6366f1", workspaceId: req.user.workspaceId }
        });
        res.status(201).json({ service });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", protect, ownerOnly, async (req, res) => {
    try {
        const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
        res.json({ service });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, ownerOnly, async (req, res) => {
    try {
        await prisma.service.delete({ where: { id: req.params.id } });
        res.json({ message: "Service deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
