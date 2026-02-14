import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, checkPermission } from "../middleware/auth.js";
import { onBookingCreated } from "../services/automationEngine.js";

const router = Router();

router.get("/mine", protect, async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                workspaceId: req.user.workspaceId,
                assignedToId: req.user.id,
                status: { not: "cancelled" }
            },
            include: { contact: true, service: true },
            orderBy: { date: "asc" }
        });
        res.json({ bookings });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

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
        const endTimeStr = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

        let resourceId = null;
        if (service.resourceType) {
            const resources = await prisma.resource.findMany({
                where: { workspaceId: req.user.workspaceId, type: service.resourceType }
            });

            if (resources.length > 0) {
                const busyResourceIds = await prisma.booking.findMany({
                    where: {
                        workspaceId: req.user.workspaceId,
                        date: new Date(date),
                        time: time,
                        status: { not: "cancelled" },
                        resourceId: { not: null }
                    },
                    select: { resourceId: true }
                }).then(bs => bs.map(b => b.resourceId));

                const available = resources.find(r => !busyResourceIds.includes(r.id));
                if (!available) return res.status(409).json({ message: `No ${service.resourceType} available at ${time}` });
                resourceId = available.id;
            }
        }

        // ─── Staff Assignment (Round Robin or Random from Qualified) ───
        // Find staff who can perform this service
        const qualifiedStaff = await prisma.user.findMany({
            where: {
                workspaceId: req.user.workspaceId,
                services: { some: { id: serviceId } }
            }
        });

        let assignedToId = null;
        if (qualifiedStaff.length > 0) {
            // Find staff who are NOT busy at this time
            const busyStaffIds = await prisma.booking.findMany({
                where: {
                    workspaceId: req.user.workspaceId,
                    date: new Date(date),
                    time: time,
                    status: { not: "cancelled" },
                    assignedToId: { not: null }
                },
                select: { assignedToId: true }
            }).then(bs => bs.map(b => b.assignedToId));

            const availableStaff = qualifiedStaff.filter(s => !busyStaffIds.includes(s.id));
            if (availableStaff.length === 0) return res.status(409).json({ message: `No qualified staff available at ${time}` });

            // Simple random assignment for now
            assignedToId = availableStaff[Math.floor(Math.random() * availableStaff.length)].id;
        } else {
            // If no staff explicitly linked, maybe assign to owner or leave unassigned?
            // For advanced mode, let's allow unassigned if no specific linking is done, 
            // OR if strictly advanced, we might block. Let's allow unassigned for fallback.
        }

        const booking = await prisma.booking.create({
            data: {
                contactId, serviceId, date: new Date(date), time,
                endTime: endTimeStr, notes: notes || "",
                workspaceId: req.user.workspaceId,
                resourceId,
                assignedToId // Assign the booking to the staff member
            },
            include: { contact: true, service: true, resource: true, assignedTo: true }
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
        const service = await prisma.service.findUnique({ where: { id: serviceId } });

        // Get all booked times for this service (simple check)
        const existingBookings = await prisma.booking.findMany({
            where: { workspaceId: req.params.workspaceId, serviceId, date: { gte: startOfDay, lte: endOfDay }, status: { not: "cancelled" } }
        });

        // If resource type is required, check resource availability per slot
        let unavailableTimes = new Set();

        if (service?.resourceType) {
            const resources = await prisma.resource.findMany({
                where: { workspaceId: req.params.workspaceId, type: service.resourceType }
            });
            const resourceCount = resources.length;

            if (resourceCount > 0) {
                // Find all bookings for this resource type at this date
                const resourceBookings = await prisma.booking.findMany({
                    where: {
                        workspaceId: req.params.workspaceId,
                        date: { gte: startOfDay, lte: endOfDay },
                        status: { not: "cancelled" },
                        resourceId: { not: null },
                        service: { resourceType: service.resourceType }
                    }
                });

                // Group by time
                const bookingsByTime = {};
                resourceBookings.forEach(b => {
                    bookingsByTime[b.time] = (bookingsByTime[b.time] || 0) + 1;
                });

                // If bookings at time >= resourceCount, that time is unavailable
                Object.keys(bookingsByTime).forEach(t => {
                    if (bookingsByTime[t] >= resourceCount) unavailableTimes.add(t);
                });
            }
        } else {
            // Fallback to simple service-level non-overlapping if no specific resource logic
            // (Assuming 1 concurrent booking per service if not defined, or just rely on manual)
            // For now, let's just use existingBookings to block specific times if we want single-thread
            // But usually without resources, we might allow overlaps. Let's stick to resource logic.
        }

        const bookedTimes = new Set(existingBookings.map(b => b.time));
        // Filter out:
        // 1. Times where THIS service is already booked (if we want to prevent double booking same service? maybe not if we have multiple staff)
        // 2. Times where required resources are exhausted

        // ─── Advanced Availability Check ───

        // 1. Resource Availability (Already implemented above)
        // 2. Staff Availability (New)

        let staffUnavailableTimes = new Set();
        const qualifiedStaff = await prisma.user.findMany({
            where: {
                workspaceId: req.params.workspaceId,
                services: { some: { id: serviceId } }
            }
        });

        // If we have qualified staff, we must check their schedules
        if (qualifiedStaff.length > 0) {
            const staffCount = qualifiedStaff.length;
            // Get all bookings for these specific staff members on this date
            const staffBookings = await prisma.booking.findMany({
                where: {
                    workspaceId: req.params.workspaceId,
                    date: { gte: startOfDay, lte: endOfDay },
                    status: { not: "cancelled" },
                    assignedToId: { in: qualifiedStaff.map(s => s.id) }
                }
            });

            const bookingsByTime = {};
            staffBookings.forEach(b => {
                bookingsByTime[b.time] = (bookingsByTime[b.time] || 0) + 1;
            });

            // If ALL qualified staff are busy at time T, then T is unavailable
            Object.keys(bookingsByTime).forEach(t => {
                if (bookingsByTime[t] >= staffCount) staffUnavailableTimes.add(t);
            });
        }

        const available = slots.filter(s =>
            !unavailableTimes.has(s.start) && // Resource check
            !staffUnavailableTimes.has(s.start) // Staff check
        );
        res.json({ slots: available });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
