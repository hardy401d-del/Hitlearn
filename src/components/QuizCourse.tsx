import { useState } from "react";
import { Award, CheckCircle2, XCircle, ChevronRight, Download, RefreshCw, Trophy, User, BookOpen, Star } from "lucide-react";
import { SongAnalysis, QuizQuestion } from "../types";
import { generateCertificatePDF } from "../utils/pdf";
import { motion, AnimatePresence } from "motion/react";

interface QuizCourseProps {
  song: SongAnalysis;
  onRestart: () => void;
}

export default function QuizCourse({ song, onRestart }: QuizCourseProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showCertificateScreen, setShowCertificateScreen] = useState(false);
  const [studentName, setStudentName] = useState("");

  const quizQuestions = song.quizQuestions;
  const currentQuestion = quizQuestions[currentQuestionIdx];

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowCertificateScreen(true);
    }
  };

  const handleDownloadCertificate = () => {
    const finalName = studentName.trim() || "Élève de Musique";
    generateCertificatePDF(finalName, song.title, song.artist, score);
  };

  // Get score feedback badges
  const getScoreRating = () => {
    const ratio = score / quizQuestions.length;
    if (ratio >= 0.8) return { title: "Professeur de Rock-Langues", badge: "Gold Medal", color: "text-yellow-600 bg-yellow-100 border-yellow-200" };
    if (ratio >= 0.6) return { title: "Compositeur Bilingue", badge: "Silver Medal", color: "text-slate-600 bg-slate-100 border-slate-200" };
    return { title: "Mélomane en Apprentissage", badge: "Bronze Medal", color: "text-amber-700 bg-amber-100 border-amber-200" };
  };

  const scoreRating = getScoreRating();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!showCertificateScreen ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md space-y-6"
          >
            {/* Quiz Header Tracker */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                  Question {currentQuestionIdx + 1} sur {quizQuestions.length}
                </span>
                <h3 className="text-base font-extrabold text-slate-800">Validation des connaissances</h3>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 rounded-full">
                Score : {score}
              </div>
            </div>

            {/* Question Text */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
              <h4 className="text-slate-900 font-extrabold text-base md:text-lg leading-relaxed">
                {currentQuestion.question}
              </h4>
            </div>

            {/* Options List */}
            <div className="grid gap-3 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const isIncorrectSelected = isSelected && !isCorrect;

                let cardStyle = "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50";
                let icon = null;

                if (isAnswered) {
                  if (isCorrect) {
                    cardStyle = "bg-emerald-50 border-emerald-300 text-emerald-950";
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
                  } else if (isIncorrectSelected) {
                    cardStyle = "bg-red-50 border-red-300 text-red-950";
                    icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
                  } else {
                    cardStyle = "bg-white border-slate-100 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(option)}
                    className={`flex items-center justify-between p-4 border rounded-xl text-left text-sm font-semibold transition-all duration-150 ${
                      !isAnswered ? "cursor-pointer active:scale-99" : ""
                    } ${cardStyle}`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanations Panel */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50/50 border border-red-100 rounded-2xl p-5 space-y-2.5 text-xs text-slate-700"
                >
                  <div className="font-bold text-red-800 flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-red-500" />
                    <span>L'Explication d'Anglais</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Navigation */}
            {isAnswered && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{currentQuestionIdx < quizQuestions.length - 1 ? "Question Suivante" : "Terminer le Cours"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-8"
          >
            {/* Visual Header Trophy */}
            <div className="space-y-3">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">Cours Complété avec Succès !</h2>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Félicitations ! Vous venez de décrypter l'anglais bilingue de la chanson <strong>{song.title}</strong> avec brio.
              </p>
            </div>

            {/* Score Grid & Medal */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Note obtenue</span>
                <div className="text-2xl font-black text-slate-900">
                  {score} / {quizQuestions.length}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  {Math.round((score / quizQuestions.length) * 100)}% de réussite
                </div>
              </div>

              <div className={`p-4 border rounded-2xl space-y-1 flex flex-col justify-center items-center ${scoreRating.color}`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Titre décerné</span>
                <div className="text-xs font-extrabold text-center">
                  {scoreRating.title}
                </div>
              </div>
            </div>

            {/* Certificate Form input name */}
            <div className="max-w-md mx-auto p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-left">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span>Obtenir mon diplôme nominatif</span>
                </h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  Saisissez votre prénom et nom pour générer et télécharger un certificat de réussite officiel imprimable.
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Ex: Jean Dupont"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 focus:border-red-500 focus:outline-none rounded-xl text-xs text-slate-800 transition-colors"
                  />
                </div>

                <button
                  onClick={handleDownloadCertificate}
                  id="download-certificate-btn"
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger mon Certificat (PDF)</span>
                </button>
              </div>
            </div>

            {/* Restart button */}
            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={onRestart}
                id="restart-learning-btn"
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Étudier une autre chanson</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
