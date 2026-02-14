import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    console.log("Testing API Key:", process.env.GEMINI_API_KEY);
    try {
        const result = await model.generateContent("Hello, are you working?");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

run();
