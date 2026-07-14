import React, { useState, useEffect } from "react";
import { Key, Sparkles, HelpCircle, Eye, EyeOff, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GeminiKeyConfig() {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default to keep layout clean, but easily expandable

  useEffect(() => {
    const saved = localStorage.getItem("hitlearn_gemini_api_key");
    if (saved) {
      setApiKey(saved);
      setIsSaved(true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    if (cleanKey) {
      localStorage.setItem("hitlearn_gemini_api_key", cleanKey);
      setIsSaved(true);
      // Trigger a custom event so other components know the key updated
      window.dispatchEvent(new Event("hitlearn_api_key_changed"));
    } else {
      localStorage.removeItem("hitlearn_gemini_api_key");
      setIsSaved(false);
      window.dispatchEvent(new Event("hitlearn_api_key_changed"));
    }
  };

  const handleClear = () => {
    localStorage.removeItem("hitlearn_gemini_api_key");
    setApiKey("");
    setIsSaved(false);
    window.dispatchEvent(new Event("hitlearn_api_key_changed"));
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side Status Badge */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
            <Key className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-200">Clé API Gemini :</span>
            {isSaved ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                <Check className="w-2.5 h-2.5" />
                <span>Votre Clé Personnelle Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/20">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                <span>Clé du Serveur (Par Défaut)</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Side Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{isOpen ? "Fermer la configuration" : "Configurer ma clé"}</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Key Config Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800/60 bg-slate-950"
          >
            <div className="max-w-4xl mx-auto px-4 py-5 grid md:grid-cols-12 gap-6 items-start text-xs">
              {/* Left Column: Form (7/12) */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-500" />
                    <span>Saisir votre Clé API Gemini</span>
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Ajoutez votre clé API gratuite pour garantir que Hitlearn fonctionne comme une vraie application autonome, sans limites de requêtes ou interruptions.
                  </p>
                </div>

                <form onSubmit={handleSave} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 w-full">
                    <input
                      type={showKey ? "text" : "password"}
                      placeholder="Collez votre clé API Gemini (AIzaSy...)"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 focus:outline-none pl-3 pr-10 py-2.5 rounded-xl text-slate-100 font-mono tracking-wide placeholder:font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md shadow-red-900/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Enregistrer
                    </button>
                    {isSaved && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                </form>

                {isSaved && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-semibold">
                      Génial ! Votre clé API est enregistrée localement. Toutes les prochaines analyses de chansons, transcriptions de fichiers audio ou pratiques de prononciation l'utiliseront en priorité.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Instructions (5/12) */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="font-extrabold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Comment obtenir une clé gratuite ?</span>
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                  <li>
                    Rendez-vous sur{" "}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 font-bold underline"
                    >
                      Google AI Studio
                    </a>
                  </li>
                  <li>
                    Connectez-vous avec votre compte Google et cliquez sur le bouton <strong className="text-white">"Get API Key"</strong>.
                  </li>
                  <li>
                    Sélectionnez <strong className="text-white">"Create API Key"</strong>, puis copiez la clé générée.
                  </li>
                  <li>
                    Collez-la dans le champ ci-contre et validez !
                  </li>
                </ol>
                <div className="text-[10px] text-slate-400 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                  <span>La clé est conservée uniquement dans votre propre navigateur et n'est jamais transmise à des tiers.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
