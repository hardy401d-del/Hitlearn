import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, FastForward, MessageSquare, Loader2, Star, Sparkles, Send, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import { SongAnalysis, AssessmentResult, LiveComment } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface LiveModeProps {
  song: SongAnalysis;
  onBackToStudy: () => void;
  onStartCourse: () => void;
}

export default function LiveMode({ song, onBackToStudy, onStartCourse }: LiveModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userUnderstanding, setUserUnderstanding] = useState("");
  const [isSongFinished, setIsSongFinished] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVocalGuideEnabled, setIsVocalGuideEnabled] = useState(false); // Default to false when original audio is available to avoid overlapping voices!

  // Real Audio player states
  const [showOriginalPlayer, setShowOriginalPlayer] = useState(true);
  const [playerType, setPlayerType] = useState<"youtube" | "local">("youtube");
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);

  // References for scrolling
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const handleLocalAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalAudioUrl(url);
      setPlayerType("local");
    }
  };

  // Flatten the lines to easily sync them by index
  const flatLines = song.lyricsSections.flatMap((section) => 
    section.lines.map(line => ({ ...line, sectionType: section.sectionType }))
  );

  const totalLines = flatLines.length;

  // Speech synthesis helper
  const speakLine = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95; // Clear natural rate for learning
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice synthesis for current active line when Vocal Guide is enabled
  useEffect(() => {
    if (isPlaying && isVocalGuideEnabled && window.speechSynthesis) {
      const currentLine = flatLines[currentLineIndex];
      if (currentLine) {
        speakLine(currentLine.english);
      }
    }
  }, [currentLineIndex, isPlaying, isVocalGuideEnabled]);

  // Cancel synthesis if playback pauses
  useEffect(() => {
    if (!isPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isPlaying]);

  // Sync Timer for simulated playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentLineIndex < totalLines) {
      interval = setInterval(() => {
        setCurrentLineIndex((prev) => {
          if (prev >= totalLines - 1) {
            setIsPlaying(false);
            setIsSongFinished(true);
            return totalLines - 1;
          }
          return prev + 1;
        });
      }, 3500); // 3.5 seconds per line for reading and comments
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentLineIndex, totalLines]);

  // Center scroll the active line
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex]);

  // Get active comment for the current line
  const activeComment = song.liveComments.find(
    (c) => c.lineIndexGlobal === currentLineIndex
  );

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipToEnd = () => {
    setIsPlaying(false);
    setCurrentLineIndex(totalLines - 1);
    setIsSongFinished(true);
  };

  const handleRestartSong = () => {
    setCurrentLineIndex(0);
    setIsSongFinished(false);
    setAssessmentResult(null);
    setIsPlaying(true);
  };

  const handleSubmitUnderstanding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUnderstanding.trim()) {
      setError("Veuillez saisir votre compréhension avant de soumettre.");
      return;
    }

    setIsAssessing(true);
    setError(null);

    try {
      const response = await fetch("/api/assess-understanding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
          userUnderstanding: userUnderstanding.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion.");
      }

      setAssessmentResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'évaluation.");
    } finally {
      setIsAssessing(false);
    }
  };

  // Progress Bar percentage
  const progressPercent = totalLines > 0 ? (currentLineIndex / (totalLines - 1)) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Upper Tracker */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Mode Écoute Interactive</span>
          <h2 className="text-xl font-bold text-slate-800">
            {song.title} <span className="font-normal text-slate-500">par {song.artist}</span>
          </h2>
        </div>
        <button
          onClick={onBackToStudy}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Retour au dictionnaire
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Animated Karaoke Player (7/12) */}
        <div className="md:col-span-7 flex flex-col bg-slate-950 text-white rounded-3xl overflow-hidden shadow-xl min-h-[500px]">
          {/* Header Status / Vinyl animation */}
          <div className="p-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Spinning Vinyl record simulation */}
              <div className={`w-9 h-9 bg-slate-800 rounded-full border-2 border-red-500 flex items-center justify-center ${
                isPlaying ? "animate-spin" : ""
              }`} style={{ animationDuration: "3s" }}>
                <div className="w-2.5 h-2.5 bg-slate-950 rounded-full" />
              </div>
              <div className="text-xs">
                <div className="font-bold">STUDIO LIVE</div>
                <div className="text-slate-400 font-mono">Commentaires en direct activez</div>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Ligne {currentLineIndex + 1} / {totalLines}
            </div>
          </div>

          {/* Lecteur Original Voice (YouTube / Local MP3) */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-red-500 uppercase flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>VOIX RÉELLE DU CHANTEUR ORIGINAL</span>
              </span>
              <button
                onClick={() => setShowOriginalPlayer(!showOriginalPlayer)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded text-[10px] font-bold text-slate-300 cursor-pointer"
              >
                {showOriginalPlayer ? "Masquer le lecteur" : "Afficher le lecteur"}
              </button>
            </div>

            {showOriginalPlayer && (
              <div className="space-y-3">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPlayerType("youtube")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playerType === "youtube"
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📺 YouTube Officiel
                  </button>
                  <button
                    onClick={() => setPlayerType("local")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playerType === "local"
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📁 Fichier MP3 Local
                  </button>
                </div>

                {/* YouTube Embed Player */}
                {playerType === "youtube" && (
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      L'intégration YouTube ci-dessous recherche automatiquement <strong>{song.artist} - {song.title}</strong> pour vous faire profiter de la version officielle avec la vraie voix !
                    </p>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                      <iframe
                        src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(song.artist + " " + song.title)}&autoplay=0`}
                        title={`Lecteur Hitlearn - ${song.title}`}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Local MP3 File Player */}
                {playerType === "local" && (
                  <div className="space-y-2">
                    {!localAudioUrl ? (
                      <div className="border border-dashed border-slate-800 hover:border-red-500/40 bg-slate-950 rounded-xl p-4 text-center transition-colors relative cursor-pointer group">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleLocalAudioUpload}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-300 group-hover:text-red-400 transition-colors">
                            Glissez-déposez ou cliquez pour importer votre MP3
                          </p>
                          <p className="text-[10px] text-slate-500">
                            (Votre fichier reste local sur votre appareil, respectant les droits d'auteur)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5 truncate">
                            🎵 Fichier chargé avec succès !
                          </span>
                          <button
                            onClick={() => setLocalAudioUrl(null)}
                            className="text-red-400 hover:text-red-300 font-bold text-[10px] uppercase cursor-pointer"
                          >
                            Retirer
                          </button>
                        </div>
                        <audio
                          src={localAudioUrl}
                          controls
                          className="w-full h-8 accent-red-600 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scrolling lyrics section */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 min-h-[300px] max-h-[380px] scrollbar-thin scrollbar-thumb-slate-800"
          >
            {flatLines.map((line, idx) => {
              const isActive = currentLineIndex === idx;
              const isPast = idx < currentLineIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => {
                    setCurrentLineIndex(idx);
                    speakLine(line.english);
                  }}
                  className={`py-3 px-4 rounded-xl transition-all duration-300 flex flex-col space-y-1 cursor-pointer group/line ${
                    isActive
                      ? "bg-red-950/40 border border-red-900/60 shadow-lg scale-[1.02]"
                      : isPast
                      ? "opacity-30"
                      : "opacity-60 hover:opacity-80"
                  }`}
                  title="Cliquer pour écouter la prononciation vocale"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-red-500/80 uppercase">
                      {line.sectionType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold opacity-0 group-hover/line:opacity-100 transition-opacity flex items-center gap-1">
                      <span>🔊 Écouter</span>
                    </span>
                  </div>
                  <div className={`font-sans font-extrabold text-base md:text-lg transition-colors ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}>
                    {line.english}
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-slate-400 text-sm italic font-normal pt-1"
                    >
                      {line.french}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Slider */}
          <div className="px-6 py-2 bg-slate-900/40">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Player controls */}
          <div className="p-6 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                id="play-pause-btn"
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isPlaying 
                    ? "bg-slate-700 hover:bg-slate-600 text-white" 
                    : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 scale-105"
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>
              
              {currentLineIndex > 0 && (
                <button
                  onClick={handleRestartSong}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  title="Recommencer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              {/* Vocal Guide toggle */}
              <button
                onClick={() => {
                  const newState = !isVocalGuideEnabled;
                  setIsVocalGuideEnabled(newState);
                  if (newState) {
                    const currentLine = flatLines[currentLineIndex];
                    if (currentLine) {
                      speakLine(currentLine.english);
                    }
                  } else if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider flex items-center gap-1.5 transition-all cursor-pointer uppercase ${
                  isVocalGuideEnabled
                    ? "bg-red-600/20 text-red-400 border border-red-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700/80"
                }`}
                title="Activer/Désactiver le guide vocal automatique des paroles"
              >
                <span>🎙️</span>
                <span>{isVocalGuideEnabled ? "Guide Vocal ON" : "Guide Vocal OFF"}</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-400">
              {isPlaying ? "Chanson en cours de lecture..." : isSongFinished ? "Écoute terminée !" : "Lecture en pause"}
            </span>

            {!isSongFinished && (
              <button
                onClick={handleSkipToEnd}
                className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer border border-slate-800 hover:border-slate-700"
              >
                <span>Sauter la chanson</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Coach Comments Pop-ups & Final Comprehension Input (5/12) */}
        <div className="md:col-span-5 flex flex-col gap-6 justify-between items-stretch">
          {/* Real-time Coach Speech bubble */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex-1 flex flex-col">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Le Professeur Gemini en direct</h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {activeComment ? (
                  <motion.div
                    key={activeComment.lineIndexGlobal}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4 text-left w-full"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                        activeComment.type === "culture" 
                          ? "bg-purple-100 text-purple-700" 
                          : activeComment.type === "grammar"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        Note {activeComment.type}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">Ligne {activeComment.lineIndexGlobal + 1}</span>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 relative">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{activeComment.term}</h4>
                      <p className="text-slate-700 text-xs leading-relaxed">{activeComment.comment}</p>
                      
                      {/* Tail bubble decor */}
                      <div className="absolute left-6 -bottom-2 w-4 h-4 bg-red-50 border-r border-b border-red-100 rotate-45" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 animate-bounce" />
                      <span>Gemini vous explique cette expression maintenant...</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-3 py-12"
                  >
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 animate-pulse">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-700">Lecture en cours...</div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Laissez la musique défiler. Des notes d'explications apparaîtront automatiquement aux moments opportuns !
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comprehensive review block */}
          {isSongFinished && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4"
            >
              {!assessmentResult ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <UserCheck className="w-4 h-4 text-red-500" />
                      <span>Qu'avez-vous compris des paroles ?</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Résumez brièvement (en français ou en anglais) l'histoire ou l'émotion de la chanson. Notre IA vous donnera ses retours personnalisés.
                    </p>
                  </div>

                  {error && <div className="text-xs text-red-600 font-semibold">{error}</div>}

                  <form onSubmit={handleSubmitUnderstanding} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      placeholder="Ex: J'ai compris que c'est une chanson triste d'amour où Adele regrette son ex qui s'est marié et souhaite son bonheur..."
                      value={userUnderstanding}
                      onChange={(e) => setUserUnderstanding(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 leading-relaxed resize-none"
                    />

                    <button
                      type="submit"
                      disabled={isAssessing}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      {isAssessing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyse de votre réponse par Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Soumettre ma compréhension</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Assessment response layout */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Évaluation globale</span>
                      <h4 className="text-sm font-bold text-slate-800">Votre Compréhension</h4>
                    </div>

                    {/* Star feedback */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx < assessmentResult.scoreStars 
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed max-h-[160px] overflow-y-auto">
                    <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Retours de l'Enseignant</span>
                    </div>
                    <p>{assessmentResult.feedback}</p>
                  </div>

                  <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] italic font-semibold text-slate-600 leading-relaxed">
                    💡 &ldquo; {assessmentResult.keyTakeaway} &rdquo;
                  </div>

                  <button
                    onClick={onStartCourse}
                    id="start-course-btn"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer animate-bounce"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Rejoindre le Cours (Quiz interactif) !</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
