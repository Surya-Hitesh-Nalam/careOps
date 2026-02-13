import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, ownerOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
    try {
        const { serviceId } = req.query;
        const where = { workspaceId: req.user.workspaceId };
        if (serviceId) where.serviceId = serviceId;
        const availabilities = await prisma.availability.findMany({ where, include: { service: true } });
        res.json({ availabilities });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, ownerOnly, async (req, res) => {
    try {
        const { serviceId, dayOfWeek, slots } = req.body;
        if (!serviceId || dayOfWeek === undefined || !slots) return res.status(400).json({ message: "Service, day, and slots are required" });
        const existing = await prisma.availability.findFirst({
            where: { workspaceId: req.user.workspaceId, serviceId, dayOfWeek }
        });
        let availability;
        if (existing) {
            availability = await prisma.availability.update({ where: { id: existing.id }, data: { slots } });
        } else {
            availability = await prisma.availability.create({
                data: { workspaceId: req.user.workspaceId, serviceId, dayOfWeek, slots }
            });
        }
        res.status(201).json({ availability });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/bulk", protect, ownerOnly, async (req, res) => {
    try {
        const { serviceId, schedule } = req.body;
        if (!serviceId || !schedule) return res.status(400).json({ message: "Service and schedule are required" });
        await prisma.availability.deleteMany({ where: { workspaceId: req.user.workspaceId, serviceId } });
        const entries = [];
        for (const [day, slots] of Object.entries(schedule)) {
            if (slots.length > 0) {
                entries.push({ workspaceId: req.user.workspaceId, serviceId, dayOfWeek: Number(day), slots });
            }
        }
        if (entries.length > 0) await prisma.availability.createMany({ data: entries });
        const availabilities = await prisma.availability.findMany({
            where: { workspaceId: req.user.workspaceId, serviceId }
        });
        res.json({ availabilities });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, ownerOnly, async (req, res) => {
    try {
        await prisma.availability.delete({ where: { id: req.params.id } });
        res.json({ message: "Availability deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
