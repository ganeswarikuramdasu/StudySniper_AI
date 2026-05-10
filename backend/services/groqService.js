import 'dotenv/config';
import Groq from "groq-sdk";

console.log("Groq Service: Initializing Core & Chat Engines...");

const coreGroq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const chatGroq = new Groq({
  apiKey: process.env.GROQ_CHAT_API_KEY || process.env.GROQ_API_KEY,
});

export const groqService = {
  chat: async (messages, modelType = "fast", useChatKey = false) => {
    try {
      const client = useChatKey ? chatGroq : coreGroq;
      
      // Updated to 2026 stable Llama models
      const model = modelType === "fast" 
        ? (process.env.GROQ_FAST_MODEL || "llama-3.3-70b-versatile")
        : (process.env.GROQ_REASONING_MODEL || "llama-3.1-8b-instant");

      console.log(`Groq Service: Sending request using model: ${model}`);
      
      const completion = await client.chat.completions.create({
        messages: messages,
        model: model,
        temperature: 0.6,
        max_tokens: 4096,
        top_p: 1,
        stream: false,
      });

      const response = completion.choices[0].message.content;
      return response;
    } catch (error) {
      console.error("❌ Groq Service Error:", error.message);
      
      // Emergency fallback for decommissioned models
      if (error.message.includes("decommissioned") || error.message.includes("not found")) {
        console.log("Groq: Model decommissioned. Using Llama-3.1-8b-instant emergency fallback.");
        const client = useChatKey ? chatGroq : coreGroq;
        const fallback = await client.chat.completions.create({
           messages: messages,
           model: "llama-3.1-8b-instant",
           max_tokens: 1024
        });
        return fallback.choices[0].message.content;
      }
      throw error;
    }
  }
};
