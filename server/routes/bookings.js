import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, checkPermission } from "../middleware/auth.js";
import { onBookingCreated } from "../services/automationEngine.js";

const router = Router();

router.get("/", protect, checkPermission("bookings"), async (req, res) => {
    try {
        const { status, from, to } = req.query;
        const where = { workspaceId: req.user.workspaceId };
        if (status) where.status = status;
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }
        const bookings = await prisma.booking.findMany({
            where, include: { contact: true, service: true }, orderBy: { date: "desc" }
        });
        res.json({ bookings });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", protect, checkPermission("bookings"), async (req, res) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.id }, include: { contact: true, service: true }
        });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json({ booking });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, checkPermission("bookings"), async (req, res) => {
    try {
        const { contactId, serviceId, date, time, notes } = req.body;
        if (!contactId || !serviceId || !date || !time) return res.status(400).json({ message: "Contact, service, date and time are required" });
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        const endMinutes = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]) + (service?.duration || 30);
        const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
        const booking = await prisma.booking.create({
            data: { contactId, serviceId, date: new Date(date), time, endTime, notes: notes || "", workspaceId: req.user.workspaceId },
            include: { contact: true, service: true }
        });
        await onBookingCreated(booking, req.user.workspaceId);
        res.status(201).json({ booking });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/status", protect, checkPermission("bookings"), async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await prisma.booking.update({
            where: { id: req.params.id }, data: { status },
            include: { contact: true, service: true }
        });
        res.json({ booking });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, checkPermission("bookings"), async (req, res) => {
    try {
        await prisma.booking.update({ where: { id: req.params.id }, data: { status: "cancelled" } });
        res.json({ message: "Booking cancelled" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public slots endpoint
router.get("/public/:workspaceId/slots", async (req, res) => {
    try {
        const { serviceId, date } = req.query;
        if (!serviceId || !date) return res.status(400).json({ message: "Service and date required" });
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const avail = await prisma.availability.findFirst({
            where: { workspaceId: req.params.workspaceId, serviceId, dayOfWeek }
        });
        if (!avail) return res.json({ slots: [] });
        const slots = typeof avail.slots === "string" ? JSON.parse(avail.slots) : avail.slots;

        const startOfDay = new Date(d); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(d); endOfDay.setHours(23, 59, 59, 999);
        const existingBookings = await prisma.booking.findMany({
            where: { workspaceId: req.params.workspaceId, serviceId, date: { gte: startOfDay, lte: endOfDay }, status: { not: "cancelled" } }
        });
        const bookedTimes = new Set(existingBookings.map(b => b.time));
        const available = slots.filter(s => !bookedTimes.has(s.start));
        res.json({ slots: available });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
