import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload as UploadIcon, FileText, CheckCircle2, 
  X, AlertCircle, Sparkles, Brain, ArrowRight, Loader2
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import aiService from "../services/aiService";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => f.type === "application/pdf");
    
    if (validFiles.length < selectedFiles.length) {
      toast.error("Some files were skipped. Only PDFs are supported.");
    }
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Limit to 10
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFiles = Array.from(e.dataTransfer.files);
    const validFiles = selectedFiles.filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...validFiles].slice(0, 10));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    try {
      toast.loading(`Neural engine syncing ${files.length} documents...`, { id: "analysis" });
      const data = await aiService.analyzeSyllabus(files, user.uid);
      toast.success("Intelligence Sync Complete! Study plan generated.", { id: "analysis" });
      navigate("/study-plan");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Analysis failed. Neural link disrupted.", { id: "analysis" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="badge border-[var(--purple)]/30 text-[var(--purple)] inline-block mx-auto uppercase tracking-widest text-[10px] font-bold">Multimodal Neural Engine</div>
          <h1 className="text-5xl font-display font-bold tracking-tight leading-tight">
            Sync your <span className="text-[var(--text-secondary)]">Knowledge.</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xl font-medium max-w-2xl mx-auto">
            Upload multiple syllabi or study materials. Our AI extracts core intelligence across all documents.
          </p>
        </header>

        {/* Upload Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple)] to-[var(--blue)] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative bg-[var(--bg-secondary)] border-2 border-dashed rounded-[40px] p-12 flex flex-col items-center justify-center transition-all duration-500 min-h-[400px] ${
              isDragging ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)]"
            }`}
          >
            <AnimatePresence mode="wait">
              {files.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center text-center space-y-8"
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-[var(--text-secondary)]">
                    <UploadIcon size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">Drop your documents</p>
                    <p className="text-[var(--text-muted)] font-medium">Select up to 10 PDF files (Max 20MB each)</p>
                  </div>
                  <label className="btn-primary cursor-pointer py-4 px-10 shadow-2xl">
                    Select Documents
                    <input type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
                  </label>
                </motion.div>
              ) : (
                <motion.div 
                  key="files-selected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl space-y-8"
                >
                  {/* File List */}
                  <div className="grid sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl relative group/item">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{f.name}</p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)]">{(f.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                        <button 
                          onClick={() => removeFile(i)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center space-y-6">
                    {isAnalyzing ? (
                      <div className="w-full max-w-md space-y-4">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[var(--accent)]"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest flex items-center justify-center gap-2">
                          <Loader2 size={12} className="animate-spin" /> Neural Sync Active: Extracting from {files.length} sources...
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-4 w-full">
                        <label className="flex-1 btn-secondary cursor-pointer py-4 flex items-center justify-center gap-2">
                           Add More
                           <input type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
                        </label>
                        <button 
                          onClick={startAnalysis}
                          className="flex-[2] btn-primary py-4 text-base shadow-2xl bg-[var(--accent)] text-black font-bold flex items-center justify-center gap-2"
                        >
                          Analyze {files.length} {files.length === 1 ? 'Document' : 'Documents'} <Sparkles size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-8 pt-12 border-t border-[var(--border)]">
           <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                 <Brain size={20} className="text-[var(--text-secondary)]" />
              </div>
              <div className="space-y-2">
                 <h4 className="font-display font-bold text-lg">Smart Topic Extraction</h4>
                 <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">Our Gemini-powered engine identifies core concepts and filters out the noise.</p>
              </div>
           </div>
           <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                 <CheckCircle2 size={20} className="text-[var(--text-secondary)]" />
              </div>
              <div className="space-y-2">
                 <h4 className="font-display font-bold text-lg">Automatic Importance Scoring</h4>
                 <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">Priority levels are assigned based on topic frequency and academic patterns.</p>
              </div>
           </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;
