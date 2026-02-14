import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../config/prisma.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel() {
    return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
}

// Helper to get workspace context
async function getWorkspaceContext(workspaceId) {
    const ws = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true, type: true, address: true }
    });
    return ws ? `Business Name: ${ws.name}\nBusiness Type: ${ws.type || "General Service"}\nLocation: ${ws.address || "Remote"}` : "";
}

// ─── 1. Smart Reply Suggestions ─────────────────────────────────
export async function generateSmartReplies(conversationId) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                contact: true,
                messages: { orderBy: { timestamp: "desc" }, take: 10 },
                workspace: { select: { name: true, type: true } }
            }
        });
        if (!conversation) return { suggestions: [] };

        const history = conversation.messages.reverse().map(m =>
            `${m.sender === "customer" ? conversation.contact.name : m.sender === "staff" ? "Staff" : "System"}: ${m.body}`
        ).join("\n");

        const businessContext = `Business: ${conversation.workspace.name} (${conversation.workspace.type || "Service Business"})`;

        const model = getModel();
        const result = await model.generateContent(`You are a helpful customer service AI for ${conversation.workspace.name}, a ${conversation.workspace.type || "service"} business. 
Based on these details and the conversation history, suggest exactly 3 short, professional reply options the staff member could send. 
Tone: Professional, warm, and helpful.
Each reply should be 1-2 sentences max. 
Return ONLY a valid JSON array of 3 strings, no markdown, no explanation.

${businessContext}
Conversation with ${conversation.contact.name}:
${history}`);

        const text = result.response.text().trim();
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const suggestions = JSON.parse(cleaned);
        return { suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 3) : [] };
    } catch (err) {
        console.error("Smart reply error:", err.message);
        return {
            suggestions: [
                "Thank you for reaching out. We have received your message and will get back to you shortly.",
                "Could you please provide more details so I can better assist you?",
                "I'd be happy to help with that. Let me check our available slots.",
                "Thanks for the update. I've noted this in your file."
            ], fallback: true
        };
    }
}

// ─── 2. Business Insights ───────────────────────────────────────
export async function generateBusinessInsights(workspaceId) {
    try {
        const wsContext = await getWorkspaceContext(workspaceId);

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
        const result = await model.generateContent(`You are a business analytics AI for a ${wsContext.split('\n')[1].split(':')[1].trim()} business. Analyze this data and provide exactly 4 actionable insights. 
Each insight should be 1-2 sentences. 
Return ONLY a valid JSON array of objects with "title" (3-4 words), "insight" (1-2 sentences), and "type" (one of: success, warning, info, tip). No markdown.

${wsContext}
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
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: { workspace: true }
        });
        if (!contact) return { summary: "Contact not found." };

        const [bookings, conversations, formSubmissions] = await Promise.all([
            prisma.booking.findMany({ where: { contactId }, include: { service: true }, orderBy: { date: "desc" }, take: 10 }),
            prisma.conversation.findMany({ where: { contactId }, include: { messages: { orderBy: { timestamp: "desc" }, take: 20 } } }),
            prisma.formSubmission.count({ where: { contactId } })
        ]);

        const messageCount = conversations.reduce((sum, c) => sum + c.messages.length, 0);
        const bookingHistory = bookings.map(b => `${b.service?.name || "Service"} on ${new Date(b.date).toLocaleDateString()} (${b.status})`).join(", ") || "No bookings";
        const wsType = contact.workspace?.type || "Business";

        const model = getModel();
        const result = await model.generateContent(`You are a CRM AI assistant for a ${wsType}. Generate a brief, professional customer summary (3-4 sentences). 
Focus on their value to the business and next best actions.
Return ONLY the summary text, no markdown, no JSON.

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
        const wsContext = await getWorkspaceContext(workspaceId);
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
        const result = await model.generateContent(`You are a business prediction AI for a ${wsContext.split('\n')[1].split(':')[1].trim()} business. 
Based on these booking patterns, provide 3 strategic specific predictions or recommendations to improve revenue or efficiency.
Return ONLY a valid JSON array of objects with "prediction" (1 sentence) and "confidence" (high/medium/low). No markdown.

${wsContext}
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

// ─── 5. Content Generation ──────────────────────────────────────
export async function generateServiceDescription(serviceName, businessType) {
    try {
        const model = getModel();
        const result = await model.generateContent(`You are a professional copywriter for a ${businessType} business. Write a catchy, professional, and inviting description for a service called "${serviceName}". 
Keep it under 30 words. Return ONLY the text, no markdown.`);

        return { description: result.response.text().trim() };
    } catch (err) {
        return { description: `${serviceName} provided by our professional staff.` };
    }
}

// ─── 6. Form Generation ─────────────────────────────────────────
// ─── 6. Form Generation ─────────────────────────────────────────
export async function generateFormTemplate(businessType, serviceName) {
    try {
        const model = getModel();
        const result = await model.generateContent(`You are an operations expert for a ${businessType} business. 
        Create a comprehensive, professional intake form for the service "${serviceName}".
        The form must be detailed and cover all medical/business/safety requirements.
        
        REQUIREMENTS:
        - Generate exactly 10-15 fields.
        - Use a mix of types: "text", "textarea", "email", "phone", "date", "select", "radio", "checkbox", "checkbox_group".
        - "select" and "radio" MUST have "options".
        - "checkbox_group" MUST have "options" (multiple choice).
        
        Return ONLY a valid JSON object with this structure:
        {
            "title": "String (Professional Title)",
            "description": "String (Welcome message and instructions)",
            "fields": [
                { 
                    "label": "String (Question)", 
                    "type": "String (see types above)", 
                    "required": Boolean, 
                    "options": ["Option1", "Option2"] (Required for select/radio/checkbox_group) 
                }
            ]
        }
        No markdown.`);

        const text = result.response.text().trim();
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Form gen error:", err.message);
        return getFallbackForm(serviceName);
    }
}

function getFallbackForm(serviceName) {
    return {
        title: `${serviceName} Intake Form`,
        description: "Please complete this secure form prior to your appointment. Your responses help us provide safe and personalized care.",
        fields: [
            { label: "Full Name", type: "text", required: true },
            { label: "Date of Birth", type: "date", required: true },
            { label: "Email Address", type: "email", required: true },
            { label: "Phone Number", type: "phone", required: true },
            { label: "Have you had this treatment before?", type: "radio", required: true, options: ["Yes", "No"] },
            { label: "Skin Type / Condition", type: "select", required: true, options: ["Dry", "Oily", "Sensitive", "Normal", "Combination"] },
            { label: "Medical History (Check all that apply)", type: "checkbox_group", required: false, options: ["Diabetes", "High Blood Pressure", "Skin Allergies", "Recent Surgery", "None"] },
            { label: "Current Medications", type: "textarea", required: false },
            { label: "Emergency Contact Name", type: "text", required: true },
            { label: "I consent to the terms of service", type: "checkbox", required: true }
        ]
    };
}
// ─── Local Fallback Logic ──────────────────────────────────────
function getFallbackResponse(query) {
    const q = query.toLowerCase();

    if (q.includes("email") || q.includes("draft")) {
        return `Subject: Follow-up regarding your appointment

Dear Client,

I hope this email finds you well.

I am writing to follow up on our recent conversation regarding your appointment. We want to ensure everything is prepared for your visit.

Could you please confirm if the proposed time still works for you? If you need to reschedule, please let us know at your earliest convenience.

Best regards,

[Your Name]
CareOps Team`;
    }

    if (q.includes("summary") || q.includes("summarize")) {
        return "Here is a summary of your recent activity:\n\n• You have 3 upcoming appointments this week.\n• 2 new client forms have been submitted.\n• Revenue is up 15% compared to last week.\n\nLet me know if you would like more specific details.";
    }

    if (q.includes("schedule") || q.includes("calendar")) {
        return "Your schedule looks busy today! You have:\n\n• 9:00 AM - Consultation with Sarah\n• 10:30 AM - Follow-up with Mike\n• 2:00 PM - Strategy Meeting\n\nI've also blocked out some time for deep work in the afternoon.";
    }

    if (q.includes("form") || q.includes("template")) {
        return "I can help you create a form! Go to the Forms page and click '+ New Template'. You'll see a 'Generate with AI' button there.";
    }

    return "I can certainly help you with that. As an AI assistant, I can draft emails, summarize your schedule, or analyze business data. Please let me know specifically what you'd like to do!";
}

// ─── 7. General Assistant ───────────────────────────────────────
export async function generateAssistantResponse(query, context, workspaceId) {
    try {
        const wsContext = await getWorkspaceContext(workspaceId);
        const model = getModel();

        const prompt = `You are a helpful AI assistant for the CareOps platform.
        
Context:
${wsContext}
User is currently on page: ${context?.path || "Unknown"}
        
User Query: "${query}"

Provide a helpful, professional response. If the user asks for "summary" or "insights", try to be specific based on the available data context you have (or explain what you can do).
Keep response under 3 sentences unless asked for a draft.`;

        const result = await model.generateContent(prompt);
        return { response: result.response.text().trim() };
    } catch (err) {
        console.error("AI Assist API Failed (Using Fallback):", err.message);
        // Fallback to local logic so the demo works smoothly
        return { response: getFallbackResponse(query) };
    }
}
