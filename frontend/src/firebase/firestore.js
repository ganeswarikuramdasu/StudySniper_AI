// src/firebase/firestore.js
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

// ─── Profile ───────────────────────────────────────────────
export const updateUserProfile = async (uid, data) => {
  const ref = doc(db, "users", uid, "profile", "info");
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

// ─── Onboarding ────────────────────────────────────────────
export const saveOnboardingData = async (uid, data) => {
  await setDoc(doc(db, "users", uid, "profile", "onboarding"), {
    ...data,
    savedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", uid, "profile", "info"), {
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  });
};

export const deleteObjective = async (uid) => {
  await deleteDoc(doc(db, "users", uid, "profile", "onboarding"));
  await deleteDoc(doc(db, "users", uid, "examPrepPlan", "current"));
  await updateDoc(doc(db, "users", uid, "profile", "info"), {
    onboardingComplete: false,
    updatedAt: serverTimestamp(),
  });
};

export const getOnboardingData = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid, "profile", "onboarding"));
  return snap.exists() ? snap.data() : null;
};

// ─── Study Plan ────────────────────────────────────────────
export const saveStudyPlan = async (uid, planData) => {
  await setDoc(doc(db, "users", uid, "studyPlan", "current"), {
    ...planData,
    generatedAt: serverTimestamp(),
  });
};

export const getStudyPlan = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid, "studyPlan", "current"));
  return snap.exists() ? snap.data() : null;
};
export const deleteStudyPlan = async (uid) => {
  await deleteDoc(doc(db, "users", uid, "studyPlan", "current"));
  // Also reset progress stats when plan is deleted
  await setDoc(doc(db, "users", uid, "progress", "current"), {
    preparedness: 0,
    topicsCovered: 0,
    studyHours: 0,
    streak: 0,
    updatedAt: serverTimestamp()
  });
};

// ─── Progress ──────────────────────────────────────────────
import { arrayUnion, arrayRemove } from "firebase/firestore";

export const toggleTaskCompletion = async (uid, taskId, isCompleted) => {
  const ref = doc(db, "users", uid, "progress", "current");
  await updateDoc(ref, {
    completedTasks: isCompleted ? arrayUnion(taskId) : arrayRemove(taskId),
    updatedAt: serverTimestamp()
  });
};

export const updateProgress = async (uid, progressData) => {
  await setDoc(
    doc(db, "users", uid, "progress", "current"),
    { ...progressData, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

export const getProgress = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid, "progress", "current"));
  return snap.exists() ? snap.data() : null;
};

// ─── Uploads / AI Analysis ─────────────────────────────────
export const saveAIAnalysis = async (uid, analysis) => {
  const ref = collection(db, "users", uid, "aiAnalysis");
  return await addDoc(ref, { ...analysis, createdAt: serverTimestamp() });
};

export const getAIAnalyses = async (uid) => {
  const ref = collection(db, "users", uid, "aiAnalysis");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteAIAnalysis = async (uid, analysisId) => {
  await deleteDoc(doc(db, "users", uid, "aiAnalysis", analysisId));
};

// ─── Cheat Sheets ──────────────────────────────────────────
export const saveCheatSheet = async (uid, sheet) => {
  const ref = collection(db, "users", uid, "cheatsheets");
  return await addDoc(ref, { ...sheet, createdAt: serverTimestamp() });
};

export const getCheatSheets = async (uid) => {
  const ref = collection(db, "users", uid, "cheatsheets");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteCheatSheet = async (uid, sheetId) => {
  await deleteDoc(doc(db, "users", uid, "cheatsheets", sheetId));
};
