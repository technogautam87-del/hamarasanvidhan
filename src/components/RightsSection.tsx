/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { rightsData } from "../data";
import { RightItem } from "../types";
import { Scale, Bird, GraduationCap, ShieldAlert, Heart, Gavel, Play, CheckCircle2, PhoneCall, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RightsSectionProps {
  setMascotData: (data: { mood: "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting"; text: string }) => void;
  incrementScore: (points: number) => void;
}

const getRightIcon = (name: string, cls = "w-6 h-6 text-sky-600") => {
  switch (name) {
    case "Scale":
      return <Scale className={cls} />;
    case "Bird":
      return <Bird className={cls} />;
    case "GraduationCap":
      return <GraduationCap className={cls} />;
    case "ShieldAlert":
      return <ShieldAlert className={cls} />;
    case "Heart":
      return <Heart className={cls} />;
    case "Gavel":
      return <Gavel className={cls} />;
    default:
      return <Scale className={cls} />;
  }
};

export default function RightsSection({ setMascotData, incrementScore }: RightsSectionProps) {
  const [selectedRight, setSelectedRight] = useState<RightItem | null>(null);
  const [simStep, setSimStep] = useState<"idle" | "playing" | "success">("idle");
  const [completedRights, setCompletedRights] = useState<number[]>(() => {
    const saved = localStorage.getItem("samvidhan_completed_rights");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Track and save completed rights in localStorage
  useEffect(() => {
    localStorage.setItem("samvidhan_completed_rights", JSON.stringify(completedRights));
  }, [completedRights]);

  // Simulation specific states
  const [equalityTeam, setEqualityTeam] = useState<string[]>(["राजू", "संजय", "बंटी"]);
  const [equalityScoreText, setEqualityScoreText] = useState("");
  const [surajConfidence, setSurajConfidence] = useState(25);
  const [hasBag, setHasBag] = useState(false);
  const [dialedDigits, setDialedDigits] = useState("");
  const [decorations, setDecorations] = useState<string[]>([]);
  const [shieldActive, setShieldActive] = useState(false);

  // Synchronize mascot on change
  useEffect(() => {
    if (selectedRight) {
      if (simStep === "idle") {
        setMascotData({
          mood: "thinking",
          text: `चलो बच्चों, हम '${selectedRight.title}' को जीवंत देखते हैं! कहानी को ध्यान से पढ़ो और नीचे 'सिमुलेशन शुरू करें' पर क्लिक करो!`
        });
      } else if (simStep === "success") {
        setMascotData({
          mood: "excited",
          text: `अद्भुत! आपने सफलतापूर्वक अधिकार को लागू किया! इससे समाज कितना सुंदर और खुशहाल हो जाता है ना?`
        });
      }
    } else {
      setMascotData({
        mood: "happy",
        text: "यहाँ हमारे 6 अद्भुत मौलिक अधिकार हैं! इनमें से किसी एक पर उंगली या माउस रखें और उसकी मजेदार कहानी और लाइव सिमुलेटर देखें।"
      });
    }
  }, [selectedRight, simStep, setMascotData]);

  const selectRightItem = (right: RightItem) => {
    setSelectedRight(right);
    setSimStep("idle");
    // Reset simulation variables
    setEqualityTeam(["राजू", "संजय", "बंटी"]);
    setEqualityScoreText("");
    setSurajConfidence(20);
    setHasBag(false);
    setDialedDigits("");
    setDecorations([]);
    setShieldActive(false);
  };

  const handleStartSim = () => {
    setSimStep("playing");
    if (selectedRight) {
      setMascotData({
        mood: "speaking",
        text: `चलो इस सिमुलेशन गेम को खेलें और इस अधिकार की रक्षा करें!`
      });
    }
  };

  const handleSuccess = () => {
    setSimStep("success");
    if (selectedRight && !completedRights.includes(selectedRight.id)) {
      setCompletedRights([...completedRights, selectedRight.id]);
      incrementScore(15); // Add 15 points per simulation solved
    }
  };

  // INTERACTIVE ACTION HANDLERS FOR EACH OF THE 6 RIGHTS
  const handleAddToTeam = () => {
    if (!equalityTeam.includes("मीना 👧")) {
      setEqualityTeam([...equalityTeam, "मीना 👧"]);
      setEqualityScoreText("मीना ने मैदान में आकर पहली गेंद पर शानदार छक्का जड़ दिया! 🏏");
      setTimeout(() => {
        handleSuccess();
      }, 2500);
    }
  };

  const handleConfBoost = () => {
    if (surajConfidence < 100) {
      const nextConf = surajConfidence + 25;
      setSurajConfidence(nextConf);
      if (nextConf >= 100) {
        setTimeout(() => {
          handleSuccess();
        }, 1500);
      }
    }
  };

  const handleGiveBagAndMidday = () => {
    setHasBag(true);
    setTimeout(() => {
      handleSuccess();
    }, 2000);
  };

  const handlePhoneDial = (num: string) => {
    if (dialedDigits.length < 4) {
      const updated = dialedDigits + num;
      setDialedDigits(updated);
      if (updated === "1098") {
        setTimeout(() => {
          handleSuccess();
        }, 2200);
      }
    }
  };

  const handleAddDecor = (decor: string) => {
    if (!decorations.includes(decor)) {
      const updated = [...decorations, decor];
      setDecorations(updated);
      if (updated.length >= 3) {
        setTimeout(() => {
          handleSuccess();
        }, 1500);
      }
    }
  };

  const handleActivateShield = () => {
    setShieldActive(true);
    setTimeout(() => {
      handleSuccess();
    }, 2500);
  };

  return (
    <div id="rights-section" className="space-y-6">
      {/* List of 6 Rights */}
      {!selectedRight ? (
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
              ⚖️ अधिकार चुनो और मुकाबला जीतो (Fundamental Rights)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              नीचे सूचीबद्ध 6 अधिकारों में से किसी एक को चुनें और उसके पीछे की सुंदर बाल-कहानी व सिमुलेशन गेम का आनंद लें:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rightsData.map((right) => {
              const isDone = completedRights.includes(right.id);
              return (
                <motion.div
                  key={right.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => selectRightItem(right)}
                  className={`border-3 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all bg-white relative overflow-hidden ${
                    isDone ? "border-emerald-400 bg-emerald-50/10" : "border-slate-200"
                  }`}
                >
                  {isDone && (
                    <div className="absolute right-0 top-0 bg-emerald-500 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase shadow flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>पूर्ण</span>
                    </div>
                  )}

                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      {getRightIcon(right.iconName)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 leading-snug">{right.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {right.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-black text-sky-600">
                    <span>सिमुलेटर खेलें</span>
                    <Play className="w-3 h-3 fill-sky-600" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        // Rights Simulator Interface
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedRight(null)}
            className="px-4 py-2 border-2 border-slate-700 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            ← मुख्य सूची में वापस जाएँ
          </button>

          {/* Right Header Detail */}
          <div className="bg-sky-50 border-3 border-sky-300 rounded-3xl p-5 flex flex-col md:flex-row gap-5 items-center justify-between">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="p-4 bg-white rounded-3xl shadow-sm border border-sky-200">
                {getRightIcon(selectedRight.iconName, "w-10 h-10 text-sky-600")}
              </div>
              <div>
                <span className="text-xs font-black bg-sky-200 text-sky-800 px-3 py-1 rounded-full">
                  मौलिक अधिकार सुरक्षा
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{selectedRight.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 max-w-xl">
                  {selectedRight.description}
                </p>
              </div>
            </div>

            <div className="bg-white border p-3 rounded-2xl shadow-xs text-center flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                मातृभाषा उदाहरण:
              </span>
              <p className="text-xs font-black text-slate-700 max-w-sm italic mt-1 font-sans">
                "{selectedRight.kidsExample}"
              </p>
            </div>
          </div>

          {/* Stage layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Story and Description */}
            <div className="lg:col-span-5 bg-white border-3 border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                📖 बच्चों की कहानी
              </div>
              <h4 className="text-lg font-black text-slate-800">
                {selectedRight.scenarioTitle}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 border p-4 rounded-2xl block border-dashed">
                {selectedRight.scenarioText}
              </p>

              {simStep === "idle" && (
                <button
                  onClick={handleStartSim}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-black rounded-2xl shadow-md transition duration-200 cursor-pointer text-sm flex items-center justify-center gap-2 border border-orange-300"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>सिमुलेशन खेल शुरू करें! 🎮</span>
                </button>
              )}
            </div>

            {/* Right Interactive Player Stage */}
            <div className="lg:col-span-7 bg-slate-50 border-3 border-slate-200 rounded-3xl min-h-[300px] flex flex-col justify-between overflow-hidden relative">
              {/* Header Panel */}
              <div className="bg-slate-800 p-3 text-white flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  🎬 सिमुलेशन कंसोल
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                  {simStep === "idle" ? "रुका हुआ" : simStep === "playing" ? "प्रगति पर" : "सफल ✅"}
                </span>
              </div>

              {/* Stage content based on active step */}
              <div className="p-6 flex-1 flex flex-col items-center justify-center">
                {simStep === "idle" && (
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center text-orange-600 mx-auto animate-bounce">
                      🎮
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      सिमुलेशन शुरू करने के लिए बाईं तरफ 'शुरू करें' बटन दबाएं।
                    </p>
                  </div>
                )}

                {simStep === "playing" && (
                  <div className="w-full space-y-6">
                    {/* EQUALITY CODE */}
                    {selectedRight.id === 1 && (
                      <div className="text-center space-y-4">
                        <p className="text-xs font-black text-blue-700">
                          लक्ष्य: टीम के खिलाड़ियों में मीना को भी शामिल करें!
                        </p>
                        <div className="flex justify-center gap-3 flex-wrap">
                          {equalityTeam.map((p, i) => (
                            <span key={i} className="px-4 py-2 bg-white rounded-xl shadow-xs border font-bold text-xs text-slate-700">
                              {p}
                            </span>
                          ))}
                        </div>

                        {!equalityTeam.includes("मीना 👧") ? (
                          <button
                            onClick={handleAddToTeam}
                            className="px-6 py-2 bg-indigo-600 hover:bg-slate-800 text-white text-xs font-black rounded-full cursor-pointer animate-pulse transition"
                          >
                            🏏 मीना को टीम में बुलाएं (अधिकार लागू करें)
                          </button>
                        ) : (
                          <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 border rounded-xl">
                            {equalityScoreText}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FREEDOM SPECIAL */}
                    {selectedRight.id === 2 && (
                      <div className="text-center space-y-4 max-w-sm mx-auto">
                        <p className="text-xs font-black text-purple-700">
                          लक्ष्य: सूरज का हौसला बढ़ाएं ताकि वह भाषण दे सके।
                        </p>
                        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden border">
                          <div
                            className="bg-purple-600 h-full transition-all duration-300"
                            style={{ width: `${surajConfidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 block">
                          सूरज का आत्मविश्वास: {surajConfidence}%
                        </span>

                        <button
                          onClick={handleConfBoost}
                          className="px-6 py-2 bg-purple-600 text-white font-bold rounded-full text-xs cursor-pointer hover:bg-purple-700 active:scale-95 transition"
                        >
                          🔊 "हौसला बढ़ाएं" (प्रेस करें)
                        </button>
                      </div>
                    )}

                    {/* EDUCATION RTE */}
                    {selectedRight.id === 3 && (
                      <div className="text-center space-y-4">
                        <p className="text-xs font-black text-amber-700">
                          लक्ष्य: रामू के हाथ से केतली हटाकर कंधों पर सुंदर बस्ता सजाएं!
                        </p>
                        <div className="flex justify-center gap-10 items-center">
                          {/* Before */}
                          <div className="flex flex-col items-center">
                            <span className="text-4xl text-slate-400">☕</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1">उदास (ढाबा काम)</span>
                          </div>
                          <span className="text-slate-400 text-xl">➔</span>
                          {/* After */}
                          <div className="flex flex-col items-center relative">
                            <span className="text-4xl">👨‍🎓</span>
                            {hasBag && (
                              <span className="absolute -right-2 top-0 text-lg animate-bounce">🎒</span>
                            )}
                            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                              {hasBag ? "मुस्कुराता छात्र" : "इंतज़ार में"}
                            </span>
                          </div>
                        </div>

                        {!hasBag && (
                          <button
                            onClick={handleGiveBagAndMidday}
                            className="px-6 py-2 bg-amber-500 text-white hover:bg-slate-800 text-xs font-black rounded-full cursor-pointer animate-pulse transition"
                          >
                            🎒 बस्ता पहनाएं व विद्यालय भेजें!
                          </button>
                        )}
                      </div>
                    )}

                    {/* EXPLOITATION HELP 1098 */}
                    {selectedRight.id === 4 && (
                      <div className="text-center space-y-4">
                        <p className="text-xs font-black text-rose-700">
                          लक्ष्य: चाइल्ड हेल्पलाइन डायल करें ताकि बाल श्रम बंद हो।
                        </p>
                        <div className="bg-slate-800 p-3 rounded-xl text-white font-mono tracking-widest text-lg w-28 mx-auto border-2 border-slate-500">
                          {dialedDigits || "----"}
                        </div>
                        {dialedDigits !== "1098" && (
                          <p className="text-[10px] font-bold text-slate-500">
                            (सुराग: चाइल्ड हेल्पलाइन नंबर <strong>1 0 9 8</strong> दबाएं)
                          </p>
                        )}

                        <div className="grid grid-cols-4 gap-2 w-48 mx-auto">
                          {["1", "0", "9", "8"].map((n) => (
                            <button
                              key={n}
                              onClick={() => handlePhoneDial(n)}
                              className="p-3 bg-white border font-bold text-xs rounded-lg active:bg-rose-50 cursor-pointer"
                            >
                              {n}
                            </button>
                          ))}
                        </div>

                        {dialedDigits.length > 0 && (
                          <button
                            onClick={() => setDialedDigits("")}
                            className="text-[10px] text-slate-400 hover:text-slate-600 font-bold underline"
                          >
                            साफ़ करें
                          </button>
                        )}
                      </div>
                    )}

                    {/* RELIGION MULTICULTURAL */}
                    {selectedRight.id === 5 && (
                      <div className="text-center space-y-4">
                        <p className="text-xs font-black text-emerald-700">
                          लक्ष्य: स्कूल उत्सव के मंच पर सभी धर्मों के प्रतीकों को सजाएं!
                        </p>

                        <div className="flex gap-4 justify-center">
                          {["🪔 दीया (दीवाली)", "🌙 तारा (ईद)", "🎄 पेड़ (क्रिसमस)"].map((decor) => {
                            const isAdded = decorations.includes(decor);
                            return (
                              <button
                                key={decor}
                                disabled={isAdded}
                                onClick={() => handleAddDecor(decor)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                                  isAdded ? "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed" : "bg-white border-emerald-300 text-emerald-800"
                                }`}
                              >
                                {decor}
                              </button>
                            );
                          })}
                        </div>

                        {/* Visual Stage */}
                        <div className="bg-emerald-950/90 text-white p-4 h-20 rounded-2xl flex items-center justify-center gap-4 text-sm border-2 border-emerald-800">
                          {decorations.length === 0 ? (
                            <span className="text-[10px] text-slate-400 font-bold block">मंच खाली है। ऊपर दिए गए सजावट दबाएं।</span>
                          ) : (
                            decorations.map((d, i) => (
                              <span key={i} className="text-xl animate-bounce">
                                {d.split(" ")[0]}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* REMEDIES PROTECTION SHIELD */}
                    {selectedRight.id === 6 && (
                      <div className="text-center space-y-4">
                        <p className="text-xs font-black text-red-500">
                          लक्ष्य: सुरक्षा कवच सक्रिय कर अधिकारों की रक्षा करें!
                        </p>

                        <div className="flex justify-center items-center h-24 relative">
                          <span className="text-4xl relative z-10">📖</span>
                          {/* Animated golden force field around book */}
                          <AnimatePresence>
                            {shieldActive && (
                              <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.4, 0.6] }}
                                exit={{ opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute w-24 h-24 rounded-full border-4 border-yellow-400 bg-yellow-300/20"
                              ></motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {!shieldActive && (
                          <button
                            onClick={handleActivateShield}
                            className="px-6 py-2.5 bg-yellow-500 text-slate-950 hover:bg-slate-800 hover:text-white font-black text-xs rounded-full cursor-pointer transition animate-bounce flex items-center gap-2 mx-auto justify-center"
                          >
                            🛡️ सुरक्षा कवच सक्रिय करें (Article 32)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SUCESS COMPLETED PANEL */}
                {simStep === "success" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 mx-auto text-xl font-bold">
                      ✓
                    </div>
                    <h4 className="text-lg font-black text-emerald-800">
                      संविधान का कमाल! जय हो! 🎉
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                      आपने सफलतापूर्वक इस अधिकार की रक्षा की। सभी के चेहरे पर खुशहाली आ गई। संविधान मित्र की तरफ से आपको मिले <strong>+15 पॉइंट</strong>!
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Console Footing bar */}
              <div className="bg-slate-100 px-4 py-2 border-t text-[11px] text-slate-500 font-bold flex justify-between">
                <span>अधिकार: {selectedRight.title}</span>
                <span>कक्षा 7 भारत नागरिकता विकास</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
