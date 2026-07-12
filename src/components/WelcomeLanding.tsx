import React, { useState } from "react";
import { Music, Sparkles, Smartphone, Download, Share2, ArrowRight, ShieldCheck, CheckCircle, Flame, Users, Globe, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WelcomeLandingProps {
  onEnterApp: () => void;
}

export default function WelcomeLanding({ onEnterApp }: WelcomeLandingProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-red-600/30 font-sans">
      {/* Visual background ambient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/15 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-800/30 blur-3xl" />
      </div>

      {/* Main hero & info body */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20 flex-1 flex flex-col justify-center space-y-16">
        
        {/* Branding & Gorgeous Logo */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Logo container */}
          <div className="inline-flex items-center justify-center p-4 bg-red-600/10 border border-red-500/20 rounded-3xl mb-2">
            {/* Custom SVG Audio Wave + Music Note Logo */}
            <svg 
              className="w-16 h-16 text-red-500 animate-pulse" 
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
              {/* Extra Sound Waves to symbolize interactive learning/Hit */}
              <path d="M3 8a9 9 0 0 1 0 8" opacity="0.5" />
              <path d="M21 8a9 9 0 0 1 0 8" opacity="0.5" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black tracking-widest text-red-500 uppercase bg-red-950/50 border border-red-900/60 px-3 py-1 rounded-full">
              PRODUCTION D'ÉLITE DE <span className="font-extrabold text-white">INTOUCHPROD</span>
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white font-sans">
              Hitlearn
            </h1>
            <p className="text-red-500/90 text-sm font-mono tracking-widest uppercase">
              L'Anglais en Musique Réinventé par l'IA
            </p>
          </div>

          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Chantez vos chansons préférées, analysez la prononciation grâce à votre micro, bénéficiez de explications culturelles en direct et téléchargez vos diplômes d'anglais nominatifs !
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-red-900/40 transition-all transform hover:scale-[1.03] active:scale-98 cursor-pointer"
            >
              <span>Commencer l'Expérience</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const guideEl = document.getElementById("installation-guide");
                guideEl?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-red-500" />
              <span>Guide d'Installation PWA</span>
            </button>
          </div>
        </div>

        {/* Value Proposition Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-red-950/50 border border-red-900/30 text-red-500 rounded-2xl flex items-center justify-center">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Étude &amp; Vocabulaire</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dictionnaire bilingue intelligent, explications de l'argot des chansons, et outil d'évaluation phonétique directe à l'aide de votre microphone !
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-purple-950/50 border border-purple-900/30 text-purple-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Mode Live Interactif</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Lisez ou écoutez la chanson avec un prompteur karaoké et observez les commentaires linguistiques de l'IA s'afficher en direct en fonction des couplets.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Quiz &amp; Diplôme PDF</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Évaluez votre compréhension, validez vos acquis via un examen bilingue personnalisé et exportez votre Certificat de réussite nominatif officiel.
            </p>
          </div>
        </div>

        {/* Dynamic PWA Installation & Share Section */}
        <div id="installation-guide" className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 space-y-8">
          <div className="border-b border-slate-800 pb-5">
            <span className="text-[10px] font-black tracking-widest text-red-500 uppercase block mb-1">
              TECHNOLOGIE PROGRESSIVE WEB APP
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-red-500" />
              <span>Comment l'installer et l'emporter partout ?</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Hitlearn est compatible PWA. Cela signifie que vous pouvez l'installer instantanément sur votre téléphone ou ordinateur sans passer par les App Stores, et qu'il fonctionne de manière autonome en mode hors-ligne !
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Step-by-step PWA install directions */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Instructions d'installation :</h4>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-slate-800 text-red-500 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Sur iPhone (Safari)</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Appuyez sur l'icône de partage <span className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">Share 📤</span>, puis sélectionnez <span className="text-white font-semibold">"Sur l'écran d'accueil" ➕</span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-slate-800 text-red-500 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Sur Android (Chrome / Edge)</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Cliquez sur les trois petits points <span className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">⋮</span> ou cliquez directement sur la bannière de notification <span className="text-white font-semibold">"Ajouter à l'écran d'accueil"</span> ou l'icône d'installation <span className="text-white font-semibold">📥</span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-slate-800 text-red-500 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Sur Ordinateur (PC/Mac/Chromebook)</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Une icône d'installation d'application <span className="text-white font-semibold">📥</span> apparaît directement dans la barre d'adresse de votre navigateur Chrome ou Brave. Cliquez dessus !
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing / Copying Link Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2 py-0.5 text-[8.5px] font-black bg-emerald-950 text-emerald-400 border border-emerald-900 rounded uppercase">
                  Service Worker Activé
                </span>
                <h4 className="text-sm font-bold text-white">Partagez l'application</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Envoyez ce lien magique d'apprentissage à vos proches par message ou sur les réseaux sociaux. L'accès est instantané et gratuit.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-red-500" />
                  <span>{copied ? "Lien Copié !" : "Copier le Lien de Partage"}</span>
                </button>
                {copied && (
                  <p className="text-emerald-400 text-[10px] text-center font-bold">
                    Lien copié dans votre presse-papiers avec succès !
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature & Premium credit line */}
      <footer className="relative z-10 py-8 border-t border-slate-800/80 bg-slate-950 text-center text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Hitlearn par <strong>IntouchProd</strong>. Conçu pour le bilinguisme.</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Technologie premium signée :</span>
            <span className="font-extrabold tracking-wider text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded text-[10px]">
              INTOUCHPROD
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
