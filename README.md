# 🎯 StudySniper AI: Neural Study Intelligence Platform

StudySniper AI is a premium, enterprise-grade study intelligence engine designed to transform dense academic material into actionable, high-retention study assets. Built with a "Neural-First" philosophy, it leverages multiple world-class AI providers to ensure 100% uptime and elite-level synthesis.

---

## 🚀 Core Infrastructure & Tech Stack

### Frontend (Intelligence Interface)
- **Framework**: React 18 + Vite (Ultra-fast HMR)
- **Aesthetics**: Premium Glassmorphism & Cinematic Motion (Framer Motion)
- **Styling**: Modern CSS Variables + Tailwind-ready Architecture
- **State Management**: React Context API (Auth & Theme) + Real-time Firestore Listeners
- **Icons**: Lucide React (High-density vector set)

### Backend (Neural Logic)
- **Runtime**: Node.js + Express
- **Security**: Helmet (CSP-Hardened), CORS-Perceptive
- **Database**: Firebase Firestore (Real-time NoSQL with Local Persistence Fallback)
- **Auth**: Firebase Authentication (Multi-Role Support, Password Recovery)
- **File Processing**: Multer + Python-enhanced PDF Parsing (Vectorized Text Extraction)
- **Mail Service**: Nodemailer (Tactical Transactional Emails)

---

## 🧠 AI Engine Architecture (Multi-Provider Sync)

StudySniper uses a proprietary fallback chain to bypass API rate limits and ensure peak intelligence:
1.  **Primary**: **Groq Llama 3.3-70B** (Instant, high-speed synthesis and fast-validation checks)
2.  **Secondary**: **Google Gemini 2.0 Flash / 1.5 Pro** (High-reasoning, large context JSON generation)
3.  **Final Fallback**: **OpenRouter (Gemini Pro/Llama 3)** (Global redundancy)

---

## 💎 Key Features

### 1. Neural Syllabus Analysis & Validation Engine
- Upload up to 10 PDFs or paste raw text.
- **Strict Fast-Validation**: Instantly scans uploads within 1-2 seconds. Rejects out-of-bounds topics (e.g., uploading C++ for an OS exam) to prevent polluted study schedules.
- AI extracts core topics, assigns **Importance Scores (1-100)**, and identifies exam-critical concepts.

### 2. Question Bank Analyzer 
- Upload up to 5 previous years' exam papers simultaneously.
- The AI cross-references the documents to extract the **Most Repeated Patterns** and **Frequently Asked Questions**, sorting them by frequency and significance.
- Fully synchronized history allows you to view past analyses, or instantly wipe them from the secure backend.

### 3. Adaptive Study Planner
- Generate tactical, day-by-day schedules mapped *exactly* to the days remaining until your exam.
- AI dynamically distributes topics, prioritizing high-impact modules and areas with low confidence early to maximize retention.
- Pristine history deletion completely wipes your slate clean to 0% completion when generating a new path.

### 4. Pro Cheat Sheets
- Synthesize any topic into a professional, high-density cheat sheet.
- Includes **Comparative Analysis Tables**, **Formula Networks**, **Pro Highlights**, and **Interview/Exam Drills**.
- One-click **PDF Export** for offline revision.

### 5. Neural Chat Assistant (v2.1)
- 24/7 AI tutor aware of your study progress and platform features.
- Optimized for concise, application-specific guidance.

---

## 🛠️ Installation & Setup

### Backend
```bash
cd backend
npm install
# Configure .env with Firebase, Gemini, Groq, and OpenRouter keys
npm start
```

### Frontend
```bash
cd frontend
npm install
# Configure .env with Firebase credentials (VITE_FIREBASE_API_KEY, etc.)
npm run dev
```

---

## 📡 Networking & Connection (Neural Tunnel)
The project utilizes a **Vite Proxy Configuration** to route all `/api` requests through a secure local tunnel, eliminating CORS issues and local IP resolution errors between `localhost` and `127.0.0.1`.

---

## 🛡️ License & Copyright
© 2026 StudySniper AI. Intelligence for Scholars. All Rights Reserved.
