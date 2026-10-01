"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, ShieldCheck, HeartHandshake, RotateCcw, AlertCircle } from "lucide-react";

const LANGUAGES = [
  { name: "Tamil", code: "ta-IN", label: "தமிழ்" },
  { name: "Hindi", code: "hi-IN", label: "हिंदी" },
  { name: "Telugu", code: "te-IN", label: "తెలుగు" },
  { name: "Malayalam", code: "ml-IN", label: "മലയാളം" }
];

export default function AmmaApp() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  // Start with language-neutral English instructions
  const [assistantReply, setAssistantReply] = useState("Tap a language above, then press the mic to speak.");
  const [selectedLangCode, setSelectedLangCode] = useState("hi-IN"); // Defaulting to Hindi code to start
  const [detectedLang, setDetectedLang] = useState("Ready");
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("UNKNOWN");
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = selectedLangCode;

      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleUserSpeech(text);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, [selectedLangCode, step]);

  const speakText = (text, langName) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      Tamil: "ta-IN",
      Hindi: "hi-IN",
      Telugu: "te-IN",
      Malayalam: "ml-IN"
    };

    utterance.lang = langMap[langName] || selectedLangCode;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported on this browser.");
      return;
    }
    recognitionRef.current.lang = selectedLangCode;
    setTranscript("");
    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleUserSpeech = async (spokenText) => {
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText: spokenText, currentStep: step })
      });

      const data = await res.json();
      setAssistantReply(data.message);
      setDetectedLang(data.detected_language);
      setStep(data.current_step);
      setStatus(data.eligibility_status);

      // Automatically sync microphone language to matched Gemini language
      const langMatch = LANGUAGES.find(l => l.name.toLowerCase() === data.detected_language.toLowerCase());
      if (langMatch) setSelectedLangCode(langMatch.code);

      speakText(data.message, data.detected_language);
    } catch (err) {
      console.error(err);
      setAssistantReply("Connection failed. Please tap again.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setStatus("UNKNOWN");
    setTranscript("");
    setDetectedLang("Ready");
    setAssistantReply("Tap a language above, then press the mic to speak.");
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  };

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col justify-between p-4 max-w-md mx-auto relative border-x border-amber-200">
      
      {/* Top Header */}
      <header className="bg-emerald-700 text-white rounded-2xl p-4 shadow-md text-center">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs bg-emerald-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-emerald-200">
            PMMVY Voice Navigator
          </span>
          <span className="text-xs bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded">
            {detectedLang}
          </span>
        </div>

        <h1 className="text-xl font-bold flex items-center justify-center gap-2 mb-3">
          <HeartHandshake className="w-6 h-6 text-amber-300" /> Amma Voice Assistant
        </h1>

        {/* Language Selector Buttons */}
        <div className="grid grid-cols-4 gap-1 bg-emerald-800 p-1.5 rounded-xl">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLangCode(lang.code);
                setDetectedLang(lang.name);
              }}
              className={`py-1 text-xs rounded-lg font-bold transition-colors ${
                selectedLangCode === lang.code
                  ? "bg-amber-400 text-amber-950 shadow"
                  : "text-emerald-100 hover:bg-emerald-700"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Interactive Screen */}
      <section className="my-auto flex flex-col items-center text-center space-y-6">
        
        {/* Status Display Card */}
        <div className="w-full bg-white border-2 border-emerald-600 rounded-2xl p-5 shadow-lg relative">
          <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded font-bold">
            Step {step} of 3
          </div>
          
          <p className="text-gray-900 font-medium text-lg leading-snug mt-1">
            "{assistantReply}"
          </p>

          {transcript && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-center gap-1">
              <span>You said:</span> <strong className="text-gray-800">"{transcript}"</strong>
            </div>
          )}
        </div>

        {/* Visual Icons */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className={`p-3 rounded-xl border-2 flex flex-col items-center ${step >= 1 ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
            <span className="text-2xl mb-1">🤰</span>
            <span className="text-[10px] font-bold">1. Pregnant</span>
          </div>
          <div className={`p-3 rounded-xl border-2 flex flex-col items-center ${step >= 2 ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
            <span className="text-2xl mb-1">💳</span>
            <span className="text-[10px] font-bold">2. Aadhaar/Bank</span>
          </div>
          <div className={`p-3 rounded-xl border-2 flex flex-col items-center ${status === 'ELIGIBLE' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : status === 'NOT_ELIGIBLE' ? 'border-rose-600 bg-rose-50 text-rose-800' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
            <span className="text-2xl mb-1">{status === 'ELIGIBLE' ? '🎉' : status === 'NOT_ELIGIBLE' ? '❌' : '🏛️'}</span>
            <span className="text-[10px] font-bold">3. ₹5,000 Aid</span>
          </div>
        </div>

        {/* Dynamic Status Result Banner */}
        {status === "ELIGIBLE" && (
          <div className="w-full bg-emerald-100 border-2 border-emerald-600 text-emerald-900 p-4 rounded-xl flex items-center gap-3 text-left">
            <ShieldCheck className="w-10 h-10 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Eligible for ₹5,000!</p>
              <p className="text-xs">Take your Aadhaar & Bank Passbook to the nearest Anganwadi center.</p>
            </div>
          </div>
        )}

        {status === "NOT_ELIGIBLE" && (
          <div className="w-full bg-rose-100 border-2 border-rose-600 text-rose-900 p-4 rounded-xl flex items-center gap-3 text-left">
            <AlertCircle className="w-10 h-10 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Not Eligible</p>
              <p className="text-xs">This scheme is reserved for non-government employed mothers.</p>
            </div>
          </div>
        )}

        {/* Microphone Button */}
        <div className="flex flex-col items-center justify-center pt-2">
          <button
            onClick={startListening}
            disabled={loading}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isListening
                ? "bg-rose-600 text-white mic-active scale-110"
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>
          <span className="mt-3 text-sm font-bold text-gray-700">
            {isListening ? "Listening..." : loading ? "Checking with Gemini..." : "Tap & Speak"}
          </span>
        </div>

      </section>

      {/* Footer Controls */}
      <footer className="pt-4 border-t border-amber-200 flex justify-between items-center text-xs text-gray-600">
        <button 
          onClick={() => speakText(assistantReply, detectedLang)}
          className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm font-semibold"
        >
          <Volume2 className="w-4 h-4 text-emerald-700" /> Repeat Audio
        </button>

        <button 
          onClick={resetFlow}
          className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm font-semibold text-rose-700"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </footer>
    </main>
  );
}
