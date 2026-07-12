import React, { useState } from "react";
import { Music, Search, FileText, ChevronRight, HelpCircle, Loader2, Sparkles, BookOpen, Trash2, CheckCircle2, Upload, FileAudio } from "lucide-react";
import { SongAnalysis } from "../types";
import { PRESET_SONGS } from "../presets";
import { motion, AnimatePresence } from "motion/react";

interface SongSelectorProps {
  onSongSelected: (song: SongAnalysis) => void;
  customSongs?: SongAnalysis[];
  onDeleteCustomSong?: (title: string, artist: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  uploadedAudioUrl?: string | null;
  setUploadedAudioUrl?: (url: string | null) => void;
}

const TIPS = [
  "Les 'phrasal verbs' sont des verbes suivis d'une préposition qui en change complètement le sens (ex: 'settle down' = se poser).",
  "L'argot comme 'ain't' est extrêmement courant dans les chansons mais doit être évité dans un contexte académique ou professionnel !",
  "Écouter de la musique en lisant les paroles renforce les connexions neuronales entre l'audition et l'orthographe anglaise.",
  "Chanter à voix haute les paroles est la méthode n°1 pour travailler votre accent et débloquer votre mâchoire en anglais !",
  "Les expressions idiomatiques ne se traduisent jamais mot-à-mot. C'est le contexte culturel qui leur donne tout leur sens."
];

export default function SongSelector({ 
  onSongSelected, 
  customSongs = [], 
  onDeleteCustomSong, 
  isLoading, 
  setIsLoading, 
  error, 
  setError,
  uploadedAudioUrl,
  setUploadedAudioUrl
}: SongSelectorProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [customLyrics, setCustomLyrics] = useState("");
  const [showCustomLyricsInput, setShowCustomLyricsInput] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Audio transcription tab states
  const [activeTab, setActiveTab] = useState<"online" | "audio" | "offline">("online");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTitle, setAudioTitle] = useState("");
  const [audioArtist, setAudioArtist] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Offline creation states
  const [offlineTitle, setOfflineTitle] = useState("");
  const [offlineArtist, setOfflineArtist] = useState("");
  const [offlineEnglishLyrics, setOfflineEnglishLyrics] = useState("");
  const [offlineFrenchLyrics, setOfflineFrenchLyrics] = useState("");
  const [offlineGenre, setOfflineGenre] = useState("Pop / Rock");
  const [offlineDifficulty, setOfflineDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");

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

  const handleCreateOfflineSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineTitle.trim() || !offlineArtist.trim() || !offlineEnglishLyrics.trim()) {
      setError("Le titre, l'artiste et les paroles en anglais sont requis pour la création hors-ligne.");
      return;
    }

    const engLines = offlineEnglishLyrics.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const frLines = offlineFrenchLyrics.split("\n").map(l => l.trim());

    const sections: { sectionType: string; lines: { english: string; french: string }[] }[] = [];
    let currentSection = { sectionType: "Chanson", lines: [] as { english: string; french: string }[] };

    engLines.forEach((engLine, index) => {
      if (engLine.startsWith("[") && engLine.endsWith("]")) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { sectionType: engLine.slice(1, -1), lines: [] };
      } else {
        const frLine = frLines[index] || "";
        currentSection.lines.push({
          english: engLine,
          french: frLine
        });
      }
    });

    if (currentSection.lines.length > 0) {
      sections.push(currentSection);
    }

    if (sections.length === 0) {
      setError("Erreur : Impossible de diviser les paroles en vers.");
      return;
    }

    const offlineSong: SongAnalysis = {
      title: offlineTitle.trim(),
      artist: offlineArtist.trim(),
      genre: offlineGenre,
      difficulty: offlineDifficulty,
      summary: "Ce cours de langue a été créé localement sur votre appareil sans aucune connexion internet requise. Il est parfait pour une écoute autonome !",
      lyricsSections: sections,
      explanations: [
        {
          term: "Study Mode",
          meaningFr: "Mode d'étude",
          explanation: "Ce cours fonctionne entièrement en local sur votre appareil sans connexion requise.",
          type: "vocabulary",
          example: "I am studying offline."
        }
      ],
      liveComments: [
        {
          lineIndexGlobal: 0,
          term: "Mode Local",
          comment: "Bienvenue dans votre cours bilingue local ! Vous pouvez double-cliquer ou modifier directement n'importe quel vers dans le lecteur !",
          type: "culture"
        }
      ],
      quizQuestions: [
        {
          question: "Quelle méthode permet d'améliorer sa prononciation en anglais ?",
          options: [
            "Chanter à voix haute les paroles en écoutant la musique",
            "Mémoriser le dictionnaire par cœur",
            "Éviter d'écouter de la musique",
            "Traduire mot-à-mot sans contexte"
          ],
          correctAnswer: "Chanter à voix haute les paroles en écoutant la musique",
          explanation: "Chanter à voix haute aide à travailler l'intonation, la fluidité, le rythme et l'appareil phonatoire !"
        }
      ]
    };

    setError(null);
    onSongSelected(offlineSong);
  };

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      setError(null);
    } else {
      setError("Veuillez déposer un fichier audio valide (MP3, WAV, M4A, etc.).");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError(null);
    }
  };

  const handleAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError("Veuillez sélectionner un fichier audio.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTipIndex(0);

    try {
      // 1. Convert to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioFile);

      const base64Data = await base64Promise;

      // 2. Set up local Audio player URL in parent App component so LiveMode can play it
      if (setUploadedAudioUrl) {
        const url = URL.createObjectURL(audioFile);
        setUploadedAudioUrl(url);
      }

      // 3. Request API
      const response = await fetch("/api/transcribe-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: base64Data,
          mimeType: audioFile.type || "audio/mp3",
          title: audioTitle.trim() || undefined,
          artist: audioArtist.trim() || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur de transcription de l'audio.");
      }

      onSongSelected(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de transcrire et d'analyser le fichier audio.");
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

            {/* Custom Songs Library */}
            {customSongs && customSongs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Music className="w-5 h-5 text-red-500 animate-pulse" />
                    <span>Vos leçons générées ({customSongs.length})</span>
                  </h2>
                  <span className="text-xs text-slate-400">Prêt à l'étude</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {customSongs.map((song) => (
                    <div
                      key={`${song.title}-${song.artist}`}
                      className="flex items-center justify-between p-5 bg-white border border-slate-200 hover:border-red-400 hover:shadow-md rounded-2xl text-left transition-all duration-200 group relative cursor-pointer"
                      onClick={() => handlePresetSelect(song)}
                    >
                      <div className="space-y-1 flex-1 pr-4">
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
                              : song.difficulty === "Intermediate"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {song.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {onDeleteCustomSong && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomSong(song.title, song.artist);
                            }}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors cursor-pointer"
                            title="Supprimer ce cours"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePresetSelect(song)}
                          className="w-10 h-10 bg-slate-50 group-hover:bg-red-50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Analyze Form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("online");
                    setError(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "online"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <span>🚀 Assistant IA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("audio");
                    setError(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "audio"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <FileAudio className="w-4 h-4 text-amber-500" />
                  <span>🎙️ Transcription MP3</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("offline");
                    setError(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "offline"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>🔌 Hors-ligne</span>
                </button>
              </div>

              {activeTab === "online" ? (
                <>
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
                </>
              ) : activeTab === "audio" ? (
                <>
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <FileAudio className="w-5 h-5 text-amber-500" />
                      <span>Transcrire et Analyser un fichier MP3</span>
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Importez un morceau (MP3, WAV, M4A) depuis votre appareil. Gemini va écouter l'audio, transcrire les paroles en anglais, générer les traductions bilingues et concevoir vos quiz !
                    </p>
                  </div>

                  <form onSubmit={handleAudioSubmit} className="space-y-5">
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 relative cursor-pointer ${
                        isDragging
                          ? "border-amber-500 bg-amber-50/50 scale-[1.01]"
                          : audioFile
                          ? "border-emerald-500 bg-emerald-50/20"
                          : "border-slate-300 hover:border-amber-400 bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className={`p-4 rounded-full ${
                          audioFile ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        }`}>
                          {audioFile ? (
                            <CheckCircle2 className="w-8 h-8" />
                          ) : (
                            <Upload className="w-8 h-8 animate-bounce" />
                          )}
                        </div>

                        {audioFile ? (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-emerald-800">
                              Fichier audio sélectionné !
                            </p>
                            <p className="text-xs font-mono text-slate-600 break-all max-w-md mx-auto">
                              {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} Mo)
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Cliquez ou glissez un autre fichier pour le remplacer
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-700">
                              Sélectionner ou glisser votre musique ici
                            </p>
                            <p className="text-xs text-slate-400">
                              Formats acceptés : MP3, WAV, M4A, OGG, AAC... (Max 10 Mo)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata fields to help Gemini */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <span>Titre de la Chanson</span>
                          <span className="text-slate-400 font-normal">(Optionnel, aide l'IA)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Shape of You, Shallow, Hello..."
                          value={audioTitle}
                          onChange={(e) => setAudioTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <span>Artiste / Groupe</span>
                          <span className="text-slate-400 font-normal">(Optionnel, aide l'IA)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Ed Sheeran, Lady Gaga, Adele..."
                          value={audioArtist}
                          onChange={(e) => setAudioArtist(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-400 italic">
                        🔒 Vos fichiers audio sont traités de manière sécurisée et confidentielle par Gemini.
                      </div>
                      <button
                        type="submit"
                        disabled={!audioFile}
                        className={`px-6 py-3.5 font-bold text-sm rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
                          audioFile
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>Transcrire et Créer le Cours</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-700" />
                      <span>Création de cours Instantané (Hors-ligne)</span>
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Idéal si vous êtes déconnecté ! Entrez vos paroles et étudiez vos morceaux préférés avec synchronisation locale.
                    </p>
                  </div>

                  <form onSubmit={handleCreateOfflineSong} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Titre de la Chanson <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Shape of You, Shallow, Hello..."
                          value={offlineTitle}
                          onChange={(e) => setOfflineTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Artiste / Groupe <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Ed Sheeran, Lady Gaga, Adele..."
                          value={offlineArtist}
                          onChange={(e) => setOfflineArtist(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Genre Musical</label>
                        <input
                          type="text"
                          placeholder="Ex: Pop, Rock, Rap, Jazz..."
                          value={offlineGenre}
                          onChange={(e) => setOfflineGenre(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Difficulté de la Chanson</label>
                        <select
                          value={offlineDifficulty}
                          onChange={(e) => setOfflineDifficulty(e.target.value as any)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-sm transition-colors"
                        >
                          <option value="Beginner">Débutant (Vocabulaire simple, débit lent)</option>
                          <option value="Intermediate">Intermédiaire (Rythme standard)</option>
                          <option value="Advanced">Avancé (Argot complexe, débit rapide)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 flex justify-between">
                          <span>Paroles Originales (Anglais) <span className="text-red-500">*</span></span>
                          <span className="text-slate-400 font-normal">Une ligne par vers</span>
                        </label>
                        <textarea
                          rows={8}
                          required
                          placeholder="Ex:&#10;Yesterday all my troubles seemed so far away&#10;Now it looks as though they're here to stay"
                          value={offlineEnglishLyrics}
                          onChange={(e) => setOfflineEnglishLyrics(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-xs font-mono transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 flex justify-between">
                          <span>Traduction en Français (Optionnel)</span>
                          <span className="text-slate-400 font-normal">Une ligne par vers</span>
                        </label>
                        <textarea
                          rows={8}
                          placeholder="Ex:&#10;Hier tous mes soucis semblaient si loin&#10;Aujourd'hui il semble qu'ils soient partis pour rester"
                          value={offlineFrenchLyrics}
                          onChange={(e) => setOfflineFrenchLyrics(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-slate-800 text-xs font-mono transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-1 leading-relaxed">
                      <p className="font-bold text-slate-700">💡 Astuce d'importation :</p>
                      <p>Pour un alignement optimal, essayez d'entrer le même nombre de lignes en Anglais et en Français. S'il vous manque des traductions, vous pourrez facilement les ajouter ou les corriger en direct en double-cliquant sur les vers dans l'application !</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Créer le cours local instantanément</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
