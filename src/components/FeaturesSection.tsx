/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Scale, Award, Library, Gavel, Heart, Key, Star } from "lucide-react";
import { motion } from "motion/react";

interface FeaturesSectionProps {
  onNavigate: (section: string) => void;
  setMascotData: (data: { mood: "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting"; text: string }) => void;
}

export default function FeaturesSection({ onNavigate, setMascotData }: FeaturesSectionProps) {
  useEffect(() => {
    setMascotData({
      mood: "thinking",
      text: "प्यारे बच्चों! हमारा संविधान केवल नियमों का बंडल नहीं है; इसकी प्रमुख 3 विशेषताएँ हैं जो इसे दुनिया का सबसे अनोखा संविधान बनाती हैं। आइए इनके बारे में जानते हैं!"
    });
    localStorage.setItem("samvidhan_features_viewed", "true");
  }, [setMascotData]);

  const features = [
    {
      id: "rights",
      title: "1. मौलिक अधिकार (Fundamental Rights)",
      english: "Your Rights / आपके अधिकार",
      description: "संविधान ने देश के हर बच्चे और नागरिक को 6 बुनियादी ताकतें दी हैं ताकि कोई उनके साथ बुरा व्यवहार न कर सके।",
      bulletPoints: [
        "पढ़ाई का अधिकार (सब बच्चे स्कूल जाएंगे)",
        "समानता का अधिकार (लड़का-लड़की एक बराबर)",
        "अपनी भाषा और त्यौहार मनाने की पूरी आजादी"
      ],
      color: "border-sky-300 bg-sky-50/50 text-sky-800",
      icon: Scale,
      actionText: "अधिकार सिमुलेशन खेलें ->"
    },
    {
      id: "duties",
      title: "2. मौलिक कर्तव्य (Fundamental Duties)",
      english: "Your Duties / आपकी जिम्मेदारियां",
      description: "जैसे माता-पिता हमारे लिए बहुत कुछ करते हैं तो हमारी उनके प्रति कुछ जिम्मेदारी होती है, वैसे ही देश के प्रति हमारे 11 कर्तव्य हैं।",
      bulletPoints: [
        "राष्ट्रध्वज और राष्ट्रगान का दिल से आदर करना",
        "अपने आसपास स्वच्छता रखना, पर्यावरण बचाना",
        "अंधविश्वास छोड़कर विज्ञान और प्रश्न पूछने की आदतें बनाना"
      ],
      color: "border-emerald-300 bg-emerald-50/50 text-emerald-800",
      icon: Award,
      actionText: "कर्तव्य पहचान खेलें ->"
    },
    {
      id: "directive-principles", // static info modal
      title: "3. राज्य के नीति निर्देशक तत्व (DPSP)",
      english: "Guidelines for Govt / सरकार के लिए दिशा-निर्देश",
      description: "ये देश की सरकार (जैसे प्रधानमंत्री और मुख्यमंत्री) के लिए बनाए गए मार्गदर्शन नियम हैं, जो जनकल्याण सुनिश्चित करते हैं।",
      bulletPoints: [
        "गरीबों को मुफ्त इलाज और रोजगार दिलाना",
        "मुफ्त और पौष्टिक खाना दिलाना",
        "मनोरम ऐतिहासिक इमारतों, वन्यजीवों और पर्यावरण की सुरक्षा करना"
      ],
      color: "border-purple-300 bg-purple-50/50 text-purple-800",
      icon: Library,
      actionText: "इसके बारे में और जानें"
    }
  ];

  return (
    <div id="features-section" className="space-y-6">
      {/* Header text */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
          🔰 हमारे संविधान की 3 मुख्य विशेषताएं
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          संविधान की ये तीन धाराएँ हमें एक सुरक्षित, जिम्मेदार और समृद्ध नागरिक बनाने में मदद करती हैं।
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {features.map((feat, index) => {
          const IconComp = feat.icon;
          return (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className={`border-3 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${feat.color}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 bg-white rounded-full border shadow-xs uppercase tracking-wider">
                    भाग 0{index + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800">{feat.title}</h3>
                  <span className="text-xs font-bold text-slate-500 italic block mt-0.5">
                    {feat.english}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {feat.description}
                </p>

                {/* Bullets specifically categorized for Class 7 students */}
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                  <strong className="text-xs text-slate-600 uppercase tracking-widest block mb-1">
                    🔍 मुख्य उदाहरण बच्चों के लिए:
                  </strong>
                  {feat.bulletPoints.map((bullet, bidx) => (
                    <div key={bidx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <span className="text-amber-500">★</span>
                      <p>{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>

              {feat.id !== "directive-principles" ? (
                <button
                  onClick={() => onNavigate(feat.id)}
                  className="mt-6 w-full py-2.5 bg-white text-slate-800 hover:text-white hover:bg-slate-800 border-2 border-slate-800 font-bold text-xs rounded-xl shadow-xs transition duration-200 cursor-pointer text-center"
                >
                  {feat.actionText}
                </button>
              ) : (
                <div className="mt-6 w-full p-3 bg-purple-100 rounded-xl border border-purple-200 text-[11px] text-center font-bold text-purple-900 block select-none">
                  💡 सरकार ये नियम बजट और विकास कार्यों में लागू करती है!
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Explanatory summary scroll */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-3 top-3 opacity-10">
          <Gavel className="w-32 h-32" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-amber-400 font-bold block text-xs tracking-widest">
            💡 संविधान मित्र की मुख्य सलाह
          </span>
          <h4 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300">
            अधिकार और कर्तव्य: एक ही सिक्के के दो पहलू!
          </h4>
          <p className="text-xs leading-relaxed text-slate-300">
            याद रखें बच्चों, अधिकार और कर्तव्य आपस में जुड़े हुए हैं। अगर हमारा 'सड़क पर सुरक्षित चलने का अधिकार' है, तो यह हमारा 'कर्तव्य' भी है कि हम यातायात (Traffic) के नियमों का पालन करें! अधिकार हमें शक्ति देते हैं, और कर्तव्य हमें एक नेक और जिम्मेदार इंसान बनाते हैं।
          </p>
        </div>
      </div>
    </div>
  );
}
