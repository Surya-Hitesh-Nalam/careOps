import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";

// Cache for Ethereal account if no real SMTP is provided
let testAccount = null;

export const sendEmail = async (workspaceId, to, subject, html) => {
    try {
        // 1. Get Workspace Settings
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId }
        });

        let transporter;
        let isConfigured = false;

        // Priority 1: Workspace Settings
        const config = workspace?.emailConfig ? (typeof workspace.emailConfig === 'string' ? JSON.parse(workspace.emailConfig) : workspace.emailConfig) : {};

        if (config.configured && config.host && config.user && config.pass) {
            // 2. Use Real SMTP (Workspace Level)
            transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port || 587,
                secure: config.port === 465,
                auth: { user: config.user, pass: config.pass },
            });
            isConfigured = true;
        }
        // Priority 2: Environment Variables (System Level)
        else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });
            isConfigured = true;
        }
        // Priority 3: Fallback to Ethereal
        else {
            if (!testAccount) {
                testAccount = await nodemailer.createTestAccount();
            }

            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass },
            });
        }

        // 4. Send Mail
        const info = await transporter.sendMail({
            from: config.fromEmail || process.env.SMTP_USER || '"CareOps System" <system@careops.app>',
            to: to,
            subject: subject,
            html: html,
        });

        console.log("Message sent: %s", info.messageId);

        // Preview only available if NOT configured with real SMTP (i.e. using Ethereal)
        // Wait, if using Env vars, we DON'T want a preview URL generally, as it's real email.
        // So previewUrl should only be generated if we fell back to Priority 3.

        let previewUrl = null;
        if (!isConfigured) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("Preview URL: %s", previewUrl);
        }

        return { success: true, messageId: info.messageId, previewUrl };

    } catch (error) {
        console.error("Email Error:", error);
        throw new Error("Failed to send email: " + error.message);
    }
};
