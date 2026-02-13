import { Router } from "express";
import prisma from "../config/prisma.js";
import { onContactCreated, onBookingCreated } from "../services/automationEngine.js";

const router = Router();

// Get workspace public info
router.get("/workspace/:id", async (req, res) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
            select: { id: true, name: true, address: true, phone: true, contactEmail: true, logo: true, isActive: true }
        });
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        res.json({ workspace });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get workspace services (public)
router.get("/workspace/:id/services", async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            where: { workspaceId: req.params.id, isActive: true }, orderBy: { name: "asc" }
        });
        res.json({ services });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public contact form submission
router.post("/workspace/:workspaceId/contact", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });
        const contact = await prisma.contact.create({
            data: { name, email: email || "", phone: phone || "", message: message || "", source: "contact_form", workspaceId: req.params.workspaceId }
        });
        await onContactCreated(contact, req.params.workspaceId);
        res.status(201).json({ contact, message: "Thank you! We'll be in touch." });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public booking
router.post("/workspace/:workspaceId/book", async (req, res) => {
    try {
        const { name, email, phone, serviceId, date, time } = req.body;
        if (!name || !serviceId || !date || !time) return res.status(400).json({ message: "Name, service, date and time are required" });

        let contact = await prisma.contact.findFirst({ where: { email: email.toLowerCase(), workspaceId: req.params.workspaceId } });
        if (!contact) {
            contact = await prisma.contact.create({
                data: { name, email: email || "", phone: phone || "", source: "booking", workspaceId: req.params.workspaceId }
            });
            await onContactCreated(contact, req.params.workspaceId);
        }

        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        const endMinutes = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]) + (service?.duration || 30);
        const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

        const booking = await prisma.booking.create({
            data: { contactId: contact.id, serviceId, date: new Date(date), time, endTime, workspaceId: req.params.workspaceId },
            include: { contact: true, service: true }
        });
        await onBookingCreated(booking, req.params.workspaceId);
        res.status(201).json({ booking, message: "Booking confirmed!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
