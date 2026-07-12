import React, { useState } from "react";
import { Music, Search, FileText, ChevronRight, HelpCircle, Loader2, Sparkles, BookOpen } from "lucide-react";
import { SongAnalysis } from "../types";
import { PRESET_SONGS } from "../presets";
import { motion, AnimatePresence } from "motion/react";

interface SongSelectorProps {
  onSongSelected: (song: SongAnalysis) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const TIPS = [
  "Les 'phrasal verbs' sont des verbes suivis d'une préposition qui en change complètement le sens (ex: 'settle down' = se poser).",
  "L'argot comme 'ain't' est extrêmement courant dans les chansons mais doit être évité dans un contexte académique ou professionnel !",
  "Écouter de la musique en lisant les paroles renforce les connexions neuronales entre l'audition et l'orthographe anglaise.",
  "Chanter à voix haute les paroles est la méthode n°1 pour travailler votre accent et débloquer votre mâchoire en anglais !",
  "Les expressions idiomatiques ne se traduisent jamais mot-à-mot. C'est le contexte culturel qui leur donne tout leur sens."
];

export default function SongSelector({ onSongSelected, isLoading, setIsLoading, error, setError }: SongSelectorProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [customLyrics, setCustomLyrics] = useState("");
  const [showCustomLyricsInput, setShowCustomLyricsInput] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips every 5 seconds during loading
  useState(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % TIPS.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  });

  const handlePresetSelect = (song: SongAnalysis) => {
    setError(null);
    onSongSelected(song);
  };

  const handleSearchAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError("Veuillez saisir un titre et un artiste.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTipIndex(0);

    try {
      const response = await fetch("/api/analyze-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim(),
          lyrics: customLyrics.trim() || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'analyse par l'IA.");
      }

      onSongSelected(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur de connexion au serveur s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin flex items-center justify-center">
                <Music className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 text-yellow-500 w-6 h-6 animate-bounce" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyse de la chanson par Gemini...</h3>
            <p className="text-slate-500 text-sm max-w-md mb-8">
              Nous récupérons les paroles officielles, générons la traduction française synchronisée et concevons votre cours de langue sur-mesure.
            </p>

            {/* Pedagogical rotating tip */}
            <div className="w-full max-w-lg bg-red-50/80 border border-red-100 rounded-xl p-6 text-left shadow-xs">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Le Conseil d'Anglais de Gemini</span>
              </div>
              <p className="text-slate-700 text-sm italic">
                &ldquo;{TIPS[tipIndex]}&rdquo;
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Hero Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold tracking-wide uppercase">
                <Music className="w-3.5 h-3.5" />
                <span>Apprendre l'anglais en musique</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
                Chantez. Comprenez. <span className="text-red-600">Progresseiz.</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto">
                Saisissez votre musique préférée. Notre intelligence artificielle s'occupe de décrypter les expressions, de traduire les paroles et de vous guider à travers un cours d'anglais immersif et ludique.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
              >
                <div className="font-bold">Erreur:</div>
                <div className="flex-1">{error}</div>
              </motion.div>
            )}

            {/* Preset Classic Tracks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span>Démarrage instantané (Titres Cultes)</span>
                </h2>
                <span className="text-xs text-slate-400">Aucun temps d'attente</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {PRESET_SONGS.map((song) => (
                  <button
                    key={song.title}
                    id={`preset-${song.title.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => handlePresetSelect(song)}
                    className="flex items-center justify-between p-5 bg-white border border-slate-200 hover:border-red-400 hover:shadow-md rounded-2xl text-left transition-all duration-200 group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                        {song.title}
                      </div>
                      <div className="text-slate-500 text-xs font-medium">{song.artist}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium uppercase tracking-wider">
                          {song.genre}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] rounded font-medium uppercase tracking-wider ${
                          song.difficulty === "Beginner" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {song.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-red-50 rounded-full flex items-center justify-center transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Analyze Form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Search className="w-5 h-5 text-red-500" />
                  <span>Analyser votre chanson préférée</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Gemini recherchera les paroles et construira votre leçon d'anglais sur-mesure !
                </p>
              </div>

              <form onSubmit={handleSearchAndAnalyze} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Titre de la Chanson <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Shape of You, Shallow, Hello..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Artiste / Groupe <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ed Sheeran, Lady Gaga, Adele..."
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Manual lyrics input toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomLyricsInput(!showCustomLyricsInput)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{showCustomLyricsInput ? "Masquer la saisie manuelle des paroles" : "Ajouter mes propres paroles (Optionnel)"}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showCustomLyricsInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-1.5"
                    >
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <span>Coller les paroles anglaises</span>
                        <span className="text-slate-400 font-normal">(Recommandé pour les musiques rares ou spécifiques)</span>
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Paste English lyrics here..."
                        value={customLyrics}
                        onChange={(e) => setCustomLyrics(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm font-mono transition-colors resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    id="submit-analysis-btn"
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Générer mon cours d'anglais</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
