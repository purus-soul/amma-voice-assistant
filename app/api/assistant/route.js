import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Dynamic language auto-detection helper for local fallback
function detectLocalLanguage(text) {
  if (/[\u0B80-\u0BFF]/.test(text)) return "Tamil";
  if (/[\u0C00-\u0C7F]/.test(text)) return "Telugu";
  if (/[\u0D00-\u0D7F]/.test(text)) return "Malayalam";
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  return "Hindi"; // Default fallback
}

// Hardcoded localized fallbacks if API key is missing or quota exceeded
const LOCAL_RESPONSES = {
  Tamil: {
    1: "வணக்கம் அக்கா. நீங்கள் கர்ப்பமாக இருக்கிறீர்களா அல்லது புதிதாக பிறந்த குழந்தை உள்ளதா?",
    2: "உங்களிடம் ஆதார் கார்டு மற்றும் உங்கள் பெயரில் வங்கி கணக்கு உள்ளதா?",
    3: "உங்களுக்கு அல்லது உங்கள் கணவருக்கு நிரந்தர அரசு வேலை உள்ளதா?",
    eligible: "வாழ்த்துக்கள்! நீங்கள் PMMVY திட்டத்தின் மூலம் ₹5,000 பெறத் தகுதியானவர். உங்கள் ஆதார் மற்றும் வங்கி புத்தகத்துடன் அருகில் உள்ள அங்கன்வாடி மையத்திற்கு செல்லவும்.",
    not_eligible: "மன்னிக்கவும் அக்கா, அரசு வேலையில் இருப்பவர்களுக்கு இந்த உதவித்தொகை பொருந்தாது."
  },
  Hindi: {
    1: "नमस्ते बहन! क्या आप गर्भवती हैं या आपका कोई नवजात शिशु है?",
    2: "क्या आपके पास आधार कार्ड और आपके नाम पर बैंक खाता है?",
    3: "क्या आपके या आपके पति के पास पक्की सरकारी नौकरी है?",
    eligible: "बधाई हो! आप PMMVY योजना के तहत ₹5,000 पाने के पात्र हैं। अपने पास के आंगनवाड़ी केंद्र में आधार और बैंक पासबुक लेकर जाएं।",
    not_eligible: "क्षमा करें बहन, सरकारी नौकरी वाले परिवारों के लिए यह सहायता उपलब्ध नहीं है।"
  },
  Telugu: {
    1: "నమస్తే అక్క! మీరు గర్భిణిగా ఉన్నారా లేదా పసిపాప ఉందా?",
    2: "మీకు ఆధార్ కార్డ్ మరియు మీ పేరిట బ్యాంక్ ఖాతా ఉన్నాయా?",
    3: "మీకు లేదా మీ భర్తకు ప్రభుత్వ ఉద్యోగం ఉందా?",
    eligible: "అభినందనలు! మీరు PMMVY పథకం కింద ₹5,000 పొందడానికి అర్హులు. మీ ఆధార్ మరియు బ్యాంక్ పాస్‌బుక్‌తో దగ్గరలోని అంగన్‌వాడీ కేంద్రానికి వెళ్లండి.",
    not_eligible: "క్షమించండి అక్క, ప్రభుత్వ ఉద్యోగం ఉన్నవారికి ఈ పథకం వర్తించదు."
  },
  Malayalam: {
    1: "നമസ്കാരം ചേച്ചി! നിങ്ങൾ ഗർഭിണിയാണോ അതോ നവജാത ശിശു ഉണ്ടോ?",
    2: "നിങ്ങൾക്ക് ആധാർ കാർഡും നിങ്ങളുടെ പേരിൽ ബാങ്ക് അക്കൗണ്ടും ഉണ്ടോ?",
    3: "നിങ്ങൾക്കോ ഭർത്താവിനോ സ്ഥിരമായ സർക്കാർ ജോലിയുണ്ടോ?",
    eligible: "അഭിനന്ദനങ്ങൾ! PMMVY പദ്ധതി വഴി നിങ്ങൾക്ക് ₹5,000 സാമ്പത്തിക സഹായത്തിന് അർഹതയുണ്ട്. ആധാറുമായി അടുത്തുള്ള അംഗൻവാടി സന്ദർശിക്കുക.",
    not_eligible: "ക്ഷമിക്കണം ചേച്ചി, സർക്കാർ ജോലിയുള്ളവർക്ക് ഈ ആനുകൂല്യം ലഭിക്കില്ല."
  }
};

export async function POST(req) {
  try {
    const { userText, currentStep = 1, userState = {} } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // IF NO API KEY IS PROVIDED -> USE OFFLINE RULE ENGINE
    if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_GEMINI_API_KEY") {
      const lang = detectLocalLanguage(userText);
      const lower = userText.toLowerCase();
      const isNegative = lower.includes("இல்லை") || lower.includes("नहीं") || lower.includes("లేదు") || lower.includes("ഇല്ല") || lower.includes("no");

      let nextStep = currentStep;
      let status = "UNKNOWN";
      let replyMessage = "";

      if (currentStep === 1) {
        nextStep = 2;
        replyMessage = LOCAL_RESPONSES[lang][2];
      } else if (currentStep === 2) {
        if (isNegative) {
          status = "NOT_ELIGIBLE";
          replyMessage = LOCAL_RESPONSES[lang].not_eligible;
        } else {
          nextStep = 3;
          replyMessage = LOCAL_RESPONSES[lang][3];
        }
      } else if (currentStep === 3) {
        if (isNegative) {
          status = "ELIGIBLE";
          replyMessage = LOCAL_RESPONSES[lang].eligible;
        } else {
          status = "NOT_ELIGIBLE";
          replyMessage = LOCAL_RESPONSES[lang].not_eligible;
        }
      }

      return NextResponse.json({
        detected_language: lang,
        message: replyMessage,
        current_step: nextStep,
        eligibility_status: status,
        source: "local_fallback"
      });
    }

    // ONLINE MODE VIA @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are 'Amma', a compassionate voice assistant for rural women in India seeking maternity aid under Pradhan Mantri Matru Vandana Yojana (PMMVY - ₹5000 scheme).

RULES:
1. AUTO-DETECT the spoken user language (Tamil, Hindi, Telugu, or Malayalam).
2. ALWAYS respond ONLY in the exact native script and language of the user.
3. Conduct 3 short eligibility checks:
   - Step 1: Confirm pregnancy or newborn status.
   - Step 2: Confirm Aadhaar Card and bank account ownership.
   - Step 3: Check if either spouse holds a permanent government job (Government employees are NOT eligible).
4. Keep answers under 15 simple words without jargon, bolding, bullet points, or special characters.
5. Return strictly structured JSON matching this schema.`;

    const prompt = `Current State: Step ${currentStep}. Previous inputs: ${JSON.stringify(userState)}.
User Voice Input: "${userText}". Evaluate and output next step and response text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            detected_language: { type: "STRING" },
            message: { type: "STRING" },
            current_step: { type: "NUMBER" },
            eligibility_status: { type: "STRING", enum: ["UNKNOWN", "ELIGIBLE", "NOT_ELIGIBLE"] }
          },
          required: ["detected_language", "message", "current_step", "eligibility_status"]
        }
      }
    });

    const parsedData = JSON.parse(response.text);
    return NextResponse.json({ ...parsedData, source: "gemini_2.5_flash" });

  } catch (error) {
    console.error("Assistant API Error:", error);
    return NextResponse.json({
      detected_language: "Hindi",
      message: "क्षमा करें बहन, दोबारा बोलें। (संजाल त्रुटि)",
      current_step: 1,
      eligibility_status: "UNKNOWN",
      error: error.message
    }, { status: 500 });
  }
}
