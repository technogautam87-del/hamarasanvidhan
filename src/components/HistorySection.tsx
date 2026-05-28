/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Users, FileText, BookOpen, Sparkles, ChevronLeft, ChevronRight, HelpCircle, Play, Pause, Volume2, VolumeX, Shield, UserCheck, Feather, Landmark, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HistorySectionProps {
  setMascotData: (data: { mood: "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting"; text: string }) => void;
}

interface HistoricalMilestone {
  id: number;
  year: string;
  title: string;
  description: string;
  detail: string;
  speechText: string; // Narration text
  iconName: string;
  illustrationType: "assembly" | "writing" | "document" | "flag" | "calligrapher";
}

const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    id: 1,
    year: "1946",
    title: "कदम 01: पहला ऐतिहासिक कदम - संविधान सभा",
    description: "आजाद भारत का अपना कानून बनाने के लिए देश के ज्ञानी नेता एक साथ आए।",
    detail: "9 दिसंबर 1946 को नई दिल्ली के पुस्तकालय भवन में देश भर से 299 प्रकांड विद्वान और देशभक्त पहली बार मिलकर बैठे। पूरे देश की सुख-शांति व भाईचारे के लिए उन्होंने दुनिया का सबसे विस्तृत संविधान बनाने का बीड़ा उठाया। इस सभा के पहले अस्थायी अध्यक्ष सच्चिदानंद सिन्हा और स्थायी अध्यक्ष डॉ. राजेंद्र प्रसाद जी थे!",
    speechText: "9 दिसंबर 1946 को नई दिल्ली में देश के 299 महान ज्ञानी नेता पहली बार एकत्रित हुए ताकि स्वतंत्र भारत के उज्ज्वल भविष्य के लिए सर्वसम्मति से सुंदर संविधान की नींव रखी जा सके।",
    iconName: "Users",
    illustrationType: "assembly"
  },
  {
    id: 2,
    year: "1947",
    title: "कदम 02: महान प्रारूप समिति का गठन",
    description: "डॉ. भीमराव अंबेडकर जी के अद्भुत नेतृत्व में प्रारूप लेखन की शुरुआत हुई।",
    detail: "भारत की आजादी के कुछ दिनों बाद ही 29 अगस्त 1947 को एक 'प्रारूप समिति' (Drafting Committee) बनाई गई। इस अति महत्वपूर्ण समिति के अध्यक्ष बाबा साहब डॉ. भीमराव अंबेडकर जी थे। उन्होंने रात-दिन जागकर दुनिया के 60 से अधिक देशों के श्रेष्ठ नियमों का अध्ययन किया और हमारे अनेकता में एकता वाले भारत के लिए एक बेजोड़ मसौदा तैयार किया।",
    speechText: "29 अगस्त 1947 को डॉ. भीमराव अंबेडकर की अध्यक्षता में प्रारूप समिति बनाई गई। उन्होंने दुनिया के साठ से ज्यादा देशों के नियमों का गहन अध्ययन किया और देश के हितों के संरक्षण के लिए अद्वितीय मसौदा लिखा।",
    iconName: "FileText",
    illustrationType: "writing"
  },
  {
    id: 3,
    year: "1949",
    title: "कदम 03: संविधान बनकर तैयार",
    description: "पूरे 2 साल, 11 महीने और 18 दिन की अटूट तपस्या के बाद पुस्तक को स्वीकृति मिली।",
    detail: "लंबी गंभीर चर्चाओं, सुधारों और लगभग 2,400 संशोधानों के बाद, आखिरकार 26 नवंबर 1949 को भारत का संविधान संविधान सभा द्वारा सहर्ष अंगीकार (स्वीकृत) कर लिया गया। इस पावन अवसर पर संविधान सभा के सभी 284 सदस्यों ने इसपर अपने हस्ताक्षर किए, जिनमें 15 तेजस्वी और साहसी महिलाएं भी शामिल थीं। हर साल 26 नवंबर को हम 'संविधान दिवस' (Constitution Day) मनाते हैं!",
    speechText: "पूरे दो साल, ग्यारह महीने और अठारह दिन की अटूट तपस्या के बाद, छब्बीस नवंबर उन्नीस सौ उनचास को हमारा संविधान स्वीकृत हो गया। इसीलिए इस गौरवशाली दिन को हम प्रति वर्ष संविधान दिवस मनाते हैं।",
    iconName: "BookOpen",
    illustrationType: "document"
  },
  {
    id: 4,
    year: "1950",
    title: "कदम 04: सम्पूर्ण गणतंत्र घोषित - संविधान लागू",
    description: "26 जनवरी के पावन प्रभात को हमारा संविधान पूरे देश में शान से लागू हुआ।",
    detail: "26 जनवरी 1950 को पूरे हिन्दुस्तान में हमारा अपना प्यारा कानून पूरी तरह से प्रभावी हो गया। ब्रिटिश हुकूमत का अंतिम साया भी खत्म हो गया और भारत एक 'सम्पूर्ण संप्रभु संपन्न लोकतंत्र' बना। जनता को वोट डालने, और अपना प्रतिनिधि चुनने की ताकत मिली। इस ऐतिहासिक दिन की याद में देश के प्रथम नागरिक (राष्ट्रपति) तिरंगा लहराते हैं और हम उल्लास से 'गणतंत्र दिवस' (Republic Day) मनाते हैं!",
    speechText: "छब्बीस जनवरी उन्नीस सौ पचास को स्वतंत्र भारत का संविधान पूरे देश में शान से लागू हुआ और भारत एक संप्रभु गणतंत्र बना। इस महान उत्सव को हम गणतंत्र दिवस के रूप में आकर्षक झांकियों के साथ मनाते हैं।",
    iconName: "Sparkles",
    illustrationType: "flag"
  },
  {
    id: 5,
    year: "बोनस",
    title: "मजेदार कहानी: प्रेम बिहारी जी और सुंदर सुलेखन",
    description: "क्या आपको पता है? हमारा संविधान छापा नहीं गया था, उसे हाथ से लिखा गया था!",
    detail: "भारतीय संविधान का मूल रूप हिंदी व अंग्रेजी में अत्यंत सुंदर अक्षरों में श्री प्रेम बिहारी नारायण रायजादा जी द्वारा हाथ से लिखा गया था। उन्होंने इटैलिक सुलेखन शैली (calligraphy) में बिना किसी फीस के इसे लिखा। उनकी केवल एक शर्त थी कि संविधान के प्रत्येक पृष्ठ पर उनका नाम हो और अंतिम पृष्ठ पर उनके बाबा रामप्रसाद का नाम भी हो। उन्होंने इसे पूरा करने में 303 विशेष पेन-निब का इस्तेमाल किया था।",
    speechText: "क्या आपको मालूम है, हमारे संविधान को हाथ से इटैलिक कैलोग्राफी में प्रेम बिहारी नारायण रायजादा ने लिखा था। उन्होंने फीस के बदले अधिकार पत्र के अंत में अपने दादा जी और स्वयं का नाम लिखने की अनमोल शर्त रखी थी।",
    iconName: "Feather",
    illustrationType: "calligrapher"
  }
];

interface HistoricFigure {
  name: string;
  role: string;
  quote: string;
  superpower: string;
  avatar: string;
  desc: string;
}

const HISTORIC_FIGURES: HistoricFigure[] = [
  {
    name: "बाबा साहब डॉ. बी.आर. अंबेडकर",
    role: "प्रारूप समिति के अध्यक्ष (जनक)",
    quote: "संविधान केवल वकीलों का दस्तावेज नहीं है, बल्कि यह जीवन जीने का एक माध्यम है जो सभी को सुरक्षा देता है।",
    superpower: "असीम ज्ञान और सामाजिक न्याय की दृढ़ भावना 🛡️",
    avatar: "👨‍🏫",
    desc: "बाबा साहब ने जीवन भर कमजोरों और बालिकाओं की शिक्षा व समान अधिकारों के लिए लड़ाई लड़ी। उन्हें भारतीय संविधान के मुख्य वास्तुकार के रूप में वैश्विक ख्याति प्राप्त है।"
  },
  {
    name: "पंडित जवाहरलाल नेहरू",
    role: "उद्देश्य प्रस्ताव पेश कर्ता व प्रथम प्रधानमंत्री",
    quote: "नागरिक अधिकारों की सुरक्षा और देश में धर्मनिरपेक्षता ही हमारे लोकतंत्र की सच्ची ताकत होगी।",
    superpower: "वैश्विक दूरदृष्टि और बाल शिक्षा प्रेमी ✏️",
    avatar: "🌹",
    desc: "चाचा नेहरू ने ही संविधान सभा में प्रस्तावना का मुख्य 'उद्देश्य-प्रस्ताव' पेश किया था। उन्होंने देश को आधुनिक विज्ञान और शिक्षा की राह पर अग्रसर किया।"
  },
  {
    name: "डॉ. राजेंद्र प्रसाद",
    role: "संविधान सभा के स्थायी अध्यक्ष",
    quote: "हमारा संविधान तभी उत्कृष्ट साबित होगा, जब इसे चलाने वाले लोग निष्ठावान और चरित्रवान देशभक्त होंगे।",
    superpower: "महान संयम, अनुशासन एवं सरलता ⭐️",
    avatar: "🎓",
    desc: "ये स्वतंत्र भारत के प्रथम राष्ट्रपति थे। इन्होंने लगभग 3 वर्षों तक संविधान सभा की बहसों और सत्रों का शांत, अनुशासित व न्यायपूर्ण ढंग से संचालन किया।"
  },
  {
    name: "सरदार वल्लभभाई पटेल",
    role: "गृहमंत्री व एकता के शिल्पकार",
    quote: "यदि हमारे नागरिकों में आपसी एकता और राष्ट्रभक्ति नहीं होगी, तो कोई भी उत्तम नियम पुस्तक देश को नहीं बचा पाएगी।",
    superpower: "अदम्य लौह इच्छाशक्ति और राष्ट्रीय एकता 🇮🇳",
    avatar: "🦁",
    desc: "इन्होंने स्वतंत्रता के पश्चात 560 से अधिक छोटी-बड़ी रियासतों का भारत संघ में विलीनीकरण कराया ताकि हमारा अखंड राष्ट्र बन सके।"
  }
];

interface SpotPuzzle {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const SPOT_PUZZLES: SpotPuzzle[] = [
  {
    question: "संविधान सभा की चर्चाओं में भाग लेने वाले 299 सदस्यों में कुल कितनी साहसी और देशभक्त महिलाएं शामिल थीं?",
    options: ["5 महिलाएं", "15 महिलाएं", "25 महिलाएं"],
    correctIdx: 1,
    explanation: "बिल्कुल सही! स्वतंत्र भारत का कानून तय करने वाले 284 हस्ताक्षर कर्ताओं में 15 महिला सेनानी व विदुषियां भी शामिल थीं, जिन्होंने समान शिक्षा अधिकारों पर जोर दिया।"
  },
  {
    question: "सुलेखक प्रेम बिहारी नारायण जी ने हमारे संविधान को सुंदर लेखन में संपूर्ण करने के लिए कुल कितने विशेष निब का इस्तेमाल किया था?",
    options: ["103 निब", "303 निब", "503 निब"],
    correctIdx: 1,
    explanation: "शानदार! उन्होंने सुंदर इटैलिक लेखन के लिए पूरे 303 नंबर वाले विशेष होल्डर पेन-निब का इस्तेमाल कर इस पवित्र दस्तावेज को सुंदर रूप दिया।"
  },
  {
    question: "हमारा संविधान बनने में कुल कितना समय लगा था?",
    options: ["1 वर्ष 5 महीने", "2 वर्ष 11 महीने 18 दिन", "4 वर्ष 2 महीने"],
    correctIdx: 1,
    explanation: "अति उत्तम! हमारे विद्वानों ने संविधान पूरा करने में निरंतर 2 साल, 11 महीने और 18 दिन का कठोर परिश्रम किया।"
  }
];

export default function HistorySection({ setMascotData }: HistorySectionProps) {
  const [activeTab, setActiveTab] = useState<"theater" | "figures" | "puzzle">("theater");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedPuzzleOpt, setSelectedPuzzleOpt] = useState<number | null>(null);
  const [revealPuzzle, setRevealPuzzle] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<boolean[]>(new Array(SPOT_PUZZLES.length).fill(false));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playProgressRef = useRef<number>(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const currentItem = HISTORICAL_MILESTONES[selectedIndex];

  // Speech Synthesizer
  const speakText = (textToSpeak: string) => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // Stop talking previous lines
      if (!voiceEnabled) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "hi-IN";
      utterance.rate = 0.95; // kids comfortable speed
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Sync mascot when timeline node changes
  useEffect(() => {
    if (activeTab === "theater" && currentItem) {
      setMascotData({
        mood: selectedIndex === 4 ? "excited" : "happy",
        text: `दोस्तो, क्या आपको पता है, ${currentItem.year === "बोनस" ? "एक अनमोल रहस्य" : currentItem.year + " की ऐतिहासिक गाथा"}? ${currentItem.description}`
      });
      speakText(currentItem.speechText);
    } else if (activeTab === "figures") {
      setMascotData({
        mood: "proud",
        text: "बच्चों! ये हैं हमारे देश के महान निर्माता और स्वतंत्रता संग्राम के सच्चे सेनानी। इनके जीवन संग्राम और राष्ट्रभक्ति वाले विचारों को ध्यान से पढ़ें!"
      });
    } else if (activeTab === "puzzle") {
      setMascotData({
        mood: "thinking",
        text: "इतिहास की सैर तो हो गई, अब अपनी समझ का प्रमाण दें! इस मजेदार ऐतिहासिक पहेली का सही उत्तर खोजें।"
      });
    }
  }, [selectedIndex, activeTab, voiceEnabled]);

  // Handle theater movie auto-play scenario
  useEffect(() => {
    if (isPlaying) {
      playProgressRef.current = 0;
      setProgressPercent(0);

      const intervalTime = 100; // update progress bar every 100ms
      const totalDuration = 8000; // 8 seconds per slide

      timerRef.current = setInterval(() => {
        playProgressRef.current += intervalTime;
        const currentPct = (playProgressRef.current / totalDuration) * 100;
        setProgressPercent(Math.min(currentPct, 100));

        if (playProgressRef.current >= totalDuration) {
          // Time to slide next!
          setSelectedIndex((prev) => {
            if (prev < HISTORICAL_MILESTONES.length - 1) {
              return prev + 1;
            } else {
              setIsPlaying(false); // Finished loop
              return 0;
            }
          });
          playProgressRef.current = 0;
          setProgressPercent(0);
        }
      }, intervalTime);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setProgressPercent(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, selectedIndex]);

  // Clean speaking on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleVoice = () => {
    const nextVoice = !voiceEnabled;
    setVoiceEnabled(nextVoice);
    if (nextVoice && activeTab === "theater") {
      setTimeout(() => speakText(currentItem.speechText), 100);
    } else if (!nextVoice) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (selectedIndex < HISTORICAL_MILESTONES.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleSolvePuzzle = (optIdx: number) => {
    if (revealPuzzle) return;
    setSelectedPuzzleOpt(optIdx);
    setRevealPuzzle(true);

    const isCorrect = optIdx === SPOT_PUZZLES[puzzleIndex].correctIdx;

    if (isCorrect) {
      const updated = [...solvedPuzzles];
      updated[puzzleIndex] = true;
      setSolvedPuzzles(updated);
      setMascotData({
        mood: "excited",
        text: `शानदार जवाब! बिल्कुल सही चुना। ${SPOT_PUZZLES[puzzleIndex].explanation}`
      });
    } else {
      setMascotData({
        mood: "thinking",
        text: `ओहो! थोडा सा चूक गए। सही उत्तर है विकल्प: '${SPOT_PUZZLES[puzzleIndex].options[SPOT_PUZZLES[puzzleIndex].correctIdx]}'। ${SPOT_PUZZLES[puzzleIndex].explanation}`
      });
    }
  };

  const handleNextPuzzle = () => {
    setSelectedPuzzleOpt(null);
    setRevealPuzzle(false);
    if (puzzleIndex < SPOT_PUZZLES.length - 1) {
      setPuzzleIndex(puzzleIndex + 1);
    } else {
      setPuzzleIndex(0); // Loop back
    }
  };

  return (
    <div id="history-section-module" className="space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            🕒 भारत का गौरवशाली इतिहास
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            देखें और सुने कि किस तरह रंगीन चित्रों, महानायकों और मजेदार सिनेमा के माध्यम से हमारा महान कानून बना!
          </p>
        </div>

        {/* Tab Controls for History sections */}
        <div className="bg-slate-100 p-1.5 rounded-full flex gap-1 self-start md:self-auto border">
          <button
            onClick={() => setActiveTab("theater")}
            className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "theater"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>🎬 इतिहास थियेटर</span>
          </button>
          <button
            onClick={() => setActiveTab("figures")}
            className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "figures"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 महान निर्माता</span>
          </button>
          <button
            onClick={() => setActiveTab("puzzle")}
            className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "puzzle"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>✨ ऐतिहासिक पहेली</span>
          </button>
        </div>
      </div>

      {activeTab === "theater" && (
        <div className="space-y-6">
          {/* Timeline Nodes Panel */}
          <div className="bg-white border-4 border-slate-150 p-5 rounded-[32px] shadow-sm">
            <div className="relative flex items-center justify-between">
              {/* Connector line in the bg */}
              <div className="absolute top-1/2 left-[5%] right-[5%] h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
              {/* Active filled connector */}
              <div
                className="absolute top-1/2 left-[5%] h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-green-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(selectedIndex / (HISTORICAL_MILESTONES.length - 1)) * 90}%` }}
              ></div>

              {HISTORICAL_MILESTONES.map((item, index) => {
                const active = selectedIndex === index;
                const completed = index < selectedIndex;
                let bgCls = "bg-white border-slate-350 text-slate-400";
                if (active) bgCls = "bg-orange-500 border-orange-300 text-white scale-125 z-10 shadow-lg shadow-orange-500/10 ring-4 ring-orange-200";
                else if (completed) bgCls = "bg-green-600 border-green-400 text-white z-10";

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setSelectedIndex(index);
                    }}
                    className="relative z-10 flex flex-col items-center cursor-pointer select-none"
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-3 flex items-center justify-center transition-all ${bgCls}`}>
                      {item.iconName === "Users" && <Users className="w-5 h-5" />}
                      {item.iconName === "FileText" && <FileText className="w-5 h-5" />}
                      {item.iconName === "BookOpen" && <BookOpen className="w-5 h-5" />}
                      {item.iconName === "Sparkles" && <Sparkles className="w-5 h-5" />}
                      {item.iconName === "Feather" && <Feather className="w-5 h-5" />}
                    </div>
                    <span className={`mt-1.5 text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full transition-all ${
                      active ? "bg-orange-100 text-orange-800" : "text-slate-500"
                    }`}>
                      {item.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Display Section: simulates cartoon and animated sequence */}
          <div className="bg-slate-900 border-4 border-slate-950 rounded-[40px] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-orange-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-50px] left-[-30px] w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Side: Dynamic Visual Comic Box */}
              <div className="lg:col-span-4 bg-slate-800/80 p-5 rounded-[32px] border-2 border-slate-700/60 aspect-square flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner group">
                {/* Visual spinning chakra wheel */}
                <div className="absolute w-48 h-48 border-[6px] border-dashed border-slate-700/50 rounded-full animate-spin duration-[40s] pointer-events-none"></div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItem.id}
                    initial={{ scale: 0.85, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.85, opacity: 0, rotate: 5 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="flex flex-col items-center justify-center p-4 w-full h-full"
                  >
                    {currentItem.illustrationType === "assembly" && (
                      <div className="space-y-3">
                        <div className="flex justify-center -space-x-3">
                          <span className="w-14 h-14 rounded-full bg-slate-900 text-2xl flex items-center justify-center border-2 border-slate-700 shadow-md">👨‍⚖️</span>
                          <span className="w-14 h-14 rounded-full bg-slate-900 text-2xl flex items-center justify-center border-2 border-slate-700 shadow-md z-10">👴</span>
                          <span className="w-14 h-14 rounded-full bg-slate-900 text-2xl flex items-center justify-center border-2 border-slate-700 shadow-md">👳</span>
                        </div>
                        <span className="block text-[11px] bg-slate-750 border border-slate-700 px-3 py-1 rounded-full text-slate-300 font-bold">299 संविधान निर्माता चर्चा में</span>
                        <h4 className="text-sm font-black text-white">संसद की पहली बैठक 🇮🇳</h4>
                      </div>
                    )}

                    {currentItem.illustrationType === "writing" && (
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl shadow-xl border-2 border-amber-400 mx-auto">👨‍🏫</span>
                          <span className="absolute bottom-[-5px] right-[5px] text-xl">✒️</span>
                        </div>
                        <span className="block text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">डॉ. भीमराव अंबेडकर</span>
                        <h4 className="text-sm font-black text-white leading-relaxed">60 से अधिक देशों के श्रेष्ठ नियमों की पुस्तक</h4>
                      </div>
                    )}

                    {currentItem.illustrationType === "document" && (
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="w-20 h-24 bg-gradient-to-b from-amber-600 to-amber-700 rounded-lg shadow-2xl border-4 border-yellow-400 p-2 text-center text-white flex flex-col justify-center gap-1.5 mx-auto">
                            <span className="text-[7px] font-black tracking-widest uppercase block bg-blue-900/40 rounded py-0.5">सत्यमेव जयते</span>
                            <span className="text-[10px] font-black tracking-tight leading-none block">भारत का संविधान</span>
                            <div className="w-4 h-4 rounded-full border border-yellow-250 mx-auto mt-0.5 flex items-center justify-center text-[7px]">🇮🇳</div>
                          </div>
                          <span className="absolute bottom-[-10px] right-[25%] text-2xl animate-bounce">✍️</span>
                        </div>
                        <span className="block text-[10px] leading-relaxed font-bold text-slate-300">284 सदस्यों का हस्ताक्षर क्षण</span>
                      </div>
                    )}

                    {currentItem.illustrationType === "flag" && (
                      <div className="space-y-4">
                        <div className="flex flex-col w-24 h-12 border border-slate-700 shadow-xl rounded-md overflow-hidden mx-auto transform rotate-6">
                          <div className="h-1/3 bg-orange-500"></div>
                          <div className="h-1/3 bg-white flex justify-center items-center relative">
                            <div className="w-3.5 h-3.5 rounded-full border border-blue-900 flex justify-center items-center">
                              <span className="text-[6px] text-blue-900">⚙️</span>
                            </div>
                          </div>
                          <div className="h-1/3 bg-emerald-600"></div>
                        </div>
                        <div className="text-xs font-black text-emerald-400 animate-pulse">26 जनवरी: गणतंत्र दिवस! ⭐️</div>
                        <span className="block text-[10px] text-slate-400">भारतीय तोपखाना सलामी</span>
                      </div>
                    )}

                    {currentItem.illustrationType === "calligrapher" && (
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl shadow-xl border-2 border-indigo-400 mx-auto">✍️</span>
                          <span className="absolute top-[-5px] right-2 text-xl animate-pulse">✒️</span>
                        </div>
                        <span className="block text-[11px] bg-slate-750 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full font-bold">प्रेम बिहारी रायजादा</span>
                        <h4 className="text-xs font-black text-white px-2">हाथ से सुंदर अक्षरों में रचा इतिहास</h4>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Side: Narrative Details */}
              <div className="lg:col-span-8 flex flex-col min-h-[300px] justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 bg-orange-500 text-white text-xs font-black rounded-xl uppercase tracking-wider">
                      {currentItem.year === "बोनस" ? "💡 रोचक गाथा" : `गौरव वर्ष - ${currentItem.year}`}
                    </span>

                    {/* Speech buttons */}
                    <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                      <button
                        onClick={handleToggleVoice}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          voiceEnabled ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
                        }`}
                        title={voiceEnabled ? "वॉइसओवर ऑफ करें" : "कमेंट्री (ऑडियो) चालू करें"}
                      >
                        {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                      <span className="text-[10px] text-slate-350 pr-2 font-bold hidden sm:inline">
                        {voiceEnabled ? "🗣️ कमेंट्री शुरू है" : "ऑडियो बंद"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-200 to-green-400 leading-tight">
                    {currentItem.title}
                  </h3>
                  
                  <p className="text-xs md:text-sm font-black text-slate-300 leading-relaxed italic border-l-3 border-orange-500 pl-3">
                    "{currentItem.description}"
                  </p>

                  <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed bg-slate-800/60 p-4 rounded-2xl border border-slate-750 shadow-inner">
                    {currentItem.detail}
                  </p>
                </div>

                {/* Simulated Movie / Progress Controls */}
                <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  
                  {/* Play Buttons Bar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1 px-3 shadow Transition-colors ${
                        isPlaying
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-orange-500 hover:bg-orange-400 text-white"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                      <span>{isPlaying ? "सिनेमा रोकें (Pause)" : "🎬 सिनेमा चलाएं (Play Mode)"}</span>
                    </button>

                    <span className="text-[10px] text-slate-405 font-medium shrink-0">
                      {isPlaying ? "ऑटो-प्ले मोड जारी है (8s)" : "खुद अपनी गति से पढ़ें"}
                    </span>
                  </div>

                  {/* Slider Manual overrides */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handlePrev}
                      disabled={selectedIndex === 0}
                      className="p-2 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                      title="पिछला कदम"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={selectedIndex === HISTORICAL_MILESTONES.length - 1}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 text-white font-black text-xs rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1"
                    >
                      <span>अगला कदम</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ticker Progress loading bar for Cinema Mode */}
                {isPlaying && (
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Fact note block */}
          <div className="bg-amber-50 border-3 border-dashed border-amber-300 p-5 rounded-3xl flex gap-3 items-start">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <h5 className="text-amber-950 font-black text-xs">क्या आप जानते हैं? (Amazing Fact Check):</h5>
              <p className="text-[11px] text-amber-900 leading-relaxed font-bold mt-1">
                हमारे संविधान की मूल हिंदी तथा अंग्रेजी हस्ताक्षरित प्रतियों को नष्ट होने से बचाने के लिए संसद भवन के पुस्तकालय भवन में **हीलियम गैस (Helium Gas)** के विशेष पारदर्शी डिब्बे में बंद कर रखा गया है, ताकि यह अनमोल धरोहर कई पीढ़ियों तक सुरक्षित रहे!
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "figures" && (
        <div className="space-y-8">
          <div className="text-center md:text-left max-w-xl">
            <h3 className="text-xl font-black text-indigo-950">संविधान सभा के महानायक</h3>
            <p className="text-xs text-slate-500 font-bold mt-1">
              आइए बात करते हैं हमारे संविधान निर्माण की प्रेरक ताकतों से, जिन्होंने अपने ज्ञान से भारत की दिशा बदली!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HISTORIC_FIGURES.map((fig) => (
              <motion.div
                key={fig.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white border-4 border-slate-150 rounded-[35px] p-6 shadow-xl flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                {/* Profile Character Icon */}
                <div className="w-20 h-20 rounded-[28px] bg-indigo-50 border-3 border-indigo-200 flex-shrink-0 flex items-center justify-center text-4xl shadow-inner md:mx-auto">
                  {fig.avatar}
                </div>

                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block bg-indigo-50 px-2.5 py-1 border border-indigo-150 rounded-xl w-fit">
                      {fig.role}
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-1">{fig.name}</h4>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    {fig.desc}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-2xl border text-xs text-slate-700 italic font-semibold relative">
                    <span className="text-indigo-400 font-serif text-3xl absolute top-[-5px] left-2">“</span>
                    <p className="pl-6 font-medium">"{fig.quote}"</p>
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold">
                    🛡️ विशिष्ट बुद्धिमत्ता: <strong className="text-slate-700 font-black">{fig.superpower}</strong>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Inspirational Note */}
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-3xl flex gap-3 items-center">
            <span className="text-xl">👩‍⚖️</span>
            <p className="text-[11px] text-indigo-900 font-black leading-relaxed">
              * संविधान बनाने में कुल 15 महिला सदस्य भी शामिल थीं, जिन्होंने समानता तथा वयस्क मताधिकार को पक्का करने के लिए अपने उत्कृष्ट तर्क संसद में पेश किए थे।
            </p>
          </div>
        </div>
      )}

      {activeTab === "puzzle" && (
        <div className="bg-slate-50 p-6 md:p-8 border-4 border-slate-200 rounded-[40px] max-w-xl mx-auto space-y-6 shadow-xl">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-300 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-sm">
              ✨
            </div>
            <h3 className="text-xl font-black text-emerald-950">ऐतिहासिक पहेली (Historic Spot Quiz)</h3>
            <p className="text-xs text-slate-505 font-bold text-slate-500">
              देखें आपने इतिहास की रंगीन झांकियों से क्या-क्या सीखा है!
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] bg-slate-900 text-white font-black px-2.5 py-1 rounded-xl">
                पहेली 0{puzzleIndex + 1} / 0{SPOT_PUZZLES.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                सफलता दर: {solvedPuzzles.filter(Boolean).length} हल
              </span>
            </div>

            <h4 className="text-sm md:text-base font-black text-slate-800 leading-snug">
              {SPOT_PUZZLES[puzzleIndex].question}
            </h4>

            <div className="space-y-3">
              {SPOT_PUZZLES[puzzleIndex].options.map((opt, idx) => {
                const isSelected = selectedPuzzleOpt === idx;
                const isCorrect = idx === SPOT_PUZZLES[puzzleIndex].correctIdx;

                let style = "border-slate-150 hover:bg-slate-50 text-slate-700 bg-white hover:border-slate-550";

                if (revealPuzzle) {
                  if (isCorrect) {
                    style = "border-emerald-500 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-500/10";
                  } else if (isSelected) {
                    style = "border-rose-500 bg-rose-50 text-rose-950 font-black ring-2 ring-rose-500/10";
                  } else {
                    style = "border-slate-100 bg-slate-50 text-slate-350 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={revealPuzzle}
                    onClick={() => handleSolvePuzzle(idx)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs md:text-sm font-bold cursor-pointer transition ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {revealPuzzle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-150 text-xs text-slate-700 leading-relaxed font-semibold transition"
              >
                <strong className="text-emerald-950 font-black block mb-1">💡 पहेली का हल रहस्य:</strong>
                {SPOT_PUZZLES[puzzleIndex].explanation}
                
                <div className="flex justify-end mt-3 border-t pt-2 border-emerald-200">
                  <button
                    onClick={handleNextPuzzle}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-xl cursor-pointer"
                  >
                    {puzzleIndex < SPOT_PUZZLES.length - 1 ? "अगली पहेली ➔" : "शुरुआत से खेलें"}
                  </button>
                </div>
              </motion.div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
