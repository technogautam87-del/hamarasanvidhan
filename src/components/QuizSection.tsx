/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { quizQuestions } from "../data";
import { QuizQuestion } from "../types";
import {
  Award,
  Zap,
  RefreshCw,
  Volume2,
  VolumeX,
  HelpCircle,
  AlertCircle,
  Trophy,
  User,
  Star,
  Sparkles,
  ArrowRight,
  Smile,
  CheckCircle2,
  XCircle,
  BadgeHelp,
  ListRestart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizSectionProps {
  setMascotData: (data: { mood: "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting"; text: string }) => void;
  incrementScore: (points: number) => void;
  gameScore: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  avatar: string;
  badge: string;
  isCurrentUser?: boolean;
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: "1", name: "प्रिया शर्मा", score: 155, avatar: "👧", badge: "बाल राष्ट्रपति 🏅" },
  { id: "2", name: "आरव कुमार", score: 135, avatar: "👦", badge: "कानून रक्षक 🛡️" },
  { id: "3", name: "वीर सिंह", score: 120, avatar: "🦁", badge: "जागरूक नागरिक 🌟" },
  { id: "4", name: "दीया पटेल", score: 105, avatar: "🌸", badge: "संविधान प्रेमी 📖" },
  { id: "5", name: "कबीर अहमद", score: 75, avatar: "⚽", badge: "बाल सांसद 🏫" }
];

const AVATARS = ["👧", "👦", "🤖", "🦁", "🌸", "⚽", "⭐", "👑", "🚀", "🎓"];

export default function QuizSection({ setMascotData, incrementScore, gameScore }: QuizSectionProps) {
  const [activeTab, setActiveTab] = useState<"quiz" | "leaderboard">("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [revealMode, setRevealMode] = useState(false);
  const [votedCorrectlyCount, setVotedCorrectlyCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  
  // Track incorrect/correct logs for progress map
  const [answerLogs, setAnswerLogs] = useState<("correct" | "incorrect" | "pending")[]>(
    new Array(quizQuestions.length).fill("pending")
  );

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userName, setUserName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("👧");
  const [isSavedInLeaderboard, setIsSavedInLeaderboard] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];

  // Initialize Leaderboard on mount
  useEffect(() => {
    const stored = localStorage.getItem("samvidhan_leaderboard");
    if (stored) {
      try {
        setLeaderboard(JSON.parse(stored));
      } catch (e) {
        setLeaderboard(DEFAULT_LEADERBOARD);
      }
    } else {
      setLeaderboard(DEFAULT_LEADERBOARD);
      localStorage.setItem("samvidhan_leaderboard", JSON.stringify(DEFAULT_LEADERBOARD));
    }
  }, []);

  // Sync mascot when question or tab changes
  useEffect(() => {
    if (activeTab === "leaderboard") {
      setMascotData({
        mood: "proud",
        text: "वाह बच्चों! यह है हमारा बाल लीडरबोर्ड। यहाँ हमारे स्कूल के सबसे बुद्धिमान और जागरूक नागरियों की सूची है। क्या आपका नाम शीर्ष पर है? अधिक से अधिक खेलें और नंबर 1 बनें!"
      });
    } else if (quizFinished) {
      setMascotData({
        mood: votedCorrectlyCount >= 8 ? "excited" : "proud",
        text: `अद्भुत प्रयास प्यारे बच्चों! क्विज़ पूरा हो गया। आपने ${quizQuestions.length} में से कुल ${votedCorrectlyCount} प्रश्नों के शानदार और सही जवाब दिए हैं। आपका कुल स्कोर अब ${gameScore} XP हो गया है। अपना नाम लीडरबोर्ड में दर्ज करें!`
      });
    } else {
      let qTypeStr = "बहुविकल्पीय";
      if (currentQuestion.type === "boolean") qTypeStr = "सही-गलत";
      if (currentQuestion.type === "blank") qTypeStr = "खाली स्थान भरने वाला";

      setMascotData({
        mood: "thinking",
        text: `प्रश्न सं. 0${currentIndex + 1} (${qTypeStr} प्रश्न): ${currentQuestion.question} ध्यान से सोचें और सही उत्तर को लॉक करें!`
      });
    }
  }, [currentIndex, quizFinished, activeTab, setMascotData]);

  // Save quiz high score to localStorage when quiz finishes
  useEffect(() => {
    if (quizFinished) {
      const savedHighScore = parseInt(localStorage.getItem("samvidhan_quiz_high_score") || "0", 10);
      if (votedCorrectlyCount > savedHighScore) {
        localStorage.setItem("samvidhan_quiz_high_score", votedCorrectlyCount.toString());
      }
    }
  }, [quizFinished, votedCorrectlyCount]);

  // Visual/Audio synthesizer for correct answers
  const playSoundCorrect = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Sweet two-note ascending chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5 note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Visual/Audio synthesizer for incorrect answers
  const playSoundWrong = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Low dual buzzing tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220.0, ctx.currentTime); // A3 note flat buzz
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const handleSelectOption = (optIdx: number) => {
    if (revealMode) return;
    setSelectedOption(optIdx);
    setRevealMode(true);

    const isCorrect = optIdx === currentQuestion.answerIndex;
    const newLogs = [...answerLogs];

    if (isCorrect) {
      playSoundCorrect();
      setVotedCorrectlyCount(prev => prev + 1);
      incrementScore(15); // Add 15 points per correct answer
      newLogs[currentIndex] = "correct";
      setMascotData({
        mood: "excited",
        text: `अति सुंदर! बिल्कुल सही जवाब दिया! ${currentQuestion.explanation}`
      });
    } else {
      playSoundWrong();
      newLogs[currentIndex] = "incorrect";
      setMascotData({
        mood: "thinking",
        text: `ओह, कोई बात नहीं! सही उत्तर है: '${currentQuestion.options[currentQuestion.answerIndex]}'। ${currentQuestion.explanation}`
      });
    }
    setAnswerLogs(newLogs);
  };

  const handleSubmitText = () => {
    if (revealMode || !typedAnswer.trim()) return;
    setRevealMode(true);

    // Normalize comparison: remove spaces, punctuation, lowercase
    const normalizedTyped = typedAnswer.trim().toLowerCase().replace(/[\s\.\,\-\_]/g, "");
    const normalizedCorrect = (currentQuestion.blankAnswer || "").trim().toLowerCase().replace(/[\s\.\,\-\_]/g, "");

    const isCorrect = normalizedTyped === normalizedCorrect || 
                     currentQuestion.options[currentQuestion.answerIndex].toLowerCase().includes(normalizedTyped);

    const newLogs = [...answerLogs];

    if (isCorrect) {
      playSoundCorrect();
      setVotedCorrectlyCount(prev => prev + 1);
      incrementScore(20); // Extra bonus for typing the correct answer (+20 points!)
      newLogs[currentIndex] = "correct";
      setMascotData({
        mood: "excited",
        text: `कमाल कर दिया! आपने लिखकर सही उत्तर दिया है! आपको 20 पॉइंट्स मिले हैं! ${currentQuestion.explanation}`
      });
    } else {
      playSoundWrong();
      newLogs[currentIndex] = "incorrect";
      setMascotData({
        mood: "thinking",
        text: `ओहो! सही उत्तर है: '${currentQuestion.blankAnswer || currentQuestion.options[currentQuestion.answerIndex]}'। ${currentQuestion.explanation}`
      });
    }
    setAnswerLogs(newLogs);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setTypedAnswer("");
    setRevealMode(false);

    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setTypedAnswer("");
    setRevealMode(false);
    setQuizFinished(false);
    setVotedCorrectlyCount(0);
    setIsSavedInLeaderboard(false);
    setAnswerLogs(new Array(quizQuestions.length).fill("pending"));
  };

  // Register in Leaderboard
  const handleSaveToLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    let kidsBadge = "जागरूक बाल नागरिक 🌱";
    if (votedCorrectlyCount === quizQuestions.length) {
      kidsBadge = "संविधान सुपरस्टार 🏆";
    } else if (votedCorrectlyCount >= 8) {
      kidsBadge = "लोकतंत्र योद्धा 🛡️";
    } else if (votedCorrectlyCount >= 5) {
      kidsBadge = "संविधान मित्र विशेषज्ञ 🎓";
    }

    const newEntry: LeaderboardEntry = {
      id: "current_user_" + Date.now(),
      name: userName.trim(),
      score: gameScore,
      avatar: selectedAvatar,
      badge: kidsBadge,
      isCurrentUser: true
    };

    // Filter out previous current-user logs to keep only the latest high score or simply append and sort
    const existingFiltered = leaderboard.filter(item => !item.isCurrentUser);
    const updated = [...existingFiltered, newEntry].sort((a, b) => b.score - a.score);

    setLeaderboard(updated);
    localStorage.setItem("samvidhan_leaderboard", JSON.stringify(updated));
    setIsSavedInLeaderboard(true);
    
    // Switch to leaderboard tab to show and celebrate progress!
    setTimeout(() => {
      setActiveTab("leaderboard");
    }, 700);
  };

  const getRatingSummary = () => {
    const pct = Math.round((votedCorrectlyCount / quizQuestions.length) * 100);
    if (pct === 100) {
      return {
        title: "संविधान महानायक (Supreme Leader of Constitution) 👑",
        desc: "अतुलनीय! आपने सभी 12 प्रश्नों के शत-प्रतिशत सटीक उत्तर दिए। हमारा भारत आपके जैसे समझदार बच्चों के हाथों में पूरी तरह सुरक्षित है!",
        color: "from-amber-500 to-yellow-400 text-amber-950 border-amber-400"
      };
    }
    if (pct >= 70) {
      return {
        title: "लोकतंत्र रक्षक (Democracy Defender) 🛡️",
        desc: "अद्भुत कार्य! आपको भारतीय संविधान और इसके गौरवशाली इतिहास की सर्वश्रेष्ठ समझ है। शाबाश बच्चों!",
        color: "from-blue-500 to-indigo-500 text-white border-blue-400"
      };
    }
    if (pct >= 40) {
      return {
        title: "उभरते बाल संसद सदस्य (Junior Parliament Member) 🏛️",
        desc: "बहुत बढ़िया प्रयास! आप देश के संविधान को गहराई से सीख रहे हैं। एक बार फिर प्रयास कर के 100% स्कोर हासिल करें!",
        color: "from-emerald-500 to-teal-500 text-white border-emerald-400"
      };
    }
    return {
      title: "जिज्ञासु बाल नागरिक (Curious Citizen) 🌱",
      desc: "अच्छा प्रयास! संविधान को जानना और समझना हर नागरिक का कर्तव्य है। 'संविधान मित्र' के साथ इतिहास और अधिकार खंडों को एक बार पुनः पढ़ें और फिर से खेलें!",
      color: "from-slate-500 to-slate-600 text-white border-slate-400"
    };
  };

  const rating = getRatingSummary();

  return (
    <div id="quiz-section-container" className="space-y-8">
      {/* Dynamic Subheader & Active Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            🎯 संविधान क्विज़ और लीडरबोर्ड
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            बहुविकल्पीय प्रश्न, सही/गलत और रिक्त स्थान भरो - सब खेलें और ज्ञान का लोहा मनवाएं!
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 p-1.5 rounded-full flex gap-1 self-start md:self-auto border">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "quiz"
                ? "bg-orange-500 text-white shadow-md active:scale-95"
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <BadgeHelp className="w-4 h-4" />
            <span>🎯 खेलें क्विज़</span>
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-purple-600 text-white shadow-md active:scale-95"
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>🏆 लीडरबोर्ड</span>
          </button>
        </div>
      </div>

      {activeTab === "quiz" ? (
        !quizFinished ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Frame: Questions and Animation */}
            <div className="lg:col-span-8 bg-white border-4 border-slate-150 rounded-[40px] p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
              
              {/* Question metadata / category */}
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-dashed pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest bg-slate-950 text-white px-3.5 py-1.5 rounded-xl uppercase">
                    प्रश्न {currentIndex + 1} / {quizQuestions.length}
                  </span>

                  {/* Dynamic Category Badges */}
                  {currentQuestion.type === "mcq" && (
                    <span className="text-[9px] font-black bg-pink-100 text-pink-800 border-2 border-pink-200 px-3 py-1 rounded-xl uppercase tracking-wider">
                      ● बहुविकल्पीय (MCQ)
                    </span>
                  )}
                  {currentQuestion.type === "boolean" && (
                    <span className="text-[9px] font-black bg-sky-100 text-sky-800 border-2 border-sky-200 px-3 py-1 rounded-xl uppercase tracking-wider">
                      ● सही / गलत (True/False)
                    </span>
                  )}
                  {currentQuestion.type === "blank" && (
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border-2 border-emerald-200 px-3 py-1 rounded-xl uppercase tracking-wider">
                      ● खाली स्थान भरो
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-black text-slate-500 bg-slate-50 border px-3 py-1.5 rounded-xl">
                  <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 animate-bounce" />
                  <span>प्रगति पॉइंट्स: <span className="text-blue-600">{gameScore} XP</span></span>
                </div>
              </div>

              {/* Progress Tracker (Custom Colored Dots map) */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none border-b border-slate-50 pb-4">
                <span className="text-[10px] uppercase font-black text-slate-400 mr-2 flex-shrink-0">ट्रैकर:</span>
                {answerLogs.map((status, idx) => {
                  let color = "bg-slate-100 border-slate-200";
                  if (idx === currentIndex) color = "bg-yellow-400 border-yellow-300 scale-125 ring-2 ring-yellow-200";
                  else if (status === "correct") color = "bg-emerald-500 border-emerald-400 text-white flex items-center justify-center";
                  else if (status === "incorrect") color = "bg-rose-500 border-rose-400 text-white flex items-center justify-center";

                  return (
                    <div
                      key={idx}
                      className={`w-6 h-6 rounded-full border-2 text-[8px] font-black flex items-center justify-center transition-all ${color}`}
                    >
                      {status === "correct" ? "✓" : status === "incorrect" ? "✗" : idx + 1}
                    </div>
                  );
                })}
              </div>

              {/* Question Screen */}
              <div className="space-y-6">
                
                {/* Under the blank style or Normal question */}
                {currentQuestion.type === "blank" ? (
                  <div className="space-y-4">
                    <p className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-2xl w-fit font-bold">
                      💡 संकेत: नीचे दिए गए विकल्पों में से सबसे सही शब्द को चुनें या लिखकर प्रयास करें!
                    </p>
                    <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-snug">
                      {/* Render text with empty placeholder */}
                      {revealMode ? (
                        <span>
                          {currentQuestion.question.replace(
                            "______",
                            `[ ${currentQuestion.blankAnswer || currentQuestion.options[currentQuestion.answerIndex]} ]`
                          )}
                        </span>
                      ) : (
                        <span>
                          {currentQuestion.question.split("______")[0]}
                          <motion.span
                            animate={{ scale: [0.98, 1.02, 0.98] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="inline-block mx-2.5 px-4 py-1.5 bg-yellow-100 border-2 border-dashed border-yellow-400 text-slate-900 font-extrabold text-xs md:text-sm rounded-xl cursor-default"
                          >
                            यहाँ क्या आएगा? 🤔
                          </motion.span>
                          {currentQuestion.question.split("______")[1]}
                        </span>
                      )}
                    </h3>
                  </div>
                ) : (
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-snug">
                    {currentQuestion.question}
                  </h3>
                )}

                {/* Interactive Blanks Mode / Layout toggler if blank */}
                {currentQuestion.type === "blank" && !revealMode && (
                  <div className="flex gap-4 border-b pb-4 text-xs font-bold">
                    <button
                      onClick={() => setIsTypingMode(false)}
                      className={`pb-2 border-b-2 transition-colors ${
                        !isTypingMode ? "border-emerald-500 text-emerald-800 font-black" : "border-transparent text-slate-500"
                      }`}
                    >
                      🗣️ शब्द चुनें (Select word)
                    </button>
                    <button
                      onClick={() => setIsTypingMode(true)}
                      className={`pb-2 border-b-2 transition-colors ${
                        isTypingMode ? "border-emerald-500 text-emerald-800 font-black" : "border-transparent text-slate-500"
                      }`}
                    >
                      ⌨️ खुद लिखकर प्रयास करें (+5 बोनस!)
                    </button>
                  </div>
                )}

                {/* Render Option Blocks */}
                {isTypingMode && currentQuestion.type === "blank" && !revealMode ? (
                  <div className="bg-slate-50 p-5 rounded-3xl border-2 border-slate-200 border-dashed space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-700">⌨️ अपना जवाब यहाँ लिखें:</label>
                      <input
                        type="text"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        placeholder="जैसे: डॉ. भीमराव अंबेडकर, हीलियम, दो आदि..."
                        className="w-full bg-white border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-emerald-500 text-slate-900"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmitText();
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSubmitText}
                      disabled={!typedAnswer.trim()}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs rounded-2xl border-b-4 border-emerald-800 transition active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      उत्तर सबमिट करें (Submit Answer) ➔
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectIndex = idx === currentQuestion.answerIndex;

                      let btnStyle = "border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-slate-800 bg-white";
                      let indicatorCls = "bg-slate-100 text-slate-600 border border-slate-300";

                      if (revealMode) {
                        if (isCorrectIndex) {
                          btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-black ring-4 ring-emerald-500/10";
                          indicatorCls = "bg-emerald-500 text-white border-emerald-600";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 bg-rose-50 text-rose-950 font-black ring-4 ring-rose-500/10";
                          indicatorCls = "bg-rose-500 text-white border-rose-600";
                        } else {
                          btnStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                          indicatorCls = "bg-slate-100 text-slate-305 border-slate-200";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={revealMode}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full p-4 md:p-5 rounded-3xl border-3 text-left text-xs md:text-sm font-black transition-all duration-150 cursor-pointer flex gap-4 items-center justify-between ${btnStyle} group`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-2xl font-black text-xs flex items-center justify-center transition-colors group-hover:rotate-6 ${indicatorCls}`}>
                              {idx === 0 ? "A" : idx === 1 ? "B" : "C"}
                            </span>
                            <span>{option}</span>
                          </div>

                          {revealMode && isCorrectIndex && (
                            <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 font-black px-2.5 py-1 rounded-xl text-[10px] uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              सही
                            </span>
                          )}
                          {revealMode && isSelected && !isCorrectIndex && (
                            <span className="text-rose-700 bg-rose-100 border border-rose-300 font-black px-2.5 py-1 rounded-xl text-[10px] uppercase flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              गलत जवाब
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Detailed Rule Explanation Frame */}
              <AnimatePresence>
                {revealMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 15 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50/70 border-3 border-amber-300 rounded-3xl p-5 space-y-4"
                  >
                    <div className="flex gap-3 text-slate-800">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div className="font-sans text-xs md:text-sm text-slate-750 leading-relaxed font-semibold">
                        <strong className="text-amber-950 font-black block text-sm mb-1">💡 नियम एवं जानकारी स्पष्टीकरण:</strong>
                        {currentQuestion.explanation}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-slate-900 border-b-4 border-slate-950 hover:bg-slate-800 text-white font-black text-xs rounded-2xl cursor-pointer shadow-md flex items-center gap-2 transform hover:-translate-y-0.5 transition"
                      >
                        <span>{currentIndex < quizQuestions.length - 1 ? "अगला प्रश्न " : "क्विज़ समाप्त करें"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Widget: Classroom Stats Panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Scoreboard block */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-4 border-indigo-200 rounded-[35px] p-6 shadow-xl space-y-4">
                <h4 className="font-black text-indigo-950 border-b border-indigo-200/60 pb-3 text-xs uppercase tracking-widest flex items-center gap-1.5">
                  📈 लाइव प्रगति रिपोर्ट कार्ड
                </h4>

                <div className="space-y-3 font-sans font-semibold text-slate-700 text-xs">
                  <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-indigo-100">
                    <span>कुल हल प्रश्न:</span>
                    <strong className="text-slate-900 font-extrabold">{revealMode ? currentIndex + 1 : currentIndex} / {quizQuestions.length}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-indigo-100">
                    <span>सही उत्तर (Correct):</span>
                    <strong className="text-emerald-700 font-black">{votedCorrectlyCount}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-indigo-100">
                    <span>सफलता प्रतिशत (Accuracy):</span>
                    <strong className="text-indigo-800 font-black">
                      {votedCorrectlyCount > 0
                        ? `${Math.round((votedCorrectlyCount / quizQuestions.length) * 100)}%`
                        : "0%"}
                    </strong>
                  </div>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">आपका संचित स्कोर (Score)</span>
                  <div className="text-4xl font-black text-indigo-700 mt-1.5 tracking-tight flex items-center justify-center gap-1">
                    <span>{gameScore}</span>
                    <span className="text-xs text-indigo-500 font-bold font-mono">XP</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${(currentIndex / quizQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-2">
                    तैयार हो जाएं! अगला प्रश्न हल करने पर +15 प्राप्त करें।
                  </p>
                </div>
              </div>

              {/* Classroom Motivation Poster */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 flex items-start gap-4">
                <div className="p-2.5 bg-amber-400 rounded-2xl text-white font-bold h-fit shrink-0">🎓</div>
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-amber-950 uppercase">शिक्षक युक्ति (Friendly Tip):</h5>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                    संविधान मित्र से सीखे गए बिंदुओं जैसे "हीलियम गैस", "6 से 14 वर्ष के अधिकार" और "11 मौलिक कर्तव्य" को ध्यान में रखें, प्रश्न इन्हीं इतिहासिक पन्नों से हैं।
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION: Final Quiz Result Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-4 border-slate-200 p-8 rounded-[40px] text-center max-w-2xl mx-auto shadow-2xl space-y-6"
          >
            <div className={`p-1 bg-gradient-to-r ${rating.color.includes("text-white") ? "from-orange-400 via-white to-green-500" : "from-amber-400 to-yellow-300"} rounded-[35px] w-fit mx-auto shadow-xl`}>
              <div className="bg-slate-900 px-8 py-7 rounded-[32px] text-center">
                <div className="w-16 h-16 bg-amber-400 border-4 border-yellow-250 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg mx-auto animate-bounce mb-3.5">
                  🏆
                </div>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full uppercase font-black tracking-widest block w-fit mx-auto">
                  परीक्षा पूर्ण घोषित
                </span>
                <h3 className="text-2xl font-black text-white mt-3 leading-snug">
                  {rating.title}
                </h3>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-600 max-w-lg mx-auto italic leading-relaxed">
              "{rating.desc}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border p-5 rounded-3xl">
              <div className="bg-white p-3.5 rounded-2xl shadow-xs border">
                <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">सही उत्तर count</span>
                <div className="text-xl font-black text-emerald-600 mt-0.5">{votedCorrectlyCount} / {quizQuestions.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-xs border">
                <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">सफलता दर</span>
                <div className="text-xl font-black text-blue-600 mt-0.5">{Math.round((votedCorrectlyCount / quizQuestions.length) * 100)}%</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-xs border">
                <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">कुल प्राप्त अंक</span>
                <div className="text-xl font-black text-indigo-600 mt-0.5 font-mono">{gameScore} XP</div>
              </div>
            </div>

            {/* Leaderboard Submission Block */}
            {!isSavedInLeaderboard ? (
              <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-[32px] text-left space-y-4 shadow-sm">
                <h4 className="text-sm font-black text-purple-950 flex items-center gap-1.5 border-b pb-2">
                  <Star className="w-4 h-4 text-purple-600 fill-purple-300" />
                  <span>लीडरबोर्ड में अपना स्थान आरक्षित करें!</span>
                </h4>

                <form onSubmit={handleSaveToLeaderboard} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">अपना नाम दर्ज करें:</label>
                      <input
                        type="text"
                        required
                        maxLength={25}
                        placeholder="जैसे: राहुल कुमार..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Avatar choice */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">अपना बाल अवतार चुनें:</label>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-white p-2 border-2 border-purple-200 rounded-xl">
                        {AVATARS.map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setSelectedAvatar(av)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition ${
                              selectedAvatar === av
                                ? "bg-purple-100 border-purple-500 scale-110"
                                : "border-slate-100 hover:bg-slate-50"
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl border-b-4 border-purple-800 transition active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    🚀 संजोएं और लाइव लीडरबोर्ड में जोड़ें ➔
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-xs text-purple-700 bg-purple-100 font-bold p-3.5 rounded-full border border-purple-200 w-fit mx-auto">
                ✓ आपका नाम सफलतापूर्वक लीडरबोर्ड में सहेज दिया गया है!
              </p>
            )}

            <div className="flex flex-wrap gap-4 items-center justify-center pt-2">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-slate-900 border-b-4 border-slate-950 hover:bg-slate-800 text-white font-black text-xs rounded-2xl cursor-pointer shadow flex items-center gap-2 transition"
              >
                <ListRestart className="w-4 h-4" />
                <span>क्विज़ फिर से खेलें</span>
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-black text-xs rounded-2xl cursor-pointer border-2 border-purple-300 transition"
              >
                🏆 सीधे लीडरबोर्ड देखें
              </button>
            </div>
          </motion.div>
        )
      ) : (
        /* SECTION: Interactive Leaderboard Tab */
        <div className="bg-white border-4 border-slate-200 rounded-[40px] p-6 md:p-8 shadow-xl max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 border-2 border-purple-300 text-purple-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-sm mb-2.5">
              🏆
            </div>
            <h3 className="text-2xl font-black text-purple-950">महान बाल लीडरबोर्ड</h3>
            <p className="text-xs text-slate-500 font-bold mt-1">
              स्कूल में जागरूक नागरिकों का राष्ट्रीय संचयी सम्मान पटल!
            </p>
          </div>

          <div className="bg-slate-50 rounded-[35px] border border-slate-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-purple-900 text-white p-4 text-[10px] font-black uppercase tracking-wider">
              <div className="col-span-2 text-center">रैंक</div>
              <div className="col-span-5">बाल नागरिक प्रोफाइल</div>
              <div className="col-span-3 text-right">उपाधि / बैज</div>
              <div className="col-span-2 text-center">कुल XP</div>
            </div>

            {/* List entries */}
            <div className="divide-y divide-slate-150">
              {leaderboard.map((player, idx) => {
                const isUser = player.isCurrentUser;
                let rankVisual: React.ReactNode = idx + 1;
                
                // Medal highlights
                if (idx === 0) rankVisual = <span className="text-2xl" title="विजेता">🥇</span>;
                else if (idx === 1) rankVisual = <span className="text-2xl" title="द्वितीय">🥈</span>;
                else if (idx === 2) rankVisual = <span className="text-2xl" title="तृतीय">🥉</span>;

                return (
                  <div
                    key={player.id}
                    className={`grid grid-cols-12 items-center p-4 transition-colors font-sans text-xs ${
                      isUser
                        ? "bg-purple-100/90 font-black text-purple-950 border-l-4 border-l-purple-600"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    <div className="col-span-2 text-center font-extrabold flex items-center justify-center">
                      {rankVisual}
                    </div>

                    <div className="col-span-5 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-slate-100 border flex items-center justify-center text-lg">
                        {player.avatar || "👦"}
                      </span>
                      <div>
                        <span className={`block font-black ${isUser ? "text-purple-950 text-sm" : "text-slate-800"}`}>
                          {player.name}
                          {isUser && <span className="ml-1.5 text-[8px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-sans">आप (You)</span>}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3 text-right font-bold text-slate-500">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full border ${isUser ? "bg-purple-200 text-purple-900 border-purple-300" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {player.badge}
                      </span>
                    </div>

                    <div className="col-span-2 text-center font-black text-slate-900 font-mono">
                      {player.score} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center bg-purple-50 p-4 border border-purple-250 rounded-2xl text-[11px] font-bold text-purple-900 leading-relaxed">
            <span className="flex items-center gap-1.5">
              💡 <span className="font-extrabold">सुझाव:</span> जितने अधिक अध्यायों को पढ़ेंगे और क्विज़ को सही हल करेंगे, उतने अधिक पॉइंट्स मिलेंगे!
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("samvidhan_leaderboard");
                setLeaderboard(DEFAULT_LEADERBOARD);
              }}
              className="text-[10px] text-rose-600 hover:text-rose-700 font-black cursor-pointer bg-white px-2.5 py-1 rounded-lg border shadow-xs"
              title="लीडरबोर्ड रीसेट करें"
            >
              रीसेट
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
