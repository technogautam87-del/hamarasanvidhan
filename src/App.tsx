/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Landmark, Award, BookOpen, Star, HelpCircle, Volume2, ShieldAlert, Heart, RefreshCw } from "lucide-react";
import HomeSection from "./components/HomeSection";
import HistorySection from "./components/HistorySection";
import FeaturesSection from "./components/FeaturesSection";
import RightsSection from "./components/RightsSection";
import DutiesSection from "./components/DutiesSection";
import ElectionSection from "./components/ElectionSection";
import QuizSection from "./components/QuizSection";
import SamvidhanMitra from "./components/SamvidhanMitra";
import { MascotMood } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem("samvidhan_score");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("samvidhan_voice");
    return saved ? saved === "true" : true;
  });

  const [mascotData, setMascotData] = useState<{ mood: MascotMood; text: string }>({
    mood: "greeting",
    text: "नमस्ते बच्चो! मैं हूँ 'संविधान मित्र'। आज हम मिलकर खेल-खेल में हमारे प्यारे भारत के संविधान को अत्यंत सरल शब्दों में सीखेंगे।"
  });

  // Keep score in localstorage
  useEffect(() => {
    localStorage.setItem("samvidhan_score", score.toString());
  }, [score]);

  // Keep voice preference
  useEffect(() => {
    localStorage.setItem("samvidhan_voice", voiceEnabled.toString());
  }, [voiceEnabled]);

  const incrementScore = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  const resetAllProgress = () => {
    if (confirm("यदि आप प्रगति रीसेट करते हैं, तो आपका पूरा स्कोर शून्य (0) हो जाएगा। क्या आप प्रगति मिटाना चाहते हैं?")) {
      setScore(0);
      localStorage.removeItem("samvidhan_score");
      localStorage.removeItem("samvidhan_completed_rights");
      localStorage.removeItem("samvidhan_duties_classifications");
      localStorage.removeItem("samvidhan_duties_evaluated");
      localStorage.removeItem("samvidhan_election_step");
      localStorage.removeItem("samvidhan_election_voter_name");
      localStorage.removeItem("samvidhan_election_voter_age");
      localStorage.removeItem("samvidhan_election_voter_symbol");
      localStorage.removeItem("samvidhan_election_voter_id");
      localStorage.removeItem("samvidhan_election_completed");
      localStorage.removeItem("samvidhan_quiz_high_score");
      localStorage.removeItem("samvidhan_features_viewed");
      localStorage.removeItem("samvidhan_history_puzzles");
      setActiveTab("home");
      setMascotData({
        mood: "happy",
        text: "आपकी प्रगति रीसेट कर दी गई है! चलो फिर से आरंभ से शुरू करते हैं।"
      });
    }
  };

  const handleToggleVoice = () => {
    setVoiceEnabled(prev => !prev);
  };

  // Safe callback setter for sub-modules to update the mascot globally
  const handleSetMascotData = useCallback((data: { mood: MascotMood; text: string }) => {
    setMascotData(data);
  }, []);

  const navigationTabs = [
    { id: "home", label: "🏠 होम", color: "hover:border-orange-400 text-slate-700 hover:text-orange-600 font-bold" },
    { id: "history", label: "🕒 इतिहास", color: "hover:border-blue-400 text-slate-700 hover:text-blue-600 font-bold" },
    { id: "features", label: "🔰 विशेषताएँ", color: "hover:border-emerald-400 text-slate-700 hover:text-emerald-600 font-bold" },
    { id: "rights", label: "⚖️ अधिकार खेल", color: "hover:border-pink-400 text-slate-700 hover:text-pink-600 font-bold" },
    { id: "duties", label: "🎉 कर्तव्य बोर्ड", color: "hover:border-yellow-400 text-slate-700 hover:text-yellow-600 font-bold" },
    { id: "election", label: "🗳️ चुनाव बूथ", color: "hover:border-green-400 text-slate-700 hover:text-green-600 font-bold" },
    { id: "quiz", label: "🎯 सीखो व खेलो", color: "hover:border-amber-400 text-slate-700 hover:text-amber-600 font-bold" }
  ];

  const getTabBorderColor = () => {
    switch (activeTab) {
      case "history": return "border-blue-400 shadow-[0_12px_0_#3b82f6]";
      case "rights": return "border-pink-500 shadow-[0_12px_0_#ec4899]";
      case "duties": return "border-yellow-400 shadow-[0_12px_0_#facc15]";
      case "election": return "border-green-500 shadow-[0_12px_0_#22c55e]";
      case "quiz": return "border-amber-500 shadow-[0_12px_0_#f59e0b]";
      default: return "border-orange-400 shadow-[0_12px_0_#f97316]";
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 pb-20 font-sans selection:bg-orange-100 selection:text-orange-900 antialiased">
      {/* Decorative Tricolor Top bar */}
      <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-orange-400 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform">
              स
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-green-600 italic flex items-center gap-2">
                <span>संविधान मित्र</span>
                <span className="text-[10px] non-italic text-amber-900 bg-amber-100 border-2 border-amber-300 px-2.5 py-0.5 rounded-full font-black">
                  कक्षा ७
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-extrabold hidden md:block">
                भारतीय संविधान: खेल-खेल में सीखें
              </p>
            </div>
          </div>

          {/* Nav Links for Laptop Displays */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigationTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all border-2 cursor-pointer ${
                    active
                      ? "bg-orange-100 border-orange-400 text-orange-700 shadow-inner"
                      : `bg-white border-transparent ${tab.color}`
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Action pills (Score, voice, reset) */}
          <div className="flex items-center gap-3">
            {/* Overall Game Score */}
            <div className="bg-yellow-50 border-3 border-yellow-300 px-4 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-md text-yellow-850" title="आपका कुल स्कोर">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>पॉइंट्स: <strong>{score} XP</strong></span>
            </div>

            {/* Narration helper */}
            <button
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl transition cursor-pointer border-2 ${
                voiceEnabled
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100 shadow-sm"
                  : "bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200"
              }`}
              title={voiceEnabled ? "ऑडियो विवरण बंद करें" : "ऑडियो विवरण ऑन करें"}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Clear progress */}
            <button
              onClick={resetAllProgress}
              className="p-2.5 border-2 border-slate-300 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition cursor-pointer shadow-xs"
              title="अपनी पूरी प्रगति साफ़ करें"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for smaller screens */}
        <div className="border-t border-slate-100 lg:hidden py-3 bg-white flex overflow-x-auto px-4 gap-2 h-14 scrollbar-none">
          {navigationTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1 text-[11px] font-black rounded-full flex-shrink-0 cursor-pointer transition-all border ${
                  active
                    ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-10">
        
        {/* Dynamic Mounted Module Route Renderer */}
        <div className={`bg-white border-4 rounded-[40px] p-5 md:p-8 transition-all duration-300 ${getTabBorderColor()}`}>
          {activeTab === "home" && (
            <HomeSection onNavigate={setActiveTab} setMascotData={handleSetMascotData} />
          )}
          {activeTab === "history" && (
            <HistorySection setMascotData={handleSetMascotData} />
          )}
          {activeTab === "features" && (
            <FeaturesSection onNavigate={setActiveTab} setMascotData={handleSetMascotData} />
          )}
          {activeTab === "rights" && (
            <RightsSection setMascotData={handleSetMascotData} incrementScore={incrementScore} />
          )}
          {activeTab === "duties" && (
            <DutiesSection setMascotData={handleSetMascotData} incrementScore={incrementScore} />
          )}
          {activeTab === "election" && (
            <ElectionSection setMascotData={handleSetMascotData} incrementScore={incrementScore} />
          )}
          {activeTab === "quiz" && (
            <QuizSection setMascotData={handleSetMascotData} incrementScore={incrementScore} gameScore={score} />
          )}
        </div>

        {/* Persistent Mascot "Samvidhan Mitra Notification Console" */}
        <section className="mt-8 border-t pt-8">
          <div className="flex justify-center md:justify-end">
            <SamvidhanMitra
              mood={mascotData.mood}
              text={mascotData.text}
              voiceEnabled={voiceEnabled}
              onToggleVoice={handleToggleVoice}
            />
          </div>
        </section>
      </main>

      {/* Humble Aesthetic Footer */}
      <footer className="mt-12 py-6 bg-slate-900 text-slate-400 text-center border-t border-slate-800 text-xs font-sans tracking-wide">
        <p>© 2026 भारत सरकार डिजिटल बाल साक्षरता अभियान। कक्षा ७ के लिए विशेष संस्करण।</p>
        <p className="mt-1 text-slate-600 font-bold">
          "अनेकता में एकता, यही है भारत की विशेषता!" 🇮🇳
        </p>
      </footer>
    </div>
  );
}
