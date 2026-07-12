import { useState } from "react";
import { Download, Play, ArrowLeft, Info, HelpCircle, BookOpen, Tag } from "lucide-react";
import { SongAnalysis, WordExplanation } from "../types";
import { generateSongPDF } from "../utils/pdf";
import PronunciationPractice from "./PronunciationPractice";
import { motion } from "motion/react";

interface StudyDashboardProps {
  song: SongAnalysis;
  onBack: () => void;
  onStartLiveMode: () => void;
}

export default function StudyDashboard({ song, onBack, onStartLiveMode }: StudyDashboardProps) {
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordExplanation | null>(null);

  // Flatten lyrics lines to compute matching global indices
  let globalLineCount = 0;
  const structuredSections = song.lyricsSections.map((section) => {
    const linesWithGlobalIndices = section.lines.map((line) => {
      const index = globalLineCount;
      globalLineCount++;
      return { ...line, globalIndex: index };
    });
    return { ...section, lines: linesWithGlobalIndices };
  });

  // Type-based styling for glossary items
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "idiom":
        return {
          bg: "bg-purple-50 hover:bg-purple-100/70 border-purple-100",
          badge: "bg-purple-100 text-purple-700",
          text: "text-purple-900",
          border: "border-purple-300"
        };
      case "slang":
        return {
          bg: "bg-amber-50 hover:bg-amber-100/70 border-amber-100",
          badge: "bg-amber-100 text-amber-700",
          text: "text-amber-900",
          border: "border-amber-300"
        };
      case "phrasal_verb":
        return {
          bg: "bg-rose-50 hover:bg-rose-100/70 border-rose-100",
          badge: "bg-rose-100 text-rose-700",
          text: "text-rose-900",
          border: "border-rose-300"
        };
      case "grammar":
        return {
          bg: "bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100",
          badge: "bg-emerald-100 text-emerald-700",
          text: "text-emerald-900",
          border: "border-emerald-300"
        };
      default: // vocabulary
        return {
          bg: "bg-blue-50 hover:bg-blue-100/70 border-blue-100",
          badge: "bg-blue-100 text-blue-700",
          text: "text-blue-900",
          border: "border-blue-300"
        };
    }
  };

  const handleDownloadPDF = () => {
    generateSongPDF(song);
  };

  // Helper to find terms in lyrics and highlight them in the list
  const handleTermClick = (item: WordExplanation) => {
    setSelectedWord(selectedWord?.term === item.term ? null : item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Back to selector */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Changer de chanson</span>
        </button>
      </div>

      {/* Header Profile */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              song.difficulty === "Beginner" 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}>
              Niveau {song.difficulty}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full uppercase tracking-wider border border-slate-700">
              {song.genre}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {song.title}
          </h1>
          <p className="text-slate-400 text-base font-medium">Par {song.artist}</p>
          <p className="text-slate-300 text-sm italic max-w-2xl leading-relaxed">
            {song.summary}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            id="download-pdf-btn"
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger Guide PDF</span>
          </button>
          <button
            onClick={onStartLiveMode}
            id="start-live-mode-btn"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 hover:scale-102 transition-all cursor-pointer animate-pulse"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Lancer le Mode Live !</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Lyrics vs Vocabulary Dictionary */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Side-by-Side Lyrics (7/12) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-red-500" />
              <span>Paroles Bilingues (Side-by-Side)</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Survolez une ligne pour mettre en surbrillance sa traduction correspondante.
            </p>
          </div>

          <div className="space-y-8 select-text">
            {structuredSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-red-600 border-l-2 border-red-500 pl-2">
                  {section.sectionType}
                </h3>

                <div className="space-y-3">
                  {section.lines.map((line) => {
                    const isHovered = hoveredLineIndex === line.globalIndex;
                    return (
                      <div
                        key={line.globalIndex}
                        onMouseEnter={() => setHoveredLineIndex(line.globalIndex)}
                        onMouseLeave={() => setHoveredLineIndex(null)}
                        className={`grid grid-cols-2 gap-4 p-2.5 rounded-xl transition-all duration-150 ${
                          isHovered 
                            ? "bg-red-50/50 scale-[1.01]" 
                            : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* English Column */}
                        <div className="text-slate-950 font-semibold text-sm md:text-[14.5px] leading-relaxed">
                          {line.english}
                        </div>
                        {/* French Column */}
                        <div className="text-slate-500 text-sm md:text-[14.5px] leading-relaxed font-normal">
                          {line.french}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Dictionary / Explanations (5/12) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 lg:sticky lg:top-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              <span>Vocabulaire &amp; Expressions Clés</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Analyse linguistique détaillée des expressions de la chanson. Cliquez pour développer.
            </p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {song.explanations.map((item, idx) => {
              const styles = getTypeStyles(item.type);
              const isSelected = selectedWord?.term === item.term;

              return (
                <div
                  key={idx}
                  onClick={() => handleTermClick(item)}
                  className={`p-4 border rounded-2xl transition-all duration-200 cursor-pointer ${styles.bg} ${
                    isSelected ? `ring-2 ring-slate-800 shadow-md ${styles.border}` : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.term}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        &ldquo; {item.meaningFr} &rdquo;
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${styles.badge}`}>
                      {item.type.replace("_", " ")}
                    </span>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-slate-200/60 space-y-2.5 text-xs text-slate-700"
                    >
                      <p className="leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100">
                        {item.explanation}
                      </p>
                      <div className="text-slate-500">
                        <span className="font-bold">Exemple d'usage :</span>
                        <p className="italic text-slate-600 font-medium mt-1">
                          &ldquo; {item.example} &rdquo;
                        </p>
                      </div>

                      <PronunciationPractice term={item.term} />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick pedagogical card */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-slate-800 text-xs">Méthode d'étude</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Prenez le temps de lire la traduction side-by-side pour comprendre le sens global, puis étudiez les expressions clés ci-dessus. Une fois prêt, cliquez sur <strong>Mode Live</strong> pour tester votre écoute en temps réel !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
