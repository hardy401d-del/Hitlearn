import { useState } from "react";
import { Music, BookOpen, PlayCircle, Award, Sparkles, HelpCircle } from "lucide-react";
import { SongAnalysis } from "./types";
import WelcomeLanding from "./components/WelcomeLanding";
import SongSelector from "./components/SongSelector";
import StudyDashboard from "./components/StudyDashboard";
import LiveMode from "./components/LiveMode";
import QuizCourse from "./components/QuizCourse";
import GeminiKeyConfig from "./components/GeminiKeyConfig";
import { motion, AnimatePresence } from "motion/react";

type ViewType = "landing" | "selector" | "study" | "live" | "course";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("landing");
  const [selectedSong, setSelectedSong] = useState<SongAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  
  // Custom generated songs list backed up in local storage
  const [customSongs, setCustomSongs] = useState<SongAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem("hitlearn_custom_songs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSongSelected = (song: SongAnalysis) => {
    // If it is not a preset song (Imagine or Someone Like You), persist it in local custom library
    const isPreset = song.title.toLowerCase() === "imagine" || song.title.toLowerCase() === "someone like you";
    if (!isPreset) {
      setCustomSongs((prev) => {
        const exists = prev.some(
          (s) => s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase()
        );
        if (exists) return prev;
        const updated = [song, ...prev];
        try {
          localStorage.setItem("hitlearn_custom_songs", JSON.stringify(updated));
        } catch (e) {
          console.error("Local storage save failed:", e);
        }
        return updated;
      });
    }
    setSelectedSong(song);
    setCurrentView("study");
  };

  const handleDeleteCustomSong = (title: string, artist: string) => {
    setCustomSongs((prev) => {
      const updated = prev.filter(
        (s) => !(s.title.toLowerCase() === title.toLowerCase() && s.artist.toLowerCase() === artist.toLowerCase())
      );
      try {
        localStorage.setItem("hitlearn_custom_songs", JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage delete failed:", e);
      }
      return updated;
    });
  };

  const handleUpdateSong = (updatedSong: SongAnalysis) => {
    setSelectedSong(updatedSong);
    
    // Also update in customSongs if it is not a preset song
    const isPreset = updatedSong.title.toLowerCase() === "imagine" || updatedSong.title.toLowerCase() === "someone like you";
    if (!isPreset) {
      setCustomSongs((prev) => {
        const updated = prev.map((s) => 
          s.title.toLowerCase() === updatedSong.title.toLowerCase() && s.artist.toLowerCase() === updatedSong.artist.toLowerCase()
            ? updatedSong
            : s
        );
        try {
          localStorage.setItem("hitlearn_custom_songs", JSON.stringify(updated));
        } catch (e) {
          console.error("Local storage update failed:", e);
        }
        return updated;
      });
    }
  };

  const handleRestart = () => {
    setSelectedSong(null);
    setCurrentView("landing");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none selection:bg-red-200">
      
      {currentView !== "landing" && <GeminiKeyConfig />}

      {/* Visual Navigation Header - Hide in Landing page for cleaner immersive design */}
      {currentView !== "landing" && (
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={handleRestart} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-red-600/30 group-hover:scale-105 transition-transform">
                {/* Micro / Note Logo */}
                <svg 
                  className="w-5 h-5 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 text-[14.5px] leading-none block tracking-tight">
                  Hitlearn
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold leading-none block uppercase tracking-wider">
                  par IntouchProd
                </span>
              </div>
            </div>

            {/* Progress Steps (Visible only when song is active) */}
            {selectedSong && (
              <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-400">
                <button
                  onClick={() => setCurrentView("study")}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                    currentView === "study" 
                      ? "text-red-600 border-red-600 font-bold" 
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1. Étude &amp; Paroles</span>
                </button>

                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />

                <button
                  disabled={currentView === "study"}
                  onClick={() => setCurrentView("live")}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                    currentView === "live" 
                      ? "text-red-600 border-red-600 font-bold" 
                      : currentView === "course"
                      ? "border-transparent text-slate-500 hover:text-slate-800 cursor-pointer"
                      : "border-transparent opacity-40 cursor-not-allowed"
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>2. Session Live</span>
                </button>

                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />

                <span className={`flex items-center gap-1.5 pb-1 border-b-2 ${
                  currentView === "course" 
                    ? "text-red-600 border-red-600 font-bold" 
                    : "border-transparent opacity-40"
                }`}>
                  <Award className="w-3.5 h-3.5" />
                  <span>3. Quiz &amp; Diplôme</span>
                </span>
              </div>
            )}

            {/* Quick badge / info */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Propulsé par Gemini AI</span>
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Main Container with slide animation */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WelcomeLanding
                onEnterApp={() => setCurrentView("selector")}
              />
            </motion.div>
          )}

          {currentView === "selector" && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Added a small header with back button for the standalone selector */}
              <div className="max-w-4xl mx-auto px-4 pt-6 flex justify-between items-center">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-slate-200/60 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  ← Retour à l'accueil
                </button>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-slate-800 text-sm">Hitlearn</span>
                  <span className="text-[10px] text-red-600 font-black tracking-widest uppercase">PWA</span>
                </div>
              </div>

              <SongSelector
                onSongSelected={handleSongSelected}
                customSongs={customSongs}
                onDeleteCustomSong={handleDeleteCustomSong}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                uploadedAudioUrl={uploadedAudioUrl}
                setUploadedAudioUrl={setUploadedAudioUrl}
              />
            </motion.div>
          )}

          {currentView === "study" && selectedSong && (
            <motion.div
              key="study"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
            >
              <StudyDashboard
                song={selectedSong}
                onBack={handleRestart}
                onStartLiveMode={() => setCurrentView("live")}
              />
            </motion.div>
          )}

          {currentView === "live" && selectedSong && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <LiveMode
                song={selectedSong}
                onBackToStudy={() => setCurrentView("study")}
                onStartCourse={() => setCurrentView("course")}
                onUpdateSong={handleUpdateSong}
                uploadedAudioUrl={uploadedAudioUrl}
                setUploadedAudioUrl={setUploadedAudioUrl}
              />
            </motion.div>
          )}

          {currentView === "course" && selectedSong && (
            <motion.div
              key="course"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
            >
              <QuizCourse
                song={selectedSong}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Show small footer only when not in full-screen landing */}
      {currentView !== "landing" && (
        <footer className="py-6 border-t border-slate-200 bg-white text-center text-slate-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Hitlearn par <strong>IntouchProd</strong>. Conçu pour l'apprentissage linguistique bilingue.</p>
            <div className="flex items-center gap-4 font-semibold">
              <a href="#" className="hover:text-slate-600 transition-colors">Politique de confidentialité</a>
              <span>•</span>
              <a href="#" className="hover:text-slate-600 transition-colors">Conditions d'apprentissage</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
