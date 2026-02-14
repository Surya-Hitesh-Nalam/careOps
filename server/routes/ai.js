import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { generateSmartReplies, generateBusinessInsights, generateContactSummary, generateBookingPredictions, generateFormTemplate, generateServiceDescription, generateAssistantResponse } from "../services/aiEngine.js";

const router = Router();

router.post("/smart-reply", protect, async (req, res) => {
    try {
        const { conversationId } = req.body;
        if (!conversationId) return res.status(400).json({ message: "Conversation ID required" });
        const result = await generateSmartReplies(conversationId);
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/insights", protect, async (req, res) => {
    try {
        const result = await generateBusinessInsights(req.user.workspaceId);
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/contact-summary/:id", protect, async (req, res) => {
    try {
        const result = await generateContactSummary(req.params.id);
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/booking-predictions", protect, async (req, res) => {
    try {
        const result = await generateBookingPredictions(req.user.workspaceId);
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/generate-description", protect, async (req, res) => {
    try {
        const { name, type } = req.body;
        const result = await generateServiceDescription(name, type || "service");
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/form-template", protect, async (req, res) => {
    try {
        const { businessType, serviceName } = req.body;
        const result = await generateFormTemplate(businessType, serviceName);
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/assist", protect, async (req, res) => {
    try {
        const { query, context } = req.body;
        const result = await generateAssistantResponse(query, context, req.user.workspaceId);
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
