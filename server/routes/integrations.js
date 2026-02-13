import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, ownerOnly } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = Router();

router.put("/email", protect, ownerOnly, async (req, res) => {
    try {
        const { host, port, user, pass } = req.body;
        const workspace = await prisma.workspace.update({
            where: { id: req.user.workspaceId },
            data: { emailConfig: { provider: "smtp", host, port: port || 587, user, pass, configured: true } }
        });
        res.json({ message: "Email configured", workspace });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/sms", protect, ownerOnly, async (req, res) => {
    try {
        const { sid, authToken, phone } = req.body;
        const workspace = await prisma.workspace.update({
            where: { id: req.user.workspaceId },
            data: { smsConfig: { provider: "twilio", sid, authToken, phone, configured: true } }
        });
        res.json({ message: "SMS configured", workspace });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/test-email", protect, ownerOnly, async (req, res) => {
    try {
        const workspace = await prisma.workspace.findUnique({ where: { id: req.user.workspaceId } });
        const ec = typeof workspace.emailConfig === "string" ? JSON.parse(workspace.emailConfig) : workspace.emailConfig;
        if (!ec.configured) return res.status(400).json({ message: "Email not configured" });
        try {
            const transporter = nodemailer.createTransport({ host: ec.host, port: ec.port, auth: { user: ec.user, pass: ec.pass } });
            await transporter.verify();
            res.json({ message: "Email connection successful" });
        } catch (err) { res.status(400).json({ message: `Email test failed: ${err.message}` }); }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/test-sms", protect, ownerOnly, async (req, res) => {
    try {
        const workspace = await prisma.workspace.findUnique({ where: { id: req.user.workspaceId } });
        const sc = typeof workspace.smsConfig === "string" ? JSON.parse(workspace.smsConfig) : workspace.smsConfig;
        if (!sc.configured) return res.status(400).json({ message: "SMS not configured" });
        res.json({ message: "SMS connection successful (stub)" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
