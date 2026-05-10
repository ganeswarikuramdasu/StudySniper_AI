import axios from "axios";

// Using relative path for the Vite proxy
const API_BASE_URL = "/api";

const aiService = {
  analyzeSyllabus: async (contentOrFiles, userId) => {
    try {
      const formData = new FormData();
      
      if (Array.isArray(contentOrFiles)) {
        contentOrFiles.forEach(file => {
          formData.append("files", file);
        });
      } else if (contentOrFiles instanceof File) {
        formData.append("files", contentOrFiles);
      } else {
        formData.append("content", contentOrFiles);
      }
      
      formData.append("userId", userId);

      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000 // Increased timeout for multiple files
      });
      return response.data;
    } catch (error) {
      console.error("AI Syllabus Analysis Error:", error);
      throw error;
    }
  },

  chat: async (messages, userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { messages, userId }, {
        timeout: 60000
      });
      return response.data;
    } catch (error) {
      console.error("AI Chat Error:", error);
      throw error;
    }
  },

  generateStudyPlan: async (studentData, userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/study-plan`, { studentData, userId }, {
        timeout: 60000
      });
      return response.data;
    } catch (error) {
      console.error("AI Study Plan Error:", error);
      throw error;
    }
  }
};

export default aiService;
