import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/stats", protect, async (req, res) => {
    try {
        const ws = req.user.workspaceId;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const weekFromNow = new Date(today); weekFromNow.setDate(weekFromNow.getDate() + 7);

        const [
            todayBookings, upcomingBookings, completedBookings, noShowBookings,
            totalContacts, newContacts, unreadConversations, totalConversations,
            pendingForms, overdueForms, completedForms, lowStockItems,
            recentFailedLogs, recentAutomationLogs
        ] = await Promise.all([
            prisma.booking.count({ where: { workspaceId: ws, date: { gte: today, lt: tomorrow } } }),
            prisma.booking.count({ where: { workspaceId: ws, date: { gte: tomorrow, lte: weekFromNow }, status: "confirmed" } }),
            prisma.booking.count({ where: { workspaceId: ws, status: "completed" } }),
            prisma.booking.count({ where: { workspaceId: ws, status: "no_show" } }),
            prisma.contact.count({ where: { workspaceId: ws } }),
            prisma.contact.count({ where: { workspaceId: ws, createdAt: { gte: today } } }),
            prisma.conversation.count({ where: { workspaceId: ws, unreadCount: { gt: 0 } } }),
            prisma.conversation.count({ where: { workspaceId: ws } }),
            prisma.formSubmission.count({ where: { workspaceId: ws, status: "pending" } }),
            prisma.formSubmission.count({ where: { workspaceId: ws, status: "overdue" } }),
            prisma.formSubmission.count({ where: { workspaceId: ws, status: "completed" } }),
            prisma.inventoryItem.findMany({ where: { workspaceId: ws, quantity: { lte: prisma.inventoryItem.fields?.threshold } } }),
            prisma.automationLog.findMany({ where: { workspaceId: ws, status: "failed" }, orderBy: { createdAt: "desc" }, take: 10 }),
            prisma.automationLog.findMany({ where: { workspaceId: ws }, orderBy: { createdAt: "desc" }, take: 20 })
        ]);

        // Low stock — raw query since Prisma can't compare two columns easily
        const lowStock = await prisma.$queryRaw`SELECT * FROM "InventoryItem" WHERE "workspaceId" = ${ws} AND "quantity" <= "threshold"`;

        const todayBookingsList = await prisma.booking.findMany({
            where: { workspaceId: ws, date: { gte: today, lt: tomorrow } },
            include: { contact: { select: { name: true } }, service: { select: { name: true, color: true } } },
            orderBy: { time: "asc" }, take: 10
        });

        const unansweredConversations = await prisma.conversation.findMany({
            where: { workspaceId: ws, unreadCount: { gt: 0 } },
            include: { contact: { select: { name: true, email: true } }, messages: { orderBy: { timestamp: "desc" }, take: 1 } },
            orderBy: { lastMessageAt: "desc" }, take: 5
        });

        const alerts = [];
        if (unreadConversations > 0) alerts.push({ type: "warning", category: "inbox", message: `${unreadConversations} unanswered message(s)`, link: "/inbox" });
        if (pendingForms > 0) alerts.push({ type: "info", category: "forms", message: `${pendingForms} pending form(s)`, link: "/forms" });
        if (overdueForms > 0) alerts.push({ type: "error", category: "forms", message: `${overdueForms} overdue form(s)`, link: "/forms" });
        for (const item of lowStock) {
            alerts.push({ type: "error", category: "inventory", message: `Low stock: ${item.name} (${item.quantity} ${item.unit})`, link: "/inventory" });
        }
        for (const log of recentFailedLogs) {
            alerts.push({ type: "error", category: "system", message: `Failed: ${log.action} - ${log.details}`, link: "/settings" });
        }

        res.json({
            bookings: { today: todayBookings, upcoming: upcomingBookings, completed: completedBookings, noShow: noShowBookings, todayList: todayBookingsList },
            leads: { total: totalContacts, new: newContacts, unread: unreadConversations, totalConversations, unanswered: unansweredConversations },
            forms: { pending: pendingForms, overdue: overdueForms, completed: completedForms },
            inventory: { lowStock },
            alerts,
            automationLogs: recentAutomationLogs
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
