/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { MascotMood } from "../types";
import { Volume2, VolumeX, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SamvidhanMitraProps {
  mood?: MascotMood;
  text: string;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export default function SamvidhanMitra({
  mood = "greeting",
  text,
  voiceEnabled,
  onToggleVoice,
}: SamvidhanMitraProps) {
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (voiceEnabled && text) {
      speakText(text);
    } else {
      stopSpeaking();
    }
    return () => {
      stopSpeaking();
    };
  }, [text, voiceEnabled]);

  const speakText = (txt: string) => {
    if (!("speechSynthesis" in window)) return;

    // Suppress previous speech
    window.speechSynthesis.cancel();

    // Clean text from emojis for smoother TTS narration
    const cleanTxt = txt
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
      .trim();

    if (!cleanTxt) return;

    const utterance = new SpeechSynthesisUtterance(cleanTxt);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9; // Kids friendly slower speed

    // Find custom Hindi voices if supported
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(
      (v) => v.lang.includes("hi-IN") || v.lang.includes("hi")
    );
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onstart = () => setIsSpeakingState(true);
    utterance.onend = () => setIsSpeakingState(false);
    utterance.onerror = () => setIsSpeakingState(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingState(false);
  };

  // Replay speech on manual bubble or character click
  const handleReplay = () => {
    if (text) {
      speakText(text);
    }
  };

  // SVG parameters based on mood
  const getFaceExpression = () => {
    switch (mood) {
      case "happy":
        return { eyeY: 12, eyeSize: 6, mouthPath: "M 20 42 Q 35 55 50 42" };
      case "excited":
        return { eyeY: 10, eyeSize: 7, mouthPath: "M 15 40 Q 35 62 55 40 Z" };
      case "thinking":
        return { eyeY: 11, eyeSize: 5, mouthPath: "M 25 45 Q 35 43 45 45" };
      case "proud":
        return { eyeY: 12, eyeSize: 6, mouthPath: "M 22 42 Q 35 48 48 42" };
      case "speaking":
        return { eyeY: 12, eyeSize: 6, mouthPath: "M 25 42 Q 35 50 45 42" };
      default: // greeting
        return { eyeY: 12, eyeSize: 6, mouthPath: "M 20 42 Q 35 52 50 42" };
    }
  };

  const expression = getFaceExpression();

  return (
    <div id="samvidhan-mitra-widget" className="flex items-end gap-4 max-w-full md:max-w-3xl">
      {/* Speech Bubble Card - Styled with Vibrant Palette colors and indicators */}
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          transition={{ duration: 0.3 }}
          className="relative bg-slate-900 text-white border-4 border-amber-400 p-5 pl-8 rounded-[32px] shadow-2xl flex-1 flex flex-col justify-between overflow-hidden"
        >
          {/* Triangular pointer */}
          <div className="absolute right-[-14px] bottom-8 w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-amber-400 border-b-[10px] border-b-transparent hidden md:block"></div>
          <div className="absolute left-10 bottom-[-14px] w-0 h-0 border-l-[10px] border-l-transparent border-t-[15px] border-t-amber-400 border-r-[10px] border-r-transparent md:hidden"></div>

          {/* Decorative tricolor stripe */}
          <div className="absolute left-0 top-0 h-full w-2.5 bg-gradient-to-b from-orange-500 via-white to-emerald-600 pointer-events-none"></div>

          {/* Sparkly Background Frame for Text */}
          <div className="text-sm md:text-base leading-relaxed font-sans font-semibold">
            <span className="text-yellow-405 text-amber-300 font-black block mb-1.5 text-xs tracking-widest uppercase">
              ✨ संविधान मित्र का संदेश:
            </span>
            <p className="text-slate-100 pr-6 font-bold">{text}</p>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
            <button
              onClick={handleReplay}
              className="text-amber-300 hover:text-amber-200 font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="पुनः सुनें"
            >
              <Volume2 className="w-4 h-4 text-orange-400" />
              <span>सुनें (Audio)</span>
            </button>

            <button
              onClick={onToggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl cursor-pointer text-xs font-black transition-all border-2 ${
                voiceEnabled
                  ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                  : "bg-slate-800 text-slate-350 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>आवाज़ ऑन</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>आवाज़ बंद</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mascot Cartoon Face Avatar and Body container */}
      <div className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={handleReplay}>
        <motion.div
          animate={{
            y: isSpeakingState ? [0, -4, 0] : [0, -2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: isSpeakingState ? 0.6 : 2.5,
            ease: "easeInOut",
          }}
          className="relative w-28 h-28 md:w-32 md:h-32"
        >
          {/* Main Character SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {/* Soft Shadow */}
            <ellipse cx="50" cy="94" rx="30" ry="6" fill="#cbd5e1" opacity="0.6" />

            {/* Mascot Shirts/Body */}
            <path d="M 30 75 L 70 75 L 78 95 L 22 95 Z" fill="#2563eb" /> {/* Blue school coat jacket */}
            <path d="M 45 75 L 55 75 L 50 85 Z" fill="#ffffff" /> {/* White collar shirt */}
            <path d="M 48 83 L 52 83 L 50 95 Z" fill="#dc2626" /> {/* Red Tie */}

            {/* Ashoka Wheel Badge on Collar */}
            <circle cx="50" cy="90" r="3" fill="#1e3a8a" />
            <circle cx="50" cy="90" r="2" fill="#3b82f6" />

            {/* Hand waves/Waving */}
            {mood === "greeting" && (
              <motion.path
                d="M 18 80 C 10 70 5 60 10 50 C 13 45 18 52 18 55 Z"
                fill="#fde047"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="origin-bottom-right"
              />
            )}

            {/* Book holding (Indian Constitution) */}
            <motion.g
              animate={mood === "excited" ? { y: [-2, 2, -2] } : {}}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              {/* Saffron and Green Cover Book */}
              <rect x="10" y="65" width="22" height="28" rx="2" fill="#f97316" transform="rotate(-10 10 65)" /> {/* Indian Saffron */}
              <line x1="16" y1="63" x2="33" y2="60" stroke="#ffffff" strokeWidth="2" />
              <circle cx="21" cy="74" r="4" fill="#ffffff" />
              <circle cx="21" cy="74" r="3.5" stroke="#1e3a8a" strokeWidth="0.8" fill="none" />
              <line x1="21" y1="72" x2="21" y2="76" stroke="#1e3a8a" strokeWidth="0.4" />
              <line x1="19" y1="74" x2="23" y2="74" stroke="#1e3a8a" strokeWidth="0.4" />
              {/* Hand Holding Book */}
              <circle cx="16" cy="82" r="5" fill="#fef08a" />
            </motion.g>

            {/* Head Ears */}
            <circle cx="23" cy="35" r="7" fill="#fef08a" />
            <circle cx="77" cy="35" r="7" fill="#fef08a" />

            {/* Main Face Base */}
            <circle cx="50" cy="38" r="28" fill="#fef08a" /> {/* Peach/Yellow face color */}

            {/* Cheerio Blush */}
            <circle cx="33" cy="42" r="4" fill="#fca5a5" opacity="0.6" />
            <circle cx="67" cy="42" r="4" fill="#fca5a5" opacity="0.6" />

            {/* Hair */}
            <path d="M 20 30 C 20 10 80 10 80 30 C 70 20 30 20 20 30 Z" fill="#1e293b" /> {/* Slate Hair cover */}
            <path d="M 22 28 Q 50 12 78 28" stroke="#1e293b" strokeWidth="6" fill="none" />
            <path d="M 40 20 C 45 28 55 28 60 20 Z" fill="#1e293b" /> {/* Sweet Front bangs */}

            {/* Dynamic Eyes */}
            <motion.g
              animate={{
                scaleY: [1, 1, 0.1, 1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="origin-center"
            >
              <circle cx="38" cy={expression.eyeY} r={expression.eyeSize} fill="#000000" />
              <circle cx="62" cy={expression.eyeY} r={expression.eyeSize} fill="#000000" />
              {/* Eye Catchlights */}
              <circle cx="36" cy={expression.eyeY - 1} r="2" fill="#ffffff" />
              <circle cx="60" cy={expression.eyeY - 1} r="2" fill="#ffffff" />
            </motion.g>

            {/* Eyebrows */}
            <path
              d={mood === "excited" ? "M 32 6 Q 38 4 44 6" : "M 32 8 Q 38 5 44 8"}
              stroke="#1e293b"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d={mood === "excited" ? "M 56 6 Q 62 4 68 6" : "M 56 8 Q 62 5 68 8"}
              stroke="#1e293b"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Smiling Nose */}
            <path d="M 48 37 Q 50 39 52 37" stroke="#b45309" strokeWidth="2" fill="none" />

            {/* Dynamic Mouth */}
            {isSpeakingState ? (
              // Talking Animated Mouth
              <motion.path
                d="M 25 43 Q 35 55 45 43"
                stroke="#dc2626"
                strokeWidth="3.5"
                fill="#991b1b"
                animate={{
                  d: [
                    "M 25 43 Q 35 48 45 43",
                    "M 25 43 Q 35 56 45 43 Z",
                    "M 27 43 Q 35 44 43 43",
                    "M 25 43 Q 35 52 45 43 Z",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.4,
                  ease: "easeInOut",
                }}
              />
            ) : (
              // Steady Facial mouth based on Expression
              <path
                d={expression.mouthPath}
                stroke="#991b1b"
                strokeWidth="3.5"
                fill={mood === "excited" ? "#991b1b" : "none"}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Talking waves/mic icon indication */}
          {isSpeakingState && (
            <div className="absolute right-[-4px] top-4 flex gap-1">
              <span className="w-1.5 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></span>
            </div>
          )}
        </motion.div>

        {/* Name Plate */}
        <span className="mt-1 px-3 py-0.5 bg-royal-blue bg-blue-600 text-white font-bold text-xs rounded-full shadow-md border-2 border-white select-none">
          संविधान मित्र
        </span>
      </div>
    </div>
  );
}
