import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { aiManager } from './services/aiManager.js';
import { mailService } from './services/mailService.js';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 5000;

import admin, { db } from './firebase.js';

const upload = multer({ storage: multer.memoryStorage() });

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// HEALTH
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// AUTH
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.collection('otps').doc(email).set({ otp, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    await mailService.sendOTP(email, otp);
    res.json({ message: 'OTP sent' });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const doc = await db.collection('otps').doc(email).get();
    if (doc.exists && doc.data().otp === otp) {
      await db.collection('otps').doc(email).delete();
      return res.json({ message: 'Verified' });
    }
    res.status(400).json({ error: 'Invalid' });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/onboarding-complete', async (req, res) => {
  const { userId, data } = req.body;
  try {
    // 1. Save Profile
    await db.collection('users').doc(userId).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    
    // 2. Generate Strategic Path (Phases)
    console.log("[Setup] Generating Strategic Roadmap for:", userId);
    const examDate = new Date(data.examDate);
    const today = new Date();
    const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    
    const strategy = await aiManager.generateStrategy({
      ...data,
      daysLeft
    });

    await db.collection('users').doc(userId).collection('examPrepPlan').doc('current').set({
      ...strategy,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Generate Baseline Day-wise Schedule (Academic Schedule)
    console.log("[Setup] Generating Baseline Day-wise Schedule...");
    const plan = await aiManager.generateStudyPlan({
      examName: data.examName,
      topics: data.subjects.map(s => ({ name: s, importance: 80, description: "Core subject from setup" })),
      studyHoursPerDay: data.studyHoursPerDay || 4,
      days: Math.min(daysLeft, 7) // Baseline first week
    });

    const firestorePlan = {
      ...plan,
      schedule: JSON.stringify(plan.schedule || []),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(userId).collection('studyPlan').doc('current').set(firestorePlan);

    res.json({ message: 'Setup complete and synchronized' });
  } catch (error) {
    console.error("[Setup Error]:", error.message);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// CORE ENGINE
app.post('/api/analyze', upload.array('files', 10), async (req, res) => {
  const userId = req.body.userId;
  const files = req.files;
  let content = req.body.content;

  try {
    if (!files || files.length === 0) {
      if (!content) return res.status(400).json({ error: 'No content or files provided' });
    }

    // Call AI Manager with files (Gemini handles OCR/PDF natively now)
    const analysis = await aiManager.analyzeSyllabus(content, files);
    
    if (userId) {
      const firestoreData = { 
        ...analysis, 
        topics: JSON.stringify(analysis.topics || []),
        createdAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await db.collection('users').doc(userId).collection('aiAnalysis').add(firestoreData);

      // Trigger automatic schedule generation based on analysis
      const onboardSnap = await db.collection('users').doc(userId).get();
      let targetDays = 7;
      if (onboardSnap.exists) {
        const onboardData = onboardSnap.data();
        if (onboardData.examDate) {
          const examDate = new Date(onboardData.examDate);
          const today = new Date();
          const diffDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
          if (diffDays > 0) targetDays = Math.min(diffDays, 14);
        }
      }

      const plan = await aiManager.generateStudyPlan({
        examName: analysis.title || "Subject Analysis",
        topics: analysis.topics || [],
        studyHoursPerDay: 4,
        days: targetDays
      });
      
      const firestorePlan = {
        ...plan,
        schedule: JSON.stringify(plan.schedule || []),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(userId).collection('studyPlan').doc('current').set(firestorePlan);
    }

    res.json(analysis);
  } catch (error) {
    console.error("[Analyze] Critical Failure:", error.message);
    res.status(500).json({ error: `Intelligence Sync Failed: ${error.message}` });
  }
});

app.post('/api/generate-cheatsheet', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const sheet = await aiManager.generateCheatSheet(content);
    if (userId) {
      const storageData = { 
        ...sheet, 
        tables: JSON.stringify(sheet.tables || []),
        interviewQuestions: JSON.stringify(sheet.interviewQuestions || []),
        createdAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await db.collection('users').doc(userId).collection('cheatsheets').add(storageData);
    }
    res.json(sheet);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/chat', async (req, res) => {
  try {
    const response = await aiManager.getChatResponse(req.body.messages);
    res.json({ response });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 StudySniper Engine v2.1 Online: http://localhost:${PORT}`));
