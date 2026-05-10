import { geminiService } from "./geminiService.js";
import { groqService } from "./groqService.js";
import { openrouterService } from "./openrouterService.js";

const CHAT_SYSTEM_PROMPT = `You are StudySniper AI. Guide users concisely. Very short, professional answers.`;

export const aiManager = {
  // SYLLABUS ANALYSIS
  async analyzeSyllabus(content, files = null) {
    try {
      // 1. Try Native Gemini Multimodal (Best quality)
      if (files && files.length > 0) {
        try {
          console.log(`[AI Manager] Attempting Neural Multimodal Sync (${files.length} docs)...`);
          return await geminiService.analyzeContent(null, "syllabus", files);
        } catch (e) {
          console.warn("[AI Manager] Neural Multimodal failed, falling back to Text Extraction...");
          // Extract text from files and continue to text analysis
          let extractedText = "";
          for (const file of files) {
            extractedText += `\n--- File: ${file.originalname} ---\n`;
            extractedText += file.buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ''); // Basic cleanup
          }
          content = (content || "") + extractedText;
        }
      }

      // 2. Text-based Analysis (Fallback or Direct)
      const truncated = content ? content.substring(0, 15000) : "";
      const prompt = `Analyze syllabus. Return ONLY JSON: { "title": "string", "topics": [{ "name": "string", "importance": 1-100, "description": "string" }] }. Content: ${truncated}`;
      
      try {
        console.log("[AI Manager] Syncing via Groq Fast Node...");
        const response = await groqService.chat([{ role: "user", content: prompt }], "fast");
        return this.parseJSON(response);
      } catch (e) {
        try {
          console.log("[AI Manager] Groq failed, trying Gemini Text Node...");
          return await geminiService.analyzeContent(truncated, "syllabus");
        } catch (geminiError) {
          console.warn("[AI Manager] Gemini Text Node failed, activating OpenRouter Redundancy...");
          const orResponse = await openrouterService.chat([{ role: "user", content: prompt }]);
          return this.parseJSON(orResponse);
        }
      }
    } catch (error) {
      console.error("[AI Manager] Critical Failure:", error.message);
      throw error;
    }
  },

  // CHATBOT
  async getChatResponse(messages) {
    try {
      const contextualMessages = [{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...messages];
      return await groqService.chat(contextualMessages, "fast", true);
    } catch (error) {
      return await geminiService.analyzeContent(messages[messages.length - 1].content, "chat");
    }
  },

  // DYNAMIC ACADEMIC SCHEDULE
  async generateStudyPlan(studentData) {
    const totalDays = studentData.days || 7;
    const prompt = `Create a ${totalDays}-day academic study plan. Return ONLY JSON: { "schedule": [{ "day": number, "tasks": [{ "task": "string", "goal": "string", "duration": "string", "time": "string" }] }], "insights": "string" }. Exam: ${studentData.examName}. Topics: ${JSON.stringify(studentData.topics || [])}`;

    try {
      console.log("[AI Manager] Planning via Groq Node...");
      const response = await groqService.chat([{ role: "user", content: prompt }], "fast");
      return this.parseJSON(response);
    } catch (e) {
      try {
        console.warn("[AI Manager] Groq Planning failed, switching to Gemini...");
        return await geminiService.analyzeContent(prompt, "json");
      } catch (geminiError) {
        console.warn("[AI Manager] Gemini Planning failed, routing to OpenRouter...");
        const orResponse = await openrouterService.chat([{ role: "user", content: prompt }]);
        return this.parseJSON(orResponse);
      }
    }
  },

  // STRATEGIC PATH (Long-term Strategy)
  async generateStrategy(onboardData) {
    const prompt = `Create long-term strategy JSON: { "phases": [{ "name": "string", "duration": "string", "goal": "string", "milestones": ["string"] }], "readinessScore": number }. Exam: ${onboardData.examName}. Subjects: ${JSON.stringify(onboardData.subjects)}. Days Left: ${onboardData.daysLeft}`;

    try {
      console.log("[AI Manager] Strategy via Groq Node...");
      const response = await groqService.chat([{ role: "user", content: prompt }], "fast");
      return this.parseJSON(response);
    } catch (e) {
      try {
        console.warn("[AI Manager] Groq Strategy failed, switching to Gemini...");
        return await geminiService.analyzeContent(prompt, "json");
      } catch (geminiError) {
        console.warn("[AI Manager] Gemini Strategy failed, routing to OpenRouter...");
        const orResponse = await openrouterService.chat([{ role: "user", content: prompt }]);
        return this.parseJSON(orResponse);
      }
    }
  },

  // CHEAT SHEET
  async generateCheatSheet(topic) {
    const prompt = `Create study cheat sheet JSON for: "${topic}". Include: title, summary, keyConcepts[], importantPoints[], formulas[], highlights[], flowExplanations[], interviewQuestions[], tables[].`;

    try {
      console.log("[AI Manager] Cheat Sheet via Groq Node...");
      const response = await groqService.chat([{ role: "user", content: prompt }], "fast");
      return this.parseJSON(response);
    } catch (error) {
      try {
        console.warn("[AI Manager] Groq Cheat Sheet failed, switching to Gemini...");
        return await geminiService.analyzeContent(topic, "cheatsheet");
      } catch (geminiError) {
        console.warn("[AI Manager] Gemini Cheat Sheet failed, routing to OpenRouter...");
        const orResponse = await openrouterService.chat([{ role: "user", content: prompt }]);
        return this.parseJSON(orResponse);
      }
    }
  },

  parseJSON(text) {
    try {
      if (!text) throw new Error("Empty response");
      const cleaned = text.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch (e) {
      throw new Error(`AI format error: ${e.message}`);
    }
  }
};
