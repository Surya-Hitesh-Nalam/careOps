
import prisma from "./config/prisma.js";

async function main() {
    const ws = await prisma.workspace.findFirst();
    if (ws) {
        console.log("WORKSPACE_ID: " + ws.id);
    } else {
        console.log("NO_WORKSPACE_FOUND");
    }
}
main();
