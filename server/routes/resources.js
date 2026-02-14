import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, checkPermission } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
    try {
        const resources = await prisma.resource.findMany({
            where: { workspaceId: req.user.workspaceId },
            orderBy: { createdAt: "desc" }
        });
        res.json({ resources });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) return res.status(400).json({ message: "Name and type required" });

        const resource = await prisma.resource.create({
            data: { name, type, workspaceId: req.user.workspaceId }
        });
        res.status(201).json({ resource });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        await prisma.resource.delete({ where: { id: req.params.id } });
        res.json({ message: "Resource deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
