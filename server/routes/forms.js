import { Router } from "express";
import prisma from "../config/prisma.js";
import { protect, ownerOnly, checkPermission } from "../middleware/auth.js";

const router = Router();

// ─── Templates ──────────────────────────────────────────────────
router.get("/templates", protect, async (req, res) => {
    try {
        const templates = await prisma.formTemplate.findMany({
            where: { workspaceId: req.user.workspaceId }, orderBy: { createdAt: "desc" }
        });
        res.json({ templates });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/templates", protect, ownerOnly, async (req, res) => {
    try {
        const { title, description, fields, linkedServices } = req.body;
        if (!title) return res.status(400).json({ message: "Title is required" });
        const template = await prisma.formTemplate.create({
            data: { title, description: description || "", fields: fields || [], linkedServices: linkedServices || [], workspaceId: req.user.workspaceId }
        });
        res.status(201).json({ template });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/templates/:id", protect, ownerOnly, async (req, res) => {
    try {
        const template = await prisma.formTemplate.update({ where: { id: req.params.id }, data: req.body });
        res.json({ template });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/templates/:id", protect, ownerOnly, async (req, res) => {
    try {
        await prisma.formTemplate.delete({ where: { id: req.params.id } });
        res.json({ message: "Template deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Submissions ────────────────────────────────────────────────
router.get("/submissions", protect, checkPermission("forms"), async (req, res) => {
    try {
        const { templateId, status } = req.query;
        const where = { workspaceId: req.user.workspaceId };
        if (templateId) where.templateId = templateId;
        if (status) where.status = status;
        const submissions = await prisma.formSubmission.findMany({
            where, include: { template: true, contact: true, booking: true }, orderBy: { createdAt: "desc" }
        });
        res.json({ submissions });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Public Form Access ─────────────────────────────────────────
router.get("/public/template/:formId", async (req, res) => {
    try {
        const template = await prisma.formTemplate.findUnique({ where: { id: req.params.formId } });
        if (!template) return res.status(404).json({ message: "Form not found" });
        res.json({ template });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/public/:formId/submit", async (req, res) => {
    try {
        const { answers, submittedBy, contactDetails } = req.body;
        const template = await prisma.formTemplate.findUnique({ where: { id: req.params.formId } });
        if (!template) return res.status(404).json({ message: "Form not found" });

        // Find or create contact
        let contact;
        if (contactDetails?.email) {
            contact = await prisma.contact.findFirst({
                where: {
                    email: contactDetails.email,
                    workspaceId: template.workspaceId
                }
            });

            if (!contact) {
                contact = await prisma.contact.create({
                    data: {
                        name: contactDetails.name || submittedBy || "Unknown",
                        email: contactDetails.email,
                        phone: contactDetails.phone || "",
                        workspaceId: template.workspaceId,
                        source: "contact_form"
                    }
                });
            }
        }

        const submission = await prisma.formSubmission.create({
            data: {
                templateId: template.id,
                contactId: contact.id, // Now guaranteed to exist
                workspaceId: template.workspaceId,
                data: answers || {},
                status: "completed",
                submittedAt: new Date()
            }
        });

        // Check if there are any automations for form submission
        // (Logic would go here, e.g., send email notification)

        res.status(201).json({ submission });
    } catch (err) {
        console.error("Form submit error:", err);
        res.status(500).json({ message: err.message });
    }
});

export default router;
