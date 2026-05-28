/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { dutiesData } from "../data";
import { DutyItem } from "../types";
import { Flag, Trees, Building, Lightbulb, Trash2, Droplet, Sparkles, Award, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DutiesSectionProps {
  setMascotData: (data: { mood: "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting"; text: string }) => void;
  incrementScore: (points: number) => void;
}

const getDutyIcon = (name: string, cls = "w-6 h-6 text-emerald-600") => {
  switch (name) {
    case "Flag":
      return <Flag className={cls} />;
    case "Trees":
      return <Trees className={cls} />;
    case "Building":
      return <Building className={cls} />;
    case "Lightbulb":
      return <Lightbulb className={cls} />;
    case "Trash2":
      return <Trash2 className={cls} />;
    case "Droplet":
      return <Droplet className={cls} />;
    default:
      return <Flag className={cls} />;
  }
};

export default function DutiesSection({ setMascotData, incrementScore }: DutiesSectionProps) {
  // Store user classifications: key is id, value is boolean (true = chosen as Correct Duty, false = chosen as Wrong Habit)
  const [classifications, setClassifications] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem("samvidhan_duties_classifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });
  const [evaluatedItems, setEvaluatedItems] = useState<number[]>(() => {
    const saved = localStorage.getItem("samvidhan_duties_evaluated");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [activeMascotQuote, setActiveMascotQuote] = useState("");

  // Track and save duties progress in localStorage
  useEffect(() => {
    localStorage.setItem("samvidhan_duties_classifications", JSON.stringify(classifications));
    localStorage.setItem("samvidhan_duties_evaluated", JSON.stringify(evaluatedItems));
  }, [classifications, evaluatedItems]);

  useEffect(() => {
    const totalCount = dutiesData.length;
    const correctCount = evaluatedItems.filter(id => {
      const item = dutiesData.find(d => d.id === id);
      return item && classifications[id] === item.isCorrect;
    }).length;

    if (evaluatedItems.length === 0) {
      setMascotData({
        mood: "thinking",
        text: "बच्चों, अधिकारों के साथ-साथ हमारी देश के प्रति जिम्मेदारियां भी हैं जिन्हें हम 'मौलिक कर्तव्य' कहते हैं! हमारे पास 11 कर्तव्य हैं। चलो नीचे दिए गए कामों को जाँचे और सही फैसला करें!"
      });
    } else if (evaluatedItems.length === totalCount) {
      if (correctCount === totalCount) {
        setMascotData({
          mood: "excited",
          text: "शानदार! आपने सभी कर्तव्यों और बुरी आदतों की बिल्कुल सही पहचान की! आप तो एक अत्यधिक जागरूक नागरिक बन गए हैं! बधाई हो!"
        });
      } else {
        setMascotData({
          mood: "proud",
          text: "आपने अभ्यास पूरा किया! हालांकि कुछ जगह सुधार की आवश्यकता है। एक बार फिर कोशिश करके 100/100 लाएँ!"
        });
      }
    }
  }, [evaluatedItems, classifications, setMascotData]);

  const handleClassify = (item: DutyItem, isDutySelected: boolean) => {
    if (evaluatedItems.includes(item.id)) return; // No re-evaluation

    // Save classification
    setClassifications(prev => ({ ...prev, [item.id]: isDutySelected }));
    setEvaluatedItems(prev => [...prev, item.id]);

    const isAnswerCorrect = isDutySelected === item.isCorrect;

    if (isAnswerCorrect) {
      incrementScore(10); // Add 10 points for correct duty classification
      setMascotData({
        mood: "happy",
        text: `बहुत बढ़िया! '${item.title}' के बारे में आपका विचार बिल्कुल सही है। यह राष्ट्र को मजबूत बनाता है!`
      });
    } else {
      setMascotData({
        mood: "thinking",
        text: `ओह! '${item.title}' को लेकर थोड़ी गड़बड़ हुई। याद रखें, ${item.isCorrect ? "यह एक बहुत महत्वपूर्ण कर्तव्य है जो हमें निभाना चाहिए!" : "यह एक गलत आदत है, हमें ऐसा करने से बचना चाहिए!"}`
      });
    }
  };

  const resetGame = () => {
    setClassifications({});
    setEvaluatedItems([]);
    localStorage.removeItem("samvidhan_duties_classifications");
    localStorage.removeItem("samvidhan_duties_evaluated");
    setMascotData({
      mood: "greeting",
      text: "चलो एक बार फिर से कर्तव्यों की जांच करें और एक आदर्श भारतीय नागरिक बनें!"
    });
  };

  const totalCount = dutiesData.length;
  const answeredCount = evaluatedItems.length;
  const correctCount = evaluatedItems.filter(id => {
    const item = dutiesData.find(d => d.id === id);
    return item && classifications[id] === item.isCorrect;
  }).length;

  return (
    <div id="duties-section" className="space-y-6">
      {/* Description */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white border-2 p-5 rounded-2xl shadow-sm gap-4">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
            🇮🇳 कर्तव्य पहचानो गेम (Fundamental Duties Study)
          </h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            संविधान ने हमें 11 मौलिक कर्तव्य दिए हैं। नीचे कुछ आदतें और काम दिखाए गए हैं। जाँचें कि कौन सी आदत <strong>"सच्चा कर्तव्य"</strong> है और कौन सा <strong>"गलत आचरण"</strong>!
          </p>
        </div>

        {/* Live game progress panel */}
        <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl text-center flex-shrink-0 min-w-[150px]">
          <span className="text-[10px] text-emerald-800 font-black tracking-widest uppercase block mb-1">
            सफलता स्कोर
          </span>
          <div className="text-2xl font-black text-emerald-800">
            {correctCount} / {totalCount}
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-1">
            {answeredCount === totalCount ? "खेल समाप्त 🎉" : "जांच जारी है..."}
          </p>
        </div>
      </div>

      {/* Grid of Duty items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dutiesData.map((item) => {
          const isEvaluated = evaluatedItems.includes(item.id);
          const chosenVal = classifications[item.id];
          const isCorrectResponse = chosenVal === item.isCorrect;

          let cardBorderClass = "border-slate-200 hover:border-slate-400 bg-white";
          if (isEvaluated) {
            cardBorderClass = isCorrectResponse
              ? "border-emerald-400 bg-emerald-50/10 shadow-sm"
              : "border-rose-300 bg-rose-50/10 shadow-sm";
          }

          return (
            <motion.div
              key={item.id}
              layout
              className={`border-3 rounded-3xl p-5 flex flex-col justify-between transition-all ${cardBorderClass}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl border ${
                    isEvaluated
                      ? isCorrectResponse ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-rose-100 border-rose-300 text-rose-700"
                      : "bg-slate-50 text-slate-700"
                  }`}>
                    {getDutyIcon(item.iconName)}
                  </div>
                  {isEvaluated && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isCorrectResponse ? "bg-emerald-100/80 border-emerald-300 text-emerald-700" : "bg-rose-100/80 border-rose-300 text-rose-700"
                    }`}>
                      {isCorrectResponse ? "सही उत्तर ✓" : "गलत समीक्षा ✗"}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border-2 border-dashed border-slate-200 text-xs">
                  <strong className="text-[10px] text-slate-500 uppercase tracking-wide block mb-0.5">
                    👀 बच्चों का वास्तविक दृश्य:
                  </strong>
                  <p className="text-slate-700 font-medium italic">
                    "{item.kidsScene}"
                  </p>
                </div>
              </div>

              {/* Classification Actions */}
              {!isEvaluated ? (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => handleClassify(item, true)}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs transition"
                  >
                    कर्तव्य है! 👍
                  </button>
                  <button
                    onClick={() => handleClassify(item, false)}
                    className="py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs transition"
                  >
                    यह गलत है! 👎
                  </button>
                </div>
              ) : (
                <div className="mt-5 pt-3 border-t text-[11px] font-bold text-slate-500 space-y-1">
                  <div>
                    सार्थक उत्तर:{" "}
                    <span className="text-slate-800">
                      {item.isCorrect ? "यह एक नैतिक कर्तव्य है।" : "यह आचरण सर्वथा गलत है।"}
                    </span>
                  </div>
                  <div>
                    आपका चुनाव:{" "}
                    <span className={isCorrectResponse ? "text-emerald-700" : "text-rose-700"}>
                      {chosenVal ? "यह कर्तव्य है" : "यह गलत है"}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Completion Modal / Refresh trigger */}
      {answeredCount === totalCount && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 text-white p-6 rounded-3xl text-center space-y-4 max-w-xl mx-auto border-3 border-emerald-400"
        >
          <div className="inline-block p-4 bg-emerald-500 text-white rounded-full mx-auto shadow-md">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black">
            {correctCount === totalCount
              ? "🏆 बधाई हो! आप बने 'संविधान सुपरस्टार'!"
              : "⭐ खेल पूरा हुआ!"}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-medium">
            आपने सभी {totalCount} आदतों की जांच सफलतापूर्वक पूरी कर ली है। आपने सीखा कि कैसे अच्छे कर्मों से हम भारत की एकता और तरक्की की ताकत बन सकते हैं!
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-xs hover:brightness-110 cursor-pointer shadow-md transition mx-auto"
          >
            फिर से खेलें 🔄
          </button>
        </motion.div>
      )}
    </div>
  );
}
