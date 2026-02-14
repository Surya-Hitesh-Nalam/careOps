import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { protect, ownerOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: { workspaceId: req.user.workspaceId, id: { not: req.user.id } },
            select: { id: true, name: true, email: true, role: true, permissions: true, avatar: true, lastLogin: true, createdAt: true, services: true }
        });
        res.json({ staff });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

import { sendEmail } from "../services/emailService.js";

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

        // Send Invite Email
        let emailResult = { success: false, previewUrl: null };
        try {
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to the team, ${name}!</h2>
                    <p>You have been invited to join the workspace.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
                    </div>
                    <p>Please log in and change your password immediately.</p>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to CareOps</a>
                </div>
            `;
            emailResult = await sendEmail(req.user.workspaceId, email, "You're invited to CareOps!", emailHtml);
        } catch (emailErr) {
            console.error("Staff Invite Email Failed:", emailErr);
            // We proceed - staff created, just email failed
        }

        const { password: _, ...safeStaff } = staff;
        // Return 201 with explicit email status
        res.status(201).json({
            staff: safeStaff,
            emailPreview: emailResult.previewUrl,
            emailSent: emailResult.success
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/permissions", protect, ownerOnly, async (req, res) => {
    try {
        const staff = await prisma.user.update({ where: { id: req.params.id }, data: { permissions: req.body.permissions } });
        const { password: _, ...safeStaff } = staff;
        res.json({ staff: safeStaff });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/services", protect, ownerOnly, async (req, res) => {
    try {
        const { serviceIds } = req.body; // Array of Service IDs
        const staff = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                services: {
                    set: serviceIds.map(id => ({ id }))
                }
            },
            include: { services: true }
        });
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
