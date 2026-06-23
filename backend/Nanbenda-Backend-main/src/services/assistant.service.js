const AssistantRepository = require('../repositories/assistant.repository');
const genAI = require('../libs/genAI');

class AssistantService {
  async chat(userId, query, productIds) {
    let context = "You are the Nanbenda AI Assistant. Nanbenda is an app for mobile repairs and buying refurbished products. Keep your answers short, simple, and direct. Use tables whenever possible for comparisons and structured data.";
    
    // 1. Get last 4 chat history entries for context summary
    const history = await AssistantRepository.getChatHistoryByUserId(userId);
    const last4 = history.slice(-4);
    if (last4.length > 0) {
      context += "\n\n--- PREVIOUS CONTEXT SUMMARY ---\n";
      last4.forEach((h, i) => {
        context += `Q${i+1}: ${h.query}\nA${i+1}: ${h.result.substring(0, 150)}${h.result.length > 150 ? '...' : ''}\n`;
      });
      context += "--- END OF CONTEXT ---\n";
    }

    let productDetailsList = [];

    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      productDetailsList = await AssistantRepository.getProductDetailsByIds(productIds);
      
      if (productDetailsList.length > 0) {
        if (productDetailsList.length === 1) {
          const p = productDetailsList[0];
          context += `\nTopic: ${p.brand} ${p.model} (${p.type}). Price: ₹${p.price}. Description: ${p.description}.`;
        } else {
          context += `\nComparison requested for: ${productDetailsList.map(p => `${p.brand} ${p.model}`).join(', ')}.`;
          context += `\nProvide comparison in a clear markdown table format.`;
        }
      }
    }

    let resultText = "";

    if (genAI) {
      const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `${context}\n\nUser Question: ${query}\n\nRemember: Keep it short, use tables for data/reasoning. Give result:`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          resultText = response.text();
          if (resultText) break;
        } catch (err) {
          console.warn(`Failed to use model ${modelName}:`, err.message);
          lastError = err;
        }
      }

      if (!resultText && lastError) throw lastError;
    } else {
      resultText = `[MOCK AI] Short result for "${query}". Table: | Feature | Info | \n|---|---| \n| Query | ${query} | \n| Products | ${productDetailsList.length} |`;
    }

    await AssistantRepository.saveChatHistory(userId, productIds, query, resultText, 'gemini');

    return resultText;
  }

  async getHistory(userId) {
    const history = await AssistantRepository.getChatHistoryByUserId(userId);
    
    // Enrich history with product names
    return await Promise.all(history.map(async (row) => {
      let productNames = [];
      if (row.device_ids) {
        try {
          const ids = JSON.parse(row.device_ids);
          if (Array.isArray(ids) && ids.length > 0) {
            productNames = await AssistantRepository.getProductNamesByIds(ids);
          }
        } catch (e) {
          console.error("Error parsing device_ids in history:", e);
        }
      }
      return { ...row, product_names: productNames };
    }));
  }

  async clearHistory(userId) {
    return await AssistantRepository.clearChatHistory(userId);
  }
}

module.exports = new AssistantService();
