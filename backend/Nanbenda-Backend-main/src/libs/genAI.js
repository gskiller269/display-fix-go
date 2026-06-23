const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEN_AI_KEY = process.env.GOOGLE_GEN_AI_KEY;

let genAI = null;
if (GEN_AI_KEY && GEN_AI_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
  genAI = new GoogleGenerativeAI(GEN_AI_KEY);
}

module.exports = genAI;
