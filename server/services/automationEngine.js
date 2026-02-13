import prisma from "../config/prisma.js";
import nodemailer from "nodemailer";

// ─── Helper: Get workspace email transporter ─────────────────────
async function getTransporter(workspaceId) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) return null;
    const ec = typeof workspace.emailConfig === "string" ? JSON.parse(workspace.emailConfig) : workspace.emailConfig;
    if (!ec.configured) return null;
    return nodemailer.createTransport({ host: ec.host, port: ec.port, auth: { user: ec.user, pass: ec.pass } });
}

// ─── Helper: Log automation event ────────────────────────────────
async function logAutomation(workspaceId, event, action, status, details, relatedId, relatedModel) {
    try {
        await prisma.automationLog.create({
            data: { workspaceId, event, action, status, details: details || "", relatedId: relatedId || null, relatedModel: relatedModel || null }
        });
    } catch (err) { console.error("Log automation error:", err.message); }
}

// ─── Helper: Send email ──────────────────────────────────────────
async function sendEmail(workspaceId, to, subject, text) {
    try {
        const transporter = await getTransporter(workspaceId);
        if (!transporter) {
            await logAutomation(workspaceId, "send_email", "email", "skipped", "Email not configured");
            return;
        }
        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
        const ec = typeof workspace.emailConfig === "string" ? JSON.parse(workspace.emailConfig) : workspace.emailConfig;
        await transporter.sendMail({ from: ec.user, to, subject, text });
        await logAutomation(workspaceId, "send_email", "email", "success", `Sent to ${to}: ${subject}`);
    } catch (err) {
        await logAutomation(workspaceId, "send_email", "email", "failed", err.message);
    }
}

// ─── Helper: Create or find conversation ─────────────────────────
async function getOrCreateConversation(contactId, workspaceId) {
    let conversation = await prisma.conversation.findFirst({ where: { contactId, workspaceId } });
    if (!conversation) {
        conversation = await prisma.conversation.create({ data: { contactId, workspaceId } });
    }
    return conversation;
}

// ─── Helper: Add system message to conversation ──────────────────
async function addSystemMessage(conversationId, body) {
    await prisma.message.create({
        data: { conversationId, sender: "system", channel: "system", body, read: false, timestamp: new Date() }
    });
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessage: body, lastMessageAt: new Date(), unreadCount: { increment: 1 } }
    });
}

// ═══════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════

export async function onContactCreated(contact, workspaceId) {
    try {
        const conversation = await getOrCreateConversation(contact.id, workspaceId);
        const welcomeMsg = `Welcome ${contact.name}! Thank you for reaching out. Our team will get back to you shortly.`;
        await addSystemMessage(conversation.id, welcomeMsg);
        if (contact.email) await sendEmail(workspaceId, contact.email, "Welcome!", welcomeMsg);
        await logAutomation(workspaceId, "contact_created", "welcome_message", "success", `Welcome sent to ${contact.name}`, contact.id, "Contact");
    } catch (err) {
        await logAutomation(workspaceId, "contact_created", "welcome_message", "failed", err.message, contact.id, "Contact");
    }
}

export async function onBookingCreated(booking, workspaceId) {
    try {
        const conversation = await getOrCreateConversation(booking.contactId, workspaceId);
        const contact = booking.contact || await prisma.contact.findUnique({ where: { id: booking.contactId } });
        const service = booking.service || await prisma.service.findUnique({ where: { id: booking.serviceId } });
        const d = new Date(booking.date).toLocaleDateString();
        const confirmMsg = `Booking confirmed! ${service?.name || "Service"} on ${d} at ${booking.time}. We look forward to seeing you, ${contact?.name || "there"}!`;
        await addSystemMessage(conversation.id, confirmMsg);
        if (contact?.email) await sendEmail(workspaceId, contact.email, "Booking Confirmation", confirmMsg);
        await logAutomation(workspaceId, "booking_created", "confirmation", "success", `Confirmation sent for ${service?.name}`, booking.id, "Booking");
    } catch (err) {
        await logAutomation(workspaceId, "booking_created", "confirmation", "failed", err.message, booking.id, "Booking");
    }
}

export async function onInventoryLow(item, workspaceId) {
    try {
        const alertMsg = `⚠️ Low inventory alert: ${item.name} is at ${item.quantity} ${item.unit} (threshold: ${item.threshold})`;
        await logAutomation(workspaceId, "inventory_low", "alert", "success", alertMsg, item.id, "InventoryItem");
    } catch (err) {
        await logAutomation(workspaceId, "inventory_low", "alert", "failed", err.message, item.id, "InventoryItem");
    }
}

export async function onStaffReply(conversationId) {
    try {
        await prisma.conversation.update({ where: { id: conversationId }, data: { automationPaused: true } });
        const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (conv) await logAutomation(conv.workspaceId, "staff_reply", "pause_automation", "success", "Automation paused after staff reply", conversationId, "Conversation");
    } catch (err) { console.error("onStaffReply error:", err.message); }
}
