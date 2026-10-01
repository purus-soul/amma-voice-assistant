# Amma Voice Assistant 🌺 (PromptWars x HackArena)

> **Problem Statement:** "The Invisible Woman" — Empowering first-time rural women with zero digital/English literacy to independently access government maternity benefits.

---

## 🎯 Project Overview
**Amma Voice Assistant** is an ultra-low friction, mobile-first AI navigator specifically engineered for first-time rural Indian female users. It removes text literacy and English requirements by using a single-button voice interface that auto-detects **Tamil, Hindi, Telugu, and Malayalam**, guiding mothers step-by-step to claim **Pradhan Mantri Matru Vandana Yojana (PMMVY)** financial benefits (₹5,000).

---

## 🚀 Key Features & AI Capabilities
* **Automatic Native Language Recognition:** Auto-detects spoken input across Tamil, Hindi, Telugu, and Malayalam without dropdowns.
* **Gemini 2.5 Flash Integration:** Powered by the official `@google/genai` SDK using `gemini-2.5-flash` with strict JSON Schema output enforcement.
* **Low-Literacy UI Design:** High-contrast visual status icons, big single-button touch target, and automatic speech playback.
* **Resilient Dual-Engine:** Features a client-side/server-side deterministic fallback engine to guarantee response availability during API rate limits.

---

## 🏗️ Tech Stack
* **Frontend:** Next.js 14 (React) + Tailwind CSS (Mobile-First Viewport)
* **AI Engine:** Google Gemini 2.5 Flash (`@google/genai` SDK)
* **Voice STT / TTS:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **Deployment Platform:** Vercel

---

## 🌍 UN Sustainable Development Goals (SDGs) Alignment
1. **SDG 5 (Gender Equality - Target 5.1, 5.b):** Direct access to financial welfare without male intermediary dependency.
2. **SDG 4 (Quality Education & Information Equity - Target 4.3):** Universal voice access for non-literate populations.
3. **SDG 10 (Reduced Inequalities - Target 10.2):** Inclusion of rural women into state digital infrastructure.

---

## ⚙️ Local Development & Setup

1. **Clone & Install Dependencies:**
   ```bash
   git clone <your-repo-url>
   cd amma-voice-assistant
   npm install
