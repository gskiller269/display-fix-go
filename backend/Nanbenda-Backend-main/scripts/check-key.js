require('dotenv').config({ path: './.env' });
const GEN_AI_KEY = process.env.GOOGLE_GEN_AI_KEY;

async function check() {
  console.log("Checking API Key access via REST...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEN_AI_KEY}`);
    const data = await response.json();
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(` - ${m.name}`));
    } else {
      console.log("Error response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
}

check();
