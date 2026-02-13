import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect } from "../middleware/auth.js";
import { onContactCreated } from "../services/automationEngine.js";

const router = Router();

router.get("/", protect, async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const where = { workspaceId: req.user.workspaceId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } }
            ];
        }
        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where, orderBy: { createdAt: "desc" },
                skip: (Number(page) - 1) * Number(limit), take: Number(limit)
            }),
            prisma.contact.count({ where })
        ]);
        res.json({ contacts, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
        if (!contact) return res.status(404).json({ message: "Contact not found" });
        res.json({ contact });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, async (req, res) => {
    try {
        const { name, email, phone, message, tags, source } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });
        const contact = await prisma.contact.create({
            data: {
                name, email: email || "", phone: phone || "", message: message || "",
                tags: tags || [], source: source || "manual",
                workspaceId: req.user.workspaceId
            }
        });
        await onContactCreated(contact, req.user.workspaceId);
        res.status(201).json({ contact });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", protect, async (req, res) => {
    try {
        const contact = await prisma.contact.update({ where: { id: req.params.id }, data: req.body });
        res.json({ contact });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        await prisma.contact.delete({ where: { id: req.params.id } });
        res.json({ message: "Contact deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
