import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, ownerOnly, checkPermission } from "../middleware/auth.js";
import { onInventoryLow } from "../services/automationEngine.js";

const router = Router();

router.get("/", protect, checkPermission("inventory"), async (req, res) => {
    try {
        const { category } = req.query;
        const where = { workspaceId: req.user.workspaceId };
        if (category) where.category = category;
        const items = await prisma.inventoryItem.findMany({ where, orderBy: { name: "asc" } });
        res.json({ items });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, ownerOnly, async (req, res) => {
    try {
        const { name, description, quantity, unit, threshold, category } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });
        const item = await prisma.inventoryItem.create({
            data: { name, description: description || "", quantity: quantity || 0, unit: unit || "pcs", threshold: threshold || 5, category: category || "General", workspaceId: req.user.workspaceId }
        });
        res.status(201).json({ item });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", protect, ownerOnly, async (req, res) => {
    try {
        const item = await prisma.inventoryItem.update({ where: { id: req.params.id }, data: req.body });
        if (item.quantity <= item.threshold) await onInventoryLow(item, req.user.workspaceId);
        res.json({ item });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/adjust", protect, checkPermission("inventory"), async (req, res) => {
    try {
        const { adjustment } = req.body;
        const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
        if (!item) return res.status(404).json({ message: "Item not found" });
        const newQty = Math.max(0, item.quantity + adjustment);
        const updated = await prisma.inventoryItem.update({ where: { id: req.params.id }, data: { quantity: newQty } });
        if (updated.quantity <= updated.threshold) await onInventoryLow(updated, req.user.workspaceId);
        res.json({ item: updated });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, ownerOnly, async (req, res) => {
    try {
        await prisma.inventoryItem.delete({ where: { id: req.params.id } });
        res.json({ message: "Item deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
