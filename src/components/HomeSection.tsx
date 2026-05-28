/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Award, Compass, HelpCircle, ArrowRight, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";

interface HomeSectionProps {
  onNavigate: (section: string) => void;
  setMascotData: (data: { mood: "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting"; text: string }) => void;
}

export default function HomeSection({ onNavigate, setMascotData }: HomeSectionProps) {
  const [chartType, setChartType] = useState<"radar" | "bar">("radar");

  useEffect(() => {
    setMascotData({
      mood: "greeting",
      text: "नमस्ते बच्चों! मैं हूँ आपका 'संविधान मित्र'। आज हम मिलकर हमारे प्यारे भारत के सबसे बड़े नियम-कानून की किताब—'संविधान' को बहुत ही सरल, मजेदार और खेल-खेल में समझेंगे। चलो शुरू करें!"
    });
  }, [setMascotData]);

  // Dynamic progress parsing from localStorage for History Section mini puzzles
  const historyPct = useMemo(() => {
    const saved = localStorage.getItem("samvidhan_history_puzzles");
    if (!saved) return 0;
    try {
      const parsed = JSON.parse(saved);
      const solved = Array.isArray(parsed) ? parsed.filter(Boolean).length : 0;
      return Math.round((solved / 3) * 100);
    } catch {
      return 0;
    }
  }, []);

  // Dynamic progress parsing from localStorage for Rights Simulators
  const rightsPct = useMemo(() => {
    const saved = localStorage.getItem("samvidhan_completed_rights");
    if (!saved) return 0;
    try {
      const parsed = JSON.parse(saved);
      const completed = Array.isArray(parsed) ? parsed.length : 0;
      return Math.round((completed / 6) * 100);
    } catch {
      return 0;
    }
  }, []);

  // Dynamic progress parsing from localStorage for Duties game
  const dutiesPct = useMemo(() => {
    const savedEval = localStorage.getItem("samvidhan_duties_evaluated");
    if (!savedEval) return 0;
    try {
      const evaluated = JSON.parse(savedEval);
      const completed = Array.isArray(evaluated) ? evaluated.length : 0;
      return Math.round((completed / 6) * 100);
    } catch {
      return 0;
    }
  }, []);

  // Dynamic progress parsing from localStorage for election booth steps
  const electionPct = useMemo(() => {
    const completed = localStorage.getItem("samvidhan_election_completed") === "true";
    if (completed) return 100;
    const step = localStorage.getItem("samvidhan_election_step");
    if (step === "winner") return 100;
    if (step === "counting") return 75;
    if (step === "booth") return 50;
    if (step === "card-creation") return 25;
    return 0;
  }, []);

  // Dynamic progress parsing from localStorage for Quiz superstars
  const quizPct = useMemo(() => {
    const savedScore = localStorage.getItem("samvidhan_quiz_high_score");
    if (!savedScore) return 0;
    const score = parseInt(savedScore, 10) || 0;
    return Math.round((score / 12) * 100);
  }, []);

  // Calculate global average mastery rating
  const averagePct = useMemo(() => {
    return Math.round((historyPct + rightsPct + dutiesPct + electionPct + quizPct) / 5);
  }, [historyPct, rightsPct, dutiesPct, electionPct, quizPct]);

  // Chart data formatting
  const chartData = useMemo(() => [
    { name: "इतिहास (History)", percentage: historyPct, color: "#f97316" },
    { name: "अधिकार (Rights)", percentage: rightsPct, color: "#ec4899" },
    { name: "कर्तव्य (Duties)", percentage: dutiesPct, color: "#eab308" },
    { name: "चुनाव (Elections)", percentage: electionPct, color: "#22c55e" },
    { name: "क्विज़ (Quiz)", percentage: quizPct, color: "#d97706" }
  ], [historyPct, rightsPct, dutiesPct, electionPct, quizPct]);

  // Multi-lingual kid-friendly grade evaluation
  const getGradeDetails = (pct: number) => {
    if (pct >= 90) return { grade: "A+", desc: "🎖️ संविधान महानायक (Supreme Hero) ! आप लोकतंत्र के असली रक्षक हैं।" };
    if (pct >= 70) return { grade: "A", desc: "🛡️ लोकतंत्र योद्धा (Democracy Warrior) ! आपको नागरिक अधिकारों की उत्तम समझ है।" };
    if (pct >= 50) return { grade: "B", desc: "🎓 संविधान विशेषज्ञ (Constitution Expert) ! आप एक जागरूक राष्ट्र निर्माता बन रहे हैं।" };
    if (pct >= 20) return { grade: "C", desc: "🌱 जागरूक बाल नागरिक (Aware Kid Citizen) ! अच्छी शुरुआत है, इसे और आगे बढ़ाएं।" };
    return { grade: "D", desc: "🚀 नव शिक्षार्थी (Young Learner) ! चलो सारे सिमुलेशन खेलकर अपनी प्रगति बढ़ाते हैं।" };
  };

  const gradeInfo = useMemo(() => getGradeDetails(averagePct), [averagePct]);

  const cards = [
    {
      id: "history",
      title: "संविधान का इतिहास",
      desc: "एनिमेशन के साथ देखें कि हमारे देश का संविधान कब और कैसे बना, और इसके जनक कौन हैं।",
      color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
      accent: "bg-orange-500",
      icon: BookOpen,
      actionText: "इतिहास देखें",
      progress: historyPct
    },
    {
      id: "rights",
      title: "अधिकार चुनो और जानो",
      desc: "क्या आप जानते हैं कि आपके पास समानता और पढ़ाई के क्या अधिकार हैं? सिमुलेशन से खुद जानें!",
      color: "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100",
      accent: "bg-sky-500",
      icon: Compass,
      actionText: "अधिकार चुनें",
      progress: rightsPct
    },
    {
      id: "duties",
      title: "प्यारा कर्तव्य खेल",
      desc: "तिरंगे का सम्मान और पर्यावरण की रक्षा जैसे हमारे 11 पावन कर्तव्य। सही आदतें चुनें!",
      color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
      accent: "bg-emerald-500",
      icon: Award,
      actionText: "कर्तव्य खेलें",
      progress: dutiesPct
    },
    {
      id: "election",
      title: "चुनाव और लोकतंत्र",
      desc: "अपना वोटर कार्ड खुद बनाएं, ईवीएम मशीन से वोट डालें और लाइव चुनाव परिणाम देखें!",
      color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
      accent: "bg-purple-500",
      icon: Sparkles,
      actionText: "वोट डालें",
      progress: electionPct
    },
    {
      id: "quiz",
      title: "सीखो और खेलो क्विज़",
      desc: "क्या आप संविधान का 'सुपरस्टार' बनना चाहते हैं? प्रश्नों के सही उत्तर दें और स्कोर बोर्ड में नाम दर्ज कराएं!",
      color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
      accent: "bg-amber-500",
      icon: HelpCircle,
      actionText: "क्विज़ शुरू करें",
      progress: quizPct
    }
  ];

  return (
    <div id="home-section" className="space-y-8 py-2">
      {/* Dynamic Animated Decorative Header Banner - Vibrant Palette theme */}
      <motion.header
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-52 py-8 md:py-6 bg-gradient-to-r from-orange-400 via-white to-emerald-500 flex flex-col md:flex-row items-center px-6 md:px-12 relative overflow-hidden rounded-[40px] border-b-8 border-yellow-200 shadow-xl gap-6"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-10 rotate-12 pointer-events-none">
          <div className="w-20 h-20 border-4 border-white rounded-lg"></div>
          <div className="w-20 h-20 border-4 border-white rounded-full"></div>
          <div className="w-20 h-20 border-4 border-white rounded-lg"></div>
          <div className="w-20 h-20 border-4 border-white rounded-full"></div>
        </div>

        <div className="z-10 flex flex-col text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black text-slate-950 drop-shadow-md">
            हमारा <span className="text-orange-600">संविधान</span>
          </h1>
          <p className="text-sm md:text-lg font-black text-slate-700 mt-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full w-fit mx-auto md:mx-0 shadow-sm border border-orange-200">
            कक्षा ७ के लिए एक मज़ेदार सफर 🇮🇳
          </p>
          
          <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => onNavigate("history")}
              className="px-5 py-2.5 bg-orange-500 border-b-4 border-orange-700 hover:border-b-2 hover:translate-y-0.5 active:translate-y-1 active:border-b-0 text-white font-black rounded-2xl shadow-md transition-all text-xs cursor-pointer"
            >
              🚀 यात्रा शुरू करें
            </button>
            <button
              onClick={() => onNavigate("quiz")}
              className="px-5 py-2.5 bg-green-600 border-b-4 border-green-800 hover:border-b-2 hover:translate-y-0.5 active:translate-y-1 active:border-b-0 text-white font-black rounded-2xl shadow-md transition-all text-xs cursor-pointer"
            >
              🎯 क्विज़ चुनौती लें
            </button>
          </div>
        </div>

        {/* Dynamic score/guide guide box on right */}
        <div className="md:ml-auto z-10 bg-white p-4 rounded-3xl shadow-2xl border-4 border-yellow-400 rotate-3 transform hover:rotate-0 transition-transform flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center border-2 border-blue-200 overflow-hidden">
              <svg viewBox="0 0 24 24" className="w-12 h-12 fill-blue-500">
                 <circle cx="12" cy="8" r="4" />
                 <path d="M12 14c-4.42 0-8 3.58-8 8h16c0-4.42-3.58-8-8-8z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">आपका प्यारा गाइड</p>
              <h2 className="text-lg font-black text-blue-600">संविधान मित्र</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                ● सदा ऑनलाइन
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Intro Brief Card */}
      <div className="bg-amber-50/50 border-3 border-dashed border-amber-300 rounded-[32px] p-6 shadow-sm">
        <h2 className="text-xl font-black text-amber-900 flex items-center gap-2 mb-2">
          📖 संविधान क्या है? (संविधान मित्र से सीखें)
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 font-semibold">
          जैसे आपके स्कूल को चलाने के लिए कड़े नियम-कायदे होते हैं - जैसे प्रार्थना सभा का समय, यूनिफॉर्म, और परीक्षा के नियम—ठीक वैसे ही हमारे इतने बड़े देश <strong>'भारत'</strong> को सही ढंग से चलाने के लिए नियमों की एक महान पुस्तक है। इसी नियम-पुस्तिका को हम <strong>भारत का संविधान</strong> कहते हैं। यह यह भी पक्का करता है कि हर नागरिक खुश रहे, सुरक्षित रहे और पढ़े-लिखे!
        </p>
      </div>

      {/* Modern Mastery progress dashboard with Recharts Graph */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-slate-200 rounded-[35px] p-6 md:p-8 shadow-xl space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              📊 मेरा संविधान रिपोर्ट कार्ड (Overall Mastery Report)
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              आपके पूरा किए गए सिमुलेशन, खेल और क्विज़ प्रदर्शन के आधार पर लाइव योग्यता चार्ट।
            </p>
          </div>

          {/* Toggle for Radar or Bar Chart */}
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 self-stretch md:self-auto border border-slate-200">
            <button
              onClick={() => setChartType("radar")}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                chartType === "radar"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>🎯 योग्यता चक्र (Radar)</span>
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                chartType === "bar"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>📊 प्रगति स्तम्भ (Bar)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Chart representation */}
          <div className="lg:col-span-7 bg-slate-50 border-2 border-slate-100 rounded-[30px] p-4 flex flex-col items-center justify-center min-h-[340px] relative">
            <div className="w-full h-80">
              {chartType === "radar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: "#334155", fontSize: 10, fontWeight: "bold" }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                    <Radar
                      name="योग्यता (Mastery %)"
                      dataKey="percentage"
                      stroke="#f97316"
                      fill="#ffd8a8"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border-2 border-slate-200 p-2.5 rounded-xl shadow-md text-xs font-bold leading-relaxed">
                              <p className="text-slate-900 font-extrabold">{data.name}</p>
                              <p className="text-orange-600 font-black">मास्टरी स्तर: {data.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                    <XAxis
                      dataKey="name"
                      tickFormatter={(value) => value.split(" ")[0]}
                      tick={{ fill: "#334155", fontSize: 10, fontWeight: "bold" }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border-2 border-slate-200 p-2.5 rounded-xl shadow-md text-xs font-bold leading-relaxed">
                              <p className="text-slate-900 font-extrabold">{data.name}</p>
                              <p className="text-indigo-600 font-black">मास्टरी स्तर: {data.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="percentage" radius={[10, 10, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold mt-2 text-center">
              💡 प्रत्येक क्षेत्र को दोबारा खेलकर 100% मास्टरी पर ले जाएं और सर्वश्रेष्ठ ग्रेड हासिल करें!
            </p>
          </div>

          {/* Stats detailed card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-3 border-orange-200 rounded-3xl p-5 relative overflow-hidden flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-orange-850 font-black tracking-widest uppercase block mb-1">
                  कुल औसत समझ (Overall Rating)
                </span>
                <div className="text-5xl font-black text-orange-900 flex items-baseline gap-1">
                  <span>{averagePct}%</span>
                  <span className="text-sm font-bold text-slate-500">मास्टरी</span>
                </div>
                <p className="text-xs text-orange-800 font-bold mt-2 leading-relaxed">
                  {gradeInfo.desc}
                </p>
              </div>

              {/* Kid friendly Grade Badge */}
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl flex flex-col items-center justify-center border-4 border-white shadow-lg rotate-6 hover:rotate-0 transition-all cursor-pointer flex-shrink-0">
                <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">ग्रेड</span>
                <span className="text-3xl font-black">{gradeInfo.grade}</span>
              </div>
            </div>

            {/* Structured progress list */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-400 tracking-wider uppercase block">विषयवार रिपोर्ट कार्ड:</h4>
              
              <div className="flex items-center justify-between bg-orange-50/50 border-2 border-orange-100 p-3 rounded-2xl text-xs font-bold">
                <span className="text-orange-900">1. संविधान इतिहास और जनक</span>
                <span className="bg-orange-100 text-orange-900 px-2.5 py-0.5 rounded-full font-black">{historyPct}%</span>
              </div>

              <div className="flex items-center justify-between bg-pink-50/50 border-2 border-pink-100 p-3 rounded-2xl text-xs font-bold">
                <span className="text-pink-900">2. मौलिक अधिकार सिमुलेशन</span>
                <span className="bg-pink-100 text-pink-900 px-2.5 py-0.5 rounded-full font-black">{rightsPct}%</span>
              </div>

              <div className="flex items-center justify-between bg-yellow-50/50 border-2 border-yellow-100 p-3 rounded-2xl text-xs font-bold">
                <span className="text-yellow-905">3. प्यारे मौलिक कर्तव्य आदतें</span>
                <span className="bg-yellow-100 text-yellow-950 px-2.5 py-0.5 rounded-full font-black">{dutiesPct}%</span>
              </div>

              <div className="flex items-center justify-between bg-green-50/50 border-2 border-green-100 p-3 rounded-2xl text-xs font-bold">
                <span className="text-green-905">4. चुनाव बूथ और ईवीएम मशीन</span>
                <span className="bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full font-black">{electionPct}%</span>
              </div>

              <div className="flex items-center justify-between bg-amber-50/50 border-2 border-amber-100 p-3 rounded-2xl text-xs font-bold">
                <span className="text-amber-900">5. खेलो व सीखो क्विज़ Superstar</span>
                <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-black">{quizPct}%</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Grid of Interactive Zones */}
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          ⭐ खेलने और सीखने के क्षेत्र चुनें:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const IconComponent = card.icon;
            // Determine custom bottom border and bar colors for card modules
            let borderClass = "border-b-8 border-b-blue-500";
            let barColor = "bg-blue-500";
            if (card.id === "rights") {
              borderClass = "border-b-8 border-b-pink-500";
              barColor = "bg-pink-500";
            } else if (card.id === "duties") {
              borderClass = "border-b-8 border-b-yellow-400";
              barColor = "bg-yellow-400";
            } else if (card.id === "election") {
              borderClass = "border-b-8 border-b-green-500";
              barColor = "bg-green-500";
            } else if (card.id === "quiz") {
              borderClass = "border-b-8 border-b-amber-500";
              barColor = "bg-amber-500";
            } else if (card.id === "history") {
              borderClass = "border-b-8 border-b-orange-500";
              barColor = "bg-orange-500";
            }

            const progressVal = `${card.progress}%`;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onNavigate(card.id)}
                className={`bg-white rounded-[40px] p-6 shadow-xl ${borderClass} hover:transform hover:-translate-y-2 transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${card.accent} text-white p-3 rounded-2xl shadow-md group-hover:rotate-12 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] bg-slate-50 px-2.5 py-0.5 rounded-full border-2 border-slate-100 font-black text-slate-500 uppercase tracking-widest">
                      ज़ोन 0{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-550 font-semibold leading-relaxed mb-4">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">प्रगति बार (Progress)</span>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: progressVal }}></div>
                  </div>

                  <div className="flex items-center text-xs font-black gap-1 mt-auto group-hover:gap-2 transition-all text-slate-750">
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
