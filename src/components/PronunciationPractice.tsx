import React, { useState, useEffect, useRef } from "react";
import { Play, Square, Mic, Volume2, RefreshCw, Sparkles, CheckCircle, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PronunciationPracticeProps {
  term: string;
}

interface PronunciationFeedback {
  term: string;
  phonetics: string;
  mouthGuideFr: string;
  feedbackFr: string;
  accuracyPercentage: number;
}

export default function PronunciationPractice({ term }: PronunciationPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscription(resultText);
    };

    rec.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("L'accès au microphone a été refusé. Veuillez autoriser le micro dans votre navigateur.");
      }
    };

    recognitionRef.current = rec;
  }, []);

  // Text to Speech for native pronunciation
  const speakNative = () => {
    if (!window.speechSynthesis) {
      alert("Votre navigateur ne prend pas en charge la synthèse vocale.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = "en-US";
    utterance.rate = 0.8; // Slower for clear ESL study
    window.speechSynthesis.speak(utterance);
  };

  // Start recording voice and speech-to-text
  const startRecording = async () => {
    setError(null);
    setTranscription("");
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start MediaRecorder
      mediaRecorder.start();
      setIsRecording(true);

      // Start Speech Recognition if supported
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to start recognition:", e);
        }
      }
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setError("Impossible d'accéder au micro. Veuillez vérifier vos autorisations.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to stop recognition:", e);
      }
    }
    setIsRecording(false);
  };

  // Request pronunciation analysis from server using Gemini
  const analyzePronunciation = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/pronunciation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term,
          userTranscription: transcription.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'analyse.");
      }

      setFeedback(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'évaluation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetPractice = () => {
    setAudioUrl(null);
    setTranscription("");
    setFeedback(null);
    setError(null);
  };

  // Color helper for scoring
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  return (
    <div className="mt-4 p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
        <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-red-500" />
          <span>Pratique de la Prononciation</span>
        </h5>
        {feedback && (
          <button
            onClick={resetPractice}
            className="text-[10px] text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Recommencer</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Native Speaker Model Column */}
        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">1. Modèle Natif</span>
          <button
            onClick={speakNative}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-all cursor-pointer"
            title="Écouter la prononciation correcte"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-slate-500 font-medium">Écouter standard</span>
        </div>

        {/* User Recording Column */}
        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">2. Votre Voix</span>
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all cursor-pointer animate-pulse"
              title="Arrêter l'enregistrement"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-all cursor-pointer"
              title="S'enregistrer"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
          <span className="text-[10px] text-slate-500 font-medium">
            {isRecording ? "Enregistrement..." : audioUrl ? "Enregistré !" : "S'enregistrer"}
          </span>
        </div>
      </div>

      {/* Audio playback and transcription check */}
      {(audioUrl || transcription || isRecording) && (
        <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-3">
          {audioUrl && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Réécouter :</span>
              <audio src={audioUrl} controls className="w-full h-8 text-xs bg-slate-50 rounded-lg" />
            </div>
          )}

          {isRecording && isSpeechSupported && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 italic justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
              <span>Écoute active, parlez clairement...</span>
            </div>
          )}

          {transcription && (
            <div className="text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Texte reconnu :</span>
              <p className="font-bold text-slate-800">&ldquo; {transcription} &rdquo;</p>
              {transcription.toLowerCase().replace(/[^a-z]/g, "") === term.toLowerCase().replace(/[^a-z]/g, "") ? (
                <span className="text-[9px] font-bold text-emerald-600 mt-1 inline-flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Correspondance exacte !
                </span>
              ) : (
                <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                  Comparez avec le mot visé : <span className="text-slate-700 font-semibold">{term}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-start gap-1.5 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Analyze action button */}
      {!feedback && (
        <button
          onClick={analyzePronunciation}
          disabled={isAnalyzing}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyse phonétique par Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{audioUrl ? "Analyser mon enregistrement" : "Analyser et voir les conseils"}</span>
            </>
          )}
        </button>
      )}

      {/* Feedback Panel */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3.5"
          >
            {/* Score and Phonetics line */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 border border-slate-100 rounded-xl shadow-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Alphabet Phonétique (API)</span>
                <span className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  [{feedback.phonetics}]
                </span>
              </div>

              {audioUrl && (
                <div className={`p-2 border rounded-xl flex flex-col items-center justify-center shrink-0 min-w-[70px] ${getScoreColor(feedback.accuracyPercentage)}`}>
                  <span className="text-[9px] font-bold uppercase opacity-85 leading-none mb-0.5">Précision</span>
                  <span className="text-sm font-black tracking-tight leading-none">
                    {feedback.accuracyPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Mouth posture guide */}
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-blue-800 uppercase block">Comment placer la bouche &amp; la langue :</span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {feedback.mouthGuideFr}
              </p>
            </div>

            {/* General feedback / pitfalls */}
            <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Conseils et pièges à éviter :</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {feedback.feedbackFr}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
