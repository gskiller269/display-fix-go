const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

const GEN_AI_KEY = process.env.GOOGLE_GEN_AI_KEY;

async function listModels() {
  if (!GEN_AI_KEY) {
    console.log("No API Key found");
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
    // There isn't a direct "listModels" in the simple SDK, but we can try to hit a known stable model
    console.log("Testing with gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("gemini-pro response:", response.text());
  } catch (error) {
    console.error("gemini-pro failed:", error.message);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
    console.log("Testing with gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("gemini-1.5-flash response:", response.text());
  } catch (error) {
    console.error("gemini-1.5-flash failed:", error.message);
  }
}

listModels();
