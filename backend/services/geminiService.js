import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Gemini Service: Initializing Neural Multimodal Engine...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiService = {
  /**
   * Enhanced analysis supporting text and multimodal (PDF) inputs
   */
  analyzeContent: async (content, promptType = "syllabus", fileData = null) => {
    // 2026 Intelligence Engine: Targeting Direct 2.0 Nodes
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Neural Engine] Routing via node: ${modelName} [API: v1]`);
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1" });
        
        let systemPrompt = "";
        if (promptType === "syllabus") {
          systemPrompt = "Analyze this syllabus document. Return ONLY JSON: { \"title\": \"...\", \"topics\": [{ \"name\": \"...\", \"importance\": number, \"description\": \"...\" }] }";
        } else if (promptType === "cheatsheet") {
          systemPrompt = "Generate AI Cheat Sheet JSON. Include: title, summary, keyConcepts[], importantPoints[], formulas[], highlights[], flowExplanations[], interviewQuestions[], tables[].";
        } else {
          systemPrompt = "You are StudySniper AI. Analyze concisely.";
        }

        const parts = [{ text: systemPrompt }];

        if (fileData) {
          const files = Array.isArray(fileData) ? fileData : [fileData];
          files.forEach(file => {
            parts.push({
              inlineData: {
                data: file.buffer.toString("base64"),
                mimeType: file.mimetype
              }
            });
          });
        } else {
          parts.push({ text: content });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ [Neural Engine] Node ${modelName} Online. Sync complete.`);

        if (promptType === "chat") return text;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Neural output parsing failed");
        return JSON.parse(jsonMatch[0]);

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ [Neural Engine] Node ${modelName} Offline: ${error.message}`);
        continue; 
      }
    }

    throw new Error(`Intelligence Sync Failed: ${lastError.message}`);
  }
};
