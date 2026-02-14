import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    const password = await bcrypt.hash("Judge123!", 10);

    // 1. Create Owner Account
    const ownerEmail = "demo@careops.com";
    let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });

    if (!owner) {
        console.log("Creating Owner account...");
        owner = await prisma.user.create({
            data: {
                name: "Demo Owner",
                email: ownerEmail,
                password,
                role: "owner",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            }
        });
    } else {
        console.log("Owner account already exists.");
    }

    // 2. Ensure Workspace Exists
    let workspace = await prisma.workspace.findFirst({ where: { ownerId: owner.id } });

    if (!workspace) {
        console.log("Creating Demo Workspace...");
        workspace = await prisma.workspace.create({
            data: {
                name: "CareOps Demo Clinic",
                type: "Clinical",
                ownerId: owner.id,
                isActive: true,
                onboardingStep: 6,
                contacts: {
                    create: [
                        { name: "Sarah Johnson", email: "sarah@example.com", source: "booking", notes: "VIP Client" },
                        { name: "Mike Chen", email: "mike@example.com", source: "contact_form", notes: "Interested in premium plan" }
                    ]
                }
            }
        });

        // Update owner with workspace
        await prisma.user.update({
            where: { id: owner.id },
            data: { workspaceId: workspace.id }
        });
    }

    // 3. Create Staff Account
    const staffEmail = "staff@careops.com";
    let staff = await prisma.user.findUnique({ where: { email: staffEmail } });

    if (!staff) {
        console.log("Creating Staff account...");
        staff = await prisma.user.create({
            data: {
                name: "Sarah Staff",
                email: staffEmail,
                password,
                role: "staff",
                workspaceId: workspace.id,
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Annie",
                permissions: {
                    inbox: true,
                    bookings: true,
                    forms: true,
                    contacts: true,
                    inventory: false
                }
            }
        });
    } else {
        console.log("Staff account already exists.");
    }

    console.log("✅ Seed completed!");
    console.log("Owner: demo@careops.com / Judge123!");
    console.log("Staff: staff@careops.com / Judge123!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
