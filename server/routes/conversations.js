import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, checkPermission } from "../middleware/auth.js";
import { onStaffReply } from "../services/automationEngine.js";

const router = Router();

router.get("/", protect, checkPermission("inbox"), async (req, res) => {
    try {
        const { search } = req.query;
        const where = { workspaceId: req.user.workspaceId };
        const conversations = await prisma.conversation.findMany({
            where, include: {
                contact: { select: { id: true, name: true, email: true, phone: true } },
                assignedTo: { select: { id: true, name: true } },
                messages: { orderBy: { timestamp: "desc" }, take: 1 }
            }, orderBy: { lastMessageAt: "desc" }
        });
        let filtered = conversations;
        if (search) {
            const s = search.toLowerCase();
            filtered = conversations.filter(c =>
                c.contact && (c.contact.name.toLowerCase().includes(s) || (c.contact.email && c.contact.email.toLowerCase().includes(s)))
            );
        }
        res.json({ conversations: filtered });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", protect, checkPermission("inbox"), async (req, res) => {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: req.params.id },
            include: {
                contact: true,
                assignedTo: { select: { id: true, name: true } },
                messages: { orderBy: { timestamp: "asc" } }
            }
        });
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        await prisma.message.updateMany({ where: { conversationId: conversation.id }, data: { read: true } });
        await prisma.conversation.update({ where: { id: conversation.id }, data: { unreadCount: 0 } });
        res.json({ conversation });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:id/reply", protect, checkPermission("inbox"), async (req, res) => {
    try {
        const { body, channel, isInternal } = req.body;
        if (!body) return res.status(400).json({ message: "Message body is required" });

        await prisma.message.create({
            data: {
                conversationId: req.params.id,
                sender: "staff",
                channel: channel || "email",
                body,
                read: true,
                isInternal: !!isInternal,
                timestamp: new Date()
            }
        });

        const updateData = { assignedToId: req.user.id };
        // Only update last message if it's public
        if (!isInternal) {
            updateData.lastMessage = body;
            updateData.lastMessageAt = new Date();
        }

        const conversation = await prisma.conversation.update({
            where: { id: req.params.id },
            data: updateData,
            include: { contact: true, messages: { orderBy: { timestamp: "asc" } } }
        });

        if (!isInternal) await onStaffReply(conversation.id);

        res.json({ conversation });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", protect, checkPermission("inbox"), async (req, res) => {
    try {
        const { tags, priority, internalNotes } = req.body;
        const conversation = await prisma.conversation.update({
            where: { id: req.params.id },
            data: { tags, priority, internalNotes },
            include: { contact: true }
        });
        res.json({ conversation });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
