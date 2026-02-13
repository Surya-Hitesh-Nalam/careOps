import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, ownerOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, async (req, res) => {
    try {
        const { name, type, address, timezone, contactEmail, phone } = req.body;
        if (!name) return res.status(400).json({ message: "Workspace name is required" });
        const workspace = await prisma.workspace.create({
            data: {
                name, type: type || "", address: address || "", timezone: timezone || "UTC",
                contactEmail: contactEmail || req.user.email, phone: phone || "",
                ownerId: req.user.id
            }
        });
        await prisma.user.update({ where: { id: req.user.id }, data: { workspaceId: workspace.id, role: "owner" } });
        res.status(201).json({ workspace });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/mine", protect, async (req, res) => {
    try {
        const workspace = await prisma.workspace.findFirst({
            where: { OR: [{ ownerId: req.user.id }, { id: req.user.workspaceId || "" }] }
        });
        res.json({ workspace });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        res.json({ workspace });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", protect, ownerOnly, async (req, res) => {
    try {
        const workspace = await prisma.workspace.update({ where: { id: req.params.id }, data: req.body });
        res.json({ workspace });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/activate", protect, ownerOnly, async (req, res) => {
    try {
        const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        const errors = [];
        const ec = typeof workspace.emailConfig === "string" ? JSON.parse(workspace.emailConfig) : workspace.emailConfig;
        const sc = typeof workspace.smsConfig === "string" ? JSON.parse(workspace.smsConfig) : workspace.smsConfig;
        if (!ec.configured && !sc.configured) errors.push("At least one communication channel must be configured");
        const serviceCount = await prisma.service.count({ where: { workspaceId: workspace.id } });
        if (serviceCount === 0) errors.push("At least one service must exist");
        const availCount = await prisma.availability.count({ where: { workspaceId: workspace.id } });
        if (availCount === 0) errors.push("Availability must be defined");
        if (errors.length > 0) return res.status(400).json({ message: "Activation requirements not met", errors });

        const updated = await prisma.workspace.update({
            where: { id: req.params.id }, data: { isActive: true, onboardingStep: 8 }
        });
        res.json({ workspace: updated, message: "Workspace activated" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
