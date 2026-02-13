import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../config/prisma.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel() {
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// ─── 1. Smart Reply Suggestions ─────────────────────────────────
export async function generateSmartReplies(conversationId) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true, messages: { orderBy: { timestamp: "desc" }, take: 10 } }
        });
        if (!conversation) return { suggestions: [] };

        const history = conversation.messages.reverse().map(m =>
            `${m.sender === "customer" ? conversation.contact.name : m.sender === "staff" ? "Staff" : "System"}: ${m.body}`
        ).join("\n");

        const model = getModel();
        const result = await model.generateContent(`You are a helpful customer service AI for a healthcare/care operations business called CareOps. Based on this conversation history, suggest exactly 3 short, professional reply options the staff member could send. Each reply should be 1-2 sentences max. Return ONLY a valid JSON array of 3 strings, no markdown, no explanation.

Conversation with ${conversation.contact.name} (${conversation.contact.email || "no email"}):
${history}`);

        const text = result.response.text().trim();
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const suggestions = JSON.parse(cleaned);
        return { suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 3) : [] };
    } catch (err) {
        console.error("Smart reply error:", err.message);
        return {
            suggestions: [
                "Thank you for reaching out! Let me look into this for you.",
                "I'd be happy to help you with that. Could you provide more details?",
                "Got it! I'll get back to you shortly with more information."
            ], fallback: true
        };
    }
}

// ─── 2. Business Insights ───────────────────────────────────────
export async function generateBusinessInsights(workspaceId) {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

        const [
            weekBookings, monthContacts, unanswered, completedBookings,
            noShowBookings, lowStock, pendingForms
        ] = await Promise.all([
            prisma.booking.count({ where: { workspaceId, createdAt: { gte: weekAgo } } }),
            prisma.contact.count({ where: { workspaceId, createdAt: { gte: monthAgo } } }),
            prisma.conversation.count({ where: { workspaceId, unreadCount: { gt: 0 } } }),
            prisma.booking.count({ where: { workspaceId, status: "completed", createdAt: { gte: monthAgo } } }),
            prisma.booking.count({ where: { workspaceId, status: "no_show", createdAt: { gte: monthAgo } } }),
            prisma.$queryRaw`SELECT COUNT(*) as count FROM "InventoryItem" WHERE "workspaceId" = ${workspaceId} AND "quantity" <= "threshold"`,
            prisma.formSubmission.count({ where: { workspaceId, status: "pending" } })
        ]);

        const lowStockCount = Number(lowStock[0]?.count || 0);
        const totalBookings = completedBookings + noShowBookings;
        const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

        const model = getModel();
        const result = await model.generateContent(`You are a business analytics AI for a care operations business. Analyze this data and provide exactly 4 actionable insights. Each insight should be 1-2 sentences. Return ONLY a valid JSON array of objects with "title" (3-4 words), "insight" (1-2 sentences), and "type" (one of: success, warning, info, tip). No markdown.

Data for this week/month:
- Bookings this week: ${weekBookings}
- New contacts this month: ${monthContacts}
- Unanswered conversations: ${unanswered}
- Booking completion rate: ${completionRate}% (${completedBookings} completed, ${noShowBookings} no-shows)
- Low stock items: ${lowStockCount}
- Pending forms: ${pendingForms}`);

        const text = result.response.text().trim();
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const insights = JSON.parse(cleaned);
        return { insights: Array.isArray(insights) ? insights : [], stats: { weekBookings, monthContacts, completionRate, lowStockCount } };
    } catch (err) {
        console.error("Insights error:", err.message);
        return {
            insights: [
                { title: "Stay Responsive", insight: "Respond to all customer messages within 1 hour to maximize conversion.", type: "tip" },
                { title: "Review Bookings", insight: "Check today's schedule to ensure all appointments are prepared for.", type: "info" },
                { title: "Stock Check", insight: "Review inventory levels to prevent service disruptions.", type: "warning" },
                { title: "Form Follow-up", insight: "Follow up on pending forms to ensure customer readiness.", type: "info" }
            ], fallback: true
        };
    }
}

// ─── 3. Contact Summary ─────────────────────────────────────────
export async function generateContactSummary(contactId) {
    try {
        const contact = await prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact) return { summary: "Contact not found." };

        const [bookings, conversations, formSubmissions] = await Promise.all([
            prisma.booking.findMany({ where: { contactId }, include: { service: true }, orderBy: { date: "desc" }, take: 10 }),
            prisma.conversation.findMany({ where: { contactId }, include: { messages: { orderBy: { timestamp: "desc" }, take: 20 } } }),
            prisma.formSubmission.count({ where: { contactId } })
        ]);

        const messageCount = conversations.reduce((sum, c) => sum + c.messages.length, 0);
        const bookingHistory = bookings.map(b => `${b.service?.name || "Service"} on ${new Date(b.date).toLocaleDateString()} (${b.status})`).join(", ") || "No bookings";

        const model = getModel();
        const result = await model.generateContent(`You are a CRM AI assistant. Generate a brief, professional customer summary (3-4 sentences). Return ONLY the summary text, no markdown, no JSON.

Customer: ${contact.name}
Email: ${contact.email || "N/A"}
Phone: ${contact.phone || "N/A"}
Source: ${contact.source}
Member since: ${new Date(contact.createdAt).toLocaleDateString()}
Total bookings: ${bookings.length}
Booking history: ${bookingHistory}
Messages exchanged: ${messageCount}
Forms submitted: ${formSubmissions}
Notes: ${contact.notes || "None"}`);

        return { summary: result.response.text().trim() };
    } catch (err) {
        console.error("Contact summary error:", err.message);
        return { summary: "Unable to generate summary at this time." };
    }
}

// ─── 4. Booking Predictions ─────────────────────────────────────
export async function generateBookingPredictions(workspaceId) {
    try {
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const bookings = await prisma.booking.findMany({
            where: { workspaceId, createdAt: { gte: thirtyDaysAgo } },
            select: { date: true, time: true, status: true }
        });

        const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
        const hourDistribution = {};
        bookings.forEach(b => {
            dayDistribution[new Date(b.date).getDay()]++;
            const hour = parseInt(b.time?.split(":")[0]) || 0;
            hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
        });

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const busiestDay = dayNames[dayDistribution.indexOf(Math.max(...dayDistribution))];
        const peakHours = Object.entries(hourDistribution).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h]) => `${h}:00`);

        const model = getModel();
        const result = await model.generateContent(`You are a business prediction AI. Based on this booking data, provide 3 predictions or recommendations. Return ONLY a valid JSON array of objects with "prediction" (1 sentence) and "confidence" (high/medium/low). No markdown.

30-day data:
- Total bookings: ${bookings.length}
- Day distribution: ${dayNames.map((d, i) => `${d}: ${dayDistribution[i]}`).join(", ")}
- Busiest day: ${busiestDay}
- Peak hours: ${peakHours.join(", ")}
- Completion rate: ${bookings.length > 0 ? Math.round(bookings.filter(b => b.status === "completed").length / bookings.length * 100) : 0}%`);

        const text = result.response.text().trim();
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const predictions = JSON.parse(cleaned);
        return {
            predictions: Array.isArray(predictions) ? predictions : [],
            analytics: { busiestDay, peakHours, totalBookings: bookings.length, dayDistribution: dayNames.map((d, i) => ({ day: d, count: dayDistribution[i] })) }
        };
    } catch (err) {
        console.error("Prediction error:", err.message);
        return { predictions: [{ prediction: "Not enough data to generate predictions yet.", confidence: "low" }], analytics: {} };
    }
}
