/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { initialCandidates } from "../data";
import { Candidate } from "../types";
import { 
  Fingerprint, 
  Landmark, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Check, 
  User, 
  Plus, 
  Trash2, 
  Sparkles, 
  Volume2, 
  Users,
  Scale,
  TrendingUp,
  Edit,
  Lock,
  Unlock,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Voter {
  id: string;
  name: string;
  age: number;
  symbol: string;
  voted: boolean;
  votedTo?: number;
  pin: string;
}

interface ElectionSectionProps {
  setMascotData: (data: { mood: "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting"; text: string }) => void;
  incrementScore: (points: number) => void;
}

export default function ElectionSection({ setMascotData, incrementScore }: ElectionSectionProps) {
  // Navigation states: card-creation is the voter registration center
  const [step, setStep] = useState<"card-creation" | "booth" | "counting" | "winner">(() => {
    const saved = localStorage.getItem("samvidhan_election_step");
    return (saved as any) || "card-creation";
  });

  // Multi-voter registry
  const [voters, setVoters] = useState<Voter[]>(() => {
    const saved = localStorage.getItem("samvidhan_election_voters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((v: any) => ({
          ...v,
          pin: v.pin || Math.floor(1000 + Math.random() * 9000).toString()
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Active voter at the desk currently entering instructions
  const [activeVoterId, setActiveVoterId] = useState<string | null>(() => {
    return localStorage.getItem("samvidhan_election_active_voter_id") || null;
  });

  // Form states
  const [newVoterName, setNewVoterName] = useState("");
  const [newVoterAge, setNewVoterAge] = useState(12);
  const [newVoterSymbol, setNewVoterSymbol] = useState("⚡");
  const [newVoterPin, setNewVoterPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  // Setup view state and Candidates Editing
  const [setupSubTab, setSetupSubTab] = useState<"voters" | "candidates">("voters");
  const [candidatesLocked, setCandidatesLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem("samvidhan_election_candidates_locked");
    return saved === "true"; // Change from (saved !== "false") to allow unlocked by default
  });

  // Candidate setup form states
  const [newCandName, setNewCandName] = useState("");
  const [newCandParty, setNewCandParty] = useState("");
  const [newCandSymbol, setNewCandSymbol] = useState("💡");
  const [newCandAgenda, setNewCandAgenda] = useState("");

  // EVM Beep, Clearance Popups & PIN validation booth security
  const [showClearSuccessPopup, setShowClearSuccessPopup] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinLockedOut, setPinLockedOut] = useState(false);

  // VVPAT visual-audio states
  const [isVvpatVisible, setIsVvpatVisible] = useState(false);
  const [vvpatVoter, setVvpatVoter] = useState<Voter | null>(null);
  const [vvpatCandidate, setVvpatCandidate] = useState<Candidate | null>(null);
  const [vvpatState, setVvpatState] = useState<"idle" | "printing" | "dropped">("idle");
  const [evmBeepOn, setEvmBeepOn] = useState(false);
  const [votingLocked, setVotingLocked] = useState(false);

  // Candidate options state
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem("samvidhan_election_candidates");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialCandidates.map(c => ({ ...c, votes: 0 }));
  });

  // Live Counting states
  const [countingStep, setCountingStep] = useState<"ready" | "active" | "completed">("ready");
  const [countingIndex, setCountingIndex] = useState(-1);
  const [classroomTally, setClassroomTally] = useState<Record<number, number>>({});
  const [autoCounting, setAutoCounting] = useState(false);
  const [simulatedSchoolVotes, setSimulatedSchoolVotes] = useState<Record<number, number>>({});
  const [includeSchoolSimulation, setIncludeSchoolSimulation] = useState(false);

  // Analytics states
  const [swingVotes, setSwingVotes] = useState<number>(0);

  // Sync state with storage
  useEffect(() => {
    localStorage.setItem("samvidhan_election_step", step);
    localStorage.setItem("samvidhan_election_voters", JSON.stringify(voters));
    localStorage.setItem("samvidhan_election_candidates", JSON.stringify(candidates));
    localStorage.setItem("samvidhan_election_candidates_locked", candidatesLocked ? "true" : "false");
    if (activeVoterId) {
      localStorage.setItem("samvidhan_election_active_voter_id", activeVoterId);
    } else {
      localStorage.removeItem("samvidhan_election_active_voter_id");
    }
    if (step === "winner") {
      localStorage.setItem("samvidhan_election_completed", "true");
    }
  }, [step, voters, candidates, activeVoterId, candidatesLocked]);

  // Sync mascot advice
  useEffect(() => {
    if (step === "card-creation") {
      if (voters.length === 0) {
        setMascotData({
          mood: "happy",
          text: "चलो दोस्तों, आज पूरे स्कूल या अपनी कक्षा के लिए बाल चुनाव का आयोजन करते हैं! सबसे पहले 'मतदाता पंजीयन' (Voter Registration) करें। नीचे अपने दोस्तों के नाम भरकर वोटर कार्ड बनाएं।"
        });
      } else {
        setMascotData({
          mood: "excited",
          text: `बढ़िया! हमारे पास ${voters.length} पंजीकृत बाल नागरिक हैं। आप और नाम भी जोड़ सकते हैं! जब सभी दोस्त तैयार हों, तब 'मतदान बूथ' (EVM Booth) में प्रवेश करें।`
        });
      }
    } else if (step === "booth") {
      if (!activeVoterId) {
        setMascotData({
          mood: "thinking",
          text: "मतदान केंद्र तैयार है! बाईं ओर से उस छात्र का चुनाव करें जो अभी मतदान कक्ष (Voting Compartment) में वोट डालने आ रहा है।"
        });
      } else {
        const activeVoter = voters.find(v => v.id === activeVoterId);
        setMascotData({
          mood: "speaking",
          text: `पंखे चालू, बत्तियाँ चालू! ${activeVoter?.name} अब चुपके से मतदान घेरे में हैं। ईवीएम मशीन पर अपने पसंदीदा प्रत्याशी के नीले बटन को दबाएं और वीवीपीएटी पर्ची देखें!`
        });
      }
    } else if (step === "counting") {
      setMascotData({
        mood: "excited",
        text: "शानदार! सभी बच्चों के मत पेटियों में बंद हो चुके हैं। आइए मतगणना केंद्र पर चलें और एक-एक पर्ची की जाँच करके लाइव परिणाम घोषित करें!"
      });
    } else if (step === "winner") {
      const liveWinner = getWinner();
      setMascotData({
        mood: "proud",
        text: `अद्भुत लोकतांत्रिक उत्सव! परिणाम आ गया है - '${liveWinner.party}' के '${liveWinner.name}' को जनता ने अपना बाल प्रधानमंत्री चुना है! बधाई!`
      });
    }
  }, [step, voters.length, activeVoterId, setMascotData]);

  // Sound generator
  const playSoundAtFrequency = (freq: number, duration: number, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration - 0.05);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  // Indian EVM Beep (950Hz steady pitch for 0.7s)
  const playEvmBeep = () => {
    playSoundAtFrequency(950, 0.7, "sine");
  };

  // VVPAT Paper slide and cutting sound (triangle frequency ramp)
  const playPaperCut = () => {
    playSoundAtFrequency(180, 0.25, "triangle");
  };

  const playClickTick = () => {
    playSoundAtFrequency(1200, 0.08, "sine");
  };

  // Quick setup with 4 default mock classmates
  const addDefaultClassmates = () => {
    const defaults: Voter[] = [
      { id: "BAL-IND-12-7011", name: "रोहन शर्मा", age: 12, symbol: "⚡", voted: false, pin: "1111" },
      { id: "BAL-IND-13-4392", name: "प्रिया पटेल", age: 13, symbol: "🍎", voted: false, pin: "2222" },
      { id: "BAL-IND-12-1825", name: "अंजलि गुप्ता", age: 12, symbol: "🎨", voted: false, pin: "3333" },
      { id: "BAL-IND-11-9404", name: "आदित्य वर्मा", age: 11, symbol: "🔥", voted: false, pin: "4444" }
    ];

    setVoters(prev => {
      const existingNames = prev.map(v => v.name.trim());
      const nonDupes = defaults.filter(d => !existingNames.includes(d.name.trim()));
      const mappedNonDupes = nonDupes.map(d => ({
        ...d,
        pin: d.pin || Math.floor(1000 + Math.random() * 9000).toString()
      }));
      return [...prev, ...mappedNonDupes];
    });

    incrementScore(5);
    playSoundAtFrequency(600, 0.15);
  };

  // Add custom registered student
  const registerStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoterName.trim()) return;

    // Duplication guard
    const isDup = voters.some(v => v.name.trim().toLowerCase() === newVoterName.trim().toLowerCase());
    if (isDup) {
      alert("इस नाम का विद्यार्थी पहले से पंजीकृत है!");
      return;
    }

    const pinToAssign = newVoterPin.trim() || Math.floor(1000 + Math.random() * 9000).toString();
    if (pinToAssign.length !== 4 || /\D/.test(pinToAssign)) {
      alert("पिन कोड केवल ४ अंकों का होना चाहिए!");
      return;
    }

    const randId = `BAL-IND-${newVoterAge}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVoter: Voter = {
      id: randId,
      name: newVoterName.trim(),
      age: newVoterAge,
      symbol: newVoterSymbol,
      voted: false,
      pin: pinToAssign
    };

    setVoters(prev => [...prev, newVoter]);
    setNewVoterName("");
    setNewVoterPin(Math.floor(1000 + Math.random() * 9000).toString());
    incrementScore(10);
    playSoundAtFrequency(750, 0.12);
  };

  const removeVoter = (id: string) => {
    setVoters(prev => prev.filter(v => v.id !== id));
    if (activeVoterId === id) setActiveVoterId(null);
    playSoundAtFrequency(300, 0.1);
  };

  // Select active voter at booth
  const startClassmateVoting = (id: string) => {
    const voter = voters.find(v => v.id === id);
    if (!voter || voter.voted) return;

    setActiveVoterId(id);
    setVvpatState("idle");
    setVvpatCandidate(null);
    setVvpatVoter(null);
    setIsVvpatVisible(false);
    
    // Safety PIN state resets
    setEnteredPin("");
    setPinAttempts(0);
    setPinVerified(false);
    setPinLockedOut(false);

    playSoundAtFrequency(800, 0.1);
  };

  // Cast vote on physical model EVM
  const handleEvmVote = (candId: number) => {
    if (votingLocked || !activeVoterId) return;

    const voter = voters.find(v => v.id === activeVoterId);
    const candidate = candidates.find(c => c.id === candId);
    if (!voter || !candidate) return;

    setVotingLocked(true);
    setEvmBeepOn(true);
    playEvmBeep();

    setVvpatVoter(voter);
    setVvpatCandidate(candidate);
    setIsVvpatVisible(true);
    setVvpatState("printing");

    // Hold EVM button led and blink red
    setTimeout(() => {
      setEvmBeepOn(false);
    }, 700);

    // VVPAT Paper Verification State Machine
    // 1. Prints slip (stays in viewport for 3.5s so student can check)
    // 2. Paper drops to the ballot cage below
    setTimeout(() => {
      playPaperCut();
      setVvpatState("dropped");
    }, 3800);

    setTimeout(() => {
      // Commit vote
      setVoters(prev => prev.map(v => {
        if (v.id === activeVoterId) {
          return { ...v, voted: true, votedTo: candId };
        }
        return v;
      }));

      setCandidates(prev => prev.map(c => {
        if (c.id === candId) {
          return { ...c, votes: c.votes + 1 };
        }
        return c;
      }));

      // Release booth desk
      setActiveVoterId(null);
      setVvpatState("idle");
      setVvpatCandidate(null);
      setVvpatVoter(null);
      setIsVvpatVisible(false);
      setVotingLocked(false);
      incrementScore(15);
    }, 5000);
  };

  // Helpers to check participation metrics
  const totalVotedCount = useMemo(() => voters.filter(v => v.voted).length, [voters]);
  const isReadyToCount = useMemo(() => totalVotedCount > 0, [totalVotedCount]);

  // Initiate Live Counting Setup
  const prepareCountingCenter = () => {
    setStep("counting");
    setCountingStep("ready");
    setCountingIndex(-1);
    
    // Set up zeroed classroom tally
    const initialTally: Record<number, number> = {};
    candidates.forEach(c => {
      initialTally[c.id] = 0;
    });
    setClassroomTally(initialTally);

    // Generate simulated other-sections background votes to scale results up realistically
    const simulated: Record<number, number> = {};
    candidates.forEach(c => {
      // 10 to 30 simulated votes for each party to represent school's general consensus
      simulated[c.id] = Math.floor(10 + Math.random() * 20);
    });
    setSimulatedSchoolVotes(simulated);
  };

  // Move step in counting
  const advanceCountingOneByOne = useCallback(() => {
    const votedVoters = voters.filter(v => v.voted);
    if (countingIndex >= votedVoters.length - 1) {
      // Counting completed
      setCountingStep("completed");
      setAutoCounting(false);
      
      // Update the candidates final votes based on selection
      setCandidates(prev => prev.map(cand => {
        const classScore = classroomTally[cand.id] || 0;
        const schoolScore = includeSchoolSimulation ? (simulatedSchoolVotes[cand.id] || 0) : 0;
        return {
          ...cand,
          votes: classScore + schoolScore
        };
      }));
      return;
    }

    const nextIndex = countingIndex + 1;
    setCountingIndex(nextIndex);
    const voteItem = votedVoters[nextIndex];
    if (voteItem && voteItem.votedTo !== undefined) {
      setClassroomTally(prev => ({
        ...prev,
        [voteItem.votedTo!]: (prev[voteItem.votedTo!] || 0) + 1
      }));
      playClickTick();
    }
  }, [countingIndex, voters, classroomTally, candidates, includeSchoolSimulation, simulatedSchoolVotes]);

  // Toggle Auto-counting cycle
  useEffect(() => {
    let timer: any;
    if (autoCounting && countingStep === "active") {
      timer = setInterval(() => {
        const votedVoters = voters.filter(v => v.voted);
        if (countingIndex < votedVoters.length - 1) {
          advanceCountingOneByOne();
        } else {
          // Finish
          advanceCountingOneByOne();
        }
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [autoCounting, countingStep, countingIndex, voters, advanceCountingOneByOne]);

  const startCountingShow = () => {
    setCountingStep("active");
    setAutoCounting(true);
    advanceCountingOneByOne();
  };

  const getWinner = (): Candidate => {
    return [...candidates].sort((a, b) => b.votes - a.votes)[0];
  };

  const getVoteTurnoutPercentage = () => {
    if (voters.length === 0) return 0;
    return Math.round((totalVotedCount / voters.length) * 100);
  };

  // Full reset wipes everything
  const resetEntireElectionSystem = () => {
    setVoters([]);
    setActiveVoterId(null);
    setCandidates(initialCandidates.map(c => ({ ...c, votes: 0 })));
    setStep("card-creation");
    setCountingStep("ready");
    setCountingIndex(-1);
    setClassroomTally({});
    setSwingVotes(0);
    
    // Clear Local Storage
    localStorage.removeItem("samvidhan_election_step");
    localStorage.removeItem("samvidhan_election_voters");
    localStorage.removeItem("samvidhan_election_candidates");
    localStorage.removeItem("samvidhan_election_active_voter_id");
    localStorage.removeItem("samvidhan_election_completed");
    playSoundAtFrequency(400, 0.3);
  };

  // Round reset (keep students but erase their voted flags so they can repoll!)
  const resetRepollOnly = () => {
    setVoters(prev => prev.map(v => ({ ...v, voted: false, votedTo: undefined })));
    setActiveVoterId(null);
    setCandidates(initialCandidates.map(c => ({ ...c, votes: 0 })));
    setStep("card-creation");
    setCountingStep("ready");
    setCountingIndex(-1);
    setClassroomTally({});
    setSwingVotes(0);
    localStorage.removeItem("samvidhan_election_completed");
    playSoundAtFrequency(550, 0.2);
  };

  const currentVotedVoters = useMemo(() => voters.filter(v => v.voted), [voters]);
  const activeVoterObj = useMemo(() => voters.find(v => v.id === activeVoterId), [voters, activeVoterId]);

  return (
    <div id="election-section" className="space-y-6">

      {/* EVM MEMORY CLEARED CONFIRMATION POPUP */}
      <AnimatePresence>
        {showClearSuccessPopup && (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-emerald-500 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center select-none"
            >
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                ✅
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-black text-slate-800 text-base">मशीन एकदम तैयार! 🏛️</h4>
                <p className="text-xs text-slate-500 font-bold leading-normal">
                  सारे पुराने रिकॉर्ड डिलीट हो चुके हैं और मशीन नए सिरे से शुरू करने के लिए बिल्कुल तैयार है! 🚀
                </p>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/55 text-center text-[10px] text-emerald-800 font-bold whitespace-normal leading-normal">
                🔐 आपके पंजीकृत वोटरों के गुप्त पिन कोड सुरक्षित एवं यथावत हैं। आप चाहें तो नया नामांकन शुरू कर नया चुनाव आयोजित कर सकते हैं!
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowClearSuccessPopup(false);
                  playClickTick();
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow cursor-pointer transition"
              >
                नया चुनाव आरंभ करें 🏁
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            🗳️ सामूहिक बाल चुनाव उत्सव (Classroom Multi-Voter Election)
          </h2>
          <p className="text-xs text-slate-500 font-bold tracking-wide">
            लोकसभा मतदान सिमुलेशन (अनुच्छेद ३२६): साथी दोस्तों को जोड़ें, ईवीएम बटन दबाएं, वीवीपीएटी जांचें और मतगणना करें!
          </p>
        </div>

        <button
          onClick={resetEntireElectionSystem}
          className="px-3.5 py-1.5 self-start bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 font-black rounded-xl text-[11px] flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>नया चुनाव सेटअप शुरू करें</span>
        </button>
      </div>

      {/* PIPELINE PROGRESS INDICATOR */}
      <div className="grid grid-cols-4 bg-slate-100 border border-slate-200 p-1.5 rounded-2xl text-center text-[10px] md:text-xs font-black text-slate-500 gap-1 select-none">
        <span className={`py-2 rounded-xl transition ${step === "card-creation" ? "bg-orange-500 text-white shadow-sm" : ""}`}>
          १. वोटर रजिस्ट्रेशन
        </span>
        <span className={`py-2 rounded-xl transition ${step === "booth" ? "bg-blue-600 text-white shadow-sm" : ""}`}>
          २. मतदान ईवीएम कक्ष
        </span>
        <span className={`py-2 rounded-xl transition ${step === "counting" ? "bg-amber-500 text-white shadow-sm" : ""}`}>
          ३. लाइव मतगणना
        </span>
        <span className={`py-2 rounded-xl transition ${step === "winner" ? "bg-emerald-600 text-white shadow-sm" : ""}`}>
          ४. विजयी पीएम उत्सव
        </span>
      </div>

      {/* RENDER DYNAMIC STEPS */}
      <div className="bg-[#fafbf9] border-4 border-slate-200 rounded-[35px] p-5 md:p-8 shadow-xl min-h-[460px] flex flex-col justify-between">
        
        {/* ================= STEP 1: CARD CREATION OFFICE ================= */}
        {step === "card-creation" && (
          <div className="space-y-6">
            
            {/* SETUP STEP DYNAMIC SUB-TABS */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSetupSubTab("voters");
                  playClickTick();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  setupSubTab === "voters"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Users className="w-4 h-4 text-orange-500" />
                <span>१. मतदाता पंजीयन कार्यालय ({voters.length} पंजीकृत)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSetupSubTab("candidates");
                  playClickTick();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  setupSubTab === "candidates"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>२. प्रत्याशी (उम्मीदवार) नामांकन ({candidates.length} मैदान में)</span>
              </button>
            </div>

            {setupSubTab === "voters" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form Input Desk */}
                <form onSubmit={registerStudent} className="lg:col-span-6 space-y-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-1 border-b pb-2">
                    ✍️ नए बाल मतदाता का पंजीयन (Voter Registry Form)
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 block">छात्र / छात्रा का नाम:</label>
                    <input
                      type="text"
                      required
                      value={newVoterName}
                      onChange={(e) => setNewVoterName(e.target.value)}
                      placeholder="जैसे: कबीर, पूजा, अमित..."
                      maxLength={14}
                      className="w-full text-xs font-bold p-3 border-2 border-slate-300 rounded-xl bg-white focus:border-orange-500 focus:outline-none placeholder-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 block">उम्र (वर्ष):</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={17}
                      value={newVoterAge}
                      onChange={(e) => setNewVoterAge(parseInt(e.target.value) || 12)}
                      className="w-full text-xs font-bold p-3 border-2 border-slate-300 rounded-xl bg-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-400 block">गुप्त ४-अंकीय पिन कोड (EVM Authentication PIN):</label>
                    <input
                      type="text"
                      required
                      value={newVoterPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setNewVoterPin(val);
                      }}
                      placeholder="जैसे: 1234, 9876"
                      className="w-full text-xs font-mono font-black p-3 border-2 border-slate-300 rounded-xl bg-white focus:border-orange-500 focus:outline-none"
                    />
                    <p className="text-[9px] text-[#ca8a04] bg-[#fef08a]/20 p-2 rounded-lg border border-[#fef08a]/30 font-bold leading-normal">
                      🛡️ <strong>आपका पिन कोड:</strong> वह गुप्त कोड है जिसे डाल कर ही ईवीएम मशीन चालू होगी। इस पिन को नोट कर लें, मतदान के समय इसी की आवश्यकता होगी।
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 block">पसंदीदा सुरक्षा कार्ड स्टीकर:</label>
                    <div className="flex gap-2">
                      {["⚡", "🍎", "🔥", "🍭", "🎨", "🌟"].map((sym) => (
                        <button
                          type="button"
                          key={sym}
                          onClick={() => setNewVoterSymbol(sym)}
                          className={`w-10 h-10 border rounded-xl font-black flex items-center justify-center text-lg transition duration-75 cursor-pointer ${
                            newVoterSymbol === sym ? "bg-orange-100 border-orange-400 scale-105" : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-650 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>पंजीकृत करें</span>
                    </button>

                    <button
                      type="button"
                      onClick={addDefaultClassmates}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      ⚡ ४ दोस्त एक साथ जोड़ें
                    </button>
                  </div>
                </form>

                {/* Registered Voters Roll Dashboard */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      📋 पंजीकृत बाल मतदाता सूची ({voters.length})
                    </h3>
                    {voters.length > 0 && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                        रजिस्ट्रेशन सक्रिय
                      </span>
                    )}
                  </div>

                  {voters.length === 0 ? (
                    <div className="h-64 border-3 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center text-center p-6 text-slate-400 bg-white shadow-inner font-sans">
                      <Users className="w-12 h-12 text-slate-350 block mb-2 animate-bounce" />
                      <strong className="text-sm text-slate-500 font-black">अभी कोई बच्चा पंजीकृत नहीं है!</strong>
                      <p className="text-xs text-slate-400 max-w-xs mt-1 leading-normal font-bold">
                        कक्षा के विद्यार्थियों को जोड़ने के लिए बायीं ओर फॉर्म भरें या तुरंत शुरुआत के लिए <strong>'४ दोस्त एक साथ जोड़ें'</strong> पर क्लिक करें।
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 font-sans">
                      {voters.map((voter) => (
                        <div
                          key={voter.id}
                          className="bg-white border-2 border-slate-200 p-3 rounded-2xl flex items-center justify-between shadow-sm relative hover:border-slate-350 transition duration-75"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                              {voter.symbol}
                            </span>
                            <div className="leading-tight">
                              <h4 className="font-extrabold text-xs text-slate-800">{voter.name}</h4>
                              <span className="text-[9px] text-slate-400 block font-bold">{voter.id.split("-").slice(-2).join("-")}</span>
                              <span className="text-[9px] text-slate-500 block font-bold">उम्र: {voter.age} वर्ष</span>
                              <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100 font-black px-1.5 py-0.5 rounded-md mt-1 block w-fit font-mono">
                                🔐 पिन: {voter.pin}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeVoter(voter.id)}
                            className="p-1 px-1.5 text-slate-300 hover:text-red-500 transition cursor-pointer font-bold rounded hover:bg-rose-50"
                            title="सूची से हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* NOMINATIONS OFFICE SCREEN */
              <div className="space-y-6 animate-fadeIn">
                
                {/* Independent Candidate Dashboard Header and control bar */}
                <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white rounded-[24px] p-5 shadow-lg border-2 border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                        <Settings className="w-5 h-5 text-indigo-300" />
                      </span>
                      <h3 className="text-sm font-black tracking-wide font-sans md:text-base">
                        🏛️ प्रत्याशी (उम्मीदवार) नामांकन डैशबोर्ड
                      </h3>
                    </div>
                    <p className="text-[10px] text-slate-300 font-bold max-w-xl">
                      यहाँ आप आगामी मतदान के लिए चुनाव लड़ रहे सभी विद्यार्थियों का नामांकन कर सकते हैं, उनके नाम, चुनाव चिन्ह, और घोषणापत्र को बदल सकते हैं।
                    </p>
                  </div>

                  {/* Dashboard Action Lock / Unlock Controls */}
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block font-sans">
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">डैशबोर्ड स्थिति:</span>
                      {candidatesLocked ? (
                        <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          🔒 सुरक्षित एवं लॉक है
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-black flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          🔓 संपादन हेतु खुला है
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (candidatesLocked) {
                          const confirmEdit = window.confirm("⚠️ क्या आप निश्चित रूप से प्रत्याशी डैशबोर्ड को अनलॉक करना चाहते हैं? अनलॉक करने से वर्तमान पड़े हुए मत (यदि कोई हों) मिट जाएंगे और वोटिंग रोक दी जाएगी।");
                          if (confirmEdit) {
                            setCandidatesLocked(false);
                            setCandidates(prev => prev.map(c => ({ ...c, votes: 0 })));
                            setVoters(prev => prev.map(v => ({ ...v, voted: false, votedTo: undefined })));
                            setClassroomTally({});
                            playSoundAtFrequency(450, 0.15);
                          }
                        } else {
                          if (candidates.length < 2) {
                            alert("निष्पक्ष चुनाव के लिए चुनाव मैदान में कम से कम २ प्रत्याशी होना अनिवार्य है!");
                            return;
                          }
                          setCandidatesLocked(true);
                          playSoundAtFrequency(750, 0.15);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-[10px] md:text-xs font-black shadow-md transition-all border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        candidatesLocked
                          ? "bg-slate-900 border-indigo-500 text-indigo-200 hover:bg-slate-950 hover:text-white"
                          : "bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                      }`}
                    >
                      {candidatesLocked ? (
                        <>
                          <Unlock className="w-4 h-4 text-amber-400" />
                          <span>डैशबोर्ड अनलॉक करें (Edit/Add)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-white" />
                          <span>डैशबोर्ड सुरक्षित लॉक करें</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Nomination / Add Registration Form */}
                  <div className="lg:col-span-6 space-y-4">
                    {candidatesLocked ? (
                      <div className="bg-gradient-to-b from-emerald-50/55 to-emerald-50/20 border-2 border-emerald-200/80 rounded-[28px] p-6 text-center space-y-4 shadow-sm animate-fadeIn">
                        <div className="w-16 h-16 bg-white border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner animate-pulse">
                          🔒
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <h4 className="font-extrabold text-sm text-slate-800">प्रत्याशी सूची सफलतापूर्वक लॉक है</h4>
                          <p className="text-xs text-slate-500 leading-normal font-bold">
                            मतदान प्रक्रिया को सुरक्षित और धांधली-मुक्त बनाने के लिए, संपादन अथवा नया प्रत्याशी जोड़ना अभी बंद किया गया है।
                          </p>
                        </div>
                        <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100 text-left text-[11px] font-bold text-emerald-800 leading-relaxed max-w-sm mx-auto">
                          📝 <strong>यदि आप निम्नलिखित कार्य करना चाहते हैं:</strong>
                          <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600 font-bold">
                            <li>प्रत्याशी के नाम में सुधार करना</li>
                            <li>किसी उम्मीदवार को मैदान से हटाना (Delete)</li>
                            <li>उनका चुनाव चिन्ह (Emoji Symbol) बदलना</li>
                            <li>एजेंडा या पार्टी के नाम में परिवर्तन करना</li>
                          </ul>
                          <p className="mt-2 text-indigo-700">तो कृपया ऊपर उपलब्ध <strong>"डैशबोर्ड अनलॉक करें"</strong> बटन पर क्लिक करें।</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 bg-white border-2 border-slate-200 p-5 rounded-[28px] shadow-sm animate-fadeIn relative font-sans">
                        <div className="border-b pb-3 flex items-center justify-between">
                          <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-indigo-600" />
                            <span>नया प्रत्याशी नामांकन पर्चा</span>
                          </h4>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-full">पंजीकरण फॉर्म</span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 block">प्रत्याशी का पूरा नाम (Candidate Name):</label>
                          <input
                            type="text"
                            value={newCandName}
                            onChange={(e) => setNewCandName(e.target.value)}
                            placeholder="जैसे: राहुल कुमार, सौम्या शर्मा, राघव वर्मा..."
                            className="w-full text-xs font-bold p-3 border-2 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 block">राजनीतिक दल / पार्टी का नाम (Party):</label>
                          <input
                            type="text"
                            value={newCandParty}
                            onChange={(e) => setNewCandParty(e.target.value)}
                            placeholder="जैसे: बाल एकता दल, डिजिटल क्रांति संघ, ज्ञान सेवा पार्टी..."
                            className="w-full text-xs font-bold p-3 border-2 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 block">प्रत्याशी चुनाव चिन्ह चुनें (Emoji Symbol):</label>
                          <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            {["💡", "📱", "🚀", "🎨", "🎸", "🦖", "🌻", "🦁", "🎒", "🍪", "🏆", "✏️", "⏰", "🚁", "🦊"].map((em) => (
                              <button
                                type="button"
                                key={em}
                                onClick={() => setNewCandSymbol(em)}
                                className={`h-10 border rounded-xl font-black text-lg flex items-center justify-center transition dynamic-touch-target cursor-pointer ${
                                  newCandSymbol === em 
                                    ? "bg-indigo-600 border-indigo-600 text-white scale-105 shadow-md shadow-indigo-500/10" 
                                    : "bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700"
                                }`}
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 block">चुनाव घोषणापत्र / देशव्यापी एजेंडा (Manifesto Agenda):</label>
                          <textarea
                            rows={3}
                            value={newCandAgenda}
                            onChange={(e) => setNewCandAgenda(e.target.value)}
                            placeholder="जैसे: हमारे दल के जीतने पर हर शनिवार नो-बैग डे रहेगा, क्लास में नए कॉमिक्स बुक्स और खेल सामग्री लाई जाएगी!"
                            className="w-full text-xs font-bold p-3 border-2 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none resize-none transition-all"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!newCandName.trim() || !newCandParty.trim()) {
                              alert("कृपया प्रत्याशी का नाम और पार्टी का नाम अवश्य भरें!");
                              return;
                            }
                            const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
                            
                            // Color spectrum maps
                            const colorHeuristics = [
                              "from-purple-200 to-purple-100 border-purple-400 text-purple-800 focus:ring-purple-400",
                              "from-pink-200 to-pink-100 border-pink-400 text-pink-800 focus:ring-pink-400",
                              "from-orange-200 to-orange-100 border-orange-400 text-orange-800 focus:ring-orange-400",
                              "from-teal-200 to-teal-100 border-teal-400 text-teal-800 focus:ring-teal-400",
                              "from-rose-200 to-rose-100 border-rose-400 text-rose-800 focus:ring-rose-400 font-sans"
                            ];
                            const randomColor = colorHeuristics[newId % colorHeuristics.length];

                            const newlyNominated: Candidate = {
                              id: newId,
                              name: newCandName.trim(),
                              party: newCandParty.trim(),
                              symbol: newCandSymbol,
                              agenda: newCandAgenda.trim() || "कक्षा में एकता, अनुशासन और नए शैक्षणिक सुधार लाना!",
                              color: randomColor,
                              votes: 0
                            };

                            setCandidates(prev => [...prev, newlyNominated]);
                            setNewCandName("");
                            setNewCandParty("");
                            setNewCandAgenda("");
                            playSoundAtFrequency(650, 0.15);
                            incrementScore(10);
                          }}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>प्रत्याशी सूची में नामांकित करें</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Listed Candidates with Interactive Editing controls */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="border-b pb-2 flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        📋 चुनावी अखाड़े में पंजीकृत उम्मीदवार ({candidates.length})
                      </h3>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">मतपत्र क्रम</span>
                    </div>

                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2">
                      {candidates.length === 0 ? (
                        <div className="bg-slate-50 p-8 text-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 space-y-2">
                          <span className="text-4xl block">📣</span>
                          <strong className="text-slate-600 text-xs block font-bold">मैदान खाली है! कोई प्रत्याशी नामांकित नहीं है।</strong>
                          <p className="text-[10px] leading-normal">कृपया बायीं ओर बने नामांकन फॉर्म का उपयोग कर पहला उम्मीदवार दर्ज करें।</p>
                        </div>
                      ) : (
                        candidates.map((cand) => (
                          <div
                            key={cand.id}
                            className={`bg-white border-2 rounded-[24px] p-4 flex flex-col justify-between shadow-sm relative hover:shadow-md transition-all gap-3 ${
                              candidatesLocked ? "border-slate-200/90 hover:border-slate-300" : "border-indigo-150 hover:border-indigo-300 bg-indigo-50/5"
                            }`}
                          >
                            {/* Card Content Core Block */}
                            <div className="space-y-3">
                              
                              {/* Header & Delete Button */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 w-full">
                                  {/* Symbol Showcase with interactive picking if unlocked */}
                                  {candidatesLocked ? (
                                    <span className="text-2xl w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                                      {cand.symbol}
                                    </span>
                                  ) : (
                                    <div className="relative group">
                                      {/* Clickable symbol change block */}
                                      <select
                                        value={cand.symbol}
                                        onChange={(e) => {
                                          setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, symbol: e.target.value } : c));
                                          playSoundAtFrequency(520, 0.1);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        title="चिन्ह बदलें"
                                      >
                                        {["💡", "📱", "🚀", "🎨", "🎸", "🦖", "🌻", "🦁", "🎒", "🍪", "🏆", "✏️", "⏰", "🚁", "🦊", "🤝", "⚡", "🌟", "📚", "🎈"].map((sym) => (
                                          <option key={sym} value={sym}>{sym}</option>
                                        ))}
                                      </select>
                                      <div className="text-2xl w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-200 group-hover:bg-indigo-100 flex items-center justify-center shadow-xs cursor-pointer relative">
                                        <span>{cand.symbol}</span>
                                        <span className="absolute bottom-0 right-0 bg-indigo-600 text-[8px] text-white p-0.5 rounded font-black leading-none scale-90">🔄</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex-1">
                                    {candidatesLocked ? (
                                      <div className="space-y-0.5 font-sans">
                                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                                          <span>{cand.name}</span>
                                          <span className="bg-emerald-150 text-emerald-800 text-[8px] py-0.5 px-1.5 rounded-md font-black">✓ सत्यापित</span>
                                        </h4>
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-extrabold block w-fit">
                                          पार्टी: {cand.party}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5 w-full font-sans">
                                        <div>
                                          <span className="text-[9px] font-black text-slate-400 block uppercase">उम्मीदवार का नाम (Edit):</span>
                                          <input
                                            type="text"
                                            value={cand.name}
                                            onChange={(e) => {
                                              setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, name: e.target.value } : c));
                                            }}
                                            className="text-xs font-black p-2 border-2 border-indigo-100 focus:border-indigo-500 rounded-xl w-full bg-slate-50 focus:bg-white transition-all font-sans"
                                            placeholder="उम्मीदवार का नाम दर्ज करें"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-[9px] font-black text-slate-400 block uppercase font-sans">पार्टी का नाम (Edit):</span>
                                          <input
                                            type="text"
                                            value={cand.party}
                                            onChange={(e) => {
                                              setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, party: e.target.value } : c));
                                            }}
                                            className="text-[10px] font-bold p-2 border-2 border-indigo-100 focus:border-indigo-500 rounded-xl w-full bg-slate-50 focus:bg-white transition-all font-sans"
                                            placeholder="राजनीतिक पार्टी"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Danger delete button for candidates when unlocked */}
                                {!candidatesLocked && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (candidates.length <= 2) {
                                        alert("सुरक्षित लोकतंत्र हेतु: चुनाव मैदान में कम से कम २ विज्ञापित प्रत्याशी होना अनिवार्य है!");
                                        return;
                                      }
                                      const confirmDelete = window.confirm(`क्या आप सचमुच ${cand.name} का नामांकन रद्द कर इन्हें सूची से हटाना चाहते हैं?`);
                                      if (confirmDelete) {
                                        setCandidates(prev => prev.filter(c => c.id !== cand.id));
                                        playSoundAtFrequency(300, 0.12);
                                      }
                                    }}
                                    className="p-2 text-rose-500 hover:text-white hover:bg-rose-600 border border-transparent hover:border-rose-700 rounded-xl transition duration-75 text-center flex items-center justify-center cursor-pointer ml-2 self-start filter drop-shadow-xs"
                                    title="प्रत्याशी हटाएं"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              {/* Manifesto Panel */}
                              <div className="bg-slate-50/75 p-3 rounded-2xl border border-slate-200/55 leading-relaxed font-sans text-[11px]">
                                <strong className="text-slate-400 block uppercase tracking-wider mb-1 font-extrabold text-[8px]" style={{ fontSize: '10px' }}>
                                  📢 चुनावी घोषणापत्र (Manifesto & Agenda):
                                </strong>
                                {candidatesLocked ? (
                                  <p className="text-slate-600 font-bold italic">"{cand.agenda}"</p>
                                ) : (
                                  <div className="space-y-1">
                                    <textarea
                                      rows={2}
                                      value={cand.agenda}
                                      onChange={(e) => {
                                        setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, agenda: e.target.value } : c));
                                      }}
                                      className="w-full text-[10px] font-bold bg-white p-2 border-2 border-indigo-100 focus:border-indigo-500 rounded-xl resize-none font-sans"
                                      placeholder="एजेंडा या घोषणापत्र लिखें..."
                                    />
                                    <p className="text-[9px] text-slate-400 font-bold">विद्यार्थियों को लुभाने के लिए यहाँ अपनी योजनाएं लिखें।</p>
                                  </div>
                                )}
                              </div>

                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Action footer to step 2 */}
            <div className="pt-6 border-t flex justify-between items-center bg-white/50 p-4 rounded-2xl mt-4">
              <div className="text-xs text-slate-500 font-bold">
                🚩 {voters.length > 0 ? `मस्त! आपके पास ${voters.length} बाल वोटर तथा ${candidates.length} उम्मीदवार उपलब्ध हैं।` : "मतदान के लिए न्यूनतम १ मतदाता आवश्यक है।"}
              </div>
              <button
                disabled={voters.length === 0 || candidates.length < 2 || !candidatesLocked}
                onClick={() => setStep("booth")}
                className={`px-6 py-3 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 ${
                  (voters.length > 0 && candidates.length >= 2 && candidatesLocked)
                  ? "bg-blue-600 hover:bg-slate-800 text-white" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border"
                }`}
                title={!candidatesLocked ? "कृपया उम्मीदवार नामांकनों को पहले लॉक (सत्यापित) करें।" : ""}
              >
                <span>वोटिंग पोलिंग बूथ (EVM) में जाएँ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PHYSICAL EVM & VVPAT BOOTH ================= */}
        {step === "booth" && (
          <div className="space-y-6">
            
            {/* Header statistics info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 border border-blue-100 p-4 rounded-2xl gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Fingerprint className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs text-blue-900 font-extrabold uppercase tracking-wide">
                    कक्षा मतदान लाइव कवरेज (Polling Station)
                  </h4>
                  <p className="text-[10px] text-blue-600 font-bold">
                    कुल मतदाता: {voters.length} | मतदान पूर्ण: {totalVotedCount} | अनुपस्थित: {voters.length - totalVotedCount}
                  </p>
                </div>
              </div>

              {/* Clear records button & progress wrapper */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const confirmDeletion = window.confirm("⚠️ क्या आप निश्चित रूप से वर्तमान वोटिंग मशीन के सभी पुराने रिकॉर्ड डिलीट करना चाहते हैं? इससे सभी पंजीकृत मतदाताओं की वोट डालने की स्थिति रीसेट हो जाएगी और वोट डिलीट हो जाएंगे।");
                    if (confirmDeletion) {
                      // Reset voters voted status
                      setVoters(prev => prev.map(v => ({ ...v, voted: false, votedTo: undefined })));
                      // Reset candidates vote counts to zero
                      setCandidates(prev => prev.map(c => ({ ...c, votes: 0 })));
                      // Reset tally counts
                      setClassroomTally({});
                      // Active states reset
                      setActiveVoterId(null);
                      setEnteredPin("");
                      setPinVerified(false);
                      setPinAttempts(0);
                      setPinLockedOut(false);
                      setStep("card-creation");

                      // Remove step specific variables
                      localStorage.removeItem("samvidhan_election_completed");

                      // Play sound of clearing
                      playSoundAtFrequency(250, 0.4, "sawtooth");

                      // Show popup success
                      setShowClearSuccessPopup(true);
                    }
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-[10px] rounded-xl flex items-center gap-1 cursor-pointer shadow-xs transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>ईवीएम मशीन क्लियर करें</span>
                </button>

                <div className="w-full sm:w-40 min-w-[120px]">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>वोटिंग प्रगति</span>
                    <span>{getVoteTurnoutPercentage()}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500" 
                      style={{ width: `${getVoteTurnoutPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Desk Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Selector Panel */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-sm font-black text-slate-700 tracking-wider uppercase border-b pb-1.5 flex items-center gap-1">
                  👥 मतदाता डेस्क (Voter Verification)
                </h3>

                <p className="text-[11px] text-slate-500 font-bold leading-normal">
                  ईवीएम बूथ की गोपनीयता बनाए रखें। एक-एक करके बच्चे डेस्क पर आकर अपना वेरिफिकेशन कराएं:
                </p>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {voters.map((voter) => {
                    const isSelected = activeVoterId === voter.id;
                    return (
                      <div
                        key={voter.id}
                        onClick={() => !voter.voted && startClassmateVoting(voter.id)}
                        className={`p-3 border-2 rounded-2xl flex items-center justify-between transition cursor-pointer select-none ${
                          voter.voted
                            ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200 scale-[1.02] shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl w-8 h-8 rounded-lg bg-slate-50 border flex items-center justify-center">
                            {voter.symbol}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800">{voter.name}</h4>
                            <span className="text-[9px] text-slate-400 block font-bold">
                              {voter.age} वर्ष | {voter.id.split("-").pop()}
                            </span>
                          </div>
                        </div>

                        {voter.voted ? (
                          <span className="text-[10px] bg-green-150 text-green-700 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                            वोटेड
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                            सक्रिय
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-black border border-slate-350 px-2.5 py-0.5 rounded-full">
                            वोट दें
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Return button or Finish polling */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveVoterId(null);
                      setStep("card-creation");
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-black text-[10px] rounded-xl cursor-pointer"
                  >
                    ⬅️ मतदाता पंजीयन सूची में वापस जाएं
                  </button>
                </div>
              </div>

              {/* Right: The lifelike EVM Machine & VVPAT Compartment */}
              <div className="lg:col-span-8 flex flex-col justify-center">
                
                {activeVoterId && activeVoterObj ? (
                  !pinVerified ? (
                    /* Secure Voter Verification PIN authentication portal */
                    <div className="bg-white border-2 border-slate-200 rounded-[24px] p-6 max-w-sm mx-auto w-full shadow-lg space-y-4 font-sans animate-fadeIn">
                      <div className="text-center space-y-1">
                        <span className="text-2xl block animate-pulse">🔐</span>
                        <h4 className="font-extrabold text-sm text-slate-800">मतदाता पहचान एवं पिन सुरक्षा जाँच</h4>
                        <p className="text-[10px] text-slate-500 font-bold leading-normal">
                          सुरक्षित ईवीएम कक्ष में आगे बढ़ते समय <strong>{activeVoterObj.name}</strong> को अपना ४-अंकीय गुप्त पिन डालना होगा।
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 block text-center uppercase tracking-wider">वोटर पिन कोड दर्ज करें:</label>
                        <div className="flex justify-center">
                          <input
                            type="password"
                            maxLength={4}
                            value={enteredPin}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setEnteredPin(val);
                            }}
                            className="bg-slate-50 p-3 text-center border-2 border-slate-350 focus:border-blue-500 font-mono text-lg font-black tracking-[1em] w-36 rounded-xl focus:outline-none"
                            placeholder="••••"
                          />
                        </div>
                      </div>

                      {pinAttempts > 0 && !pinLockedOut && (
                        <p className="text-red-600 text-[10px] bg-red-50 text-center py-1.5 px-3 rounded-lg border border-red-150 font-bold animate-shake">
                          ⚠️ गलत पिन कोड! कोशिश: {pinAttempts} / २. यदि अगली बार गलत हुआ, तो आप इस बार वोट नहीं डाल पाएंगे!
                        </p>
                      )}

                      {pinLockedOut ? (
                        <div className="text-center text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 font-bold text-xs space-y-2">
                          <p>❌ २ गलत प्रयास! आपका मतदाता कार्ड सुरक्षा कारणों से अस्थायी रूप से लॉक हो गया है!</p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVoterId(null);
                              setPinAttempts(0);
                              setPinLockedOut(false);
                              setEnteredPin("");
                            }}
                            className="text-[10px] px-3 py-1.5 bg-red-600 hover:bg-stone-800 text-white rounded-lg transition"
                          >
                            वापस जाएँ (Go Back)
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVoterId(null);
                              setPinAttempts(0);
                              setEnteredPin("");
                            }}
                            className="flex-1 py-2 border border-slate-200 text-slate-500 font-extrabold text-[11px] rounded-xl hover:bg-slate-50"
                          >
                            रद्द करें
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (enteredPin.trim() === activeVoterObj.pin) {
                                setPinVerified(true);
                                setPinAttempts(0);
                                playClickTick();
                              } else {
                                const nextAttempts = pinAttempts + 1;
                                setPinAttempts(nextAttempts);
                                setEnteredPin("");
                                playSoundAtFrequency(350, 0.2);
                                if (nextAttempts >= 2) {
                                  setPinLockedOut(true);
                                }
                              }
                            }}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-755 text-white bg-blue-600 font-extrabold text-[11px] rounded-xl cursor-pointer"
                          >
                            सत्यापित करें 🔐
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fadeIn">
                    
                    {/* The 3D Molded Indian EVM */}
                    <div className="md:col-span-7 bg-[#dfdfd6] p-3 rounded-2xl shadow-2xl border-4 border-[#b5b5ae] relative">
                      
                      {/* Realistic bevel highlights */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40 rounded-t-lg"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/15 rounded-b-lg"></div>

                      {/* Control Panel Area on top */}
                      <div className="bg-[#2a2c2b] rounded-xl p-3 mb-4 text-white font-mono flex items-center justify-between shadow-inner border border-stone-600 select-none">
                        <div>
                          <h4 className="text-[9px] font-black tracking-widest text-slate-300">
                            EVM BALLOT UNIT MK-III
                          </h4>
                          <span className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase block mt-1 font-sans w-fit">
                            मतदाता: <strong className="text-white text-[9px] font-bold">{activeVoterObj.name}</strong>
                          </span>
                        </div>

                        {/* EVM indicator LEDs */}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-[7px] font-sans font-black text-slate-400 uppercase tracking-wider mb-1">मशीन तैयार</span>
                            <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-stone-700 flex items-center justify-center shadow-inner">
                              <span className={`w-3.5 h-3.5 rounded-full ${!votingLocked ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-emerald-950"} transition-all block duration-300`}></span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-[7px] font-sans font-black text-slate-400 uppercase tracking-wider mb-1">बीप / बीजी</span>
                            <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-stone-700 flex items-center justify-center shadow-inner">
                              <span className={`w-3.5 h-3.5 rounded-full ${evmBeepOn ? "bg-red-500 animate-ping shadow-lg shadow-red-500/50" : "bg-red-950"} transition-all block duration-150`}></span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* EVM Sheet of Candidate Rows */}
                      <div className="bg-white rounded-lg p-2 space-y-2 border border-[#cbcbc2] shadow-sm select-none">
                        {candidates.map((cand) => {
                          const isPressed = votingLocked;
                          return (
                            <div
                              key={cand.id}
                              className="border border-slate-300 bg-slate-50 shadow-xs rounded-lg p-1.5 flex items-center justify-between"
                            >
                              {/* Left Serial info column */}
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-slate-800 text-white font-mono font-black text-[10px] flex items-center justify-center">
                                  {cand.id}
                                </span>
                                
                                {/* Realistic white card template for Candidate */}
                                <div className="bg-white border-2 border-slate-200 px-2 py-0.5 rounded leading-none w-24">
                                  <strong className="text-[10px] text-slate-800 block truncate font-sans font-black">
                                    {cand.name}
                                  </strong>
                                  <span className="text-[8px] text-slate-400 font-bold block truncate">
                                    {cand.party}
                                  </span>
                                </div>
                              </div>

                              {/* Candidate Symbol */}
                              <div className="text-xl w-9 h-8 bg-white border border-slate-300 flex items-center justify-center rounded-md font-extrabold shadow-inner mr-2">
                                {cand.symbol}
                              </div>

                              {/* Divider spacer groove */}
                              <div className="w-1.5 h-8 bg-[#b5b5ae] border-l border-r border-[#696965]/40 rounded-sm"></div>

                              {/* EVM LED Light & Blue Switch */}
                              <div className="flex items-center gap-2.5 pl-2">
                                
                                {/* LED column indicator */}
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full border-2 transition-all duration-150 ${
                                      evmBeepOn && vvpatCandidate?.id === cand.id
                                        ? "bg-red-500 shadow-md shadow-red-500/50 scale-105"
                                        : "bg-red-950/20 border-transparent"
                                    }`}
                                  ></div>
                                </div>

                                {/* Physical-looking Blue Switch */}
                                <button
                                  disabled={isPressed}
                                  onClick={() => handleEvmVote(cand.id)}
                                  className={`w-10 h-10 rounded border-2 transition-all active:scale-90 hover:scale-95 shadow cursor-pointer flex-shrink-0 ${
                                    isPressed
                                      ? "bg-slate-30 border-slate-400 cursor-not-allowed bg-slate-300"
                                      : "bg-blue-600 border-blue-400 shadow-md active:border-b shadow-blue-500/20 hover:bg-blue-700"
                                  }`}
                                  title="वोट बटन"
                                ></button>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* VVPAT Machine and Voter Identification showcase */}
                    <div className="md:col-span-5 space-y-4">
                      
                      {/* VVPAT BOX MODEL */}
                      <div className="bg-[#475569] border-4 border-slate-500 rounded-2xl p-3 shadow-xl relative overflow-hidden text-white select-none">
                        
                        {/* Title of VVPAT */}
                        <div className="border-b border-slate-500/50 pb-2 flex justify-between items-center bg-slate-800 -mx-3 -mt-3 px-3 py-1.5 text-[8px] font-black uppercase text-slate-300 select-none">
                          <span>VVPAT SYSTEM MK-II</span>
                          <span className="text-orange-400 animate-pulse font-sans">सत्यापन केंद्र</span>
                        </div>

                        {/* Translucent check window */}
                        <div className="bg-[#1e293b] h-48 rounded-xl border-3 border-slate-900 p-2 relative flex flex-col items-center justify-center shadow-inner overflow-hidden my-3">
                          
                          {/* Inner glowing window led lamp */}
                          <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${isVvpatVisible ? "bg-amber-400 shadow-md" : "bg-slate-800"}`}></div>

                          <AnimatePresence>
                            {isVvpatVisible && vvpatCandidate && vvpatVoter && (
                              <motion.div
                                initial={{ y: -160, opacity: 0.8 }}
                                animate={{ y: vvpatState === "dropped" ? 170 : 0, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 70, damping: 15 }}
                                className="w-full max-w-44 bg-white text-slate-800 p-2.5 rounded-lg border-2 border-stone-200 shadow-lg text-[9px] font-mono leading-tight relative font-semibold pointer-events-none"
                              >
                                {/* Mini punch lines */}
                                <div className="text-center font-bold text-slate-500 border-b border-dashed border-slate-300 pb-1 mb-1 font-sans">
                                  🗳️ बाल मतदान पर्ची (VVPAT)
                                </div>
                                <div className="space-y-1 font-sans font-bold">
                                  <p className="flex justify-between">
                                    <span className="text-slate-400">वोटर:</span>
                                    <strong className="text-slate-800">{vvpatVoter.name}</strong>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-slate-400">बैलट सं.:</span>
                                    <strong>#{vvpatCandidate.id}</strong>
                                  </p>
                                  <p className="flex justify-between border-t pt-1 border-dashed">
                                    <span className="text-slate-400">प्रत्याशी:</span>
                                    <strong className="text-blue-700">{vvpatCandidate.name}</strong>
                                  </p>
                                  <p className="flex justify-between pb-1 border-b border-dashed">
                                    <span className="text-slate-400">दला:</span>
                                    <strong>{vvpatCandidate.party}</strong>
                                  </p>
                                  <div className="text-center text-lg mt-1 block">
                                    {vvpatCandidate.symbol}
                                  </div>
                                </div>
                                <div className="text-center text-[7px] text-emerald-600 bg-emerald-50 rounded border border-emerald-200 pt-0.5 mt-1 block font-sans">
                                  🔒 वोट सुरक्षित व सत्यापित
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!isVvpatVisible && (
                            <div className="text-center p-3 text-slate-500 font-sans">
                              <span className="text-2xl opacity-20 block mb-1">🖨️</span>
                              <strong className="text-[10px] font-black block">काठ-शीक्षा पर्ची विंडो</strong>
                              <p className="text-[8px] mt-1 leading-normal">
                                ईवीएम पर वोट डलते ही उम्मीदवार का विवरण पर्ची में ३.५ सेकंड के लिए प्रकट होगा ताकि आप अपना वोट स्वयं सत्यापित कर सकें।
                              </p>
                            </div>
                          )}

                          {isVvpatVisible && vvpatState === "dropped" && (
                            <div className="text-center text-[10px] text-emerald-400 animate-pulse font-sans">
                              📖 पर्ची बक्से में गिरी! (सत्यता प्रमाणित)
                            </div>
                          )}

                        </div>

                        {/* Status detail panel */}
                        <div className="text-[9px] text-slate-300 font-sans">
                          🎯 <strong>वीवीपीएटी (VVPAT):</strong> चुनाव की सुदृढ़ता के लिए सुप्रीम कोर्ट के निर्देशानुसार भारतीय वोट प्रणालियों में इसका प्रयोग होता है।
                        </div>
                      </div>

                    </div>
                  </div>
                )) : (
                  <div className="h-64 border-3 border-dashed border-slate-300 rounded-[28px] bg-slate-50/50 flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none shadow-inner border border-stone-200">
                    <span className="text-4xl block animate-bounce mb-2">🗳️</span>
                    <strong className="text-slate-700 font-black text-sm">मतदान कक्ष में कोई सक्रिय विद्यार्थी नहीं है!</strong>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 font-semibold leading-normal">
                      बाईं ओर की मतदाता सूची से उस विद्यार्थी के नाम पर क्लिक करें जो मतदान केंद्र की ईवीएम मशीन पर अपना वोट दर्ज करना चाहता है।
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Voting finish block */}
            <div className="pt-6 border-t flex justify-between items-center bg-white/50 p-4 rounded-2xl">
              <div className="text-xs text-slate-500 font-bold">
                🔒 कुल <strong>{totalVotedCount} / {voters.length}</strong> बच्चों ने अपने मत दर्ज कर दिए हैं।
              </div>
              <button
                disabled={!isReadyToCount}
                onClick={prepareCountingCenter}
                className={`px-6 py-3 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 ${
                  isReadyToCount 
                  ? "bg-amber-600 hover:bg-slate-900 text-white animate-pulse" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border"
                }`}
              >
                <span>वोटिंग समाप्त करें व लाइव मतगणना पर जाएँ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 3: VOTE COUNTING STAGE ================= */}
        {step === "counting" && (
          <div className="space-y-6">
            
            {/* Stage introduction */}
            <div className="text-center font-sans max-w-lg mx-auto space-y-2">
              <span className="px-3.5 py-1 bg-amber-100 text-[#ca8a04] border border-[#fef08a] rounded-full text-[11px] font-black uppercase inline-block">
                🔒 लाइव मतगणना कार्यालय (Vote Counting Center)
              </span>
              <h3 className="text-xl font-black text-slate-800">
                लोक सभा चुनाव बाल मत-पंजिका गणना
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-normal">
                सभी मत पेटियाँ सील्ड आ गई हैं! हम मतदान परिणाम पारदर्शिता से घोषित करने के लिए कक्षा के मतों को लाइव एक-एक करके गिनेंगे।
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Controls and counting visualizer */}
              <div className="lg:col-span-4 bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-1">
                  ⚡ मतगणना गियर कंट्रोल्स
                </h4>

                <div className="bg-white border rounded-xl p-3 space-y-3 font-sans shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>कुल जमा कक्षा पर्चियां:</span>
                    <strong className="text-amber-600">{currentVotedVoters.length}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>वर्तमान गिनी गई पर्ची:</span>
                    <strong className="text-slate-700">
                      {countingIndex === -1 ? "शुरू नहीं" : countingIndex + 1} / {currentVotedVoters.length}
                    </strong>
                  </div>
                </div>

                {/* Option to include other school-sections */}
                <div className="bg-white border p-3.5 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeSchoolSimulation}
                      onChange={(e) => {
                        setIncludeSchoolSimulation(e.target.checked);
                        playClickTick();
                      }}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <span className="text-xs font-black text-slate-700 leading-normal">
                      कक्षा के साथ पूरे स्कूल के पूरक वोट भी जोड़ें (Simulated Base)
                    </span>
                  </label>
                  <p className="text-[9px] text-slate-400 font-bold leading-normal">
                    💡 पूरे स्कूल को शामिल करने से बड़े पैमाने पर लोकतंत्र का भव्य चित्र बनता है और चुनाव परिणाम रोमांचक होते हैं!
                  </p>
                </div>

                {/* Progress triggers */}
                {countingStep === "ready" && (
                  <button
                    onClick={startCountingShow}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-650 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer text-center block"
                  >
                    🔴 लाइव मतगणना चक्र शुरू करें
                  </button>
                )}

                {countingStep === "active" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={advanceCountingOneByOne}
                        disabled={countingIndex >= currentVotedVoters.length - 1}
                        className={`flex-1 py-2.5 font-bold text-[10px] rounded-lg tracking-wide shadow-sm cursor-pointer border ${
                          countingIndex < currentVotedVoters.length - 1 
                          ? "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800" 
                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        🗳️ अगली पर्ची खोलें ➔
                      </button>

                      <button
                        onClick={() => {
                          setAutoCounting(!autoCounting);
                          playClickTick();
                        }}
                        className={`py-2.5 px-3.5 font-black text-[10px] rounded-lg shadow-sm cursor-pointer ${
                          autoCounting 
                          ? "bg-red-500 text-white hover:bg-red-650" 
                          : "bg-slate-800 text-white hover:bg-slate-900"
                        }`}
                      >
                        {autoCounting ? "⏸️ रोकें" : "▶️ ऑटो चलाएं"}
                      </button>
                    </div>

                    {countingIndex >= currentVotedVoters.length - 1 && (
                      <button
                        onClick={() => {
                          setCountingStep("completed");
                          incrementScore(25);
                          // Ensure results compiled
                          setCandidates(prev => prev.map(cand => {
                            const classScore = classroomTally[cand.id] || 0;
                            const schoolScore = includeSchoolSimulation ? (simulatedSchoolVotes[cand.id] || 0) : 0;
                            return {
                              ...cand,
                              votes: classScore + schoolScore
                            };
                          }));
                        }}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-lg shadow animate-pulse"
                      >
                        🎯 मतगणना लॉक करें व परिणाम शीट तैयार करें
                      </button>
                    )}
                  </div>
                )}

                {countingStep === "completed" && (
                  <button
                    onClick={() => setStep("winner")}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-lg transition animate-bounce cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>🏆 विजयी प्रधानमंत्री की घोषणा देखें! ➔</span>
                  </button>
                )}

              </div>

              {/* Live tally sheets display */}
              <div className="lg:col-span-8 bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-5">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">
                  📊 लाइव इलेक्शन स्कोर बोर्ड (Live Vote Count Status)
                </span>

                {/* Progress bar graph displaying live results */}
                <div className="space-y-4">
                  {candidates.map((cand) => {
                    // Show exact breakdown of Class votes + optional school votes
                    const classVotes = classroomTally[cand.id] || 0;
                    const schVotes = includeSchoolSimulation ? (simulatedSchoolVotes[cand.id] || 0) : 0;
                    const totals = classVotes + schVotes;

                    // Limit width percentage gracefully
                    const maxPossibleScore = currentVotedVoters.length + (includeSchoolSimulation ? 35 : 0);
                    const widthPct = maxPossibleScore > 0 ? Math.min(Math.round((totals / maxPossibleScore) * 100), 100) : 0;

                    return (
                      <div key={cand.id} className="space-y-1 font-sans">
                        <div className="flex justify-between items-end text-xs font-extrabold text-slate-700">
                          <span className="flex items-center gap-1.5 leading-none">
                            <span className="text-lg">{cand.symbol}</span>
                            <span>{cand.name} ({cand.party})</span>
                          </span>
                          <span className="flex gap-1.5 text-[10px] text-slate-500 leading-none">
                            <span>कक्षा: <strong className="text-slate-800">{classVotes}</strong></span>
                            {includeSchoolSimulation && (
                              <span>+ स्कूल: <strong className="text-slate-800">{schVotes}</strong></span>
                            )}
                            <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-black text-xs">
                              कुल: {totals}
                            </span>
                          </span>
                        </div>

                        {/* Animated progress track bar */}
                        <div className="w-full h-5 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 flex relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPct}%` }}
                            transition={{ type: "spring", stiffness: 45 }}
                            className="bg-amber-400 h-full rounded-r-lg relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Voter card checking ticker animation */}
                <div className="bg-amber-50/50 rounded-xl p-3 border-2 border-dashed border-amber-200 text-center text-xs font-semibold text-slate-600 min-h-16 flex items-center justify-center">
                  {countingIndex === -1 ? (
                    <p className="font-bold text-amber-800 leading-normal">
                      🚦 तैयार! मत-पेटियों की लाइव गिनती शुरू करने के लिए बाएँ और 'लाइव मतगणना शुरू करें' बटन दबाएं।
                    </p>
                  ) : (
                    <div className="space-y-1 text-center font-sans">
                      <p className="text-slate-400 text-[10px] tracking-wide block uppercase font-bold">सक्रिय गणना पर्ची</p>
                      <p className="text-amber-900 font-extrabold text-xs">
                        🎟️ मत संख्या #{countingIndex + 1}: बालक/बालिका <strong>'{voters.filter(v => v.voted)[countingIndex]?.name}'</strong> का मत सत्यापित...
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold block bg-white border border-amber-100 p-1 rounded-md w-fit mx-auto">
                        प्राप्त परिणाम: {candidates.find(c => c.id === voters.filter(v => v.voted)[countingIndex]?.votedTo)?.symbol} {candidates.find(c => c.id === voters.filter(v => v.voted)[countingIndex]?.votedTo)?.name} ({candidates.find(c => c.id === voters.filter(v => v.voted)[countingIndex]?.votedTo)?.party}) के लिए!
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= STEP 4: CELEBRATION RESULT OUTCOME ================= */}
        {step === "winner" && (
          <div className="space-y-6">
            
            {/* Celebration title frame */}
            {(() => {
              const mainWinner = getWinner();
              return (
                <div className="space-y-6">
                  <div className="text-center bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 text-white p-6 rounded-[35px] shadow-2xl relative overflow-hidden space-y-4 border-b-8 border-green-800">
                    
                    {/* Floating confetti animations */}
                    <div className="absolute inset-0 pointer-events-none select-none opacity-20 flex flex-wrap gap-12 font-bold rotate-12">
                      <span className="text-2xl animate-bounce">🎉</span>
                      <span className="text-2xl">✨</span>
                      <span className="text-xl">🏆</span>
                      <span className="text-2xl animate-pulse">🌟</span>
                      <span className="text-3xl">🏛️</span>
                      <span className="text-xl">🗳️</span>
                    </div>

                    <span className="text-5xl block animate-bounce" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}>🏆</span>
                    <span className="text-[10px] font-black tracking-widest text-[#a7f3d0] uppercase block">
                      लोकसभा बाल चुनाव परिणाम २०२६
                    </span>
                    <h3 className="text-3xl font-black drop-shadow-sm">
                      🎉 '{mainWinner.name}' बने देश के नए बाल प्रधानमंत्री! 🎉
                    </h3>
                    <p className="text-xs text-emerald-100 font-bold max-w-lg mx-auto leading-relaxed">
                      '{mainWinner.party}' को कुल <strong>{mainWinner.votes} वोट</strong> प्राप्त हुए। जनता ने शिक्षा, पर्यावरण या रचनात्मक संकल्पों में से उनके एजेंडा पर सबसे अधिक आस्था और विश्वास जताया है!
                    </p>
                  </div>

                  {/* Winner detailed Agenda Card */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Candidate Identity block */}
                    <div className="md:col-span-5 bg-white border-2 border-slate-200 rounded-3xl p-5 shadow flex flex-col justify-between items-center text-center relative overflow-hidden">
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1 font-black text-[10px] uppercase mb-4 tracking-wider select-none">
                        निर्वाचित पीएम (Elected PM)
                      </div>

                      <span className="text-7xl p-5 bg-slate-50 border-2 rounded-[30px] border-slate-200 select-none block hover:scale-105 duration-150 transition">
                        {mainWinner.symbol}
                      </span>

                      <div className="mt-4 font-sans leading-tight">
                        <h4 className="text-xl font-black text-slate-800">{mainWinner.name}</h4>
                        <span className="text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-0.5 rounded-full inline-block mt-2">
                          {mainWinner.party}
                        </span>
                      </div>

                      <div className="border-t w-full mt-6 pt-3 text-xs font-bold text-slate-500">
                        कुल बटोरे वोट: <span className="text-emerald-600 font-black text-lg">{mainWinner.votes}</span>
                      </div>
                    </div>

                    {/* Winner Action Manifesto list */}
                    <div className="md:col-span-7 bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden border-r-4 border-amber-400">
                      
                      <div className="space-y-3 font-sans">
                        <span className="text-amber-400 font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          बाल संसद का पहला घोषणापत्र (Action Agenda)
                        </span>
                        
                        <h4 className="text-lg font-extrabold">उज्ज्वल व समृद्ध बाल जीवन का संकल्प:</h4>
                        
                        <p className="text-xs text-slate-300 leading-relaxed italic font-medium bg-slate-800/85 p-4 rounded-xl border border-slate-700 border-l-4 border-l-amber-500">
                          "{mainWinner.agenda}"
                        </p>
                      </div>

                      {/* Turnout and awareness indicators */}
                      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800 text-center font-sans">
                        <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">कक्षा मतदान प्रतिशत</span>
                          <strong className="text-emerald-400 text-sm font-black">{getVoteTurnoutPercentage()}%</strong>
                        </div>
                        <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">कुल बाल शक्ति भागीदारी</span>
                          <strong className="text-amber-400 text-sm font-black">अद्वितीय जागरूकता</strong>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* ====== ELECTION ANALYTICS SECTION ====== */}
                  {(() => {
                    const sortedCandidatesByVotes = [...candidates].sort((a, b) => b.votes - a.votes);
                    const winnerCand = sortedCandidatesByVotes[0];
                    const runnerCand = sortedCandidatesByVotes[1] || null;
                    const totalVotesCount = candidates.reduce((sum, c) => sum + c.votes, 0);
                    
                    const actualMargin = runnerCand ? (winnerCand.votes - runnerCand.votes) : 0;
                    const actualMarginPct = totalVotesCount > 0 ? ((actualMargin / totalVotesCount) * 100).toFixed(1) : "0";
                    
                    // Competitiveness analysis
                    let competitivenessLabel = "";
                    let competitivenessDesc = "";
                    let competitivenessColor = "";
                    
                    if (actualMargin === 0) {
                      competitivenessLabel = "अभूतपूर्व टाई (Dead Heat Tie!)";
                      competitivenessDesc = "दोनों प्रत्याशियों को बिल्कुल बराबर मत मिले! यह लोकतंत्र का सबसे रोमांचक क्षण है, जहाँ टॉस या चुनाव अधिकारियों के नियमों से निर्णय होता है।";
                      competitivenessColor = "bg-rose-50 border-rose-250 text-rose-800";
                    } else if (actualMargin === 1) {
                      competitivenessLabel = "ऐतिहासिक न्यूनतम अंतर (Narrowest Possible Gap - 1 Vote!)";
                      competitivenessDesc = "केवल १ वोट की जीत! यह चीख-चीख कर साबित करता है कि लोकतंत्र में एक अकेले मत की ताकत कितनी असीम और निर्णायक होती है।";
                      competitivenessColor = "bg-orange-55 border-orange-200 text-orange-950 text-red-900";
                    } else if (actualMargin <= 3) {
                      competitivenessLabel = "अत्यंत कड़ा मुकाबला (Margin of Under 4 Votes!)";
                      competitivenessDesc = "बेहद करीबी अंतर! जरा सी हवा पलटने से परिणाम बदल सकता था। दोनों उम्मीदवारों में गजब का मुकाबला रहा।";
                      competitivenessColor = "bg-amber-50 border-amber-300 text-amber-950";
                    } else if (parseFloat(actualMarginPct) <= 15) {
                      competitivenessLabel = "प्रतिस्पर्धी संघर्ष (Highly Competitive < 15%)";
                      competitivenessDesc = "मजबूत और तगड़ा मुकाबला! विजेता ने कड़ी मेहनत से जीत हासिल की, और उप-विजेता भी बहुत करीब रहे।";
                      competitivenessColor = "bg-blue-50 border-blue-200 text-blue-950";
                    } else {
                      competitivenessLabel = "स्पष्ट प्रचंड बहुमत (Clear Mandate Landslide!)";
                      competitivenessDesc = "एकतरफा बहुमत! मतदाताओं ने विजेता के एजेंडा पर प्रचंड आस्था जताई है और उन्हें बड़ा जनादेश दिया है।";
                      competitivenessColor = "bg-emerald-50 border-emerald-250 text-emerald-950";
                    }

                    // Simulated votes under the swing votes effect
                    const simWinnerVotes = Math.max(0, winnerCand.votes - swingVotes);
                    const simRunnerVotes = runnerCand ? (runnerCand.votes + swingVotes) : 0;
                    const simMargin = Math.abs(simWinnerVotes - simRunnerVotes);
                    
                    let simOutcomeText = "";
                    let simOutcomeColor = "";
                    if (runnerCand) {
                      if (simWinnerVotes > simRunnerVotes) {
                        simOutcomeText = `'${winnerCand.name}' अभी भी ${simMargin} मतों से आगे रहेंगे।`;
                        simOutcomeColor = "text-slate-700 font-bold";
                      } else if (simWinnerVotes === simRunnerVotes) {
                        simOutcomeText = `मुकाबला बिल्कुल टाई (बराबर: ${simWinnerVotes}-${simRunnerVotes}) हो जाता! 🤝`;
                        simOutcomeColor = "text-amber-800 font-extrabold bg-amber-50 p-2 rounded-xl border border-amber-200 inline-block";
                      } else {
                        simOutcomeText = `पासा पलट जाता! '${runnerCand.name}' ${simMargin} मतों के अंतर से बाल प्रधानमंत्री बन जाते! 👑`;
                        simOutcomeColor = "text-red-800 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200 inline-block text-red-900";
                      }
                    }

                    return (
                      <div className="bg-white border-2 border-slate-200 rounded-[30px] p-6 shadow-sm space-y-6">
                        
                        {/* Title Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                              <Scale className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                📊 मत सांख्यिकी और चुनाव विश्लेषण (Election Analytics Room)
                              </h4>
                              <p className="text-[11px] text-slate-500 font-bold leading-none mt-0.5">
                                चुनावी प्रतिस्पर्धा, जीत का अंतर और लोकतांत्रिक गणित को समझें
                              </p>
                            </div>
                          </div>
                          
                          <span className="self-start sm:self-auto text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-3 py-1 rounded-full flex items-center gap-1 font-sans">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-550" />
                            एनालिटिक्स मॉड्यूल सक्रिय
                          </span>
                        </div>

                        {/* Detailed numbers Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Box 1: Winner & Runner comparison */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                            <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">
                              शीर्ष दोनों प्रत्याशी (Top Two Candidates)
                            </span>
                            
                            <div className="space-y-2 font-sans pt-1">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-705">
                                  <span className="text-lg">{winnerCand.symbol}</span>
                                  <span className="truncate max-w-28 font-extrabold text-slate-900">{winnerCand.name}</span>
                                </span>
                                <span className="text-xs bg-slate-800 text-white font-extrabold px-2 py-0.5 rounded-md min-w-10 text-center">
                                  {winnerCand.votes} मत
                                </span>
                              </div>

                              {runnerCand && (
                                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                    <span className="text-lg">{runnerCand.symbol}</span>
                                    <span className="truncate max-w-28 text-slate-650 font-extrabold">{runnerCand.name} <span className="text-[10px] text-slate-400 font-bold block">(उप-विजेता)</span></span>
                                  </span>
                                  <span className="text-xs bg-slate-500 text-white font-extrabold px-2 py-0.5 rounded-md min-w-10 text-center">
                                    {runnerCand.votes} मत
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Box 2: Victory Margin */}
                          <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                            <span className="text-[10px] text-indigo-650 font-black block uppercase tracking-wider">
                              जीत का वास्तविक अंतर (Margin of Victory)
                            </span>
                            
                            <div className="font-sans leading-none pt-1">
                              <strong className="text-3xl font-black text-indigo-650 block">
                                {actualMargin} मत
                              </strong>
                              <span className="text-xs font-black text-indigo-200 block mt-1.5 text-indigo-800">
                                कुल मतों का <strong>{actualMarginPct}%</strong>
                              </span>
                            </div>
                            
                            <p className="text-[9px] text-indigo-500 font-bold leading-snug">
                              जीत का कम अंतर कड़ी प्रतिस्पर्धा दर्शाता है, जबकि बड़ा अंतर एकतरफा जनादेश है।
                            </p>
                          </div>

                          {/* Box 3: Total Valid Ballots */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                            <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">
                              कक्षा भागीदारी अनुपात (Participation Ratio)
                            </span>
                            
                            <div className="font-sans leading-none pt-1">
                              <strong className="text-3xl font-black text-slate-800 block">
                                {totalVotesCount} मत
                              </strong>
                              <span className="text-xs font-bold text-slate-500 block mt-1.5">
                                वोटिंग टर्नआउट: <strong>{getVoteTurnoutPercentage()}%</strong>
                              </span>
                            </div>
                            
                            <p className="text-[9px] text-slate-400 font-bold leading-snug">
                              विद्यार्थियों ने अपनी बाल सरकार बनाने में सक्रिय रूप से हिस्सेदारी की।
                            </p>
                          </div>

                        </div>

                        {/* COMPETITIVENESS SCALE GRAPH & EDUCATION */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                          
                          {/* Left: Competitiveness Bar Visualizer */}
                          <div className={`lg:col-span-6 border border-2 p-5 rounded-2xl space-y-3 font-sans ${competitivenessColor} flex flex-col justify-center`}>
                            <span className="text-[9px] bg-white/80 shadow-2xs border border-inherit px-2.5 py-0.5 rounded-md text-slate-650 font-black uppercase tracking-wider block w-fit">
                              प्रतिस्पर्धा विश्लेषण (Competition Rating)
                            </span>
                            <h5 className="font-extrabold text-sm flex items-center gap-1.5 leading-none mt-1">
                              <span>🏆</span>
                              <span>{competitivenessLabel}</span>
                            </h5>
                            <p className="text-xs font-bold leading-relaxed opacity-95">
                              {competitivenessDesc}
                            </p>
                          </div>

                          {/* Right: Comparative Gauge Graphic of Top Two */}
                          {runnerCand && (
                            <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-center font-sans">
                              <span className="text-[10px] text-slate-400 font-black block uppercase tracking-widest">
                                प्रथम बनाम द्वितीय मुकाबला (Head-to-Head Ratio)
                              </span>

                              <div className="space-y-1 pt-1">
                                <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                                  <span>{winnerCand.name} ({Math.round(totalVotesCount > 0 ? (winnerCand.votes/totalVotesCount)*100 : 0)}%)</span>
                                  <span>{runnerCand.name} ({Math.round(totalVotesCount > 0 ? (runnerCand.votes/totalVotesCount)*100 : 0)}%)</span>
                                </div>
                                
                                {/* Comparative progress bar split */}
                                {(() => {
                                  const totalTopTwo = winnerCand.votes + runnerCand.votes;
                                  const winnerPercentOfTwo = totalTopTwo > 0 ? Math.round((winnerCand.votes / totalTopTwo) * 100) : 50;
                                  return (
                                    <div className="w-full h-5 bg-slate-200 rounded-lg overflow-hidden flex shadow-inner border border-slate-300">
                                      {winnerPercentOfTwo > 0 && (
                                        <div 
                                          className="h-full bg-emerald-500 transition-all text-[9px] font-black text-white flex items-center justify-center border-r border-white/20"
                                          style={{ width: `${winnerPercentOfTwo}%` }}
                                        >
                                          {winnerCand.symbol} {winnerPercentOfTwo}%
                                        </div>
                                      )}
                                      {(100 - winnerPercentOfTwo) > 0 && (
                                        <div 
                                          className="h-full bg-indigo-500 transition-all text-[9px] font-black text-white flex items-center justify-center"
                                          style={{ width: `${100 - winnerPercentOfTwo}%` }}
                                        >
                                          {100 - winnerPercentOfTwo}% {runnerCand.symbol}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                                <div className="flex justify-between text-[8px] text-slate-400 font-bold pt-1">
                                  <span>{winnerCand.symbol} विजेता ( {winnerCand.votes} मत )</span>
                                  <span>{runnerCand.symbol} प्रतिद्वंद्वी ( {runnerCand.votes} मत )</span>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* INTERACTIVE VOTE SWING SIMULATOR ("What-If?") */}
                        {runnerCand && (
                          <div className="bg-indigo-50/30 border-2 border-indigo-150 rounded-2xl p-5 space-y-3 font-sans">
                            <div className="flex items-start sm:items-center gap-2.5">
                              <span className="text-2xl animate-bounce">🤝</span>
                              <div>
                                <h5 className="font-extrabold text-indigo-950 text-xs tracking-wider uppercase">
                                  परिकल्पनात्मक वोट स्विंग सिम्युलेटर: "क्या होता अगर... ?" (What-If Vote Swing Simulator)
                                </h5>
                                <p className="text-[10px] text-indigo-700 font-bold">
                                  यदि कुछ वोटर अपना मन बदल लेते? नीचे दी गई स्लाइडर को हिलाएँ और देखें कि लोकतंत्र किस प्रकार से एक-एक मत की अहमियत से चलता है!
                                </p>
                              </div>
                            </div>

                            <div className="bg-white border text-center p-4 rounded-2xl shadow-sm space-y-3 border-slate-200">
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-700 gap-2">
                                <span className="flex items-center justify-center gap-1">
                                  <strong>{winnerCand.symbol} {winnerCand.name}</strong> से मत घटाएं
                                </span>
                                <span className="text-xs text-indigo-950 font-black px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200">
                                  स्थानांतरित मत (Swing Amount): <strong>{swingVotes} मत</strong>
                                </span>
                                <span className="flex items-center justify-center gap-1">
                                  <strong>{runnerCand.symbol} {runnerCand.name}</strong> में मत जोड़ें
                                </span>
                              </div>

                              {/* Simple slider control */}
                              <div className="flex items-center gap-4 py-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSwingVotes(prev => Math.max(0, prev - 1));
                                    playClickTick();
                                  }}
                                  className="w-8 h-8 rounded-full border border-indigo-300 hover:bg-slate-100 font-black flex items-center justify-center text-indigo-750 cursor-pointer text-sm"
                                  title="-1 Vote Swing"
                                >
                                  -
                                </button>
                                
                                <input
                                  type="range"
                                  min={0}
                                  max={Math.min(winnerCand.votes, 10)}
                                  value={swingVotes}
                                  onChange={(e) => {
                                    setSwingVotes(parseInt(e.target.value) || 0);
                                    playClickTick();
                                  }}
                                  className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSwingVotes(prev => Math.min(winnerCand.votes, Math.min(prev + 1, 10)));
                                    playClickTick();
                                  }}
                                  className="w-8 h-8 rounded-full border border-indigo-300 hover:bg-slate-100 font-black flex items-center justify-center text-indigo-750 cursor-pointer text-sm"
                                  title="+1 Vote Swing"
                                >
                                  +
                                </button>
                              </div>

                              {/* Interactive Scenario text display */}
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                                  सिम्युलेटेड चुनावी परिणाम (Simulated Outcome)
                                </div>
                                <div className="flex justify-center items-center gap-6 py-1.5">
                                  <div className="text-center">
                                    <span className="text-xs text-slate-500 block font-bold leading-none">{winnerCand.symbol} {winnerCand.name}</span>
                                    <strong className="text-sm font-black text-slate-700">{simWinnerVotes} मत</strong>
                                  </div>
                                  <div className="text-base font-bold text-slate-400">vs</div>
                                  <div className="text-center">
                                    <span className="text-xs text-slate-500 block font-bold leading-none">{runnerCand.symbol} {runnerCand.name}</span>
                                    <strong className="text-sm font-black text-indigo-600">{simRunnerVotes} मत</strong>
                                  </div>
                                </div>
                                <div className={`text-xs mt-1.5 leading-normal ${simOutcomeColor}`}>
                                  {simOutcomeText}
                                </div>
                              </div>

                              {swingVotes > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSwingVotes(0);
                                    playSoundAtFrequency(450, 0.1);
                                  }}
                                  className="text-[10px] block mx-auto underline font-bold mt-1.5 cursor-pointer text-indigo-650 text-indigo-600"
                                >
                                  🔄 वास्तविक परिणाम रिसेट करें (Reset to Actual)
                                </button>
                              )}

                            </div>

                            <p className="text-[10px] text-slate-550 font-bold leading-relaxed bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900">
                              💡 <strong>शैक्षणिक सीख (Educational Takeaway):</strong> लोकतंत्र में कभी-कभी हार-जीत का फैसला बहुत ही कम वोटों के अंतर से तय होता है (जैसे हमारे इस वोटर स्विंग सिम्युलेटर में देखा गया)। इसलिए प्रत्येक नागरिक का यह कर्तव्य है कि वह चुनाव में अनिवार्य रूप से मतदान करे—क्योंकि सच में <strong className="text-amber-950">"आपका एक वोट बहुमूल्य है"!</strong>
                            </p>

                          </div>
                        )}

                      </div>
                    );
                  })()}

                  {/* Constitutional lessons frame */}
                  <div className="bg-amber-50 p-5 border-2 border-amber-200 rounded-3xl font-sans text-xs space-y-2 leading-relaxed text-amber-900">
                    <h4 className="font-extrabold flex items-center gap-1 text-sm text-yellow-950">
                      <Landmark className="w-4 h-4 text-orange-500" />
                      संविधान पाठ: चुनाव क्यों महत्वपूर्ण है? (Why Elections Matter?)
                    </h4>
                    <p className="font-semibold text-slate-700">
                      प्यारे बच्चों! हमारा पावन संविधान सुनिश्चित करता है कि देश को चलाने का दायित्व किसी राजा या धनाढ्य व्यक्ति को जन्म से नहीं मिलता। <strong>अनुच्छेद ३२६</strong> के तहत प्रत्येक भारतीय नागरिक को अपनी पसंद से नेता चुनने के लिए <strong>वयस्क मताधिकार (Universal Adult Suffrage)</strong> मिला है। हम बिना किसी पक्षपात के, गुप्त मतदान के माध्यम से शांतिपूर्ण तरीकों से अपनी सरकार चुनते हैं। इसी उत्तम शक्ति को <strong>लोकतंत्र (Democracy)</strong> कहते हैं।
                    </p>
                  </div>

                  {/* Restart and play options */}
                  <div className="flex flex-wrap gap-4 justify-center pt-2">
                    <button
                      onClick={resetRepollOnly}
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow border border-slate-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>इसी सूची के साथ दोबारा मतदान करें (Repoll Same Kids)</span>
                    </button>

                    <button
                      onClick={resetEntireElectionSystem}
                      className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition border"
                    >
                      <span>नये बाल मतदाता जोड़ें (Full Reset)</span>
                    </button>
                  </div>

                </div>
              );
            })()}

          </div>
        )}

      </div>

    </div>
  );
}
